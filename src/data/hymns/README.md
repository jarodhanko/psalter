# Selected hymnbook content, import v2

This package integrates exactly the 97 selected ABCJS editions prepared on
2026-09-30: 52 entries in **Traditional Christian Hymns (vocal)** and 97 in
**Christian Hymns And Contemporary**. There are 149 book memberships, with
shared source editions stored once. The original 111/318 catalog rows and their
held/excluded decisions remain in `source/book*_index.json`; they are not viewer
entries. In particular B129, *I Have Decided to Follow Jesus*, remains excluded.

## Current book listings (2026-10-07)

The smaller Traditional book lists 50 hymns; Traditional and Contemporary lists
97. Two archived Traditional memberships now resolve to the same source edition
in the larger book:

- *Softly and Tenderly Jesus Is Calling*: Traditional 16 / H022 → larger book 74 / B022.
- *Oh for a Thousand Tongues to Sing*: Traditional 29 / H042 → larger book 61 / B040.

The browsing projection is separate from the canonical import. All 149 original
memberships, their numbers, catalog IDs, recording mappings, generated manifests,
ABC, and provenance remain intact. No other song is renumbered. The two titles
are omitted from the smaller book's picker, navigation and search projection.
Package moves are validated against both exact catalog memberships and their
shared source edition before use.

Old number-only and exact tune links open the larger-book edition and show a
short moved-book notice. Conflicting numbers and tune IDs remain invalid. Shared
settings and matching browser-history settings travel with the resolved edition.
Favorites, recent entries and service-list rows resolve on read, including booklet
printing; this does not rewrite saved source identities or settings. Updating a
legacy list row's settings keeps its original saved membership identity.

## Stable identities and source authority

- Package IDs: `traditional-christian-hymns`, `christian-hymns-contemporary`.
- Song IDs: `hymn-` followed by the selected source edition ID.
- Display numbers are consecutive within the included catalog, in original
  index order. They are not original hymnal or playlist numbers.
- `catalogId` retains the original H###/B### membership identity. Never derive it
  from a display number. The full original membership record accompanies a
  loaded song as `provenance.catalogRecord`.
- Headings and search labels use the selected edition’s title. Original catalog
  wording, including recording-specific arrangement labels, stays in provenance
  and is explicitly labeled when it differs from the selected title.
- `abc/` contains the prepared import bytes plus documented source-encoding
  corrections. Their current hashes must match both selected-edition evidence
  and `source/SHA256SUMS.json`. Corrected editions retain their original import
  hash and correction details in the selected-edition record. The archival
  `source/INTEGRITY.json` still describes the original import. No Psalter source
  file is touched by this importer.
- Alternate editions, held rows and unprinted stanzas are not silently added.
  The selected-source notes document tune, stanza and editorial differences.

## Rights and provenance

The original README, status, selected-edition records, all catalog rows, credits,
remaining rights hold and integrity report are retained under `source/`.
`editions/` contains per-source lazy records with the complete selected-edition
record and included catalog memberships, plus a display projection of source
URLs, creator credits, licenses, changes, rights assertions and territory limits.
The import is not an independent legal clearance: U.S. public-domain source
assertions must not be turned into worldwide assurances. Historical unresolved
research warnings remain in the exact source evidence.

OpenPsalm arrangements carry CC BY 4.0 attribution, creator/source credits,
license URL and a conversion/change statement. Anthology new contributions use
CC0 while underlying works retain their U.S. territory qualification. Preserve
all these qualifications when printing, exporting, or redistributing.

## Loading, notation and lyrics

`catalog.ts` creates the shared SongbookPackage interface. Only compact shared title/edition tuples and book membership tuples are eager.
Full voice/composer metadata loads with the selected edition. Every notation module (`hymnAbc-*`), edition metadata module
(`hymnEdition-*`) and each book's search index (`hymnBook1Search` /
`hymnBook2Search`) is dynamically imported, producing JS assets covered by the
existing Workbox `*.js` precache. No source website or database is contacted.

