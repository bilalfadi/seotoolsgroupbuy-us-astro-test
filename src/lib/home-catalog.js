
/** Homepage Section 2 — preserve CMS-supplied tool names, URLs and section copy. */
const labels={
  semrush:"SEO",ahrefs:"SEO",moz:"SEO",envato:"Design",canva:"Design",grammarly:"Writing",leonardo:"AI",wordai:"Writing",helium:"Amazon",spyfu:"SEO",chatgpt:"AI",ubersuggest:"SEO",surfer:"SEO",frase:"Writing",writesonic:"Writing",mangools:"SEO",serpstat:"SEO",majestic:"SEO",quillbot:"Writing",freepik:"Design",storyblocks:"Video",vyond:"Video",netflix:"Entertainment",skillshare:"Learning",coursera:"Learning",jungle:"Amazon",midjourney:"AI",gamma:"AI",elevenlabs:"AI",buzzsumo:"SEO",vidiq:"Video",copyai:"AI",kwfinder:"SEO",quetext:"Writing",wordhero:"Writing",udemy:"Learning"
};
const existingProductImages={
  "semrush-group-buy": "/media/wp-uploads/2026/08/semrush-247x296-4.jpg",
  "ahrefs": "/media/wp-uploads/2026/08/Screenshot-2026-10-01-010329.png",
  "moz": "/media/wp-uploads/2026/08/moz-247x296-3.jpg",
  "envato-elements": "/media/wp-uploads/2026/08/Envato-Elements-Group-Buy-247x296-3.jpg",
  "canva": "/media/wp-uploads/2026/08/Canva-247x296-4.jpg",
  "grammarly": "/media/wp-uploads/2026/08/grammarly-group-buy-premium-writing-tool-logo-1.png",
  "leonardo-ai": "/media/wp-uploads/2026/08/SEOPTIMER-36-5.jpg",
  "wordai": "/media/wp-uploads/2026/08/Wordai-6.jpg",
  "helium-10": "/media/wp-uploads/2026/08/Helium-10-Group-Buy-247x296-3.jpg",
  "spyfu": "/media/wp-uploads/2026/08/Spyfu-6.jpg",
  "chatgpt": "/media/wp-uploads/2026/08/ChatGpt-247x296-4.jpg",
  "ubersuggest": "/media/wp-uploads/2026/08/Ubersuggest-Group-Buy-tools-247x296-3.jpg",
  "surfer-seo": "/media/wp-uploads/2026/08/Surfer-SEO-6.jpg",
  "frase": "/media/wp-uploads/2026/08/Frase_Logo-scaled-1-247x296-3.jpg",
  "writesonic": "/media/wp-uploads/2026/08/writesonic-group-buy-get-professional-ai-logo-1.png",
  "mangools": "/media/wp-uploads/2026/08/SEOPTIMER-12-10.jpg",
  "serpstat": "/media/wp-uploads/2026/08/Heading-1-6.jpg",
  "majestic": "/media/wp-uploads/2026/08/majestic-6.jpg",
  "quillbot": "/media/wp-uploads/2026/08/quillbot-group-buy-logo-1.png",
  "freepik": "/media/wp-uploads/2026/08/Freepik-Groupbuyseo-6.jpg",
  "storyblocks": "/media/wp-uploads/2026/08/StoryBlocks-247x296-3.jpg",
  "vyond": "/media/wp-uploads/2026/08/Vyond-6.jpg",
  "netflix": "/media/wp-uploads/2026/08/Netflix-Group-Buy-6.jpg",
  "skillshare": "/media/wp-uploads/2026/08/Skillshare-Group-Buy-6.jpg",
  "coursera": "/media/wp-uploads/2026/08/Exploding-Topics-Group-Buy-6-6.jpg",
  "jungle-scout": "/media/wp-uploads/2026/08/Jungle-Scout-247x296-3.jpg",
  "midjourney-group-buy": "/media/wp-uploads/2026/08/WhatsApp-Image-2025-09-25-at-4.47.00-PM-3.jpg",
  "gamma-ai-group-buy": "/media/wp-uploads/2026/08/WhatsApp-Image-2025-09-25-at-4.42.33-PM-3.jpg",
  "elevenlabs-group-buy": "/media/wp-uploads/2026/09/elevenlabsss-1024x543-1.jpg",
  "buzzsumo": "/media/wp-uploads/2026/08/BuzzSumo-6.jpg",
  "vidiq-group-buy": "/media/wp-uploads/2026/08/Placeit-1-5.jpg",
  "copyai": "/media/wp-uploads/2026/08/copy-ai-group-buy-unlock-creative-copywr-logo-1.png",
  "kwfinder": "/media/wp-uploads/2026/08/KwFinder-6.jpg",
  "quetext": "/media/wp-uploads/2026/08/Heading-5-1-6.jpg",
  "wordhero": "/media/wp-uploads/2026/08/wordhero-group-buy-affordable-ai-writing-logo-1.png",
  "udemy": "/media/wp-uploads/2026/08/Exploding-Topics-Group-Buy-4-6.jpg"
};

