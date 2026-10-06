function loadTrust(){try{return Math.max(0,Math.min(100,Number(localStorage.getItem("fd08_trust")||0)))}catch(e){return 0}}
function saveTrust(){try{localStorage.setItem("fd08_trust",String(S.trust))}catch(e){}}
function trustRank(v){return v>=80?"Więź":v>=60?"Zaufanie":v>=40?"Zgrani":v>=20?"Towarzysze":"Nieznajomi"}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function pick(a){return a[Math.floor(Math.random()*a.length)]}
function liveEnemies(){return S.enemies.filter(e=>e.hp>0)}
function damageLabel(t){return t==="magic"?"✨ magia":t==="toxin"?"☠️ toksyny":"⚔️ fizyczne"}
function totalRes(target="kael"){const r={physical:0,magic:0,toxin:0};const armor=S.equipment.armor,amulet=S.equipment.amulet;if(target==="kael"&&armor&&gearDefs[armor])Object.keys(r).forEach(k=>r[k]+=gearDefs[armor].res[k]||0);if(amulet&&gearDefs[amulet])Object.keys(r).forEach(k=>r[k]+=gearDefs[amulet].res[k]||0);Object.keys(r).forEach(k=>r[k]=Math.min(60,r[k]+(S.tempRes[k]||0)));return r}
function top(){$("#topHp").textContent="K "+S.kaelHp+"/"+S.kaelMaxHp+" • L "+S.lyraHp+"/"+S.lyraMaxHp;$("#topGold").textContent=S.gold;$("#topTrust").textContent=S.trust+" "+trustRank(S.trust);$("#topLevel").textContent="Lv "+S.level+" ("+S.xp+"/2)";$("#topDifficulty").textContent=difficultyCfg().name;$("#topDeck").textContent=S.deck.length;const mk=$("#mapKaelHp"),ml=$("#mapLyraHp"),mi=$("#mapRunInfo");if(mk)mk.textContent="HP "+S.kaelHp+"/"+S.kaelMaxHp;if(ml)ml.textContent="HP "+S.lyraHp+"/"+S.lyraMaxHp;if(mi)mi.textContent=difficultyCfg().name+" • Lv "+S.level}
function showScreen(id){document.querySelectorAll(".screen").forEach(x=>x.classList.remove("active"));$("#"+id).classList.add("active");const b=$("#logToggle");if(b)b.style.display=id==="battleScreen"?"block":"none";if(id!=="battleScreen"){const d=$("#combatDrawer");if(d)d.classList.remove("open")}}
function iconForType(t){return {battle:"⚔️",elite:"☠️",camp:"🔥",shop:"🛒",event:"❓",story:"💬",boss:"👑"}[t]}
function sub(t){return {battle:"walka",elite:"elita + sprzęt",camp:"ognisko",shop:"sklep",event:"wydarzenie",story:"relacja",boss:"boss aktu"}[t]}
