// ABCJS 6.7.0 keys decoded samples by instrument and pitch, without the bank URL.
// Keep this internal dependency isolated here and recheck it when upgrading ABCJS.
// @ts-expect-error ABCJS does not publish a declaration for its internal cache.
import abcjsSampleCache from 'abcjs/src/synth/sounds-cache.js';

const sampleCache = abcjsSampleCache as Record<string, unknown>;
let activeSoundFontUrl: string | undefined;

export function selectSoundFontCache(soundFontUrl: string, instrument = '') {
  const key = `${soundFontUrl}#${instrument}`;
  if (activeSoundFontUrl === key) return;
  for (const instrument of Object.keys(sampleCache)) delete sampleCache[instrument];
  activeSoundFontUrl = key;
}

/** Supply the selected optional bank directly, so playback needs no active SW.
 * ABCJS reads a Promise from each pitch property. Lazy getters preserve that
 * contract while decoding only the score's notes, not all 89 samples at once. */
export function installOptionalSamples(soundFontUrl: string, instrument: string,
  samples: ReadonlyMap<string, ArrayBuffer>, audioContext: AudioContext) {
  selectSoundFontCache(soundFontUrl, instrument);
  const pitches: Record<string, unknown> = {};
  for (const [name, bytes] of samples) {
    let decoded: Promise<unknown> | undefined;
    Object.defineProperty(pitches, name, { enumerable: true, configurable: true, get: () => {
      decoded ??= audioContext.decodeAudioData(bytes.slice(0)).then(audioBuffer => ({ instrument, name, status: 'loaded', audioBuffer }))
        .catch(error => { decoded = undefined; throw error; });
      return decoded;
    } });
  }
  sampleCache[instrument] = pitches;
}
