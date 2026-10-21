import { getSourceTimingWitness } from '../../data/timingWitnesses';
import type { SongbookSong } from '../../domain/songbook';
import { WAYFARING_SATB_SOURCE_SHA256 } from '../pwa/sourceEditionVoiceSelection';

const quarterNoteTempo = {
  abcBeatLength: 1 / 4,
  engineBeatsPerControlBeat: 1 / 2,
  label: 'quarter-note BPM',
  accessibleUnit: 'quarter-note beats per minute',
} as const;

/** The sourced 2/2 Wayfaring replacement keeps the old control's quarter-note
 * pace. Require both its edition hash and the admitted complete source bytes;
 * an unknown, changed or unready source retains ordinary natural-beat behavior.
 * This edition has no interior tempo changes. No saved tempo is rewritten. */
export function sourceTempoPolicy(
  song: Pick<SongbookSong, 'id' | 'abc' | 'sourceSha256' | 'sourceTimingContext'>,
) {
  if (song.id !== 'hymn-aperio-wayfaring-stranger' || song.sourceSha256 !== WAYFARING_SATB_SOURCE_SHA256) return undefined;
  const witness = getSourceTimingWitness(song.sourceTimingContext, song.id);
  return witness?.source === song.abc ? quarterNoteTempo : undefined;
}
