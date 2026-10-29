const test=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js');
const catalog=require('../data/catalog.json'),references=require('../data/reference-recordings.json');
test('reference listening outranks automatic head matches without borrowing their sync',()=>{
 const song={sources:[{id:'auto',hasHead:true,automaticNotes:true},{id:'solo'},{id:'melody',hasHead:true}],recordings:[{id:'abcdefghijk',sourceId:'auto',status:'source-aligned',offset:48}],referenceRecording:{videoId:'lmnopqrstuv',artist:'Artist',album:'Album',headStart:null}};
 const selected=C.preferredRecording(song);
 assert.equal(selected.id,'lmnopqrstuv');assert.equal(selected.status,'reference');assert.equal(selected.sourceId,undefined);
 assert.equal(C.preferredPracticeSource(song).id,'melody');
 assert.equal(C.recordingStart(selected,{notes:[{time:90}]},[{source:0,video:48}]),0);
 assert.equal(C.preferredRecording(song,'auto').sourceId,'auto');
 assert.equal(C.preferredPracticeSource(song,'solo').id,'solo');
});
test('reference list requires exact tune identity, evidence and honest timing status',()=>{
 assert.ok(references.entries.length>=30);
 const ids=new Set();
 for(const r of references.entries){
  assert.ok(!ids.has(r.songId),r.songId);ids.add(r.songId);
  const song=catalog.songs.find(s=>s.id===r.songId);assert.ok(song,r.songId);
  assert.ok(r.artist&&r.album&&r.reason&&r.headEvidence,r.songId);
  assert.ok(r.evidence.length>=1,r.songId);
  for(const e of r.evidence){assert.ok(e.title);assert.equal(new URL(e.url).protocol,'https:');}
  if(r.videoId)assert.equal(C.youtubeId(r.videoId),r.videoId);
  assert.ok(['documented','listening-pending'].includes(r.verification.head));
  assert.equal(r.headStart,null,'No invented head timestamps');
  assert.equal(r.offset,undefined,'Do not import a solo offset into the reference');
  assert.equal(r.sourceId,undefined,'References do not claim transcription sync');
 }
});
test('a tune without a reference keeps its existing explicit study selection',()=>{
 const song=catalog.songs.find(s=>s.id==='jordu');
 assert.equal(C.referenceRecording(song),null);
 assert.equal(C.preferredRecording(song,'wjazzd-92').sourceId,'wjazzd-92');
});
