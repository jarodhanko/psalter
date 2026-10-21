# Psalter 321 photo QA — PASS

## Full score-and-lyric approval — 2026-09-28

An independent read-only reviewer compared both owner photos (`20260829_112852.jpg`, `20260829_112856.jpg`), same-edition clean `_321.webp`, and source/generated ABC. ABCJS reports zero warnings. The 16 complete 2/2 bars span the printed page boundary after bar 10 and contain 136 attacks (S 36, A 32, T 35, B 33). Printed SATB pitches/registers, durations, B-natural/G-sharp signs, slur endpoints, final full-note chord, and boundary before no. 322 agree. All four printed stanza texts and their underlay across three source segments agree. A fresh production desktop render was inspected with all parts and lyric rows present. Score/photo and desktop-render status: PASS. Device/audio/print QA remain separate. The older PARTIAL status below is superseded.

## Printed-score reconstruction — 2026-09-27

The old candidate was structurally wrong from its first measure: it began with a full-note soprano F and spanned 24 bars, while the print begins `F2 G A` in 2/2 (“How blest the”) and has 16 full bars, grouped 5 + 5 + 6 across the three printed systems. The canonical ABC has been rebuilt for soprano, alto, tenor, and bass from both owner photos and the clean same-edition engraving. The reconstructed key remains F major. It preserves the printed B-natural/G-sharp signs in the first system, B-natural/G-sharp in the last, the prominent slurs, bass registers, and the final full-note chord.

An independent second reviewer spot-checked the opening four-part notes, 16-bar structure, bass octaves, distinctive accidentals, slurs in bars 2/6/10/14, and final cadence without finding another concrete discrepancy. This is not yet an exhaustive second event-by-event certification or a device render/playback pass. All four stanzas now have note-aligned `w:` rows across the three 12-attack soprano source segments. The printed slurs extend the prior syllable at event 5 of segment 1, events 2 and 11 of segment 2, and event 9 of segment 3; the ABCJS inspector confirms four lyric slots through every final note with no warning. Complete `W:` stanza transcripts remain for reading and search; stanza 3 now spells the printed contraction “wav'ring.”

- Ground truth: local source evidence (not distributed) (printed page 278) and local source evidence (not distributed) (printed page 279). No. 321, “The Blessedness of Obedience,” is HUMILITY by Samuel P. Tuckerman. It begins after no. 320 on page 278 and completes in its third grand-staff system on page 279, ending at its final bar before separate no. 322 / PRESTON. The ABC has three music lines and four voice parts; no neighboring tune is included.
- The photographed score is in 2/2 and shows four numbered stanzas. All four source `W:` stanzas match the printed text through their endings: “heart,” “obey,” “will,” and “turn.” The cross-page phrase sequence and final cadence are represented in the reconstructed source.
- The original review did not establish the score's bar structure and its claim that no source edit was warranted is superseded by the reconstruction above. Handwritten note labels remain secondary to printed noteheads.

## Targeted ABCJS parse and render check

ABCJS 6.7.0 parsed the no. 321 source block as one tune, three music lines (three printed systems), and four voice parts, with zero warnings. In-memory `renderAbc` produced one SVG with 156 noteheads and no exception. Four complete `W:` stanzas are present. This confirms syntax and rendering, not full event-level photo certification or exact lyric underlay.

This original parse/render check predates the reconstructed score and should not be treated as a verification of the current ABC.
