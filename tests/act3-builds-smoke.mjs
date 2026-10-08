import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.addInitScript(() => {
  let seed = 424242;
  Math.random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const profiles = {
  tank: ['wall','challenge','guard','guard','bash','strike','heavy','finish','cover','intercept','rally','advancecard','shot','expose','snipe','focus','evade','laststand','cinderguard','twin'],
  status: ['deepcut','deepcut','venomarrow','venomarrow','firearrow','hamstring','purify','executionarrow','executionarrow','ashshot','ashshot','guard','challenge','evade','cover','rally','laststand','focus','shot','strike'],
  duo: ['cover','intercept','opening','opening','rally','rally','twin','twin','back','protect','cross','cross','bond','bond','advancecard','advancecard','expose','expose','shot','guard']
};

const defensive = new Set(['wall','challenge','guard','rally','cover','intercept','evade','laststand','cinderguard','protect','advancecard','purify']);
const lyraDefense = new Set(['cover','intercept','protect','rally','evade','laststand','advancecard']);
const protection = new Set(['cover','intercept','protect']);
const drawCards = new Set(['focus','bond']);

async function runProfile(name, deck) {
  await page.evaluate((deck) => {
    hideModal();
    S.difficulty = 'standard';
    S.trust = 100;
    S.act = 2;
    S.stage = 7;
    S.level = 6;
    S.xp = 0;
    S.kaelMaxHp = 70;
    S.lyraMaxHp = 58;
    S.kaelHp = 70;
    S.lyraHp = 58;
    S.startSynergy = 20;
    S.firstTurnEnergy = 1;
    S.equipment = { armor: 'hunterPlate', amulet: 'wardCharm' };
    S.inventory = ['hunterPlate','wardCharm'];
    S.potions = ['ward','heal'];
    S.deck = [...deck];
    S.currentNode = { type: 'boss', label: 'Królowa Popiołu' };
    startBattle(bossEncounter());
  }, deck);

  for (let loop = 0; loop < 24; loop++) {
    const state = await page.evaluate(() => ({
      over: S.battleOver,
      aliveEnemies: liveEnemies().length,
      kaelHp: S.kaelHp,
      lyraHp: S.lyraHp,
      turn: S.turn
    }));
    if (state.over || state.aliveEnemies === 0 || state.kaelHp <= 0 || state.lyraHp <= 0) break;

    await page.evaluate(({defensiveIds, lyraDefenseIds, protectionIds, drawIds}) => {
      const defensiveSet = new Set(defensiveIds);
      const lyraDefenseSet = new Set(lyraDefenseIds);
      const protectionSet = new Set(protectionIds);
      const drawSet = new Set(drawIds);
      const live = liveEnemies();
      const queen = live.find(e => e.pattern === 'ashqueen');

      // Zachowuj się jak rozsądny gracz: w II fazie wykorzystaj miksturę odporności na magię.
      if (queen && queen.hp / queen.maxHp <= .55 && (S.tempRes?.magic || 0) < 20) {
        const wardSlot = S.potions.indexOf('ward');
        if (wardSlot >= 0) usePotion(wardSlot);
      }

      // Mikstura leczenia ma służyć ratowaniu bohatera, a nie leżeć do końca walki.
      const lowKael = S.kaelHp / S.kaelMaxHp < .38;
      const lowLyra = S.lyraHp / S.lyraMaxHp < .38;
      const healSlot = S.potions.indexOf('heal');
      if ((lowKael || lowLyra) && healSlot >= 0) {
        const target = (S.lyraHp / S.lyraMaxHp) < (S.kaelHp / S.kaelMaxHp) ? 'Lyra' : 'Kael';
        usePotion(healSlot);
        const button = [...document.querySelectorAll('#modalBody .choice')].find(b => b.textContent.includes(target));
        if (button) button.click();
      }

      const sealIndex = S.enemies.findIndex(e => e.hp > 0 && e.name.includes('pieczęć'));
      const queenIndex = S.enemies.findIndex(e => e.hp > 0 && e.pattern === 'ashqueen');
      S.target = sealIndex >= 0 ? sealIndex : queenIndex;

      let incomingKael = 0;
      let incomingLyra = 0;
      for (const e of liveEnemies()) {
        const it = intentFor(e);
        if (it.type !== 'attack') continue;
        let target = targetFor(e,it);
        if (target === 'lyra' && S.protectLyra > 0 && !it.ignoreProtect) target = 'kael';
        const amount = it.v * (it.hits || 1);
        if (target === 'lyra') incomingLyra += amount; else incomingKael += amount;
      }
      const incoming = incomingKael + incomingLyra;
      const hurt = S.kaelHp < S.kaelMaxHp * .55 || S.lyraHp < S.lyraMaxHp * .55;
      const lyraThreatened = incomingLyra >= 9 || S.lyraHp < S.lyraMaxHp * .5;
      const hasStatus = S.heroStatus && [S.heroStatus.kael,S.heroStatus.lyra].some(x => x && Object.values(x).some(v => v > 0));

      let safety = 0;
      while (S.energy > 0 && safety++ < 8 && !S.battleOver) {
        const options = S.hand.map((c,i) => ({c,i,d:cards[c.id]})).filter(x => playable(x.c));
        if (!options.length) break;
        const scored = options.map(x => {
          const id = x.c.id.replace(/\+$/,'');
          let score = 20;
          if (id === 'purify' && hasStatus) score += 100;
          if (protectionSet.has(id) && lyraThreatened && S.protectLyra <= 0) score += 125;
          if (lyraDefenseSet.has(id) && lyraThreatened) score += 80;
          if (defensiveSet.has(id) && (incoming >= 12 || hurt)) score += 55;
          if (id === 'back' && S.synergy >= 100) score += 95;
          if (['executionarrow','snipe','heavy','twin','cross','bloodbond','finish','bloodrush'].includes(id)) score += 45;
          if (['deepcut','venomarrow','firearrow','ashshot','hamstring','expose'].includes(id)) score += 34;
          if (drawSet.has(id) && S.energy >= 2) score += 24;
          if (x.d.cost === S.energy) score += 3;
          return {...x,score};
        }).sort((a,b)=>b.score-a.score);
        playCard(scored[0].i);
        const nextSeal = S.enemies.findIndex(e => e.hp > 0 && e.name.includes('pieczęć'));
        const nextQueen = S.enemies.findIndex(e => e.hp > 0 && e.pattern === 'ashqueen');
        if (nextSeal >= 0) S.target = nextSeal; else if (nextQueen >= 0) S.target = nextQueen;
      }
      if (!S.battleOver) endTurn();
    }, {
      defensiveIds:[...defensive],
      lyraDefenseIds:[...lyraDefense],
      protectionIds:[...protection],
      drawIds:[...drawCards]
    });
  }

  return await page.evaluate(() => ({
    won: liveEnemies().length === 0,
    kaelHp: S.kaelHp,
    lyraHp: S.lyraHp,
    turn: S.turn
  }));
}

try {
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
  const results = {};
  for (const [name,deck] of Object.entries(profiles)) results[name] = await runProfile(name,deck);

  for (const [name,result] of Object.entries(results)) {
    assert(result.won, `Build ${name} nie pokonał Królowej Popiołu na Standardzie (tura ${result.turn}, K ${result.kaelHp}, L ${result.lyraHp}).`);
  }
  console.log('Act III build diversity OK:', results);
} finally {
  await browser.close();
}
