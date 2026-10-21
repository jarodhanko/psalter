# Psalter 298 photo QA — PASS

## Full-text transcript pass

- Rechecked all three printed stanzas on local source evidence (not distributed), printed page 260, and added complete one-line `W:` text fields. Notes and note-attached `w:` rows were unchanged.

The ignored early working note local source evidence (not distributed) still records an initial “quarantined/no ABC” decision. That status is historical and superseded by the canonical score and the review below; the clean printed engraving, not handwritten pitch labels, is authoritative where they disagree. A 2026-09-27 bounded scan recheck found no concrete SATB or underlay defect, though lower-staff details and device rendering were not exhaustively recertified.

- Ground truth: annotated photo local source evidence (not distributed) (photo 254, printed page 260). The page contains the complete four-system no. 298 setting.
- Photo-visible heading: “Gratitude and Confidence,” Psalm 108, 6s and 4s, CUTTING by William F. Sherwin. The score is in B-flat major and 2/2. Three stanzas are printed.
- Converted the three complete stanza texts from `W:` into soprano `w:` underlay. Each of the four printed systems has 9, 10, 9, and 10 soprano note events respectively, matching the 38 syllables in each stanza. The syllable split at `ex-alt-ed` is carried across systems 2–3. ABCJS confirms the final note assignments are “bring.”, “save.”, and “Lord.”
- The existing four-part SATB transcription and rhythms were left unchanged; the prior photo-QA note for the score remains applicable. No duplicate `W:` stanza block remains after underlay conversion.

## Targeted ABCJS parse and render check

`parseOnly` found one tune and zero warnings. There are four score lines (plus the tune-name subtitle line); each line contains two staves with two voices each. Per-system S/A/T/B event counts are 9/9/9/9, 10/10/10/10, 9/9/9/9, and 10/10/10/10. All 38 soprano note positions have lyric assignments for all three stanzas. ABCJS rendering in a DOM produced one SVG with 152 noteheads and no exception.

## Remaining QA

The lyric wording, syllable alignment, and final words were checked against the annotated page. No generated files or shared documents were changed.
