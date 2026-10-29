import json,pathlib,bisect,mido,collections,math
P=pathlib.Path(__file__).parent;OUT=P/'converted';OUT.mkdir(exist_ok=True)
rows=json.load(open(P/'piast-reviewed-new-title-pairs.json'));bounds=json.load(open(P/'piast-video-bounds.json'));manifest=[]
for r in rows:
 if 'error' in r:continue
 if r['songTitle'] in ['JOY TO THE WORLD','GEORGIA','All By Myself','Without You']:continue # hymn/pop collision and unresolved generic Georgia title
 b=bounds[r['youtubeId']]
 if not b.get('duration') or b.get('playabilityStatus')!='OK' or b.get('embeddable') is False:continue
 m=mido.MidiFile(r['midiPath']);absolute=[]
 for ti,t in enumerate(m.tracks):
  tick=0;ev=[]
  for x in t:tick+=x.time;ev.append((tick,x))
  absolute.append(ev)
 ev=sorted(((t,x) for arr in absolute for t,x in arr if x.is_meta),key=lambda z:z[0])
 tempos={0:500000}
 for t,x in ev:
  if x.type=='set_tempo':tempos[t]=x.tempo
 ts=sorted(tempos);secs=[0.]
 for a,z in zip(ts,ts[1:]):secs.append(secs[-1]+mido.tick2second(z-a,m.ticks_per_beat,tempos[a]))
 def sec(t):
  i=bisect.bisect_right(ts,t)-1;return secs[i]+mido.tick2second(t-ts[i],m.ticks_per_beat,tempos[ts[i]])
 names=[next((x.name for _,x in e if x.type=='track_name'),'') for e in absolute];selected=next((i for i,n in enumerate(names) if n.lower()=='melody'),None)
 if selected is None:continue
 notes=[];open_notes=collections.defaultdict(list);max_tick=0
 for t,x in absolute[selected]:
  if x.type=='note_on' and x.velocity:open_notes[(x.channel,x.note)].append((t,x.velocity))
  elif x.type=='note_off' or x.type=='note_on' and not x.velocity:
   if open_notes[(x.channel,x.note)]:
    a,v=open_notes[(x.channel,x.note)].pop(0);notes.append({'time':sec(a),'duration':max(.001,sec(t)-sec(a)),'midi':x.note,'velocity':v/127,'sourceStartTick':a,'sourceEndTick':t});max_tick=max(max_tick,t)
 notes.sort(key=lambda x:(x['time'],x['midi']));media_end=b['duration']-r.get('sourceVideoStart',0);raw_count=len(notes);removed=sum(n['time']>=media_end for n in notes);clipped=sum(n['time']<media_end<n['time']+n['duration'] for n in notes)
 notes=[n for n in notes if n['time']<media_end]
 for i,n in enumerate(notes):n['id']=i;n['duration']=min(n['duration'],media_end-n['time'])
 if len(notes)<20:continue
 sig={0:(4,4)}
 for t,x in ev:
  if x.type=='time_signature':sig[t]=(x.numerator,x.denominator)
 sig_ticks=sorted(sig);bars=[];tick=0
 while tick<max_tick and sec(tick)<media_end and len(bars)<4000:
  i=bisect.bisect_right(sig_ticks,tick)-1;num,den=sig[sig_ticks[i]];end=tick+m.ticks_per_beat*num*4/den
  if i+1<len(sig_ticks):end=min(end,sig_ticks[i+1])
  bars.append({'index':len(bars)+1,'time':sec(tick),'end':min(sec(end),media_end),'numerator':num,'denominator':den});tick=end
 qualities={'M':'','m':'m','M7':'maj7','m7':'m7','7':'7','o':'dim','o7':'dim7','/o7':'m7b5','+':'aug','sus2':'sus2','sus4':'sus4'};chords=[]
 for t,x in ev:
  if x.type!='marker':continue
  parts=x.text.split('_')
  if len(parts)!=3 or parts[0]=='global' or parts[0]=='N' or sec(t)>=media_end:continue
  root,q,bass=parts
  if q not in qualities:continue
  label=root+qualities[q]+('/'+bass if bass!=root else '')
  chords.append({'time':sec(t),'text':label,'sourceMarker':x.text})
 chords.sort(key=lambda x:x['time'])
 for i,c in enumerate(chords):c['duration']=(chords[i+1]['time'] if i+1<len(chords) else media_end)-c['time']
 source_id=r['sourceId'];perform={'sourceId':source_id,'provider':'PIAST · Bang et al.','duration':media_end,'notes':notes,'bars':bars,'chords':chords,'automaticNotes':True,'automaticChords':True,'timelineUnit':'seconds','sourceUrl':r['sourceUrl'],'transcriptionMethod':'Published automatic piano transcription with source-provided beat-quantized melody and chord estimates. Approximate note timing; not verified guitar fingering.','originalTrackIndex':selected,'originalPianoTrackIndex':next((i for i,n in enumerate(names) if n.lower()=='piano'),None),'boundaryAudit':{'videoDuration':b['duration'],'removedNotesAfterVideoEnd':removed,'clippedNoteTails':clipped,'originalSelectedNoteCount':raw_count}}
 perfpath=OUT/(source_id+'.json');perfpath.write_text(json.dumps(perform,separators=(',',':')))
 outm=mido.MidiFile(ticks_per_beat=960);track=mido.MidiTrack();outm.tracks.append(track);track.append(mido.MetaMessage('track_name',name='PIAST automatic melody',time=0));track.append(mido.MetaMessage('set_tempo',tempo=500000,time=0));events=[]
 for n in notes:
  a=round(n['time']*1920);z=max(a+1,round((n['time']+n['duration'])*1920));events.extend([(a,1,n['midi'],max(1,round(n['velocity']*127))),(z,0,n['midi'],0)])
 prev=0
 for t,on,pitch,v in sorted(events):track.append(mido.Message('note_on' if on else 'note_off',note=pitch,velocity=v,time=t-prev));prev=t
 track.append(mido.MetaMessage('end_of_track',time=0));midpath=OUT/(source_id+'.mid');outm.save(midpath)
 manifest.append({**r,'performancePath':str(perfpath),'playbackMidiPath':str(midpath),'originalMidiPath':r['midiPath'],'selectedOriginalTrackIndex':selected,'preferredTrackIndex':0,'noteCount':len(notes),'barCount':len(bars),'chordCount':len(chords),'offset':r.get('sourceVideoStart',0),'end':b['duration'],'status':'source-aligned','automaticNotes':True,'timingDescription':'Automatic beat-quantized melody; approximate note timing. Published full-video origin, with no guessed correction.','boundaryAudit':perform['boundaryAudit'],'availabilityChecked':True,'checkedAt':'2026-10-29','videoMetadata':b})
(P/'piast-integration-manifest.json').write_text(json.dumps(manifest,indent=2));print('READY',len(manifest),'notes',sum(x['noteCount'] for x in manifest),'bounds trimmed',[(x['songTitle'],x['boundaryAudit']) for x in manifest if x['boundaryAudit']['removedNotesAfterVideoEnd'] or x['boundaryAudit']['clippedNoteTails']])
