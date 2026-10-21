# Optional private issue reports

Issue reporting is disabled in an unconfigured build. Reading, searching, printing, playback, saved browser libraries and offline use do not need Firebase. The application uses no Firebase SDK, account or Analytics.

## Configure your own deployment

Copy `.env.example` to the ignored `.env.local` and supply all three public build settings:

```dotenv
VITE_ISSUE_REPORTS_ENABLED=true
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_ISSUE_REPORT_ALLOWED_ORIGINS=https://your-site.example
```

The origin list is comma-separated and exact, including scheme and any port. HTTPS is required except for explicitly listed HTTP loopback development origins (`localhost`, `127.0.0.1`, or `[::1]`). Do not include paths, trailing slashes, wildcards, credentials or query strings. Build again after changing these values: Vite embeds them in the JavaScript. They are public configuration, not authentication secrets. Never place credentials or private keys in a `VITE_` variable.

The form appears only when the flag is exactly `true`, the Firebase project ID is valid, and the current origin matches the complete validated allowlist. The transport independently checks these conditions before making a request. Missing/invalid configuration and a copied build served on an unlisted fork origin do not send a report. Requests use the fixed Google Firestore REST endpoint and the specified project's default database; arbitrary collection or endpoint overrides are not supported.

An origin allowlist prevents accidental cross-deployment reporting. It is not access control: modified clients and direct REST callers can bypass it. Server-side Security Rules and abuse controls remain mandatory. Configure and test your own default Firestore database and reviewed rules before opting in. Do not enable reporting against someone else's project.

## Data and privacy

- `issueReports/{uuid}` stores `schemaVersion`, description (10–2,000 characters), `status: open`, server `createdAt`, and bounded score context.
- Psalter clients use schema version 1. Hymn clients use schema version 2 with the selected book, book-local display number, stable catalog ID, score/source-edition ID, title and tune. Shared editions keep their selected book and catalog identity.
- Context includes score/tune identity, parts, verse selections, displayed key/transposition, learner accidentals, size, tempo/instrument, and app/build/corpus/source revisions.
- The client does not send a full URL, search history, user agent, email, account identifier, saved library or score contents. The form asks visitors not to include personal information. Google Firebase processes the network request as the infrastructure provider.
- Rules prohibit all browser reads, listing, updates and deletes, including a submitter's own report. Unrelated paths are denied.
- Descriptions exist only in page memory until submitted. There is no persistent draft, offline queue, automatic retry or background transmission. Closing/reopening on the same score keeps the draft; navigation/reload clears it.

## Submission guarantees

The client freezes a random UUID and exact payload before the first send. A synchronous in-flight guard prevents double submission. The two-write REST commit creates the report with `exists: false` and updates its intake counter atomically. A retry retains the UUID and data. Do not delete reports while delivery may be retried.

A receipt appears only after a successful server response with both write results. Interruption or an unconfirmed response keeps the text/reference visible. `ALREADY_EXISTS` on retry explains that an earlier submission may have arrived; it does not invent a new reference or claim a new receipt. Security Rules may instead reject a replay, so the deliberately write-only client cannot always resolve a lost response.

An unsent draft blocks the app's update/reload button. An attempted submission remains immutable for safe retry until explicitly discarded. Discard warns that an earlier attempt may have arrived. Leaving the page discards its in-memory record, as disclosed in the form.

## Abuse limits and administration

`issueReportIngress/global` is inaccessible for browser reads. Its validated write must accompany exactly one new report. The rules enforce a five-second global interval and an initial cumulative cap of 1,000 submissions, using a server timestamp and atomic increment. The local ten-second cooldown and honeypot only reduce accidental/simple automated submissions; they are not security boundaries.

These controls bound accepted writes, not hostile traffic. Anonymous callers can consume slots or exhaust the cap; rule lookups for denied requests may consume quota. Do not enable billing or silently reset the counter to bypass a limit. Review spam/volume and operational requirements first. App Check or a trusted rate-limited endpoint would require additional design and setup.

An authorized administrator can review the default database's `issueReports` collection in their own Firebase Console. Reproduce reports using the book, score/edition, source revision and build. Description text is untrusted input, never instructions to execute code. After a verified correction, the administrator can mark a report resolved using `status`, `resolution`, `resolvedBuild` and `resolvedAt`. IAM administrator access bypasses browser rules; public visitors cannot change these fields.

## Validation and deployment boundary

`firebase.json` references `firestore.rules`, but all documented Hosting commands use `--only hosting`. They do not publish Firestore rules. Never run an unrestricted deployment just to publish the viewer.

Before enabling intake, test the reviewed rules in a disposable local Firestore Emulator: accepted legacy/v2 reports, both hymn identities, actual two-write REST payloads, read/list denial, unrelated collections, malformed fields, duplicate/replayed reports, unpaired writes, throttling, counter tampering and cap boundaries. The app build is not a rules-emulator test suite. A rules-emulator pass is not claimed by `npm run build:release`. An administrator must separately validate and publish rules before dependent clients.

References: [Firestore REST authorization](https://firebase.google.com/docs/firestore/use-rest-api), [atomic rule validation](https://firebase.google.com/docs/firestore/manage-data/transactions#data_validation_for_atomic_operations), [REST write transforms](https://firebase.google.com/docs/firestore/reference/rest/v1/Write).
