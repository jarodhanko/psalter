# Psalter 327 — Comfort in Affliction / WILMOT

**Result: SATB notes and lyric underlay reviewed; ABCJS parse/render passed; audio remains PARTIAL.**
The eight-measure active SATB score was replaced from the two annotated photos.
The first five bars were independently read against page 282, and the final
three were critically read against page 283. A clean same-edition image was
used only to resolve overlapping pencil/printed noteheads, not to override the
annotated source. The four full stanzas remain as `W:`; photo-aligned lowercase
`w:` underlay is now present for all four stanzas.

- **Photo 276:** local source evidence (not distributed)
  (printed page 282). No. 327 starts below the completed No. 326 system. The
  first complete WILMOT system and the opening of its continuation are visible.
- **Photo 277:** local source evidence (not distributed)
  (printed page 283). The remaining WILMOT system ends at its double bar and
  `[Part VII]`; No. 328 / HOBART starts below it. The source block's two-photo
  attribution is appropriate and the neighboring settings are not part of 327.
- **Identity and format:** the page reads *Comfort in Affliction*, Psalm 119,
  `8s and 7s`, tune WILMOT, `Arranged from von Weber`, two-flat key signature,
  and 4/4. The original block had `K:F` (one flat); the photographed signature
  is B-flat major, now corrected to `K:Bb`.
- **Music correction:** the former score began with a soprano `C4` half note
  and repeated invented material for 24 bars. The photo begins on B-flat4 as
  a quarter note (`B2` with `L:1/8`) and contains eight complete 4/4 bars.
  All four voices now use those eight photographed bars. The final bar is
  soprano C5–A4–B-flat4, alto E-flat4–E-flat4–D4, tenor A3–C4–B-flat3,
  and bass F3–F3–B-flat2 (quarters, quarters, halves).
- **Stanzas and underlay:** the photos show four numbered text lines carried
  through the cross-page setting. All four `W:` fields are preserved. The
  lowercase `w:` underlay follows the photographed syllables and melismas for
  each stanza, split at the three printed system breaks. The stanza numbers
  printed at the first system are encoded on its first four `w:` rows; the
  viewer's underlay model maps the next two unnumbered system groups to those
  same four stanzas. A targeted photo recheck corrected stanza 2's final
  system continuation to “former judgments” after system 2's “Thinking on
  Thy”; it had incorrectly repeated “commands I cleave.” The final system's
  endings align through “me,” “receive,” “song,” and “tried.” ABCJS parsed one
  tune without warnings and rendered its SVG; a focused test now checks every
  lyric slot across all three systems and confirms the complete `W:` text
  matches the underlay.
- **Notice and rights:** page 282 prints “Copyright, 1901, by United
  Presbyterian Board of Publication. Used by permission” beneath the completed
  No. 326 and before the No. 327 heading. The location does not establish that
  this notice applies to No. 327; page 283 shows no corresponding notice beneath
  327. No. 327 has no `N:` rights notice in the ABC block or the current
  printed-notice inventory. The separate attribution “Arranged from von Weber”
  is retained. This is source-location triage, not a legal clearance.
- **Remaining checks:** audition playback on a physical device and compare the
  complete engraving with the photo at several score-size settings. The first system is especially softened by perspective
  and pencil marks; the lyric columns and syllable breaks were checked against
  the annotated photo, with no uncertain underlay positions inserted. The
  browser-free ABCJS render check does not certify audible playback.

## Production mobile-width rendering — 2026-09-28

The deployed production page for `?number=327` was opened in headless Edge with
Chrome DevTools mobile metrics set to a real 390-pixel CSS viewport. The page
and score canvas both had no horizontal overflow (`document.scrollWidth =
innerWidth = 390`; score canvas `clientWidth = scrollWidth = 367`). ABCJS
rendered all 132 note elements into seven responsive SVG systems; each SVG's
measured width was about 362 pixels inside the 367-pixel canvas. A browser
screenshot showed the opening systems and all four printed stanza rows legibly
on the phone-width score, without visible clipping. Evidence and the diagnostic
script are in ignored repo local source evidence (not distributed). The browser's bare
`--window-size=390` screenshot was *not* used for approval because Edge imposed
a 518-pixel minimum layout width; explicit mobile emulation corrected that.
This is a browser layout check, not physical-device, full-photo visual, or
audible playback approval.

Working first- and second-system event ledgers are under ignored
local source evidence (not distributed) and `327-system2-review.md`; a
separate final-system review and independent close reading supplied the last
three bars. No. 326 and No. 328 were not edited as part of this correction.
