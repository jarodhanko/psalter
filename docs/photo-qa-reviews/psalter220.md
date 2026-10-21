# Psalter 220 photo QA — lyric underlay complete

- Source: annotated ground-truth photo local source evidence (not distributed), printed page 188 (photo index 182).
- Boundary: the photo contains the complete no. 220 / SANKEY setting across four systems. No. 219 ends on the preceding page; no. 221 begins on the following page. There is one tune on this page.
- Heading and layout: “Prayer for Restoring Grace,” Psalm 80 11s, SANKEY (Ira D. Sankey), F major, 4/4. Six printed stanzas and the copyright/renewal/permission footer are present.
- The existing `psalter220` music and `W:` text were retained unchanged. Visual inspection confirmed the four-system extent, the system-2 B-natural, system-4 `ritard`, cadence figures, final double bar, six stanzas, and rights footer. The transcription remains an aid; the photo is the authority.
- Photo-supported `w:` rows now cover all six stanzas in all four systems. Systems 2 and 4 each have 11 soprano events and 11 printed lyric syllables. Systems 1 and 3 each have 12 events, but the photographed slur across events 8–9 holds one syllable; `_` leaves event 9 unsung and attaches the next syllable to event 10.

## Parser check

`tools/inspect-underlay.mjs psalter220` confirms all six stanza rows on all four systems, with the held-syllable slot on event 9 in systems 1 and 3. The arrangement retains four parsed score lines, each with four SATB voices.

## Remaining QA

A fresh desktop production-browser screenshot shows the first five stanzas aligned on the first score and stanza 6 on the repeated score, without obvious clipping. A complete event-by-event SATB photo-to-render comparison has not been completed. The retained `W:` text is a transcript of the same six stanzas, not a separate text-only song.
