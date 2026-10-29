const fs=require('fs'),c=require('../data/catalog.json'),rows=JSON.parse(fs.readFileSync(process.argv[2]||'scripts/catalog-match-inputs/manifest.json'));
let parts=0,recordings=0;
for(const row of rows){
 const target=c.songs.find(s=>s.id===row.targetSongId),origin=c.songs.find(s=>s.id===row.sourceSongId);
 if(!target||!origin)throw Error('Unknown catalog alias');
 for(const id of row.sourceIds){
  const source=origin.sources.find(s=>s.id===id);
  if(!source?.performanceUrl)throw Error('Not a timed performance: '+id);
  if(!target.sources.some(s=>s.id===id)){target.sources.push({...source,catalogOrigin:origin.id});parts++;}
  for(const r of origin.recordings.filter(r=>r.sourceId===id&&r.status==='source-aligned')){
   if(target.recordings.some(x=>x.id===r.id&&x.sourceId===id))continue;
   target.recordings.push({...r,catalogOrigin:origin.id});recordings++;
  }
 }
}
c.catalogMatchCoverage={tunes:rows.length,parts:c.songs.flatMap(s=>s.sources).filter(s=>s.catalogOrigin).length,recordings:c.songs.flatMap(s=>s.recordings).filter(r=>r.catalogOrigin).length,note:'Existing exact performance parts exposed under reviewed aliases; original arrangement MIDI remains unaligned.'};
fs.writeFileSync('data/catalog.json',JSON.stringify(c));fs.writeFileSync('data/catalog-match-audit.json',JSON.stringify(rows,null,2));console.log(c.catalogMatchCoverage);
