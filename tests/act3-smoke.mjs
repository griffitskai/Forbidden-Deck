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
  // Ten test sprawdza sam Akt III. Menu główne jest osobno testowane w browser-smoke.mjs.
  await page.evaluate(() => window.ForbiddenDeckMenu?.close());

  const moduleState = await page.evaluate(() => ({
    acts: ACTS.length,
    act3Title: ACTS[2]?.title,
    themedCards: ['cinderguard','bloodrush','executionarrow','ashshot','bloodbond','laststand'].filter(id => !!cards[id]).length,
    balanceModule: !!window.ForbiddenAct3Balance
  }));
  assert(moduleState.acts >= 3, 'Akt III nie został dodany do ACTS.');
  assert(moduleState.act3Title === 'Cytadela Popiołu', `Nieoczekiwany tytuł Aktu III: ${moduleState.act3Title}`);
  assert(moduleState.themedCards === 6, `Brakuje kart Aktu III (${moduleState.themedCards}/6).`);
  assert(moduleState.balanceModule, 'Moduł balansu Aktu III nie został załadowany.');

  await page.evaluate(() => {
    S.act = 1;
    S.stage = currentAct().route.length;
    S.kaelHp = 20;
    S.lyraHp = 18;
    S.potions = [null, null];
    actTransition();
  });
  await page.waitForSelector('#overlay.show');
  const prepChoices = await page.locator('#modalBody .choice').count();
  assert(prepChoices === 3, `Przy wejściu do Aktu III powinny być 3 przygotowania, są ${prepChoices}.`);

  await page.evaluate(() => window.ForbiddenAct3Balance.enterActThree('supplies'));
  const prepState = await page.evaluate(() => ({
    act: S.act,
    stage: S.stage,
    prep: S.act3Prep,
    kaelHp: S.kaelHp,
    lyraHp: S.lyraHp,
    potion: S.potions.includes('heal')
  }));
  assert(prepState.act === 2 && prepState.stage === 0, 'Przygotowanie nie przeniosło drużyny do Aktu III.');
  assert(prepState.prep === 'supplies' && prepState.potion, 'Zapasy medyka nie dały oczekiwanej mikstury.');
  assert(prepState.kaelHp > 20 && prepState.lyraHp > 18, 'Zapasy medyka nie uleczyły drużyny.');

  await page.evaluate(() => { S.stage = 0; renderMap(); });
  await page.waitForFunction(() => document.querySelector('#mapActTitle')?.textContent === 'Cytadela Popiołu');
  const activeNodes = await page.locator('.node:not(.locked)').count();
  assert(activeNodes >= 1, 'Akt III nie ma aktywnego pola startowego.');

  const battleNode = page.locator('.node:not(.locked)').filter({ hasText: 'Popielny trakt' });
  assert(await battleNode.count() === 1, 'Nie znaleziono pola Popielny trakt.');
  await battleNode.click();
  await page.waitForSelector('#battleScreen.active');
  const earlyEncounter = await page.evaluate(() => S.enemies.map(e => ({name:e.name,pattern:e.pattern})));
  assert(earlyEncounter.some(e => e.pattern === 'emberpriest'), 'W pierwszym encounterze nie pojawia się Kapłanka żaru.');

  const assassinCheck = await page.evaluate(() => {
    S.stage = 3;
    const group = encounter(false);
    const assassin = group.find(e => e.pattern === 'ashassassin');
    S.turn = 3;
    const intent = intentFor(assassin);
    return {exists:!!assassin,target:intent?.forceTarget,ignoreTaunt:intent?.ignoreTaunt,ignoreProtect:intent?.ignoreProtect,hits:intent?.hits};
  });
  assert(assassinCheck.exists, 'Brakuje Popielnego skrytobójcy.');
  assert(assassinCheck.target === 'lyra' && assassinCheck.ignoreTaunt, 'Skrytobójca nie poluje poprawnie na Lyrę.');
  assert(assassinCheck.ignoreProtect && assassinCheck.hits === 2, 'Ciężki atak skrytobójcy nie testuje Ochrony zgodnie z projektem.');

  const bossCheck = await page.evaluate(() => {
    S.currentNode = { type: 'boss', label: 'Królowa Popiołu' };
    startBattle(bossEncounter());
    const queen = S.enemies.find(e => e.pattern === 'ashqueen');
    const phase1 = intentFor(queen);
    queen.hp = Math.floor(queen.maxHp * 0.45);
    const transition = intentFor(queen);
    S.turn += 1;
    const phase2 = intentFor(queen);
    return {
      boss: queen?.name,
      phase1Label: phase1?.label,
      phase1Target: phase1?.forceTarget,
      phase1Type: phase1?.dtype,
      transitionLabel: transition?.label,
      transitionType: transition?.type,
      phase2Label: phase2?.label,
      phase2Target: phase2?.forceTarget,
      phase2Type: phase2?.dtype,
      phase2IgnoreTaunt: phase2?.ignoreTaunt === true
    };
  });

  assert(bossCheck.boss === 'Królowa Popiołu', 'Boss Aktu III nie został utworzony.');
  assert(bossCheck.phase1Label.includes('Faza I'), 'Boss nie ma Fazy I.');
  assert(bossCheck.phase1Target === 'kael' && bossCheck.phase1Type === 'physical', 'Faza I nie naciska na Kaela obrażeniami fizycznymi.');
  assert(bossCheck.transitionType === 'shield' && bossCheck.transitionLabel.includes('Faza II'), 'Zmiana do Fazy II nie ma czytelnej tury przejściowej.');
  assert(bossCheck.phase2Label.includes('Faza II'), 'Boss nie rozpoczyna właściwej Fazy II po telegraphie.');
  assert(bossCheck.phase2Target === 'lyra' && bossCheck.phase2Type === 'magic' && bossCheck.phase2IgnoreTaunt, 'Faza II nie poluje na Lyrę magią z pominięciem Prowokacji.');

  assert(pageErrors.length === 0, `Błędy JavaScript: ${pageErrors.join(' | ')}`);
  console.log(`Act III balance OK: 3 przygotowania, nowe role wrogów i czytelna zmiana fazy bossa.`);
} finally {
  await browser.close();
}
