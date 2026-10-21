# Offline KJV Psalm corpus

`src/data/psalms/kjvPsalms.json` is a compact, statically bundled corpus used by
`src/data/kjvPsalms.ts`. The loader imports it dynamically, so Vite emits a
separate JavaScript chunk; the existing PWA precache pattern includes JavaScript
chunks. The corpus therefore loads lazily in the app and is available after the
service worker has installed the application for offline use.

## Provenance and rights

The text is the King James (Authorized) Version, standardized 1769 text,
protocanon-only, from eBible.org's **USFX** export (`eng-kjv2006_usfx`):

- Source archive: <https://ebible.org/Scriptures/eng-kjv2006_usfx.zip>
- Translation detail and download formats: <https://ebible.org/bible/details.php?id=eng-kjv2006>
- eBible.org copyright information: <https://ebible.org/Scriptures/copyright.php>

The importer pins the downloaded USFX archive SHA-256 to
`4ffc59aee7be6eac10ef274e1b4e245e4e720c86ede556d986216d32078e4c7d`.
If eBible replaces that archive, regeneration stops until the changed source is
reviewed. The checked-in JSON remains the release source in the meantime.

eBible.org labels this KJV text **Public Domain**. Its source notice also says
that UK Letters Patent grant Cambridge University Press, Oxford University
Press, and Collins exclusive rights to print the Bible in the UK, and says those
letters patent do not affect the text's public-domain status elsewhere. Anyone
distributing or printing this text in the UK should independently check the
current legal requirements for that use.

The import preserves USFX book, chapter, and verse coordinates and text,
removing XML markup and translator footnotes while retaining words marked as
additions (for example, “is” in Psalm 23:1). Unnumbered Psalm superscriptions
marked with `<d>` are stored separately as the optional `title` property. Thus
Psalm 23's title is “A Psalm of David.” and verse 1 is “The LORD is my
shepherd; I shall not want.” Other USFX section labels are omitted. The generated data is a
transformed selection of the source, not a claim that eBible reviewed or
endorsed this app.

## Reproduce

With Node.js 22.12 or newer (the version required by this project), run:

```sh
npm run generate:kjv-psalms
```

The script downloads the USFX archive into the repository's
`temp/psalter-work/kjv-import/`
scratch directory, extracts the verse-addressed text with the platform `tar`
command, validates all 150 canonical verse counts and sequential verse numbers,
then writes the compact JSON module. It fails if a count or verse sequence
differs from the expected KJV Psalm verse structure.
