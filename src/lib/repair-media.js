import fs from 'node:fs';
import path from 'node:path';

/**
 * Recover old WooCommerce grid thumbnails using the image explicitly linked to
 * the same imported product. Original WXR text remains unchanged.
 * Only replace legacy paths that have no actual file and a locally present
 * featured image for the linked product. Never guess by filename similarity.
 */
export function repairLinkedProductImages(html, products) {
  const productMap = new Map(products.filter(p => p.slug).map(p => [p.slug, p]));
  let changed = 0;
  const result = String(html || '').replace(
    /(<a\b[^>]*href=["']\/([^\/"'?#]+)\/["'][^>]*>\s*<img\b[^>]*\bsrc=["'])(\/wp-content\/uploads\/[^"']+)(["'])/gi,
    (original, prefix, slug, legacy, close) => {
      const product = productMap.get(slug);
      const image = String(product?.featuredImage || '');
      if (!image.startsWith('/media/wp-uploads/')) return original;
      const expected = path.resolve(process.cwd(), 'public', image.slice(1));
      const allowedRoot = path.resolve(process.cwd(), 'public', 'media', 'wp-uploads');
      if (!expected.startsWith(allowedRoot + path.sep) || !fs.existsSync(expected)) return original;
      const oldFile = path.resolve(process.cwd(), 'public', legacy.slice(1));
      if (fs.existsSync(oldFile)) return original;
      changed++;
      return prefix + image + close;
    }
  );
  if (changed) console.log('LINKED_PRODUCT_IMAGES_REPAIRED=' + changed);
  return result;
}
