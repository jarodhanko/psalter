# Firebase data and analytics architecture

Status: static songbook architecture retained. A narrowly scoped private editorial issue queue now uses Firestore; Analytics and user-data sync remain disabled. See [issue-reporting.md](issue-reporting.md).

## Proposed direction for review

Keep canonical songbooks as versioned, public static packages served by Firebase Hosting (or any static host). Keep the currently active built-in package in the app bundle; use browser IndexedDB for optional future downloads and persistent preferences. This proposal does not put the Psalter corpus or public-domain hymn books in Cloud Firestore. The corpus is read-only, release-oriented content; static files are cheaper to serve, straightforward to review and mirror, and can be included in a complete offline install without a database query.

Do not add Authentication, Functions, or Analytics solely to support the read-only viewer. The requested private editorial issue queue is the sole current Firestore use. Reconsider Firestore when there is a real cross-device user-data or editorial-workflow requirement. If that requirement arrives, use Firestore only for private synchronized user records or a narrowly scoped editorial queue, never as the only source of published notation. Analytics is optional and should remain disabled until there is a documented product question, privacy notice, and consent behavior.

This extends the local-first decision in [architecture.md](architecture.md). The app currently has a versioned `SongbookPackage` contract (`schemaVersion: 1`), lazy song/search loaders, one built-in `psalter-1912` package, and Firebase Hosting configuration for `dist/`; `firebase-tools` is currently a development dependency, not a runtime Firebase SDK.

## Data placement

| Data | Canonical source / online transport | Offline copy | Firestore? |
| --- | --- | --- | --- |
| Songbook catalog, search index, ABC, credits and provenance | Reviewed source in the repository; generated immutable package files deployed to Hosting | Built-in Psalter in the application; downloaded packages persisted in IndexedDB after validation | No |
| Package discovery and latest-compatible version | A small versioned JSON index on Hosting, deployed atomically with package artifacts | Last validated index and installed package in IndexedDB; built-in fallback | No |
| Display, transposition and playback preferences | Local application state | IndexedDB (or local storage only for tiny noncritical settings) | No by default |
| Favorites, annotations, set lists, if cross-device sync is later required | User-scoped Firestore documents after sign-in | IndexedDB plus a pending-write outbox; bundled songbook remains available without sign-in | Yes, optional |
| Correction proposals, if an editorial queue is later required | Private Firestore submission records or a separate issue workflow | Drafts can remain local until explicitly submitted | Optional; never publish directly from client writes |
| Usage measurement | Optional Firebase Analytics after explicit consent | No requirement for offline use; events may be dropped offline | No |

## Static package format and release flow

Build from reviewed canonical ABC and metadata, validate IDs, voice assignments, schema, counts, and digests, and produce a package manifest plus search/catalog files and lazy notation chunks. Preserve the existing `SongbookPackageManifest` identity and checksum contract. Add an explicit content-format version if generated JSON/ABC layout changes independently of the TypeScript interface. Keep the existing application `schemaVersion` for the package contract; incompatible contract changes require a new schema version and a converter or a clear rejection path.

Recommended hosted layout:

```text
/songbooks/index.v1.json
/songbooks/psalter-1912/1912.2/manifest.json
/songbooks/psalter-1912/1912.2/catalog.json
/songbooks/psalter-1912/1912.2/search.json
/songbooks/psalter-1912/1912.2/abc/<content-hash>.json
```

The sample paths are a future distribution convention, not files currently present in `dist/`. Keep published version paths immutable and content-address notation chunks. The small index points only to complete releases and includes package ID, schema/content versions, release version, manifest URL, expected counts, and SHA-256 digest. A release job publishes all immutable artifacts first, validates them from their deployed URLs, then publishes the small index last. Never replace a live package in place or delete the previously known-good version as part of update activation.

At runtime, the app checks the index when online, selects only a compatible package, downloads any missing files into a temporary IndexedDB namespace, verifies checksums and package invariants, and atomically marks the complete package active. A failed or interrupted update leaves the previous package active. Search and scores resolve through the package interface and work from IndexedDB offline. Keep the built-in Psalter as an always-available fallback. Avoid relying on Firestore cache as the offline corpus: Firestore returns only data already cached, web persistence must be configured, and browser support or storage can fail.

Migration tooling should be deterministic and idempotent: source ABC + metadata -> validated package at a specified schema/content version. It must not mutate canonical sources. Store migration version, source revision, generated counts, and hashes in release evidence. A newer package must either include a supported migration for locally stored user records or leave those records readable and report that sync needs an upgrade; it must never silently reinterpret a song ID. Stable IDs should be namespaced by package, such as `psalter-1912:psalter4`.

## Firestore, only if synchronization becomes a requirement

Use the modular Firebase Web SDK and initialize it behind a service boundary, separate from songbook loading/rendering. Require Firebase Authentication before any private reads or writes. Suggested starting model:

```text
users/{uid}
  schemaVersion: 1
  createdAt: server timestamp
  updatedAt: server timestamp

users/{uid}/preferences/{deviceOrProfileId}
  schemaVersion: 1
  defaultBookId: "psalter-1912"
  displayMode: "all" | "single"
  transpositionSemitones: integer
  updatedAt: server timestamp

users/{uid}/favorites/{packageSongId}
  schemaVersion: 1
  packageId: "psalter-1912"
  songId: "psalter4"
  updatedAt: server timestamp

users/{uid}/setlists/{setlistId}
  schemaVersion: 1
  title: string
  items: [{ packageId, songId, transpositionSemitones }]
  updatedAt: server timestamp
```

