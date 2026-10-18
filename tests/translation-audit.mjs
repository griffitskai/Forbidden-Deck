import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const errors=[];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8000/');await page.waitForFunction(()=>window.ForbiddenDeckLanguage);await page.evaluate(()=>ForbiddenDeckLanguage.set('en'));
const residual=new Set();
async function collect(){await page.waitForTimeout(50);for(const s of await page.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT),a=[];while(w.nextNode()){const n=w.currentNode;if(!n.parentElement.closest('script,style,[data-no-translate]')&&/[ąćęłńóśźż]/i.test(n.nodeValue))a.push(n.nodeValue.trim())}return a}))residual.add(s)}
await collect();
await page.evaluate(()=>{ForbiddenDeckCompanions.open();ForbiddenDeckRelationship.open();ForbiddenDeckHistory.open();ForbiddenDeckMenu.codex('mechanics')});await collect();
await page.evaluate(()=>ForbiddenDeckMenu.codex('cards'));await collect();await page.evaluate(()=>ForbiddenDeckMenu.codex('gear'));await collect();await page.evaluate(()=>ForbiddenDeckMenu.codex('bosses'));await collect();
for(const f of ['difficultyChooser','showEquipment','shop','camp','campDialogue','storyNode','eventNode','showFullDeck','actTransition']){await page.evaluate(f=>window[f](),f);await collect()}
await page.evaluate(()=>{newRun();startBattle(encounter(false));});await collect();
for(let act=0;act<3;act++){await page.evaluate(a=>{S.act=a;renderMap();startBattle(bossEncounter());},act);await collect()}
const data=await page.evaluate(()=>{let a=[];for(const e of ForbiddenDeckStories){for(const t of [e.title,e.subtitle,e.condition,e.question,...e.opening.flatMap(l=>l.slice(2)),...e.options.flatMap(o=>[o.label,o.hint,...o.lines.flatMap(l=>l.slice(2))])])if(!Object.hasOwn(ForbiddenDeckEnglish,t))a.push(['Missing exact story translation',t]);}for(const d of [...Object.values(cards),...Object.values(gearDefs),...Object.values(potionDefs)])for(const k of ['name','text','desc'])if(d[k]){const t=ForbiddenDeckLanguage.translate(d[k]);if(/[ąćęłńóśźż]/i.test(t))a.push([d[k],t])}for(const e of ForbiddenDeckStories){for(const t of [e.title,e.subtitle,e.place,e.condition,e.question,...e.opening.flat(),...e.options.flatMap(o=>[o.label,o.hint,...o.lines.flat()])])if(typeof t==='string'&&/[ąćęłńóśźż]/i.test(ForbiddenDeckLanguage.translate(t)))a.push([t,ForbiddenDeckLanguage.translate(t)])}return a});
assert.deepEqual([...residual],[]);assert.deepEqual(data,[]);assert.deepEqual(errors,[]);console.log('Translation audit OK: core views, all card/item descriptions and five stories.');await browser.close();
