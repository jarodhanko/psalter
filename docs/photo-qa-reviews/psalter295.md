# Psalter 295 photo review — lyric underlay complete

## Responsive prose and punctuation pass

- Rechecked all four printed stanzas against owner photo `20260829_112719.jpg`. Corrected the missing comma after `praise` in stanza 4's `W:` text and removed literal slash line separators from the four `W:` fields. Printed words, note data, and note-attached `w:` rows were unchanged.

- Ground truth: annotated local source evidence (not distributed), photo 251, printed page 257. The page heading gives no. 295, “The Sovereign of the Sea,” Psalm 107, 7s, ROSEFIELD, H. A. César Malan. The score has a two-flat key signature (B-flat major) and 2/4 meter.
- Boundary: this page contains the complete setting in four grand-staff systems, 24 measures, and a terminal held chord with double bar. Photo 250 contains no. 294; photo 252 begins no. 296. The printed `[Stanzas 12-15]` footer is retained. No continuation is expected.
- SATB: retained the existing four-part transcription. Compared the full setting with the annotated note labels and local photo-QA notes, including register, note values, bar boundaries, the explicit E-natural and its immediate continuation, and the final chord. No discrepancy was identified. The clean score is secondary to the annotated photograph.
- Lyrics: all four printed stanzas are retained as `W:` text and match the page in wording, order, contractions, punctuation, and line divisions. The page's stanza footer is also retained.
- Underlay: all four photographed stanza rows are now attached to each of the four soprano music lines. The photo places held-syllable extenders at soprano events 7/11/14, 10, 3/6, and 3/9 respectively by system. These are the untexted final attacks of the short three-note figures; the next syllable starts at the following event. The four rows share those positions, including `un-ceas-ing`, `won-ders`, `peo-ple`, and `eld-ers'`. A second reader independently checked every row against the upright photo.
- Source metadata retains `N:Printed page 257.` No SATB pitches, rhythms, or `W:` text were changed.

## Targeted parser check

Pinned Node with ABCJS validation: 450/450 numbers, 474 arrangements, and zero warnings. The event-level underlay inspector reports 14/11/13/12 soprano events, four correctly ordered lyric slots on every sung syllable, and the photographed extender positions on all four rows. The generated corpus, TypeScript, and production build passed. A fresh local desktop-browser render shows the four rows attached through responsive score reflow without obvious clipping; this is not mobile or print certification.

## Remaining QA

Physical-device, print, playback, and independent full SATB note-by-note certification remain open. The retained `W:` transcript preserves all complete stanza text separately from the note-aligned `w:` rows.
