# Psalter 314 — printed-score reconstruction

## Final source-photo and desktop-render approval — 2026-09-28

An independent reviewer compared every SATB event on owner photo `20260829_112831.jpg` (p. 273) with the current ABC: 32 attacks per part (128 total), two-flat key, 3/4 rhythm and bar divisions, registers, and absence of unprinted accidentals or expression marks. Both photographed stanza rows and all 32 note-aligned lyric slots matched. A fresh production desktop render at 1400 pixels shows all four parts and both stanzas through the terminal double bar, with no apparent clipping, duplication, or voice swap. Editorial slash separators were removed from the numbered `W:` fields without changing words or notes. Source-photo and current desktop-render QA is PASS. Physical-phone, audio, and print-dialog checks remain separate release gates. The historical PARTIAL and wrong-key paragraphs below describe superseded review stages, not the current status.

## Corrected music and two-stanza underlay — 2026-09-27

The earlier review below incorrectly identified the printed key and measure structure. The owner photo and same-edition `_314.webp` show **two flats (`K:Bb`)**, not three (`K:Eb`). The printed score has twelve bars grouped into four short phrases, with three-eighth pickups and cadences; each voice totals 48 eighth-note units. The former ABC expanded several printed measures and contained wrong soprano pitches, including the `Je-ho-vah's` phrases. All four parts were retranscribed from printed noteheads, preserving the actual high E-flat in the third phrase and the lower-part unisons. There are no printed chromatic accidentals, slurs, ties, or fermatas.

Both printed stanza rows now attach to four eight-attack soprano phrases via `w:`; the complete `W:` transcripts remain for reading and search. The pinned ABCJS inspector confirms 8/8/8/8 slots for both rows and no warnings. A separate Sol reviewer confirmed the two-flat signature, soprano phrase contours, and lyric placement against the clean score. Full independent SATB event-by-event and audible-device QA remain open. The historical findings below are superseded for the music/key and prior lyric chunking.

## Historical review (superseded)

## Photo review

- Ground truth: local source evidence (not distributed), printed page 273. The page contains the complete no. 314 setting, “World-Wide Worship,” Psalm 117 / L. M., SABBATH BELL, John H. Tenney; it is in E-flat major and 3/4.
- Boundary: the complete setting occupies three grand-staff systems and ends with a final double bar. No. 313 ends above it on the same page; no. 315 begins on the next photographed page. No. 314 has one tune only; no second or alternate setting is printed.
- Compared the three systems' SATB pitch labels, key signature, rhythms, rests, barlines, and ending against the photo. The source's three-system sequence and four voices agree with the annotated pitches and printed notation; no correction was warranted. There are no printed ties, slurs, fermatas, or articulation marks to add.
- Both printed stanzas are present in `W:` and match the photographed text through “declare.” and “Name.” respectively. The source preserves `Tow'rd`, `ev'rywhere`, and `holy Name`; the printed hyphenation is line-setting syllabification.
- The two printed stanza rows were matched note by note to the photographed
  soprano, preserving `Je-ho-vah's`, `ev-'ry-where`, `lov-ing-kind-ness`,
  `end-less`, and `ho-ly`. Both stanzas now have `w:` underlay on all three
  music lines, while their complete `W:` text remains intact. The photographed
  lyric spans have 11, 12, and 9 syllables per music line, exactly matching
  the respective soprano event counts; no skip or extender was inferred.
- Status is PARTIAL only for a final browser visual comparison of the newly
  rendered underlay against the photograph. Source-photo SATB and lyric
  alignment have been checked.

## Targeted ABCJS check

ABCJS 6.7.0 `parseOnly` parsed one tune with no warnings. It has three parsed music lines, each with two two-voice staves (four SATB voices). The updated source attaches both `w:` stanzas to all 11/12/9 soprano note events on those lines. The earlier in-memory DOM `renderAbc` call produced one SVG with 128 noteheads and no exception; a fresh browser visual comparison is still pending.

No score pitches or `W:` lyric text were changed; only photo-aligned `w:` rows were added.
