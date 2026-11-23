import homeEditor from '../../content/home-editor.json';

const escapeHtml = value => String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

// Source offsets identify exact original elements, even with repeated labels.
// With no CMS edits the original 119k HTML snapshot is returned byte-for-byte.
export function applyHomeEditor(markup) {
  const changes=[];
  for(const section of homeEditor.sections||[]) for(const item of section.items||[]) {
    if(item.text===item.originalText && item.url===item.originalUrl)continue;
    const offset=Number(item.offset),source=String(item.source||'');
    if(markup.slice(offset,offset+source.length)!==source)
      throw new Error('Homepage source changed: remap CMS text field '+section.name+' / '+item.originalText);
    const m=source.match(/^(<[^>]+>)([\s\S]*)(<\/[^>]+>)$/);
    if(!m)throw new Error('Cannot apply homepage edit at offset '+offset);
    let opening=m[1],body=m[2];
    if(item.url!==item.originalUrl){
      if(!/\bhref="[^"]*"/.test(opening))throw new Error('Link field has no href at '+offset);
      opening=opening.replace(/\bhref="[^"]*"/,'href="'+escapeHtml(item.url)+'"');
    }
    if(item.text!==item.originalText) body=escapeHtml(item.text);
    changes.push({offset,length:source.length,html:opening+body+m[3]});
  }
  for(const change of changes.sort((a,b)=>b.offset-a.offset))
    markup=markup.slice(0,change.offset)+change.html+markup.slice(change.offset+change.length);
  return markup;
}
