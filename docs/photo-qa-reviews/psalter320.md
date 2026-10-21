# Psalter 320 photo QA — PASS

## Full score-and-lyric approval — 2026-09-28

An independent read-only reviewer compared owner photo `20260829_112852.jpg`, same-edition clean `_320.webp`, and source/generated ABC. ABCJS reports zero warnings and 131 attacks (S 32, A 33, T 34, B 32) across eight complete 4/4 bars. Printed pitches/registers, durations, barlines, four-flat A-flat signature, tenor A-naturals, and untied final half-note cadence agree. All five printed stanza texts and 32 soprano underlay positions agree; the `[Stanzas 6–10]` note refers to the Psalm selection, not additional Psalter stanzas. A fresh production desktop render was inspected with all parts and five lyric rows present. Score/photo and desktop-render status: PASS. The single continuous ABC music line is reflowed by the viewer; it need not reproduce the print's two fixed systems. Device/audio/print QA remain separate. The older PARTIAL status below is superseded.

## Full-text stanza transcript — 2026-09-28

Checked all five printed stanza rows on the owner's photo and added numbered, continuous `W:` transcripts for offline reading and full-text discovery. The sung `w:` underlay and all music events are unchanged. `[Stanzas 6–10]` remains a Psalm selection reference, not an instruction to invent additional Psalter stanzas. Full independent SATB note certification remains open.

## Printed final cadence correction — 2026-09-27

The previous ABC tied the final half note in every voice into an extra half-note bar (`E4- | E4` in soprano, analogous endings in alto, tenor, and bass). Both the owner photograph and the same-edition clean scan show one untied final half note followed immediately by the double bar. The extraneous bar and four ties have been removed; no pitches were changed. The source header now names the printed tune APPLETON separately from composer William Boyce, while the Psalm and L. M. meter remain in `N:`.

The five stanza rows now occupy all 32 soprano note events, including their final words, with no spurious 33rd continuation. A separate lyric-focused review found no missing word or underlay shift. A targeted SATB review found no further definite pitch, rhythm, or accidental discrepancy, but this is not a full high-magnification event-by-event certification or live-device audio/render approval. Overall status remains PARTIAL.

- Ground truth: local source evidence (not distributed), printed page 278. It shows no. 320, “Thankfulness and Triumphant Joy,” Psalm 118, L. M., APPLETON, William Boyce. This is one complete setting; its closing bar and the printed `[Stanzas 6–10]` note precede the start of no. 321. No. 320 does not continue onto another photographed page and has no alternate tune.
- Checked the photographed four-flat signature, 4/4 meter, two printed music systems, bar and double-bar boundaries, and handwritten pitch labels across the soprano/alto and tenor/bass parts. The older claim of a terminal tied note and no evidence-backed correction is superseded by the cadence correction above. The source's ABC line grouping does not encode the photographed system breaks.
- The photo prints five complete lyric stanzas. They match the source's five `w:` stanzas through their final words: “thankfulness and praise,” “heard my prayer,” “doth stand,” “prosperity,” and “boundless grace.” The printed `[Stanzas 6–10]` marker identifies which Psalm 118 stanzas this five-stanza selection represents; it does not establish five additional missing hymn stanzas. This selection is now recorded in `N:`. Exact note-by-note lyric underlay is not approved by this review.

## Targeted ABCJS parse and render check

Using the source `psalter320` block with ABCJS 6.7.0, `parseOnly` returned one tune with no warnings. An in-memory DOM `renderAbc` call produced one SVG; the parsed score contains two SATB staff groups with two voices each, and the render contains 135 note elements. This establishes syntactic and render validity, not approval of note-by-note lyric underlay.

This original review predates the cadence and metadata correction above. The later metadata clarification corrects the status of the printed stanza-selection note.
