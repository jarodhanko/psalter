# Source-photo QA protocol

The annotated photographs are the transcription authority. A clean scan, MIDI,
another hymnal, or an existing public transcription may help locate an obscured
event, but it cannot override the photographed Psalter page.
Within each photograph, the **printed engraving** is authoritative: read pitch
from notehead and clef, rhythm from printed note values and dots, and accidentals
from the key signature and printed signs. Handwritten note names and markings
are fallible aids, never grounds to override the printed music. If a handwritten
label disagrees with the engraving, record the discrepancy and transcribe the
engraving.

## Review unit

Review one exported arrangement at a time. A numbered selection with a second
tune therefore has two review units. A setting that crosses a page boundary is
one review unit and must be checked against every contributing photograph.
The `transcriptions/by-photo/` filename prefix is a photograph sequence number,
not a Psalter number. Locate the arrangement by its numbered heading, title,
Psalm, and tune before using a photograph; a same-numbered photo may contain a
different song. Check adjacent photographs for a continuation or alternate tune.

## Approval requirements

An arrangement is ready for final photo approval only after an independent
reviewer has checked all of the following directly against the source:

- the exact setting boundary, including page continuations and neighboring tunes;
- every voice's pitch, concert register, onset, duration, rest, accidental, and
  bar/repeat/ending structure;
- every printed tie, slur, fermata/hold, articulation, unison/harmony direction,
  divisi part, and exceptional extra voice;
- every printed lyric underlay and lyric-only stanza included by the app;
- a current ABC render for missing material, duplicated material, voice swaps,
  warning output, and implausible staff placement.

The reviewer records the authoritative photograph name(s), the result, and any
correction in a tracked, text-only `docs/photo-qa-reviews/` report. Local
`transcriptions/by-photo/` and `temp/psalter-work/` may hold detailed working
notes, crops, or renders, but cannot be the sole evidence for final approval:
both directories are intentionally ignored and will not accompany an open-source
checkout. Do not copy photographed scans or full working ABC snapshots into the
tracked report. Once approved, the comment directly above the exported ABC
block must cite the tracked report and must not retain a contradictory pending
marker.

## Separate release gates

These checks answer different questions and must not be combined:

1. ABC validation proves the data is syntactically usable and structurally
   complete for all 450 numbered selections.
2. Source-photo QA proves an individual arrangement matches its photograph(s).
3. Responsive viewer QA proves the approved data reflows without clipping or
   preserving photographed system breaks.

The corpus-wide source-photo item in `docs/release-checklist.md` stays open until
every one of the 474 exported arrangements has current, non-conflicting approval
evidence. Historical `pending`, `quarantined`, or approval comments are audit
leads, not a completion count, until reconciled with the latest evidence.

## Working files

Keep crops, renders, scripts, and intermediate comparisons under the ignored
repo-local `temp/` tree. Do not write scratch images to the Desktop, and do not
add the source photographs to the public distributable.

For event-level lyric work, `npm run inspect:underlay -- psalter191` reads the
current canonical source and prints each first-voice ABC note/rest event, its
original ABC token, and attached lyric slots by system, followed by the complete
`W:` transcript. Run `npm run inspect:underlay -- psalter191 --generated` when deliberately comparing the last
generated viewer asset instead. The command is read-only and can expose missing
or shifted slots; it cannot determine the photographed syllable placement, so
every `w:` decision still needs direct photo comparison.
