# Joe Pass expansion assets

`integration-manifest.json` is the final integration entrypoint. The root agent owns copying assets into the Site and publishing.

- 19 Guitar Pro score parts represent 18 distinct title strings. Night And Day Parts1 and2 share one tune; the GPX is a nearly exact duplicate of Part2 and is excluded.
- 2 additional paired MGU/WAV renditions have estimated 20ms audio alignment: Django's Castle(1964), Meditation(1970) solo. These are NOT independently human-verified alignments and must be labeled estimated.
- No claim of30 verified synchronized additions is supported.

## Conversion

Run `PYTHONPATH=/tmp/joe-python "$CODEX_PRIMARY_RUNTIME_PYTHON" convert_gp.py` for GP3–5 sources. PyGuitarPro parses pitches, string/fret, durations, ties, and tempo changes. Simple repeat signs are expanded in Blue Moon, Jeannine, and Rosetta. No alternate endings are present. Jeannine's source includes10 extra repeats of a56-bar score segment; the resulting study is11:48 and should not be presented as the original rendition's form. Grace notes/expressive effects are not synthesized. Four artificial-harmonic sounding pitches in The Shadow Of Your Smile remain unverified. Source fingering and limitations are retained in JSON.

`refine_mgu.py` reads public paired files in /tmp/joe-free and refines the previous coarse alignment at20ms using constrained dynamic time warping. Its pitch similarity relative to±1/3/5second shifts improves2.56× for Meditation and2.93× for Django's Castle. This is computer consistency evidence, not independent human ground truth. All633/601 retained string/fret positions satisfy standard guitar tuning. Matching note counts/pitch order and generated MIDI onset error≤10µs were checked with Real Player's MIDI parser.

Both MP3s are encoded from the source's paired original WAV with ffmpeg/libmp3lame160kbps. No audio is synthesized from the notes.

## Sources

Public downloadable Guitar Pro archive: https://gtptabs.com/tabs/16/pass-joe.html and its Download All link https://gtptabs.com/storage/archive/pass_joe.zip .

Public paired samples: https://www.djangoinabox.com/free.aspx . The form's Joe Pass Free Songs download supplies Django's Castle1964 and Meditation1970Solo MGU+WAV files.

Other useful primary sources not converted: Bruno Sbordone's8 public PDFs paired withspecific YouTube transcriptions at https://bruno-sbordone.org/category/transcription/joe-pass/ ; Sam Dunn's Yardbird Suite and described For Django album collection at https://www.samdunnguitarist.co.uk/shop . PDF scores still require note extraction and timing verification.

Public Wangchung posts for Cherokee, My Romance, and Out Of Nowhere ConceptII have visible MSCZ downloads and public flags, but their exact attachment download requests returned403 in this environment. Locked Patreon posts were not retrieved. Songsterr Plus exports, disabled TabArchive downloads, and paid transcription bundles were not bypassed.
