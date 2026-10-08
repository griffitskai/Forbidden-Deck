import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function chooseScene(trust, expectedTitle, choiceIndex=0) {
  await page.evaluate((value) => {
    window.ForbiddenDeckMenu?.close?.();
    hideModal();
    S.trust=value;
    saveTrust();
    S.act=0;
    S.stage=3;
    campDialogue();
  }, trust);
  await page.waitForSelector('#overlay.show');
  const title = await page.locator('#modalTitle').textContent();
  assert(title.includes(expectedTitle), `Oczekiwano sceny „${expectedTitle}”, otrzymano „${title}”.`);
  const choices = page.locator('#modalBody .choice');
  assert(await choices.count() === 2, `Scena ${expectedTitle} powinna mieć 2 decyzje.`);
  await choices.nth(choiceIndex).click();
}

try {
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ForbiddenDeckRelationship);
  await page.evaluate(() => {
    localStorage.removeItem('forbidden_deck_relationship_v1');
    window.ForbiddenDeckRelationship.clear();
    window.ForbiddenDeckMenu.close();
    newRun('standard');
  });

  assert(await page.locator('#menuRelationship').count() === 1, 'Menu główne nie ma ekranu relacji.');

  // 20 Trust — scena i jednorazowa premia Block.
  await chooseScene(20,'Pierwszy rytm',0);
  let relation = await page.evaluate(() => window.ForbiddenDeckRelationship.load());
  assert(relation.seen.includes('trust20'), 'Scena 20 Trust nie została oznaczona jako przeżyta.');
  assert(relation.pendingBoon === 'guard', 'Pierwsza decyzja nie zapisała premii guard.');
  await page.evaluate(() => {
    S.currentNode={type:'battle',label:'Test relacji'};
    startBattle([enemy('Manekin','🎯',30,'bandit',4,'physical')]);
  });
  let battle = await page.evaluate(() => ({k:S.kaelBlock,l:S.lyraBlock,pending:window.ForbiddenDeckRelationship.load().pendingBoon}));
  assert(battle.k >= 6 && battle.l >= 6, `Premia rozmowy nie dała Block (${battle.k}/${battle.l}).`);
  assert(battle.pending === null, 'Premia nie została zużyta po rozpoczęciu walki.');

  // 40 Trust — kolejny próg, nie powtarza poprzedniej sceny.
  await chooseScene(40,'Dlaczego zostałaś?',1);
  relation = await page.evaluate(() => window.ForbiddenDeckRelationship.load());
  assert(relation.seen.includes('trust40') && relation.pendingBoon === 'tempo', 'Scena 40 Trust lub premia tempo nie została zapisana.');
  await page.evaluate(() => {
    S.currentNode={type:'battle',label:'Test tempa'};
    startBattle([enemy('Manekin','🎯',30,'bandit',4,'physical')]);
  });
  battle = await page.evaluate(() => ({energy:S.energy,pending:window.ForbiddenDeckRelationship.load().pendingBoon}));
  assert(battle.energy >= 4 && battle.pending === null, 'Premia +1 energii nie została poprawnie użyta.');

  // 60 i 80 Trust — pełna ścieżka milestone'ów.
  await chooseScene(60,'Bez rozkazu',0);
  await chooseScene(80,'Jedno spojrzenie',0);
  relation = await page.evaluate(() => window.ForbiddenDeckRelationship.load());
  assert(relation.seen.length === 4, `Powinny być 4 przeżyte sceny, są ${relation.seen.length}.`);
  assert(relation.stats.supportive === 3 && relation.stats.pragmatic === 1, 'Historia wyborów nie rozróżnia stylu współpracy.');

  // Wydarzenie na trakcie pojawia się tylko raz po osiągnięciu Zaufania.
  await page.evaluate(() => {
    hideModal();
    S.trust=88;saveTrust();S.act=0;S.stage=1;
    storyNode();
  });
  await page.waitForSelector('#overlay.show');
  const roadTitle = await page.locator('#modalTitle').textContent();
  assert(roadTitle.includes('Zasadzka bez rozkazu'), 'Nie odblokowano wydarzenia relacji na trakcie.');
  await page.locator('#modalBody .choice').first().click();
  relation = await page.evaluate(() => window.ForbiddenDeckRelationship.load());
  assert(relation.roadSeen === true, 'Wydarzenie na trakcie nie zostało zapisane jako przeżyte.');

  // Ekran relacji pokazuje wszystkie cztery kamienie milowe jako przeżyte.
  await page.evaluate(() => { hideModal(); window.ForbiddenDeckRelationship.open(); });
  await page.waitForSelector('#relationshipScreen.show');
  const steps = await page.locator('.relationship-step').count();
  const seenStates = await page.locator('.relationship-step .state').allTextContents();
  assert(steps === 4, `Ekran relacji powinien mieć 4 progi, ma ${steps}.`);
  assert(seenStates.every(x => x.includes('PRZEŻYTE')), `Nie wszystkie kamienie milowe są oznaczone jako przeżyte: ${seenStates.join(', ')}`);

  // Pamięć relacji przeżywa odświeżenie.
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ForbiddenDeckRelationship);
  const afterReload = await page.evaluate(() => window.ForbiddenDeckRelationship.load());
  assert(afterReload.seen.length === 4 && afterReload.roadSeen, 'Postęp relacji nie przetrwał odświeżenia.');

  assert(pageErrors.length === 0, `Błędy JavaScript: ${pageErrors.join(' | ')}`);
  console.log('Relationship OK: 4 progi Trust, wybory, premie bojowe i trwałe wydarzenie relacji.');
} finally {
  await browser.close();
}
