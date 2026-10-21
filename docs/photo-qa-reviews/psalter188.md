# Psalter 188 photo QA (partial)

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](../release-checklist.md) for release preparation.


- Source: local source evidence (not distributed), annotated photo 153, printed page 158. The entire no.188 setting is visible on this page: title/metadata and the first underlay system, followed by two continuation systems. No.189 begins below it.
- Photo text/metadata: “A Suppliant’s Urgent Prayer,” Psalm 70, 11s and 8s; DELPHINIUM by Hart P. Danks. The four printed stanzas’ wording in `W:` matches the photographed text. No selected-stanza marker is visible for no.188.
- Rights/footer: the printed footer reads “Copyright, 1901, by United Presbyterian Board of Publication. Used by per.” and is preserved verbatim in `W:`.
- Underlay resolution: a fresh read of the original photograph found the prior trial had split stanza 3–4 text at the wrong phrases. The printed systems have 12, 14, and 12 soprano note attacks respectively. Each of the four printed stanza rows also has 12, 14, and 12 syllables when split at the photographed system boundaries. All twelve `w:` rows are now attached to the three music lines, with 38/38 lyric assignments per stanza and no ABCJS warnings. The complete `W:` transcript remains unchanged. `src/data/psalter188Lyrics.test.ts` checks the parsed slots and two-stanza viewer groups.
- Status: PARTIAL. Photo boundary, lyric underlay, tune/meter metadata, and rights notice are checked. Full SATB note audit and rendered-score visual QA remain open. SATB source notes were not changed.
