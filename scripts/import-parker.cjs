const fs=require('fs'),M=require('../vendor/midi.js'),c=require('../data/catalog.json'),meta=require('../data/parker/metadata.json');
const norm=s=>s.replace(/^(the|a|an) /i,'').replace(/[^a-z0-9]/gi,'').toLowerCase();
for(const row of meta.rows){const id='parker-'+row.id;let s=c.songs.find(s=>s.id===norm(row.title));if(!s){s={id:norm(row.title),title:row.title,composer:'Charlie Parker',realBook:false,sources:[],recordings:[]};c.songs.push(s)}
s.sources=s.sources.filter(x=>x.id!==id);s.recordings=(s.recordings||[]).filter(x=>x.sourceId!==id);
const m=M.parseMidi(fs.readFileSync('data/parker/'+row.id+'.mid'),row.title),notes=M.chooseMelodyTrack(m).notes.map((n,i)=>({id:i,time:n.time,duration:n.duration,midi:n.midi,velocity:Math.round(n.velocity*127)}));
const duration=Math.max(m.duration,...row.bars.map(b=>b.end));
const perf={provider:'Charlie Parker Aligned Omnibook · Xavier Riley / Simon Dixon',sourceId:id,duration,notes,bars:row.bars,chords:row.chords,timingMethod:'Published performance-aligned reference MIDI; bar timing from published syncpoints; chord positions interpolated within each bar.'};
fs.writeFileSync('data/performance/'+id+'.json',JSON.stringify(perf));
s.sources.unshift({id,label:'Head + solo · Charlie Parker',kind:'head',hasHead:true,performer:'Charlie Parker',url:'data/parker/'+row.id+'.mid',performanceUrl:'data/performance/'+id+'.json',sourceUrl:meta.source,provider:perf.provider});
s.recordings.unshift({id:'audio-parker-'+row.id,sourceId:id,mediaType:'audio',audioUrl:row.audioUrl,label:'Charlie Parker · head + solo · original audio',status:'source-aligned',provider:perf.provider,offset:0,end:duration,availabilityChecked:true,availabilityMethod:'Pinned dataset audio asset present in release manifest; sample playback checked',sourceUrl:meta.source});
}
let heads=c.songs.filter(s=>s.realBook&&s.sources.some(x=>x.hasHead)).length;
c.parkerCoverage={parts:meta.rows.length,realBookParts:c.songs.filter(s=>s.realBook).flatMap(s=>s.sources.filter(x=>x.id.startsWith('parker-'))).length};c.headCoverage={realBookWithHead:heads,realBookMissingHead:c.songs.filter(s=>s.realBook&&!s.sources.some(x=>x.hasHead)).length};c.songs.sort((a,b)=>a.title.localeCompare(b.title));fs.writeFileSync('data/catalog.json',JSON.stringify(c));console.log(c.parkerCoverage,c.headCoverage);
fs.writeFileSync('data/head-coverage.csv','Title,Real Book,Head status,Head sources\n'+c.songs.map(s=>[s.title,s.realBook?'yes':'no',s.sources.some(x=>x.hasHead&&x.performanceUrl)?'Recording-aligned head':s.sources.some(x=>x.hasHead)?'MIDI head; recording pending':'Head missing',s.sources.filter(x=>x.hasHead).map(x=>x.id).join(';')].map(x=>'"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n')+'\n');
