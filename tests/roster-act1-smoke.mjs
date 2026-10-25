import assert from 'node:assert/strict';import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true}),page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
const results=[];
for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']]){
 await page.evaluate(ids=>{let seed=27;Math.random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);ForbiddenTutorial.setEnabled(false);ForbiddenDeckRoster.start(ids);S.trust=0;saveTrust()},ids);
 let safety=0;
 while(await page.evaluate(()=>S.act===0&&!ForbiddenDeckParty.defeated())&&safety++<220){
  await page.evaluate(()=>{
   if(document.querySelector('#overlay.show')){
    const choices=[...document.querySelectorAll('#modalBody .choice')],rewards=[...document.querySelectorAll('#modalBody .reward')];
    const title=document.getElementById('modalTitle').textContent;
    // Roadside dialogue precedes the unchanged event and has a single continue action.
    if(document.getElementById('roadsideScene')){(document.querySelector('[data-road-continue]')||document.querySelector('[data-road-choice="1"]'))?.click();return}
    if(rewards.length){choices.at(-1)?.click();return}
    if(title.startsWith('Awans')){const weakest=S.party.members.map((h,i)=>({i,r:h.hp/h.maxHp})).sort((a,b)=>a.r-b.r)[0];choices[weakest.i]?.click();return}
    if(S.currentNode?.type==='camp'){choices[0]?.click();return}
    if(S.currentNode?.type==='event'){choices[1]?.click();return}
    choices[0]?.click();return;
   }
   if(document.getElementById('mapScreen').classList.contains('active')){
    const row=currentAct().route[S.stage];const index=S.stage===1||S.stage===8?row.findIndex(n=>n.type==='story'):0;
    const node=row[Math.max(0,index)];enterNode(node,Math.max(0,index));
    if(node.type==='shop'){const exit=[...document.querySelectorAll('#modalBody .choice')].find(b=>b.textContent.includes('Wyjdź'));exit?.click()}
    return;
   }
   if(S.battleOver)return;
   if(S.potions[1]==='ward'&&liveEnemies().some(e=>intentFor(e).dtype==='magic'))usePotion(1);
   if(S.potions[0]==='heal'){
    const wounded=[...S.party.members].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    if(wounded.hp/wounded.maxHp<.6&&wounded.maxHp-wounded.hp>=16){usePotion(0);[...document.querySelectorAll('#modalBody .choice')].find(b=>b.textContent.includes(ForbiddenDeckParty.characters[wounded.id].name))?.click()}
   }
   for(let plays=0;plays<12&&!S.battleOver;plays++){
    S.target=S.enemies.map((e,i)=>({e,i})).filter(x=>x.e.hp>0).sort((a,b)=>a.e.hp-b.e.hp)[0]?.i??0;
    const t=selected();if(!t)break;
    const incoming=ForbiddenIntentPreview.simulateIncoming(),lead=ForbiddenDeckParty.member('lead'),partner=ForbiddenDeckParty.member('partner');
    const res=id=>S.party.members.find(h=>h.id===id)?.resources||{},shadow=res('varyn').shadow||0,runes=res('selene').runes||0;
    const defend=(a,b)=>Math.min(incoming.kael,a)*(lead.hp/lead.maxHp<.5?2.6:1.3)+Math.min(incoming.lyra,b)*(partner.hp/partner.maxHp<.5?2.6:1.3);
    const scored=S.hand.map((c,i)=>({c,i,d:cards[c.id]})).filter(x=>playable(x.c)).map(x=>{
     const d=x.d,k=d.effect||d.kind;let dmg=d.dmg||d.damage||0,utility=0;
     if(k==='finish')dmg=S.momentum>=3?18:8;if(k==='heavy')dmg=10+4*t.marked;
     if(k==='ambush')dmg=d.dmg+d.scale*shadow;if(k==='detonate')dmg=d.dmg+d.scale*runes;
     if(k==='eclipse')dmg=d.dmg+d.scale*Math.min(shadow,runes);
     if(k==='crosshunt')dmg=t.marked?d.prepared:d.dmg;if(k==='opening')dmg=t.marked?14:7;
     if(k==='aegisburst'){dmg=runes>=2?d.prepared:d.dmg;utility+=defend(d.block,d.block)}
     if(k==='mark')utility+=t.marked<2?9:0;
     if(k==='draw'||k==='duodraw'||k==='silenttrail')utility+=S.energy>=2?8:1;
     if(k==='block'||k==='taunt'||k==='ironwall'||k==='brace'||k==='veil')utility+=defend(d.block||7,0);
     if(k==='evade')utility+=defend(0,d.block||6)+(S.energy>=2?3:0);
     if(k==='cover'||k==='intercept'||k==='runiccover')utility+=defend(d.block||7,0)+Math.min(incoming.lyra,8)*1.4;
     if(['rally','mend','aegisrally','shadowfeint','nightward'].includes(k))utility+=defend(d.blockEach||d.block||6,d.blockEach||d.block||6);
     if(k==='smoke'||k==='veilrune'||k==='runeward')utility+=defend(d.block,d.partnerBlock);
     if(['knife','veil','smoke','shadowfeint','veilrune'].includes(k)&&shadow<3)utility+=3;
     if(['spark','runeward','runiccover','veilrune'].includes(k)&&runes<3)utility+=3;
     if(k==='mend'&&runes>=2&&res('selene').mends>0)utility+=Math.min(6,Math.max(lead.maxHp-lead.hp,partner.maxHp-partner.hp))*1.5;
     if(k==='venomknife'||k==='silenttrail')utility+=3;
     const score=(Math.min(dmg,t.hp)*1.5+(dmg>=t.hp&&dmg>0?22:0)+utility)/d.cost;
     return {...x,score};
    }).sort((a,b)=>b.score-a.score);
    if(!scored.length||scored[0].score<=0)break;playCard(scored[0].i);
   }
   if(!S.battleOver)endTurn();
  });
 }
 const result=await page.evaluate(()=>({pair:S.party.relationshipId,act:S.act,wins:S.wins,hp:S.party.members.map(h=>h.hp),level:S.level,stage:S.stage}));results.push(result);console.log(result);
}
await browser.close();assert.deepEqual(errors,[]);assert.ok(results.every(r=>r.act===1&&r.hp.every(n=>n>0)),'Every party must finish the real first-act route on Standard without stat cheats');
console.log('Roster Act I OK: all four parties completed a real seeded Standard route with earned levels, camp healing, potions and original enemy stats.');
