# All Creatures shared-ending identities

The retained Open Hymnal 2005 setting prints five note-aligned stanzas, followed by one shared ending. Stanzas 6 and 7 appear only as prose. Grouped notation must preserve the complete shared ending with every actual stanza group, while selections consisting solely of text-only verses must not acquire refrain-only notation.

The presentation first passes the entire canonical ABC and song identity through `getPublishedStanzaVariant`. Only its already-approved result is segmented. This retains the published *Lift Up Your Hearts* 551 stanza 4, including its four-syllable early alleluia, and preserves the separate text-edition attribution. Canonical source, original download, playback and source-setting provenance remain unchanged.

## Primary sources and boundary

Freshly retrieved and compared on 8 October 2026:

- [Official score PDF](http://openhymnal.org/Pdf/All_Creatures_Of_Our_God_And_King-Lasst_Uns_Erfreuen.pdf), SHA-256 `5786125fdf2324fc51de064741d36b9b25ac2a66b4fa426b0b33c14f608d17fa`
- [Official ABC](http://openhymnal.org/Abc/All_Creatures_Of_Our_God_And_King-Lasst_Uns_Erfreuen.abc), SHA-256 `a1e0f7120ccfb20d61b51a46eb5373de40336ce630625942ed4dfb38ee7daacd`
- [Pinned upstream ABC](https://raw.githubusercontent.com/mzealey/openhymnal/d35811b2d5c9b0bbc5887d60a2936454815416e8/Complete/All_Creatures_Of_Our_God_And_King/All_Creatures_Of_Our_God_And_King-Lasst_Uns_Erfreuen.abc), SHA-256 `4b554afd606283cfa3793ddb06f51163cf603a23c5cd482385ab34e9737b4614`
- [Official expanded hymn text](http://openhymnal.org/Lyrics/All_Creatures_Of_Our_God_And_King-Lasst_Uns_Erfreuen.html), SHA-256 `d104d2e425eb2ffc2300cde756e2e5377303106a4bfa8f765e7a2956025dea6d`

The canonical ABC remains SHA-256 `cc0979466a1d1e13b0ba1a845b65ee003c156ef53e21aac5c8685a801d96c4fc`. The approved stanza projection has SHA-256 `aa6694036e13980ccd2867ff303d18501bcaf39645bb36723db251328a5aa191`. The source-reviewed q60 segmentation has SHA-256 `83a7611225fb2917bfa1c75e50c5d06a8de81c09abc886f2326bfca29e1c2cdf`.

The inspected PDF shows the five stanza-final words on the melody A4 in system 3. The shared first “O praise Him” starts at q60, melody attack 40, four quarters into logical unit 10. System 4 contains the second “O praise Him” and three final Alleluias. No event, slur or tie crosses q60. The primary expanded text supplies this entire ending to each of stanzas 1–5; it leaves 6–7 as prose.

The split adds no musical material or barline. It preserves all 261 attacks, 273 heads, 12 chordal attacks, 40 pitch slurs, no ties, the one bass beam group, 17 logical bar units, and all four voices' 96-quarter duration. Full per-event inventories were compared using absolute onsets and pitches rather than changed character offsets.

## Manifest and print selection

All 21 rows belong to S1V1:

- Segments 0–2 each contain the five original numbered stanza identities.
- Segment 3 contains the ordered five-row shared vector: `O * praise Him!`, followed by four complete four-slot spacer rows.
- Segment 4 contains the singleton shared continuation: `O * praise Him! A- lle- lu- ia! A- lle- lu- ia! A- lle- lu- ia!`.

Both shared segments require complete-vector validation. Each n-stanza group has 3n stanza rows and six shared rows. Existing row order, duplicate rejection, exact-text and selected-part transfer guards remain authoritative.

### Qualified parts and retained fallback

Grouping and selected notation are qualified only with All parts: the complete original S1V1, S1V2, S2V1 and S2V2 selection. All fourteen nonempty partial subsets, including solo Soprano, retain the existing unsplit published-variant screen, print and current-export path. The empty selection retains its existing text-only behavior. Full transcript and selected prose remain available. The display control offers only music-only or all current rows for partial selections and explains that verse grouping requires All parts. Saved grouping and print choices survive switching parts.

Native review qualified all-part grouping sizes 1–4 at 400 CSS pixels and 100%. Partial-part grouped layouts remain unqualified: Soprano with Alto showed an unresolved overflow, and some solo-Soprano profiles failed the existing source-geometry proof. The planner is not broadened to force acceptance.

The lower-only lyric limit also remains necessary: the six lower-only subsets containing Alto or Tenor choose one of those voices as the lyric recipient. Each has a chord at q78 sustained through q79, so the existing exact-onset/single-head guard rejects the q79 syllable and drops the final shared continuation. Bass-only retains the sung words, but its transfer, like every lower-only transfer, drops the four blank shared lanes. The complete-vector contract therefore does not qualify any lower-only subset. No notes, timing, transfer policy or guard were changed to force these cases through.

The legacy booklet safety check still rejects a partial selected-verse booklet when those parts' note-aligned underlay is ambiguous. Such a booklet requires all verses, or music-only with the selected transcript verses. This limitation is retained and tested rather than represented as a successful grouped booklet.

The exact-source manifest identifies W:6–7 as text-only. For qualified score lyrics, print selections intersect the five note-aligned stanza identities. The original selection still controls prose. Thus 6/7-only selections contain no score lyrics; a mixed 4+6 selection contains stanza 4 and its complete shared ending in notation plus stanza 6 prose. An ungrouped selection containing all 1–5 retains the unchanged, unsplit approved-variant notation even when 6 and/or 7 are selected too. Music-only and empty selections retain their existing behavior.

The underlay change does not enable the failed opening-join experiment, shrink typography, or relax physical-fit, lyric-clearance, ink-containment, settings or rollback guards. Focused parser/jsdom checks establish content and routing only. Native physical-size qualification and the release gate remain separate requirements.


## Requested size and complete-prose presentation

Native review of the grouped preview found a separate width-planning problem. A joined real-bar system could exceed the requested staff width, causing ABCJS to widen every responsive SVG in that group and reduce its physical staff size. At 400 CSS pixels and 100%, the nominal viewport was 418 units, but the five individual-stanza viewports ranged from 419.047 to 466.630 units. The musical events and shared rows were intact; the physical scale was inconsistent. Additional pair-group and selected-part captures showed the same mechanism.

The bounded correction retains ten deterministic source-selection witnesses: the distinct groups produced by grouping sizes 1–4 with all four original parts. The seventy earlier partial-part bindings are removed. Each complete prepared string and its exact TuneBook parser string is bound independently. These are byte/provenance witnesses; native layout acceptance is still mandatory. Only an active profile is parsed for its cached expected identity; unrelated hymns keep their prior source-memo path.

For a qualifying grouped screen, the transaction identifies the first native width expansion and requires that every earlier system fit the requested budget. The expanded system must comprise multiple complete real bars and must explain the enlarged viewport. Only that system is divided at its existing real barlines. It never joins systems, splits at the q60 underlay boundary, changes a note, reduces fonts, changes the requested staff width, or edits a horizontal viewport into compliance.

Acceptance requires the complete selected musical identity, all lyric/spacer slots, tempo, per-voice beam positions and source slur endpoints; unchanged formatting and padding; restoration of the nominal staff and notehead scale; the existing six-unit lyric-clearance and ink-containment proof; unchanged native typography controls; and the exact expected slur-path count. A failed proof restores the original nodes and listeners. That runtime fallback does not qualify an introduced size regression for release. Native review decides which layouts are qualified, including other widths and size settings.

The source- and All-parts-qualified 21-row witness also establishes that all five numbered stanzas have complete underlay. The singleton shared continuation must not be interpreted as evidence that only stanza 1 is complete. Grouped screen and notation print now suppress duplicate numbered prose for stanzas 1–5; selected W:6–7 and the existing unnumbered shared-text rules remain. Music-only retains selected prose, and every partial-part fallback and the existing booklet rejection rules remain unchanged.
