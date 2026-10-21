# Psalter 317 — printed-score reconstruction

## Full score-and-lyric approval — 2026-09-28

An independent read-only reviewer compared the owner photo `20260829_112839.jpg`, the same-edition clean scan, and current generated/canonical ABC across all four music systems. ABCJS reports zero warnings. The score has 230 SATB note attacks (S 59, A 57, T 57, B 57); each part spans 64 quarter-note units. Printed pitches/registers, durations, bar and phrase boundaries, chromatic signs (including the G-sharp/E-sharp chord), four-voice slurs, and final dotted halves agree. All eight stanza texts and their section-specific note underlays agree: stanzas 1–4 occupy the first two systems, 5–8 the final two. A fresh production desktop render was inspected with all four parts, systems, and lyric rows present. Score/photo and desktop-render status: PASS. Playback currently plays the entire four-system setting; there is no stanza-specific playback selector. Physical-device/audio/print QA are separate release gates. The older pending-review statement below is superseded.

## Corrected SATB and section-specific stanzas — 2026-09-27

The former source was not a sound basis for underlay. A full printed-score transcription found four systems, each with a quarter-unit pattern of 1, 4, 3, 1, 4, 3 (K:C, 4/4), totaling 64 quarter units in each voice. The old ABC final system had an extra quarter and misplaced closing bars. Corrected details include the printed G-sharp/E-sharp chord on `a-` of `above`, missing lower-voice rearticulations, lower-part chromatic signs, the slurs at the third-system cadence, and the final dotted-half tonic. The clean `_317.webp` and owner photo were used together; handwritten labels were not allowed to override noteheads. Sol independently spot-checked the last system and the unusual accidentals without finding a further contradiction.

The printed page places stanzas 1–4 beneath music systems 1–2 and stanzas 5–8 beneath systems 3–4. All eight complete `W:` transcripts remain; sixteen `w:` rows now attach the proper four stanzas to each corresponding system. The melody systems have 14, 14, 17, and 14 attacks. System 3 has three printed slurred/melismatic continuation attacks per stanza, encoded with `_` at events 6, 15, and 17. The pinned ABCJS inspector reports these slots and no parser warning. The viewer's grouping logic now leaves a section-specific score intact instead of duplicating the whole score merely because it contains more than five stanza numbers.

Status: corrected from print with targeted independent review. A second complete SATB event ledger, the intended playback behavior when selecting a stanza confined to one section, and physical-device audio/print QA remain open. The historical note below is superseded for note-level approval and underlay.

## Historical review (superseded)

- Ground truth: annotated photo local source evidence (not distributed) (photo 269, printed page 275). The complete HEAVENLY FOLD setting ends on this page; the next photo begins no. 318.
- The current soprano ABC has four music lines with 14, 14, 17, and 14 first-voice events and no note-aligned `w:` fields. All eight printed stanzas remain in `W:`.
- The first lyric phrase under the third photographed music system has 14 sung syllables against 17 source events. The three held/melismatic placements were not established event by event from the annotated photo. No `w:` was added; exact underlay and broader note QA remain open.
