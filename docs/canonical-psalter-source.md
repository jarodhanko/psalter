# Canonical Psalter source and generated app data

Edit one arrangement in `src/psalter-abc/<arrangement-id>.ts`. These modules are the single source of truth. `src/psalter-abc.ts` is a static compatibility barrel: existing TypeScript imports, arrangement identifiers and aliases remain stable. Never edit `src/data/generated/`; it is ignored build output, completely replaced on each generation.

There are 475 source modules and 474 distinct viewer arrangements. `psalter1combined` is a retained compatibility export excluded from the viewer. The `psalter2_tune1` compatibility alias remains in `psalter2.ts` and is not a separate arrangement or duplicated ABC literal. The two pre-existing unexported No.1 diagnostic variants remain unexported in `psalter1combined.ts`; they preserve existing parser/audio diagnostic coverage and are not app authorities.

## Reproducible source and manifest

`tools/read-canonical-psalter-source.mjs` reads the barrel's exact ordered membership and concatenates the module bytes with no inserted separators. The initial migration reproduces the previously reviewed monolithic source byte for byte, including provenance comments. `canonicalAbcSha256` continues to identify this complete canonical content stream, never just the barrel. Its manifest schema remains version 1. `.gitattributes` pins the barrel and score modules to LF on every platform; the loader rejects CRLF drift instead of allowing JavaScript runtime values and raw-source hashes to disagree.

The loader rejects unsupported barrel syntax, duplicate entries or declarations, missing/orphan files, module/primary-export mismatch, unresolved aliases, and unsupported module code. Template literals must be plain ABC with no JavaScript escapes or interpolation, matching the established generator's literal-text contract. The generator and all raw-source diagnostics share this loader. Migration diagnostics independently checked TypeScript namespace and generated-arrangement parity. The regular ABC validator continues to check every generated arrangement against its canonical value.

Generated headers continue to name `src/psalter-abc.ts`, the canonical entrypoint, for byte-stable generated output. Build-only data still consists of 474 ABC modules, metadata, a lazy search index and a manifest. Neither the manifest nor artifact hashing depends on Git tracking these files.

## Clean-checkout and development commands

- `npm ci` generates source-derived data through `postinstall` so fresh-checkout editors and TypeScript can resolve generated imports
- `npm run build` and `npm run build:release` regenerate before compilation; release preparation contains no automated test suite
- `npm start` and `npm run dev` regenerate through npm pre-hooks
- Direct Vite commands also regenerate while loading the Vite configuration; the development server watches canonical module changes and regenerates before reloading
- `npm run validate:abc`, `npm run audit:lyrics`, `npm run audit:lyrics:parity`, `npm run inspect:underlay`, `npm run validate:audio-range`, `npm run qa:sheet -- <id> <photo-path>`, and `npm run inspect:score-events -- <id>` regenerate before diagnostics
- Direct `node tools/...` diagnostics deliberately do not repair stale generated files: run `npm run generate:psalter` first. In particular, `validate-abc` and `qa-sheet` must still be able to reject stale derived data
- After installing with `--ignore-scripts`, run `npm run generate:psalter` before calling TypeScript or low-level scripts
- `npm run preview`, `npm run validate:build`, and `npm run prepare:pwa-update-fixture` consume an already built `dist`; run `npm run build` first. The fixture command intentionally never rebuilds its supplied release

Generation deletes the entire old generated directory before writing the new complete set, so stale or removed arrangements cannot survive a cached workspace. The ABC validator compares every viewer arrangement to its canonical source, and checks the source digest and every generated artifact. This public source has no CI workflows. Do not reuse generated source or `dist` from a different source revision.

## Offline and release behavior

Production imports still use the same generated metadata, lazy search index and per-arrangement ABC chunks. Canonical modules add no network requests or runtime patch layer. Vite bundles the complete generated corpus and the existing service worker precaches production assets for offline use.

Publish the complete migration in one commit/tree only after clean-checkout verification and independent review. Never publish a barrel before its modules and loader. Retain the previous remote commit/tree and Hosting release ID before deployment. For rollback, create a new commit reusing the previous complete Git tree (or revert the migration), then redeploy that verified release. Git tree reuse restores the old monolith without retransmitting its large blob. Do not rewrite branch history or partially restore individual source/tool files.
