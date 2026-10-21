# Psalter 108 underlay review — partial

- Authority: owner photo local source evidence (not distributed), printed page 92, and same-edition clean scan page image local source evidence (not distributed). The owner photo shows the complete tune ELIZABETHTOWN and the text-only stanzas 6–7 beneath the two music systems.
- Added numbered soprano `w:` rows for stanzas 6–7 in `src/psalter-abc.ts`, preserving the existing `W:` transcripts. Both stanzas follow the same Common Meter 8.6.8.6 phrasing as the five underlaid stanzas. The first system takes the opening 8.6 syllables; the second takes the closing 8.6 syllables. The slurred `(B G)` pair in the first system carries one syllable, with the second note skipped, as in the existing rows.
- `tools/inspect-underlay.mjs psalter108` reports 15 soprano events on system 1 and 14 on system 2. Rows 6–7 align to 14 syllables per system; the only unassigned system-1 event is the slur continuation at event 7. No parser warnings were reported.
- This confirms text-to-event distribution and metrical fit against the photo, not a complete music transcription audit or fresh rendered-underlay review. Overall status remains PARTIAL.
