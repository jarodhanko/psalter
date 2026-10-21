# Psalter 434 printed-score comparison

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](../release-checklist.md) for release preparation.


Review date: 2026-10-14.

Status: **The previously unverified soprano lyric slots are intentional in the
matching published engraving. No current pitch or duration mismatch was found.
Final owner-photo approval remains open.**

## Sources and scope

The reviewed setting is “Our Father Which In Heaven Art,” Rev. John A. Heys,
identified in the existing source metadata as printed page 890. The current
canonical ABC SHA-256 is
`97d553316fa28d7b051097fe8446c0147e1c005cfec4a2b4572a79b3135bddd7`.

- [Matching published PDF](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf),
  PDF pages 654–655 (one-based), SHA-256
  `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`.
- [Pinned matching score image](https://raw.githubusercontent.com/jrvermeer/Psalter2025/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score/_434.webp),
  SHA-256 `ad6eaa7ee1d3cba994a5e95d002c873ba35445c8fad8760f39b2962d2a6f99e6`.

Both files agree with the source identities already recorded in
`docs/source-corrections/2026-10-01.json`. Their pixels were inspected directly;
OCR was not used to decide notes or lyric placement. They are the same engraving
lineage, not two independent editions. The reviewer had seen the current ABC
before entering the manual comparison ledger. This is not a blind source-first
transcription or a substitute for the final owner-photo protocol.

The previously noted photograph `20260829_112434.jpg` is still not the source:
it shows no. 254, “An Invitation to Worship.” No newly identified owner photograph
is claimed here.

## Pitch and duration comparison

All four voice sequences were visually compared by staff position, key
signature, printed accidentals and note values. The comparison includes the
one-quarter pickup (measure 0), 24 complete 4/4 measures, final quarter rest and
two whole-note Amen chords. The printed key signature has three flats, E-flat
major. No note was changed.

The manually entered scientific-pitch ledger in
`src/data/__fixtures__/psalter434PrintedReview.json` records every measure in
quarter-note units. It matches all 386 written events: 93 soprano, 99 alto,
98 tenor and 96 bass, including one rest in each voice. Each voice totals 97
quarter notes. Particular accidentals and registers checked include:

- Tenor: A-natural in measures 5, 6, 11, 12, 19 and 20; A-flat restored on the
  last beat of measure 12.
- Bass: the low F2 notes in measures 11–12, and B-flat3 on “give” in measure 13.
- Amen, measures 23–24: soprano E-flat4 to E-flat4; alto B-natural3 to B-flat3;
  tenor A-flat3 to G3; bass E-flat3 to E-flat3.

## Lyric placement and capitalization

The third printed system supports the existing blank lyric slots:

- Soprano measure 8, beat 4: “Give” spans E-flat4 and F4 eighth notes.
- Soprano measure 10, beat 4: “For-” spans E-flat4 and F4 eighth notes; “give”
  begins the next measure on G4.
- In the fourth system, measure 14, beats 1–2: “debt-” spans the slurred A-flat4
  and G4 quarter notes, followed by “-ors.” on F4.

The empty slots are continuations of the same syllable, not missing words.
The ending is printed “A - MEN.” The existing `w:` capitalization is therefore
source-faithful; the sentence-case `Amen.` in the searchable `W:` paragraph is
a prose rendering. No capitalization preference is inferred from this audit.

## Verification and limits

`psalter434PrintedReview.test.ts` checks the complete pitch/duration/rest ledger,
all 15 nonempty voice selections at transpositions 0, -2 and +2, the real audio
callback's pitches and muting, and the reviewed lyric slots. The existing
source-bound nine shared fermata releases remain separate timing behavior;
this comparison does not change their policy.

No runtime code, canonical ABC, generated ABC, published source image, or report
record is changed by this review. A new live-browser listening check and final
independent owner-photo certification are not claimed.
