# Psalters 155–160: independently checked corrections

This batch extends the sealed 141–154 score correction tree without changing the
viewer, build policy, hymns, settings, or held readings. The working photographed
edition controls the score; original 1912 photographs independently corroborate
the selected edits.

| Setting | Source pages | Correction |
| --- | --- | --- |
| 155, CHURCH TRIUMPHANT | RFPA PDF p. 231; 1912 p. 131, leaf 0137 | Alto at quarter offset 8 is D4 quarter, replacing the D4/E-flat4 eighth pair. |
| 156b, SWANWICK | RFPA PDF p. 233; 1912 p. 133, leaf 0139 | Restore the comma after stanza 1 “wickedness”. The first tune remains unchanged. |
| 159, MERIBAH | RFPA PDF p. 238; 1912 p. 135, leaf 0141 | Restore twenty whole-note phrase cadences, five per voice, at corrected quarter offsets 8, 20, 32, 44 and 56. Restore the period after stanza 2 “flee”. |
| 160, HAVEN | RFPA PDF p. 239; 1912 p. 136 | No source edit. Independent rereview withdrew a mistaken pickup-bar proposal: the opening stroke is a note stem; the first barline is at q4. |

The three existing legacy stanza-selection witnesses are rebound to the exact
corrected source bytes. Their previous/current stanza arrays remain unchanged.
The other 72 source witnesses remain exact. Generated modules and their manifest
must be regenerated together; individual proposal manifests are not reusable
across the combined correction set.

The committed source fixtures contain all 480 independently transcribed written
events, 31 slurs, the printed boundaries, and four soprano lyric rows per corrected setting.
Each fixture records the source-ledger SHA-256; the correction evidence fixture
also records previous/corrected ABC hashes and the exact permitted source delta.
Private page photographs, original audit ledgers and complete revision histories
are retained outside the distributable repository.

## Qualifications that remain open

- Psalter 155 has a pre-existing lower-part display problem in A, T, AT, B, AB,
  TB and ATB. Printed quarters at q14 and/or q30 are displayed as tied eighths
  and lyric syllables are displaced by half a quarter. Those literal failures
  remain held. The q8 source correction does not authorize an underlay repair.
  Sounding-attack conservation is checked separately and is not treated as
  approval of the engraving or words.
- Psalter 158's separate lower-part underlay issue remains outside this batch.
- Psalter 159 retains documented edition differences in “trou-ble”/“troub-le”,
  “tower”/“tow’r” and “sheltering”/“shel-t’ring”. The test permits only the
  specifically recorded syllable-boundary variant and apostrophe typography;
  the corrected period remains literal. The audit's source-ledger revision
  history remains preserved.
- Psalter 160's proposed q2 boundary and derived pickup accents were withdrawn
  after independent pixel rereview. The upright is a shared note stem, not a
  barline. Its original source and exact legacy digest remain unchanged; a
  narrow regression preserves the first full bar ending at q4. The rejected
  proposal, wrong ledger, passing semantic tests and explicit withdrawal remain
  separately preserved. Other documented edition and text variants remain open.
- All inherited holds and qualifications for 141–154 remain in force.

The three corrected-setting regressions check literal notes, rhythm, accidentals, bars, slurs,
ties and soprano words; every selected part set; stanza groups and learner
accidentals; all sixteen audio masks over all 23 UI transpositions; immutable
tracking; generated loading; stale source-selection hashes; exact before/after
musical differences; and representative real React screen/print paths. It also
asserts the known 155 literal failure instead of changing the printed oracle.
jsdom checks do not certify native geometry, physical printing, acoustic playback,
or device offline behavior. Local verification does not imply publication.
