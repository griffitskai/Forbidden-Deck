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
  await page.waitForFunction(() => !!window.ForbiddenDeckHistory);
  await page.evaluate(() => {
    localStorage.removeItem('forbidden_deck_history_v1');
    window.ForbiddenDeckHistory.clear();
  });

  assert(await page.locator('#menuHistory').count() === 1, 'Menu główne nie ma Historii wypraw.');

  // Boss trafia do trwałej kroniki, ale duplikaty nie tworzą kolejnego odkrycia.
  await page.evaluate(() => {
    window.ForbiddenDeckHistory.recordBoss('Strażniczka Pogranicza');
    window.ForbiddenDeckHistory.recordBoss('Strażniczka Pogranicza');
  });
  const bosses = await page.evaluate(() => window.ForbiddenDeckHistory.load());
  assert(bosses.bosses.length === 1, `Boss powinien być odkryty raz, jest ${bosses.bosses.length}.`);
  assert(bosses.stats.bossKills === 2, 'Łączna liczba pokonań bossów nie została zapisana.');

  // Pierwszy run: porażka w Akcie II, defensywny build.
  await page.evaluate(() => {
    window.ForbiddenDeckMenu.close();
    newRun('standard');
    S.act=1;S.stage=3;S.wins=6;S.level=4;S.trust=42;S.gold=61;
    S.deck=['wall','challenge','guard','guard','cover','intercept','rally','advancecard','strike','strike','shot','shot','expose','focus','evade','heavy','finish','bash','laststand','cinderguard'];
    S.kaelHp=0;S.lyraHp=24;
    defeat();
  });
  await page.waitForSelector('#overlay.show');
  await page.evaluate(() => hideModal());

  // Drugi run: pełne ukończenie z buildem Duo.
  await page.evaluate(() => {
    newRun('standard');
    S.act=2;S.stage=7;S.wins=15;S.level=7;S.trust=88;S.gold=134;
    S.deck=['cover','intercept','opening','opening','rally','rally','twin','twin','back','protect','cross','cross','bond','bond','advancecard','advancecard','expose','shot','guard','strike'];
    S.kaelHp=31;S.lyraHp=37;
    runComplete();
  });
  await page.waitForSelector('#overlay.show');

  const data = await page.evaluate(() => window.ForbiddenDeckHistory.load());
  assert(data.stats.totalRuns === 2, `Historia powinna mieć 2 runy, ma ${data.stats.totalRuns}.`);
  assert(data.stats.completedRuns === 1, `Powinien być 1 ukończony run, jest ${data.stats.completedRuns}.`);
  assert(data.stats.bestAct === 3, `Najdalszy akt powinien wynosić 3, wynosi ${data.stats.bestAct}.`);
  assert(data.runs.length === 2, `Lista powinna zawierać 2 wpisy, ma ${data.runs.length}.`);
  assert(data.runs[0].result === 'victory' && data.runs[0].build === 'Duo / Synergy', 'Ukończony run nie został poprawnie opisany jako build Duo.');
  assert(data.runs[1].result === 'defeat' && data.runs[1].build === 'Obrona', 'Przegrany run nie został poprawnie opisany jako build obronny.');

  await page.evaluate(() => { hideModal(); window.ForbiddenDeckMenu.open(); });
  await page.locator('#menuHistory').click();
  await page.waitForSelector('#historyScreen.show');
  assert(await page.locator('.run-entry').count() === 2, 'Ekran historii nie pokazuje obu runów.');
  assert(await page.locator('.boss-memory:not(.locked)').count() === 1, 'Ekran historii nie pokazuje odkrytego bossa.');

  // Dane muszą przetrwać zwykłe odświeżenie strony.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ForbiddenDeckHistory);
  const afterReload = await page.evaluate(() => window.ForbiddenDeckHistory.load());
  assert(afterReload.runs.length === 2 && afterReload.stats.completedRuns === 1, 'Historia runów nie przetrwała odświeżenia strony.');
  assert(afterReload.bosses.includes('Strażniczka Pogranicza'), 'Odkrycie bossa nie przetrwało odświeżenia.');

  assert(pageErrors.length === 0, `Błędy JavaScript: ${pageErrors.join(' | ')}`);
  console.log('Meta history OK: 2 runy, 1 ukończony, buildy Obrona/Duo, trwała pamięć bossa.');
} finally {
  await browser.close();
}
