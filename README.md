# Real Player

Dark guitar practice app with recording playback, scrolling tablature, chords and an illuminated fretboard. The mobile practice grid keeps the video, controls, tab and fretboard together. Searchable thumbnail library, artist credits, favorites, Random Song using the shared library/catalog filters and search, slowdown, five-second jumps, scrubbing and A–B loops are included.

## Reference recordings

The curated list covers **83 tunes**; the remaining catalog still needs reference selection. The listening default now prioritizes a curated historical reference with a recognizable head. Artist, release, selection rationale and supporting links appear beside the player. Use **Reference recordings** to browse the reviewed selections; use **Synced studies** for the existing performance-aligned parts. Exact reference uploads play from their opening, with no inherited solo offset or invented tablature sync.

Some selections still need direct listening review, which is stated in their details. Tunes without a curated reference remain marked pending. See [the selection policy](RECORDING_POLICY.md) and `data/reference-recordings.json` for evidence and scope. Existing transcription-coverage numbers below do not count the new listening-only references as synchronized performances.

## Current coverage

- 2,936 catalog entries; 4,971 unique playable MIDI parts and 1,386 unique performance timelines. Shared catalog aliases are not counted as new performances.
- **868 tunes have a matched recording**, including 745 with a matched YouTube upload. 2,068 still need a match.
- 211 of the 399 Real Book index titles have a matched recording; 188 remain pending. 271 have a labeled head study, including 2 whose only head notes are automatic; 128 still lack a labeled head. A MIDI head does not imply a matching head recording.
- 506 matched entries currently offer automatic transcriptions only. 11 are covered only by short aligned arrangement excerpts. Neither category is a claim of an exact artist transcription or full-song coverage.
- 31 Joe Pass parts remain available, including nine published original-audio alignments, two estimated-audio renditions and 19 contributor tab studies. Related Joe Pass YouTube performances now cover 28 of these 31 parts (27 distinct videos), separately labeled as listening references. Three generic blues studies remain unresolved. All four Django-related arrangements have historical listening choices; Chez Jacquet correctly uses Matelo Ferret, because Django did not record it. None of these new listening links claims tab synchronization.

