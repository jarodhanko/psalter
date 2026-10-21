# Psalter 305 photo QA — PASS

## Full-text transcript pass

- Rechecked all six printed stanza rows on the owner photos and added one complete `W:` field per stanza, preserving printed punctuation and contractions such as `mem'ry` and `o'erthrown`. Notes and note-attached `w:` rows were unchanged.

## Independent recheck — 2026-09-27

A read-only second reviewer compared both owner photos with the canonical ABC. The complete two-page tune boundary, SATB notes and rhythms, six stanza texts, and 19/16-event soprano underlay showed no concrete discrepancy. The project-pinned Node 24 ran the underlay inspector successfully. This is a source/parse check, not audible, print, or physical-device approval.

- Ground truth: annotated photos local source evidence (not distributed) (printed page 266) and local source evidence (not distributed) (printed page 267). No. 305 begins at the bottom of page 266 and its second system continues at the top of page 267, before no. 306 begins.
- The two photos show one complete WELTON setting, “The Blessed Life,” by H. A. César Malan, Psalm 112 / L. M., in E-flat and 2/2. Compared the full boundary, all four SATB parts, readable pencil pitch labels, durations, slurs, and final bars with the source. The existing note/rhythm transcription agrees where legible; no music correction was identified.
- All six stanza texts match the print and are underlaid across both systems. The first system has 19 soprano note events per stanza; its second phrase contains three slurred melismas, represented with `_` extenders. The continuation has 16 soprano events per stanza and ends at the printed stanza endings. The final assigned words are `will;`, `dure,`, `tain;`, `lone;`, `vide;`, and `gain;` on system 1, followed by `fill.`, `pure.`, `main.`, `thrown.`, `bide.`, and `tain.` on system 2. The `W:` fields were replaced with `w:` underlay.

## Targeted ABCJS parse and render check

ABCJS 6.7.0 parsed one tune with zero warnings. The two score lines contain T1 note counts of 19 and 16; each stanza has exactly 19 lyric slots on the first line and 16 on the continuation, including the final word. A DOM render produced one SVG with 138 noteheads and no exception; it includes six lyric rows under each score line.

## Existing lyric audit

The earlier audit snapshot reported 458 arrangements and a generated `psalter305` without `w:` because generated data had not yet been refreshed. That historical snapshot is superseded: the current viewer corpus has 474 arrangements, and current generated `psalter305` includes the canonical note underlay.
