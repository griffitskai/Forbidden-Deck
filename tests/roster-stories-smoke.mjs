import assert from 'node:assert/strict';import {chromium} from 'playwright';
const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:1280,height:900}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});await p.evaluate(()=>{ForbiddenTutorial.setEnabled(false);localStorage.setItem('fd08_trust','73');localStorage.setItem('forbidden_deck_relationship_v1',JSON.stringify({schema:2,seen:['trust20'],choices:[],stats:{scenes:1}}))});
async function seed(ids,threshold){
 await p.evaluate(({ids,threshold})=>{hideModal();ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false);S.trust=threshold;saveTrust();S.act=0;S.stage=3;S.currentNode=currentAct().route[3][0];const prior=ForbiddenDeckRosterData.pairs[S.party.relationshipId].scenes.filter(s=>s.threshold<threshold).map(s=>s.id);localStorage.setItem(ForbiddenDeckParty.pairKey('forbidden_deck_relationship_v1'),JSON.stringify({schema:2,seen:prior,choices:[],stats:{scenes:prior.length},romance:{}}));S.relationshipScene=null;ForbiddenDeckRelationship.setRomanceEnabled(true);campDialogue()}, {ids,threshold});
}
for(const ids of [['kael','selene'],['varyn','lyra'],['varyn','selene']]){
 for(const threshold of [20,40,60,80]){
  for(const choice of threshold>=40?['friendship','romance','skipped']:['friendship']){
   await seed(ids,threshold);assert.equal(await p.locator('.roster-story').getAttribute('data-scene'),'trust'+threshold);
   await p.waitForFunction(()=>document.querySelector('.roster-scene-art').naturalWidth>0);
   await p.click('#rosterSceneNext');
   if(threshold===60){
    for(let i=0;i<3;i++)await p.click('#rosterSceneNext');
    const state=await p.evaluate(()=>JSON.stringify(S.relationshipScene));await p.evaluate(()=>ForbiddenDeckLanguage.set('en'));assert.equal(await p.evaluate(()=>JSON.stringify(S.relationshipScene)),state);
    await p.reload({waitUntil:'networkidle'});await p.click('#menuContinue');assert.equal(await p.evaluate(()=>JSON.stringify(S.relationshipScene)),state);
    await p.evaluate(()=>ForbiddenDeckLanguage.set('pl'));
   }
   while(await p.locator('#rosterSceneNext').isVisible())await p.click('#rosterSceneNext');
   if(threshold===20)assert.equal(await p.locator('[data-roster-choice="romance"]').count(),0);
   await p.click('[data-roster-choice="'+choice+'"]');
   if(choice!=='skipped'){while(await p.locator('#rosterSceneNext').isVisible())await p.click('#rosterSceneNext')}
   assert.equal(await p.evaluate(()=>S.trust),threshold+6);assert.equal(await p.evaluate(()=>S.stage),4);
   assert.equal(await p.evaluate(()=>ForbiddenDeckRelationship.load().pendingBoon),'guard');
   const before=await p.evaluate(()=>JSON.stringify(ForbiddenDeckRelationship.load()));await p.evaluate(()=>ForbiddenDeckCompanions.open());await p.locator('[data-episode="trust'+threshold+'"]').click();
   while(await p.locator('#rosterSceneNext').isVisible())await p.click('#rosterSceneNext');await p.click('[data-roster-choice="skipped"]');assert.equal(await p.evaluate(()=>JSON.stringify(ForbiddenDeckRelationship.load())),before);await p.evaluate(()=>ForbiddenDeckCompanions.close());
  }
 }
}
assert.equal(await p.evaluate(()=>localStorage.getItem('fd08_trust')),'73');assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('forbidden_deck_relationship_v1')).seen),['trust20']);
await seed(['varyn','selene'],40);while(await p.locator('#rosterSceneNext').isVisible())await p.click('#rosterSceneNext');await p.click('[data-roster-choice="romance"]');await p.evaluate(()=>ForbiddenDeckRelationship.setRomanceEnabled(false));await p.click('#rosterSceneNext');assert.equal(await p.locator('[data-roster-choice="romance"]').count(),0);assert.equal(await p.evaluate(()=>S.trust),40);
await p.click('[data-roster-choice="skipped"]');
await p.evaluate(()=>{hideModal();ForbiddenDeckRoster.start(['kael','selene']);});assert.ok(await p.evaluate(()=>S.trust!==73));
assert.deepEqual(errors,[]);await b.close();console.log('Roster stories OK: 12 unique conversations, equal outcomes, opt-in, no reward replay, resume, PL/EN and isolated legacy/pair memories.');
