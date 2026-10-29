(function(root,factory){const api=factory();if(typeof module==='object')module.exports=api;else root.RealPlayerCore=api})(typeof window==='undefined'?this:window,()=>{
'use strict';
const tuning=[64,59,55,50,45,40];
function validAnchors(points){if(!Array.isArray(points))throw Error('Timing points must be a list.');const p=points.map(a=>({source:Number(a.source),video:Number(a.video)})).sort((a,b)=>a.source-b.source);for(let i=0;i<p.length;i++){if(!Number.isFinite(p[i].source)||!Number.isFinite(p[i].video)||p[i].source<0||p[i].video<0)throw Error('Use positive, finite times.');if(i&&(p[i].source<=p[i-1].source||p[i].video<=p[i-1].video))throw Error('Both MIDI and video times must increase.');}return p}
function mapTime(time,points,inverse=false){const p=validAnchors(points),x=inverse?'video':'source',y=inverse?'source':'video';if(!p.length)return time;if(p.length===1)return time-p[0][x]+p[0][y];let i=0;while(i<p.length-2&&time>p[i+1][x])i++;return p[i][y]+(time-p[i][x])*(p[i+1][y]-p[i][y])/(p[i+1][x]-p[i][x])}
function youtubeId(value){const s=String(value||'').trim();if(/^[\w-]{11}$/.test(s))return s;try{const u=new URL(s);if(!['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(u.hostname))return null;const id=u.hostname==='youtu.be'?u.pathname.slice(1):u.searchParams.get('v')||u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];return /^[\w-]{11}$/.test(id||'')?id:null}catch{return null}}
function positions(midi,maxFret=22){return tuning.flatMap((open,string)=>{let pitch=midi,octave=0;if(pitch<40){while(pitch<40){pitch+=12;octave++}}if(pitch>86){while(pitch>86){pitch-=12;octave--}}const fret=pitch-open;return fret>=0&&fret<=maxFret?[{string,fret,midi:pitch,octave}]:[]})}
function fingerNotes(notes,position=5){let last=position;const used=new Set();let time=-1;return notes.slice().sort((a,b)=>a.time-b.time||b.midi-a.midi).map(n=>{if(Math.abs(n.time-time)>.015){used.clear();time=n.time}const options=positions(n.midi).filter(p=>!used.has(p.string)).sort((a,b)=>(Math.abs(a.fret-last)*1.4+Math.abs(a.fret-position)*.7+a.string*.12)-(Math.abs(b.fret-last)*1.4+Math.abs(b.fret-position)*.7+b.string*.12));const documented=Number.isInteger(n.string)&&Number.isInteger(n.fret)&&n.string>=0&&n.string<6&&n.fret>=0&&n.fret<=22&&tuning[n.string]+n.fret===n.midi&&!used.has(n.string);const p=documented?{string:n.string,fret:n.fret,midi:n.midi,octave:0,sourceFingering:true}:options[0];if(!p)return {...n,unmapped:true};used.add(p.string);last=p.fret;return {...n,...p,originalMidi:n.midi}})}
// Engraving space grows for dense note columns; time remains independent of pixels.
function tabLayout(notes,bars,chords,duration,pixelsPerSecond){
 const groups=new Map();
 function point(time,width=0){if(!Number.isFinite(time))return;groups.set(time,Math.max(width,groups.get(time)||0));}
 point(0);point(duration);
 notes.filter(n=>!n.unmapped).forEach(n=>point(n.time,Math.max(20,String(n.fret).length*8+8)));
 bars.forEach(b=>point(b.time));chords.forEach(c=>point(c.time));
 const points=[...groups].sort((a,b)=>a[0]-b[0]).map(([time,width])=>({time,width,x:0}));
 let previousNote=null,previousChord=null;const chordWidths=new Map(chords.map(c=>[c.time,String(c.text).length*10+16]));
 for(let i=0;i<points.length;i++){
  const p=points[i];if(i)p.x=points[i-1].x+(p.time-points[i-1].time)*pixelsPerSecond;
  if(p.width&&previousNote)p.x=Math.max(p.x,previousNote.x+(previousNote.width+p.width)/2+6);
  if(chordWidths.has(p.time)&&previousChord)p.x=Math.max(p.x,previousChord.x+previousChord.width);
  if(p.width)previousNote=p;
  if(chordWidths.has(p.time))previousChord={x:p.x,width:chordWidths.get(p.time)};
 }
 function interpolate(value,key,target){
  if(points.length<2)return value*(key==='time'?pixelsPerSecond:1/pixelsPerSecond);
  let lo=0,hi=points.length-1;while(lo+1<hi){const mid=(lo+hi)>>1;if(points[mid][key]<=value)lo=mid;else hi=mid;}
  const a=points[lo],b=points[hi];return a[target]+(value-a[key])*(b[target]-a[target])/(b[key]-a[key]);
 }
 return {points,xAt:time=>interpolate(time,'time','x'),timeAt:x=>interpolate(x,'x','time')};
}
function preferredSource(song,requestedId){
 const sources=song.sources||[],records=song.recordings||[];
 const matched=s=>records.some(r=>r.sourceId===s.id&&r.status==='source-aligned');
 return sources.find(s=>s.id===requestedId)||sources.find(s=>s.hasHead&&matched(s)&&!s.automaticNotes)||sources.find(s=>s.hasHead&&matched(s))||sources.find(s=>matched(s)&&!s.automaticNotes)||sources.find(matched)||sources.find(s=>records.some(r=>r.sourceId===s.id&&r.status==='estimated'))||sources.find(s=>s.hasHead)||sources[0];
}
// Reference listening and transcription timing are independent decisions.
function referenceRecording(song){const r=song?.referenceRecording;return r&&youtubeId(r.videoId)?{...r,id:r.videoId,label:r.artist+' · '+r.album+' · recommended reference',reference:true,status:'reference'}:null;}
function artistRecordings(song){
 const grouped=new Map();
 for(const entry of song?.artistRecordings||[]){
  const r=entry.recording;if(!r||!youtubeId(r.videoId))continue;
  if(grouped.has(r.videoId)){grouped.get(r.videoId).associatedSourceIds.push(entry.associatedSourceId);continue;}
  grouped.set(r.videoId,{id:r.videoId,videoId:r.videoId,label:r.label,artist:r.artist,album:r.album,reason:entry.reason,evidence:entry.evidence,associatedSourceIds:[entry.associatedSourceId],reference:true,referenceKind:'artist',status:'reference',headStart:null,verification:{head:'listening-pending'},catalogIdentityNote:'Related artist performance. Its identity and timing have not been verified against this particular transcription.'});
 }
 return [...grouped.values()];
}
function partInCollection(source,filter){
 const artist=source.performer||source.attributedArtist||'';
 if(filter==='joe')return /Joe Pass/i.test(artist);
 if(filter==='django')return /Django/i.test(artist);
 if(filter==='miditar'||filter==='keyer')return (source.collections||[]).some(c=>c.toLowerCase()===filter);
 if(filter==='guitar')return source.instrument==='guitar'||source.kind==='guitar'||/Joe Pass|Django/i.test(artist);
 return false;
}
function preferredRecording(song,requestedSourceId){
 const reference=referenceRecording(song);
 if(!requestedSourceId&&reference)return reference;
 const source=preferredSource(song,requestedSourceId);
 return (song.recordings||[]).find(r=>r.sourceId===source?.id&&['source-aligned','estimated'].includes(r.status))||artistRecordings(song).find(r=>r.associatedSourceIds.includes(source?.id))||(source?.attributionRole==='composer'?reference:null)||null;
}
function preferredPracticeSource(song,requestedSourceId){
 if(!requestedSourceId&&referenceRecording(song)){
  const heads=(song.sources||[]).filter(s=>s.hasHead);
  if(heads.length)return preferredSource({...song,sources:heads.filter(s=>!s.automaticNotes).length?heads.filter(s=>!s.automaticNotes):heads});
 }
 return preferredSource(song,requestedSourceId);
}
function recordingStart(recording,performance,anchors){
 if(recording?.reference)return Number.isFinite(recording.headStart)?Math.max(0,recording.headStart):0;
 return Math.max(0,mapTime(Math.max(0,(performance?.headStart??performance?.notes[0]?.time??0)-.8),anchors));
}
function headStatus(song){return (song.sources||[]).some(s=>s.hasHead&&s.performanceUrl&&!s.automaticNotes)?'Head + matched recording':(song.sources||[]).some(s=>s.hasHead&&s.performanceUrl)?'Head + recording · auto notes':(song.sources||[]).some(s=>s.hasHead)?'Head · MIDI study':song.realBook?'Head pending':(song.sources||[]).some(s=>s.kind==='guitar')?'Guitar tab study':(song.sources||[]).length?'Solo / instrument study':'Notes pending';}
function activeNotes(notes,time){return notes.filter(n=>n.time<=time&&n.time+n.duration>time)}
function chordEvents(chart,bpm=120){let beat=0;const events=[];for(let bar=0;bar<(chart||[]).length;bar++){const b=chart[bar];let list=b.events||b.chords.map((symbol,i)=>({symbol,start:i*b.beats/b.chords.length,end:(i+1)*b.beats/b.chords.length}));for(const e of list)events.push({text:e.symbol,time:(beat+e.start)*60/bpm,duration:(e.end-e.start)*60/bpm,bar:bar+1,section:b.section});beat+=b.beats;}return {events,duration:beat*60/bpm}}
function loopTarget(time,a,b,enabled){return enabled&&Number.isFinite(a)&&Number.isFinite(b)&&b>a&&time>=b?a:null}
function randomSong(filteredSongs,currentId,random=Math.random){const playable=filteredSongs.filter(s=>s.sources?.length),others=playable.filter(s=>s.id!==currentId),pool=others.length?others:playable;return pool.length?pool[Math.floor(random()*pool.length)]:undefined}
return {referenceRecording,artistRecordings,partInCollection,preferredRecording,preferredPracticeSource,recordingStart,tabLayout,preferredSource,headStatus,tuning,validAnchors,mapTime,youtubeId,positions,fingerNotes,activeNotes,chordEvents,loopTarget,randomSong};
});
