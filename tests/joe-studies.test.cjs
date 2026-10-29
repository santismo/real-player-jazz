const test=require('node:test'),assert=require('node:assert/strict'),fs=require('fs'),M=require('../vendor/midi.js'),C=require('../core.js'),cat=require('../data/catalog.json');
test('Joe Pass score studies retain actual notes and score fingering without claiming recordings',()=>{
 let n=0;for(const song of cat.songs)for(const source of song.sources.filter(s=>s.scoreUrl)){
 const p=JSON.parse(fs.readFileSync(source.scoreUrl)),m=M.parseMidi(fs.readFileSync(source.url));assert.equal(p.sourceId,source.id);assert.equal(p.timingStatus,'score-only');assert.equal(source.alignmentStatus,'recording-pending');
 assert.deepEqual(p.notes.map(n=>n.midi),M.chooseMelodyTrack(m).notes.map(n=>n.midi));
 for(const note of p.notes){assert.ok(note.duration>0&&note.time>=0);assert.ok(note.time+note.duration<=p.duration+1e-5);}
 const mapped=C.fingerNotes(p.notes);assert.ok(mapped.filter(n=>n.sourceFingering).length>mapped.length*.95);n++;
 }assert.equal(n,cat.joeExpansionCoverage.scoreParts);
});
test('estimated Joe Pass audio is separately labeled and locally available',()=>{let count=0;for(const song of cat.songs)for(const r of (song.recordings||[]).filter(r=>r.status==='estimated')){const s=song.sources.find(s=>s.id===r.sourceId),p=JSON.parse(fs.readFileSync(s.performanceUrl));assert.equal(p.timingStatus,'estimated');assert.equal(s.alignmentStatus,'estimated');assert.ok(fs.statSync(r.audioUrl).size>10000);count++;}assert.equal(count,2);});
