import { instrumentSampleForProgram } from './instruments';
import abcjs from 'abcjs';
import { fermataAudioScope } from './fermataAudioScope';
import { getMightyFortressFermataScope } from './mightyFortressAudioSource';
import { reviewedFermataSources } from './reviewedFermataSources';
import { getReviewedFermataSource } from './reviewedFermatas';
import { hasSharedFermataSource } from './sharedFermatas';
import { hasPsalter366FermataSource } from './mixedFermata366';
import { hasPsalter411FermataSource } from './sharedFermata411';

type Span = { startChar?: number; endChar?: number };
type AudioNote = abcjs.AudioTrackNoteItem & { style?: string; cents?: number };
type ParsedNote = abcjs.VoiceItemNote & {
  decoration?: string[]; gracenotes?: unknown[]; startTriplet?: number; endTriplet?: boolean;
  tripletMultiplier?: number; tripletR?: number; currentTrackWholeNotes?: number | number[];
  midiPitches?: abcjs.MidiPitch[];
};
type Written = { voice: number; start: number; duration: number; beat: number; rest: boolean };
type Attack = { voice: number; pitch: number; start: number; duration: number; writtenDuration: number };
type Original = Attack & { track: number; gap: number; style?: string; cents?: number };
type Expected = Original & { end: number; instrument: string; volume: number };
const round = (value: number) => Math.round(value * 1e6) / 1e6;
const close = (left: number, right: number) => Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 0.000002;

/** The bounded arrangements use the natural/public meter beat, rather
 * than the separate ABCJS accent beat. Each marked written segment lasts
 * max(2, ceil(1.5 * beats)) total beats; add the largest extension once
 * at its shared release.
 * Canonical marks alone create holds; projected staff glyphs never do.
 * Source ownership and audible articulation remain independent of timing.
 */
