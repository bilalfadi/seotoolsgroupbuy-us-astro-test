# Ahrefs All-Issues ZIP audit — seotoolsgroupbuy.us
**Source:** `xxx_25-nov-2026_all-issues_2026-11-25_23-16-46.zip`, provided by owner on 2026-11-25.

The ZIP has 52 CSV report files plus `index.txt`. **Rows in different reports frequently describe the same affected URL**, and HTTP/HTTPS duplicates must not be added up as unique errors.

## Actual broken/high-impact items

1. **Internal 404 + broken image placeholder (one article).**
   `/group-buy-seo-tools-are-they-a-smart-deal-or-a-risky-gamble/` contained the literal `YOUR_PRODUCT_LINK_HERE` in three anchors and `YOUR_PRODUCT_IMAGE_URL_HERE` in a featured-product image. These created a 404 page and extra broken-image item.
   - **Fixed in CMS content**: all placeholder anchors now point to `/shop/`; fake image element was replaced with an accessible shop text link. No made-up image.
2. **8 genuinely missing old image assets across three articles.**
   `/how-seotoolsgroupbuy-us-works/` (2); `/jasper-ai/` (1); `/seo-group-buy-tools-vs-free-seo-tools-which-one-is-worth-it/` (5).
   - See `reports/ahrefs-broken-images-2026-11-25.md`. 2 other Jasper assets already have repaired CMS references. Original eight binary files are unavailable; automated recovery checked 24 URLs on three source hosts and downloaded 0. Do not claim this resolved.
3. **Internal HTTP links on HTTPS pages (2 source URLs, three occurrences of the same homepage link plus one).**
   - `/ahrefs/` and `/helium-10/` linked to `http://seotoolsgroupbuy.us/`.
   - **Fixed in CMS content**: all those homepage anchor destinations changed to `https://seotoolsgroupbuy.us/`.
4. **Blog Page 2 missing from XML sitemap (one URL).**
   - `/category/seo-tools-blog/page/2/` existed and was indexable but absent from generated `sitemap.xml`.
   - **Fixed in sitemap generator**: include each generated published blog pagination route.
5. **Orphaned content pages (2).**
   - `/group-buy-seo-tools-are-they-a-smart-deal-or-a-risky-gamble/`
   - `/top-5-best-seo-tools-for-e-commerce-seo/`
   - Add descriptive incoming contextual links from other relevant public pages. Do not invent placement until related content is reviewed.

## Other reported categories

| Report (deduplicated at category level) | Reported rows | Interpretation / next action |
|---|---:|---|
| `Warning-indexable-Meta_description_too_long` | 30 | Review page-by-page, rewrite only when preserving intent and avoiding duplicate descriptions |
| `Warning-indexable-Meta_description_too_short` | 1 | Blog archive description was previously short; new unique description for page 2 already exists, improve page 1 if desired |
| `Warning-indexable-Title_too_long` | 15 | Editorial review of SEO titles, avoid wholesale destructive rewriting |
| `Warning-indexable-Product_page_missing_Product_schema` | 14 | Add only supported offers/availability/pricing schema; never invent reviews or product facts |
| `Notice-indexable-Article_page_missing_Article_schema` | 20 | Add truthful Article metadata for article-like public pages with sourced dates/authors |
| `Notice-indexable-Category_page_missing_ItemList_schema` | 2 | `/shop/` and `/single-tools-list/`; schema enhancement |
| `Notice-indexable-FAQ_page_missing_FAQPage_schema` | 1 | FAQ rich-results eligibility differs; optional schema enhancement after reviewing actual Q&A |
| `Warning-Slow_page` | 6 | Includes payment subdomain and HTTP URLs, benchmark with fresh rendering/TTFB before optimization |
| `Notice-Page_in_multiple_sitemaps` | 200 | Investigate sitemap sources supplied to Ahrefs; may be multiple submitted sitemap URLs with overlapping canonical pages |
| `Notice-Canonical_from_HTTP_to_HTTPS` | 214 | Site's HTTP URLs appeared with 200 responses. Enforce an HTTPS redirect at Cloudflare edge so bots do not crawl both versions as separate HTML pages |
| `Notice-HTTP_page_has_internal_links_to_HTTPS` | 214 | Primarily consequence of HTTP pages still being crawlable; edge-level canonical HTTPS redirect first |
| `Warning-3XX_redirect` | 76 | Mostly trailing-slash 307 canonicalization and HTTP variants; update internal anchors to final canonical slash destinations where possible |
| `Notice-Indexable_page_not_in_sitemap` | 1 | Blog Page 2 — sitemap generator fixed |
| `Notice-indexable-Page_has_only_one_dofollow_incoming_internal_link` | 9 | Improve contextual internal linking where editorially relevant |
| `Notice-indexable-Inconsistent_AI_training_bot_policy` | 201 | AI crawling policy decision, not a Google indexing error by itself |
| `Notice-indexable-Indexable_page_blocked_from_some_AI_search_bots` | 201 | Same policy concern; not automatically a defect |
| `Notice-Changed_pages_not_submitted_to_IndexNow` | 201 | Optional submission integration; not a broken-page error |
| `Notice-indexable-Pages_have_high_AI_content_levels` | 11 | Editorial quality review; detector score is not a definitive assessment of actual content origin |
| `Warning-Noindex_page`, `Warning-Nofollow_page` | 1 each | Both refer to `https://pay.seotoolsgroupbuy.us/`. Payment/sign-up flows may intentionally be noindex/nofollow, and are administered separately from the Astro website |
| `Warning-Meta_description_tag_missing_or_empty` | 1 | Payment subdomain signup page; separate application |
| `Warning-HTML_lang_attribute_missing` | 1 | Payment subdomain signup page; separate application |

## Previous conversation vs this ZIP

Previous Ahrefs report mentioned `https://pay.seotoolsgroupbuy.us/users/login` returning 404. This **specific login URL does not appear as the 4XX error in the uploaded ZIP**; the ZIP's 4XX entry is instead the placeholder in the Smart Deal/Risky Gamble article. Payment-host routes belong to the separate payment application. Keep signup and login buttons on `https://pay.seotoolsgroupbuy.us` root as requested; never link directly to the broken `/users/login` path unless verified.

## Committed code changes

- CMS page content: remove invalid featured-product links/image placeholder.
- Ahrefs and Helium 10 CMS product content: change internal homepage links from HTTP to HTTPS.
- Sitemap: include blog archive pagination.
- `scripts/verify-seo.mjs`: prevent regression of these high-impact cases.
- Earlier same-day fixes already address duplicate blog page titles and descriptions, and Copy AI's cloned Closerscopy description.

**QA:** GitHub Actions verifies the Astro build, CMS structure and SEO static checks. Live Cloudflare and Ahrefs recrawls are still needed to confirm all statuses; missing original media and Cloudflare HTTP redirect remain outstanding.
