import manifest from './optionalInstrumentManifest.json';
import { instruments } from './instruments';
import type { OptionalInstrument } from './instruments';

// Two immutable, app-owned banks, 178 files / 3,153,044 bytes in total.
// Do not use the precache: these are fetched only when their instrument is chosen.
export const optionalInstrumentCache = 'psalter-optional-instruments-v1';
export type OptionalBank = { samples: ReadonlyMap<string, ArrayBuffer>; offlineReady: boolean };
export type BankProgress = { completed: number; total: number; bytes: number; totalBytes: number };
const aborted = (signal: AbortSignal) => { if (signal.aborted) throw new DOMException('Instrument download cancelled.', 'AbortError'); };

export async function loadOptionalBank(instrument: OptionalInstrument, signal: AbortSignal,
  progress: (value: BankProgress) => void, fallback?: OptionalBank): Promise<OptionalBank> {
  const config = instruments[instrument];
  const files = manifest[config.sample];
  const base = new URL(`${import.meta.env.BASE_URL}soundfonts/${config.bank}/${config.sample}-mp3/`, location.href);
  const samples = new Map<string, ArrayBuffer>();
  let cache: Cache | undefined;
  let storageFailed = false;
  try {
    cache = await caches.open(optionalInstrumentCache);
    // Delete only this feature's superseded versions; never touch the offline app.
    for (const name of await caches.keys()) {
      aborted(signal);
      if (name.startsWith('psalter-optional-instruments-') && name !== optionalInstrumentCache) await caches.delete(name);
    }
  } catch (error) {
    aborted(signal);
    storageFailed = true;
  }
  const totalBytes = files.reduce((sum, file) => sum + file.bytes, 0);
  let bytes = 0;
  let completed = 0;
  progress({ completed, total: files.length, bytes, totalBytes });
  const valid = async (data: ArrayBuffer, expected: typeof files[number]) => {
    if (data.byteLength !== expected.bytes) return false;
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('') === expected.sha256;
  };
  let next = 0;
  const download = async () => {
    while (next < files.length) {
      aborted(signal);
      const file = files[next++];
      const url = new URL(`${file.name}.mp3`, base).href;
      let data: ArrayBuffer | undefined;
      try {
        const response = await cache?.match(url);
        if (response) {
          const stored = await response.arrayBuffer();
          if (await valid(stored, file)) data = stored;
          else await cache?.delete(url);
        }
      } catch { storageFailed = true; }
      aborted(signal);
      if (!data) {
        const retained = fallback?.samples.get(file.name);
        if (retained && await valid(retained, file)) data = retained;
        else {
          let response: Response;
          try { response = await fetch(url, { signal, credentials: 'same-origin' }); }
          catch (error) {
            aborted(signal);
            throw new Error(`Connect to the internet to finish downloading ${config.label.toLowerCase()}, then retry.`);
          }
          if (!response.ok) throw new Error(`${config.label} download failed. Please retry.`);
          data = await response.arrayBuffer();
          if (!await valid(data, file)) throw new Error(`${config.label} download was incomplete. Please retry.`);
        }
        aborted(signal);
        try { await cache?.put(url, new Response(data, { headers: { 'Content-Type': 'audio/mpeg' } })); }
        catch { storageFailed = true; }
      }
      aborted(signal);
      samples.set(file.name, data);
      completed += 1;
      bytes += data.byteLength;
      progress({ completed, total: files.length, bytes, totalBytes });
    }
  };
  // Keep bandwidth/memory bounded and abort in-flight fetches on a new selection.
  await Promise.all(Array.from({ length: 4 }, download));
  aborted(signal);
  let offlineReady = !!cache && !storageFailed;
  if (offlineReady) {
    try {
      // A successful write is not enough: quota eviction can remove earlier files.
      for (const file of files) {
        aborted(signal);
        if (!await cache!.match(new URL(`${file.name}.mp3`, base).href)) { offlineReady = false; break; }
      }
    } catch { aborted(signal); offlineReady = false; }
  }
  return { samples, offlineReady };
}
