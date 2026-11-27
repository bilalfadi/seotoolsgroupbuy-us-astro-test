/**
 * Homepage Section 6 — Toolsurf Group Buy Guide layout.
 * Derive navigation and articles from the six existing CMS H2 content blocks.
 * Original headings, paragraphs, lists and inline links are not rewritten.
 */
const htmlEscape=value=>String(value).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
export function upgradeHomeGuide(markup){
 const start=markup.indexOf('<section class="s4-content">');
 if(start<0)return markup;
 const end=markup.indexOf('</section>',start);
 if(end<0)return markup;
 const original=markup.slice(start,end+10);
 const match=original.match(/^<section class="s4-content">\s*<div class="s4-container">\s*<div class="s4-content__inner">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>$/);
 if(!match)return markup;
 const blocks=match[1].split(/<hr class="s4-content__hr"\s*\/>/);
 if(blocks.length!==6)return markup;
 const headings=blocks.map(block=>block.match(/<h2 class="s4-content__h2">([\s\S]*?)<\/h2>/));
 if(headings.some(h=>!h))return markup;
 const linkItems=headings.map((h,i)=>'<li><a href="#us-guide-'+(i+1)+'"'+(i===0?' aria-current="true"':'')+'>'+h[1]+'</a></li>').join('');
 const railItems=headings.map((h,i)=>'<li><a href="#us-guide-'+(i+1)+'">'+h[1]+'</a></li>').join('');
 const content=blocks.map((block,i)=>{
   const article=block.replace(/<h2 class="s4-content__h2">/, '<h2 class="s4-content__h2 us6-heading" id="us6-heading-'+(i+1)+'">');
   return '<section class="us6-article" id="us-guide-'+(i+1)+'" aria-labelledby="us6-heading-'+(i+1)+'">'+article+'</section>';
 }).join('');
 const guide='<section class="us6-guide section-alt" id="us-group-guide" aria-label="Group buy SEO tools guide"><div class="us6-container us6-guide-shell"><nav class="us6-guide-nav" aria-label="Group buy guide"><p>Group buy guide</p><ol>'+linkItems+'</ol></nav><div class="us6-guide-main"><nav class="us6-guide-rail" aria-label="Guide quick links"><ol>'+railItems+'</ol></nav>'+content+'</div></div></section>';
 return markup.slice(0,start)+guide+markup.slice(end+10);
}
