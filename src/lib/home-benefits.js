/** Section 4: same Toolsurf line icons, eyebrow and visual structure. Preserve CMS six headings/descriptions. */
const paths=[
 '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
 '<path d="M17.5 19H7a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 11a4 4 0 0 1-1.5 8z"/>',
 '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
 '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
 '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
 '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'
];
const svg=body=>'<svg viewBox="0 0 24 24" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">'+body+'</svg>';
export function upgradeBenefits(markup){
 const begin=markup.indexOf('<section class="stgb-features');
 if(begin<0)return markup;
 const end=markup.indexOf('</section>',begin);
 if(end<0)return markup;
 let part=markup.slice(begin,end+10);
 if(part.includes('stgb-features__eyebrow'))return markup;
 const head='<div class="stgb-features__head">';
 const eyebrow='<p class="stgb-features__eyebrow">'+svg(paths[3])+'SEO Tools Group Buy</p>';
 if(!part.includes(head))return markup;
 part=part.replace(head,head+eyebrow);
 let n=0;
 part=part.replace(/(<div class="stgb-features__icon-wrap">)<svg[\s\S]*?<\/svg>(<\/div>)/g,(_whole,open,close)=>{
   const icon=paths[n++];return icon?open+svg(icon)+close:_whole;
 });
 if(n!==6)return markup;
 return markup.slice(0,begin)+part+markup.slice(end+10);
}
