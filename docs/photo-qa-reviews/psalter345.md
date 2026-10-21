# Psalter 345 lyric attachment review — partial

## Full printed-score recheck and final soprano correction — 2026-09-27

The owner's report of missing notes at the closing “He will keep” phrase prompted a fresh event-by-event comparison of all 24 written bars in all four parts with the owner photo of printed p. 295 and the high-resolution same-edition scan. The final system's bar 21 has soprano **B4 half–B4 quarter**, not G4–G4. The upper noteheads lie on the middle treble line (B4); the alto noteheads beneath them lie on G4. Handwritten G labels above those notes are wrong and caused the earlier soprano correction to be mistaken. Canonical S bar 21 is restored to `B4 B2`, and the repeat-aware lyric map's source guard was updated so both stanza passes stay attached.

This restores the missing upper chord tones on stanza 2's “He will” (stanza 1's “Slum-bers”). The next bar's `d4 G2` begins “keep.” No attacks or beats were absent; the two written notes were at the wrong pitches. The full SATB recheck found no other pitch, octave, duration, accidental, or event-count contradiction. An independent reviewer confirmed the B4–B4 soprano correction and the printed final tenor `D4 D2 | B,4 B,2 | (A,3 B,1) C2 | B,6`. The eight-bar written repeat remains and yields 32 sounded bars. Live audible device QA remains open. Earlier sections below asserting that printed soprano bar 21 is G4–G4 are superseded.

## Tenor playback-path trace — 2026-09-27

The canonical generated ABC and the viewer both order this setting's voices S, A, T, B. ABCJS's sequencer numbers those parts 0–3 in the same order, so the viewer's `voicesOff` selection targets tenor as voice 2. MIDI extraction from the canonical score gives the tenor 62 note-ons, including the eight-bar repeat, with pitches G3, A3, B3, C4, and D4, matching the printed part. Muting voice 2 removes that channel; muting the others leaves it. The repeat-aware lyric map changes only temporary soprano `w:` rows for display and does not change the full tune used for synthesis. This rules out a demonstrated ABC tenor, repeat, or voice-index mismatch but is not audible QA on the affected device. Its reported wrong playback remains open.

## Recheck of reported tenor error — 2026-09-27

A second read-only comparison against owner photo 289 and the clean page-295 engraving found no difference in the 24 written tenor bars' pitch, octave, or duration. The bar-8 repeat correctly makes 32 sounded bars. Both full `W:` stanzas remain present, with their alternate repeat-pass words supplied by the viewer's separate alignment map. This narrows but does not resolve the reported deployed tenor-audio error: synthesized sound, selected-track behavior, client cache, and mobile playback have not been audibly verified on the affected device. Do not treat the static score comparison as a playback pass.

## Independent tenor score-to-MIDI review — 2026-09-27

An independent read-only comparison of all 24 printed GUIDE tenor bars found the canonical ABC to match the printed noteheads, octave, and durations. The 24-bar pattern is: B3/B3, B3/B3, D4–C4–B3, D4; D4/D4, B3/B3, A3–B3–C4, B3; A3/A3, G3/G3, D4/D4, D4; B3/B3, D4/D4, D4/D4, D4; then bars 17–24 repeat the opening eight-bar pitch pattern. The three-note figures are dotted-quarter/eighth/quarter, paired notes are half/quarter, and single notes are dotted-half. ABCJS binary MIDI extraction likewise produced the same tenor pitches/durations: 62 note-ons, comprising 46 written events plus the repeated first eight bars. This is strong evidence against a tenor transcription or ABCJS MIDI-extraction mismatch, but it does **not** resolve the reported wrong sound on the deployed app. Live device track selection, synthesizer behavior, playback position, and cached-client state still need audible reproduction; no score change was made from this review.

## Targeted pitch correction — 2026-09-26

The printed tenor has D4–D4 in bars 5 and 21 and B3–B3 in bars 6 and 22, replacing the source's C4–C4 and C4–B3 at those positions. The final printed soprano phrase begins G4–G4 in bar 21, not B4–B4. These specific notes were corrected after a full 24-bar tenor comparison; an initially suggested wholesale octave shift was rejected because it misread standard ABC octave notation. The two printed verses remain complete `W:` transcripts. Their `w:` attachment is still unresolved, especially the repeated opening and the second stanza, which the edition prints below rather than beneath the score.

