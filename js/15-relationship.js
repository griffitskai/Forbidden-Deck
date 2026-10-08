(()=>{
  const KEY='forbidden_deck_relationship_v1';
  const SCHEMA=1;
  const milestones=[
    {id:'trust20',threshold:20,rank:'Towarzysze',title:'Pierwszy rytm',text:'<b>Lyra:</b> „Przestałam liczyć, ile razy wchodzisz mi w linię strzału.”<br><br><b>Kael:</b> „To brzmi prawie jak komplement.”<br><br>Po raz pierwszy planują kolejną walkę jak duet, a nie dwoje ludzi idących w tym samym kierunku.',options:[
      {id:'right-side',label:'🛡️ „Ja biorę prawą stronę. Ty obserwuj resztę.”',desc:'+8 Trust. Następna walka: +6 Block dla obojga.',trust:8,tone:'supportive',boon:'guard'},
      {id:'signals',label:'🤝 „Ustalmy trzy sygnały i żadnych improwizacji.”',desc:'+5 Trust. Następna walka: +15 Synergy.',trust:5,tone:'pragmatic',boon:'synergy'}]},
    {id:'trust40',threshold:40,rank:'Zgrani',title:'Dlaczego zostałaś?',text:'Przy dogasającym ogniu Kael w końcu zadaje pytanie, które od kilku dni pozostawało między nimi niewypowiedziane.<br><br><b>Kael:</b> „Miałaś już kilka okazji, żeby odejść. Dlaczego nadal tu jesteś?”',options:[
      {id:'listen',label:'💬 Nie przerywaj. Pozwól Lyrze odpowiedzieć po swojemu.',desc:'+10 Trust i niewielka regeneracja obojga.',trust:10,tone:'supportive',heal:6},
      {id:'train',label:'⚡ „Odpowiesz jutro. Teraz pokaż mi ten zwód.”',desc:'+6 Trust. Następna walka: +1 energia w pierwszej turze.',trust:6,tone:'pragmatic',boon:'tempo'}]},
    {id:'trust60',threshold:60,rank:'Zaufanie',title:'Bez rozkazu',text:'Coraz częściej reagują, zanim drugie zdąży cokolwiek powiedzieć. To, co wcześniej było planem, zaczyna być odruchem.',options:[
      {id:'no-explanations',label:'🛡️ „Nie musisz mi tłumaczyć wszystkiego. Wystarczy, że dasz znak.”',desc:'+9 Trust. Następna walka: Kael zaczyna z Ochroną i +10 Synergy.',trust:9,tone:'supportive',boon:'protect'},
      {id:'test-it',label:'🎯 „Sprawdźmy, czy działa również pod presją.”',desc:'+6 Trust. Następna walka: pierwszy przeciwnik zaczyna z 1 Marked.',trust:6,tone:'pragmatic',boon:'hunt'}]},
    {id:'trust80',threshold:80,rank:'Więź',title:'Jedno spojrzenie',text:'Nie ma wielkiego wyznania. Jest cisza przed kolejnym odcinkiem drogi i pewność, że żadne z nich nie planuje wracać samotnie.',options:[
      {id:'both-return',label:'🤝 „Wracamy oboje. To jedyna część planu, której nie zmieniamy.”',desc:'+8 Trust. Następna walka: Ochrona +15 Synergy.',trust:8,tone:'supportive',boon:'bond'},
      {id:'one-look',label:'⚡ „Jedno spojrzenie. Więcej nie będzie potrzebne.”',desc:'+5 Trust. Następna walka: +1 energia i +15 Synergy.',trust:5,tone:'pragmatic',boon:'perfect'}]}
  ];

  const css=document.createElement('style');
  css.textContent=`
    .relationship-card{margin-top:18px;padding:13px 14px;border:1px solid #343d4d;border-radius:13px;background:#121821;color:#aeb5bf}.relationship-card .rel-head{display:flex;justify-content:space-between;gap:10px}.relationship-card strong{color:#e5d8d2}.relationship-card small{color:#857f89}.rel-track{height:5px;background:#252d39;border-radius:999px;overflow:hidden;margin-top:9px}.rel-track i{display:block;height:100%;background:linear-gradient(90deg,#6c4855,#b47a83)}
    .relationship-screen{position:fixed;inset:0;z-index:1270;background:#0b1017;display:none;overflow:auto;padding:28px}.relationship-screen.show{display:block}.relationship-shell{max-width:980px;margin:auto}.relationship-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:24px}.relationship-head h2{margin:0;color:#eee4dd;font-size:28px}.relationship-head p{margin:6px 0 0;color:#8e98a7;font-size:12px}.relationship-overview{border:1px solid #303948;border-radius:16px;background:#141a24;padding:18px;margin-bottom:16px}.relationship-overview strong{color:#eee4dd}.relationship-overview p{color:#9ca5b3;font-size:12px;line-height:1.55;margin:8px 0 0}.relationship-timeline{display:grid;gap:10px}.relationship-step{display:grid;grid-template-columns:62px 1fr auto;align-items:center;gap:14px;border:1px solid #303948;border-radius:14px;background:#131a23;padding:14px}.relationship-step.locked{opacity:.42}.relationship-step .rel-icon{width:50px;height:50px;border-radius:50%;display:grid;place-items:center;background:#202936;font-size:20px}.relationship-step h3{margin:0;color:#e5ddd7;font-size:14px}.relationship-step p{margin:5px 0 0;color:#8f99a7;font-size:11px}.relationship-step .state{font-size:10px;color:#b88b91;text-align:right}
    .relation-dialogue{padding:14px;border:1px solid #343e4d;border-radius:12px;background:#111722;line-height:1.65;color:#c1c5ce;margin-bottom:14px}
    @media(max-width:650px){.relationship-screen{padding:14px}.relationship-step{grid-template-columns:48px 1fr}.relationship-step .rel-icon{width:42px;height:42px}.relationship-step .state{grid-column:2;text-align:left}}
  `;
  document.head.appendChild(css);

  function defaults(){return{schema:SCHEMA,seen:[],choices:[],pendingBoon:null,roadSeen:false,stats:{scenes:0,supportive:0,pragmatic:0}}}
  function load(){
    try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(!raw||raw.schema!==SCHEMA)return defaults();return{...defaults(),...raw,stats:{...defaults().stats,...(raw.stats||{})},seen:Array.isArray(raw.seen)?raw.seen:[],choices:Array.isArray(raw.choices)?raw.choices:[]}}catch{return defaults()}
  }
  function save(data){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(error){console.warn('Forbidden Deck: nie udało się zapisać relacji',error)}}
  function nextScene(){const data=load();return milestones.find(scene=>S.trust>=scene.threshold&&!data.seen.includes(scene.id))||null}
  function addTrust(n){S.trust=Math.min(100,S.trust+n);saveTrust()}

  const panel=document.createElement('div');panel.className='relationship-card';panel.id='relationshipCard';
  const foot=document.querySelector('#startScreen .start-foot');if(foot)foot.parentNode.insertBefore(panel,foot);
  function refreshCard(){
    if(!panel)return;const data=load(),seen=data.seen.length,next=milestones.find(m=>!data.seen.includes(m.id));
    panel.innerHTML=`<div class="rel-head"><strong>🤝 ${trustRank(S.trust)}</strong><small>${seen}/${milestones.length} scen</small></div><div style="font-size:10px;margin-top:5px;color:#858e9b">Trust ${S.trust}/100${next?' • kolejny próg '+next.threshold:' • wszystkie progi odkryte'}</div><div class="rel-track"><i style="width:${S.trust}%"></i></div>`;
  }

  const screen=document.createElement('div');screen.id='relationshipScreen';screen.className='relationship-screen';screen.innerHTML='<div class="relationship-shell"><div class="relationship-head"><div><h2>Kael + Lyra</h2><p>Trust rozwija zarówno karty Duo, jak i historię ich współpracy.</p></div><button class="btn" id="relationshipBack">← Wróć</button></div><div id="relationshipBody"></div></div>';document.body.appendChild(screen);
  const actions=document.querySelector('#startScreen .start-actions');
  if(actions&&!document.getElementById('menuRelationship')){const b=document.createElement('button');b.className='start-action';b.id='menuRelationship';b.innerHTML='<strong>🤝 Relacja Kael–Lyra</strong><span>Kamienie milowe Trust i historia wspólnych decyzji.</span>';actions.appendChild(b)}

  function renderRelationship(){
    const data=load(),support=data.stats.supportive||0,prag=data.stats.pragmatic||0;
    const tone=support>prag?'opiekuńczy / oparty na zaufaniu':prag>support?'taktyczny / pragmatyczny':'zrównoważony';
    document.getElementById('relationshipBody').innerHTML=`<div class="relationship-overview"><strong>${trustRank(S.trust)} • Trust ${S.trust}/100</strong><p>Dotychczasowy styl współpracy: <b>${tone}</b>. Wybory wpływają na krótkie premie w kolejnych walkach, ale nie zamykają przyszłych scen.</p></div><div class="relationship-timeline">${milestones.map(m=>{const reached=S.trust>=m.threshold,seen=data.seen.includes(m.id);return`<div class="relationship-step ${reached?'':'locked'}"><div class="rel-icon">${seen?'✓':reached?'💬':'🔒'}</div><div><h3>${m.threshold} Trust — ${m.rank}</h3><p>${seen?m.title:reached?'Scena czeka przy następnym ognisku.':'Jeszcze nieosiągnięte.'}</p></div><div class="state">${seen?'PRZEŻYTE':reached?'DOSTĘPNE':'ZABLOKOWANE'}</div></div>`}).join('')}</div>`;
  }
  function openRelationship(){window.ForbiddenDeckMenu?.close?.();renderRelationship();screen.classList.add('show')}
  function closeRelationship(){screen.classList.remove('show');window.ForbiddenDeckMenu?.open?.()}
  document.getElementById('menuRelationship').onclick=openRelationship;document.getElementById('relationshipBack').onclick=closeRelationship;

  function applyChoice(scene,opt){
    const data=load();if(!data.seen.includes(scene.id))data.seen.push(scene.id);data.choices.push({scene:scene.id,choice:opt.id,at:new Date().toISOString()});data.stats.scenes++;data.stats[opt.tone]=(data.stats[opt.tone]||0)+1;if(opt.boon)data.pendingBoon=opt.boon;
    addTrust(opt.trust||0);if(opt.heal){S.kaelHp=Math.min(S.kaelMaxHp,S.kaelHp+opt.heal);S.lyraHp=Math.min(S.lyraMaxHp,S.lyraHp+opt.heal)}save(data);refreshCard();hideModal();advance();
  }
  function showRelationshipScene(scene){
    showModal(scene.title,'',()=>{const w=document.createElement('div'),d=document.createElement('div');d.className='relation-dialogue';d.innerHTML=scene.text;w.appendChild(d);w.appendChild(grid(scene.options.map(opt=>[opt.label,opt.desc,()=>applyChoice(scene,opt)])));return w});
  }

  const baseCampDialogue=campDialogue;
  campDialogue=function(){const scene=nextScene();if(scene)return showRelationshipScene(scene);return baseCampDialogue()};

  const baseStoryNode=storyNode;
  storyNode=function(){
    const data=load();
    if(S.trust>=60&&!data.roadSeen){
      showModal('Zasadzka bez rozkazu','Kael dostrzega ruch po lewej stronie traktu. Lyra już naciąga cięciwę — patrzy jednak nie na zagrożenie, lecz na niego. Czeka tylko na jeden sygnał.',()=>grid([
        ['🏹 Zaufaj jej ocenie','+6 Trust, +15 złota. Lyra prowadzi ich boczną ścieżką.',()=>{const d=load();d.roadSeen=true;d.stats.supportive++;save(d);addTrust(6);S.gold+=15;refreshCard();hideModal();advance()}],
        ['⚔️ Przejmij inicjatywę','+4 Trust, +8 HP dla obojga po bezpiecznym obejściu.',()=>{const d=load();d.roadSeen=true;d.stats.pragmatic++;save(d);addTrust(4);S.kaelHp=Math.min(S.kaelMaxHp,S.kaelHp+8);S.lyraHp=Math.min(S.lyraMaxHp,S.lyraHp+8);refreshCard();hideModal();advance()}]
      ]));return;
    }
    return baseStoryNode();
  };

  function consumeBoon(){
    const data=load(),boon=data.pendingBoon;if(!boon)return;data.pendingBoon=null;save(data);
    if(boon==='guard'){S.kaelBlock+=6;S.lyraBlock+=6;log('<b>Rozmowa przy ognisku:</b> +6 Block dla obojga.','combo')}
    if(boon==='synergy'){S.synergy=Math.min(100,S.synergy+15);log('<b>Ustalone sygnały:</b> +15 Synergy.','combo')}
    if(boon==='tempo'){S.energy+=1;log('<b>Wspólny trening:</b> +1 energia w pierwszej turze.','combo')}
    if(boon==='protect'){S.protectLyra+=1;S.synergy=Math.min(100,S.synergy+10);log('<b>Zaufanie:</b> Ochrona ×1 i +10 Synergy.','combo')}
    if(boon==='hunt'){const e=liveEnemies()[0];if(e)e.marked=Math.min(3,(e.marked||0)+1);log('<b>Plan łowów:</b> pierwszy cel otrzymuje Marked.','combo')}
    if(boon==='bond'){S.protectLyra+=1;S.synergy=Math.min(100,S.synergy+15);log('<b>Więź:</b> Ochrona ×1 i +15 Synergy.','combo')}
    if(boon==='perfect'){S.energy+=1;S.synergy=Math.min(100,S.synergy+15);log('<b>Jedno spojrzenie:</b> +1 energia i +15 Synergy.','combo')}
    renderBattle();
  }
  const baseStartBattleRel=startBattle;
  startBattle=function(enemies){const result=baseStartBattleRel(enemies);consumeBoon();return result};
  const baseNewRunRel=newRun;
  newRun=function(diff=S.difficulty){const data=load();data.pendingBoon=null;save(data);const result=baseNewRunRel(diff);refreshCard();return result};
  const baseRenderTopBarRel=renderTopBar;
  renderTopBar=function(){const result=baseRenderTopBarRel();refreshCard();return result};

  refreshCard();
  window.ForbiddenDeckRelationship={load,nextScene,open:openRelationship,render:renderRelationship,clear:()=>{localStorage.removeItem(KEY);refreshCard()}};
})();
