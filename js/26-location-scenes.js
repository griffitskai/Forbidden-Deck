/* Location art is derived from canonical route data, never from translated DOM text. */
(()=>{
 const scenes={
  road:{art:'assets/regions/borderlands.webp',tone:'amber',name:'Pograniczny trakt',description:'Wiatr niesie zapach wrzosu. Za ostatnim światłem domów zaczyna się otwarta droga.'},
  bridge:{art:'assets/locations/crossroads.webp',tone:'amber',name:'Kamienny most',description:'Pod spękanym łukiem szumi rzeka. Na wąskim moście nie ma gdzie zejść z drogi.'},
  ruins:{art:'assets/locations/abbey-ruins.webp',tone:'moon',name:'Zapomniane ruiny',description:'Przez puste okna wpada chłodne światło. Każdy krok odbija się pod złamanymi sklepieniami.'},
  forest:{art:'assets/regions/tainted-forest.webp',tone:'moss',name:'Ciernisty las',description:'Korzenie zamykają ścieżkę za plecami. Między drzewami zalega ciężka, zielona mgła.'},
  swamp:{art:'assets/locations/toxic-marsh.webp',tone:'moss',name:'Toksyczne mokradła',description:'Czarna woda drży pod spróchniałymi kładkami. W oparach migoczą blade ogniki.'},
  citadel:{art:'assets/regions/ash-citadel.webp',tone:'ember',name:'Mury Cytadeli',description:'Popiół osiada na kamieniu. Nad drogą wyrastają mury rozświetlone żarem.'},
  forge:{art:'assets/locations/ember-forge.webp',tone:'ember',name:'Kuźnie żaru',description:'Łańcuchy giną w dymie. Strugi płynnego metalu rozcinają ciemność podziemnej kuźni.'},
  throne:{art:'assets/locations/ash-throne.webp',tone:'ember',name:'Sala popielnego tronu',description:'Za szeregiem czarnych kolumn czeka tron. Ciszę przerywa tylko trzask dogasających palenisk.'}
 };
 const exact={
  'Most':'bridge','Zawalony most':'bridge','Kultystki':'ruins','Łowca głów':'ruins','Ruiny':'ruins','Egzekutor':'ruins',
  'Strażniczka Pogranicza':'ruins','Toksyczne bagno':'swamp','Strażnik cierni':'swamp','Stare łowy':'ruins','Omszała brama':'ruins',
  'Królowa Cierni':'forest','Spalona kaplica':'ruins','Kuźnie':'forge','Sala żaru':'forge','Schody tronu':'throne','Królowa Popiołu':'throne'
 };
 const asset=path=>globalThis.ForbiddenDeckPreviewAssets?.[path]||path;
 function resolve(node,act=S.act||0){
  const regional=['road','forest','citadel'][Math.max(0,Math.min(2,act))];
  if(node?.type==='camp'||node?.terrain==='camp')return {id:regional,...scenes[regional],name:window.ForbiddenDeckJourney.regions[act]?.camp||scenes[regional].name};
  const terrain={road:'road',plains:'road',forest:'forest',swamp:'swamp',ruins:'ruins',ash:'citadel',citadel:'citadel',lava:'forge',sanctum:act===2?'throne':'ruins',boss:['ruins','forest','throne'][act]};
  const key=exact[node?.label]||terrain[node?.terrain]||regional;
  return {id:key,...scenes[key]};
 }
 const current=()=>resolve(S.currentNode);
 function battle(){
  const arena=document.querySelector('#battleScreen .center');if(!arena)return;
  let layer=arena.querySelector('.combat-scenery');
  if(!layer){layer=document.createElement('div');layer.className='combat-scenery';layer.setAttribute('aria-hidden','true');const img=document.createElement('img');img.alt='';img.decoding='async';img.onerror=()=>{img.hidden=true};layer.append(img);arena.prepend(layer)}
  const scene=current(),img=layer.querySelector('img');arena.dataset.scenery=scene.id;arena.dataset.tone=scene.tone;
  if(img.dataset.path!==scene.art){img.dataset.path=scene.art;img.hidden=false;img.src=asset(scene.art)}
  // The legacy hero backdrop stays in its original containing block for older layouts.
  const hero=document.querySelector('.world-battle-art');if(hero)hero.style.backgroundImage=`url("${asset(scene.art)}")`;
  const caption=document.getElementById('battleLocation');if(caption)caption.textContent=currentAct().title+' · '+(S.currentNode?.label||scene.name);
 }
 function map(){
  const route=currentAct().route,first=route[S.stage]?.[0],vista=document.getElementById('journeyVista'),panel=document.querySelector('.map-panel');if(!vista||!first)return;
  function preview(node){
   const scene=resolve(node),img=vista.querySelector('img');img.src=asset(scene.art);img.alt=scene.name;img.onerror=()=>{img.onerror=null;img.src=asset(window.ForbiddenDeckJourney.region().art)};
   vista.querySelector('.journey-eyebrow').textContent=currentAct().title;
   vista.querySelector('h2').textContent=node.label||scene.name;
   vista.querySelector('p').textContent=scene.description;
   vista.dataset.scenery=scene.id||'';panel.style.setProperty('--region-art',`url("${new URL(asset(scene.art),document.baseURI).href}")`);
  }
  let focusedNode=null;
  preview(first);
  document.querySelectorAll('#map .row').forEach(row=>{
   const step=Number(row.dataset.step);
   row.querySelectorAll('.node').forEach((button,index)=>{
    const node=route[step]?.[index];if(!node)return;const scene=resolve(node);
    const img=document.createElement('img');img.className='route-location-thumb';img.alt='';img.setAttribute('aria-hidden','true');img.loading='lazy';img.src=asset(scene.art);img.onerror=()=>img.remove();button.prepend(img);
    button.dataset.scenery=scene.id||'';
    if(step===S.stage){button.addEventListener('pointerenter',()=>preview(focusedNode||node));button.addEventListener('focus',()=>{focusedNode=node;preview(node)});button.addEventListener('pointerleave',()=>preview(focusedNode||first));button.addEventListener('blur',()=>{focusedNode=null;preview(first)})}
   });
  });
 }
 const baseBattle=renderBattle;renderBattle=function(...args){const result=baseBattle(...args);battle();return result};
 const baseMap=renderMap;renderMap=function(...args){const result=baseMap(...args);map();return result};
 window.ForbiddenDeckLocations={resolve,current,scenes};
 map();
})();
