import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(error.message));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function dismissToast(){
  const toast=page.locator('.tutorial-toast').first();
  if(await toast.count()) await toast.locator('button').click();
  await page.waitForTimeout(120);
}

try {
  await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ForbiddenTutorial);
  await page.evaluate(() => {
    localStorage.removeItem('forbidden_deck_tutorial_v1');
    window.ForbiddenTutorial.reset();
    window.ForbiddenDeckMenu?.close?.();
    newRun('standard');
  });

  let data=await page.evaluate(() => window.ForbiddenTutorial.load());
  assert(data.enabled === true, 'Tutorial powinien być domyślnie włączony.');
  assert(data.seen.includes('trust'), 'Pierwszy run nie uruchomił podpowiedzi Trust.');
  await dismissToast();

  // Wejście do walki: typy obrażeń + atak na Lyrę powinny wywołać kolejne podpowiedzi.
  await page.evaluate(() => {
    S.currentNode={type:'battle',label:'Test tutoriala'};
    startBattle([enemy('Mag testowy','🔮',30,'mage',7,'magic')]);
  });
  await page.waitForTimeout(100);
  data=await page.evaluate(() => window.ForbiddenTutorial.load());
  assert(data.seen.includes('damage'), 'Pierwsza walka nie pokazała typów obrażeń.');
  await dismissToast();
  await page.waitForTimeout(100);
  data=await page.evaluate(() => window.ForbiddenTutorial.load());
  assert(data.seen.includes('protect'), 'Atak na Lyrę nie uruchomił podpowiedzi Prowokacja/Ochrona.');
  await dismissToast();

  // Pierwsze użycie Marked.
  await page.evaluate(() => {
    S.hand=[{id:'expose',uid:'t-mark'}];S.energy=3;S.target=0;renderBattle();playCard(0);
  });
  await page.waitForTimeout(100);
  data=await page.evaluate(() => window.ForbiddenTutorial.load());
  assert(data.seen.includes('marked'), 'Pierwsze użycie Marked nie uruchomiło podpowiedzi.');
  await dismissToast();

  // Pierwsze budowanie Momentum.
  await page.evaluate(() => {
    S.hand=[{id:'strike',uid:'t-mom'}];S.energy=3;S.target=0;renderBattle();playCard(0);
  });
  await page.waitForTimeout(100);
  data=await page.evaluate(() => window.ForbiddenTutorial.load());
  assert(data.seen.includes('momentum'), 'Pierwsze budowanie Momentum nie uruchomiło podpowiedzi.');
  await dismissToast();

  // Pierwsze zwiększenie Synergy.
  await page.evaluate(() => addSyn(10,'test tutoriala'));
  await page.waitForTimeout(100);
  data=await page.evaluate(() => window.ForbiddenTutorial.load());
  assert(data.seen.includes('synergy'), 'Pierwsze zwiększenie Synergy nie uruchomiło podpowiedzi.');
  await dismissToast();

  assert(data.seen.length >= 6, `Powinno być co najmniej 6 poznanych podpowiedzi, jest ${data.seen.length}.`);

  // Gracz może całkowicie wyłączyć tutorial.
  await page.evaluate(() => { window.ForbiddenTutorial.reset(); window.ForbiddenTutorial.setEnabled(false); window.ForbiddenTutorial.enqueue('trust'); });
  await page.waitForTimeout(120);
  data=await page.evaluate(() => window.ForbiddenTutorial.load());
  assert(data.enabled === false, 'Wyłączenie tutoriala nie zostało zapisane.');
  assert(data.seen.length === 0, 'Wyłączony tutorial nie powinien oznaczać podpowiedzi jako obejrzanej.');
  assert(await page.locator('.tutorial-toast').count() === 0, 'Wyłączony tutorial nadal pokazuje toast.');

  // Ustawienie przetrwa odświeżenie strony.
  await page.reload({ waitUntil:'networkidle' });
  await page.waitForFunction(() => !!window.ForbiddenTutorial);
  data=await page.evaluate(() => window.ForbiddenTutorial.load());
  assert(data.enabled === false, 'Wyłączenie tutoriala nie przetrwało odświeżenia.');
  assert(await page.locator('#tutorialToggle').count() === 1, 'W menu brakuje przełącznika podpowiedzi.');

  assert(pageErrors.length===0, `Błędy JavaScript: ${pageErrors.join(' | ')}`);
  console.log('Tutorial OK: Trust, damage types, protection, Marked, Momentum, Synergy and persistent disable toggle.');
} finally {
  await browser.close();
}
