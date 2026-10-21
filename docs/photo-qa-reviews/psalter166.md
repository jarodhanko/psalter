# Psalter 166 photo QA — PARTIAL

- Ground truth: annotated photo local source evidence (not distributed), printed page 141 (photo index 135).
- Boundary: one complete no. 166 / HOLBORN HILL setting appears on this page in three grand-staff systems, grouped 5+5+6 bars. Photo 134 ends with no. 165; photo 136 begins separate nos. 167 and 168. No. 166 has no second tune or continuation.
- Photo-visible heading: “Divine Grace Magnified,” Psalm 65 L.M., HOLBORN HILL, St. Alban's Tune Book. F major, 3/4. Stanzas 1–4 are printed under the score; stanzas 5–6 are printed below it.
- No copyright or separate rights notice is visible for no. 166 on this page.
- Added lowercase `w:` underlay for all six stanzas, split at the three photographed systems. Stanzas 1–4 follow the printed underlay; stanzas 5–6 are printed below the score, so their note placement follows the same 8.8.8.8 meter and event pattern. The complete six-stanza text remains in `W:` unchanged. SATB pitch, rhythm, and barlines were left unchanged.

## Parser check

ABCJS `parseOnly` parsed one tune with zero warnings. The three T1 systems contain 11, 10, and 11 note events. Each underlaid stanza assigns 11, 10, and 11 syllabic positions across those systems, keeping the photographed “or sea” ending with stanza 4. In stanzas 5–6, `pow'r` represents the one-syllable sung form of printed “power”; `ev'ry` in stanza 6 represents printed “every” in two syllables. The full SATB source still parses without warnings.

## Remaining QA

The exact placement of stanzas 5–6 cannot be photo-confirmed because they are printed below the score without note alignment; the 8.8.8.8 meter and same 32-note underlay pattern make the mapping defensible. Complete event-by-event SATB photo-to-render comparison was not repeated for this focused review. No generated files were changed.
