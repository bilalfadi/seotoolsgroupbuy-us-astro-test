import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const groups = ['products', 'posts', 'pages'];
const excluded = new Set(['cart', 'checkout', 'my-account', 'access-tools']);
const failures = [];
const records = [];
const slugs = new Set();
for (const group of groups) {
  for (const filename of fs.readdirSync(path.join(root, 'content', group)).filter(f => f.endsWith('.json'))) {
    const item = JSON.parse(fs.readFileSync(path.join(root, 'content', group, filename), 'utf8'));
    if (item.status !== 'publish') continue;
    if (!item.title || !item.slug) failures.push(group + '/' + filename + ': missing title or slug');
    if (slugs.has(item.slug)) failures.push('Duplicate slug: ' + item.slug);
    slugs.add(item.slug);
    if (!item.seoTitle && !item.title) failures.push(item.slug + ': no title fallback');
    records.push({type:group,slug:item.slug});
  }
}
const layout=fs.readFileSync(path.join(root,'src/layouts/SiteLayout.astro'),'utf8');
const sitemap=fs.readFileSync(path.join(root,'src/pages/sitemap.xml.js'),'utf8');
const robots=fs.readFileSync(path.join(root,'public/robots.txt'),'utf8');
if(!layout.includes('name="robots"') || !layout.includes("'index,follow'")) failures.push('Index/follow meta tag missing from layout');
if(!layout.includes('rel="canonical"')) failures.push('Canonical tag missing');
if(!layout.includes('application/ld+json')) failures.push('JSON-LD missing');
if(!sitemap.includes('all()') || !sitemap.includes('category/seo-tools-blog')) failures.push('Sitemap does not use published content');
if(!robots.includes('Sitemap: https://seotoolsgroupbuy.us/sitemap.xml')) failures.push('Robots.txt sitemap reference missing');
// Regression checks for duplicate metadata flagged by Ahrefs on 2026-11-25.
const productSeo=slug=>JSON.parse(fs.readFileSync(path.join(root,'content/products',slug+'.json'),'utf8')).seoDescription?.trim();
const closerscopyMeta=productSeo('closerscopy');
const copyAiMeta=productSeo('copyai');
if(!closerscopyMeta||!copyAiMeta||closerscopyMeta===copyAiMeta) failures.push('Copy AI and Closerscopy need distinct nonempty meta descriptions');
const archive=fs.readFileSync(path.join(root,'src/components/BlogArchive.astro'),'utf8');
if(!archive.includes('description={archiveSeoDescription}')||!archive.includes('currentPage===1?')) failures.push('Paginated blog archives need page-specific meta descriptions');
// Ahrefs all-issues export: stop publishing demo placeholders, downgrade links and sitemap gaps.
const articleRecord=JSON.parse(fs.readFileSync(path.join(root,'content/pages/group-buy-seo-tools-are-they-a-smart-deal-or-a-risky-gamble.json'),'utf8'));
if(/YOUR_PRODUCT_(?:LINK|IMAGE)_URL_HERE/i.test(articleRecord.content)) failures.push('Published article contains placeholder link or image');
for(const slug of ['ahrefs','helium-10']){
 const html=JSON.parse(fs.readFileSync(path.join(root,'content/products',slug+'.json'),'utf8')).content;
 if(/href=["']http:\/\/seotoolsgroupbuy\.us\/?["']/i.test(html)) failures.push(slug+': HTTP homepage link remains');
}
if(!sitemap.includes('postPageCount') || !sitemap.includes('category/seo-tools-blog/page/')) failures.push('Paginated blog archive missing from sitemap generator');

// Owner requested preservation of original imported SEO titles and descriptions.
// Do not enforce arbitrary length limits on existing editorial metadata.
if(!layout.includes('structuredData.map(item='))failures.push('Per-page Product/Article/FAQ/ItemList schema not emitted in HTML layout');
for(const slug of ['group-buy-seo-tools-are-they-a-smart-deal-or-a-risky-gamble','top-5-best-seo-tools-for-e-commerce-seo']){
 if(!archive.includes('/'+slug+'/'))failures.push('Orphan SEO guide missing from blog archive navigation: '+slug);
}
const blogLongMeta=archive.match(/Browse practical SEO guides, tool reviews, comparisons and tutorials/);
if(!blogLongMeta)failures.push('Blog archive meta description still too short');

const indexable = records.filter(x=>x.slug !== 'home' && !excluded.has(x.slug)).length + 2;
console.log(JSON.stringify({published:records.length,expectedSitemapUrls:indexable,excludedFromIndex:[...excluded],issues:failures},null,2));
if(failures.length) process.exitCode=1;
