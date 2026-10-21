import type { SongbookSong } from '../../domain/songbook';

// Attenuate backing note volumes, leaving soprano and source dynamics intact.
// ABCJS 6.7.0 maps these integer volumes linearly to sample gain; this setting
// does not claim a measured perceptual loudness change or boost any peaks.
export const SOPRANO_BACKING_VOLUME = 0.65;

/** Only offer this listening preference for four independently identified SATB parts. */
export function sopranoEmphasisVoiceId(song: Pick<SongbookSong, 'voices' | 'voiceStructure' | 'abc'>): string | undefined {
  if (song.voiceStructure && song.voiceStructure !== 'independent-parts') return undefined;
  if (song.voices.length !== 4 || new Set(song.voices.map(voice => voice.id)).size !== 4) return undefined;
  const aliases: Record<string, string> = {
    s: 'soprano', t1: 'soprano', a: 'alto', t2: 'alto',
    t: 'tenor', b1: 'tenor', b: 'bass', b2: 'bass',
  };
  const roles = song.voices.map(voice => voice.kind && voice.kind !== 'independent'
    ? undefined : voice.name?.trim().toLowerCase() || aliases[voice.id.toLowerCase()]);
  if (!['soprano', 'alto', 'tenor', 'bass'].every(role => roles.includes(role))) return undefined;
  // Do not infer a role from array order or apply stale catalog IDs to new ABC.
  const declared = new Set([...song.abc.matchAll(/^V:[ \t]*([^\s]+)/gm)].map(match => match[1]));
  if (declared.size !== 4 || song.voices.some(voice => !declared.has(voice.id))) return undefined;
  return song.voices[roles.indexOf('soprano')].id;
}
