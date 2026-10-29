# Imported head score sources

These are symbolic score studies. None of these imports establishes recording alignment or an exact guitarist performance transcription.

- Night Train and Red Clay: The Modern Jazz Fake Book XML collection hosted at https://effendi.me/jazz/repo/ . Downloaded from the exact source URLs in all-heads-ready.json. Original MusicXML credits retained. Website makes XML available without a formal blanket composition license; do not represent songs as public domain.
- Nine OpenBook heads: https://github.com/veltzer/book-openbook at commit e87c232793312d9f6ce404397fb528aa38c829b6 . Main source files by Mark Veltzer and contributors; staging files entered by Laurent Martelli. Current repository MIT license preserved in openbook/LICENSE, copyright2026 Mark Veltzer. Individual compositions retain their original credited rights; original source files preserved. Source licenses apply to contribution/code, not a claim to relicense compositions.
- Freedom Jazz Dance and How My Heart Sings: https://github.com/florento/PSjazzEval at commit b6a559e8bd2719c3279ed0e81554b5cdbab0da03, RealBook evaluation MusicXML output. Repository MIT license preserved in ps-jazz/LICENSE; XML metadata specifies cc-by4.0 and was retained. These are pitch-spelling evaluation outputs: MIDI sounding pitches and durations preserved, enharmonic spelling is not authoritative. XML generic composer Music21 is software metadata, not composition attribution.

# Conversion

MusicXML melody notes were extracted with music21, score repeats expanded, and written as melody MIDI. PSjazz tied notes were combined. Effendi/PSjazz chord markers retained. LilyPond sources were compiled with official LilyPond2.26.0, unfolded repeats, preserved meter, and melody-only MIDI. Waltz For Debby source visible volta1/3 and2 endings were translated into a64-bar AAAB first head; subsequent D.C./coda excluded. Staging source old LilyPond syntax was modernized for Black Orpheus, Las Vegas Tango and Triste. Black Orpheus includes its written coda after the first head; no recording-order claim.

All13 safe MIDI files passed nonempty-note, note-off pairing, valid pitch-range checks. Full House staging conversion is excluded due an unresolved legacy relative-pitch/transposition ambiguity. Use all-heads-ready.json as the exact safe manifest.
