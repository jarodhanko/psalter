# Psalter 202 photo-to-ABC lyric review — partial

## Chorus annotation and playback — 2026-09-28

The quoted `"CHORUS"` marking used chord-symbol syntax in ABC. It is now an above-staff text annotation (`"^CHORUS"`) so the printed section label does not create an unprinted accompaniment chord in ABCJS playback. The two `"rit."` markings were likewise made above-staff text annotations. The SATB notes and lyric fields are unchanged. Device playback and a full score/photo comparison remain open.

- Source boundary: annotated local source evidence (not distributed) (photo 164, printed p.170) contains four verse systems; local source evidence (not distributed) (photo 165, printed p.171) contains the two-system CHORUS continuation/completion at the top. The following separate setting, Psalter 203 / PRAYER, begins below it. Photo 163 is the preceding separate setting.
- Heading: *Guidance and Glory*, Psalm 73 11s, CARTER, E. Grace Updegraff. The photographed lyrics are three verses and a four-line CHORUS; the footer after the chorus reads `[Stanzas 8–10]`. The printed rights line attached to no.202 on p.170 is `Copyright, 1891, by R. Kelso Carter. E. O. Excell, owner. Used by per.` The p.171 `Used by arrangement with Oliver Ditson Co.` line is below the separate no.203 and is not part of no.202.
- Existing full verse and chorus text remains in `W:` and matches the visible wording; SATB and all source content were preserved.
- Direct photo recheck: p.170 has three stanza rows beneath each verse system. Each printed verse row has 11 sung syllables, while its soprano line has 12 ABC note events; the final tied pairs are `E3-E3`, `A3-A3`, `A3-A3`, and `C3-C3`. All three stanza rows are now underlaid across these four verse systems, with `_` on each second tied event. On p.171, the two chorus rows have 13 and 14 syllables against 15 soprano events each. The final tied cadence accounts for one extra event in each row, but chorus system 1 still has one further event whose lyric slot is not established. Printed verse phrase endings are `Thee` / `be` / `die`, `me` / `Thee` / `I`, `guide` / `stay` / `God`, and `abide` / `aye` / `abroad`; chorus endings are `Name` and `proclaim`.
- `tools/inspect-underlay.mjs psalter202` confirms each of the first four systems has 11 lyric syllables plus the tied-note extender for all three stanzas. The last two chorus systems remain untexted in `w:` but present in `W:`.
- Status: PARTIAL pending exact chorus underlay and note-level/rendered comparison.

## Chorus underlay completion

- Re-examined the p.171 annotated chorus at original resolution. In its first system, the beamed `GA` pair (soprano events 4–5) is printed over the single word `will`; event 5 extends that syllable. The final `G3-G3` tie extends `Name` at event 15. In the second system the 14 printed syllables align consecutively with events 1–14, and the final `F3-F3` tie extends `claim` at event 15.
- Added the two chorus `w:` rows while retaining the complete `W:` transcript and all SATB notes. All six systems now have note-attached printed lyrics. The earlier partial status above is historical; full SATB and mobile/print fidelity remain to be checked separately.
