# Psalter 376 photo review — partial

- Authority: owner photo local source evidence (not distributed) (printed page 321), same-edition clean score local source evidence (not distributed), and archival scan local source evidence (not distributed). The page has one BETTER LAND setting by William F. Sherwin for Psalm 136, 7s, in A-flat and 3/4. The print directly establishes the tune, music, and all six stanza texts; the clean score confirms the notated phrases. The owner photo shows only stanzas 1–4 underlaid with music; stanzas 5–6 are printed below the score.
- Stanzas 1–4 retain direct printed underlay. Their contractions `Bro't`/`Thro'` were normalized to the printed “Brought”/“Through” without changing syllable slots. Stanzas 5–6 retain their printed texts in `W:`; their new `w:` rows are inferred from the repeated 7-syllable verse phrase pattern demonstrated by the four printed stanzas. Each of the six melody systems has 14 note events (two 7-note phrases), and each added row has 14 lyric syllables after ABC hyphenation: stanza 5 lines 1–2, 3–4; stanza 6 lines 1–2, 3–4; then each stanza's refrain row. This validates the inferred slot counts, not a directly printed alignment for those later verses.
- Visual review found no concrete four-part pitch, rhythm, accidental, or tie discrepancy. The explicit E-natural and D-natural in system 2 and cadence ties are represented. This is not a new exhaustive SATB event table; audible/print QA remain open.

## Independent staff and underlay audit — 2026-09-30

I reread the clean engraving and owner photo page 321 before checking `src/psalter-abc.ts`; handwritten pitch labels in the owner photo were not used as the pitch source. The score has treble pair T1/T2 over bass pair B1/B2, three systems, 3/4, and four flats (B♭, E♭, A♭, D♭). The sequences below are scientific pitches as printed after applying that key signature; each `|` separates the two 7-note phrases.

| Printed part | System 1 | System 2 | System 3 |
| --- | --- | --- | --- |
| Treble upper (T1 / soprano) | E♭4 E♭4 E♭4 A♭4 G4 A♭4 B♭4 \| E♭4 E♭4 B♭4 B♭4 A♭4 B♭4 C5 | C5 B♭4 A♭4 F4 B♭4 A♭4 G4 \| A♭4 A♭4 G4 E♭4 G4 F4 E♭4 | C5 D♭5 E♭5 C5 B♭4 A♭4 F4 \| A♭4 F4 E♭4 A♭4 B♭4 C5 A♭4 |
| Treble lower (T2 / alto) | C4 C4 C4 E♭4 D♭4 C4 E♭4 \| E♭4 E♭4 D♭4 D♭4 C4 E♭4 E♭4 | E♮4 G4 F4 F4 D♮4 F4 E♭4 \| E♭4 E♭4 E♭4 E♭4 E♭4 B♭3 B♭3 | E♭4 E♭4 A♭4 E♭4 E♭4 E♭4 D♭4 \| F4 D♭4 C4 C4 D♭4 E♭4 C4 |
| Bass upper (B1 / tenor) | A♭3 A♭3 A♭3 E♭3 E♭3 A♭3 G3 \| E♭3 E♭3 G3 G3 A♭3 G3 A♭3 | G3 C4 C4 A♭3 F3 B♭3 B♭3 \| C4 C4 B♭3 G3 B♭3 A♭3 G3 | A♭3 B♭3 C4 A♭3 G3 A♭3 A♭3 \| A♭3 A♭3 A♭3 A♭3 G3 G3 A♭3 |
| Bass lower (B2 / bass) | A♭2 A♭2 A♭2 C3 B♭2 A♭2 E♭3 \| E♭3 E♭3 E♭3 E♭3 E♭3 E♭3 A♭2 | C3 C3 F3 F3 B♭2 B♭2 E♭3 \| A♭2 A♭2 B♭2 B♭2 B♭2 B♭2 E♭3 | A♭3 A♭3 A♭3 A♭2 B♭2 C3 D♭3 \| D♭3 D♭3 E♭3 E♭3 E♭3 E♭3 A♭2 |

Rhythm is common across all four parts. Systems 1 and 3 use `[3/4, 1/4, 3/2, 1/2, 1/2, 1/2, 2]` quarter-note units for each phrase. System 2 uses that pattern in phrase one and `[3/4, 1/4, 1/2, 1/2, 1, 1, 2]` in phrase two. Thus each part has 14 attacks per system (42 per part total). The two local signs in system 2 are E-natural on T2's first attack and D-natural on T2's fifth attack; no other local accidentals are printed. I found no rests, ties, or slurs in the three systems; the small rhythmic groupings are beams, not ties. The source's pitch/duration events agree with these staff-position readings, including both natural signs. In system 3 B2's first three heads are A♭3: they share the top-line A3 notehead with B1, and the apparent lower mark is the flag rather than another head. The cadence note is D♭3 (D on the bass staff's middle line under the four-flat signature).

The printed complete stanza texts are:

1. Praise Jehovah for His love, God of gods, enthroned above; Praise the mighty King of kings, Who alone doth wondrous things; For His mercy doth endure, Ever faithful, ever sure.
2. God by wisdom framed the skies, Made the earth from ocean rise, Gave the sun by day for light, Moon and stars to rule the night; For His mercy doth endure, Ever faithful, ever sure.
3. He made Egypt's greatness vain, Caused their first-born to be slain, Bro't forth Israel from their land, Stretching out His mighty hand; For His mercy doth endure, Ever faithful, ever sure.
4. God the sea asunder clave, Bro't His people thro' the wave, Drowned their foes beneath the deep, Thro' the desert led His sheep; For His mercy doth endure, Ever faithful, ever sure.
5. Mighty kings of mighty name He destroyed and put to shame, Made their land a heritage For His saints from age to age; For His mercy doth endure, Ever faithful, ever sure.
6. God remembered all our woe, Rescued us from every foe, Food to all doth He supply, Praise the Lord enthroned on high; For His mercy doth endure, Ever faithful, ever sure.

ABCJS reports 14 nonempty lyric slots for each of the six stanza rows in each of the three systems (18 stanza/system rows, 14 slots apiece); the row text and positions fit the 14 printed attacks. Direct printed underlay is available for stanzas 1–4 only. Stanzas 5–6 are printed below the music without note alignment, so their 14-slot alignment in the ABC remains an inferred repeat of the printed phrase pattern, not a ground-truthed syllable-to-note placement.

Correction to the historical normalization note above: its claim that `Bro't`/`thro'` were normalized to the printed “Brought”/“Through” reverses the page's spelling. Page 321 itself prints `Bro't` and `thro'`/`Thro'` in stanzas 3–4. The normalized W text and the engraved lyric row have different purposes; the current canonical W/w text keeps the printed contractions where they are part of the verse text. This spelling correction does not change syllable count or the inferred status of stanzas 5–6.
