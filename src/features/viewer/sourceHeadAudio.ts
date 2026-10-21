import abcjs from 'abcjs';
import { sourceHeadWitness } from './sourceHeadPresentation';

type Span = { startChar?: number; endChar?: number };
type ParsedNote = abcjs.VoiceItemNote & { gracenotes?: unknown[]; decoration?: unknown[]; startTriplet?: unknown; endTriplet?: unknown };
type RoleEvent = { voice: string; q: number; duration: number; pitches: readonly { midi: number; owner: string | null }[] };
const close = (left: number, right: number) => Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-7;
const round = (value: number) => Math.round(value * 1e6) / 1e6;

/** Normal printed heads belong to named vocal practice. The small 347/378
 * heads sound only when all original parts are selected. This is the chosen
 * editorial playback convention, not a performance direction in the source.
 * Canonical notes, tracks, timing and full-ensemble pitches stay unchanged.
 */
export function prepareSourceHeadAudio(
  songId: string, abc: string, tune: abcjs.TuneObject, sourceTracks: abcjs.AudioTrack[],
  voiceIds: readonly string[], visible: ReadonlySet<number>, midiTranspose: number,
  sourceVoice: (startChar: number | undefined, trackIndex: number) => number | undefined,
): {
  owners: ReadonlyMap<abcjs.AudioTrackNoteItem, number>;
  callbackOwners: (tracks: abcjs.NoteMapTrack[]) => ReadonlyMap<abcjs.NoteMapTrackItem, number>;
} | undefined {
  if (songId !== 'psalter347' && songId !== 'psalter378') return undefined;
  const fail = (): never => { throw new Error(`Unable to preserve ${songId} source notehead roles during playback.`); };
  const voices = songId === 'psalter347' ? ['S', 'A', 'T', 'B'] : ['T1', 'T2', 'B1', 'B2'];
  const events: RoleEvent[] = songId === 'psalter347'
    ? [64, 66, 67].flatMap((q, index) => [
      { voice: 'A', q, duration: index === 0 ? 2 : 1, pitches: [{ midi: 63, owner: 'A' }, { midi: 66, owner: null }] },
      { voice: 'S', q, duration: index === 0 ? 2 : 1, pitches: [{ midi: [75, 73, 72][index], owner: 'S' }] },
    ])
    : [
      { voice: 'T1', q: 13, duration: 1, pitches: [{ midi: 70, owner: null }] },
      { voice: 'T2', q: 13, duration: 1, pitches: [{ midi: 64, owner: 'T2' }, { midi: 67, owner: 'T1' }] },
    ];
  if (!sourceHeadWitness(songId, abc) || abcjs.signature !== 'abcjs-basic v6.7.0' || tune.warnings?.length ||
      voiceIds.length !== voices.length || new Set(voiceIds).size !== voices.length ||
      !voices.every(id => voiceIds.includes(id)) || !Number.isInteger(midiTranspose) ||
      [...visible].some(index => !Number.isInteger(index) || index < 0 || index >= voiceIds.length)) return fail();
  const allParts = voices.every(id => visible.has(voiceIds.indexOf(id)));
  const key = (span: Span): string => {
    if (!Number.isInteger(span.startChar) || !Number.isInteger(span.endChar) ||
        span.startChar! < 0 || span.endChar! <= span.startChar! || span.endChar! > abc.length) return fail();
    return `${span.startChar}:${span.endChar}`;
  };
  const owner = (span: Span): number => {
    key(span);
    // Source spans, never track order, establish original ownership.
    const first = sourceVoice(span.startChar, -1), last = sourceVoice(span.endChar! - 1, -1);
    if (first === undefined || first < 0 || first !== last || !voiceIds[first]) return fail();
    return first;
  };
  const parsed = new Map<string, { voice: string; q: number; note: ParsedNote }>();
  const elapsed = new Map<string, number>();
  for (const line of tune.lines) for (const staff of line.staff ?? []) for (const voice of staff.voices ?? []) {
    for (const item of voice) {
      if (item.el_type !== 'note') continue;
      const note = item as ParsedNote, id = voiceIds[owner(note)], span = key(note), q = elapsed.get(id) ?? 0;
      if (parsed.has(span) || !Number.isFinite(note.duration) || note.duration <= 0) return fail();
      parsed.set(span, { voice: id, q, note });
      elapsed.set(id, q + note.duration * 4);
    }
  }
  const roles = new Map<string, RoleEvent>();
  for (const event of events) {
    const matches = [...parsed.entries()].filter(([, value]) => value.voice === event.voice && close(value.q, event.q));
    if (matches.length !== 1) return fail();
    const [span, { note }] = matches[0];
    if (roles.has(span) || note.rest || !close(note.duration * 4, event.duration) ||
        note.pitches?.length !== event.pitches.length || note.gracenotes?.length || note.decoration?.length ||
        note.startTriplet || note.endTriplet || note.pitches.some(pitch =>
          pitch.startTie || pitch.endTie || pitch.startSlur?.length || pitch.endSlur?.length)) return fail();
    roles.set(span, event);
  }
  const owners = new Map<abcjs.AudioTrackNoteItem, number>();
  const source = new Map<string, { voice: number; owner: number; pitch: number; start: number; end: number }>();
  const counts = new Map<string, number>();
  for (const track of sourceTracks) for (const note of track) {
    if (note.cmd !== 'note') continue;
    const span = key(note), voice = owner(note), original = parsed.get(span), identity = `${span}:${note.pitch}`;
    if (source.has(identity) || !original || original.voice !== voiceIds[voice] || original.note.rest ||
        !Number.isInteger(note.pitch) || !Number.isFinite(note.start) || note.start < 0 ||
        !Number.isFinite(note.duration) || note.duration <= 0 || !Number.isFinite(note.gap ?? 0)) return fail();
    let selectedOwner = voice;
    const role = roles.get(span);
    if (role) {
      const pitch = role.pitches.find(value => value.midi === note.pitch);
      if (!pitch || !close(note.start * 4, role.q) || !close(note.duration * 4, role.duration)) return fail();
      // -1 is deliberately absent from every valid selection. No volume is
      // restored later: the carrier must stay available before voicesOff.
      selectedOwner = pitch.owner === null ? allParts ? voice : -1 : voiceIds.indexOf(pitch.owner);
    }
    owners.set(note, selectedOwner);
    counts.set(span, (counts.get(span) ?? 0) + 1);
    source.set(identity, { voice, owner: selectedOwner, pitch: note.pitch, start: round(note.start),
      end: round(note.start + note.duration - Math.min(note.gap ?? 0, note.duration * 2 / 3)) });
  }
  // This exact family has no tied/grace/repeated source events. Chord heads
  // share a span but have distinct pitches; rests have no audio event.
  for (const [span, { note }] of parsed) {
    if ((counts.get(span) ?? 0) !== (note.pitches?.length ?? 0)) return fail();
  }
  return {
    owners,
    callbackOwners: (tracks) => {
      const seen = new Set<string>(), mapped = new Map<abcjs.NoteMapTrackItem, number>();
      if (tracks.length !== sourceTracks.length) return fail();
      // Validate the complete real callback before any volume is changed.
      for (const track of tracks) for (const note of track) {
        const identity = `${key(note)}:${note.pitch - midiTranspose}`, original = source.get(identity);
        if (seen.has(identity) || !original || owner(note) !== original.voice ||
            note.pitch !== original.pitch + midiTranspose || !close(note.start, original.start) ||
            !close(note.end, original.end)) return fail();
        seen.add(identity);
        mapped.set(note, original.owner);
      }
      if (seen.size !== source.size) return fail();
      return mapped;
    },
  };
}
