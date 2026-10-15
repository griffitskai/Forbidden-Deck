import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Independent of the HTTP checks. Cloud-managed Chromium may block file://;
// preserve that failure rather than disabling browser policy or skipping assertions.
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
try {
  await page.goto(new URL('../index.html', import.meta.url).href, { waitUntil: 'load' });
  assert(await page.locator('#startScreen img').evaluateAll(imgs => imgs.length === 2 && imgs.every(img => img.complete && img.naturalWidth > 0)));
  await page.locator('#menuNew').click();
  await page.locator('.difficulty-card').filter({ hasText: 'Standard' }).click();
  await page.evaluate(() => ForbiddenTutorial.setEnabled(false));
  await page.locator('.node:not(.locked)').first().click();
  await page.locator('.hand .card:not(.disabled)').first().click();
  await page.locator('#endTurnBtn').click();
  assert.equal(await page.evaluate(() => S.turn), 2);
  assert.deepEqual(errors, []);
  console.log('Offline OK: local index.html, illustrations, new run, first battle, card and turn.');
} finally {
  await browser.close();
}
