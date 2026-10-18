/* Four sidegrades: resource tradeoffs and timing, rather than larger basic attacks. */
(()=>{
 const additions={
  brace:{name:'Zaprzyj się',actor:'Kael',cost:1,text:'+4 Block Kaela. Przy 2 Momentum: zużyj 2 i zyskaj zamiast tego +12 Block.',kind:'brace',block:4,preparedBlock:12,momentumCost:2,tag:'Block'},
  venomtrail:{name:'Zatruty trop',actor:'Lyra',cost:1,text:'3 dmg i +2 Trucizna. Jeśli cel ma Marked: zużyj 1 Marked i nałóż +2 Osłabienie.',kind:'venomtrail',dmg:3,poison:2,weak:2,tag:'Trucizna'},
  watchshift:{name:'Zmiana warty',actor:'Duo',cost:1,text:'Przenieś do 6 Block z Kaela na Lyrę. Dobierz 1 kartę.',kind:'watchshift',transfer:6,draw:1,trust:20,tag:'Ochrona'},
  pressure:{name:'Wspólny nacisk',actor:'Duo',cost:2,text:'Zużyj 20 Synergy: 12 dmg i +2 Marked na celu.',kind:'pressure',dmg:12,mark:2,syn:20,trust:40,tag:'Marked'}
 };
 const upgrades={
  brace:{block:6,preparedBlock:16,text:'+6 Block Kaela. Przy 2 Momentum: zużyj 2 i zyskaj zamiast tego +16 Block.'},
  venomtrail:{dmg:5,poison:3,weak:2,text:'5 dmg i +3 Trucizna. Jeśli cel ma Marked: zużyj 1 Marked i nałóż +2 Osłabienie.'},
  watchshift:{transfer:9,draw:1,text:'Przenieś do 9 Block z Kaela na Lyrę. Dobierz 1 kartę.'},
  pressure:{dmg:15,mark:3,text:'Zużyj 20 Synergy: 15 dmg i +3 Marked na celu.'}
 };
 for(const [id,card] of Object.entries(additions)){
  cards[id]=card;UPGRADES[id]=upgrades[id];cards[id+'+']={...card,...upgrades[id],name:card.name+'+',upgraded:true};if(!rewards.includes(id))rewards.push(id);
 }
 const kinds=new Set(Object.keys(additions));
 const basePlay=playCard;
 playCard=function(index){
  const item=S.hand[index],definition=item&&cards[item.id];if(!definition||!kinds.has(definition.kind))return basePlay(index);
  if(!playable(item))return;const target=selected();if(!target)return;
  S.energy-=definition.cost;
  if(definition.actor!=='Duo'&&S.lastActor&&S.lastActor!=='Duo'&&S.lastActor!==definition.actor)addSyn(10,S.lastActor+' → '+definition.actor);
  if(definition.actor==='Kael')S.lastKaelThisTurn=true;
  S.activeActor=definition.actor;
  if(definition.kind==='brace'){
   const prepared=S.momentum>=definition.momentumCost,block=prepared?definition.preparedBlock:definition.block;
   if(prepared)S.momentum-=definition.momentumCost;S.kaelBlock+=block;
   log('<b>'+definition.name+'</b>: +'+block+' Block Kaela.'+(prepared?' Momentum −2.':''),'good');
  }
  if(definition.kind==='venomtrail'){
   const marked=target.marked>0,damage=dmgEnemy(target,definition.dmg);
   target.status??={bleed:0,poison:0,burn:0,weak:0};target.status.poison=Math.min(12,(target.status.poison||0)+definition.poison);
   if(marked){target.marked--;target.status.weak=Math.min(12,(target.status.weak||0)+definition.weak)}
   log('<b>'+definition.name+'</b>: '+damage+' dmg, Trucizna +'+definition.poison+(marked?', Marked −1, Osłabienie +'+definition.weak:'')+'.','good');
  }
  if(definition.kind==='watchshift'){
   const moved=Math.min(Math.max(0,S.kaelBlock),definition.transfer);S.kaelBlock-=moved;S.lyraBlock+=moved;draw(definition.draw,false);
   log('<b>'+definition.name+'</b>: Block Kael → Lyra: '+moved+'. Dobierz '+definition.draw+'.','combo');
  }
  if(definition.kind==='pressure'){
   S.synergy-=definition.syn;const damage=dmgEnemy(target,definition.dmg);target.marked=Math.min(3,target.marked+definition.mark);
   log('<b>'+definition.name+'</b>: '+damage+' dmg, Marked +'+definition.mark+'. Synergy −'+definition.syn+'.','combo');
  }
  S.activeActor=null;S.lastActor=definition.actor;S.discard.push(S.hand.splice(index,1)[0]);
  if(liveEnemies().length===0)victory();else{renderBattle();window.ForbiddenDeckSave?.save?.('battle')}
 };
 window.ForbiddenDeckTacticalCards={ids:Object.keys(additions)};
})();
