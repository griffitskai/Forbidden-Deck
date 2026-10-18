import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
await page.goto('http://127.0.0.1:8000/');
await page.evaluate(()=>{ForbiddenDeckMenu.close();newRun('standard');ForbiddenTutorial.setEnabled(false)});
// Canonical route labels distinguish two locations on the SAME row and terrain.
const expected=[[0,4,0,'bridge'],[0,4,1,'ruins'],[1,1,0,'swamp'],[1,0,0,'forest'],[2,1,0,'citadel'],[2,3,0,'forge'],[2,7,0,'throne']];
for(const [act,stage,index,id] of expected){
 await page.evaluate(({act,stage})=>{hideModal();S.act=act;S.stage=stage;renderMap()}, {act,stage});
 const node=page.locator('.current-step .node').nth(index);
 const before=await page.evaluate(()=>JSON.stringify(S));await node.focus();
 await page.locator('.current-step .node').first().dispatchEvent('pointerenter');
 await page.locator('.current-step .node').first().dispatchEvent('pointerleave');
 assert.equal(await page.locator('#journeyVista').getAttribute('data-scenery'),id);
 assert.equal(await page.evaluate(()=>JSON.stringify(S)),before,'Preview cannot choose or mutate a node');
 await node.click();assert.equal(await page.locator('#battleScreen .center').getAttribute('data-scenery'),id);
 await page.waitForFunction(()=>{const i=document.querySelector('.combat-scenery img');return i.complete&&i.naturalWidth>0});
 const src=await page.locator('.combat-scenery img').getAttribute('src');
 await page.evaluate(()=>{renderBattle();ForbiddenDeckLanguage.set('en')});
 assert.equal(await page.locator('.combat-scenery img').getAttribute('src'),src);
 assert.equal(await page.locator('.combat-scenery').count(),1);
 await page.evaluate(()=>ForbiddenDeckLanguage.set('pl'));
}
// Restore keeps the same location without save migration or a new random selection.
await page.evaluate(()=>ForbiddenDeckSave.save());await page.reload();
await page.waitForFunction(()=>window.ForbiddenDeckLocations);await page.evaluate(()=>{ForbiddenDeckMenu.close();ForbiddenDeckSave.load()});
assert.equal(await page.locator('#battleScreen .center').getAttribute('data-scenery'),'throne');
// Every route node and old saves without node metadata have a valid fallback.
assert.ok(await page.evaluate(()=>ACTS.every((a,act)=>a.route.flat().every(n=>Boolean(ForbiddenDeckLocations.resolve(n,act).art)))));
await page.evaluate(()=>{delete S.currentNode;S.act=1;renderBattle()});assert.equal(await page.locator('#battleScreen .center').getAttribute('data-scenery'),'forest');
for(const [width,height] of [[1024,560],[1280,720],[1440,900],[1920,1080],[390,844]]){
 await page.setViewportSize({width,height});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 if(width>=1000)assert.ok(await page.evaluate(()=>document.documentElement.scrollHeight<=innerHeight+1));
 assert.ok(await page.locator('#endTurnBtn').isVisible());
}
// A broken image hides only the scenery. Play remains usable.
await page.locator('.combat-scenery img').evaluate(img=>img.src='data:image/webp;base64,broken');
await page.waitForFunction(()=>document.querySelector('.combat-scenery img').hidden);
await page.evaluate(()=>{S.hand=[{id:'strike',uid:'scenery-strike'}];S.energy=3;renderBattle()});
const hp=await page.evaluate(()=>S.enemies[0].hp);await page.locator('#hand .card').click();assert.equal(await page.evaluate(()=>S.enemies[0].hp),hp-6);
assert.deepEqual(errors,[]);await browser.close();console.log('Location scenes OK: route previews, exact stage art, rerenders, language, restore, old-save fallback, viewport and missing art.');
