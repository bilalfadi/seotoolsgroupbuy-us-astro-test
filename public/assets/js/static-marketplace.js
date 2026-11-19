/* Static equivalent of the WordPress marketplace tab + 20-item Load More UI. */
(function(){
 const root=document.querySelector('[data-static-marketplace]'); if(!root)return;
 const cards=Array.from(root.querySelectorAll('[data-static-card]'));
 const tabs=Array.from(root.querySelectorAll('[data-static-tab]'));
 const button=root.querySelector('[data-static-more]'),wrap=root.querySelector('[data-static-more-wrap]');
 let active='all',shown=20;
 function render(){
  const filtered=cards.filter(c=>active==='all'||c.dataset.tab===active);
  cards.forEach(c=>{c.hidden=true;c.style.display='none';});
  filtered.slice(0,shown).forEach(c=>{c.hidden=false;c.style.display='';});
  tabs.forEach(a=>{a.classList.toggle('is-active',a.dataset.staticTab===active);a.setAttribute('aria-current',a.dataset.staticTab===active?'page':'false');});
  const remaining=filtered.length-shown;wrap.hidden=remaining<=0;wrap.style.display=remaining<=0?'none':'';
  button.textContent='Load More ('+Math.max(0,remaining)+' more tools)';
 }
 const q=new URLSearchParams(location.search).get('tab');if(tabs.some(a=>a.dataset.staticTab===q))active=q;
 tabs.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();active=a.dataset.staticTab;shown=20;history.replaceState(null,'',active==='all'?location.pathname:location.pathname+'?tab='+active);render();}));
 button.addEventListener('click',()=>{shown+=20;render();});render();
})();
