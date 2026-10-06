(()=>{
 const style=document.createElement("link");style.rel="stylesheet";style.href="css/status.css";document.head.appendChild(style);

 const STATUS_META={bleed:{icon:"🩸",label:"Krwawienie"},poison:{icon:"☠️",label:"Trucizna"},burn:{icon:"🔥",label:"Podpalenie"},weak:{icon:"⬇️",label:"Osłabienie"}};
 const blankStatus=()=>({bleed:0,poison:0,burn:0,weak:0});
 function ensureEnemyStatus(e){if(!e.status)e.status=blankStatus();return e.status}
 function ensureHeroStatus(){if(!S.heroStatus)S.heroStatus={kael:blankStatus(),lyra:blankStatus()};return S.heroStatus}
 function addEnemyStatus(e,type,amount){const st=ensureEnemyStatus(e);st[type]=Math.min(12,(st[type]||0)+amount);log(STATUS_META[type].icon+" "+e.name+": "+STATUS_META[type].label+" +"+amount,"combo")}
 function addHeroStatus(target,type,amount){const st=ensureHeroStatus()[target];st[type]=Math.min(12,(st[type]||0)+amount);log(STATUS_META[type].icon+" "+(target==="kael"?"Kael":"Lyra")+": "+STATUS_META[type].label+" +"+amount,"bad")}
 function clearHeroStatus(type=null){const hs=ensureHeroStatus();["kael","lyra"].forEach(h=>{if(type)hs[h][type]=0;else Object.keys(hs[h]).forEach(k=>hs[h][k]=0)})}
 function statusBadges(st){return Object.entries(STATUS_META).filter(([k])=>st&&st[k]>0).map(([k,m])=>'<span class="status-badge '+k+'" title="'+m.label+'">'+m.icon+' '+st[k]+'</span>').join("")}

 Object.assign(cards,{
  deepcut:{name:"Głębokie cięcie",actor:"Kael",cost:1,text:"4 dmg i +2 Krwawienie.",kind:"bleedattack",dmg:4,statusAmount:2,tag:"Krwawienie"},
  venomarrow:{name:"Jadowita strzała",actor:"Lyra",cost:1,text:"4 dmg i +3 Trucizna.",kind:"poisonattack",dmg:4,statusAmount:3,tag:"Trucizna"},
  firearrow:{name:"Płonąca strzała",actor:"Lyra",cost:2,text:"7 dmg i +2 Podpalenie.",kind:"burnattack",dmg:7,statusAmount:2,tag:"Podpalenie"},
  hamstring:{name:"Podcięcie",actor:"Kael",cost:1,text:"5 dmg i +2 Osłabienie.",kind:"weakattack",dmg:5,statusAmount:2,tag:"Osłabienie"},
  purify:{name:"Oczyszczająca więź",actor:"Duo",cost:1,text:"Usuń negatywne statusy z obojga. +4 Block dla Kaela i Lyry.",kind:"cleanse",blockEach:4,trust:20,tag:"Oczyszczenie"}
 });
 Object.assign(UPGRADES,{
  deepcut:{dmg:6,statusAmount:3,text:"6 dmg i +3 Krwawienie."},
  venomarrow:{dmg:5,statusAmount:4,text:"5 dmg i +4 Trucizna."},
  firearrow:{dmg:9,statusAmount:3,text:"9 dmg i +3 Podpalenie."},
  hamstring:{dmg:7,statusAmount:3,text:"7 dmg i +3 Osłabienie."},
  purify:{blockEach:7,text:"Usuń negatywne statusy z obojga. +7 Block dla Kaela i Lyry."}
 });
 ["deepcut","venomarrow","firearrow","hamstring","purify"].forEach(id=>{cards[id+"+"]={...cards[id],...UPGRADES[id],name:cards[id].name+"+",upgraded:true};if(!rewards.includes(id))rewards.push(id)});

 function statusEnemy(name,emo,hp,pattern,atk,dtype,type,amount){const e=enemy(name,emo,hp,pattern,atk,dtype);e.onHitStatus={type,amount};ensureEnemyStatus(e);return e}
 const baseEncounter=encounter;
 encounter=function(elite){
  if(S.act!==1||elite)return baseEncounter(elite);
  const pools=[
   [statusEnemy("Krwawy łowca","🩸",35,"assassin",8,"physical","bleed",2),enemy("Cierniowy strażnik","🛡️",38,"guard",6,"physical")],
   [statusEnemy("Trująca matrona","☠️",32,"healer",5,"toxin","poison",2),enemy("Bagienny pająk","🕷️",26,"wolf",6,"toxin")],
   [statusEnemy("Żagiewka","🔥",30,"mage",7,"magic","burn",2),enemy("Korzenna bestia","🌿",38,"bandit",7,"physical")],
   [statusEnemy("Hexer","⬇️",34,"cult",6,"magic","weak",2),enemy("Skrytobójca mchu","🗡️",28,"assassin",8,"physical")]
  ];
  return pools[S.stage%pools.length].map(e=>({...e,status:{...ensureEnemyStatus(e)}}));
 };

 const baseStartBattle=startBattle;
 startBattle=function(enemies){
  enemies.forEach(ensureEnemyStatus);S.heroStatus={kael:blankStatus(),lyra:blankStatus()};S.activeActor=null;
  return baseStartBattle(enemies);
 };

 const baseIntentFor=intentFor;
 intentFor=function(e){
  const it=baseIntentFor(e);const st=ensureEnemyStatus(e);
  if(it.type==="attack"&&st.weak>0){
   it.v=Math.max(1,Math.round(it.v*.75));
   const ico=it.label.split(" ")[0],hits=it.hits||1;it.label=ico+" "+it.v+(hits>1?"×"+hits:"")+" ⬇️";
  }
  return it;
 };

 const baseDmgEnemyStatus=dmgEnemy;
 dmgEnemy=function(e,amount){
  const hs=ensureHeroStatus();let weak=0;
  if(S.activeActor==="Kael")weak=hs.kael.weak||0;
  else if(S.activeActor==="Lyra")weak=hs.lyra.weak||0;
  else if(S.activeActor==="Duo")weak=Math.max(hs.kael.weak||0,hs.lyra.weak||0);
  const adjusted=weak>0?Math.max(1,Math.round(amount*.75)):amount;
  return baseDmgEnemyStatus(e,adjusted);
 };

 function playStatusCard(i,d,c,t){
  if(!playable(c))return;
  S.energy-=d.cost;
  const prev=S.lastActor;if(d.actor!=="Duo"&&prev&&prev!=="Duo"&&prev!==d.actor)addSyn(10,prev+" → "+d.actor);
  S.activeActor=d.actor;
  if(d.actor==="Kael")S.lastKaelThisTurn=true;
  if(d.kind==="bleedattack"){log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.dmg)+" dmg.","good");addEnemyStatus(t,"bleed",d.statusAmount)}
  if(d.kind==="poisonattack"){log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.dmg)+" dmg.","good");addEnemyStatus(t,"poison",d.statusAmount)}
  if(d.kind==="burnattack"){log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.dmg)+" dmg.","good");addEnemyStatus(t,"burn",d.statusAmount)}
  if(d.kind==="weakattack"){log("<b>"+d.name+"</b>: "+dmgEnemy(t,d.dmg)+" dmg.","good");addEnemyStatus(t,"weak",d.statusAmount)}
  if(d.kind==="cleanse"){clearHeroStatus();S.kaelBlock+=d.blockEach;S.lyraBlock+=d.blockEach;addSyn(8,"oczyszczenie duetu");log("<b>"+d.name+"</b>: statusy usunięte, +"+d.blockEach+" Block dla obojga.","combo")}
  S.activeActor=null;S.lastActor=d.actor;S.discard.push(S.hand.splice(i,1)[0]);if(liveEnemies().length===0){victory();return}renderBattle();
 }
 const baseStatusPlayCard=playCard;
 playCard=function(i){
  const c=S.hand[i];if(!c)return;const d=cards[c.id];
  if(["bleedattack","poisonattack","burnattack","weakattack","cleanse"].includes(d.kind)){const t=selected();if(!t)return;return playStatusCard(i,d,c,t)}
  S.activeActor=d.actor;const result=baseStatusPlayCard(i);S.activeActor=null;return result;
 };

 function tickEnemyStatus(e,type,mult=1){const st=ensureEnemyStatus(e),amount=st[type]||0;if(amount<=0||e.hp<=0)return 0;const dealt=dmgEnemy(e,amount*mult);log(STATUS_META[type].icon+" "+e.name+" otrzymuje "+dealt+" obrażeń od statusu.","combo");st[type]=Math.max(0,amount-1);return dealt}
 function heroStatusDamage(target,type,mult=1){const hs=ensureHeroStatus()[target],amount=hs[type]||0;if(amount<=0)return 0;const dtype=type==="poison"?"toxin":type==="burn"?"magic":"physical",res=totalRes(target)[dtype]||0;const raw=amount*mult,dmg=Math.max(1,Math.round(raw*(1-res/100)));if(target==="kael")S.kaelHp=Math.max(0,S.kaelHp-dmg);else S.lyraHp=Math.max(0,S.lyraHp-dmg);hs[type]=Math.max(0,amount-1);log(STATUS_META[type].icon+" "+(target==="kael"?"Kael":"Lyra")+" otrzymuje "+dmg+" obrażeń od "+STATUS_META[type].label.toLowerCase()+".","bad");return dmg}

 endTurn=function(){
  if(S.battleOver)return;S.hand.splice(0).forEach(c=>S.discard.push(c));
  heroStatusDamage("kael","poison");heroStatusDamage("lyra","poison");
  liveEnemies().forEach(e=>tickEnemyStatus(e,"poison"));
  if(S.kaelHp<=0||S.lyraHp<=0){defeat();return}if(liveEnemies().length===0){victory();return}
  for(const e of [...liveEnemies()]){
   if(e.hp<=0)continue;const it=intentFor(e);
   if(it.type==="attack"){
    let target=resolveProtectedTarget(targetFor(e,it),it),total=0,reduced=0,hpDamage=0;
    for(let h=0;h<(it.hits||1);h++){const rr=dmgPlayer(it.v,it.dtype||"physical",target);total+=rr.hp;hpDamage+=rr.hp;reduced+=rr.reducedBy}
    const who=target==="kael"?"Kaela":"Lyrę";log(e.name+" atakuje "+who+" ("+damageLabel(it.dtype||"physical")+"): <b>"+total+"</b> dmg"+(reduced>0?" • odporność -"+reduced:"")+".","bad");
    if(hpDamage>0&&e.onHitStatus)addHeroStatus(target,e.onHitStatus.type,e.onHitStatus.amount);
   }else if(it.type==="buff"){e.str+=it.v;log(e.name+" zyskuje +"+it.v+" siły.","bad")}
   else if(it.type==="shield"){const ally=liveEnemies().slice().sort((a,b)=>a.hp-b.hp)[0];if(ally){ally.block+=it.v;log(e.name+" osłania "+ally.name+" (+"+it.v+" Block).","bad")}}
   else if(it.type==="heal"){const ally=liveEnemies().slice().sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];if(ally){ally.hp=Math.min(ally.maxHp,ally.hp+it.v);log(e.name+" leczy "+ally.name+" o "+it.v+".","bad")}}
   tickEnemyStatus(e,"bleed");
   if(S.kaelHp<=0||S.lyraHp<=0){defeat();return}
  }
  liveEnemies().forEach(e=>tickEnemyStatus(e,"burn",2));
  heroStatusDamage("kael","bleed");heroStatusDamage("lyra","bleed");heroStatusDamage("kael","burn",2);heroStatusDamage("lyra","burn",2);
  if(S.kaelHp<=0||S.lyraHp<=0){defeat();return}if(liveEnemies().length===0){victory();return}
  liveEnemies().forEach(e=>{if(e.marked>0)e.marked--;if(e.status&&e.status.weak>0)e.status.weak--});
  const hs=ensureHeroStatus();["kael","lyra"].forEach(h=>{if(hs[h].weak>0)hs[h].weak--});
  S.kaelBlock=0;S.lyraBlock=0;S.taunt=0;S.energy=3;S.turn++;S.lastActor=null;S.lastKaelThisTurn=false;draw(5,false);log("— Tura "+S.turn+" —","info");renderBattle();
 };

 const baseStatusRenderEnemies=renderEnemies;
 renderEnemies=function(){
  baseStatusRenderEnemies();
  S.enemies.forEach((e,i)=>{const el=document.querySelectorAll(".enemy")[i];if(!el)return;const row=document.createElement("div");row.className="status-row enemy-status-row";row.innerHTML=statusBadges(ensureEnemyStatus(e));if(row.innerHTML)el.appendChild(row)});
 };
 const baseStatusRenderBattle=renderBattle;
 renderBattle=function(){
  baseStatusRenderBattle();
  const hs=ensureHeroStatus();
  [["kaelField","kael"],["lyraField","lyra"]].forEach(([id,h])=>{const el=document.getElementById(id);if(!el)return;let row=el.querySelector(".hero-status-row");if(!row){row=document.createElement("div");row.className="status-row hero-status-row";el.appendChild(row)}row.innerHTML=statusBadges(hs[h])});
 };

 const baseStatusUsePotion=usePotion;
 usePotion=function(slot){const id=S.potions[slot];if(id==="antidote"){clearHeroStatus("poison");log("Antidotum usuwa Truciznę z Kaela i Lyry.","good")}if(id==="ward"){clearHeroStatus("burn");log("Eliksir odporności gasi Podpalenie u obojga.","good")}return baseStatusUsePotion(slot)};
})();
