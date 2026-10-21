# Psalter 334 photo review — lyric correction, underlay open

## Printed-score correction — 2026-09-27

The partial underlay notes below describe the former, incorrectly transposed ABC and are superseded. The owner photo and same-edition clean engraving have one flat (`K:F`), not four (`K:Ab`). All SATB voices were rederived in F major, retaining the printed accidentals and slurs. Four stanza rows now attach to both eight-bar ABC systems; their melisma continuations follow the printed soprano slurs rather than being placed after phrase-final words. The tune REPENTANCE and composer Theodore E. Perkins are separate metadata fields. ABCJS parses without warnings, with 18 lyric-covered soprano attacks in each source system. Exhaustive pixel-level independent inner-voice certification remains open.

- Ground truth: annotated photo local source evidence (not distributed), printed page 287.
- The photographed stanza 2 reads “Accept my sacrifice of praise,” so the erroneous `W:` line “Accept Thy sacred testimonies” was corrected. The other `W:` text and all SATB notes were preserved.
- Exact `w:` underlay remains open. `tools/inspect-underlay.mjs psalter334` reports 18 soprano events in each of its two ABC systems, not 16. A trial of four 16-syllable rows attached to the second system with two missing final slots, and the photograph does not establish every extension/skip. That trial was removed; no guessed underlay remains.
- Status: PARTIAL. The wording correction is photo-grounded, but full lyric and musical QA are not approved.
