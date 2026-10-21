# The Psalter Viewer

A responsive, installable, local-first React viewer for *The Psalter* (1912), separately photographed later settings and addenda, and additional hymnbooks. Scores use a source-checked ABC notation corpus.

**Original software and musical content have separate rights.** Original application code and associated original documentation use the [MIT License](LICENSE), with explicit content and third-party exclusions in [LICENSE-SCOPE.md](LICENSE-SCOPE.md). The retained corpus has edition-specific qualifications; MIT does not license the whole corpus. See [licensing](docs/licensing.md) and the [public-source guide](docs/public-release.md) before redistributing content.

**Source-only checkout:** Audio binaries are not tracked. Run the explicit [audio preparation](docs/audio/setup.md) step before playback, offline installation or building a complete app. It fetches 442 hash-pinned upstream samples and reproduces three Db8 extensions locally.

## Current capabilities

- all 450 numbered Psalter selections as 474 distinct arrangements, including 24 alternate settings and the separately photographed later addenda
- two additional installed books: Traditional Hymns, with 52 selections, and Traditional and Contemporary Hymns, with 97 selections; they share 97 source editions
- search by number, title, tune, composer, lyrics, and encoded Psalm metadata
- open the referenced King James Version Psalm from a locally bundled, offline-readable text
- responsive ABCJS notation without preserving photographed line breaks
- semitone transposition and score scaling
- concert grand, compact piano, and organ playback for all voices or a selected combination of parts
- optional soprano emphasis for independently identified SATB scores, with the source mix unchanged by default
- optional nylon guitar and harpsichord packs downloaded when selected
- single-part display for soprano, alto, tenor, bass, and exceptional extra voices
- favorites, recent selections, and named service/song lists saved on this browser
- combined service booklet printing with each song’s saved key, parts, and selected verses
- share links preserving the book, song, key, parts, tempo, verses, and display settings
- current-view ABC downloads with the displayed parts, key, verse grouping or music-only setting, tempo, attribution, and rights notices
- installable PWA shell with cached notation and the original three instrument banks; downloaded optional banks remain offline when browser storage permits

The historical score is the transcription authority. Generated or public music files may help with checking, but they do not override the photographed pages.

## Additional hymnbooks

The Psalter remains the default book on the home page and for routes without a valid book selection. The Library offers the two additional hymnbooks; explicit hymn links and saved selections open their chosen book. Saved libraries remain specific to each browser and exact website origin.

The included hymn editions retain their original ABC, source attribution, license links, editorial notes and territory qualifications. Book numbers follow the included entries; the original H/B catalog identifier is also shown. The two books share notation assets, but each book retains its own membership and stable route. Their footers link to a reviewed recording from the corresponding playlist, with tune/version qualifications where applicable, and to the full playlist. When separately configured, optional issue reporting supports both books and retains the selected edition and score settings.

Parts follow the selected edition: independent voices, chordal staves, or a melody with chord symbols. The app does not invent four SATB parts or synthesize an unprinted chord-symbol accompaniment. Most editions carry source-specific U.S. public-domain assertions; OpenPsalm arrangements require CC BY 4.0 attribution. This is not blanket worldwide clearance. “I Have Decided to Follow Jesus” remains excluded pending exact-edition rights evidence, as do other originally held or excluded catalog entries.

## Playback balance

In Score settings, **Emphasize soprano** softens the other selected parts while soprano remains selected. It is available only for four separately identified soprano, alto, tenor, and bass parts. The original mix is the default; solo parts and selections without soprano keep their original level. Changing the option stops current playback; press Play to hear the new mix.

This is a listening preference, not an edit to the score or its dynamics. Backing note volumes are multiplied by 0.65 and rounded to integers for ABCJS; positive volumes stay at least 1, and silence stays silent. Soprano is not boosted. ABCJS 6.7.0 applies these values as linear sample gain; perceived balance depends on the instrument and listening device. The choice is retained in saved selections, share links, and approved app updates, but starts off when navigating to another song.

## Saved library and exports

Favorites, recent selections, and service lists use browser-local storage. They work without an account or network connection after the app is installed, but do not sync between browsers or devices. Clearing browser data also clears this saved library. A share link contains only the selected song and viewer settings; it does not share a person’s saved library.

Service booklet preparation validates every saved book, tune, part, and verse selection before printing. Missing or invalid selections require attention rather than silently replacing the song or printing all verses. The current ABC download applies the displayed parts, key, verse grouping or music-only setting, and tempo, retaining source credits and rights metadata. Where the separate full-original-source download is offered, it retains every original verse without applying current display settings or published verse variants. Exporting does not alter the canonical score; engraving and playback may differ in other ABC tools.

## Install on Android

Open your chosen HTTPS deployment in Chrome and choose **Install app** from Chrome's menu. This installs the web app; this repository does not distribute an Android APK. Samsung Internet can still open the site normally, but its PWA install flow has been [reported to trigger an outdated-Android safety warning](https://github.com/SamsungInternet/support/issues/123) on some devices. If that warning appears, do not bypass it; install through Chrome instead. Physical-device installation and offline playback still require release QA.

## Development

Use Node.js 24, pinned by `.node-version`. The package metadata accepts Node.js 22.12 or newer. Install the locked dependencies, prepare the separately licensed audio, then start the local development server. Audio generation additionally needs an installed FFmpeg 7.1.5 with libmp3lame; see [setup and exact reproducibility requirements](docs/audio/setup.md).

