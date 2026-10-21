# Psalter 71 — MILLENNIUM printed-source correction

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](release-checklist.md) for release preparation.


The soprano opening incorrectly copied the alto's two eighths, the soprano and bass had four wrong pitch positions, and the tenor had two unprinted slurs. The corrected source contains 185 written SATB attacks, with 64 quarter units in each voice, matching an independently entered complete printed ledger. All five stanzas retain their printed words and syllable onsets.

## Authorities

The adopted A-flat engraving is [The Psalter PDF](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf), one-based pages 113–114, SHA256 `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`. The complete tune continues onto page 114.

A distinct [original 1912 engraving, printed page 63 / leaf0069](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0069.jp2) independently corroborates each correction. Its A-major setting is one semitone above the adopted A-flat setting. It confirms notes, rhythm and slurs after that normalization; it does not authorize changing the adopted key. Both editions engrave stanza 1; the later edition engraves all five underlays, while the 1912 edition supplies stanzas 2–5 in prose. Two readers independently inspected the disputed pixels.

## Corrections

Quarter onsets below count the opening pickup as q0, so each location is independent of bar-numbering convention.

| Voice and onset | Previous ABC | Printed reading and correction |
|---|---|---|
| Soprano q0 | `ED` | E-flat4 quarter, `E2`. The shared full-size head has a quarter stem for soprano and an eighth stem for alto. Alto's subsequent D-flat eighth remains. |
| Soprano q12 | `c2` | B-flat4 quarter, `B2`, on the final syllable of “salvation.” |
| Bass q16 | `A,,` | A-flat3 eighth, `A,`. The full-size upper bass-staff head has opposing eighth beams, shared with tenor. |
| Bass q57 and q59 | `F,4 F,4` | E-flat3 half notes, `E,4 E,4`, on “soul re-.” |
| Tenor q26–26.5 and q28–28.5 | `(C=D)` and `(B,A,)` | The printed eighth-note beams have no slur arcs. Remove only the parentheses. |

Removing the extra soprano opening note also removes its continuation `*` from the first row of each of five stanzas. Word text, later continuation markers and all native alto, tenor and bass note rhythms remain intact.

## Verification

`src/data/__fixtures__/psalter71Printed.json` preserves the independently entered 185-event ledger, 22 temporal bar boundaries, 15 printed slurs and all five syllable-onset maps. `src/data/psalter71Printed.test.ts` checks the complete canonical ledger, all 15 native voice selections, stanza groups and learner spelling, and 45 actual audio callbacks at transpose 0/−2/+2. It verifies pitch, onset, duration through callback end, slur overlap and exact selected-voice muting/default velocity. The old source fails the ledger regression; the candidate passes all 62 focused tests and TypeScript checking.

Additional bounded audit probes passed 1,170 actual prepared-display cases across all selections, 13 stanza configurations, learner off/on and the same three transpositions; 3,500 native-recipient/stanza comparisons; and 15 music-only projections. All 30 inspected source guards remain inactive for this arrangement. No source witness needs rebinding.

The app retains ordinary bar typography where the print has heavy phrase strokes at q8,16,24,32,48. Their timing matches. This correction does not claim visual spacing, browser/DOM layout, acoustic listening, full-suite, build or live-site certification; normal release gates still apply before publication.
