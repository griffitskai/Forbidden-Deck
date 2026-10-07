const UPGRADES={
 strike:{dmg:8,text:"8 dmg. +1 Momentum."},
 guard:{block:10,text:"+10 Block Kaela."},
 challenge:{block:10,text:"+10 Block Kaela. Prowokacja do następnej tury."},
 heavy:{baseDamage:12,markBonus:5,text:"12 dmg + 5 za każdy Marked. Zużywa Marked."},
 finish:{normalDamage:10,finisherDamage:22,text:"10 dmg. Przy 3 Momentum: 22 dmg i reset Momentum."},
 shot:{dmg:7,text:"7 dmg."},
 expose:{mark:3,text:"+3 Marked."},
 focus:{draw:3,synGain:7,text:"Dobierz 3. +7 Synergy."},
 evade:{block:8,draw:1,text:"+8 Block Lyry, dobierz 1."},
 cover:{block:9,damage:6,protect:2,synGain:15,text:"+9 Block Kaela, 6 dmg i 2 Ochrony."},
 intercept:{block:8,protect:2,synGain:10,text:"+8 Block Kaela. Przechwyć 2 ataki w Lyrę."},
 opening:{preparedDamage:18,unpreparedDamage:9,synGain:25,text:"Jeśli cel ma Marked: 18 dmg, +25 Synergy."},
 rally:{blockEach:8,synGain:18,text:"+8 Block dla obojga, +18 Synergy."},
 twin:{baseDamage:12,markedDamage:21,synGain:18,text:"12 dmg. Jeśli Marked ≥2: 21 dmg. +18 Synergy."},
 back:{aoeDamage:26,blockEach:10,text:"Wymaga 100 Synergy. 26 dmg wszystkim, +10 Block dla obojga."},
 protect:{block:13,protect:3,counterDamage:7,synGain:15,text:"+13 Block Kaela, 3 Ochrony i kontratak Lyry za 7."},
 cross:{hitDamage:10,synGain:18,text:"10 dmg. Jeśli Kael zagrał kartę: kolejne 10 dmg."},
 bash:{baseDamage:7,blockRatio:.6,text:"7 dmg + 60% Block Kaela."},
 wall:{block:16,text:"+16 Block Kaela i Prowokacja."},
 snipe:{baseDamage:9,markedDamage:20,synGain:12,text:"9 dmg. Jeśli Marked: 20 dmg."},
 volley:{aoeDamage:6,text:"6 dmg wszystkim wrogom."},
 bond:{draw:3,synGain:15,text:"Dobierz 3, +15 Synergy."},
 advancecard:{damage:13,blockEach:6,synGain:15,text:"13 dmg, +6 Block dla obojga."}
};

Object.entries({
 heavy:{baseDamage:10,markBonus:4},finish:{normalDamage:8,finisherDamage:18},focus:{synGain:5},cover:{block:7,damage:4,protect:1,synGain:12},intercept:{block:5,protect:1,synGain:8},opening:{preparedDamage:14,unpreparedDamage:7,synGain:20},rally:{blockEach:6,synGain:15},twin:{baseDamage:10,markedDamage:17,synGain:15},back:{aoeDamage:22,blockEach:8},protect:{block:10,protect:2,counterDamage:5,synGain:12},cross:{hitDamage:8,synGain:15},bash:{baseDamage:5,blockRatio:.5},wall:{block:12},snipe:{baseDamage:7,markedDamage:16,synGain:10},volley:{aoeDamage:4},bond:{draw:2,synGain:12},advancecard:{damage:10,blockEach:5,synGain:12}
}).forEach(([id,patch])=>Object.assign(cards[id],patch));

Object.entries(UPGRADES).forEach(([id,patch])=>{
 if(cards[id])cards[id+"+"]={...cards[id],...patch,name:cards[id].name+"+",upgraded:true};
});

