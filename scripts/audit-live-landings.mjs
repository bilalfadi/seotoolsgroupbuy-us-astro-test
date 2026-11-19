import {writeFile,mkdir} from 'node:fs/promises';
const root='https://seotoolsgroupbuy.us';
const routes=['/ahrefs/','/semrush-group-buy/'];
const rows=[];
for(const route of routes){
 const r=await fetch(root+route,{headers:{'User-Agent':'Mozilla/5.0','Cache-Control':'no-cache'}});
 const html=await r.text();
 const links=[...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(m=>{
 const href=(m[1].match(/\bhref\s*=\s*["']([^"']+)["']/i)||[])[1]||'';
 return {href:href.replaceAll('&amp;','&'),text:m[2].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,90)}
 }).filter(x=>x.href&&(x.href.startsWith('https://seogroupsbuy.com/')||x.href.startsWith('https://members.seotoolsgroupbuy.us/')));
 rows.push({route,status:r.status,title:(html.match(/<title[^>]*>([^<]*)<\/title>/i)||[])[1],htmlBytes:html.length,links});
}
await mkdir('reports',{recursive:true});
await writeFile('reports/live-landings-links.json',JSON.stringify({checked:new Date().toISOString(),rows},null,2));
console.log(JSON.stringify(rows.map(x=>({route:x.route,status:x.status,links:x.links})),null,2));
