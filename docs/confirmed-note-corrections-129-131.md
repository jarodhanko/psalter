# Source-bound corrections for Psalter 129–131

## Accepted changes

- TRURO (129): stanza 3 `trum-pet's` becomes `trump-et's`; stanza 5 `prin-ces` becomes `princ-es`. Words, musical events and every audio property remain unchanged. The matching RFPA underlay establishes these divisions; the original 1912 prints these stanzas as prose and corroborates the words, not their syllable divisions.
- SILVER STREET (130): the four final notes at q48 become whole notes, ending at q52 rather than q50. Tenor q34–35 becomes F4–E4 rather than E4–D4; alto q47 becomes F4 rather than F-sharp4. Attack positions, all 123 attacks and all 16 slurs are preserved. The existing legacy print-selection hash is rebound to `655ab6bd6a08282046775c7ecf48e7f8582c377e9fecd147165d659d70bd49dd`, with previous `[]` and current `[1,2,3,4,5]` unchanged.
- OTTERBOURNE (131): bass q19/q20 become B-flat2 rather than C3; add the printed bass q18→19 slur and alto q27→28 slur. All durations, rests, words and other notes remain unchanged. Audio changes only those two pitches and the two existing-convention −0.001 whole-unit slur overlaps. There are 159 written events, including 12 silent events, and 147 attacks.

No legacy selection witness exists for 129 or 131; none is added. No new source-head, timed-layer, shared-rest, fermata, cue or generic presentation behavior is introduced.

## Printed evidence and disclosed revisions

The independent full ledgers come from RFPA PDF page 195 (129), 196 (130), and 197 (131), corroborated by original 1912 leaves 0116–0118. Original photographed music remains authoritative. All accepted corrections received an independent second pixel reading. The source-ledger and second-reading hashes accompany the test fixtures; sealed evidence and initial failures remain unchanged outside the application.

129's initial event and syllable ledger was frozen before source exposure and was not revised. Its explicit lyric-divider annotation was added afterward, checked against the unchanged syllables. 130's complete independent ledger also remains unchanged. 131 retains both its original frozen ledger and six disclosed post-exposure staff-reading corrections: three soprano pitches in bar 11 and three alto pitches in bars 7–8. Those revisions agree with existing canonical notes and are not additional application edits. The fixture is the audited revised ledger, not a claim of an unchanged pre-exposure oracle.

Expected music, marks and underlay come directly from those ledgers. Prior ABC provides exact patch scope and negative controls only. Tests separately revert both 129 splits, each of the seven 130 event corrections and each of 131's two pitches/two slurs. Changed keys/durations and a corrupted actual callback map must fail the printed oracle.

## Integration coverage and retained limitations

Real ABCJS parsing, actual ScoreRenderer screen and print calls, and real playback note maps/callbacks cover all parts, every engraved stanza/group size, learner accidentals, transpositions −2/0/+2, empty selection boundaries, music-only rendering, all 16 audio masks, and all saved stanza subsets. Explicit stale/altered/wrong source checks keep the existing 130 migration narrow. Audio comparisons inspect every pitch, start, end, duration, slur gap, meter velocity and mute state, together with immutable tracking snapshots.

131's alto and bass `x` quarter rests at q11/q23/q35 remain invisible carriers. Selected-part missing rest signs are an acknowledged presentation hold, not a corrected source defect. Tests preserve these exact rest kinds and their silence; no generic `x`→`z` replacement is made. The two held punctuation observations also remain: 129 stanza 2 q12 retains app `us,` where matching RFPA has `us`; 130 stanza 3 q8 retains app `King;` where print has `King,`. The tests label these explicit exceptions while checking all other exact punctuation. 131 retains RFPA `pow'r` where original 1912 has `power`.

This batch excludes 128 fermata presentation, 127 cue/head ownership and bass-only lyric transfer, 131 rest presentation, and unrelated punctuation, optimization, budget or gate changes. The earlier 91 hash companion is an independently validated predecessor; this patch does not duplicate it.

Synthetic SVG bounds allow actual React/ABCJS calls in JSDOM. They do not establish native-browser geometry, physical print, acoustic listening or deployment. The focused local checks and single integrated build are reported separately. The complete local verifier must pass for the exact final source before release.
