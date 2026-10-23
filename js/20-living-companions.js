/* Optional character stories; separate save, no changes to combat/Trust rewards. */
(()=>{
 'use strict';
 const KEY=()=>ForbiddenDeckParty.pairKey('forbidden_deck_companions_v1'),episodes=window.ForbiddenDeckStories;
 const asset=path=>globalThis.ForbiddenDeckPreviewAssets?.[path]||path;
 const atlas='assets/portraits/expressions.webp';
 const portraits={Kael:'assets/portraits/kael.webp',Lyra:'assets/portraits/lyra.webp'};
 const ids=episodes.map(e=>e.id);
 function defaults(){return{schema:1,unlocked:['bread'],seen:[],choices:{},active:null,motion:true,banter:true}}
 function load(){
  try{
   const raw=JSON.parse(localStorage.getItem(KEY())||'null');if(raw?.schema!==1)return defaults();
   const unlocked=[...new Set(['bread',...(Array.isArray(raw.unlocked)?raw.unlocked:[]).filter(id=>ids.includes(id))])];
   const choices={};for(const e of episodes)if(e.options.some(o=>o.id===raw.choices?.[e.id]))choices[e.id]=raw.choices[e.id];
   return{schema:1,unlocked,seen:(Array.isArray(raw.seen)?raw.seen:[]).filter(id=>unlocked.includes(id)),choices,active:raw.active&&unlocked.includes(raw.active.id)?raw.active:null,motion:raw.motion!==false,banter:raw.banter!==false};
  }catch{return defaults()}
 }
 function save(data){try{localStorage.setItem(KEY(),JSON.stringify(data))}catch(error){console.warn('Nie udało się zapisać wspólnych chwil.',error)}}
 function unlock(id){if(!ForbiddenDeckParty.isLegacy())return false;const data=load();if(!data.unlocked.includes(id)){data.unlocked.push(id);save(data);refreshEntry();return true}return false}
 function remember(id,choice){const data=load();if(!data.seen.includes(id))data.seen.push(id);if(!Object.hasOwn(data.choices,id))data.choices[id]=choice;data.active=null;save(data);refreshEntry()}
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 function motionAllowed(){return load().motion&&!reduced.matches}
 function syncMotion(){document.body.classList.toggle('companions-still',!motionAllowed())}
 reduced.addEventListener('change',syncMotion);syncMotion();
 function faceMarkup(name,mood='focused',label=name){return `<span class="life-face" data-person="${name==='Kael'?'kael':'lyra'}" data-emotion="${mood}"><img src="${asset(atlas)}" alt="${label}" width="1536" height="1024"></span>`}
 function wireFaces(root){root.querySelectorAll('.life-face img').forEach(img=>{
  img.onerror=()=>{img.onerror=null;img.parentElement.classList.add('life-face-fallback');img.src=asset(portraits[img.parentElement.dataset.person==='kael'?'Kael':'Lyra'])};
  if(img.complete&&!img.naturalWidth)img.onerror();
 })}

 const screen=document.createElement('section');screen.id='companionsScreen';screen.hidden=true;screen.className='companions-screen';screen.setAttribute('role','dialog');screen.setAttribute('aria-modal','true');screen.setAttribute('aria-labelledby','companionsTitle');document.body.appendChild(screen);
 let returnFocus=null,session=null;
 function show(){if(screen.hidden)returnFocus=document.activeElement;screen.hidden=false;document.body.classList.add('companions-open')}
 function close(){screen.hidden=true;session=null;document.body.classList.remove('companions-open');if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true})}
 function openAlbum(){if(!ForbiddenDeckParty.isLegacy())return window.ForbiddenDeckRoster?.openAlbum();
  show();session=null;const data=load();
  screen.innerHTML=`<div class="companions-shell"><header class="companions-header"><div><span class="life-eyebrow">LUDZIE ZA KARTAMI</span><h2 id="companionsTitle">Wspólne chwile</h2><p>Kael i Lyra mają życie także pomiędzy walkami.</p></div><button class="btn" id="companionsClose">Wróć do gry</button></header><div class="life-profiles"><article><img src="assets/portraits/kael.webp" alt="Kael" width="1024" height="1536"><div><span>KAEL · 32 LATA</span><h3>Pierwszy podnosi tarczę.<br>Ostatni prosi o pomoc.</h3><p>Nie lubi ciszy po walce. Gotuje za słoną zupę i zawsze sprawdza, czy ktoś nie został z tyłu.</p></div></article><article><img src="assets/portraits/lyra.webp" alt="Lyra" width="1024" height="1536"><div><span>LYRA · 29 LAT</span><h3>Widzi więcej,<br>niż mówi.</h3><p>Chowa troskę w żartach. Pamięta drogę do domu i uparcie nosi dwa kubki.</p></div></article></div><div class="life-album-head"><h3>Ich małe historie</h3><span>${data.seen.length} / ${episodes.length} przeżytych chwil</span></div><p class="life-caption">Odkrywaj je przez wspólne doświadczenia. Rozmowy są opcjonalne, bez nagród i zmian statystyk.</p><div class="life-album"></div><div class="life-settings"><label><input id="lifeMotion" type="checkbox" ${data.motion?'checked':''}> Ruch kamery i światła<small>Ograniczony ruch w urządzeniu ma pierwszeństwo.</small></label><label><input id="lifeBanter" type="checkbox" ${data.banter?'checked':''}> Krótkie reakcje w walce<small>Nie zatrzymują tury ani zagrywania kart.</small></label></div></div>`;
  screen.querySelector('#companionsClose').onclick=close;
  const grid=screen.querySelector('.life-album');
  for(const e of episodes){
   const available=data.unlocked.includes(e.id),seen=data.seen.includes(e.id),button=document.createElement('button');
   button.className='life-memory'+(available?'':' locked');button.disabled=!available;button.dataset.episode=e.id;
   button.innerHTML=`<img src="${asset(e.art)}" alt="" width="1672" height="941"><span class="life-memory-copy"><small>${available?(seen?'ZAPAMIĘTANE':'NOWA CHWILA'):'JESZCZE PRZED WAMI'}</small><strong>${e.title}</strong><span>${available?e.subtitle:e.condition}</span><b>${available?(data.active?.id===e.id?'Wznów rozmowę →':seen?'Przeżyj ponownie →':'Zatrzymaj się z nimi →'):'Odkryj podczas wyprawy'}</b></span>`;
   button.onclick=()=>openEpisode(e.id);grid.appendChild(button);
  }
  for(const [id,key] of [['lifeMotion','motion'],['lifeBanter','banter']])screen.querySelector('#'+id).onchange=event=>{const state=load();state[key]=event.target.checked;save(state);syncMotion();renderBanter()};
  window.ForbiddenDeckNarrative?.appendChronicle(screen.querySelector('.companions-shell'));
  screen.querySelector('#companionsClose').focus({preventScroll:true});
 }
 function openEpisode(id){if(!ForbiddenDeckParty.isLegacy())return window.ForbiddenDeckRoster?.openAlbum();
  const data=load(),e=episodes.find(e=>e.id===id);if(!e||!data.unlocked.includes(id))return;
  show();const old=data.active?.id===id?data.active:null;
  const choice=e.options.some(o=>o.id===old?.choice)?old.choice:null;
  const phase=old?.phase==='ending'&&choice?'ending':old?.phase==='choice'?'choice':'opening';
  const count=phase==='ending'?e.options.find(o=>o.id===choice).lines.length:e.opening.length;
  session={id,phase,index:Number.isInteger(old?.index)?Math.max(0,Math.min(count-1,old.index)):0,choice};renderEpisode();
 }
 function renderEpisode(){
  const e=episodes.find(e=>e.id===session.id),choosing=session.phase==='choice';
  const [name,mood,emotion,text,note]=choosing?e.opening.at(-1):session.phase==='ending'?e.options.find(o=>o.id===session.choice).lines[session.index]:e.opening[session.index];
  const data=load();data.active={...session};save(data);
  screen.innerHTML=`<div class="life-cinema"><div class="life-camera"><img class="life-background" src="${asset(e.art)}" alt="${e.subtitle}" width="1672" height="941"></div><div class="life-shade"></div><div class="life-dust" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i style="--i:${i}"></i>`).join('')}</div><header class="life-cinema-header"><div><span class="life-eyebrow">WSPÓLNE CHWILE · ${e.place}</span><h2 id="companionsTitle">${e.title}</h2></div><button class="btn" id="lifeLeave">Zamknij · wrócę później</button></header><section class="life-dialogue" aria-label="Rozmowa"><div class="life-speaker">${faceMarkup(name,mood,name+' — '+emotion)}<div><strong>${name}</strong><span>${emotion}</span></div><span class="life-scene-step">${choosing?'TWÓJ WYBÓR':session.phase==='ending'?`${session.index+1} / ${e.options.find(o=>o.id===session.choice).lines.length} · odpowiedź`:`${session.index+1} / ${e.opening.length}`}</span></div><div class="life-words" aria-live="polite"><p></p><em></em></div><div class="life-options"></div><footer class="life-dialogue-footer"><button class="btn" id="lifeSkip">Pomiń rozmowę</button><span>${data.seen.includes(e.id)?'Ponownie oglądasz tę chwilę; pierwszy wybór pozostaje zapisany.':'Bez pośpiechu. To Wasza chwila.'}</span></footer></section><button class="life-motion" id="lifeMotionPause" aria-pressed="${!motionAllowed()}">${motionAllowed()?'Wstrzymaj ruch':'Ruch wyłączony'}</button></div>`;
  screen.querySelector('.life-words p').textContent=choosing?e.question:text;
  screen.querySelector('.life-words em').textContent=choosing?'Wybierz, co zostanie między nimi. Każda droga ma taką samą wartość.':note;
  const options=screen.querySelector('.life-options');
  if(choosing)for(const o of e.options){
   const button=document.createElement('button');button.className='life-choice';button.dataset.lifeChoice=o.id;button.innerHTML='<strong></strong><span></span>';button.querySelector('strong').textContent=o.label;button.querySelector('span').textContent=o.hint;button.onclick=()=>{session.phase='ending';session.index=0;session.choice=o.id;renderEpisode()};options.appendChild(button);
  }else{
   const button=document.createElement('button');button.id='lifeNext';button.className='primary';const last=session.phase==='ending'&&session.index===e.options.find(o=>o.id===session.choice).lines.length-1;button.textContent=last?'Zachowaj tę chwilę':'Dalej →';
   button.onclick=()=>{if(last){remember(session.id,session.choice);openAlbum();return}if(session.phase==='opening'&&session.index===e.opening.length-1){session.phase='choice';session.index=0}else session.index++;renderEpisode()};options.appendChild(button);
  }
  screen.querySelector('#lifeLeave').onclick=close;
  screen.querySelector('#lifeSkip').onclick=()=>{const data=load();data.active=null;save(data);openAlbum()};
  screen.querySelector('#lifeMotionPause').onclick=()=>{const data=load();data.motion=!motionAllowed();save(data);syncMotion();const button=screen.querySelector('#lifeMotionPause');button.textContent=motionAllowed()?'Wstrzymaj ruch':'Ruch wyłączony';button.setAttribute('aria-pressed',String(!motionAllowed()))};
  wireFaces(screen);(screen.querySelector('#lifeNext')||screen.querySelector('[data-life-choice]'))?.focus({preventScroll:true});
 }
 document.addEventListener('keydown',event=>{
  if(screen.hidden)return;
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();return}
  if(event.key!=='Tab')return;
  const controls=[...screen.querySelectorAll('button:not([disabled]),input')],first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
 },true);
 const menu=document.createElement('button');menu.id='menuCompanions';menu.className='start-action life-menu-action';menu.innerHTML='<strong>Kael i Lyra · Wspólne chwile</strong><span>Poznaj ludzi, z którymi wyruszasz. Ilustrowane rozmowy i pamięć wypraw.</span>';menu.onclick=openAlbum;document.querySelector('#startScreen .start-actions')?.prepend(menu);
 const mapEntry=document.createElement('button');mapEntry.id='mapCompanions';mapEntry.className='life-map-entry';mapEntry.onclick=openAlbum;document.getElementById('journeyVista')?.after(mapEntry);
 function refreshEntry(){const data=load();mapEntry.innerHTML=`<span>ZA KAŻDĄ KARTĄ JEST CZŁOWIEK</span><strong>Wspólne chwile · ${data.unlocked.length-data.seen.length} do odkrycia →</strong>`}refreshEntry();

 let currentBark=null;
 const barks={
  start:[['Lyra','focused','Czujna','Ty patrz przed siebie, ja za nas oboje.'],['Kael','focused','Skupiony','Umowa. I wracamy oboje.']],
  home:[['Lyra','warm','Rozbawiona','Jeszcze ta walka. Potem naprawdę robimy śniadanie.'],['Kael','warm','Ciepły','Nie odkładamy go do następnego wzgórza.']],
  protect:[['Kael','focused','Stanowczy','Mam cię. Rób swoje.'],['Lyra','warm','Uważna','Widziałam. Teraz moja kolej.']],
  hurtKael:[['Lyra','concerned','Przejęta','Kael, spójrz na mnie. Jeszcze nie skończyliśmy.'],['Kael','concerned','Uparty','Słyszę cię. Nadal tu jestem.']],
  hurtLyra:[['Kael','concerned','Zaniepokojony','Zostań za mną. Dam ci chwilę.'],['Lyra','focused','Zdeterminowana','Chwilę. Nie całą walkę.']],
  combo:[['Lyra','warm','Pewna siebie','Teraz. Wiesz, co robić.'],['Kael','focused','Zgrany','Już idę.']],
  win:[['Lyra','warm','Z ulgą','Dwoje przyszło. Dwoje odchodzi.'],['Kael','warm','Spokojniejszy','Tak miało być.']],
  loss:[['Kael','concerned','Cicho','Następnym razem znajdziemy inną drogę.'],['Lyra','concerned','Blisko','Tylko nie ruszaj beze mnie.']]
 };
 function renderPortraits(){if(!ForbiddenDeckParty.isLegacy())return;
  for(const [key,name] of [['kael','Kael'],['lyra','Lyra']]){
   const holder=document.querySelector('#'+key+'Field .hero-sketch'),target=document.getElementById(key+'Field');if(!holder||!target)continue;
   const hp=key==='kael'?S.kaelHp:S.lyraHp,max=key==='kael'?S.kaelMaxHp:S.lyraMaxHp,line=currentBark?.find(l=>l[0]===name),hurt=hp<=max*.3;
   const mood=hurt?'concerned':line?.[1]||'focused',emotion=hurt?'Potrzebuje wsparcia':line?.[2]||'W gotowości';
   if(holder.dataset.mood!==mood||!holder.querySelector('.life-face')){holder.dataset.mood=mood;holder.classList.add('life-battle-portrait');holder.innerHTML=faceMarkup(name,mood,name+' — '+emotion);wireFaces(holder)}
   let caption=target.querySelector('.life-mood');if(!caption){caption=document.createElement('em');caption.className='life-mood';target.appendChild(caption)}caption.textContent=emotion;target.dataset.lifeMood=hurt?'hurt':'ready';
  }
  const between=document.querySelector('.duo-figures .versus');if(between)between.textContent='DUET';
 }
 function renderBanter(){if(!ForbiddenDeckParty.isLegacy())return window.ForbiddenDeckRoster?.renderBanter();
  let box=document.getElementById('companionBanter');if(!box){box=document.createElement('div');box.id='companionBanter';box.className='companion-banter';box.setAttribute('aria-live','polite');document.querySelector('#battlefieldVisual .duo-figures')?.after(box)}
  box.hidden=!load().banter||!currentBark;
  if(currentBark&&box.dataset.lines!==JSON.stringify(currentBark)){box.dataset.lines=JSON.stringify(currentBark);box.replaceChildren();for(const [name,,,text] of currentBark){const p=document.createElement('p'),speaker=document.createElement('strong');speaker.textContent=name+' ';p.append(speaker,document.createTextNode(text));box.appendChild(p)}}
  renderPortraits();
 }
 function context(){if(!S.companionMoment||typeof S.companionMoment!=='object')S.companionMoment={bark:'start',used:[]};if(!Array.isArray(S.companionMoment.used))S.companionMoment.used=[];return S.companionMoment}
 function once(id){const state=context();if(state.used.includes(id))return false;state.used.push(id);return true}
 function react(id){if(!ForbiddenDeckParty.isLegacy())return window.ForbiddenDeckRoster?.react(id);currentBark=barks[id];context().bark=id;renderBanter()}
 const baseRender=renderBattle;renderBattle=function(){const result=baseRender();renderBanter();return result};
 const baseStart=startBattle;startBattle=function(...args){S.companionMoment={bark:'start',used:[]};const result=baseStart(...args);react(load().choices.bread==='home'?'home':'start');window.ForbiddenDeckSave?.save?.('battle');return result};
 const baseProtect=resolveProtectedTarget;resolveProtectedTarget=function(target,intent){const result=baseProtect(target,intent);if(target===ForbiddenDeckParty.member('partner').id&&result===ForbiddenDeckParty.member('lead').id){unlock('shield');if(once('protect'))react('protect')}return result};
 const baseDamage=dmgPlayer;dmgPlayer=function(...args){const result=baseDamage(...args);if(result.hp>0&&S.kaelHp>0&&S.lyraHp>0){const lyra=(result.target||args[2])===ForbiddenDeckParty.member('partner').id,hp=lyra?S.lyraHp:S.kaelHp,max=lyra?S.lyraMaxHp:S.kaelMaxHp;if(hp<=max*.3){unlock('fear');if(once(lyra?'hurtLyra':'hurtKael'))react(lyra?'hurtLyra':'hurtKael')}}return result};
 const baseSyn=addSyn;addSyn=function(...args){const before=S.synergy,result=baseSyn(...args);if(before<50&&S.synergy>=50&&once('combo'))react('combo');return result};
 const baseVictory=victory;victory=function(...args){const first=!S.battleOver,boss=S.currentNode?.type==='boss',act=S.act||0;const result=baseVictory(...args);if(first){const discovered=unlock('cups');if(boss&&act===0)unlock('gate');react('win');if(discovered){const note=document.createElement('aside');note.className='life-unlocked-note';note.innerHTML='<strong>Zapamiętacie tę walkę.</strong><span>„Dwa kubki” czekają w albumie na mapie.</span>';document.getElementById('modalBody').prepend(note)}}return result};
 const baseDefeat=defeat;defeat=function(...args){const result=baseDefeat(...args);react('loss');return result};
 const baseNew=newRun;newRun=function(...args){S.companionMoment=null;currentBark=null;return baseNew(...args)};
 window.addEventListener('forbidden-deck:restore',()=>{currentBark=barks[context().bark]||barks.start;renderBanter()});
 // Hooks below the previously bound click handlers preserve both controls and event reactions.
 renderPortraits();
 window.ForbiddenDeckCompanions={load,open:openAlbum,close,openEpisode};
})();
