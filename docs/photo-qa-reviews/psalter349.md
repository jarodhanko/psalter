# Psalter 349 — MORECAMBE photo-to-score review

## Full photo-to-current-score approval — 2026-09-28

**PASS for the MORECAMBE arrangement's printed score and four-stanza underlay.** The owner's local source evidence (not distributed) (printed p. 299) contains this entire setting: four systems, four 4/4 bars per system, two treble and two bass voices, four printed stanzas, and no continuation or alternate tune on the next photo. The printed engraving, not handwritten note-name annotations, governed every disputed reading. The current canonical ABC and generated `psalter349` module were identical when the local QA sheet was generated.

System-by-system comparison of printed noteheads, clefs, duration values, accidentals, rests, barlines, and lyric anchors against the current ABC:

| Printed system | Bars | SATB result | Four-stanza underlay |
| --- | --- | --- | --- |
| 1, “My heart … sound” | 1–4 | All four voices match. The alto bar-3 B and bass bar-2 B have **no printed flat sign**; an initial reading of handwritten B labels as flats was retracted after inspection of the engraving. | Ten syllable positions in each stanza match print. |
| 2, “The call … prayer” | 5–8 | All four voices match, including the printed D-sharp/F-sharp in alto, F-sharp/C-sharp in tenor, D-sharp in bass, and the inner-voice slur. No rest or missing attack found. | All four stanza rows and ten sung positions match print. |
| 3, “Our feet … ground” | 9–12 | All four voices match; there are no printed accidentals or rests in this system. The note values and barline groups agree. | All four stanza rows and ten sung positions match print. |
| 4, “Within … fair” | 13–16 | All four voices match; the first two tenor attacks carry the printed slur. No printed accidental, rest, fermata, articulation, extra voice, or alternate ending is present here. | All four stanza rows and ten sung positions match print. |

The four numbered `W:` stanzas were compared with the four printed rows; no lyric-only stanza is omitted. A separate independent contradiction review found no contrary printed event and confirmed the system-1 handwritten-flat trap. The current production viewer at `the deployment used for the historical review` was captured in a 1400-pixel desktop viewport after this review: all four music systems and four stanza rows render once, in order, with both staves and final barline visible, and without lyric/staff overlap or missing text. The locally generated standalone QA-sheet SVG is **not** the render approval artifact: its simplified ABCJS settings crowd lyrics onto the lower staff, whereas the actual viewer's responsive renderer spaces them correctly. The production screenshot is ignored scratch at local source evidence (not distributed).

This approval covers current source-photo note and lyric parity plus desktop render only. It does not by itself close separate physical-device audio, mobile, print, rights, accessibility, or offline release gates.

## Earlier bounded current-score recheck — 2026-09-28 (superseded by full approval above)

Against the owner photo of printed p. 299, the current soprano in bars 1–4 matches the printed pitches and durations (`E E E | F E | A G F F | E`), and all four first-system stanza rows match ten printed syllable positions. The `W:` transcript wording also matches at text level. This is not a full pass: alto, tenor, and bass bars 1–16; soprano bars 5–16; and systems 2–4 note-level underlay remain unchecked in this pass. No new mismatch was established.

## Printed-score correction — 2026-09-27

The observations below describe the former, incorrect ABC. All sixteen measures of SATB were rederived from owner photo 293's printed MORECAMBE score, with four ABC soprano lines matching its four engraved systems. Each of the four stanzas now has ten note-aligned syllables on each system, and the printed second-system sharps are encoded in the lower voices. The revised ABC parses without warnings; an independent targeted visual review found no concrete note or lyric contradiction. Exhaustive pixel-by-pixel inner-voice verification is still open.

- Authority: annotated photo local source evidence (not distributed), printed page 299. It contains the complete MORECAMBE setting and four printed stanzas; photo 294 begins the next setting.
- The candidate `w:` rows followed both soprano music lines, leaving the first 21-event line untexted and attaching all rows only to the second 19-event line. The printed phrase text has 20 syllables in each half, so the candidate event counts do not support a complete line-by-line attachment. No note repair was attempted.
- Targeted recheck: the photo has four printed systems of four bars each; the two ABC soprano lines group those bars 8+8, so the differing line counts do **not** mean a printed system is missing. The last four ABC bars (`d4 c2 B2 | A4 G4 | F4 E4 | D8`) contain only eight soprano attacks against ten printed syllable positions in the final photographed system. This local shortage cannot be repaired by lyric extenders alone; reconcile the SATB note/rhythm transcription for those bars before assigning `w:` underlay.
- Removed the partial `w:` attachment and preserved all four complete stanzas as readable, numbered `W:` text. This records the photographed words without claiming the candidate pitches or lyric-to-note events are verified.

Status: partial; lyric text retained, note-level transcription and underlay remain unverified.
