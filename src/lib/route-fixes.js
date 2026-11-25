/** Legacy permalink aliases grounded in the imported WordPress export and theme
 * inc/canonical-product-slugs.php. Never guess an unknown URL destination. */
import {load} from './content.js';
const contentEntries = [...load('products'),...load('posts'),...load('pages')];
const entries = new Set(contentEntries.map(x=>x.slug));
const explicit = {
  'faq':'frequently-asked-questions-faqs-for-an-seo-group-buy',
  'tools':'single-tools-list',
  'contact-us':'contact',
  'semrush':'semrush-group-buy',
  // Former canonical Screaming Frog URL now permanently redirects to the new slug.
  'screamingfrog-seo-spider-group-buy':'screaming-frog-group-buy',
  'screamingfrog':'screaming-frog-group-buy',
  'screaming-frog':'screaming-frog-group-buy',
  'screaming-frog-seo-spider':'screaming-frog-group-buy',
  'screamingfrog-seo-spider':'screaming-frog-group-buy',
  'seo-profiler':'seoprofiler',
  'claude-ai-group-buy-affordable-access-to-claudes-advanced-ai-technology':'claudeai',
  'capcut-pro-group-buy':'capcut',
  'copy-ai-group-buy-unlock-creative-copywriting-solutions-at-lower-prices':'copyai',
  'invideo-io-group-buy':'invideo-io',
  'rytr-me-group-buy-affordable-access-to-ai-powered-content-writing':'rytr-me',
  'writesonic-group-buy-get-professional-ai-copywriting':'writesonic',
};
for (const record of contentEntries) {
  // Only add a legacy alias if it was actually linked from imported content.
  for (const [,oldSlug] of String(record.content||'').matchAll(/href\s*=\s*[\"'](?:https?:\/\/(?:www\.|app\.)?seotoolsgroupbuy\.us)?\/([a-z0-9-]+-group-buy)\/?[\"']/gi)) {
    const shortSlug=oldSlug.slice(0,-'-group-buy'.length);
    if(entries.has(shortSlug)) explicit[oldSlug] ??= shortSlug;
  }
}
export const redirects = Object.fromEntries(Object.entries(explicit).filter(([from,to]) => from!==to && !entries.has(from) && entries.has(to)));
const htmlEntities={'nbsp':' ','amp':'&','lt':'<','gt':'>','quot':'"','apos':"'",'hellip':'…','ndash':'–','mdash':'—','rsquo':'’','lsquo':'‘','ldquo':'“','rdquo':'”','bull':'•'};
export function decodeText(s='') {
 return String(s).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(m,code)=>{
   if(code[0]==='#') {const n=code[1]?.toLowerCase()==='x'?parseInt(code.slice(2),16):parseInt(code.slice(1),10);return Number.isInteger(n)&&n>0&&n<=0x10ffff?String.fromCodePoint(n):m;}
   return htmlEntities[code.toLowerCase()]??m;
 });
}
function resolvePath(path) {
 // Normalize old product-tag links which otherwise trigger an avoidable 301.
 const tag= /^\/product-tag\/(buy-cheap-ahrefs|moz-pro-group-buy)\/?(\?[^#]*)?(#.*)?$/i.exec(path);
 if(tag)return (tag[1].toLowerCase()==='buy-cheap-ahrefs'?'/ahrefs/':'/moz/')+(tag[2]||'')+(tag[3]||'');
 let m=/^\/([^/?#]+)\/?(\?[^#]*)?(#.*)?$/.exec(path);
 if (!m) return path;
 const resolved=redirects[decodeURIComponent(m[1])];
 if(resolved)return '/'+resolved+'/'+(m[2]||'')+(m[3]||'');
 // Internal published permalinks should use final slash URLs, not trigger Astro 307s.
 const slug=decodeURIComponent(m[1]);
 if(entries.has(slug) && !path.startsWith('/'+m[1]+'/'))return '/'+m[1]+'/'+(m[2]||'')+(m[3]||'');
 return path;
}
// Pure URL helpers: this module is also imported by Node.js redirect generation.
// Pages pass their CMS paymentBaseUrl explicitly, so no Vite-only import.meta.glob is used.
export function paymentLink(_raw, paymentBaseUrl='https://pay.seotoolsgroupbuy.us') {
 return String(paymentBaseUrl||'https://pay.seotoolsgroupbuy.us').replace(/\/$/,'');
}
export function purchaseLink(raw,paymentBaseUrl) { return paymentLink(raw,paymentBaseUrl); }
export function fixInternalLinks(html='',paymentBaseUrl) {
 // Only href attributes. Do not rewrite purchased external URLs or media src URLs.
 return String(html).replace(/(href\s*=\s*["'])([^"']+)(["'])/gi,(full,start,raw,end)=>{
   // Contact Us navigation stays on the main website; only purchase CTAs use signup fallback.
   const isContact=/^https?:\/\/(?:www\.|app\.)?seotoolsgroupbuy\.us\/contact\/?(?:[?#].*)?$/i.test(raw);
   const memberAction=/^https?:\/\/(?:www\.)?(?:seogroupsbuy\.com|pay\.seotoolsgroupbuy\.us)\/users\/(?:login|signup|cart\/)/i.test(raw);
   const paid=memberAction&&!isContact?paymentLink(raw,paymentBaseUrl):raw;
   if(paid!==raw)return start+paid+end;
   let val=raw.replace(/^https?:\\/\\/(?:www\\.|app\\.)?seotoolsgroupbuy\\.us(?=\\/|$)/i,'');
   if(val==='')val='/';
   if (!val.startsWith('/')) return full;
   if(val==='/blog/'||val==='/blog')val='/category/seo-tools-blog/';
   return start+resolvePath(val)+end;
 });
}
