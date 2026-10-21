# Psalter 303 photo QA — lyric underlay complete, SATB review partial

## Responsive prose pass

- Rechecked all three `W:` stanza texts against local source evidence (not distributed), printed page 265. Removed only editorial slash phrase separators so the prose can reflow. The print's typographic `ev-'ry` line break is retained as the whole-word contraction `ev'ry`; notes and `w:` rows were unchanged.

## Bounded independent recheck — 2026-09-27

A read-only reviewer compared owner photo 259 and clean same-edition `_303.webp` with the current ABC. The title, E-flat key, meter, complete tune boundary, all three stanza transcripts (including printed `ev'ry`), and the 57-event soprano underlay with its event-9 continuation agreed. Opening and closing pitch patterns and the middle chromatic figures showed no concrete defect. This was **not** an exhaustive SATB event-by-event review: lower-staff chord ownership, all durations/registers, and expression-mark endpoints remain unverified. No source music was changed.

- Ground truth: annotated local source evidence (not distributed) (photo 259, printed page 265). This page contains the complete no. 303 setting; the previous photo closes no. 302 and the next begins no. 304. There is one tune, ALL SAINTS NEW, with three printed stanzas.
- The photographed heading gives “Christ Our Priest-King,” Psalm 110, C. M., Henry S. Cutler. The existing ABC has the corresponding E-flat-major, 4/4 four-part score. The printed page number remains source metadata; no SATB pitches or rhythms were changed.
- All three complete stanzas remain in `W:`. The full soprano has 57 note events versus 56 syllables per stanza. The photograph places the one held-syllable continuation at global soprano event 9: “said,” “Thine,” and “earth” each span events 8–9. The next six-note phrase starts with “Sit,” “When,” or “With” and ends with a separately sung “hand,” “might,” or “hand.” These positions were checked independently against the annotated photo. The four ABC music lines have 15/15/14/13 events and cross two printed lyric-phrase boundaries; their new `w:` rows preserve the continuous syllable sequence without forcing photographed line breaks.
- The printed stanza 3 contraction `ev'ry` replaces the source's expanded `every` in both `W:` and note underlay. The generated corpus parses with zero ABCJS warnings; the event-level inspector shows all 57 lyric slots in each stanza with only event 9 extended. A fresh local desktop-browser render shows all three rows through responsive reflow without obvious clipping. This is not mobile or print certification.

The full event-by-event SATB comparison with the photograph, expression-mark review, physical-device rendering, print, and playback checks remain open. Do not treat the completed lyric underlay as independent music approval.