Generated voice metadata retains original source labels, classifies actual
chordal voices, and uses neutral staff/voice names wherever independent SATB
identity is not established. Melody/chord-symbol sources have only one selectable
melody voice; chord symbols are not independent SATB accompaniment. Underlay
reconstruction preserves carriers and groups only equal-length sequential rows;
distinct echo text and later W: prose stanzas remain. It never adds unprinted
verses. `hymnLyricSourcesFromAbc` exposes all exact carrier rows for diagnostics.

## Reproduction

Run with the repository's Node runtime:

    node src/data/hymns/generate.mjs

The generator reads only vendored inputs, checks all 97 ABC digests and exact
included memberships, and rebuilds notation wrappers, metadata, two catalogs,
per-edition provenance, and two search indexes deterministically. Package
`canonicalAbcSha256` hashes ordered catalog ID/source ID/source digest rows;
`generatedArtifactsSha256` hashes that book's complete generated metadata,
search and included-edition records. No network or source selection occurs.

The import's original QA claims and limitations remain in `source/STATUS.json`.
Application rendering/audio tests are separate integration checks; successful
parsing is not exhaustive source-note proofreading or new rights clearance.

## Application integration checks (2026-10-03)

Temporary diagnostics against the installed ABCJS 6.7.0 verified all 97 exact
source hashes, 149 included memberships, both full-text indexes, 1,379
source-declared part subsets, and 194 nonempty SVG engravings at 320/1000 staff
widths. The rendering check uses jsdom; it is not physical-device or visual
proofreading. The source MIDI range is 36–77, remaining within 26–89 over every
allowed transposition (local samples cover 21–109). The 32 editions with
ambiguous generic verse identity retain their source underlay rather than
claiming independent verse filtering. Exact carrier rows remain available.

Now Thank We All Our God has two declared chordal staff voices and an overlay;
additional ABCJS internal tracks are not extra selectable SATB parts. Its
subset comparison uses source-owned note events and a common tempo.

All 1,379 source-declared part combinations also passed playback ownership/muting
checks, including grace-note ownership. ABCJS 6.7.0 leaks hairpin state between
staves in the selected *Turn Your Eyes Upon Jesus* edition, silencing 160 bass
notes and 82 tenor notes. The application has a source-digest-scoped playback
workaround using fixed dynamics for this edition. Its 14 printed hairpins, all
667 playback pitches/timings, original ABC and exported source remain intact.
The viewer discloses the fixed-dynamics playback limitation.

## Owner-selected lyric defaults

Five exact imported editions have a default verse selection. The historical source
ABC, attribution, music and audio remain unchanged. The viewer shows the omitted
original verse numbers and an explicit per-song **Show full original lyrics**
choice; this is an editorial selection, not a blanket doctrinal verdict.

- Oh for a Thousand Tongues to Sing: source verses 15 and 18 omitted by default
- Love Lifted Me: verse 3
- Wonderful Grace of Jesus: verse 2
- Softly and Tenderly: all three imported verses and their shared refrain;
  the default score retains music without words
- Christ the Lord Is Risen Today: verse 3 on both source lyric carriers

Screen lyrics, transcript, printing and the current ABC export follow the same
selection. Original stanza numbers are preserved. The explicitly labeled original
ABC download retains the complete canonical bytes. Current filtered exports keep
source attribution and rights without copying unabridged evidence blobs that may
contain hidden lyric transcripts. An unrecognized revision of a listed source
shows music only until its lyric selection is reviewed or the reader explicitly
shows the original. Explicit saved/shared/update settings retain that choice; it
does not become an automatic preference for an unrecognized source revision.

The original-text preference belongs to one source revision of one song in the
current browser/origin, and is also retained in explicit saved, shared and update
settings. It never carries automatically to another song. Issue reports retain
original stanza numbers and include a visible lyric-display note in their existing
bounded description field; report privacy and submission limits are unchanged.
