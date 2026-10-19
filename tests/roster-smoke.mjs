import assert from 'node:assert/strict';import {chromium} from 'playwright';
const b=await chromium.launch({headless:true}),p=await b.newPage({viewport:{width:1366,height:768}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url())});
await p.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});await p.evaluate(()=>ForbiddenTutorial.setEnabled(false));
await p.click('#menuNew');assert.equal(await p.locator('.roster-choice').count(),4);await p.click('[data-hero="varyn"]');await p.click('[data-hero="selene"]');await p.locator('.difficulty-card').filter({hasText:'Standard'}).click();
assert.equal(await p.evaluate(()=>S.party.relationshipId),'selene+varyn');
async function fixture(ids,hand){await p.evaluate(({ids,hand})=>{hideModal();ForbiddenDeckRoster.start(ids);S.currentNode={type:'battle',label:'Patrol'};startBattle([enemy('Strażnik','🛡️',250,'guard',9)]);S.trust=80;S.energy=10;S.hand=hand.map((id,i)=>({id,uid:'roster-'+i}));S.draw=[{id:hand[0],uid:'draw'}];renderBattle()}, {ids,hand})}
await fixture(['varyn','selene'],['knife','spark','eclipse']);
const hp=await p.evaluate(()=>S.enemies[0].hp);await p.locator('#hand .card').first().click();await p.locator('#hand .card').first().click();
assert.deepEqual(await p.evaluate(()=>[S.party.members[0].resources.shadow,S.party.members[1].resources.runes,S.synergy]),[1,1,10]);
await p.locator('#hand .card').first().click();assert.deepEqual(await p.evaluate(()=>[S.enemies[0].hp,S.party.members[0].resources.shadow,S.party.members[1].resources.runes]),[hp-21,0,0]);
await fixture(['varyn','selene'],['mend','mend']);await p.evaluate(()=>{ForbiddenDeckParty.member('selene').resources.runes=3;S.kaelHp=20});
await p.locator('#hand .card').first().click();assert.equal(await p.evaluate(()=>S.kaelHp),26);assert.equal(await p.evaluate(()=>ForbiddenDeckParty.member('selene').resources.mends),0);
await p.evaluate(()=>ForbiddenDeckParty.member('selene').resources.runes=3);await p.locator('#hand .card').first().click();assert.equal(await p.evaluate(()=>S.kaelHp),26);
await p.evaluate(()=>{S.potions[0]='tonic';ForbiddenDeckParty.member('varyn').resources.shadow=3;usePotion(0)});assert.equal(await p.evaluate(()=>ForbiddenDeckParty.member('varyn').resources.shadow),3);
await fixture(['kael','selene'],['runiccover']);await p.locator('#hand .card').click();assert.deepEqual(await p.evaluate(()=>S.party.combat.guard),{source:'kael',target:'selene',charges:1});
const preview=await p.evaluate(()=>{S.enemies[0].pattern='mage';return ForbiddenIntentPreview.previewIntent(S.enemies[0])});assert.equal(preview.target,'kael');assert.equal(preview.intercepted,true);
for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']]){
 await fixture(ids,await p.evaluate(ids=>ForbiddenDeckParty.startingDeck(ids).slice(0,5),ids));
 assert.ok(await p.evaluate(()=>S.deck.every(id=>ForbiddenDeckParty.ownsCard(cards[id]))));
 const art=await p.locator('#hand .card-art img').evaluateAll(a=>a.length);assert.equal(art,5);
 for(const act of [0,1,2]){
  await p.evaluate(act=>{S.act=act;startBattle(bossEncounter());S.enemies.forEach(e=>{if(e.pattern==='ashqueen')e.hp=Math.floor(e.maxHp*.4)});renderBattle()},act);
  for(const [width,height] of [[1024,560],[1366,768],[390,844]]){
   await p.setViewportSize({width,height});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   await p.mouse.move(2,2);await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
   if(width>=1000){assert.ok(await p.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));await p.waitForFunction(()=>{const el=document.getElementById('kaelHpText'),r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))},{},{timeout:2000})}
   assert.ok(await p.locator('#endTurnBtn').isVisible());
  }
 }
 await p.evaluate(()=>{S.party.members[0].block=11;S.party.members[1].status.poison=2;for(const h of S.party.members){if('runes'in h.resources)h.resources.runes=3;if('shadow'in h.resources)h.resources.shadow=2}ForbiddenDeckSave.save('battle')});
 const party=await p.evaluate(()=>JSON.stringify(S.party));await p.reload({waitUntil:'networkidle'});await p.click('#menuContinue');assert.equal(await p.evaluate(()=>JSON.stringify(S.party)),party);
 await p.evaluate(()=>{ForbiddenDeckLanguage.set('en');ForbiddenDeckLanguage.set('pl')});assert.equal(await p.evaluate(()=>JSON.stringify(S.party)),party);
}
await p.evaluate(()=>{hideModal();ForbiddenDeckRoster.start(['varyn','selene']);showEquipment()});
await p.locator('.equip-card').filter({hasText:'Pikowany kaftan'}).click();await p.locator('#modalBody .choice').filter({hasText:'Selene'}).click();
assert.deepEqual(await p.evaluate(()=>S.party.members.map(h=>h.equipment.armor)),[null,'paddedArmor']);
await p.evaluate(()=>{hideModal();ForbiddenDeckSave.save('map')});const savedRun=await p.evaluate(()=>localStorage.getItem('forbidden_deck_run_v1'));const beforeParty=await p.evaluate(()=>JSON.stringify(S.party));await p.evaluate(()=>difficultyChooser());await p.click('[data-hero="kael"]');await p.evaluate(()=>hideModal());assert.equal(await p.evaluate(()=>JSON.stringify(S.party)),beforeParty);assert.equal(await p.evaluate(()=>localStorage.getItem('forbidden_deck_run_v1')),savedRun);
await p.evaluate(()=>{ForbiddenDeckLanguage.set('en');difficultyChooser()});await p.waitForTimeout(80);
const residue=await p.locator('#modalBody').innerText();assert.ok(!/[ąćęłńóśźż]/i.test(residue),residue);
assert.deepEqual(errors,[]);await b.close();console.log('Roster OK: UI selection, rune/shadow combo, healing limit, explicit Guard, 4 parties × 3 acts, short/narrow layouts, artwork, exact saves and language.');
