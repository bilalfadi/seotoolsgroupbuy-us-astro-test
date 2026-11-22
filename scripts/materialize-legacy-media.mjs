import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=process.cwd();
const publicRoot=path.join(root,'public');
const existingRoot=path.join(publicRoot,'media','wp-uploads');
const legacyRoot=path.join(publicRoot,'wp-content','uploads');
const groups=['products','posts','pages'];
const sourceFiles=groups.flatMap(g=>fs.readdirSync(path.join(root,'content',g))
  .filter(x=>x.endsWith('.json')).map(x=>path.join(root,'content',g,x)));
const imageExtensions=new Set(['.png','.jpg','.jpeg','.webp','.gif','.svg','.avif']);
function walk(dir){
  if(!fs.existsSync(dir))return [];
  return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];
  });
}
const images=walk(existingRoot).filter(f=>imageExtensions.has(path.extname(f).toLowerCase()));
const byName=new Map();
for(const file of images){
  const key=path.basename(file).toLowerCase();
  if(!byName.has(key))byName.set(key,[]);
  byName.get(key).push(file);
}
const refs=new Map();
const regex=/\/wp-content\/uploads\/[^\s"'<>()\\]+/gi;
for(const file of sourceFiles){
  const obj=JSON.parse(fs.readFileSync(file,'utf8'));
  for(const field of ['content','excerpt','shortDescription']){
    const html=String(obj[field]||'');
    for(const match of html.matchAll(regex)){
      const raw=match[0].replace(/&amp;/g,'&').split(/[?#]/)[0].replace(/[,;]+$/,'');
      const relative=raw.slice('/wp-content/uploads/'.length);
      if(!relative||relative.split('/').some(x=>!x||x==='.'||x==='..'||x.includes('\\')))continue;
      try{
        const clean=decodeURIComponent(relative);
        const suffix=path.extname(clean).toLowerCase();
        if(!imageExtensions.has(suffix))continue;
        if(!refs.has(clean))refs.set(clean,new Set());
        refs.get(clean).add(path.relative(root,file));
      }catch{}
    }
  }
}
const hashCache=new Map();
const hash=file=>{if(!hashCache.has(file))hashCache.set(file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'));return hashCache.get(file)};
const results={at:new Date().toISOString(),mode:'safe image compatibility aliases',referenced:refs.size,created:[],alreadyExists:[],unresolved:[],ambiguous:[]};
for(const [relative,sourcePaths] of refs){
  const destination=path.resolve(legacyRoot,relative);
  if(!destination.startsWith(legacyRoot+path.sep))continue;
  if(fs.existsSync(destination)){results.alreadyExists.push({path:relative});continue;}
  const basename=path.basename(relative).toLowerCase();
  // Prefer the same relative filename already downloaded in the media library.
  const exact=path.join(existingRoot,relative);
  let candidates=fs.existsSync(exact)?[exact]:(byName.get(basename)||[]);
  // Only use multiple candidate files when their hashes prove the bytes are identical.
  if(candidates.length>1){
    const hashes=new Set(candidates.map(hash));
    if(hashes.size===1)candidates=[candidates[0]];
  }
  if(candidates.length!==1){
    const entry={path:'/wp-content/uploads/'+relative,files:[...sourcePaths]};
    if(candidates.length)results.ambiguous.push({...entry,candidates:candidates.map(f=>path.relative(publicRoot,f))});
    else results.unresolved.push(entry);
    continue;
  }
  const source=candidates[0];
  const bytes=fs.readFileSync(source);
  if(bytes.length<12){results.unresolved.push({path:relative,reason:'invalid source asset'});continue;}
  fs.mkdirSync(path.dirname(destination),{recursive:true});
  fs.copyFileSync(source,destination);
  results.created.push({path:'/wp-content/uploads/'+relative,source:'/'+path.relative(publicRoot,source).split(path.sep).join('/'),bytes:bytes.length});
}
results.summary={referenced:results.referenced,created:results.created.length,existing:results.alreadyExists.length,ambiguous:results.ambiguous.length,unresolved:results.unresolved.length};
fs.mkdirSync(path.join(root,'reports'),{recursive:true});
fs.writeFileSync(path.join(root,'reports','legacy-media-compatibility.json'),JSON.stringify(results,null,2)+'\n');
console.log('LEGACY_MEDIA_SUMMARY='+JSON.stringify(results.summary));
console.log('LEGACY_MEDIA_UNRESOLVED_SAMPLE='+JSON.stringify(results.unresolved.slice(0,20)));
console.log('LEGACY_MEDIA_CREATED_SAMPLE='+JSON.stringify(results.created.slice(0,25)));
