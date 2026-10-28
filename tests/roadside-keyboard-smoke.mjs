import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch(),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const focused=selector=>page.locator(selector).evaluate(el=>el===document.activeElement);
try{
 await page.goto(process.env.FD_TEST_URL||'http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']])for(const lang of ['pl','en']){
  await page.evaluate(({ids,lang})=>{hideModal();ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false);ForbiddenDeckLanguage.set(lang);S.stage=5;renderMap()},{ids,lang});
  await page.locator('.node:not(.locked)').first().click();
  assert(await focused('#roadsideScene'));
  assert.equal(await page.locator('#roadsideScene').getAttribute('aria-labelledby'),'modalTitle');
  await page.keyboard.press('Shift+Tab');assert(await focused('[data-road-skip]'));
  await page.keyboard.press('Tab');assert(await focused('[data-road-choice="0"]'));
  await page.keyboard.press('Tab');assert(await focused('[data-road-choice="1"]'));
  await page.keyboard.press('Enter');assert(await focused('#roadsideScene'));
  await page.keyboard.press('Tab');assert(await focused('[data-road-continue]'));
  await page.keyboard.press('Tab');assert(await focused('[data-road-continue]'));
  await page.reload({waitUntil:'networkidle'});await page.locator('#menuContinue').click();
  assert(await focused('#roadsideScene'));
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  assert(await focused('#modalBody .choice:first-child'));
  await page.evaluate(()=>{hideModal();S.act=1;S.stage=0;renderMap()});
  await page.locator('.node:not(.locked)').nth(1).click();assert(await focused('#roadsideScene'));
  await page.keyboard.press('Tab');assert(await focused('.roadside-decision summary'));
  await page.keyboard.press('Enter');assert(await page.locator('.roadside-decision').evaluate(el=>el.open));
  await page.keyboard.press('Shift+Tab');assert(await focused('[data-road-continue]'));
  await page.keyboard.press('Tab');assert(await focused('.roadside-decision summary'));
  await page.keyboard.press('Tab');await page.keyboard.press('Enter');
  assert(await focused('#modalBody .choice:first-child'));
 }
 assert.deepEqual(errors,[]);
 console.log('Keyboard OK: 4 duets x PL/EN, opening, reply, reload, follow-up, recap, Tab/Shift+Tab loops and return to event.');
}finally{await browser.close()}