export function prepareSharedFermataAudio(
  songId: string, abc: string, tune: abcjs.TuneObject, sourceTracks: abcjs.AudioTrack[],
  voiceIds: readonly string[], visible: ReadonlySet<number>, midiTranspose: number,
  sourceVoice: (startChar: number | undefined, trackIndex: number) => number | undefined,
): ((tracks: abcjs.NoteMapTrack[]) => () => void) | undefined {
  const scope = fermataAudioScope[songId] ?? getMightyFortressFermataScope(songId, abc);
  if (!scope) return undefined;
  const fail = (): never => { throw new Error(`Unable to preserve ${songId} shared fermata timing during playback.`); };
  if (abcjs.signature !== 'abcjs-basic v6.7.0' || tune.warnings?.length ||
      voiceIds.length !== 4 || new Set(voiceIds).size !== 4 ||
      scope.voices.split(',').some(id => !voiceIds.includes(id)) ||
      !Number.isInteger(midiTranspose) || [...visible].some(id => !Number.isInteger(id) || id < 0 || id >= 4) ||
      sourceTracks.length !== scope.tracks) return fail();
  const key = (span: Span): string => {
    if (!Number.isInteger(span.startChar) || !Number.isInteger(span.endChar) ||
        span.startChar! < 0 || span.endChar! <= span.startChar! || span.endChar! > abc.length) return fail();
    return `${span.startChar}:${span.endChar}`;
  };
  const owner = (span: Span): number => {
    key(span);
    const first = sourceVoice(span.startChar, -1), last = sourceVoice(span.endChar! - 1, -1);
    if (first === undefined || first < 0 || first !== last || !voiceIds[first]) return fail();
    return first;
  };
  const beat = (meter: abcjs.Meter): number => {
    if (meter.type === 'common_time') return 1 / 4;
    if (meter.type === 'cut_time') return 1 / 2;
    if (meter.type !== 'specified' || meter.value?.length !== 1) return fail();
    const num = Number(meter.value[0].num), den = Number(meter.value[0].den);
    // These are all the public/natural meter units in this bounded cohort.
    if (den === 2 && [2, 3, 4].includes(num)) return 1 / 2;
    if (den === 4 && [2, 3, 4].includes(num)) return 1 / 4;
    if (num === 6 && [4, 8].includes(den)) return 3 / den;
    return fail();
  };
  const firstBeat = beat(tune.getMeter());
  const parsed = new Map<string, Written>(), attacks = new Map<string, Attack>();
  const lanes = new Map<string, { beat: number; ties: Map<number, Attack> }>();
  const holds = new Map<number, number>(), marks: string[] = [];
  for (const line of tune.lines) for (const [staffIndex, staff] of (line.staff ?? []).entries()) {
    for (const [voiceIndex, voice] of (staff.voices ?? []).entries()) {
      // Parser lanes, not V: owners, distinguish 30's generated overlay.
      const laneKey = `${staffIndex}:${voiceIndex}`;
      const lane = lanes.get(laneKey) ?? { beat: firstBeat, ties: new Map<number, Attack>() };
      lanes.set(laneKey, lane);
      if (staff.meter) lane.beat = beat(staff.meter);
      let multiplier = 0, tripletTotal = 0, tripletCount = 0;
      for (const [index, item] of voice.entries()) {
        if (item.el_type === 'meter') lane.beat = beat(item);
        if (item.el_type === 'tempo' && item.bpm !== undefined) return fail();
        if (item.el_type === 'bar' && (item.type.includes('repeat') || item.startEnding || item.endEnding)) return fail();
        if (item.el_type !== 'note') continue;
        const note = item as ParsedNote, span = key(note), id = owner(note);
        const start = note.currentTrackWholeNotes;
        if (parsed.has(span) || typeof start !== 'number' || !Number.isFinite(start) || start < 0 ||
            !Number.isFinite(note.duration) || note.duration <= 0 || note.gracenotes?.length ||
            (note.rest && !['rest', 'invisible'].includes(note.rest.type))) return fail();
        let duration = note.duration;
        // Follow ABCJS 6.7.0's per-lane tuplet rounding, including its final
        // residual, while using the runtime annotation as the actual onset.
        if (note.startTriplet) {
          if (multiplier || !Number.isFinite(note.tripletMultiplier) || note.tripletMultiplier! <= 0 ||
              !Number.isInteger(note.tripletR) || note.tripletR! <= 0) return fail();
          multiplier = note.tripletMultiplier!;
          tripletTotal = note.startTriplet * multiplier * duration;
          if (note.startTriplet !== note.tripletR) {
            const group = voice.slice(index, index + note.tripletR!);
            if (group.length !== note.tripletR || group.some(value => value.el_type !== 'note')) return fail();
            tripletTotal = multiplier * group.reduce((sum, value) => sum + (value as ParsedNote).duration, 0);
          }
          duration = round(duration * multiplier);
          tripletCount = duration;
        } else if (multiplier) {
          if (note.endTriplet) { multiplier = 0; duration = round(tripletTotal - tripletCount); }
          else { duration = round(duration * multiplier); tripletCount += duration; }
        } else if (note.endTriplet) return fail();
        if (!Number.isFinite(duration) || duration <= 0) return fail();
        const release = round(start + duration);
        parsed.set(span, { voice: id, start, duration, beat: lane.beat, rest: !!note.rest });
        const midi = note.midiPitches ?? [];
        let midiIndex = 0;
        const owners: Attack[] = [];
        for (const pitch of note.pitches ?? []) {
          let attack = (pitch.startTie || pitch.endTie) ? lane.ties.get(pitch.pitch) : undefined;
          if (attack) {
            if (attack.voice !== id || !close(attack.start + attack.writtenDuration, start)) return fail();
            attack.writtenDuration = round(attack.writtenDuration + duration);
          } else {
            const sound = midi[midiIndex++];
            if (pitch.endTie || !sound || !Number.isInteger(sound.pitch) ||
                !close(sound.start, start) || !Number.isFinite(sound.duration) || sound.duration <= 0) return fail();
            attack = { voice: id, pitch: sound.pitch, start, duration: sound.duration, writtenDuration: duration };
            const identity = `${span}:${sound.pitch}`;
            if (attacks.has(identity)) return fail();
            attacks.set(identity, attack);
          }
          owners.push(attack);
          if (pitch.startTie) lane.ties.set(pitch.pitch, attack);
          else if (pitch.endTie) lane.ties.delete(pitch.pitch);
        }
        if (midiIndex !== midi.length || (note.rest ? owners.length !== 0 : owners.length === 0)) return fail();
        const decorated = note.decoration?.filter(value => value === 'fermata' || value === 'invertedfermata') ?? [];
        if (decorated.length) {
          if (decorated.length !== 1 || note.rest || owners.some(attack =>
            attack.start > start || attack.start + attack.duration < release - 0.000002)) return fail();
          const extension = round(lane.beat * Math.max(2, Math.ceil(round(1.5 * duration / lane.beat))) - duration);
          if (extension <= 0) return fail();
          marks.push(`${voiceIds[id]}@${round(start * 4)}:${round(duration * 4)}:${lane.beat}`);
          holds.set(release, Math.max(holds.get(release) ?? 0, extension));
        }
      }
      if (multiplier) return fail();
    }
  }
  if (parsed.size !== scope.notes || attacks.size !== scope.attacks || holds.size !== scope.releases ||
      marks.sort().join(';') !== scope.marks || [...lanes.values()].some(lane => lane.ties.size) ||
      [...attacks.values()].some(attack => !close(attack.duration, attack.writtenDuration))) return fail();

  // Reuse the already source-bound presentation witnesses, but never count
  // their inherited/coalesced display participants as additional holds.
  if (reviewedFermataSources[songId]) {
    const witness = getReviewedFermataSource(songId, abc);
    if (!witness) return fail();
    for (const hold of witness.holds) for (const id of hold.voices) {
      const matches = [...parsed.values()].filter(note => voiceIds[note.voice] === id &&
        close(note.start * 4, hold.onset) && close(note.duration * 4, hold.duration) && !note.rest);
      const sharedExtension = holds.get(round((hold.onset + hold.duration) / 4));
      if (matches.length !== 1 || sharedExtension === undefined) return fail();
      const participant = matches[0];
      const extension = round(participant.beat * Math.max(2, Math.ceil(round(1.5 * participant.duration / participant.beat))) - participant.duration);
      // An inherited participant requiring a longer hold is a discrepancy,
      // never permission to silently invent another projected-glyph hold.
      if (extension > sharedExtension && !close(extension, sharedExtension)) return fail();
    }
  }
  if ((songId === 'psalter338' && !hasSharedFermataSource(songId, abc)) ||
      (songId === 'psalter366' && !hasPsalter366FermataSource(songId, abc)) ||
      (songId === 'psalter411' && !hasPsalter411FermataSource(songId, abc))) return fail();
  const original = new Map<string, Original>();
  for (const [trackIndex, track] of sourceTracks.entries()) for (const event of track) {
    if (event.cmd !== 'note') continue;
    const note = event as AudioNote, identity = `${key(note)}:${note.pitch}`, attack = attacks.get(identity);
    if (original.has(identity) || !attack || owner(note) !== attack.voice ||
        !close(note.start, attack.start) || !close(note.duration, attack.duration) ||
        !Number.isFinite(note.gap ?? 0) || (note.cents !== undefined && !Number.isFinite(note.cents))) return fail();
    original.set(identity, { ...attack, track: trackIndex, gap: note.gap ?? 0, style: note.style, cents: note.cents });
  }
  if (original.size !== attacks.size) return fail();
  const orderedHolds = [...holds].sort(([left], [right]) => left - right);
  const addedDuration = orderedHolds.reduce((sum, [, extension]) => sum + extension, 0);
  const shifted = (time: number) => round(time + orderedHolds.reduce((sum, [release, extension]) =>
    sum + (time > release || close(time, release) ? extension : 0), 0));
  let pending: Map<string, Expected> | undefined;
  const setUpAudio = tune.setUpAudio;
  tune.setUpAudio = function (options) {
    pending = undefined;
    const sequence = setUpAudio.call(this, options);
    if (!close(sequence.totalDuration, scope.duration) || !Number.isFinite(sequence.tempo) || sequence.tempo <= 0 ||
        (options.midiTranspose ?? 0) !== midiTranspose || sequence.tracks.length !== sourceTracks.length) return fail();
    const expected = new Map<string, Expected>();
    for (const [trackIndex, track] of sequence.tracks.entries()) for (const event of track) {
      if (event.cmd !== 'note') continue;
      const note = event as AudioNote, identity = `${key(note)}:${note.pitch - midiTranspose}`, source = original.get(identity);
      if (expected.has(identity) || !source || source.track !== trackIndex || owner(note) !== source.voice ||
          !close(note.start, source.start) || !close(note.duration, source.duration) || !close(note.gap ?? 0, source.gap) ||
          note.style !== source.style || note.cents !== source.cents ||
          !Number.isFinite(note.volume) || note.volume < 0 || note.volume > 127 || !instrumentSampleForProgram(note.instrument)) return fail();
      expected.set(identity, { ...source, pitch: note.pitch, start: round(note.start),
        end: round(note.start + note.duration - Math.min(source.gap, source.duration * 2 / 3)),
        instrument: instrumentSampleForProgram(note.instrument)!, volume: note.volume });
    }
    if (expected.size !== original.size) return fail();
    pending = expected;
    // Buffer allocation reads this before the callback. Reserve once per
    // fresh sequence; leave original note times available to role guards.
    return { ...sequence, totalDuration: sequence.totalDuration + addedDuration };
  };
  return (tracks) => {
    const expected = pending;
    if (!expected || tracks.length !== sourceTracks.length) return fail();
    const seen = new Set<string>(), edits: { note: abcjs.NoteMapTrackItem; start: number; end: number }[] = [];
    for (const [trackIndex, track] of tracks.entries()) for (const note of track) {
      const identity = `${key(note)}:${note.pitch - midiTranspose}`, source = expected.get(identity);
      if (seen.has(identity) || !source || source.track !== trackIndex || owner(note) !== source.voice ||
          note.pitch !== source.pitch || !close(note.start, source.start) || !close(note.end, source.end) ||
          note.instrument !== source.instrument || note.volume !== source.volume ||
          note.style !== source.style || note.cents !== source.cents) return fail();
      seen.add(identity);
      // Warp the nominal end, then retain the original articulation gap.
      // A sustained tie crossing 335's q12 and q12.5 receives both holds;
      // its upper voices retain their -0.001 legato overlap at q12.
      const gap = Math.min(source.gap, source.duration * 2 / 3);
      edits.push({ note, start: shifted(source.start), end: round(shifted(source.start + source.duration) - gap) });
    }
    if (seen.size !== expected.size) return fail();
    let applied = false;
    return () => {
      if (applied || pending !== expected) return fail();
      applied = true;
      // The caller has now validated roles and applied selection/cue muting.
      // Change only times, preserving every pitch, attack, style and volume.
      for (const { note, start, end } of edits) { note.start = start; note.end = end; }
    };
  };
}
