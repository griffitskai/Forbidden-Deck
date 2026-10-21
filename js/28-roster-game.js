/* Selectable heroes and pair-scoped stories; old DOM IDs remain stable view slots. */
(()=>{
 'use strict';
 const P=ForbiddenDeckParty,D=ForbiddenDeckRosterData,asset=path=>globalThis.ForbiddenDeckPreviewAssets?.[path]||path;
 const ids=()=>S.party.members.map(h=>h.id),pair=()=>D.pairs[S.party.relationshipId],name=id=>P.characters[id].name,hero=id=>P.member(id),resource=(id,key)=>hero(id).resources[key]||0;
 const gain=(id,key,n)=>{hero(id).resources[key]=Math.min(3,resource(id,key)+n)},block=(id,n)=>P.addBlock(id,n),both=n=>P.addBlockAll(n);
 function poison(t,n){t.status??={bleed:0,poison:0,burn:0,weak:0};t.status.poison=Math.min(12,(t.status.poison||0)+n)}
 const basePlay=playCard;
 playCard=function(index){
  const item=S.hand[index],d=item&&cards[item.id];if(d?.kind!=='roster'){const r=basePlay(index);if(item&&!S.hand.includes(item)){P.recordPlayed(d?.ownerId);ForbiddenDeckSave.save()}return r;}
  if(!playable(item))return;const t=selected();if(!t)return;
  const actor=P.actorId(d),prev=S.lastActor;S.energy-=d.cost;S.activeActor=actor;
  if(d.ownerId&&prev&&!prev.startsWith('duo:')&&prev!==actor)addSyn(10,name(prev)+' → '+name(d.ownerId));
  let damage=0;
  switch(d.effect){
   case 'knife':damage=dmgEnemy(t,d.dmg);gain('varyn','shadow',1);break;
   case 'veil':block('varyn',d.block);gain('varyn','shadow',1);break;
   case 'ambush':{const n=resource('varyn','shadow');hero('varyn').resources.shadow=0;damage=dmgEnemy(t,d.dmg+d.scale*n);break}
   case 'venomknife':damage=dmgEnemy(t,d.dmg);poison(t,d.poison);break;
   case 'smoke':block('varyn',d.block);block(P.member('partner').id,d.partnerBlock);gain('varyn','shadow',1);break;
   case 'spark':damage=dmgEnemy(t,d.dmg);gain('selene','runes',1);break;
   case 'runeward':block(P.member('lead').id,d.block);block('selene',d.partnerBlock);gain('selene','runes',1);break;
   case 'detonate':{const n=resource('selene','runes');hero('selene').resources.runes=0;damage=dmgEnemy(t,d.dmg+d.scale*n);break}
   case 'mend':{
    both(d.block);const wounded=[...S.party.members].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    if(resource('selene','runes')>=2&&resource('selene','mends')>0&&wounded.hp<wounded.maxHp){hero('selene').resources.runes-=2;hero('selene').resources.mends--;log(name(wounded.id)+' +'+P.heal(wounded.id,d.heal)+' HP.','good')}break;
   }
   case 'runiccover':block('kael',d.block);P.protect('kael','selene',S.protectLyra+1);gain('selene','runes',1);addSyn(8,d.name);break;
   case 'aegisburst':{const ready=resource('selene','runes')>=2;if(ready)hero('selene').resources.runes-=2;damage=dmgEnemy(t,ready?d.prepared:d.dmg);both(d.block);break}
   case 'aegisrally':both(d.block);addSyn(15,d.name);break;
   case 'shadowfeint':both(d.block);t.marked=Math.min(3,t.marked+1);gain('varyn','shadow',1);break;
   case 'crosshunt':{const ready=t.marked>0;if(ready)t.marked--;damage=dmgEnemy(t,ready?d.prepared:d.dmg);addSyn(15,d.name);break}
   case 'silenttrail':draw(2,false);poison(t,d.poison);break;
   case 'veilrune':block('varyn',d.block);block('selene',d.partnerBlock);gain('varyn','shadow',1);gain('selene','runes',1);break;
   case 'eclipse':{const n=Math.min(resource('varyn','shadow'),resource('selene','runes'));hero('varyn').resources.shadow-=n;hero('selene').resources.runes-=n;damage=dmgEnemy(t,d.dmg+d.scale*n);addSyn(15,d.name);break}
   case 'nightward':both(d.block);if(resource('varyn','shadow')>0){hero('varyn').resources.shadow--;draw(2,false)}break;
  }
  if(d.ownerId==='selene')ForbiddenTutorial.enqueue('runes');if(d.ownerId==='varyn')ForbiddenTutorial.enqueue('shadow');
  log('<b>'+d.name+'</b>'+(damage?': '+damage+' dmg.':'.'),'good');P.recordPlayed(d.ownerId);S.activeActor=null;S.lastActor=actor;S.discard.push(S.hand.splice(index,1)[0]);
  if(liveEnemies().length===0)victory();else renderBattle();ForbiddenDeckSave.save('battle');
 };
 function start(selected,difficulty='standard'){
  P.validate(selected);P.startingDeck(selected);
  ForbiddenDeckCompanions.close();document.getElementById('relationshipScreen').classList.remove('show');
  S=P.hydrate({...S,party:P.create(selected)});S.trust=loadTrust();session=null;
  hideModal();ForbiddenDeckMenu.close();newRun(difficulty);hud();ForbiddenDeckSave.save('map');
 }
 const baseChooser=difficultyChooser;
 difficultyChooser=function(){
  baseChooser();let selected=[...ids()];const body=document.getElementById('modalBody'),section=document.createElement('section');section.className='roster-picker';
  document.getElementById('modalTitle').textContent='Wybierz drużynę';document.getElementById('modalText').textContent='Wybierz jednego bohatera i jedną bohaterkę.';
  section.innerHTML='<div class="roster-columns"></div><aside class="roster-combination"></aside>';body.prepend(section);
  for(const [index,gender,label] of [[0,'male','Bohater'],[1,'female','Bohaterka']]){
   const column=document.createElement('div');column.innerHTML='<h3>'+label+'</h3>';
   for(const c of Object.values(P.characters).filter(c=>c.gender===gender)){
    const b=document.createElement('button');b.type='button';b.className='roster-choice';b.dataset.hero=c.id;
    b.innerHTML='<img alt="" width="1024" height="1536"><span><strong>'+c.name+'</strong><small>'+c.age+' · '+D.profiles[c.id].role+' · '+c.baseHp+' HP</small><span>'+D.profiles[c.id].description+'</span></span>';
    const img=b.querySelector('img');img.src=asset(c.portrait);img.onerror=()=>img.hidden=true;
    b.onclick=()=>{selected[index]=c.id;refresh()};column.appendChild(b);
   }
   section.querySelector('.roster-columns').appendChild(column);
  }
  function refresh(){
   section.querySelectorAll('[data-hero]').forEach(b=>{const yes=selected.includes(b.dataset.hero);b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',String(yes))});
   const p=D.pairs[P.pairId(selected)];section.querySelector('.roster-combination').innerHTML='<strong>'+selected.map(name).join(' + ')+'</strong><p>'+(p?.summary||'Obrona, Marked i wspólne otwarcia.')+'</p><small>Wspólna talia · '+P.startingDeck(selected).length+'</small>';
  }
  refresh();[...body.querySelectorAll('.difficulty-card')].forEach((b,i)=>{b.onclick=()=>start(selected,['explorer','standard','veteran'][i])});
 };
 const portraits=[...document.querySelectorAll('.party-banner .party-card')];
 function hud(){
  const lead=P.member('lead'),partner=P.member('partner');
  document.getElementById('topHp').textContent=lead.id[0].toUpperCase()+' '+lead.hp+'/'+lead.maxHp+' • '+partner.id[0].toUpperCase()+' '+partner.hp+'/'+partner.maxHp;
  S.party.members.forEach((h,index)=>{
   const c=P.characters[h.id],slot=index===0?'kael':'lyra',field=document.getElementById(slot+'Field');field.dataset.hero=h.id;field.querySelector(':scope>b').textContent=c.name;
   const portrait=document.querySelectorAll('#startScreen .start-portrait')[index];if(portrait){portrait.querySelector('img').src=asset(c.portrait);portrait.querySelector('img').alt=c.name;portrait.querySelector('.caption b').textContent=c.name+' · '+c.age;portrait.querySelector('.caption span').textContent=D.profiles[h.id].role}
   const map=portraits[index];map.dataset.hero=h.id;map.querySelector('strong').textContent=c.name;map.querySelector('span').textContent=D.profiles[h.id].role;map.querySelector('img').src=asset(c.portrait);map.querySelector('img').alt=c.name;
   if(!P.isLegacy()){
    const holder=field.querySelector('.hero-sketch');holder.classList.add('life-battle-portrait');
    if(holder.dataset.rosterHero!==h.id||!holder.querySelector('.roster-portrait')){holder.innerHTML='<img class="roster-portrait" alt="">';const img=holder.querySelector('img');img.src=asset(c.portrait);img.alt=c.name;img.onerror=()=>img.hidden=true;holder.dataset.rosterHero=h.id}
    let caption=field.querySelector('.life-mood');if(!caption){caption=document.createElement('em');caption.className='life-mood';field.appendChild(caption)}
    caption.classList.add('roster-resource');caption.textContent=h.id==='selene'?'Runy '+resource('selene','runes')+'/3 · '+(resource('selene','mends')?'1 × HP':'Brak leczenia'):h.id==='varyn'?'Cień '+resource('varyn','shadow')+'/3':h.id==='kael'?'Momentum '+S.momentum+'/5':'Marked · Unik';
   }else field.querySelector('.life-mood')?.classList.remove('roster-resource');
  });
  const mom=document.getElementById('momText'),stat=mom.closest('.stat');stat.querySelector('.statline>span').textContent=lead.id==='kael'?'Momentum Kaela':'Cień Varyna';mom.textContent=S.momentum+' / '+(lead.id==='kael'?5:3);document.getElementById('momFill').style.width=S.momentum/(lead.id==='kael'?5:3)*100+'%';
  document.querySelector('#combatDetails .char-head h2').textContent=ids().map(name).join(' + ');
  const menu=document.querySelector('#menuCompanions strong');if(menu)menu.textContent=ids().map(name).join(' + ')+' · Wspólne chwile';
  const rel=document.querySelector('#menuRelationship strong');if(rel)rel.textContent='🤝 '+ids().map(name).join(' + ');
  if(!P.isLegacy()){
   const tip=document.querySelector('#combatDetails .tip:not(.combat-defense)');if(tip)tip.textContent='Pancerz bohatera · Amulet drużyny';
  }
   for(const [id,index] of [['rPhysK',0],['rMagicK',0],['rToxinK',0],['rPhysL',1],['rMagicL',1],['rToxinL',1]]){const strong=document.getElementById(id);strong.parentElement.firstChild.nodeValue=name(S.party.members[index].id)+' '+(id.includes('Phys')?'⚔️ ':id.includes('Magic')?'✨ ':'☠️ ');}
 }
 const baseBattle=renderBattle;renderBattle=function(...args){const r=baseBattle(...args);hud();return r};
 const baseMap=renderMap;renderMap=function(...args){const r=baseMap(...args);hud();return r};
 const baseEquipment=showEquipment;
 showEquipment=function(){
  if(P.isLegacy())return baseEquipment();
  showModal('Ekwipunek','Pancerz bohatera · Amulet drużyny',()=>{
   const w=document.createElement('div'),g=document.createElement('div');g.className='reward-grid';
   S.party.members.forEach(h=>{const x=document.createElement('article');x.className='slot';x.innerHTML='<h3>'+name(h.id)+'</h3><p>'+(gearDefs[h.equipment.armor]?.name||'Brak wyposażenia')+'</p>';w.appendChild(x)});
   const shared=document.createElement('article');shared.className='slot';shared.innerHTML='<h3>Amulet drużyny</h3><p>'+(gearDefs[S.party.equipment.amulet]?.name||'Brak wyposażenia')+'</p>';w.appendChild(shared);
   for(const id of [...new Set([...S.inventory,...S.party.members.map(h=>h.equipment.armor),S.party.equipment.amulet])].filter(id=>gearDefs[id])){
    const d=gearDefs[id],b=document.createElement('button');b.className='equip-card';b.innerHTML='<h3>'+d.name+'</h3><p>'+d.desc+'</p>';b.onclick=()=>{
     if(d.slot==='amulet'){S.party.equipment.amulet=id;ForbiddenDeckSave.save();showEquipment();return}
     showModal('Pancerz bohatera',d.name,()=>grid(S.party.members.map(h=>[name(h.id),'Pancerz bohatera',()=>{h.equipment.armor=id;S.party.members.filter(o=>o!==h&&o.equipment.armor===id).forEach(o=>o.equipment.armor=null);ForbiddenDeckSave.save();showEquipment()}])),true);
    };g.appendChild(b);
   }
   w.appendChild(g);w.appendChild(choiceBtn('Wróć','Zamknij ekwipunek.',hideModal));return w;
  },true);
 };
 const baseLevel=levelUp;levelUp=function(done){if(P.isLegacy())return baseLevel(done);S.pendingLevel=false;showModal('Awans drużyny — poziom '+S.level,'Ulepsz wybraną postać.',()=>grid([
  ...S.party.members.map((h,index)=>[name(h.id),'Wytrzymałość',()=>{h.maxHp+=index?5:6;P.heal(h.id,index?7:8);hideModal();done()}]),
  ['Synergy','+10 Synergy',()=>{S.startSynergy=Math.min(30,S.startSynergy+10);hideModal();done()}],['Energia','+1 energia',()=>{S.firstTurnEnergy=1;hideModal();done()}]
 ]))};
 const baseEvent=eventNode;eventNode=function(){if(P.isLegacy())return baseEvent();showModal('Rozmowa na szlaku',pair().summary,()=>grid([
  ['Wspólna talia','+1 karta',()=>{S.deck.push(ids().includes('selene')?'spark':'knife');hideModal();advance()}],['Odpoczynek','+6 HP',()=>{P.healAll(6);hideModal();advance()}]
 ]))};

 const baseCamp=camp;
 camp=function(){const r=baseCamp();if(!P.isLegacy()){
  document.getElementById('modalText').textContent=pair().camp;
  const choices=[...document.querySelectorAll('#modalBody .choice')];
  const rest=choices.find(b=>b.textContent.includes('Odpoczynek'));if(rest)rest.querySelector('span').textContent='+14 HP dla obojga.';
  const talk=choices.find(b=>b.textContent.includes('Rozmowa'));if(talk)talk.querySelector('span').textContent=nextScene()?'Każda droga: +6 Trust i osłona w następnej walce.':'+6 Trust';
 }return r};
 const relKey=()=>P.pairKey('forbidden_deck_relationship_v1'),albumKey=()=>P.pairKey('forbidden_deck_companions_v1');
 const loadRel=()=>ForbiddenDeckRelationship.load(),saveRel=data=>localStorage.setItem(relKey(),JSON.stringify(data));
 function loadAlbum(){try{const raw=JSON.parse(localStorage.getItem(albumKey())||'null');if(raw?.schema===1)return {seen:[],choices:{},active:null,banter:true,motion:true,...raw}}catch{}return {schema:1,seen:[],choices:{},active:null,banter:true,motion:true}}
 const saveAlbum=data=>localStorage.setItem(albumKey(),JSON.stringify(data));
 function nextScene(){const data=loadRel();return pair()?.scenes.find(s=>S.trust>=s.threshold&&!data.seen.includes(s.id))||null}
 let session=null;
 function beginScene(scene,replay=false,returnTo='album'){
  if(!scene)return;session={pairId:S.party.relationshipId,id:scene.id,index:0,phase:'opening',choice:null,replay,returnTo,act:S.act,stage:S.stage,narrative:window.ForbiddenDeckNarrative?.capture()};renderScene();
 }
 function resumeScene(saved){
  const scene=pair()?.scenes.find(s=>s.id===saved?.id);if(!scene||saved.pairId!==S.party.relationshipId)return;
  session={...saved,index:Math.max(0,Number.isInteger(saved.index)?saved.index:0)};
  if(!['opening','choice','ending'].includes(session.phase))session.phase='opening';
  if(!['friendship','romance','skipped'].includes(session.choice))session.choice=null;
  if(session.phase==='ending'&&!session.choice)session.phase='choice';
  if(session.choice==='romance'&&!ForbiddenDeckRelationship.romanceEnabled()){session.choice=null;session.phase='choice';session.index=0}
  const lines=session.phase==='ending'?(session.choice==='romance'?(scene.romance||pair().romance):(scene.friendship||pair().friendship)):scene.lines;
  session.index=Math.min(session.index,lines.length-1);
  renderScene();
 }
 function renderScene(){
  const scene=pair().scenes.find(s=>s.id===session.id),p=pair();
  if(session.choice==='romance'&&!ForbiddenDeckRelationship.romanceEnabled()){session.choice=null;session.phase='choice';session.index=0}
  const album=loadAlbum();album.active={...session};saveAlbum(album);
  if(!session.replay){S.relationshipScene={...session};ForbiddenDeckSave.save('map')}
  const lines=session.phase==='ending'?(session.choice==='romance'?(scene.romance||p.romance):(scene.friendship||p.friendship)):scene.lines;
  const line=lines[Math.min(session.index,lines.length-1)];
  const root=document.createElement('section');root.className='roster-story';root.classList.toggle('roster-still',!loadAlbum().motion||matchMedia('(prefers-reduced-motion: reduce)').matches);root.dataset.scene=scene.id;
  const art=document.createElement('img');art.className='roster-scene-art';art.src=asset(p.art);art.alt=p.title;art.onerror=()=>art.hidden=true;root.appendChild(art);
  const panel=document.createElement('div');panel.className='roster-story-words';
  const speaker=document.createElement('strong');speaker.textContent=session.phase==='choice'?'Wybór':line[0];const text=document.createElement('p');text.textContent=session.phase==='choice'?'Zaufanie i bliskość są osobnymi wyborami.':line[1];panel.append(speaker,text);
  if(session.phase==='ending'&&session.choice==='romance'&&session.index===lines.length-1){const after=document.createElement('p');after.className='roster-afterglow';after.textContent=D.afterglow;panel.appendChild(after)}
  if(session.phase==='opening'&&session.index===0)window.ForbiddenDeckNarrative?.appendCallback(panel,scene.id,session.narrative);
  const actions=document.createElement('div');actions.className='choices';
  if(session.phase==='choice'){
   const f=choiceBtn(scene.friendshipLabel||'Nie wracajmy jeszcze do drogi.','Przyjaźń',()=>choose('friendship'));f.dataset.rosterChoice='friendship';actions.appendChild(f);
   if(ForbiddenDeckRelationship.romanceEnabled()&&scene.threshold>=40){const r=choiceBtn(scene.romanceLabel||'Zostań bliżej. Jeśli też tego chcesz.','Bliskość',()=>choose('romance'));r.dataset.rosterChoice='romance';actions.appendChild(r)}
   const s=choiceBtn('Nie teraz. Zostańmy przy rozmowie.','Pomiń',()=>choose('skipped'));s.dataset.rosterChoice='skipped';actions.appendChild(s);
  }else{const n=choiceBtn('Dalej','',()=>{if(session.index<lines.length-1){session.index++;renderScene()}else if(session.phase==='opening'){session.phase='choice';session.index=0;renderScene()}else finishScene()});n.id='rosterSceneNext';actions.appendChild(n)}
  panel.appendChild(actions);root.appendChild(panel);
  showModal(scene.title,session.replay?'Ponowne obejrzenie nie daje nagród.':'Każda droga: +6 Trust i osłona w następnej walce.',()=>root,true);
  document.getElementById('modalClose').onclick=()=>{hideModal();ForbiddenDeckSave.save('map')};
  actions.querySelector('button')?.focus({preventScroll:true});
 }
 function choose(choice){session.choice=choice;session.phase='ending';session.index=0;if(choice==='skipped')finishScene();else renderScene()}
 function finishScene(){
  if(!session||session.pairId!==S.party.relationshipId)return;
  if(session.choice==='romance'&&!ForbiddenDeckRelationship.romanceEnabled()){session.choice=null;session.phase='choice';session.index=0;renderScene();return}
  const ending={...session},data=loadRel(),album=loadAlbum();
  if(!ending.replay&&!data.seen.includes(ending.id)){
   data.seen.push(ending.id);data.choices.push({scene:ending.id,choice:ending.choice,at:new Date().toISOString()});data.stats.scenes++;data.stats.supportive++;data.pendingBoon='guard';
   data.romance[ending.id]=ending.choice;saveRel(data);S.trust=Math.min(100,S.trust+6);saveTrust();
  }
  if(!album.seen.includes(ending.id))album.seen.push(ending.id);if(!Object.hasOwn(album.choices,ending.id))album.choices[ending.id]=ending.choice;
  album.active=null;saveAlbum(album);session=null;S.relationshipScene=null;hideModal();
  if(!ending.replay){if(S.act===ending.act&&S.stage===ending.stage)advance();else if(document.getElementById('battleScreen').classList.contains('active'))renderBattle();else renderMap();ForbiddenDeckSave.save()}else if(ending.returnTo==='relationship')renderRelationship();else openAlbum();
 }
 function campDialogue(){
  if(S.relationshipScene?.pairId===S.party.relationshipId)return resumeScene(S.relationshipScene);
  const next=nextScene();if(next)return beginScene(next,false);return roadScene();
 }
 function roadScene(){
  const scene=pair().scenes[Math.min(S.act+(S.stage>4?1:0),pair().scenes.length-1)],root=document.createElement('div');root.className='roster-road';const img=document.createElement('img');img.src=asset(pair().art);img.alt=scene.title;img.onerror=()=>img.hidden=true;root.appendChild(img);
  for(const [speaker,words] of scene.lines){const p=document.createElement('p'),b=document.createElement('b');b.textContent=speaker+': ';p.append(b,document.createTextNode(words));root.appendChild(p)}
  root.appendChild(choiceBtn('Zachowaj chwilę','+6 Trust',()=>{S.trust=Math.min(100,S.trust+6);saveTrust();hideModal();advance()}));showModal(scene.title,'Rozmowa nie wymaga romansu.',()=>root);
 }
 function renderRelationship(){
  document.querySelector('#relationshipScreen h2').textContent=ids().map(name).join(' + ');
  const body=document.getElementById('relationshipBody'),data=loadRel();body.replaceChildren();const title=document.createElement('h3');title.textContent=pair().title+' · Trust '+S.trust;body.appendChild(title);
  const description=document.createElement('p');description.textContent=pair().summary;body.appendChild(description);
  for(const scene of pair().scenes){const b=document.createElement('button');b.className='choice';const seen=data.seen.includes(scene.id);b.textContent=scene.threshold+' Trust · '+scene.title+(seen?' ✓':'');b.disabled=!seen;b.onclick=()=>beginScene(scene,true,'relationship');body.appendChild(b)}
  const setting=document.createElement('label');setting.className='romance-setting';const input=document.createElement('input');input.type='checkbox';input.checked=ForbiddenDeckRelationship.romanceEnabled();input.onchange=()=>ForbiddenDeckRelationship.setRomanceEnabled(input.checked);setting.append(input,document.createTextNode('Romantyczne sceny'));const scope=document.createElement('small');scope.textContent='Opcjonalny romans: flirt, pocałunki i intymność zakończona wygaszeniem sceny. Bez graficznych opisów seksu i nagości. Nagrody są takie same również bez romansu.';setting.appendChild(scope);body.appendChild(setting);
  const note=document.createElement('p');note.textContent='Zaufanie i bliskość są osobnymi wyborami.';body.appendChild(note);
 }
 function openAlbum(){
  const screen=document.getElementById('companionsScreen'),data=loadAlbum();screen.replaceChildren();screen.hidden=false;document.body.classList.add('companions-open');
  const shell=document.createElement('div');shell.className='companions-shell';shell.innerHTML='<header class="companions-header"><h2 id="companionsTitle">'+ids().map(name).join(' + ')+' · Wspólne chwile</h2><button class="btn" id="companionsClose">Wróć do gry</button></header><p>'+pair().summary+'</p><p>Bez nagród za odtwarzanie.</p><div class="life-album"></div>';
  for(const scene of pair().scenes){const b=document.createElement('button');b.className='life-memory';b.dataset.episode=scene.id;b.disabled=S.trust<scene.threshold&&!loadRel().seen.includes(scene.id);b.innerHTML='<img alt=""><span class="life-memory-copy"><strong>'+scene.title+'</strong><span>'+scene.threshold+' Trust</span><b>'+(data.active?.id===scene.id?'Wznów rozmowę':data.seen.includes(scene.id)?'Przeżyj ponownie':'Odkryj podczas wyprawy')+'</b></span>';const img=b.querySelector('img');img.src=asset(pair().art);img.onerror=()=>img.hidden=true;b.onclick=()=>{ForbiddenDeckCompanions.close();if(data.active?.id===scene.id)resumeScene(data.active);else beginScene(scene,true)};shell.querySelector('.life-album').appendChild(b)}
  const profiles=document.createElement('div');profiles.className='life-profiles';
  for(const h of S.party.members){const c=P.characters[h.id],article=document.createElement('article');article.innerHTML='<img alt="" width="1024" height="1536"><div><h3>'+c.name+' · '+c.age+'</h3><p>'+D.profiles[h.id].bio+'</p></div>';const img=article.querySelector('img');img.src=asset(c.portrait);img.alt=c.name;img.onerror=()=>img.hidden=true;profiles.appendChild(article)}
  shell.querySelector('.life-album').before(profiles);
  const settings=document.createElement('div');settings.className='life-settings';
  for(const [key,label] of [['motion','Ruch kamery i światła'],['banter','Krótkie reakcje w walce']]){const control=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=data[key];input.onchange=()=>{const d=loadAlbum();d[key]=input.checked;saveAlbum(d);renderBanter()};control.append(input,document.createTextNode(label));settings.appendChild(control)}shell.appendChild(settings);
  window.ForbiddenDeckNarrative?.appendChronicle(shell);
  screen.appendChild(shell);shell.querySelector('#companionsClose').onclick=()=>ForbiddenDeckCompanions.close();shell.querySelector('#companionsClose').focus({preventScroll:true});
 }
 function react(kind){if(P.isLegacy())return;const key=kind.startsWith('hurt')?'hurt':kind==='protect'?'combo':['combo','win'].includes(kind)?kind:'start';S.companionMoment??={used:[]};S.companionMoment.bark=key;renderBanter()}
 function renderBanter(){
  if(P.isLegacy())return;let box=document.getElementById('companionBanter');if(!box){box=document.createElement('div');box.id='companionBanter';box.className='companion-banter';document.getElementById('battlefieldVisual').appendChild(box)}
  const lines=pair()?.barks[S.companionMoment?.bark]||pair()?.barks.start;if(!lines)return;
  box.hidden=!loadAlbum().banter;box.replaceChildren();for(const [speaker,text] of lines){const p=document.createElement('p'),b=document.createElement('strong');b.textContent=speaker+' ';p.append(b,document.createTextNode(text));box.appendChild(p)}
 }
 window.addEventListener('forbidden-deck:restore',()=>{hud();if(!P.isLegacy()&&!document.getElementById('battleScreen').classList.contains('active')&&S.relationshipScene?.pairId===S.party.relationshipId)resumeScene(S.relationshipScene)});
 window.addEventListener('forbidden-deck:language',()=>{if(session&&document.querySelector('#overlay.show .roster-story'))renderScene()});
 window.ForbiddenDeckRoster={start,hud,nextScene,campDialogue,roadScene,renderRelationship,openAlbum,react,renderBanter,loadAlbum};
 hud();
})();
