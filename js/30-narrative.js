/* Saved choices are narrative facts, never additional combat bonuses. */
(()=>{
 'use strict';
 const D=ForbiddenDeckNarrativeData,P=ForbiddenDeckParty;
 const legacyScenes={trust20:{title:'Pierwszy rytm',options:{'right-side':'Ja biorę prawą stronę. Ty obserwuj resztę.','signals':'Ustalmy trzy sygnały i żadnych improwizacji.'}},trust40:{title:'W świetle ognia'},trust60:{title:'Bez rozkazu'},trust80:{title:'Jedno spojrzenie',options:{'both-return':'Wracamy oboje. To jedyna część planu, której nie zmieniamy.','one-look':'Jedno spojrzenie. Więcej nie będzie potrzebne.'}}};
 const romantic=()=>ForbiddenDeckRelationship.romanceEnabled();
 function sceneFor(pairId,id){return pairId==='kael+lyra'?legacyScenes[id]:ForbiddenDeckRosterData.pairs[pairId]?.scenes.find(s=>s.id===id)}
 function validChoice(pairId,id,choice){if(!/^trust(20|40|60|80)$/.test(id))return false;const scene=sceneFor(pairId,id);if(!scene)return false;if(scene.options)return Object.hasOwn(scene.options,choice);return ['friendship','romance','skipped'].includes(choice)&&(id!=='trust20'||choice!=='romance')}
 function clean(raw){
  if(!raw||raw.schema!==1||!Object.hasOwn(D.pairs,raw.pairId))return null;
  const choices=[],seen=new Set();
  for(const row of Array.isArray(raw.choices)?raw.choices:[]){if(!row||seen.has(row.scene)||!validChoice(raw.pairId,row.scene,row.choice))continue;seen.add(row.scene);choices.push({scene:row.scene,choice:row.choice})}
  choices.sort((a,b)=>Number(a.scene.slice(5))-Number(b.scene.slice(5)));
  const companionChoices={};
  if(raw.pairId==='kael+lyra')for(const e of ForbiddenDeckStories){const choice=raw.companionChoices?.[e.id];if(e.options.some(o=>o.id===choice))companionChoices[e.id]=choice}
  const roadside=window.ForbiddenDeckRoadside?.clean(raw.roadside,raw.pairId)||null;
  const hardWon=window.ForbiddenDeckHardWon?.clean(raw.hardWon,raw.pairId)||null;
  return {schema:1,pairId:raw.pairId,choices,companionChoices,...(roadside?{roadside}:{}),...(hardWon?{hardWon}:{})};
 }
 function capture(){
  const relation=ForbiddenDeckRelationship.load();let companionChoices={};
  if(P.isLegacy())companionChoices=ForbiddenDeckCompanions.load().choices;
  return clean({schema:1,pairId:S.party.relationshipId,choices:relation.choices,companionChoices,roadside:S.roadside,hardWon:S.hardWon});
 }
 function callback(id,snapshot=capture()){
  const state=clean(snapshot);if(!state)return null;
  const previous=state.choices.filter(c=>Number(c.scene.slice(5))<Number(id.slice(5))).at(-1);
  if(!previous||previous.choice==='skipped'||(previous.choice==='romance'&&!romantic()))return null;
  return D.pairs[state.pairId].callbacks[previous.scene]?.[previous.choice]||null;
 }
 function appendCallback(parent,id,snapshot){
  const line=callback(id,snapshot);if(!line)return;
  const box=document.createElement('aside');box.className='narrative-callback relationship-callback';
  const title=document.createElement('small');title.textContent='Wcześniej między wami';
  const text=document.createElement('p'),speaker=document.createElement('strong');speaker.textContent=line[0]+': ';text.append(speaker,document.createTextNode(line[1]));box.append(title,text);parent.appendChild(box);
 }
 function route(snapshot){const state=clean(snapshot);if(!state)return'neutral';const choice=state.choices.filter(c=>['friendship','romance','skipped'].includes(c.choice)&&c.scene!=='trust20').at(-1)?.choice;return choice==='friendship'?'friendship':choice==='romance'&&romantic()?'romance':'neutral'}
 function memoryLabel(state,row){
  const scene=sceneFor(state.pairId,row.scene);
  if(row.choice==='romance'&&!romantic())return 'Bliskość pozostaje prywatna przy wyłączonym romansie.';
  if(row.choice==='skipped')return 'Ta rozmowa została pominięta.';
  if(scene.options)return scene.options[row.choice];
  return row.choice==='romance'?(scene.romanceLabel||'Przyjmij zaproszenie do bliskości'):(scene.friendshipLabel||'Zostańmy przyjaciółmi');
 }
 function appendChronicle(parent,snapshot=capture()){
  const state=clean(snapshot);if(!state)return;
  const box=document.createElement('section');box.className='narrative-chronicle';
  const heading=document.createElement('h3');heading.textContent='Ślady wspólnej drogi';box.appendChild(heading);
  const caption=document.createElement('p');caption.textContent='Wspomnienia z całej wspólnej drogi; nie dają dodatkowych premii.';box.appendChild(caption);
  const list=document.createElement('ol');
  function add(title,words){const row=document.createElement('li'),label=document.createElement('strong'),text=document.createElement('span');label.textContent=title;text.textContent=words;row.append(label,text);list.appendChild(row)}
  for(const row of state.choices)add(sceneFor(state.pairId,row.scene).title,memoryLabel(state,row));
  for(const e of ForbiddenDeckStories){const choice=state.companionChoices[e.id];if(choice)add(e.title,e.options.find(o=>o.id===choice).label)}
  if(list.children.length)box.appendChild(list);else if((!state.roadside?.finished||!Number.isInteger(state.roadside.choice))&&!Number.isInteger(state.hardWon?.choice)){const empty=document.createElement('p');empty.textContent='Pierwsze wspomnienia są jeszcze przed wami.';box.appendChild(empty)}
  window.ForbiddenDeckRoadside?.appendMemory(box,state.roadside||null);
  window.ForbiddenDeckHardWon?.appendMemory(box,state.hardWon||null);
  parent.appendChild(box);
 }
 function epilogue(run){
  const state=clean(run?.narrative);if(!state)return null;
  const pair=D.pairs[state.pairId],lines=[run.result==='victory'?pair.win:pair.defeat];
  if(run.result==='victory')lines.push(pair[route(state)]);
  const remembered=state.choices.filter(row=>row.choice!=='skipped'&&(row.choice!=='romance'||romantic())).at(-1);
  if(remembered){const echo=pair.callbacks[remembered.scene]?.[remembered.choice];if(echo)lines.push(echo[0]+': '+echo[1])}
  return {title:run.result==='victory'?pair.title:'Po ostatniej walce',art:pair.art,lines};
 }
 function epilogueElement(run,open=false){
  const story=epilogue(run);if(!story)return null;
  const details=document.createElement('details');details.className='narrative-epilogue';details.open=open;details.dataset.epiloguePair=run.narrative.pairId;
  const summary=document.createElement('summary');summary.textContent='Przeczytaj epilog';details.appendChild(summary);
  const art=document.createElement('img');art.src=globalThis.ForbiddenDeckPreviewAssets?.[story.art]||story.art;art.alt='';art.loading='lazy';art.onerror=()=>art.hidden=true;details.appendChild(art);
  const text=document.createElement('div');text.className='narrative-epilogue-text';const h=document.createElement('h3');h.textContent=story.title;text.appendChild(h);
  for(const words of story.lines){const p=document.createElement('p');p.textContent=words;text.appendChild(p)}
  appendChronicle(text,run.narrative);details.appendChild(text);return details;
 }
 function decorateHistory(root,runs){root.querySelectorAll('.run-entry').forEach((el,index)=>{const story=epilogueElement(runs[index]);if(story)el.appendChild(story)})}
 function decorateResult(){const run=ForbiddenDeckHistory.load().runs[0];if(!run||run.relationshipId!==S.party.relationshipId)return;const body=document.getElementById('modalBody');if(body.querySelector('.narrative-epilogue'))return;const story=epilogueElement(run);if(story)body.prepend(story)}
 const completed=runComplete;runComplete=function(...args){const r=completed(...args);decorateResult();return r};
 const failed=defeat;defeat=function(...args){const r=failed(...args);decorateResult();return r};
 window.ForbiddenDeckNarrative={capture,clean,callback,appendCallback,appendChronicle,epilogue,decorateHistory};
 // Updating the preference masks saved romantic text without rewriting history.
 window.addEventListener('forbidden-deck:romance',()=>{
  const album=document.querySelector('#companionsScreen .narrative-chronicle');if(album){const parent=album.parentElement;album.remove();appendChronicle(parent)}
  if(document.getElementById('historyScreen').classList.contains('show'))ForbiddenDeckHistory.render();
  document.querySelectorAll('.relationship-callback').forEach(el=>el.remove());
  const run=ForbiddenDeckHistory.load().runs[0],result=document.querySelector('#modalBody .narrative-epilogue');if(result&&run){const open=result.open;result.replaceWith(epilogueElement(run,open))}
 });
})();
