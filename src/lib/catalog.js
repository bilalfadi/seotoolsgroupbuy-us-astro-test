/** Shared product/category utilities. Preserve source fields rather than generating prices. */
export const productCategories = p => Array.isArray(p?.categories)
  ? p.categories.filter(c=>c && (c.domain==='product_cat' || (!c.domain && c.slug)) && !['uncategorized','default'].includes(c.slug)).map(c=>c.slug)
  : [];
export const productCategoryName = p => Array.isArray(p?.categories)
  ? (p.categories.find(c=>c?.domain==='product_cat'&&!['uncategorized','default'].includes(c.slug))?.name || 'SEO TOOLS')
  : 'SEO TOOLS';
export const productPrice = p => {
  const regular=String(p?.regularPrice ?? '').trim();
  const sale=String(p?.salePrice ?? '').trim();
  const normal=String(p?.price ?? '').trim();
  const current=sale!==''?sale:(regular!==''?regular:normal);
  const onSale=regular!==''&&sale!==''&&Number.isFinite(Number(regular))&&Number.isFinite(Number(sale))&&Number(sale)<Number(regular);
  return {regular,sale,current,onSale};
};
export const formatProductPrice = price => {
  const s=String(price??'').trim();
  if(!s)return '';
  return /^[\$£€₹]/.test(s)?s:'$'+s;
};
export const postCategories = p => Array.isArray(p?.categories)
  ? p.categories.filter(c=>c?.name && (!c.domain || c.domain==='category'))
  : [];
export const postCategoryName = p => postCategories(p)[0]?.name || 'Blog';
export const postCategoryTags = p => [
  ...postCategories(p).flatMap(c=>[c.name,c.slug].filter(Boolean)),
  ...(Array.isArray(p?.tags)?p.tags.flatMap(t=>typeof t==='string'?[t]:[t?.name,t?.slug].filter(Boolean)):[])
].join(' ').toLowerCase();
/** Same primary product category first; then other shared categories, then remaining tools. */
export function relatedProducts(current,products,limit=4){
  const cs=productCategories(current);
  const others=products.filter(p=>p.slug!==current.slug && p.slug && p.title)
    .sort((a,b)=>a.title.localeCompare(b.title));
  const selected=[];
  for(const group of [
    others.filter(p=>cs[0]&&productCategories(p).includes(cs[0])),
    others.filter(p=>cs.some(c=>productCategories(p).includes(c))),
    others
  ])for(const p of group){if(selected.length>=limit)break;if(!selected.some(x=>x.slug===p.slug))selected.push(p)}
  return selected;
}
