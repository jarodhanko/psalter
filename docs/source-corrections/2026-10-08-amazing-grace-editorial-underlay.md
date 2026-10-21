# Amazing Grace: editorial alignment of verses 6 and 7

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](../release-checklist.md) for release preparation.


## Scope and evidence

The installed Open Hymnal edition is `hymn-oh_amazing-grace-new-britain`, shared by the two hymnbooks. Its canonical ABC SHA-256 remains `9d108a45a1c98d91bbc09e711861d54c16d0be30758615ae5fd463d06201d558`.

The pinned [Open Hymnal ABC](https://raw.githubusercontent.com/mzealey/openhymnal/d35811b2d5c9b0bbc5887d60a2936454815416e8/Complete/Amazing_Grace/Amazing_Grace-New_Britain.abc) contains five note-aligned verses and two prose stanzas. Its text, notes and public-domain attribution are retained unchanged. The new placement is editorial, not recovered printed underlay from that edition.

The added stanzas retain the installed text exactly:

> 6. The earth shall soon dissolve like snow,
> The sun forbear to shine;
> But God, Who called me here below,
> Shall be forever mine.
>
> 7. When we've been there ten thousand years,
> Bright shining as the sun,
> We've no less days to sing God's praise
> Than when we'd first begun.

The report's [Hymnary link](https://hymnary.org/hymn/MHTB1917/56a) identifies *All hail the power of Jesus' name*, MILES' LANE. It is not evidence for Amazing Grace.

The [Timeless Truths score](https://library.timelesstruths.org/library/music/A/Amazing_Grace/Amazing_Grace.pdf) visibly prints the seventh stanza as its verse 4. Its [MusicXML](https://library.timelesstruths.org/library/music/A/Amazing_Grace/Amazing_Grace.xml) confirms the same 35 melody pitches after collapsing two ties in the installed edition. The only duration differences are the second and fourth phrase endings: two beats in this comparison source, five beats in the installed edition. The installed holds remain unchanged. Its footer labels text and music public domain; its [lyrics page](https://library.timelesstruths.org/music/Amazing_Grace/) does likewise. The installed source's existing U.S. rights scope remains the distribution basis, with no new worldwide claim. Timeless Truths says “Will” in stanza 6; that wording is not imported.

## Editorial rule

All five existing verses have exactly the same 28 syllable-bearing carriers among 37 soprano noteheads. Both additional verses have the source's 8.6.8.6 meter. Align their successive syllables to those same carriers, keeping the same skips, melismas and two tied phrase endings. No melody, harmony, rhythm, slur, tie, tempo, or existing lyric is changed.

The result is determinate under this rule. The prose source does not itself prescribe a unique historical underlay for verse 6. Syllabification is `dis-solve`, `for-bear`, `be-low`, `for-ev-er`; verse 7 uses `thou-sand`, `shin-ing`, `be-gun`. The nine non-syllabic notehead indexes are 3, 12, 16, 19, 21, 25, 27, 32 and 36 (zero-based). Applying their existing continuations introduces no alternative stress or melisma choice within the adopted rule.

The three existing soprano segments gain these rows, after their original five rows:

```abc
w: 6.~The earth shall * soon dis- solve like snow, The
w: 7.~When we've been * there ten thou- sand years, Bright

w: sun for- * bear to shine; * But God, * Who * called me
w: shin- ing * as the sun, * We've no * less * days to

w: here * be- * low, Shall be for- * ev- er mine. *
w: sing * God's * praise Than when we'd * first be- gun. *
```

## Implementation contract

- Qualify the entire original ABC and exact song ID before adding rows. Any changed source, including new line endings, receives no editorial projection.
- Apply the projection only to presentation. Keep canonical ABC, source hashes, edition metadata, source prose and playback unchanged.
- Use the existing generic stanza identity, grouping, selected-part transfer, print selection and current-export paths. The regular seven-row vector needs no special stanza-role witness or playback exemption.
- Read the transcript from the original source, which already has exactly seven stanzas. Strip its W: prose from the notation canvas as before; do not reconstruct a nine-stanza transcript from the projected ABC.
- Identify the alignment as editorial in the viewer/print and current-export metadata. Make the byte-preserved original ABC downloadable alongside the current view.

A separate source-bound helper is intentional: the existing complex reviewed-underlay path assumes the Psalter `T1` carrier in some viewer decisions and can disable note tracking. This simple imported hymn uses `S1V1`; its regular seven-row vector works through the existing ordinary pipeline without broadening those exceptions.

## Focused verification

`vitest run src/features/viewer/amazingGraceUnderlay.integration.test.tsx`: 9 tests passed. `tsc --noEmit`: passed.

Checks cover exact-source rejection; original recovery; preservation of all five lyric rows, all 135 noteheads, sounding events and MIDI; all 15 nonempty part combinations at grouping sizes 1 through 6; real ABCJS screen/print rendering at sizes 1, 5, 7 and music-only; selected printing of 6/7; current ABC export; seven-stanza transcript and print deduplication; editorial provenance visibility in booklet presentation with the real sharing/booklet stylesheets. SVG measurements in jsdom are mocked, so these are behavioral checks, not native-browser layout acceptance.

No full release gate/build, native UI QA, commit, push or deployment was run for this isolated candidate.
