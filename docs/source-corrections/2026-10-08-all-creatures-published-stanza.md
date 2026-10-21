# All Creatures: published fourth-stanza variant

## Scope and source identity

The installed song remains `hymn-oh_all-creatures-of-our-god-and-king-lasst-uns-erfreuen`, the Open Hymnal musical setting of LASST UNS ERFREUEN. Its canonical ABC SHA-256 remains `cc0979466a1d1e13b0ba1a845b65ee003c156ef53e21aac5c8685a801d96c4fc`. Original source files, metadata, catalog IDs, memberships, curation, and source-hash attribution remain intact and recoverable.

Only stanza 4's three dedicated lyric rows are projected to the user-approved published variant from *Lift Up Your Hearts: Psalms, Hymns, and Spiritual Songs* (Faith Alive Christian Resources, 2013), no. 551. This is a mixed text/setting presentation: the Open Hymnal music and other stanzas are retained. It is not presented as the complete LUYH edition.

The selected text is:

> Earth ever fertile, day by day
> bring forth your blessings on our way;
> alleluia, alleluia!
> All flowers and fruits that in you grow,
> let them his glory also show:
> O praise him, O praise him,
> alleluia, alleluia, alleluia!

The existing common closing responses are printed once and sung with each stanza. They retain Open Hymnal capitalization and punctuation. Their words and music are identical in substance to the published alternative; they are not duplicated or rewritten for this narrow change. All other underlay and text-only stanzas remain byte-identical.

## Published evidence checked on 8 October 2026

- The [LUYH publisher song record](https://liftupyourheartshymnal.org/songs/all-creatures-our-god-and-king) identifies hymn 551, the altered Draper words, LASST UNS ERFREUEN, and the Vaughan Williams musical attribution. It labels the words and music public domain and permits projection/reprinting without a permission request. That is the edition-specific rights basis for the altered stanza.
- The publisher links to [Hymnary's LUYH 2013 no. 551 record](https://www.hymnary.org/hymn/LUYH2013/551), whose stanza 4 supplies the selected text but has the transcription error “let the his.”
- [Psalter Hymnal (Gray), no. 431](https://hymnary.org/hymn/PsH/431) supplies “let them his,” with the same stanza.
- The [First Christian Reformed Church bulletin of 11 June 2017, PDF page 2](https://firstcrcmv.com/wp-content/uploads/2015/08/June-11-2017-Bulletin.pdf#page=2) explicitly labels the hymn LUYH #551 and prints the same stanza with “them.” Its text/music credit says public domain. It corroborates the edition and corrected word, not a separate rights opinion. The page text was checked; the page-image tool failed, so no printed-score or visual-page claim is made.
- The [publisher's public-domain guidance](https://liftupyourheartshymnal.org/what-pd) is linked with the presentation provenance. The retained source's U.S. scope is preserved; no worldwide clearance or protected modern arrangement is claimed.

## Underlay and preservation

The exact original song ID and every original ABC byte are required before projection. Any source change receives no variant; the helper is not a general string-replacement policy.

The first two content phrases each have eight syllables. `Earth ev-er fer-tile, day by day` and `bring forth your bless-ings on our way;` use the existing sixteen consecutive carriers. `Flowers` remains one syllable, as in the source. The replacement first `al-le-lu-ia` uses all four existing d–c–B–A attacks (quarter, quarter, half, half in the source's default quarter-note unit); it must not retain the skipped second attack of `O * praise Him!`. This matches stanza 1's existing four-syllable response placement. The second alleluia and following content phrases keep their original carrier positions.

No note, harmony, rhythm, tie, slur, bar, meter, key, tempo, voice, source directive, shared closing refrain or other stanza changes. The original ambiguity of the source's five-row passages followed by a one-row shared refrain remains; this work does not introduce stanza grouping or a new source-row classification.

The viewer and print notation consume the variant projection; the accessible transcript is rebuilt from that same projection. A visible print/booklet-safe note below the score and transcript names the text and musical setting. Detailed source links and rights sit with attribution. Current ABC export contains the projected lyrics and separate published-variant metadata, explicitly scoping original provenance to the retained Open Hymnal source setting. A full original ABC download remains byte-preserved. Playback continues to receive canonical ABC.

## Verification

Focused integration checks cover exact-source rejection, only three changed source rows, all other lyric rows, phrase carriers and stress positions, all note events, all fifteen nonempty part selections, audio and MIDI identity, screen/print/current ABC export, original source recovery, unchanged transcript entries outside stanza 4, music-only transcript, and visible booklet attribution.

Focused All Creatures tests (7) plus Amazing Grace regression tests (9): 16 passed. TypeScript `tsc --noEmit`: passed.

The tests use real ABCJS parsing and rendering with mocked SVG measurements in jsdom. Native-browser visual acceptance and the full release gate are separate integration responsibilities. This isolated candidate performs no build, remote-ref mutation, commit, push or deployment.
