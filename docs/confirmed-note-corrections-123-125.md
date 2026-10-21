# Source-bound corrections for Psalter 123–125

## Corrected material

- MAGNUS (123): the final tied continuation at printed cell 22, q47, is a plain quarter in all four parts. The preceding q45.5 dotted quarter is retained, and the earlier chorus “trust;” dotted-quarter pair at q33.5/q35 remains unchanged. The written total changes from 48.5 to 48 quarters. Exact canonical ending tokens are T1 `E3-E2`, T2 `B,3-B,2`, B1 `G,3-G,2`, and B2 `E,3-E,2`. The existing reviewed-underlay full-source witness is rebound and the existing structural audio guard changes duration 12.125 to 12 whole units; mark identities, 278 written events, 268 attacks, four tracks, and two releases remain unchanged.
- MORNINGTON (124): remove only the stanza 4 engraved comma after “forth” at q8. All 112 written events remain unchanged.
- GERAR (125): remove only the stanza 1 “world” and stanza 5 “King” commas at q27. The printed leader dots are not commas. The other three stanza commas at this onset remain. All 146 written events remain unchanged.

The 1912 photographed sources are the final source authority. Matching RFPA music appears on PDF 183–184 (123), 185–186 (124), and 187–188 (125); original 1912 leaves 0111, 0112, 0113 provide independent corroboration. Original 123/124 are one semitone above the matching RFPA settings. The existing keys remain. The original and revised 123 ledgers are separately identified: ten Alto pitch labels and staff mark participation were corrected during the source audit; the final-duration finding was already in its frozen independent first reading. No claim is made that its revised ledger predates source exposure.

## Identity companions

A fresh review of production domain/viewer/data/songbook/tool sources and direct probes of source-bound helper families found these active companions:

- 123: exact full-source reviewed underlay, structural shared-fermata audio. No legacy print-selection witness exists; none is added.
- 124: structural shared-fermata audio, and an existing legacy print-selection hash. Only that hash is rebound. Previous `[6,7,8,9]` and current `[1,2,3,4,5,6,7,8,9]` membership remain unchanged.
- 125: existing legacy print-selection hash. Only that hash is rebound. Previous `[6,7]` and current `[1,2,3,4,5,6,7]` membership remain unchanged.

The 124 hash companion was omitted from the original sealed correction narrative. A separate validation addendum records the discovery without rewriting that report or its checksums. Broad musical-guard probes alone do not establish migration coverage.

Exact source identity is retained, including full-byte reviewed-underlay matching and SHA-256 selection witnesses. Tests reject stale/altered source, a wrong song identity, individually reverted edits, changed durations, missing/altered fermata marks, and a corrupted real audio callback map. Saved explicit selections and all legacy stanza subsets retain their existing behavior.

## Independent expectations and application coverage

Three full printed event/underlay fixtures are converted directly from the sealed manual ledgers, with fixture and source-ledger SHA-256 identities. They cover 536 written events and every printed engraved stanza syllable. The evidence fixture contains prior ABC only for exact edit scope and negative controls, never as the pitch/rhythm/underlay oracle. Original prose expectations cover all 3/9/7 stanzas and 123's shared chorus.

Regression checks use real ABCJS and actual ScoreRenderer screen/print calls. They cover every nonempty SATB selection, grouping, learner accidentals, transpositions −2/0/+2, empty-part boundaries, music-only afterParsing, exact transferred punctuation, real playback sequencing/note maps/callbacks, all 16 audio masks, and frozen tracking. Existing phrasing, bars, timing, lyric slots and audio dynamics are retained. Source 123's two shared audio extensions still total 1.125 whole units, giving 13.125 whole units after the ending correction. These are musical units, not seconds.

## Bounded holds and limitations

This patch adds no 123/124 shared-fermata display witness, Alto accents, source-small heads, timing optimization, general presentation changes, or budget/gate changes. The existing 123 S-only playback accent behavior remains held. Selected lower-part missing shared-fermata signs and Alto-only missing shared treble accents remain disclosed presentation issues.

Retained edition distinctions include 123 RFPA “for ev-er” versus canonical/original “forever”; 124 original “Kings'” versus RFPA/app “King's”; and 125 RFPA/app “ev'ry” versus original “every.” No unrelated text normalization is applied.

JSDOM SVG and real renderer/callback tests establish source/glyph behavior with synthetic measurements. They do not certify native-browser geometry, physical print, acoustic listening, or deployment. The complete local verifier remains required before release. Local verification results are recorded separately; a focused pass is not a full-suite claim.
