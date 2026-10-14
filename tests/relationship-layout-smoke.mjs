import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const errors = [];
const screenshotDir = process.env.FORBIDDEN_DECK_SCREENSHOTS;
if(screenshotDir) await mkdir(screenshotDir, { recursive: true });

async function assertLayout(page, selector) {
  const overflow = await page.locator(selector).evaluate(root => {
    const elements = [root, ...root.querySelectorAll('button, input, img, h2, h3, p')];
    return elements.filter(el => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && (box.left < -1 || box.right > window.innerWidth + 1);
    }).map(el => el.id || el.className || el.tagName);
  });
  assert.deepEqual(overflow, [], `Horizontal overflow in ${selector}`);
  assert(await page.locator(`${selector} img`).evaluateAll(imgs => imgs.length > 0 && imgs.every(img => img.complete && img.naturalWidth > 0)), 'Local artwork must load');
}

try {
  for(const width of [1440, 390, 320]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 1000 : 844 } });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8000/', { waitUntil: 'networkidle' });
    await assertLayout(page, '#startScreen');
    assert((await page.locator('.start-logo').boundingBox()).y >= 0, 'Menu top must be reachable when it overflows vertically');
    if(screenshotDir) await page.screenshot({ path: `${screenshotDir}/menu-${width}.png` });
    await page.locator('#menuRelationship').click();
    await assertLayout(page, '#relationshipScreen');
    assert((await page.locator('.relationship-profiles').textContent()).includes('32 lata'));
    assert((await page.locator('.relationship-profiles').textContent()).includes('29 lat'));
    if(screenshotDir) await page.screenshot({ path: `${screenshotDir}/relationship-${width}.png` });
    await page.locator('#relationshipBack').click();
    await page.evaluate(() => {
      ForbiddenDeckMenu.close(); newRun('standard'); ForbiddenTutorial.setEnabled(false);
      localStorage.setItem('forbidden_deck_relationship_v1', JSON.stringify({ schema: 1, seen: ['trust20'], choices: [], stats: { scenes: 1, supportive: 1, pragmatic: 0 } }));
      S.trust = 40; saveTrust(); S.stage = 3;
      ForbiddenDeckRelationship.setRomanceEnabled(true);
      campDialogue();
    });
    await page.locator('#campfireNext').click();
    await page.locator('#campfireNext').click();
    await assertLayout(page, '#campfireScene');
    if(screenshotDir) await page.screenshot({ path: `${screenshotDir}/campfire-${width}.png` });
    // Real clicks check that overlay controls are reachable in a narrow viewport.
    await page.locator('[data-camp-choice="romance"]').click();
    await page.locator('#campfireNext').click();
    await page.locator('#campfireNext').click();
    assert.equal(await page.locator('#overlay.show').count(), 0);
    assert.equal(await page.evaluate(() => ForbiddenDeckRelationship.load().romance.campfireChoice), 'romance');
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log('Layout OK: loaded portraits, profiles, dialogue choices and return at 1440, 390 and 320 px.');
} finally {
  await browser.close();
}
