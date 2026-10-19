/* Each base card has its own vignette; upgrades keep the same action artwork. */
(()=>{
 const atlases={
  kael:{path:'assets/cards/kael-actions.webp',cols:4,rows:3,ids:['strike','guard','challenge','heavy','finish','bash','wall','deepcut','hamstring','cinderguard','bloodrush','brace']},
  lyra:{path:'assets/cards/lyra-actions.webp',cols:4,rows:3,ids:['shot','expose','focus','evade','snipe','volley','venomarrow','firearrow','executionarrow','ashshot','venomtrail']},
  duo:{path:'assets/cards/duo-actions.webp',cols:4,rows:4,aspect:4/3,ids:['cover','intercept','opening','rally','twin','back','protect','cross','bond','advancecard','purify','bloodbond','laststand','watchshift','pressure']}
 };
 Object.assign(atlases,window.ForbiddenDeckRosterData.art);
 const illustrations={};for(const atlas of Object.values(atlases))atlas.ids.forEach((id,index)=>{illustrations[id]={...atlas,index}});
 const asset=path=>globalThis.ForbiddenDeckPreviewAssets?.[path]||path;
 const defensive=new Set(['block','taunt','ironwall','evade','intercept','rally','protect','cleanse','cinderguard','laststand','brace','watchshift']);
 const setup=new Set(['draw','duodraw','mark']);
 function role(d){return defensive.has(d.kind)||['veil','smoke','runeward','mend','runiccover','aegisrally','nightward','veilrune','shadowfeint'].includes(d.effect)?['defense','Obrona']:setup.has(d.kind)||d.effect==='silenttrail'?['setup','Przygotowanie']:d.actor==='Duo'?['teamwork','Współpraca']:['attack','Atak']}
 function identify(el){
  const title=el.querySelector('h4,h3,.deck-card-head strong')?.textContent.trim();if(!title)return null;
  for(const [id,card] of Object.entries(cards)){
   const plus=id.endsWith('+'),base=card.name.replace(/\+$/,'');
   const english=(window.ForbiddenDeckEnglish?.[base]||base)+(plus?'+':'');
   if(card.name===title||english===title)return id;
  }
  return null;
 }
 function decorate(el,id=identify(el)){
  const definition=cards[id],illustration=illustrations[id?.replace(/\+$/,'')];if(!definition||!illustration||el.querySelector(':scope > .card-art'))return;
  const [key,label]=role(definition);el.classList.add('illustrated-card');el.dataset.cardId=id;el.dataset.cardRole=key;
  const art=document.createElement('span');art.className='card-art';art.setAttribute('aria-hidden','true');
  const square=document.createElement('span');square.className='card-art-square';
  square.style.cssText=`--art-aspect:${illustration.aspect||1};--art-cols:${illustration.cols};--art-rows:${illustration.rows};--art-col:${illustration.index%illustration.cols};--art-row:${Math.floor(illustration.index/illustration.cols)}`;
  const img=document.createElement('img');img.src=asset(illustration.path);img.alt='';img.decoding='async';img.onerror=()=>{art.remove();el.classList.remove('illustrated-card')};
  square.appendChild(img);art.appendChild(square);el.prepend(art);
  if(el.matches('.card')){const badge=document.createElement('span');badge.className='card-action-role';badge.textContent=label;el.appendChild(badge)}
  // Metadata is presentation-only; the source card object and save stay unchanged.
 }
 function scan(root=document){
  if(root.nodeType!==1&&root!==document)return;
  const selectors='.hand .card,.deck-card,.reward,.codex-card:not(.locked),#combatCardPreview';
  if(root.matches?.(selectors))decorate(root);
  root.querySelectorAll(selectors).forEach(el=>{
   if(el.matches('.hand .card')){const index=[...el.parentElement.children].indexOf(el);decorate(el,S.hand[index]?.id)}else decorate(el);
  });
 }
 const baseHand=renderHand;renderHand=function(...args){const result=baseHand(...args);document.querySelectorAll('#hand .card').forEach((el,i)=>decorate(el,S.hand[i]?.id));return result};
 const baseModal=showModal;showModal=function(...args){const result=baseModal(...args);scan(document.getElementById('modalBody'));return result};
 const observer=new MutationObserver(records=>{
  const roots=new Set();for(const record of records)for(const node of record.addedNodes)if(node.nodeType===1&&!node.matches('.card-art,.card-art *,.card-action-role'))roots.add(node);
  for(const root of roots)if(root.isConnected)scan(root);
 });observer.observe(document.body,{childList:true,subtree:true});
 window.ForbiddenDeckCardArt={decorate,scan,illustrations};scan();
})();
