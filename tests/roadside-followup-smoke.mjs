import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch(),p=await browser.newPage(),errors=[];
p.on('pageerror',e=>errors.push(e.message));
const stats=()=>p.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust,deck:S.deck,stage:S.stage}));
async function reload(){await p.waitForLoadState('networkidle');await p.reload({waitUntil:'networkidle'});await p.locator('#menuContinue').click()}
try{
 await p.goto(process.env.FD_TEST_URL||'http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']])for(const choice of [0,1,'skipped']){
  await p.evaluate(({ids,choice})=>{hideModal();ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false);S.roadside={pairId:S.party.relationshipId,act:0,stage:5,choice,finished:true};S.act=1;S.stage=0;renderMap()},{ids,choice});
  const before=await stats();
  assert.equal(await p.evaluate(()=>{const box=document.createElement('div');ForbiddenDeckRoadside.appendMemory(box,S.roadside,true);return box.querySelectorAll('aside>p').length}),choice==='skipped'?0:1,'No later echo before its scene');
  await p.locator('.node:not(.locked)').nth(1).click();
  if(choice==='skipped'){assert.equal(await p.locator('[data-road-followup]').count(),0);continue}
  const recap=p.locator('[data-road-followup] .roadside-decision');
  assert.equal(await recap.evaluate(el=>el.open),false);
  await recap.locator('summary').focus();await p.keyboard.press('Enter');
  assert(await recap.evaluate(el=>el.open));
  assert.equal(await recap.locator('blockquote').innerText(),await p.evaluate(()=>ForbiddenDeckRoadsideData[S.party.relationshipId].options[S.roadside.choice].label));
  const expected=await p.evaluate(()=>ForbiddenDeckRoadsideFollowups[S.party.relationshipId][S.roadside.choice].join('\n'));
  assert.equal((await p.locator('[data-road-followup] p').allTextContents()).join('\n'),expected);
  await reload();assert.equal((await p.locator('[data-road-followup] p').allTextContents()).join('\n'),expected);
  await p.locator('[data-road-followup] .roadside-decision>summary').click();
  await p.evaluate(()=>ForbiddenDeckLanguage.set('en'));assert(!/[ąćęłńóśźż]/i.test(await p.locator('[data-road-followup]').innerText()));
  await p.evaluate(()=>ForbiddenDeckLanguage.set('pl'));
  await p.locator('[data-road-continue]').click();assert.equal(await stats(),before,'Follow-up does not alter rewards');
  await reload();assert.equal(await p.locator('[data-road-followup]').count(),0,'Acknowledged scene does not replay');
  await p.locator('#modalBody .choice').first().click();assert.equal(await p.evaluate(()=>S.stage),1,'Original event advances once');
  await p.evaluate(()=>camp());
  await p.locator('.camp-memories>summary').click();
  await p.locator('.roadside-decision>summary').click();
  assert.equal(await p.locator('.roadside-decision blockquote').innerText(),await p.evaluate(()=>ForbiddenDeckRoadsideData[S.party.relationshipId].options[S.roadside.choice].label));
  const echo=await p.evaluate(()=>ForbiddenDeckRoadsideEchoes[S.party.relationshipId][S.roadside.choice]);
  assert.equal(await p.locator('.roadside-memory>p').last().textContent(),echo);
  assert.equal(await p.locator('.roadside-memory>p').count(),2,'Camp shows one opening echo and one later echo');
  await p.evaluate(()=>ForbiddenDeckLanguage.set('en'));
  assert.equal(await p.locator('.roadside-memory>p').last().textContent(),await p.evaluate(t=>ForbiddenDeckEnglish[t],echo));
  await p.evaluate(()=>ForbiddenDeckLanguage.set('pl'));
  const archive=await p.evaluate(()=>{const box=document.createElement('div');ForbiddenDeckRoadside.appendMemory(box);return [...box.querySelectorAll('aside>p')].slice(1).map(p=>p.textContent).join('\n')});
  assert.equal(archive,expected,'Chronicle retains both full dialogue lines');
  const snapshot=await p.evaluate(()=>ForbiddenDeckNarrative.capture());assert(snapshot.roadside.followup.finished);
  await p.evaluate(()=>{hideModal();S.act=2;runComplete()});
  assert.deepEqual(await p.evaluate(()=>ForbiddenDeckHistory.load().runs[0].narrative),snapshot);
  await p.evaluate(()=>{hideModal();newRun()});assert.equal(await p.evaluate(()=>S.roadside),null);
  assert.deepEqual(await p.evaluate(()=>ForbiddenDeckHistory.load().runs[0].narrative),snapshot);
 }
 const validation=await p.evaluate(()=>{
  const raw={pairId:'kael+lyra',act:0,stage:5,choice:0,finished:true};
  return [ForbiddenDeckRoadside.clean(raw,raw.pairId).followup,ForbiddenDeckRoadside.clean({...raw,followup:{act:0,stage:5,finished:true}},raw.pairId).followup].map(x=>x??null);
 });assert.deepEqual(validation,[null,null]);
 assert.deepEqual(await p.evaluate(()=>[...Object.values(ForbiddenDeckRoadsideFollowups).flat(2),...Object.values(ForbiddenDeckRoadsideEchoes).flat()].filter(t=>!Object.hasOwn(ForbiddenDeckEnglish,t))),[]);
 assert.deepEqual(errors,[]);console.log('Follow-up OK: 4 duets x 2 variants/skip, real Act II entry, reload, PL/EN, original rewards, immutable history and old/invalid data.');
}finally{await browser.close()}
