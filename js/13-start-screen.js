(()=>{
  const style=document.createElement('link');
  style.rel='stylesheet';
  style.href='css/start-screen.css';
  document.head.appendChild(style);

  const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function meta(){
    try{return window.ForbiddenDeckSave?.meta?.()||{cards:[],gear:[]}}catch{return{cards:[],gear:[]}}
  }
  function hasSave(){
    try{return !!window.ForbiddenDeckSave?.hasSave?.()}catch{return false}
  }
  function uniqueBaseCards(){return [...new Set(baseDeck.map(id=>id.replace(/\+$/,'')))]}
  function allCardIds(){return Object.keys(cards).filter(id=>!id.endsWith('+')).sort((a,b)=>cards[a].name.localeCompare(cards[b].name,'pl'))}
  function discoveredSets(){
    const m=meta();
    return {
      cards:new Set([...(m.cards||[]).map(id=>id.replace(/\+$/,'')),...uniqueBaseCards()]),
      gear:new Set([...(m.gear||[]),'ironArmor','arcaneCharm'])
    };
  }

  const menu=document.createElement('div');
  menu.id='startScreen';
  menu.className='start-screen';
  menu.innerHTML=`
    <div class="start-shell">
      <section class="start-hero">
        <div class="start-logo">
          <small>dark fantasy roguelike deckbuilder</small>
          <h1>FORBIDDEN<br>DECK</h1>
          <p>Kael i Lyra ruszają przez trzy regiony, a każda walka rozwija talię, ekwipunek i ich zdolność do działania jako duet.</p>
        </div>
        <div class="start-duo">
          <div class="start-portrait"><div class="glyph">⚔️</div><div class="caption"><b>Kael</b><span>Obrona • Momentum • Prowokacja</span></div></div>
          <div class="start-portrait"><div class="glyph">🏹</div><div class="caption"><b>Lyra</b><span>Marked • Statusy • Precyzja</span></div></div>
        </div>
      </section>
      <aside class="start-menu">
        <div class="start-version"><span>BUILD V0.9</span><span>3 AKTY</span></div>
        <div class="start-actions">
          <button class="start-action primary" id="menuContinue"><strong>▶ Kontynuuj run</strong><span>Wróć do zapisanego podejścia.</span></button>
          <button class="start-action" id="menuNew"><strong>✦ Nowy run</strong><span>Wybierz poziom trudności i rozpocznij od Pogranicza.</span></button>
          <button class="start-action" id="menuCodex"><strong>▦ Kolekcja / Codex</strong><span>Odkryte karty, wyposażenie, statusy i bossowie.</span></button>
        </div>
        <div class="start-meta" id="startMeta"></div>
        <div class="start-foot">Walki są rdzeniem runu. Ogniska i sklepy pojawiają się rzadziej, dlatego decyzje między nimi mają większą wagę.</div>
      </aside>
    </div>`;
  document.body.appendChild(menu);

  const codex=document.createElement('div');
  codex.id='codexScreen';
  codex.className='codex-screen';
  codex.innerHTML=`<div class="codex-shell"><div class="codex-head"><div><h2>Codex</h2><p>Twoje odkrycia są zapisywane pomiędzy sesjami.</p></div><button class="btn" id="codexBack">← Wróć</button></div><div class="codex-tabs" id="codexTabs"></div><div id="codexBody"></div></div>`;
  document.body.appendChild(codex);

  function refreshMenu(){
    const c=document.getElementById('menuContinue');
    const available=hasSave();
    c.disabled=!available;
    c.querySelector('span').textContent=available?'Wróć dokładnie do zapisanego miejsca.':'Brak zapisanego runu.';
    const sets=discoveredSets(),all=allCardIds(),gearAll=Object.keys(gearDefs);
    const cardCount=all.filter(id=>sets.cards.has(id)).length;
    const gearCount=gearAll.filter(id=>sets.gear.has(id)).length;
    const cardPct=all.length?Math.round(cardCount/all.length*100):0;
    const gearPct=gearAll.length?Math.round(gearCount/gearAll.length*100):0;
    document.getElementById('startMeta').innerHTML=`<h3>Odkrycia</h3><div class="progress-row"><span>Karty</span><b>${cardCount}/${all.length}</b></div><div class="progress-bar"><i style="width:${cardPct}%"></i></div><div class="progress-row"><span>Wyposażenie</span><b>${gearCount}/${gearAll.length}</b></div><div class="progress-bar"><i style="width:${gearPct}%"></i></div>`;
  }

  function openMenu(){
    hideModal();
    codex.classList.remove('show');
    refreshMenu();
    menu.classList.remove('hidden');
  }
  function closeMenu(){menu.classList.add('hidden')}

  const tabs=[['cards','Karty'],['gear','Ekwipunek'],['mechanics','Mechaniki'],['bosses','Bossowie']];
  function renderCodex(tab='cards'){
    const sets=discoveredSets();
    const tabsEl=document.getElementById('codexTabs');
    tabsEl.innerHTML='';
    tabs.forEach(([id,label])=>{
      const b=document.createElement('button');b.className='codex-tab'+(tab===id?' active':'');b.textContent=label;b.onclick=()=>renderCodex(id);tabsEl.appendChild(b);
    });
    const body=document.getElementById('codexBody');
    if(tab==='cards'){
      const ids=allCardIds();
      const unlocked=ids.filter(id=>sets.cards.has(id)).length;
      body.innerHTML=`<div class="codex-summary">Odkryto <b>${unlocked}/${ids.length}</b> kart bazowych. Ulepszone warianty nie liczą się jako osobne odkrycia.</div><div class="codex-grid">${ids.map(id=>{
        const d=cards[id],ok=sets.cards.has(id);
        return `<article class="codex-card ${ok?'':'locked'}"><div class="codex-icon">${d.actor==='Kael'?'⚔️':d.actor==='Lyra'?'🏹':'🤝'}</div><h3>${ok?esc(d.name):'Nieodkryta karta'}</h3><small>${ok?esc(d.actor+' • '+d.tag):'???'}</small><p>${ok?esc(d.text):'Zdobądź ją podczas runu, aby odsłonić opis.'}</p></article>`;
      }).join('')}</div>`;
    }else if(tab==='gear'){
      const ids=Object.keys(gearDefs),unlocked=ids.filter(id=>sets.gear.has(id)).length;
      body.innerHTML=`<div class="codex-summary">Odkryto <b>${unlocked}/${ids.length}</b> elementów wyposażenia.</div><div class="codex-grid">${ids.map(id=>{
        const d=gearDefs[id],ok=sets.gear.has(id);
        return `<article class="codex-card ${ok?'':'locked'}"><div class="codex-icon">${d.slot==='armor'?'🛡️':'🔮'}</div><h3>${ok?esc(d.name):'Nieodkryty przedmiot'}</h3><small>${ok?(d.slot==='armor'?'Pancerz':'Amulet'):'???'}</small><p>${ok?esc(d.desc):'Znajdź go podczas runu, aby odsłonić właściwości.'}</p></article>`;
      }).join('')}</div>`;
    }else if(tab==='mechanics'){
      const mechanics=[
        ['🤝 Trust','Długoterminowa relacja Kaela i Lyry. Wyższy Trust odblokowuje nowe karty Duo.'],
        ['⚡ Synergy','Budowana w pojedynczej walce przez współpracę. Pozwala uruchamiać najmocniejsze zagrania Duo.'],
        ['🎯 Marked','Lyra przygotowuje cel, a kolejne karty mogą wykorzystać znaczniki do mocniejszych ataków.'],
        ['🔥 Momentum','Kael buduje impet atakami i wykorzystuje go w finisherach.'],
        ['🛡️ Prowokacja / Ochrona','Prowokacja kieruje większość ciosów w Kaela. Ochrona pozwala przejąć atak wymierzony w Lyrę.'],
        ['🩸☠️🔥 Statusy','Krwawienie, trucizna, podpalenie i osłabienie tworzą buildy oparte na obrażeniach w czasie i kontroli.']
      ];
      body.innerHTML=`<div class="codex-mechanics">${mechanics.map(([h,p])=>`<article class="mechanic-card"><h3>${h}</h3><p>${p}</p></article>`).join('')}</div>`;
    }else{
      const bossNames=['Strażniczka Pogranicza','Królowa Cierni','Królowa Popiołu'];
      body.innerHTML=`<div class="codex-grid">${ACTS.map((a,i)=>`<article class="codex-card"><div class="codex-icon">👑</div><h3>${esc(bossNames[i]||a.title)}</h3><small>Akt ${i+1} • ${esc(a.title)}</small><p>${i===0?'Testuje podstawy Block, Marked i wyboru celu.':i===1?'Łączy presję statusów i wielu przeciwników.':'Dwie fazy: najpierw nacisk fizyczny na Kaela, później magia i polowanie na Lyrę.'}</p></article>`).join('')}</div>`;
    }
  }

  document.getElementById('menuContinue').onclick=()=>{if(!hasSave())return;closeMenu();window.ForbiddenDeckSave.load()};
  document.getElementById('menuNew').onclick=()=>{closeMenu();difficultyChooser()};
  document.getElementById('menuCodex').onclick=()=>{renderCodex('cards');codex.classList.add('show')};
  document.getElementById('codexBack').onclick=()=>{codex.classList.remove('show');openMenu()};
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&codex.classList.contains('show')){codex.classList.remove('show');openMenu()}});

  refreshMenu();
  window.ForbiddenDeckMenu={open:openMenu,close:closeMenu,codex:renderCodex,refresh:refreshMenu};
})();
