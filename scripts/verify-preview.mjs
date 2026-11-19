const test='https://seotoolsgroupbuy-us-astro-test.bilalfadi11221333.workers.dev';
const original='https://seotoolsgroupbuy.us';
const urls=['/','/ahrefs/','/semrush-group-buy/','/category/seo-tools-blog/','/shop/','/pricing-plans/','/contact/'];
const assets=['/media/wp-uploads/2026/11/stgb-site-icon-512-4.png','/assets/css/product-detail.css','/assets/css/blog-archive.css','/assets/js/chatbox.js'];
const assetResults=[];
for(const p of assets){try{const r=await fetch(test+p);assetResults.push({path:p,status:r.status,type:r.headers.get('content-type')})}catch(e){assetResults.push({path:p,error:String(e)})}}
const checks=[];
for (const uri of urls){
 const item={path:uri,test:{},original:{}};
 for(const [name,base] of [['test',test],['original',original]]){
  try{
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),16000);
   let res;try{res=await fetch(base+uri,{signal:controller.signal,redirect:'follow',headers:{'User-Agent':'Mozilla/5.0'}})}finally{clearTimeout(timeout)}
   const html=await res.text();
   const at=(str)=>html.includes(str);
   const link=(rel)=>[...html.matchAll(/<link\b[^>]*>/gi)].map(x=>x[0]).find(x=>x.includes('rel="'+rel+'"')||x.includes("rel='"+rel+"'"))||'';
   item[name]={status:res.status,finalUrl:res.url,htmlBytes:html.length,title:(html.match(/<title[^>]*>([^<]*)<\/title>/i)||[])[1]||'',h1:(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)||[])[1]?.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,130)||'',rawShortcode:at('[stgb_home_blogs]'),favicon:link('icon').slice(0,240),robots:(html.match(/<meta[^>]*name=["']robots["'][^>]*>/i)||[])[0]||'',hasChat:at('id="stgb-chatbox"'),hasAhrefsOldDesign:at('ahrefs-hero__pricing-grid'),hasProductDetail:at('stgb-product-detail__hero'),hasBlogCards:at('stgb-blog-archive-card'),signup:at('https://seogroupsbuy.com/users/signup'),login:at('https://seogroupsbuy.com/users/login'),wa:at('https://wa.me/447845432224'),checkoutAhrefs:at('https://seogroupsbuy.com/users/cart/index/product/id/13/c/')};
  }catch(e){item[name]={error:String(e.message||e)}}
 }
 checks.push(item);
}
const {mkdir,writeFile}=await import('node:fs/promises');
await mkdir('reports',{recursive:true});await writeFile('reports/preview-smoke-check.json',JSON.stringify({at:new Date().toISOString(),test,original,assets:assetResults,checks},null,2));
console.log(JSON.stringify({assets:assetResults,checks},null,2));
