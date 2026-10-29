import json,pathlib,difflib,argparse,numpy as np
parser=argparse.ArgumentParser();parser.add_argument('--root',type=pathlib.Path,default=pathlib.Path(__file__).resolve().parents[2]);args=parser.parse_args();root=args.root;c=json.load(open(root/'data/catalog.json'));new={p.stem.removeprefix('parker-'):json.load(open(p))['notes'] for p in sorted((root/'data/performance').glob('parker-*.json'))};rng=np.random.default_rng(71);out=[]
for song in c['songs']:
 for src in song['sources']:
  if src.get('performer')!='Charlie Parker' or not src.get('performanceUrl') or not src['id'].startswith('wjazzd-'):continue
  old=json.load(open(root/src['performanceUrl']))['notes'];a=[n['midi'] for n in old]
  for sid,notes in new.items():
   blocks=difflib.SequenceMatcher(None,a,[n['midi'] for n in notes],autojunk=False).get_matching_blocks();longest=max(b.size for b in blocks)
   if longest<10:continue
   pairs=[(notes[b.b+i]['time'],old[b.a+i]['time']) for b in blocks if b.size>=3 for i in range(b.size)];p=np.array(pairs)
   if len(p)<40:continue
   best=[]
   for _ in range(150):
    i,j=rng.choice(len(p),2,replace=False)
    if abs(p[j,0]-p[i,0])<20:continue
    scale=(p[j,1]-p[i,1])/(p[j,0]-p[i,0]);offset=p[i,1]-scale*p[i,0]
    if not .95<scale<1.05:continue
    ix=np.flatnonzero(abs(p[:,1]-scale*p[:,0]-offset)<.16)
    if len(ix)>len(best):best=ix
   if len(best)<40:continue
   q=p[best];scale,offset=np.polyfit(q[:,0],q[:,1],1);res=abs(q[:,1]-q[:,0]*scale-offset);coverage=len(q)/len(old)
   if coverage<.65 or np.ptp(q[:,0])<25:continue
   row=dict(songId=song['id'],title=song['title'],sourceId=src['id'],parkerId=sid,scale=float(scale),offset=float(offset),matchingNotes=len(q),oldNotes=len(old),coverage=coverage,longestPitchRun=longest,span=float(np.ptp(q[:,0])),p95Residual=float(np.quantile(res,.95)),medianResidual=float(np.median(res)),recordings=[r for r in song['recordings'] if r.get('sourceId')==src['id']]);out.append(row);print({k:v for k,v in row.items() if k!='recordings'},flush=True)
(root/'scripts/parker-crossmatches.json').write_text(json.dumps(out,indent=2))
