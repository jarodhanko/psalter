# Printed-note recheck begun 2026-10-08

This is a new, bounded, independently transcribed printed-source review requested after the hymn work. It does not turn historical metadata/parser checks into note-level certification. Source baseline: the historical reviewed source, the historical reviewed source.

## First batch: numbers 1–3

- **1, MEDITATION:** 112 SATB pitches/octaves and scoped accidentals agree; 111 durations are clear in the matching E-flat engraving. Alto “his” has a pale/open-looking notehead in that low-resolution source. A distinct 1912 E-major archival print corroborates the current quarter-note duration; the exact matching-edition pixel ambiguity remains qualified. No correction recommended. Soprano “fear” remains G4 dotted quarter.
- **2, REDEEMER and SARDIS:** all 243 SATB pitches/octaves/durations and accidental scope agree. SARDIS has one flat, not three. All 62 first-verse soprano underlay slots agree, including its two melismas. No correction. Exact single/double barline typography at some low-resolution internal/system edges remains outside approval.
- **3, HERALD ANGELS:** all 291 canonical SATB notes, five optional cue-bass noteheads, and the existing supplemental small F-sharp head agree, along with nine slurs, the cue-bass tie, and all four stanzas’ underlay. Two independently read parts encoded an extra double bar after measure 5. Both printed staves show a single bar; soprano and alto are corrected from `||` to `|`. No pitch, rhythm, lyric, tie, or slur changes.

These are printed-score comparisons, not new playback or device-layout certifications. Each number has a separate manual event ledger and source hashes in retained audit evidence. Every ambiguity is retained rather than guessed.

## Source identity

Matching engravings: [jrvermeer/Psalter2025 pinned 1912 score directory](https://github.com/jrvermeer/Psalter2025/tree/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score), files `_1.webp`, `_2.webp`, `_2_2.webp`, `_3.webp`.

[The Psalter PDF](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf), SHA-256 `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`: number 1 on PDF page 20, both number 2 tunes on page 21, number 3 on pages 22–23 (one-based). The PDF embeds the same low-resolution engraving lineage; enlargement is not independent higher-resolution evidence.

Number 1 rhythmic corroboration: [original 1912 archival scan, printed page 7](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0013.jp2), 2156×3202, SHA-256 `6a01e4d69309e31fe014dfdcb749811deb562ca29c23a09e0bca19b13a427be1`. Its E-major key differs from the matching E-flat arrangement; it is used for the disputed duration only, not as authority to change the current key.

## Regression evidence

The measure-5 barline test fails against the previous number 3 source and passes after the two-character correction. ABCJS emits no warnings; comparison of all musical events excluding character positions is identical. Full release gates remain required for publication.

Native verification caught an important dependency before promotion: number 3’s supplemental small F-sharp at the final bar is guarded against the exact canonical source. Its witness is rebound to the two corrected barlines, preserving all 297 printed heads and the existing full-score accompaniment projection. A canonical-import regression now checks this binding and identical projected MIDI. The initial preview missing this head was not promoted.
