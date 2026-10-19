import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser=await chromium.launch({headless:true});
const errors=[];
async function fresh(){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',error=>errors.push(error.message));
  page.on('requestfailed',request=>errors.push(`${request.failure()?.errorText}: ${request.url()}`));
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()}: ${response.url()}`)});
  await page.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
  await page.evaluate(()=>{ForbiddenDeckMenu.close();newRun('standard');ForbiddenTutorial.setEnabled(false)});
  return page;
}
async function choices(page){await page.locator('#campfireNext').click();await page.locator('#campfireNext').click()}
async function finish(page,choice){
  await page.locator(`[data-camp-choice="${choice}"]`).click();
  await page.locator('#campfireNext').click();await page.locator('#campfireNext').click();
}
try{
  const page=await fresh();
  for(const [act,id] of ['borderlands','tainted-forest','ash-citadel'].entries()){
    await page.evaluate(act=>{S.act=act;S.stage=0;renderMap()},act);
    assert.equal(await page.locator('.map-panel').getAttribute('data-region'),id);
    await page.waitForFunction(()=>document.querySelector('#journeyVista img').naturalWidth>0);
    await page.waitForSelector('.journey-paths path',{state:'attached'});
    assert.equal(await page.locator('.node:not([disabled])').count(),await page.evaluate(()=>currentAct().route[0].length));
    assert.equal(await page.locator('.journey-paths path[d*="NaN"]').count(),0);
    for(const width of [390,320,1440]){
      await page.setViewportSize({width,height:1000});
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'Map must fit narrow screens');
    }
    await page.evaluate(()=>{S.stage=currentAct().route.findIndex(row=>row.some(n=>n.type==='camp'));S.kaelHp-=20;renderMap()});
    const before=await page.evaluate(()=>({hp:S.kaelHp,stage:S.stage,act:S.act}));
    await page.locator('.node.camp:not(.locked)').click();
    await page.waitForFunction(()=>document.querySelector('.regional-camp img')?.naturalWidth>0);
    assert.equal(await page.locator('#modalBody .choice').count(),4,'All camp activities remain available');
    assert.equal(await page.evaluate(()=>ForbiddenDeckJourney.region().id),id);
    await page.locator('#modalBody .choice').filter({hasText:'Odpoczynek'}).click();
    assert.equal(await page.evaluate(()=>S.kaelHp),before.hp+14);
    assert.equal(await page.evaluate(()=>S.stage),before.stage+1);
    assert.equal(await page.locator('.node.visited').count(),1);
    assert(await page.evaluate(()=>Object.hasOwn(S.routeHistory[S.act],S.stage-1)));
    // Each region's history is independent, including equal-numbered steps.
    assert.equal(await page.evaluate(act=>Object.keys(S.routeHistory[act]).length,act),1);
  }
  const history=await page.evaluate(()=>S.routeHistory);
  await page.reload({waitUntil:'networkidle'});await page.locator('#menuContinue').click();
  assert.deepEqual(await page.evaluate(()=>S.routeHistory),history,'Chosen route survives reload');
  await page.evaluate(()=>{newRun('standard');ForbiddenTutorial.setEnabled(false)});
  assert.deepEqual(await page.evaluate(()=>S.routeHistory),{},'New runs do not inherit visited nodes');
  await page.locator('.node:not(.locked)').first().click();
  await page.locator('.hand .card:not(.disabled)').first().click();
  await page.locator('#endTurnBtn').click();
  assert.equal(await page.evaluate(()=>S.turn),2,'New map still enters a working battle');
  await page.close();

  const outcomes=[];
  for(const scenario of [{enabled:true,choice:'romance'},{enabled:true,choice:'friendship'},{enabled:false,choice:'friendship'},{enabled:false,choice:'skipped'}]){
    const page=await fresh();
    await page.evaluate(enabled=>{
      S.trust=60;saveTrust();S.stage=3;
      localStorage.setItem('forbidden_deck_relationship_v1',JSON.stringify({schema:2,seen:['trust20','trust40'],choices:[],stats:{scenes:2,supportive:2,pragmatic:0},romance:{campfireChoice:'romance'},campfire:{completed:true}}));
      ForbiddenDeckRelationship.setRomanceEnabled(enabled);campDialogue();
    },scenario.enabled);
    assert.equal(await page.locator('#modalTitle').textContent(),'Bez rozkazu');
    await page.locator('#campfireNext').click();
    const line=await page.locator('.campfire-line').textContent();
    assert.equal(line.includes('nadal myślałam o tym, żeby cię pocałować'),scenario.enabled,'Previous romance is remembered only with the setting enabled');
    await page.locator('#campfireNext').click();
    assert.equal(await page.locator('.moment-art').count(),0,'Trust alone must not display romantic artwork');
    if(scenario.choice==='skipped')await page.locator('#campfireSkip').click();
    else{
      assert.equal(await page.locator('[data-camp-choice="romance"]').count(),scenario.enabled?1:0);
      if(scenario.choice==='romance'){
        await page.locator('[data-camp-choice="romance"]').click();
        await page.waitForFunction(()=>document.querySelector('.moment-art img')?.naturalWidth>0);
        await page.reload({waitUntil:'networkidle'});
        // Exercise the original persistence button as well as the menu path.
        await page.evaluate(()=>{ForbiddenDeckMenu.close();document.getElementById('continueRunBtn').click()});
        await page.waitForSelector('.moment-art');
        assert.equal(await page.evaluate(()=>S.relationshipScene.id),'campfire60');
        await page.locator('#campfireNext').click();await page.locator('#campfireNext').click();
      }else await finish(page,scenario.choice);
    }
    const state=await page.evaluate(()=>({trust:S.trust,stage:S.stage,relation:ForbiddenDeckRelationship.load()}));
    assert.equal(state.trust,69);assert.equal(state.stage,4);
    assert.equal(state.relation.romance.trust60Choice,scenario.choice);
    assert.equal(state.relation.romance.campfireChoice,'romance','The earlier decision is not overwritten');
    assert.equal(state.relation.pendingBoon,'protect');
    assert.deepEqual(state.relation.seen,['trust20','trust40','trust60']);
    const benefit=await page.evaluate(()=>{
      S.currentNode={type:'battle',label:'Sprawdzenie wsparcia'};startBattle([enemy('Manekin','🎯',30,'bandit',4)]);
      return{protect:S.protectLyra,synergy:S.synergy,pending:ForbiddenDeckRelationship.load().pendingBoon};
    });
    assert.deepEqual(benefit,{protect:1,synergy:10,pending:null});outcomes.push(benefit);
    await page.reload({waitUntil:'networkidle'});
    assert.equal(await page.evaluate(()=>ForbiddenDeckRelationship.load().romance.trust60Choice),scenario.choice);
    await page.evaluate(()=>ForbiddenDeckRelationship.open());
    await page.locator('#replayCampfire60').click();await choices(page);
    await finish(page,'friendship');
    assert.equal(await page.evaluate(()=>S.trust),69,'Replay must not award Trust twice');
    assert.equal(await page.evaluate(()=>ForbiddenDeckRelationship.load().romance.trust60Choice),scenario.choice);
    await page.close();
  }
  outcomes.forEach(outcome=>assert.deepEqual(outcome,outcomes[0]));
  // A pre-journey save has no selected-node history and may still hold the old 60 Trust boon.
  const legacy=await fresh();
  await legacy.evaluate(()=>{
    S.trust=80;saveTrust();S.gold=123;ForbiddenDeckSave.save('map');
    const payload=JSON.parse(localStorage.getItem('forbidden_deck_run_v1'));delete payload.state.routeHistory;
    ForbiddenDeckSave.clear();localStorage.setItem('forbidden_deck_run_v1',JSON.stringify(payload));
    localStorage.setItem('forbidden_deck_relationship_v1',JSON.stringify({schema:1,seen:['trust20','trust40','trust60'],choices:[{scene:'trust60',choice:'test-it'}],pendingBoon:'hunt',stats:{scenes:3,supportive:2,pragmatic:1}}));
  });
  await legacy.reload({waitUntil:'networkidle'});await legacy.locator('#menuContinue').click();
  assert.deepEqual(await legacy.evaluate(()=>S.routeHistory),{},'Do not invent the route of an old save');
  assert.equal(await legacy.locator('.node.visited').count(),0);
  assert.equal(await legacy.evaluate(()=>S.gold),123);
  await legacy.evaluate(()=>{ForbiddenDeckRelationship.setRomanceEnabled(true);ForbiddenDeckRelationship.open()});
  await legacy.locator('#replayCampfire60').click();
  await legacy.locator('#campfireNext').click();
  assert(!(await legacy.locator('.campfire-line').textContent()).includes('nadal myślałam o tym, żeby cię pocałować'),'A legacy supportive/pragmatic choice does not imply earlier romance');
  await legacy.locator('#campfireNext').click();await finish(legacy,'romance');
  const preserved=await legacy.evaluate(()=>({trust:S.trust,relation:ForbiddenDeckRelationship.load()}));
  assert.equal(preserved.trust,80);assert.equal(preserved.relation.pendingBoon,'hunt');
  assert.deepEqual(preserved.relation.choices,[{scene:'trust60',choice:'test-it'}]);
  assert.deepEqual(preserved.relation.stats,{scenes:3,supportive:2,pragmatic:1});
  assert.equal(preserved.relation.romance.trust60Choice,'romance');
  const marked=await legacy.evaluate(()=>{S.currentNode={type:'battle',label:'Stara premia'};startBattle([enemy('Manekin','🎯',30,'bandit',4)]);return S.enemies[0].marked});
  assert.equal(marked,1,'The old Marked reward remains usable');
  await legacy.close();
  assert.deepEqual(errors,[]);
  console.log('Journey OK: 3 illustrated regions/camps, connected map, persistent chosen route, mobile map, 60 Trust memory/resume/replay and equal benefits across 4 paths.');
}finally{await browser.close()}
