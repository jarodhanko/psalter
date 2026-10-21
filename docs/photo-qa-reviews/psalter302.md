# Psalter 302 photo QA

## Full-text confirmation

- Rechecked the existing three `W:` stanzas and title/tune metadata against local source evidence (not distributed); no wording or punctuation discrepancy was found. No source change was needed for no. 302 in this pass.

Status: lyric underlay complete; independent full SATB audit remains open. The three photographed stanza rows are now attached to every soprano music line, with the complete `W:` stanzas retained.

## Photo and boundary

- Ground truth: local source evidence (not distributed), printed page 264, no. 302, “Our Lord Jesus,” Psalm 110, 8s and 7s, BIRDSTOWN, Charles H. Gabriel.
- The photo contains all four systems of no. 302, with the terminal double bar. The following image, `20260829_112758.jpg`, begins no. 303 on printed page 265; no. 301 is not included in the no. 302 transcription.
- The source block retains four voices in two grand-staff pairs, four-flat key signature, 4/4 meter, the explicit D-natural, rests, and closing slurred descent. The photo's handwritten note labels and printed notation should still be used for a complete independent pitch/rhythm audit; this report does not certify every individual note.
- All three stanza texts in the existing `W:` fields remain present. The photographed first three systems have 13/11/15 soprano events and the same number of printed syllables in every stanza. The final system has 17 sung-note events for 14 syllables: event 13 starts `bel-` / `ev-` / `alt-`, events 14–16 continue that syllable through the printed slurred descent, and event 17 starts `lion.` / `er.` / `ed.`. A second reader verified all twelve underlay rows against the photo.
- The printed footer “Copyright, 1912, by United Presbyterian Board of Publication. Used by per.” is retained as non-lyric `N:` metadata. Recording it is not a rights-clearance finding.

## Targeted checks

- ABCJS parse-only and in-memory render of the no. 302 source block: 1 tune parsed, 4 musical lines, 1 SVG rendered, 224 noteheads; no parser errors in the earlier score check.
- Staged-block validator: a historical local-only comparison tool (not distributed) — PASS for block 302.
- Remaining QA: compare every soprano, alto, tenor, and bass pitch/duration/rest/slur in all four systems directly against the photo; verify mobile, print, and audio behavior. The lyric underlay itself is photo-reconciled but does not certify the SATB score.
