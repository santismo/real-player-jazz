# Leduc YouTube sync research

Public channel: https://www.youtube.com/@FrancoisLeduc/videos
Retrieved 777 public video entries, including 63 titles naming Joe Pass. Raw channel metadata is in leduc-youtube-channel.json. Candidate mapping is in leduc-youtube-candidates.json; 68 of 79 dataset titles have 73 candidate videos (including ambiguous renditions). These are candidates, not verified synchronization results. Every offset is null.

All nine Joe Pass Leduc dataset titles have official transcriber YouTube uploads. Useful candidates:

- Bluesette: Tnl4VCLKaZM
- Stardust: d3SHWATEjbc
- All the Things You Are: NV-GhJNsOG0 (242 seconds, close to source audio 241.543); yQPaiJOIeqo and 10yupbzEYZA are additional variants and must not be confused.
- Autumn Leaves: OV6nTsh1pF4
- Someone To Watch Over Me: bHNmsU1EeB4
- Li'l Darlin live: D9Oro2r3Quw
- They Can't Take That Away From Me: EA7eyF9BuAQ
- Night and Day: hA0b9SPZjyM (219 seconds, close to source 218.402); snaKq4WcsxU is another version.
- White Christmas: 8uIhS1ywof0

No new YouTube synchronization is verified in this research. Matching the official uploader and approximate duration is useful identity evidence, but it cannot prove an offset or verify that the same performance edit is used. Stardust in particular has about 8 seconds' duration difference.

Blockers and checks:

- HF dataset README and metadata publish artist, title, Soundslice ID, audio/MIDI paths and syncpoints, but no YouTube IDs or YouTube offsets.
- The transcriber's current standalone Stardust page is membership-gated; no gated material was accessed.
- Normal public YouTube metadata and channel listings are accessible. Attempts to fetch Bluesette audio (both listed WebM and M4A formats) and Stardust WebM returned a 195-byte Site Unavailable HTML response, not playable audio. Invalid placeholder files were removed. Thus audio fingerprint/cross-correlation cannot be run against YouTube here.
- Source HF MP3s for Bluesette and Stardust were obtained successfully for future correlation.
- The only shared performer name between WJazzD and these 79 Leduc files is Pat Metheny. Leduc provides a Lugano medley; WJazzD provides All the Things You Are, Cabin Fever, Midnight Voyage and Nothing Personal. No direct shared-title recording was found for transferring the existing verified JazzTube timing.
- DIAB Meditation is a 100-second 1970 solo excerpt; the public Leduc Meditation video is 323 seconds and is not an established match. No offset was inferred.

Recommended next verification: compare playable candidate audio to each pinned HF MP3 using multiple 10–20 second windows spread across the recording. Accept only stable offset and near-1 speed across windows; save anchors and residuals. If a different edit is found, use a piecewise map with explicit evidence. Existing original-audio synchronized playback should remain available until then.


## Follow-up public Soundslice audit (2026-10-29)

All 79 original dataset slice IDs were requested through the anonymous public player endpoint actually used by Soundslice's frontend: `/slices/<id>/scoredata/`. 78 returned recording metadata; Ralph Towner / Fall In Love Too Easily (`CyC4c`) returned 404. Every returned recording is an uploaded audio recording (`s: 2`), with no YouTube video ID and no second recording. None supplies a transferable YouTube time anchor. All nine Joe Pass slices remain publicly accessible as original-audio players.

Sanitized metadata: `soundslice-public-recordings-audit.json`; reproducible fetcher: `audit_public_slices.py`. Signed CDN query parameters were stripped from the audit file. The ordinary public media-URL endpoints for Bluesette and Stardust returned Soundslice-hosted MP3 files (`audio/r/995494/audio1.mp3` and `audio/r/908650/audio1.mp3`), without original YouTube identifiers. No membership-gated content was used.

A fresh normal YouTube M4A fetch still returned the generic 195-byte Site Unavailable HTML. Public storyboard image retrieval also returned this HTML. The existing browser QA session reportedly buffers video to black, so there is no reliable video-frame timing evidence either. No retry loops or access-gate workarounds were attempted.

**Result: 0 new verified YouTube timing pairs.** Existing source MP3 timing remains available; candidate videos retain null offsets.
