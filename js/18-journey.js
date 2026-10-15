(()=>{
  const regions=[
    {id:'borderlands',art:'assets/regions/borderlands.webp',eyebrow:'Ostatnie światło',description:'Droga stygnie, zanim zniknie za wzgórzami. W oddali ktoś jeszcze pali światło.',camp:'Ogień na Pograniczu',night:'Wiatr porusza wrzosem. Kael osłania płomień dłonią, a Lyra po raz pierwszy odkłada łuk w zasięgu jego ręki.'},
    {id:'tainted-forest',art:'assets/regions/tainted-forest.webp',eyebrow:'Tam, gdzie las słucha',description:'Mgła połyka odgłos kroków. Trzymajcie się blisko — za światłem szlaku zaczyna się obcy świat.',camp:'Krąg światła',night:'Za kamiennym kręgiem coś szeleści. Lyra przysuwa drugi kubek do ognia. „Tutaj przynajmniej słyszę, jak oddychasz.”'},
    {id:'ash-citadel',art:'assets/regions/ash-citadel.webp',eyebrow:'Przed ostatnią bramą',description:'Popiół osiada na płaszczach. Za mostem czeka tron; tutaj wciąż można wybrać wspólną drogę.',camp:'Pod popielnym niebem',night:'Popiół opada cicho jak śnieg. Kael strzepuje go z płaszcza Lyry. Przez chwilę żadne nie patrzy w stronę cytadeli.'}
  ];
  const asset=path=>globalThis.ForbiddenDeckPreviewAssets?.[path]||path;
  const region=()=>regions[Math.max(0,Math.min(regions.length-1,S.act||0))];
  const map=document.getElementById('map');
  const panel=document.querySelector('.map-panel');
  const vista=document.createElement('section');vista.className='journey-vista';vista.id='journeyVista';
  document.querySelector('.map-head').after(vista);
  map.classList.add('journey-map');
  let frame=0;

  function connections(){
    const svg=map.querySelector('.journey-paths');if(!svg||!map.offsetWidth)return;
    svg.replaceChildren();
    svg.setAttribute('viewBox',`0 0 ${map.clientWidth} ${map.clientHeight}`);
    const bounds=map.getBoundingClientRect(),history=S.routeHistory?.[S.act]||{};
    const rows=[...map.querySelectorAll('.row')].sort((a,b)=>Number(a.dataset.step)-Number(b.dataset.step));
    for(let step=0;step<rows.length-1;step++){
      const from=[...rows[step].querySelectorAll('.node')],to=[...rows[step+1].querySelectorAll('.node')];
      from.forEach((a,i)=>to.forEach((b,j)=>{
        const ar=a.getBoundingClientRect(),br=b.getBoundingClientRect();
        const x1=ar.left+ar.width/2-bounds.left,y1=ar.bottom-bounds.top;
        const x2=br.left+br.width/2-bounds.left,y2=br.top-bounds.top;
        const path=document.createElementNS('http://www.w3.org/2000/svg','path');
        const middle=(y1+y2)/2;
        path.setAttribute('d',`M ${x1} ${y1} C ${x1} ${middle} ${x2} ${middle} ${x2} ${y2}`);
        const travelled=history[step]===i&&history[step+1]===j;
        const available=step===S.stage-1&&history[step]===i;
        path.setAttribute('class',travelled?'travelled':available?'available':'');
        svg.appendChild(path);
      }));
    }
  }
  function schedulePaths(){cancelAnimationFrame(frame);frame=requestAnimationFrame(connections)}
  function decorateMap(){
    const area=region(),route=currentAct().route,history=S.routeHistory?.[S.act]||{};
    panel.dataset.region=area.id;
    panel.style.setProperty('--region-art',`url("${new URL(asset(area.art),document.baseURI).href}")`);
    vista.innerHTML='<img width="1672" height="941" alt=""><div class="journey-vista-copy"><span class="journey-eyebrow"></span><h2></h2><p></p><div class="journey-progress"></div></div>';
    const img=vista.querySelector('img');img.src=asset(area.art);img.alt=currentAct().title+' — droga przez region';
    vista.querySelector('.journey-eyebrow').textContent=area.eyebrow;
    vista.querySelector('h2').textContent=currentAct().title;
    vista.querySelector('p').textContent=area.description;
    vista.querySelector('.journey-progress').textContent=`Etap ${Math.min(S.stage+1,route.length)} / ${route.length} · wybierz rozświetlone miejsce`;
    [...map.querySelectorAll('.row')].forEach((row,index)=>{
      const step=route.length-1-index;row.dataset.step=step;
      row.classList.toggle('current-step',step===S.stage);
      const marker=document.createElement('span');marker.className='journey-step';marker.textContent=String(step+1).padStart(2,'0');marker.setAttribute('aria-hidden','true');row.prepend(marker);
      row.querySelectorAll('.node').forEach((button,i)=>{
        const visited=history[step]===i;
        button.classList.toggle('visited',visited);
        button.disabled=step!==S.stage;
        button.setAttribute('aria-label',`${button.querySelector('strong').textContent} · etap ${step+1}${visited?' · odwiedzone':step===S.stage?' · dostępne':''}`);
        if(step===S.stage)button.setAttribute('aria-current','step');
        if(visited){const stamp=document.createElement('span');stamp.className='journey-stamp';stamp.textContent='✓';button.appendChild(stamp)}
      });
    });
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('journey-paths');svg.setAttribute('aria-hidden','true');map.prepend(svg);
    schedulePaths();
    requestAnimationFrame(()=>{
      if(!document.getElementById('mapScreen').classList.contains('active')||!document.getElementById('startScreen')?.classList.contains('hidden')||document.querySelector('#overlay.show'))return;
      if(S.stage===0)window.scrollTo(0,0);
      else map.querySelector('.current-step')?.scrollIntoView({block:'center'});
    });
  }
  const baseRenderMap=renderMap;
  renderMap=function(){const result=baseRenderMap();decorateMap();return result};
  const baseEnter=enterNode;
  enterNode=function(node,index){
    if(!S.routeHistory||typeof S.routeHistory!=='object')S.routeHistory={};
    if(!S.routeHistory[S.act])S.routeHistory[S.act]={};
    S.routeHistory[S.act][S.stage]=index;
    const result=baseEnter(node,index);window.ForbiddenDeckSave?.save?.();return result;
  };
  const baseNewRun=newRun;
  newRun=function(difficulty=S.difficulty){S.routeHistory={};return baseNewRun(difficulty)};

  const baseCamp=camp;
  camp=function(){
    const result=baseCamp(),area=region(),body=document.getElementById('modalBody');
    const art=document.createElement('figure');art.className='regional-camp';
    const img=document.createElement('img');img.src=asset(area.art);img.alt=area.camp;img.width=1672;img.height=941;
    const caption=document.createElement('figcaption');caption.textContent=currentAct().title+' · bezpieczny krąg';art.append(img,caption);body.prepend(art);
    document.getElementById('modalTitle').textContent=area.camp;
    document.getElementById('modalText').textContent=area.night;
    const talk=[...body.querySelectorAll('.choice')].find(button=>button.textContent.includes('Rozmowa'));
    if(talk){
      const next=window.ForbiddenDeckRelationship?.nextScene();
      talk.querySelector('span').textContent=next?.threshold===40?'+6 Trust i +1 energia w następnej walce.':next?.threshold===60?'+9 Trust, Ochrona i +10 Synergy w następnej walce.':'Rozmowa i wybór, który zostanie z Wami na dalszą drogę.';
    }
    document.querySelector('#overlay .modal').classList.add('regional-camp-modal');
    return result;
  };
  const baseModal=showModal;
  showModal=function(...args){document.querySelector('#overlay .modal').classList.remove('regional-camp-modal');return baseModal(...args)};
  new ResizeObserver(schedulePaths).observe(map);
  window.addEventListener('resize',schedulePaths);
  window.ForbiddenDeckJourney={region,asset,regions};
  decorateMap();
})();
