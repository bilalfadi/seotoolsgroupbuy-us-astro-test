import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const dist=path.join(root,'dist');
const baseline=JSON.parse(fs.readFileSync('migration/seo-xml-baseline.json','utf8')).records;
const groups={product:'products',post:'posts',page:'pages'};
const skipIndex=new Set(['cart','checkout','my-account','access-tools']);
const sourceURL='https://seotoolsgroupbuy.us';
const report={source:'WordPress XML 2026-11-22',mode:'offline built-output SEO parity',
 checked:0,byGroup:{},fieldMismatches:{},examples:{},issues:[],intentionalDifferences:[],
 counted:{xmlRecords:baseline.length,generatedHTML:0,xmlNoindexEntries:0,xmlNoindexPublicOverrides:0,
   builtCanonicalIssues:0,missingH1:0,multipleH1:0,missingMetaDescription:0,
   incorrectRobots:0,missingInSitemap:0,brokenSchemaJSON:0,duplicateSlug:0}};
function issue(kind,slug,details){report.issues.push({kind,slug,details});}
function mismatch(key,slug,expected,actual){
 report.fieldMismatches[key]=(report.fieldMismatches[key]||0)+1;
 (report.examples[key]??=[]);
 if(report.examples[key].length<12)report.examples[key].push({slug,expected:String(expected??'').slice(0,160),actual:String(actual??'').slice(0,160)});
}
function decode(s){return String(s||'').replace(/&#(\d+);/g,(_,v)=>String.fromCodePoint(Number(v)))
 .replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');}
function attr(html,selector,attrName='content'){
 const escaped=selector.replace(/[.*+?^$\{\}()|[\]\\]/g,'\\$&');
 const re=new RegExp('<(?:meta|link)\\s+[^>]*'+escaped+'[^>]*>','i');
 const tag=html.match(re)?.[0]||'';
 return decode(tag.match(new RegExp('\\b'+attrName+'="([^"]*)"','i'))?.[1]||'');
}
function title(html){return decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'');}
const seen=new Map();
const sitemap=fs.readFileSync(path.join(dist,'sitemap.xml'),'utf8');
const sitemapLocs=new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>decode(x[1])));
const redirects=fs.readFileSync(path.join(dist,'_redirects'),'utf8').split(/\r?\n/).filter(x=>/^\/.*\s301$/.test(x));
for(const x of baseline){
 const group=groups[x.type];if(!group){issue('unknownType',x.slug,x.type);continue}
 report.byGroup[group]=(report.byGroup[group]||0)+1;
 const file=path.join(root,'content',group,x.slug+'.json');
 if(!fs.existsSync(file)){issue('missingJSON',x.slug,file);continue}
 const r=JSON.parse(fs.readFileSync(file,'utf8'));
 const slug=x.slug;const self=x.slug==='home'?'/':'/'+slug+'/';
 if(seen.has(slug))report.counted.duplicateSlug++;
 seen.set(slug,true);
 report.checked++;
 for(const field of ['title','seoTitle','seoDescription','focusKeyword','status']){
   if(x[field]!==undefined&&String(x[field])!==String(r[field]??''))mismatch('xmlToJSON.'+field,slug,x[field],r[field]);
 }
 const htmlFile=path.join(dist,self.replace(/^\//,'') ,'index.html');
 if(!fs.existsSync(htmlFile)){issue('missingBuiltPage',slug,self);continue}
 const html=fs.readFileSync(htmlFile,'utf8');
 report.counted.generatedHTML++;
 const expTitle=r.seoTitle||r.title;
 if(title(html)!==expTitle)mismatch('html.title',slug,expTitle,title(html));
 const meta=attr(html,'name="description"');
 const expectedDesc=r.seoDescription||String(r.excerpt||'').replace(/<[^>]+>/g,' ').slice(0,160);
 if(meta!==expectedDesc)mismatch('html.description',slug,expectedDesc,meta);
 if(!meta)report.counted.missingMetaDescription++;
 const ogTitle=attr(html,'property="og:title"');
 const ogDesc=attr(html,'property="og:description"');
 const twTitle=attr(html,'name="twitter:title"');
 const twDesc=attr(html,'name="twitter:description"');
 for(const [key,expected,actual] of [
   ['social.ogTitle',x.ogTitle,ogTitle],['social.ogDescription',x.ogDescription,ogDesc],
   ['social.twitterTitle',x.twitterTitle,twTitle],['social.twitterDescription',x.twitterDescription,twDesc]
 ]) if(expected!==undefined&&expected!==actual)mismatch(key,slug,expected,actual);
 const canonical=attr(html,'rel="canonical"','href');
 const expectedCanonical=x.canonical||sourceURL+self;
 if(canonical!==expectedCanonical){report.counted.builtCanonicalIssues++;mismatch('html.canonical',slug,expectedCanonical,canonical)}
 const robots=attr(html,'name="robots"');
 const expectedRobots=skipIndex.has(slug)?'noindex,follow':'index,follow';
 if(robots!==expectedRobots){report.counted.incorrectRobots++;mismatch('html.robotsPolicy',slug,expectedRobots,robots)}
 if(x.originalNoindex!==undefined){report.counted.xmlNoindexEntries++;
   if(x.originalNoindex==='1'&&!skipIndex.has(slug))report.counted.xmlNoindexPublicOverrides++;}
 if(!skipIndex.has(slug)&&!sitemapLocs.has(sourceURL+self)){report.counted.missingInSitemap++;issue('missingSitemapURL',slug,self)}
 if(skipIndex.has(slug)&&sitemapLocs.has(sourceURL+self))issue('privatePageInSitemap',slug,self);
 const h1Count=(html.match(/<h1\b/gi)||[]).length;
 if(h1Count===0){report.counted.missingH1++;issue('missingH1',slug,self)}
 if(h1Count>1){report.counted.multipleH1++;issue('multipleH1',slug,h1Count)}
 for(const m of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)){
  try{JSON.parse(m[1])}catch{report.counted.brokenSchemaJSON++;issue('invalidSchema',slug,'invalid JSON-LD')}
 }
}
const archive=path.join(dist,'category/seo-tools-blog/page/2/index.html');
if(fs.existsSync(archive)){
 const html=fs.readFileSync(archive,'utf8');
 const canonical=attr(html,'rel="canonical"','href');
 if(canonical!==sourceURL+'/category/seo-tools-blog/page/2/')
  issue('paginationCanonical', 'blog-page-2',{actual:canonical,expected:sourceURL+'/category/seo-tools-blog/page/2/'});
}
report.counted.redirectRules=redirects.length;
report.counted.sitemapURLs=sitemapLocs.size;
report.counted.totalMismatches=Object.values(report.fieldMismatches).reduce((a,b)=>a+b,0);
report.intentionalDifferences.push('Public pages are index,follow per user request, although XML stores noindex=1 on many records');
report.limitations=['Offline XML, JSON and generated HTML only. No live URL, mobile layout, crawler indexing or payment testing.',
 'Original Yoast runtime schema markup cannot be established from WordPress WXR alone.',
 'Attachment URLs in XML are not binary assets and are checked by separate media audit.'];
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/seo-xml-parity.json',JSON.stringify(report,null,2)+'\n');
console.log('SEO_PARITY_SUMMARY='+JSON.stringify({checked:report.checked,counts:report.counted,mismatches:report.fieldMismatches,issues:report.issues.slice(0,15)}));

console.log('SEO_PARITY_MISMATCH_EXAMPLES='+JSON.stringify(Object.fromEntries(Object.entries(report.examples).map(([k,v])=>[k,v.slice(0,5)]))));
