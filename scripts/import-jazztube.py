"""Import published performance timing and recording matches, without copying audio.

Inputs: JazzTube's csv_solos.zip, csv_beats.zip, csv_youtube.csv and our
optional video-availability.json (YouTube oEmbed checks). See data/performance/README.md.
"""
import csv, io, json, pathlib, sys, zipfile, re, struct, unicodedata

root = pathlib.Path(__file__).resolve().parents[1]
inputs = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'scripts/jazztube-inputs'
catalog = json.loads((root / 'data/catalog.json').read_text())
melodies = zipfile.ZipFile(inputs / 'csv_solos.zip')
beats = zipfile.ZipFile(inputs / 'csv_beats.zip')
videos = list(csv.DictReader((inputs / 'csv_youtube.csv').open()))
availability = json.loads((inputs / 'video-availability.json').read_text()) if (inputs / 'video-availability.json').exists() else {}
out = root / 'data/performance'
out.mkdir(exist_ok=True)
counts = dict(solos=0, recordings=0, tunes=0, bookTunes=0, availableRecordings=0)
def rows(archive, name):
    return list(csv.DictReader(io.StringIO(archive.read(name).decode())))
def num(value):
    return round(float(value), 6)
def normalize(value):
    value = unicodedata.normalize('NFKD', value)
    value = re.sub(r'\([^)]*\)', '', value)
    value = re.sub(r'^(the|a|an) ', '', value, flags=re.I)
    return re.sub(r'[^a-z0-9]', '', value.lower())
def vlq(value):
    result = [value & 127]
    while value >> 7:
        value >>= 7
        result.insert(0, (value & 127) | 128)
    return bytes(result)
def performance_midi(notes):
    # 20,000 ticks/second; retain expressive timing without source SMPTE issues.
    events = [(0, -1, bytes.fromhex('ff510307a120'))]
    for n in notes:
        start = round(n['time'] * 20000)
        end = max(start + 1, round((n['time'] + n['duration']) * 20000))
        events += [(start, 1, bytes([0x90, n['midi'], 90])), (end, 0, bytes([0x80, n['midi'], 0]))]
    track, previous = b'', 0
    for tick, _, payload in sorted(events):
        track += vlq(tick - previous) + payload
        previous = tick
    track += b'\x00\xff\x2f\x00'
    return b'MThd' + struct.pack('>IHHH',6,0,1,10000) + b'MTrk' + struct.pack('>I',len(track)) + track
extras_path = inputs / 'additional-solos.json'
if extras_path.exists():
    for extra in json.loads(extras_path.read_text()):
        sid = normalize(extra['title'])
        song = next((s for s in catalog['songs'] if s['id'] == sid), None)
        if song is None:
            song = dict(id=sid, title=extra['title'], realBook=False, sources=[], recordings=[])
            catalog['songs'].append(song)
        if not any(s['id'] == extra['id'] for s in song['sources']):
            song['sources'].append(dict(id=extra['id'], label=extra['performer']+' · solo study', kind='solo', performer=extra['performer'], bpm=extra['bpm'], url='data/solos/reconstructed/'+extra['id']+'.mid', sourceUrl='http://mir.audiolabs.uni-erlangen.de/jazztube/solos/solo/'+extra['id'][7:], generatedFromPerformance=True))
for song in catalog['songs']:
    song['recordings'] = [r for r in song.get('recordings', []) if r.get('provider') != 'JazzTube']
    matched = []
    for source in song['sources']:
        if not source['id'].startswith('wjazzd-'):
            continue
        pairs = [r for r in videos if r['melid'] == source['id'][7:]]
        if not pairs:
            continue
        stem = pairs[0]['query']
        ns = rows(melodies, 'csv_melody/' + stem + '.csv')
        bs = rows(beats, 'csv_beats/' + stem + '.csv')
        notes = [dict(id=i, time=num(n['onset']), duration=num(n['duration']), midi=int(float(n['pitch'])), velocity=90) for i,n in enumerate(ns)]
        if source.get('generatedFromPerformance'):
            midi_path = root / source['url']
            midi_path.parent.mkdir(exist_ok=True, parents=True)
            midi_path.write_bytes(performance_midi(notes))
        last_beat_duration = max(0.05, num(bs[-1]['onset']) - num(bs[-2]['onset'])) if len(bs)>1 else .5
        duration = max(max(n['time'] + n['duration'] for n in notes), num(bs[-1]['onset']) + last_beat_duration)
        downbeats = [b for b in bs if b['beat'] == '1']
        bars = [dict(time=num(b['onset']), end=num(downbeats[i+1]['onset']) if i+1<len(downbeats) else duration, index=int(b['bar']), section=b['form']) for i,b in enumerate(downbeats)]
        chordrows = [b for b in bs if b['chord']]
        chords = [dict(time=num(b['onset']), duration=(num(chordrows[i+1]['onset']) if i+1<len(chordrows) else duration)-num(b['onset']), text=b['chord'], bar=int(b['bar'])) for i,b in enumerate(chordrows)]
        data = dict(provider='JazzTube / Weimar Jazz Database', sourceId=source['id'], notes=notes, bars=bars, chords=chords, duration=round(duration,6))
        (out / (source['id'] + '.json')).write_text(json.dumps(data, separators=(',',':')))
        source['performanceUrl'] = 'data/performance/' + source['id'] + '.json'
        counts['solos'] += 1
        for pair in pairs:
            check = availability.get(pair['youtube_id'], {})
            # Failed metadata checks are retained in the audit inputs, not offered as playable.
            if check and not check.get('available'):
                continue
            r = dict(id=pair['youtube_id'], sourceId=source['id'], label=source['performer']+' · '+(check.get('title') or song['title']), status='source-aligned', provider='JazzTube', offset=num(pair['solo_start_sec']), end=num(pair['solo_end_sec']), sourceUrl='http://mir.audiolabs.uni-erlangen.de/jazztube/solos/solo/'+pair['melid'], availabilityChecked=bool(check.get('available')), checkedAt='2026-10-28' if check else None, alignmentResolutionSeconds=0.2)
            matched.append(r)
            counts['recordings'] += 1
            counts['availableRecordings'] += bool(check.get('available'))
    song['recordings'] = sorted(matched, key=lambda r:not r['availabilityChecked']) + song['recordings']
    if matched:
        counts['tunes'] += 1
        counts['bookTunes'] += bool(song.get('realBook'))
catalog['recordingCoverage'] = counts
catalog['songs'].sort(key=lambda s:s['title'].lower())
(root / 'data/catalog.json').write_text(json.dumps(catalog, separators=(',',':')))
print(json.dumps(counts, indent=2))
