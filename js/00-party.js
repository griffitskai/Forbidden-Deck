/* Character identity and mutable combat state are independent of display names.
 * Legacy accessors below are temporary adapters for the Kael/Lyra story and UI. */
(()=>{
 'use strict';
 const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value)}return value};
 const characters=freeze({
  kael:{id:'kael',name:'Kael',gender:'male',age:32,role:'warrior',baseHp:48,portrait:'assets/portraits/kael.webp',resources:{momentum:0},equipment:{armor:'ironArmor'},starter:['strike','strike','strike','guard','guard','challenge','heavy','finish']},
  lyra:{id:'lyra',name:'Lyra',gender:'female',age:29,role:'ranger',baseHp:38,portrait:'assets/portraits/lyra.webp',resources:{},equipment:{armor:null},starter:['shot','shot','shot','expose','expose','focus','evade']},
  selene:{id:'selene',name:'Selene',gender:'female',age:31,role:'mage',baseHp:38,portrait:'assets/portraits/selene.webp',resources:{runes:0,mends:1},equipment:{armor:null},starter:['spark','spark','spark','runeward','runeward','detonate','mend']},
  varyn:{id:'varyn',name:'Varyn',gender:'male',age:34,role:'assassin',baseHp:44,portrait:'assets/portraits/varyn.webp',resources:{shadow:0},equipment:{armor:'paddedArmor'},starter:['knife','knife','knife','veil','veil','ambush','venomknife','smoke']}
 });
 const defaults=freeze(['kael','lyra']);
 const duos=freeze({
  'kael+selene':{id:'kael+selene',members:['kael','selene'],starter:['runiccover','runiccover','aegisburst','aegisrally'],relationshipId:'kael+selene'},
  'lyra+varyn':{id:'lyra+varyn',members:['varyn','lyra'],starter:['shadowfeint','shadowfeint','crosshunt','silenttrail'],relationshipId:'lyra+varyn'},
  'selene+varyn':{id:'selene+varyn',members:['varyn','selene'],starter:['veilrune','veilrune','eclipse','nightward'],relationshipId:'selene+varyn'},
  'kael+lyra':{id:'kael+lyra',members:defaults,starter:['cover','intercept','opening','rally'],relationshipId:'kael+lyra'}});
 const blankCombat=()=>({acted:[],taunt:{source:null,charges:0},guard:{source:null,target:null,charges:0}});
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
  return {schema:1,relationshipId:pairId(ids),combat:blankCombat(),members:definitions.map(d=>({id:d.id,hp:d.baseHp,maxHp:d.baseHp,block:0,status:blankStatus(),resources:copy(d.resources||{}),equipment:copy(d.equipment||{armor:null})})),equipment:{amulet:'arcaneCharm'}};
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
   for(const key of Object.keys(h.resources))h.resources[key]=count(saved.resources?.[key],0,key==='momentum'?5:['shadow','runes'].includes(key)?3:key==='mends'?1:9999);
   h.equipment.armor=typeof saved.equipment?.armor==='string'?saved.equipment.armor:null;
  });
  const selected=party.members.map(h=>h.id),combat=raw.combat;
  if(combat){party.combat.acted=Array.isArray(combat.acted)?combat.acted.filter(id=>selected.includes(id)):[];
   if(selected.includes(combat.taunt?.source))party.combat.taunt={source:combat.taunt.source,charges:count(combat.taunt.charges)};
   if(selected.includes(combat.guard?.source)&&selected.includes(combat.guard?.target)&&combat.guard.source!==combat.guard.target)party.combat.guard={source:combat.guard.source,target:combat.guard.target,charges:count(combat.guard.charges)};
  }
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
   const slot=id==='kael'?'lead':'partner';
   alias(key,()=>member(slot,state)[field],value=>{member(slot,state)[field]=value});
  }
  alias('momentum',()=>member('lead',state).resources.momentum??member('lead',state).resources.shadow??0,value=>{const h=member('lead',state);h.resources[h.id==='kael'?'momentum':'shadow']=value});
  if(!saved.party?.combat){party.combat.taunt={source:party.members[0].id,charges:count(saved.taunt)};party.combat.guard={source:party.members[0].id,target:party.members[1].id,charges:count(saved.protectLyra)};if(saved.lastKaelThisTurn)party.combat.acted.push('kael')}
  alias('taunt',()=>state.party.combat.taunt.charges,value=>{state.party.combat.taunt={source:member('lead',state).id,charges:value}});
  alias('protectLyra',()=>state.party.combat.guard.charges,value=>{state.party.combat.guard={source:member('lead',state).id,target:member('partner',state).id,charges:value}});
  alias('lastKaelThisTurn',()=>state.party.combat.acted.includes('kael'),value=>{state.party.combat.acted=state.party.combat.acted.filter(id=>id!=='kael');if(value)state.party.combat.acted.push('kael')});
  const statuses={},equipment={};
  for(const [index,legacy] of defaults.entries()){
   const slot=index===0?'lead':'partner';
   for(const id of new Set([legacy,party.members[index].id]))Object.defineProperty(statuses,id,{enumerable:true,get:()=>member(slot,state).status,set:value=>{member(slot,state).status={...blankStatus(),...value}}});
  }
  alias('heroStatus',()=>statuses,value=>{state.party.members.forEach((h,index)=>{h.status={...blankStatus(),...(value?.[h.id]||value?.[defaults[index]])}})});
  Object.defineProperties(equipment,{armor:{enumerable:true,get:()=>member('lead',state).equipment.armor,set:value=>{member('lead',state).equipment.armor=value}},amulet:{enumerable:true,get:()=>state.party.equipment.amulet,set:value=>{state.party.equipment.amulet=value}}});
  alias('equipment',()=>equipment,value=>{member('lead',state).equipment.armor=value?.armor||null;state.party.equipment.amulet=value?.amulet||null});
  return state;
 }
 function reset(state=S){state.party=create(state.party.members.map(h=>h.id));return state.party}
 function resetCombat(state=S,catalog=characters){state.party.combat=blankCombat();for(const h of state.party.members){h.block=0;h.status=blankStatus();h.resources=copy(catalog[h.id].resources||{})}state.activeActor=null}
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
 const isLegacy=(state=S)=>state.party.relationshipId==='kael+lyra';
 const trustKey=(state=S)=>isLegacy(state)?'fd08_trust':'forbidden_deck_trust_'+state.party.relationshipId;
 const pairKey=(legacy,state=S)=>isLegacy(state)?legacy:legacy+':'+state.party.relationshipId;
 function protect(source,target,charges=1,state=S){member(source,state);member(target,state);if(source===target)throw new Error('Guard must protect a different hero');state.party.combat.guard={source,target,charges}}
 function recordPlayed(id,state=S){if(id&&!state.party.combat.acted.includes(id))state.party.combat.acted.push(id)}
 window.ForbiddenDeckParty=Object.freeze({protect,recordPlayed,isLegacy,trustKey,pairKey,characters,duos,defaults,validate,pairId,create,startingDeck,normalize,hydrate,reset,resetCombat,member,heal,healAll,addBlock,addBlockAll,defeated,resistance,damagePreview,damage,ownsCard,availableRewards,actorId,actorWeakness});
})();
