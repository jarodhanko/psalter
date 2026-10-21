# Psalter 310 photo QA

## Final source-photo and desktop-render approval — 2026-09-28

An independent reviewer compared every current SATB event across owner photos `20260829_112818.jpg` and `20260829_112822.jpg` (pp. 270–271), including the continuation, register, note value, four-flat key, explicit natural/restoration signs, printed phrase divisions, and terminal bar. The current score has 36 soprano, 32 alto, 37 tenor, and 32 bass attacks (137 single-pitch events); no mismatch was found. All six printed stanza rows, their underlay/extenders, and complete `W:` wording matched. A fresh production desktop render was visually inspected at 1400 pixels: complete SATB and lyric rows are present, with stanzas 1–5 followed by a second score group for stanza 6, no apparent clipping, duplication beyond the intended tune repeat, or voice swap. The old staged-render count of 139 noteheads below is historical and is not evidence for the current 137-event source. Editorial slash separators were removed from the numbered `W:` fields; printed wording and music are unchanged. Source-photo and current desktop-render QA is PASS. Physical-phone, audio, and print-dialog checks remain separate release gates.

Status: corrected four-voice transcription and six-stanza underlay from the printed score. Full independent SATB event-by-event certification and audible-device QA remain open.

## Reconstruction — 2026-09-27

The prior PASS claim was too strong. A fresh printed-score review found one extra soprano attack in the opening phrase, an extra alto attack at the third phrase pickup, and specific tenor pitch errors. The former eight full-bar grouping also obscured the printed quarter-note pickups and shorter closing bars. The same-edition clean score and both owner photos were used to retranscribe all four voices with common phrase boundaries; each part totals 64 eighth-note units. The printed soprano has 36 attacks, not 37. Its first phrase has a quarter `d2`, while the third phrase has a beamed eighth pair `dc`; these are distinct. The corrected tenor retains the printed return to A-flat after an A-natural in the third phrase.

All six printed stanzas now have `w:` underlay over four melody phrases, with 9, 8, 10, and 9 note events. Four printed melismas per stanza use `_` continuations: one in phrase 1, two in phrase 3, and one in phrase 4. Complete `W:` transcripts remain for reading and search. The pinned ABCJS inspector assigns every stanza's eight syllables to the intended phrase with no parser warnings. The old underlay blocker and old score PASS below are historical and superseded.

## Historical photo review (superseded for music and underlay)

- Ground truth: local source evidence (not distributed) (printed page 270) and local source evidence (not distributed) (printed page 271). No. 310 is “Redemption and Grateful Love,” Psalm 116, Long Meter, CANONBURY, arranged from Schumann.
- Boundary: no. 310 starts below the end of no. 309 on page 270 and its closing system is at the top of page 271, ending before no. 311 begins. No. 309 or 311 material is excluded.
- The photographed score has a four-flat A-flat signature, 4/4 meter, eight complete measures across three systems and four SATB voices. The photographed notes and handwritten pitch labels, paired quarter/eighth figures, natural signs, and terminal double bar agree with the source block. The E-natural, D-natural, and A-natural inflections are explicit; no tie, slur, rest, or fermata is printed in this setting.
- All six stanzas are present in `W:` through their printed final words: “prayer,” “brought,” “need,” “free,” “praise,” and “believed.”
- Underlay blocker: page 270 contains only the opening tune system for no. 310; the melody continues at the top of page 271. Several stanza rows cross the system/page boundary at different words (for example stanza 1 continues from “my” to “faith shall rest”), so the six complete `W:` strings cannot be safely converted by simply inserting the photographed system line breaks. A complete per-stanza mapping to all 37 T1 note events, including any carried syllables, remains unverified; no `w:` rows were added.

## Targeted checks

- ABCJS `parseOnly` and in-memory `renderAbc` on the no. 310 source block: one tune, three parsed music lines, six staff groups with two voices each, one SVG, 139 noteheads; no parser errors.
- Staged-block validator: a historical local-only comparison tool (not distributed) — PASS for block 310.
- No source correction was warranted. `W:` retains all six stanzas without speculative lyric alignment.
