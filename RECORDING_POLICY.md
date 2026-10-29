# Choosing a reference recording

Real Player recommends a recording as a model for learning the tune, independently of whether an available transcription can follow it.

## Selection order

1. Confirm the composition. A matching title alone is insufficient; check composer, alternate titles and the actual tune.
2. Choose an established performance that presents the recognizable head and usual form. Prefer the composer's recording, an influential early recording, or a widely taught interpretation by a notable jazz musician.
3. Support the choice with published jazz education guidance, label or artist discography, liner notes, or similarly attributable evidence. Do not claim universal agreement among musicians.
4. Confirm the exact upload belongs to the selected performance and release. Prefer official artist/label uploads where available. A popular search result, famous artist name, or available automatic transcription is not enough.
5. Keep the complete opening. Do not start at a transcription's solo offset. Exact head timestamps require direct review of that upload; unknown timestamps remain `null` and playback starts at zero.

A historically important improvisation can be a poor first melody reference. Highly paraphrased heads, solo-only excerpts, contrafacts, medleys, backing tracks, tutorials and unrelated arrangements must not silently become the recommended recording. Vocal recordings can be useful where they preserve the song melody; explain that choice.

## Evidence and verification

`data/reference-recordings.json` contains the editorial choices and per-recording source links, reason, recording identity and head-review status. This is a curated list, not a broad artist-name scoring rule. `documented` means there is published evidence; it does not mean a human listened to the upload in this update. `listening-pending` makes the remaining review explicit. Metadata availability checks do not establish audio identity, complete head content, embeddability, or regional availability by themselves.

Reference listening and synchronized study coverage are separate. The existing `data/catalog.json` performance mappings retain their own evidence and offsets. A reference has no `sourceId` or automatic timing anchors. Even when the same YouTube ID appears in a study, its solo timeline is not applied to reference playback. User-created reference timing has a separate storage key.

## Defaults and failures

- A selected reference opens first when the user chooses its tune. An explicit artist or part choice continues to open that study.
- Reference listening starts at the opening, while the head is available in MIDI study mode. The app does not animate an unrelated transcription against the reference.
- A failed reference upload stays visibly unavailable, with an external YouTube link. It must not silently fall back to a different performance.
- Tunes outside the curated list show “Reference selection pending.” Their existing practice studies remain available without being promoted to historical reference status.

## Extending the list

Add a reviewed entry to the reference JSON, including evidence and any unresolved uncertainty. Do not copy the reference onto aliases or similarly titled entries without checking composition identity. Run `npm test` and `npm run build`. Inspect the reference choice, manual study switch, and mobile details. This update is maintained on GitHub Pages; the earlier ChatGPT Site is not being redeployed.

## Related artist performances

`data/artist-recordings.json` covers the Joe Pass collection independently of the recommended melody references. A named release or transcriber link can support a related performance without proving that a contributor score transcribes that exact take. These entries use `associatedSourceId`, never a timing `sourceId`, and remain unsynchronized. An explicit part selection keeps its existing supplied or estimated audio first; otherwise it can open its associated listening reference. Ambiguous blues titles stay pending rather than being filled with covers or arbitrary videos. Django composition arrangements are credited as arrangements, and their reference performer is stated separately.