function isUpgradedCard(id){return typeof id==="string"&&id.endsWith("+")}
function canUpgradeCard(id){return !isUpgradedCard(id)&&!!UPGRADES[id]}
function cardButton(id,index,onClick){
 const d=cards[id];
 const b=document.createElement("button");
 b.className="deck-card "+(d.actor==="Kael"?"kael":d.actor==="Lyra"?"lyra":"duo")+(isUpgradedCard(id)?" upgraded":"");
 b.innerHTML='<div class="deck-card-head"><strong>'+d.name+'</strong><span>'+d.cost+'⚡</span></div><small>'+d.actor+' • '+d.tag+'</small><p>'+d.text+'</p>';
 if(onClick)b.onclick=()=>onClick(id,index);
 return b;
}
function showCardCollection(title,ids,description=""){
 showModal(title,description,()=>{
  const wrap=document.createElement("div");wrap.className="deck-list";
  if(!ids.length){const p=document.createElement("p");p.className="empty-deck";p.textContent="Brak kart w tym stosie.";wrap.appendChild(p)}
  ids.forEach((id,i)=>wrap.appendChild(cardButton(typeof id==="string"?id:id.id,i,null)));
  return wrap;
 },true);
}
function showFullDeck(){showCardCollection("Talia — "+S.deck.length+" kart",S.deck,"Ulepszone karty są oznaczone złotą obwódką. Zmiany obowiązują do końca bieżącego runu.")}
function showPile(title,pile){showCardCollection(title,pile.map(c=>c.id),"Podgląd nie zmienia kolejności stosu.")}

function chooseDeckCard(title,filter,description,onChoose){
 const choices=S.deck.map((id,index)=>({id,index})).filter(x=>filter(x.id,x.index));
 showModal(title,description,()=>{
  const wrap=document.createElement("div");wrap.className="deck-list selectable";
  if(!choices.length){const p=document.createElement("p");p.className="empty-deck";p.textContent="Brak pasujących kart.";wrap.appendChild(p)}
  choices.forEach(x=>wrap.appendChild(cardButton(x.id,x.index,onChoose)));
  return wrap;
 },true);
}
function upgradeAtCamp(){
 chooseDeckCard("Ulepsz kartę",id=>canUpgradeCard(id),"Wybierz jedną kartę. Każda karta może zostać ulepszona tylko raz.",(id,index)=>{
  S.deck[index]=id+"+";
  hideModal();
  advance();
 });
}
function removeCardAtShop(cost=45){
 if(S.gold<cost){showModal("Usuwanie karty","Potrzebujesz "+cost+" złota.",()=>grid([["Wróć","Nie masz wystarczająco złota.",()=>{hideModal();shop()}]]),true);return}
 if(S.deck.length<=12){showModal("Usuwanie karty","Talia jest już zbyt mała, aby bezpiecznie usuwać kolejne karty.",()=>grid([["Wróć","Wróć do sklepu.",()=>{hideModal();shop()}]]),true);return}
 chooseDeckCard("Usuń kartę — "+cost+" złota",()=>true,"Usunięta karta znika z talii do końca runu.",(id,index)=>{
  S.gold-=cost;S.deck.splice(index,1);hideModal();shop();
 });
}

camp=function(){
 showModal("Ognisko","Wybierz jedną czynność. Ognisko jest teraz głównym miejscem kontroli talii.",()=>grid([
  ["🛏️ Odpoczynek","+14 HP Kaela i Lyry.",()=>{S.kaelHp=Math.min(S.kaelMaxHp,S.kaelHp+14);S.lyraHp=Math.min(S.lyraMaxHp,S.lyraHp+14);hideModal();advance()}],
  ["🔨 Ulepsz kartę","Wzmocnij jedną kartę na resztę runu.",()=>{hideModal();upgradeAtCamp()}],
  ["💬 Rozmowa","+8 Trust i scena relacji.",()=>campDialogue()],
  ["🧪 Warzenie","Dodaj losową miksturę do pustego slotu.",()=>{const e=S.potions.findIndex(x=>!x);if(e>=0)S.potions[e]=pick(["heal","ward","antidote","tonic"]);hideModal();advance()}]
 ]));
};

