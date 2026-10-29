const fs=require('fs'),path=require('path'),M=require('../vendor/midi.js'),c=require('../data/catalog.json');
const rows=JSON.parse(fs.readFileSync(process.argv[2]));
for(const r of rows){
 let song=c.songs.find(s=>s.id===r.songId);
 if(!song){song={id:r.songId,title:r.title==='Shawnuff'?'Shaw Nuff':r.title,composer:r.performer,realBook:false,sources:[],recordings:[]};c.songs.push(song);}
 const id=r.id,url='data/heads/'+id+'.mid';fs.copyFileSync(r.midiFile,url);
 const midi=M.parseMidi(fs.readFileSync(url)),track=M.chooseMelodyTrack(midi);
 if(!track?.notes.length)throw Error('Empty '+id);
 song.sources=song.sources.filter(s=>s.id!==id);
 song.sources.push({id,label:r.label,kind:r.hasHead?'head-study':'guitar',hasHead:r.hasHead,headTrackIndex:track.index,url,performer:r.performer,provider:r.provider,sourceUrl:r.sourceUrl,alignmentStatus:'recording-pending',conversionNote:r.timing});
 const bundledSource='data/heads/attribution/'+id+path.extname(r.sourceFile);fs.copyFileSync(r.sourceFile,bundledSource);
 const provenance={...r,bundledSource};for(const k of ['midiFile','sourceFile','licenseFile','metadataFile'])delete provenance[k];
 fs.writeFileSync('data/heads/attribution/'+id+'.json',JSON.stringify(provenance,null,2));
 if(r.licenseFile)fs.copyFileSync(r.licenseFile,'data/heads/attribution/'+id+'-LICENSE.txt');
}
c.songs.sort((a,b)=>a.title.localeCompare(b.title));
c.extraScoreCoverage={parkerParts:4,christianParts:1};
fs.writeFileSync('data/catalog.json',JSON.stringify(c));console.log('Imported additional scores:',rows.length);
