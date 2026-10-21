# Psalter 200 photo QA (partial)

## Extra-note audio cause — 2026-09-28

ABCJS interpreted the quoted `"CHORUS"` marking as a playable chord symbol and generated an extra accompaniment MIDI track of 64 attacks. The printed score has no such chord part. Changing the marking to `"^CHORUS"` keeps it as an above-staff text label and removes that track in an in-memory MIDI comparison, leaving the four printed voice tracks unchanged and producing no parser warnings. This is a confirmed cause of extra synthesized notes; audible confirmation on the affected device remains open. It does not certify the full SATB transcription.

User playback confirmation, 2026-09-28: after the production verification, the owner reported that no. 200 now "sounds good to me." The reported extra-note audio symptom is closed on that confirmation. This does not certify every SATB note against the printed score.

- Source: local source evidence (not distributed) (annotated photo 161), printed page 167.
- Boundary: “The Enthroned Christ,” Psalm 72, 6s and 5s; ST. GERTRUDE by Arthur S. Sullivan. Four stanzas and a chorus are underlaid across five systems; the page ends with `[Selected Stanzas]`. No additional text-only stanzas or continuation are visible.
- Rights/footer: no copyright or permission notice is visible for no.200; none was added.
- Text/music: all four stanza texts and the full chorus remain in `W:`; the exact final chorus line is additionally underlaid in its 11-event T1 line. SATB is unchanged; no forced `$` breaks were added.
- Structural parser check: ABCJS parsed five T1 lines with 16, 14, 18, 15, and 11 note events (74 total), with no reported warnings. The trial returned lyric counts 68, 45, 39, and 39 across its first four lyric slots, while the chorus’ unnumbered underlay was mixed into the first slot (which ended “be.”). The stanza endings expected are “King,” “sight,” “confessed,” and “proclaim”; the parsed slots instead ended “be,” “sight,” “fessed,” and “claim,” indicating chorus/stanza overlap and truncated word endings. The trial `w:` lines were removed.
- A subsequent source-photo boundary read confirms that the first three T1 lines are the four-stanza verse, while the final two T1 lines are a separately labeled CHORUS with its own complete underlay and closing double bar. The printed stanza text crosses the first three system boundaries; the chorus text is `Christ shall have do-min-ion O-ver land and sea, / Earth's re-mot-est re-gions Shall His em-pire be.` The final chorus line maps directly to the 11 events in T1 line 5 and is now underlaid. Other verse lines and the first chorus line remain unresolved because their note counts do not directly match the printed syllables and the exact melisma/skip slots are not yet established.
- Status: PARTIAL. Photo-grounded text is retained; full verse underlay and first chorus line remain unresolved. No full-note audit or rendered-score approval is claimed.

- Follow-up review: inspected the original 5136 KB photo at full resolution (local source evidence (not distributed)), not the contact sheet or generated ABC. The printed layout does separate the verse underlay (first three T1 systems) from the chorus (last two T1 systems), and the complete printed text is present in `W:`.
- Exact blocker: I cannot yet assign every syllable, skip, and sustained-vowel continuation to the individual T1 note events in all four verse rows or the first chorus line with sufficient certainty from this photographed page. The verse underlay is printed as four simultaneous rows across system breaks, while several multi-syllable words and melismatic note groups cross those breaks. A guessed `w:` token sequence could look plausible while shifting later words; only the exact final chorus line was added. No lyric regression test was added.
- Status remains PARTIAL. Preserve the existing notes and `W:` text until the remaining event-by-event map can be independently checked against the photo; no alignment beyond the final chorus line is approved by this review.

## First chorus line completed

- Re-examined the original annotated photo at full resolution (local source evidence (not distributed) is a repo-temp crop). In the first chorus system, the printed slur over soprano events 5–7 extends `min-` through two extra notes, the slur over events 8–9 extends `ion`, and the short beamed event 14 extends `and`. Events 10–12 carry `O-ver land`; event 15 carries `sea,`.
- Added the photographed first chorus `w:` row. Both chorus systems now have note-attached text, while the first three verse systems remain `W:`-only pending their separate event-level mapping. SATB notes and the complete transcript are unchanged.

## First verse system underlaid

- On the native-resolution photo, soprano events 5–6 form the printed slurred pair over one syllable in each of the four stanza rows: `min-`, `seek`, `ev-`, and `might-`. Event 6 extends that syllable; event 7 carries `ion`, `Him`, `er`, and `y`. The remaining first-system printed syllables align one-to-one with events 1–5 and 8–16.
- Added four first-system `w:` rows. Verse systems 2–3 remain `W:`-only; this does not claim complete verse underlay or full SATB QA.

## Second verse system underlaid

- In each of the four printed rows, the second note of the closing slurred `(A3/2 B/)` pair (soprano event 13) extends the preceding syllable: `hab-`, `save`, `ev-`, and `peo-`. The final event 14 carries `it`, `them`, `er`, and `ple`. Events 1–12 are one syllable apiece, as checked against the original annotated photo and a native-resolution crop.
- Added four second-system `w:` rows. Only verse system 3 remains without note-attached lyrics; SATB and full `W:` text are unchanged.

## Third verse system underlaid

- The annotated photo shows two slurred soprano pairs `(d c)` and `(B c)` in verse system 3. Their second notes (events 11 and 13) extend the syllables `trib-`/`ute`, `pre-`/`cious`, `hail`/`Him`, and `glo-`/`ry` across the four printed rows. Events 14–18 then carry the five closing syllables in each stanza. A separate photo read confirmed this mapping.
- Added all four third-system `w:` rows. All five music systems of no.200 now have photo-grounded note-attached lyrics (four verse rows, then two chorus lines), retaining `W:` and SATB. The historical partial notes above document the earlier uncertainty; full independent SATB and print/mobile comparison are still separate QA work.

## Clean-scan chorus comparison

- Compared the chorus directly against local source evidence (not distributed). In the first chorus system's second measure, the tenor sustains two half notes while the bass moves on four quarter-note attacks, G–C–G–C. The prior ABC `(G, C,) (G, C,)` also encoded four successive attacks: parentheses are slurs in ABC 2.1, not simultaneous chords. The first comparison incorrectly called them dyads; that diagnosis is withdrawn.
- The printed bass notes do not show those two slurs, so the B2 line now reads `G, C, G, C,` for articulation fidelity only. This does not remove or change any audio note event and does not resolve the reported extra-note playback. The remaining chorus noteheads and attacks across all four voices, including the final chorus system, agree with the clean scan on this focused comparison. Audible playback on the affected device and a full verse SATB audit remain open.
