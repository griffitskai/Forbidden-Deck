import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const legacy=JSON.parse(await readFile(new URL('./fixtures/v097-party-run.json',import.meta.url),'utf8'));
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1366,height:768}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 await page.evaluate(data=>{localStorage.clear();localStorage.setItem('forbidden_deck_run_v1',JSON.stringify(data));localStorage.setItem('forbidden_deck_meta_v1',JSON.stringify({schema:1,cards:['back+'],gear:['wardCharm']}))},legacy);
 await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#menuContinue').isDisabled(),false);
 await page.click('#menuContinue');await page.waitForSelector('#battleScreen.active');
 const migrated=await page.evaluate(()=>({party:S.party,turn:S.turn,energy:S.energy,synergy:S.synergy,trust:S.trust,hand:S.hand,draw:S.draw,deck:S.deck,enemies:S.enemies,equipment:S.equipment,route:S.routeHistory,lastActor:S.lastActor}));
 for(const key of ['turn','energy','synergy','trust','hand','draw','deck','enemies'])assert.deepEqual(migrated[key],legacy.state[key],key);
 for(const hero of migrated.party.members){
  assert.equal(hero.hp,legacy.state[hero.id+'Hp']);assert.equal(hero.maxHp,legacy.state[hero.id+'MaxHp']);assert.equal(hero.block,legacy.state[hero.id+'Block']);assert.deepEqual(hero.status,legacy.state.heroStatus[hero.id]);
 }
 assert.equal(migrated.party.relationshipId,'kael+lyra');assert.deepEqual(migrated.route,legacy.state.routeHistory);assert.equal(migrated.lastActor,'kael');assert.deepEqual(migrated.equipment,legacy.state.equipment);
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('forbidden_deck_run_v1')));assert.equal(stored.schema,2);assert.deepEqual(stored.state.party,migrated.party);assert.equal(Object.hasOwn(stored.state,'kaelHp'),false);assert.equal(Object.hasOwn(stored.state,'heroStatus'),false);
 const meta=await page.evaluate(()=>ForbiddenDeckSave.meta());assert.equal(meta.schema,1);assert.ok(meta.cards.includes('back+'));assert.ok(meta.gear.includes('wardCharm'));
 // IDs, not the display actor label, govern ownership, alternating synergy and weakness.
 assert.ok(await page.evaluate(()=>Object.values(cards).every(d=>!!d.ownerId!==!!d.duoId)));
 const before=await page.evaluate(()=>S.enemies[0].hp);
 await page.evaluate(()=>{cards['shot+'].actor='Presentation only';renderBattle()});
 await page.locator('#hand .card').first().click();assert.equal(await page.evaluate(()=>S.enemies[0].hp),before-5);assert.equal(await page.evaluate(()=>S.synergy),legacy.state.synergy+10);assert.equal(await page.evaluate(()=>S.lastActor),'lyra');
 // Foreign cards never become playable or appear in reward pools.
 assert.deepEqual(await page.evaluate(()=>{cards.foreign={ownerId:'not-selected',cost:0};cards.foreignDuo={duoId:'other+pair',cost:0};return [playable({id:'foreign'}),playable({id:'foreignDuo'}),ForbiddenDeckParty.availableRewards(['strike','foreign','foreignDuo'])]}),[false,false,['strike']]);
 const snapshot=await page.evaluate(()=>JSON.stringify(S.party));await page.evaluate(()=>{ForbiddenDeckLanguage.set('en');ForbiddenDeckLanguage.set('pl')});assert.equal(await page.evaluate(()=>JSON.stringify(S.party)),snapshot);
 await page.evaluate(()=>ForbiddenDeckSave.save('battle'));const savedParty=await page.evaluate(()=>JSON.stringify(S.party));await page.reload({waitUntil:'networkidle'});await page.click('#menuContinue');assert.equal(await page.evaluate(()=>JSON.stringify(S.party)),savedParty);
 // New runs reset canonical members and shared gear; no old-party closure leaks.
 await page.evaluate(()=>{hideModal();newRun('standard')});assert.deepEqual(await page.evaluate(()=>[S.kaelHp,S.lyraHp,S.equipment.armor,S.equipment.amulet,S.heroStatus.kael.bleed,S.deck.length]),[48,38,'ironArmor','arcaneCharm',0,19]);
 await page.evaluate(()=>{S.equipment.amulet='wardCharm';S.kaelHp=25;renderMap()});assert.equal(await page.evaluate(()=>S.party.equipment.amulet),'wardCharm');
 // Unrecognized future schema or roster must never be deleted on a failed restore.
 for(const payload of [{...stored,schema:999},{...stored,state:{...stored.state,party:{...stored.state.party,members:[{id:'missing'},{id:'lyra'}]}}}]){
  await page.evaluate(payload=>{ForbiddenDeckSave.clear();localStorage.setItem('forbidden_deck_run_v1',JSON.stringify(payload))},payload);
  const before=await page.evaluate(()=>JSON.stringify(S));await page.evaluate(()=>ForbiddenDeckSave.load());assert.equal(await page.evaluate(()=>JSON.stringify(S)),before);assert.deepEqual(await page.evaluate(()=>JSON.parse(localStorage.getItem('forbidden_deck_run_v1'))),payload);await page.evaluate(()=>hideModal());
 }
 assert.deepEqual(errors,[]);console.log('Party foundation OK: real V0.9.7 save migration, canonical reload/reset, stats/status/gear/deck preservation, ID-based card ownership, weakness and synergy, foreign rewards, PL/EN, future-save protection.');
}finally{await browser.close()}
