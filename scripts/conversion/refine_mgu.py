"""Hierarchical score/audio alignment for the two public MGU/WAV samples.
Timing remains estimated. No human note-by-note verification is claimed.
"""
import sys,pathlib,json,struct
sys.path.insert(0,'/tmp/joe-python')
import librosa,numpy as np,mido
from scipy.ndimage import gaussian_filter1d
from numba import njit
ROOT=pathlib.Path(__file__).resolve().parent;OUT=ROOT/'aligned-estimates';OUT.mkdir(exist_ok=True)
@njit
def solve(cost,center,band):
 n,w=cost.shape;D=np.full((n,w),1e12);P=np.zeros((n,w),np.uint8)
 for k in range(w):
  j=center[0]+k-band
  if j>=0 and j<=2:D[0,k]=cost[0,k]
 for i in range(1,n):
  for k in range(w):
   j=center[i]+k-band
   best=1e12;which=0
   for di,dj,wt,code in [(1,1,1.,1),(1,2,1.5,2),(2,1,1.5,3)]:
    ii=i-di
    if ii<0:continue
    kk=j-dj-center[ii]+band
    if 0<=kk<w:
     v=D[ii,kk]+cost[i,k]*wt
     if v<best:best=v;which=code
   D[i,k]=best;P[i,k]=which
 k=np.argmin(D[-1]);i=n-1;path=[]
 while i>=0:
  j=center[i]+k-band;path.append((i,j));c=P[i,k]
  if i==0 or c==0:break
  di=2 if c==3 else 1;dj=2 if c==2 else 1
  ii=i-di;k=j-dj-center[ii]+band;i=ii
 return path
for f in pathlib.Path('/tmp/joe-free').glob('*.MGU'):
 name=f.stem;coarse=json.load(open(f.with_name(name+'-aligned.json')));b=f.read_bytes();st,n=struct.unpack('<HH',b[-4:]);bpm=struct.unpack('<H',b[2+b[1]+4:2+b[1]+6])[0]
 notes=[]
 for i in range(n):
  tick,status,pitch,vel,ch,dur=struct.unpack('<IBBBBI',b[st+i*12:st+(i+1)*12])
  if status&240==144 and vel and dur:notes.append({'tick':tick,'scoreTime':tick/120*60/bpm,'scoreDuration':dur/120*60/bpm,'midi':pitch,'velocity':vel,'string':(status&15)-10})
 wav=next(p for p in f.parent.glob('*') if p.stem==name and p.suffix.lower()=='.wav');y,sr=librosa.load(wav,sr=22050)
 cache=OUT/(name+'-cqt20.npy')
 if cache.exists():a=np.load(cache)
 else:a=abs(librosa.cqt(y,sr=sr,hop_length=441,fmin=librosa.midi_to_hz(36),n_bins=60));np.save(cache,a)
 a=np.log1p(a*10);a=np.maximum(0,a-np.percentile(a,20,axis=1,keepdims=True));a/=np.maximum(np.percentile(a,90,axis=1,keepdims=True),.2);a=gaussian_filter1d(a,.5,axis=0);a/=np.maximum(np.linalg.norm(a,axis=0,keepdims=True),1e-8)
 step=.02;end=max(n['scoreTime']+n['scoreDuration'] for n in notes);s=np.zeros((60,int(end/step)+1),np.float32)
 for n in notes:
  pi=n['midi']-36
  if 0<=pi<60:s[pi,int(n['scoreTime']/step):max(int(n['scoreTime']/step)+1,int((n['scoreTime']+n['scoreDuration'])/step))]=1
 s=gaussian_filter1d(s,.5,axis=0);s/=np.maximum(np.linalg.norm(s,axis=0,keepdims=True),1e-8)
 old=np.array(coarse['anchors']);centers=np.rint(np.interp(np.arange(s.shape[1])*step,old[:,0],old[:,1])/step).astype(np.int64);band=40;cost=np.full((s.shape[1],band*2+1),1.,np.float32)
 for i,center in enumerate(centers):
  lo=max(0,center-band);hi=min(a.shape[1],center+band+1);k=lo-center+band
  if hi>lo:cost[i,k:k+hi-lo]=1-s[:,i]@a[:,lo:hi]
 path=np.array(solve(cost,centers,band)[::-1]);ut=np.unique(path[:,0]);at=np.array([np.median(path[path[:,0]==i,1]) for i in ut]);mp=lambda t:float(np.interp(t,ut*step,at*step))
 for i,n in enumerate(notes):
  t=mp(n['scoreTime']);e=mp(n['scoreTime']+n['scoreDuration']);n.update(id=i,time=round(t,5),duration=round(max(.02,e-t),5));string=n['string'];n['fret']=n['midi']-[64,59,55,50,45,40][string] if 0<=string<6 else -1
 # Score similarity contrasts: diagnostic, not independent transcription validation.
 def score_shift(shift):
  vals=[]
  for n in notes:
   p=n['midi']-36;frame=int((n['time']+min(.08,n['duration']/2)+shift)/step)
   if 0<=p<60 and 0<=frame<a.shape[1]:vals.append(float(a[p,frame]))
  return float(np.mean(vals))
 baseline=[score_shift(x) for x in [-5,-3,-1,1,3,5]];good=score_shift(0)
 notes.sort(key=lambda n:(n['time'],n['midi']))
 sid='diab-joe-'+('djangos-castle-1964' if name.startswith('Django') else 'meditation-1970')
 bars=[]
 for i,t in enumerate(np.arange(0,end+240/bpm,240/bpm)):
  t0=mp(t);t1=mp(min(end,t+240/bpm))
  if t1>t0:bars.append({'index':i+1,'time':t0,'end':t1})
 data={'sourceId':sid,'provider':'Django In A Box / Stelios Panos; estimated audio alignment','duration':len(y)/sr,'notes':notes,'bars':bars,'chords':[],'timingStatus':'estimated','timingMethod':'20 ms constrained DTW refinement of public MGU against its paired original WAV; tempo changes inferred from audio','verification':'Computer similarity checks only; requires human review','alignmentDiagnostics':{'pitchSimilarityAtAlignment':good,'pitchSimilarityShiftedBaseline':baseline,'improvementOverMeanShifted':good/np.mean(baseline),'frameSeconds':step,'noteCount':len(notes),'fingeringInvalidNotes':sum(not(0<=n['string']<6 and 0<=n['fret']<=24) for n in notes)},'sourceUrl':'https://www.djangoinabox.com/free.aspx'}
 (OUT/(sid+'.json')).write_text(json.dumps(data,separators=(',',':')))
 mid=mido.MidiFile(ticks_per_beat=20000);mt=mido.MidiTrack();mid.tracks.append(mt);mt.append(mido.MetaMessage('set_tempo',tempo=500000));mt.append(mido.MetaMessage('track_name',name='Joe Pass guitar'));ev=[]
 for n in notes:
  start=round(n['time']*40000);stop=round((n['time']+n['duration'])*40000);ch=max(0,min(5,n['string']));ev.extend([(start,1,mido.Message('note_on',channel=ch,note=n['midi'],velocity=n['velocity'])),(stop,0,mido.Message('note_off',channel=ch,note=n['midi'],velocity=0))])
 last=0
 for tick,_,msg in sorted(ev,key=lambda x:(x[0],x[1])):msg.time=tick-last;last=tick;mt.append(msg)
 mid.save(OUT/(sid+'.mid'))
 print(name,data['alignmentDiagnostics'],flush=True)
