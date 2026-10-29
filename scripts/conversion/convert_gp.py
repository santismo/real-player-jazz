"""Convert public GP3-5 files to written-score MIDI and fingering JSON.
Does not align scores to recordings. Simple notated repeats are expanded; alternate-ending scores are rejected.
Files remain score studies until rendition/form is verified.
Requires PyGuitarPro and mido.
"""
import guitarpro,mido,json,pathlib,bisect,collections
ROOT=pathlib.Path(__file__).resolve().parent;OUT=ROOT/'converted';OUT.mkdir(exist_ok=True)
rows=[]
for path in sorted((ROOT/'pass_joe').glob('*')):
 if path.suffix=='.gpx':continue
 song=guitarpro.parse(path)
 tracks=[t for t in song.tracks if not t.isPercussionTrack and len(t.strings)==6]
 track=next((t for t in tracks if 'pass' in t.name.lower()),tracks[0])
 tempo={0:song.tempo}; raw=[];chords=[];last_by_string={};warnings=[];effectcounts=collections.Counter()
 for measure in track.measures:
  for voice in measure.voices:
   for beat in voice.beats:
    tick=beat.start-960; dur=beat.duration.time
    if beat.effect.mixTableChange and beat.effect.mixTableChange.tempo:tempo[tick]=beat.effect.mixTableChange.tempo.value
    if beat.effect.chord and beat.effect.chord.name:chords.append({'tick':tick,'text':beat.effect.chord.name})
    for n in beat.notes:
     if n.type==guitarpro.NoteType.dead:effectcounts['dead_notes_omitted']+=1;continue
     if n.type==guitarpro.NoteType.tie and n.string in last_by_string:
      prev=last_by_string[n.string];prev['endTick']=max(prev['endTick'],tick+dur);continue
     effectcounts.update(k for k in ['harmonic','grace','bend','trill','tremoloPicking'] if getattr(n.effect,k,None))
     note={'tick':max(0,tick),'endTick':max(0,tick)+dur,'midi':track.strings[n.string-1].value+n.value+track.offset,'velocity':min(127,max(1,n.velocity)),'string':n.string-1,'fret':n.value,'sourceType':n.type.name}
     # Harmonically sounded pitch differs from fretted pitch; keep event annotated
     # but do not silently claim its MIDI pitch is verified.
     if n.effect.harmonic:note['harmonic']=str(n.effect.harmonic)
     raw.append(note);last_by_string[n.string]=note
 # Expand source repeat signs. These three files have no alternate endings.
 if any(h.repeatAlternative for h in song.measureHeaders):raise ValueError('Alternate endings need an explicit expansion implementation: '+path.name)
 order=[];j=0;start=0;passes={};guard=0
 while j<len(song.measureHeaders):
  guard+=1
  if guard>20000:raise ValueError('Repeat expansion exceeded safety bound')
  h=song.measureHeaders[j]
  if h.isRepeatOpen:start=j
  order.append(j)
  if h.repeatClose>0:
   done=passes.get(j,0)
   if done<h.repeatClose:passes[j]=done+1;j=start;continue
  j+=1
 original_tempo=sorted(tempo.items());newtempo={0:song.tempo};newraw=[];newchords=[];newbars=[];outtick=0
 for original_index in order:
  h=song.measureHeaders[original_index];lo=h.start-960;hi=lo+h.length
  active=next((v for t,v in reversed(original_tempo) if t<=lo),song.tempo)
  newtempo[outtick]=active
  for t,v in original_tempo:
   if lo<=t<hi:newtempo[outtick+t-lo]=v
  for n in raw:
   if lo<=n['tick']<hi:newraw.append({**n,'tick':outtick+n['tick']-lo,'endTick':outtick+n['endTick']-lo})
  for ch in chords:
   if lo<=ch['tick']<hi:newchords.append({**ch,'tick':outtick+ch['tick']-lo})
  newbars.append((outtick,outtick+h.length,original_index+1));outtick+=h.length
 raw=newraw;chords=newchords;tempo=sorted(newtempo.items());ticks=[t for t,bpm in tempo];seconds=[0.]
 for i in range(1,len(tempo)):seconds.append(seconds[-1]+(ticks[i]-ticks[i-1])/960*60/tempo[i-1][1])
 def time(t):
  i=bisect.bisect_right(ticks,t)-1;return seconds[i]+(t-ticks[i])/960*60/tempo[i][1]
 raw.sort(key=lambda n:(n['tick'],n['midi'],n['string']))
 for i,n in enumerate(raw):n.update(id=i,time=time(n['tick']),duration=time(n['endTick'])-time(n['tick']))
 bars=[{'index':i+1,'time':time(lo),'end':time(hi),'sourceBar':sourcebar} for i,(lo,hi,sourcebar) in enumerate(newbars)]
 for i,ch in enumerate(chords):ch['time']=time(ch['tick']);ch['duration']=time(chords[i+1]['tick'])-ch['time'] if i+1<len(chords) else bars[-1]['end']-ch['time']
 mid=mido.MidiFile(ticks_per_beat=960);mt=mido.MidiTrack();mid.tracks.append(mt);events=[]
 events.append((0,0,mido.MetaMessage('track_name',name='Joe Pass guitar (written score)')))
 for tick,bpm in tempo:events.append((tick,0,mido.MetaMessage('set_tempo',tempo=mido.bpm2tempo(bpm))))
 for n in raw:
  events.append((n['tick'],2,mido.Message('note_on',channel=n['string'],note=n['midi'],velocity=n['velocity'])))
  events.append((n['endTick'],1,mido.Message('note_off',channel=n['string'],note=n['midi'],velocity=0)))
 for ch in chords:events.append((ch['tick'],0,mido.MetaMessage('marker',text=ch['text'])))
 events.sort(key=lambda e:(e[0],e[1]));last=0
 for tick,_,ev in events:ev.time=tick-last;mt.append(ev);last=tick
 mid.save(OUT/(path.stem+'.mid'))
 repeats=[{'bar':h.number,'open':h.isRepeatOpen,'close':h.repeatClose,'alternate':h.repeatAlternative} for h in song.measureHeaders if h.isRepeatOpen or h.repeatClose>0 or h.repeatAlternative]
 data={'sourceId':'gp-joe-'+path.stem.replace('_','-'),'provider':'GTPTabs contributor score','duration':max(bars[-1]['end'],max(n['time']+n['duration'] for n in raw)),'notes':raw,'bars':bars,'chords':chords,'timingStatus':'score-only','timingMethod':'Score tempo; no original-recording synchronization','fingeringStatus':'Strings/frets retained from contributor Guitar Pro file; not independently verified','repeats':repeats,'repeatPolicy':'Expanded simple written repeats; no alternate endings present','conversionLimitations':['Simple source repeats expanded; not evidence of the original recording form','Grace notes and expressive articulations are not synthesized']+(['Harmonic sounding pitches need manual verification'] if effectcounts['harmonic'] else []),'effects':dict(effectcounts)}
 (OUT/(path.stem+'.json')).write_text(json.dumps(data,separators=(',',':')))
 rows.append({'id':data['sourceId'],'file':path.name,'title':song.title or path.stem.replace('_',' ').title(),'artist':'Joe Pass','album':song.album,'notes':len(raw),'bars':len(bars),'duration':data['duration'],'sourceUrl':'https://gtptabs.com/tabs/16/pass-joe.html','downloadUrl':'https://gtptabs.com/storage/archive/pass_joe.zip','notice':song.notice,'instructions':song.instructions,'track':track.name,'timingStatus':'score-only','effects':dict(effectcounts),'repeats':repeats,'midi':str(OUT/(path.stem+'.mid')),'scoreJson':str(OUT/(path.stem+'.json'))})
(OUT/'metadata.json').write_text(json.dumps(rows,indent=2));print('Converted',len(rows),'score parts with simple repeats expanded; zero claimed recording alignments')
for r in rows:print(r['file'],r['notes'],round(r['duration'],2))
