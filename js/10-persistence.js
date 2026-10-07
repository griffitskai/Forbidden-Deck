(()=>{
 const SAVE_KEY="forbidden_deck_run_v1";
 const META_KEY="forbidden_deck_meta_v1";
 const SAVE_SCHEMA=1;
 let restoring=false;
 let runActive=false;

 function safeParse(raw){
  try{return JSON.parse(raw)}catch{return null}
 }
 function loadPayload(){
  const data=safeParse(localStorage.getItem(SAVE_KEY));
  if(!data||data.schema!==SAVE_SCHEMA||!data.state||typeof data.state!=="object")return null;
  if(!Array.isArray(data.state.deck)||!Array.isArray(data.state.potions))return null;
  return data;
 }
 function hasValidSave(){return !!loadPayload()}
 function loadMeta(){
  const data=safeParse(localStorage.getItem(META_KEY));
  return data&&data.schema===SAVE_SCHEMA?data:{schema:SAVE_SCHEMA,cards:[],gear:[]};
 }
 function discoverFromState(){
  const meta=loadMeta();
  const cardsSet=new Set(meta.cards||[]);
  const gearSet=new Set(meta.gear||[]);
  (S.deck||[]).forEach(id=>cardsSet.add(id));
  (S.inventory||[]).forEach(id=>gearSet.add(id));
  Object.values(S.equipment||{}).filter(Boolean).forEach(id=>gearSet.add(id));
  localStorage.setItem(META_KEY,JSON.stringify({schema:SAVE_SCHEMA,cards:[...cardsSet],gear:[...gearSet]}));
 }
 function currentScreen(){return document.getElementById("battleScreen")?.classList.contains("active")?"battle":"map"}
 function serializeState(){
  return JSON.parse(JSON.stringify(S));
 }
 function updateContinueButton(){
  const btn=document.getElementById("continueRunBtn");
  if(!btn)return;
  const payload=loadPayload();
  btn.hidden=!payload;
  if(payload){
   const act=(payload.state.act??0)+1;
   const level=payload.state.level??1;
   btn.textContent="▶ Kontynuuj • Akt "+act+" • Lv "+level;
   btn.title="Wczytaj zapis z "+new Date(payload.savedAt).toLocaleString();
  }
 }
 function saveRun(screen=currentScreen()){
  if(restoring||!runActive)return;
  try{
   discoverFromState();
   localStorage.setItem(SAVE_KEY,JSON.stringify({schema:SAVE_SCHEMA,savedAt:new Date().toISOString(),screen,state:serializeState()}));
   updateContinueButton();
  }catch(error){
   console.warn("Forbidden Deck: nie udało się zapisać runu",error);
  }
 }
 function clearRunSave(refresh=true){
  localStorage.removeItem(SAVE_KEY);
  runActive=false;
  if(refresh)updateContinueButton();
 }
 function restoreRun(){
  const payload=loadPayload();
  if(!payload){
   clearRunSave();
   showModal("Brak zapisu","Nie znaleziono poprawnego zapisu runu.",()=>grid([["OK","Wróć do mapy.",hideModal]]),true);
   return;
  }
  restoring=true;
  try{
   const saved=payload.state;
   S={...S,...saved};
   S.deck=Array.isArray(saved.deck)?saved.deck:[...baseDeck];
   S.inventory=Array.isArray(saved.inventory)?saved.inventory:[];
   S.potions=Array.isArray(saved.potions)?saved.potions:[null,null];
   S.draw=Array.isArray(saved.draw)?saved.draw:[];
   S.discard=Array.isArray(saved.discard)?saved.discard:[];
   S.hand=Array.isArray(saved.hand)?saved.hand:[];
   S.enemies=Array.isArray(saved.enemies)?saved.enemies:[];
   S.tempRes=saved.tempRes||{physical:0,magic:0,toxin:0};
   runActive=true;
   saveTrust();
   hideModal();
   if(payload.screen==="battle"&&S.enemies.length&&S.kaelHp>0&&S.lyraHp>0&&!S.battleOver){
    showScreen("battleScreen");
    const logEl=document.getElementById("log");if(logEl)logEl.innerHTML="";
    log("Wczytano zapis bieżącej walki.","info");
    renderBattle();
   }else{
    S.battleOver=false;
    renderMap();
   }
  }finally{
   restoring=false;
  }
  saveRun(payload.screen);
 }

 const baseRenderMap=renderMap;
 renderMap=function(){
  const result=baseRenderMap();
  if(runActive)saveRun("map");
  return result;
 };
 const baseStartBattle=startBattle;
 startBattle=function(enemies){
  runActive=true;
  const result=baseStartBattle(enemies);
  saveRun("battle");
  return result;
 };
 const baseRenderBattle=renderBattle;
 renderBattle=function(){
  const result=baseRenderBattle();
  if(runActive)saveRun("battle");
  return result;
 };
 const baseNewRun=newRun;
 newRun=function(diff=S.difficulty){
  clearRunSave(false);
  runActive=true;
  const result=baseNewRun(diff);
  saveRun("map");
  return result;
 };
 const baseDefeat=defeat;
 defeat=function(){
  clearRunSave();
  return baseDefeat();
 };
 const baseRunComplete=runComplete;
 runComplete=function(){
  clearRunSave();
  return baseRunComplete();
 };

 function confirmNewRun(){
  if(!hasValidSave()){difficultyChooser();return}
  showModal("Rozpocząć nowy run?","Masz zapisane podejście. Nowy run zastąpi je dopiero po wybraniu poziomu trudności.",()=>grid([
   ["▶ Kontynuuj zapis","Wróć do aktualnego runu.",()=>restoreRun()],
   ["🆕 Nowy run","Wybierz poziom trudności i rozpocznij od początku.",()=>{hideModal();difficultyChooser()}]
  ]),true);
 }

 const continueBtn=document.getElementById("continueRunBtn");
 if(continueBtn)continueBtn.onclick=restoreRun;
 const newRunBtn=document.getElementById("newRunBtn");
 if(newRunBtn)newRunBtn.onclick=confirmNewRun;

 window.addEventListener("beforeunload",()=>{if(runActive)saveRun()});
 updateContinueButton();
 window.ForbiddenDeckSave={save:saveRun,load:restoreRun,clear:clearRunSave,hasSave:hasValidSave,meta:loadMeta};
})();
