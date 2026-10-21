# Psalter 366 photo review — 2026-09-27

- Owner photo local source evidence (not distributed) (printed page 312) and same-edition clean score local source evidence (not distributed) show “Humility and Meekness,” Psalm 131, S.M., tune OLMUTZ arranged by Lowell Mason. No. 367 begins below it. The missing Psalm, meter, and page metadata were added to the canonical ABC header.
- The three printed stanza texts and their syllable divisions agree with the six source `w:` rows. The pinned underlay inspector reports 12 soprano events on the first music segment and 14 on the second, with all three stanzas attached through their printed final words. ABCJS parsed the four voices without warnings.
- A visual SATB comparison against the clean engraving found no concrete pitch, rhythm, rest, barline, or fermata discrepancy. This is a manual score review, not an independent audio or physical print check; any later exact event-level claim should retain its evidence.

## Full-text stanza completion — 2026-09-30

An independent Luna text review and the primary clean-scan reading agree on all three complete stanzas. Three numbered `W:` transcripts now join the two corresponding underlay segments for the lyrics panel and search. No notes or syllable-to-note assignments were changed. Exact note-level verification and fresh render approval remain open; this text completion is not full corpus ratification.

## Independent complete note audit — 2026-09-30

An independent enlarged printed-score audit reconciles every SATB pitch, duration, accidental, pickup, and phrase boundary with the source. The three simultaneous bass-staff heads at `heart` are B3/F3/B2, represented by the tenor dyad `[F,B,]4` and bass `B,,4`. The half-note pickup and short phrase-ending groups are printed structure, not missing beats. The alto's two E-natural signs are correct. The printed fermata above the upper bass voice on `things` was missing from the source and has now been restored as `!fermata!B,2`; soprano and inverted lower-bass marks were already present. Notes and all three stanza texts are reconciled; final responsive rendering approval remains open.

## Concrete single-part lyric blocker

Actual reduced-score inspection finds that tenor (`B1`) loses all three stanza rows at absolute onset 4.5: stanza 1 `my`, stanza 2 `ly`, stanza 3 `con-`. The printed tenor C is held from onset 4.0 to 4.75, so it has no attack at 4.5. This is a shared display-transfer problem, not a source note defect. A display-only tied split can supply the lyric anchor while preserving the original pitch, total duration, and audio. That implementation and note-click timing review remain open; do not approve the arrangement while the rows disappear.

The generic ordinary-note anchor implementation now engraves this held C as `C2-C` without changing source ABC or synthesized full-score music. Actual parser review retains all 78 syllables with exact stanza identities and onsets; split durations 0.5 + 0.25 equal the original 0.75. The rendered continuation resolves to 4500ms at quarter-note tempo 120, distinct from the preceding 4000ms note, through the existing note-click timing path. Independent review also verifies multiple splits on one source line and explicit accidental preservation. All 59 existing viewer tests and TypeScript pass. Final visual approval remains open; unsupported chord, rest, tuplet, grace-note, and existing-tie anchor cases remain broader renderer work.

The corrected tenor-only view was then visually inspected at 1280px desktop and 390px phone widths. All three complete stanza underlays remain visible through their final words; `my`, `ly`, and `con-` align with the generated tied C continuation, the printed fermata remains visible, and staff lines reflow without losing lyrics. This approves that corrected view, not all remaining full-score/other-part render gates.

The full 1280px score was also inspected through all three systems: all original SATB notes, both alto naturals, the heart dyad, and the three printed stanza endings are present. The full phone view retains all voices and stanza rows through its reflowed systems; the final capture's bottom edge did not include every final word, so that crop alone is not final phone approval. Alto-only and bass-only review remain open.

The alto-only 1280px view has now been compared directly with the clean printed score through all three reflowed systems. Both E-natural signs, all alto note lengths, and all three stanza endings (`denied`, `breast`, `guide`) remain visible and correctly aligned. This closes desktop alto visual review only. Bass-only and the complete phone ending remain unapproved; browser observation timeouts do not establish a rendering defect or a pass.
# Narrow-width bass-only renderer checkpoint — 2026-09-30

The deployed `index-DalPnYk2.js` release was loaded through the app's Update now control and inspected in the in-app browser at a 546px CSS viewport. Bass alone was selected. A full-page screenshot shows all three stanza rows through their closing `denied`, `breast` and `guide` words, readable staff/notes and no visible lyric collision/clipping. Document client width and scroll width both measure 546px. This closes that bounded narrow-width bass-only visual check, not physical-phone, desktop-width, print, audio or whole-arrangement certification. Source verification remains independently tracked; no ABC changes were made for this check.
