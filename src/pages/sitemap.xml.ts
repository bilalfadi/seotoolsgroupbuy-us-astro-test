import type { APIRoute } from 'astro';
import { all } from '../lib/content.js';

const ORIGIN = 'https://seotoolsgroupbuy.us';
const excluded = new Set(['cart', 'checkout', 'my-account', 'access-tools']);
const escapeXml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const GET: APIRoute = () => {
  const slugs = new Set<string>(['', 'category/seo-tools-blog']);
  for (const item of all()) {
    if (!item.slug || item.slug === 'home' || excluded.has(item.slug)) continue;
    slugs.add(item.slug);
  }
  const urls = [...slugs].sort().map((slug) => {
    const pathname = slug ? '/' + slug.split('/').map(encodeURIComponent).join('/') + '/' : '/';
    return '  <url><loc>' + escapeXml(ORIGIN + pathname) + '</loc></url>';
  }).join('\n');
  return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n', {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' }
  });
};
