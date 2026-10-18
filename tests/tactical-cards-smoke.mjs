import assert from 'node:assert/strict';import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1366,height:768}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8000/');await page.waitForFunction(()=>!!cards.purify&&window.ForbiddenDeckCardArt);
await page.evaluate(()=>{ForbiddenDeckMenu.close();ForbiddenTutorial.setEnabled(false);newRun('standard')});
async function fixture(id,patch={}){await page.evaluate(({id,patch})=>{hideModal();S.currentNode={type:'battle',label:'Ruiny'};startBattle([enemy('Strażnik','🛡️',180,'assassin',12)]);Object.assign(S,{energy:3,synergy:50,momentum:0,trust:80,turn:3,kaelBlock:0,lyraBlock:0,lastActor:null,lastKaelThisTurn:false},patch);S.hand=[{id,uid:id+'-test'}];S.draw=[{id:'shot',uid:'draw-test'}];S.discard=[];S.enemies[0].marked=0;S.enemies[0].status={bleed:0,poison:0,burn:0,weak:0};renderBattle()}, {id,patch})}
async function click(){await page.locator('#hand .card').first().click()}
for(const [id,momentum,expected,left] of [['brace',0,4,0],['brace',1,4,1],['brace',2,12,0],['brace',5,12,3],['brace+',2,16,0]]){
 await fixture(id,{momentum});await click();assert.deepEqual(await page.evaluate(()=>[S.kaelBlock,S.momentum,S.energy,S.discard[0].id]),[expected,left,2,id]);
}
await fixture('venomtrail');let hp=await page.evaluate(()=>S.enemies[0].hp);await click();assert.deepEqual(await page.evaluate(()=>[S.enemies[0].hp,S.enemies[0].status.poison,S.enemies[0].status.weak]),[hp-3,2,0]);
await fixture('venomtrail');await page.evaluate(()=>{S.enemies[0].marked=2});const intent=await page.evaluate(()=>intentFor(S.enemies[0]).v);await click();assert.deepEqual(await page.evaluate(()=>[S.enemies[0].marked,S.enemies[0].status.poison,S.enemies[0].status.weak]),[1,2,2]);assert.ok(await page.evaluate(()=>intentFor(S.enemies[0]).v)<intent);
await fixture('venomtrail+');hp=await page.evaluate(()=>S.enemies[0].hp);await page.evaluate(()=>{S.enemies[0].marked=1;S.enemies[0].status.poison=11;S.heroStatus.lyra.weak=1});await click();assert.deepEqual(await page.evaluate(()=>[S.enemies[0].hp,S.enemies[0].marked,S.enemies[0].status.poison]),[hp-4,0,12]);
for(const [id,source,target,expected] of [['watchshift',10,2,6],['watchshift',4,2,4],['watchshift+',12,0,9],['watchshift',0,0,0]]){
 await fixture(id,{kaelBlock:source,lyraBlock:target,protectLyra:1});const before=await page.evaluate(()=>ForbiddenIntentPreview.previewIntent(S.enemies[0]).hp);await click();
 assert.deepEqual(await page.evaluate(()=>[S.kaelBlock,S.lyraBlock,S.hand.length,S.hand[0].id,S.energy]),[source-expected,target+expected,1,'shot',2]);
 assert.equal(await page.evaluate(()=>ForbiddenIntentPreview.previewIntent(S.enemies[0]).hp),Math.max(0,before-expected));
}
for(const patch of [{trust:39},{synergy:19},{energy:1}]){await fixture('pressure',patch);const before=await page.evaluate(()=>JSON.stringify(S));await page.evaluate(()=>playCard(0));assert.equal(await page.evaluate(()=>JSON.stringify(S)),before)}
for(const [id,damage,mark] of [['pressure',12,2],['pressure+',15,3]]){
 await fixture(id,{synergy:20});hp=await page.evaluate(()=>S.enemies[0].hp);await click();assert.deepEqual(await page.evaluate(()=>[S.enemies[0].hp,S.enemies[0].marked,S.synergy,S.energy]),[hp-damage,mark,0,1]);
}
// The new preparation feeds an existing finisher and spends the same Marked resource.
await fixture('pressure',{energy:4,synergy:20});hp=await page.evaluate(()=>S.enemies[0].hp);await page.evaluate(()=>{S.hand.push({id:'heavy',uid:'follow-up'});renderBattle()});await click();await click();assert.deepEqual(await page.evaluate(()=>[S.enemies[0].hp,S.enemies[0].marked,S.energy]),[hp-30,0,0]);
// All base/upgraded cards have art, and new cards integrate with upgrades and rewards.
const coverage=await page.evaluate(()=>({missing:Object.keys(cards).filter(id=>!ForbiddenDeckCardArt.illustrations[id.replace(/\+$/,'')]),newCards:ForbiddenDeckTacticalCards.ids.map(id=>[id,rewards.includes(id),canUpgradeCard(id),!!cards[id+'+']]),baseDeck:baseDeck.length}));assert.deepEqual(coverage.missing,[]);assert.equal(coverage.baseDeck,19);assert.ok(coverage.newCards.every(x=>x.slice(1).every(Boolean)));
// Real save and continue retain the new card and its post-play state.
await fixture('brace',{momentum:3});await page.evaluate(()=>{S.deck.push('brace+','watchshift');});await click();const block=await page.evaluate(()=>S.kaelBlock);await page.reload();await page.click('#menuContinue');assert.equal(await page.evaluate(()=>S.kaelBlock),block);assert.ok(await page.evaluate(()=>S.deck.includes('brace+')));
await page.evaluate(()=>{S.hand=['strike','brace','venomtrail','watchshift','pressure'].map((id,i)=>({id,uid:'showcase-'+i}));S.trust=80;S.synergy=60;S.momentum=3;renderBattle()});await page.waitForFunction(()=>[...document.querySelectorAll('#hand .card-art img')].length===5&&[...document.querySelectorAll('#hand .card-art img')].every(i=>i.complete&&i.naturalWidth>0));
await page.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#hand .card-art img,#enemies img')].map(i=>i.decode().catch(()=>{})));await new Promise(requestAnimationFrame)});await page.screenshot({path:'/tmp/fd-card-art-desktop.png'});
await page.locator('#hand .card').last().hover();assert.ok(await page.locator('#combatCardPreview .card-art img').count());assert.match(await page.locator('#combatCardPreview').innerText(),/20 Synergy/);await page.screenshot({path:'/tmp/fd-card-art-preview.png'});
assert.deepEqual(errors,[]);await browser.close();console.log('Tactical cards OK: resource tradeoffs, Marked/weakness/poison, block transfer against assassins, costs and locks, upgrades, old-card combo, rewards, save and artwork coverage.');
