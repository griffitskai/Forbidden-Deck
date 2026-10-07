(()=>{
 const style=document.createElement("link");style.rel="stylesheet";style.href="css/act3.css";document.head.appendChild(style);

 if(!ACTS.some(a=>a.num===3)){
  ACTS.push({num:3,title:"Cytadela Popiołu",route:[
   [{type:"battle",label:"Popielny trakt",terrain:"ash",icon:"🌫️"},{type:"event",label:"Spalona kaplica",terrain:"sanctum",icon:"🕯️"}],
   [{type:"battle",label:"Żarzące mury",terrain:"citadel",icon:"🏰"},{type:"elite",label:"Popielny Inkwizytor",terrain:"citadel",icon:"☠️"}],
   [{type:"camp",label:"Obóz pod murem",terrain:"camp",icon:"🔥"}],
   [{type:"battle",label:"Kuźnie",terrain:"lava",icon:"⚒️"},{type:"story",label:"Przed bramą",terrain:"sanctum",icon:"💬"}],
   [{type:"elite",label:"Żelazny Golem",terrain:"citadel",icon:"🤖"},{type:"shop",label:"Kupiec z Otchłani",terrain:"shop",icon:"🛒"}],
   [{type:"battle",label:"Sala żaru",terrain:"lava",icon:"🔥"},{type:"battle",label:"Koszary fanatyków",terrain:"citadel",icon:"⚔️"}],
   [{type:"event",label:"Studnia popiołu",terrain:"ash",icon:"❓"},{type:"battle",label:"Schody tronu",terrain:"citadel",icon:"🛡️"}],
   [{type:"boss",label:"Królowa Popiołu",terrain:"sanctum",icon:"👑"}]
  ]});
 }

 const ACT3_CARDS={
  cinderguard:{name:"Straż Żaru",actor:"Kael",cost:1,text:"+8 Block Kaela. Jeśli Kael ma negatywny status: dodatkowe +5 Block.",kind:"cinderguard",block:8,bonusBlock:5,tag:"Odporność"},
  bloodrush:{name:"Krwawy Szturm",actor:"Kael",cost:1,text:"7 dmg i +1 Momentum. Jeśli Kael krwawi: 13 dmg.",kind:"bloodrush",dmg:7,bleedDmg:13,mom:1,tag:"Momentum"},
  executionarrow:{name:"Strzała Egzekucyjna",actor:"Lyra",cost:2,text:"8 dmg +4 za każdy aktywny status na celu.",kind:"executionarrow",dmg:8,statusBonus:4,tag:"Statusy"},
  ashshot:{name:"Popielna Strzała",actor:"Lyra",cost:1,text:"6 dmg i +2 Podpalenie.",kind:"ashshot",dmg:6,burn:2,tag:"Podpalenie"},
  bloodbond:{name:"Krwawa Więź",actor:"Duo",cost:2,text:"12 dmg, +2 Krwawienie i +12 Synergy.",kind:"bloodbond",dmg:12,bleed:2,synGain:12,trust:20,tag:"Trust 20"},
  laststand:{name:"Ostatnia Linia",actor:"Duo",cost:1,text:"+8 Block dla obojga. Jeśli ktoś ma mniej niż 50% HP: ulecz oboje o 5.",kind:"laststand",blockEach:8,heal:5,trust:40,tag:"Trust 40"}
 };
 const ACT3_UPGRADES={
  cinderguard:{block:11,bonusBlock:7,text:"+11 Block Kaela. Przy negatywnym statusie: dodatkowe +7 Block."},
  bloodrush:{dmg:9,bleedDmg:17,mom:2,text:"9 dmg i +2 Momentum. Jeśli Kael krwawi: 17 dmg."},
  executionarrow:{dmg:10,statusBonus:5,text:"10 dmg +5 za każdy aktywny status na celu."},
  ashshot:{dmg:8,burn:3,text:"8 dmg i +3 Podpalenie."},
  bloodbond:{dmg:15,bleed:3,synGain:16,text:"15 dmg, +3 Krwawienie i +16 Synergy."},
  laststand:{blockEach:10,heal:7,text:"+10 Block dla obojga. Przy HP <50% ulecz oboje o 7."}
 };
 Object.entries(ACT3_CARDS).forEach(([id,card])=>{cards[id]=card;UPGRADES[id]=ACT3_UPGRADES[id];cards[id+"+"]={...card,...ACT3_UPGRADES[id],name:card.name+"+",upgraded:true}});
 const act3RewardIds=Object.keys(ACT3_CARDS);

 function statusBag(target){
  if(!target.status)target.status={bleed:0,poison:0,burn:0,weak:0};
  return target.status;
 }
 function heroBag(hero){
  if(!S.heroStatus)S.heroStatus={kael:{bleed:0,poison:0,burn:0,weak:0},lyra:{bleed:0,poison:0,burn:0,weak:0}};
  if(!S.heroStatus[hero])S.heroStatus[hero]={bleed:0,poison:0,burn:0,weak:0};
  return S.heroStatus[hero];
 }
 function addStatus(target,type,amount){const s=statusBag(target);s[type]=Math.min(12,(s[type]||0)+amount)}
 function negativeCount(target){const s=statusBag(target);return ["bleed","poison","burn","weak"].filter(k=>(s[k]||0)>0).length}
 function hasHeroNegative(hero){const s=heroBag(hero);return Object.values(s).some(v=>v>0)}
 function scaled(v){return Math.max(1,Math.round(v*difficultyCfg().enemyDmg))}

 function act3Enemy(name,emo,hp,pattern,atk,dtype="physical",status=null){const e=enemy(name,emo,hp,pattern,atk,dtype);if(status)e.onHitStatus=status;return e}
 const baseEncounter=encounter;
 encounter=function(elite){
  if(S.act!==2)return baseEncounter(elite);
  if(elite){
   return S.stage%2===0
    ? [act3Enemy("Żelazny Golem","🤖",82,"golem",11,"physical"),act3Enemy("Płomienny rdzeń","🔥",30,"pyromancer",7,"magic",{type:"burn",amount:2})]
    : [act3Enemy("Popielny Inkwizytor","☠️",68,"inquisitor",10,"magic",{type:"burn",amount:2}),act3Enemy("Strażnik pieczęci","🛡️",40,"warder",7,"physical")];
  }
  const pools=[
   [act3Enemy("Piromantka","🔥",34,"pyromancer",7,"magic",{type:"burn",amount:2}),act3Enemy("Popielny rycerz","🛡️",42,"warder",7,"physical")],
   [act3Enemy("Krwawy fanatyk","🩸",38,"berserker",8,"physical",{type:"bleed",amount:2}),act3Enemy("Krwawy fanatyk","🩸",34,"berserker",7,"physical",{type:"bleed",amount:1})],
   [act3Enemy("Wysysacz Otchłani","🕳️",36,"siphoner",7,"magic"),act3Enemy("Piromant","🔥",32,"pyromancer",7,"magic",{type:"burn",amount:2})],
   [act3Enemy("Strażnik pieczęci","🛡️",44,"warder",6,"physical"),act3Enemy("Krwawy fanatyk","🩸",36,"berserker",8,"physical",{type:"bleed",amount:2})]
  ];
  return pick(pools).map(e=>({...e,status:{...statusBag(e)}}));
 };

 const baseBossEncounter=bossEncounter;
 bossEncounter=function(){
  if(S.act!==2)return baseBossEncounter();
  const queen=act3Enemy("Królowa Popiołu","👑",118,"ashqueen",11,"physical");
  queen.phase=1;
  return [queen,act3Enemy("Płomienna pieczęć","🔥",38,"pyromancer",7,"magic",{type:"burn",amount:1})];
 };

 const baseIntent=intentFor;
 intentFor=function(e){
  if(e.pattern==="pyromancer"){
   const heavy=S.turn%3===0,v=scaled(e.atk+(heavy?4:0)+e.str);return{type:"attack",v,hits:heavy?2:1,label:"🔥 "+v+(heavy?"×2":""),dtype:"magic",forceTarget:"lyra"};
  }
  if(e.pattern==="berserker"){
   const enraged=e.hp/e.maxHp<=.5,v=scaled(e.atk+(enraged?5:0)+e.str);return{type:"attack",v,hits:1,label:(enraged?"🩸 Szał ":"⚔️ ")+v,dtype:"physical",forceTarget:enraged?"lyra":null};
  }
  if(e.pattern==="warder"){
   if(S.turn%3===0)return{type:"shield",v:10,label:"🛡️ pieczęć +10",dtype:"physical"};
   const v=scaled(e.atk+e.str);return{type:"attack",v,hits:1,label:"⚔️ "+v,dtype:"physical",forceTarget:"kael"};
  }
  if(e.pattern==="siphoner"){
   if(S.turn%3===0)return{type:"heal",v:12,label:"🕳️ wysysanie +12",dtype:"magic"};
   const v=scaled(e.atk+e.str);return{type:"attack",v,hits:1,label:"✨ "+v,dtype:"magic",forceTarget:"lyra"};
  }
  if(e.pattern==="inquisitor"){
   const magic=S.turn%2===0,v=scaled(e.atk+(magic?3:0)+e.str);e.onHitStatus=magic?{type:"burn",amount:2}:{type:"bleed",amount:1};return{type:"attack",v,hits:1,label:(magic?"🔥 Wyrok ":"⚔️ ")+v,dtype:magic?"magic":"physical",forceTarget:magic?"lyra":"kael"};
  }
  if(e.pattern==="golem"){
   if(S.turn%4===0)return{type:"buff",v:2,label:"🤖 przegrzanie +2",dtype:"physical"};
   if(S.turn%3===0)return{type:"shield",v:12,label:"🛡️ pancerz +12",dtype:"physical"};
   const v=scaled(e.atk+3+e.str);return{type:"attack",v,hits:1,label:"💥 "+v,dtype:"physical",forceTarget:"kael"};
  }
  if(e.pattern==="ashqueen"){
   const phase=e.hp/e.maxHp>.5?1:2;e.phase=phase;
   if(phase===1){e.onHitStatus={type:"bleed",amount:1};const v=scaled(e.atk+e.str);return{type:"attack",v,hits:S.turn%4===0?2:1,label:"👑 Faza I "+v+(S.turn%4===0?"×2":""),dtype:"physical",forceTarget:"kael"}}
   e.onHitStatus={type:"burn",amount:2};const v=scaled(e.atk+4+e.str);return{type:"attack",v,hits:S.turn%3===0?2:1,label:"🔥 Faza II "+v+(S.turn%3===0?"×2":""),dtype:"magic",forceTarget:"lyra",ignoreTaunt:true};
  }
  return baseIntent(e);
 };

 const act3Kinds=new Set(["cinderguard","bloodrush","executionarrow","ashshot","bloodbond","laststand"]);
 const basePlay=playCard;
 playCard=function(i){
  const c=S.hand[i];if(!c)return;const d=cards[c.id];if(!act3Kinds.has(d.kind))return basePlay(i);if(!playable(c))return;const t=selected();if(!t)return;
  S.energy-=d.cost;const prev=S.lastActor;if(d.actor!=="Duo"&&prev&&prev!=="Duo"&&prev!==d.actor)addSyn(10,prev+" → "+d.actor);
  if(d.actor==="Kael")S.lastKaelThisTurn=true;
  if(d.kind==="cinderguard"){const block=d.block+(hasHeroNegative("kael")?d.bonusBlock:0);S.kaelBlock+=block;log("<b>"+d.name+"</b>: +"+block+" Block Kaela.","good")}
  if(d.kind==="bloodrush"){S.momentum=Math.min(5,S.momentum+d.mom);const amt=(heroBag("kael").bleed||0)>0?d.bleedDmg:d.dmg;log("<b>"+d.name+"</b>: "+dmgEnemy(t,amt)+" dmg, +"+d.mom+" Momentum.","good")}
  if(d.kind==="executionarrow"){const amt=d.dmg+negativeCount(t)*d.statusBonus;log("<b>"+d.name+"</b>: "+dmgEnemy(t,amt)+" dmg.","good")}
  if(d.kind==="ashshot"){log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.dmg)+" dmg, Podpalenie +"+d.burn+".","good");addStatus(t,"burn",d.burn)}
  if(d.kind==="bloodbond"){log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.dmg)+" dmg, Krwawienie +"+d.bleed+".","combo");addStatus(t,"bleed",d.bleed);addSyn(d.synGain,d.name)}
  if(d.kind==="laststand"){S.kaelBlock+=d.blockEach;S.lyraBlock+=d.blockEach;const danger=S.kaelHp<S.kaelMaxHp*.5||S.lyraHp<S.lyraMaxHp*.5;if(danger){S.kaelHp=Math.min(S.kaelMaxHp,S.kaelHp+d.heal);S.lyraHp=Math.min(S.lyraMaxHp,S.lyraHp+d.heal)}log("<b>"+d.name+"</b>: +"+d.blockEach+" Block dla obojga"+(danger?", +"+d.heal+" HP.":"."),"combo")}
  S.lastActor=d.actor;S.discard.push(S.hand.splice(i,1)[0]);if(liveEnemies().length===0){victory();return}renderBattle();
 };

 const baseReward=reward;
 reward=function(tg,gold){
  if(S.act!==2)return baseReward(tg,gold);
  const themed=shuffle([...act3RewardIds]).filter(id=>(cards[id].trust||0)<=Math.max(S.trust,20)).slice(0,2);
  const normal=shuffle([...rewards]).filter(id=>!act3RewardIds.includes(id)&&(cards[id].trust||0)<=Math.max(S.trust,20)).slice(0,1);
  const pool=[...themed,...normal];
  showModal("Zwycięstwo — Cytadela Popiołu","Trust +"+tg+" • Złoto +"+gold+". Wybierz kartę — dwie nagrody są związane z tym aktem.",()=>{const wrap=document.createElement("div"),g=document.createElement("div");g.className="reward-grid";pool.forEach(id=>{const d=cards[id],b=document.createElement("button");b.className="reward";b.innerHTML='<div class="meta">'+d.actor+' • koszt '+d.cost+'</div><h3>'+d.name+'</h3><p>'+d.text+'</p>';b.onclick=()=>{S.deck.push(id);hideModal();completeBattleNode()};g.appendChild(b)});wrap.appendChild(g);wrap.appendChild(choiceBtn("Pomiń","+10 złota zamiast karty.",()=>{S.gold+=10;hideModal();completeBattleNode()}));return wrap});
 };

 const baseEvent=eventNode;
 eventNode=function(){
  if(S.act!==2)return baseEvent();
  showModal("Spalona kaplica","Pod popiołem znajduje się jeszcze aktywny ołtarz. Ciepło reaguje na amulet Lyry.",()=>grid([
   ["🔥 Przyjmij żar","Kael -6 HP, ale otrzymujesz Popielną Strzałę.",()=>{S.kaelHp=Math.max(1,S.kaelHp-6);S.deck.push("ashshot");hideModal();advance()}],
   ["🧪 Zbierz popiół","Otrzymujesz Antidotum, jeśli masz pusty slot; w innym razie +18 złota.",()=>{const e=S.potions.findIndex(x=>!x);if(e>=0)S.potions[e]="antidote";else S.gold+=18;hideModal();advance()}]
  ]));
 };
 const baseStory=storyNode;
 storyNode=function(){
  if(S.act!==2)return baseStory();
  showModal("Przed bramą","Lyra patrzy na płonące blanki cytadeli. „Jeżeli wejdziemy osobno, ona nas rozdzieli. Tym razem naprawdę musimy walczyć jak jedno.”",()=>grid([
   ["🤝 „Trzymaj się mojego cienia.”","+8 Trust i +10 startowego Synergy w następnych walkach.",()=>{S.trust=Math.min(100,S.trust+8);S.startSynergy=Math.min(40,S.startSynergy+10);saveTrust();hideModal();advance()}],
   ["🛡️ „Ja przyjmę pierwszy cios.”","+6 Trust i +12 HP Kaela.",()=>{S.trust=Math.min(100,S.trust+6);S.kaelHp=Math.min(S.kaelMaxHp,S.kaelHp+12);saveTrust();hideModal();advance()}]
  ]));
 };

 const baseRenderEnemies=renderEnemies;
 renderEnemies=function(){
  baseRenderEnemies();
  S.enemies.forEach((e,i)=>{if(e.pattern!=="ashqueen")return;const el=document.querySelectorAll(".enemy")[i];if(!el)return;const phase=document.createElement("div");phase.className="mark";phase.textContent=e.hp/e.maxHp>.5?"Faza I: nacisk na Kaela":"Faza II: magia i polowanie na Lyrę";el.appendChild(phase)});
 };
})();
