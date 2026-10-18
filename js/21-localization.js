/* Presentation-only localization. Canonical names/IDs in S never change: targeting,
   saves, rewards and active dialogue closures remain independent of language. */
(()=>{
 'use strict';
 const KEY='forbidden_deck_language_v1';
 let language='pl';try{if(localStorage.getItem(KEY)==='en')language='en'}catch{}
 const catalog=window.ForbiddenDeckEnglish;
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const keys=Object.keys(catalog).sort((a,b)=>b.length-a.length);
 // One pass prevents translated words from being translated a second time.
 const pattern=new RegExp(keys.map(escape).join('|'),'gu');
 function translate(source){
  if(language==='pl')return source;
  return source.replace(pattern,(match,offset,whole)=>{
   // Short labels may occur inside Polish words: match whole words only.
   const before=whole[offset-1]||'',after=whole[offset+match.length]||'';
   if((/^\p{L}/u.test(match)&&/\p{L}/u.test(before))||(/\p{L}$/u.test(match)&&/\p{L}/u.test(after)))return match;
   return catalog[match];
  });
 }
 const originals=new WeakMap(),attributes=new WeakMap();
 const excluded=node=>node.parentElement?.closest('script,style,textarea,[data-no-translate]');
 function textNode(node){
  if(excluded(node)||!node.nodeValue.trim())return;
  const old=originals.get(node),current=node.nodeValue;
  const source=old&&old.rendered===current?old.source:current;
  const rendered=translate(source);originals.set(node,{source,rendered});
  if(current!==rendered)node.nodeValue=rendered;
 }
 function element(el){
  if(el.closest('script,style,[data-no-translate]'))return;
  const record=attributes.get(el)||{};
  for(const key of ['title','alt','aria-label','placeholder'])if(el.hasAttribute(key)){
   const current=el.getAttribute(key),old=record[key],source=old&&old.rendered===current?old.source:current;
   const rendered=translate(source);record[key]={source,rendered};if(current!==rendered)el.setAttribute(key,rendered);
  }
  attributes.set(el,record);
 }
 function walk(root){
  if(root.nodeType===3){textNode(root);return}
  if(root.nodeType!==1)return;
  element(root);
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
  while(walker.nextNode())if(walker.currentNode.nodeType===3)textNode(walker.currentNode);else element(walker.currentNode);
 }
 const options={subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['title','alt','aria-label','placeholder']};
 const observer=new MutationObserver(records=>{
  observer.disconnect();
  const roots=new Set();for(const r of records){if(r.type==='childList')r.addedNodes.forEach(n=>roots.add(n));else roots.add(r.target)}
  for(const node of roots)if(node.isConnected)walk(node);
  observer.observe(document.body,options);
 });
 function refresh(){observer.disconnect();walk(document.body);document.documentElement.lang=language;observer.observe(document.body,options)}
 function setLanguage(value){
  if(!['pl','en'].includes(value))return;
  language=value;try{localStorage.setItem(KEY,value)}catch{}
  document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===value)));
  refresh();window.dispatchEvent(new CustomEvent('forbidden-deck:language',{detail:{language}}));
 }
 const picker=document.createElement('div');picker.className='language-picker';picker.setAttribute('role','group');picker.setAttribute('aria-label','Język / Language');picker.dataset.noTranslate='';
 picker.innerHTML='<span>Język / Language</span><button type="button" data-language="pl" lang="pl">Polski</button><button type="button" data-language="en" lang="en">English</button>';
 document.querySelector('#startScreen .start-version').after(picker);
 picker.querySelectorAll('button').forEach(b=>{b.onclick=()=>setLanguage(b.dataset.language)});
 // Also available while playing, without re-entering or rerolling a view.
 const quick=document.createElement('button');quick.id='languageBtn';quick.className='btn';quick.dataset.noTranslate='';quick.setAttribute('aria-label','Zmień język / Change language');quick.onclick=()=>setLanguage(language==='pl'?'en':'pl');
 document.querySelector('.topbar .stats').prepend(quick);
 const quickLabel=()=>{quick.textContent=language==='pl'?'PL → EN':'EN → PL'};
 window.addEventListener('forbidden-deck:language',quickLabel);quickLabel();
 window.ForbiddenDeckLanguage={get:()=>language,set:setLanguage,translate,refresh,catalog};
 setLanguage(language);
})();
