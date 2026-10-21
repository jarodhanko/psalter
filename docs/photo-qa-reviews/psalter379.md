# Psalter 379 photo review — partial

- Authority: owner photo local source evidence (not distributed), printed page 324, and same-edition clean `_379.webp`. The heading prints Psalm 137, L.M., OLIVE'S BROW by William B. Bradbury. Added the printed Psalm/meter/page metadata.
- Stanzas 1–4 are note-underlaid in the owner photo; stanzas 5–6 are printed below the score. Their wording and stanza order are transcribed directly from the photo in `W:`.
- Added `w:` underlay for stanzas 5–6 by mapping their 32 sung syllables onto the same 11/10/11 note-event slots used by the printed underlay. This later-stanza alignment is inferred from the tune and meter, not visible in the print. `utterance` is represented as the singable two-syllable contraction `ut'rance` in `w:` to preserve event alignment; `W:` retains the printed spelling.
- Stanza 5 ends “Zion's joy and peace”; stanza 6 ends “the bitter hatred of her foe.” The three added `w:` rows per stanza align to the three T1 notation systems; pitches, durations, and `W:` text are unchanged.
- A visual SATB/accidental/fermata review found no concrete score defect, but was not a new full event-by-event certification. Audible/print QA remain open.

## Independent printed-score audit — 2026-09-30

Authority: owner photo local source evidence (not distributed), printed page 324, compared with clean same-edition score local source evidence (not distributed). I read the engraved staff positions, key signature, note values, and marks directly; owner-photo handwritten note names were not treated as authority. This is one OLIVE'S BROW setting, A-flat major (four flats), 4/4, three systems. Full event-by-event comparison found no concrete source discrepancy.

The independently read event ledger below uses the source's ABC pitch/duration spelling: unmarked notes are quarters, `/` eighths, `2` halves, key-signature flats are implicit, `=` cancels a flat, parentheses mark slurs, and `!fermata!` marks the printed fermata. System breaks and internal double bars follow the engraving.

```text
Soprano / T1
System 1: E2 | E E F F | E2 E2 | E2 || A2 | A A
System 2: B c | B2 B2 | !fermata!A2 || c2 | B B B B |
System 3: B2 A2 | G2 || G2 | A A A F | E2 E2 | E2 |]

Alto / T2
System 1: C2 | C C D D | C2 B,2 | C2 || C2 | C C
System 2: E E | F2 (E D) | C2 || E2 | E E E E |
System 3: =D2 F2 | E2 || E2 | E E F D | (C B,) D2 | C2 |]

Tenor / B1
System 1: A,2 | A, A, A, A, | A,2 G,2 | A,2 || A,2 | A, A,
System 2: G, A, | A,2 G,2 | !fermata!A,2 || A,2 | G, G, G, G, |
System 3: (F, B,) B,2 | B,2 || B,2 | A, A, A, A, | (A, G,) B,2 | A,2 |]

Bass / B2
System 1: A,,2 | A,, A,, D, D, | F,2 E,2 | A,,2 || A,,2 | F, F,
System 2: E, A,, | D,2 E,2 | A,,2 || A,,2 | E, E, E, E, |
System 3: B,,2 B,,2 | E,2 || D,2 | C, C, D, D, | E,2 E,2 | A,,2 |]
```

Printed/source findings: all event pitches, octave placements, note values, barlines, and rests (none printed in the sounding parts) agree across all staves and systems. The A-flat key signature is present in the engraving and source; the only local accidental is the printed D-natural in T2/system 3, correctly encoded `=D`. Slurs are printed over T2/system 2's E–D pair and B1/system 3's F–B-flat and A-flat–G pairs; the source encodes each with parentheses. The two fermatas, over T1's system-2 A-flat and B1's corresponding A-flat, are represented. No ties are printed.

Lyrics: stanzas 1–4 are directly underlaid in the engraving, and their `W:` wording/order matches the print. Stanzas 5–6 appear as text-only below the score; their `W:` wording matches the printed text, but they have no directly printed note underlay. Their `w:` rows are explicitly inferred transfers to the tune's 32 note slots. The audit found that printed “utterance” was replaced by `ut'rance` in inferred underlay, omitting a printed letter and inventing an apostrophized spelling. The primary corrected this to `ut-terance`: the joined lyric retains the complete printed word while using two musical slots. That metrical elision remains an editorial inference, not a print-certified pronunciation or alignment. I did not run a parser, renderer, or tests for this audit.
