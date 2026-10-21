/** A deliberate original-text choice belongs to one song and source revision. */
const prefix = 'psalter.original-lyrics.v1:';
export const originalLyricsPreferenceKey = (songId: string, sourceSha256: string) =>
  `${prefix}${songId}:${sourceSha256}`;
export function readOriginalLyricsPreference(songId: string, sourceSha256: string): boolean {
  try { return localStorage.getItem(originalLyricsPreferenceKey(songId, sourceSha256)) === '1'; }
  catch { return false; }
}
export function saveOriginalLyricsPreference(songId: string, sourceSha256: string, enabled: boolean): boolean {
  try { localStorage.setItem(originalLyricsPreferenceKey(songId, sourceSha256), enabled ? '1' : '0'); return true; }
  catch { return false; }
}