```sh
git clone https://github.com/jarodhanko/psalter.git
cd psalter
npm ci
npm run audio:prepare
npm run dev
```

Prepare a release locally:

```sh
npm run build:release
```

`npm run build:release` first verifies all prepared audio and required license notices without network access, then generates canonical data, checks tracked-file safety and Hosting configuration, type-checks, builds, and checks emitted-artifact integrity and budgets. The automated test suite and mandatory test runs were removed on 2026-10-16. No test suite or aggregate corpus, lyric, or rights audit runs in this command; the new prepared-audio check requires all 445 exact asset hashes and their license notices. Source-specific diagnostic commands remain available when needed. Build output is written to `dist/`; preview it locally with `npm run preview`.

Verification and deployment are manual. This public source contains no GitHub Actions workflows or deployment automation. Inspect changed behavior in a native browser and record any device, print or listening checks not performed. See [deployment](docs/deployment.md) for explicit Hosting-only deployment to your own Firebase project. Historical test results are not results for the current source.

## Optional issue reporting

No Firebase configuration is required. Reporting is disabled by default; after the separate audio preparation step, score viewing, playback, and the saved library work without Firebase. The report form is hidden and submission is blocked unless all three build-time settings are valid:

- `VITE_ISSUE_REPORTS_ENABLED=true`
- `VITE_FIREBASE_PROJECT_ID` identifies your own configured Firebase project
- `VITE_ISSUE_REPORT_ALLOWED_ORIGINS` contains the current exact origin, as a comma-separated list of HTTPS origins; HTTP localhost is accepted for development

Start from [.env.example](.env.example) if you need this feature. Do not point a fork at the original site's issue queue. A project ID and origin list are public build configuration, not credentials or authorization: secure the queue independently, review its data handling, and test its Firestore rules before enabling reports. Never put a private key, token, or secret in a `VITE_*` variable. See the [reporting configuration and privacy guide](docs/issue-reporting.md), [deployment](docs/deployment.md#optional-reporting-on-your-own-project), and [SECURITY.md](SECURITY.md).

## Project structure

- `src/psalter-abc/<arrangement-id>.ts` — canonical, per-arrangement Psalter ABC source
- `src/psalter-abc.ts` — stable compatibility re-export entry point; edit the arrangement modules
- `src/data/generated/` — ignored, regenerated Psalter app data; never edit by hand
- `src/data/` — catalog construction and corpus metadata
- `src/data/hymns/` — additional hymn editions, attribution, source records, and generated catalogs
- `src/domain/` — songbook-neutral data types
- `src/features/viewer/` — score rendering and playback UI
- `src/features/psalms/` and `src/data/psalms/` — offline Psalm reader and versioned KJV text
- `docs/architecture.md` — local-first/Firebase decision and evolution plan
- `docs/canonical-psalter-source.md` — source-module and generation contract
- `docs/musicxml.md` — evaluated conversion boundary and round-trip acceptance gates
- `docs/provenance.md` — source-of-truth, provenance, and per-setting rights-review notes
- `docs/photo-qa.md` — independent, photograph-grounded transcription approval protocol
- `docs/rights-audit.md` — historical U.S. rights research and printed-notice inventory; see the newer assessment in `docs/licensing.md`
- `docs/performance.md` — enforced bundle and whole-corpus offline budgets
- `docs/accessibility.md` — implemented behavior and the manual accessibility release matrix
- `LICENSE` and `LICENSE-SCOPE.md` — MIT for original code/documentation, with content and third-party exclusions
- `docs/licensing.md` — current rights evidence and content qualifications
- `docs/public-release.md` — clean-source boundaries and distribution qualifications
- `docs/deployment.md` — local verification and manual deployment to your own Firebase project

## Status

This is still a pre-release project. The working Psalter corpus covers all 450 numbers and 474 viewer arrangements. Coverage and structural tests do not replace independent source-photo review, accessibility testing, or physical-device install/offline QA. MusicXML remains deferred because the documented conversion prototype did not preserve voices and lyrics reliably enough for this corpus.

The original code/documentation license is MIT. Redistribution requires evaluating the exact content and intended territory. [Follow-up U.S. rights research](docs/licensing.md#psalter-current-evidence-not-presumptive-removal) has not established a reason to remove Psalter nos. 1–434: the original 1912 material has expired, later-registration searches provide supportive non-renewal evidence, and a 2017 revision-committee article describes the existing music as public domain. Narrow checks remain for separately published texts and later material, especially no. 442's 1954 harmony; this is not absolute worldwide clearance. Added hymnbooks retain their separate edition-specific qualifications. This clean source retains all current music without granting rights the author does not hold. The public deployment is [oldpsalter.com](https://oldpsalter.com/). Production uses indexable metadata and a sitemap; the separate preview Hosting profile retains noindex. Neither setting restricts access or settles rights.

Third-party components and audio assets are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Contributing

Please keep changes small and testable. Do not silently replace a transcription with another hymnal's setting: compare every note against the photographed Psalter source and document any correction. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Help improve the viewer

Reproducible issue reports and focused pull requests are welcome, including AI-assisted investigations reviewed and authorized by their users. Search for duplicates, include the exact score/edition, build and settings, distinguish observed behavior from guesses, and protect personal data. Musical corrections need human verification against the authoritative source. See [Contributing](CONTRIBUTING.md#ai-assisted-contributions) and the issue and pull-request templates.
