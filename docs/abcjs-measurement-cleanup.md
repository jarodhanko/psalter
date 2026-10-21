# ABCJS measurement DOM cleanup

ABCJS is pinned to 6.7.0 while a narrowly scoped local patch is needed. The patch
manifest is `patches/abcjs-6.7.0-measurement-cleanup.json`; its upstream code remains
under the ABCJS MIT license in `THIRD_PARTY_NOTICES.md`.

## Scope

- Automatic wrapping creates a disposable measurement controller before the real
  render. Its `finally` block removes only that controller's fallback `dummySvg`.
- `tuneMetrics` removes only its controller's `dummySvg` and its own hidden DIV,
  including when measurement or controller construction throws.
- Caller-owned render hosts, unrelated DOM nodes, measurement results, exception
  identity, musical source and wrapping decisions are unchanged.
- `getMeasureWidths` itself is deliberately untouched. Source-bound application
  checks must still be able to detect its fallback SVG and reject guessed metrics.

This fixes a conditional DOM-retention defect reproduced with synthetic zero-height
SVG measurements and injected exceptions. Normal attached measurements did not
retain these nodes in the control. This is not evidence that the defect caused a
browser crash, Chromium Error 9, a race, or an infinite loop.

## Reproducible installation

`npm ci` invokes `npm run patch:abcjs` in `postinstall`. Release builds and direct
Vite build/dev invocations also apply the patch, covering installs that disabled
lifecycle scripts. Repeated application is a no-op.

The applicator checks the exact installed package version and the full SHA-256
of both source files before writing either. It accepts only the reviewed pristine
or patched bytes, and refuses unknown versions/content. A partial application can
be resumed. Dependency upgrades require an explicit review and replacement or
removal of this patch, not weaker guards.

## Optional bounded diagnostic

Run `npm run check:abcjs-cleanup` after installation. It runs synthetic JSDOM
controls against the installed patch and a temporary, hash-verified reconstruction
of upstream 6.7.0. It checks repeated public measurements and attached/detached
wrapping, zero-height geometry, injected measurement/constructor exceptions,
unrelated nodes, caller hosts, unchanged rendered output/metric results and the
unchanged lower-level fallback signal.

This optional diagnostic is not part of the build-only release pipeline and does
not reinstate an automated test-suite prerequisite. It does not replace native
browser acceptance of the changed behavior, including repeated renders, narrow
and desktop layouts, size changes, and interrupted rendering. Use
`npm run build:release` for the existing TypeScript and artifact-integrity checks;
the raw/gzip budgets are unchanged.
