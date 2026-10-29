const fs=require('node:fs'), path=require('node:path');
const root=path.resolve(__dirname,'..');const I=require('../vendor/ireal.cjs');
const book=JSON.parse(fs.readFileSync(path.join(root,'data/realbook-titles.json')));
const playlist=I.parsePlaylist(fs.readFileSync(path.join(root,'data/ireal-source.txt'),'utf8')).songs;
const w=require('./wjazzd-source.cjs');const midi=JSON.parse(fs.readFileSync(path.join(__dirname,'miditar-files.json')));
function norm(s){return s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\([^)]*\)/g,'').replace(/[‘’]/g,"'").replace(/^(the|a|an) /i,'').replace(/[^a-z0-9]/gi,'').toLowerCase()}
const songs=new Map();function song(title,realBook=false){let key=norm(title);if(!songs.has(key))songs.set(key,{id:key,title,realBook,sources:[],recordings:[]});if(realBook)songs.get(key).realBook=true;return songs.get(key)}
book.forEach(t=>song(t,true));
for(const s of songs.values()){
 const p=playlist.find(p=>norm(p.title)===s.id);if(!p)continue;s.composer=p.composer;s.key=p.key;s.style=p.style;
 s.chart=I.expandPlayback(p.music).map(({bar})=>({beats:(bar.timeSignature?.beats||4)*4/(bar.timeSignature?.beatUnit||4),section:bar.sectionMarker||'',chords:bar.chords.map(c=>c.symbol)}));
}
for(const file of midi.files){const title=path.basename(file).replace(/\.midi?$/i,'');const s=songs.get(norm(title));if(!s)continue;
 s.sources.push({id:'miditar-'+s.id,label:'Tune arrangement · Miditar',kind:'arrangement',url:'https://raw.githubusercontent.com/santismo/miditar/'+midi.sha+'/'+file.split('/').map(encodeURIComponent).join('/'),sourceUrl:'https://github.com/santismo/miditar',fileName:path.basename(file)});
}
for(const e of w.entries){const s=song(e.title);s.sources.push({id:e.id,label:e.performer+' · solo study',kind:'solo',performer:e.performer,url:'data/solos/wjazzd/'+encodeURIComponent(e.file),sourceUrl:w.sourceUrl,bpm:e.bpm,chart:e.chart.map(b=>({beats:b[0]*4/b[1],section:b[2],chords:b[3].map(c=>c[0]),events:b[3].map(c=>({symbol:c[0],start:c[1],end:c[2]}))}))});if(!s.key)s.key=e.key;}
const guitar=[['Cherokee (Indian Love Song)','cherokee-joe-pass','Joe Pass'],['Nuages','nuages-django','Django Reinhardt'],['Babik','babik-django','Django Reinhardt'],['Chez Jacquet','chez-jacquet-django','Django Reinhardt'],["Django’s Castle",'djangos-castle','Django Reinhardt']];
for(const [title,id,performer] of guitar)song(title).sources.unshift({id,label:performer+' · guitar MIDI',performer,kind:'guitar',url:'data/guitar/'+id+'.mid',sourceUrl:'https://github.com/santismo/Keyer/tree/main/a-z-midi'});
song('Donna Lee').recordings.push({id:'-uCt75_FnRI',label:'Charlie Parker · May 8, 1947 · transcription video',status:'unverified',url:'https://www.youtube.com/watch?v=-uCt75_FnRI'});
song('Cherokee (Indian Love Song)').recordings.push({id:'kprqzdyZfSQ',label:'Joe Pass · Virtuoso · transcription video',status:'unverified',url:'https://www.youtube.com/watch?v=kprqzdyZfSQ'});
song('Nuages').recordings.push({id:'Fq-t9TVbthc',label:'Django Reinhardt · Paris, December 1940',status:'unverified',url:'https://www.youtube.com/watch?v=Fq-t9TVbthc'});
const result={version:1,bookLabel:'The Real Book · Volume I · Sixth Edition · C',bookSource:'https://www.halleonard.com/product/240221/the-real-book-volume-i-sixth-edition',bookCount:book.length,notes:'Publisher online index currently lists 399 titles; cover description says 400. Index coverage is not transcription or recording coverage.',songs:[...songs.values()].sort((a,b)=>a.title.localeCompare(b.title))};
fs.writeFileSync(path.join(root,'data/catalog.json'),JSON.stringify(result));console.log({songs:result.songs.length,book:book.length,withChart:result.songs.filter(s=>s.realBook&&s.chart?.length).length,bookWithMidi:result.songs.filter(s=>s.realBook&&s.sources.length).length,sources:result.songs.reduce((n,s)=>n+s.sources.length,0)});
