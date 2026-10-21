# Psalter 68: DALLAS printed pitch correction

The first half notes of bar 7, on “own” in stanza 1, are A4 in soprano and E4 in alto. The former canonical ABC encoded B4 and F-sharp4. Correct these two notes without changing duration, lyrics, accidental scope or voice assignment.

Both actual printed witnesses and an independent second reader confirm the correction:

- RFPA Psalter PDF, one-based page 110: <https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf>, SHA256 `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`.
- Original1912 distinct engraving, printed page 61, IA leaf 0067: <https://archive.org/download/psalterwithrespo00unit/psalterwithrespo00unit_jp2.zip/psalterwithrespo00unit_jp2%2Fpsalterwithrespo00unit_0067.jp2>, SHA256 `19445009f2f0259779fd099491a869e9f26ae2ea38e0749b1eaad88ed8f5e76c`.

The full manual fixture was transcribed from pixels before canonical notes or parser output were opened. It contains 146 timed SATB events (134 pitches and 12 rests), 22 slurs, one explicit G-sharp in soprano bar 7, 16 full 3/4 bars and four stanzas. Original1912 confirms both stems of the shared A3 half head in tenor/bass bar 12; its initial ownership uncertainty was resolved without changing source. RFPA’s small stanza2 “ui” glyph was enlarged and reread, matching “iniquity”; no lyric correction is needed.

`src/data/__fixtures__/psalter68Printed.json` preserves the independent event/lyric ledger. The focused regression checks every event across 15 selections, nine stanza configurations, learner mode off/on and transpose 0/−2/+2 (810 cases); every native lyric onset; and 45 real playback callbacks including exact muting and 48-quarter timing. It also reconstructs the previous notes and confirms the two expected pitch differences. Four tests and focused TypeScript checking pass. Separate audit probes execute current notation preparation, 30 inactive source-supplement guards, all 15 music-only selections after lyric transfer/parsing, and 2,256 recipient/stanza slots per version.

Heavy phrase strokes at q12,24,36 are ordinary bars in ABC at identical times; this is a retained typography qualification. No pickup, rest, tie, cue, fermata, measure-boundary or other music change is warranted. The tests check parsed notation and synthesis events, not acoustic playback, browser orchestration or page geometry.
