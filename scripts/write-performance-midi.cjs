const vlq=n=>{const a=[n&127];while(n>>=7)a.unshift((n&127)|128);return Buffer.from(a)};
function performanceMidi(notes){
 const ev=[{tick:0,order:-1,data:Buffer.from('ff510307a120','hex')}];
 for(const n of notes){const start=Math.round(n.time*20000),end=Math.max(start+1,Math.round((n.time+n.duration)*20000));ev.push({tick:start,order:1,data:Buffer.from([0x90,n.midi,Math.min(127,Math.max(1,Math.round(n.velocity<=1?n.velocity*127:n.velocity||90)))])},{tick:end,order:0,data:Buffer.from([0x80,n.midi,0])});}
 ev.sort((a,b)=>a.tick-b.tick||a.order-b.order);let previous=0;const data=[];
 for(const e of ev){data.push(vlq(e.tick-previous),e.data);previous=e.tick;}data.push(Buffer.from('00ff2f00','hex'));const track=Buffer.concat(data),header=Buffer.from('4d546864000000060000000127104d54726b00000000','hex');header.writeUInt32BE(track.length,18);return Buffer.concat([header,track]);
}
module.exports={performanceMidi};
