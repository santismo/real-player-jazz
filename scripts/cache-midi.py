import json,urllib.request,concurrent.futures,pathlib
root=pathlib.Path(__file__).resolve().parents[1]; p=root/'data/catalog.json'; data=json.loads(p.read_text()); tasks=[x for s in data['songs'] for x in s['sources'] if x['id'].startswith('miditar-')]; (root/'data/melodies').mkdir(exist_ok=True)
def get(x):
 dest=root/'data/melodies'/(x['id']+'.mid')
 try:
  b=urllib.request.urlopen(x['url'],timeout=30).read()
  if b[:4]!=b'MThd':raise ValueError('Invalid MIDI')
  dest.write_bytes(b); x['remoteUrl']=x['url'];x['url']='data/melodies/'+dest.name;return 1
 except Exception as e:return 0
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool: results=list(pool.map(get,tasks))
p.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')));print('Cached',sum(results),'of',len(tasks),'arrangements')
