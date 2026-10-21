# Psalter 137 photo review — partial

## Stanzas 5–6 lyric underlay — 2026-09-27

Added native ABC `w:` rows for stanzas 5–6 in `src/psalter-abc.ts`, following the note pattern of the four already underlaid stanzas. The owner photo and clean scan show stanzas 5–6 as text below the score, so their syllable placement is inferred from the printed 3/4 melody and the established underlay pattern. The complete `W:` text and music are unchanged.

- Sources: owner photo local source evidence (not distributed) (printed p.117) and clean scan local source evidence (not distributed). The photo and scan agree on the title, tune, four underlaid stanzas, and full text of stanzas 5–6. Handwritten note labels in the photo do not override the engraving.
- Event alignment: the soprano has three printed systems of 19 note events each. Each new stanza has six 8-syllable lines, with two lyric lines per system. Systems 1 and 2 use continuation slots 7, 12, and 17; system 3 uses slots 7, 10, and 13 (one-based within each system). That yields 16 sung syllables plus 3 continuation slots in each system, 48 syllables across 57 events per stanza.
- Verification: `tools/inspect-underlay.mjs psalter137` with Node 22 reports all three systems at 19 events and six stanza rows per system. Stanzas 5–6 follow the slot pattern above, with each final syllable on event 19 of system 3. Stanza 6's printed “Deliverance” is sung in three syllables (`De-liv-rance`) to fit the 8-syllable line; its full spelling remains in `W:`.
- Remaining uncertainty: stanzas 5–6 are not printed beneath the notes, so their attachment to the tune is an 8-syllable-meter inference supported by the same six-line structure and continuation pattern as stanzas 1–4. No additional SATB audit or fresh rendering was performed.