function norm(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function classify(name,href){
 const id=norm(name+" "+href);
 for(const [needle,type] of Object.entries(labels)){if(id.includes(needle))return type}
 return "Other";
}
function logo(name,href){
 const slug=String(href||"").split("?")[0].replace(/^\/+|\/+$/g,"").toLowerCase();
 return existingProductImages[slug]||null;
}

const encode=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
function priceFor(href,products){
 const sourceSlug=String(href||'').split('?')[0].replace(/^\/+|\/+$/g,'').toLowerCase();
 const aliases={'midjourney-group-buy':'midjourney','gamma-ai-group-buy':'gamma-ai','elevenlabs-group-buy':'elevenlabs','vidiq-group-buy':'vidiq'};
 const slug=aliases[sourceSlug]||sourceSlug;
 const product=products.find(p=>String(p.slug).toLowerCase()===slug);
 if(!product)return null;
 const offer=String(product.salePrice||product.price||'').trim();
 const normal=String(product.regularPrice||'').trim();
 const valid=v=>/^\d+(?:\.\d{1,2})?$/.test(v)&&Number(v)>0;
 if(!valid(offer))return null;
 const price='USD '+Number(offer).toFixed(2).replace(/\.00$/,'');
 const regular=valid(normal)&&Number(normal)>Number(offer)?'USD '+Number(normal).toFixed(2).replace(/\.00$/,''):null;
 return {price,regular};
}
export function upgradeCatalog(sourceMarkup,products=[]){
 const start=sourceMarkup.indexOf('<section class="s2-tools" id="tools">');
 if(start<0)return sourceMarkup;
 const end=sourceMarkup.indexOf('</section>',start);
 if(end<0)return sourceMarkup;
 const raw=sourceMarkup.slice(start,end+10);
 const h=raw.match(/<h2 class="s2-tools__title">([\s\S]*?)<\/h2>/);
 const p=raw.match(/<p class="s2-tools__sub">([\s\S]*?)<\/p>/);
 const all=[...raw.matchAll(/<a href="([^"]+)" class="s2-tools__card">([\s\S]*?)<\/a>/g)];
 const cards=all.map((m,i)=>{
    const n=m[2].match(/<span class="s2-tools__name">([\s\S]*?)<\/span>/);
    if(!n)return "";
    const name=n[1].replace(/<[^>]*>/g,"").trim(),href=m[1],cat=classify(name,href),img=logo(name,href);
    const visual=img?'<img src="'+encode(img)+'" alt="" loading="lazy">':'<span class="us-s2-wordmark" aria-hidden="true">'+encode(name.split(" ")[0].slice(0,3))+'</span>';
    return '<a class="us-s2-card" data-name="'+encode(name.toLowerCase())+'" data-cat="'+encode(cat)+'" href="'+encode(href)+'"><div class="us-s2-identity"><span class="us-s2-logo">'+visual+'</span><span class="us-s2-info"><span class="us-s2-tool-name">'+encode(name)+'</span><span class="us-s2-tool-cat">'+encode(cat)+' Tools</span></span></div><div class="us-s2-price-row"><span class="us-s2-lock" aria-hidden="true">◈</span><strong>Premium Access</strong><small class="us-s2-price-side">MEMBER ACCESS</small></div><span class="us-s2-tool-cta">Explore Tool <span aria-hidden="true"> ↗</span></span></a>';
 });
 if(cards.filter(Boolean).length!==36)return sourceMarkup; // never silently lose product links
 const more=raw.match(/<a href="([^"]+)" class="s2-tools__card s2-tools__card--cta">([\s\S]*?)<\/a>/);
 const moreHref=more?.[1]||"/single-tools-list";
 const moreText=more?.[2].replace(/<[^>]*>/g," ").replace(/\s+/g," ").trim()||"90+ More Tools";
 const tabs=["All Tools","SEO","AI","Design","Writing","Amazon","Video","Learning","Entertainment"];
 const tabsHtml=tabs.map((s,i)=>'<button type="button" class="'+(i===0?'active':'')+'" data-filter="'+encode(s)+'" aria-selected="'+(i===0?'true':'false')+'">'+(i===0?'✦ ':'')+encode(s)+'</button>').join("");
 const html='<section class="us-s2-store" id="tools" aria-label="Tools catalogue"><div class="us-s2-card-shell"><form class="us-s2-search-form" role="search"><label class="us-s2-search"><svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></svg><input id="us-s2-search" type="search" placeholder="Search premium tools..." aria-label="Search premium tools" autocomplete="off"/><span class="us-s2-kbd" aria-hidden="true">⌕</span></label></form><div class="us-s2-tabs" role="tablist" aria-label="Tool categories">'+tabsHtml+'</div><div class="us-s2-count"><span id="us-s2-count">36 tools</span><a href="'+encode(moreHref)+'">'+encode(moreText)+'</a></div><div class="us-s2-results">'+cards.join("")+'</div><p class="us-s2-empty" hidden>No tools found.</p><div class="us-s2-bottom"><div class="us-s2-bottom-copy"><div class="us-s2-heading"><h2>'+ (h?.[1]||"") +'</h2><p>'+(p?.[1]||"")+'</p></div></div><div class="us-s2-more"><button class="us-s2-more-button" type="button">Load More (16 more tools)</button></div></div></div></section>';
 return sourceMarkup.slice(0,start)+html+sourceMarkup.slice(end+10);
}
