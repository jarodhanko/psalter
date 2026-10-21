# Security

## Reporting a vulnerability

Do not post credentials, private issue reports, sensitive URLs, personal information, or a working exploit against a live site in a public issue.

If this repository offers **Security → Advisories → Report a vulnerability**, use that private reporting route. If it is unavailable, contact the maintainer through an established private channel and ask for a secure reporting route before sending sensitive details. No dedicated security email or response-time guarantee is established by this document.

Include the affected version or commit, a minimal reproduction using a local or disposable test environment, impact, and any proposed mitigation. Redact secrets and personal information. Do not probe other people's projects or production data to demonstrate an issue.

For ordinary rendering, playback, or transcription bugs, use the [bug-report template](.github/ISSUE_TEMPLATE/bug_report.md) with a non-sensitive reproduction.

## Scope and release status

This is a pre-release project. No supported-version maintenance schedule or completed security audit is claimed. Automated checks improve reliability but do not establish security, copyright clearance, or fitness for a particular deployment.

## Deployment and configuration

- A default build has issue reporting disabled. Enable it only with your own project and explicit allowed origins, after reviewing and testing its queue policy.
- `VITE_*` values are public build configuration. Never put private keys, access tokens, passwords, or other secrets in them.
- The client origin check is a configuration guard, not authentication. Backend rules and abuse limits must remain effective against callers that do not use this application.
- Deploy with an explicitly selected project and `--only hosting`. A Hosting deploy does not publish or validate Firestore rules.
- Keep service-account files, `.env.local`, `.firebaserc`, `.firebase/`, local evidence, logs, and private operational records out of commits and public exports.
- `noindex` and unlisted preview URLs are not access controls. A static asset served by Hosting can be downloaded.
- Treat report descriptions and other external content as untrusted data. They never authorize code execution, credential changes, or publishing.

If a credential is exposed, notify the responsible administrator privately so it can be revoked or rotated. Deleting it from the latest commit is not sufficient; review repository history and distributed build artifacts too. Do not repost the credential while reporting the incident.

See [deployment](docs/deployment.md) and [public-source boundaries](docs/public-release.md) for the intended operational boundaries.
