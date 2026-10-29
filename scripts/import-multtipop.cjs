const fs=require('fs'),path=require('path'),M=require('../vendor/midi.js'),c=require('../data/catalog.json'),rows=JSON.parse(fs.readFileSync(process.argv[2])),availability=JSON.parse(fs.readFileSync(process.argv[3]));
const provider='MulTTiPop · Pruyne and contributors',audit=[];fs.mkdirSync('data/multtipop',{recursive:true});
for(const r of rows){
 if(!availability[r.youtubeId]?.available)continue;
 const song=c.songs.find(s=>s.id===r.catalogSongId);if(!song)throw Error(r.catalogSongId);
 const id=r.id,url='data/multtipop/'+id+'.mid',performanceUrl='data/performance/'+id+'.json';if(path.resolve(r.midiFile)!==path.resolve(url))fs.copyFileSync(r.midiFile,url);
 const m=M.parseMidi(fs.readFileSync(url)),track=m.tracks.find(t=>t.index===r.selectedTrackIndex);if(!track?.notes.length)throw Error('Missing selected excerpt part');
 const notes=track.notes.map((n,i)=>({id:i,time:n.time,duration:Math.min(n.duration,r.duration-n.time),midi:n.midi,velocity:n.velocity})).filter(n=>n.duration>0),p={sourceId:id,provider,duration:r.duration,notes,bars:[],chords:[],timelineUnit:'seconds',arrangementExcerpt:true,section:r.section,sourceUrl:r.sourceUrl,timingMethod:r.midiTiming,limitation:r.limitation};
 fs.writeFileSync(performanceUrl,JSON.stringify(p));song.sources=song.sources.filter(s=>s.id!==id);song.recordings=song.recordings.filter(s=>s.sourceId!==id);
 song.sources.push({id,label:r.artist+' · '+r.section+' · '+r.selectedPart+' · excerpt',kind:'excerpt',hasHead:false,arrangementExcerpt:true,preferredTrackIndex:r.selectedTrackIndex,performer:r.artist,url,performanceUrl,provider,sourceUrl:r.sourceUrl,alignmentStatus:'source-aligned'});
 song.recordings.push({id:r.youtubeId,sourceId:id,label:r.artist+' · '+r.section+' · '+r.start.toFixed(1)+'–'+r.end.toFixed(1)+'s excerpt',provider,status:'source-aligned',excerpt:true,offset:r.start,end:r.end,sourceUrl:r.sourceUrl,availabilityChecked:true,alignmentMethod:r.midiTiming,limitation:r.limitation});
 audit.push({...r,midiFile:url,performanceFile:performanceUrl});
}
c.multtipopCoverage={parts:audit.length,recordings:audit.length,tunes:new Set(audit.map(x=>x.catalogSongId)).size,excerptOnly:true};fs.writeFileSync('data/catalog.json',JSON.stringify(c));fs.writeFileSync('data/multtipop/audit.json',JSON.stringify(audit,null,2));fs.writeFileSync('data/multtipop/ATTRIBUTION.txt','MulTTiPop: '+rows[0].attribution+'\nLicense: Creative Commons Attribution 4.0 (https://creativecommons.org/licenses/by/4.0/).\n'+rows[0].sourceUrl+'\nShort aligned Lakh arrangements; not complete or exact performer transcriptions.\n');console.log(c.multtipopCoverage);
