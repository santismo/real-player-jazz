const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');process.chdir(root);
const catalog=require('../data/catalog.json'),original=require('../data/repository-import-audit.json'),trees=require('./library-inputs/repository-trees.json');
const lookup=new Map(original.map(r=>[r.repository+':'+r.path,r]));
const sources=new Map(catalog.songs.flatMap(s=>s.sources.map(p=>[p.id,{song:s,source:p}])));
const rows=[];
for(const tree of trees){
 const byPath=new Map(tree.files.map(f=>[f.path,f]));
 for(const file of tree.files){
  let imported=lookup.get(tree.repository+':'+file.path),duplicateOf;
  if(!imported&&tree.repository==='santismo/miditar'&&file.path.startsWith('miditar-offline/example midi songs/')){
   const canonical=file.path.replace('miditar-offline/','public/');
   if(byPath.get(canonical)?.sha===file.sha){imported=lookup.get(tree.repository+':'+canonical);duplicateOf=canonical;}
  }
  const match=imported&&sources.get(imported.sourceId);
  const row={repository:tree.repository,revision:tree.revision,path:file.path,blobSha:file.sha,status:match?'available':imported?.status==='unavailable'?'unusable':'unaccounted'};
  if(match){row.songId=match.song.id;row.sourceId=match.source.id;if(duplicateOf){row.status='identical-offline-copy';row.duplicateOf=duplicateOf;}if(imported.status==='represented-by-published-performance'){row.status='recovered-from-published-notes';row.reason=imported.reason;}}
  else row.reason=imported?.reason||'Not mapped to a playable catalog part';
  rows.push(row);
 }
}
const summary={checkedAt:'2026-10-29',repositoryFiles:rows.length,availableFiles:rows.filter(r=>r.sourceId).length,identicalOfflineCopies:rows.filter(r=>r.status==='identical-offline-copy').length,recoveredFiles:rows.filter(r=>r.status==='recovered-from-published-notes').length,unusableFiles:rows.filter(r=>r.status==='unusable').length,unaccountedFiles:rows.filter(r=>r.status==='unaccounted').length,repositories:trees.map(t=>({repository:t.repository,revision:t.revision,files:t.files.length})),catalogTunes:catalog.songs.length,uniqueParts:new Set(catalog.songs.flatMap(s=>s.sources.map(x=>x.id))).size};
fs.writeFileSync('data/library-audit.json',JSON.stringify({summary,files:rows},null,2)+'\n');
console.log(summary);
if(summary.unaccountedFiles)process.exitCode=1;
