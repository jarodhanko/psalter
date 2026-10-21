# Native reduced-part underlay: Psalters 3, 8 and 17b

## Evidence and scope

The 1912 print has one shared lyric baseline. Independent review of the words,
each part's written rhythm, and its slurs/passing pairs supports a native-part
reconstruction. It does not supply separate printed lower-part lyric rows.
Only RIVAULX stanza 1 is printed with that tune. Stanzas 2–5 remain the editorial
adaptations documented in [the existing RIVAULX review](2026-10-06-psalter17b.md).

Pinned same-edition scans:
- [HERALD ANGELS, No. 3](https://github.com/jrvermeer/Psalter2025/blob/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score/_3.webp)
- [MERRIAL, No. 8](https://github.com/jrvermeer/Psalter2025/blob/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score/_8.webp)
- [RIVAULX, No. 17 second tune](https://github.com/jrvermeer/Psalter2025/blob/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score/_17_2.webp)

The exact-source-qualified timing-carrier helper moves the shared rows to the
first surviving vocal part before generic lyric donation can subdivide native
notes. The helper changes only lyric rows. No canonical ABC, pitch, duration,
bar, accidental, slur, tie, cue designation, or audio source changes.

## Native syllable slots

Quarter-note time q is measured from the beginning, including pickups.

| Setting | Part | Native notes | Continuations without new syllables | Syllables per stanza |
| --- | --- | ---: | --- | ---: |
| 3 | T2 | 73 | q7, q39, q47 | 70 |
| 3 | B1 | 70 | none | 70 |
| 3 | B2 | 72 | q23.5, q71 | 70 |
| 8 | T2 | 23 | q3.5 | 22 |
| 8 | B1 | 25 | q13, q14, q15 | 22 |
| 8 | B2 | 26 | q5, q7, q21, q23 | 22 |
| 17b | T2 | 36 | q5.5, q25, q31, q40 | 32 |
| 17b | B1 | 35 | q5.5, q19, q35 | 32 |
| 17b | B2 | 32 | none | 32 |

This restores 17 native-note lyric onsets previously delayed to soprano timing:
- No. 3: T2/B1 at q11 and q65; B2 at q3, q11, q19, q27, q59, q65, q75.
- No. 8: B1 at q17 and q25; B2 at q25.
- No. 17b: T2 at q19 and q43; B2 at q43.

No. 3 B3 is a separate cue-only case. It receives no vocal text. Removing the
validated donor rows before part selection prevents failed lyric donation from
leaving artificial subdivisions in its q64 whole note. The original whole-to-
quarter tie into q68 and all five cue heads remain exact.

## Qualification and preserved behavior

The helper binds complete frozen canonical ABC before metadata removal. The
prepared music frame and complete ordered selected row vector are checked again
before relocation. Wrong source IDs, music, roles, keys, word rows, duplicate or
reordered stanzas, and invalid voice selections cannot inherit the policy.
Exact frozen sources are retained rather than replacing identity with a weaker
non-cryptographic fingerprint. LF/CRLF normalization matches the existing helper.

All selections containing the original soprano carrier keep their old output.
Other selections carry one reconstructed native lyric row per selected stanza;
non-carrier parts remain lyric-free. Music-only, selected verses, grouped screen
copies, print groups and learner spelling use the same source-qualified hook.

No. 3's separate small F-sharp4 at T2 q77 remains source-bound. It neither replaces
the canonical D4 nor creates a sung voice. The existing full-score audio
supplement remains enabled only when all five original voices are selected.
Partial audio paths are unchanged.

Native written-event identity and sounding intervals remain equal for all 61
nonempty selections. Existing runtime written-projection/rendered-head checks
remain authoritative for No. 8 and No. 17b tracking. No. 3 retains its separate
source-head tracking and portable-export restrictions. No tracking guard is
weakened for other timing-carrier families.

## Verification boundary

Focused tests cover all 61 part selections, source-note/tie/slur tokens, complete
per-part/per-stanza underlay, learner spelling, every nonempty stanza subset,
actual renderer stanza grouping, wrong-source and row-identity rejection, cue
behavior, q77 heads and full-versus-partial audio qualification. React/jsdom
wiring tests cover prepared screen/print inputs, export and tracking eligibility.
Synthetic DOM geometry is not a visual or print-readiness approval.

Before release, the integrated candidate still needs aggregate repository gates
and native desktop/phone score inspection, including grouped/selected print,
q77 small-head appearance, cue-only long tie, responsive lyric spacing,
transposition, learner accidentals, and actual playback/follow interaction.
