import urllib.request,json,pathlib,concurrent.futures,re,csv,unicodedata,time,os
p=pathlib.Path(__file__).parent; d=json.load(open(p/'piast-youtube.json'));d=[r for r in d if re.fullmatch('[A-Za-z0-9_-]{11}',r['track_id'])];ids={r['track_id'] for r in d}
cachefile=p/'piast-video-titles.json';cache=json.load(open(cachefile)) if cachefile.exists() else {}
for r in csv.DictReader(open(p.parent/'pijama-inputs/pijama.csv')):
 vid=r['youtube_url'].split('v=')[-1].split('&')[0]
 if vid in ids and vid not in cache:cache[vid]={'title':r['title'],'author_name':r['artist'],'titleSource':'PIJAMA exact YouTube ID metadata'}
jazz=[r for r in d if 'jazz' in str(r['tag']).lower() and r['track_id'] not in cache][:int(os.environ.get('PIAST_JAZZ_BATCH','300'))]
pop=[r for r in d if 'jazz' not in str(r['tag']).lower() and any(k in str(r['tag']).lower() for k in ['pop','rock','cover']) and r['track_id'] not in cache][:int(os.environ.get('PIAST_POP_BATCH','200'))]
work=jazz+pop
if os.environ.get('PIAST_HIGH_YIELD'):
 exclude=['classical','anime','k-pop','kpop','korean','j-pop','jpop','japanese','game','chinese','chopin','beethoven','new age','new-age','meditation','sleep','relaxation']
 include=['rock','folk','gospel','christmas','holiday','blues','soul','pop','cover','ballad','soundtrack']
 work=[r for r in d if r['track_id'] not in cache and 'jazz' not in str(r['tag']).lower() and not any(w in str(r['tag']).lower() for w in exclude) and any(w in str(r['tag']).lower() for w in include)]
 priority=['rock','folk','gospel','christmas','holiday','blues','soul']
 work.sort(key=lambda r: not any(w in str(r['tag']).lower() for w in priority))
print('existing',len(cache),'fetching',len(work),flush=True)
def fetch(r):
 vid=r['track_id']
 try:
  u='https://www.youtube.com/oembed?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D'+vid+'&format=json';j=json.load(urllib.request.urlopen(u,timeout=12));return vid,{'title':j['title'],'author_name':j.get('author_name'),'titleSource':'YouTube oEmbed','tags':r['tag']}
 except Exception as e:return vid,{'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(8) as ex:
 for i,(vid,j) in enumerate(ex.map(fetch,work)):
  cache[vid]=j
  if i%50==49:
   cachefile.write_text(json.dumps(cache,indent=2));print('checked',i+1,'valid',sum('title' in v for v in cache.values()),flush=True)
cachefile.write_text(json.dumps(cache,indent=2));print('finished',len(cache),flush=True)
