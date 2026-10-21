# Architecture decision: local-first, versioned songbook packages

Status: accepted for the first public release.

## Decision

The complete 1912 Psalter is an immutable, versioned application asset. The app loads a small searchable manifest eagerly and loads notation for the selected setting on demand. A service worker precaches the application shell and songbook manifest; notation and locally hosted audio resources are cached so an installed copy remains fully usable without a network connection.

Firebase Hosting serves the static viewer. Optional issue reporting uses Firestore only when deliberately configured and a visitor explicitly submits a report; score viewing, playback, search, and offline use do not depend on it. See [issue-reporting.md](issue-reporting.md).

## Why not store the canonical corpus in Firestore now?

- The 1912 corpus changes only with reviewed corrections, so release-versioned files are easier to review, reproduce, cache, and roll back.
- A first visit cannot promise the *whole* songbook offline if it has only cached documents that happened to be queried. Firestore's web cache is also browser-dependent and disabled by default.
- A database SDK, security rules, migrations, and runtime failure modes add cost without improving read-only access to a fixed corpus.
- Static files work on Firebase Hosting, any other static host, localhost, and native wrappers without coupling the domain model to one vendor.

Firebase's own guidance says a PWA can combine service-worker-cached assets with Firestore offline persistence, while Firestore's documentation notes that web persistence must be enabled and offline queries initially see only cached documents. That makes Firestore suitable for optional synchronized overlays, not the only copy of the canonical songbook:

