# Psalter 312 photo QA

## Final source-photo and desktop-render approval — 2026-09-28

An independent reviewer compared every SATB event of the complete setting on owner photo `20260829_112826.jpg` (p. 272) against the current ABC: 29 attacks per voice (116 total), four-flat key, 3/4 bar structure, pitches/registers, durations, final double bar, and absence of unprinted accidentals or expression marks. All six printed stanza texts and the 15/14 soprano underlay slots, including the single melisma extender, matched. The current production desktop render at 1400 pixels shows all four parts, stanzas 1–5 followed by the repeated tune for stanza 6, and the final cadence without apparent clipping or voice swap. Editorial slash separators were removed from the numbered `W:` fields without changing words or notes. Source-photo and current desktop-render QA is PASS. Physical-phone, audio, and print-dialog checks remain separate release gates.

## Independent score and underlay revisit — 2026-09-27

An independent reviewer compared the owner photo and same-edition `_312.webp` to the ABC. The printed four-flat A-flat signature, 3/4 meter, pickup, soprano attack/rhythm groups, and sole lyric melisma agree with the source. All six stanza rows have the expected 15/14 melody slots, and sampled alto/tenor/bass onset patterns and pitches showed no reproducible discrepancy. This is a detailed visual spot check, **not** a fresh pixel-by-pixel proof of every inner-voice pitch or audible-device QA. No ABC change was warranted.

Status: PASS for the score transcription, photographed text, boundary, and six-stanza note underlay. All six stanzas remain complete in `W:` and gained `w:` rows on 2026-09-25.

## Photo review

- Ground truth: local source evidence (not distributed), printed page 272, no. 312, “Granted Prayers,” Psalm 116, Common Meter, AZMON, arranged from Carl G. Gläser.
- Boundary: the image contains both complete grand-staff systems and the terminal double bar for no. 312. No. 313 begins below it; no. 311 material is not included.
- The photographed signature is four flats (A-flat major), and the meter is 3/4. The source has one four-part setting, ten measures, and matches the annotated pitches, durations, and rests across both systems. The score's terminal bar is retained; no unsupported expressive mark was added.
- All six stanzas match the photo through their final words: “rest,” “relief,” “weak,” “thee,” “whole,” and “believed.”
- `W:` is retained alongside the new note-aligned `w:` rows. An earlier draft placed an extender after `cry` and parallel words; that was withdrawn. The approved rows place the second-system pickup (`In`/`Then`/`He`/`The`/`My`/`But`) on the final `e2` event of source line one, after the photographed first system's `B4` cadence. The sole extender is later in the final phrase, not after `cry`.

## Targeted checks

- ABCJS `parseOnly` and in-memory `renderAbc` on the no. 312 source block: one tune, two parsed music lines, four staff groups with two voices each, one SVG, 114 noteheads; no parser errors.
- Independent 2026-09-25 review of the new rows found six lyric attachments at each of the 15 first-line and 14 second-line T1 events. The reviewer checked every stanza word and syllable against the owner photo; ABCJS gave no warnings.
- Staged-block validator: a historical local-only comparison tool (not distributed) — PASS for block 312.
- No source score correction was warranted in this review.

The new rows change lyric fields only; SATB music and complete `W:` text were preserved. A fresh local production-browser desktop screenshot under ignored local source evidence (not distributed) shows stanzas 1–5 under the responsive score, then stanza 6 on a repeated setting, without obvious clipping. Print and audible physical-device QA remain open.
