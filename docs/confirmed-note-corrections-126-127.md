# Source-bound corrections for Psalter 126–127

## Corrected material

MATERNA (126) restores the printed initial pickup and 24 bar cells, changes only tenor q20 from B3 to A3, separates “ever present,” syllabifies “weap-ons,” and restores six punctuation marks. The 239 written events retain every onset and duration, all nine slurs and eight explicit accidentals. Each voice remains 64 quarters long. The printed bars change ABCJS meter accents: four initial velocities change 105→85 and 96 internal velocities exchange 95/105. Playback timing, ends and slur overlap are unchanged.

WALTHAM (127) changes only stanza 1 q16 “And” to “And,”. All 128 primary printed events and the existing supplementary F3 remain unchanged. Its existing legacy print-selection witness is rebound to the corrected ABC SHA-256, preserving previous `[7,8]` and current `[1,2,3,4,5,6,7,8]` membership. No selection witness exists for 126; none is added.

The complete 126 TypeScript proposal has SHA-256 `44c66782139fb1db1049a86620e1346c62c93066e1f9670b7269fc2a4fbd9782`; its ABC literal has SHA-256 `c69f04c155605e2c5d50fd2fb7bbdd295e7f3ec9c13ab8fcf2754c084170916c`. The corrected 127 ABC literal has SHA-256 `94fba93a24e191bf7fe1ca27fb63858797c4030afd1d1cf73912c3f0bfe6a284`. File and ABC hashes are different identities.

## Independent evidence and identity coverage

The 1912 printed sources remain authoritative. Matching RFPA music is on PDF pages 189–190 (126) and 191–192 (127); original 1912 leaves 0114 and 0115 corroborate every accepted change. The fixtures are direct copies of the sealed, independently read pixel-ledger conversions, with byte identities and printed prose in the evidence fixture. No expected pitch, rhythm or lyric is derived from the corrected ABC. Prior ABC supplies exact edit scope and negative controls only.

126's complete independent manual ledger was frozen before canonical exposure and remains unchanged. 127's initial ledger is also retained unchanged; its corrected ledger includes disclosed post-exposure re-readings of bass quarter rhythms at q1/q2/q5/q6 and tenor C4 at q26. Those re-readings confirm the existing canonical primary music and do not authorize additional changes. The initial and final manual-ledger hashes are both recorded. No claim is made that 127's revised ledger predates canonical exposure.

## Verification coverage and holds

Focused tests use real ABCJS, real `prepareAudioPlayback` note maps and callbacks, and actual React ScoreRenderer screen and print calls. They inspect complete note/mark/bar structure and exact syllables/punctuation through all 15 nonempty part selections, every engraved stanza/group size, learner accidentals, and transpositions −2/0/+2. All 16 audio masks check pitches, metric velocities, starts, ends, gaps, muting and frozen tracking snapshots. Every saved stanza subset, stale/wrong source hashes and wrong identities is checked. Negative controls revert each accepted edit, change pitch/key/duration and corrupt an actual callback map.

127's small bass F3 currently remains an extra full-size tenor chord head, sounding whenever tenor is selected. The test names and explicit preservation expectation distinguish that existing behavior from the printed primary-note oracle. Source-small-head ownership and playback convention remain held; canonical `[F,A,]` is not removed. Bass-only display still splits the printed B-flat2 quarters at q2/q6 into tied eighths, placing transferred words at q2.5/q6.5. This display/underlay convention remains held, while canonical and audible bass quarter durations stay correct. No new cue/head/rest/fermata presentation or general timing behavior is introduced.

No 128 fermatas, optimization, budget/gate or other score changes are included. 127 retains the existing RFPA “Tho'” spelling where original 1912 has “Though.”