# Poor Wayfaring Stranger: sourced SATB with retained text

Prepared 2026-10-17. The stable `hymn-aperio-wayfaring-stranger` edition now uses Kenan Schaefkofer's 2021 Hymn Singer arrangement. The historical source ID, H061/B056 memberships, original catalog records, and recording relationships remain unchanged. The `aperio` prefix is a stable identifier, not the publisher of the new music.

## Sources and reuse

Music: the [official Hymn Singer song page](https://hymnsinger.com/listing/i-am-a-poor-wayfaring), its [specific printed score](https://hymnsinger.com/local-lilypond-outputs/i-am-a-poor-wayfaring-trad.pdf), and the immutable [SATB LilyPond source](https://github.com/kenakofer/hymnsinger/blob/0ac62b6560fb86f44dfa5a04417b445af1f68804/lilypond/shared-tunes/wayfaring-stranger.ily). The [song source](https://github.com/kenakofer/hymnsinger/blob/0ac62b6560fb86f44dfa5a04417b445af1f68804/lilypond/songs/i-am-a-poor-wayfaring/i-am-a-poor-wayfaring.ly) confirms the arrangement and source stanza choices. The source identifies American traditional music and names Kenan Schaefkofer as arranger, 2021.

The specific score's footer dedicates Schaefkofer's copyright and related rights in the work to the public domain to the extent possible under law. This is an explicit owner dedication supporting reuse and adaptation. It is **not described as a formal CC0 license**: a CC0 legal-instrument link for the arrangement has not been established. No blanket worldwide or recording-specific arrangement clearance is claimed.

Text: only the previously selected stanza and refrain from [The Public Domain Song Anthology](https://upload.wikimedia.org/wikipedia/commons/c/cc/The_Public_Domain_Song_Anthology_with_Modern_and_Traditional_Harmonization.pdf#page=364), David Berger and Chuck Israels, 2020, printed page 344 / PDF page 364. The anthology asserts US public-domain status for underlying works and dedicates new contributions under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). That separate text-source provenance is retained. This is an explicitly credited composite edition with editorial lyric underlay, not the anthology's printed SATB or an unmodified Hymn Singer facsimile.

The always-visible CC0 link is labeled “Retained anthology text: CC0 1.0.” Its scoped notice is retained in the selected source record, rights notices and export metadata; this composite edition has no unqualified `licenseUrls` entry. The existing source generator keeps the full notice as prose rather than flattening it into a whole-edition license URL. The viewer recognizes only that exact notice and renders the fixed CC0 link; other rights notices and license links keep their existing presentation.

Pinned identities:

- Hymn Singer PDF: `2ce058774a62294e4fd09d3b3c6d1649dcd2727199a5c8b00d35596e6564ba32`
- SATB LilyPond: `623212ce7a63aa5c0306ec1b523850508c91b7fa1056f9dd6dddd352058a6973`
- Song LilyPond: `9ae40cb24d3469df95fb64d0fd8e65dba83a1e226e62b6ca8a365a9e4fd4ed30`
- Upstream source commit: `0ac62b6560fb86f44dfa5a04417b445af1f68804`
- Prior anthology ABC: `1bc409cc72ca798d278afacdd907a45f0e5a22abcfe655ae805a05c20a5504f8`
- Replacement ABC: `b299d63e35824dc23a42b12e6a468ec02afe0a643724607607e5c7b0a3a7bc98`

Original `STATUS.json` and `INTEGRITY.json` remain dated archive evidence; current source identity is recorded in `selected_editions.json`, `SHA256SUMS.json`, the notation module and edition metadata.

## Music and words

All four authored SATB parts are transposed uniformly by a major second from D minor to the app's existing E minor. The source's 2/2 meter, quarter-note tempo 130, 32 complete bars and 128-quarter duration remain. Every written pitch, duration, tie, slur, visible rest and invisible spacer is preserved. No silent voice is filled, chord symbol retained, or source system break forced.

Soprano and bass begin after the leading quarter rest, at quarter 1. Tenor enters at quarter 17 and alto at quarter 33. The opening shared unisons remain distinct selectable parts. Written heads number 78/58/68/77 for S/A/T/B (281 total); tie-merged attacks number 70/53/63/70 (256 total). There are 32 visible rests and 12 source spacers. Each part ends at quarter 128.

Compared with the old anthology melody, the source has several pitch variants, a low three-note pickup into the Jordan line, and two eighth-note ornaments on “more” and “to.” It retains the overall verse-and-refrain length but places the quarter rest at the beginning rather than the end. The tenor's source C-sharp half-note cadence becomes D-sharp in E minor; it is not changed to D-natural. The bass's “there” in bars 18–19 retains its half-note, tied half-to-quarter, and encompassing slur.

All 68 selected syllables, words, spelling, capitalization and punctuation remain unchanged, including “While journ-'ying,” “nor,” and “going.” Only the underlay continuation markers and phrase segmentation are adapted to the selected source; “more” and “to” each receive one extra eighth-note continuation. The clean transcript is identical. Source stanzas 2 and 3 are not imported.

## Shared lyric lane and part-only views

The canonical ABC keeps one shared soprano lyric lane, as in the printed source. The existing exact-source timing-witness mechanism supplies reviewed native lyric rows when soprano is hidden. It changes no musical token and does not create an engraving or width adapter.

The witness is lazy-loaded with the hymn edition and binds the complete pristine source. The existing prepared music-frame and complete ordered row-vector checks remain required. An optional explicit row-identity field identifies this unnumbered source without adding printed stanza numbers or enabling unguarded inference. The prepared-frame metadata filter includes `Z:` because the ordinary notation preparation removes that credit field. Existing witnesses without the optional identity retain their previous inference behavior.

Carrier priority is Soprano, Bass, Tenor, Alto. Soprano and bass sing from the first phrase, so any selection containing either keeps the whole sung text; tenor-only/alto-tenor selections begin with the tenor's second phrase, and alto-only begins with its third. Blank early rows remain blank. Native syllable counts are S68/A51/T59/B68. Alto's “fath-er” stays on its two half notes; it never gains a synthetic soprano-timed split. Tenor's “roam” stays on its slurred E4–D-sharp4 halves. Screen, print and prepared ABC export use the same existing source-timing path; playback still reads canonical music.

## PWA update selection

The prior melody-only edition writes a version-1 voice witness with the old ABC hash, available IDs `['1']`, and selected indexes `[0]`. Only that exact old-to-new Wayfaring combination expands to four selected parts after an approved ordinary update. New-source solo/subsets, empty selections, absent or malformed witnesses, other source hashes, and other songs retain their choices. Explicit portable saved/share voice IDs bypass this migration. Battle Hymn's existing migration function is left unchanged and invoked by the narrow wrapper.

## Quarter-note tempo compatibility

The replacement retains authored 2/2 notation while keeping the existing 40–180 control and saved tempo values in quarter-note beats per minute. The control, its accessible value text and the playing caption explicitly name that beat unit. No saved or portable numeric tempo is divided or rewritten.

One shared tempo policy requires the exact replacement ID and hash plus its admitted complete-source timing witness. Unknown, modified or unready sources use the existing natural-meter-beat behavior. For this exact edition, CreateSynth receives an outer `millisecondsPerMeasure` override calculated from `tune.millisecondsPerMeasure(tempo / 2)`. This preserves fractional half-note rates such as 52.5 at a displayed 105 quarter-note BPM; passing a fractional `qpm` alone would encounter the installed sequencer's integer conversion. The unchanged numeric `qpm` still supplies the event sequence, whose written durations remain unchanged because this exact source has no interior tempo changes.

Playback tracking and selected-note starts continue to read the synth's actual `millisecondsPerMeasure / meterSize` after priming; they apply no second tempo conversion. The same policy makes current ABC export and its metadata use `Q:1/4=value`, preserving the audible control pace. Original-source export remains byte-identical, including its source `Q:1/4=130`.

## Verification scope

The actual source PDF pixels were inspected before transcription. A bounded relative-LilyPond converter and separate independent source inventory agree on all 325 written events, including rests/spacers, 128 bar boundaries, pitches/registers, durations, ties and slur endpoints. The independent source inventory also agrees with the source MIDI's 256 tie-merged attacks. ABCJS 6.7.0 parses the candidate without warnings, and all 68 soprano syllable placements match the selected-word inventory. Reproducible conversion, source inventories and independent review are retained as release evidence outside the source checkout.

These are focused source-event and lyric inspections, not an automated test suite or a new corpus certification. Native browser layout, part selection, update restoration, note interaction, print and actual audio remain distinct release-owner acceptance steps. `npm run build:release` supplies TypeScript, production build and narrow release-integrity gates; any build ceiling change requires its separately measured evidence. No source correction alone certifies deployment.
