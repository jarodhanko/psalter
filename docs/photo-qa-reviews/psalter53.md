# Psalter 53 source review

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](../release-checklist.md) for release preparation.


## Independent printed-source correction, 2026-10-09

The retained historical photo review below was supplemented by a complete independent reading of [RFPA p95](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf#page=95) and original1912 printed pp50–51 ([leaf0056](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0056.jp2), [leaf0057](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0057.jp2)). The owner photographs are absent from this checkout; this does not certify those unseen photographs.

Both printed witnesses establish a half-note pickup and phrase divisions at elapsed quarter positions 2,8,12,14,20,24,26,32,36,38,44,48. Canonical ABC previously imposed divisions at 6,12,18,24,30,36,42,48. The correction changes bars only; all 112 SATB pitches, onsets, durations, headers and lyric bytes are preserved. Internal single strokes preserve the correct time positions without claiming identical heavy-stroke typography.

Actual callback verification finds 13 intended velocity corrections per selected voice: q0 105→85; q2/8/14/20/26/32/38/44 95→105; q6/18/30/42 105→95. All other playback properties remain identical. All 15 subsets and transpose 0/±2 are checked against the independent manual fixture in `src/data/__fixtures__/psalter53Printed.json`.

`psalter53And54PrintedCorrections.test.tsx` checks the complete printed event ledger, every stanza configuration, learner settings, actual React/ABCJS screen and print preparation, portable export, music-only and runtime rejection guards. Canonical stanza3 “And” versus printed “and” and stanza5 “for ever” versus printed “for-ever” remain explicit typography qualifications. Synthetic JSDOM bounds prove preparation/glyph behavior, not device geometry or acoustic listening. Native-browser visual/print review remains separate.

## Historical partial photo review

- Authority and checked boundary: local source evidence (not distributed) (printed page 50) and local source evidence (not distributed) (printed page 51). The first photo shows the opening four measures and the first half of each lyric stanza; the second photo completes measures 5–8 and the second half of each stanza. Together these are one setting, no. 53, “The Lord Our Shepherd,” Psalm 23, C.M., tune EVAN by William H. Havergal. All five numbered stanzas are printed across the two systems. The next photo, `20260829_111041.jpg`, begins no. 55; no. 53 does not continue there. No alternate tune or refrain is printed for no. 53. No copyright notice is visible for no. 53 in either checked photo; the earlier attribution of a neighboring-no. 54 notice was unsupported and is withdrawn.
- Correction: added `R:Psalm 23; C.M.` and transcribed all five printed stanzas into the `psalter53` soprano lyric fields in `src/psalter-abc.ts`. Existing music-note fields were preserved. The stanza texts were checked across both photos, including printed hyphenation and punctuation.
- ABCJS `parseOnly` check: one tune, no parser warnings; 28 soprano note events; all five lyric stanzas assign to all 28 events (140 stanza/event assignments, no unassigned melody events). This is parser assignment coverage only, not proof of visual fit against the printed noteheads.
- Remaining QA: the photos were not reconciled event by event against every SATB pitch/register, rhythm, accidental, barline, and mark; note-to-syllable alignment has not been checked against the noteheads; and a fresh current render has not been visually reviewed. No full musical-content or render PASS is claimed. Overall status is PARTIAL.
