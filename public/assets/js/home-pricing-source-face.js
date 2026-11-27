/* Recompose the EXISTING homepage pricing front only. CMS plan values and flip backs stay intact. */
(function(){
 const section=document.querySelector('body.home #pricing-plans');if(!section)return;
 section.querySelectorAll('.s3-pricing__card-wrap').forEach(wrap=>{
   const front=wrap.querySelector('.s3-pricing__card');if(!front||front.querySelector('.us3-face'))return;
   const name=front.querySelector('.s3-pricing__name'),desc=front.querySelector('.s3-pricing__desc'),price=front.querySelector('.s3-pricing__price-wrap'),tools=front.querySelector('.s3-pricing__tools'),benefits=front.querySelector('.s3-pricing__benefits'),view=front.querySelector('.s3-pricing__view'),cta=front.querySelector('.s3-pricing__btn'),badge=front.querySelector('.s3-pricing__badge');
   if(!name||!price||!benefits||!view||!cta)return;
   const face=document.createElement('div');face.className='us3-face';
   const top=document.createElement('div');top.className='us3-face-top';
   const issuer=document.createElement('span');issuer.className='us3-issuer';issuer.innerHTML='<span class="us3-issuer-mark" aria-hidden="true">✦</span>SEO Tools Group Buy';
   top.append(issuer,name);face.append(top);
   const chip=document.createElement('span');chip.className='us3-face-chip';chip.setAttribute('aria-hidden','true');face.append(chip);
   const bottom=document.createElement('div');bottom.className='us3-face-bottom';
   if(desc)bottom.append(desc);bottom.append(price);if(tools)bottom.append(tools);face.append(bottom);
   const body=document.createElement('div');body.className='us3-body';
   const bodyChip=document.createElement('span');bodyChip.className='us3-body-chip';bodyChip.textContent=(tools?.textContent||'Premium Tools').trim();body.append(bodyChip,benefits,view,cta);
   if(badge)wrap.append(badge);front.replaceChildren(face,body);
   view.setAttribute('aria-label','View included tools for '+name.textContent.trim());
   view.setAttribute('aria-expanded',String(wrap.classList.contains('is-flipped')));
   const back=wrap.querySelector('.s3-pricing__card-back');
   if(back){const hint=back.querySelector('.s3-pricing__card-back-hint');if(hint){hint.tabIndex=0;hint.setAttribute('role','button');hint.setAttribute('aria-label','Return to plan');hint.addEventListener('click',()=>{wrap.classList.remove('is-flipped');view.setAttribute('aria-expanded','false')});hint.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();hint.click()}})}}
   view.addEventListener('click',()=>{requestAnimationFrame(()=>view.setAttribute('aria-expanded',String(wrap.classList.contains('is-flipped'))))});
   wrap.addEventListener('mouseleave',()=>{view.setAttribute('aria-expanded','false')});
 });
})();