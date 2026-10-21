# Psalter 431 initial signature correction

## Printed evidence

The pinned [source image](https://github.com/jrvermeer/Psalter2025/blob/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score/_431.webp) has two sharps, F and C, on both initial staves and repeats this signature on all six staves. Original dimensions: 721 × 615. Git blob: `d03b3f5ae7abddc15314331916928c23f6956cdd`. Image SHA-256: `c7911529179ea23f5a99abfc6501b58c344ee99f5a6d61b0986f40d2c568f7a7`.

Two independent initial-signature readings and a fresh source-only pixel adjudication support the F-sharp/C-sharp alteration set. The opening and ending written pitches match the encoded diatonic positions, inconsistent with a whole-score transposition. No local accidental cancels the C-sharps. The source's existing 1934 attribution and unresolved rights qualification remain unchanged; the repository directory name does not establish a 1912 publication date for this setting.

## Scope of correction

Change only `K:G` to `K:D` in the canonical ABC and its exact reviewed fermata music witness. This encodes the printed two-sharp signature. All note tokens, durations, ties, lyrics, printed performance note, attribution, fermata scope and sharing/playback settings remain unchanged.

The independently located C-position heads are listed below. Staff numbers count physical printed staves from top to bottom; coordinates refer to original-image pixels. Canonical voice/time labels identify affected encoded records, rather than adding source voice labels.

| Printed staff and head center | Lyric landmark | Written pitch | Affected canonical record |
| --- | --- | --- | --- |
| 1; (254.5, 29) | our | C-sharp 5 | T1, quarter offset 5 |
| 1; (434.5, 28.5) | and | C-sharp 5 | T1, quarter offset 10 |
| 3; (240, 231.5) | thems | C-sharp 5 | T1, quarter offset 25 |
| 4; (72, 363.5) | Lof- | C-sharp 3 | B2, quarter offset 20 |
| 5; (587.5, 463.5) | tim | C-sharp 4 | T2, quarter offset 52 |
| 6; (183, 576) | Name | C-sharp 3 | B2, quarter offset 40 |

This corrects six formerly natural C pitches by one semitone. All 133 written note records and 135 individual pitch heads remain present; the other 129 pitch heads and 124 of 130 sounding attacks are unchanged. The written timeline remains 56 quarter beats. Existing shared fermata playback remains 57 quarters, with the final marked segment at quarter offsets 54–57.

## Verification and limits

711 focused checks cover both runtime branches. Every transpose offset from -10 to +12 is checked for the full ensemble and each of the four solos; all 15 nonempty selections are additionally checked at zero transpose. The checks include exact-source guard rejection, callback/seek/tracking behavior, and current ABC export. WebAudio/sample fixtures are deterministic and silent; this is not acoustic listening or actual-phone acceptance. The complete local verifier and browser/device checks remain separate requirements.

The existing ABC validator now checks the independently frozen initial alteration sets for primary settings 414–434. Expected values come from source agreement witness SHA-256 `5061f11e07d916f18926b899ff9c595ac7ae31749969c5939e74150172d41d59`, not from the current ABC. The guard covers initial alterations only, including initial inline key overrides; it does not certify tonic, mode, singing octave, body notes or later key changes. Its 22 focused probes include old 431 rejection. Separate code-diff inspection confirms that the existing validator checks are preserved. No new committed test files or runtime imports are added.

Source adjudication record SHA-256: `ccb7461401c40d39df33133537b91cd945da87852e3a63a75d4bd21676519ef5`. Source C-site ledger SHA-256: `9731fcb7992eebcaf52fbb923b8520dd04c03faff36cde247521ce27834dc87d`. The independent initial-signature audit and C-site correction do not establish a new full-note/duration audit of all of 431 or acceptance of the entire corpus. The earlier historical acceptance is superseded for this identified error; its history is preserved.
