const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),C=require('../core.js'),M=require('../vendor/midi.js');
const root=path.resolve(__dirname,'..'),catalog=require('../data/catalog.json');
test('performance annotations retain MIDI pitches and chronological playable events',()=>{
 let count=0;
 for(const song of catalog.songs)for(const source of song.sources){
  if(!source.performanceUrl)continue;
  const p=JSON.parse(fs.readFileSync(path.join(root,source.performanceUrl)));
  assert.equal(p.sourceId,source.id);
  const midi=M.parseMidi(fs.readFileSync(path.join(root,decodeURIComponent(source.url))),source.id);
  const track=midi.tracks.find(t=>t.index===source.preferredTrackIndex)||M.chooseMelodyTrack(midi);
  assert.deepEqual(p.notes.map(n=>n.midi),track.notes.map(n=>n.midi),source.id+' pitch sequence');
  if(source.generatedFromPerformance)for(let i=0;i<p.notes.length;i++){
   assert.ok(Math.abs(p.notes[i].time-track.notes[i].time)<=.000026,source.id+' generated onset');
   assert.ok(Math.abs(p.notes[i].duration-(M.midiTicksToSeconds(midi,track.notes[i].endTick)-M.midiTicksToSeconds(midi,track.notes[i].tick)))<=.000051,source.id+' generated duration');
  }
  p.notes.forEach((n,i)=>{assert.ok(n.duration>0&&n.time>=0,source.id);if(i)assert.ok(n.time>=p.notes[i-1].time,source.id);assert.ok(n.time+n.duration<=p.duration+.000002,source.id)});
  for(const bar of p.bars)assert.ok(bar.end>bar.time,source.id+' bar');
  for(const chord of p.chords)assert.ok(chord.duration>0,source.id+' chord');
  count++;
 }
 assert.ok(count>300);console.log('Validated '+count+' performance timelines.');
});
test('every offered published recording selects its own timed source and has a valid offset',()=>{
 let count=0;
 for(const song of catalog.songs)for(const r of song.recordings||[]){
  if(r.status!=='source-aligned')continue;
  const source=song.sources.find(s=>s.id===r.sourceId);
  assert.ok(source?.performanceUrl,r.id);if(r.mediaType!=='audio')assert.equal(C.youtubeId(r.id),r.id);
  assert.ok(r.availabilityChecked,r.id);assert.ok(r.end>r.offset&&r.offset>=0,r.id);
  const p=JSON.parse(fs.readFileSync(path.join(root,source.performanceUrl)));
  const anchor=C.validAnchors(r.timingAnchors||[{source:0,video:r.offset}]);
  for(const n of [p.notes[0],p.notes.at(-1)])assert.ok(Math.abs(C.mapTime(C.mapTime(n.time,anchor),anchor,true)-n.time)<1e-8);
  count++;
 }
 assert.equal(count,catalog.recordingCoverage.recordings+(catalog.guitarAudioCoverage?.parts||0)+(catalog.parkerCoverage?.parts||0)+(catalog.headVideoCoverage?.recordings||0)+(catalog.gapsCoverage?.recordings||0)+(catalog.catalogMatchCoverage?.recordings||0)+(catalog.pijamaCoverage?.recordings||0)+(catalog.jazzsambaCoverage?.recordings||0)+(catalog.multtipopCoverage?.recordings||0)+(catalog.piastCoverage?.recordings||0));
});
test('Parker head video timings preserve the matched performance regression and full opening',()=>{
 let count=0;const tunes=new Set();
 for(const song of catalog.songs)for(const r of song.recordings||[]){
  if(r.provider!=='Omnibook / JazzTube cross-alignment')continue;
  const e=r.alignmentEvidence,source=song.sources.find(s=>s.id===r.sourceId),p=JSON.parse(fs.readFileSync(source.performanceUrl));
  assert.ok(source.hasHead&&e.matchingNotes>=40&&e.coverage>=.65&&e.longestPitchRun>=10&&e.matchedSpanSeconds>=25&&e.p95ResidualSeconds<.12);
  assert.equal(e.independentlyAudioVerified,false);
  const original=song.recordings.find(x=>x.id===r.id&&x.sourceId===e.referenceSourceId);
  assert.ok(original,'Must inherit the same exact YouTube upload');
  const anchors=C.validAnchors(r.timingAnchors);assert.equal(anchors.length,2);
  for(const n of p.notes){
   const video=C.mapTime(n.time,anchors);assert.ok(video>=0,'Opening head must exist in upload');
   assert.ok(Math.abs(video-(n.time*e.scale+e.intercept))<1e-8);
   assert.ok(Math.abs(C.mapTime(video,anchors,true)-n.time)<1e-8);
  }
  assert.ok(Math.abs(C.mapTime(p.duration,anchors)-r.end)<1e-8);
  count++;tunes.add(song.id);
 }
 assert.equal(count,catalog.headVideoCoverage.recordings);assert.equal(tunes.size,catalog.headVideoCoverage.tunes);
});
