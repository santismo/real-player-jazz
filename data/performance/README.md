# Performance annotations and recording matches

Source: JazzTube, AudioLabs Erlangen, with Weimar Jazz Database / Jazzomat annotations.
Public downloads: http://mir.audiolabs.uni-erlangen.de/jazztube/downloads

The original `csv_solos.zip`, `csv_beats.zip`, and `csv_youtube.csv` are retained in
`scripts/jazztube-inputs`. Derived JSON files contain original performance note
onsets/durations, beat-derived bar boundaries, and beat-timed chord annotations.
These replace the MIDI clock when a matching WJazzD part is selected. Do not use
constant-tempo MIDI ticks as a substitute for these original annotation times.

Video time = annotation time + published `solo_start_sec`. This is the same
coordinate mapping used in JazzTube's piano-roll renderer. The published video
matching grid has approximately 0.2-second resolution. Tempo changes within the
source performance are already present in annotation seconds. A constant upload
offset cannot correct speed-changed uploads; these have not been independently
checked against audio here. These are source-aligned matches, not a guarantee of
sample-accurate or manually audited synchronization.

YouTube oEmbed availability was checked October 28, 2026. Failed checks are omitted
from the offered matches and retained in the audit inputs. An oEmbed success does
not guarantee playback in every country, embedded context, or later date.

Annotations remain under WJazzD's ODbL 1.0 / Database Contents License:
https://opendatacommons.org/licenses/odbl/1.0/
https://opendatacommons.org/licenses/dbcl/1.0/
JazzTube citation and project information:
http://mir.audiolabs.uni-erlangen.de/jazztube/about

No source audio or video is distributed. Guitar string/fret placement is generated
by Real Player and is not an annotation of the performer's actual fingering.

Ten previously omitted solos now use standard MIDI files reconstructed from the original performance note onsets, including expressive timing. These are marked `generatedFromPerformance` in the catalog. Conversion tests verify onset error below 0.026 ms and duration error below 0.051 ms.
