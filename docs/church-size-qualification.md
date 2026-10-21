# Church's One Foundation: historical size-reversal diagnosis

## Source and scope

This technical note records the original size-reversal investigation, not a qualification result for the current public build. It is bound to `hymn-oh_the-churchs-one-foundation-aurelia`, canonical SHA-256 `a21a7088d628d5b53ece7fcc6ccad0da44984c15b1541917deb4e2bc37ce2c38`, with the exact canonical, prepared and TuneBook parser witnesses and `readHymnOpeningIdentity`. The source contains 208 single-pitch notes in four voices, 17 real-bar units (quarter pickup, fifteen full 4/4 bars, dotted-half ending), five complete lyric rows and no slurs or ties.

The investigated profile was the five-verse, all-parts, untransposed screen preparation on a phone viewport. Music-only, selected parts, regrouped verses, learner accidentals, alternate underlay, print and changed source/preparation were excluded.

## Historical native diagnosis

Historical captures at a 400px window (388px document, approximately 380px SVG screen width) recorded:

| Requested size | Requested staff width | Original SVG viewport | First staff height |
| --- | ---: | ---: | ---: |
| 105% | 369.523810 | 413.662384 | 29.118458px |
| 110% | 352.727273 | 439.920105 | 27.381348px |
| 115% | 337.391304 | 367.391296 | 32.785793px |

At 110%, the ordinary pre-opening partition had only one multi-bar system: zero-based units `[8,9]`. Staff widths before that system were at or below 352.73 units. That pair expanded its staff to 409.92 units, which later systems inherited. ABCJS 6.7.0's `src/write/layout/layout.js` carried this larger `maxWidth` forward; `engraver-controller.js` passed the maximum to responsive drawing. Every SVG therefore used the larger viewport, shrinking the entire score by approximately 5.97% relative to 105%.

The opening adapter subsequently joined `[0,1]` at 110% while preserving the inflated 439.920105-unit viewport. It did not originate this reversal. A separate historical capture series reconfirmed the 208 heads and the same 105→110% reversal across all 26 requested size ticks. These measurements are historical observations; the capture artifacts are not distributed in this source export.

## Transaction and visual tradeoff

The size transaction recognizes only the complete measured partition: all singleton units except `[8,9]`. It additionally requires direct native evidence that this exact pair first causes the viewport inflation, with matching two-staff bounds and no earlier oversized system. It separates the pair at its existing real barline and engraves once at the original requested staff width. Every other boundary remains intact.

Acceptance requires canonical event/lyric/tempo/source-range identity, exact planned partition and formatting, unchanged local notehead and staff dimensions, proportional physical growth, common system widths, all ink inside the viewport, existing six-unit lyric clearance and the independent native typography proof. Failure restores the original DOM nodes, attributes and listeners. There is no source rewrite, font change, SVG viewport manipulation, compression, or shared-guard relaxation.

For the historical 400px/110% state, the predicted viewport was 382.727273 units and first-staff height approximately 31.473px. That prediction is not a measurement of the current public build.

Larger physical notation reduces available opening space. The opening adapter can retain an isolated pickup when the full join no longer fits. The size correction therefore must not be described as preserving the earlier 110% visual layout or, by itself, resolving the separate 400px/100% opening behavior.

## Current verification boundary

This note does not certify the current public build. Historical implementation checks do not replace fresh native review. The automated test suite is not included or required by this public source, and historical test counts and build-budget outcomes are not current results. Use the current limits and measurements documented in [performance](performance.md) and the [release checklist](release-checklist.md).

A fresh review should cover:

- Before/after native captures at every supported 400px size tick from 50% through 175%, including staff/head dimensions and source-event/lyric identities. Check repeated 105→110→115→110→105 changes and restored selection/playback mapping.
- Neighboring phone widths, width transitions and both songbook memberships; inspect every system for clipping, overflow, lyric clearance and head/lyric parity.
- The full five-verse profile and exclusions: music-only, changed grouping, each selected part, transposition and learner mode. Music-only retains full export preparation while hiding lyrics during `afterParsing`, so its explicit settings veto remains essential. Check that setting changes leave no stale diagnostics.
- Independent print SVG and canonical ABC/export parity, plus failure rollback preserving original nodes, listeners and attributes.

No new native browser, device, listening or print qualification is asserted by the sanitization of this document.
