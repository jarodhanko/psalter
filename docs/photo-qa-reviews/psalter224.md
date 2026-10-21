# Psalter 224 photo QA — PARTIAL

- Ground truth: annotated photo local source evidence (not distributed), printed page 192 (photo index 186).
- Boundary: no. 224 / GREEN HILL is a complete two-system setting on this page. The lower part of the page begins the separate no. 225 / ERSKINE setting; no. 224 does not continue there. The preceding photo completes no. 223.
- Photo-visible heading: “The Foes of the Church,” Psalm 83 C.M., GREEN HILL by Albert L. Peace. The score is in E-flat major and 4/4. Six stanzas accompany the two systems, followed by the copyright/permission footer.
- Added photo-aligned `w:` rows for all six stanzas in both systems of `psalter224`, preserving the complete `W:` text and all SATB pitches and rhythms. Each of the 14 first-system events carries a printed syllable. On system 2, event 13 is untexted in all six stanzas; each final syllable aligns with event 15 in the photo.

## Parser check

ABCJS `parseOnly` parsed one tune with zero warnings. The tune contains two score lines; each line has two two-voice staves (four SATB voices total). The focused lyric-slot regression test checks all six complete maps: 14/14 syllabic events in system 1 and 14/15 in system 2, with the photographed gap at event 13.

## Remaining QA

Complete event-by-event SATB photo-to-render comparison and fresh rendered-score review are outstanding. Photo-derived lyric underlay is now encoded and regression-checked; these checks do not certify SATB/photo parity or rendered visual placement. No generated files were changed.
