# Psalter 296 photo QA — underlay reviewed; full music QA open

## Five-stanza underlay — 2026-09-27

The owner photo on printed p. 258 shows a uniform seven-syllable mapping across each nine-note phrase: lyric syllables attach to phrase events 1, 3, 4, 5, 6, 8, and 9, while events 2 and 7 continue the preceding syllable. The ABC groups six phrases into three 18-event soprano source lines. All five complete stanzas are now attached as `w:` rows to those three lines with `_` at each source-line event 2, 7, 11, and 16. Pinned ABCJS reports 18/18/18 first-voice slots, five matching lyric rows per line, and no warning. The complete `W:` text remains for reading and search.

This corrects the older no-underlay status below. It does not certify an exhaustive SATB pitch/rhythm comparison or responsive/audio/print behavior.

- Ground truth: annotated photo local source evidence (not distributed) (photo 252, printed page 258). It contains the complete no. 296 setting; the preceding page has no. 295 and the following photo begins no. 297.
- Photo-visible heading: “Providential Visitations,” Psalm 107, 7s, GREATOREX by Chester G. Allen. The score is in A-flat major and 9/8. Five stanzas are printed, and the footer reads `[Stanzas 16-20]`.
- The five printed stanzas and the existing four-part S/A/T/B notation remain in the source. I made no pitch, rhythm, or voice edits.
- Independent photo recheck confirms five parallel, syllabified stanza rows beneath the score and five full stanza texts in `W:`. Each stanza has six 7-syllable lines (42 syllables); the source soprano has 54 note events. The printed lyric rows cross score-system breaks, and this photo alone does not establish a complete event-by-event mapping for all five stanzas, especially which note events sustain a syllable. I therefore left the source unchanged and did not add guessed `w:` assignments. The earlier misplaced `w:` rows remain corrected as `W:`.

## Targeted ABCJS parse and render check

Prior pinned Node v24.19.0 / ABCJS `parseOnly` review found one tune with no warnings, one subtitle-only line, and three parsed score lines, with two staves and two voices per score line. Event totals were S/A/T/B = 54/47/48/42; parsed soprano line counts were 18/18/18. The five `W:` stanzas end `sin`, `yields`, `woe`, `joy`, and `read`; there are no `w:` assignments. Rendering was not repeated for this independent photo review.

## Remaining QA

The photo identity, page boundary, heading, printed stanza set, and footer are checked. Independent event-by-event SATB photo-to-render comparison and exact lyric alignment through the final words of all five stanzas remain open. Scratch verification files, if needed for further alignment work, belong under `temp/`; no generated files or shared documents were changed.
