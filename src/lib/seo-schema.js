import {parseYoastFaq} from './faq-parser.js';
import faqDefaults from './faq-defaults.json';

const BASE='https://seotoolsgroupbuy.us';
const absolute=p=>p?.startsWith('http')?p:BASE+(String(p||'').startsWith('/')?p:'/'+String(p||''));
const text=s=>String(s||'').replace(/<[^>]*>/g,' ').replace(/&amp;/gi,'&').replace(/&nbsp;/gi,' ').replace(/\s+/g,' ').trim();
const date=s=>{const d=new Date(String(s||'').replace(' ','T'));return Number.isNaN(d.getTime())?undefined:d.toISOString()};
const publisher={ '@type':'Organization',name:'SEO Tools Group Buy',url:BASE+'/' };

export function seoSchemaForEntry(entry,products=[]){
 const url=absolute('/'+encodeURIComponent(entry.slug)+'/');
 const image=entry.featuredImage?absolute(entry.featuredImage):undefined;
 const description=text(entry.seoDescription||entry.excerpt||entry.shortDescription||'').slice(0,450);
 const common={name:entry.title,url,description,...(image?{image}:{})};
 if(entry.type==='product'){
  const sale=String(entry.salePrice||'').trim();
  const regular=String(entry.price||entry.regularPrice||'').trim();
  const price=Number(sale||regular);
  const schema={'@context':'https://schema.org','@type':'Product',...common,
   ...(Number.isFinite(price)&&price>0?{offers:{'@type':'Offer',url:BASE+'/'+encodeURIComponent(entry.slug)+'/',price:price.toFixed(2),priceCurrency:'USD'}}:{})};
  // No invented review counts, ratings, stock availability or official vendor endorsement.
  return [schema];
 }
 if(entry.slug==='frequently-asked-questions-faqs-for-an-seo-group-buy'){
  const faqs=parseYoastFaq(entry.content||'');
  const source=faqs.length?faqs:faqDefaults;
  const entities=source.filter(x=>x.q&&x.a).map(x=>({'@type':'Question',name:text(x.q),acceptedAnswer:{'@type':'Answer',text:text(x.a)}}));
  return entities.length?[{'@context':'https://schema.org','@type':'FAQPage',...common,mainEntity:entities}]:[];
 }
 if(['shop','single-tools-list','tools'].includes(entry.slug)){
  return [itemListSchema(products,entry.slug,entry.title)];
 }
 const excluded=new Set(['privacy-policy','terms-conditions','refund-policy','dmca-policy','contact','pricing-plans','cart','checkout','my-account','access-tools']);
 if(excluded.has(entry.slug))return [];
 const article={'@context':'https://schema.org','@type':entry.type==='post'?'BlogPosting':'Article',headline:entry.title,
   mainEntityOfPage:url,description,publisher,...(image?{image}:{})};
 const published=date(entry.date),modified=date(entry.modified);
 if(published)article.datePublished=published;
 if(modified)article.dateModified=modified;
 if(entry.author)article.author={'@type':'Person',name:typeof entry.author==='string'?entry.author:entry.author.name};
 return [article];
}
export function itemListSchema(products,slug='shop',name='Browse Tools'){
 const items=products.filter(p=>p.status==='publish'&&p.slug&&p.title).map((p,i)=>({
  '@type':'ListItem',position:i+1,name:p.title,url:absolute('/'+encodeURIComponent(p.slug)+'/')
 }));
 return {'@context':'https://schema.org','@type':'ItemList',name,url:absolute('/'+slug+'/'),numberOfItems:items.length,itemListElement:items};
}
