# Confirmed corrections: Psalters 148, 149, 153 and 154

This bounded correction preserves the previously qualified 141, 142 and 145
changes and the lazy timing implementation. Its source authority is the actual
RFPA and original 1912 printed pages; parser agreement alone is not source proof.
The independent initial readings, post-exposure revisions, source images and
full audit reports remain in the separate sealed validation evidence.

- **148, GIVE (RFPA 222–223; 1912 126–127):** retain all 123 notes, adding a
  music-bound display witness for upright shared cadences at q19 and q40. Each
  retained staff now displays its fermata when its upper source voice is hidden.
  Combine this with the independently corroborated stanza 3 `soul;` → `soul,`.
  The music-only display/audio bindings remain exact; the legacy stanza hash
  changes with punctuation. The two existing audio releases remain at q21/q42,
  adding one quarter each for 44 performed quarters.
- **149, ASCRIPTION (RFPA 224; 1912 127):** tenor G3 → F3 at q3, q4, q9, q14 and
  q15. Their durations remain quarter, half, quarter, quarter, quarter. No other
  event changes among the 113 printed attacks.
- **153, MASON'S CHANT (RFPA 229; 1912 130):** tenor q31 is A-flat3 quarter,
  removing the spurious G-flat3 eighth at q31.5. The separately down-beamed bass
  eighths remain unchanged. The corrected score has 120 attacks.
- **154, SELWYN (RFPA 230; 1912 130–131):** alto q3 F4 → E-flat4, soprano q26
  G4 → B-flat4, bass q42 B-flat2 → D-flat3, and SILWYN → SELWYN. Rebind the
  complete independent shared-quarter-rest witness and legacy stanza hash.
  All eight quarter-rest events at q23/q47 and all 24 slurs remain intact.

Only the seven affected legacy entries change across the combined 141–154
successor; every previous/current stanza array remains unchanged. No guard is
replaced by a canonical-source import. The 154 complete source witness and 148
independent music witness remain literal comparison authorities.

## Fixtures and regression scope

The new fixtures reconcile every one of 520 note/rest events, all 39 slurs and
all independently printed soprano underlay rows against the preserved source
ledgers. The regression suite checks complete raw notation, explicit accidental
scope, reduced part choices, grouping, learner marks, UI transpositions, actual
React screen/app-print orchestration, legacy selection restoration, actual
playback callbacks and exact before/after semantic deltas. Negative controls
restore old source errors, old identities and missing 148 display inheritance.
A separate independent token comparator verifies source pitches, durations,
accidentals, slurs and boundaries without ABCJS.

Specific typography qualifications stay explicit: 148 stanzas 7–8 are prose-only
in print, so their app syllabification is editorial; 149 RFPA `treach’rous` differs
from app syllable-divider spelling; 153 RFPA `ev’-er` differs from app/original
1912 `ever`; 154 original prose elisions and the existing `dwelling-place`
transcript reconstruction loss are unchanged. Tests permit only the named
engraved spelling/divider variants and still check the 148 comma exactly.

The initial ledgers were not all error-free. The preserved revisions for 149
and 154 and the older-scan head-fill qualification in 153 are material. They do
not change the independently corroborated target findings. No new interpretation
is made for 141 bass bar 8, 152's small cue, 143 integration, 46b, or other holds.

The local checks do not establish browser geometry, physical print output,
acoustic listening or phone/offline acceptance. The complete local verifier and manual release checks are still required for the exact final artifact.
