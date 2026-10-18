import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({window:{}});
vm.runInContext(await readFile(new URL('../js/00-party.js',import.meta.url),'utf8'),context);
const P=context.window.ForbiddenDeckParty;
const plain=x=>JSON.parse(JSON.stringify(x));
const catalog={...P.characters,
 assassin:{id:'assassin',name:'Test Assassin',gender:'male',age:33,baseHp:35,starter:['test-stab'],resources:{shadow:0}},
 mage:{id:'mage',name:'Test Mage',gender:'female',age:31,baseHp:32,starter:['test-rune'],resources:{runes:0}}
};
// All four combinations are tested as domain fixtures, not released game content.
for(const male of ['kael','assassin'])for(const female of ['lyra','mage']){
 const ids=[male,female],id=P.pairId(ids),party=P.create(ids,catalog);
 assert.equal(party.relationshipId,id);assert.equal(P.pairId([...ids].reverse()),id);
 assert.deepEqual(plain(P.create([...ids].reverse(),catalog)),plain(party));
 assert.equal(P.ownsCard({ownerId:male},party),true);assert.equal(P.ownsCard({ownerId:female},party),true);
 assert.equal(P.ownsCard({ownerId:male==='kael'?'assassin':'kael'},party),false);
 assert.equal(P.ownsCard({duoId:id},party),true);assert.equal(P.ownsCard({duoId:'wrong+pair'},party),false);
 const pairs={[id]:{starter:['test-duo']}};
 assert.deepEqual(plain(P.startingDeck(ids,catalog,pairs)),[...catalog[male].starter,...catalog[female].starter,'test-duo']);
 const state={party,tempRes:{}};P.member(male,state).hp=2;P.heal(male,10,state);assert.equal(P.member(male,state).hp,12);assert.equal(P.member(female,state).hp,catalog[female].baseHp);
 P.addBlock(female,5,state);assert.equal(P.damage(female,9,'physical',state,{}).hp,4);assert.equal(P.member(female,state).hp,catalog[female].baseHp-4);
 P.member(male,state).hp=0;assert.equal(P.defeated(state),true);
}
for(const ids of [[],['kael'],['kael','kael'],['kael','assassin'],['lyra','mage'],['unknown','lyra'],['kael','lyra','mage']])assert.throws(()=>P.create(ids,catalog));
assert.throws(()=>P.create(['kael','mage'],{...catalog,mage:{...catalog.mage,age:17}}));
assert.throws(()=>P.startingDeck(['assassin','mage'],catalog));
// Legacy aliases and new state reference exactly the same HP, status, resources and gear.
const old={kaelHp:17,kaelMaxHp:60,kaelBlock:9,lyraHp:21,lyraMaxHp:44,lyraBlock:4,momentum:3,heroStatus:{kael:{bleed:2},lyra:{poison:3,weak:1}},equipment:{armor:'paddedArmor',amulet:'serpentCharm'},deck:['strike+'],potions:['heal',null]};
const state=P.hydrate(old);assert.equal(state.party.members[0].hp,17);assert.equal(state.kaelHp,17);
state.kaelHp=11;assert.equal(P.member('kael',state).hp,11);P.member('lyra',state).block=18;assert.equal(state.lyraBlock,18);
state.heroStatus.kael={bleed:4};assert.equal(P.member('kael',state).status.bleed,4);
state.momentum=5;assert.equal(P.member('kael',state).resources.momentum,5);
assert.deepEqual(plain(P.resistance('kael',state,{paddedArmor:{res:{physical:10,toxin:10}},serpentCharm:{res:{toxin:25}}})),{physical:10,magic:0,toxin:35});
const saved=plain(state);assert.equal(Object.hasOwn(saved,'kaelHp'),false);assert.equal(Object.hasOwn(saved,'heroStatus'),false);assert.equal(Object.hasOwn(saved,'equipment'),false);
assert.deepEqual(plain(P.hydrate(saved)),saved);P.reset(state);assert.equal(state.kaelHp,48);assert.equal(state.equipment.armor,'ironArmor');state.equipment.amulet='wardCharm';assert.equal(state.party.equipment.amulet,'wardCharm');
assert.equal(P.hydrate({kaelHp:7},state).lyraHp,38,'Missing legacy fields cannot leak from previous run');
assert.throws(()=>P.normalize({schema:2,members:[]}));
assert.throws(()=>P.normalize({schema:1,members:[{id:'unknown'},{id:'lyra'}]}));
assert.equal(P.damagePreview(11,25,5,2).hp,11,'Resistance rounds once per hit, not on the sum');
console.log('Party model OK: four fixture combinations, one male/female adult rule, card and duo ownership, isolated stats, gear, legacy migration and canonical serialization.');
