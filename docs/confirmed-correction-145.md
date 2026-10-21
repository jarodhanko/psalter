# Confirmed Psalter 145 bass corrections

Two independently corroborated bass pitches in LUTON are corrected:

- q12, “Thy-”: G3 becomes E-flat3. Both RFPA page 219 and the original 1912 page 124 place the head in the E3 space.
- q43, “-ful”: B-flat2 becomes B-flat3. Both prints show a single hollow B-flat3 head above the A3 line with opposing tenor and bass stems.

Only the canonical No.145 module and its existing legacy-selection SHA-256 companion change. The previous/current stanza arrays remain unchanged. No grace handling, source ownership, rhythm, lyric or presentation logic changes.

The independent fixture contains 141 metrical notes (37 soprano, 36 alto, 34 tenor, 34 bass), two slashed grace notes, 13 slurs, one explicit natural and all six stanza grids. It is reconstructed from the source ledger and reconciled against the sealed audit. A separate lexical reader checks every note, grace head/slash, accidental, slur and barline without ABCJS. The baseline fails exactly the two corrected pitches; the candidate matches completely.

The initial pre-exposure ledger misread the soprano “why” head as G4. Both editions and the independent reviewer established A-flat4, which is already correct in the score and remains unchanged. The initial ledger, comparison and revision history are retained. This reader correction must not be turned into a score change.

The soprano G4 and alto E-flat4 small heads share a crossed eighth flag. Both editions support slashed grace ornamentation. The source does not establish optional singing or exact realization time, and the RFPA lower slur start is less clear than the original print. Tests preserve the existing two owners and printed marks. They separately characterize ABCJS's performance policy: each grace borrows half its following quarter, delays that principal note accordingly and adds no duration. The resulting 143 audio attacks retain four tracks and mute each spanless grace with its own soprano/alto owner. This is an engine behavior assertion, not a performance prescription inferred from the source.

The regression suite checks the complete source, literal and prepared underlay, actual React screen/app-print paths, all nonempty part subsets, stanza groups, all64 explicit verse selections, all23 UI playback transpositions, real callbacks and immutable tracking. It includes reversed-bass, incorrect soprano G4, missing/changed/unslashed grace, dropped-track and pitch/rhythm negative controls. The precise audio difference remains only MIDI55→51 atq12 and MIDI46→58 atq43, both in bass; timings, volume and every other note remain unchanged.

The consolidated candidate preserves all prior141–142 fixes and their independent review. Held141 bass8,143 cue/ownership and43/46b matters remain unchanged. Local preparation checks do not establish native browser geometry, physical printing or audible listening. Final qualification and release status belong to the consolidated validation report.
