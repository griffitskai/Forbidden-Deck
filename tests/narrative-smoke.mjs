import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true}),p=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
await p.evaluate(()=>ForbiddenTutorial.setEnabled(false));
async function seed(ids,choice='friendship'){
 await p.evaluate(({ids,choice})=>{hideModal();document.getElementById('historyScreen').classList.remove('show');ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false);ForbiddenDeckRelationship.setRomanceEnabled(true);S.trust=60;saveTrust();S.stage=3;S.currentNode=currentAct().route[3][0];const choices=[{scene:'trust20',choice:ForbiddenDeckParty.isLegacy()?'right-side':'friendship'},{scene:'trust40',choice}];localStorage.setItem(ForbiddenDeckParty.pairKey('forbidden_deck_relationship_v1'),JSON.stringify({schema:2,seen:['trust20','trust40'],choices,stats:{scenes:2}}));}, {ids,choice});
}
for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']]){
 for(const choice of ['friendship','romance','skipped']){
  await seed(ids,choice);
  const snapshot=await p.evaluate(()=>ForbiddenDeckNarrative.capture());
  const callback=await p.evaluate(()=>ForbiddenDeckNarrative.callback('trust60'));
  assert.equal(!!callback,choice!=='skipped');
  await p.evaluate(()=>campDialogue());
  assert.equal(await p.locator('#modalBody .narrative-callback').count(),choice==='skipped'?0:1);
  if(callback)assert((await p.locator('#modalBody .narrative-callback').innerText()).includes(callback[1]));
  await p.evaluate(()=>{hideModal();ForbiddenDeckCompanions.open()});
  assert.equal(await p.locator('#companionsScreen .narrative-chronicle li').count(),2);
  await p.evaluate(()=>{ForbiddenDeckCompanions.close();S.act=2;S.wins=15;runComplete()});
  await p.locator('#modalBody .narrative-epilogue summary').click();
  const run=await p.evaluate(()=>ForbiddenDeckHistory.load().runs[0]);
  assert.deepEqual(run.narrative,snapshot);
  const story=await p.evaluate(run=>ForbiddenDeckNarrative.epilogue(run),run);
  assert((await p.locator('#modalBody .narrative-epilogue').innerText()).includes(story.lines[1]));
  await p.locator('#modalBody .narrative-epilogue img').evaluate(i=>i.decode());
  const count=await p.evaluate(()=>ForbiddenDeckHistory.load().stats.totalRuns);
  await p.evaluate(()=>runComplete());assert.equal(await p.evaluate(()=>ForbiddenDeckHistory.load().stats.totalRuns),count,'No duplicate result rewards/history');
  // Changing the live relationship cannot change a finished expedition.
  await p.evaluate(()=>localStorage.setItem(ForbiddenDeckParty.pairKey('forbidden_deck_relationship_v1'),JSON.stringify({schema:2,seen:[],choices:[],stats:{scenes:0}})));
  assert.deepEqual(await p.evaluate(run=>ForbiddenDeckNarrative.epilogue(run),run),story);
  if(choice==='romance'){
   await p.evaluate(()=>ForbiddenDeckRelationship.setRomanceEnabled(false));
   const hidden=await p.evaluate(run=>ForbiddenDeckNarrative.epilogue(run),run);assert.notEqual(hidden.lines[1],story.lines[1]);
   assert(!(await p.locator('#modalBody .narrative-epilogue').innerText()).includes(story.lines[1]));
   assert.deepEqual(await p.evaluate(()=>ForbiddenDeckHistory.load().runs[0].narrative),snapshot,'Preferences never rewrite choices');
  }
  await p.evaluate(()=>{hideModal();ForbiddenDeckHistory.open()});assert(await p.locator('#historyBody .narrative-epilogue').count()>0);
 }
 await seed(ids);await p.evaluate(()=>{S.party.members[0].hp=0;defeat()});assert.equal(await p.locator('#modalBody .narrative-epilogue').count(),1);
 assert.equal(await p.evaluate(()=>ForbiddenDeckHistory.load().runs[0].result),'defeat');
}
await p.reload({waitUntil:'networkidle'});await p.evaluate(()=>{ForbiddenDeckHistory.open();ForbiddenDeckLanguage.set('en')});
await p.locator('#historyBody .narrative-epilogue summary').first().click();
await p.waitForTimeout(100);
assert(!/[ąćęłńóśźż]/i.test(await p.locator('#historyBody .narrative-epilogue').first().innerText()));
for(const width of [1366,390,320]){await p.setViewportSize({width,height:800});assert(await p.evaluate(()=>document.getElementById('historyScreen').scrollWidth<=innerWidth+1))}
await p.evaluate(()=>{const d=ForbiddenDeckHistory.load();delete d.runs[0].narrative;d.runs[1].narrative={schema:1,pairId:'__proto__',choices:[]};localStorage.setItem('forbidden_deck_history_v1',JSON.stringify(d));ForbiddenDeckHistory.render()});
assert.equal(await p.locator('.run-entry').first().locator('.narrative-epilogue').count(),0);
assert.deepEqual(errors,[]);await browser.close();console.log('Narrative OK: four duets × three paths, callbacks, albums, victory/defeat, immutable run memories, privacy, old/corrupt history, EN and narrow layouts.');
