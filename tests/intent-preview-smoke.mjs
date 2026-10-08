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
  await page.waitForFunction(() => !!window.ForbiddenIntentPreview);
  await page.evaluate(() => {
    window.ForbiddenDeckMenu?.close?.();
    newRun('standard');
    S.equipment={armor:'ironArmor',amulet:'arcaneCharm'};
    S.currentNode={type:'battle',label:'Test podglądu'};
    startBattle([enemy('Mag testowy','🔮',30,'mage',8,'magic')]);
    S.lyraBlock=3;
    renderBattle();
  });

  let preview = await page.locator('.enemy .intent-preview').first().textContent();
  assert(preview.includes('Lyra'), `Mag powinien celować w Lyrę: ${preview}`);
  assert(preview.includes('25%'), `Podgląd powinien uwzględniać 25% odporności na magię: ${preview}`);
  assert(preview.includes('Block'), `Podgląd powinien uwzględniać Block: ${preview}`);
  assert(preview.includes('HP'), `Podgląd powinien pokazywać realną stratę HP: ${preview}`);

  // Ochrona powinna przekierować zwykły atak w Lyrę na Kaela.
  await page.evaluate(() => { S.protectLyra=1; renderBattle(); });
  preview = await page.locator('.enemy .intent-preview').first().textContent();
  assert(preview.includes('Ochrona') && preview.includes('Kael'), `Ochrona nie jest widoczna jako przekierowanie na Kaela: ${preview}`);

  // Skrytobójca w ciężkiej turze jasno komunikuje ignorowanie obu mechanik.
  await page.evaluate(() => {
    S.currentNode={type:'battle',label:'Test skrytobójcy'};
    startBattle([enemy('Skrytobójca testowy','🗡️',30,'assassin',8,'physical')]);
    S.turn=3;
    S.taunt=1;
    S.protectLyra=1;
    renderBattle();
  });
  preview = await page.locator('.enemy .intent-preview').first().textContent();
  assert(preview.includes('Lyra'), `Skrytobójca powinien nadal celować w Lyrę: ${preview}`);
  assert(preview.includes('omija Prowokację'), `Brakuje ostrzeżenia o ignorowaniu Prowokacji: ${preview}`);
  assert(preview.includes('omija Ochronę'), `Brakuje ostrzeżenia o ignorowaniu Ochrony: ${preview}`);

  const incomingLyra = await page.locator('#incomingLyra').textContent();
  assert(incomingLyra.includes('HP'), `Zbiorczy podgląd Lyry nie pokazuje HP: ${incomingLyra}`);

  // Akcje nieatakujące nie udają obrażeń.
  await page.evaluate(() => {
    startBattle([enemy('Strażnik testowy','🛡️',30,'guard',5,'physical')]);
    S.turn=2;
    renderBattle();
  });
  preview = await page.locator('.enemy .intent-preview').first().textContent();
  assert(preview.includes('Bez obrażeń'), `Akcja osłony powinna być opisana jako bez obrażeń: ${preview}`);

  assert(pageErrors.length === 0, `Błędy JavaScript: ${pageErrors.join(' | ')}`);
  console.log('Intent preview OK: resistance, Block, Ochrona, ignore flags and non-attack intents.');
} finally {
  await browser.close();
}
