# Psalter 316 photo QA — PASS

## Final source-photo and desktop-render approval — 2026-09-28

The independent full-event pass below covers all four voices, fourteen printed bars, accidentals, rhythms, expression, the complete photographed stanza and its 38 note-attached lyric syllables. A fresh built viewer was inspected at 1400-pixel desktop width after raising ordinary responsive engraving's minimum spacing from 1.1 to 1.5. The score now wraps into three systems with visibly distinct words (“All men,” “And changeless”), complete SATB staves, no clipped or duplicated music, no apparent voice swaps, and the printed final cadence. Printed line breaks are not imposed on the responsive view. The numbered `W:` transcript was also normalized to continuous prose without editorial slash separators. This constitutes source-photo and current-desktop-render approval for this arrangement. Physical-phone rendering, audible playback, and print-dialog checks remain separate release gates.

## Independent full-event pass and current render — 2026-09-28

A separate reviewer compared every SATB event across all fourteen printed bars with the owner's `20260829_112835.jpg` photo, using `_316.webp` only to clarify the engraving. Pitches/registers, onsets and durations, bar structure, printed natural signs, all 38 lyric syllable slots, and the `W:` transcript matched; no source correction was identified. ABCJS 6.7.0 rendered one SVG with 152 noteheads (38 attacks in each of four voices), 38 lyric elements, and no warnings. A fresh production-hosting desktop screenshot at 1400 pixels was then visually inspected: both systems, voice stacks, and final double bar are present without apparent staff clipping or voice swaps. The first system visibly crowds separate words such as “All men,” so lyric spacing and a narrow-viewport render still need review before final render approval. Physical-device audio/print QA also remains open.

## Independent printed-score revisit — 2026-09-27

A separate reviewer compared the owner photo and same-edition `_316.webp` with the ABC. The printed three-flat E-flat signature, 3/4 meter, fourteen bars (seven per printed system), all soprano pitch/rhythm events, and explicit B-natural in bar 8 match the source. Sampled inner-voice contours and the printed tenor/bass natural signs also agree; this was not a pixel-level second transcription of every SATB note. A separate lyric-only reviewer checked the full sole stanza, both refrain occurrences, and all 19+19 `w:` slots, including `lov-ing-` across the system break to `kind-ness`; no text or alignment defect was found. No ABC change was warranted. Audible physical-device and print-layout QA remain open.

- Ground truth: local source evidence (not distributed), printed page 274. No. 316, “The World-Wide Praise of God,” follows the complete no. 315 setting and contains one BRAUN tune by Johann G. Braun. It is complete in two grand-staff systems and ends with its own final bar; no continuation or alternate tune is shown.
- The photo shows Psalm 117, 6s and 4s, three flats (E-flat major), and 3/4. Compared the two systems' handwritten pitch labels and printed note values with all four source voices. The source's 14 measures per voice, pitch sequence, rhythm, and final dotted-half chord agree with the annotated score. No rests or additional expressive marks are printed. No score correction was warranted.
- The single printed stanza matches the source `W:` text through “Praise ye the Lord.”, including the repeated refrain. It now has complete photo-matched `w:` underlay: 19 lyric syllables on each of the two 19-event soprano systems. The photographed `lov-ing-kind-ness` crosses the system boundary after `ing-`; the final `Lord.` attaches to the last note. The normalized `W:` transcript remains intact.

## Targeted ABCJS parse and render check

The prior ABCJS 6.7.0 parse/render check found one tune, two music lines, four voices, zero warnings, and one SVG with 152 noteheads. `tools/inspect-underlay.mjs psalter316` now confirms all 38 first-voice events carry the photographed stanza's lyric syllables. A fresh desktop production-browser screenshot shows the lyric line wrapping and system-crossing word without obvious clipping; mobile and print remain unchecked.

No SATB note was changed in this lyric pass.
