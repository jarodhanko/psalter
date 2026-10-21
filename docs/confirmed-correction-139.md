# Printed-source correction for Psalter 139

> Historical verification record: references to automated tests below describe checks performed at the time of the review. The current source distribution does not include that test suite or require a test run; use the current [release checklist](release-checklist.md) for release preparation.


The bounded correction to **The Eternal Judgment / BOYLSTON** changes the bass at written quarter 7.5 from C3 to G3, retaining its eighth-note duration. Both printed editions show the G3 head shared with tenor, with opposing stems and an eighth beam. The existing legacy-selection witness is rebound to SHA-256 `27a5b63f998aa9a97c72ddfcb3253a693e73c34c8272021fe17b3cfa56680acd`; its previous `[5, 6]` and current `[1, 2, 3, 4, 5, 6]` arrays remain unchanged.

The [RFPA Psalter PDF](https://nrcfortmacleod.tor1.cdn.digitaloceanspaces.com/psalters/General/The_Psalter.pdf), SHA-256 `3653def7fed8b8c978dbe7aec978d2941473a58f27a985c80586c7e49e7e1504`, has the complete music on page 209 and the stanza 6 continuation on page 210. The [original 1912 volume](https://archive.org/details/psalterwithrespo00unit) contains the complete setting on leaf 0125, printed page 119. No alternate arrangement was identified.

The complete 106-event SATB ledger was frozen before canonical/parser/generated exposure. Both printed readings agree on every pitch and duration. An independent coordinator subsequently inspected both printed crops and corroborated the shared G3. A later ledger revision adds only the shared-head annotation, without changing any frozen event. The ledger also preserves the disclosed pre-freeze, source-only tenor scratch correction.

Each voice spans 24 quarter-note beats. Soprano, alto and bass have 26 attacks each; tenor has 28. There are no printed rests, slurs, ties, fermatas, repeats or dynamics. The opening pickup is one quarter, independently established by the first printed bar boundary against the 3/4 meter.

RFPA engraves stanzas 1–4 beneath the music. Stanzas 5–6 are printed prose, so their existing native note attachment remains editorial, including the sung elision “heav'ns” in stanza 6. Full prose keeps “heavens.” The fixture and tests preserve this qualification explicitly. No underlay or prose change is included.

`psalter139PrintedCorrection.test.tsx` compares the full independent music and exact words, literal accidentals, all part subsets with grouping/learner/transposition combinations, and actual React screen/app-print output. Real audio callbacks assert all four tracks, complete attack counts, timing, muting, pickup velocity and immutable capture. The only before/after audio difference is bass q7.5, MIDI 48 to 55. Negative controls reject the old pitch, changed key/rhythm, added slurs/ties, a corrupted callback pitch and a dropped track. All explicit stanza subsets retain their existing selection behavior.

This change is consolidated with the separately qualified 135–137 corrections over parent the historical reviewed source, the historical reviewed source. Generated assets must be regenerated on the final integration base. No other score, held mark/cue, setting, dependency, optimization or budget changes are included. Source scans stay outside application source. The checks do not certify native browser geometry, physical printing or acoustic listening.
