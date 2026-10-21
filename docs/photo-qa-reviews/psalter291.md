# Psalter 291 photo review — lyric underlay

## Full-text and responsive prose pass

- Rechecked the first six printed underlay rows across both systems on `20260829_112702.jpg` and added complete `W:1`–`W:6` fields. Removed literal slash line separators from `W:7`–`W:12`; their words and punctuation are unchanged. Notes and `w:` rows were not changed in this pass.

- **Authority:** local source evidence (not distributed) (photo 247, printed p. 253). It contains the complete NOTTINGHAM setting and all twelve stanza texts. Stanzas 1–6 are printed below the music; stanzas 7–12 are printed in prose below the second system.
- **Directly verified:** The first six `w:` rows in each system follow the photographed underlay. Their pattern is 8.6 syllables per system: in system 1, the final syllable is followed by a sustained note; in system 2, the photographed three-note melisma is represented by `_` after the third syllable of the closing line. Full `W:` text for stanzas 7–12 matches the printed prose.
- **Inferred underlay:** Added numbered `w:` rows for stanzas 7–12 in both systems by applying that directly printed common-meter pattern to the complete printed stanza text. These later stanza-to-note alignments are not printed under the music in the photo. The abbreviated/split forms `cov- nant` and the two-syllable `al- ien` fit the established 8.6 pattern; full spellings remain in `W:`.
- **Structural check:** Bundled Node 24 `tools/inspect-underlay.mjs psalter291` reports two systems with 15 soprano events each. In system 1, the new rows end on event 14 and extend the sustained event 15; in system 2, each new six-syllable closing line places `_` on event 12 and ends on event 15. ABCJS parser-slot verification only; no full music/render audit was performed.

`Transcription-QA: PASS for photographed source and existing six direct underlays. Later-stanza underlay: INFERRED from the printed stanza pattern, not directly printed alignment.`
