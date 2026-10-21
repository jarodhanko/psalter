# Psalter 229 photo QA (partial)

## Printed underlay recheck — 2026-09-27

Owner photo 190 and the clean same-edition printed page-196 scan confirm the six-line setting, all six printed stanzas, key/time, and four music systems, without a definite SATB discrepancy in the checked soprano line. This is not a full event-by-event certification of every voice. The soprano has 11/14/12/14 events (51 total), while each stanza has 48 sung syllables. The three surplus notes are printed held syllables: system 2 event 12 (soprano G–A slur), system 3 event 7 (A–B slur), and system 4 event 4 (G–F slur). All six stanzas now have `w:` rows on each system, with `_` at those positions. A separate reviewer adjudicated these against both printed sources, including the misleading early alto slur; the printed soprano syllable positions govern.

- Source: local source evidence (not distributed) (annotated photo 190), printed page 196.
- Boundary: the page contains one complete setting, no. 229, “Days in the Sanctuary,” Psalm 84 L. M., tune ELLERTON by Joseph Barnby. It is in E-flat major and 3/4, spans four grand-staff systems, and prints six stanzas. Adjacent photo 189 completes no. 228 on page 195; photo 191 begins no. 230 on page 197. No continuation or alternate tune for no. 229 is visible.
- Scope checked from the annotated photo: heading and metadata, printed key/time, complete four-system and six-stanza extent, and end boundary. The existing SATB notes were preserved. The by-photo transcription was used only as a cross-check.
- Lyric fields: retained all complete `W:` transcript lines and added six note-aligned `w:` rows on each of the four systems. The systems cross text-line boundaries: for example, system 1 ends `The / tab- / er-` in stanza 1 and `They / still / to` in stanza 3. `tools/inspect-underlay.mjs psalter229` confirms all 51 slots per stanza are accounted for.
- Focused ABCJS parse: one tune, four systems, no warnings. Parsed note-event counts by system are T1/T2/B1/B2: `11/11/11/11`, `14/14/14/14`, `12/13/12/12`, and `14/14/15/13`.
- Remaining QA: full event-by-event SATB comparison and rendered-score comparison are not claimed. No separate tune or page remains to inspect for no. 229.

`Photo-QA: PARTIAL.`
