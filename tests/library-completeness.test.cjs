const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),C=require('../core.js'),M=require('../vendor/midi.js');
const catalog=require('../data/catalog.json'),audit=require('../data/library-audit.json'),artistData=require('../data/artist-recordings.json'),refs=require('../data/reference-recordings.json');
test('every pinned Miditar and Keyer MIDI path is playable, duplicated or explicitly unusable',()=>{
 const trees=require('../scripts/library-inputs/repository-trees.json');
 assert.equal(audit.files.length,trees.reduce((n,t)=>n+t.files.length,0));
 const sources=new Map(catalog.songs.flatMap(s=>s.sources.map(p=>[p.id,p])));
 for(const tree of trees)for(const file of tree.files){
  const row=audit.files.find(r=>r.repository===tree.repository&&r.path===file.path);assert.ok(row,file.path);assert.equal(row.blobSha,file.sha);assert.equal(row.revision,tree.revision);
  if(row.status==='unusable'){assert.match(row.reason,/no (playable )?pitched notes/i);continue;}
  const source=sources.get(row.sourceId);assert.ok(source,file.path);assert.ok(fs.existsSync(decodeURIComponent(source.url)));assert.ok(C.partInCollection(source,tree.repository.split('/')[1].toLowerCase()));
  if(row.duplicateOf)assert.equal(file.sha,tree.files.find(f=>f.path===row.duplicateOf).sha);
 }
 assert.equal(audit.summary.unaccountedFiles,0);assert.equal(audit.summary.unusableFiles,1);
});
test('related Joe Pass videos never inherit timing, and explicit parts retain their own supplied audio',()=>{
 assert.equal(artistData.entries.length,31);assert.equal(artistData.entries.filter(e=>e.recording).length,28);
 for(const entry of artistData.entries)for(const songId of entry.songIds){
  const song={...catalog.songs.find(s=>s.id===songId)};assert.ok(song.sources,songId);assert.ok(song.sources.some(s=>s.id===entry.associatedSourceId));song.artistRecordings=[entry];
  if(!entry.recording){assert.equal(C.artistRecordings(song).length,0);continue;}
  const r=C.artistRecordings(song)[0];assert.ok(r);assert.equal(r.sourceId,undefined);assert.equal(r.offset,undefined);assert.equal(r.headStart,null);assert.equal(r.status,'reference');
  assert.equal(C.recordingStart(r,{notes:[{time:90}]},[{source:0,video:80}]),0);
  const existing=(song.recordings||[]).find(r=>r.sourceId===entry.associatedSourceId&&['source-aligned','estimated'].includes(r.status));
  assert.equal(C.preferredRecording(song,entry.associatedSourceId).id,existing?.id||r.id);
 }
});
test('Django arrangements remain discoverable without being credited as exact Django performances',()=>{
 const songs=catalog.songs.filter(s=>s.sources.some(p=>C.partInCollection(p,'django')));assert.equal(songs.length,4);
 for(const original of songs){
  const song={...original,referenceRecording:refs.entries.find(r=>r.songId===original.id)};
  const source=song.sources.find(p=>C.partInCollection(p,'django'));assert.equal(source.performer,undefined);assert.equal(source.attributionRole,'composer');assert.ok(source.hasHead);assert.ok(source.attributionNote);
  assert.equal(C.preferredRecording(song,source.id).id,song.referenceRecording.videoId);
 }
 assert.equal(refs.entries.find(r=>r.songId==='chezjacquet').artist,'Matelo Ferret');
});
test('recovered Potter study preserves all 413 original pitches and published expressive timing',()=>{
 const original=fs.readFileSync('scripts/library-inputs/ChrisPotter_InASentimentalMood_original.mid');assert.equal(original.readUInt16BE(12),55440);original.writeUInt16BE(480,12);
 const pitches=M.parseMidi(original).tracks.flatMap(t=>t.notes).map(n=>n.midi),performance=require('../data/performance/wjazzd-80.json');
 assert.equal(performance.notes.length,413);assert.deepEqual(pitches,performance.notes.map(n=>n.midi));
 const source=catalog.songs.flatMap(s=>s.sources).find(s=>s.id==='wjazzd-80');assert.equal(source.alignmentStatus,'recording-pending');
 const rebuilt=M.parseMidi(fs.readFileSync(source.url)).tracks.flatMap(t=>t.notes);assert.deepEqual(rebuilt.map(n=>n.midi),pitches);
 rebuilt.forEach((n,i)=>assert.ok(Math.abs(n.time-performance.notes[i].time)<.0001));
});
