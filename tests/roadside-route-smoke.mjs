import assert from 'node:assert/strict';
import {chromium} from 'playwright';
// Route coverage, not a combat bot: non-event nodes are advanced by the harness.
const browser=await chromium.launch(),page=await browser.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 await page.goto(process.env.FD_TEST_URL||'http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 const routes=await page.evaluate(()=>ACTS.map(a=>a.route.map(nodes=>nodes.map(n=>n.type))));
 const report=[];
 for(const ids of [['kael','lyra'],['kael','selene'],['varyn','lyra'],['varyn','selene']])for(const firstAct of [0,1,2])for(const choice of [0,1,'skipped']){
  await page.evaluate(ids=>{hideModal();ForbiddenDeckRoster.start(ids);ForbiddenTutorial.setEnabled(false)},ids);
  const seen=[];
  for(let act=0;act<routes.length;act++)for(let stage=0;stage<routes[act].length;stage++){
   const eventIndex=routes[act][stage].indexOf('event');
   await page.evaluate(({act,stage})=>{hideModal();S.act=act;S.stage=stage;renderMap()},{act,stage});
   if(act<firstAct||eventIndex<0)continue;
   await page.locator('.node:not(.locked)').nth(eventIndex).click();
   if(await page.locator('[data-road-followup]').count()){
    seen.push({act,stage,kind:'followup'});
    assert.equal(await page.evaluate(()=>S.roadside.choice),choice);
    await page.locator('[data-road-continue]').click();
   }else if(await page.locator('#roadsideScene').count()){
    seen.push({act,stage,kind:'opening'});
    if(choice==='skipped')await page.locator('[data-road-skip]').click();
    else{await page.locator(`[data-road-choice="${choice}"]`).click();await page.locator('[data-road-continue]').click()}
   }
   assert.equal(await page.locator('#roadsideScene').count(),0);
   assert.equal(await page.evaluate(()=>S.stage),stage,'Scene must not consume the route event');
   await page.locator('#modalBody .choice').first().click();
   assert.equal(await page.evaluate(()=>S.stage),stage+1,'Original event advances exactly once');
  }
  const eligible=routes.flatMap((stages,act)=>stages.flatMap((nodes,stage)=>act>=firstAct&&nodes.includes('event')?[{act,stage}]:[]));
  const opening=eligible[0],later=eligible.find(n=>n.act>opening.act);
  const expected=[{...opening,kind:'opening'},...(choice!=='skipped'&&later?[{...later,kind:'followup'}]:[])];
  assert.deepEqual(seen,expected,'Exactly one opening and at most one later-act follow-up');
  const memory=await page.evaluate(()=>ForbiddenDeckNarrative.capture());
  assert.equal(!!memory.roadside?.followup,expected.length===2);
  if(choice==='skipped')assert.equal(memory.roadside.choice,'skipped');
  report.push({pair:ids.join('+'),firstAct:firstAct+1,choice,scenes:seen.map(n=>`${n.kind}@${n.act+1}:${n.stage+1}`)});
 }
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify(report));
 console.log('Route coverage OK: 36 scenarios, all three acts, delayed opening, both choices, skip, no duplicate follow-up and original event progression. Non-event nodes bypassed; not combat balance or play-time measurement.');
}finally{await browser.close()}
