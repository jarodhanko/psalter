# Psalter 365 photo review — partial (both tunes)

- Authority and scope: local source evidence (not distributed) (annotated photo 305), printed page 311, no. 365, “Pardoning Mercy,” Psalm 130, 8s, 5, 3. The page contains four underlaid stanzas with the first tune, BULLINGER (Ethelbert W. Bullinger), followed by a printed “SECOND TUNE” divider and four underlaid stanzas with STEPHANOS (Henry W. Baker). The page ends after the second setting; no. 366 begins on printed page 312 in the next photo, `20260829_113118.jpg`. No copyright or permission notice is visible on page 311.
- Correction: added the photographed tune/composer and Psalm/meter metadata, printed page number, and all four underlaid stanzas to each arrangement in `src/psalter-abc.ts`. Existing SATB music was preserved. Both source comments now point here and are marked PARTIAL.
- ABCJS `parseOnly` structural checks: each arrangement parses as one tune with no parser warnings. BULLINGER has 32 soprano note events and lyric assignment counts of 25, 24, 24, and 24 (7, 8, 8, and 8 note events without a lyric assignment by stanza). STEPHANOS has 30 soprano note events and counts of 25, 24, 24, and 24 (5, 6, 6, and 6 note events without a lyric assignment by stanza). These parser counts do not verify exact syllable-to-note placement.
- Remaining QA: no event-by-event SATB pitch/register, rhythm, accidental, tie, barline, or expression-mark comparison was performed for either tune. Exact lyric underlay fit and fresh current renders remain unchecked. Overall status for both arrangements is PARTIAL; no musical-content or render approval is claimed.

## Independent printed-score review in progress — 2026-09-30

The first-tune BULLINGER review has identified concrete source discrepancies. Its printed key has four flats (A-flat major); the final first-system “high” is a single dotted-half soprano/alto chord, B-flat4/E-flat4, with a fermata, rather than the two source attacks (the earlier provisional G4 reading was corrected by staff-coordinate enlargement). The second-system opening “Hear, O Lord” repeats E4–F4–E4, not the old F4–E4–D4. These findings do not constitute full-tune approval.

An independent lyric review reads all four stanzas as 24 sung syllables (8 + 5 + 8 + 3). In stanza 4, print divides `Is-rael` into two syllables, not `Is-ra-el`; `prayer` is one printed syllable. Exact melisma placement must be derived from the printed noteheads, not the existing 32/30 source attack counts, which themselves may be wrong. Both arrangements remain PARTIAL.

The primary reviewer checked the owner's complete printed page and the clean scans. Both arrangements now include four complete numbered `W:` stanza transcripts for search and the lyrics panel, and stanza 4's source syllabification has been corrected to `Is-rael`. These are text corrections only; the existing note streams and missing melisma extenders are still under review. The second tune's printed one-sharp key signature contradicts its current `K:D` source; do not approve that arrangement or change only the key without reviewing its pitches.

Primary provisional BULLINGER underlay mapping, pending music integration: first system `From _ the depths my prayer _ as cend eth Un to God _ on high` (16 soprano attacks); second system `Hear _ O Lord my sup _ pli ca _ tion And _ _ _ my cry` (16 attacks). Other stanzas occupy the corresponding printed positions. Independent agent estimates of 15 second-system attacks are not accepted as final evidence; count the printed heads and tie/slur endpoints directly.

## BULLINGER soprano and underlay correction — 2026-09-30

The primary enlarged printed-score reading gives the soprano stream (L:1/4, K:Ab): `(E F) E | A2 c | (B F) G | F2 E | A2 A | (c B) F | !fermata!B3 | (E F) E | c2 c | (c d) c | (c B) F | G3- | (G F) G | !fermata!A3 |]`. The independent review confirms both systems after further first-system enlargement corrected its provisional reading in bars 5–7: bar 5 has A4 twice, bar 6 ends F4, and bar 7's dotted half is B-flat4 on the middle staff line. This replaces incorrect pitches, cadence attack split, and missing slurs/tie/fermatas in the source. No fixed line breaks were imposed.

All four stanza rows now follow the printed soprano x-positions. ABCJS automatically skips the tied continuation at attack 29, so only two explicit `_` extenders follow the first syllable of the closing phrase, not three. The actual parse worksheet confirms attack 31 carries `my / bly / to / a-` and attack 32 carries `cry / trust / see / bove`; all earlier printed word positions were checked as well. Corpus parsing reports no warnings. Alto, tenor, bass, and final responsive render approval remain open; the first tune is still PARTIAL.

## Complete BULLINGER lower-voice correction — 2026-09-30

Independent enlarged readings and primary staff-coordinate review now reconcile all 14 measures of the remaining voices. The integrated streams are:

