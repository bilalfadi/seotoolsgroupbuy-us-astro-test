# SEO Tools Group Buy — Astro + Pages CMS (TEST BUILD)

Migrated directly from the supplied WordPress theme v1.8.0 and WXR export dated 2026-11-19.

- 176 published products, 11 published posts, 17 published pages are imported into **individual CMS-editable JSON files**.
- Original WordPress slugs and article HTML are preserved. The WordPress `home` page powers the homepage.
- Original theme CSS, JavaScript, logos and graphics are copied into `public/assets`.
- `.pages.yml` configures Pages CMS collections. On GitHub, connect the repository to https://app.pagescms.org/.
- The site uses Astro static output, with no requirement to convert Next.js or WordPress templates to manually-written HTML files.

## Local commands

```sh
npm install
npm run verify
npm run build
npm run dev
```

## Deployment

Push **only to a separate test repository** first. In Cloudflare Workers/Pages choose Git integration, build command `npm run build`, output directory `dist`, Node 22+. Pages CMS reads `.pages.yml` from the root. Do **not** connect the production domain yet.

## Known limitations / next tasks

1. **Media:** The WordPress XML has 1,407 attachment *records*, not the image binaries. Images in imported HTML still refer to `seotoolsgroupbuy.us`; migrate actual assets before switching DNS. See `migration/attachment-manifest.json`.
2. **Exact design:** The supplied WordPress theme CSS/JS is retained, and the 119 KB homepage HTML was migrated, but PHP-generated sections, WordPress hooks and Elementor components may not reproduce exactly. Desktop/mobile visual parity requires screenshot review against the original site.
3. **WooCommerce:** Cart, checkout and account are not functional as static pages. Preview links lead to the original site. The purchase button similarly links to the original page until a real commerce backend is configured.
4. **CMS rich text:** Imported pages can contain custom CSS/JS and rich HTML. Editing in a rich text editor may alter the markup. Back up the original JSON before first Save; test a single post first. Do not modify `slug` on live pages without redirects.
5. **Settings:** Original homepage data may rely on WordPress `wp_options` or theme customizer data not included in WXR; a database/options export is necessary for true pixel fidelity.
6. **SEO:** Canonical tags point to original domain; verify metadata, indexing/noindex and redirect map before launch.
7. **Dynamic content:** Status widgets, interactive checkout/account, WooCommerce AJAX, WordPress-driven search/filtering, analytics integrations and embedded scripts require reimplementation/QA.

## Website2 offline preparation and downloads (2026-11-19 update)

Place/extract this project **directly inside** `C:\Users\HUSSNAIN.COM\Downloads\website2` (so that `package.json` is inside that directory). Run PowerShell in that directory:

```powershell
node scripts/migrate-media.mjs
node scripts/audit-migration.mjs
node scripts/verify.mjs
```

Or run `./DOWNLOAD-IMAGES-WINDOWS.ps1` if your PowerShell policy permits it.

Media migration is resumable: successfully downloaded images are reused on subsequent runs, failed URLs remain as original references, and `migration/media-report.json` records results. **The preparation environment used to create this ZIP has no DNS access to the live WordPress domain, so actual external media downloads were not performed here.** The images must be downloaded on your network-connected Windows machine; theme bundled assets are already included. `migration/link-and-media-audit.json` lists 57 distinct internal path targets not found among the published imported JSON entries; inspect them before production and do not assume they are broken without checking old-site redirects/category routes. The `migration/media-report.json` is only created once download is attempted on a connected machine.

No GitHub push or production domain change is part of this ZIP.
