import type { SongbookCatalogSong, SongbookSong } from '../domain/songbook';
import { lyricTranscriptFromAbc, rightsNoticesFromAbc } from './legacyPsalterCatalog';
import { loadSourceTimingContext } from './timingWitnesses';

/** Resolve independent evidence before a loaded song can reach display or playback.
 * The optional migration hash remains separate from exact timing admission. */
export async function loadLegacyPsalterSource(song: SongbookCatalogSong, loadAbc: () => Promise<{ default: string }>): Promise<SongbookSong> {
  const [{ default: abc }, sourceTimingContext] = await Promise.all([loadAbc(), loadSourceTimingContext(song.id)]);
  let sourceSha256: string | undefined;
  try {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(abc));
    sourceSha256 = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  } catch { /* Without native hashing, display normally and do not infer legacy selection intent. */ }
  const lyricTranscript = lyricTranscriptFromAbc(abc, song.id);
  return { ...song, abc, sourceTimingContext, sourceSha256, lyricTranscript,
    lyrics: lyricTranscript.map((line) => line.text), rightsNotices: rightsNoticesFromAbc(abc) };
}
