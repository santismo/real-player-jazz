import json,re,pathlib,unicodedata
p=pathlib.Path(__file__).parent;vs=json.load(open(p/'piast-video-titles.json'));cat=json.load(open(p.parents[1]/'data/catalog.json'))['songs']
def norm(t):return re.sub('[^a-z0-9]+',' ',unicodedata.normalize('NFKD',t.lower().replace('&','and')).encode('ascii','ignore').decode()).strip()
prepared=[(s,norm(s["title"])) for s in cat]
cs=[]
for vid,v in vs.items():
 if 'title' not in v:continue
 t=' '+norm(v['title'])+' '
 for s,n in prepared:
  if len(n)>=6 and (' '+n+' ') in t:
   cs.append({'songId':s['id'],'songTitle':s['title'],'youtubeId':vid,'videoTitle':v['title'],'channel':v.get('author_name'),'currentlyMatched':any(r.get('status') in ['source-aligned','verified'] for r in s.get('recordings',[])),'realBook':s.get('realBook',False)})
(p/'piast-title-candidates.json').write_text(json.dumps(cs,indent=2));print('videoschecked',len(vs),'candidates',len(cs),'unmatched',sum(not c['currentlyMatched'] for c in cs));print(json.dumps(cs,indent=2)[:14000])
