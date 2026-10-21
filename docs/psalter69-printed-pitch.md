# BELIEF printed soprano correction

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](release-checklist.md) for release preparation.


The soprano half note on "ways" in the last phrase of Psalter 69 was G4. Both independent print engravings place its head on the middle treble line, B, flattened by the F-major key signature. The correction changes that one event to B-flat4. In canonical ABC the final phrase changes from `A2 G2 G4 (E2 G2)` to `A2 G2 B4 (E2 G2)`; rhythm, lyric placement, slurs, other pitches and every other voice stay the same.

The event starts at quarter offset 40, overall printed bar segment 11 (second-system segment 5), after the opening half-note pickup. The five engraved stanzas sing "ways", "ways", "works", "in", and "bribes" at this onset.

Sources:

- RFPA engraving, [The Psalter PDF](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf), PDF page 111, BELIEF, Psalm 26. PDF SHA256: `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`.
- Distinct original 1912 engraving, [Internet Archive leaf 0068](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0068.jp2), printed page 62. Both pixels and the one-flat key signature were independently reviewed.

The manual ledger in `src/data/fixtures/psalter69-printed-ledger.json` was entered from these pixels before opening canonical note text or parser events. Two first-pass bass B2 labels at offsets 38 and 39 were corrected to B-flat2 after rereading the unchanged printed key signature; those were transcription-ledger omissions, not app errors. Quarter heads with low-resolution white holes in RFPA were corroborated using the original 1912 image.

The fixture covers 116 primary-voice events: 32 soprano and 28 each alto, tenor and bass, all 48 quarters long. Four soprano slurs, three explicit accidental signs, all temporal bar boundaries, and native syllable onsets of the five engraved stanzas are recorded independently. Stanzas 6 and 7 are prose in both sources; their exact sung underlay is not prescribed by these prints.

## Remaining source limitation

Both prints also have a full-size F3 whole-note head in the final bass-staff chord F2/F3/A3 at offset 44. Current canonical and prepared display/audio omit this middle head; no active source supplement supplies it. The stemless three-head chord does not uniquely establish whether F3 belongs to tenor or bass. This pitch correction deliberately leaves that separate issue unresolved. The tests validate the mapped primary voices, not full approval of the final printed chord or an ownership assignment.

## Verification

`src/data/psalter69PrintedCorrection.test.tsx` checks the independent primary-voice ledger through actual part-selection, stanza grouping, learner-accidental and transposition helpers; exercises the actual audio preparation and sequence callback; and checks React/ABCJS screen, print, music-only and current-ABC export preparation. The q40 half head and B-flat pitch are tested directly. The audio checks include exact onsets, durations, pitches, muting, 3/2 accent rules, initial pickup, slur gaps and frozen tracking capture.

The React tests use synthetic jsdom bounds and do not certify browser geometry, live deployment or acoustic listening. The held F3 source ambiguity must remain visible until independently resolved.
