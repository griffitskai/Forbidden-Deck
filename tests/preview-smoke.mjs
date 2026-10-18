import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
execFileSync(process.execPath, ['scripts/build-preview.mjs'], { cwd: root });
const html = await readFile(new URL('../dist/Forbidden-Deck-preview.html', import.meta.url), 'utf8');
const browser = await chromium.launch({ headless: true });
const errors = [];
const requests = [];

async function playFirstBattle(frame) {
  await frame.locator('#menuNew').click();
  await frame.locator('.difficulty-card').filter({ hasText: 'Standard' }).click();
  await frame.evaluate(() => ForbiddenTutorial.setEnabled(false));
  await frame.locator('#equipBtn').click();
  assert.equal(await frame.locator('#modalTitle').textContent(), 'Ekwipunek');
  await frame.locator('#modalClose').click();
  await frame.locator('.node:not(.locked)').first().click();
  await frame.locator('.hand .card:not(.disabled)').first().click();
  await frame.locator('#endTurnBtn').click();
  assert.equal(await frame.evaluate(() => S.turn), 2);
  assert(await frame.evaluate(() => !!cards.venomarrow && !!cards.ashshot), 'Lazy status and Act III modules must be embedded');
}

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if(request.url().startsWith('http') && request.url() !== 'http://127.0.0.1:8000/isolated-preview') requests.push(request.url()); });
  await page.route('http://127.0.0.1:8000/isolated-preview', route => route.fulfill({ contentType: 'text/html', body: html }));
  await page.route('**/css/**', route => route.abort());
  await page.route('**/js/**', route => route.abort());
  await page.route('**/assets/**', route => route.abort());
  await page.goto('http://127.0.0.1:8000/isolated-preview', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#startScreen').evaluate(el => getComputedStyle(el).display), 'flex');
  assert(await page.locator('#startScreen img').evaluateAll(imgs => imgs.length === 2 && imgs.every(img => img.complete && img.naturalWidth > 0)));
  await playFirstBattle(page);
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#menuContinue').click();
  assert.equal(await page.evaluate(() => S.turn), 2, 'Standalone file preserves normal-origin saves');

  // Reproduce a single HTML document in a sandbox, with no sibling files or storage origin.
  const embedded = await browser.newPage({ viewport: { width: 390, height: 1000 } });
  embedded.on('pageerror', error => errors.push(error.message));
  embedded.on('request', request => { if(request.url().startsWith('http')) requests.push(request.url()); });
  await embedded.setContent('<iframe id="preview" sandbox="allow-scripts" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe>');
  await embedded.locator('#preview').evaluate((iframe, content) => { iframe.srcdoc = content; }, html);
  const frame = await embedded.locator('#preview').elementHandle().then(el => el.contentFrame());
  await frame.waitForSelector('#startScreen');
  assert.equal(await frame.locator('#startScreen').evaluate(el => getComputedStyle(el).display), 'flex');
  assert(await frame.locator('#startScreen img').evaluateAll(imgs => imgs.length === 2 && imgs.every(img => img.complete && img.naturalWidth > 0)));
  assert.equal(await frame.locator('#previewStorageNotice').count(), 1, 'Limited preview storage must be explained');
  await playFirstBattle(frame);
  await frame.evaluate(() => {
    hideModal(); S.trust = 40; saveTrust(); S.act = 0; S.stage = 3;
    localStorage.setItem('forbidden_deck_relationship_v1', JSON.stringify({ schema: 1, seen: ['trust20'], choices: [], stats: { scenes: 1 } }));
    ForbiddenDeckRelationship.setRomanceEnabled(true);
    campDialogue();
  });
  await frame.locator('#campfireNext').click();
  await frame.locator('#campfireNext').click();
  assert(await frame.locator('.campfire-line img').evaluate(img => img.complete && img.naturalWidth > 0), 'Dynamic speaker portrait must be embedded');
  await frame.locator('[data-camp-choice="romance"]').click();
  await frame.locator('#campfireNext').click();
  await frame.locator('#campfireNext').click();
  assert.equal(await frame.evaluate(() => ForbiddenDeckRelationship.load().romance.campfireChoice), 'romance');
  assert.equal(await frame.locator('#mapScreen.active').count(), 1);
  // The new atlas and story scenery are also embedded, including opaque-origin previews.
  for(const target of [page,frame]) {
    await target.evaluate(() => ForbiddenDeckCompanions.open());
    await target.locator('[data-episode="bread"]').click();
    await target.waitForFunction(() => [...document.querySelectorAll('#companionsScreen img')].every(img => img.complete && img.naturalWidth > 0));
    await target.locator('#lifeNext').click();
    await target.locator('#lifeNext').click();
    await target.locator('#lifeNext').click();
    await target.locator('[data-life-choice="home"]').click();
    await target.locator('#lifeNext').click();
    await target.locator('#lifeNext').click();
    assert.equal(await target.evaluate(() => ForbiddenDeckCompanions.load().choices.bread), 'home');
    await target.locator('#companionsClose').click();
  }
  // New language and world art also work without an origin or adjacent files.
  for(const target of [page,frame]) {
    await target.evaluate(() => {ForbiddenDeckLanguage.set('en');ForbiddenDeckMenu.close();S.act=2;startBattle(bossEncounter());});
    await target.waitForFunction(() => [...document.querySelectorAll('#enemies .world-atlas img')].every(img=>img.complete&&img.naturalWidth>0));
    assert.match(await target.locator('#enemies').innerText(),/Queen of Ash/);
    await target.evaluate(() => showEquipment());
    await target.waitForFunction(() => [...document.querySelectorAll('#modalBody .world-atlas img')].every(img=>img.complete&&img.naturalWidth>0));
    assert.match(await target.locator('#modalBody').innerText(),/Iron Breastplate/);
  }
  for(const target of [page,frame]) {
    await target.evaluate(()=>{hideModal();S.trust=80;S.synergy=60;S.hand=['brace','venomtrail','pressure'].map((id,i)=>({id,uid:'offline-art-'+i}));renderBattle()});
    await target.waitForFunction(()=>[...document.querySelectorAll('#hand .card-art img')].length===3&&[...document.querySelectorAll('#hand .card-art img')].every(i=>i.complete&&i.naturalWidth>0&&i.src.startsWith('data:')));
    assert.equal(await target.locator('#hand .illustrated-card').count(),3);
  }
  assert.deepEqual(requests, [], 'The preview must make no requests for sibling files or remote resources');
  assert.deepEqual(errors, [], 'Normal and sandboxed previews must not throw JavaScript errors');
  console.log('Preview OK: embedded CSS/JS/art, lazy modules, gameplay and saves; opaque sandbox gameplay and campfire; zero external resource requests.');
} finally {
  await browser.close();
}
