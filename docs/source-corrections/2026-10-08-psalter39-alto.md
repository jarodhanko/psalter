# Psalter 39 OLENA final alto phrase

The adopted printed source (The Psalter PDF page 72, system 2) and a distinct original 1912 engraving (Internet Archive psalterwithrespo00unit, printed page 39, leaf 0045) both show, after pickup G4: G4 G4 D4 D4 C-sharp4 C-natural4, then B3 dotted-half tied to B3 half. Two readers independently checked actual pixels. The canonical extra G4 displaced four pitch slots and used a C-natural4 to B3 slur at the close. Correct only this alto phrase. Other voice bytes and lyric rows are unchanged.

Correct tail: `|| G | G G D D ^C =C | B,3-B,2 ||`.

The apparently open tenor heads in the adopted scan are filled quarters in original 1912, so retain their existing rhythm. No source-specific guard or supplement is active for 39. Original1912 prints only verse 1 below the music; later text underlay is editorial, although the adopted later printing engraves all four stanzas.

Regression tests use actual playback preparation, ABCJS note-map conversion and sequence callback for all 15 selections at 0/±2 transposition. Other voices and the alto prefix retain all sounding fields; the corrected tail has expected MIDI pitches 62,62,61,60,59 at q39–43, with final B3 sustained through q48 and one fewer attack. Raw character offsets legitimately move with the changed notation, so they are excluded from sounding-event equality. Native rendering and final publication are qualified separately by the exact release evidence.
