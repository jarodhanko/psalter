# Printed-source corrections for Psalters 132 and 134

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](release-checklist.md) for release preparation.


This bounded follow-up starts from the historical reviewed source, the historical reviewed source. It changes only the following independently reviewed score content and Psalter 134's existing print-selection identity.

- **132, ST. JOHN'S HIGHLANDS:** alto bar 7, second event (q26), C4 becomes D-flat4, with the same two-quarter duration. Both stanza 2 `Where-e'er` tokens become printed `Wher-e'er`; added commas after stanza 3 `joy` and stanza 5 `lives` and `end` are removed. The original 1912 printed pages 112–113 (archive leaves 0118–0119) and RFPA PDF page 198 agree.
- **134, DIADEMATA:** tenor printed measure 16, beat 4 (q43), D4 becomes C4, and stanza 2 `King;` becomes `King.`. Original 1912 page 114 (leaf 0120) is in E major and prints C-sharp4; the RFPA edition on PDF page 200 is in E-flat and prints C4. The existing E-flat setting is retained. Its existing migration entry keeps previous `[]` and current `[1, 2, 3]`, with the exact corrected source SHA-256.

The RFPA PDF is available at [The Psalter](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf). The original volume is [The Psalter, 1912](https://archive.org/details/psalterwithrespo00unit). Source scans remain outside application source.

## Independent evidence and retained differences

The complete 132 fixture contains 130 printed events, all five stanza underlays, explicit accidentals, slurs and barlines. Its initial manual ledger was frozen before canonical exposure; fourteen source-reading errors were then corrected through disclosed source images and an independent reader. The fixture uses that revised ledger, not canonical or parser output.

The complete 134 fixture contains 209 printed events and per-voice lyrics for all three stanzas. The initial RFPA ledger was frozen before canonical exposure. Recovered original 1912 pixels were inspected afterward and corroborate all 209 events after transposition; this was a post-exposure corroborating read, not another blind transcription. Edition word forms `ev'ry` and `tow'rs` remain unchanged.

Existing 134 lower-recipient rendering behavior remains explicit in regression expectations: when soprano is hidden, the first remaining part's q49 quarter is split into tied eighths to place the second syllable at q49.5. A tenor recipient additionally splits its q58 dotted quarter at q59, moving the final syllable from the printed q59.5 to q59. These are retained presentation differences, not additional corrections. The full sounding attack ledger, barlines and timing remain unchanged.

Psalter 133 fermata presentation, all other held marks/cues and optimization work are excluded. Hymn content, viewer settings, dependencies, release gates and budgets are unchanged.

## Regression coverage

`psalter132and134PrintedCorrections.test.tsx` checks exact permitted source edits, full independent printed music, literal accidental signs, words and punctuation; every nonempty part subset with grouping, learner signs and transpositions; real audio callbacks including all mute masks; exact before/after audio changes; actual React screen/print preparation; all stored stanza subsets; and negative controls for separately reverted changes, altered key/rhythm, corrupted callbacks and visual tie/slur corruption.

`legacyPrintSelectionWitnesses.test.ts` adds the reviewed 52-line global invariant using the real lazy source loader. It verifies all 75 existing hashes, stanza membership, historical default migration, explicit selections and fail-closed conditions. The isolated integration also demonstrates that restoring the actual stale Psalter 91 digest makes exactly its case fail.

These checks cover source, prepared notation, jsdom React orchestration and actual audio callback data. They do not certify native browser geometry, physical printing or acoustic listening. The complete local verifier remains required before release.
