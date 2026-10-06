(()=>{
  let lastHeroState=null;

  function replayClass(el,cls,ms=420){
    if(!el)return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(()=>el.classList.remove(cls),ms);
  }

  function floatText(el,text,type="damage"){
    if(!el)return;
    const r=el.getBoundingClientRect();
    const n=document.createElement("div");
    n.className="fx-float "+type;
    n.textContent=text;
    n.style.left=(r.left+r.width/2)+"px";
    n.style.top=(r.top+Math.max(20,r.height*.35))+"px";
    document.body.appendChild(n);
    setTimeout(()=>n.remove(),760);
  }

  function enemyElement(enemy){
    const idx=S.enemies.indexOf(enemy);
    return idx<0?null:document.querySelector('.enemy[data-enemy-index="'+idx+'"]');
  }

  function heroElement(target){
    return document.getElementById(target==="lyra"?"lyraField":"kaelField");
  }

  function animateCard(uid){
    const el=document.querySelector('.card[data-card-uid="'+uid+'"]');
    if(!el)return;
    const r=el.getBoundingClientRect();
    const ghost=el.cloneNode(true);
    ghost.classList.add("card-ghost");
    ghost.classList.remove("disabled");
    ghost.style.left=r.left+"px";
    ghost.style.top=r.top+"px";
    ghost.style.width=r.width+"px";
    ghost.style.height=r.height+"px";
    document.body.appendChild(ghost);
    requestAnimationFrame(()=>requestAnimationFrame(()=>ghost.classList.add("launch")));
    setTimeout(()=>ghost.remove(),380);
  }

  const baseRenderEnemies=renderEnemies;
  renderEnemies=function(){
    baseRenderEnemies();
    document.querySelectorAll(".enemy").forEach((el,i)=>el.dataset.enemyIndex=String(i));
  };

  const baseRenderHand=renderHand;
  renderHand=function(){
    baseRenderHand();
    S.hand.forEach((c,i)=>{
      const el=document.querySelectorAll(".hand .card")[i];
      if(el)el.dataset.cardUid=c.uid;
    });
  };

  const baseDmgEnemy=dmgEnemy;
  dmgEnemy=function(enemy,amount){
    const dealt=baseDmgEnemy(enemy,amount);
    requestAnimationFrame(()=>{
      const el=enemyElement(enemy);
      replayClass(el,amount>=14?"fx-heavy":"fx-hit",420);
      floatText(el,dealt>0?"-"+dealt:"BLOCK","damage");
    });
    return dealt;
  };

  const baseDmgPlayer=dmgPlayer;
  dmgPlayer=function(amount,dtype="physical",target="kael"){
    const result=baseDmgPlayer(amount,dtype,target);
    requestAnimationFrame(()=>{
      const el=heroElement(target);
      replayClass(el,"fx-damage",360);
      floatText(el,result.hp>0?"-"+result.hp:"BLOCK","damage");
    });
    return result;
  };

  const baseAddSyn=addSyn;
  addSyn=function(n,why=""){
    const before=S.synergy;
    baseAddSyn(n,why);
    if(S.synergy>before){
      requestAnimationFrame(()=>replayClass(document.getElementById("battlefieldVisual"),"fx-combo",520));
    }
  };

  const basePop=pop;
  pop=function(msg){
    basePop(msg);
    requestAnimationFrame(()=>replayClass(document.getElementById("battlefieldVisual"),"fx-combo",520));
  };

  const basePlayCard=playCard;
  playCard=function(i){
    const c=S.hand[i];
    if(c&&playable(c))animateCard(c.uid);
    return basePlayCard(i);
  };

  const baseRenderBattle=renderBattle;
  renderBattle=function(){
    const current={kaelHp:S.kaelHp,lyraHp:S.lyraHp,kaelBlock:S.kaelBlock,lyraBlock:S.lyraBlock};
    baseRenderBattle();
    if(lastHeroState){
      if(current.kaelHp>lastHeroState.kaelHp){const el=heroElement("kael");replayClass(el,"fx-heal",500);floatText(el,"+"+(current.kaelHp-lastHeroState.kaelHp),"heal")}
      if(current.lyraHp>lastHeroState.lyraHp){const el=heroElement("lyra");replayClass(el,"fx-heal",500);floatText(el,"+"+(current.lyraHp-lastHeroState.lyraHp),"heal")}
      if(current.kaelBlock>lastHeroState.kaelBlock){const el=heroElement("kael");replayClass(el,"fx-block",420);floatText(el,"+"+(current.kaelBlock-lastHeroState.kaelBlock)+" BLOCK","block")}
      if(current.lyraBlock>lastHeroState.lyraBlock){const el=heroElement("lyra");replayClass(el,"fx-block",420);floatText(el,"+"+(current.lyraBlock-lastHeroState.lyraBlock)+" BLOCK","block")}
    }
    lastHeroState=current;
  };

  if(document.getElementById("battleScreen").classList.contains("active"))renderBattle();
})();
