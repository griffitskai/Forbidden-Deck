(()=>{
  const KEY='forbidden_deck_relationship_v1';
  const SCHEMA=2;
  const PREFS_KEY='forbidden_deck_preferences_v1';
  const CAMP_EDITION='campfire40';
  const campScenes={
    campfire40:{milestone:'trust40',title:'W świetle ognia',flag:'campfireChoice',completed:'completed',trust:6,boon:'tempo',benefit:'+6 Trust i +1 energia w pierwszej turze następnej walki.'},
    campfire60:{milestone:'trust60',title:'Bez rozkazu',flag:'trust60Choice',completed:'trust60Completed',trust:9,boon:'protect',benefit:'+9 Trust. Następna walka: Ochrona ×1 i +10 Synergy.'}
  };
  const milestones=[
    {id:'trust20',threshold:20,rank:'Towarzysze',title:'Pierwszy rytm',text:'<b>Lyra:</b> „Przestałam liczyć, ile razy wchodzisz mi w linię strzału.”<br><br><b>Kael:</b> „To brzmi prawie jak komplement.”<br><br>Po raz pierwszy planują kolejną walkę jak duet, a nie dwoje ludzi idących w tym samym kierunku.',options:[
      {id:'right-side',label:'🛡️ „Ja biorę prawą stronę. Ty obserwuj resztę.”',desc:'+8 Trust. Następna walka: +6 Block dla obojga.',trust:8,tone:'supportive',boon:'guard'},
      {id:'signals',label:'🤝 „Ustalmy trzy sygnały i żadnych improwizacji.”',desc:'+5 Trust. Następna walka: +15 Synergy.',trust:5,tone:'pragmatic',boon:'synergy'}]},
    {id:'trust40',threshold:40,rank:'Zgrani',title:'W świetle ognia'},
    {id:'trust60',threshold:60,rank:'Zaufanie',title:'Bez rozkazu',text:'Coraz częściej reagują, zanim drugie zdąży cokolwiek powiedzieć. To, co wcześniej było planem, zaczyna być odruchem.',options:[
      {id:'no-explanations',label:'🛡️ „Nie musisz mi tłumaczyć wszystkiego. Wystarczy, że dasz znak.”',desc:'+9 Trust. Następna walka: Kael zaczyna z Ochroną i +10 Synergy.',trust:9,tone:'supportive',boon:'protect'},
      {id:'test-it',label:'🎯 „Sprawdźmy, czy działa również pod presją.”',desc:'+6 Trust. Następna walka: pierwszy przeciwnik zaczyna z 1 Marked.',trust:6,tone:'pragmatic',boon:'hunt'}]},
    {id:'trust80',threshold:80,rank:'Więź',title:'Jedno spojrzenie',text:'Nie ma wielkiego wyznania. Jest cisza przed kolejnym odcinkiem drogi i pewność, że żadne z nich nie planuje wracać samotnie.',options:[
      {id:'both-return',label:'🤝 „Wracamy oboje. To jedyna część planu, której nie zmieniamy.”',desc:'+8 Trust. Następna walka: Ochrona +15 Synergy.',trust:8,tone:'supportive',boon:'bond'},
      {id:'one-look',label:'⚡ „Jedno spojrzenie. Więcej nie będzie potrzebne.”',desc:'+5 Trust. Następna walka: +1 energia i +15 Synergy.',trust:5,tone:'pragmatic',boon:'perfect'}]}
  ];

  function defaults(){return{schema:SCHEMA,seen:[],choices:[],pendingBoon:null,roadSeen:false,stats:{scenes:0,supportive:0,pragmatic:0},romance:{campfireChoice:null,trust60Choice:null},campfire:{completed:false,trust60Completed:false}}}
  function load(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'null');
      if(!raw||![1,SCHEMA].includes(raw.schema))return defaults();
      // Keep the existing key and every legacy choice/boon. Trust has its own key.
      // A supportive legacy choice is never interpreted as romantic consent.
      const data={...defaults(),...raw,schema:SCHEMA,stats:{...defaults().stats,...(raw.stats||{})},seen:Array.isArray(raw.seen)?raw.seen:[],choices:Array.isArray(raw.choices)?raw.choices:[],romance:{...defaults().romance,...(raw.romance||{})},campfire:{...defaults().campfire,...(raw.campfire||{})}};
      if(raw.schema===1)save(data);
      return data;
    }catch{return defaults()}
  }
  function save(data){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(error){console.warn('Forbidden Deck: nie udało się zapisać relacji',error)}}
  function nextScene(){const data=load();return milestones.find(scene=>S.trust>=scene.threshold&&!data.seen.includes(scene.id))||null}
  function addTrust(n){S.trust=Math.min(100,S.trust+n);saveTrust()}
  function romanceEnabled(){
    try{return JSON.parse(localStorage.getItem(PREFS_KEY)||'null')?.romanceEnabled===true}catch{return false}
  }
  function setRomanceEnabled(value){
    try{localStorage.setItem(PREFS_KEY,JSON.stringify({schema:1,romanceEnabled:!!value}))}catch(error){console.warn('Forbidden Deck: nie udało się zapisać ustawienia',error)}
    document.querySelectorAll('[data-romance-toggle]').forEach(input=>{input.checked=romanceEnabled()});
    if(campSession){
      if(!romanceEnabled()&&campSession.choice==='romance'){
        campSession.choice=null;campSession.phase='choice';campSession.index=0;
      }
      renderCampfire();
    }
  }
  function settingMarkup(id){
    return `<label class="romance-setting" for="${id}"><input type="checkbox" id="${id}" data-romance-toggle ${romanceEnabled()?'checked':''}><span>Romantyczne sceny Kaela i Lyry<small>Opcjonalny flirt i bliskość. Nagrody są takie same również bez romansu.</small></span></label>`;
  }
  function wireSettings(root){root.querySelectorAll('[data-romance-toggle]').forEach(input=>{input.onchange=()=>setRomanceEnabled(input.checked)})}
  const menuSetting=document.createElement('div');
  menuSetting.innerHTML=settingMarkup('romanceToggle');
  document.querySelector('#startScreen .start-foot')?.before(menuSetting);
  wireSettings(menuSetting);

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
    const body=document.getElementById('relationshipBody');
    const profiles=document.createElement('div');
    profiles.className='relationship-profiles';
    profiles.innerHTML='<article class="relationship-profile"><img src="assets/portraits/kael.webp" width="1024" height="1536" alt="Portret Kaela"><div><h3>Kael · 32 lata</h3><p>Obrońca. Zwykle pierwszy przy zagrożeniu; przy ogniu uczy się słuchać.</p></div></article><article class="relationship-profile"><img src="assets/portraits/lyra.webp" width="1024" height="1536" alt="Portret Lyry"><div><h3>Lyra · 29 lat</h3><p>Łuczniczka. Celna w walce i w słowach; sama wybiera, komu pozwoli podejść bliżej.</p></div></article>';
    body.prepend(profiles);
    const settings=document.createElement('div');settings.innerHTML=settingMarkup('relationshipRomanceToggle');body.appendChild(settings);wireSettings(settings);
    const unlocked=S.trust>=40||data.seen.includes('trust40');
    const entry=document.createElement('section');entry.className='relationship-camp-entry';
    const choice=data.romance.campfireChoice;
    entry.innerHTML=`<h3>W świetle ognia</h3><p>Trust oznacza współpracę. O bliskości decydują oboje — przyjaźń jest równie ważną drogą.</p><p>${choice==='romance'?'Wybrana chwila bliskości przy ognisku.':choice==='friendship'?'Wybrana przyjaźń i wspólna droga.':choice==='skipped'?'Scena pominięta.':'Kael i Lyra są dorosłymi, fikcyjnymi bohaterami.'}</p>`;
    if(unlocked&&data.seen.includes('trust40')){
      const replay=document.createElement('button');replay.className='btn';replay.id='replayCampfire';replay.textContent='Odwiedź ognisko ponownie';replay.onclick=()=>showCampfire(true);entry.appendChild(replay);
      const note=document.createElement('p');note.textContent='Ponowne obejrzenie nie przyznaje nagród ani nie zmienia wcześniej zapisanej decyzji. Starszy zapis może tu poznać nową scenę i zapisać jej pierwszy wybór.';entry.appendChild(note);
    }else{const note=document.createElement('p');note.textContent=unlocked?'Rozmowa czeka przy ognisku podczas runu.':'Scena odblokuje się przy 40 Trust.';entry.appendChild(note)}
    body.appendChild(entry);
    if(data.seen.includes('trust60')){
      const later=document.createElement('section');later.className='relationship-camp-entry';
      later.innerHTML='<h3>Bez rozkazu</h3><p>Jedna noc bez zbroi złożonej ze słów. Rozmowa pamięta, co wybraliście przy poprzednim ogniu.</p>';
      const replay=document.createElement('button');replay.className='btn';replay.id='replayCampfire60';replay.textContent='Wróć do tej nocy';replay.onclick=()=>showCampfire(true,null,'campfire60');later.appendChild(replay);
      const note=document.createElement('p');note.textContent='Ponowne obejrzenie bez dodatkowej nagrody. Przyjaźń i bliskość mają równoważne korzyści.';later.appendChild(note);body.appendChild(later);
    }
  }
  function openRelationship(){window.ForbiddenDeckMenu?.close?.();renderRelationship();screen.classList.add('show')}
  function closeRelationship(){screen.classList.remove('show');window.ForbiddenDeckMenu?.open?.()}
  document.getElementById('menuRelationship').onclick=openRelationship;document.getElementById('relationshipBack').onclick=closeRelationship;

  function applyChoice(scene,opt){
    const data=load();if(!data.seen.includes(scene.id))data.seen.push(scene.id);data.choices.push({scene:scene.id,choice:opt.id,at:new Date().toISOString()});data.stats.scenes++;data.stats[opt.tone]=(data.stats[opt.tone]||0)+1;if(opt.boon)data.pendingBoon=opt.boon;
    addTrust(opt.trust||0);if(opt.heal){S.kaelHp=Math.min(S.kaelMaxHp,S.kaelHp+opt.heal);S.lyraHp=Math.min(S.lyraMaxHp,S.lyraHp+opt.heal)}save(data);refreshCard();hideModal();advance();
  }
  function showRelationshipScene(scene){
    if(scene.id==='trust40')return showCampfire();
    if(scene.id==='trust60')return showCampfire(false,null,'campfire60');
    showModal(scene.title,'',()=>{const w=document.createElement('div'),d=document.createElement('div');d.className='relation-dialogue';d.innerHTML=scene.text;w.appendChild(d);w.appendChild(grid(scene.options.map(opt=>[opt.label,opt.desc,()=>applyChoice(scene,opt)])));return w});
  }

  const opening=[
    {speaker:'Kael',text:'Miałaś kilka okazji, żeby odejść. Dlaczego zostałaś?',note:'Podaje jej kubek. Ich palce spotykają się na moment; oboje uśmiechają się i cofają dłonie.'},
    {speaker:'Lyra',text:'Bo pytasz, zamiast mówić mi, gdzie mam stać. I dlatego, że przy tobie nie muszę przez całą noc wypatrywać drogi ucieczki.',note:'W ciepłym świetle znika część ostrożności, którą nosiła jak drugi płaszcz.'}
  ];
  const endings={
    friendship:[
      {speaker:'Kael',text:'Zostańmy przy tym. Ty pilnujesz mojego lewego boku, ja twojego. A wieczorem dzielimy ogień.',note:'Przesuwa kubek w jej stronę, zostawiając między nimi wygodne miejsce.'},
      {speaker:'Lyra',text:'I żadnych rozkazów przy kolacji. Umowa?',note:'Śmieją się cicho. Ta noc należy do dwojga przyjaciół, którzy nie muszą niczego udowadniać.'}
    ],
    romance:[
      {speaker:'Kael',text:'Chcę usiąść bliżej. Jeśli nadal tego chcesz.',note:'Nie skraca dystansu, dopóki Lyra sama nie wyciąga dłoni.'},
      {speaker:'Lyra',text:'Chcę. I na dziś wystarczy mi, że zostaniesz obok.',note:'Przyciąga go do krótkiego pocałunku. Kael odpowiada, po czym opierają czoła o siebie. Rozmowa cichnie; światło ognia powoli przygasa.'}
    ]
  };
  function laterOpening(){
    const shared=romanceEnabled()&&load().romance.campfireChoice==='romance';
    return[
      {speaker:'Kael',text:'W walce czekasz na mój znak. Tutaj nie musisz.',note:'Odpina ciężki naramiennik i kładzie go przy kamieniu. Między nimi zostaje tylko ciepło ognia.'},
      shared?{speaker:'Lyra',text:'W takim razie powiem pierwsza. Myślę jeszcze o tamtym pocałunku.',note:'Nie odwraca wzroku. Kael uśmiecha się tak, jakby na chwilę zapomniał o całej drodze przed nimi.'}
        :{speaker:'Lyra',text:'Nie zawsze potrzebuję znaku. Czasem chcę po prostu wiedzieć, że ktoś zostanie.',note:'Przesuwa po kamieniu drugi kubek. To zaproszenie do rozmowy, nie obietnica, której ktokolwiek musi dotrzymać.'}
    ];
  }
  const laterEndings={
    friendship:[
      {speaker:'Kael',text:'Zostanę. Ty weźmiesz drugą wartę, ja pierwszą. Tak jak ustaliliśmy.',note:'Rozkłada płaszcz przy ogniu, zostawiając jej własne miejsce.'},
      {speaker:'Lyra',text:'Dobrze. A jutro przypomnij mi, żebym nie mówiła, że jesteś nie do zniesienia.',note:'Śmieją się pod nosem. Nie potrzebują wyznania, żeby ta cisza była wspólna.'}
    ],
    romance:[
      {speaker:'Kael',text:'Chodź bliżej. Jeśli tego chcesz, jest miejsce dla nas obojga.',note:'Lyra ujmuje jego dłoń i sama przysuwa się pod płaszcz. Kael otula jej ramiona.'},
      {speaker:'Lyra',text:'Zostań jeszcze chwilę. Potem znowu będziemy odważni.',note:'Opiera głowę na jego ramieniu. Kael splata jej palce ze swoimi. Ogień powoli przygasa, a świat poza kręgiem ciepła cichnie.'}
    ]
  };
  let campSession=null;
  function persistCampfire(){
    if(!campSession||campSession.replay)return;
    S.relationshipScene={id:campSession.id,phase:campSession.phase,index:campSession.index,choice:campSession.choice};
    window.ForbiddenDeckSave?.save?.('map');
  }
  function showCampfire(replay=false,resume=null,id=CAMP_EDITION){
    campSession={id:campScenes[resume?.id]?resume.id:id,replay,phase:resume?.phase==='ending'?'ending':resume?.phase==='choice'?'choice':'opening',index:Math.max(0,Math.min(1,resume?.index||0)),choice:['friendship','romance'].includes(resume?.choice)?resume.choice:null};
    if(campSession.phase==='ending'&&(!campSession.choice||(!romanceEnabled()&&campSession.choice==='romance'))){campSession.phase='choice';campSession.index=0;campSession.choice=null}
    renderCampfire();
  }
  function renderCampfire(){
    if(!campSession)return;
    persistCampfire();
    const session=campSession;
    const definition=campScenes[session.id],later=session.id==='campfire60';
    const choosing=session.phase==='choice';
    let line;
    if(choosing){
      line=romanceEnabled()
        ?{speaker:'Lyra',text:'Możesz usiąść bliżej, jeśli chcesz. Ale jeśli wolisz zostać po swojej stronie ognia, nadal chcę iść z tobą.',note:'Kael spotyka jej spojrzenie. Odpowiedź należy do niego, zaproszenie — do niej.'}
        :{speaker:'Lyra',text:'Dobrze mieć kogoś po swojej stronie ognia. Nawet jeśli każde siedzi na własnym pniu.',note:'Kael uśmiecha się. Na jutro mają wspólny plan i kogoś, kto przypilnuje drugiego.'};
      if(later&&romanceEnabled())line={speaker:'Lyra',text:'Mogę schować się obok ciebie pod tym płaszczem? Chcę być bliżej. Ale możemy też zostać po prostu przy ogniu.',note:'Kael nie odpowiada za nią. Dopiero teraz przychodzi pora na jego wybór.'};
    }else{line=(session.phase==='ending'?(later?laterEndings:endings)[session.choice]:(later?laterOpening():opening))[session.index]}
    showModal(definition.title,'',()=>{
      const root=document.createElement('div');root.id='campfireScene';
      root.innerHTML='<figure class="campfire-art"><img src="assets/scenes/campfire.webp" width="1672" height="941" alt="Ognisko wśród ruin, dwa miejsca odpoczynku i chłodny las o zmierzchu"><figcaption>MIEJSCE ODPOCZYNKU · PO ZMROKU</figcaption></figure>';
      const moment=session.phase==='ending'&&session.choice==='romance'&&romanceEnabled();
      const sceneArt=root.querySelector('.campfire-art'),sceneImg=sceneArt.querySelector('img');
      const art=moment?'assets/scenes/shared-cloak.webp':window.ForbiddenDeckJourney?.region().art;
      if(art)sceneImg.src=globalThis.ForbiddenDeckPreviewAssets?.[art]||art;
      if(moment){sceneArt.classList.add('moment-art');sceneImg.alt='Kael i Lyra przy ogniu, pod wspólnym płaszczem, ze splecionymi dłońmi.'}
      sceneArt.querySelector('figcaption').textContent=moment?'Chwila, którą wybierają oboje':(currentAct().title+' · po zmroku');
      const sequence=document.createElement('p');sequence.className='campfire-sequence';sequence.textContent=`${later?'60':'40'} Trust · ${choosing?'Wasza decyzja':session.phase==='opening'?'Przy ogniu':'Zostań jeszcze chwilę'}`;root.appendChild(sequence);
      const dialogue=document.createElement('div');dialogue.className='campfire-line';dialogue.setAttribute('aria-live','polite');
      dialogue.innerHTML=`<img src="assets/portraits/${line.speaker==='Kael'?'kael':'lyra'}.webp" alt="${line.speaker}" width="1024" height="1536"><div><strong class="campfire-speaker">${line.speaker}</strong><p></p><em></em></div>`;
      dialogue.querySelector('p').textContent=line.text;dialogue.querySelector('em').textContent=line.note;root.appendChild(dialogue);
      const benefit=document.createElement('p');benefit.className='campfire-benefit';
      benefit.textContent=session.replay?'Ponowne obejrzenie — bez dodatkowych nagród.':'Każda ścieżka, także pominięcie: '+definition.benefit;root.appendChild(benefit);
      if(choosing){
        const options=[['friendship','Zostańmy przyjaciółmi','Wspólna droga i zaufanie, bez romansu.']];
        if(romanceEnabled())options.push(['romance','Przyjmij zaproszenie do bliskości','Kael odpowiada na zaproszenie Lyry. Oboje wybierają tę chwilę.']);
        const choices=grid(options.map(([id,label,desc])=>[label,desc,()=>{campSession.choice=id;campSession.phase='ending';campSession.index=0;renderCampfire()}]));
        choices.querySelectorAll('button').forEach((b,i)=>{b.dataset.campChoice=options[i][0]});root.appendChild(choices);
      }
      const controls=document.createElement('div');controls.className='campfire-controls';
      const skip=document.createElement('button');skip.className='btn';skip.id='campfireSkip';skip.textContent=session.replay?'Zamknij scenę':'Pomiń scenę';skip.onclick=()=>finishCampfire(session.replay?null:'skipped');controls.appendChild(skip);
      if(!choosing){
        const next=document.createElement('button');next.className='primary';next.id='campfireNext';next.textContent=session.phase==='ending'&&session.index===1?(session.replay?'Wróć do relacji':'Wróć na szlak'):'Dalej';
        next.onclick=()=>{
          if(session.phase==='ending'&&session.index===1)return finishCampfire(session.choice);
          if(session.index===0)session.index=1;else{session.phase='choice';session.index=0}
          renderCampfire();
        };controls.appendChild(next);
      }
      root.appendChild(controls);if(session.phase==='ending'&&session.index===1)root.classList.add('campfire-ending');
      return root;
    });
    const overlay=document.getElementById('overlay');overlay.classList.add('campfire-overlay');
    const modal=overlay.querySelector('.modal');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.setAttribute('aria-labelledby','modalTitle');
    const focusTarget=choosing?document.querySelector('[data-camp-choice]'):document.getElementById('campfireNext');
    focusTarget?.focus({preventScroll:true});
  }
  function finishCampfire(choice){
    if(!campSession)return;
    const session=campSession,data=load();
    const definition=campScenes[session.id];
    const newMilestone=!data.seen.includes(definition.milestone);
    // Replays never duplicate rewards or rewrite a completed edition's choice.
    if(!session.replay&&newMilestone){
      data.seen.push(definition.milestone);data.stats.scenes++;if(choice!=='skipped')data.stats.supportive++;
      data.choices.push({scene:definition.milestone,choice:choice||'skipped',at:new Date().toISOString()});
      data.pendingBoon=definition.boon;addTrust(definition.trust);
    }
    if(!data.campfire[definition.completed]&&choice){data.campfire[definition.completed]=true;data.romance[definition.flag]=choice}
    save(data);campSession=null;
    document.getElementById('overlay').classList.remove('campfire-overlay');
    hideModal();refreshCard();
    if(session.replay){renderRelationship();screen.classList.add('show');document.getElementById(session.id==='campfire60'?'replayCampfire60':'replayCampfire')?.focus()}
    else{S.relationshipScene=null;advance()}
  }
  document.addEventListener('keydown',event=>{
    if(!campSession)return;
    if(event.key==='Escape'){event.preventDefault();finishCampfire(campSession.replay?null:'skipped')}
    if(event.key==='Tab'){
      const buttons=[...document.querySelectorAll('#campfireScene button:not([disabled])')];
      const first=buttons[0],last=buttons.at(-1);
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
    }
  });
  window.addEventListener('forbidden-deck:restore',()=>{
    const definition=campScenes[S.relationshipScene?.id];
    if(definition){
      if(load().seen.includes(definition.milestone)){S.relationshipScene=null;advance()}
      else showCampfire(false,S.relationshipScene);
    }
  });

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
  newRun=function(diff=S.difficulty){const data=load();data.pendingBoon=null;save(data);campSession=null;S.relationshipScene=null;document.getElementById('overlay').classList.remove('campfire-overlay');const result=baseNewRunRel(diff);refreshCard();return result};
  const baseRenderTopBarRel=renderTopBar;
  renderTopBar=function(){const result=baseRenderTopBarRel();refreshCard();return result};

  refreshCard();
  window.ForbiddenDeckRelationship={load,nextScene,open:openRelationship,render:renderRelationship,romanceEnabled,setRomanceEnabled,clear:()=>{localStorage.removeItem(KEY);refreshCard()}};
})();
