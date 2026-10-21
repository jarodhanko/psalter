# Psalter 315 — printed-score correction

## Full score-and-lyric approval — 2026-09-28

An independent read-only reviewer compared the owner photo `20260829_112835.jpg`, the same-edition clean scan, and current ABC across the three printed systems. The event ledger contains 251 attacks: S 68 (21/22/25), A 60 (19/19/22), T 63 (20/20/23), B 60 (19/19/22). Printed one-sharp G signature, 16 complete 4/4 bars, pitch/register, rhythm, explicit C-sharps, the sole stanza's words, and syllable underlay agree. No reproducible discrepancy or parser warning was found. A fresh 1400-pixel desktop production render was visually inspected with all parts and the stanza present. Score/photo and desktop-render status: PASS. Pen annotations overlap some stems in the owner photo; the clean same-edition scan supplied the clearer printed notation at those points. The SVG's former 255-element count is not an attack count. Audio, physical-mobile, and print-output checks remain separate. The older pending-review statement below is superseded.

## Four-part correction — 2026-09-27

The earlier music comparison below missed a key-signature and multiple pitch/rhythm errors. The owner photo and same-edition `_315.webp` show **one sharp (`K:G`)**, not two (`K:D`). The printed score has sixteen complete 4/4 bars across 5+5+6 printed systems. A full four-part bar ledger was reconstructed from the printed noteheads. Corrections include the soprano's C5 openings in bars 2, 5, 9, 11, and 13; alto attack counts in bars 2, 4, and 12; several tenor pitches and rhythms; and the bass's printed C-sharp in bar 12. All other C notes now take their printed natural pitch under the one-sharp key. The two tenor C-sharp measures remain explicit. Printed heavy phrase divisions are retained; no slur, tie, or fermata was invented.

The sole printed stanza's `w:` rows remain aligned to the three music-system segments, with 21/22/25 soprano attacks and the previously verified held-syllable positions. The pinned ABCJS inspector still places the final words `and`, `cy`, and `Lord` at the segment endpoints with no warning. Complete `W:` text remains for reading and search. An independent Luna review confirmed every printed lyric word and continuation, while Astra checked the full music candidate from the score. A second complete SATB event ledger and audible-device QA remain open; earlier music PASS implications below are superseded.

## Historical review (superseded for music)

- Ground truth: local source evidence (not distributed), printed page 274. It shows the complete no. 315, “The Universal Fellowship of Worship,” tune KINROSS, Psalm 117, 8s and 7s, George C. Stebbins. The selection occupies three complete score systems and ends before the copyright line; no. 316 begins below it. There is one setting and no alternate tune or page continuation for no. 315.
- Compared the source's D-major signature, 4/4 meter, four SATB parts, three-system phrase sequence, bar structure and terminal bar with the photographed score and its handwritten pitch annotations. The source has 16 measures in each voice. I found no evidence-backed notation correction. The photographed system breaks are layout only and are not encoded as musical boundaries.
- The single printed stanza agrees with `W:` through its final words, “Hallelujah, praise the Lord.” The photo prints the stanza beneath the score, with hyphenated word divisions. The new note-aligned `w:` rows follow each of the three soprano systems.
- A rejected trial had placed all extra slots after the system-ending words, contradicting the photo's alignment of “and” and “Lord” with their last notes. A closer review of upright score crops located the surplus events within words: system 1 holds `na-` and `pro-`; system 2 holds `kind-`, `prais-`, and `mer-`; system 3 holds `ac-`, `dur-`, and `jah`. These positions account for 21, 22, and 25 soprano events against 19, 19, and 22 printed syllables without trailing extenders. `tools/inspect-underlay.mjs psalter315` confirms each lyric slot lands at the intended event and the three final words remain on their photographed final notes.

## Targeted ABCJS parse and render check

Using the source `psalter315` block with ABCJS 6.7.0, `parseOnly` returned one tune with no warnings. An in-memory DOM `renderAbc` call produced one SVG; ABCJS exposed three music systems, each with two SATB staff groups containing two voices apiece. The rendered result contained 255 note elements. This establishes syntactic and render validity, not complete lyric-underlay approval.

Lyric-underlay status: PASS against the annotated photo. The music itself was not changed; independent full SATB photo QA remains open.
