import fs from 'node:fs';
import path from 'node:path';
const cwd=process.cwd();
export function load(group){const dir=path.join(cwd,'content',group);return fs.readdirSync(dir).filter(x=>x.endsWith('.json')).map(x=>JSON.parse(fs.readFileSync(path.join(dir,x),'utf8'))).filter(entry=>entry.status==='publish')}
export function all(){return [...load('products').map(x=>({...x,type:'product'})),...load('posts').map(x=>({...x,type:'post'})),...load('pages').map(x=>({...x,type:'page'}))]}
export function home(){return load('pages').find(x=>x.slug==='home')}
export function url(slug){return '/'+encodeURIComponent(slug)+'/'}
