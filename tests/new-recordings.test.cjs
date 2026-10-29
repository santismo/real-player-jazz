const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),M=require('../vendor/midi.js'),C=require('../core.js'),catalog=require('../data/catalog.json'),{upperLine}=require('../scripts/upper-line.cjs');
test('upper-line reduction retains original attacks and does not resume held bass as a new note',()=>{
 const notes=[{time:0,duration:2,midi:48},{time:0,duration:.4,midi:72},{time:.5,duration:.4,midi:74},{time:1,duration:.4,midi:71}];
 assert.deepEqual(upperLine(notes).map(n=>[n.time,n.midi]),[[0,72],[.5,74],[1,71]]);
});
test('automatic YouTube guitar reductions retain source notes and exact upload provenance',()=>{
 const audit=require('../data/pijama/audit.json'),done=new Set();
 for(const song of catalog.songs)for(const source of song.sources.filter(s=>s.id.startsWith('pijama-'))){
  assert.equal(source.automaticNotes,true);assert.equal(source.hasHead,false);
  const recording=song.recordings.find(r=>r.sourceId===source.id);assert.equal(recording.automaticNotes,true);assert.equal(recording.offset,0);assert.ok(recording.availabilityChecked);
  const row=audit.find(a=>a.id===source.id&&(a.songId===song.id||a.songId===source.catalogOrigin));assert.equal(recording.id,row.videoId);assert.ok(row.agreement>=.85);
  if(done.has(source.id))continue;done.add(source.id);
  const original=M.chooseMelodyTrack(M.parseMidi(fs.readFileSync(source.originalMidi))).notes,p=JSON.parse(fs.readFileSync(source.performanceUrl));
  const attacks=new Set(original.map(n=>n.midi+':'+n.time.toFixed(6)));
  for(const n of p.notes)assert.ok(attacks.has(n.midi+':'+n.time.toFixed(6)),source.id+' attack must exist in original piano MIDI');
  assert.equal(p.timelineUnit,'seconds');assert.deepEqual(p.chords,[]);assert.deepEqual(p.bars,[]);
 }
 assert.equal(done.size,catalog.pijamaCoverage.parts);
});
test('JazzSAMBA heads use matching original audio and annotated head regions',()=>{
 const audit=require('../data/jazzsamba/audit.json');
 for(const a of audit){const song=catalog.songs.find(s=>s.id===a.songId),source=song.sources.find(s=>s.id===a.sourceId),p=JSON.parse(fs.readFileSync(source.performanceUrl)),r=song.recordings.find(r=>r.sourceId===a.sourceId);
  assert.equal(source.automaticNotes,true);assert.equal(source.hasHead,true);assert.equal(r.mediaType,'audio');assert.equal(r.audioUrl,a.audioUrl);assert.equal(a.referenceYoutubeIsMatchingMedia,false);
  assert.ok(p.headEnd>p.headStart);assert.ok(p.notes.some(n=>n.time>=p.headStart&&n.time<p.headEnd));assert.ok(p.bars.length&&p.chords.length);
 }
});
test('same-title compositions stay separate and catalog aliases reuse only timed sources',()=>{
 const peace=catalog.songs.find(s=>s.id==='peace'),ornette=catalog.songs.find(s=>s.id==='peaceornettecoleman');assert.ok(!peace.sources.some(s=>s.id==='wjazzd-339'));assert.ok(ornette.sources.some(s=>s.id==='wjazzd-339'));
 for(const song of catalog.songs)for(const r of song.recordings.filter(r=>r.catalogOrigin)){const origin=catalog.songs.find(s=>s.id===r.catalogOrigin),original=origin.recordings.find(x=>x.id===r.id&&x.sourceId===r.sourceId);assert.ok(original);assert.deepEqual(r.timingAnchors,original.timingAnchors);assert.equal(r.offset,original.offset);assert.ok(song.sources.find(s=>s.id===r.sourceId)?.performanceUrl);}
});
test('excerpt loops cover only the declared aligned passage and use its original upload offset',()=>{
 const rows=require('../data/multtipop/audit.json');
 for(const a of rows){const song=catalog.songs.find(s=>s.id===a.catalogSongId),source=song.sources.find(s=>s.id===a.id),p=JSON.parse(fs.readFileSync(source.performanceUrl)),r=song.recordings.find(r=>r.sourceId===a.id);
  assert.equal(source.hasHead,false);assert.equal(source.arrangementExcerpt,true);assert.equal(r.excerpt,true);assert.equal(r.offset,a.start);assert.equal(r.end,a.end);assert.equal(r.id,a.youtubeId);
  assert.ok(Math.abs(p.duration-(a.end-a.start))<1e-8);
  for(const n of p.notes){const start=C.mapTime(n.time,[{source:0,video:r.offset}]);assert.ok(start>=r.offset&&start+n.duration<=r.end+.0001);}
 }
});
test('GAPS measure labels exclude within-bar refinement syncpoints',()=>{
 for(const row of require('../scripts/gaps-selected.json')){const sync=JSON.parse(fs.readFileSync('data/gaps/'+row.id+'.json')),p=JSON.parse(fs.readFileSync('data/performance/gaps-'+row.id+'.json')),starts=sync.filter(x=>x.length===2||x.slice(2).every(n=>n===0));
  assert.equal(p.bars.length,starts.length-1);
  p.bars.forEach((bar,i)=>{assert.equal(bar.time,starts[i][1]);assert.equal(bar.index,starts[i][0]+1);});
 }
});
test('PIAST uses the published melody and video origin, with explicit approximate-timing labels',()=>{
 const rows=require('../data/piast/audit.json');
 for(const a of rows){
  const song=catalog.songs.find(s=>s.id===a.songId),source=song.sources.find(s=>s.id===a.sourceId),p=JSON.parse(fs.readFileSync(source.performanceUrl)),r=song.recordings.find(r=>r.sourceId===a.sourceId);
  assert.equal(r.id,a.youtubeId);assert.equal(r.offset,a.sourceVideoStart);assert.equal(r.end,a.videoMetadata.duration);
  assert.ok(source.automaticNotes&&source.approximateTiming&&p.automaticChords&&p.automaticBars);
  assert.equal(source.hasHead,false);assert.ok(a.videoMetadata.embeddable);
  const original=M.parseMidi(fs.readFileSync(source.originalMidi)),track=original.tracks.find(t=>t.index===a.selectedOriginalTrackIndex);
  assert.equal(track.name.toLowerCase(),'melody');
  const originalNotes=track.notes.filter(n=>n.time<p.duration);
  assert.deepEqual(p.notes.map(n=>n.midi),originalNotes.map(n=>n.midi));
  for(let i=0;i<p.notes.length;i++){
   assert.ok(Math.abs(p.notes[i].time-originalNotes[i].time)<.000001,a.sourceId+' original onset');
   assert.ok(p.notes[i].time+p.notes[i].duration+r.offset<=r.end+.000001);
  }
 }
 assert.equal(new Set(rows.map(r=>r.sourceId)).size,catalog.piastCoverage.parts);
});
