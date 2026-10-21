# Psalter 299 photo QA — PARTIAL

## Responsive prose pass

- Rechecked the existing seven `W:` stanza texts against owner photo local source evidence (not distributed), printed page 261. No definite wording discrepancy was found; removed only editorial slash line separators so the prose can reflow. The score underlay for stanzas 1–5 omits some punctuation, so their `W:` punctuation is not independently certified by this pass. Notes and `w:` rows were unchanged.

## Printed and inferred underlay — 2026-09-27

The owner photo of printed p. 261 and the clean same-edition score agree on 31 soprano events, divided by the three printed systems at events 1–9, 10–20, and 21–31. An independent review confirmed the printed syllable positions for stanzas 1–5: events 1, 2, 4, 5, 7–18, 20, 21, 23–26, and 28–31. Events 3, 6, 19, 22, and 27 continue the preceding syllable under slurs. Stanzas 1–5 have directly photographed `w:` rows; stanza 3 reads printed “exalt.” Stanzas 6–7 are printed below the score without event-level underlay. Their new `w:` rows are inferred by applying the visible 6.6.8.6 stanza syllable pattern and established note-slot map to the complete printed `W:` text. For both inferred rows, each system's final note event carries its last syllable (events 9, 20, and 31).

The independent reviewer found no conclusive SATB pitch or duration discrepancy, but this is not a final full-voice, audible, or device-render QA pass.

- Ground truth: annotated photo local source evidence (not distributed) (photo 255, printed page 261). It contains one complete setting: no. 299, “Exultant Confidence,” FERGUSON by George Kingsley, Psalm 108, S. M.
- Checked the title and tune boundary, 3/4 meter, key, four SATB parts, visible pitch annotations, note values, slurs, and final cadence against the photographed score. The current `psalter299` block agrees with the legible source; no note or rhythm correction was identified.
- The five directly underlaid rows remain the photographed authority for event placement. Stanzas 6–7 retain complete `W:` transcripts; their event placement is inferred, not directly printed.

## Targeted ABCJS parse and render check

The targeted underlay inspector was rerun after adding stanzas 6–7; see its current event-slot output for seven lyric rows across the 31 soprano events. This structural check confirms placement in the ABC event stream, not direct photographic underlay for stanzas 6–7, rendered layout, or audible playback. The earlier ABCJS parse/render check predates these additions.

## Remaining QA

Remaining QA: recheck full SATB event-by-event, print/audio behavior, and obtain an independent review of the inferred stanza-6–7 syllable placement.
