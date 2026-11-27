/** Decode WordPress HTML entities for plain-text excerpts only.
 * Never rewrite CMS JSON, article HTML, URLs or SEO metadata.
 * Astro escapes the resulting string when inserted with {text}.
 */
export function plainExcerpt(value='') {
  const named={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',hellip:'…',ndash:'–',mdash:'—',rsquo:'’',lsquo:'‘',rdquo:'”',ldquo:'“',bull:'•',copy:'©',reg:'®',trade:'™'};
  return String(value??'')
    .replace(/<[^>]*>/g,' ')
    .replace(/&#(?:x([0-9a-f]+)|([0-9]+));/gi,(_,hex,decimal)=>{
      const code=Number.parseInt(hex||decimal,hex?16:10);
      return code>0&&code<=0x10ffff&&!(code>=0xd800&&code<=0xdfff)?String.fromCodePoint(code):' ';
    })
    .replace(/&([a-z][a-z0-9]+);/gi,(_,name)=>named[name.toLowerCase()]??' ')
    .replace(/[\u00a0\u200b]/g,' ')
    .replace(/\s+/g,' ')
    .trim();
}
