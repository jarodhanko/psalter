# Psalter 359 printed score and lyric review — PASS

Reviewed 2026-09-30 against owner's printed p. 307, local source evidence (not distributed), with the clean same-edition `_359.webp` and high-resolution IA `psalterwithrespo00unit_0317.jp2` for unobscured noteheads. Handwritten labels were excluded as authority. No. 359 is complete on this page.

The score was rederived across all 16 printed measures and four voices. The former ABC had the wrong key, a spurious pickup, displaced attacks/barlines, missing rests, and wrong pitches in every part. The corrected source uses G major, 3/4, no pickup, and four quarter-note rests at the half-note cadences. Each voice has six eighth-note units in every measure. Printed alto C-sharps in measures 5 and 7 and F-natural in measure 13 are retained.

Independent Luna voice drafts were reconciled by the primary reviewer and a Sol printed-score review. Incorrect draft readings were rejected using the five staff lines: soprano measure 6 ends on F-sharp4; alto measure 16 ends on B3; tenor measure 8 ends on F-sharp3; bass measures 5 and 7 use A2. The final independent review checked the canonical ABC against print for every SATB pitch, octave, accidental, duration, and barline and found no remaining discrepancy.

The twelve restarting lyric fragments were replaced with four complete note-attached verse rows. All 38 soprano noteheads carry the appropriate lyric slots; six held syllables extend over notehead indices 5, 14, 17, 24, 33, and 36. Verse 3 now reads the printed “very truth,” replacing “verity.” All four full-text transcripts also match print.

Desktop rendering was inspected in local source evidence (not distributed): the score reflows into three systems, all four stanza rows remain aligned, and there is no visible omitted text or collision. No fixed photographed line breaks were added. This PASS covers printed notes, lyrics, and this desktop render; physical-device audio/mobile and print release gates remain separate.

Verification: `node tools/verify.mjs` passed using the bundled supported Node runtime: 474 arrangements, zero ABCJS warnings, 148 existing tests, TypeScript, production PWA build, and offline asset/build validation. No new unit tests were added.

Firebase production Hosting was updated. The served `psalter359-DDL2ELWf.js` returned HTTP 200 and matched the local build SHA-256 `6c87747b439addacb03c5e4c22a5ad885ff2499aef4657bf97e1baa6679f6617`.
