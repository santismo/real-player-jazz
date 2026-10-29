# Reference recording update — 2026-10-29

- 39 curated references with artist/release identity, selection reason, evidence links and explicit head-review status. All exact video IDs returned YouTube metadata. This is not a complete-library listening audit.
- All 28 automated checks passed, including 5,178 bundled MIDI-part checks and 1,593 performance timelines. Three new tests verify reference priority, explicit study choice, separation of solo offsets, and evidence/identity fields. Those three passed again after refining the default melody choice.
- Silent browser checks confirmed the new default on Jordu and Blue Bossa, the reference filter with filtered Random, Head/MIDI switching, and switching between a synchronized study and an unaligned reference without retaining its anchors. Desktop and 390px phone layouts were inspected.
- The browser preview returned “This video is unavailable” for both new official reference uploads and an existing matched upload. Playback and regional embeddability remain unverified. No audio was played during verification. Unavailable references retain a direct YouTube link and do not silently switch performances.
- Direct listening review remains pending where stated in the reference JSON; all exact head timestamps remain null and reference playback starts at zero. Existing transcription matches are unchanged.

---

# Validation — October 28, 2026

- Nine automated tests pass: all 706 MIDI files parse and map to playable guitar notes; 408 performance timelines retain the MIDI pitch sequence; note/chord/bar times are chronological; every published recording points to its own performance source; seek maps are invertible and loops validate endpoints.
- Checked YouTube metadata for 778 distinct uploads in the published source list: 562 succeeded. The subset matching this app contains 706 recording/solo pairs across 562 uploads and 207 tunes (47 in the indexed Real Book).
- Browser checked at desktop width and in 390×844 and 375×667 CSS-pixel phone frames. At 375×667 the fretboard panel ends at pixel 662. Video, controls, tab and fretboard remain visible together. Library and settings open separately; recording and part choices are accessible from settings.
- MIDI playback, seeking, A/B controls, library search, catalog filtering and mobile settings were exercised in the browser. Corrected an undefined playback-rate response during YouTube initialization.
- YouTube metadata/embedding loaded, but media playback did not reliably advance in this environment. A media download returned unavailable HTML instead of audio. Therefore end-to-end video playback and independent acoustic synchronization are **not verified**.
- Published JazzTube timing is applied exactly as the source renderer does: video time = annotation onset + upload offset. Offsets have approximately 0.2-second resolution. This is source alignment, not a claim of sample-accurate checking.
- Remaining work includes recording matches for 341 indexed Real Book tunes, checked Joe Pass/Django takes, and independent full-performance timing verification. Suggested guitar fingering does not establish the artist's actual string/fret choices.
- GitHub Pages workflow is included. The app is hosted as a private ChatGPT Site. GitHub Pages source and workflow are preserved for a later move; no GitHub repository was created.

## Guitar audio and library update

- Added 79 published performance-aligned guitar MIDI/audio pairs, including nine Joe Pass recordings. Audio URLs are pinned to dataset revision a38306c244b3ea81496ad58b4514622185e58211. There are no new Django recording matches; the minimum 50 Joe Pass/Django goal remains incomplete.
- Browser played Joe Pass Bluesette from its source audio, observed current-time and simultaneous note readout advancing, checked 0.5× rate, seeking to 12 seconds, and A/B endpoints at 12–17 seconds. Full acoustic transcription accuracy and artist fingering are not independently audited.
- Mobile 375×667: artist search selects Joe Pass’s Autumn Leaves part and its original audio. All four practice panels fit. The full catalog has an independently scrolling grid; corrected collapsed grid rows with max-content row sizing. Artist names appear on cards and sidebar rows.
- Removed next-note fretboard dots; active marker radius is bounded by both string and fret spacing. Recording loading explicitly hides the placeholder, including reused YouTube players and audio adapters.
- Source audio has no accompanying video or chord annotations. These limitations are displayed; existing unverified guitar MIDI remains a playable study rather than pretending a video is synchronized.

## Fretboard readout removal

Removed the text note readout and upcoming note cards beneath the fretboard on all screen sizes, including their animation-frame updates. Active fretboard markers, string/fret labels, tab, transport, and playback timing remain. JavaScript syntax and production build checked.

## Head-first update, 2026-10-28

- 715 bundled MIDI parts; 417 performance timelines pass pitch/order/duration and guitar-mapping checks.
- 9 new Parker audio/source pairs retain published absolute performance times; MusicXML chord positions are interpolated within published bar anchors.
- Confirmation opening pitch sequence matches the supplied Miditar melody (first 12 notes); defaults to Parker rather than Brecker.
- Regression checks cover head-first fallback, explicit solo selection, melody track selection, and complete 399-title head audit (171 available / 228 pending).
- Browser: Confirmation original audio loads and plays; clock advances, chord/TAB canvas renders, Head seeks to opening.
- No claim of complete Real Book audio matching or 30 new Joe Pass renditions.
- All nine Parker audio endpoints returned HTTP 206 with audio/mpeg and readable bytes.
- Phone QA at 390×844: recording, Head/loop transport, TAB, and fretboard visible together without page scrolling.
