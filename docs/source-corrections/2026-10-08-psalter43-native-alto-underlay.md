# WARD: native Alto underlay in Psalter 43

The original 1912 print, printed page 42 (Internet Archive item
`psalterwithrespo00unit`, leaf 0048), shows a dotted-half F4 at quarter-note time
q56 followed by E-flat4 at q59. There is no Alto notehead or tie at q58. The
matching later RFPA print, PDF page 79, agrees. Original-print final-phrase pixels
were inspected directly during this repair. Canonical notes and all six stanza
texts already match the sources and remain unchanged.

Source corroboration:
- [Original 1912 Psalter](https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0048.jp2)
- [Pinned matching later score](https://github.com/jrvermeer/Psalter2025/blob/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score/_43.webp)

## Interpretation and bounded correction

This is a shared-line/native-attack interpretation, not a separately engraved
Alto lyric row. Alto has 33 native heads and one printed slur continuation at
q27, giving exactly 32 sung syllable slots per stanza. The original source
engraves stanza 1 and gives stanzas 2–6 in prose; the later matching print
engraves all six rows. Lower-part placement remains an interpretation of those
shared rows and the native rhythm.

Generic lyric transfer previously subdivided the q56 dotted half into `F2-F`,
moving the penultimate syllable to its artificial q58 continuation. The exact
source timing witness now moves the complete, validated shared stanza rows onto
the native Alto grid before generic transfer. Only A, AT, AB and ATB selections
change. Selections with Soprano, and those containing only Tenor and/or Bass,
retain their previous output. The helper changes lyric rows only; no music
token, canonical source or playback constructor changes.

The final-phrase slots are q47, q48, q50, q52, q55, q56, q59 and q60. The q59
syllables are respectively “on's”, “de-”, “thy”, “swer”, “Most” and “we”. The
music-only renderer also preserves the dotted half and q59 quarter, because
native preparation occurs before its existing post-parse lyric removal.

Qualification uses the complete frozen ABC string with LF/CRLF normalization,
then rechecks the prepared music frame and complete ordered selected stanza
vector. Wrong IDs, changed music, key, roles, grouping, words, missing rows,
duplicates, reordered stanzas, wrong ownership and invalid selections reject
the policy. No generic transfer behavior changes.

## Tracking and verification

Psalter 43 joins the narrow native-carrier tracking eligibility list. The
existing written-event projection and actual rendered-head ownership checks
remain authoritative. Ordinary Alto rendered heads bind successfully; synthetic
head loss and q58 subdivisions fail. Learner courtesy accidentals still trigger
the existing written-identity veto. This change does not relax that guard.

The independent print-ledger fixture records all 135 musical events and native
shared-row interpretations for all parts. Focused tests cover all 15 part
selections, all six complete rows, all 63 nonempty stanza subsets in affected
selections, grouped/selected verses, learner spelling, ±2 transposition, raw MIDI
identity, and actual canonical audio preparation/callback muting. Real
React/ABCJS tests inspect prepared screen, selected/grouped print, exported ABC,
post-parse music-only omission and rendered-head ownership.

The DOM tests use jsdom with synthetic bounds. Its native print-dimension gate
is preserved and reports unavailable dimensions; this is not native-browser
geometry or print-readiness approval. Aggregate release gates, native desktop
and phone inspection, acoustic listening and deployment verification are outside
this isolated preparation and remain release responsibilities.
