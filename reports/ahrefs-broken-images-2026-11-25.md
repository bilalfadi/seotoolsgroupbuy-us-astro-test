# Ahrefs Site Audit: Broken images (25 November 2026)

Source: Ahrefs export pasted by the site owner. Scope: `seotoolsgroupbuy.us`.
20 reported lines contain **10 unique broken image URLs** because HTTP and HTTPS versions are repeated.

## Restored links — 2 (Jasper AI product page)
These locally stored WebP images already existed in the repository and the imported
`content/products/jasper-ai.json` image URLs were corrected, without changing article prose.

| Original 404 reference | Repaired local image path |
|---|---|
| `/wp-content/uploads/2025/04/jasper-group-buy-in-3-1024x682.webp` | `/media/wp-uploads/2026/08/jasper-group-buy-in-3-1024x682-1.webp` |
| `/wp-content/uploads/2025/04/jasper-benifits-group-buy-1024x659.webp` | `/media/wp-uploads/2026/08/jasper-benifits-group-buy-1024x659-1.webp` |

## Original image binaries still unavailable — 8

For exact image parity, restore these files **with the same filenames and paths** under
`public/wp-content/uploads/` (not under a guessed image or unrelated icon).
Existing imported content already refers to these routes.

| Page | File needed under `public/wp-content/uploads/` |
|---|---|
| `/how-seotoolsgroupbuy-us-works/` | `2025/01/How-to-Sign-Up-for-SEO-Tools-Group-Buy.png` |
| `/how-seotoolsgroupbuy-us-works/` | `2025/01/Why-choose-seotoolsgroupbuy.us_.svg` |
| `/jasper-ai/` | `2025/04/jasper-ai-1024x697.webp` |
| `/seo-group-buy-tools-vs-free-seo-tools-which-one-is-worth-it/` | `2025/03/Screenshot-2025-03-02-134839-1024x550.webp` |
| same | `2025/03/Screenshot-2025-03-02-134859-1024x501.webp` |
| same | `2025/03/Screenshot-2025-03-02-134916-1024x528.webp` |
| same | `2025/03/Screenshot-2025-03-02-134931.webp` |
| same | `2025/03/Screenshot-2025-03-02-134948.webp` |

### Important investigation
All 8 image filenames were searched in the `.us` repository and the three other
Astro migration repositories. Several matching filenames were found in the
`seogbtools-astro-test` repository at `public/assets/images/site/`, but these
files are tiny **HTML CAPTCHA/challenge responses**, not actual PNG/SVG/WebP
binary image contents. They must not be copied to production or represented as
recovered images.

Attempts to retrieve the original URLs from the live site and its
`app.seotoolsgroupbuy.us` host were unsuccessful. To preserve word-for-word
and visual migration integrity, missing originals were **not replaced with
arbitrary stock images or removed from the article body**.

### Verification
After restoring the 8 original binary files, deploy the static build and rerun
Ahrefs Site Audit. Also make sure HTTP → HTTPS uses one canonical host.
GitHub Actions should confirm the Astro build succeeds; CI success alone does
not prove old image URLs are HTTP 200.

Fix commits:
- `e81bb6789f04e3048df1a727ec1e6f1e2ea705a4`: Repair two Jasper references.
- `534412066525a7eb15e46e4ae866da46f81ecb72`: Fix outdated sitemap
  verifier filename so build / CMS checks run successfully.

## Live recovery run result

GitHub Actions workflow **Recover original live WordPress images** (run `45667205284`) executed successfully as a job, but its asset recovery summary was:

```json
{"checked":24,"downloaded":0,"unavailable":24,"alreadyPresent":0}
```

All three source hosts responded 404 or blocked with non-image HTML for the eight outstanding originals. **Recovery job success does not mean recovered images.**

To prevent browsers selecting broken `srcset` candidates from the legacy `app.` host, stale responsive-source attributes were removed for the 1 How It Works and 5 comparison screenshots, while keeping the original `src`, alt text, captions and content in place. Once the genuine files are uploaded at the expected paths, each source image will render without additional HTML edits.

The missing-file report is now actionable: restore eight original files from an old WordPress `wp-content/uploads` backup/media ZIP or other verified original source. No substitute imagery was fabricated.
