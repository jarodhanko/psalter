# Psalter 433 opening layout

The source-bound screen adapter can join the opening pickup to the following
complete measure at supported phone widths. It leaves every later system
boundary unchanged. Canonical notes, durations, lyrics, playback input, and print
layout are not changed. The generic planner still rejects mixed meters and tuplets.

## Acceptance boundary

- ABCJS 6.7.0 and exact canonical, prepared, and parser witnesses for Psalter 433.
- Default key, score size 100%, all four voices, one stanza, no learner accidentals,
  grouped, repeated, reviewed, or music-only underlay; screen viewport at most
  600 CSS pixels and requested staff width from 300 to 450 pixels.
- All 381 note/rest events and 30 measure units retain their source identity,
  including lyrics, ties, slurs, meters, and tuplets.
- Native ink, clearance, viewport, glyph-size, and independent lyric typography
  checks must pass. Failure restores the original nodes and attributes.

The adapter is lazy-loaded only for this arrangement. Import failure, unsupported
settings, a newer navigation, or unmount preserve the ordinary rendering path.
Shared renderer option and call-order consolidation retains the existing behavior.

## Known limits

The joined opening has been observed at approximately 388–400 CSS pixels. At
333 pixels, geometry acceptance fails and the original layout remains. The isolated
opening is therefore not eliminated at every width. No lyric-overflow correction
is claimed. This is not physical-device, acoustic, print, PDF, or offline-install
certification. Qualify the exact build and settings you distribute using the
[release checks](release-checklist.md).