- [Firebase PWA guidance](https://firebase.google.com/docs/web/pwa)
- [Firestore offline data](https://firebase.google.com/docs/firestore/manage-data/enable-offline)

## Content boundaries

```text
versioned songbook package
├── manifest: id, number, Psalm, title, tune, credits, searchable lyrics, voices
├── notation chunks: ABC for one setting or a small group
└── provenance: source edition, page references, correction history, schema version

viewer application
├── search and navigation
├── ABCJS rendering and playback
├── local preferences
└── package loader/cache

optional online services
├── reviewed package-update manifest
├── editorial workflow and correction proposals
└── user data such as favorites, annotations, or set lists
```

The viewer consumes the songbook-neutral domain types in `src/domain/`. Its selected package comes from `src/songbooks/registry.ts`, not from the legacy Psalter catalog directly. The package contract supplies stable identity and display metadata; generated schema/corpus/release versions, counts, and digests; eager catalog/range/selection helpers; and lazy ABC/search loaders. The registry validates schema compatibility, package-id/manifest agreement, counts, catalog IDs, primary settings, and digest shape before activation. An invalid candidate resolves to the checked built-in Psalter package.

The built-in package also includes a generated corpus manifest. It records its stable package ID, schema, corpus and application release versions, 450 canonical settings, 474 viewer arrangements, and SHA-256 digests of both the canonical ABC source and generated corpus artifacts. Generation recreates it; ABC validation rejects stale source, generated output, or release metadata.

## Browser-local saved libraries (2026-10-05)

Favorites, recent songs, and saved lists are local to this browser and exact website origin. They are not uploaded to Firebase, shared between devices, or synchronized between different website origins.

Current bundles use the `psalter.collections.v2` IndexedDB database. Every save reads the latest current record, applies an explicit operation, and writes within one native read/write transaction. Completion, not request success, acknowledges a save; strict durability is requested with a compatibility fallback. Notifications, visibility changes, and focus cause fresh reads only. They never write another tab's snapshot.

The first transaction imports `psalter.collections.v1` from localStorage exactly once and keeps one bounded, exact raw backup in the same transaction. It never overwrites that legacy key or the backup. A surviving backup with missing current state blocks automatic reimport. An already-open obsolete bundle remains isolated in its legacy key; later old-tab edits are not automatically merged, because snapshot merging could resurrect deliberate deletions. The UI explains that distinct saves in old tabs should be noted before those tabs are updated. No tab is automatically reloaded.

Unrecognized records, unsupported future fields/versions, duplicates, over-limit arrays, and malformed data block durable editing rather than silently dropping rows or rewriting a shortened library. Readable rows remain visible where possible, with explicit warnings that changes are visit-only. If only legacy data can be shown, it is described as potentially out of date. Failed/quota/blocked database operations preserve existing bytes and produce a clear visit-only status. Pending edits are described as saving until transaction completion; stale/deleted-target and capacity rejections are reported.

Favorite toggles become explicit add/remove intent before rebasing. Verse checkboxes apply only their checked/unchecked verse intent to the latest entry, preserving unrelated settings. The separate “Use current song settings” command intentionally replaces settings. Creating a list with its first song is atomic. A persisted recent-clear cutoff prevents late automatic snapshots of an earlier visit from restoring cleared history. Removed rows and deleted lists are not recreated by unrelated stale edits.

This protects future saves; it does not claim to recover data lost before import. Clearing browser/site data can still remove both current saves and the local backup. No cloud recovery, cross-origin import, or automatic backup upload is implemented.

## Update and offline policy

1. The deployed release always contains a known-good built-in Psalter version.
2. The service worker updates atomically; it must never delete the working cached release before its replacement is available.
3. Later downloadable songbooks use versioned, content-addressed package URLs and validate their schema and checksums before activation.
4. Network failure falls back to the last complete local version.
5. A future Firestore layer may synchronize user/editorial records, but the renderer never requires it to open the built-in corpus.

The remaining downloadable-package gap is deliberately narrow: v1 has no package discovery, download/cache persistence, signature or checksum verification of downloaded bytes, package-selection UI, or migration/rollback storage. The runtime contract and fallback now provide the activation boundary those features will use.

## MusicXML boundary

ABC remains the hand-reviewable canonical notation format for this project. MusicXML should be an import/export interchange format produced by deterministic tooling, not a second independently edited source of truth. Round-trip tests must compare musical events and voice assignments; exact engraving layout is deliberately not preserved because the viewer reflows responsively.

## Lyric underlay boundary

The source ABC remains photo-reviewable, including its `w:` note underlay and complete `W:` stanza text. At runtime, the viewer extracts a separate underlay model keyed by voice, music segment, and stanza number, preserving each source row and its position. It generates a temporary ABC view for the user's chosen verses-per-tune count (five by default); the source music is not rewritten. A voice's own lyric rows take precedence over transferred rows from another voice. The older ordinal-segment transfer is only a visibility fallback when the selected voice has no underlay, not proof that its syllables match that voice's note events.

Moving the underlay model into a separately versioned songbook data object is a later migration. It needs source-photo parity and round-trip checks before the embedded `w:` rows can be removed. The remaining W-only settings are transcription work, not an intended final text-only format.

Repeated music can require different words on each traversal, not merely different stanza rows on the same written notes. Psalter 345 is a concrete case: its printed opening repeats for the next two lyric lines within each stanza. Its bounded alignment object in `src/features/viewer/repeatUnderlay.ts` keys syllables by voice, written music segment and note event, stanza, and repeat pass. The renderer turns selected rows into temporary ABC `w:` fields for ABCJS spacing and responsive wrapping, preserving the source pitches, repeat signs, and complete `W:` transcript. Print selection uses the same event map; when the soprano is hidden, the selected transcript remains visible because the other parts have not received a verified syllable alignment. This model is reusable, but the only verified data entry so far is Psalter 345.

## Deployment

Firebase Hosting is a good static deployment option because it provides HTTPS, CDN delivery, cache headers, rewrites, and preview channels. Hosting configuration can be committed without committing credentials or a personal project alias. Production deployment still requires an explicitly selected Firebase project and a release checklist.

- [Firebase Hosting configuration](https://firebase.google.com/docs/hosting/full-config)
- [Firebase Hosting quickstart](https://firebase.google.com/docs/hosting/quickstart)
