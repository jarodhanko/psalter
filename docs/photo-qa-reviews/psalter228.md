# Psalter 228 photo QA — PARTIAL

- Ground truth: annotated photo local source evidence (not distributed), printed page 195 (photo index 189).
- Boundary: one complete no. 228 / CRUX CHRISTI setting spans four systems. No continuation or second tune appears on this page.
- Photo-visible heading: “True Blessedness,” Psalm 84, 7s and 6s, CRUX CHRISTI by Arthur H. Mann. The score is in G major and 4/4. Three stanzas are printed with the music; the footer reads `[Stanzas 4-6]`.
- The three sung stanza rows are now underlaid across the four systems in the existing `psalter228` source block. The complete `W:` text, including the `[Stanzas 4-6]` footer, remains intact; SATB transcription was preserved.

## Parser check

ABCJS `parseOnly` parsed one tune with zero warnings. The tune contains four score lines, each with two two-voice staves (four SATB voices total). T1 has 13 note events in each system; a focused regression test checks all 156 lyric slots against the annotated photo, including the final syllable of every printed stanza row.

## Remaining QA

Complete event-by-event SATB photo-to-render comparison remains outstanding. Underlay verification covers only the three sung stanza rows printed beneath the score; the source also retains the complete text transcript and the selected-stanza footer. No generated files were changed.