- Authority: annotated photo local source evidence (not distributed), printed page 295. Photo 289 contains the complete GUIDE setting and its two printed stanzas; photo 290 begins Psalter 346.
- The candidate `w:` rows were not aligned reliably: ABCJS attached no lyrics to the first two soprano source lines and only 14 lyric-bearing events to the third (17 events). The three soprano lines contain 17, 16, and 17 events, while each complete printed stanza has 56 syllables across its eight short lines. No exact event-level mapping was approved.
- Removed the partial `w:` attachment and preserved the two complete stanzas as readable, numbered `W:` text. The source photo confirms the words; this review does not certify the candidate pitches or lyric-to-note events.

Status: partial; lyric text retained, note-level transcription and underlay remain unverified.

## Repeat-pass underlay review — 2026-09-27

The engraved owner photo and the clean same-edition scan confirm the same lyric layout. The first printed music system is the opening eight-bar passage, written in the ABC source as two soprano lines of eight note events each and ending in a repeat. Under that single printed system, stanza 1 has four short text lines: “To the hills … eyes” / “Whence shall help … arise?” on the first pass, then “From the Lord … aid” / “Who the heav'n … made” on the repeat pass. Stanza 2 supplies the corresponding four alternate lines below the score: “Thy protector … Lord” / “Shade for thee … afford” / “Neither sun … smite” / “God shall guard … night.” The second and third printed music systems carry lines 5–6 and 7–8 respectively for both stanzas.

Pinned Node v24.19.0 `tools/inspect-underlay.mjs psalter345` reports six ABCJS soprano source lines with 8, 8, 8, 7, 8, and 8 note events. On each of the first two source lines, the slurred second note is a continuation, leaving seven lyric anchors per line: 14 syllables for the first two text lines on one pass. The printed repeat reuses those same 16 written note events for the next two text lines, and again for stanza 2. ABC `w:` attaches lyrics to written events once; it does not expand the repeat or provide pass-specific alternate lyrics within one stanza row. Assigning only one pass would omit two printed lines per stanza, while attaching both passes to the same written events would need the music explicitly unrolled or a separate lyric layer with repeat-pass support. Neither is present in the source, so no `w:` was added. Both complete, verified stanza transcripts remain visible as `W:` text.

Status: underlay blocked by repeat-pass representation; stanza wording is verified, but no note-level `w:` placement is claimed.

## Repeat-aware viewer underlay — 2026-09-27

The viewer now supplies a separate Psalter 345 alignment map keyed by soprano written note event, stanza, and repeat pass. It leaves the canonical ABC and both complete `W:` stanzas intact. Temporary `w:` rows place the first two text lines of each stanza on the first traversal of bars 1–8 and the next two lines on their repeated traversal. The remaining four lines of each stanza attach to bars 9–24. The slurred second note in each pair is an explicit lyric skip. A source-line guard disables the map if the soprano transcription changes.

The mapping was compared with the owner photograph and high-resolution same-edition scan across all three printed systems. ABCJS parsed the generated full and single-stanza scores with six soprano source segments, 8/8/8/7/8/8 events, all intended lyric slots, and no warnings. Browser review showed both stanzas on the desktop score and readable reflow at a 390-pixel viewport after repeat-score spacing was increased. When the soprano is hidden, lyrics remain available as the full transcript instead of being transferred to an unverified part. Selected print verses use only their mapped rows and omit the duplicate transcript when the soprano is visible.

This closes the repeat-pass representation gap for this setting. It does not replace the outstanding independent SATB music audit and audible QA.

## Printed-score correction — 2026-09-24

The previous candidate was substantially wrong as music, not merely misnamed: it encoded `K:D`, began the soprano on F-sharp, missed printed dotted-quarter/eighth figures, and assigned incorrect lower-voice pitches and octaves. The printed engraving on annotated photo 289 and the higher-resolution clean scan of the same printed 1912 page (`psalterwithrespo00unit_0305.jp2`, printed page 295) show one sharp, G major, and an opening soprano D. Handwritten pitch labels were used only as aids and never to override noteheads.

The canonical ABC was replaced with a 24-bar four-part transcription from the printed setting. It preserves the repeat at bar 8, the distinct heavy barline after bar 16, printed slurs over differing pitches, and the bass's lower G octave in bars 17–18. A separate reviewer checked the opening and bars 17–20 of the lower parts against the printed staff. A fresh desktop browser render shows the G-major score without clipping, and ABC validation reports zero warnings. The full 24-bar SATB sequence still requires an independent event-by-event second pass and audible QA before final Photo-QA approval. The two complete `W:` stanzas remain readable but note-aligned `w:` underlay is still open.
