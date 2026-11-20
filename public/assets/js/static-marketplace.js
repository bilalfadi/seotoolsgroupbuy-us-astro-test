/* Cloudflare-static equivalent of the WordPress 20-item AJAX marketplace.
 * The original published cards remain in static HTML for crawling/no-JS users.
 * With JS, mount only the requested batch; no WordPress/PHP REST dependency. */
(function(){
  const root=document.querySelector('[data-static-marketplace]');
  if(!root)return;
  const grid=root.querySelector('[data-static-grid]');
  const button=root.querySelector('[data-static-more]');
  const wrap=root.querySelector('[data-static-more-wrap]');
  const tabs=Array.from(root.querySelectorAll('[data-static-tab]'));
  if(!grid||!button||!wrap)return;
  const cards=Array.from(grid.querySelectorAll('[data-static-card]'));
  const pageSize=20;
  let shown=pageSize;
  const allowed=tabs.map(t=>t.dataset.staticTab);
  const query=new URLSearchParams(location.search).get('tab');
  let active=allowed.includes(query)?query:'all';
  function render(){
    const filtered=cards.filter(c=>active==='all'||c.dataset.tab===active);
    const visible=filtered.slice(0,shown);
    grid.replaceChildren(...visible);
    tabs.forEach(a=>{
      const selected=a.dataset.staticTab===active;
      a.classList.toggle('is-active',selected);
      a.setAttribute('aria-current',selected?'page':'false');
    });
    const remaining=Math.max(0,filtered.length-visible.length);
    wrap.hidden=remaining===0;
    wrap.style.display=remaining===0?'none':'';
    button.textContent='Load More ('+remaining+' more tools)';
  }
  tabs.forEach(a=>a.addEventListener('click',event=>{
    event.preventDefault();
    active=a.dataset.staticTab;
    shown=pageSize;
    const next=new URL(location.href);
    if(active==='all')next.searchParams.delete('tab');
    else next.searchParams.set('tab',active);
    history.replaceState(null,'',next.pathname+next.search+next.hash);
    render();
  }));
  button.addEventListener('click',()=>{shown+=pageSize;render()});
  window.addEventListener('popstate',()=>{
    const q=new URLSearchParams(location.search).get('tab');
    active=allowed.includes(q)?q:'all';
    shown=pageSize;
    render();
  });
  render();
})();
