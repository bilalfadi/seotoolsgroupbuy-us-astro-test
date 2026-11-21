import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const groups=['products','posts','pages'];
const allRecords=groups.flatMap(group=>fs.readdirSync(`content/${group}`).filter(n=>n.endsWith('.json')).map(n=>({group,file:`content/${group}/${n}`,entry:JSON.parse(fs.readFileSync(`content/${group}/${n}`,'utf8'))})));
const records=allRecords.filter(x=>x.entry.status==='publish');
const routes=new Set(['','blog','category/seo-tools-blog',...records.map(x=>x.entry.slug).filter(Boolean)]);
const href= /href\s*=\s*["']([^"']+)["']/gi;
const image=/https?:\/\/(?:app\.)?seotoolsgroupbuy\.us\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;
const links=new Map();const images=new Set();let referenced=0;
for(const {file,entry} of records){for(const key of ['content','excerpt','shortDescription']){
 const value=String(entry[key]||'');for(const match of value.matchAll(image))images.add(match[0].replace(/&amp;/g,'&'));
 for(const match of value.matchAll(href)){const raw=match[1];if(!raw.startsWith('/')||raw.startsWith('//'))continue;const path=decodeURIComponent(raw.split('?')[0].split('#')[0]).replace(/^\/+|\/+$/g,'');if(!path||routes.has(path)||path.startsWith('assets/')||path.startsWith('media/')||path.startsWith('wp-content/'))continue;
 if(!links.has(path))links.set(path,{path,references:0,sourceFiles:[]});const x=links.get(path);x.references++;if(x.sourceFiles.length<5&&!x.sourceFiles.includes(file))x.sourceFiles.push(file);referenced++;
 }
 }if(entry.featuredImage?.match(image))images.add(entry.featuredImage);}
const attachments=JSON.parse(fs.readFileSync('migration/attachment-manifest.json','utf8')).attachments;
const attachmentUrls=[...new Set(Object.values(attachments).map(x=>x.url).filter(Boolean))];
for(const x of attachmentUrls)if(/^https?:\/\/(?:app\.)?seotoolsgroupbuy\.us\/wp-content\/uploads\//i.test(x))images.add(x);
const mediaRoot='public/media/wp-uploads';
const mediaFiles=fs.existsSync(mediaRoot)?[...fs.readdirSync(mediaRoot,{recursive:true})].filter(x=>fs.statSync(path.join(mediaRoot,x)).isFile()).length:0;
const report={generatedAt:new Date().toISOString(),contentCounts:Object.fromEntries(groups.map(group=>[group,records.filter(x=>x.group===group).length])),excludedUnpublishedCounts:Object.fromEntries(groups.map(group=>[group,allRecords.filter(x=>x.group===group&&x.entry.status!=='publish').length])),existingThemeAssets:fs.readdirSync('public/assets/images').length,mediaFilesDownloaded:mediaFiles,mediaReferenceUrls:[...images].length,attachmentsInManifest:attachmentUrls.length,unmatchedInternalPaths:[...links.values()].sort((a,b)=>b.references-a.references),notes:['Content references and route counts only use published records; media attachment inventory covers the imported asset manifest.','A relative path not present in imported published content may point to a non-imported page, legacy/redirect slug or a taxonomic archive; check individually.','WordPress content export does not include all media bytes. Missing media must be downloaded on a network-enabled computer.','External Buy Now URLs were retained from product metadata and must be tested in the browser before production.']};
fs.writeFileSync('migration/link-and-media-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({content:report.contentCounts,existingThemeAssets:report.existingThemeAssets,mediaFilesDownloaded:mediaFiles,unmatchedInternalPaths:links.size,mediaReferenceUrls:report.mediaReferenceUrls,attachmentsInManifest:report.attachmentsInManifest}));
