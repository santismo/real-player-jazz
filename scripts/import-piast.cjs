const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../data/catalog.json');
const rows = JSON.parse(fs.readFileSync(process.argv[2] || 'scripts/piast-inputs/manifest.json'));
const provider = 'PIAST · Bang et al.';
const audit = [];
fs.mkdirSync('data/piast/original', {recursive: true});
function copy(from, to) {
  if (path.resolve(from) !== path.resolve(to)) fs.copyFileSync(from, to);
}
for (const row of rows) {
  const song = catalog.songs.find(song => song.id === row.songId);
  if (!song) throw Error('Unknown catalog tune: ' + row.songId);
  if (!row.availabilityChecked || !row.videoMetadata?.embeddable || row.status !== 'source-aligned') throw Error('Unchecked PIAST recording: ' + row.sourceId);
  const url = 'data/piast/' + row.sourceId + '.mid';
  const originalMidi = 'data/piast/original/' + row.sourceId + '.mid';
  const performanceUrl = 'data/performance/' + row.sourceId + '.json';
  copy(row.playbackMidiPath, url);
  copy(row.originalMidiPath, originalMidi);
  const performance = JSON.parse(fs.readFileSync(row.performancePath));
  performance.approximateTiming = true;
  performance.timingMethod = row.timingDescription;
  performance.timingCaveat = row.timingCaveat;
  // The released meter grid is inferred, not a manually annotated song form.
  performance.automaticBars = true;
  performance.timelineUnit = 'bars';
  fs.writeFileSync(performanceUrl, JSON.stringify(performance));
  song.sources = song.sources.filter(source => source.id !== row.sourceId);
  song.recordings = song.recordings.filter(recording => recording.sourceId !== row.sourceId);
  song.sources.push({
    id: row.sourceId,
    label: row.channel + ' · piano melody · auto notes / timing',
    kind: 'piano-melody', hasHead: false, automaticNotes: true,
    approximateTiming: true, preferredTrackIndex: row.preferredTrackIndex,
    performer: row.channel, performerSource: 'YouTube channel credit',
    url, originalMidi, performanceUrl, provider,
    sourceUrl: row.sourceUrl, alignmentStatus: 'source-aligned'
  });
  song.recordings.push({
    id: row.youtubeId, sourceId: row.sourceId,
    label: row.videoTitle + ' · automatic melody / timing',
    provider, status: 'source-aligned', automaticNotes: true,
    approximateTiming: true, offset: row.offset, end: row.end,
    availabilityChecked: true, availabilityMethod: row.videoMetadata.source,
    sourceUrl: row.sourceUrl, alignmentMethod: row.timingDescription,
    limitation: row.timingCaveat
  });
  audit.push({...row, midiPath: originalMidi, originalMidiPath: originalMidi,
    playbackMidiPath: url, performancePath: performanceUrl});
}
catalog.piastCoverage = {
  parts: new Set(audit.map(row => row.sourceId)).size,
  recordings: audit.length, tunes: new Set(audit.map(row => row.songId)).size,
  automaticNotes: true, approximateTiming: true
};
fs.writeFileSync('data/piast/audit.json', JSON.stringify(audit, null, 2));
fs.writeFileSync('data/piast/ATTRIBUTION.txt',
  'PIAST · Hayeon Bang and contributors\n' + rows[0].sourceUrl + '\n' + rows[0].paperUrl + '\n' +
  'Published source revision: ' + rows[0].revision + '\n' +
  'License: Creative Commons Attribution-NonCommercial 4.0, as specified in the official project README.\n' +
  'https://creativecommons.org/licenses/by-nc/4.0/\n' +
  'Automatic, beat-quantized piano melody and chord estimates. Exact video identity; approximate note timing. No artist guitar fingering or full-head annotation is claimed.\n');
fs.writeFileSync('data/catalog.json', JSON.stringify(catalog));
console.log(catalog.piastCoverage);
