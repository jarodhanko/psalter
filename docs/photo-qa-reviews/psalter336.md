# Psalter 336 photo QA — PARTIAL

## Printed-score and lyric correction — 2026-09-27

The no-underlay findings below describe the former ABC and are superseded. The owner photo and same-edition clean engraving were used to rederive all four SATB systems. Systems 1, 2, and 4 are fully written repeats, not repeat signs; the third system has a distinct melody with dotted-quarter/eighth figures, printed slurs, and soprano A-natural. The tenor register and bass chromatic note were corrected. Both printed stanzas now have native `w:` rows on all four systems, with lyric continuations on the printed soprano slurs and skips on the rests. The tune ROBINSON and composer Thomas Hastings have separate metadata fields. ABCJS parses without warnings. Exhaustive pixel-level independent certification of all inner notes remains open.

- Authority: local source evidence (not distributed) (photo 283, printed page 289). It shows all four grand-staff systems and two printed stanzas under the music.
- The first system has lyrics, so it is not an intentional untexted introduction. The source's eight `w:` rows had been placed after the last soprano line; ABCJS attached lyrics only there (music-line counts `0/0/0/15`).
- I retained both complete stanza texts as readable `W:` fields. Exact note placement across the four systems, especially the longer third soprano line with sustained and short note events, remains unverified from the annotated photo. SATB music was not changed.

## Verification

Pinned Node ABCJS `parseOnly` found no warnings and no lyric attachments; DOM rendering produced one SVG with 275 noteheads. No full lyric-underlay approval is claimed.
