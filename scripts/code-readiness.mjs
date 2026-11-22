import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
const groups = ['products', 'pages', 'posts'];
const records = groups.flatMap(group => fs.readdirSync(path.join(root, 'content', group))
  .filter(name => name.endsWith('.json'))
  .map(name => ({ group, file: 'content/' + group + '/' + name,
    ...JSON.parse(fs.readFileSync(path.join(root, 'content', group, name), 'utf8')) })));
const published = records.filter(x => x.status === 'publish');
const redirectPaths = new Set(fs.readFileSync(path.join(root, 'public', '_redirects'), 'utf8')
  .split(/\r?\n/).filter(line => line.startsWith('/') && /\s+301\s*$/.test(line))
  .map(line => line.split(/\s+/)[0]));
const issues = [];
const warnings = [];
const summary = { products: records.filter(x => x.group === 'products').length,
  pages: records.filter(x => x.group === 'pages').length,
  posts: records.filter(x => x.group === 'posts').length,
  published: published.length, routesChecked: 0, htmlFilesChecked: 0,
  localLinksChecked: 0, localAssetsChecked: 0, externalLinksFound: 0 };
function add(kind, file, detail, critical = false) {
  (critical ? issues : warnings).push({ kind, file, detail });
}
function routeFile(route) {
  const clean = decodeURIComponent(route.split('?')[0].split('#')[0]).replace(/^\/+|\/+$/g,'');
  if (!clean) return path.join(out, 'index.html');
  return path.join(out, clean, 'index.html');
}
function existsForURL(raw, file, asset) {
  if (!raw || raw.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(raw)) return;
  if (/^\/\//.test(raw)) { summary.externalLinksFound++; return; }
  if (/^https?:\/\//i.test(raw)) {
    try { const u = new URL(raw); if (!['seotoolsgroupbuy.us','www.seotoolsgroupbuy.us'].includes(u.hostname)) {
      summary.externalLinksFound++; return;
    } raw = u.pathname + u.search; } catch { return; }
  }
  if (!raw.startsWith('/')) return;
  const pathname = raw.split('?')[0].split('#')[0];
  if (!pathname || pathname === '/') { summary.localLinksChecked++; return; }
  let local;
  try { local = decodeURIComponent(pathname); } catch { add('badEncodedURL',file,raw);return; }
  if (local.includes('..')) { add('unsafeLocalPath',file,raw,true);return; }
  const resolved = path.join(out,local.replace(/^\/+/, ''));
  summary[asset ? 'localAssetsChecked' : 'localLinksChecked']++;
  if (asset) {
    if (!fs.existsSync(resolved)) add('missingAsset', file, raw);
  } else {
    if (!fs.existsSync(routeFile(local)) && !fs.existsSync(resolved) &&
        !fs.existsSync(resolved+'.html') &&
        !redirectPaths.has(local.endsWith('/') ? local : local+'/')) add('missingLocalLink',file,raw);
  }
}
for (const x of published) {
  if (!x.title || !x.slug || x.file !== 'content/'+x.group+'/'+x.slug+'.json')
    add('invalidRecord',x.file,'Missing title/slug or mismatched file name',true);
  const route = x.slug === 'home' ? '/' : '/'+encodeURIComponent(x.slug)+'/';
  const built = routeFile(route);
  summary.routesChecked++;
  if (!fs.existsSync(built)) add('missingBuiltRoute',x.file,route,true);
  if (x.group === 'products') {
    if (x.price && !/^\d+(\.\d+)?$/.test(String(x.price)))
      add('unusualPrice',x.file,String(x.price));
    if (x.externalUrl && !/^(https?:\/\/|\/)/i.test(x.externalUrl))
      add('invalidOrderURL',x.file,x.externalUrl,true);
  }
  for (const field of ['content','excerpt','shortDescription']) {
    const html = String(x[field] || '');
    for (const m of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
      const raw=m[1].replace(/&amp;/g,'&');
      existsForURL(raw,x.file,/\b(?:src)\s*=/.test(m[0]));
    }
  }
  if (x.featuredImage) existsForURL(x.featuredImage,x.file,true);
}
const walk=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>{
  const p=path.join(dir,x.name);return x.isDirectory()?walk(p):[p];
}):[];
const htmlFiles=walk(out).filter(x=>x.endsWith('.html'));
for (const file of htmlFiles) {
  const html=fs.readFileSync(file,'utf8'); summary.htmlFilesChecked++;
  const rel=path.relative(root,file);
  if (!/<title[\s>]/i.test(html)) add('missingHTMLTitle',rel,'No title element');
  if (!/<meta\s+name="description"/i.test(html)) add('missingMetaDescription',rel,'No meta description');
  if (!/<link\s+rel="canonical"/i.test(html)) add('missingCanonical',rel,'No canonical');
  for (const m of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    existsForURL(m[1].replace(/&amp;/g,'&'),rel,/\bsrc\s*=/.test(m[0]));
  }
}
for (const required of ['assets/css/globals.css','assets/js/theme.js','assets/js/chatbox.js',
  'media/wp-uploads/2026/11/stgb-site-icon-512-4.png']) {
  if (!fs.existsSync(path.join(out,required))) add('missingCriticalAsset','dist',required,true);
}
const warningKinds = Object.fromEntries([...new Set(warnings.map(w => w.kind))].sort()
  .map(kind => [kind, { occurrences: warnings.filter(w => w.kind === kind).length,
    uniquePaths: new Set(warnings.filter(w => w.kind === kind).map(w => w.detail)).size,
    examples: [...new Set(warnings.filter(w => w.kind === kind).map(w => w.detail))].slice(0,12) }]));
