# Psalter 304 photo QA

## Responsive prose pass

- Rechecked all seven `W:` stanzas against owner photo local source evidence (not distributed), printed page 266. Stanzas 6–7 are prose-only addenda below the tune. Words and punctuation matched; removed only editorial slash line separators from `W:`. Notes and `w:` rows were unchanged.

Status: PARTIAL overall. The five stanzas printed beneath the score have photo-verified note underlay. Stanzas 6–7 now have numbered `w:` rows inferred from that printed underlay pattern and their Long Meter text; their placement is not directly printed. All seven complete texts remain unchanged in `W:`. Full independent SATB, audio, and device QA remain open.

## Five printed stanza rows — 2026-09-27

The printed system break unusually splits measure 8: its F4 closes printed system 1 and its F2 begins printed system 2. Both attacks are correct in ABC; the earlier apparent extra note was a line-break misread. The first ABC soprano line therefore has 20 events (19 in the first printed system plus the first event of the second), and the second ABC line has the remaining 19.

An independent read-only scan review derived shared lyric anchors for all five printed rows. In global soprano numbering, printed system 1 has syllables on events 1–6, 8–15, and 18–19, with continuations at 7, 16, and 17. Printed system 2 has syllables on 20–23, 25–28, 30–33, 35–36, and 38–39, with continuations at 24, 29, 34, and 37. The ABC `w:` rows now follow those slots across the source-line boundary. Missing printed soprano slurs at 6–7, 28–29, and 36–37 were restored without changing pitches or durations. The prior unresolved-underlay statement below is historical and superseded.

## Stanzas 6–7 inferred underlay — 2026-09-27

The owner photo prints the complete text of stanzas 6–7 below the music, without note-by-note placement. Their numbered `w:` rows reuse the syllable and continuation slots directly visible in printed stanzas 1–5. In global soprano numbering, each second text row ends its first poetic line on event 19 (the last note of printed system 1), then puts the next line's first syllable on event 20, the split measure's first note in printed system 2. The final lyric syllable lands on event 39 (the last note of printed system 2). The words fit the Long Meter phrases when the usual poetic elisions are represented in `w:` as `cov- nant`, `rev- 'rence`, and `heav'n`; full spellings and punctuation remain in `W:`. This is an inference from the repeated printed underlay scheme, not independent photo evidence of where those later stanzas were placed.

## Photo review

- Ground truth: local source evidence (not distributed), printed page 266, no. 304, “The Marvelous Works of God,” Psalm 111, Long Meter, GERMANY, Gardiner's Sacred Melodies.
- Boundary: the photograph contains no. 304's complete two grand-staff systems and terminal double bar. No. 305 begins below it on the same page; that opening is not part of no. 304.
- The score metadata and notation agree with the photo: two-flat signature (B-flat major), 3/4, four SATB voices, sixteen measures. The earlier review compared pitch labels and staff notation across both systems, including the explicit E-natural, G-flat, D-flat, durations, and rests; the later review above restored three printed soprano slurs that had been missed. No tie or fermata is visible.
- All seven photographed stanzas are present in `W:` through their printed final words: “sing,” “displays,” “kind,” “conferred,” “endure,” “below,” and “praise.” Stanzas 1–5 have directly visible underlay. Stanzas 6–7 have no direct note-by-note placement in the photo; their new `w:` rows are inferred from the five printed rows and meter, and should be treated as less certain.
- Earlier underlay review: the first attempt could not establish the blank positions from the annotated photo alone, so it left the text in `W:`. That gap is superseded by the scan-supported slot map above.

## Targeted checks

- ABCJS `parseOnly` and in-memory `renderAbc` on the no. 304 source block: one tune, two parsed music lines, four staff groups with two voices each, one SVG, 143 noteheads; no parser errors.
- Staged-block validator: a historical local-only comparison tool (not distributed) — PASS for block 304.
- `tools/inspect-underlay.mjs psalter304` using the bundled Node 24 runtime confirms seven lyric sets across two ABC source lines (20 events on line 1, including the split measure's first event of printed system 2, then 19 events on line 2). In global printed-system numbering, stanza 6 and stanza 7 end `know;`/`ways;` at event 19 and `below.`/`praise.` at event 39. No test suite or generation task was run. A full application-layout review of the rendered SVG remains separate from this targeted inspector check.
