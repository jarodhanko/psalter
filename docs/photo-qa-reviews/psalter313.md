# Psalter 313 — printed-score reconstruction

## Full score-and-lyric approval — 2026-09-28

An independent read-only reviewer compared both owner photos (`20260829_112826.jpg` and `20260829_112831.jpg`), the same-edition clean scan, and current ABC. The event ledger contains 114 note attacks (S 29, A 29, T 28, B 28) in 12 complete 3/4 bars. All SATB pitches/registers, durations, divisions, printed slur and fermata positions, tenor G-sharp, alto C-sharp then C-natural, and the absence of a final fermata agree. All five stanza texts and their underlay agree, including the first phrase's single slurred continuation. No reproducible discrepancy or parser warning was found. A fresh 1400-pixel desktop production render was visually inspected with all parts and stanzas present. Score/photo and desktop-render status: PASS. Audio, physical-mobile, and print-output checks remain separate. The older pending-review statement below is superseded.

## Corrected music and five-stanza underlay — 2026-09-27

The earlier review below missed an incorrect measure structure. The owner photos and same-edition `_313.webp` print **twelve complete 3/4 bars, six on each photographed system**, not the former fifteen ABC bars. All four voices were rebuilt with the printed bar boundaries; each totals 72 eighth-note units. In bars 3 and 9, soprano `E2 F2 G2` is one bar ending with a fermata on G, not a half-plus-quarter bar followed by another dotted-half bar. Bar 6 is soprano `B4 A2` under one slur with the fermata on A; tenor and bass hold the entire bar. The printed G-sharp in tenor bar 5, the C-sharps in alto bar 10, and the following explicit C-natural are retained. No final fermata is printed.

All five stanza rows are now note-aligned `w:` across the two six-bar phrases. The first phrase has fifteen soprano attacks for fourteen syllables, with one `_` continuation on its final slur; the second has fourteen attacks and fourteen syllables. The pinned ABCJS inspector confirms both phrases and all five rows without warning. Complete `W:` texts remain for reading and search. A separate Sol reviewer checked the soprano structure, lyric counts, and targeted inner-voice accidentals against the clean score.

Status: corrected from print with targeted independent review. A second complete SATB event-by-event ledger and audible-device QA remain open. The historical review below is superseded for measure count and lyric underlay.

## Historical review (superseded)

- Ground truth: local source evidence (not distributed) (printed page 272) and local source evidence (not distributed) (printed page 273). No. 313 begins at the bottom of page 272 and its continuation is at the top of page 273; no. 314 starts immediately after it.
- The photos show one LAMBETH setting, “Consecration and Dedication,” William Schultes, Psalm 116 / C. M., in G and 3/4. Compared the boundary, the three score systems, all four SATB parts, visible handwritten pitch labels, rhythms, fermatas, and closing bars. No notation correction was warranted where the photo is legible.
- All five printed stanzas (source numbering 7–11, stored as 1–5) match through their final words: “me?”, “pay.”, “I.”, “pay.”, and “accord.” Text at the continuation agrees as well.
- `W:` is retained. Although the printed text is positioned beneath the music, the syllable divisions and note assignment across the three systems do not establish every lyric slot with enough certainty to create exact ABC underlay. Thus this review does not claim complete lyric-underlay QA.

## Targeted ABCJS parse and render check

ABCJS 6.7.0 `parseOnly` parsed one tune with zero warnings and three music lines. An in-memory DOM `renderAbc` call produced one SVG with 118 noteheads and no exception. This establishes syntactic/render validity, not exact lyric underlay.

No source score or lyric-field change was made in this review.

The existing `node tools/audit-lyric-fields.mjs` check reports 458 viewer arrangements, zero missing lyric fields, and 85 generated arrangements without `w:`; `psalter313` remains on that list. The audit reads generated files, which were not regenerated or edited for this source-only QA.
