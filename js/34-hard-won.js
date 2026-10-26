/* Camp dialogue remembers the first victory with new damage and <=30% HP. */
(()=>{
 const pair=()=>S.party.relationshipId;
 const baseStart=startBattle;
 startBattle=function(...args){
  S.battleOpening={pairId:pair(),hp:Object.fromEntries(S.party.members.map(h=>[h.id,h.hp]))};
  return baseStart(...args);
 };
 const baseVictory=victory;
 victory=function(...args){
  const opening=S.battleOpening;
  if(!S.battleOver&&!ForbiddenDeckParty.defeated()&&S.enemies.length&&liveEnemies().length===0&&opening?.pairId===pair()&&
     S.party.members.some(h=>Number.isFinite(opening.hp?.[h.id])&&h.hp<opening.hp[h.id]&&h.hp<=h.maxHp*.3)){
   if(!clean(S.hardWon))S.hardWon={pairId:pair(),choice:null};
  }
  const result=baseVictory(...args);
  ForbiddenDeckSave.save();
  return result;
 };
 const baseNew=newRun;
 newRun=function(...args){S.battleOpening=null;S.hardWon=null;return baseNew(...args)};
 function clean(raw,pairId=pair()){
  if(!raw||raw.pairId!==pairId||!Object.hasOwn(ForbiddenDeckHardWonResponses,pairId))return null;
  const choice=raw.choice===undefined?null:raw.choice;
  if(![null,0,1].includes(choice))return null;
  return {pairId,choice};
 }
 function appendMemory(parent,raw){
  const memory=clean(raw,raw?.pairId);if(!memory||memory.choice===null)return;
  const box=document.createElement('aside');box.className='narrative-callback hard-won-memory';
  const title=document.createElement('small');title.textContent='Po trudnym zwycięstwie';
  const line=document.createElement('p');line.textContent=ForbiddenDeckHardWonResponses[memory.pairId][memory.choice].echo;
  box.append(title,line);parent.appendChild(box);
 }
 const baseCamp=camp;
 camp=function(...args){
  const result=baseCamp(...args);
  S.hardWon=clean(S.hardWon);
  const memory=S.hardWon;if(!memory)return result;
  const parent=document.getElementById('modalBody');
  if(memory.choice!==null){appendMemory(parent,memory);return result}
  const section=document.createElement('aside');section.className='narrative-callback hard-won-memory';
  const title=document.createElement('small');title.textContent='Po trudnym zwycięstwie';section.appendChild(title);
  for(const line of [...ForbiddenDeckHardWonData[pair()],'Możesz odpowiedzieć teraz albo wrócić do rozmowy przy kolejnym ognisku.']){
   const p=document.createElement('p');p.textContent=line;section.appendChild(p);
  }
  ForbiddenDeckHardWonResponses[pair()].forEach((option,index)=>{
   const button=choiceBtn(option.label,'Bez premii. Odpowiedź zostanie zapamiętana.',()=>{
    if(S.hardWon!==memory||memory.choice!==null||!section.isConnected)return;
    memory.choice=index;ForbiddenDeckSave.save('map');
    section.querySelectorAll('button').forEach(b=>b.remove());
    const response=document.createElement('p');response.textContent=option.reply;section.appendChild(response);
   });button.dataset.hardWonChoice=String(index);section.appendChild(button);
  });
  parent.appendChild(section);return result;
 };
 window.addEventListener('forbidden-deck:restore',()=>{S.hardWon=clean(S.hardWon)});
 window.ForbiddenDeckHardWon={clean,appendMemory};
})();