shop=function(){
 const items=[["arcaneCharm",38],["serpentCharm",38],["wardCharm",42]];
 showModal("Wędrowny kupiec","Kup sprzęt albo oczyść talię z karty, której już nie chcesz.",()=>{
  const w=document.createElement("div"),g=document.createElement("div");g.className="reward-grid";
  items.forEach(([id,price])=>{const it=gearDefs[id],b=document.createElement("button");b.className="equip-card";b.innerHTML='<div class="meta">'+price+' złota</div><h3>'+it.name+'</h3><p>'+it.desc+'</p>';b.disabled=S.gold<price;b.onclick=()=>{if(S.gold<price)return;S.gold-=price;if(!S.inventory.includes(id))S.inventory.push(id);b.disabled=true;b.style.opacity=.45;renderTopBar()};g.appendChild(b)});
  const p=document.createElement("button");p.className="equip-card";p.innerHTML='<div class="meta">20 złota</div><h3>Mikstura leczenia</h3><p>Przywraca 18 HP w walce.</p>';p.disabled=S.gold<20;p.onclick=()=>{const e=S.potions.findIndex(x=>!x);if(e<0||S.gold<20)return;S.gold-=20;S.potions[e]="heal";p.disabled=true;p.style.opacity=.45;renderTopBar()};g.appendChild(p);
  const remove=document.createElement("button");remove.className="equip-card service-card";remove.innerHTML='<div class="meta">45 złota</div><h3>Usuń kartę</h3><p>Usuń jedną kartę z talii do końca runu.</p>';remove.disabled=S.gold<45||S.deck.length<=12;remove.onclick=()=>{hideModal();removeCardAtShop(45)};g.appendChild(remove);
  w.appendChild(g);w.appendChild(choiceBtn("Wyjdź","Kontynuuj run.",()=>{hideModal();advance()}));return w;
 });
};

playCard=function(i){
 const c=S.hand[i];if(!c||!playable(c))return;const d=cards[c.id],t=selected();if(!t)return;
 S.energy-=d.cost;
 const prev=S.lastActor;if(d.actor!=="Duo"&&prev&&prev!=="Duo"&&prev!==d.actor)addSyn(10,prev+" → "+d.actor);
 if(d.actor==="Kael"){S.lastKaelThisTurn=true;if(d.mom)S.momentum=Math.min(5,S.momentum+d.mom)}
 if(d.kind==="attack"){log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.dmg)+" dmg.","good")}
 else if(d.kind==="block"){S.kaelBlock+=d.block;log("<b>"+d.name+"</b>: +"+d.block+" Block Kaela.","good")}
 else if(d.kind==="taunt"){S.kaelBlock+=d.block;S.taunt=1;log("<b>"+d.name+"</b>: +"+d.block+" Block Kaela i Prowokacja.","combo")}
 else if(d.kind==="mark"){t.marked=Math.min(3,t.marked+d.mark);log("<b>Marked</b> na "+t.name+": "+t.marked+".","good");addSyn(5,"Lyra przygotowuje cel")}
 else if(d.kind==="draw"){draw(d.draw,false);addSyn(d.synGain||5,d.name);log("<b>"+d.name+"</b>: dobierz "+d.draw+".","good")}
 else if(d.kind==="evade"){S.lyraBlock+=d.block;draw(d.draw,false);log("<b>"+d.name+"</b>: +"+d.block+" Block Lyry, dobierz "+d.draw+".","good")}
 else if(d.kind==="heavy"){const amount=d.baseDamage+d.markBonus*t.marked;log("<b>"+d.name+"</b>: "+dmgEnemy(t,amount)+" dmg.","good");if(t.marked>0)addSyn(12,"Kael wykorzystuje Marked");t.marked=0}
 else if(d.kind==="finish"){const amount=S.momentum>=3?d.finisherDamage:d.normalDamage;if(S.momentum>=3){S.momentum=0;pop("BRUTAL FINISH!")}log("<b>"+d.name+"</b>: "+dmgEnemy(t,amount)+" dmg.","good")}
 else if(d.kind==="cover"){S.kaelBlock+=d.block;S.protectLyra+=d.protect;log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.damage)+" dmg, +"+d.block+" Block Kaela i "+d.protect+" Ochrona.","combo");addSyn(d.synGain,d.name)}
 else if(d.kind==="intercept"){S.kaelBlock+=d.block;S.protectLyra+=d.protect;log("<b>"+d.name+"</b>: +"+d.block+" Block Kaela i "+d.protect+" Ochrona.","combo");addSyn(d.synGain,d.name)}
 else if(d.kind==="opening"){if(t.marked>0){log("<b>"+d.name+"!</b> "+dmgEnemy(t,d.preparedDamage)+" dmg.","combo");addSyn(d.synGain,"idealne otwarcie")}else log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.unpreparedDamage)+" dmg.","info")}
 else if(d.kind==="rally"){S.kaelBlock+=d.blockEach;S.lyraBlock+=d.blockEach;addSyn(d.synGain,d.name);log("<b>"+d.name+"</b>: +"+d.blockEach+" Block dla obojga.","combo")}
 else if(d.kind==="twin"){const a=t.marked>=2?d.markedDamage:d.baseDamage;log("<b>"+d.name+"</b>: "+dmgEnemy(t,a)+" dmg.","combo");addSyn(d.synGain,"atak duetu")}
 else if(d.kind==="back"){S.synergy=0;S.kaelBlock+=d.blockEach;S.lyraBlock+=d.blockEach;let total=0;liveEnemies().forEach(e=>total+=dmgEnemy(e,d.aoeDamage));log("<b>"+d.name+"!</b> "+total+" łącznych dmg, +"+d.blockEach+" Block dla obojga.","combo");pop("BACK TO BACK!")}
 else if(d.kind==="protect"){S.kaelBlock+=d.block;S.protectLyra+=d.protect;const live=liveEnemies().slice().sort((a,b)=>(intentFor(b).v||0)-(intentFor(a).v||0));if(live[0])dmgEnemy(live[0],d.counterDamage);log("<b>"+d.name+"</b>: +"+d.block+" Block Kaela, "+d.protect+" Ochrony i kontratak.","combo");addSyn(d.synGain,"ochrona partnera")}
 else if(d.kind==="cross"){let a=dmgEnemy(t,d.hitDamage);if(S.lastKaelThisTurn&&t.hp>0)a+=dmgEnemy(t,d.hitDamage);log("<b>"+d.name+"</b>: "+a+" dmg.","combo");addSyn(d.synGain,d.name)}
 else if(d.kind==="shieldbash"){const amt=d.baseDamage+Math.floor(S.kaelBlock*d.blockRatio);log("<b>"+d.name+"</b>: "+dmgEnemy(t,amt)+" dmg.","good")}
 else if(d.kind==="ironwall"){S.kaelBlock+=d.block;S.taunt=1;log("<b>"+d.name+"</b>: +"+d.block+" Block Kaela i Prowokacja.","combo")}
 else if(d.kind==="snipe"){const amt=t.marked>0?d.markedDamage:d.baseDamage;log("<b>"+d.name+"</b>: "+dmgEnemy(t,amt)+" dmg.","good");if(t.marked>0)addSyn(d.synGain,"idealny strzał")}
 else if(d.kind==="volley"){let total=0;liveEnemies().forEach(e=>total+=dmgEnemy(e,d.aoeDamage));log("<b>"+d.name+"</b>: "+total+" łącznych obrażeń.","good")}
 else if(d.kind==="duodraw"){draw(d.draw,false);addSyn(d.synGain,d.name);log("<b>"+d.name+"</b>: dobierz "+d.draw+".","combo")}
 else if(d.kind==="guardedadvance"){S.kaelBlock+=d.blockEach;S.lyraBlock+=d.blockEach;log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.damage)+" dmg, +"+d.blockEach+" Block dla obojga.","combo");addSyn(d.synGain,"wspólny napór")}
 S.lastActor=d.actor;S.discard.push(S.hand.splice(i,1)[0]);if(liveEnemies().length===0){victory();return}renderBattle();
};

