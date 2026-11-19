import fs from 'node:fs';
import path from 'node:path';
import { URL } from 'node:url';
import dns from 'node:dns/promises';
const root=process.cwd();
const mediaRoot=path.resolve(root,'public','media','wp-uploads');
const pattern=/https?:\/\/(?:app\.)?seotoolsgroupbuy\.us\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;
const sources=['products','posts','pages'];
const files=sources.flatMap(x=>fs.readdirSync('content/'+x).filter(f=>f.endsWith('.json')).map(f=>'content/'+x+'/'+f));
const refs=new Set();
for(const file of files){let txt=fs.readFileSync(file,'utf8');for(const x of txt.matchAll(pattern))refs.add(x[0].replace(/&amp;/g,'&'));}
const manifest=JSON.parse(fs.readFileSync('migration/attachment-manifest.json','utf8'));
for(const {url} of Object.values(manifest.attachments))if(url)refs.add(url);
function loc(source){const u=new URL(source);if(!['seotoolsgroupbuy.us','app.seotoolsgroupbuy.us'].includes(u.hostname))throw Error('Not source domain');let suffix=decodeURIComponent(u.pathname.slice('/wp-content/uploads/'.length));const parts=suffix.split('/');if(!u.pathname.startsWith('/wp-content/uploads/')||parts.some(p=>!p||p==='..'||p==='.'||p.includes('\\')))throw Error('Invalid path');const file=path.resolve(mediaRoot,...parts);if(!file.startsWith(mediaRoot+path.sep))throw Error('Invalid output');return {file,url:'/media/wp-uploads/'+parts.map(encodeURIComponent).join('/')};}
function image(bytes,ext){if(bytes.length<12)return false;const h=bytes.subarray(0,16);return ext==='png'?h.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])):ext==='jpg'||ext==='jpeg'?h[0]===255&&h[1]===216&&h[2]===255:ext==='webp'?h.toString('ascii',0,4)==='RIFF'&&h.toString('ascii',8,12)==='WEBP':ext==='gif'?h.toString('ascii',0,3)==='GIF':ext==='svg'?bytes.toString('utf8',0,4096).includes('<svg'):ext==='avif'?h.toString('ascii').includes('ftyp'):false;}
const replacement=new Map(),failures=[];const remote=[...refs].filter(x=>/\.(png|jpe?g|webp|svg|gif|avif)(?:[?#]|$)/i.test(x));
console.log('Remote image URLs:',remote.length);
try { await dns.lookup('seotoolsgroupbuy.us'); } catch (e) {
  console.error('Network/DNS unavailable. Run this migration on a computer with working internet access. No content files were changed.');
  process.exit(2);
}
let done=0,downloaded=0;let idx=0;
await Promise.all(Array.from({length:5},async()=>{while(idx<remote.length){const src=remote[idx++];try{const {file,url}=loc(src);const ext=path.extname(file).slice(1).toLowerCase();let bytes=fs.existsSync(file)?fs.readFileSync(file):null;if(!bytes||!image(bytes,ext)){const res=await fetch(src,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'Mozilla/5.0'}});if(!res.ok)throw Error('HTTP '+res.status);if(Number(res.headers.get('content-length')||0)>30000000)throw Error('File too large');bytes=Buffer.from(await res.arrayBuffer());if(bytes.length>30000000||!image(bytes,ext))throw Error('Invalid image');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);downloaded++;}replacement.set(src,url);}catch(e){failures.push({url:src,error:String(e.message||e)});}if(++done%50===0)console.log(done+'/'+remote.length,'failed',failures.length);}}));
let changed=0;
for(const file of files){const orig=fs.readFileSync(file,'utf8');let obj=JSON.parse(orig);function walk(x){if(typeof x==='string')return x.replace(pattern,m=>replacement.get(m.replace(/&amp;/g,'&'))||m);if(Array.isArray(x))return x.map(walk);if(x&&typeof x==='object')return Object.fromEntries(Object.entries(x).map(([k,v])=>[k,walk(v)]));return x;}obj=walk(obj);const newText=JSON.stringify(obj,null,2)+'\n';if(newText!==orig){fs.writeFileSync(file,newText);changed++;}}
const report={urls:remote.length,downloaded,available:replacement.size,failed:failures.length,updatedFiles:changed,failures};fs.writeFileSync('migration/media-report.json',JSON.stringify(report,null,2)+'\n');console.log('RESULT',JSON.stringify({urls:remote.length,downloaded,available:replacement.size,failed:failures.length,updatedFiles:changed}));
