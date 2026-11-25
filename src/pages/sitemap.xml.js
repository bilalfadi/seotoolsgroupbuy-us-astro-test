import {all,load} from '../lib/content.js';

/** Published public pages only. Host follows existing production canonical rules. */
const BASE='https://seotoolsgroupbuy.us';
const BLOCKED=new Set(['cart','checkout','my-account','access-tools']);
const escapeXml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
function isoDate(input){
  if(!input)return '';
  const normalized=String(input).trim().replace(' ','T');
  const d=new Date(normalized);
  if(Number.isNaN(d.getTime()))return '';
  return d.toISOString().slice(0,10);
}
export function GET(){
  const unique=new Map();
  unique.set('/',{url:'/',modified:''});
  unique.set('/category/seo-tools-blog/',{url:'/category/seo-tools-blog/',modified:''});
  const postPageCount=Math.ceil(load('posts').length/10);
  for(let page=2;page<=postPageCount;page++){
    const route=`/category/seo-tools-blog/page/${page}/`;
    unique.set(route,{url:route,modified:''});
  }
  for(const item of all()){
    if(!item.slug||BLOCKED.has(item.slug)||item.slug==='home')continue;
    const route='/'+encodeURIComponent(item.slug)+'/';
    if(unique.has(route))continue;
    unique.set(route,{url:route,modified:isoDate(item.modified||item.date)});
  }
  const entries=[...unique.values()].sort((a,b)=>a.url.localeCompare(b.url));
  const xml='<?xml version="1.0" encoding="UTF-8"?>\n'
    +'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    +entries.map(item=>'  <url><loc>'+escapeXml(BASE+item.url)+'</loc>'+(item.modified?'<lastmod>'+item.modified+'</lastmod>':'')+'</url>').join('\n')
    +'\n</urlset>\n';
  return new Response(xml,{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
