/** Homepage-only approved Section 9 styling adapter. Source content stays in Pages CMS. */
export function upgradeHomeSupport(markup) {
  const sectionRe=/<section class="s6-support">[\s\S]*?<\/section>/;
  const match=markup.match(sectionRe);
  if(!match || match[0].includes('s6-support__card-shell')) return markup;
  const source=match[0];
  const head=source.match(/<h2 class="s6-support__title">([\s\S]*?)<\/h2>/)?.[1];
  const sub=source.match(/<p class="s6-support__sub">([\s\S]*?)<\/p>/)?.[1];
  const linksBlock=source.match(/<div class="s6-support__links">([\s\S]*?)<\/div>/)?.[1];
  const foot=source.match(/<div class="s6-support__foot">([\s\S]*?)<\/div>/)?.[1];
  const links=[...(linksBlock||'').matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  const cards=[...source.matchAll(/<a class="s6-support__card"([^>]*)>\s*<h3 class="s6-support__card-title">([\s\S]*?)<\/h3>\s*<div class="s6-support__card-desc">([\s\S]*?)<\/div>\s*<\/a>/g)];
  if(!head||!sub||!foot||links.length!==4||cards.length!==6)return markup;
  const primary='<a class="s6-support__primary"'+links[0][1]+'>'+links[0][2]+'</a>';
  const secondary=links.slice(1).map(m=>'<a'+m[1]+'>'+m[2]+'</a>').join('');
  const rows=cards.map(m=>{
    const attrs=m[1];const href=attrs.match(/\bhref="([^"]*)"/)?.[1]||'';
    const target=/target="_blank"/.test(attrs)?' target="_blank" rel="noopener noreferrer"':'';
    const label=m[2]; const desc=m[3];
    return '<details class="s6-support__card"><summary><span class="s6-support__tick" aria-hidden="true">✓</span><span>'+label+'</span></summary><div class="s6-support__desc">'+desc+' <a href="'+href+'"'+target+'>Open support →</a></div></details>';
  }).join('');
  const rays='<svg class="s6-support__rays" viewBox="-500 -500 1000 1000" fill="currentColor" aria-hidden="true"><polygon points="-3.5,-89.9 -47.9,-497.7 47.9,-497.7 3.5,-89.9"/><polygon points="42.0,-79.6 207.3,-455.0 290.4,-407.1 48.0,-76.2"/><polygon points="76.2,-48.0 407.1,-290.4 455.0,-207.3 79.6,-42.0"/><polygon points="89.9,-3.5 497.7,-47.9 497.7,47.9 89.9,3.5"/><polygon points="79.6,42.0 455.0,207.3 407.1,290.4 76.2,48.0"/><polygon points="48.0,76.2 290.4,407.1 207.3,455.0 42.0,79.6"/><polygon points="3.5,89.9 47.9,497.7 -47.9,497.7 -3.5,89.9"/><polygon points="-42.0,79.6 -207.3,455.0 -290.4,407.1 -48.0,76.2"/><polygon points="-76.2,48.0 -407.1,290.4 -455.0,207.3 -79.6,-42.0"/><polygon points="-89.9,3.5 -497.7,47.9 -497.7,-47.9 -89.9,-3.5"/><polygon points="-79.6,-42.0 -455.0,-207.3 -407.1,-290.4 -76.2,-48.0"/><polygon points="-48.0,-76.2 -290.4,-407.1 -207.3,-455.0 -42.0,-79.6"/></svg>';
  const adapted='<section class="s6-support"><div class="s6-container"><div class="s6-support__head"><h2 class="s6-support__title">'+head+'</h2><p class="s6-support__sub">'+sub+'</p><div class="s6-support__links">'+primary+'<div class="s6-support__more-links">'+secondary+'</div></div></div>'+rays+'<div class="s6-support__card-shell"><div class="s6-support__card-head"><strong>Support options</strong><span class="s6-support__deal">Here to help</span></div><div class="s6-support__grid">'+rows+'</div><div class="s6-support__foot">'+foot+'</div></div></div></section>';
  return markup.replace(sectionRe, adapted);
}
