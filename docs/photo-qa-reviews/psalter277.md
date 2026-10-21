# Psalter 277 photo review — verified, including all six underlaid stanzas

- Ground truth: local source evidence (not distributed), printed page 240 (photo 234). The heading is no. 277, “Thankful Joy and Praise,” Psalm 103, C. M., HOWARD, Elizabeth H. Cuthbert. The printed meter is 3/4 with no key signature (C major).
- Boundary: one complete setting occupies three grand-staff systems and ends at the visible double bar. Stanzas 1–6 are printed under the music; stanzas 7–8 are printed below it. The next photo begins no. 278. No copyright or selected-stanzas notice is visible.
- SATB: compared all three systems, including the handwritten pitch labels, note values, bar alignment, inner voices, concert-pitch bass octaves, the second-system F-sharp, phrase curves, and the closing cadence, against the annotated page. The existing ABC transcription matches the score; no note-level discrepancy was found. A literal terminal fermata is not printed and none is encoded.
- Lyrics: all eight complete printed stanzas are present as `W:` text in `src/psalter-abc.ts`; wording and stanza order match the page. Stanzas 7–8 are included despite having no music underlay on this page.
- Lyric underlay: all six stanzas printed beneath the music have photo-aligned lowercase `w:` rows. Stanzas 7–8 are printed below the music, without direct underlay; their `w:` rows are inferred from the photographed 8.6.8.6 text and the repeated syllable positions of the six directly printed 8.6.8.6 underlays. No wording in the complete eight `W:` stanzas was changed. The annotated photo's lyric columns were matched to soprano noteheads across all three systems; `*` marks each intervening melisma event.
- System event map: system 1 has 12 soprano notes, with lyric syllables on events 1, 3–7, 9, 11–12 (melismas 2, 8, 10); system 2 has 12 notes, with syllables on 1–3, 5–10, 12 (melismas 4, 11); system 3 has 13 notes, with syllables on 1, 3–5, 7, 9–10, 12–13 (melismas 2, 6, 8, 11). The six rows follow the printed syllable divisions and punctuation through their final note.
- Inferred rows 7–8 use the same 12/12/13 event grouping: their closing syllables land on events 12, 24, and 37 respectively (`He` / `So`, `ly` / `as`, `pay` / `removes`).
- Source metadata now records `O:Psalm 103, C. M.` and `N:Printed page 240.` The music and all eight `W:` stanzas were otherwise preserved.

## Targeted parser check

ABCJS `parseOnly` on `psalter277`: one tune, zero warnings. S/A/T/B note-event counts are 37/39/37/41; each voice has 17 bar events. All eight `w:` rows supply 37 lyric cells to the 37 soprano note events, including intentional blank cells for melismas; each row's final syllable is attached to the final note. The entry retains all eight `W:` lines.

## Remaining QA

Photo transcription review is complete for the full page, SATB, and the six printed lyric underlays. The stanza 7–8 note mapping is inferred from the earlier printed underlays, not directly printed. Generated artifacts were refreshed with the source change.
