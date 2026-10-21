# Prepare the separately licensed audio

This Git repository contains code, scores, logos, notices and provenance, but **no MP3 files or embedded audio payloads**. A clone is not a complete playable/offline build until this explicit preparation step succeeds. The script downloads only the 442 reviewed MP3 files from two pinned upstream repositories, verifies every byte count, SHA-256 and Git blob SHA-1, and derives three missing Db8 notes locally. It does not fetch or execute upstream JavaScript, install software, use credentials, upload anything, or deploy a site.

## Clone to playable build

Use Node.js 24 (see `.node-version`). For the three derived notes, install **FFmpeg 7.1.5 with libmp3lame** yourself using [FFmpeg's official download guidance](https://ffmpeg.org/download.html) or a trusted operating-system package manager. This is an additional local build tool, not an npm dependency. No FFmpeg executable is distributed here. The verified reference build is Debian `7.1.5-0+deb13u1`, libavcodec `61.19.101`, libavformat `61.7.103`, with libmp3lame; different compiler/library builds may produce different bytes and will be rejected rather than silently accepted.

```sh
git clone https://github.com/jarodhanko/psalter.git
cd psalter
npm ci
npm run audio:prepare
npm run build:release
npm run preview
```

For normal development after preparation, use `npm run dev`. `npm ci` downloads the locked npm dependencies and runs the existing local patch/data generators; it does **not** download audio. `audio:prepare` is the separate, explicit network step. Expect about 26.8 MB of original MP3 downloads. The prepared five banks contain 445 samples and total 26,853,753 bytes. Downloads use HTTPS URLs at `raw.githubusercontent.com`, with no authentication and no redirects. A failed network request or wrong response fails clearly; retrying reuses files that have already passed verification.

`public/soundfonts/` and `.audio-cache/` are ignored by Git. The former is copied into `dist/` by a build; the latter stores content-addressed, verified files for repeated preparation. Do not commit either directory. The source-only release guard rejects tracked audio and these directories. The browser app does not contact upstream repositories: its normal and optional instrument samples are served from the built site's own origin.

Before preparation, source editing, score data generation and non-audio development views remain available. Playback, optional instrument downloads, complete PWA/offline installation and a valid distributable build require the prepared audio. Both `build` and `build:release` fail with setup instructions if any required sample is absent or differs from its exact pin. Do not publish an incomplete development tree as a complete app.

## Reuse and failures

```sh
npm run audio:verify
npm run audio:prepare -- --offline
npm run audio:prepare -- --replace-mismatched
```

- `audio:verify` only reads and checks all assets and required notices. It performs no download, write, or FFmpeg execution.
- `--offline` never requests a network resource. It uses matching existing assets or `.audio-cache/sha256/<SHA-256>.mp3` objects; FFmpeg is needed only for derivatives not already present in either place. An incomplete cache produces a clear failure.
- Normal preparation is idempotent. Correct existing assets are left unchanged, including their modification times. Every cached object is checked again before use.
- A mismatching existing asset or cache object stops preparation and is preserved. Inspect local edits first. Only the explicit `--replace-mismatched` flag permits replacement, and only with bytes that pass all three checks. It does not relax any integrity requirement.
- Destinations are fixed to the five manifest banks and repository-local cache. Absolute paths, traversal, unexpected banks and symlinks are rejected. Temporary files are installed atomically after verification; failed operations do not install partial downloads.
- A matching FFmpeg version is not enough by itself: generated files must also match the exact output and decoded PCM pins. A different result is a reproducibility failure, not permission to update hashes casually.

## Pinned originals and source licenses

Every source URL can be constructed from the repository, commit and path in [`source-manifest.json`](source-manifest.json). These pins do not follow moving branches:

- [Paul Rosen / MIDI.js FluidR3 exports at cbd6b6f6d1af89ebfb69402860741288f08ff8b7](https://github.com/paulrosen/midi-js-soundfonts/tree/cbd6b6f6d1af89ebfb69402860741288f08ff8b7): 353 unchanged files, plus the C8 sources used for the three local extensions. Immediate MP3 exports are labeled [CC BY 3.0 US](https://creativecommons.org/licenses/by/3.0/us/); the original FluidR3 soundfont by Frank Wen has the separate MIT notice preserved in this repository.
- [Educandu / Salamander exports at ebd5724f5d334b5b6347562b0044f75e16df90b7](https://github.com/educandu/abcjs-soundfonts/tree/ebd5724f5d334b5b6347562b0044f75e16df90b7/FluidR3_Salamander_GM/acoustic_grand_piano-mp3): 89 unchanged files. Salamander Grand Piano by Alexander Holm, [CC BY 3.0 Unported](https://creativecommons.org/licenses/by/3.0/), with Educandu's documented upstream adaptations.

Preserve the complete [`THIRD_PARTY_NOTICES.md`](../../THIRD_PARTY_NOTICES.md), runtime [`THIRD_PARTY_NOTICES.txt`](../../public/THIRD_PARTY_NOTICES.txt), source links, creator attributions and modification notices. The script validates these notices before preparation. The application's own MIT license does not relicense the samples or the musical corpus. See [license scope](../../LICENSE-SCOPE.md) and [content qualifications](../licensing.md).

## Reproduce the three Db8 notes

The organ, nylon guitar and harpsichord lack an upstream Db8. Each is derived from its own verified C8, raising pitch by one semitone using this pinned filter and encoder recipe:

```sh
ffmpeg -nostdin -hide_banner -loglevel error -i C8.mp3 -af asetrate=46722,aresample=44100 -codec:a libmp3lame -q:a 2 -n Db8.mp3
```

`audio:prepare` runs this command itself, without a shell, only when a derivative is missing from both the output and verified cache. Guitar and harpsichord reproduce the historical MP3s byte-for-byte directly. All three decoded PCM pins use signed 16-bit little-endian stereo at 44,100 Hz, 520,964 bytes. The manifest includes both final MP3 and decoded PCM hashes.

### Organ container metadata distinction

The historical organ extension was made with FFmpeg 4.4 and contains `Lavf58.76.100` / `Lavc58.13` encoder labels. The reference FFmpeg 7.1.5 recipe produces **identical encoded audio frames and decoded PCM**, but different container/encoder metadata: 12,212 bytes, SHA-256 `117801cccd64b4652091c636ace2758ef0dac4050bdb0143be2cf0a2a7759f67`.

To retain the existing audited bank hash, [`normalize-organ-metadata.mjs`](../../tools/normalize-organ-metadata.mjs) reconstructs only the historical labels, their ID3/TSSE lengths and the Info-frame metadata CRC. It accepts only that exact raw whole-file hash, then requires the historical result: 12,213 bytes, SHA-256 `53202c3c307996969eb4440cdc463b0e986cf66df46df901a7656de2394d45f9`, Git blob `ae7134909909b6afe2f04dd62eabe13fcd4cb297`. The decoded PCM is also checked after reconstruction against SHA-256 `6b9b25a60eaec27ac28802d1bdf82be906d88442776a5c0dea58382a0f340c27`.

This is explicitly **FFmpeg 7.1.5 plus historical metadata reconstruction**, not a claim that the old encoder was run. No historical audio bytes are stored in the script, and no audio-frame payload is replaced. A different raw hash is rejected, not normalized heuristically. All original per-file and bank integrity checks stay unchanged.
