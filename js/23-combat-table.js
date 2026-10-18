/* One combat table, using the existing elements and controls. No state migration. */
(()=>{
 'use strict';
 const screen=document.getElementById('battleScreen'),left=screen.querySelector('.left'),center=screen.querySelector('.center');
 const field=document.getElementById('battlefieldVisual'),hand=document.getElementById('hand');
 const desktop=matchMedia('(min-width:1000px) and (min-height:560px)');
 const resources=document.createElement('section');resources.className='combat-resources';resources.setAttribute('aria-label','Zasoby drużyny');
 const stats=[...left.querySelectorAll('.stat')];
 for(const i of [0,2])stats[i].querySelector('.statline>span').textContent='HP';
 for(const i of [1,3])stats[i].querySelector('.statline>span').textContent='Block';
 for(const [hero,indices] of [['kael',[0,1]],['lyra',[2,3]]]){
  const vitals=document.createElement('div');vitals.className='combat-vitals';
  indices.forEach(i=>vitals.appendChild(stats[i]));document.getElementById(hero+'Field').appendChild(vitals);
 }
 // Energy first: this is the immediate budget for playing the hand.
 for(const index of [7,5,6,4])resources.appendChild(stats[index]);
 const defense=left.querySelector('.tip:has(#defenseStatus)');defense.classList.add('combat-defense');resources.appendChild(defense);
 screen.querySelector('.hand-wrap').before(resources);
 const head=document.createElement('header');head.className='combat-arena-head';
 head.innerHTML='<span class="combat-table-label">POLE WALKI</span><strong id="combatTurn"></strong>';
 center.prepend(head);
 const details=document.createElement('dialog');details.id='combatDetails';details.className='combat-details';details.setAttribute('aria-labelledby','combatDetailsTitle');
 details.innerHTML='<header><h2 id="combatDetailsTitle">Drużyna i zasady</h2><button class="btn" id="combatDetailsClose" aria-label="Zamknij szczegóły">×</button></header>';
 details.appendChild(left);document.body.appendChild(details);
 const openDetails=document.createElement('button');openDetails.id='combatDetailsBtn';openDetails.className='btn';openDetails.textContent='Szczegóły';openDetails.onclick=()=>details.showModal();
 document.getElementById('logToggleInline').before(openDetails);
 document.getElementById('combatDetailsClose').onclick=()=>details.close();
 details.addEventListener('click',event=>{if(event.target===details){const r=details.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)details.close()}});
 const hint=document.createElement('p');hint.className='combat-inspect-hint';hint.textContent='Najedź lub wybierz kartę klawiszem Tab, aby zobaczyć jej pełny opis.';screen.querySelector('.hand-head').appendChild(hint);
 const preview=document.createElement('aside');preview.id='combatCardPreview';preview.className='combat-card-preview';preview.hidden=true;preview.setAttribute('role','tooltip');document.body.appendChild(preview);
 let inspected=null;
 function clearPreview(){if(inspected)inspected.removeAttribute('aria-describedby');inspected=null;preview.hidden=true}
 function inspect(card){
  if(!desktop.matches)return;
  const index=[...hand.children].indexOf(card),item=S.hand[index],definition=item&&cards[item.id];if(!definition)return;
  clearPreview();inspected=card;card.setAttribute('aria-describedby','combatCardPreview');
  // Copy only presentation nodes. Never clone a playable control or an ID.
  preview.replaceChildren();
  const h=document.createElement('h3'),meta=document.createElement('small'),text=document.createElement('p');
  h.textContent=definition.name;meta.textContent=definition.actor+' · '+definition.cost+' ⚡';text.textContent=definition.text;
  preview.append(h,meta,text);preview.hidden=false;
  const r=card.getBoundingClientRect(),width=preview.offsetWidth;
  preview.style.left=Math.max(10,Math.min(innerWidth-width-10,r.left+r.width/2-width/2))+'px';
  preview.style.top=Math.max(60,r.top-preview.offsetHeight-12)+'px';
 }
 function layoutBanter(){
  const box=document.getElementById('companionBanter');if(!box)return;
  if(desktop.matches&&innerHeight<=640){if(box.parentElement!==details)details.appendChild(box)}
  else if(box.parentElement!==field)field.insertBefore(box,document.getElementById('lastAction'));
 }
 function layoutHand(){
  layoutBanter();
  if(!desktop.matches){hand.style.removeProperty('--card-overlap');hand.style.removeProperty('--card-width');clearPreview();return}
  const count=hand.children.length,width=hand.clientWidth,cardWidth=Math.min(180,Math.max(146,innerWidth*.115));
  // Normal hands have a gap; large draw turns fan out without hiding the last card.
  const gap=count>1?Math.min(10,(width-count*cardWidth)/(count-1)):0;
  hand.style.setProperty('--card-width',cardWidth+'px');hand.style.setProperty('--card-overlap',gap+'px');
 }
 function enhanceHand(){
  clearPreview();
  [...hand.children].forEach((card,index)=>{
   card.style.setProperty('--card-order',index);card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-disabled',String(!playable(S.hand[index])));
   card.onmouseenter=()=>inspect(card);card.onmouseleave=clearPreview;card.onfocus=()=>inspect(card);card.onblur=clearPreview;
   card.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();if(playable(S.hand[index])){clearPreview();card.click();hand.children[Math.min(index,hand.children.length-1)]?.focus({preventScroll:true})}}};
  });layoutHand();
 }
 function refresh(){
  document.getElementById('combatTurn').textContent='Tura '+S.turn;
  const location=document.getElementById('battleLocation');if(location&&location.parentElement!==head)head.insertBefore(location,head.lastElementChild);
  for(const enemy of document.querySelectorAll('#enemies .enemy')){const marks=[...enemy.querySelectorAll('.mark')];if(marks.length>1)marks.at(-1).classList.add('combat-phase')}
  const legend=center.querySelector('.intent-legend');if(legend)left.appendChild(legend);
  enhanceHand();
 }
 function syncScreen(){const active=screen.classList.contains('active');document.body.classList.toggle('combat-active',active);if(!active){details.close();clearPreview()}layoutHand()}
 const baseScreen=showScreen;showScreen=function(...args){const result=baseScreen(...args);syncScreen();return result};
 const baseRender=renderBattle;renderBattle=function(...args){const result=baseRender(...args);refresh();return result};
 const baseHand=renderHand;renderHand=function(...args){const result=baseHand(...args);enhanceHand();return result};
 const baseModal=showModal;showModal=function(...args){details.close();clearPreview();return baseModal(...args)};
 new ResizeObserver(layoutHand).observe(hand);
 desktop.addEventListener('change',()=>{layoutHand();clearPreview()});
 window.addEventListener('resize',()=>{layoutHand();clearPreview()});
 window.addEventListener('forbidden-deck:language',()=>{clearPreview()});
 window.addEventListener('blur',clearPreview);
 syncScreen();refresh();
})();
