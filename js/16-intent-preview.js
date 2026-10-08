(()=>{
  const css=document.createElement('style');
  css.textContent=`
    .intent-preview{margin-top:8px;padding:8px 9px;border:1px solid rgba(113,128,149,.28);border-radius:9px;background:rgba(10,14,20,.52);font-size:10px;line-height:1.4;color:#9fa9b7}.intent-preview .preview-main{display:flex;justify-content:space-between;gap:8px;align-items:center}.intent-preview .preview-main b{color:#eadfd8;font-size:11px}.intent-preview .preview-detail{margin-top:3px;color:#7f8b9a}.intent-preview .preview-warning{margin-top:5px;color:#e0a78e}.intent-preview .preview-safe{color:#8fb89c}.intent-legend{margin:8px 0 0;padding:7px 10px;border-radius:9px;border:1px solid rgba(105,120,140,.18);background:rgba(15,20,28,.45);color:#758190;font-size:9px;text-align:center}.enemy.selected .intent-preview{border-color:rgba(183,134,115,.38)}
  `;
  document.head.appendChild(css);

  function afterResistance(value,dtype,target){
    const res=totalRes(target)[dtype]||0;
    return{perHit:Math.max(0,Math.round(value*(1-res/100))),res};
  }
  function intendedTarget(e,it,protect=S.protectLyra){
    let target=targetFor(e,it),intercepted=false;
    if(target==='lyra'&&protect>0&&!it.ignoreProtect){target='kael';intercepted=true}
    return{target,intercepted};
  }
  function targetName(target){return target==='lyra'?'🏹 Lyra':'⚔️ Kael'}

  function previewIntent(e){
    const it=intentFor(e);
    if(it.type!=='attack')return{it,target:null,hp:0,afterRes:0,absorbed:0,res:0,intercepted:false};
    const resolved=intendedTarget(e,it),target=resolved.target;
    const reduced=afterResistance(it.v,it.dtype||'physical',target);
    const total=reduced.perHit*(it.hits||1);
    const block=target==='lyra'?S.lyraBlock:S.kaelBlock;
    const absorbed=Math.min(block,total);
    return{it,target,hp:Math.max(0,total-absorbed),afterRes:total,absorbed,res:reduced.res,intercepted:resolved.intercepted};
  }

  function simulateIncoming(){
    let kBlock=S.kaelBlock,lBlock=S.lyraBlock,protect=S.protectLyra,kHp=0,lHp=0;
    for(const e of liveEnemies()){
      const it=intentFor(e);if(it.type!=='attack')continue;
      let target=targetFor(e,it);
      if(target==='lyra'&&protect>0&&!it.ignoreProtect){target='kael';protect--}
      const reduced=afterResistance(it.v,it.dtype||'physical',target);
      let total=reduced.perHit*(it.hits||1);
      if(target==='kael'){
        const used=Math.min(kBlock,total);kBlock-=used;total-=used;kHp+=total;
      }else{
        const used=Math.min(lBlock,total);lBlock-=used;total-=used;lHp+=total;
      }
    }
    return{kael:kHp,lyra:lHp,kaelBlockLeft:kBlock,lyraBlockLeft:lBlock,protectLeft:protect};
  }

  const baseRenderEnemiesIntent=renderEnemies;
  renderEnemies=function(){
    baseRenderEnemiesIntent();
    S.enemies.forEach((e,i)=>{
      if(e.hp<=0)return;
      const el=document.querySelectorAll('.enemy')[i];if(!el)return;
      const p=previewIntent(e),it=p.it;
      const box=document.createElement('div');box.className='intent-preview';
      if(it.type!=='attack'){
        const labels={buff:'wzmocnienie',shield:'osłona sojusznika',heal:'leczenie sojusznika'};
        box.innerHTML=`<div class="preview-main"><span>Bez obrażeń w tej turze</span><b class="preview-safe">${labels[it.type]||'akcja specjalna'}</b></div>`;
      }else{
        const redirect=p.intercepted?' • 🛡️ Ochrona → '+targetName(p.target):'';
        const detail=`po odporności ${p.res}%: ${p.afterRes}${p.absorbed?` • Block: −${p.absorbed}`:''}`;
        const warnings=[];
        if(it.ignoreTaunt)warnings.push('omija Prowokację');
        if(it.ignoreProtect)warnings.push('omija Ochronę');
        box.innerHTML=`<div class="preview-main"><span>Cel: ${targetName(p.target)}${redirect}</span><b class="${p.hp===0?'preview-safe':''}">≈ ${p.hp} HP</b></div><div class="preview-detail">${detail}</div>${warnings.length?`<div class="preview-warning">⚠ ${warnings.join(' • ')}</div>`:''}`;
      }
      el.appendChild(box);
    });
  };

  const baseRenderBattleIntent=renderBattle;
  renderBattle=function(){
    const result=baseRenderBattleIntent();
    const inc=simulateIncoming();
    const k=document.getElementById('incomingKael'),l=document.getElementById('incomingLyra');
    if(k)k.textContent=`Nadchodzące: ${inc.kael} HP`;
    if(l)l.textContent=`Nadchodzące: ${inc.lyra} HP`;
    let legend=document.querySelector('.intent-legend');
    if(!legend){legend=document.createElement('div');legend.className='intent-legend';legend.textContent='Podgląd obrażeń uwzględnia odporność, aktualny Block i Ochronę. Nie uwzględnia kart, których jeszcze nie zagrałeś.';document.getElementById('enemies')?.after(legend)}
    return result;
  };

  window.ForbiddenIntentPreview={previewIntent,simulateIncoming};
  if(document.getElementById('battleScreen')?.classList.contains('active'))renderBattle();
})();
