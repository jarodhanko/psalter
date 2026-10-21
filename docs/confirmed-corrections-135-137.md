# Printed-source corrections for Psalters 135–137

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](release-checklist.md) for release preparation.


This bounded correction starts from the historical reviewed source, the historical reviewed source. Only these four independently confirmed source edits and their existing legacy-selection SHA-256 witnesses change production content:

- **135, FISK**, and **135b, FERRIER**: stanza 4 ends “None to God a ransom give.” Both final commas become periods. All music is retained.
- **136, WATCHMAN**: bass measure 14, the second eighth at written q40, becomes E3 instead of F-sharp3. Both editions and an independent coordinator reading confirm the E3 space. Onset, duration and every other event are retained.
- **137, ST. PETERSBURG**: remove the extra comma after “Name” in stanza 6. Printed prose in both editions has no punctuation there. The existing prose already agrees. All music is retained.

The [RFPA Psalter PDF](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf), SHA-256 `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`, places the two 135 settings on pages 201–202, 136 on page 203, and 137 on pages 205–206. The [original 1912 volume](https://archive.org/details/psalterwithrespo00unit) places them on leaves 0121–0123, printed pages 115–117. Scans remain outside application source.

## Independent evidence and qualifications

The fixtures retain all 696 source attacks: 138 for FISK, 120 for FERRIER, 224 for WATCHMAN and 214 for ST. PETERSBURG. They include exact durations, pitches, explicit accidentals, slurs, bars and full stanza text. Expected music is transformed from manual printed ledgers, never from canonical ABC or parser output. The evidence fixture binds those source ledgers and revisions by SHA-256.

The initial ledgers were frozen before canonical exposure. Their later corrections are disclosed rather than presented as pristine first readings: 135 required 42 pitch-reading revisions, corroborated by a second source-only reader; 136 required one alto reading correction to C-sharp4, corroborated in both editions; 137 required six pitch-reading corrections and text/qualification revisions, corroborated by a second source-only reader. The 136 alto reading was an auditor correction, not an application defect.

For 137, RFPA supplies literal engraved underlay for stanzas 1–4 and prose for 5–6. Native underlay for stanzas 5–6, including “De-liv-rance,” remains a metrical inference. Tests retain that existing attachment without claiming it is literally engraved in either source. Only the extra comma is corrected.

All four existing migration witnesses retain their previous/current stanza arrays. Explicit saved selections, including empty selections, remain unchanged. The old unversioned default for 135/135b/136 is `[]`; for 137 it is `[5, 6]`. Only the exact source-bound hashes are refreshed.

Generated assets must be regenerated on the actual integration base. The older 137 audit had a pre-existing stale aggregate canonical digest; its aggregate manifest is not an integration input.

## Regression coverage

`psalter135to137PrintedCorrections.test.tsx` checks complete raw music and words, exact allowed deltas, all part subsets with grouping, learner signs and transposition, actual React screen/app-print preparation, and real audio callback maps with every mute mask. Each path asserts track cardinality and complete event counts. Negative controls reject reverted corrections, altered rhythm/key, changed slurs/ties, a corrupted pitch and a dropped callback track. Audio changes exactly one pitch: 136 bass q40; punctuation changes leave every audio event unchanged.

The 136 source ledger treats heavy single phrase strokes as typography. Existing single bars at q12/q24/q36 and all bar positions are explicitly retained. The 137 opening quarter pickup retains ABCJS's existing pickup velocity. Neither behavior is a new score correction.

The global legacy-selection regression checks all 75 loaded source identities and historical/modern selection behavior. Companion inventory separately probes current source guards and searches all production sources.

These checks cover source, prepared notation, jsdom React orchestration and actual sequence callback data. They do not certify native browser geometry, physical printing, acoustic listening or deployment. No settings, optimization, dependencies, budget, held mark/cue or other score changes are included.
