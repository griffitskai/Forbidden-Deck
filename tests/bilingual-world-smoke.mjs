import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8000/');await page.waitForFunction(()=>window.ForbiddenDeckLanguage);
assert.equal(await page.locator('html').getAttribute('lang'),'pl');
await page.getByRole('button',{name:'English',exact:true}).click();
assert.equal(await page.locator('html').getAttribute('lang'),'en');
assert.match(await page.locator('#menuNew').innerText(),/New Run/);
assert.match(await page.locator('#menuCompanions').innerText(),/Shared Moments/);
await page.reload();await page.waitForFunction(()=>window.ForbiddenDeckLanguage);assert.equal(await page.locator('html').getAttribute('lang'),'en');
await page.evaluate(()=>{ForbiddenDeckMenu.close();newRun('standard');startBattle([enemy('Strażniczka Pogranicza','👑',82,'boss',9),enemy('Łuczniczka','🏹',24,'archer',6)])});
await page.waitForSelector('#enemies .world-atlas img');
assert.equal(await page.locator('.world-battle-art').evaluate(el=>el.offsetParent.id),'battlefieldVisual');
assert.match(await page.locator('#enemies').innerText(),/Warden of the Borderlands/);
const before=await page.evaluate(()=>JSON.stringify(S));
const targets=await page.evaluate(()=>S.enemies.map(e=>targetFor(e,intentFor(e))));
await page.click('#languageBtn');assert.equal(await page.locator('html').getAttribute('lang'),'pl');
assert.equal(await page.evaluate(()=>JSON.stringify(S)),before);
assert.deepEqual(await page.evaluate(()=>S.enemies.map(e=>targetFor(e,intentFor(e)))),targets);
assert.match(await page.locator('#enemies').innerText(),/Strażniczka Pogranicza/);
await page.click('#languageBtn');
// Actual play remains bound to the same card/enemy after repeated changes.
await page.evaluate(()=>{S.hand=[{id:'strike',uid:'i18n-strike'}];S.energy=3;renderBattle()});
const hp=await page.evaluate(()=>S.enemies[0].hp);await page.locator('#hand .card').click();assert.equal(await page.evaluate(()=>S.enemies[0].hp),hp-6);
await page.evaluate(()=>endTurn());assert.equal(await page.evaluate(()=>S.turn),2);
// Switching on a randomly selected reward must retain the same choices and callbacks.
await page.evaluate(()=>reward(6,18));const offer=await page.locator('#modalBody').innerText(),gold=await page.evaluate(()=>S.gold),deck=await page.evaluate(()=>S.deck.length);
await page.evaluate(()=>{ForbiddenDeckLanguage.set('pl');ForbiddenDeckLanguage.set('en')});
assert.equal(await page.locator('#modalBody').innerText(),offer);assert.equal(await page.evaluate(()=>S.gold),gold);
await page.locator('#modalBody .reward').first().click();assert.equal(await page.evaluate(()=>S.deck.length),deck+1);
await page.evaluate(()=>{hideModal();showEquipment()});await page.waitForSelector('.slot .world-atlas img');assert.match(await page.locator('#modalBody').innerText(),/Iron Breastplate/);
await page.evaluate(()=>{hideModal();shop()});assert.equal(await page.locator('.world-location').count(),1);assert.ok(await page.locator('.equip-card .world-atlas').count()>=4);
const shopBefore=await page.evaluate(()=>({gold:S.gold,inventory:[...S.inventory]}));await page.evaluate(()=>ForbiddenDeckLanguage.set('pl'));await page.evaluate(()=>ForbiddenDeckLanguage.set('en'));assert.deepEqual(await page.evaluate(()=>({gold:S.gold,inventory:[...S.inventory]})),shopBefore);
await page.evaluate(()=>{hideModal();ForbiddenDeckMenu.codex('gear')});await page.waitForSelector('#codexBody .world-atlas',{state:'attached'});
// Dialogue phase, saved line and first choice survive language switches.
await page.evaluate(()=>{ForbiddenDeckCompanions.openEpisode('bread')});await page.click('#lifeNext');
const active=await page.evaluate(()=>JSON.stringify(ForbiddenDeckCompanions.load().active));
await page.evaluate(()=>ForbiddenDeckLanguage.set('pl'));assert.match(await page.locator('.life-words p').innerText(),/Dlaczego/);
await page.evaluate(()=>ForbiddenDeckLanguage.set('en'));assert.match(await page.locator('.life-words p').innerText(),/Why did I/);
assert.equal(await page.evaluate(()=>JSON.stringify(ForbiddenDeckCompanions.load().active)),active);
await page.reload();await page.waitForFunction(()=>window.ForbiddenDeckLanguage);await page.evaluate(()=>ForbiddenDeckCompanions.openEpisode('bread'));assert.match(await page.locator('.life-words p').innerText(),/Why did I/);
// Both atlases and every cell are available; images are local and decoded.
await page.evaluate(()=>{ForbiddenDeckCompanions.close();ForbiddenDeckMenu.close();S.act=2;startBattle([enemy('Żelazny Golem','🤖',82,'golem',11),enemy('Królowa Popiołu','👑',118,'ashqueen',11)]);});
await page.waitForFunction(()=>[...document.querySelectorAll('#enemies .world-atlas img')].every(i=>i.complete&&i.naturalWidth>0));
await page.evaluate(()=>{ForbiddenTutorial.setEnabled(false);window.scrollTo(0,0)});
for(const width of [1440,390,320]){
 await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),`horizontal overflow ${width}`);
 assert.ok(await page.locator('.intent-preview').first().isVisible());
 await page.screenshot({path:`/tmp/forbidden-deck-en-${width}.png`,fullPage:true});
}
await page.evaluate(()=>{ForbiddenDeckLanguage.set('pl');ForbiddenDeckLanguage.set('en')});
const residue=await page.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode()){const n=w.currentNode;if(n.parentElement.getClientRects().length&&!n.parentElement.closest('script,style,[data-no-translate]')&&/[ąćęłńóśźż]/i.test(n.nodeValue))a.push(n.nodeValue.trim())}return a});assert.deepEqual(residue,[]);
assert.deepEqual(errors,[]);await browser.close();console.log('Bilingual world OK: persistence, targeting, played cards, reward callbacks, shop, Codex, resumed dialogue, art and 1440/390/320 px.');
