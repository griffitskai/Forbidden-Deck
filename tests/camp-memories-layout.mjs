import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true}),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.FD_TEST_URL||'http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']])for(const lang of ['pl','en'])for(const width of [1366,390,320]){
  await page.setViewportSize({width,height:width>600?768:844});
  await page.evaluate(({ids,lang})=>{hideModal();ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false);ForbiddenDeckLanguage.set(lang);S.hardWon={pairId:S.party.relationshipId,choice:null};camp()},{ids,lang});
  const panel=page.locator('.camp-memories'),summary=panel.locator('summary');
  assert.equal(await panel.count(),1);assert(await panel.evaluate(el=>el.open));
  assert.equal(await page.locator('#modalBody>.choices button').count(),4,'Core camp actions remain outside panel');
  assert(await page.evaluate(()=>document.querySelector('#modalBody>.choices').getBoundingClientRect().top<document.querySelector('.camp-memories').getBoundingClientRect().top));
  const state=await page.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust}));
  await summary.focus();await page.keyboard.press('Enter');assert.equal(await panel.evaluate(el=>el.open),false);
  await page.keyboard.press('Enter');assert(await panel.evaluate(el=>el.open));
  assert(await panel.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'No horizontal overflow');
  if(lang==='en')assert(!/[ąćęłńóśźż]/i.test(await panel.innerText()));
  await page.locator('[data-hard-won-choice="0"]').focus();await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.className),'camp-memory-response');
  assert.equal(await page.evaluate(()=>S.hardWon.choice),0);
  assert.equal(await page.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust})),state);
  await page.evaluate(()=>camp());assert.equal(await panel.evaluate(el=>el.open),false,'Read memories start collapsed');
  await summary.click();assert(await panel.evaluate(el=>el.open));
 }
 await page.evaluate(()=>{hideModal();newRun();camp()});assert.equal(await page.locator('.camp-memories').count(),0,'No empty panel');
 assert.deepEqual(errors,[]);console.log('Camp panel OK: 4 duets x PL/EN x 3 widths, keyboard, focus, core actions, no overflow/bonuses, collapsed memories and empty state.');
}finally{await browser.close()}
