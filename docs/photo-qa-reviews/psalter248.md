# Psalter 248 photo QA — underlay extension

- Source: local source evidence (not distributed), printed page 214. The photograph directly shows all three melody systems, the complete underlaid stanzas 1–4, and text-only stanzas 5–6 below the score.
- Direct underlay evidence: the four engraved underlays occupy the same 12/11/12 soprano events as the source ABC's three systems. Each stanza assigns 11, 10, and 11 syllables across those systems, with the photographed continuation positions at system 1 event 6, system 2 event 2, and system 3 event 11.
- Inferred underlay: added `w:` rows for text-only stanzas 5–6 by applying that repeated 11/10/11 syllable distribution and the three observed continuation slots. The printed text is transcribed directly; its exact syllable-to-note placement is inferred from stanzas 1–4, not printed under these notes.
- Inspector: Node 24 `tools/inspect-underlay.mjs psalter248` reports three systems with 12/11/12 events and no parser warnings. In both new rows, the final lyric slot is on the final note event in each system (events 12, 11, and 12); the underscored continuation slots remain empty as intended.
- Scope: this records the underlay extension only. It does not add a new SATB event-by-event or fresh-render review. All complete `W:` text and existing music fields are preserved.
