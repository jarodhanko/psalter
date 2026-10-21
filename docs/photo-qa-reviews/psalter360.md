# Psalter 360 — JUDE photo QA — PASS

## Recheck — 2026-09-27

Source: owner photo local source evidence (not distributed) (photo 302, printed page 308), cross-checked against the clean same-edition scan `_360.webp`. The printed engraving, not the handwritten annotations, governs this transcription. No. 361 below it is a separate song.

The earlier ABC combined separately barred phrases and added unsupported tied ending bars. A fresh derivation restored two systems of six bars each and removed that ending. The earlier reviewer incorrectly claimed three flats; the complete 2026-09-30 review below overturns that claim. Each system has 15 soprano attacks (30 total), and each of the five printed stanzas has exactly 15 syllables per system. The current source includes five `w:` rows on each system, one syllable per attack, while retaining the complete `W:` transcripts.

`tools/inspect-underlay.mjs psalter360` confirms the attachments, and `tools/validate-abc.mjs` reports no ABCJS warnings. A separate printed-score reviewer found no further definite pitch or rhythm defect, but did not certify every SATB event; this is not yet a full photo-QA pass.

## Bounded follow-up — 2026-09-28

The first printed staff's six bar groups were checked for **rhythm and barline placement** against the owner photo. In all four voices the current ABC groups total 4, 12, 8, 4, 12, and 8 eighth-note units, and their boundaries and note values match the engraving. The printed 3/2 signature therefore does not imply that every engraved group contains 12 units; do not automatically "repair" the shorter groups. This is a rhythm-only result, not a pitch certification. A separate second-staff read did not reliably verify printed accidentals, durations, or barlines and was not counted. The five `w:` rows per staff attach to all 15 soprano attacks; a desktop screenshot of the current viewer showed both rows of music and the five stanza lines. Full printed SATB pitch/accidental review and responsive/mobile render review remain open. No source ABC was changed.

## Complete printed review — 2026-09-30

The owner's photo and clean high-resolution `psalterwithrespo00unit_0318.jp2` show exactly **two flats, B-flat and E-flat**, in both clefs. `K:Eb` was corrected to `K:Bb`, restoring the printed A-natural pitches. Handwritten labels were excluded as authority. The final primary and independent review compared every pitch, octave, duration, barline, and explicit accidental in all four canonical voices with the twelve printed bar groups. No further discrepancy was found. Lower bass bar 10 is A3 twice (`A,2 A,2`); bar 11 is G3, G3, F3, F3 (`G,4 G,4 F,2 F,2`). Provisional comparison ledgers with conflicting pitch/octave labels were not accepted as certification.

All five stanza texts and their thirty soprano lyric slots match the printed rows. `tools/inspect-underlay.mjs psalter360` confirms five lyric slots at every soprano attack. The desktop render in local source evidence (not distributed) displays the corrected two-flat signature, five aligned stanza rows, and responsive reflow into three systems without omitted text or collisions. No fixed photographed line breaks were introduced.

Status: **PASS** for the printed notes, lyrics, and inspected desktop render. Physical-device audio, mobile, and print release gates remain separate. The canonical ABC validation passes with zero warnings across 474 arrangements; the production PWA build and offline build validation pass. No new unit tests were added.

Firebase production Hosting was updated. The served `psalter360-BxykdlZY.js` returned HTTP 200 and matched local SHA-256 `b9855dc893ee30dc76c64bc4e4862587ccc8ca45be923aab818c8d64467b7dac`.
