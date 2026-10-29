const fs=require('node:fs'),M=require('../vendor/midi.js'),catalog=require('../data/catalog.json');
const django=new Set(['babik-django','chez-jacquet-django','djangos-castle','nuages-django']);
for(const song of catalog.songs)for(const source of song.sources){
 if(django.has(source.id)){
  const midi=M.parseMidi(fs.readFileSync(source.url),source.id),melody=midi.tracks.find(t=>/melody/i.test(t.name));
  if(!melody?.notes.length)throw Error('Missing arrangement melody: '+source.id);
  delete source.performer;source.attributedArtist='Django Reinhardt';source.attributionRole='composer';source.instrument='guitar';source.kind='arrangement';source.hasHead=true;source.headTrackIndex=melody.index;source.arrangementStudy=true;source.provider='Keyer / Band-in-a-Box arrangement';source.label='Head / melody · MIDI arrangement · Django composition';source.attributionNote='The file is a multi-instrument Band-in-a-Box arrangement, not a verified transcription of Django playing.';
 }
 if(source.id==='cherokee-joe-pass'){
  delete source.performer;source.attributedArtist='Joe Pass';source.attributionRole='unverified file attribution';source.instrument='guitar';source.arrangementStudy=true;source.label='Cherokee · MIDI arrangement · Joe Pass attribution unverified';source.attributionNote='The filename attributes this Band-in-a-Box file to Joe Pass; the specific recorded performance is not established.';
 }
 if(source.id==='gp-joe-blues'){
  delete source.performer;source.attributedArtist='Joe Pass';source.attributionRole='unverified collection attribution';source.label='Blues · contributor tab · Joe Pass attribution unverified';source.attributionNote='The source file has no artist, title or album metadata. Joe Pass attribution comes only from the collection directory.';
 }
}
const audit=require('../data/library-audit.json');
const collections=new Map();for(const row of audit.files){if(!row.sourceId)continue;const set=collections.get(row.sourceId)||new Set();set.add(row.repository.split('/')[1]);collections.set(row.sourceId,set);}
for(const song of catalog.songs)for(const source of song.sources)if(collections.has(source.id))source.collections=[...collections.get(source.id)].sort();
fs.writeFileSync('data/catalog.json',JSON.stringify(catalog));
console.log('Corrected arrangement attributions and indexed repository collections.');
