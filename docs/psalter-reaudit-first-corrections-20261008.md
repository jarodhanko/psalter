# Independent printed Psalter recheck: first correction batch

This is the newly requested note-by-note recheck, after the hymn pass, rather than a rerun of the earlier source-content audit. Complete manual per-event ledgers and original-pixel evidence are retained in the user's audit evidence archives. Parser output was used only to compare against the independent printed reading. Two readers verified each correction below.

Source lineage: The Psalter PDF at https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf, SHA-256 `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`; matching page images from `jrvermeer/Psalter2025` the historical reviewed source, under `Psalter2025/public/1912/Score/`. These matching representations are one lineage, not independent editions. LAUDS underlay additionally corroborated by distinct original 1912 printing, printed page25.

## Changes

- #4 UXBRIDGE: four ordinary bars at printed segment10/end system2, previously doubled. All130 notes and160 lyric slots unchanged.
- #12 ZENO: alto measure7 explicit courtesy D-flat added. The key already made this note D-flat; audio unchanged.
- #21 BREMEN: alto ordinary bar before tied final cadence, matching the print and other voices. Audio unchanged.
- #23b LAUDS: source-qualified native Alto/Bass quarter-note lyric carriers at q14. Generic lyric copying had inserted tied eighths and delayed “de-”. Five affected reduced selections corrected; other ten unchanged. All native notes and MIDI preserved, complete canonical identity guarded. Existing written-projection and rendered-head tracking checks remain in force; other timing-carrier families retain their prior eligibility.
- #29 LEOMINSTER: Bass q55 “love/rest/flow” G2→B2 (MIDI43→47). Tenor phrase bar q56 now matches other parts. Existing exact timing witness updated with exactly these canonical changes, preserving solo-tenor quarter and “in-/my/of” at q50. A stale witness would cause an unintended tied-eighth split and word delay; regression tests prevent it.
- #30 MARY: Bass score q18 after fermata, “Do/Is/And”, B-flat2→B-natural2 (MIDI46→47). Effective playback q19 includes the existing shared hold. All other times, pitches, muting and final bass octave remain unchanged.

The final rules in #29/#30 look like two heavy strokes in the available print. A prior reader described them as thin–thick, but independent integrator review does not establish that distinction. Terminal-bar normalization is withheld rather than treating an uncertain typography convention as a definite defect.

## Tests and limits

Source regression tests exercise all15 part selections and 0/±2 transpositions for both pitch corrections through actual audio preparation, ABCJS note-map creation and final sequence callback. Only the identified bass pitch changes. #29 source binding and native lyric position are pinned. LAUDS tests cover complete-source rejection, every selection, MIDI, learner spelling, written tracking, and unchanged legacy carrier outputs; the old #29 algorithm digest normalizes only the separately reviewed pitch/bar delta, with corrected behavior tested separately.

This document does not itself certify native rendering, print dialog, audible listening, or release publication. Those require the final candidate's release evidence. Existing early-number reduced-part subdivisions (#3/#8/#17b) are separately under repair and are not silently considered clean.
