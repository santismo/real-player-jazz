const test=require('node:test'),assert=require('node:assert/strict'),C=require('../core.js');
test('Random stays within filtered playable tunes and avoids repeating when another match exists',()=>{
 const current={id:'current',sources:[{}]},first={id:'first',sources:[{}]},last={id:'last',sources:[{}]},chartOnly={id:'chart',sources:[]};
 const filtered=[current,chartOnly,first,last];
 assert.equal(C.randomSong(filtered,'current',()=>0),first);
 assert.equal(C.randomSong(filtered,'current',()=>.999999),last);
 assert.equal(C.randomSong([current,chartOnly],'current',()=>0),current);
 assert.equal(C.randomSong([chartOnly],'current',()=>0),undefined);
 assert.equal(C.randomSong([],'current',()=>0),undefined);
});
