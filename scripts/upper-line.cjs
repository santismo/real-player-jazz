// An explicitly heuristic guitar reduction of a polyphonic piano transcription.
// Keep original attacks and pitches; do not invent a melody or quantize its timing.
function upperLine(notes){
 const sorted=notes.filter(n=>n.duration>=.05&&n.midi>=40).sort((a,b)=>a.time-b.time||b.midi-a.midi),groups=[];
 for(const n of sorted){const g=groups.at(-1);if(g&&n.time-g[0].time<=.025)g.push(n);else groups.push([n]);}
 const result=[];let active=[];
 for(const group of groups){
  const candidate=group.reduce((a,b)=>b.midi>a.midi?b:a);
  active=active.filter(n=>n.time+n.duration>candidate.time+.035);
  const highest=Math.max(-Infinity,...active.map(n=>n.midi));
  active.push(...group);
  if(candidate.midi<highest)continue;
  const previous=result.at(-1);
  if(previous&&previous.time+previous.duration>candidate.time)previous.duration=candidate.time-previous.time;
  result.push({...candidate});
 }
 return result.filter(n=>n.duration>=.03).map((n,id)=>({...n,id}));
}
module.exports={upperLine};
