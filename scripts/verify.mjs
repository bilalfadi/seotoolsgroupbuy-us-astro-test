import fs from 'node:fs';
const groups=['products','posts','pages'];let count=0;const slugs=new Map();let failed=false;
for(const group of groups){for(const filename of fs.readdirSync('content/'+group).filter(f=>f.endsWith('.json'))){const obj=JSON.parse(fs.readFileSync('content/'+group+'/'+filename,'utf8'));count++;if(filename!==obj.slug+'.json')throw new Error('Filename mismatch '+filename);if(!obj.title||!obj.slug)throw new Error('Missing title or slug '+filename);if(slugs.has(obj.slug))throw new Error('Duplicate URL slug '+obj.slug);slugs.set(obj.slug,group);}}
console.log('PASS:',count,'JSON content entries;',groups.map(x=>x+': '+fs.readdirSync('content/'+x).length).join(', '));
