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
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });

  await page.waitForSelector('#startScreen:not(.hidden)');
  const menuContinueBefore = page.locator('#menuContinue');
  assert(await menuContinueBefore.isDisabled(), 'Kontynuuj powinno być wyłączone bez zapisu.');

  await page.locator('#menuNew').click();
  await page.waitForSelector('#overlay.show');
  await page.locator('.difficulty-card').filter({ hasText: 'Standard' }).click();

  await page.waitForSelector('.node:not(.locked)');
  await page.locator('.node:not(.locked)').first().click();
  await page.waitForSelector('#battleScreen.active');

  const firstPlayable = page.locator('.hand .card:not(.disabled)').first();
  await firstPlayable.click();
  await page.locator('#endTurnBtn').click();
  await page.waitForTimeout(200);

  const before = await page.evaluate(() => ({
    turn: S.turn,
    kaelHp: S.kaelHp,
    lyraHp: S.lyraHp,
    node: S.currentNode?.label,
    hand: S.hand.length,
    hasSave: window.ForbiddenDeckSave?.hasSave() === true
  }));
  assert(before.hasSave, 'Run nie został zapisany po rozpoczęciu walki.');

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('#startScreen:not(.hidden)');
  const menuContinue = page.locator('#menuContinue');
  assert(!(await menuContinue.isDisabled()), 'Menu główne nie wykryło zapisanego runu.');
  await menuContinue.click();
  await page.waitForSelector('#battleScreen.active');

  const after = await page.evaluate(() => ({
    turn: S.turn,
    kaelHp: S.kaelHp,
    lyraHp: S.lyraHp,
    node: S.currentNode?.label,
    hand: S.hand.length
  }));

  assert(after.turn === before.turn, `Tura po wczytaniu: ${after.turn}, oczekiwano ${before.turn}.`);
  assert(after.kaelHp === before.kaelHp, 'HP Kaela nie zostało poprawnie odtworzone.');
  assert(after.lyraHp === before.lyraHp, 'HP Lyry nie zostało poprawnie odtworzone.');
  assert(after.node === before.node, 'Wczytano inne pole mapy niż zapisane.');
  assert(after.hand === before.hand, 'Ręka po wczytaniu różni się od zapisu.');

  assert(pageErrors.length === 0, `Błędy JavaScript: ${pageErrors.join(' | ')}`);
  console.log(`Persistence OK z menu głównego: ${after.node}, tura ${after.turn}, ręka ${after.hand}.`);
} finally {
  await browser.close();
}
