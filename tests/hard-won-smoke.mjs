import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true}),p=await browser.newPage(),errors=[];
p.on('pageerror',e=>errors.push(e.message));
await p.goto(process.env.FD_TEST_URL||'http://127.0.0.1:8000/',{waitUntil:'networkidle'});
async function start(ids,low=false){await p.evaluate(({ids,low})=>{hideModal();ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false);if(low)S.party.members[0].hp=5;S.currentNode={type:'battle',label:'Patrol'};startBattle([enemy('Bandita','',10,'bandit',1)])},{ids,low})}
async function win(){await p.evaluate(()=>{S.enemies.forEach(e=>e.hp=0);victory()})}
try{
 for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']]){
  await start(ids,true);await win();assert.equal(await p.evaluate(()=>S.hardWon),null,'Already wounded without new damage does not qualify');
  await start(ids);await p.evaluate(()=>{ForbiddenDeckParty.damage(S.party.members[0].id,999);});
  await win();assert.equal(await p.evaluate(()=>S.hardWon),null,'A dead party does not earn a survival memory');
  await start(ids);await p.evaluate(()=>{const h=S.party.members[0];const resist=ForbiddenDeckParty.resistance(h.id).physical||0;ForbiddenDeckParty.damage(h.id,(h.hp-8+h.block)/(1-resist/100));ForbiddenDeckSave.save('battle')});
  await p.waitForLoadState('networkidle');await p.reload({waitUntil:'networkidle'});await p.locator('#menuContinue').click();
  await win();assert(await p.evaluate(()=>S.hardWon?.pairId===S.party.relationshipId),'Midbattle restore preserves opening health');
  await p.evaluate(()=>{hideModal();renderMap();ForbiddenDeckSave.save('map')});
  await p.waitForLoadState('networkidle');await p.reload({waitUntil:'networkidle'});await p.locator('#menuContinue').click();
  await p.evaluate(()=>camp());assert.equal(await p.locator('.hard-won-memory').count(),1);
  const state=await p.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust}));
  await p.evaluate(()=>ForbiddenDeckRelationship.setRomanceEnabled(false));assert.equal(await p.locator('.hard-won-memory').count(),1);
  await p.evaluate(()=>ForbiddenDeckLanguage.set('en'));assert(!/[ąćęłńóśźż]/i.test(await p.locator('.hard-won-memory').innerText()));
  assert.equal(await p.evaluate(()=>JSON.stringify({hp:S.party.members.map(h=>h.hp),gold:S.gold,trust:S.trust})),state);
  await p.evaluate(()=>{hideModal();newRun();camp()});assert.equal(await p.locator('.hard-won-memory').count(),0,'New expedition resets memory');
  await p.evaluate(()=>ForbiddenDeckLanguage.set('pl'));
 }
 assert.deepEqual(errors,[]);console.log('Hard-won OK: four duets, fresh damage, no false low-HP/death trigger, midbattle and map reload, camp, romance independence, PL/EN and reset.');
}finally{await browser.close()}
