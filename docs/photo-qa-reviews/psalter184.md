# Psalter 184 photo review — approved

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](../release-checklist.md) for release preparation.


- Authority and boundary: annotated photograph local source evidence (not distributed), printed page 155, no. 184 / ELIJA. Adjacent annotated photos 148 and 150 confirm that no. 184 is complete on photo 149. The setting has three grand-staff systems and no separate tune or continuation. The first five numbered stanzas are underlaid throughout all three systems; stanzas 6–9 are printed as text below the score.
- Underlay: stanzas 1–5 are attached to the soprano in all three systems, with 12 / 11 / 12 note events per system. Printed syllable hyphens, note skips, and the tied-note extenders are represented in `w:`. Photo positions were checked against each note column; no syllables were assigned by count alone. All nine source stanzas are preserved in `W:`.
- The complete setting’s pitches, rhythms, voice assignments, phrase and final bars, ties, slurs, and accidental are documented in local source evidence (not distributed); its annotated photo remains authoritative, with the same-edition clean score used only as a layout aid.
- Current ABCJS rendering of the source block was compared with the annotated photo for all five underlay rows. The 12 / 11 / 12 soprano note-slot matrix and absence of parser warnings are covered by `src/data/psalter184Lyrics.test.ts`. The rendered scratch artifact is under ignored local source evidence (not distributed) and is not the approval record.

`Transcriber-QA: PASS. Independent Photo-QA: PASS. Underlay and render QA: PASS.`

## Later-stanza attachment

Added numbered `w:6.` through `w:9.` on each soprano system, retaining all notes, earlier rows, and complete `W:` prose. Words and punctuation were checked against the owner photograph. Since these four stanzas are printed below the score, their alignment is inferred from the printed common meter and the photographed positions of stanzas 1–5.

Each new first-system row has 9 syllables and 3 explicit skipped-note slots, totaling 12; each second-system row has 10 syllables and 1 tied-note extender, totaling 11; each third-system row has 9 syllables and 3 extenders, totaling 12. Each stanza therefore supplies all 28 metrical syllables over all 35 soprano note slots. The splits across systems include `breth-ren / know`, `re- / proach-ing`, `sack-cloth / clothed`, and `lin-ger / at`; no word is omitted or repeated. Stanza 7 uses two syllables for `consumed`, and stanza 8 uses one for `clothed`, as required by the printed meter.

`tools/inspect-underlay.mjs psalter184` against the source confirms three systems with 12 / 11 / 12 events, all nine lyric rows, the intended later-stanza syllables at each note column, and no parser warnings. Use the Node version pinned in this repository for the inspector.

The earlier approval above records stanzas 1–5. The added stanzas have source-text and slot-placement checks; a fresh visual render of all nine rows is still required before extending that render approval.
