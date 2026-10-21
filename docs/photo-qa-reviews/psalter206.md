# Psalter 206 photo QA (partial)

- Source: local source evidence (not distributed) (annotated photo 168), printed page 174.
- Boundary: “The Righteous Judgment of God,” Psalm 75, C.M.; BOSTON by Uzziah C. Burnap. All five stanzas are underlaid across two systems; the tune ends on p.174 and no.207 begins below. No extra text-only stanza or continuation is visible.
- Rights/footer: no copyright or permission notice is visible for no.206; none was added.
- Text/music: the annotated photo shows five printed lyric rows beneath the first 15-event T1 system, with the same five stanzas continuing beneath the second 15-event system. Their syllable counts do not equal the event counts uniformly: the first-system rows have 14, 14, 14, 14, and 15 printed syllables; each continuation row has 14. The photographed alignment therefore requires row-specific melisma handling. The handwritten letters around the staves identify pitches; they do not resolve those melismas by themselves.
- Underlay trial: ABCJS parsed two T1 lines with 15 note events each (30 total), with no reported warnings. A prior `w:` trial returned 29 lyric assignments for stanza 1 and 28 each for stanzas 2–5, but stanza 1 picked up stanza 5's “show;” at the system boundary and stanza 5's first-system text stopped at “glo-ry,”. The trial was removed. Since those results cross lyric rows and do not establish the row-specific melisma positions visible in print, the complete text remains in `W:` and the SATB/ABC is unchanged. No forced `$` breaks were added.
- Status: PARTIAL. The source text and voice events were reviewed, but a photo-grounded syllable-to-note underlay is not established. No rendered-score approval is claimed.

- Follow-up review: inspected the original annotated page at full resolution (local source evidence (not distributed)). It confirms two 15-event T1 systems and five lyric rows under each system. Four rows have 14 printed syllables in system 1, all five rows have 14 in system 2, and stanza 5 has 15 in system 1.
- Exact blocker: the syllable totals establish that several rows need a melisma/skip slot, but they do not establish which exact T1 event each row leaves unassigned. I could not verify every row's slot against the printed lyric-to-note spacing across both systems, so a complete `w:` sequence would require guessing. No lyric rows were added to the ABC, and no focused lyric test was added.
- Status remains PARTIAL. Preserve the existing SATB and `W:` text until each row's underlay can be mapped event by event from the photograph; no lyric-alignment approval is claimed.

## Underlay completion

- Re-examined both photographed systems at full resolution. In system 1 the last four soprano attacks carry four syllables in stanza 5 (`His glo-ry show`), but only three in stanzas 1–4. The extra short attack extends `sin-`, `ap-`, `ners`, and `in` respectively; the terminal note carries `cere`, `pear`, `know`, and `vain`.
- In system 2 the printed slur over the two-note `(A G)` figure supplies the extra attack. It extends `Thou`, `fill`, `hon-`, `bit-`, and `bring` in the respective stanzas. The last note carries each stanza's final word, not an inferred end-of-line extender.
- Added all five photographed stanza rows to both soprano systems as `w:` while retaining complete `W:` text. `tools/inspect-underlay.mjs psalter206` now shows 15 slots on each system and the expected internal extender positions. No SATB pitches or photographed barline structure changed.
- Status: PASS for photographed lyric-to-note placement in both systems. The earlier partial assessment above records why this was initially held back.
