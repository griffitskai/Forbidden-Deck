/* Local illustration atlases; presentation never changes encounter data. */
(()=>{
 const enemyAtlas='assets/enemies/archetypes.webp',itemAtlas='assets/items/equipment.webp',citadelAtlas='assets/enemies/citadel.webp';
 const bridge='assets/locations/crossroads.webp';
 const asset=path=>globalThis.ForbiddenDeckPreviewAssets?.[path]||path;
 const portraits={
  'Bandita':0,'Najemnik':0,'Łowca głów':0,'Krwawy tropiciel':6,'Krwawy łowca':6,
  'Łuczniczka':1,'Runiczna kuszniczka':1,'Leśny łowca':1,'Cierniowy łucznik':1,
  'Wilk Alfa':2,'Jadowity wilk':2,'Wilk':2,'Kultystka':3,'Zaklinaczka':3,
  'Strażnik':4,'Cierniowy strażnik':4,'Straż Żaru':4,
  'Alchemiczka':5,'Zielarka zarazy':5,'Trująca matrona':5,
  'Skrytobójca':6,'Skrytobójca mchu':6,'Popielny skrytobójca':6,
  'Hexer':7,'Bagienna wiedźma':7,'Bagienny wyrocznia':7,'Żagiewka':3,
  'Bagienny pająk':8,'Jadowity pająk':8,'Korzenna bestia':9,
  'Strażniczka Pogranicza':10,'Królowa Cierni':11
 };
 const citadel={'Żelazny Golem':0,'Kapłanka żaru':1,'Królowa Popiołu':2,'Strażnik pieczęci':3,'Popielny Inkwizytor':3,'Popielny rycerz':3,'Piromantka':1,'Piromant':1};
 const items={ironArmor:0,paddedArmor:1,arcaneCharm:2,serpentCharm:3,wardCharm:4,hunterPlate:5,heal:6,ward:7,antidote:8,tonic:9};
 function art(path,index,cols,rows,label=''){
  const span=document.createElement('span');span.className='world-atlas';
  span.style.cssText=`--cols:${cols};--rows:${rows};--col:${index%cols};--row:${Math.floor(index/cols)}`;
  const img=document.createElement('img');img.src=asset(path);img.alt=label;img.loading='eager';img.decoding='async';img.onerror=()=>span.remove();span.appendChild(img);return span;
 }
 function enemyArt(name){if(Object.hasOwn(citadel,name))return art(citadelAtlas,citadel[name],2,2);if(Object.hasOwn(portraits,name))return art(enemyAtlas,portraits[name],4,3);return null}
 function decorateEnemies(){
  document.querySelectorAll('#enemies .enemy').forEach((el,index)=>{
   if(el.querySelector('.world-atlas'))return;
   const image=enemyArt(S.enemies[index]?.name),emo=el.querySelector('.emo');if(image&&emo)emo.appendChild(image);
  });
 }
 function findItem(text){
  for(const [id,definition] of Object.entries({...gearDefs,...potionDefs}))if(Object.hasOwn(items,id)){
   const english=window.ForbiddenDeckEnglish?.[definition.name];
   if(text===definition.name||(english&&text===english))return id;
  }
 }
 function decorateLoot(root=document){
  for(const el of root.querySelectorAll('.equip-card,.slot,.codex-card,.item-chip')){
   if(el.querySelector('.world-atlas'))continue;
   const heading=el.classList.contains('slot')?el.querySelector('p'):el.querySelector('h3,b'),text=heading?.textContent.trim().split(' — ')[0];if(!text)continue;
   const id=findItem(text);
   if(id){el.prepend(art(itemAtlas,items[id],5,2));continue}
   if(el.classList.contains('codex-card')){
    const name=Object.keys({...portraits,...citadel}).find(n=>n===text||window.ForbiddenDeckEnglish?.[n]===text);
    const image=name&&enemyArt(name);if(image){el.querySelector('.codex-icon')?.remove();el.prepend(image)}
   }
  }
 }
 function backdrop(){
  const field=document.getElementById('battlefieldVisual');if(!field)return;
  let image=field.querySelector('.world-battle-art');if(!image){image=document.createElement('div');image.className='world-battle-art';image.setAttribute('aria-hidden','true');field.prepend(image)}
  const path=S.act===0?bridge:window.ForbiddenDeckJourney?.region().art;
  image.style.backgroundImage=path?`url("${asset(path)}")`:'';
  let caption=document.getElementById('battleLocation');if(!caption){caption=document.createElement('p');caption.id='battleLocation';caption.className='location-caption';field.after(caption)}
  caption.textContent=currentAct().title+' · '+(S.currentNode?.label||'Na szlaku');
 }
 function location(){
  const overlay=document.getElementById('overlay');if(!overlay.classList.contains('show')||overlay.querySelector('.world-location,.campfire-art,.journey-camp'))return;
  const title=document.getElementById('modalTitle').textContent;
  if(!['Wędrowny kupiec','Traveling Merchant','Zawalony most','Collapsed Bridge'].includes(title))return;
  const figure=document.createElement('figure');figure.className='world-location';
  const img=document.createElement('img');img.src=asset(bridge);img.alt='';img.width=1672;img.height=941;img.onerror=()=>figure.remove();
  const caption=document.createElement('figcaption');caption.textContent=title;figure.append(img,caption);document.getElementById('modalBody').prepend(figure);
 }
 const baseEnemies=renderEnemies;renderEnemies=function(...args){const result=baseEnemies(...args);decorateEnemies();return result};
 const baseBattle=renderBattle;renderBattle=function(...args){const result=baseBattle(...args);backdrop();return result};
 const baseModal=showModal;showModal=function(...args){const result=baseModal(...args);decorateLoot();location();return result};
 // Codex renderers are private closures. Observe only newly inserted containers.
 const observer=new MutationObserver(records=>{
  for(const r of records)for(const node of r.addedNodes)if(node.nodeType===1&&!node.matches('.world-atlas,.world-atlas *')){
   if(node.matches('.codex-grid,.equipment-panel,.inventory,.reward-grid')||node.querySelector('.codex-grid'))decorateLoot(node.parentElement||node);
  }
 });observer.observe(document.body,{subtree:true,childList:true});
 decorateEnemies();decorateLoot();
 window.ForbiddenDeckArt={enemyArt,items,portraits,citadel};
})();
