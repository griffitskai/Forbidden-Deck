import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true}),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.FD_ROADSIDE_URL||'http://127.0.0.1:8000/',{waitUntil:'networkidle'});
const parties=[['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']];
const stats=()=>page.evaluate(()=>({gold:S.gold,hp:S.party.members.map(h=>h.hp),deck:S.deck,trust:S.trust,stage:S.stage}));
async function reload(){await page.waitForLoadState('networkidle');await page.reload({waitUntil:'networkidle'});await page.locator('#menuContinue').click()}
try{
 for(const ids of parties)for(const choice of [0,1,'skipped']){
  await page.evaluate(ids=>{hideModal();ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false);S.stage=5;renderMap()},ids);
  const before=await stats();
  await page.locator('.node:not(.locked)').first().click();
  assert.equal(await page.locator('#roadsideScene').count(),1);
  await reload();assert.equal(await page.locator('#roadsideScene').count(),1,'Opening resumes');
  if(choice==='skipped')await page.locator('[data-road-skip]').click();
  else{
   await page.locator(`[data-road-choice="${choice}"]`).click();
   const reply=await page.locator('#roadsideScene p').innerText();
   await reload();assert.equal(await page.locator('#roadsideScene p').innerText(),reply,'Reply resumes');
   await page.evaluate(()=>ForbiddenDeckLanguage.set('en'));
   const text=await page.locator('#roadsideScene').innerText();assert(!/[ąćęłńóśźż]/i.test(text));
   await page.evaluate(()=>ForbiddenDeckLanguage.set('pl'));
   await page.locator('[data-road-continue]').click();
  }
  assert.deepEqual(await stats(),before,'Prelude never changes rewards or stage');
  await reload();assert.equal(await page.locator('#roadsideScene').count(),0,'Original event resumes after prelude');
  await page.locator('#modalBody .choice').first().click();
  assert.equal((await stats()).stage,6,'Existing event advances exactly once');
  const snapshot=await page.evaluate(()=>ForbiddenDeckNarrative.capture());
  await page.evaluate(()=>camp());
  assert.equal(await page.locator('.roadside-memory').count(),choice==='skipped'?0:1);
  if(choice!=='skipped'){
   for(const width of [1366,390,320]){await page.setViewportSize({width,height:768});assert(await page.evaluate(()=>document.getElementById('modalBody').scrollWidth<=document.getElementById('modalBody').clientWidth+1))}
   await page.setViewportSize({width:1366,height:768});
  }
  await page.evaluate(()=>{hideModal();S.act=2;S.wins=15;runComplete()});
  const run=await page.evaluate(()=>ForbiddenDeckHistory.load().runs[0]);assert.deepEqual(run.narrative,snapshot);
  await page.evaluate(()=>{hideModal();newRun('standard')});assert.equal(await page.evaluate(()=>S.roadside),null);
  assert.deepEqual(await page.evaluate(()=>ForbiddenDeckHistory.load().runs[0].narrative),snapshot,'New run cannot change finished memories');
  // No fabricated old history, even with a live memory present.
  await page.evaluate(snapshot=>{S.roadside=snapshot.roadside;const box=document.createElement('div');box.id='old-memory-check';document.body.appendChild(box);ForbiddenDeckNarrative.appendChronicle(box,{schema:1,pairId:S.party.relationshipId,choices:[],companionChoices:{}})},snapshot);
  assert.equal(await page.locator('#old-memory-check .roadside-memory').count(),0);
  await page.evaluate(()=>document.getElementById('old-memory-check').remove());
 }
 await page.evaluate(()=>{ForbiddenDeckSave.save('map');const p=JSON.parse(localStorage.getItem('forbidden_deck_run_v1'));delete p.state.roadside;localStorage.setItem('forbidden_deck_run_v1',JSON.stringify(p));ForbiddenDeckSave.load()});
 assert.equal(await page.evaluate(()=>S.roadside),null,'Old save does not inherit live memory');
 assert.equal(await page.evaluate(()=>ForbiddenDeckRoadside.clean({pairId:'__proto__',act:0,stage:5,choice:0,finished:true},'__proto__')),null);
 const missing=await page.evaluate(()=>Object.values(ForbiddenDeckRoadsideData).flatMap(s=>[s.title,...s.opening,...s.options.flatMap(o=>[o.label,o.reply,o.echo])]).filter(t=>!Object.hasOwn(ForbiddenDeckEnglish,t)));
 assert.deepEqual(missing,[]);assert.deepEqual(errors,[]);
 console.log('Roadside OK: four duets × two choices/skip, real map entry, original rewards, opening/reply/event resume, EN, narrow layouts, camp echoes, immutable history, reset and old saves.');
}finally{await browser.close()}
