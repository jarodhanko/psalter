# Psalter 120 chorus audio diagnosis — 2026-09-28

The owner photo local source evidence (not distributed) contains the complete AMARA setting and chorus. The four score voices and their tied notes parse without warnings. This check does not certify every printed note.

The source's quoted `"Chorus"` was an ABC chord symbol rather than a text label. ABCJS consequently generated a fifth note-bearing MIDI track alongside the four printed parts; its C-major chord at the chorus onset is not in the engraving. The label is now `"^Chorus"`, the ABC 2.1 above-staff text-annotation form. An in-memory MIDI comparison showed six total tracks before and five after (tempo plus four voices); the printed label remains visible as “Chorus.” This resolves a reproducible source of extra synthesized notes. Audible confirmation on the affected device remains open.
