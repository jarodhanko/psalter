# Battle Hymn: full harmony with retained text

On 2026-10-08, the stable `hymn-aperio-battle-hymn` edition was prepared for replacement with the CCEH four-part setting of BATTLE HYMN. The former edition supplied melody and anthology chord symbols. The replacement supplies four selectable editorial tracks in the original two-staff grouping, with no added harmony notes. Both book memberships, the existing first stanza and refrain, and all eight lyric fields remain unchanged. Wayfaring Stranger is outside this change.

## Sources and reuse

Music: [CCEH tune 000510](https://www.ccel.org/cceh/0005/x000510.htm), its [printed score](https://www.ccel.org/cceh/0005/000510a.pdf), and NWC source. The tune page identifies American folk song / William Steffe, 1852. The source does not identify its specific historical harmonizer or printed hymnal edition. Its two source staves do not name separate SATB parts; the four selectable tracks follow the treble upper/lower and bass upper/lower lines and receive conventional editorial Soprano, Alto, Tenor and Bass labels.

The score declares public domain. [CCEH's reuse statement](https://www.ccel.org/cceh/cceh_cpr.htm) permits modification, redistribution, publication and performance of its score files. This is the archive's explicit reuse basis; it does not independently establish the history of this particular harmonization. CCEH cautions that copyright rules vary by country. No blanket worldwide or recording-specific arrangement clearance is claimed.

Text: only the previously retained first stanza and refrain by Julia Ward Howe from [The Public Domain Song Anthology](https://upload.wikimedia.org/wikipedia/commons/c/cc/The_Public_Domain_Song_Anthology_with_Modern_and_Traditional_Harmonization.pdf#page=58), David Berger and Chuck Israels, 2020, printed page 38 / PDF page 58. The anthology asserts US public-domain status for underlying works and dedicates new contributions under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). CCEH has no lyrics; this replacement is explicitly a composite edition. No further stanzas or alternative words have been introduced.

Source file identities:

- CCEH PDF: `cf56f9667a724a21a5fbfe2371cade54336aa8ae6f1b70e72131bf686d0fb6d1`
- CCEH NWC: `3d2d5591ae6c8cc55bbb5ae62bc331188c6720d201c79bdab3c3620eb0267952`
- Prior anthology ABC: `6c111a2701c7f6cf9e454fb7027a601d236c8c6325c3ec8b7c062f3265fc06fe`
- Replacement ABC: `cd460169b67dc0706a7e228e20cbfc58d6920e7148af286464ee26fb7baac9cb`

The prior melody-only edition is identified by source SHA-256 `6c111a2701c7f6cf9e454fb7027a601d236c8c6325c3ec8b7c062f3265fc06fe`. The stable historical source ID is retained for membership, links and saved-selection compatibility; its `aperio` prefix does not identify the replacement music publisher.

## Musical differences and source review

All 81 written melody pitches match the prior G-major melody after transposition up three semitones to B-flat. The source faithfully retains its quarter=120 tempo, two untied pickup notes, whole-note verse cadence, half-note endings on the first two refrain “-jah” syllables, and a three-quarter final bar without the old trailing quarter rest. It lasts 64 quarters. The old anthology chord symbols describe a different harmony and have been removed.

The pickup is measure 0, verse bars are 1–8, and refrain bars are 9–16. Each of the four tracks contains 81 events and 64 quarters. There are 324 logical note members and six shared bass-staff B-flat3 unisons: m2 events 1–2, m6 events 1–2, and the first events of m10 and m14. Those unisons remain separately selectable and audible. Distinct graphical pitch positions number 318 when the shared heads are collapsed.

A bounded music21 9.9.1 extraction consumed all 7,794 decompressed bytes of the pinned NWC 1.70 file. The standard importer required source-specific framing corrections for font records, staff headers and chord-member counts. A separate reviewer then checked every bar and all four lines against the actual PDF pixels and independently decoded the binary using Python's standard library without the music21 reader. All 324 members matched. The regression fixture records that independent printed pitch/duration inventory.

All eight prior lyric fields are byte-identical and all 81 pitched-event syllable/divider labels are unchanged. “Mine” spans the two untied pickup attacks; adding the anthology tie back would alter the selected music. The five existing default lyric-exclusion policies remain byte-identical, and none applies to this first-stanza-only Battle edition.

## App behavior and qualification

This source uses ordinary ABC voices and the shared rendering, selection, playback and print paths; no Battle-specific engraving adapter is added. Regression checks cover the complete source event inventory, shared unisons, unchanged lyrics, both memberships, composite provenance, solo and combined voice selection, playback muting, print preparation and current ABC export. Native browser appearance, note interaction and actual playback are separate release-owner checks.

The prior one-voice PWA update snapshot had no record of the available voices. A narrowly bound migration expands only a legacy snapshot with selected indexes `[0]`, no `voiceSelection` witness, the exact stable Battle ID, the exact replacement source hash and the four expected IDs `1,2,3,4`. Every other selection and song is preserved. New snapshots include `{ version: 1, sourceSha256, available }`; present or malformed witnesses forbid the legacy inference, so a new explicit melody-only choice survives future updates. Portable saved/share selections use explicit IDs and do not pass through this migration.

Original package `STATUS.json` and `INTEGRITY.json` retain their dated archive-review evidence, including the old source hashes. Current installed source identity is governed by `selected_editions.json`, `SHA256SUMS.json` and the read-only hymn-generation gate; the historical collection audit is not presented as a new check of this replacement.
