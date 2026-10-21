import abcjs from 'abcjs';
import { sourceLayerWitness } from './sourceTimedLayers';

const voices = ['T1', 'T2', 'B1', 'B2'] as const;
const cueOnsets = [24, 25, 27, 28, 30, 31, 33, 34];
const cueDurations = [1, 2, 1, 2, 1, 2, 1, 2];
const cuePitches = [51, 48, 48, 53, 53, 46, 46, 51];
const close = (left: number, right: number) => Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-7;
const round = (value: number) => Math.round(value * 1e6) / 1e6;
const fail = (): never => { throw new Error('Unable to preserve Psalter 319’s printed vocal rests during playback.'); };
type Span = { startChar?: number; endChar?: number };
type ParsedNote = abcjs.VoiceItemNote & { gracenotes?: unknown[]; decoration?: unknown[]; startTriplet?: unknown; endTriplet?: unknown };

/** RFPA 482: the normal lower vocal layer rests throughout q24–36, above
 * one small accompaniment/cue line. All Parts conservatively retains that
 * line once, using existing B2 events as a technical carrier. This does not
 * certify Bass singer ownership or mandatory performance of the cue. Every
 * partial vocal selection, including B1+B2, omits it. No new audio lane.
 */
export function preparePsalter319CueMask(
  songId: string, abc: string, tune: abcjs.TuneObject, sourceTracks: abcjs.AudioTrack[],
  voiceIds: readonly string[], visible: ReadonlySet<number>, midiTranspose: number,
  sourceVoice: (startChar: number | undefined, trackIndex: number) => number | undefined,
): ((tracks: abcjs.NoteMapTrack[]) => ReadonlySet<abcjs.NoteMapTrackItem>) | undefined {
  if (songId !== 'psalter319') return undefined;
  // Reuse the engraving's exact normalized source witness. Unknown 319
  // revisions must fail into the existing playback error, never bypass this.
  if (!sourceLayerWitness(songId, abc) || abcjs.signature !== 'abcjs-basic v6.7.0' || tune.warnings?.length ||
      voiceIds.length !== voices.length || new Set(voiceIds).size !== voices.length ||
      !voices.every(id => voiceIds.includes(id)) || !Number.isInteger(midiTranspose) ||
      [...visible].some(index => !Number.isInteger(index) || index < 0 || index >= voiceIds.length)) return fail();

  const key = (span: Span): string => {
    if (!Number.isInteger(span.startChar) || !Number.isInteger(span.endChar) ||
        span.startChar! < 0 || span.endChar! <= span.startChar! || span.endChar! > abc.length) return fail();
    return `${span.startChar}:${span.endChar}`;
  };
  const owner = (span: Span): string => {
    key(span);
    // -1 deliberately disables any track-index fallback. Both ends must be
    // within the same explicit V: source voice; note order is not identity.
    const first = sourceVoice(span.startChar, -1), last = sourceVoice(span.endChar! - 1, -1);
    if (first === undefined || first < 0 || first !== last || !voiceIds[first]) return fail();
    return voiceIds[first];
  };
  const parsed = new Map<string, { voice: string; q: number; note: ParsedNote }>();
  const elapsed = new Map<string, number>();
  // Inspect the already parsed tune, before CreateSynth prepares it again.
  // No second parse and no stored raw character offsets are used.
  for (const line of tune.lines) for (const staff of line.staff ?? []) for (const voice of staff.voices ?? []) {
    for (const item of voice) {
      if (item.el_type !== 'note') continue;
      const note = item as ParsedNote, id = owner(note), span = key(note), q = elapsed.get(id) ?? 0;
      if (parsed.has(span) || !Number.isFinite(note.duration) || note.duration <= 0) return fail();
      parsed.set(span, { voice: id, q, note });
      elapsed.set(id, q + note.duration * 4);
    }
  }
  const cueSpans = new Set<string>();
  for (const id of ['B1', 'B2']) {
    const notes = [...parsed.entries()].filter(([, event]) => event.voice === id && event.q < 36 && event.q + event.note.duration * 4 > 24);
    if (notes.length !== cueOnsets.length) return fail();
    for (const [index, [span, event]] of notes.entries()) {
      const note = event.note;
      if (!close(event.q, cueOnsets[index]) || !close(note.duration * 4, cueDurations[index]) ||
          note.rest || note.pitches?.length !== 1 || note.gracenotes?.length || note.decoration?.length ||
          note.startTriplet || note.endTriplet || note.pitches.some(pitch =>
            pitch.startTie || pitch.endTie || pitch.startSlur?.length || pitch.endSlur?.length)) return fail();
      cueSpans.add(span);
    }
  }

  const source = new Map<string, { voice: string; pitch: number; start: number; end: number; cue: boolean }>();
  const cueCounts = new Map<string, number>();
  for (const track of sourceTracks) for (const note of track) {
    if (note.cmd !== 'note') continue;
    const span = key(note), id = owner(note), original = parsed.get(span);
    if (source.has(span) || !original || original.voice !== id ||
        !close(note.start * 4, original.q) || !close(note.duration, original.note.duration) ||
        !Number.isFinite(note.pitch) || !Number.isFinite(note.gap ?? 0)) return fail();
    const cue = cueSpans.has(span);
    if (cue) {
      const index = cueOnsets.findIndex(q => close(q, original.q));
      if (index < 0 || !close(note.duration * 4, cueDurations[index]) || note.pitch !== cuePitches[index]) return fail();
      cueCounts.set(id, (cueCounts.get(id) ?? 0) + 1);
    }
    // Match ABCJS 6.7's note-map rounding and articulation gap. Nominal
    // duration was checked above; callback end is not nominal duration.
    source.set(span, { voice: id, pitch: note.pitch, start: round(note.start),
      end: round(note.start + note.duration - Math.min(note.gap ?? 0, note.duration * 2 / 3)), cue });
  }
  if (source.size !== parsed.size || ['B1', 'B2'].some(id => cueCounts.get(id) !== cueOnsets.length)) return fail();
  const allParts = voices.every(id => visible.has(voiceIds.indexOf(id)));

  return (tracks) => {
    const seen = new Set<string>(), mute = new Set<abcjs.NoteMapTrackItem>();
    if (tracks.length !== sourceTracks.length) return fail();
    // Validate the entire mapping before the caller changes any volumes.
    // This also guards q36 re-entry and forbids extra/missing cue attacks.
    // Track order is not used to establish singer/cue ownership.
    for (const track of tracks) for (const note of track) {
      const span = key(note), original = source.get(span);
      if (seen.has(span) || !original || owner(note) !== original.voice ||
          note.pitch !== original.pitch + midiTranspose || !close(note.start, original.start) ||
          !close(note.end, original.end)) return fail();
      seen.add(span);
      if (original.cue && (!allParts || original.voice === 'B1')) mute.add(note);
    }
    if (seen.size !== source.size) return fail();
    return mute;
  };
}
