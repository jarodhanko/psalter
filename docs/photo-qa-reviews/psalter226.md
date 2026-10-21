# Psalter 226 photo QA — lyric underlay reviewed

- Ground truth: annotated photo local source evidence (not distributed) (photo 187, printed page 193). No. 226 begins in the lower half of the page after the preceding setting and is complete on this page.
- Photo-visible heading: “Longings for Sanctuary Fellowship,” Psalm 84 C. M., AUDITE AUDIENTES ME by Arthur S. Sullivan. The score is in E-flat major and 4/4. The photographed arrangement has six voices: voices in unison first, then voices in harmony, with organ divisi. Three stanzas are printed; the footer reads `[Stanzas 4-6]`.
- All six existing parts (T1–T3 and B1–B3), pitches, and rhythms remain intact. The full stanza text remains in `W:`; on 2026-09-25 all three printed stanzas gained `w:` rows across all three soprano source lines. The formerly unresolved extra event is the two-eighth-note harmony entrance under one syllable: “O,” “A,” or “To,” followed by `_` on the second note. The source photo and matching clean scan `_0201.jp2` confirm that printed attachment. A separate read-only reviewer checked every row and ABCJS's lyric arrays.

## Targeted parser check

ABCJS `parseOnly` parsed one tune with zero warnings. It reports three score lines, each with two staves carrying three voices apiece. The Melody contains 19 note events per line, 57 total. `inspect-underlay.mjs psalter226` confirms three attached stanza rows at each of the 57 melodic slots.

## Remaining QA

Independent event-by-event SATB photo-to-render comparison and fresh rendered-score/device QA remain open.
