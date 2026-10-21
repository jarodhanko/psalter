# Psalter 362 photo review — PASS

- Authority and boundary: local source evidence (not distributed), printed page 309, no. 362, “Redemption and Forgiveness,” Psalm 130, 10s and 4s, tune SANDON, Charles H. Purday. The photo shows all three grand-staff systems, three numbered stanza underlays, and the terminal double bar. Photo 302/page 308 contains nos. 360–361; photo 304/page 310 starts no. 363. The page shows no selected-stanza footer or copyright notice. Printed page number is recorded in `N:`.
- The three stanzas and their cross-system continuation phrases were independently checked against the photo; no lyric correction was required. Existing SATB music fields were preserved.
- Structural ABCJS `parseOnly` check: one tune, no parser warnings, and 48 soprano note events across the parsed music lines. Each stanza attaches 48/48 lyric entries (144 total, zero unassigned note events). The source lyric rows divide at the same phrase/system boundaries visible in the photo. Counts confirm assignment, not note-by-note pitch/rhythm accuracy or final rendered underlay.
- Overall status is PARTIAL: lyrics and visible metadata are photo-checked, but no full SATB event audit or fresh render approval is claimed.

## Voice ledger progress — 2026-09-30

Independent soprano and alto readings checked all 48 attacks in each voice, including scientific pitch/octave, duration, and the printed one-sharp G-major key. Both ledgers agree with canonical T1/T2; no local accidentals or uncertain events were reported. These are bounded two-voice checks pending full lower-voice and final reviewer/render approval; overall status remains PARTIAL.

The independent lower-voice ledger also matches canonical B1/B2. The primary review checked the complete clean score against all four source streams, including tenor bar 15's D4 (the ledger's D3 label was an octave typo; the printed ledger-line head and uppercase source `D2` agree on D4). The three stanza underlays match print at all 48 soprano attacks. A fresh desktop render is in local source evidence (not distributed); “Thou shouldst” is closely spaced in its third system and needs a spacing review before final rendering approval. Overall status remains PARTIAL.

The primary review added three complete numbered `W:` transcripts directly from the clean printed scan. These join each stanza's two source underlay rows into its complete text for the lyrics panel and search, without changing any notes or syllable-to-note assignments. The underlay worksheet still assigns all 48 attacks per stanza. Rendering approval remains open.

The live current-source browser review measured the first-stanza “Thou”/“shouldst” SVG text spans after responsive layout settled. Their bounding boxes have only about 1.1 CSS pixels of separation at desktop width 1280 and simulated phone width 390. They do not geometrically overlap, but look like a joined word in the full-page desktop capture. Raising the general wrap minimum spacing from 1.5 to 2 and the earlier minimum-event padding trial did not meaningfully improve this gap; both experiments were removed. Keep PARTIAL pending readable word separation; do not change printed notes, lyric text, or impose source line breaks to conceal the issue.

## Responsive spacing correction — 2026-09-30

A fresh current-source review on port 4175 with ABCJS `minPadding: 6` now separates “Thou” and “shouldst” by 9.21 CSS pixels at viewport width 1280 and 27.30 pixels at width 390. Both complete score captures show readable words, all three stanza underlays, and responsive reflow (six desktop systems, sixteen phone systems). This changes engraving spacing only, not pitches, rhythm, or lyric assignments, and applies consistently to screen, grouped, and print engraving. The earlier padding experiment may have observed the stale service-worker-controlled port 4173 and is not evidence against this current-source result.

The 59 existing renderer/viewer checks pass; no new tests were added. Additional live single-part and print checks were interrupted by browser automation timeouts, so final ratification remains open rather than being inferred from automated checks alone.

Browser recovery succeeded: the primary reviewer selected Alto-only and inspected the complete current-source phone-width score. All 48 lyric positions retained all three stanza rows, the single staff remained legible, and “Thou shouldst” remained clearly separated. Together with the completed four-voice printed note/duration audit, three complete lyric underlays/transcripts, and full-score desktop/phone captures, this closes the corpus review: **PASS**. Physical-device playback and printed-page release checks remain separate app-level gates, not claims made by this corpus approval.
