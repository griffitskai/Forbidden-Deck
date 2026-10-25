/* One optional, pair-specific roadside memory per expedition. */
(()=>{
 'use strict';
 const data=ForbiddenDeckRoadsideData;
 function clean(raw,pairId=S.party.relationshipId){
  if(!raw||raw.pairId!==pairId||!Object.hasOwn(data,pairId)||!Number.isInteger(raw.act)||raw.act<0||raw.act>=ACTS.length||!Number.isInteger(raw.stage)||raw.stage<0||raw.stage>=ACTS[raw.act].route.length)return null;
  if(![null,0,1,'skipped'].includes(raw.choice)||typeof raw.finished!=='boolean'||(raw.finished&&raw.choice===null))return null;
  return {pairId,act:raw.act,stage:raw.stage,choice:raw.choice,finished:raw.finished};
 }
 const atNode=memory=>memory&&memory.act===S.act&&memory.stage===S.stage&&S.currentNode?.type==='event';
 const baseEvent=eventNode;
 function continueEvent(memory){
  if(S.roadside!==memory||!atNode(memory))return;
  memory.finished=true;ForbiddenDeckSave.save('map');baseEvent();
 }
 function render(){
  const memory=S.roadside,story=data[memory.pairId];
  showModal(story.title,'Chwila przed dalszą drogą',()=>{
   const root=document.createElement('section');root.id='roadsideScene';root.className='relation-dialogue';
   const lines=memory.choice===null?story.opening:[story.options[memory.choice].reply];
   for(const line of lines){const p=document.createElement('p');p.textContent=line;root.appendChild(p)}
   if(memory.choice===null){
    story.options.forEach((option,index)=>{const button=choiceBtn(option.label,'Bez zmiany nagród. Odpowiedź zostanie zapamiętana w tej wyprawie.',()=>{
     if(S.roadside!==memory||memory.choice!==null||!atNode(memory))return;
     memory.choice=index;ForbiddenDeckSave.save('map');render();
    });button.dataset.roadChoice=String(index);root.appendChild(button)});
    const skip=choiceBtn('Pomiń rozmowę','Przejdź do wydarzenia na trasie.',()=>{if(S.roadside!==memory||memory.choice!==null||!atNode(memory))return;memory.choice='skipped';continueEvent(memory)});skip.dataset.roadSkip='';root.appendChild(skip);
   }else{const next=choiceBtn('Idźmy dalej','Przejdź do wydarzenia na trasie.',()=>continueEvent(memory));next.dataset.roadContinue='';root.appendChild(next)}
   return root;
  });
 }
 eventNode=function(){
  S.roadside=clean(S.roadside);
  if(S.roadside){if(atNode(S.roadside)&&!S.roadside.finished)return render();return baseEvent()}
  S.roadside={pairId:S.party.relationshipId,act:S.act,stage:S.stage,choice:null,finished:false};
  ForbiddenDeckSave.save('map');render();
 };
 const baseNew=newRun;newRun=function(...args){S.roadside=null;return baseNew(...args)};
 window.addEventListener('forbidden-deck:restore',()=>{
  S.roadside=clean(S.roadside);
  if(atNode(S.roadside)){if(!S.roadside.finished)render();else baseEvent()}
 });
 function appendMemory(parent,raw=S.roadside){
  const memory=clean(raw,raw?.pairId);if(!memory||!memory.finished||!Number.isInteger(memory.choice))return;
  const box=document.createElement('aside');box.className='narrative-callback roadside-memory';
  const title=document.createElement('small');title.textContent='Wspomnienie ze szlaku';
  const line=document.createElement('p');line.textContent=data[memory.pairId].options[memory.choice].echo;box.append(title,line);parent.appendChild(box);
 }
 const baseCamp=camp;camp=function(...args){const result=baseCamp(...args);appendMemory(document.getElementById('modalBody'));return result};
 window.ForbiddenDeckRoadside={clean,appendMemory};
})();
