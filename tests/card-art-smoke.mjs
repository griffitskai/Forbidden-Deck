import assert from 'node:assert/strict';import {chromium} from 'playwright';
const b=await chromium.launch({headless:true});const p=await b.newPage({viewport:{width:1366,height:768}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8000/');await p.waitForFunction(()=>window.ForbiddenDeckCardArt&&!!cards.purify);
await p.evaluate(()=>{ForbiddenDeckMenu.close();ForbiddenTutorial.setEnabled(false);newRun('standard');S.act=1;S.currentNode={type:'battle',label:'Gęstwina'};startBattle([enemy('Bandita','⚔️',70,'bandit',6),enemy('Łuczniczka','🏹',50,'archer',6),enemy('Kultystka','🕯️',60,'cult',6,'magic')]);S.trust=80;S.synergy=60;S.momentum=3;renderBattle()});
const ids=await p.evaluate(()=>Object.keys(cards));assert.equal(ids.length,112);
for(let offset=0;offset<ids.length;offset+=5){
 const chunk=ids.slice(offset,offset+5);await p.evaluate(chunk=>{S.hand=chunk.map((id,i)=>({id,uid:'art-'+i}));renderHand()},chunk);
 assert.deepEqual(await p.locator('#hand .card').evaluateAll(els=>els.map(e=>e.dataset.cardId)),chunk);
 await p.waitForFunction(()=>[...document.querySelectorAll('#hand .card-art img')].every(i=>i.complete&&i.naturalWidth>0));
}
for(const lang of ['pl','en'])for(const [width,height] of [[1366,768],[1024,560],[390,844],[320,844]]){
 await p.setViewportSize({width,height});await p.evaluate(lang=>{ForbiddenDeckLanguage.set(lang);S.hand=['strike','brace','venomtrail','watchshift','pressure'].map((id,i)=>({id,uid:'showcase-'+i}));renderBattle()},lang);
 await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#hand .card-art img,#enemies img')].map(i=>i.decode().catch(()=>{})));await new Promise(requestAnimationFrame)});
 assert.equal(await p.locator('#hand .card-art').count(),5);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 if(width>=1000){
  assert.equal(await p.evaluate(()=>document.documentElement.scrollHeight),height);
  await p.locator('#hand .card').last().hover();assert.ok(await p.locator('#combatCardPreview .card-art img').count());
  assert.equal(await p.locator('#combatCardPreview').evaluate(e=>getComputedStyle(e).position),'fixed');
  const rect=await p.locator('#combatCardPreview').boundingBox();assert.ok(rect.y>=0&&rect.y+rect.height<=height);
  assert.match(await p.locator('#combatCardPreview').innerText(),/20 Synergy/);await p.mouse.move(5,5);
 }
 if(lang==='pl'&&width===1366)await p.screenshot({path:'/tmp/fd-illustrated-hand-desktop.png'});
 if(lang==='pl'&&width===1024)await p.screenshot({path:'/tmp/fd-illustrated-hand-compact.png'});
}
await p.setViewportSize({width:1366,height:768});await p.evaluate(()=>{ForbiddenDeckLanguage.set('pl');S.deck.push('brace','venomtrail','watchshift','pressure');ForbiddenDeckSave.save('battle');showFullDeck()});
assert.ok(await p.locator('#modalBody .deck-card .card-art').count()>0);assert.ok(await p.locator('#modalBody [data-card-id="brace"]').count());
await p.evaluate(()=>{hideModal();upgradeAtCamp()});await p.locator('#modalBody [data-card-id="brace"]').click();assert.ok(await p.evaluate(()=>S.deck.includes('brace+')));
await p.evaluate(()=>{hideModal();reward(6,18)});assert.equal(await p.locator('#modalBody .reward .card-art').count(),3);const deck=await p.evaluate(()=>S.deck.length);await p.locator('#modalBody .reward').first().click();assert.equal(await p.evaluate(()=>S.deck.length),deck+1);
await p.evaluate(()=>{hideModal();ForbiddenDeckSave.save('map');ForbiddenDeckMenu.codex('cards')});await p.waitForSelector('#codexBody .illustrated-card',{state:'attached'});assert.ok(await p.locator('#codexBody .codex-card.locked .card-art').count()===0);
// Failed artwork cannot disable a card or remove its description.
const missing=await b.newPage();missing.on('pageerror',e=>errors.push(e.message));await missing.route('**/assets/cards/**',r=>r.abort());await missing.goto('http://127.0.0.1:8000/');await missing.waitForFunction(()=>window.ForbiddenDeckCardArt&&!!cards.purify);
await missing.evaluate(()=>{ForbiddenDeckMenu.close();ForbiddenTutorial.setEnabled(false);newRun();S.currentNode={type:'battle',label:'Patrol'};startBattle([enemy('Bandita','⚔️',80,'bandit',6)]);S.hand=[{id:'strike',uid:'fallback'}];renderBattle()});
await missing.waitForFunction(()=>!document.querySelector('#hand .card-art'));assert.match(await missing.locator('#hand .card').innerText(),/Strike/);await missing.locator('#hand .card').click();assert.equal(await missing.evaluate(()=>S.energy),2);
assert.deepEqual(errors,[]);await b.close();console.log('Card art OK: 112 variants, PL/EN, desktop/mobile, fixed illustrated preview, deck, real upgrade/reward callbacks, Codex and missing-image fallback.');
