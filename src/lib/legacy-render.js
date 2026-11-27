import {plainExcerpt} from './excerpt-text.js';
/** Preserve WordPress theme content rendering, without mutating imported records. */
const textOnly = v => String(v??'')
  .replace(/<[^>]*>/g,' ')
  .replace(/&nbsp;|&#160;/gi,' ')
  .replace(/&amp;/gi,'&')
  .replace(/&quot;/gi,'"')
  .replace(/&#0?39;|&apos;/gi,"'")
  .replace(/&lt;/gi,'<')
  .replace(/&gt;/gi,'>')
  .replace(/\s+/g,' ').trim();

/** stgb_prepare_editor_content_headings() / inc/content-headings.php */
export function prepareEditorContentHeadings(title, html) {
  let src = String(html??'');
  const first = src.match(/^\s*<h1\b[^>]*>([\s\S]*?)<\/h1>\s*/i);
  if (first && textOnly(first[1])===textOnly(title)) src=src.slice(first[0].length);
  return src.replace(/<h1(\s[^>]*)?>/gi,'<h2$1>').replace(/<\/h1>/gi,'</h2>');
}

/** WordPress wp_trim_words() equivalent for usual English excerpts. */
export function trimWordExcerpt(raw,count=24) {
  let plain=plainExcerpt(raw).replace(/\[[^\]]+\]/g,'').trim();
  const words=plain.match(/\S+/g)||[];
  return words.length>count?words.slice(0,count).join(' ')+'…':plain;
}

/** PHP stgb_product_logo_data() CRC32 lowercased-name palette. */
const FALLBACK_COLORS=['#0d9488','#f97316','#2563eb','#7c3aed','#db2777','#059669','#dc2626','#0891b2'];
function crc32(data){
  let c=0xffffffff;
  for(const b of new TextEncoder().encode(data)){
    c^=b;
    for(let i=0;i<8;i++)c=(c&1)?(c>>>1)^0xedb88320:c>>>1;
  }
  return (c^0xffffffff)>>>0;
}
export function productLogoData(name) {
  const original=String(name??'').replace(/<[^>]*>/g,'').trim();
  const words=original.split(/\s+/).filter(Boolean);
  const initials=(words.slice(0,2).map(w=>[...w][0].toLocaleUpperCase()).join('')||'ST');
  const color=FALLBACK_COLORS[crc32(String(name??'').toLowerCase())%FALLBACK_COLORS.length];
  return {initials,color};
}
