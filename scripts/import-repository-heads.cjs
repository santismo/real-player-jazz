// Files are copied from a verified, pinned checkout/download of the user's repositories.
// Usage: node scripts/import-repository-heads.cjs /absolute/path/to/heads-source
const fs=require('fs'),path=require('path'),M=require('../vendor/midi.js');
const rows=require('./repository-heads.json'),c=require('../data/catalog.json'),input=process.argv[2];
if(!input)throw Error('Supply the downloaded repository root');
for(const r of rows){const song=c.songs.find(s=>s.id===r.id);if(!song)throw Error(r.id);const bytes=fs.readFileSync(path.join(input,r.repo,r.path)),m=M.parseMidi(bytes,r.title),track=m.tracks.find(t=>t.index===r.headTrackIndex);if(!track?.notes.length||!/melody/i.test(track.name))throw Error('No explicit melody: '+r.id);
 const id='repo-head-'+r.id,url='data/heads/'+id+'.mid';fs.writeFileSync(url,bytes);
 song.sources=song.sources.filter(s=>s.id!==id);song.sources.push({id,label:'Head / melody · '+r.repo+' MIDI study',kind:'arrangement',hasHead:true,headTrackIndex:track.index,url,provider:r.repo+' MIDI collection',sourceUrl:'https://github.com/santismo/'+r.repo+'/blob/'+r.sha+'/'+r.path.split('/').map(encodeURIComponent).join('/'),provenance:{repository:'santismo/'+r.repo,revision:r.sha,path:r.path},alignmentStatus:'recording-pending'});
}
c.repositoryHeadCoverage={parts:rows.length};fs.writeFileSync('data/catalog.json',JSON.stringify(c));console.log('Imported '+rows.length+' repository melody studies.');
