# Psalter 218 photo QA — PARTIAL

- Source: annotated page photo local source evidence (not distributed), page 186 (photo index 180).
- Boundary: no. 218 is one complete setting on this page; the preceding no. 217 ends on page 185 and no. 219 begins on page 187. No continuation for no. 218 was found.
- Heading: “A Suppliant Church”; Psalm 80, 10s; LANGRAN, James Langran. One tune and four systems. The photo shows six stanzas.
- Footer/rights: no selected-stanza footer or copyright notice is visible for no. 218.
- Text: all six printed stanzas are retained as `W:` in `src/psalter-abc.ts`; the transcription matches the page. SATB music fields were preserved.

## Parser and underlay check

ABCJS `parseOnly` on the no. 218 source reports zero warnings. The soprano has four systems with 15 note events each (60 total); all six printed stanza rows are now attached event-by-event in each system. The closing word “more.” occupies the final soprano note for stanza 6. A focused regression test checks all 360 lyric slots against the annotated page and asserts that final attachment.

## Remaining QA

SATB note/render verification remains outside this focused lyric pass. Full `W:` text is retained alongside the underlay. No generated files were changed.
