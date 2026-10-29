// Inputs: reviewed title mappings, downloaded original MIDIs, exact-upload oEmbed audit.
const fs=require('fs'),path=require('path'),M=require('../vendor/midi.js'),C=require('../core.js'),{upperLine}=require('./upper-line.cjs'),{performanceMidi}=require('./write-performance-midi.cjs');
const base=path.resolve(process.argv[2]||'scripts/pijama-inputs'),c=require('../data/catalog.json'),rows=JSON.parse(fs.readFileSync(path.join(base,'pijama-reviewed-matches.json'))),availability=JSON.parse(fs.readFileSync(path.join(base,'pijama-availability.json'))),provider='PiJAMA · Edwards & Dixon',sourceUrl='https://almostimplemented.github.io/PiJAMA/';
for(const d of ['data/pijama/original','data/performance'])fs.mkdirSync(d,{recursive:true});
const originalInput=r=>fs.existsSync(path.join(base,'original',r.id+'.mid'))?path.join(base,'original',r.id+'.mid'):path.resolve('data/pijama/original/'+r.id+'.mid');
const grouped=new Map(),audit=[],imported=new Set();let pairs=0;
for(const r of rows){if(!grouped.has(r.targetSongId))grouped.set(r.targetSongId,[]);grouped.get(r.targetSongId).push(r);}
for(const [songId,entries] of grouped){
 const song=c.songs.find(s=>s.id===songId);if(!song)throw Error(songId);
 song.sources=song.sources.filter(s=>!s.id.startsWith('pijama-'));song.recordings=song.recordings.filter(r=>r.provider!==provider);
 const chosen=[],artists=new Set();
 const candidates=entries.filter(r=>availability[C.youtubeId(r.youtube_url)]?.available&&fs.existsSync(originalInput(r))).sort((a,b)=>Number(b.agreement)-Number(a.agreement));
 for(const diverse of [true,false])for(const r of candidates){if(chosen.length>=3||chosen.some(x=>x.id===r.id)||diverse&&artists.has(r.artist))continue;chosen.push(r);artists.add(r.artist);}
 for(const r of chosen){
  const id='pijama-'+r.id,original='data/pijama/original/'+r.id+'.mid',url='data/pijama/'+r.id+'.mid',performanceUrl='data/performance/'+id+'.json',videoId=C.youtubeId(r.youtube_url);
  if(path.resolve(originalInput(r))!==path.resolve(original))fs.copyFileSync(originalInput(r),original);
  const midi=M.parseMidi(fs.readFileSync(original)),track=M.chooseMelodyTrack(midi),raw=track.notes.map((n,i)=>({id:i,time:n.time,duration:n.duration,midi:n.midi,velocity:n.velocity}));
  if(midi.duration>Number(r.duration_sec)+2){audit.push({id,songId,status:'excluded',reason:'MIDI exceeds published media duration'});continue;}
  const notes=upperLine(raw);if(notes.length<30){audit.push({id,songId,status:'excluded',reason:'Insufficient upper-line events'});continue;}
  const duration=Math.max(Number(r.duration_sec),midi.duration),p={sourceId:id,provider,duration,notes,bars:[],chords:[],automaticNotes:true,timelineUnit:'seconds',sourceUrl,transcriptionMethod:'Published Onsets and Frames automatic piano transcription of this exact YouTube upload. Highest active attack reduction for guitar; not a verified melody or artist fingering.',datasetAgreement:Number(r.agreement),originalMidi:original,originalNoteCount:raw.length};
  fs.writeFileSync(url,performanceMidi(notes));fs.writeFileSync(performanceUrl,JSON.stringify(p));
  song.sources.push({id,label:r.artist+' · piano upper line · auto notes',kind:'piano-study',hasHead:false,automaticNotes:true,performer:r.artist,album:r.album,provider,sourceUrl,url,performanceUrl,originalMidi:original,generatedFromPerformance:true,alignmentStatus:'source-aligned',datasetAgreement:Number(r.agreement),reduction:'Upper-line estimate from polyphonic piano; melody identity is not verified.'});
  song.recordings.push({id:videoId,sourceId:id,label:r.artist+' · '+r.album+' · auto notes',status:'source-aligned',automaticNotes:true,provider,offset:0,end:duration,availabilityChecked:true,checkedAt:availability[videoId].checkedAt,sourceUrl,alignmentMethod:'The source dataset downloaded and transcribed this exact upload in full, without cropping. Source timing is retained; automatic note accuracy is unverified.'});
  audit.push({id,songId,title:song.title,artist:r.artist,album:r.album,videoId,agreement:Number(r.agreement),matchReason:r.matchReason,status:'source-aligned-auto-notes',originalMidi:original,upperLineNotes:notes.length});imported.add(id);pairs++;
 }
}
c.pijamaCoverage={parts:imported.size,recordings:pairs,tunes:new Set(audit.filter(x=>x.videoId).map(x=>x.songId)).size,automaticNotes:true};fs.writeFileSync('data/catalog.json',JSON.stringify(c));fs.writeFileSync('data/pijama/audit.json',JSON.stringify(audit,null,2));console.log(c.pijamaCoverage);
