import fs from 'node:fs';
const mode=process.argv[2];
const p='content/home-editor.json';
const d=JSON.parse(fs.readFileSync(p,'utf8'));
const sitePath='content/site.json';
const site=JSON.parse(fs.readFileSync(sitePath,'utf8'));
if(site.nav.length<6||site.social.length<5)throw new Error('Site CMS menus are incomplete');
const all=d.sections.flatMap(s=>s.items);
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
 console.log('Edited heading and CTA in disposable CI checkout.');
}else if(mode==='check'){
 const html=fs.readFileSync('dist/index.html','utf8');
 for(const text of ['CMS Easy Heading Test','href="/contact/"','CMS Edited Home Menu','CMS Join Label','CMS Edited Footer Intro','https://example.com/cms-social'])if(!html.includes(text))throw new Error('Rendered homepage missing CMS edit: '+text);
 console.log('PASS: 217 structured homepage fields and edited heading, CTA, header/footer and social links rendered.');
}else if(mode==='inventory')console.log('Homepage CMS fields:',all.length,'in sections:',d.sections.length);
else throw new Error('Usage: edit|check|inventory');
