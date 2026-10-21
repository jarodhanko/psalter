# Psalter 363 photo review — PASS

## Ending triage — 2026-09-27

The current underlay inspector still shows 33 soprano source events but only 30 lyric slots per stanza: each final word lands on event 30, leaving events 31–33 unassigned. The clean same-edition score (local source evidence (not distributed)) shows the final word at the terminal sustained note. This is a specific warning that the ending needs note-by-note SATB and underlay reconciliation; a full printed-to-ABC event mapping was not established in this triage, so neither the music nor the lyrics were changed.

## Confirmed review leads — 2026-09-30

### Resolved first printed system ledger

The independent upper-voice review and primary lower-voice staff-coordinate reading establish the following first-system replacement ledger under `L:1/8`, `K:Bb`. This is review evidence only: canonical ABC has not yet been replaced, because the second system remains under review.

```abc
[V:S] F2 G2 | G3 F | F2 B2 | B2 A z | B2 G2 | F2 F G | A2 G c | (c2 !fermata!F2) |
[V:A] D2 D2 | E3 E | F2 F2 | E2 E z | D2 E2 | F2 F G | F2 =E2 | !fermata!_E4 |
[V:T] F,2 B,2 | A,3 A, | B,2 D2 | C2 C z | B,2 B,2 | B,2 =B,2 | C2 _B,2 | !fermata!A,4 |
[V:B] B,,2 B,,2 | C,3 C, | D,2 B,,2 | F,2 F, z | G,2 E,2 | D,2 D,2 | C,2 C,2 | !fermata!F,4 |
```

The tenor natural in bar 6 changes B-flat3 to B-natural3, and the bar 7 flat restores B-flat3 after C4. The fermata lower-staff chord has two open heads A3/F3, not three heads; the apparent middle oval in an overview is an outline/line intersection. The first soprano phrase has 18 attacks for 15 syllables with two extensions after “Thy” and one after “ear”: `From the depths do I in-voke Thee Lord to me in-cline Thy _ _ ear _`. The eighth rest in bar 4 is not a lyric attack. The older tenor report's quarter-note C and absent rest in bar 4, repeated B-flat in bar 6, and A3 readings in bar 7 were rejected by the primary coordinate check. Overall status remains PARTIAL.

The ongoing independent rederivation confirms that the printed soprano has melismatic attacks: 33 noteheads versus 30 syllables is not, by itself, an extra-note defect. The current underlay still needs explicit extension placement so later words land on their printed notes. The printed opening soprano is F4–G4, not the current F4–F4. The final chord is a shared half note: soprano F4, alto D4, tenor B3, bass B2. A separate octave error affects the canonical bass stream: its opening `B,` means B3, while print requires B2 (`B,,`). No provisional replacement stream has been applied; the full rederivation remains open.

A separate printed-notehead check identifies a terminal half-note chord (soprano F4, alto D4), with the final syllables “hear,” “command,” “Lord,” “light,” and “found” beneath it. Canonical S/A currently encode two quarter-note attacks there. The start of the second printed system also rises F4 to G4, conflicting with the repeated F4 in the existing melody. A full independent SATB rederivation is underway before any canonical replacement; this remains PARTIAL.

- Authority and boundary: local source evidence (not distributed), printed page 310. No. 363 is complete in the upper two systems, including terminal double bar; no. 364 begins separately below. Photo 303/page 309 ends no. 362 and photo 305/page 311 begins no. 365. The no.363 heading reads “Waiting Upon God,” Psalm 130, 8s and 7s, EVENING PRAYER, George C. Stebbins.
- Compared all five underlays with the annotated photo. Text and hyphenation agree; corrected stanza 3 punctuation to “And my hope is in His word, In His word of promise given;”. Added printed page 310 to `N:`. The footer is transcribed exactly in `W:`: “Copyright, 1906, by George C. Stebbins. Renewal. Used by per.” Existing SATB music was preserved.
- Structural ABCJS parse: one tune, no warnings, 33 soprano note events and 30 lyric assignments per stanza. The final three events have no lyric assignment in every stanza (30 assigned / 3 unassigned per verse; 150 / 15 overall). Their visual treatment is unresolved: the source underlay text ends on the final word, but this review did not verify whether the three remaining events are melisma/extensions or should remain unassigned. Do not treat parser counts as proof of note-level alignment.
- Status: PARTIAL. Independent wording/metadata/footer comparison is complete, but exact handling of the final three lyric events and fresh-render alignment still need confirmation before overall approval.

## Full replacement and final approval — 2026-09-30

The primary reviewer rederived both printed systems against the clean score and owner photo, reconciling the independent upper-voice review and lower-voice staff-coordinate readings. The complete canonical SATB replacement restores the printed opening F4–G4, both eighth rests, natural/flat alterations, bass octaves and contours, slurs, the first-system fermata chord and final F4/D4/B3/B2 half-note chord. The alto first-system fermata is explicitly inverted to match its printed below-staff placement; a duplicate lower-staff fermata was omitted. Second-system replacement ledger under `L:1/8`, `K:Bb`:

```abc
[V:S] F2 G2 | G3 F | F2 d2 | d2 c z | B2 B2 | B3 G | F3 F | F4 |]
[V:A] D2 D2 | E3 E | F2 F2 | F2 F z | D2 _A2 | G3 E | (C2 D) E | D4 |]
[V:T] F,2 B,2 | A,3 A, | B,2 B,2 | B,2 A, z | B,2 D2 | (E2 B,) C | G,2 (B, C) | B,4 |]
[V:B] B,,2 B,,2 | C,3 C, | D,2 B,,2 | F,2 F, z | G,2 F,2 | E,3 E, | F,2 F,,2 | B,,4 |]
```

The primary coordinate check corrected a provisional second-system soprano B4/A4 reading to the printed D5/C5 in bars 11–12; the independent reviewer confirmed the correction. The bar 13 alto flat belongs to A-flat4, not the adjacent soprano B-flat4. Tenor bar 14 E4 quarter slurs to B-flat3 eighth followed by C4 eighth; bass bar 15 is F3 quarter then F2 quarter, independently cross-checked.

All five printed stanza texts are retained and receive three explicit first-phrase extensions. The underlay worksheet now shows 33 soprano attacks plus two rests: each stanza has 30 syllabic attacks and three extension attacks, with final words on the terminal chord. Five complete numbered `W:` transcripts and the printed footer are retained separately. No fixed photographic system breaks were added.

The primary live Edge review of the current-source app at `http://127.0.0.1:4175/?number=363&tune=psalter363`, after reloading the changed lazy ABC module, inspected all SATB notes, accidentals, rests, slurs and correctly placed fermatas across responsive three-system reflow. All five note-aligned stanzas and expanded complete transcripts match print. Canonical validation reports zero ABCJS warnings; TypeScript and production build pass. Overall PASS applies to printed notes, lyrics and current desktop rendering. Physical-device audio/mobile and print release gates remain separate. Earlier partial notes above are historical review evidence superseded by this complete check.
