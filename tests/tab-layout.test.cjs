const test=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js');
test('dense multi-digit tablature has room and scrub coordinates round trip',()=>{
 const notes=Array.from({length:32},(_,i)=>({time:1+i*.025,fret:10+i%12,string:0}));
 const bars=[{time:0},{time:1},{time:2},{time:3}];
 const layout=C.tabLayout(notes,bars,[{time:0,text:'Cmaj7'},{time:1,text:'F#dim7'},{time:2,text:'B7'}],4,45);
 for(let i=1;i<notes.length;i++)assert.ok(layout.xAt(notes[i].time)-layout.xAt(notes[i-1].time)>=30-1e-8);
 assert.ok(layout.xAt(2)-layout.xAt(1)>layout.xAt(3)-layout.xAt(2));
 for(const time of [-1,0,.3,1,1.123,2,3.5,4,7])assert.ok(Math.abs(layout.timeAt(layout.xAt(time))-time)<1e-8);
});
test('simultaneous strings share a tab column without expanding their timing',()=>{
 const notes=[0,1,2,3].map(string=>({time:1,fret:12,string}));const l=C.tabLayout(notes,[],[],2,50);
 assert.equal(l.points.filter(p=>p.time===1).length,1);assert.equal(l.xAt(1),50);
});
