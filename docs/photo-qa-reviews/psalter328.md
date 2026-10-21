# Psalter 328 — God the Portion of the Soul / HOBART

## Independent current-source audit — 2026-09-28

The read-only pass against owner photo `20260829_112913.jpg` and clean `_328.webp` found the current C-major, 3/2 score has 12 bars (4 + 4 + 4) and 110 parsed attacks (S 27, A 28, T 28, B 27). No specific printed pitch, rhythm, accidental, or expression mismatch was isolated; the alto's final-system G-sharp agrees. All four `W:` texts and all three groups of four `w:` rows are present, including the middle system's ten soprano attacks and the final slurred syllable continuation. The older statements below about missing underlay, a nine-attack middle system, and retained F-sharp describe superseded source, not the current ABC. Pencil overlaps some heads, so a fully documented independent event ledger is still needed before PASS; current status remains PARTIAL.

## Correction — 2026-09-27

The earlier missing-note and no-underlay findings below describe the former ABC and are superseded. A new read of owner photo 277 rederived all three SATB systems from the printed music, correcting the voice assignment, rhythms, barlines, and the alto G-sharp. Four stanza rows now attach to all 7/10/10 soprano attacks across the systems; the sole soprano slur has an explicit lyric continuation. ABCJS parses without warnings, and a separate targeted visual review found no concrete remaining defect. This is not a pixel-by-pixel certification of every inner-voice note, so the independent exhaustive SATB audit remains open.

**Result: PARTIAL.** Independently checked against the annotated source photographs
on 2026-09-23. The photographs, not the earlier scratch transcription, are the
authority for this review.

## Boundary and identity

- Photo local source evidence (not distributed) (photo 277,
  printed page 283) contains the end of Psalter 327 above the title and its
  final bar, followed by the complete Psalter 328 / HOBART setting. HOBART has
  three complete musical systems and closes at the printed double bar with
  `[Part VIII]`.
- Photo local source evidence (not distributed) (photo 278,
  printed page 284) starts Psalter 329 / NILUS. Psalter 328 has no continuation
  there. Neither neighboring setting is included in the no. 328 block.
- The no. 328 heading gives “God the Portion of the Soul,” Psalm 119 S. M.,
  HOBART, and Henry Tucker. The score has no key-signature accidentals (C
  major) and is marked 3/2.

## Score and text check

The photographed soprano, alto, tenor, and bass events are represented in the
source across all three systems. The pencil note labels overlap some noteheads,
so this review does not claim a new independent event-by-event certification
of all SATB pitches, rhythms, or expression marks. The four printed lyric lines
are underlaid beneath the soprano in the photograph. The attempted lowercase
`w:` rows were removed after a parsed-note check showed that they attached
only to the final of three ABC music lines: the first two lines had no lyric
assignments, and later syllables were discarded. The complete stanza text
remains in `W:` rows. Exact syllable-to-note placement, including melismas and
music-line boundaries, remains open. The source F-sharp and metadata are
retained as transcribed.

The source also prints the meter reference `PSALM 119 S. M.` and the section
marker `[Part VIII]`; both are now recorded in the ABC metadata. No separate
copyright or permission notice appears with no. 328 on photo 277. Photo 278's
printed 1912 notice belongs to no. 329 and was not carried into this block.
This is a transcription observation, not an independent legal conclusion; see
the corpus scope in `docs/rights-audit.md`.

## ABCJS check

The current no. 328 block passed targeted ABCJS parsing with zero warnings and
four parsed voices. It retains four full `W:` stanza rows, but no accepted
lowercase `w:` underlay. Parser warnings and a successful render were not
sufficient to detect the discarded lyrics; future underlay checks must inspect
lyric attachments on every parsed music line. Rendering does not certify the
ambiguous annotated SATB events described above.

Scratch extraction and render are under ignored
local source evidence (not distributed).

## Independent underlay re-review

- Rechecked photo 277 (`20260829_112913.jpg`) directly. It shows all four stanzas beneath the soprano, with the note-name annotations written over the music; those marks identify pitches, not syllable extensions.
- The pinned Node/ABCJS parse has three soprano music lines with 8, 9, and 12 events (29 total) and no warnings. Each printed stanza has 26 syllables in short meter (6.6.8.6), leaving three note events per stanza to be accounted for as held syllables. The exact placements and their continuation across the three ABC music lines remain unverified.
- No `w:` rows were added; the existing whole-stanza `W:` text and SATB remain unchanged until all four stanza endings can be followed through a line-aware underlay.

## Score-versus-underlay discrepancy to resolve

- A second, escalated comparison found a concrete blocker in the middle photographed system. Stanza 1 prints ten syllables there: `words I ev-er heed; With all my heart Thy`. The other three stanza rows follow the same ten-position phrase. The corresponding second ABC soprano line parses only nine note events (`A G G E D D E G G`); alto, tenor, and bass each also have nine events. Its seven 3/2 measures in ABC correspond to this printed system, so the mismatch is not explained by moving an ABC line boundary. ABC lyric extenders or skips can use extra notes but cannot supply a missing note for that printed ten-syllable phrase.
- The pencil pitch labels overlap source noteheads in this system. Although the photograph appears to contain ten soprano attacks, this re-review does **not** certify which ABC pitch/duration/bar is absent or authorize a guessed score correction. A native-pixel, measure-by-measure SATB comparison is needed. Preserve the photo as ground truth and the current `W:` text until the transcription is reconciled.
