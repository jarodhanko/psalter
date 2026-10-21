# Psalter 329 — The Divine Goodness / NILUS

## Independent current-source audit — 2026-09-28

The read-only pass against owner photo `20260829_112917.jpg` and clean `_329.webp` found the current score has **three flats/E-flat**, 6/4, 36 attacks in each SATB voice (13 + 12 + 11 by printed system), and no parser warnings. No specific printed pitch, rhythm, tie, accidental, or expression mismatch was isolated; the tenor A-natural and final tied cadence agree. All four `W:` texts and all three groups of `w:` rows are present, including printed “Thy promise.” The old four-flat/A-flat and W-only statements below are superseded. Pencil overlaps some inner heads, so an independently documented full event ledger is still needed before PASS; current status remains PARTIAL.

## Printed-score correction — 2026-09-27

The earlier partial score and no-underlay findings below describe the former ABC and are superseded. The printed score has three flats (E-flat major), not four (A-flat). SATB was rederived from the owner photo and same-edition clean engraving with the printed partial bars, ties, and tenor/bass registers retained. All four stanzas now have native `w:` rows covering 13/12/11 soprano attacks by engraved system, with explicit continuation on each of the two tied notes. Stanza 1's former `W:` wording “Thy word” was corrected to the printed “Thy promise.” ABCJS parses without warnings; a separate targeted review found no remaining concrete pitch or underlay contradiction. Exhaustive pixel-level verification of every inner-voice note remains open.

**Result: PARTIAL.** Reviewed against the annotated source photograph on
2026-09-23. The photograph, not an earlier transcription, is authoritative.

## Boundary and identity

- Photo local source evidence (not distributed) (photo 278,
  printed page 284) begins with Psalter 329 / NILUS and contains its complete
  setting through the final double bar and `[Part IX]`. Psalter 330 / MARCHFIELD
  begins below; it is outside this setting. The preceding photo 277 ends
  Psalter 328 and does not continue no. 329.
- The heading reads “The Divine Goodness,” Psalm 119, “9s and 8s,” NILUS, and
  Charles H. Gabriel. The score shows a four-flat signature (A-flat major) and
  6/4 meter; these agree with the ABC metadata.
- The printed notice reads “Copyright, 1912, by United Presbyterian Board of
  Publication. Used by per.” The source also prints `[Part IX]`; both are
  retained in the no. 329 ABC metadata. This records what the page prints, not
  a separate legal conclusion.

## Text and score review

All four printed stanza texts were checked for wording, order, and punctuation.
The photograph prints these stanzas beneath the music, but the current ABC
stores them only in four text-only `W:` fields; it has no lowercase `w:` lyric
underlay. The earlier phrase “ABC underlay” was inaccurate. Exact syllable to
soprano-event placement, including melismas and final-syllable attachment, was
not established in this review, so no `w:` fields were added. The complete
stanza endings remain present in `W:`: “trust,” “pray,” “pride,” and “gold.”

ABCJS `parseOnly` found one tune, 37 soprano note events, and zero warnings. A
DOM render produced one SVG. This confirms the current source parses and
renders; it does not certify note-by-note agreement with the photograph. The
earlier spot-check of handwritten pitch labels remains limited: durations,
every onset, simultaneous voice alignment, all ties, measure totals, and the
final cadence have not been comprehensively collated. Status remains PARTIAL.

## Independent underlay re-review

- Rechecked the exact annotated photo `20260829_112917.jpg` against all four printed stanza rows and the soprano part. The photo prints the complete text and labels pitches above the notes, but those handwritten labels do not mark lyric extensions.
- The pinned Node/ABCJS parse confirms 37 soprano events and zero warnings. The 9s-and-8s text is printed over multiple systems; the exact note slots carrying extended syllables, including each stanza's final word, have not been independently located across those system boundaries.
- No lowercase `w:` underlay was added. The complete stanza text, including the endings “trust,” “pray,” “pride,” and “gold,” remains in `W:` pending a line-by-line alignment that can be checked through every ending.
