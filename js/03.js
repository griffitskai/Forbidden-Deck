function renderMap(){
 renderTopBar();
 const act=currentAct(), route=act.route;
 const panel=document.querySelector('.map-panel'); if(panel) panel.dataset.act=String(act.num);
 const mapEl=$("#map"); mapEl.innerHTML="";
 $("#mapActNum").textContent="AKT "+act.num;
 $("#mapActTitle").textContent=act.title;
 $("#mapRunInfo").textContent=difficultyCfg().name+" • Lv "+S.level;
 $("#mapKaelHp").textContent="HP "+S.kaelHp+"/"+S.kaelMaxHp;
 $("#mapLyraHp").textContent="HP "+S.lyraHp+"/"+S.lyraMaxHp;
 for(let r=route.length-1;r>=0;r--){
  const row=document.createElement("div");row.className="row";
  route[r].forEach((n,i)=>{
   const b=document.createElement("button");
   const terrain=n.terrain||"plains";
   b.className="node "+terrain+" "+(n.type==="boss"?"boss":n.type==="camp"?"camp":n.type==="shop"?"shop":n.type==="story"||n.type==="event"?"story":"")+(r!==S.stage?" locked":"");
   const icon=n.icon||iconForType(n.type);
   b.innerHTML='<div class="scene"><span>'+icon+'</span></div><div class="meta"><strong>'+n.label+'</strong><span>'+sub(n.type)+'</span></div>';
   if(r===S.stage)b.onclick=()=>enterNode(n,i);
   row.appendChild(b);
  });
  mapEl.appendChild(row);
 }
 showScreen("mapScreen");
}
function enterNode(n,i){S.currentNode={...n,i};if(n.type==="battle")startBattle(encounter(false));else if(n.type==="elite")startBattle(encounter(true));else if(n.type==="boss")startBattle(bossEncounter());else if(n.type==="camp")camp();else if(n.type==="shop")shop();else if(n.type==="event")eventNode();else if(n.type==="story")storyNode()}
function enemy(name,emo,hp,pattern,atk=6,dtype="physical"){const sh=Math.max(1,Math.round(hp*difficultyCfg().enemyHp));return{name,emo,maxHp:sh,hp:sh,block:0,marked:0,pattern,atk,str:0,dtype}}
function encounter(elite){
 if(S.act===0){
  if(elite)return [enemy("Łowca głów","☠️",58,"elite",9,"physical"),enemy("Runiczna kuszniczka","🏹",28,"archer",7,"magic")];
  const pools=[
   [enemy("Bandita","🗡️",34,"bandit",6,"physical"),enemy("Łuczniczka","🏹",24,"archer",6,"physical")],
   [enemy("Wilk Alfa","🐺",33,"wolf",7,"physical"),enemy("Jadowity wilk","🐺",22,"wolf",5,"toxin"),enemy("Wilk","🐺",22,"wolf",5,"physical")],
   [enemy("Kultystka","🕯️",36,"cult",6,"magic"),enemy("Strażnik","🛡️",38,"guard",5,"physical")],
   [enemy("Najemnik","⚔️",38,"bandit",7,"physical"),enemy("Alchemiczka","☠️",26,"healer",4,"toxin")],
   [enemy("Skrytobójca","🗡️",30,"assassin",8,"physical"),enemy("Kultystka","🕯️",34,"cult",6,"magic")]
  ];return pick(pools).map(e=>({...e}));
 }
 if(elite)return [enemy("Krwawy tropiciel","🕷️",66,"assassin",10,"physical"),enemy("Bagienna wiedźma","🧙",34,"mage",8,"magic")];
 const pools=[
  [enemy("Leśny łowca","🏹",32,"archer",7,"physical"),enemy("Cierniowy strażnik","🛡️",42,"guard",6,"physical")],
  [enemy("Bagienny pająk","🕷️",24,"wolf",6,"toxin"),enemy("Jadowity pająk","🕷️",24,"wolf",6,"toxin"),enemy("Bagienna wiedźma","🧙",28,"cult",6,"magic")],
  [enemy("Korzenna bestia","🌿",40,"bandit",8,"physical"),enemy("Zielarka zarazy","☠️",28,"healer",5,"toxin")],
  [enemy("Cierniowy łucznik","🏹",30,"archer",7,"physical"),enemy("Skrytobójca mchu","🗡️",30,"assassin",9,"physical")]
 ];return pick(pools).map(e=>({...e}));
}
function bossEncounter(){return S.act===0?[enemy("Strażniczka Pogranicza","👑",82,"boss",9,"physical"),enemy("Zaklinaczka","🔮",32,"mage",7,"magic")]:[enemy("Królowa Cierni","👑",92,"boss",10,"physical"),enemy("Bagienny wyrocznia","🔮",38,"mage",8,"magic")]}
function baseIntentFor(e){const t=S.turn;if(e.pattern==="archer")return t%3===0?{type:"attack",v:e.atk+2,hits:2,label:"🏹 "+(e.atk+2)+"×2",dtype:e.dtype}:{type:"attack",v:e.atk,hits:1,label:"🏹 "+e.atk,dtype:e.dtype};if(e.pattern==="wolf")return t%3===0?{type:"attack",v:e.atk,hits:2,label:"🐺 "+e.atk+"×2",dtype:e.dtype}:{type:"attack",v:e.atk,hits:1,label:"⚔️ "+e.atk,dtype:e.dtype};if(e.pattern==="cult")return t%3===0?{type:"buff",v:2,label:"🕯️ +2 siły",dtype:"magic"}:{type:"attack",v:e.atk+e.str,hits:1,label:"✨ "+(e.atk+e.str),dtype:"magic"};if(e.pattern==="guard")return t%2===0?{type:"shield",v:8,label:"🛡️ osłona +8",dtype:"physical"}:{type:"attack",v:e.atk+e.str,hits:1,label:"⚔️ "+(e.atk+e.str),dtype:"physical"};if(e.pattern==="healer")return t%2===0?{type:"heal",v:8,label:"🌿 leczenie 8",dtype:"toxin"}:{type:"attack",v:e.atk,hits:1,label:"☠️ "+e.atk,dtype:"toxin"};if(e.pattern==="elite")return t%4===0?{type:"attack",v:14+e.str,hits:1,label:"💥 "+(14+e.str),dtype:"physical"}:{type:"attack",v:e.atk+e.str,hits:1,label:"⚔️ "+(e.atk+e.str),dtype:"physical"};if(e.pattern==="mage")return t%3===0?{type:"attack",v:e.atk+3,hits:2,label:"🔮 "+(e.atk+3)+"×2",dtype:"magic"}:{type:"attack",v:e.atk,hits:1,label:"✨ "+e.atk,dtype:"magic"};if(e.pattern==="assassin")return t%3===0?{type:"attack",v:e.atk+5,hits:1,label:"🗡️ Cień "+(e.atk+5),dtype:"physical",forceTarget:"lyra",ignoreTaunt:true,ignoreProtect:true}:{type:"attack",v:e.atk,hits:1,label:"🗡️ "+e.atk,dtype:"physical",forceTarget:"lyra"};if(e.pattern==="boss")return t%4===0?{type:"attack",v:10+e.str,hits:2,label:"👑 "+(10+e.str)+"×2",dtype:"physical"}:t%5===0?{type:"buff",v:2,label:"👑 +2 siły",dtype:"physical"}:{type:"attack",v:e.atk+e.str,hits:1,label:"⚔️ "+(e.atk+e.str),dtype:"physical"};return t%3===0?{type:"attack",v:e.atk+4+e.str,hits:1,label:"💥 "+(e.atk+4+e.str),dtype:e.dtype}:{type:"attack",v:e.atk+e.str,hits:1,label:"⚔️ "+(e.atk+e.str),dtype:e.dtype}}
function intentFor(e){const it=baseIntentFor(e);if(it.type==="attack"){const m=difficultyCfg().enemyDmg;it.v=Math.max(1,Math.round(it.v*m));const ico=it.label.split(" ")[0],hits=it.hits||1;it.label=ico+" "+it.v+(hits>1?"×"+hits:"")}return it}
function startBattle(enemies){S.enemies=enemies;S.target=0;S.kaelBlock=0;S.lyraBlock=0;S.energy=3+S.firstTurnEnergy;S.synergy=S.startSynergy;S.momentum=0;S.turn=1;S.discard=[];S.hand=[];S.taunt=0;S.protectLyra=0;S.draw=shuffle(S.deck.map((id,i)=>({id,uid:id+"_"+i+"_"+Math.random()})));S.lastActor=null;S.lastKaelThisTurn=false;S.battleOver=false;S.tempRes={physical:0,magic:0,toxin:0};$("#log").innerHTML="";draw(5,false);log("Walka rozpoczyna się.","info");showScreen("battleScreen");renderBattle()}
function draw(n,rer=true){for(let i=0;i<n;i++){if(!S.draw.length){if(!S.discard.length)break;S.draw=shuffle(S.discard.splice(0));log("Przetasowanie stosu odrzuconych.","info")}S.hand.push(S.draw.pop())}if(rer)renderBattle()}
function log(msg,c=""){const d=document.createElement("div");d.className=c;d.innerHTML=msg;$("#log").appendChild(d);$("#log").scrollTop=$("#log").scrollHeight;const la=$("#lastAction");if(la)la.textContent=msg.replace(/<[^>]*>/g,"")}
function pop(msg){const p=$("#comboPop");p.textContent=msg;p.classList.remove("show");void p.offsetWidth;p.classList.add("show")}
function addSyn(n,why=""){const old=S.synergy;S.synergy=Math.min(100,S.synergy+n);if(S.synergy>old){log("Synergy +"+n+(why?" — "+why:""),"combo");if(n>=15)pop("COMBO +"+n+" SYNERGY")}}
function selected(){if(!S.enemies[S.target]||S.enemies[S.target].hp<=0)S.target=S.enemies.findIndex(e=>e.hp>0);return S.enemies[S.target]}
function dmgEnemy(e,n){let left=n;if(e.block>0){const a=Math.min(left,e.block);e.block-=a;left-=a}e.hp=Math.max(0,e.hp-left);return left}
function dmgPlayer(n,dtype="physical",target="kael"){const r=totalRes(target)[dtype]||0,reduced=Math.max(0,Math.round(n*(1-r/100)));let left=reduced;if(target==="kael"){if(S.kaelBlock>0){const a=Math.min(left,S.kaelBlock);S.kaelBlock-=a;left-=a}S.kaelHp=Math.max(0,S.kaelHp-left)}else{if(S.lyraBlock>0){const a=Math.min(left,S.lyraBlock);S.lyraBlock-=a;left-=a}S.lyraHp=Math.max(0,S.lyraHp-left)}return{hp:left,reducedBy:n-reduced,res:r,target}}
function targetFor(e,it){if(it.type!=="attack")return null;if(it.forceTarget)return it.forceTarget;if(S.taunt>0&&!it.ignoreTaunt)return "kael";if(e.pattern==="boss"||e.pattern==="guard"||e.pattern==="elite")return "kael";if(e.pattern==="mage"||e.pattern==="healer")return "lyra";return((S.turn+e.name.length)%2===0)?"kael":"lyra"}
function resolveProtectedTarget(target,it){if(target==="lyra"&&S.protectLyra>0&&!it.ignoreProtect){S.protectLyra--;log("<b>Kael przechwytuje atak wymierzony w Lyrę!</b>","combo");return "kael"}return target}
function playable(c){const d=cards[c.id];if(S.battleOver||d.cost>S.energy)return false;if((d.trust||0)>S.trust)return false;if((d.syn||0)>S.synergy)return false;return true}
