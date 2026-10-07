import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });

  const moduleState = await page.evaluate(() => ({
    acts: ACTS.length,
    act3Title: ACTS[2]?.title,
    themedCards: ['cinderguard','bloodrush','executionarrow','ashshot','bloodbond','laststand'].filter(id => !!cards[id]).length
  }));
  assert(moduleState.acts >= 3, 'Akt III nie został dodany do ACTS.');
  assert(moduleState.act3Title === 'Cytadela Popiołu', `Nieoczekiwany tytuł Aktu III: ${moduleState.act3Title}`);
  assert(moduleState.themedCards === 6, `Brakuje kart Aktu III (${moduleState.themedCards}/6).`);

  await page.evaluate(() => {
    S.act = 2;
    S.stage = 0;
    S.battleOver = false;
    renderMap();
  });
  await page.waitForFunction(() => document.querySelector('#mapActTitle')?.textContent === 'Cytadela Popiołu');
  const activeNodes = await page.locator('.node:not(.locked)').count();
  assert(activeNodes >= 1, 'Akt III nie ma aktywnego pola startowego.');

  const battleNode = page.locator('.node:not(.locked)').filter({ hasText: 'Popielny trakt' });
  assert(await battleNode.count() === 1, 'Nie znaleziono pola Popielny trakt.');
  await battleNode.click();
  await page.waitForSelector('#battleScreen.active');
  const enemies = await page.locator('.enemy:not(.dead)').count();
  assert(enemies >= 1, 'Walka Aktu III nie utworzyła przeciwników.');

  const bossCheck = await page.evaluate(() => {
    S.currentNode = { type: 'boss', label: 'Królowa Popiołu' };
    startBattle(bossEncounter());
    const queen = S.enemies.find(e => e.pattern === 'ashqueen');
    const phase1 = intentFor(queen);
    queen.hp = Math.floor(queen.maxHp * 0.45);
    const phase2 = intentFor(queen);
    return {
      boss: queen?.name,
      phase1Label: phase1?.label,
      phase1Target: phase1?.forceTarget,
      phase1Type: phase1?.dtype,
      phase2Label: phase2?.label,
      phase2Target: phase2?.forceTarget,
      phase2Type: phase2?.dtype,
      phase2IgnoreTaunt: phase2?.ignoreTaunt === true
    };
  });

  assert(bossCheck.boss === 'Królowa Popiołu', 'Boss Aktu III nie został utworzony.');
  assert(bossCheck.phase1Label.includes('Faza I'), 'Boss nie ma Fazy I.');
  assert(bossCheck.phase1Target === 'kael' && bossCheck.phase1Type === 'physical', 'Faza I nie naciska na Kaela obrażeniami fizycznymi.');
  assert(bossCheck.phase2Label.includes('Faza II'), 'Boss nie przełącza się do Fazy II poniżej 50% HP.');
  assert(bossCheck.phase2Target === 'lyra' && bossCheck.phase2Type === 'magic' && bossCheck.phase2IgnoreTaunt, 'Faza II nie poluje na Lyrę magią z pominięciem Prowokacji.');

  assert(pageErrors.length === 0, `Błędy JavaScript: ${pageErrors.join(' | ')}`);
  console.log(`Act III OK: ${activeNodes} startowych pól, ${enemies} przeciwników, boss przełącza fazy.`);
} finally {
  await browser.close();
}
