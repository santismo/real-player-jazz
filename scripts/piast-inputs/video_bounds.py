import json,pathlib,urllib.request,concurrent.futures,re
p=pathlib.Path(__file__).parent;rows=[r for r in json.load(open(p/'piast-reviewed-new-title-pairs.json')) if r['songTitle'] not in ['All By Myself','Without You']];cachefile=p/'piast-video-bounds.json';cache=json.load(open(cachefile)) if cachefile.exists() else {}
def get(r):
 vid=r['youtubeId']
 if vid in cache:return vid,cache[vid]
 try:
  s=urllib.request.urlopen('https://www.youtube.com/watch?v='+vid,timeout=20).read().decode();m=re.search(r'ytInitialPlayerResponse\s*=\s*',s)
  if m:j=json.JSONDecoder().raw_decode(s[m.end():])[0];d=j.get('videoDetails',{});return vid,{'duration':float(d['lengthSeconds']),'title':d.get('title'),'author':d.get('author'),'playabilityStatus':j.get('playabilityStatus',{}).get('status'),'embeddable':j.get('playabilityStatus',{}).get('playableInEmbed'),'source':'YouTube public watch-page player metadata'}
  raise ValueError('No initial player metadata')
 except Exception as e:return vid,{'error':str(e)}
with concurrent.futures.ThreadPoolExecutor(8) as ex:
 for vid,r in ex.map(get,rows):cache[vid]=r
cachefile.write_text(json.dumps(cache,indent=2));print('bounds',len(cache),'valid',sum('duration' in x for x in cache.values()),'errors',[(k,v) for k,v in cache.items() if 'error' in v])