```abc
A: C D C | C2 E | D2 D | C2 C | E2 E | =D2 D | E3 | D2 D | C2 E | E2 E | D2 D | D3- | D2 D | C3
T: A,2 A, | E,2 E, | (G, A,) B, | A,2 A, | C2 C | A,2 A, | !fermata!G,3 | G,2 G, | A,2 A, | =A,2 A, | F,2 B, | B,3- | (B, A,) B, | !fermata!A,3
B: A,,2 A,, | A,,2 A,, | E,2 E, | A,,2 A,, | A,2 A, | F,2 F, | E,3 | E,2 E, | A,2 A, | F,2 F, | B,,2 B,, | D,3- | D,2 D, | A,,3
```

Staff-line enlargement was essential: first-system tenor bar 2 is E-flat3 twice; alto bars 3, 8, and 11 end D4, not E4/C4; bass bar 5 is A-flat3, not A-flat2. Second-system bar 9 is a printed tenor/bass A-flat3 unison, bar 10 has tenor A-natural3, and the final bass is A-flat2 in the space above the bottom G2 line. All voices tie from bar 12 into 13. Fermata symbols are encoded above the two printed staves on soprano and tenor, avoiding duplicate marks on the paired voices. The full printed notes/rhythms and stanza assignment are reconciled, but live responsive rendering approval is still open after the browser automation timed out. Both numbered tunes remain PARTIAL until their separate review gates close.

## STEPHANOS complete rederivation — 2026-09-30

The primary reviewer read the owner's second-tune engraving and enlarged clean treble/bass crops independently of the old source. The source has been replaced with the printed eight-bar, one-sharp G-major setting, not merely transposed or relabeled. The first four bars contain 13 soprano attacks followed by a quarter rest; the second four contain 13 attacks, including eighth-note pairs on `O` and `pli`. `Hear` is a filled quarter note, not the half note suggested by an earlier provisional reading. `And / my / cry` occupy A4 half, A4 half, G4 whole, with no final melisma. All four verses have 24 sung syllables attached across 26 attacks; the actual ABCJS worksheet confirms the two extenders and final words.

Integrated ledger (L:1/4, K:G):

```abc
S: B B B A | B d d c | B B A G | A3 z | D (E/ F/) G F | G (A/ B/) c B | A2 A2 | G4
A: D D D D | D D G D | D D D D | D3 z | D D D D | D D C D | E2 D2 | B,4
T: G, G, G, F, | G, A, B, A, | G, B, C B, | F,3 z | D C B, A, | B, A, G, G, | G,2 F,2 | G,4
B: G,, B,, D, D, | G, F, E, F, | G, G, F, G, | D,3 z | B, A, G, D, | G, F, E, D, | C,2 D,2 | G,,4
```

The bass-staff unisons, final G2/G3 octave, and alto final B3 were checked against local staff lines rather than handwritten annotations. Independent Sol reconciliation confirms all eight bars SATB, the printed rests, one-sharp key, and both lyric extensions with no remaining pitch/duration discrepancy. Final live responsive rendering approval remains required; no corpus PASS is claimed by the parser or source correction alone.

## Timing-transfer visual checkpoint — 2026-09-30

The local BULLINGER alto-only rendering was inspected at phone width and at 1280px desktop width after the timing-transfer patch. All four verse rows remain visible, `God` now aligns with the printed D-natural in bar 6, and the closing words remain aligned across the bar-12/13 tie. Desktop and phone reflow differ without imposing source line breaks. This checkpoint does not approve the shared patch or either arrangement: the independent renderer review identified different per-voice source segmentation as a remaining lyric-loss case, and the other individual parts plus STEPHANOS still require final visual approval.

The committed revised transfer subsequently passed independent actual-ABCJS comparisons for all 96 word/stanza/onset assignments in each alto, tenor, and bass view of both tunes. STEPHANOS's full desktop score and settled phone alto-only view were visually checked: four stanza rows, printed rest, eighth-note pairs, and closing `And / my / cry` remain complete and correctly positioned. Other settled single-part/full-phone views remain final review work; no full arrangement PASS is claimed yet.

STEPHANOS's settled 390px full score was subsequently inspected through all seven systems, including the closing whole-note chord and all four verse endings. No clipping, missing staff, or lyric-loss defect was seen. The tenor-only screenshot attempt timed out twice on the same live tab, so no visual approval is recorded for that view.

A subsequent fresh settled desktop tenor-only view passes: all three reflowed systems and four stanza rows are present through the final whole note, with correct bass clef and key. Bass-only visual approval remains open after a capture timeout. An independent actual reduced-score inventory reports no missing-target-attack errors in either 365 setting, in any of the four voices.
