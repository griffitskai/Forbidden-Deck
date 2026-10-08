(()=>{
  const HISTORY_KEY='forbidden_deck_history_v1';
  const SCHEMA=1;
  const MAX_RUNS=10;
  const BOSS_NAMES=['Strażniczka Pogranicza','Królowa Cierni','Królowa Popiołu'];
  let recordedCurrentRun=false;

  const style=document.createElement('style');
  style.textContent=`
    .history-screen{position:fixed;inset:0;z-index:1260;background:#0b1017;display:none;overflow:auto;padding:28px}.history-screen.show{display:block}
    .history-shell{max-width:1120px;margin:auto}.history-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:22px}.history-head h2{margin:0;color:#eee4dd;font-size:28px}.history-head p{margin:6px 0 0;color:#8e98a7;font-size:12px}
    .history-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}.history-stat{border:1px solid #303948;border-radius:14px;background:#141a24;padding:15px}.history-stat span{display:block;color:#818b99;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.history-stat b{display:block;color:#eee4dd;font-size:24px;margin-top:5px}
    .boss-progress{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:22px}.boss-memory{border:1px solid #303948;border-radius:14px;background:#121821;padding:14px;color:#d9d4d0}.boss-memory.locked{opacity:.42;filter:saturate(.2)}.boss-memory strong{display:block;margin-bottom:5px}.boss-memory span{font-size:10px;color:#8e98a7}
    .run-history{display:grid;gap:10px}.run-entry{display:grid;grid-template-columns:64px 1fr auto;gap:14px;align-items:center;border:1px solid #303948;border-radius:14px;background:linear-gradient(180deg,#161d27,#111720);padding:14px}.run-entry.win{border-color:rgba(142,108,79,.55)}.run-result{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#202735;font-size:24px}.run-main strong{display:block;color:#e8dfd8;font-size:14px}.run-main small{display:block;color:#8e98a7;margin-top:4px}.run-main p{margin:7px 0 0;color:#aeb5c0;font-size:11px}.run-side{text-align:right}.run-side b{display:block;color:#dfd3ce;font-size:13px}.run-side span{display:block;color:#7f8998;font-size:10px;margin-top:4px}.history-empty{border:1px dashed #384251;border-radius:14px;padding:28px;text-align:center;color:#84909f;background:#111720}
    @media(max-width:760px){.history-stats{grid-template-columns:1fr 1fr}.boss-progress{grid-template-columns:1fr}.run-entry{grid-template-columns:48px 1fr}.run-result{width:44px;height:44px}.run-side{grid-column:2;text-align:left;display:flex;gap:12px}.history-screen{padding:14px}}
  `;
  document.head.appendChild(style);

  function emptyData(){return{schema:SCHEMA,runs:[],bosses:[],stats:{totalRuns:0,completedRuns:0,bossKills:0,bestAct:0,bestTrust:0}}}
  function load(){
    try{
      const raw=JSON.parse(localStorage.getItem(HISTORY_KEY)||'null');
      if(!raw||raw.schema!==SCHEMA)return emptyData();
      return{
        schema:SCHEMA,
        runs:Array.isArray(raw.runs)?raw.runs.slice(0,MAX_RUNS):[],
        bosses:Array.isArray(raw.bosses)?raw.bosses:[],
        stats:{...emptyData().stats,...(raw.stats||{})}
      };
    }catch{return emptyData()}
  }
  function save(data){
    try{localStorage.setItem(HISTORY_KEY,JSON.stringify(data))}catch(error){console.warn('Forbidden Deck: nie udało się zapisać historii',error)}
  }

  function inferBuild(deck=S.deck||[]){
    const ids=deck.map(id=>String(id).replace(/\+$/,''));
    let duo=0,status=0,defense=0;
    ids.forEach(id=>{
      const d=cards[id];if(!d)return;
      if(d.actor==='Duo')duo++;
      if(['bleedattack','poisonattack','burnattack','weakattack','cleanse'].includes(d.kind)||['Krwawienie','Trucizna','Podpalenie','Osłabienie','Status'].includes(d.tag))status++;
      if(['block','taunt','cover','intercept','rally','protect','ironwall','guardedadvance','laststand','cinderguard'].includes(d.kind)||['Tank','Block'].includes(d.tag))defense++;
    });
    if(status>=5&&status>=duo)return'Statusy';
    if(duo>=Math.max(5,status+1))return'Duo / Synergy';
    if(defense>=6)return'Obrona';
    return'Hybryda';
  }

  function recordBoss(name){
    if(!name)return;
    const data=load();
    if(!data.bosses.includes(name))data.bosses.push(name);
    data.stats.bossKills=(data.stats.bossKills||0)+1;
    save(data);
  }

  function makeRunSnapshot(victory){
    const actIndex=Math.max(0,Math.min(ACTS.length-1,S.act||0));
    const actReached=actIndex+1;
    const completedBosses=victory?ACTS.length:actIndex;
    return{
      id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      date:new Date().toISOString(),
      result:victory?'victory':'defeat',
      version:'V0.9',
      difficulty:S.difficulty||'standard',
      act:actReached,
      actTitle:ACTS[actIndex]?.title||'Pogranicze',
      wins:S.wins||0,
      level:S.level||1,
      trust:S.trust||0,
      deckSize:(S.deck||[]).length,
      gold:S.gold||0,
      build:inferBuild(),
      kaelHp:Math.max(0,S.kaelHp||0),
      lyraHp:Math.max(0,S.lyraHp||0),
      bosses:BOSS_NAMES.slice(0,completedBosses)
    };
  }

  function recordRun(victory){
    if(recordedCurrentRun)return null;
    const run=makeRunSnapshot(!!victory),data=load();
    data.runs.unshift(run);data.runs=data.runs.slice(0,MAX_RUNS);
    data.stats.totalRuns=(data.stats.totalRuns||0)+1;
    if(victory)data.stats.completedRuns=(data.stats.completedRuns||0)+1;
    data.stats.bestAct=Math.max(data.stats.bestAct||0,run.act);
    data.stats.bestTrust=Math.max(data.stats.bestTrust||0,run.trust);
    save(data);recordedCurrentRun=true;
    return run;
  }

  const screen=document.createElement('div');
  screen.id='historyScreen';screen.className='history-screen';
  screen.innerHTML='<div class="history-shell"><div class="history-head"><div><h2>Historia wypraw</h2><p>To kronika Twoich runów — bez bonusów do statystyk za sam grind.</p></div><button class="btn" id="historyBack">← Wróć</button></div><div id="historyBody"></div></div>';
  document.body.appendChild(screen);

  const actions=document.querySelector('#startScreen .start-actions');
  if(actions&&!document.getElementById('menuHistory')){
    const b=document.createElement('button');b.className='start-action';b.id='menuHistory';
    b.innerHTML='<strong>⌛ Historia wypraw</strong><span>Ostatnie runy, buildy i pokonani bossowie.</span>';
    actions.appendChild(b);
  }

  function difficultyName(id){return DIFFICULTIES[id]?.name||id||'Standard'}
  function formatDate(iso){try{return new Intl.DateTimeFormat('pl-PL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(iso))}catch{return'—'}}
  function render(){
    const data=load(),s=data.stats;
    const bossHtml=BOSS_NAMES.map((name,i)=>{
      const unlocked=data.bosses.includes(name);
      return`<div class="boss-memory ${unlocked?'':'locked'}"><strong>${unlocked?'👑 '+name:'🔒 Nieodkryty boss'}</strong><span>${unlocked?'Pokonany co najmniej raz.':'Akt '+(i+1)+' — pokonaj go, aby zapisać w kronice.'}</span></div>`;
    }).join('');
    const runs=data.runs.length?data.runs.map(r=>`<article class="run-entry ${r.result==='victory'?'win':''}"><div class="run-result">${r.result==='victory'?'🏆':'⚔️'}</div><div class="run-main"><strong>${r.result==='victory'?'Ukończony run':'Wyprawa zakończona'} • ${r.build}</strong><small>Akt ${r.act} — ${r.actTitle} • ${difficultyName(r.difficulty)} • ${formatDate(r.date)}</small><p>${r.wins} wygranych walk • Lv ${r.level} • Trust ${r.trust} • talia ${r.deckSize}</p></div><div class="run-side"><b>K ${r.kaelHp} • L ${r.lyraHp}</b><span>${r.gold} złota • ${r.version}</span></div></article>`).join(''):'<div class="history-empty">Nie ma jeszcze zakończonych wypraw. Pierwszy wynik pojawi się tutaj po zwycięstwie albo porażce.</div>';
    document.getElementById('historyBody').innerHTML=`<div class="history-stats"><div class="history-stat"><span>Runy</span><b>${s.totalRuns}</b></div><div class="history-stat"><span>Ukończone</span><b>${s.completedRuns}</b></div><div class="history-stat"><span>Najdalszy akt</span><b>${s.bestAct||'—'}</b></div><div class="history-stat"><span>Pokonani bossowie</span><b>${data.bosses.length}/3</b></div></div><div class="boss-progress">${bossHtml}</div><div class="run-history">${runs}</div>`;
  }
  function open(){window.ForbiddenDeckMenu?.close?.();render();screen.classList.add('show')}
  function close(){screen.classList.remove('show');window.ForbiddenDeckMenu?.open?.()}
  document.getElementById('menuHistory').onclick=open;
  document.getElementById('historyBack').onclick=close;

  const baseVictory=victory;
  victory=function(){
    if(S.currentNode?.type==='boss')recordBoss(S.currentNode.label);
    return baseVictory();
  };
  const baseRunComplete=runComplete;
  runComplete=function(){recordRun(true);return baseRunComplete()};
  const baseDefeat=defeat;
  defeat=function(){recordRun(false);return baseDefeat()};
  const baseNewRun=newRun;
  newRun=function(diff=S.difficulty){recordedCurrentRun=false;return baseNewRun(diff)};

  window.ForbiddenDeckHistory={load,recordBoss,recordRun,inferBuild,open,render,clear:()=>{localStorage.removeItem(HISTORY_KEY);recordedCurrentRun=false;render()}};
})();
