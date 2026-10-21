# Psalter 311 — printed-score reconstruction

## Full score-and-lyric approval — 2026-09-28

An independent read-only reviewer compared the owner photo `20260829_112822.jpg`, the same-edition clean scan, and current ABC across all SATB parts. The event ledger contains 150 note attacks (S 40, A 42, T 36, B 32), 16 complete 2/2 bars in each voice, and no parser warnings. Printed pitches/registers, durations, bars and phrase boundaries, slurs, and the two explicit F-sharps (soprano bar 5; alto bar 7) agree. All five printed stanza texts and their note underlays agree. No reproducible score or lyric defect was found. A fresh 1400-pixel desktop production render was visually inspected with all parts and five stanzas present. Score/photo and desktop-render status: PASS. Audio playback, physical-mobile behavior, and print output are separate release checks. The older pending-review statement below is superseded.

## Corrected score and five-stanza underlay — 2026-09-27

The earlier partial review below did not detect a material score error. An independent deeper reading of the owner photo and same-edition `_311.webp` shows **no key signature (`K:C`) and sixteen full 2/2 bars**, rather than the former `K:Bb` and twenty-four uniform ABC bars. The opening printed soprano bar is `E2 E E`, not three long notes in separate bars. All four voices were retranscribed from the printed noteheads; each contains 64 quarter-note units. The two printed sharps, soprano bar 5 and alto bar 7, are explicit. The printed phrase boundaries after bars 4, 8, and 12 and the voice-specific slurs are retained. The former unprinted tempo mark was removed.

All five printed stanza rows now appear as `w:` under the four music phrases; the complete `W:` transcripts remain for reading and search. Each phrase has ten soprano attacks and eight sung syllables. Two slurred continuation notes per phrase use `_` lyric extenders. The pinned ABCJS underlay inspector shows all five rows on each phrase with no parser warnings. A separate Sol reviewer checked the lyric positions and spot-checked the first and final lower-voice phrases without finding a contradiction to the retranscription.

Status: corrected from print with targeted independent review. A second complete event-by-event SATB ledger and audible physical-device QA remain open. The historical review below is superseded for key, meter grouping, pitch, and underlay claims.

## Historical review (superseded)

Source checked: annotated image local source evidence (not distributed) (sequence 265, printed p. 271). The image shows the end of no. 310, then “The Living Sacrifice” / WALLACE / Benjamin F. Baker, Psalm 116, L.M., in 2/2 and B-flat major. No. 311 occupies three SATB systems and has five printed stanza rows numbered 1–5. The page footer says `[Stanzas 7-11]`; the next page begins no. 312, “Granted Prayers.” Thus no. 311's boundary is clear and the five `W:` fields correspond to printed stanzas 1–5 in this selection. Added separate `N:` fields for the Psalm/meter and printed stanza selection.

The existing SATB transcription was compared against all three systems, including the visible note/rest values, barlines, key signature, the natural sign in the soprano, and the grouped/slurred figures. I found no specific correction that the photo supports confidently. All five lyric texts appear to match the printed text. However, the photo plus this transcription does not establish every syllable-to-note slot unambiguously across the 46-note melodic line, so this remains PARTIAL: lyrics are deliberately retained as `W:` rather than converted to underlaid `w:`.

Targeted ABCJS evidence (only the `psalter311` template extracted from `src/psalter-abc.ts`, using the repo's installed ABCJS): `parseOnly` returned exactly one tune with no warnings. The parsed score has three systems; per-system event counts are S/A/T/B `15/15/15/15`, `15/15/15/15`, and `16/16/16/16`; each voice has eight bars in each system. `renderAbc` produced one SVG with 184 noteheads. The five lyric fields remain W fields (zero w fields). This checks parser/render integrity, not photographic fidelity.
