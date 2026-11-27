/* Highlight the currently visible CMS guide section in the desktop sidebar. */
(function(){
 document.querySelectorAll('.us6-guide').forEach(root=>{
  const links=[...root.querySelectorAll('.us6-guide-nav a')];
  const ids=links.map(l=>l.getAttribute('href').slice(1));
  const sync=()=>{
   let active=ids[0];
   for(const id of ids){const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<220)active=id}
   links.forEach(link=>{if(link.getAttribute('href')==='#'+active)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current')});
  };
  window.addEventListener('scroll',sync,{passive:true});
  sync();
 });
})();
