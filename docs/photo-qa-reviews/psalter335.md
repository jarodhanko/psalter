# Psalter 335 photo QA — PARTIAL

## Printed-score and lyric correction — 2026-09-27

The no-underlay and 14/13/14/12 event counts below describe the former ABC and are superseded. The owner photo and same-edition clean scan were used to rederive all four printed SATB systems, including their partial bars, pickup, tenor register, accidentals, slur, two fermatas, and shorter final measure. The revised soprano has 13/12/13/11 events. All three printed stanzas now have native `w:` rows across all four systems; each has one continuation on the fermata-marked slur in system 2. The printed contraction `rev'rence` is preserved in stanza 3. ABCJS parses without warnings. Exhaustive independent pixel-level verification of every inner-voice note remains open.

- Authority: local source evidence (not distributed) (photo 282, printed page 288). It shows all four grand-staff systems and three printed underlaid stanzas.
- The photo confirms the opening system has lyrics, so it is not an intentional untexted introduction. The source's 12 `w:` rows had been placed after the last soprano line; ABCJS attached lyrics only there (music-line counts `0/0/0/12`).
- I retained all three complete stanza texts as readable `W:` fields. Exact syllable-to-note placement, including the extra note events in the first three soprano lines (14/13/14/12 total), remains unverified from the annotated photo. SATB music was not changed.

## Verification

Pinned Node ABCJS `parseOnly` found no warnings and no lyric attachments; DOM rendering produced one SVG with 212 noteheads. No full lyric-underlay approval is claimed.