const deckControlRenderHand=renderHand;
renderHand=function(){deckControlRenderHand();S.hand.forEach((c,i)=>{const el=document.querySelectorAll(".hand .card")[i];if(el&&isUpgradedCard(c.id)){el.classList.add("upgraded");el.title="Ulepszona karta"}})};
const deckControlRenderBattle=renderBattle;
renderBattle=function(){deckControlRenderBattle();const d=document.getElementById("drawPileBtn"),x=document.getElementById("discardPileBtn");if(d)d.textContent="Dobieranie: "+S.draw.length;if(x)x.textContent="Odrzucone: "+S.discard.length};

(function installDeckUI(){
 if(!document.getElementById("deckBtn")){const b=document.createElement("button");b.className="btn";b.id="deckBtn";b.textContent="Talia";b.onclick=showFullDeck;document.getElementById("equipBtn").before(b)}
 const actions=document.querySelector(".battle-actions");
 if(actions&&!document.getElementById("drawPileBtn")){
  const drawBtn=document.createElement("button");drawBtn.className="btn pile-btn";drawBtn.id="drawPileBtn";drawBtn.onclick=()=>showPile("Stos dobierania",S.draw);
  const discardBtn=document.createElement("button");discardBtn.className="btn pile-btn";discardBtn.id="discardPileBtn";discardBtn.onclick=()=>showPile("Stos odrzuconych",S.discard);
  actions.insertBefore(drawBtn,document.getElementById("logToggleInline"));actions.insertBefore(discardBtn,document.getElementById("logToggleInline"));
 }
})();
