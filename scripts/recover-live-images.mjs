import fs from 'node:fs';
import path from 'node:path';

const reportPath = 'reports/code-readiness.json';
if (!fs.existsSync(reportPath)) throw Error('Run code-readiness.mjs first');
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const missing = [...new Set(report.warnings
  .filter(w => w.kind === 'missingAsset' && w.file.startsWith('dist/'))
  .map(w => w.detail))].filter(x => /^\/wp-content\/uploads\//.test(x));
const hosts = ['https://seotoolsgroupbuy.us', 'https://app.seotoolsgroupbuy.us'];
const root = path.resolve('public', 'wp-content', 'uploads');
const results = [];
function validImage(bytes, ext) {
  if (bytes.length < 16 || bytes.length > 25_000_000) return false;
  const h = bytes.subarray(0, 16);
  if (ext === '.png') return h.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (ext === '.jpg' || ext === '.jpeg') return h[0]===255 && h[1]===216 && h[2]===255;
  if (ext === '.webp') return h.toString('ascii',0,4)==='RIFF' && h.toString('ascii',8,12)==='WEBP';
  if (ext === '.gif') return h.toString('ascii',0,3)==='GIF';
  if (ext === '.svg') return bytes.toString('utf8',0,4096).includes('<svg');
  if (ext === '.avif') return h.toString('ascii',4,12).includes('ftypavif');
  return false;
}
let next = 0;
await Promise.all(Array.from({length:5}, async () => {
  while (next < missing.length) {
    const imagePath = missing[next++];
    const relative = decodeURIComponent(imagePath.slice('/wp-content/uploads/'.length));
    const dest = path.resolve(root, relative);
    const status = {path:imagePath,attempts:[],result:'unavailable'};
    if (!dest.startsWith(root+path.sep)) { status.result='invalidPath';results.push(status);continue; }
    if (fs.existsSync(dest)) { status.result='alreadyPresent';results.push(status);continue; }
    for (const host of hosts) {
      const url = host + imagePath;
      try {
        const response = await fetch(url, {signal:AbortSignal.timeout(12000),headers:{'User-Agent':'Mozilla/5.0 (compatible; MediaBackup/1.0)'}});
        const mime=response.headers.get('content-type')||'';
        const attempt={host,status:response.status,type:mime};
        status.attempts.push(attempt);
        if (!response.ok) continue;
        const length=Number(response.headers.get('content-length')||0);
        if (length > 25_000_000) {attempt.error='oversize';continue;}
        const data=Buffer.from(await response.arrayBuffer());
        const ext=path.extname(dest).toLowerCase();
        if (!validImage(data,ext)) {attempt.error='invalidImageBytes';continue;}
        fs.mkdirSync(path.dirname(dest),{recursive:true});
        fs.writeFileSync(dest,data);
        status.result='downloaded';status.source=url;status.bytes=data.length;
        break;
      } catch(e) {
        status.attempts.push({host,error:String(e.message||e).slice(0,180)});
      }
    }
    results.push(status);
    console.log('LIVE_IMAGE_CHECK '+status.result+' '+imagePath+' '+JSON.stringify(status.attempts));
  }
}));
results.sort((a,b)=>a.path.localeCompare(b.path));
const summary={checked:missing.length,downloaded:results.filter(x=>x.result==='downloaded').length,unavailable:results.filter(x=>x.result==='unavailable').length,alreadyPresent:results.filter(x=>x.result==='alreadyPresent').length};
fs.mkdirSync('reports',{recursive:true});
fs.writeFileSync('reports/live-image-recovery.json',JSON.stringify({summary,results},null,2)+'\n');
console.log('LIVE_IMAGE_RECOVERY_SUMMARY='+JSON.stringify(summary));
