# Contributing

Original application code and associated original documentation use the [MIT License](LICENSE); [LICENSE-SCOPE.md](LICENSE-SCOPE.md) separates musical content and third-party assets. The retained content has edition-specific qualifications. Preserve this boundary in contributions, identify third-party material and its terms, and do not grant rights on someone else's behalf or turn a source's U.S. status into a worldwide claim. Original code that processes content remains MIT, including code in data or test directories; embedded music, lyrics, and other third-party fixture content keep their own terms.

## Source-of-truth rule

The photographed source pages are authoritative for notes, words, tune boundaries, and alternate settings. Distinguish the 1912 base edition from the separately documented later settings and addenda. Other editions, MIDI, MusicXML, OCR, and hymn databases are checking aids only. If sources disagree, preserve the photographed setting and record the discrepancy. Do not upload private scans to a public issue or pull request; cite edition, page, arrangement, voice, and measure instead.

## ABC conventions

- Edit `src/psalter-abc/<arrangement-id>.ts`, one canonical module per arrangement. `src/psalter-abc.ts` is the ordered compatibility re-export entry point.
- Keep one canonical `psalter<number>` export for every number 1–450. The working viewer has 474 distinct arrangements; compatibility exports and aliases are not extra viewer arrangements.
- Keep alternate tunes as distinct exports associated with the same number.
- Preserve semantic musical structure, not the source page or system line breaks. The viewer must be free to reflow notation at different widths.
- Declare voices explicitly and retain exceptional parts instead of forcing every score into SATB.
- Compare changed ABC directly with its authoritative source and inspect the affected score behavior. Optional diagnostics can support a specific investigation.
- Preserve printed rights notices, edition attribution, provenance, and existing release holds. A transcription correction does not clear an edition for distribution.
- Never edit `src/data/generated/`; generation replaces that ignored directory. See [canonical source and generation](docs/canonical-psalter-source.md).

## Local setup

Use Node.js 24 from `.node-version` and the lockfile:

```sh
npm ci
npm run dev
```

`npm ci` generates Psalter app data through `postinstall`. If dependency scripts were deliberately skipped, run `npm run generate:psalter` before low-level TypeScript or diagnostic commands. Reporting is disabled by default; no Firebase account or owner configuration is needed to work on the viewer.

## Pull-request checklist

1. Explain the source page(s) checked and the musical change, if any.
2. Run `npm run build:release` locally for generation, TypeScript, the production build and narrow artifact/security checks. There is no automated test suite or test-run prerequisite. Record failures and unrun stages accurately.
3. Preserve all 450 canonical Psalter numbers and 474 arrangements, source-bound runtime guards, and edition-level attribution. A parser pass is not independent score proofreading.
4. Inspect changed behavior at narrow mobile and desktop widths; check relevant update, audio, print and offline flows and state physical-device gaps explicitly.
5. Do not include scans, scratch transcriptions, credentials, generated `dist/`, local environment files, Firebase aliases, or private issue reports. `npm run validate:release-safety` checks a baseline of tracked-file patterns; it is not a complete secret or rights audit. Keep private source evidence under ignored `temp/` or `reference/`.
6. Keep reporting disabled unless deliberately testing your own configured queue. Do not send test reports to the original project's production database.

There are no GitHub Actions workflows in this public source. Verification and deployment are manual; run release preparation locally. See [deployment](docs/deployment.md) and [public-source boundaries](docs/public-release.md).

For ordinary bugs, use the [bug-report template](.github/ISSUE_TEMPLATE/bug_report.md). For vulnerabilities or accidental private-data exposure, follow [SECURITY.md](SECURITY.md) rather than posting details publicly.

## AI-assisted contributions

AI-assisted investigation and contributions are welcome. If an assistant notices a possible issue, it should first explain it to its user and obtain their authorization before opening an issue or pull request on their behalf. This invitation is not permission for unattended agents to file reports or change music.

- Search existing issues and pull requests before reporting; contribute evidence to an existing report instead of duplicating it.
- Submit a small, reproducible observation with the exact book, number, arrangement or edition, app build, relevant settings, expected result, and actual result.
- Distinguish an observed defect from a hypothesis. Include a minimal reproduction and source evidence you are allowed to share; disclose AI assistance and what a human actually checked.
- Do not submit bulk speculative reports, fabricated listening or device results, private reports, personal data, credentials, or copyrighted/private scans.
- Musical changes require a human comparison with the authoritative source. AI output, OCR, a different edition, or a plausible-sounding correction is not sufficient evidence. Preserve existing rights notices and source-bound safeguards.

Use the issue and pull-request templates to record verification and remaining uncertainty. Maintainers may close unsupported or repetitive reports.

## Data evolution

New songbooks should implement the shared domain model and ship as versioned, independently loadable content. Do not make the core viewer depend on a network database; an installed copy must remain useful offline.
