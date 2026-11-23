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
  'screamingfrog':'screamingfrog-seo-spider-group-buy',
  'screaming-frog':'screamingfrog-seo-spider-group-buy',
  'screaming-frog-seo-spider':'screamingfrog-seo-spider-group-buy',
  'screamingfrog-seo-spider':'screamingfrog-seo-spider-group-buy',
  'screaming-frog-group-buy':'screamingfrog-seo-spider-group-buy',
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
 let m=/^\/([^/?#]+)\/?(\?[^#]*)?(#.*)?$/.exec(path);
 if (!m) return path;
 const resolved=redirects[decodeURIComponent(m[1])];
 return resolved?'/'+resolved+'/'+(m[2]||'')+(m[3]||''):path;
}
// Preserve existing member cart IDs, redirect account paths to this site's payment host.
import paymentSettings from '../../content/site.json';
export function paymentLink(raw, fallback='signup') {
 const base=String(paymentSettings.paymentBaseUrl||'https://pay.seotoolsgroupbuy.us').replace(/\/$/,'');
 const value=String(raw||'').trim();
 if(!value)return base+'/users/'+fallback;
 if(/^https?:\/\/(?:www\.)?seogroupsbuy\.com\/users\/(?:login|signup|cart\/)/i.test(value))
   return value.replace(/^https?:\/\/(?:www\.)?seogroupsbuy\.com/i,base);
 if(/^https?:\/\/(?:www\.|app\.)?seotoolsgroupbuy\.us\/contact\/?(?:[?#].*)?$/i.test(value))
   return base+'/users/signup';
 if(/^https?:\/\/(?:www\.|app\.)?seotoolsgroupbuy\.us\/(?:users\/(?:login|signup|cart\/)|checkout\/|cart\/|my-account\/)/i.test(value))
   return value.replace(/^https?:\/\/(?:www\.|app\.)?seotoolsgroupbuy\.us/i,base);
 if(/^https?:\/\/members\.seotoolsgroupbuy\.us\/login\/?$/i.test(value))
   return base+'/users/login';
 return value;
}
export function fixInternalLinks(html='') {
 // Only href attributes. Do not rewrite purchased external URLs or media src URLs.
 return String(html).replace(/(href\s*=\s*["'])([^"']+)(["'])/gi,(full,start,raw,end)=>{
   const paid=paymentLink(raw,'signup');
   if(paid!==raw)return start+paid+end;
   let val=raw.replace(/^https?:\/\/(?:www\.|app\.)?seotoolsgroupbuy\.us(?=\/)/i,'');
   if (!val.startsWith('/')) return full;
   if(val==='/blog/'||val==='/blog')val='/category/seo-tools-blog/';
   return start+resolvePath(val)+end;
 });
}
