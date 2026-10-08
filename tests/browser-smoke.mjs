import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
const consoleErrors = [];

page.on('pageerror', error => pageErrors.push(error.message));
page.on('console', message => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });

  await page.waitForSelector('#startScreen:not(.hidden)', { timeout: 10000 });
  assert(await page.locator('#menuNew').count() === 1, 'Ekran startowy nie ma przycisku Nowy run.');
  assert(await page.locator('#menuCodex').count() === 1, 'Ekran startowy nie ma wejścia do Codexu.');

  await page.locator('#menuCodex').click();
  await page.waitForSelector('#codexScreen.show');
  const codexCards = await page.locator('#codexBody .codex-card').count();
  assert(codexCards >= 10, `Codex powinien pokazywać kolekcję kart, widzi ${codexCards}.`);
  await page.locator('#codexBack').click();
  await page.waitForSelector('#startScreen:not(.hidden)');

  await page.locator('#menuNew').click();
  await page.waitForSelector('#overlay.show');
  const standard = page.locator('.difficulty-card').filter({ hasText: 'Standard' });
  assert(await standard.count() === 1, 'Nie znaleziono poziomu trudności Standard.');
  await standard.click();

  await page.waitForSelector('.node:not(.locked)', { timeout: 10000 });
  const activeNodes = await page.locator('.node:not(.locked)').count();
  assert(activeNodes >= 1, 'Mapa nie ma aktywnego pola startowego.');

  await page.locator('.node:not(.locked)').first().click();
  await page.waitForSelector('#battleScreen.active', { timeout: 10000 });

  const enemies = await page.locator('.enemy:not(.dead)').count();
  const handCards = await page.locator('.hand .card').count();
  assert(enemies >= 1, 'Pierwsza walka nie utworzyła przeciwników.');
  assert(handCards === 5, `Pierwsza ręka powinna mieć 5 kart, ma ${handCards}.`);

  const playable = page.locator('.hand .card:not(.disabled)').first();
  assert(await playable.count() === 1, 'Brak grywalnej karty na pierwszej ręce.');
  await playable.click();

  await page.locator('#endTurnBtn').click();
  await page.waitForTimeout(250);

  const turn = await page.evaluate(() => S.turn);
  assert(turn >= 2, 'Kliknięcie ZAKOŃCZ TURĘ nie przeszło do kolejnej tury.');

  // Nawigacja: trwający run -> menu -> kontynuuj -> dokładnie ta sama walka.
  await page.locator('#menuBtn').click();
  await page.waitForSelector('#startScreen:not(.hidden)');
  assert(!(await page.locator('#menuContinue').isDisabled()), 'Menu nie pozwala kontynuować trwającego runu.');
  await page.locator('#menuContinue').click();
  await page.waitForSelector('#battleScreen.active');
  const turnAfterMenu = await page.evaluate(() => S.turn);
  assert(turnAfterMenu === turn, 'Powrót z menu zmienił turę trwającej walki.');

  // Ekran końca runu ma być pełnym podsumowaniem, nie technicznym komunikatem.
  await page.evaluate(() => window.ForbiddenDeckMenu.endRun(true));
  await page.waitForSelector('#overlay.show');
  const summaryTitle = await page.locator('#modalTitle').textContent();
  const summaryText = await page.locator('#modalText').textContent();
  const summaryChoices = await page.locator('#modalBody .choice').count();
  assert(summaryTitle.includes('Run ukończony'), 'Brakuje właściwego tytułu podsumowania runu.');
  assert(summaryText.includes('Wygrane walki') && summaryText.includes('Trust') && summaryText.includes('Talia'), 'Podsumowanie nie pokazuje kluczowych statystyk runu.');
  assert(summaryChoices === 3, `Ekran końcowy powinien mieć 3 dalsze akcje, ma ${summaryChoices}.`);

  assert(pageErrors.length === 0, `Błędy JavaScript: ${pageErrors.join(' | ')}`);
  assert(consoleErrors.length === 0, `Błędy konsoli: ${consoleErrors.join(' | ')}`);

  console.log(`Smoke test OK: menu + Codex + nawigacja + podsumowanie, ${activeNodes} aktywne pola, ${enemies} przeciwników, tura ${turn}.`);
} finally {
  await browser.close();
}
