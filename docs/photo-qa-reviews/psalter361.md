# Psalter 361 printed score and lyric review — PASS

- Ground truth: annotated local source evidence (not distributed) (photo 302, printed page 308). No. 361 / ASHWELL is complete across the two lower grand-staff systems; no. 360 above it is separate.
- The four printed stanza rows supply 32 sung syllables each, 16 in each photographed system. The current T1 stream has 32 note events; events 1–16 carry the first two text lines and events 17–32 carry the last two. `tools/inspect-underlay.mjs psalter361` confirms every event now receives the corresponding photographed syllable in each stanza, including `Is-rael`, `Je-ho-vah`, `right-eous-ness`, and the closing words.
- All source `W:` text and SATB notes were preserved. A fresh desktop production-browser screenshot shows all four stanzas attached across the responsive score without obvious clipping. This is a lyric-placement and layout smoke check, not a fresh independent SATB pitch/rhythm/expression, mobile, or print approval.

## Complete review — 2026-09-30

The primary and independent reviewer compared all 32 chronological note events in each of the four voices against the owner's printed page and clean high-resolution IA `psalterwithrespo00unit_0318.jp2`. Every pitch, octave, accidental, and note duration agrees. The printed D-major key has two sharps; the extra soprano G-sharps at “bit-” and “as-” and alto D-sharp at “ar-” are retained. Handwritten annotations were excluded as authority.

Three incorrectly merged bar groups were corrected in all four voices: a double bar after “say,” a single bar after “sailed,” and a double bar after “ray.” These are printed phrase boundaries, not forced renderer line breaks. The engraving includes partial bars; they were preserved rather than normalized to the time signature.

The four verse texts, syllable placements, and closing words match print at all 32 soprano events. local source evidence (not distributed) shows the final revised score reflowing into three systems with all four stanza rows aligned, no missing text, and no visible collisions. Status: **PASS** for printed notes, lyrics, and the inspected desktop render. Physical-device audio, mobile, and print gates remain separate.

Canonical ABC validation passes across 474 arrangements with zero parser warnings. The production PWA build passes. No new unit tests were added.

Firebase production Hosting was updated. Served `psalter361-BVdH3weo.js` returned HTTP 200 and matched local SHA-256 `5ae3780aa29defea78522c712fdbc2846b76a251dc7229baebdf992122bb72ec`.
