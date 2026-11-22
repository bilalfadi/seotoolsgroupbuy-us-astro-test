import fs from 'node:fs';
import { chromium } from 'playwright';

const origin = 'https://seotoolsgroupbuy.us';
const preview = 'https://seotoolsgroupbuy-us-astro-test.bilalfadi11221333.workers.dev';
const records = ['products', 'pages', 'posts'].flatMap(group =>
  fs.readdirSync('content/' + group).filter(n => n.endsWith('.json'))
    .map(n => ({ group, ...JSON.parse(fs.readFileSync('content/' + group + '/' + n, 'utf8')) }))
).filter(x => x.status === 'publish');
const sample = ['/', '/ahrefs/', '/semrush-group-buy/', '/shop/', '/pricing-plans/',
  '/contact/', '/single-tools-list/', '/frequently-asked-questions-faqs-for-an-seo-group-buy/',
  '/cart/', '/checkout/', '/my-account/', '/ahrefs-review/'];
const originHost = new URL(origin).hostname;
const report = { time: new Date().toISOString(), origin, preview,
  totalContent: records.length, sourceRoutes: [], pages: [], assets: [], checkout: {},
  errors: [], warnings: [], notes: ['Read-only checks: no form submission, no real payments or orders.'] };
const timeout = ms => AbortSignal.timeout(ms);
const fetchUrl = async url => {
  try {
    const res = await fetch(url, { redirect: 'follow', signal: timeout(25000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StagingReadinessAudit/1.0)' } });
    return { status: res.status, url: res.url, type: res.headers.get('content-type') || '' };
  } catch (e) { return { error: String(e) }; }
};
for (const record of records) {
  const path = '/' + record.slug + '/';
  const result = await fetchUrl(preview + path);
  report.sourceRoutes.push({ path, group: record.group, ...result });
  if (result.error || result.status !== 200) report.errors.push({ type: 'route', path, ...result });
}
for (const asset of ['/assets/css/product-detail.css', '/assets/css/blog-archive.css',
  '/assets/js/chatbox.js', '/media/wp-uploads/2026/11/stgb-site-icon-512-4.png']) {
  const result = await fetchUrl(preview + asset);
  report.assets.push({ path: asset, ...result });
  if (result.error || result.status !== 200) report.errors.push({ type: 'asset', path: asset, ...result });
}
let browser;
try {
  browser = await chromium.launch({ headless: true });
  for (const path of sample) {
    const record = { path, viewports: {} };
    for (const vp of [{ name: 'desktop', width: 1440, height: 900 },
      { name: 'mobile', width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
      const jsErrors = []; page.on('pageerror', e => jsErrors.push(String(e)));
      try {
        const response = await page.goto(preview + path, { waitUntil: 'domcontentloaded', timeout: 40000 });
        await page.waitForTimeout(500);
        const data = await page.evaluate(() => ({
          title: document.title,
          h1: [...document.querySelectorAll('h1')].map(n => n.textContent.trim()),
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: document.documentElement.clientWidth,
          brokenImages: [...document.images].filter(i => !i.complete || i.naturalWidth === 0)
            .map(i => i.currentSrc || i.src),
          links: [...document.querySelectorAll('a[href]')].map(a => a.href),
          forms: [...document.forms].map(f => ({ action: f.action, method: f.method,
            fields: [...f.querySelectorAll('input,select,textarea')].map(x => ({ name: x.name, type: x.type })) })),
          invalidSchema: [...document.querySelectorAll('script[type="application/ld+json"]')]
            .filter(s => { try { JSON.parse(s.textContent); return false; } catch { return true; } }).length,
          metaDescription: document.querySelector('meta[name="description"]')?.content || '',
          canonical: document.querySelector('link[rel="canonical"]')?.href || ''
        }));
        record.viewports[vp.name] = { status: response?.status(), ...data, jsErrors };
        if (!response?.ok()) report.errors.push({ type: 'browserHTTP', path, viewport: vp.name, status: response?.status() });
        if (data.overflow) report.errors.push({ type: 'horizontalOverflow', path, viewport: vp.name,
          scrollWidth: data.scrollWidth, viewportWidth: data.viewportWidth });
        if (data.brokenImages.length) report.errors.push({ type: 'brokenImages', path, viewport: vp.name,
          urls: data.brokenImages.slice(0,20) });
        if (data.invalidSchema) report.errors.push({ type: 'invalidJsonLd', path, viewport: vp.name,
          count: data.invalidSchema });
        if (jsErrors.length) report.warnings.push({ type: 'jsErrors', path, viewport: vp.name, messages: jsErrors });
      } catch (e) {
        record.viewports[vp.name] = { error: String(e) };
        report.errors.push({ type: 'browserFailure', path, viewport: vp.name, error: String(e) });
      } finally { await page.close(); }
    }
    report.pages.push(record);
  }
  const knownPaths = new Set(['/', ...records.map(r => '/' + r.slug + '/'),
    '/blog/', '/category/seo-tools-blog/', '/product-category/', '/wp-content/']);
  const allLinks = new Set(report.pages.flatMap(p =>
    Object.values(p.viewports).flatMap(x => x.links || [])));
  const targets = [...allLinks].filter(x => { try {
    const u = new URL(x); return u.hostname === new URL(preview).hostname
      && !knownPaths.has(u.pathname) && !u.pathname.startsWith('/media/')
      && !u.pathname.startsWith('/assets/') && !u.pathname.startsWith('/wp-content/');
  } catch { return false; } }).slice(0,80);
  for (const url of targets) {
    const found = await fetchUrl(url);
    if (found.error || found.status >= 400) report.errors.push({ type: 'internalLink', url, ...found });
  }
  report.checkedAdditionalLinks = targets.length;
  const checkout = report.pages.find(x => x.path === '/checkout/');
  const cart = report.pages.find(x => x.path === '/cart/');
  report.checkout = { checkoutForms: checkout?.viewports.desktop?.forms || [],
    cartForms: cart?.viewports.desktop?.forms || [],
    hasCheckoutPage: checkout?.viewports.desktop?.status === 200,
    note: 'Only public markup tested; no payment, order, login, or authenticated purchase flow was exercised.' };
} catch (e) {
  report.errors.push({ type: 'browserSetup', error: String(e) });
} finally { if (browser) await browser.close(); }
fs.mkdirSync('reports', { recursive: true });
report.summary = { contentRoutesChecked: report.sourceRoutes.length,
  sampledPages: report.pages.length, errors: report.errors.length, warnings: report.warnings.length };
fs.writeFileSync('reports/staging-browser-readiness.json', JSON.stringify(report, null, 2) + '\n');
console.log('STAGING_AUDIT_SUMMARY=' + JSON.stringify(report.summary));
console.log('STAGING_AUDIT_ISSUES=' + JSON.stringify(report.errors.slice(0,40)));
if (report.errors.length) process.exitCode = 1;
