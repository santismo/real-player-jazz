"""Import published Parker reference scores and performance timing (stdlib only).
Run: python scripts/import-parker.py && node scripts/import-parker.cjs
Downloads are pinned; the research alignment is not a claim of human note-by-note verification.
"""
import json, pathlib, urllib.request, shutil, xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
DEST=ROOT/'data/parker';DEST.mkdir(exist_ok=True)
SHA='3147146e816810ac474aae8bac1f4e7141c8e27b'
BASE='https://huggingface.co/datasets/xavriley/CharlieParkerAlignedOmnibook/resolve/'+SHA+'/'
TUNES=json.loads((ROOT/'scripts/parker-tunes.json').read_text())
def get(remote,local):
 cached=pathlib.Path('/tmp/parker-data')/remote
 if cached.exists():shutil.copyfile(cached,local)
 elif not local.exists():local.write_bytes(urllib.request.urlopen(BASE+remote,timeout=90).read())
def pitch(node,tag):
 step=node.findtext(tag+'-step') or ''; alter=int(node.findtext(tag+'-alter') or 0)
 return step+('b'*(-alter) if alter<0 else '#' * alter)
rows=[]
for sid,title in TUNES:
 get('midi_performance_aligned/'+sid+'-fine-aligned.mid',DEST/(sid+'.mid'))
 get('musicxml/'+sid+'.xml',DEST/(sid+'.xml'))
 get('syncpoints/'+sid+'-syncpoints.json',DEST/(sid+'-syncpoints.json'))
 sync=json.loads((DEST/(sid+'-syncpoints.json')).read_text());points={row[0]:row[1] for row in sync}
 root=ET.parse(DEST/(sid+'.xml')); chords=[];bars=[];div=48;beats=4
 for i,m in enumerate(root.findall('.//part/measure')):
  if m.find('.//divisions') is not None:div=float(m.findtext('.//divisions'))
  if m.find('.//time') is not None:beats=float(m.findtext('.//time/beats'))*4/float(m.findtext('.//time/beat-type'))
  if i not in points or i+1 not in points:continue
  start,end=points[i],points[i+1]
  if end<=start:continue
  bars.append({'index':i+1,'time':start,'end':end});pos=0
  for e in m:
   if e.tag=='harmony':
    r=e.find('root');k=e.find('kind');b=e.find('bass')
    if r is None:continue
    text=pitch(r,'root')+(k.get('text','') if k is not None else '')
    if b is not None:text+='/'+pitch(b,'bass')
    time=start+(pos+float(e.findtext('offset') or 0)/div)/beats*(end-start)
    chords.append({'text':text,'time':time,'bar':i+1})
   elif e.tag=='note' and e.find('chord') is None:pos+=float(e.findtext('duration') or 0)/div
   elif e.tag=='backup':pos-=float(e.findtext('duration') or 0)/div
   elif e.tag=='forward':pos+=float(e.findtext('duration') or 0)/div
 chords.sort(key=lambda x:x['time'])
 for i,c in enumerate(chords):c['duration']=(chords[i+1]['time'] if i+1<len(chords) else bars[-1]['end'])-c['time']
 rows.append({'id':sid,'title':title,'bars':bars,'chords':[c for c in chords if c['duration']>0],'audioUrl':BASE+'audio_untuned_mixes/'+sid+'.mp3'})
(DEST/'metadata.json').write_text(json.dumps({'revision':SHA,'source':'https://huggingface.co/datasets/xavriley/CharlieParkerAlignedOmnibook','licenseDeclaration':'MIT in dataset README','rows':rows}))
print('Prepared',len(rows),'Parker head / solo scores')
