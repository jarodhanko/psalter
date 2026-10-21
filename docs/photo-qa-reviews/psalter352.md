# Psalter 352 photo QA — partial

## Bounded SATB review and confirmed notation gap — 2026-09-28

Two read-only reviewers compared the current first eight and final seven ABC bars with owner photo `20260829_113034.jpg` (printed p. 301). They found no definite pitch, duration, key-signature, rest, barline, or four-stanza underlay mismatch; the first system includes a photographed two-beat bar 5, and the second system has seven complete bar groups. A fresh 1400-pixel production desktop render showed the complete four-voice score, all four lyric rows, and its closing barline without overlap. This is still **PARTIAL**, not photo approval.

A high-resolution same-edition clean scan, `psalterwithrespo00unit_0311.jp2`, exposes printed curved slurs in the no. 352 engraving, also discernible in the owner photo. Before the targeted correction below, `psalter352` had no slur parentheses. Exact endpoints of the remaining curves still need reconciliation against the owner print; the clean scan is only a reading aid. Do not count this arrangement as certified until those printed slurs are encoded or conclusively shown not to belong to its timed voices, followed by a fresh render check.

An independent reviewer then confirmed one exact engraved slur in **soprano bar 2, B–A**, visible in both the clean scan and the owner's photo. The canonical ABC now encodes `(B A) G2`; pitches, durations, and lyric slots are unchanged. The other apparent soprano curves—around the first-system C–B phrase and in the second system—remain unresolved, so this targeted correction does not make the arrangement PASS. The full verifier passed, the changed arrangement was deployed to Firebase production Hosting, and the served `psalter352` asset's SHA-256 matched the local build.

- Ground truth: local source evidence (not distributed)
  (annotated photo 295, printed page 301). No. 352, “Escape from
  Enemies,” occupies the complete two-system BOYNTON setting below the end
  of no. 351 and closes with a double bar. No. 353 starts on the next photo.
- The photographed treble and bass signatures each have **four flats**,
  corresponding to A-flat major. The current ABC `K:Ab` matches the photo.
  The older, pre-integration note in
  local source evidence (not distributed) says three flats / E-flat;
  that metadata observation is superseded by this direct key-signature read.
- The four stanzas are printed across the two soprano systems. Their complete
  text remains in `W:`; note-level `w:` lines now follow each system. Each
  system has 14 printed syllables per stanza: the final syllable of each first
  system stanza continues over five additional note events, and the final
  syllable of each second system stanza continues over two additional events.
  `tools/inspect-underlay.mjs psalter352` confirms 19 and 16 soprano events,
  with the four lyric slots in the photographed order.
- Lyric-underlay status: PASS against the annotated photo. Overall photo QA
  remains PARTIAL: the page boundary, key signature, printed text, and soprano
  syllable alignment have been checked, but SATB pitches, rhythms, expression,
  and responsive render still need independent review.
