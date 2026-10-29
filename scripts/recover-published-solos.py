"""Rebuild five missing/broken WJazzD studies from retained published CSVs.
Requires Python 3 and Node; no network or new timing estimates.
"""
from pathlib import Path
import csv, io, json, subprocess, zipfile, hashlib
ROOT=Path(__file__).resolve().parents[1]
cat=json.loads((ROOT/'data/catalog.json').read_text())
audit=json.loads((ROOT/'data/recording-recheck.json').read_text())
items=audit['missingSourceAudit']['items']
items=items+[{'sourceId':'wjazzd-80','melid':80,'performer':'Chris Potter','title':'In A Sentimental Mood','album':'Concentric Circles','albumReleaseYear':1993,'publishedNoteCsv':{'archive':'scripts/jazztube-inputs/csv_solos.zip','path':'csv_melody/ChrisPotter_InASentimentalMood_Solo.csv','rowCount':413},'publishedBeatCsv':{'archive':'scripts/jazztube-inputs/csv_beats.zip','path':'csv_beats/ChrisPotter_InASentimentalMood_Solo.csv'}}]
def read_csv(meta):
 data=zipfile.ZipFile(ROOT/meta['archive']).read(meta['path'])
 if meta.get('sha256'): assert hashlib.sha256(data).hexdigest()==meta['sha256']
 rows=list(csv.DictReader(io.StringIO(data.decode())))
 if 'rowCount' in meta: assert len(rows)==meta['rowCount']
 return rows
for item in items:
 notes=read_csv(item['publishedNoteCsv']);beats=read_csv(item['publishedBeatCsv'])
 sid=item['sourceId'];songid=''.join(x for x in item['title'].lower() if x.isalnum())
 duration=max(float(n['onset'])+float(n['duration']) for n in notes)+.5
 starts=[b for b in beats if b['beat']=='1'];changes=[b for b in beats if b['chord']]
 source_url='https://jazzomat.hfm-weimar.de/dbformat/synopsis/solo'+str(item['melid'])+'.html'
 p={'sourceId':sid,'provider':'Weimar Jazz Database / JazzTube published note and beat annotations','duration':duration,'notes':[{'midi':int(float(n['pitch'])),'time':float(n['onset']),'duration':float(n['duration']),'velocity':.8} for n in notes],'bars':[{'time':float(b['onset']),'end':float(starts[i+1]['onset']) if i+1<len(starts) else max(duration,float(beats[-1]['onset'])+.01),'index':int(b['bar'])+1} for i,b in enumerate(starts)],'chords':[{'time':float(b['onset']),'duration':max(.001,(float(changes[i+1]['onset']) if i+1<len(changes) else max(duration,float(beats[-1]['onset'])+.01))-float(b['onset'])),'text':b['chord'],'bar':int(b['bar'])+1,'section':b['form']} for i,b in enumerate(changes)],'sourceUrl':source_url,'recoveryEvidence':{'method':'Regenerated from published note onsets and durations; no guessed recording alignment.','noteCsv':item['publishedNoteCsv'],'beatCsv':item['publishedBeatCsv']}}
 if sid=='wjazzd-80':
  code="const fs=require('fs'),M=require('./vendor/midi.js');const b=fs.readFileSync('scripts/library-inputs/ChrisPotter_InASentimentalMood_original.mid');if(b.readUInt16BE(12)!==55440)throw Error('Original header changed');b.writeUInt16BE(480,12);console.log(JSON.stringify(M.parseMidi(b).tracks.flatMap(t=>t.notes).map(n=>n.midi)));"
  pitches=json.loads(subprocess.check_output(['node','-e',code],cwd=ROOT))
  assert pitches==[n['midi'] for n in p['notes']]
  p['recoveryEvidence'].update({'originalMidiDivision':55440,'originalMidiPitchSequenceMatched':True,'matchingNotes':len(notes)})
 file_name=Path(item['publishedNoteCsv']['path']).stem.replace('_Solo','')+'_RECOVERED.mid'
 performance_url='data/performance/'+sid+'.json';midi_url='data/solos/wjazzd/'+file_name
 (ROOT/performance_url).write_text(json.dumps(p))
 code="const fs=require('fs'),{performanceMidi}=require('./scripts/write-performance-midi.cjs');const p=JSON.parse(fs.readFileSync(process.argv[1]));fs.writeFileSync(process.argv[2],performanceMidi(p.notes));"
 subprocess.run(['node','-e',code,performance_url,midi_url],cwd=ROOT,check=True)
 song=next((s for s in cat['songs'] if s['id']==songid),None)
 if song is None:
  song={'id':songid,'title':item['title'],'composer':'','realBook':False,'sources':[],'recordings':[]};cat['songs'].append(song)
 source=next((s for s in song['sources'] if s['id']==sid),None)
 if source is None: source={'id':sid};song['sources'].append(source)
 source.update({'label':item['performer']+' · recovered solo study · '+item['album']+' ('+str(item['albumReleaseYear'])+')'+(' · excerpt '+('1' if sid=='wjazzd-403' else '2') if sid in ['wjazzd-403','wjazzd-404'] else ''),'kind':'solo','performer':item['performer'],'provider':'Weimar Jazz Database / JazzTube','url':midi_url,'fileName':file_name,'sourceUrl':source_url,'performanceUrl':performance_url,'generatedFromPerformance':True,'alignmentStatus':'recording-pending'})
 print(sid,len(notes),'published notes recovered')
(ROOT/'data/catalog.json').write_text(json.dumps(cat,separators=(',',':')))
