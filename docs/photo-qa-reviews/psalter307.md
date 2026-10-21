# Psalter 307 photo QA — bounded review

## Full-text stanza transcript — 2026-09-28

All four printed stanza rows on the owner's photo were checked again against the existing `w:` underlay. Added one numbered `W:` transcript per stanza for offline search and reading, preserving the printed `ev'ry` in stanza 3. This is a text-only change; intermediate-system SATB note verification remains open.

## Independent revisit — 2026-09-27

The owner photo and same-edition `_307.webp` were rechecked for the first and last printed systems in all four voices. No reproducible pitch, duration, or bar discrepancy was found in those systems. All 16 printed lyric lines were compared to the ABC underlay; stanza 3's printed `ev-'ry` spelling was restored from the former `ev-ry`. Intermediate systems 2–3 have **not** received a new independent event-by-event SATB check. The older PASS claim below therefore exceeds the scope of the independent evidence and should not be read as final note-level certification.

- Ground truth: annotated photo local source evidence (not distributed) (sequence 262, printed page 268). It contains the complete no. 307 setting and all four stanzas; no neighboring song is included in this ABC block.
- Confirmed the heading and score metadata: *Bondage and Deliverance*, BLOOMFIELD CHANT, William B. Bradbury, Psalm 114 / L. M., D major, 3/2. All four stanzas match the photo through their final words.
- Compared all four SATB systems against the printed notes, handwritten pitch labels, note values, bar divisions, and visible marks. Each system has eight soprano note events, matching its four corresponding stanza lines of eight syllable slots. The photographed partial bars remain as printed; no note, rhythm, or expression discrepancy was found.
- Converted the four stanza fields to soprano `w:` underlay. Hyphenation follows the photo's syllables, including Is-rael, E-gypt, Je-ho-vah, and ev-ry. Underlay is divided by system so all four printed lyric rows align with their corresponding phrase. The final soprano note in each system receives the visible phrase endings: “went / way / sea / Lord,” “unknown / turned / tide / fear,” “dwelt / hills / hills / rock,” and “throne / discerned / side / clear.” No duplicate `W:` stanza fields remain.

## Targeted ABCJS parse and render check

Using the installed ABCJS version with the extracted `psalter307` block, `parseOnly` found one tune and zero warnings. It produced four music systems, each with 8/8/8/8 S/A/T/B note events. There are zero `W:` fields and 16 system-specific `w:` fields. ABCJS assigns the expected starting and ending syllables to each soprano system; the last system ends with “throne.”, “discerned.”, “side?”, and “clear.” Rendering into a DOM produced one SVG with 128 noteheads and no exception.

No generated files or shared documents were changed.
