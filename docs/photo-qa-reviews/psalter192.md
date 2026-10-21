# Psalter 192 photo QA (partial)

- Source: local source evidence (not distributed), annotated photo 155, printed page 161. No.192, “A Prayer of Faith,” is fully visible. Stanzas 1–4 are underlaid across three musical systems; stanzas 5–6 are printed as text below the score. The final-bar marker `[Stanzas 12–17]` is preserved in `N:`.
- Metadata/text: Psalm 71, C.M.; AVON by Hugh Wilson. The four printed underlaid stanzas and two text-only stanzas have soprano `w:` rows split at the three photographed systems. Stanzas 5–6 also remain complete in `W:`. The photo’s system break splits “faith-ful- / ness,” preserved in the corrected `w:` syllable dividers.
- Rights/footer: no copyright notice for no.192 is visible on p.161.
- Earlier structural check: `inspect45-lyrics.mjs psalter192` reported 32 T1 note events and no parser warnings. Its assignment counts did not establish correct lyric-to-note placement; see the corrected note-column review below. SATB source notes were not changed; no forced `$` breaks were added.
- Status: PARTIAL. Photo-grounded lyrics and parser final-word attachment are checked. Full pitch/rhythm/accidental/SATB audit and rendered-score visual QA remain open.

## Later-stanza attachment and earlier-underlay finding

Added numbered `w:5.` and `w:6.` on all three soprano systems, retaining all music and complete `W:` transcripts. Stanzas 5–6 are printed as text below the music; their underlay is inferred from the photographed common-meter syllable columns. Stanza 5 uses three syllables for `Israel`, and stanza 6 uses three for `enemies`, `ceaselessly`, and `righteousness`.

The existing music has 10 / 11 / 11 soprano note slots. Each added first-system row contains 9 syllables and an extender at slot 6 (the second eighth note of `A/B/`); each second-system row contains 10 syllables and an extender at slot 3 (the second eighth note of `c/B/`); each final-system row contains 9 syllables and extenders at slots 6 and 8 (the second notes of `(E F)` and `A/B/`). Each new stanza therefore supplies all 28 syllables over all 32 slots, ending its final word on the final note.

The photograph also exposed misplaced extenders in stanzas 1–4, which were corrected after the scope was expanded. Every existing first-system row now extends its fifth syllable over the paired eighth notes at slots 5–6, placing the next phrase's first word on the actual final pickup at slot 10. Every second-system row extends its second syllable over slots 2–3; stanza 4 now correctly places `faith-ful-` on the last two notes, continuing `ness` on the next system. Every final-system row extends the syllables at slots 5 and 7 over slots 6 and 8 respectively, placing the last word on the final note instead of extending an early ending. These positions were read directly from the photographed lyric columns; punctuation was also restored from the photograph.

The source inspector confirms 10 / 11 / 11 note events, six lyric rows, and no parser warnings. All six rows have explicit melisma slots at the photographed positions; their final words end on the final note. Full SATB and fresh visual-render QA remain outside this underlay-only change, so the overall status remains PARTIAL.
