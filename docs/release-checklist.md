# Local release checklist

Run these checks against the exact source and artifact you intend to distribute. This checklist does not claim a historical deployment or previous build verifies the current one. There are no GitHub Actions workflows in this source.

## Build and narrow release safeguards

- Install locked dependencies with Node.js 24 and `npm ci`.
- Run `npm run audio:prepare` explicitly with the [documented FFmpeg toolchain](audio/setup.md). Keep all 445 prepared audio files and the download cache ignored; verify all hashes with `npm run audio:verify`.
- Run `npm run build:release` locally. Record the exact version and all passed, failed, or unrun stages. The automated suite and mandatory test runs were removed; do not present historical tests as current verification.
- Verify 450 canonical Psalter numbers, 474 viewer arrangements, 97 added-hymn editions, source/generator identity, and all required notices.
- Preserve full corpus, source-bound runtime guards and printed-source evidence, audio ranges, bundle budgets, and offline/update guards.
- Keep issue reporting disabled by default; separately test deliberate own-project configuration.

## Source and rights review

- Check score corrections against the exact printed source, including all voices, rhythms, words, repeats, accidentals, underlay, and alternate settings.
- Preserve incomplete or inferred-underlay qualifications. Structural validation is not complete independent source-photo approval.
- Review [license scope](../LICENSE-SCOPE.md), [current rights evidence](licensing.md), historical [notice inventory](rights-audit.md), edition records, and third-party notices for the intended territory.
- No removal requirement has been established for Psalter nos. 1–434. No. 442's exact 1954 harmony remains unresolved; bounded negative renewal searches and unavailable supplement pages do not establish absolute clearance.
- Include no private scans, issue reports, credentials, owner deployment profiles, release receipts, or inherited automation.

## Browser and device checks

- Search, deep links, alternate settings, part selection, transposition, score sizes, playback and note tracking
- Favorites, recent songs, saved lists, stale/invalid selections, and ABC downloads
- Narrow mobile and desktop layouts, keyboard traversal, screen reader, zoom and high contrast
- Letter/A4 print and Save as PDF, long scores, selected stanzas, alternate tunes, and layout after canceling print
- Actual-device PWA installation and offline launch, playback, updates and interrupted updates
- Optional instrument download, cancellation, retry, offline readiness, and cache eviction

Synthetic SVG metrics and historical automated service-worker evidence do not certify these device/browser outcomes. Keep incomplete checks explicit.

## Manual deployment

Follow [deployment.md](deployment.md) using your own explicitly named Firebase project and Hosting-only command. Do not deploy Firestore rules implicitly or publish service-worker fixture roots. Confirm the intended exact artifact, content scope, URL, cache headers and service-worker update after deployment. Preserve your own rollback record privately.
