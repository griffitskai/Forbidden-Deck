/* Character identity and mutable combat state are independent of display names.
 * Legacy accessors below are temporary adapters for the Kael/Lyra story and UI. */
(()=>{
 'use strict';
 const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value)}return value};
 const characters=freeze({
  kael:{id:'kael',name:'Kael',gender:'male',age:32,role:'warrior',baseHp:48,portrait:'assets/portraits/kael.webp',resources:{momentum:0},equipment:{armor:'ironArmor'},starter:['strike','strike','strike','guard','guard','challenge','heavy','finish']},
  lyra:{id:'lyra',name:'Lyra',gender:'female',age:29,role:'ranger',baseHp:38,portrait:'assets/portraits/lyra.webp',resources:{},equipment:{armor:null},starter:['shot','shot','shot','expose','expose','focus','evade']}
 });
 const defaults=freeze(['kael','lyra']);
 const duos=freeze({'kael+lyra':{id:'kael+lyra',members:defaults,starter:['cover','intercept','opening','rally'],relationshipId:'kael+lyra'}});
 const blankStatus=()=>({bleed:0,poison:0,burn:0,weak:0});
 const copy=value=>JSON.parse(JSON.stringify(value));
 const count=(value,fallback=0,max=9999)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):fallback;
 function validate(ids,catalog=characters){
  if(!Array.isArray(ids)||ids.length!==2||new Set(ids).size!==2)throw new Error('A party requires two different characters');
  const definitions=ids.map(id=>catalog[id]);
  if(definitions.some((d,i)=>!d||d.id!==ids[i]||!Number.isFinite(d.age)||d.age<18||!Number.isFinite(d.baseHp)||d.baseHp<=0))throw new Error('Unknown or invalid adult character');
  if(!definitions.some(d=>d.gender==='male')||!definitions.some(d=>d.gender==='female'))throw new Error('Select one male and one female character');
  return definitions;
 }
 function pairId(ids){return [...ids].sort().join('+')}
 function create(ids=defaults,catalog=characters){
  const definitions=validate(ids,catalog).sort((a,b)=>a.gender==='male'?-1:1);
  return {schema:1,relationshipId:pairId(ids),members:definitions.map(d=>({id:d.id,hp:d.baseHp,maxHp:d.baseHp,block:0,status:blankStatus(),resources:copy(d.resources||{}),equipment:copy(d.equipment||{armor:null})})),equipment:{amulet:'arcaneCharm'}};
 }
 function startingDeck(ids=defaults,catalog=characters,pairs=duos){
  const definitions=validate(ids,catalog).sort((a,b)=>a.gender==='male'?-1:1),duo=pairs[pairId(ids)];
  if(!duo)throw new Error('This duo has no starter deck');
  return [...definitions.flatMap(d=>d.starter||[]),...duo.starter];
 }
 function member(id,state=S){
  const members=state.party.members;
  const found=id==='lead'?members[0]:id==='partner'?members[1]:members.find(h=>h.id===id);
  if(!found)throw new Error('Character is not in this party: '+id);
  return found;
 }
 function normalize(raw){
  if(!raw||raw.schema!==1||!Array.isArray(raw.members))throw new Error('Unsupported party state');
  const party=create(raw.members.map(h=>h?.id));
  party.members.forEach(h=>{
   const saved=raw.members.find(m=>m.id===h.id);h.maxHp=Math.max(1,count(saved.maxHp,h.maxHp));h.hp=count(saved.hp,h.maxHp,h.maxHp);h.block=count(saved.block);
   for(const type of Object.keys(h.status))h.status[type]=count(saved.status?.[type],0,12);
   for(const key of Object.keys(h.resources))h.resources[key]=count(saved.resources?.[key],0,key==='momentum'?5:9999);
   h.equipment.armor=typeof saved.equipment?.armor==='string'?saved.equipment.armor:null;
  });
  party.equipment.amulet=typeof raw.equipment?.amulet==='string'?raw.equipment.amulet:null;
  return party;
 }
 function legacyParty(saved){
  const party=create();
  for(const h of party.members){
   h.maxHp=Math.max(1,count(saved[h.id+'MaxHp'],h.maxHp));h.hp=count(saved[h.id+'Hp'],h.maxHp,h.maxHp);h.block=count(saved[h.id+'Block']);
   for(const type of Object.keys(h.status))h.status[type]=count(saved.heroStatus?.[h.id]?.[type],0,12);
  }
  party.members[0].resources.momentum=count(saved.momentum,0,5);
  if(saved.equipment){party.members[0].equipment.armor=saved.equipment.armor||null;party.equipment.amulet=saved.equipment.amulet||null}
  return party;
 }
 function hydrate(saved,base={}){
  // Never inherit a previous run's party when migrating a flat legacy save.
  const state={...base,...saved},party=saved.party?normalize(saved.party):legacyParty(saved);state.party=party;
  const alias=(key,get,set)=>Object.defineProperty(state,key,{configurable:true,enumerable:false,get,set});
  for(const id of defaults)for(const field of ['hp','maxHp','block']){
   const key=id+(field==='maxHp'?'MaxHp':field==='hp'?'Hp':'Block');
   alias(key,()=>member(id,state)[field],value=>{member(id,state)[field]=value});
  }
  alias('momentum',()=>member('kael',state).resources.momentum,value=>{member('kael',state).resources.momentum=value});
  const statuses={},equipment={};
  for(const id of defaults)Object.defineProperty(statuses,id,{enumerable:true,get:()=>member(id,state).status,set:value=>{member(id,state).status={...blankStatus(),...value}}});
  alias('heroStatus',()=>statuses,value=>{for(const id of defaults)member(id,state).status={...blankStatus(),...value?.[id]}});
  Object.defineProperties(equipment,{armor:{enumerable:true,get:()=>member('lead',state).equipment.armor,set:value=>{member('lead',state).equipment.armor=value}},amulet:{enumerable:true,get:()=>state.party.equipment.amulet,set:value=>{state.party.equipment.amulet=value}}});
  alias('equipment',()=>equipment,value=>{member('lead',state).equipment.armor=value?.armor||null;state.party.equipment.amulet=value?.amulet||null});
  return state;
 }
 function reset(state=S){state.party=create();return state.party}
 function resetCombat(state=S,catalog=characters){for(const h of state.party.members){h.block=0;h.status=blankStatus();h.resources=copy(catalog[h.id].resources||{})}state.activeActor=null}
 function heal(id,amount,state=S){const h=member(id,state),before=h.hp;h.hp=Math.min(h.maxHp,h.hp+count(amount));return h.hp-before}
 function healAll(amount,state=S){return state.party.members.map(h=>heal(h.id,amount,state))}
 function addBlock(id,amount,state=S){const h=member(id,state);h.block+=count(amount);return h.block}
 function addBlockAll(amount,state=S){state.party.members.forEach(h=>addBlock(h.id,amount,state))}
 function defeated(state=S){return state.party.members.some(h=>h.hp<=0)}
 function resistance(id,state=S,definitions=gearDefs){
  const h=member(id,state),result={physical:0,magic:0,toxin:0};
  for(const item of [h.equipment.armor,state.party.equipment.amulet])for(const type of Object.keys(result))result[type]+=definitions[item]?.res?.[type]||0;
  for(const type of Object.keys(result))result[type]=Math.min(60,result[type]+(state.tempRes?.[type]||0));
  return result;
 }
 function damagePreview(amount,res,block,hits=1){const perHit=Math.max(0,Math.round(amount*(1-res/100))),total=perHit*hits,absorbed=Math.min(block,total);return {perHit,total,absorbed,hp:Math.max(0,total-absorbed)}}
 function damage(id,amount,dtype='physical',state=S,definitions=gearDefs){
  const h=member(id,state),res=resistance(id,state,definitions)[dtype]||0,p=damagePreview(amount,res,h.block);h.block-=p.absorbed;h.hp=Math.max(0,h.hp-p.hp);
  return {hp:p.hp,reducedBy:amount-p.total,res,target:h.id};
 }
 function ownsCard(definition,party=S.party){
  if(!definition)return false;
  if(definition.ownerId)return party.members.some(h=>h.id===definition.ownerId);
  return Boolean(definition.duoId&&definition.duoId===pairId(party.members.map(h=>h.id)));
 }
 const availableRewards=(ids,state=S)=>ids.filter(id=>ownsCard(cards[id],state.party));
 const actorId=definition=>definition.ownerId||(definition.duoId?'duo:'+definition.duoId:null);
 function actorWeakness(actor,state=S){
  if(actor?.startsWith('duo:'))return Math.max(...state.party.members.map(h=>h.status.weak||0));
  return state.party.members.find(h=>h.id===actor)?.status.weak||0;
 }
 window.ForbiddenDeckParty=Object.freeze({characters,duos,defaults,validate,pairId,create,startingDeck,normalize,hydrate,reset,resetCombat,member,heal,healAll,addBlock,addBlockAll,defeated,resistance,damagePreview,damage,ownsCard,availableRewards,actorId,actorWeakness});
})();
