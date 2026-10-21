# Psalter 241 lyric-underlay QA

Authority: annotated photo 201, local source evidence (not distributed) (printed p. 207).

- Directly checked: the photograph shows all three music systems, the complete engraved underlays for stanzas 1–5, and text-only stanzas 6–9 below the score. The printed words for stanzas 6–9 agree with the source `W:` text.
- Inferred: the added numbered `w:` rows for stanzas 6–9. Their syllable divisions and placements use the photographed stanza 1–5 underlay pattern: 11 lyric slots on system 1, 10 on system 2 with the continuation at event 4, and 11 on system 3 with continuations at events 2 and 11.
- Inspector: Node 24 `tools/inspect-underlay.mjs psalter241` reports three systems with 11/11/13 first-voice events and no parser warnings. Each new stanza reaches its final syllable on the final event of every system (events 11, 11, and 13); the underscored continuation slots remain empty as intended.
- Scope: this review covers the stanza 6–9 lyric underlay only. It does not certify the separate photo-grounding uncertainties in SATB pitches, rhythms, accidentals, bars, or expression marks. Existing `W:` text and music fields are preserved.

Scoped lyric-underlay status: PARTIAL (stanza text direct; stanza 6–9 alignment inferred).
