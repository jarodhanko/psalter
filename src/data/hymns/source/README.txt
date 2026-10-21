HYMN ABC IMPORT PACKAGE

Available eligible conversion work completed. One candidate remains on a documented reuse-rights hold.

97 selected hymn editions with lyrics, covering 52/52 Book1 candidate rows and 97/98 Book2 candidate rows. Shared hymns use one master file. The candidate universe is98 unique hymns, since all52 Book1 candidates also occur in Book2. 1 candidate hymns remain explicitly unresolved; held and excluded catalog rows have not been promoted.

START HERE
- abc/: one recommended ABCJS-compatible file per selected hymn
- books/book1.abc and book2.abc: complete selected book collections
- books/*_index.json and .csv: every original catalog row, stable ID and inclusion/omission reason
- selected_editions.json: exact source, attribution, file hashes, tune/text/stanza differences and QA scope
- unresolved_candidates.csv/.json: remaining candidate gaps and remaining rights hold and evidence
- CREDITS_AND_REUSE.txt: keep with any reuse
- RIGHTS_HOLD.json: exact remaining rights evidence and limits for I Have Decided to Follow Jesus

This is standard UTF-8 ABC preparation for later integration, not an application adapter. Test the actual Psalter importer before use. Most sources preserve polyphonic staff/voice structures; the Wayfaring Stranger update below supplies four authored SATB parts. Source counts are not an assurance of four selectable SATB voices.

Use these recommended files with ABCJS. Canonical source-faithful ABC, original sources and comparison proofs are in the separate audit archive. Engine-specific variants include dotted-tie spacing, explicit per-voice length restoration, lyric-extender spacing, and invisible-rest lyric skips. Do not render an ABCJS-specific copy with abc2svg and treat that as a valid reference proof.

The original archive editions have recorded source/semantic checks and independent review; later source replacements carry their own current verification scope in selected_editions.json. Exact6.7.1 browser engraving and the live application import remain untested. Review details and limitations are in STATUS.json. The source's printed lyrics are supplied; unprinted historical stanzas are not invented. Repeats/navigation are preserved rather than flattened.

Rights are source- and territory-specific. Most editions assert US public-domain status; OpenPsalm arrangements require CC-BY4.0 attribution. No blanket worldwide clearance or recording-specific arrangement rights are claimed. All source credits and editorial differences remain with the files.

2026-10-08 Battle Hymn source update: CCEH full harmony now accompanies the exact previously retained anthology first stanza and refrain. See docs/battle-hymn-source-replacement.md and its selected-edition record for separate music/text rights and review limits. The dated STATUS.json and INTEGRITY.json remain historical archive evidence; use the current source manifest and hymn-generation check for installed identity.

2026-10-17 Wayfaring Stranger source update: Hymn Singer / Kenan Schaefkofer 2021 SATB music, uniformly transposed to E minor, accompanies the exact retained anthology stanza and refrain with editorial lyric underlay. The music has an explicit arranger public-domain dedication, not a verified formal CC0 license. The text retains its separate anthology provenance. See docs/wayfaring-stranger-source-replacement.md. Original STATUS.json and INTEGRITY.json remain dated archive evidence; current identity is recorded in selected_editions.json and SHA256SUMS.json.
