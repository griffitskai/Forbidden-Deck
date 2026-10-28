/* A roadside choice and one later-act follow-up per expedition. */
(()=>{
 'use strict';
 const data=ForbiddenDeckRoadsideData;
 function clean(raw,pairId=S.party.relationshipId){
  if(!raw||raw.pairId!==pairId||!Object.hasOwn(data,pairId)||!Number.isInteger(raw.act)||raw.act<0||raw.act>=ACTS.length||!Number.isInteger(raw.stage)||raw.stage<0||raw.stage>=ACTS[raw.act].route.length)return null;
  if(![null,0,1,'skipped'].includes(raw.choice)||typeof raw.finished!=='boolean'||(raw.finished&&raw.choice===null))return null;
  const result={pairId,act:raw.act,stage:raw.stage,choice:raw.choice,finished:raw.finished};
  const f=raw.followup;
  if(raw.finished&&Number.isInteger(raw.choice)&&f&&Number.isInteger(f.act)&&f.act>raw.act&&f.act<ACTS.length&&Number.isInteger(f.stage)&&f.stage>=0&&f.stage<ACTS[f.act].route.length&&typeof f.finished==='boolean')result.followup={act:f.act,stage:f.stage,finished:f.finished};
  return result;
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
    const skip=choiceBtn('Pomiń rozmowę','Pominiesz także jej dalszy ciąg w tej wyprawie. Nagrody wydarzenia pozostają bez zmian.',()=>{if(S.roadside!==memory||memory.choice!==null||!atNode(memory))return;memory.choice='skipped';continueEvent(memory)});skip.dataset.roadSkip='';root.appendChild(skip);
   }else{const next=choiceBtn('Idźmy dalej','Przejdź do wydarzenia na trasie.',()=>continueEvent(memory));next.dataset.roadContinue='';root.appendChild(next)}
   return root;
  });
 }
 function appendDecision(parent,memory){
  const details=document.createElement('details');details.className='roadside-decision';
  const summary=document.createElement('summary');summary.textContent='Wcześniejszy wybór';
  const title=document.createElement('strong');title.textContent=data[memory.pairId].title;
  const quote=document.createElement('blockquote');quote.textContent=data[memory.pairId].options[memory.choice].label;
  details.append(summary,title,quote);parent.appendChild(details);
 }
 function renderFollowup(){
  const memory=S.roadside,followup=memory.followup;
  showModal('Dalszy ślad','Chwila przed dalszą drogą',()=>{
   const root=document.createElement('section');root.id='roadsideScene';root.className='relation-dialogue';root.dataset.roadFollowup='';appendDecision(root,memory);
   for(const line of ForbiddenDeckRoadsideFollowups[memory.pairId][memory.choice]){const p=document.createElement('p');p.textContent=line;root.appendChild(p)}
   const next=choiceBtn('Idźmy dalej','Przejdź do wydarzenia na trasie.',()=>{
    if(S.roadside!==memory||followup.finished||!atNode(followup))return;
    followup.finished=true;ForbiddenDeckSave.save('map');baseEvent();
   });next.dataset.roadContinue='';root.appendChild(next);return root;
  });
 }
 eventNode=function(){
  S.roadside=clean(S.roadside);
  if(S.roadside){
   const memory=S.roadside;
   if(atNode(memory)&&!memory.finished)return render();
   if(memory.finished&&Number.isInteger(memory.choice)&&S.act>memory.act&&S.currentNode?.type==='event'&&!memory.followup){
    memory.followup={act:S.act,stage:S.stage,finished:false};ForbiddenDeckSave.save('map');
   }
   if(atNode(memory.followup)&&!memory.followup.finished)return renderFollowup();
   return baseEvent();
  }
  S.roadside={pairId:S.party.relationshipId,act:S.act,stage:S.stage,choice:null,finished:false};
  ForbiddenDeckSave.save('map');render();
 };
 const baseNew=newRun;newRun=function(...args){S.roadside=null;return baseNew(...args)};
 window.addEventListener('forbidden-deck:restore',()=>{
  S.roadside=clean(S.roadside);
  if(atNode(S.roadside?.followup)){if(!S.roadside.followup.finished)renderFollowup();else baseEvent()}
  else if(atNode(S.roadside)){if(!S.roadside.finished)render();else baseEvent()}
 });
 function appendMemory(parent,raw=S.roadside){
  const memory=clean(raw,raw?.pairId);if(!memory||!memory.finished||!Number.isInteger(memory.choice))return;
  const box=document.createElement('aside');box.className='narrative-callback roadside-memory';
  const title=document.createElement('small');title.textContent='Wspomnienie ze szlaku';
  const line=document.createElement('p');line.textContent=data[memory.pairId].options[memory.choice].echo;box.append(title,line);appendDecision(box,memory);
  if(memory.followup?.finished){
   const heading=document.createElement('small');heading.textContent='Dalszy ślad';box.appendChild(heading);
   for(const words of ForbiddenDeckRoadsideFollowups[memory.pairId][memory.choice]){const p=document.createElement('p');p.textContent=words;box.appendChild(p)}
  }
  parent.appendChild(box);
 }
 const baseCamp=camp;camp=function(...args){const result=baseCamp(...args);appendMemory(document.getElementById('modalBody'));return result};
 window.ForbiddenDeckRoadside={clean,appendMemory};
})();
