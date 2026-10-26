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
   S.hardWon={pairId:pair()};
  }
  const result=baseVictory(...args);
  ForbiddenDeckSave.save();
  return result;
 };
 const baseNew=newRun;
 newRun=function(...args){S.battleOpening=null;S.hardWon=null;return baseNew(...args)};
 const baseCamp=camp;
 camp=function(...args){
  const result=baseCamp(...args);
  if(S.hardWon?.pairId===pair()&&Object.hasOwn(ForbiddenDeckHardWonData,pair())){
   const section=document.createElement('aside');section.className='narrative-callback hard-won-memory';
   const title=document.createElement('small');title.textContent='Po trudnym zwycięstwie';section.appendChild(title);
   for(const line of ForbiddenDeckHardWonData[pair()]){const p=document.createElement('p');p.textContent=line;section.appendChild(p)}
   document.getElementById('modalBody').appendChild(section);
  }
  return result;
 };
})();
