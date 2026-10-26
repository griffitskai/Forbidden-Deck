import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true}),p=await browser.newPage(),errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.goto(process.env.FD_TEST_URL||'http://127.0.0.1:8000/',{waitUntil:'networkidle'});
async function start(ids,low=false){await p.evaluate(({ids,low})=>{hideModal();ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false);if(low)S.party.members[0].hp=5;S.currentNode={type:'battle',label:'Patrol'};startBattle([enemy('Bandita','',10,'bandit',1)])},{ids,low})}
async function win(){await p.evaluate(()=>{S.enemies.forEach(e=>e.hp=0);victory()})}
try{
 for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']])for(const choice of [0,1]){
  await start(ids,true);await win();assert.equal(await p.evaluate(()=>S.hardWon),null,'Already wounded without new damage does not qualify');
  await start(ids);await p.evaluate(()=>{ForbiddenDeckParty.damage(S.party.members[0].id,999);});
  await win();assert.equal(await p.evaluate(()=>S.hardWon),null,'A dead party does not earn a survival memory');
  await start(ids);await p.evaluate(()=>{const h=S.party.members[0];const resist=ForbiddenDeckParty.resistance(h.id).physical||0;ForbiddenDeckParty.damage(h.id,(h.hp-8+h.block)/(1-resist/100));ForbiddenDeckSave.save('battle')});
  await p.waitForLoadState('networkidle');await p.reload({waitUntil:'networkidle'});await p.locator('#menuContinue').click();
  await win();assert(await p.evaluate(()=>S.hardWon?.pairId===S.party.relationshipId),'Midbattle restore preserves opening health');
  await p.evaluate(()=>{hideModal();renderMap();ForbiddenDeckSave.save('map')});
  await p.waitForLoadState('networkidle');await p.reload({waitUntil:'networkidle'});await p.locator('#menuContinue').click();
  await p.evaluate(()=>camp());assert.equal(await p.locator('.hard-won-memory').count(),1);
  assert.equal(await p.locator('[data-hard-won-choice]').count(),2);
  const beforeChoice=await p.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust}));
  assert.equal(await p.evaluate(()=>Object.values(ForbiddenDeckHardWonResponses).flat().flatMap(o=>[o.label,o.reply,o.echo]).filter(t=>!Object.hasOwn(ForbiddenDeckEnglish,t)).length),0);

  await p.locator(`[data-hard-won-choice="${choice}"]`).click();
  assert.equal(await p.locator('[data-hard-won-choice]').count(),0);
  assert.equal(await p.evaluate(()=>S.hardWon.choice),choice);
  assert.equal(await p.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust})),beforeChoice);

  const snapshot=await p.evaluate(()=>ForbiddenDeckNarrative.capture());
  await p.evaluate(()=>{hideModal();renderMap();ForbiddenDeckSave.save('map')});
  await p.waitForLoadState('networkidle');await p.reload({waitUntil:'networkidle'});await p.locator('#menuContinue').click();
  assert.equal(await p.evaluate(()=>S.hardWon.choice),choice);
  await p.evaluate(()=>{S.party.members.forEach(h=>h.hp=h.maxHp);startBattle([enemy('Bandita','',10,'bandit',1)]);S.party.members[0].hp=8;S.enemies.forEach(e=>e.hp=0);victory();hideModal();camp()});
  assert.equal(await p.evaluate(()=>S.hardWon.choice),choice,'Later victories retain the chosen response');
  assert.equal(await p.locator('[data-hard-won-choice]').count(),0);
  await p.locator('.camp-memories>summary').click();
  const echo=await p.evaluate(()=>ForbiddenDeckHardWonResponses[S.party.relationshipId][S.hardWon.choice].echo);
  assert.equal(await p.locator('.hard-won-memory p').innerText(),echo);
  const state=await p.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust}));
  await p.evaluate(()=>ForbiddenDeckRelationship.setRomanceEnabled(false));assert.equal(await p.locator('.hard-won-memory').count(),1);
  await p.evaluate(()=>ForbiddenDeckLanguage.set('en'));assert(!/[ąćęłńóśźż]/i.test(await p.locator('.hard-won-memory').innerText()));
  assert.equal(await p.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust})),state);
  await p.evaluate(()=>{hideModal();newRun();camp()});assert.equal(await p.locator('.hard-won-memory').count(),0,'New expedition resets memory');
  await p.evaluate(()=>ForbiddenDeckLanguage.set('pl'));
  await p.evaluate(snapshot=>{const box=document.createElement('div');box.id='archiveCheck';document.body.appendChild(box);ForbiddenDeckNarrative.appendChronicle(box,snapshot)},snapshot);
  assert.equal(await p.locator('#archiveCheck .hard-won-memory p').innerText(),echo,'Archived choice survives new run');
  await p.evaluate(()=>document.getElementById('archiveCheck').remove());
  assert.equal(await p.evaluate(()=>ForbiddenDeckNarrative.clean({schema:1,pairId:S.party.relationshipId}).hardWon),undefined,'Old snapshots do not invent memories');
  assert.equal(await p.evaluate(()=>ForbiddenDeckHardWon.clean({pairId:S.party.relationshipId,choice:'invalid'})),null);

 }
 assert.deepEqual(errors,[]);console.log('Hard-won OK: four duets x two responses, fresh damage, reload, later victories, immutable chronicle, old saves, no bonuses, romance independence, PL/EN and reset.');
}finally{await browser.close()}
