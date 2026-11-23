import fs from 'node:fs';
const mode=process.argv[2];
const p='content/home-editor.json';
const d=JSON.parse(fs.readFileSync(p,'utf8'));
const sitePath='content/site.json';
const site=JSON.parse(fs.readFileSync(sitePath,'utf8'));
if(site.nav.length<6||site.social.length<5)throw new Error('Site CMS menus are incomplete');
const all=d.sections.flatMap(s=>s.items);
const homeFile='content/pages/home.json';
const home=JSON.parse(fs.readFileSync(homeFile,'utf8'));
if(d.sections.length!==8||all.length<200)throw new Error('Incomplete CMS homepage fields');
if(mode==='edit'){
 const heading=all.find(i=>i.kind==='h1');
 const link=all.find(i=>i.kind==='a'&&i.originalUrl==='/shop');
 if(!heading||!link)throw new Error('Missing homepage editable fields');
 heading.text='CMS Easy Heading Test';
 link.url='/contact/';
 fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
 site.nav[0].label='CMS Edited Home Menu';
 site.joinText='CMS Join Label';
 site.footerDescription='CMS Edited Footer Intro';
 site.social[0].url='https://example.com/cms-social';
 fs.writeFileSync(sitePath,JSON.stringify(site,null,2)+'\n');
 home.seoTitle='CMS Edited Homepage SEO Title';
 home.seoDescription='CMS Edited Homepage Meta Description';
 home.featuredImage='/media/cms-test-home.webp';
 fs.writeFileSync(homeFile,JSON.stringify(home,null,2)+'\n');
 const chatPath='content/settings/chat-widget.json',chat=JSON.parse(fs.readFileSync(chatPath,'utf8'));
 chat.heading='CMS Chat Widget Heading';
 chat.options.find(o=>o.key==='wa').href='https://example.com/cms-whatsapp';
 fs.writeFileSync(chatPath,JSON.stringify(chat,null,2)+'\n');
 const copyPath='src/lib/site-default-copy.json',copy=JSON.parse(fs.readFileSync(copyPath,'utf8'));
 copy.tools_title='CMS Marketplace Heading';
 copy.related_heading='CMS Product Recommendations';
 fs.writeFileSync(copyPath,JSON.stringify(copy,null,2)+'\n');
 const policyPath='src/lib/policy-themes.json',policy=JSON.parse(fs.readFileSync(policyPath,'utf8'));
 policy['dmca-policy'].noticeTitle='CMS Legal Notice Heading';
 const cardsPath='content/settings/policy-cards.json',cards=JSON.parse(fs.readFileSync(cardsPath,'utf8'));
 cards['dmca-policy'][0].title='CMS Edited DMCA Info Card';
 cards['dmca-policy'].push({icon:'✅',title:'CMS Newly Added Policy Card',description:'Added from Pages CMS editor'});
 fs.writeFileSync(cardsPath,JSON.stringify(cards,null,2)+'\n');
 fs.writeFileSync(policyPath,JSON.stringify(policy,null,2)+'\n');
 const productPath='content/products/ahrefs.json',product=JSON.parse(fs.readFileSync(productPath,'utf8'));
 product.enableCustomLanding=true;
 fs.writeFileSync(productPath,JSON.stringify(product,null,2)+'\n');

 console.log('Edited heading and CTA in disposable CI checkout.');
}else if(mode==='check'){
 const html=fs.readFileSync('dist/index.html','utf8');
 for(const text of ['CMS Easy Heading Test','href="/contact/"','CMS Edited Home Menu','CMS Join Label','CMS Edited Footer Intro','https://example.com/cms-social','CMS Edited Homepage SEO Title','CMS Edited Homepage Meta Description','/media/cms-test-home.webp'])if(!html.includes(text))throw new Error('Rendered homepage missing CMS edit: '+text);

 for(const v of ['CMS Chat Widget Heading','https://example.com/cms-whatsapp'])if(!html.includes(v))throw Error('CMS chat item not rendered: '+v);
 for(const [file,needle] of [['dist/shop/index.html','CMS Marketplace Heading'],['dist/shop/index.html','https://example.com/cms-whatsapp'],['dist/dmca-policy/index.html','CMS Legal Notice Heading'],['dist/dmca-policy/index.html','CMS Edited DMCA Info Card'],['dist/dmca-policy/index.html','CMS Newly Added Policy Card'],['dist/semrush-group-buy/index.html','CMS Product Recommendations'],['dist/ahrefs/index.html','ahrefs-section']]){
   if(!fs.readFileSync(file,'utf8').includes(needle))throw new Error(file+' missing CMS edited: '+needle);
 }
 console.log('PASS: Homepage, chat, marketplace, policy, product cards and optional Ahrefs landing edits render correctly.');

}else if(mode==='inventory')console.log('Homepage CMS fields:',all.length,'in sections:',d.sections.length);
else throw new Error('Usage: edit|check|inventory');
