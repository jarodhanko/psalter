# Psalter 180 photo QA

## Printed sources

- Authoritative owner photo: local source evidence (not distributed), printed page 152. It shows the two-system setting “Manifold Mercies,” Psalm 68, L.M., JUNIATA by David D. Wood, all eight stanza texts, the `[Stanzas 3–12]` marker, and the copyright footer.
- Clean score: local source evidence (not distributed). It confirms the soprano note pattern and printed lyric alignment for stanzas 1–6.

All stanza texts and the printed footer remain in `W:`. Stanzas 1–6 are printed below the two music systems. Stanzas 7–8 are printed as text only beneath the score, not aligned to individual notes; their added note-level placement is editorial. No additional stanzas were inferred.

## Underlay result

The engraving gives 16 soprano note events in each system. The added rows use stanzas 7–8's long-meter 8.8 lines on system 1 and their remaining 8.8 lines on system 2. `node tools/inspect-underlay.mjs psalter180` confirms 16 events per system and shows the added syllable slots:

| System | Stanza 7 | Stanza 8 |
| --- | --- | --- |
| 1 | 1 Great, 2 hosts, 3 to, 4 ho-, 5 ly, 6 wars, 7 have, 8 trod, 9 The, 10 ar-, 11 mies, 12 of, 13 the, 14 liv-, 15 ing, 16 God | 1 Thou, 2 hast, 3 as-, 4 cend-, 5 ed, 6 up, 7 on, 8 high, 9 And, 10 cap-, 11 tive, 12 led, 13 cap-, 14 tiv-, 15 i-, 16 ty |
| 2 | 1 A-, 2 mong, 3 them, 4 He, 5 re-, 6 veals, 7 His, 8 face, 9 The, 10 God, 11 of, 12 jus-, 13 tice, 14 and, 15 of, 16 grace | 1 They, 2 come, 3 with, 4 gifts, 5 who, 6 did, 7 re-, 8 bel, 9 That, 10 with, 11 them, 12 God, 13 the, 14 Lord, 15 might, 16 dwell |

The printed divisions in stanzas 1–6 confirm sung syllabification such as `co-pious`, `vic-to-rious`, and `glo-rious`. Stanzas 7–8 fit the same 16-slot melody without skips. The owner photo supports their wording, but not this event-by-event placement; no ambiguity remains in the syllable counts.

No tests or rendering were run for this task. A prior regression test covered stanzas 1–6 only; the newly added rows were checked with the underlay inspector.
