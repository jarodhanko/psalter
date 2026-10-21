# Psalter 300 photo QA — PARTIAL

## Responsive prose pass

- Rechecked all thirteen printed `W:` stanzas across owner photos `20260829_112745.jpg` and `20260829_112749.jpg`. Wording and punctuation matched; removed only the editorial slash line separators so the prose can reflow. Stanza 7 retains printed `memory` in full text while its sung `mem'-ry` elision stays in `w:`. No notes or `w:` rows changed in this pass.

## Independent scan recheck — 2026-09-27

A read-only second reviewer compared owner photos 256–257 and clean `_300.webp` with the current ABC. All 16 measures, four parts, D-major signature, printed accidentals (including alto D-sharp), visible rhythms and slurs, all 13 stanza transcripts, and the first five printed underlays showed no concrete defect. This was visual source comparison, not audible or physical-device QA. The reviewer could not run the inspector through the machine's default old Node binary; the project-pinned Node is required for that command.

- Ground truth: annotated photos local source evidence (not distributed) (sequence 256, printed page 262) and `20260829_112749.jpg` (sequence 257, printed page 263). The first page contains the complete no. 300 score and stanzas 1–9; the second continues with stanzas 10–13 and then begins no. 301.
- Confirmed the no. 300 boundary and heading: *Divine Retribution for Evil*, tune MERIOR, William B. Bradbury, Psalm 109 / L. M., D major, 4/4. The ABC contains one tune and exactly the 13 stanzas printed across the two photos.
- Compared all three printed music systems against the ABC: soprano, alto, tenor, and bass note positions and durations, including visible ties/slurs and cadences. The handwritten pitch labels agree with the legible notes; no dynamics or other expression marks are printed. The systems contain 5, 5, and 6 measures respectively. No note, rhythm, or form discrepancy was found.
- Stanza wording and order were checked through the final words of stanzas 10–13 on page 263. All stanzas remain in `W:`. The five `w:` rows for stanzas 1–5 are directly supported by the printed underlay. A second read-only reviewer verified their 35 event slots per row (13/10/12 by printed system) against the photo: the extra notes extend syllables at slots 7, 10, and 33. Printed stanza 2 places “many” on one note and the ABC preserves that attachment. The additional `w:` rows for text-only stanzas 6–13 are inferred from their text and the established melodic template; they are not printed underlays. Stanza 7 uses the conventional sung elision `mem'-ry` to fit the eight-syllable second poetic line while the complete printed word “memory” remains in `W:`. Its three melisma extenders occupy the same score slots as the directly printed stanzas; this is a documented editorial performance choice, not a printed later-stanza syllabification.

## Targeted ABCJS parse and render check

The earlier ABCJS `parseOnly` pass found one tune and zero warnings. It produced three source music systems with per-system S/A/T/B note-event counts of 13/12/13/12, 10/10/11/12, and 12/11/13/12. All 13 `W:` stanza texts remain; the directly printed `w:` underlay covers stanzas 1–5 and inferred rows cover 6–13. Initially the new `w:` rows attached only to the last source system, so the three physical ABC music lines in each voice were joined into one logical line without changing any note token. The bundled Node 24 inspector confirms the 35 soprano events now carry all 13 lyric rows, with stanza 7's melisma extenders at events 8, 11, and 34. The renderer's width-based wrapping remains free to lay out the score responsively. The earlier local production-browser desktop rendering showed the 16 measures wrapped into three readable systems with five rows attached; that screenshot predates later inferred rows and does not verify their visual layout. A 390-pixel emulated mobile viewport showed no page-wide horizontal overflow; this is not physical-device approval. Both earlier screenshots are under ignored local source evidence (not distributed).

## Remaining QA

The photographed music and all printed stanza text were reconciled. Stanza 7's underlay, full SATB photo parity, print, audio, and physical-device QA remain open.
