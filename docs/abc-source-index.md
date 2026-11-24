# ABC source index and local transformation

This catalog exports the primary application transcriptions of nos. 1–413 and 24 original alternate settings.
The collection's documented lineage is the page-by-page 1912 transcription
in [provenance.md](provenance.md); this is not an independent event-by-event
audit. The frozen list binds the assessed public source revision to exact ABC
bytes. The cohort includes historical copyright/permission notices from the
1912 edition, and preserves all source notices byte-for-byte.

Verified alternate settings are explicitly pinned by setting ID, hash and original-edition
locator; #2 SARDIS has its own source record rather than duplicating REDEEMER.
Scope exceptions are explicit: nos. 414–432, the 1947 settings #433–434, and further addenda are outside
this release. Original-print spot checks corroborate the extra printed part
material for #3, #5, #226 and #253; auxiliary voices are not silently removed.
In #226 the harmony is later *in the tune*, not a later-edition label.
In #253 the application encodes the small-note material as a muted auxiliary
voice; this review did not assert note-by-note parity.

The index is /abc/psalter-1912/index.json. It links to each approved original
ABC file and records its SHA-256, printed edition, exact public source,
provenance, viewer and territory guidance. Original bytes are not automatically
converted to another editor's preferred ABC dialect. The app's separate
“current ABC” export applies selected options and may produce different bytes.

The recorded rights basis is U.S.-focused and applies to the exact approved
edition. Neither the code's MIT license nor a number in the core viewer is a
blanket score license. Never broaden the list to another arrangement or
replacement text simply because it shares a number or is already visible in the
application. No later addenda, unverified alternate settings, audio or scans are included
in this new distribution. If a reviewed score is corrected, refresh its exact
hash only after confirming the new bytes and evidence.

After installing locked dependencies, use the same transposer as the app,
locally on Node 22.12+:

```sh
node --experimental-strip-types tools/transpose-approved-abc.mjs 1 2 > psalter-1-plus-2.abc
```

Here `2` raises the musical key by two semitones; valid values are -10 through
12. For alternates use the filename stem (such as `17b` or `2_tune2`). The tool doesn't change the original; a setting outside the approved index
or an unsupported transformation exits without writing ABC to stdout.
Original downloads remain available when the shared adapter refuses a requested shift.
No API or frontend state is involved. Part selection, verse grouping, music-only,
tempo, and source-specific layout or audio features remain in the interactive
viewer; they are intentionally not duplicated here.

Review actual hosting headers before publishing. The /abc/ URLs are stable but
not claimed indexed by any search provider. Hosted ABC files use text/vnd.abc and unknown paths in the ABC namespace return
404 rather than a viewer shell. Preview noindex policy is unchanged.
