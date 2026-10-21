# Psalter 55 photo review — partial

- Authority: annotated local source evidence (not distributed), printed page 52, hymn no. 55, “The Good Shepherd.” It prints `PSALM 23`, `7s and 6s`, and tune EWING by Alexander Ewing. All three stanzas are printed; no copyright or selected-stanzas notice is visible in this capture.
- Correction: added `R:Psalm 23, 7s and 6s` and transcribed all three photographed stanzas into soprano `w:` fields. The existing SATB musical event strings were left unchanged. No other edition was used.
- Text checked directly against the photo:
  1. The Lord my Shepherd holds me Within His tender care, And with His flock He folds me, No want shall find me there. In pastures green He feeds me, With plenty I am blest; By quiet streams He leads me And makes me safely rest.
  2. Whatever ill betides me, He will restore and bless; For His Name's sake He guides me In paths of righteousness. Thy rod and staff shall cheer me In death's dark vale and shade, For Thou wilt then be near me: I shall not be afraid.
  3. My food Thou dost appoint me, Supplied before my foes; With oil Thou dost anoint me, My cup of bliss o'erflows. Thy goodness, Lord, shall guide me, Thy mercy cheer my way; A home Thou wilt provide me Within Thy house for aye.
- ABCJS `parseOnly` check: 53 soprano note events; all three stanza rows parse with 52 lyric entries, leaving the final event without a lyric entry in each. Exact melisma/skip placement remains unresolved.
- Remaining QA: no event-by-event SATB pitch/register, rhythm, accidental, barline, or mark comparison and no fresh rendered-underlay review were performed. Overall status remains PARTIAL.


## 2026-10-03 reported cadence correction

This dated addendum preserves the earlier partial review above. A later corpus-audit ledger also retained the incorrect upper notes; that historical acceptance does not supersede this newly verified defect.

- Source review of “No want shall find me there.” The earlier ABC SHA-256 was `f3b9d3d276320576838d60cd0ee944f55790204f25217b9d81c8eeffb3a1c603`.
- Printed authority: [retained Psalter 55 scan, pinned revision](https://raw.githubusercontent.com/jrvermeer/Psalter2025/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score/_55.webp). Image SHA-256: `79117a1d7ad4fad7b860bdc4bbb51eda25e4d7fa2956a6b7cda945991664da5f`; Git blob: `aa3d39c640d3b5562434ac8f8551dc3bd93aa69b`. This is the retained printed-score scan, not a fresh inspection of the unavailable annotated photograph.
- The printed D-flat edition is normalized by the existing +7-semitone transformation to the app's A-flat edition. That transformation, all rhythms, lyrics, lower parts, and every other event field are retained.
- At “me there,” correct soprano G4→A-flat4 and A-flat4→B-flat4; correct alto E-flat4→F4 and F4→G4. These are four pitch changes only, confirmed by direct and independent pixel reading. The surrounding tenor and bass phrase matches the print.
- Corrected ABC SHA-256: `d789059b5ba4340ccf1fe950746638a9fecf5727a5f6ba7a4ecc10e8ab2da759`.
- Five focused checks verify the printed phrase, exact four-pitch delta with other musical fields and lyrics unchanged, actual prepared audio/synth callback for all and solo parts, and screen/print musical parity. DOM geometry is mocked in those checks; this is not physical-print or full-layout validation.
- Current whole-song acceptance remains reopened while the rest of no. 55 is compared against the printed witness, because the report also questioned other notes. This bounded phrase correction must not be represented as a fresh full-corpus audit.


### Verification follow-up (2026-10-04)

- The bounded whole-song check is complete. Two fresh direct readings of the retained printed score found no additional pitch, rhythm, or accidental mismatch beyond the four pitches above. An independent D-flat ledger, normalized by +7 semitones, matches all 209 note events and all four 64-quarter-note timelines in the corrected edition. The comparison includes the alto slur, chromatic naturals, printed high unison on “feeds,” and unequal “plen-ty” subdivisions.
- A live 500-pixel, 100%-size screen check shows all 209 noteheads, no render error or horizontal overflow, and readable staves/three-stanza underlay at the corrected cadence. This does not establish physical-print or listening acceptance.
- Current printed-source acceptance for no. 55 is revalidated for the retained printed scan and the existing transposed edition. The historical reopening and audit miss remain documented above; this source record does not reproduce the private issue queue.
