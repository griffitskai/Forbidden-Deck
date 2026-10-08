(()=>{
  const KEY='forbidden_deck_tutorial_v1';
  const DEFAULT={enabled:true,seen:[]};
  const tips={
    trust:{icon:'🤝',title:'Trust',text:'Trust rośnie między walkami i runami. Wyższe progi odblokowują nowe karty Duo oraz sceny relacji Kaela i Lyry.'},
    damage:{icon:'⚔️',title:'Typy obrażeń',text:'Fizyczne, magiczne i toksyczne obrażenia korzystają z różnych odporności. Podgląd intencji pokazuje już przewidywaną stratę HP.'},
    protect:{icon:'🛡️',title:'Lyra jest celem',text:'Prowokacja kieruje większość ataków na Kaela. Ochrona może przechwycić cios w Lyrę — ale niektóre ataki skrytobójców ją ignorują.'},
    marked:{icon:'🎯',title:'Marked',text:'Lyra oznacza cel. Heavy Strike, Snipe i część kart Duo potrafią wykorzystać Marked do mocniejszego uderzenia.'},
    momentum:{icon:'🔥',title:'Momentum',text:'Kael buduje Momentum wybranymi atakami. Zachowaj je na finisher albo wykorzystaj wcześniej, jeśli sytuacja tego wymaga.'},
    synergy:{icon:'⚡',title:'Synergy',text:'Synergy powstaje podczas tej jednej walki, szczególnie gdy Kael i Lyra grają naprzemiennie. Najmocniejsze karty Duo zużywają lub wymagają wysokiej Synergy.'}
  };

  const css=document.createElement('style');
  css.textContent=`
    .tutorial-stack{position:fixed;right:18px;bottom:72px;z-index:1190;width:min(360px,calc(100vw - 28px));display:grid;gap:9px;pointer-events:none}.tutorial-toast{pointer-events:auto;border:1px solid rgba(128,145,168,.42);border-radius:13px;background:rgba(17,23,32,.97);box-shadow:0 16px 44px rgba(0,0,0,.42);padding:13px 40px 13px 14px;position:relative;animation:tutorialIn .22s ease-out}.tutorial-toast .t-head{display:flex;align-items:center;gap:8px;color:#ece3dc;font-weight:700;font-size:12px}.tutorial-toast p{margin:6px 0 0;color:#9da8b7;font-size:10px;line-height:1.55}.tutorial-toast button{position:absolute;right:9px;top:8px;border:0;background:transparent;color:#778392;font-size:17px;cursor:pointer}.tutorial-toast .t-progress{margin-top:8px;font-size:9px;color:#697584}.tutorial-settings{margin-top:10px;display:flex;gap:8px}.tutorial-toggle{border:1px solid #343d4d;background:#151b24;color:#9da7b4;border-radius:10px;padding:8px 10px;font-size:10px;cursor:pointer;flex:1}.tutorial-toggle.on{border-color:#6e855f;color:#b7d0ae}.tutorial-toggle:hover{background:#1b222d}@keyframes tutorialIn{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}@media(max-width:650px){.tutorial-stack{right:14px;bottom:64px}}
  `;
  document.head.appendChild(css);

  const stack=document.createElement('div');stack.className='tutorial-stack';stack.id='tutorialStack';document.body.appendChild(stack);

  function load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');return raw&&Array.isArray(raw.seen)?{enabled:raw.enabled!==false,seen:raw.seen}:structuredClone(DEFAULT)}catch{return{enabled:true,seen:[]}}}
  function save(data){try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}}
  function isSeen(id){return load().seen.includes(id)}
  let queue=[],showing=false;

  function markSeen(id){const data=load();if(!data.seen.includes(id))data.seen.push(id);save(data);refreshToggle()}
  function enqueue(id){const data=load();if(!data.enabled||data.seen.includes(id)||queue.includes(id)||!tips[id])return;queue.push(id);pump()}
  function pump(){
    if(showing||!queue.length)return;
    const data=load();if(!data.enabled){queue=[];return}
    const id=queue.shift(),tip=tips[id];if(!tip||data.seen.includes(id)){pump();return}
    showing=true;markSeen(id);
    const toast=document.createElement('div');toast.className='tutorial-toast';
    toast.innerHTML=`<button aria-label="Zamknij">×</button><div class="t-head"><span>${tip.icon}</span><span>${tip.title}</span></div><p>${tip.text}</p><div class="t-progress">Podpowiedź kontekstowa • można wyłączyć w menu głównym</div>`;
    const finish=()=>{if(!toast.isConnected)return;toast.remove();showing=false;setTimeout(pump,80)};
    toast.querySelector('button').onclick=finish;stack.appendChild(toast);setTimeout(finish,6500);
  }
  function setEnabled(value){const data=load();data.enabled=!!value;save(data);if(!data.enabled){queue=[];stack.innerHTML='';showing=false}refreshToggle()}
  function reset(){save({enabled:true,seen:[]});queue=[];stack.innerHTML='';showing=false;refreshToggle()}

  const menuMeta=document.querySelector('#startScreen .start-meta');
  if(menuMeta&&!document.getElementById('tutorialSettings')){
    const box=document.createElement('div');box.id='tutorialSettings';box.className='tutorial-settings';
    box.innerHTML='<button id="tutorialToggle" class="tutorial-toggle"></button><button id="tutorialReset" class="tutorial-toggle">↺ Reset podpowiedzi</button>';
    menuMeta.after(box);
    box.querySelector('#tutorialToggle').onclick=()=>setEnabled(!load().enabled);
    box.querySelector('#tutorialReset').onclick=reset;
  }
  function refreshToggle(){const b=document.getElementById('tutorialToggle');if(!b)return;const d=load();b.classList.toggle('on',d.enabled);b.textContent=d.enabled?'✓ Podpowiedzi: włączone':'Podpowiedzi: wyłączone'}
  refreshToggle();

  const baseRenderMapTut=renderMap;
  renderMap=function(){const result=baseRenderMapTut();if((S.stage||0)===0&&(S.act||0)===0)enqueue('trust');return result};

  const baseStartBattleTut=startBattle;
  startBattle=function(enemies){const result=baseStartBattleTut(enemies);enqueue('damage');
    const lyraThreat=liveEnemies().some(e=>{const it=intentFor(e);return it.type==='attack'&&targetFor(e,it)==='lyra'});
    if(lyraThreat)enqueue('protect');return result};

  const baseRenderBattleTut=renderBattle;
  renderBattle=function(){const result=baseRenderBattleTut();if(!isSeen('protect')){
    const lyraThreat=liveEnemies().some(e=>{const it=intentFor(e);return it.type==='attack'&&targetFor(e,it)==='lyra'});if(lyraThreat)enqueue('protect')}
    return result};

  const basePlayCardTut=playCard;
  playCard=function(i){const c=S.hand?.[i],d=c?cards[c.id]:null;const kind=d?.kind,actor=d?.actor;
    const result=basePlayCardTut(i);
    if(kind==='mark')enqueue('marked');
    if(actor==='Kael'&&(d?.mom||kind==='finish'))enqueue('momentum');
    return result};

  const baseAddSynTut=addSyn;
  addSyn=function(n,why=''){const before=S.synergy;const result=baseAddSynTut(n,why);if(S.synergy>before)enqueue('synergy');return result};

  window.ForbiddenTutorial={load,setEnabled,reset,enqueue,tips};
})();
