import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const browser=await chromium.launch({headless:true}),errors=[];
const pictures=process.env.FORBIDDEN_DECK_SCREENSHOTS;
if(pictures)await mkdir(pictures,{recursive:true});
async function snapshot(p){return p.evaluate(()=>({trust:S.trust,gold:S.gold,stage:S.stage,deck:[...S.deck],kael:S.kaelHp,lyra:S.lyraHp,relation:localStorage.getItem('forbidden_deck_relationship_v1')}))}
async function toChoice(p){while(await p.locator('#lifeNext').count())await p.locator('#lifeNext').click()}
async function choose(p,id){await p.locator(`[data-life-choice="${id}"]`).click();while(await p.locator('#lifeNext').count())await p.locator('#lifeNext').click()}
try{
 const p=await browser.newPage({viewport:{width:1440,height:1000}});
 p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 const before=await snapshot(p);
 await p.locator('#menuCompanions').click();assert.equal(await p.locator('.life-memory:not(:disabled)').count(),1);
 await p.locator('[data-episode="bread"]').click();
 await p.waitForFunction(()=>document.querySelector('.life-background')?.naturalWidth>0);
 if(pictures)await p.screenshot({path:`${pictures}/companions-cinema.png`});
 await p.locator('#lifeNext').click();assert.equal(await p.locator('.life-speaker strong').textContent(),'Kael');
 await p.locator('#lifeLeave').click();await p.reload({waitUntil:'networkidle'});
 await p.locator('#menuCompanions').click();await p.locator('[data-episode="bread"]').click();
 assert.equal(await p.locator('.life-speaker strong').textContent(),'Kael','Resume the exact dialogue line after closing/reloading');
 await toChoice(p);await choose(p,'home');
 assert.equal(await p.evaluate(()=>ForbiddenDeckCompanions.load().choices.bread),'home');
 assert.deepEqual(await snapshot(p),before,'Conversations have no gameplay/Trust rewards');
 await p.locator('[data-episode="bread"]').click();await toChoice(p);await choose(p,'quiet');
 assert.equal(await p.evaluate(()=>ForbiddenDeckCompanions.load().choices.bread),'home','Replay preserves the original choice');
 await p.locator('#lifeMotion').uncheck();await p.locator('#lifeBanter').uncheck();await p.locator('#companionsClose').click();
 await p.locator('#menuNew').click();await p.locator('.difficulty-card').filter({hasText:'Standard'}).click();
 await p.evaluate(()=>{ForbiddenTutorial.setEnabled(false);S.currentNode={type:'battle',label:'Ochrona'};startBattle([enemy('Skrytobójca','🗡️',60,'assassin',4)]);S.protectLyra=1;renderBattle()});
 assert((await p.locator('#companionBanter').textContent()).includes('śniadanie'),'Earlier personal choice changes later battle dialogue');
 const lyraHp=await p.evaluate(()=>S.lyraHp);await p.locator('#endTurnBtn').click();
 assert.equal(await p.evaluate(()=>S.lyraHp),lyraHp);assert((await p.evaluate(()=>ForbiddenDeckCompanions.load().unlocked)).includes('shield'));
 assert.equal(await p.locator('#companionBanter').isVisible(),false);
 await p.evaluate(()=>ForbiddenDeckCompanions.open());await p.locator('#lifeBanter').check();await p.locator('#companionsClose').click();
 assert((await p.locator('#companionBanter').textContent()).includes('Mam cię'));
 await p.evaluate(()=>{startBattle([enemy('Skrytobójca','🗡️',60,'assassin',4)]);S.lyraHp=Math.floor(S.lyraMaxHp*.3)+1;renderBattle()});
 await p.locator('#endTurnBtn').click();assert((await p.evaluate(()=>ForbiddenDeckCompanions.load().unlocked)).includes('fear'));
 assert.equal(await p.locator('#lyraField .life-mood').textContent(),'Potrzebuje wsparcia');
 assert.equal(await p.locator('#lyraField .life-face').getAttribute('data-emotion'),'concerned');
 assert((await p.locator('#companionBanter').textContent()).includes('Dam ci chwilę'));
 await p.reload({waitUntil:'networkidle'});await p.locator('#menuContinue').click();
 assert((await p.locator('#companionBanter').textContent()).includes('Dam ci chwilę'),'Battle reaction survives save/restore');
 await p.evaluate(()=>{S.enemies[0].hp=1;S.energy=3;S.hand=[{id:'strike',uid:'last'}];renderBattle()});await p.locator('.hand .card').click();
 assert((await p.evaluate(()=>ForbiddenDeckCompanions.load().unlocked)).includes('cups'));
 assert.equal(await p.locator('.life-unlocked-note').count(),1);
 await p.locator('#modalBody .choice').filter({hasText:'Pomiń'}).click();
 const earned=await snapshot(p);await p.locator('#mapCompanions').click();await p.locator('[data-episode="cups"]').click();await p.locator('#lifeSkip').click();
 assert(!(await p.evaluate(()=>ForbiddenDeckCompanions.load().seen)).includes('cups'));
 await p.locator('#companionsClose').click();assert.equal(await p.locator('#mapScreen.active').count(),1,'Conversation returns to the map after the original reward');assert.deepEqual(await snapshot(p),earned);
 await p.evaluate(()=>{hideModal();S.act=0;S.currentNode={type:'boss',label:'Strażniczka Pogranicza'};startBattle([enemy('Manekin','🎯',1,'bandit',4)]);S.hand=[{id:'strike',uid:'boss'}];S.energy=3;renderBattle()});await p.locator('.hand .card').click();
 assert((await p.evaluate(()=>ForbiddenDeckCompanions.load().unlocked)).includes('gate'));
 // Every unlocked episode, both branches, remains traversable with no second reward.
 await p.evaluate(()=>ForbiddenDeckCompanions.open());
 for(const [id,answers] of [['shield',['honest','humour']],['cups',['visit','listen']],['fear',['breathe','ritual']],['gate',['promise','rest']]])for(const answer of answers){
  const pre=await snapshot(p);await p.locator(`[data-episode="${id}"]`).click();await toChoice(p);await choose(p,answer);assert.deepEqual(await snapshot(p),pre);
 }
 await p.locator('#companionsClose').click();
 await p.evaluate(()=>localStorage.setItem('forbidden_deck_companions_v1','{broken'));
 await p.reload({waitUntil:'networkidle'});assert.equal(await p.evaluate(()=>ForbiddenDeckSave.hasSave()),true);
 await p.locator('#menuCompanions').click();assert.equal(await p.locator('.life-memory:not(:disabled)').count(),1);
 await p.close();
 for(const width of [1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});await page.locator('#menuCompanions').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('#companionsScreen img')].every(i=>i.complete&&i.naturalWidth>0));
  assert(await page.evaluate(()=>document.getElementById('companionsScreen').scrollWidth<=innerWidth+1));
  if(pictures)await page.screenshot({path:`${pictures}/companions-album-${width}.png`});
  await page.locator('[data-episode="bread"]').click();await page.waitForFunction(()=>[...document.querySelectorAll('#companionsScreen img')].every(i=>i.complete&&i.naturalWidth>0));
  assert.equal(await page.locator('.life-background').evaluate(el=>getComputedStyle(el).animationName),'none');assert(await page.evaluate(()=>document.getElementById('companionsScreen').scrollWidth<=innerWidth+1));
  if(pictures)await page.screenshot({path:`${pictures}/companions-story-${width}.png`});
  await toChoice(page);await choose(page,'quiet');await page.locator('#companionsClose').click();assert.equal(await page.evaluate(()=>document.activeElement.id),'menuCompanions');await context.close();
 }
 const missing=await browser.newPage();missing.on('pageerror',e=>errors.push(e.message));
 await missing.route('**/assets/portraits/expressions.webp',r=>r.abort());
 await missing.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 await missing.locator('#menuCompanions').click();await missing.locator('[data-episode="bread"]').click();
 await missing.waitForSelector('.life-speaker .life-face-fallback');
 await toChoice(missing);await choose(missing,'quiet');
 assert.equal(await missing.evaluate(()=>ForbiddenDeckCompanions.load().choices.bread),'quiet');await missing.close();
 assert.deepEqual(errors,[]);
 console.log('Companions OK: 5 stories, all branches, real battle event unlocks, portraits, choice memory, exact resume, replay/skip without rewards, settings, corrupt-save isolation, reduced motion and 1440/390/320px.');
}finally{await browser.close()}
