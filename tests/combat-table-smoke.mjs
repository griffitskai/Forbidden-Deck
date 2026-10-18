import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const b=await chromium.launch({headless:true});const errors=[];
await mkdir('/tmp/fd-table',{recursive:true});
const p=await b.newPage();p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:8000/');await p.waitForFunction(()=>window.ForbiddenDeckLanguage);
await p.evaluate(()=>{ForbiddenDeckMenu.close();ForbiddenTutorial.setEnabled(false);newRun('standard');S.act=1;S.currentNode={type:'battle',label:'Gęstwina'};startBattle([enemy('Krwawy łowca','🩸',35,'assassin',8),enemy('Cierniowy strażnik','🛡️',38,'guard',6),enemy('Bagienna wiedźma','🧙',28,'mage',6,'magic')]);S.turn=3;S.hand=['strike','intercept','focus','deepcut','expose'].map((id,i)=>({id,uid:'table-'+i}));S.enemies[0].status={bleed:2,poison:1,burn:2,weak:1};S.heroStatus.kael={bleed:2,poison:1,burn:2,weak:1};S.protectLyra=1;renderBattle()});
for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[1280,720],[1024,640],[1366,600],[1024,600],[1024,560]]){
 await p.setViewportSize({width,height});await p.waitForTimeout(160);
 const result=await p.evaluate(()=>{
  const selectors=['.topbar','.battle-actions','#hand','.card','#enemies','.enemy','.intent-preview','#energyText','#kaelHpText','#lyraHpText','#endTurnBtn','.enemy .status-row','.enemy .preview-warning','.field-hero .hero-sketch'];const failures=[];
  for(const selector of selectors)for(const el of document.querySelectorAll(selector)){const r=el.getBoundingClientRect();if(r.top<0||r.bottom>innerHeight+1||r.left<0||r.right>innerWidth+1)failures.push([selector,Math.round(r.top),Math.round(r.bottom),Math.round(r.left),Math.round(r.right)])}
  for(const el of document.querySelectorAll('.enemy .status-row,.enemy .intent-preview,.enemy .mark')){const r=el.getBoundingClientRect(),card=el.closest('.enemy').getBoundingClientRect();if(r.bottom>card.bottom+1)failures.push(['enemy content overflow',Math.round(r.bottom),Math.round(card.bottom)])}
  const frame=document.getElementById('battlefieldVisual').getBoundingClientRect();for(const el of document.querySelectorAll('.field-hero .hero-sketch,#kaelHpText,#lyraHpText')){const r=el.getBoundingClientRect();if(r.top<frame.top||r.bottom>frame.bottom)failures.push(['hero clipped',Math.round(r.top),Math.round(r.bottom)])}
  return{scroll:document.documentElement.scrollHeight,viewport:innerHeight,failures};
 });
 console.log(width,height,JSON.stringify(result));
 await p.screenshot({path:`/tmp/fd-table/battle-${width}x${height}.png`});
 assert.equal(result.scroll,height,`page scroll ${width}x${height}`);assert.deepEqual(result.failures,[],`clipped controls ${width}x${height}`);
}
// Long English boss names, phase warnings and full status rows in the shortest window.
await p.setViewportSize({width:1024,height:560});
for(const language of ['pl','en'])for(const act of [0,1,2])for(const phase of [1,2]){
 await p.evaluate(({language,act,phase})=>{ForbiddenDeckLanguage.set(language);S.act=act;S.currentNode={type:'boss',label:currentAct().route.at(-1)[0].label};startBattle(bossEncounter());S.turn=3;if(phase===2)S.enemies[0].hp=Math.floor(S.enemies[0].maxHp*.4);for(const e of S.enemies)e.status={bleed:2,poison:2,burn:2,weak:2};renderBattle()},{language,act,phase});
 await p.waitForTimeout(60);
 const overflow=await p.evaluate(()=>[...document.querySelectorAll('.enemy .mark,.enemy .status-row,.enemy .intent-preview')].filter(el=>el.getBoundingClientRect().bottom>el.closest('.enemy').getBoundingClientRect().bottom+1).map(el=>el.className));
 assert.deepEqual(overflow,[],`${language}, act ${act}, phase ${phase}`);
}
// Large hands fan out instead of forcing the page or hand to scroll.
await p.setViewportSize({width:1366,height:768});
for(const lang of ['pl','en'])for(const count of [5,10,15]){
 await p.evaluate(({lang,count})=>{ForbiddenDeckLanguage.set(lang);S.hand=Array.from({length:count},(_,i)=>({id:i%2?'protect':'challenge',uid:'fan-'+i}));S.trust=80;renderBattle()}, {lang,count});
 await p.waitForTimeout(80);
 assert.ok(await p.locator('#hand').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 const last=p.locator('#hand .card').last();await last.hover();await p.waitForTimeout(50);
 assert.ok(await p.locator('#combatCardPreview').isVisible());
 assert.match(await p.locator('#combatCardPreview').innerText(),lang==='pl'?/Prowokacja|Ochron/:/Taunt|Intercept/);
 const rect=await last.boundingBox();assert.ok(rect.y+rect.height<=768);
 assert.equal(await p.evaluate(()=>scrollY),0);
}
// Rules use a dialog, preserve combat state, and return focus to the button.
await p.mouse.move(4,4);
const state=await p.evaluate(()=>JSON.stringify(S));await p.click('#combatDetailsBtn');
assert.ok(await p.locator('#combatDetails').isVisible());assert.match(await p.locator('#combatDetails').innerText(),/20%/);
await p.keyboard.press('Escape');assert.equal(await p.locator('#combatDetails').isVisible(),false);
assert.equal(await p.evaluate(()=>JSON.stringify(S)),state);assert.equal(await p.evaluate(()=>document.activeElement.id),'combatDetailsBtn');
// The controls keep their existing behavior, including keyboard card play.
await p.evaluate(()=>{ForbiddenDeckLanguage.set('pl');S.hand=[{id:'strike',uid:'keyboard'}];S.energy=3;S.heroStatus.kael.weak=0;renderBattle()});
const beforeHp=await p.evaluate(()=>S.enemies[0].hp);await p.locator('#hand .card').focus();await p.keyboard.press('Enter');
assert.equal(await p.evaluate(()=>S.enemies[0].hp),beforeHp-6);assert.equal(await p.evaluate(()=>S.energy),2);
await p.click('#endTurnBtn');assert.equal(await p.evaluate(()=>S.turn),4);assert.equal(await p.evaluate(()=>scrollY),0);
await p.reload();await p.waitForFunction(()=>window.ForbiddenDeckLanguage);await p.click('#menuContinue');
assert.equal(await p.evaluate(()=>S.turn),4);assert.ok(await p.locator('body').evaluate(el=>el.classList.contains('combat-active')));
// Leaving combat restores normal map scrolling; the battle frame is not global.
await p.evaluate(()=>{hideModal();renderMap()});assert.equal(await p.locator('body').evaluate(el=>el.classList.contains('combat-active')),false);
assert.ok(await p.evaluate(()=>document.documentElement.scrollHeight>innerHeight));
await b.close();assert.deepEqual(errors,[]);console.log('Combat table OK: 8 desktop sizes, large hands, PL/EN, inspect, keyboard play, dialog, turn, save/restore and map scrolling.');
