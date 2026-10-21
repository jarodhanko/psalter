# License scope

The original application code and associated original project documentation are licensed under the standard [MIT License](LICENSE), copyright (c) 2026 Jarod Hanko. The MIT text is unchanged apart from its copyright attribution. Its [standard source is the Open Source Initiative](https://opensource.org/license/mit).

This repository also contains content and third-party materials with separate rights. The MIT grant covers only the original software and documentation described below; it is not a license for the complete music corpus or every asset in the repository or built application.

## Covered by MIT

Original application logic, UI components, rendering and playback integration, parsers, generators, catalog/search logic, build and verification tools, test code, and associated original documentation are covered by MIT to the extent the project author can license them.

Location alone does not determine scope. Original code that reads, transforms, indexes, renders, exports, or tests content remains MIT even when it lives under `src/data/`, alongside notation modules, or inside a test/fixture file. This document does not blanket-exclude all code in a data directory.

## Content and third-party materials retain their own terms

The following are outside this project's MIT grant:

- Musical works and lyrics, including Psalm versifications, hymn texts, tunes, harmonizations, arrangements, and notation/transcriptions
- Score or lyric content embedded in ABC strings, TypeScript/JavaScript/JSON modules, generated data, test fixtures, snapshots, or documentation examples
- The King James Version Psalm text and other third-party text
- Soundfonts, instrument samples, recordings, images, artwork, icons, scans, and other non-code assets
- Third-party software, excerpts, and other materials whose terms are supplied by their respective rights holders

For example, the score text in `src/psalter-abc/` and the notation/lyrics in `src/data/hymns/` are content, while original loader, catalog, generator, and validation logic remain MIT. A mixed file can contain MIT-covered code and separately governed content. Generated output preserves that distinction; building, converting, testing, or embedding content does not relicense it.

This scope statement does not create new restrictions on material already in the public domain, revoke an existing third-party license, or claim rights the project author does not hold. A source's public-domain assertion or license must be evaluated for the exact edition and applicable territory. Material with an unresolved status is not relicensed under MIT merely because it is present here.

## Notices and distribution

Preserve the MIT copyright and permission notice when redistributing covered software. Also retain every applicable third-party attribution, license, change notice, and territorial qualification. Start with:

- [Third-party notices](THIRD_PARTY_NOTICES.md) and the [runtime notice](public/THIRD_PARTY_NOTICES.txt)
- [Licensing evidence and qualifications](docs/licensing.md)
- [Hymn edition records](src/data/hymns/editions/) and [source credits](src/data/hymns/source/CREDITS_AND_REUSE.txt)
- [KJV provenance](docs/kjv-psalms.md) and the audio source/license records referenced in the notices

The original-code MIT choice is complete. This source retains the working content set with its edition-level qualifications. No blanket music/content license is granted, and no music is removed by this licensing change. Withholding source files does not by itself resolve rights in music still delivered by a public application.
