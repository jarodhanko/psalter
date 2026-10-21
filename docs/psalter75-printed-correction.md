# Psalter 75: printed tenor correction

WOOD's penultimate tenor half note at quarter onset42 is G3 (MIDI55). It was encoded as C4 (MIDI60). The canonical tenor segment changes from `| B, A, B,2 C2 | A,4` to `| B, A, B,2 G,2 | A,4`. It accompanies “the / cy / re- / re- / their / stant” across the six stanzas. This change preserves every other canonical byte, including all lyrics and bars.

The note is independently clear in two engravings and was confirmed by a second reader:

- [Matching Psalter PDF, page120](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf), heading “75 Invocation and Confident Petition”, WOOD. PDF SHA256: `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`.
- [Original1912 printing, page66 / IA leaf0072](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0072.jp2), SHA256: `a417d42be0c1ddf5b45f2b835b5ca2e8f966b8841c2f06e4cc6f797e0edd2483`.
- [Original stanza continuation, IA leaf0073](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0073.jp2), SHA256: `7254f7e009edbda23fb7509f80bf2e1e10eab911c991287c2b81bdfb3855864a`.

The fixture was derived from a104-event manual ledger entered from actual pixels before canonical ABC or parser inspection. It retains that independent printed reading, all six stanza onset maps and source hashes. It also retains the previous complete ABC as a negative control; expected printed notes are not derived from it.

## Explicit holds

The final bass staff at q44 contains full-size A3/F3/F2 whole-note heads in both printed witnesses. The current prepared score and audio contain A3/F3. The stemless chord does not establish whether F3 belongs to a tenor division or is an optional bass octave. No part ownership is assigned and no final pitch is changed here. The independent fixture records the lowest printed F2 under a provisional bass assignment. Tests explicitly preserve the current bass F3 as an unresolved hold; this exception is not a claim that the final sonority matches the print.

Both witnesses print the compound word mercy-seat. The canonical stanza2 lyric currently separates “cy” and “seat” with a space; the hyphen has a separate candidate. This pitch-only change preserves all lyric bytes and onsets. Heavy printed phrase bars at q12/24/36 and final-rule typography likewise remain qualified and unchanged.

## Verification

The focused regression exercises all15 nonempty part selections, six stanzas and stanza groups, learner accidentals and0/±2 transposition against the independent fixture. The actual playback entrypoint, ABCJS note map and final callback verify every pitch, onset, duration, zero articulation gap, end time, default velocity, selected-part muting and tracking schedule. Comparison to the previous source permits only the tenor's five-semitone change.

Actual React/ABCJS screen and print preparation, current ABC export, music-only output and rendered-head tracking are exercised, including negative guards for stale pitch/duration and missing rendered heads. A retained negative-control run restores only the original source and demonstrates failing pitch, audio and renderer checks. Focused tests and TypeScript checks are required for the patch; the full release gates remain the integrator's responsibility.

These tests use synthetic jsdom bounds. They do not certify native-browser geometry, physical printing, acoustic listening or publication. No whole-score clean certification is claimed while the final sonority remains unresolved.
