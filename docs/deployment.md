# Manual Firebase Hosting deployment

The viewer is a static PWA. Its production build is `dist/`; the complete selected score corpus is bundled for offline use. Firebase is not required for local score viewing or development. Optional issue reporting is a separate, explicitly configured feature.

These instructions are for a Firebase project you own and are authorized to publish to. They do not select the public music set, grant a license, or authorize use of the original site's project or issue queue. Review the [content and distribution qualifications](public-release.md) before distributing a public build.

## Build and verify locally

Use Node.js 24 from `.node-version`, install the lockfile, prepare audio, and run release preparation. See [audio setup](audio/setup.md) for the separately installed FFmpeg 7.1.5 requirement and pinned upstream licenses:

```sh
npm ci
npm run audio:prepare
npm run build:release
```

`npm run build:release` first checks all 445 prepared audio hashes and required license notices without network access, then generates canonical data, checks tracked-file safety and Hosting configuration, type-checks, builds, and checks emitted-artifact integrity and budgets. It does not run an automated test suite or aggregate corpus audit. Reporting is disabled by default. A plain `npm run build` is useful during development but does not run the narrow release safeguards. Optional music, rights-notice and audio diagnostics remain available for source-specific investigations.

This source includes no GitHub Actions workflows. Verification and deployment are manual; do not assume a hosted check ran.

## Choose your own project explicitly

Use the repository's installed Firebase CLI after `npm ci`. Authenticate using your own authorized Firebase account. Keep `.firebaserc`, `.firebase/`, local environment files, and credentials out of Git.

Replace the placeholder with your own Firebase project ID; do not substitute the original application's project ID:

```sh
FIREBASE_PROJECT_ID='your-project-id'
npx firebase emulators:start --only hosting --project "$FIREBASE_PROJECT_ID"
```

Confirm the selected project and Hosting site before every publication. If your project has multiple Hosting sites, configure and review an explicit Hosting target for your own site before continuing; these examples assume the project's default site. Do not copy an owner-specific deployment profile or reuse an inherited service-account secret.

Test search, alternate settings, selected parts, transposition, playback, saved lists, ABC exports, printing, deep links, install/update behavior, and an offline reload. Browser and physical-device checks remain necessary even when the build and narrow safeguards pass.

## Optional reporting on your own project

Copy `.env.example` to an ignored `.env.local` only if you want to configure reporting. Default values leave it disabled:

```dotenv
VITE_ISSUE_REPORTS_ENABLED=false
VITE_FIREBASE_PROJECT_ID=
VITE_ISSUE_REPORT_ALLOWED_ORIGINS=
```

To opt in, set the enabled flag to `true`, provide your own valid project ID, and list the exact approved browser origins, separated by commas. Use HTTPS for deployed origins; HTTP localhost is accepted for development. For example, an origin has the form `https://your-site.example` or `http://localhost:5173`, without a path, query string, or wildcard. Ports are part of an origin. A preview's origin must also be explicitly listed if reports should work there.

All three conditions must match before the form appears or submission can proceed. Changing these values requires rebuilding. These are public client settings, not secrets. Never store service-account keys, access tokens, or other private credentials in `VITE_*` variables, which are compiled into browser assets.

Before enabling the form:

1. Set up and administer your own queue and review the data it will receive, access policy, retention, quotas, and abuse controls.
2. Review and emulator-test `firestore.rules` against the client payload. Its create-only rules and intake controls are a starting point, not a promise that a newly created database is configured securely.
3. Publish any needed database rules separately, under your own authorization, and verify the intended policy. The Hosting commands below do not deploy Firestore rules.
4. Rebuild with your explicit settings, run release preparation, and test the configured origin and a non-allowed origin. Use disposable test data and your own test project.

The origin check prevents accidental use from an unconfigured fork; it is not server-side authentication or an abuse-control boundary. Other clients can call a public endpoint independently of this UI. See the [reporting configuration and privacy guide](issue-reporting.md) and [SECURITY.md](../SECURITY.md).

## Optional preview

After the final local gate passes, deploy a Hosting preview to your own project:

```sh
npx firebase hosting:channel:deploy review --expires 7d --no-authorized-domains --project "$FIREBASE_PROJECT_ID"
```

A preview URL is accessible to anyone who has it. `--no-authorized-domains` avoids synchronizing preview domains into Firebase Authentication, which this viewer does not use. Do not upload source scans, private records, credentials, or an unapproved content set. Test the returned HTTPS URL; do not assume local behavior proves deployed behavior.

## Production: Hosting only

With your exact final `dist/` already verified and the intended project/site checked:

```sh
npx firebase deploy --only hosting --config firebase.production.json --project "$FIREBASE_PROJECT_ID"
```

Do not use a bare `firebase deploy`: the checked-in `firebase.json` also references Firestore rules. `--only hosting` restricts this operation to Hosting and does not provision or secure an issue queue. Keep the validated build unchanged between review and deployment. Record the commit, build hashes, target project/site, release ID, returned URL, and timestamp in your own release record; do not include credentials or private reports.

`firebase.json` is the safe preview profile and retains `X-Robots-Tag: noindex, nofollow`. `firebase.production.json` is the explicit production profile and omits that global header. The source HTML is indexable, while the preview response header still keeps previews out of search. These settings are not access controls and do not establish content rights. The checked-in canonical metadata, About page and sitemap identify oldpsalter.com; update them to your own public origin before publishing a fork. Do not add noindex to production or copy its indexable profile to a preview accidentally.

## Verify the deployed site

Check HTTPS, manifest/icons, deep links, score/search loading, playback, printing, saved library, ABC downloads, and service-worker updates. If reporting is enabled, verify its configured origin and destination using only authorized test data.

Hosting applies headers to the requested path before the SPA rewrite. Check `/` and a query-string deep link directly, not only `/index.html`. The app entry points, service worker, and manifest should revalidate; hashed assets remain immutable under the existing configuration.

For Android installation, record the device, Android version, browser/version, exact install path, and an offline launch. The repository builds a web app, not an Android APK. Do not bypass browser or operating-system security warnings. Test each supported browser separately rather than extrapolating one successful installation to another.

### Service-worker update checks

The build validator checks offline coverage and generated service-worker integrity. This source has no automated update-resilience test suite; check interrupted updates in the browser using a disposable local origin.

For browser testing, prepare isolated fixture roots from the exact validated `dist/`:

```sh
npm run prepare:pwa-update-fixture -- --force
```

This writes only under ignored `temp/service-worker-update-fixture/`. Serve one root at a time on the same test origin:

1. Install `release-a`, wait for offline readiness, and verify offline search, scores, and playback.
2. Return online, switch to `release-b-broken`, and request an update. Its missing precache asset must leave release A active and usable offline.
3. Switch to `release-b-repaired`, request another update, accept the prompt, and verify release B and its offline behavior.

Never publish a fixture root to a real user-facing site. Record the browser and observations; an unobserved stage remains unverified.

## Rollback

Keep the previous verified release until the replacement passes live checks. An authorized administrator can use **Hosting → Release history → Roll back** in the Firebase Console. A rollback points a new release at the earlier built version; it does not rebuild the source or roll back Firestore rules. Alternatively, rebuild a recorded known-good source commit, rerun release preparation, and deploy Hosting only to the same explicitly named project.

## References

- [Firebase Hosting local testing and preview deployments](https://firebase.google.com/docs/hosting/test-preview-deploy)
- [Firebase CLI deployment targets](https://firebase.google.com/docs/cli/targets)
- [Managing Hosting releases and versions](https://firebase.google.com/docs/hosting/manage-hosting-resources)
