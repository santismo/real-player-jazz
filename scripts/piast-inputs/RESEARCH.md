# PIAST source expansion and Aria evaluation

## Integration inputs

- `piast-integration-manifest.json`: reviewed existing-catalog target, exact YouTube ID, original MIDI, converted source melody MIDI and JSON, source clock/offset, video end, automatic-note caveats.
- `midi/`: original PIAST files from pinned Hugging Face revision `f391794c63b24ec30f558274c075ae2890ba028c`.
- `converted/`: timed single-line MIDI plus performance JSON. Source melody selection is usually original track 2 (`melody`); original piano fallback track is identified in the JSON.
- `piast-video-bounds.json`: official public watch-page duration and embed availability metadata.
- `piast-video-titles.json`: cached public YouTube oEmbed titles and authors. Unrelated/ambiguous titles are not accepted just because they contain a catalog title.
- `safe-duplicate-targets.json`: two independently reviewed same-work catalog aliases, if desired.

## What is preserved

The published full-video audio clock is used for intact full-video identifiers, with offset 0. No constant latency adjustment is applied. Every original tempo change is used to convert MIDI ticks to seconds. Performance notes use the dataset's explicitly named melody track; this track is automatically extracted and beat-quantized, not a manually verified head or guitar transcription. Original polyphonic piano notes remain in the archived original MIDI. Guitar fingering is not part of PIAST.

Bar boundaries are computed from the source MIDI meter grid and original tempo changes. Chord labels are translations of the source's automatic `root_quality_bass` markers, with their original marker text preserved in each event. No catalog chord chart is substituted. Chords, bar estimates and note timing must remain visibly automatic/approximate.

Video length is checked via YouTube's public player metadata, not inferred from MIDI file length. The latter can include many seconds of trailing beat metadata after the final note. The converter limits notes, bars and chord durations to the actual published video duration; tail clipping is recorded per file. It does not stretch or realign the body of the performance. Generated MIDI has the same selected note pitches/onsets as the performance JSON, to sub-millisecond serialization precision.

A shared-video check (`BMhCkB78ZBs`, already in PiJAMA) found PIAST piano notes about 94.9 ms earlier than the other automatic model (median absolute deviation 9.7 ms). This may reflect model latency or beat processing; it is not a measured audio ground truth. No offset derived from that one file is transferred to others. Details: `piast-pijama-timing-check.json`, `check_piast_timing.py`.

## Source and attribution

PIAST: Hayeon Bang, Eunjin Choi, Megan Finch, Seungheon Doh, Seolhee Lee, Gyeong-Hoon Lee and Juhan Nam (2024), “PIAST: A Multimodal Piano Dataset with Audio, Symbolic and Text.”

- Official repository: https://github.com/Hayeonbang/PIAST
- Official dataset: https://huggingface.co/datasets/Hayeonbang/PIAST
- Paper: https://aclanthology.org/2024.nlp4musa-1.2/
- GitHub README license section specifies **CC-BY-NC 4.0**. Its badge and Hugging Face card inconsistently say MIT; preserve the more restrictive CC-BY-NC attribution in the app.

Official source downloader files are saved as `piast-youtube.py`, `piast-yt_cutter.py`, and `piast-yt_main.py`. They download full audio, and long-video parts are `[600*(N-1), 600*N)` seconds. The paper describes beat-synchronized automatic transcription (section 2.2.1).

The text release contains 9,290 records, of which 6,437 are intact 11-character full-video IDs. Most segmented IDs are truncated to 7 characters in the text release; full IDs can be recovered from the official GitHub `file_list/yt_ids.csv` by a unique prefix/part-number match. Do not infer a song's presence in a particular 600-second part solely from whole-video metadata. No segmented file is included in the current reviewed manifest.

## Reproduction

Requires Python 3 and `mido`. Research scripts read the existing catalog and write beside these retained inputs. The Node importer can replay the retained manifest without Python or new downloads.

1. `fetch_metadata.py` obtains the small official metadata and READMEs.
2. `piast_titles.py` obtains and checkpoints public oEmbed titles; it resumes from cache. Environment controls: `PIAST_JAZZ_BATCH`, `PIAST_POP_BATCH`, `PIAST_HIGH_YIELD=1`.
3. `match_titles.py` produces candidates for manual composition review. It intentionally does not promote these automatically.
4. `prepare_piast.py` contains the explicitly reviewed title-to-video mapping and downloads individual pinned MIDI files.
5. `video_bounds.py` checks duration and embedding metadata for selected uploads.
6. `convert_piast.py` creates final source melody notes, source bars/chords, playback MIDI and manifest.

Known rejected collisions include the catalog pop song “Joy to the World” versus the Christmas hymn, “Goodbye” versus “Goodbye Yellow Brick Road,” generic “Melody” in pedagogical descriptions, and “Jelly Roll” versus artist Jelly Roll Morton. AI/Synthesia-generated or title-only ambiguous examples are not promoted. Georgia's abbreviated catalog title remains unresolved and is withheld. Leonard Cohen's Hallelujah does not match the catalog's older jazz standard. Pop recordings of All By Myself and Without You were also withheld after weak source-head identity evidence; they may be different same-name compositions.

## Aria-MIDI evaluation

Official source: https://github.com/loubbrad/aria-midi and https://huggingface.co/datasets/loubb/aria-midi . The main tarball is 8.51 GB; the smallest unique subset is 254 MB. Only the leading archive entries and its 7.64 MB metadata file were streamed for inspection; the full archive was not downloaded. Sample filenames contain numeric file IDs (e.g. `031484_0.mid`) and the 32,522-row metadata has semantic tags and audio quality scores, but no exposed source YouTube IDs or segment timestamps. Sample MIDI contains no identifying text events. The official documented schema likewise gives only metadata and audio scores. Consequently it cannot furnish exact source-media pairing for this task and was not imported. No large archive scan was attempted.


## Completed search coverage

The full intact-ID jazz search covered all 1,807 jazz-tagged entries. An initial 200 non-jazz examples and a final 730 selected rock/pop/folk/blues/gospel/holiday/ballad/soundtrack entries were also checked (excluding explicit Korean/anime/classical/new-age tags in the final pass). Thus the main title cache covers 2,737 IDs. All five additional jazz-tagged long-compilation IDs were checked separately; they were K-pop/new-age/Philip Glass compilation material without a justified standard-to-segment mapping.

`piast-jazz-frozen-manifest.json` preserves the first 71 accepted parts. `piast-integration-manifest.json` is the final combined manifest; later additions are listed separately in `piast-non-jazz-additions.json`. A same-work alias suggestion is separate in `safe-duplicate-targets.json`; it is not counted as a distinct rendition.
