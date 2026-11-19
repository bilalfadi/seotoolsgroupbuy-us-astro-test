/** Source: actual live site hrefs. Usage: node scripts/sync-live-links.mjs [--apply] */
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(), apply=process.argv.includes('--apply'), base='https://seotoolsgroupbuy.us';
const dir=path.join(root,'content','products');
const files=(await readdir(dir)).filter(x=>x.endsWith('.json')).sort();
const strip=s=>s.replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp|#\d+);/g,' ').replace(/\s+/g,' ').trim();
const attr=(a,n)=>{const m=a.match(new RegExp('(?:^|\\s)'+n+'\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27|([^\\s>]+))','i'));return m?.[1]??m?.[2]??m?.[3]??''};
const parse=(html)=>{const out=[];for(const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){const href=attr(m[1],'href').replace(/&amp;/g,'&');if(!href)continue;try{const u=new URL(href,base);out.push({label:strip(m[2]),href:u.href,host:u.hostname})}catch{}}return out};
const normalize=u=>{try{return new URL(u,base).href}catch{return String(u||'')}};
const audit=[];let cursor=0;
async function worker(){while(cursor<files.length){const idx=cursor++,filename=files[idx],p=path.join(dir,filename),item=JSON.parse(await readFile(p,'utf8'));const slug=String(item.slug||filename.slice(0,-5));
const rec={slug,status:'unverified',livePage:base+'/'+encodeURIComponent(slug)+'/',previous:item.externalUrl||'',verified:'',candidates:[],error:''};
try{
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),16000);let response;try{response=await fetch(rec.livePage,{signal:ac.signal,headers:{'User-Agent':'Mozilla/5.0 (compatible; WebsiteMigrationLinkAudit/1.0)','Accept':'text/html','Cache-Control':'no-cache'}})}finally{clearTimeout(timer)}
 if(!response.ok){rec.status='http-error';rec.error=String(response.status)}else{
 const html=await response.text();
 const buys=parse(html).filter(x=>x.host==='members.seotoolsgroupbuy.us'&&/\b(buy\s*now|buy\s*today|purchase\s*now|subscribe\s*now|get\s*instant\s*access)\b/i.test(x.label));
 const unique=[...new Set(buys.map(x=>x.href))];rec.candidates=unique;
 if(unique.length===1){rec.verified=unique[0];rec.status=normalize(item.externalUrl)===rec.verified?'matched':'mismatch';if(apply&&rec.status==='mismatch'){item.externalUrl=rec.verified;await writeFile(p,JSON.stringify(item,null,2)+'\n');rec.status='updated'}}
 else rec.status=unique.length>1?'ambiguous-multiple-ctas':'no-visible-verified-cta';
 }}catch(e){rec.status='fetch-error';rec.error=String(e.message||e)}audit[idx]=rec;if(idx%20===0)console.log('checked',idx+1,'/',files.length,slug,rec.status);
}}
await Promise.all(Array.from({length:3},()=>worker()));
const out=path.join(root,'reports');await mkdir(out,{recursive:true});
await writeFile(path.join(out,'live-link-audit.json'),JSON.stringify({source:base,checkedAt:new Date().toISOString(),apply,total:audit.length,results:audit},null,2)+'\n');
const esc=s=>'"'+String(s??'').replace(/"/g,'""')+'"';
const rows=[['slug','status','livePage','previous','verified','candidates','error'],...audit.map(x=>[x.slug,x.status,x.livePage,x.previous,x.verified,x.candidates.join(' | '),x.error])];
await writeFile(path.join(out,'live-link-audit.csv'),rows.map(r=>r.map(esc).join(',')).join('\n')+'\n');
const statuses=Object.fromEntries([...new Set(audit.map(x=>x.status))].map(k=>[k,audit.filter(x=>x.status===k).length]));
console.log(JSON.stringify({source:base,apply,products:files.length,statuses,report:'reports/live-link-audit.csv'},null,2));
if(audit.every(x=>x.status==='fetch-error'))process.exitCode=2;
