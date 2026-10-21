# Public source and distribution boundaries

This is a clean source export of the Psalter viewer. It retains all current application and music source: 450 canonical Psalter numbers, 474 viewer arrangements, and 97 source editions shared by the two additional hymnbooks. No score editions were removed in preparing this source. The 445 audio MP3 binaries are deliberately not tracked; [explicit audio preparation](audio/setup.md) downloads 442 pinned upstream originals and reproducibly creates three extensions before a complete build.

## Included

- Viewer application, canonical score modules, catalog data, generator inputs and required source-evidence fixtures
- Reproducible build and diagnostic tools, dependency lockfile, generic Hosting configuration and optional reporting rules
- Standard [MIT license](../LICENSE) for original code/documentation, a separate [scope statement](../LICENSE-SCOPE.md), third-party licenses/notices, edition records and source/asset provenance
- Sanitized musical correction records and their incomplete-review qualifications

Generated Psalter app data is ignored and recreated during installation and build. Retained generated hymn catalogs can be checked against their source inputs with `node src/data/hymns/generate.mjs --check`. Private source photographs and working evidence are not distributed; source identities, public references, musical findings and regression witnesses remain where applicable.

## Deliberately excluded

Audio MP3s and their local download cache, original Git history, owner-production profiles, deployment wrappers/helpers, the removed automated test suite, inherited GitHub Actions workflows, Hosting receipts/provider inventories, private issue-queue records, operational handoffs and release logs, scans/research attachments, dependency directories, build artifacts, caches and credentials are outside this export.

There are no GitHub Actions workflows. Release preparation is local and deployment is manual. No automated test suite or required test run is included. See [development instructions](../README.md#development), [release checks](release-checklist.md), and [manual Hosting deployment](deployment.md). Publishing source does not trigger or authorize deployment to an existing live site.

The audio script runs only when explicitly invoked, never during installation or in the browser. A source-only checkout is not an out-of-the-box playable/offline app. Required asset and license checks fail rather than silently accepting an incomplete build.

## Safe defaults

The unconfigured application requires no Firebase project or account. Optional issue reporting remains hidden and submission is blocked without an explicit enabled flag, valid own-project ID, and exact allowed origin. A client-side origin check is a configuration guard; independent backend authorization and abuse controls remain necessary. See [configuration and privacy](issue-reporting.md).

## Music rights remain separate

MIT does not license the complete music corpus or every asset. Existing grants, attribution, change notices and territorial limits remain edition-specific. The [current assessment](licensing.md#psalter-current-evidence-not-presumptive-removal) has not established a reason to remove Psalter nos. 1–434. Old copyright/permission wording alone does not prove a continuing right.

No. 442's exact 1954 Henry Bruinsma harmony remains unresolved. A bounded official renewal-dataset identifier/name search found no target match, but 98.37% of records lacked title fields. The exact 1954 supplement page 42 and its cover/copyright page were unavailable in the bounded public-source search, so exact-harmony comparison remains unperformed. These limits must not be restated as absolute clearance or as affirmative proof requiring removal.

Added hymn editions retain individual source/territory qualifications, including FINLANDIA's U.S./European distinction, OpenPsalm CC BY attribution, and acquisition/source caveats. “I Have Decided to Follow Jesus” remains excluded under its existing exact-edition hold. The KJV text retains its UK Letters Patent caveat.

Source publication and live application delivery are separate distribution surfaces. A static app delivers downloadable/offline score and lyric assets; withholding source files alone would not resolve that distribution question. Technical tests and source inclusion do not establish worldwide clearance or grant rights the author does not hold.
