// Import every unique playable MIDI from pinned repository snapshots.
// Usage: node scripts/import-all-repository-midi.cjs /absolute/download-root
const fs=require('fs'),path=require('path'),crypto=require('crypto'),M=require('../vendor/midi.js');
const base=process.argv[2];if(!base)throw Error('Downloaded snapshot root required');
const c=require('../data/catalog.json'),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const norm=s=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\([^)]*\)/g,'').replace(/[‘’]/g,"'").replace(/^(the|a|an) /i,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
const byHash=new Map(),byTitle=new Map(c.songs.map(s=>[norm(s.title),s]));
for(const song of c.songs)for(const src of song.sources){if(fs.existsSync(decodeURIComponent(src.url)))byHash.set(hash(fs.readFileSync(decodeURIComponent(src.url))),{song,src});}
const manifest=require('./repository-midi-inventory.json');const audit=[];let added=0,duplicates=0,failed=0;
fs.mkdirSync('data/repository-midi',{recursive:true});
for(const r of manifest){const origin={repository:'santismo/'+r.repo,revision:r.revision,path:r.path};
 try{const bytes=fs.readFileSync(path.join(base,r.repo,r.path)),digest=hash(bytes);let existing=byHash.get(digest);
 if(existing){existing.src.repositoryOrigins??=[];if(!existing.src.repositoryOrigins.some(o=>o.repository===origin.repository&&o.path===origin.path))existing.src.repositoryOrigins.push(origin);audit.push({...origin,status:'duplicate-content',songId:existing.song.id,sourceId:existing.src.id});duplicates++;continue;}
 const m=M.parseMidi(bytes,path.basename(r.path));const pitched=m.tracks.filter(t=>t.notes.length&&!(t.channels.length===1&&t.channels[0]===10));if(!pitched.length||!m.duration)throw Error('No playable pitched notes');
 const fileTitle=path.basename(r.path).replace(/\.midi?$/i,''),rawTitle=(m.title||fileTitle).trim();let title=rawTitle;
 const candidates=[rawTitle,fileTitle,fileTitle.replace(/ - Arrangement \d+$/i,''),rawTitle.split(/\s+-\s+/)[0],fileTitle.split(/\s+-\s+/)[0]];
 let song=candidates.map(t=>byTitle.get(norm(t))).find(Boolean);
 if(!song){title=rawTitle.replace(/ - Arrangement \d+$/i,'');let id=norm(title)||'repository-'+digest.slice(0,12);if(c.songs.some(s=>s.id===id))id+='-'+digest.slice(0,6);song={id,title,realBook:false,sources:[],recordings:[]};c.songs.push(song);byTitle.set(norm(title),song);}
 const melody=pitched.find(t=>/melody/i.test(t.name)&&t.notes.length>10),solo=/solo|jazz-solo-midi/i.test(r.path+' '+rawTitle),hasHead=!!melody&&!solo;
 const id='repository-'+digest.slice(0,16),url='data/repository-midi/'+digest.slice(0,24)+'.mid';fs.writeFileSync(url,bytes);
 const src={id,label:(hasHead?'Head / melody':solo?'Solo study':'Instrument / backing study')+' · '+r.repo+' · '+fileTitle,kind:hasHead?'arrangement':solo?'solo':'backing',hasHead,url,fileName:path.basename(r.path),provider:r.repo+' MIDI collection',sourceUrl:'https://github.com/santismo/'+r.repo+'/blob/'+r.revision+'/'+r.path.split('/').map(encodeURIComponent).join('/'),provenance:origin,repositoryOrigins:[origin],alignmentStatus:'recording-pending'};
 if(melody)src.headTrackIndex=melody.index;
 song.sources.push(src);byHash.set(digest,{song,src});audit.push({...origin,status:'imported',songId:song.id,sourceId:id,hasHead});added++;
 }catch(e){failed++;audit.push({...origin,status:'unavailable',reason:e.message});}
}
c.repositoryMidiCoverage={files:manifest.length,added,duplicates,unavailable:failed,revisions:Object.fromEntries(manifest.map(r=>[r.repo,r.revision]))};
fs.writeFileSync('data/catalog.json',JSON.stringify(c));fs.writeFileSync('data/repository-import-audit.json',JSON.stringify(audit));console.log(c.repositoryMidiCoverage);
