# Hymn playlist recordings

The footer links each of the 149 installed hymnbook memberships to one reviewed
Spotify track from its book's playlist. Both full-book playlist links remain.
The 52 Traditional Hymns selections and 97 Traditional and Contemporary Hymns
selections use 101 distinct recordings. Book identity and stable song identity
form the lookup key: four shared scores intentionally select different recordings
in the two books.

The displayed labels preserve the review's distinctions: 113 plain “Listen on
Spotify” links, 32 “tune may differ,” two “different tune,” one “version differs,”
and one “piano.” These are recordings of the hymn, not promises of an identical
score, arrangement, text, or playback. The version-differs recording (Come Thou
Long Expected Jesus) includes an additional stanza. Full qualifications and
public identity evidence are retained in `hymn-recordings-audit.json` rather than
shown as technical research in the score interface.

## Evidence and limits

The implementation derives from the October 6, 2026 reviewed engineering map,
SHA-256 `7f21339b35aea122f74c0da2f7c031c7ab6a24380082c0e358b56772a69474b3`.
All 101 distinct primary tracks had their title and artist checked against
first-party Spotify metadata on October 6. Current playlist membership was
rechecked for 78 memberships. The other 71 rely on the complete September 30
playlist audits; the October 6 playlist totals (146 and 489) and first 100 tracks
of each list were unchanged. This does not freshly verify the remaining tails.
No audio was auditioned. Playback availability can vary by account and market.

The compact audit retains track metadata sources and observation times, per-book
playlist positions, current membership flags, selected tunes, source ABC hashes,
and recording-to-score qualifications. Its score hashes identify the notation
used for the review; later score corrections require evaluating whether a tune
or qualification changes. Links confer no rights to redistribute the recordings,
lyrics, scores, or recording-specific arrangements.

## Loading and release checks

`HymnRecordingLink` and its data load only when a hymnbook is selected. The plain
TypeScript data literal prevents JSON bundling from hiding URLs inside a
JSON.parse string, keeping the exact-URL AST inspection strict. They are
local, precached application assets; opening or navigating scores makes no
Spotify request. The footer uses ordinary links with explicit new-tab labels and
`noopener noreferrer`, and existing print rules omit the footer.

`tools/hymn-recording-policy.mjs` independently pins the sorted
`[bookId, songId, URL, linkLabel]` records with SHA-256
`b3fff1369060ef75df3eda61c402d1a0298e3059afb1ef36c9bb129106426712`.
It requires complete actual-catalog coverage, exactly 149 memberships and 101
unique complete track URLs, and the two original playlist URLs. Duplicate object
keys, changed URLs, book reassignment, and lost qualifications fail validation.
The existing 93-pair Psalter policy and its digest are unchanged.

The release gate checks both source policies. The build gate requires all
approved tracks and both playlists, rejects other Spotify references, and proves
the hymn recording map remains in its separate lazy, precached closure rather
than the Psalter startup or viewer closure. Tests extend the existing registry,
viewer, and print/release test files; no test files or dependencies were added.
