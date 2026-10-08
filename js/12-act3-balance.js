(()=>{
  function scaled(v){return Math.max(1,Math.round(v*difficultyCfg().enemyDmg))}
  function mk(name,emo,hp,pattern,atk,dtype="physical",status=null){
    const e=enemy(name,emo,hp,pattern,atk,dtype);
    if(status)e.onHitStatus=status;
    return e;
  }

  const baseEncounterBalance=encounter;
  encounter=function(elite){
    if(S.act!==2)return baseEncounterBalance(elite);
    if(elite)return baseEncounterBalance(true);

    if(S.stage===0){
      return [
        mk("Popielny rycerz","🛡️",38,"warder",6,"physical"),
        mk("Kapłanka żaru","🕯️",28,"emberpriest",5,"magic")
      ];
    }
    if(S.stage===3){
      return [
        mk("Popielny skrytobójca","🗡️",29,"ashassassin",6,"physical",{type:"bleed",amount:1}),
        mk("Krwawy fanatyk","🩸",34,"berserker",7,"physical",{type:"bleed",amount:1})
      ];
    }
    if(S.stage===5){
      return [
        mk("Piromantka","🔥",31,"pyromancer",6,"magic",{type:"burn",amount:1}),
        mk("Kapłanka żaru","🕯️",30,"emberpriest",5,"magic")
      ];
    }
    if(S.stage===6){
      return [
        mk("Popielny skrytobójca","🗡️",31,"ashassassin",7,"physical",{type:"bleed",amount:1}),
        mk("Strażnik pieczęci","🛡️",40,"warder",6,"physical")
      ];
    }
    return baseEncounterBalance(false);
  };

  const baseIntentBalance=intentFor;
  intentFor=function(e){
    if(e.pattern==="ashassassin"){
      const heavy=S.turn%3===0;
      const v=scaled(e.atk+(heavy?2:0)+e.str);
      return {
        type:"attack",
        v,
        hits:heavy?2:1,
        label:"🗡️ "+v+(heavy?"×2":""),
        dtype:"physical",
        forceTarget:"lyra",
        ignoreTaunt:true,
        ignoreProtect:heavy
      };
    }
    if(e.pattern==="emberpriest"){
      if(S.turn%4===0)return{type:"heal",v:10,label:"🕯️ leczenie +10",dtype:"magic"};
      if(S.turn%3===0)return{type:"shield",v:8,label:"🛡️ żarząca osłona +8",dtype:"magic"};
      const v=scaled(e.atk+e.str);
      return{type:"attack",v,hits:1,label:"✨ "+v,dtype:"magic",forceTarget:"lyra"};
    }
    if(e.pattern==="ashqueen"&&e.hp/e.maxHp<=.5){
      if(e._phase2EntryTurn==null)e._phase2EntryTurn=S.turn;
      if(S.turn===e._phase2EntryTurn){
        e.onHitStatus=null;
        return{type:"shield",v:10,label:"🔥 Korona popiołu — Faza II +10",dtype:"magic"};
      }
    }
    return baseIntentBalance(e);
  };

  function addPotion(id){
    let slot=S.potions.findIndex(x=>!x);
    if(slot>=0){S.potions[slot]=id;return true}
    return false;
  }

  function enterActThree(kind){
    S.act++;
    S.stage=0;
    S.act3Prep=kind;
    const heal=(n)=>{
      S.kaelHp=Math.min(S.kaelMaxHp,S.kaelHp+n);
      S.lyraHp=Math.min(S.lyraMaxHp,S.lyraHp+n);
    };
    if(kind==="supplies"){
      heal(20);
      if(!addPotion("heal"))heal(4);
    }else if(kind==="wards"){
      heal(12);
      const a=addPotion("ward"),b=addPotion("antidote");
      if(!a&&!b)heal(6);
    }else{
      heal(12);
      S.startSynergy=Math.min(40,(S.startSynergy||0)+10);
      S.firstTurnEnergy=1;
    }
    hideModal();
    renderMap();
  }

  const baseActTransitionBalance=actTransition;
  actTransition=function(){
    const next=ACTS[S.act+1];
    if(S.act===1&&next&&next.num===3){
      showModal(
        "Przed Cytadelą Popiołu",
        "Po dwóch aktach drużyna ma chwilę na przygotowanie. Wybierz wsparcie pod swój build — nie ma jednej poprawnej opcji.",
        ()=>grid([
          ["🧪 Zapasy medyka","+20 HP dla obojga i Mikstura leczenia, jeśli masz pusty slot.",()=>enterActThree("supplies")],
          ["✨ Zestaw ochronny","+12 HP dla obojga oraz Ward/Antidotum do wolnych slotów.",()=>enterActThree("wards")],
          ["🤝 Plan taktyczny","+12 HP dla obojga, +10 początkowego Synergy i +1 energii w pierwszej turze.",()=>enterActThree("tactics")]
        ])
      );
      return;
    }
    return baseActTransitionBalance();
  };

  const baseRenderEnemiesBalance=renderEnemies;
  renderEnemies=function(){
    baseRenderEnemiesBalance();
    S.enemies.forEach((e,i)=>{
      const el=document.querySelectorAll(".enemy")[i];
      if(!el||e.hp<=0)return;
      let role="";
      if(e.pattern==="ashassassin")role="🎯 Poluje na Lyrę • ciężki cios omija Ochronę";
      if(e.pattern==="emberpriest")role="🕯️ Wsparcie • leczy i osłania sojuszników";
      if(e.pattern==="ashqueen"&&e.hp/e.maxHp<=.5)role="🔥 FAZA II • magia • priorytet: Lyra";
      if(role){
        const tag=document.createElement("div");
        tag.className="act3-role";
        tag.textContent=role;
        el.appendChild(tag);
      }
    });
  };

  window.ForbiddenAct3Balance={enterActThree};
})();
