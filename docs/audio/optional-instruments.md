# Optional instrument packs

The source-only repository does not track any MP3s. Run the [explicit audio setup](setup.md) before building; the behavior below describes a complete prepared build.

## Scope and behavior

Nylon guitar (MIDI program 24) and harpsichord (6) use versioned same-origin
assets under `soundfonts/optional-v1/`. The existing concert grand, compact
piano, and organ retain their unchanged assets and precache behavior. No account,
external audio host, or storage-persistence permission is added.

Selecting one optional instrument downloads its entire 89-sample bank. The UI
reports checked/downloaded samples and bytes. A switched selection or Cancel
aborts pending fetches; verified partial files can be reused by Retry or Play.
Every bank preparation validates each sample's size and SHA-256 and checks that
all files remain in CacheStorage before reporting offline readiness. Each Play
prepares again, detecting partial loss/eviction. If caching fails, complete
in-memory bytes can still play, explicitly labeled session-only. A disconnected
first download fails with a reconnect-and-retry message. Browser storage can be
cleared after readiness, and the UI says so.

One versioned cache contains at most the two fixed banks (178 samples). Old
versions with the feature-specific prefix are removed; core offline caches are
untouched. Only the selected bank is retained in JavaScript memory. ABCJS's
existing isolated internal cache receives lazy Promise getters, decoding only
notes requested by the score. This supports offline playback without requiring
a service worker to control the current tab. Revisit that internal contract
when upgrading ABCJS.

## Asset validation and range

Original source metadata pins all 176 Git blob SHA-1s; those source files remain
unchanged. Two missing Db8 samples were added. The final 178 samples span
A0–Db8 (MIDI 21–109), preserving the current transposition UI.
`optional-instruments-provenance.json` records the derivation and final bank
SHA-256; the runtime manifest pins every final MP3.

All 178 samples decode and have nonzero signal. Mid-register reference levels
and derived-note pitch checks are adjacent JSON records. A3/C4/E4/C8/Db8 peaks
are within four cents of expected pitch. The measurement is a local spectral
peak near the expected frequency, not a listening certification. Gains are 1.5
for both instruments, placing mean first-second A3/C4/E4 levels close to the
existing piano choices.

The samples last approximately 3.13 seconds (2.95 for the resampled Db8 notes),
with natural plucked-note decay rather than indefinite sustain. Notation timing
and note tracking remain independent of that decay. Human listening quality and
device-speaker balance remain manual release checks.

## Budget and publishing

The optional hosted assets have their own measured ceiling, 3,153,044 bytes.
They do not raise the 30 MiB core offline distribution budget and are expressly
rejected from the initial SW precache by build validation. Each existing bank
still must contribute all 89 samples to that precache.

Preserve binary MP3 bytes and the source/license records when copying or publishing. Verify sample hashes with `npm run validate:audio-assets`; public deployment remains a separate manual operation.
