/** Static production-oriented robots rules; canonical domain matches SiteLayout. */
export function GET(){
  const body='User-agent: *\nAllow: /\n\nSitemap: https://seotoolsgroupbuy.us/sitemap.xml\n';
  return new Response(body,{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}});
}
