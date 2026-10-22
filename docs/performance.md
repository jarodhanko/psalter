# Performance and offline budgets

The enforced source of truth is `tools/validate-build.mjs`. Run `npm run build:release` to build the exact current source and check the resulting assets. Historical deployment measurements are not shipped as evidence of this build.

The gate counts complete, deduplicated JavaScript dependency closures, including shared imports. Current ceilings are:

- Initial application: 500,600 raw / 130,400 gzip bytes
- Additional viewer closure: 1,218,800 raw / 362,800 gzip bytes
- Search: 825,000 raw / 175,000 gzip bytes
- Per-Psalter-arrangement asset: 8,000 raw bytes
- Complete core distribution: 30 MiB
- Optional instrument packs: 3,153,044 bytes, separately hosted and excluded from initial precache

The default public build with the source-bound All Creatures opening fix qualified on 2026-10-22 measured 500,528 raw / 130,226 gzip bytes for the initial application and 1,208,978 raw / 359,478 gzip bytes for the additional viewer closure. These measurements use disabled optional reporting and a seven-character public build marker; a different marker may slightly change compressed sizes. Run the gate again for the exact source and settings you ship. The limits above are ceilings, not these measurements.

All 474 viewer arrangements and all 267 core piano/concert-grand/organ samples must remain offline-covered. The optional banks validate all samples before declaring readiness; browser storage can later be evicted.

Source-bound display adapters keep their exact musical identity guards, layout bounds, and native-render fallback. A budget pass does not prove native browser geometry, listening quality, print correctness, device installation, accessibility, or score fidelity. See [release checks](release-checklist.md), [accessibility](accessibility.md), and [deployment](deployment.md).
