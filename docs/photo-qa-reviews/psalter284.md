# Psalter 284 lyric placement review

- Authority: printed page 246, local source evidence (not distributed), cross-checked against the clean `_284.webp` engraving. Handwritten pitch annotations are not authority.
- PILGRIMS has five printed verse rows and a separately labeled chorus. All five verses are attached to the soprano events in music systems 1–3, and the chorus has its own underlay on system 4. `tools/inspect-underlay.mjs psalter284` confirms 16/16/10/21 lyric-bearing soprano events; the chorus has one slurred-note extender at `serv- _ ants`.
- Printed system 2, bar 2 has stemless whole notes, not two half notes. Corrected soprano `F4`, alto `D4`, and tenor `B,4`; bass `B,,4` was already correct. This also removes the spurious second note on “Name”/“love”/“pear”/“pole.”
- The complete `W:` transcript is retained. This review verifies the lyric-slot mapping and specific whole-note correction; it does not claim an exhaustive fresh audit of every SATB pitch.
