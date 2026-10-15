import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.addInitScript(() => {
  let seed = 424242;
  Math.random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
});

try {
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
  await page.locator('#menuNew').click();
  await page.locator('.difficulty-card').filter({ hasText: 'Standard' }).click();
  await page.evaluate(() => ForbiddenTutorial.setEnabled(false));
  await page.locator('#equipBtn').click();
  assert.equal(await page.locator('#modalTitle').textContent(), 'Ekwipunek');
  await page.locator('#modalClose').click();
  assert.equal(await page.locator('#overlay.show').count(), 0);
  await page.locator('.node:not(.locked)').first().click();
  await page.locator('.hand .card:not(.disabled)').first().click();
  await page.locator('#endTurnBtn').click();
  assert.equal(await page.evaluate(() => S.turn), 2);

  // Isolate potion effects from incoming damage and verify real UI consumption.
  await page.evaluate(() => { S.kaelHp = S.kaelMaxHp - 20; renderBattle(); });
  const hpBefore = await page.evaluate(() => S.kaelHp);
  await page.locator('#pot1').click();
  await page.locator('#modalBody .choice').filter({ hasText: 'Kael' }).click();
  assert.equal(await page.evaluate(() => S.kaelHp), hpBefore + 18);
  assert.equal(await page.evaluate(() => S.potions[0]), null);
  await page.locator('#pot2').click();
  assert.equal(await page.evaluate(() => S.tempRes.magic), 20);
  assert.equal(await page.evaluate(() => S.potions[1]), null);

  // Deterministic boss fixtures, not a claim of a naturally progressed full run.
  // All cards/gear exist before Act III; do not change enemy HP/damage or assert victory by forcing it.
  const deck = ['wall','challenge','guard','guard','bash','strike','heavy','finish','cover','intercept','rally','advancecard','shot','expose','snipe','focus','evade','twin','bond','protect'];
  for(const act of [0, 1]) {
    await page.evaluate(({ act, deck }) => {
      hideModal();
      S.difficulty = 'standard'; S.trust = 60; S.act = act;
      S.stage = currentAct().route.length - 1; S.level = 5; S.xp = 0; S.pendingLevel = false;
      S.kaelMaxHp = 66; S.lyraMaxHp = 48; S.kaelHp = 66; S.lyraHp = 48;
      S.startSynergy = 20; S.firstTurnEnergy = 1;
      S.equipment = { armor: 'hunterPlate', amulet: 'wardCharm' };
      S.potions = ['ward', 'heal'];
      S.deck = deck.map(id => act === 1 && ['wall', 'heavy', 'snipe', 'bash'].includes(id) ? id + '+' : id);
      S.currentNode = currentAct().route[S.stage][0];
      startBattle(bossEncounter());
    }, { act, deck });

    for(let turn = 0; turn < 40; turn++) {
      if(await page.evaluate(() => S.battleOver)) break;
      await page.evaluate(() => {
        if(S.turn === 1) usePotion(0);
        if(Math.min(S.kaelHp / S.kaelMaxHp, S.lyraHp / S.lyraMaxHp) < .45 && S.potions[1]) {
          usePotion(1);
          const target = S.kaelHp / S.kaelMaxHp < S.lyraHp / S.lyraMaxHp ? 'Kael' : 'Lyra';
          [...document.querySelectorAll('#modalBody .choice')].find(button => button.textContent.includes(target))?.click();
        }
        const targetLive = () => {
          const support = S.enemies.findIndex(e => e.hp > 0 && e.pattern !== 'boss');
          S.target = support >= 0 ? support : S.enemies.findIndex(e => e.hp > 0);
        };
        targetLive();
        for(let safety = 0; safety < 12 && !S.battleOver; safety++) {
          const threatened = liveEnemies().some(e => { const it = intentFor(e); return it.type === 'attack' && targetFor(e, it) === 'lyra'; });
          let incomingKael = 0;
          for(const enemy of liveEnemies()) {
            const intent = intentFor(enemy);
            if(intent.type === 'attack' && (targetFor(enemy, intent) === 'kael' || S.protectLyra > 0)) {
              incomingKael += Math.round(intent.v * (intent.hits || 1) * (1 - totalRes('kael')[intent.dtype] / 100));
            }
          }
          const options = S.hand.map((c, i) => ({ c, i, d: cards[c.id] })).filter(x => playable(x.c));
          if(!options.length) break;
          const scored = options.map(x => {
            const id = x.c.id.replace(/\+$/, '');
            let score = 10;
            if(threatened && S.protectLyra === 0 && ['cover','intercept','protect'].includes(id)) score += 110;
            if(['wall','challenge','guard','rally'].includes(id) && S.kaelBlock < incomingKael) score += 45;
            if(id === 'evade' && threatened && S.protectLyra === 0) score += 45;
            if(['snipe','heavy','twin','finish','advancecard'].includes(id)) score += 40;
            if(id === 'expose') score += 35;
            if(['bond','focus'].includes(id) && S.energy >= 2) score += 30;
            return { ...x, score };
          }).sort((a, b) => b.score - a.score);
          playCard(scored[0].i); targetLive();
        }
        if(!S.battleOver) endTurn();
      });
    }
    const result = await page.evaluate(() => ({ won: liveEnemies().length === 0, hp: [S.kaelHp, S.lyraHp], turn: S.turn }));
    assert(result.won && result.hp.every(hp => hp > 0), `Act ${act + 1} boss did not fall on Standard: ${JSON.stringify(result)}`);
    assert.equal(await page.locator('#modalTitle').textContent(), 'Boss pokonany');
    await page.locator('#modalBody .choice').click();
    if(act === 0) {
      assert((await page.locator('#modalTitle').textContent()).includes('ukończony'));
      await page.locator('#modalBody .choice').click();
    } else {
      assert.equal(await page.locator('#modalTitle').textContent(), 'Przed Cytadelą Popiołu');
      assert.equal(await page.locator('#modalBody .choice').count(), 3);
      await page.locator('#modalBody .choice').first().click();
    }
    assert.equal(await page.evaluate(() => S.act), act + 1);
    assert.equal(await page.evaluate(() => S.stage), 0);
    assert.equal(await page.locator('#mapScreen.active').count(), 1);
    console.log(`Act ${act + 1} Standard boss OK: turn ${result.turn}, HP ${result.hp.join('/')}, transition to Act ${act + 2}.`);
  }
  assert.deepEqual(errors, []);
  console.log('Gameplay OK: menu, map, card, turn, equipment, two potions, Act I/II bosses and transitions.');
} finally {
  await browser.close();
}
