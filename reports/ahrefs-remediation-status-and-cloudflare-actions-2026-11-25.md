# Ahrefs audit follow-up — technical fixes and operational dependencies
Date: 2026-11-25. Source: owner-uploaded `xxx_25-nov-2026_all-issues_2026-11-25_23-16-46.zip` (51 CSV reports and index).

## Completed in GitHub repository
- Removed the published broken placeholder product link and placeholder image from the Smart Deal / Risky Gamble article (corrected to `/shop/`).
- Corrected two Jasper images to verified local original assets; cleaned stale external `srcset` values.
- Corrected HTTP internal homepage anchors in Ahrefs/Helium 10 articles.
- Rendered generated JSON-LD Product/Article/FAQPage/ItemList structured data (schema must be verified again in a fresh crawl).
- Added canonical blog archive pagination page 2 to `/sitemap.xml`; unique Blog Page 2 metadata as previously fixed.
- Provided incoming links to both previously orphaned SEO articles and related blog cross-links.
- Normalize internal published URLs and two old product-tag redirects to the final trailing-slash paths. Added regression tests with all 37 reported redirecting target paths.
- Added reasonable static asset cache-control rules to `public/_headers` for CSS, JS and images. Not a substitute for live performance benchmarking.
- **Kept existing original SEO page titles and meta descriptions unchanged per owner instruction.** Any long-title/description warnings will persist deliberately.

## Exact sitemap duplication finding
Ahrefs `Notice-Page_in_multiple_sitemaps.csv` reports **200 pages**, and every record references the exact same sitemap using two URL schemes:
1. `http://seotoolsgroupbuy.us/sitemap.xml`
2. `https://seotoolsgroupbuy.us/sitemap.xml`

This is *not* evidence that Astro generates duplicate content sitemaps. It is a URL scheme / crawl configuration issue. Use only `https://seotoolsgroupbuy.us/sitemap.xml` as the sitemap in Ahrefs, and enforce HTTP-to-HTTPS as a 301 at Cloudflare edge.

## Cloudflare owner action needed: 214 HTTP-to-HTTPS canonical notices
The GitHub connector does not administer the Cloudflare account / zone settings. In the Cloudflare zone for `seotoolsgroupbuy.us`, enable **SSL/TLS > Edge Certificates > Always Use HTTPS**. This issues the HTTP-to-HTTPS redirect before your Worker serves static HTML.

Verify in a terminal or with browser network inspection:
- `http://seotoolsgroupbuy.us/` should return a redirect to `https://seotoolsgroupbuy.us/`.
- `http://seotoolsgroupbuy.us/sitemap.xml` should redirect to the **same HTTPS sitemap**.
- Check `www.` host redirection only after confirming desired host canonicalization and DNS records.
- In Ahrefs Site Audit project URL sources / sitemaps, retain only the HTTPS sitemap and run a fresh crawl.
- Avoid adding a broad Worker redirect that could interfere with the separate `pay.` subdomain.

## Outstanding original images (cannot safely manufacture)
Original media recovery from `seotoolsgroupbuy.us`, `www.` and `app.` fetched 0 of 24 missing images; all were 404 or non-image responses.
To preserve image parity, need the genuine bytes in these 8 exact paths:
- `public/wp-content/uploads/2025/01/How-to-Sign-Up-for-SEO-Tools-Group-Buy.png`
- `public/wp-content/uploads/2025/01/Why-choose-seotoolsgroupbuy.us_.svg`
- `public/wp-content/uploads/2025/04/jasper-ai-1024x697.webp`
- `public/wp-content/uploads/2025/03/Screenshot-2025-03-02-134839-1024x550.webp`
- `public/wp-content/uploads/2025/03/Screenshot-2025-03-02-134859-1024x501.webp`
- `public/wp-content/uploads/2025/03/Screenshot-2025-03-02-134916-1024x528.webp`
- `public/wp-content/uploads/2025/03/Screenshot-2025-03-02-134931.webp`
- `public/wp-content/uploads/2025/03/Screenshot-2025-03-02-134948.webp`

Some apparently matching assets in another repository were only HTML anti-bot challenge pages, **not usable image files**. Do not use placeholder replacement graphics masquerading as original images. Restore from old WordPress media backup or verifiable original media.

## Payment account and speed
- `https://pay.seotoolsgroupbuy.us/` is a separate aMember/payment application. Its intentional noindex settings, missing description/lang and slower 1,609 ms TTFB need attention in that app; do not change Astro website to affect it.
- The ZIP's six slow pages include the payment signup and **five HTTP versions of public pages**. HTTPS redirect settings and a live Lighthouse / response timing review come first; the new static asset caching can improve repeat asset loads, but does not guarantee lower origin TTFB.

## What constitutes completion
1. Deploy the latest GitHub commit to Cloudflare Worker and verify all reported pages/rendered JSON-LD with live URL checks.
2. Enforce HTTP-to-HTTPS at zone edge and fix Ahrefs duplicate sitemap URL sources.
3. Restore eight original image binaries.
4. Retest payment app independently.
5. Run fresh Ahrefs Site Audit and compare affected URLs rather than adding duplicate HTTP/HTTPS rows.

Passing CI means code builds and static assertions pass; it is **not** a claim that Ahrefs live errors are zero.