The goal remains a matched recording for every tune. Search-only videos and guessed offsets do not count. The full readable Miditar/Keyer collection remains available, including material outside the Real Book. The current repository audit accounts for **all 4,390 MIDI paths**: 3,324 in Keyer and 533 distinct Miditar files plus 533 byte-identical offline copies. 4,389 paths map to playable parts; the remaining Stranger on the Shore file has no pitched notes. The damaged Chris Potter MIDI is recovered from 413 published notes with its original pitch sequence verified. Four other missing WJazzD solos were recovered from published note/beat annotations, bringing the collection to all 456 WJazzD studies. Use the Miditar, Keyer, Joe Pass and Django filters in the full catalog. [Complete library audit](https://santismo.github.io/real-player-jazz/data/library-audit.json) · [Listening coverage CSV](https://santismo.github.io/real-player-jazz/data/listening-coverage.csv).

**887 tunes have at least one listening recording; 2,049 still need one.** This count includes independent references and supplied/estimated studies. It does not mean 887 historical head choices: only 83 have curated head references, and direct listening remains pending for 69 of those. A recheck of 36 previously unavailable published YouTube IDs recovered no embeddable videos; the exclusions remain documented.

## New recording sources

| Source | Included material | Accuracy and scope |
| --- | --- | --- |
| PiJAMA | 744 exact-upload piano transcriptions across 454 existing entries | Automatic upper-line reduction; not a verified melody. No chord/bar timing supplied. |
| JazzSAMBA | 75 original band recordings with heads | Automatic horn notes; published head sections, bars and chords. Streams the actual band audio, not a different reference YouTube performance. |
| PIAST | 83 exact-video piano melody parts | Automatic beat-quantized melody, chord and bar estimates; approximate note timing. |
| MulTTiPop | 19 excerpts across 15 tunes | Short aligned MIDI arrangements, not exact artist transcriptions or complete heads. The covered passage loops by default. |
| GAPS | Four full guitar arrangement transcriptions | Published score/video alignment, now including Stephanie Jones's The Sound of Silence. Guitar fingering is suggested. |

85 existing catalog aliases now expose their already-matched performances as separate selectable parts. Their original arrangement MIDIs remain unaligned. Horace Silver's Peace and Ornette Coleman's different composition are separated.

A curated reference loads first for reviewed tunes, with a head study ready in MIDI mode. For other tunes, the existing matched-head/study preference remains; the Head button opens the melody study. Explicit artist or part choices are preserved. Every matching recording drives the same tab/fretboard clock. Automatic notes and excerpts are labeled in the practice view, including on mobile.

## Timing and verification

Tests check every bundled MIDI and performance timeline, original pitch sequences and onsets, exact recording IDs, source offsets, excerpt bounds, head priority, guitar mapping, tab spacing and reversible scrub coordinates. Browser checks cover desktop/mobile layout, seek, rate and A–B looping. Source provenance and metadata checks are not an independent listening audit of every YouTube upload. Regional availability and upload changes can affect playback.

JazzTube offsets use roughly 0.2-second resolution. Parker head/video matches are inferred from long matching note sequences and fitted timing, not direct YouTube audio verification. Two timing anchors retain measured speed differences. Short transcriptions need not cover a full upload.

Most guitar fingering is suggested. Contributor string/fret positions are retained when valid for Joe Pass tab studies; they are not independently verified artist fingerings. Score repeats and expressive notation may need review. Jeannine has a long contributor repeat, and four artificial harmonics in The Shadow of Your Smile remain unverified. Missing chord annotations are not invented; generic MIDI chart placement is labeled estimated.

## Run and deploy

No dependency installation is needed. Run `npm test`, then `npm run build`, and serve `dist/` over HTTP. The included GitHub Actions Pages workflow builds, tests and deploys this relative-path static app on pushes to `main`. The repository is [santismo/real-player-jazz](https://github.com/santismo/real-player-jazz); the public Pages copy is [Real Player on GitHub Pages](https://santismo.github.io/real-player-jazz/). GitHub Pages is the maintained version for this update. The earlier ChatGPT Site has not been redeployed.

Favorites, imported MIDI and custom timing are browser-local. They do not automatically transfer between the two website addresses. No account or API key is needed for the GitHub Pages copy. YouTube and streamed source audio still require an internet connection.

## Source and reproduction

- `app.js`, `core.js`, `style.css`: player, timing, tab/fretboard and responsive layout.
- `vendor/midi.js`: Keyer's MIDI reader.
- `data/catalog.json`: current source/recording index and coverage totals.
- `data/performance/`: note events and available bar/chord/section timings.
- `data/coverage.csv`, `data/head-coverage.csv`: current coverage audits.
- `data/library-audit.json`, `data/repository-import-audit.json`: complete pinned file inventories and import decisions.
- `data/reference-recordings.json`, `data/artist-recordings.json`: historical head choices and separate artist listening links, with evidence.
- `data/listening-coverage.csv`, `data/recording-recheck.json`: listening coverage and unavailable published-video rechecks.
- `data/{pijama,jazzsamba,piast,multtipop}/`: source MIDI, provenance audits and source terms.
- `scripts/*-inputs/`: retained reviewed import manifests and metadata; `scripts/sync-research/`: excluded/unverified recording candidates and title corrections.

The original catalog builder is a baseline importer. Do not run it over expanded data without replaying subsequent imports and preserving the Peace composition correction. Existing importers cover repository heads, all repository MIDI, extra scores, Parker, JazzTube, Leduc, Joe Pass, GAPS and cross-aligned head videos. Run the head-video importer after Parker, which resets its recording list.

This update can be replayed with `node scripts/import-pijama.cjs`, `node scripts/import-jazzsamba.cjs scripts/jazzsamba-inputs/manifest.json`, `node scripts/import-piast.cjs`, and `node scripts/import-multtipop.cjs scripts/multtipop-inputs/manifest.json scripts/multtipop-inputs/youtube-availability.json`. Catalog alias mappings are retained in `data/catalog-match-audit.json`; run `node scripts/import-catalog-matches.cjs` with its retained reviewed input manifest. Finish with `node scripts/update-coverage.cjs` to regenerate totals and CSVs. PiJAMA and PIAST preserve their original polyphonic MIDI separately from the selected playable line.

`about.html` contains source attribution and detailed scope. PiJAMA and PIAST specify CC BY-NC 4.0; MulTTiPop specifies CC BY 4.0. WJazzD uses ODbL 1.0 / Database Contents License. Other source terms are retained with their data. Third-party compositions, scores and recordings retain their respective rights. YouTube videos are embedded, not bundled; original dataset audio streams from its pinned source except two retained public Joe Pass sample recordings.

The completeness update is reproducible with `python3 scripts/recover-published-solos.py`, then `node scripts/update-coverage.cjs`, `node scripts/audit-library.cjs`, `node scripts/correct-guitar-credits.cjs`, and `node scripts/audit-listening.cjs`. Source inventories, original damaged MIDI and published CSV archives are retained; no audio playback or guessed offsets are required.
