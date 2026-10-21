# Psalter 54 source review

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](../release-checklist.md) for release preparation.


## Independent printed-source correction, 2026-10-09

The retained historical photo review below was supplemented by a complete independent reading of [RFPA p96](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf#page=96) and [original1912 printed p51, leaf0057](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0057.jp2). Original1912 is in A major; the adopted RFPA A-flat edition is retained. This is independent printed-source evidence, not certification of an unseen owner photograph.

Both witnesses show the final three syllables as whole–half | whole in all four parts. Canonical ABC previously used three half notes without the last internal bar. The correction gives onsets q38/42/44 and durations 4/2/4, extending the written score from 44 to 48 quarters. All 116 pitches and all lyric bytes are preserved, including bass D-natural carry/restoration and the soprano/tenor melismatic slurs.

The source correction and exact structural audio record are applied together. The existing shared hold now releases the final chord at q50, starting at q44; it adds 2 quarters once. The newly restored final bar changes only that attack's default velocity from 95 to 105 in each audible voice. A corrected-music witness assigns one upright fermata to each surviving staff, including reduced A,AT,B,SB,AB,SAB,ATB selections that previously lost one. Physical canonical hold owners remain T1/B1. No global timing, selection, export or guard policy is relaxed.

`psalter53And54PrintedCorrections.test.tsx` checks the independent 116-event fixture, all 15 subsets and transpose 0/±2, native underlay and stanza grouping, learner settings, actual React/ABCJS screen/print preparation, whole–half–whole glyphs, portable export, music-only, and rejection of stale/mutated sources or missing rendered heads. Synthetic JSDOM bounds prove preparation/glyph behavior, not device geometry or acoustic listening. Native-browser visual/print review remains separate.

## Historical partial photo review

- Authority/scope: local source evidence (not distributed), printed page 51, lower setting no. 54, “Jesus Our Shepherd.” The setting is marked Psalm 23, C. M., tune HERMON by Lowell Mason. All five numbered stanzas and the end of the score are visible. Hymn 53 occupies the upper setting and is excluded. The next hymn is not shown as a continuation of 54; no alternate tune or further continuation for 54 is visible. No copyright notice for hymn 54 is visible in this photo.
- Correction: added `R:Psalm 23, C. M.` and all five printed stanza lyric fields under `psalter54` in `src/psalter-abc.ts`. Existing SATB music was not changed. Stanza text, capitalization, contractions, punctuation, and printed syllabification were checked against the photo, including `faith-ful`, `Shep-herd`, `Sup-ply-ing`, `qui-et`, `ten-der-ly`, `right-eous-ness`, `Thro'`, `val-ley`, `e-vil`, `com-fort`, `ta-ble`, `pres-ence`, `a-noint-ed`, `o'er-flows`, `good-ness`, `dai-ly`, `fol-low`, `for-ev-er-more`, and `dwell-ing-place`.
- Parent photo review corrected stanza 5's final two lines to the printed “And I, within Thy house, O Lord, / Shall ever dwell with Thee.” The earlier draft had inadvertently borrowed the ending of neighboring Psalter 53. Structural ABCJS `parseOnly` check with local source evidence (not distributed): 30 soprano note events and five stanza rows; all 30 note slots have a lyric assignment in each row, with no unassigned slots. Parser assignment does not prove visual lyric-to-note fit.
- Remaining QA: complete SATB pitch/register, rhythm, accidental, barline, and phrase-mark comparison has not been performed, and a fresh render/visual-underlay review remains outstanding. Overall status remains PARTIAL.