Keep documents small and bounded; split growing annotations or long set lists into item documents. Validate field types, lengths, allowed enums, stable package/song ID formats, and ownership in Firestore Security Rules. Rules should deny all access by default and allow a signed-in user only their own `users/{uid}/...` records (`request.auth.uid == uid`). Do not rely on hidden UI controls or the Firebase web API key for authorization. Do not allow clients to write published package manifests, notation, release pointers, or moderation status. Editorial submissions use a separate bounded, create-only collection with public reads prohibited; the owner reviews records before a correction reaches source control and Hosting. This public intake is a narrow exception to the signed-in user-data model above, documented in [issue-reporting.md](issue-reporting.md).

On web, initialize Firestore with persistent IndexedDB cache only when sync is enabled and supported, preferably with multi-tab coordination. Handle initialization failure by keeping the local app usable and sync unavailable. Firestore's local cache can persist sensitive data on a shared device; explain this before enabling private sync and provide sign-out/cache-clearing behavior. The app must distinguish local pending writes and cache-only reads from server-confirmed state. Use server timestamps, stable IDs, and an explicit merge policy; do not assume last-write-wins is suitable for every data type. Make local data authoritative for rendering while offline, queue user mutations locally, and sync idempotently when online. If sync is not configured, do not initialize Firestore at all.

Use Firebase Emulator Suite to test rules and migration/import code before any production deployment. Deploy Security Rules and indexes as version-controlled artifacts. Start with no Functions or scheduled jobs; introduce a trusted server-side component only if moderation, validation, or administrative publication cannot be safely performed in the reviewed build pipeline. Monitor Firestore reads/writes and set a budget alert before enabling sync. Never bulk-read a corpus or attach a realtime listener to the full user tree.

## Analytics and privacy

Analytics is not needed for music viewing and must not become a rendering dependency. If enabled later, use Firebase Analytics only after documenting the specific metrics it will answer and updating the privacy notice. Load it lazily after consent, verify browser support, and retain a clear way to withdraw consent. In regions or deployments where consent is required, send a default denied consent state before Analytics initialization and only grant it after an affirmative choice. Do not infer consent from continued use.

Collect only coarse, allowlisted events such as `viewer_opened`, `search_used`, `score_played`, `offline_ready`, and `package_update_completed`. Never send lyrics, search strings, user IDs, email, full URLs/query strings, IP-derived custom fields, or song/psalm/tune identifiers; these can expose devotional interests. Avoid setting user properties, advertising identifiers, Google Signals, personalization, and automatic screen tracking unless separately justified and disclosed. Do not log raw event payloads or cache analytics events in the app's own IndexedDB. Make Analytics initialization and event helpers no-ops when the user declines, the SDK is unsupported, or runtime configuration omits the measurement ID. Verify the deployed behavior with DebugView and network inspection using synthetic data before release.

Firebase Analytics and any consent implementation have legal and policy implications that depend on audience and location; this document is an engineering design, not legal advice. If anonymous, consent-free aggregate counts are sufficient, prefer privacy-preserving Hosting or deployment metrics over adding a behavioral analytics SDK.

## Cost and operations

Static Hosting handles read traffic through the CDN and requires no per-song database reads. Adding Firestore without sync would introduce client SDK weight, security-rule maintenance, cache semantics, and potentially billable document operations without improving the offline viewer. Analytics is a separate data-collection decision and is not required by Hosting. Reassess actual Hosting transfer/storage and any Firestore usage against current Firebase pricing before turning on optional services; pricing and quotas change over time.

Keep Firebase client configuration in environment-specific build configuration; these values identify a Firebase project and are not secrets. Do not commit service-account credentials, private keys, user data, or machine-local `.firebaserc`. Keep preview and production project selection explicit, and keep preview search/index controls aligned with the content's actual privacy. Firebase Hosting headers should keep HTML, service-worker scripts, and the mutable package index revalidatable (`no-cache` or equivalent), while hashed immutable package assets can use long-lived immutable caching. Validate cache headers and update rollback behavior against the deployed preview before release.

## Adoption gates

Before adding Firestore, define the cross-device data feature, account lifecycle, conflict behavior, deletion/export behavior, Firestore rules, emulator tests, budget alerts, and offline acceptance criteria. Before adding Analytics, define the privacy notice, consent UX and persistence, jurisdiction assumptions, event allowlist, retention/access controls, and a no-consent verification path. Until those gates are met, ship with static Hosting packages, IndexedDB, the built-in corpus fallback, and no runtime Firebase services.

## Firebase references

- [Cloud Firestore offline data](https://firebase.google.com/docs/firestore/manage-data/enable-offline): web persistence is opt-in; cached documents are not guaranteed to include data never fetched, and persistent cache remains on the device between sessions.
- [Cloud Firestore JavaScript API reference](https://firebase.google.com/docs/reference/js/firestore): current web configuration uses `localCache` (`persistentLocalCache` and a tab manager); older persistence helpers are being deprecated.
- [Firebase Hosting configuration](https://firebase.google.com/docs/hosting/full-config): Hosting supports explicit cache-control headers and rewrites for static deployments.
- [Get started with Analytics for Web](https://firebase.google.com/docs/analytics/web/get-started): web setup and automatic collection behavior; [Analytics JavaScript API](https://firebase.google.com/docs/reference/js/analytics): browser support checks and consent/collection controls.
- [Firebase pricing](https://firebase.google.com/pricing): confirm current plan, quotas, and costs before enabling optional services.
