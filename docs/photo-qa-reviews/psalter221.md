# Psalter 221 photo QA — lyric underlay reviewed

- Source: annotated photo local source evidence (not distributed) (photo 183), printed page 189.
- Boundary: the page contains one complete setting, no. 221, “Longing for Revival,” Psalm 80 11s, tune CARITAS by Adoniram J. Gordon. Four systems, three printed stanzas, the final double bar, and `[Selected Stanzas]` are visible. Photo 182 contains the preceding no. 220; photo 184 begins no. 222. No continuation or second tune for no. 221 is present.
- Metadata and text: the heading, F major key signature, 4/4 meter, tune/composer, three stanza texts, and selected-stanzas footer were checked against the photo. Existing `W:` stanza text is retained.
- Parser and underlay: ABCJS `parseOnly` returns one tune, four systems, and no warnings. The soprano has 12, 12, 14, and 13 note events by system. On 2026-09-25 all 12 `w:` stanza rows were mapped directly to the printed words and soprano noteheads. An independent reviewer checked each row and melisma against the owner photo, including system 3's three slurs and final system event 13 “more.” The `W:` transcript remains intact. `inspect-underlay.mjs psalter221` confirms all note slots and `_` extenders.
- Music preservation: no SATB source notes or rhythms were changed. A complete event-by-event SATB comparison and fresh rendered-score review were not performed.

Status: lyric underlay reviewed. Full SATB/photo comparison and rendered-score/device review remain open.