const warningFiles = [...new Set(warnings.map(w => w.file))].length;
const sourceWarnings=warnings.filter(w=>w.file.startsWith('content/'));
const builtWarnings=warnings.filter(w=>w.file.startsWith('dist/'));
const builtMissingImagePaths=[...new Set(builtWarnings.filter(w=>w.kind==='missingAsset').map(w=>w.detail))];
const sourceMissingImagePaths=[...new Set(sourceWarnings.filter(w=>w.kind==='missingAsset').map(w=>w.detail))];
const missingImageBreakdown={
  sourceOnlyWarnings:sourceWarnings.length,
  generatedPageWarnings:builtWarnings.length,
  generatedPageUniqueMissingImagePaths:builtMissingImagePaths.length,
  sourceUniqueMissingImagePaths:sourceMissingImagePaths.length,
  generatedPageExamples:builtMissingImagePaths.slice(0,30),
  generatedPagesWithWarnings:[...new Set(builtWarnings.map(w=>w.file))].slice(0,30)
};

const report={ checkedAt:new Date().toISOString(), mode:'source-code-and-generated-files-only',
  previewNotRequired:true, summary, warningKinds, warningFiles, missingImageBreakdown,
  errors:issues, warnings,
  knownLimitations:[
    'HTTP status, Cloudflare redirects and live external URLs cannot be validated without deployment',
    'Responsive layout, interaction and payment/checkout behavior cannot be verified without a browser against a running site',
    'Account, cart and checkout currently render a membership-platform notice, not a native checkout',
    'Public pages emit index,follow; cart, checkout, my-account and access-tools retain noindex,follow'
  ]};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/code-readiness.json',JSON.stringify(report,null,2)+'\n');
console.log('CODE_READINESS_SUMMARY='+JSON.stringify({ ...summary,criticalErrors:issues.length,warnings:warnings.length,warningKinds,warningFiles,missingImageBreakdown }));
console.log('CODE_READINESS_CRITICAL='+JSON.stringify(issues.slice(0,30)));
console.log('CODE_READINESS_WARNINGS_SAMPLE='+JSON.stringify(warnings.slice(0,30)));
if (issues.length) process.exitCode=1;
