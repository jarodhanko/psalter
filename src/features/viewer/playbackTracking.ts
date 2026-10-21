import abcjs from 'abcjs';

/** Deliberately fail-closed ABCJS 6.7 adapter. No audio methods live here. */
export const TRACKING_UNSUPPORTED = 'Note following and note-start selection are unavailable for this score layout. Play still starts at the beginning.';
const close = (a: number, b: number) => Math.abs(a - b) < 0.000003;
const fail = (): never => { throw new Error(TRACKING_UNSUPPORTED); };
type WrittenNote = abcjs.VoiceItemNote & { currentTrackWholeNotes?: number | number[]; midiPitches?: abcjs.MidiPitch[]; gracenotes?: unknown[]; startTriplet?: number };
type Segment = { key: string; head: number; start: number; end: number };
type Attack = { span: string; pitch: number; start: number; end: number; soundEnd: number; segments: Segment[] };
type Event = { key: string; span: string; voice: string; signature: string; note?: WrittenNote };
export type WrittenScore = { abc: string; voices: Map<string, Event[]>; notes: Map<string, Event>; attacks: Attack[] };
export type TrackingSelection = Readonly<{ song: string; key: string; copy: number }>;
export type TrackingInterval = Readonly<{ key: string; head: number; start: number; end: number }>;
export type TrackingSchedule = Readonly<{ intervals: readonly TrackingInterval[]; starts: Readonly<Record<string, number>> }>;
export type CapturedTrackingSequence = Readonly<{ source: string; before: readonly (readonly Readonly<abcjs.NoteMapTrackItem>[])[]; after: readonly (readonly Readonly<abcjs.NoteMapTrackItem>[])[] }>;
export type VisibleScoreRegistration = {
  host: HTMLElement; tune: abcjs.TuneObject; source: string; copy: number; supported: boolean;
};
export type RegisterVisibleScore = (render: VisibleScoreRegistration) => () => void;

const spanOf = (note: { startChar?: number; endChar?: number }, offset = 0) => {
  if (!Number.isInteger(note.startChar) || !Number.isInteger(note.endChar) || note.startChar! < 0 || note.endChar! <= note.startChar!) return fail();
  return `${note.startChar! + offset}:${note.endChar! + offset}`;
};

/** Explicit V: ownership plus a complete per-voice musical stream witness.
 * Indices are used only after comparing every event and every playback occurrence.
 * Lyrics, headings, system breaks and staff re-grouping do not define identity. */
export function readWrittenScore(abc: string): WrittenScore {
  if (abcjs.signature !== 'abcjs-basic v6.7.0' || /(?:^|\n)%%(?:MIDI.*(?:drum|transpose|beat|gchord)|swing)\b/.test(abc) || /&/.test(abc)) return fail();
  const tune = abcjs.parseOnly(abc)[0];
  if (!tune || tune.warnings?.length) return fail();
  const sequence = tune.setUpAudio({ chordsOff: true });
  const changes = [...abc.matchAll(/(?:^V:|\[V:)[ \t]*([^\s\]]+)/gm)].map(match => ({ start: match.index!, voice: match[1] }));
  const owner = (position: number) => [...changes].reverse().find(change => change.start <= position)?.voice ?? (changes.length ? fail() : 'default');
  const voices = new Map<string, Event[]>(), notes = new Map<string, Event>();
  for (const line of tune.lines) for (const staff of line.staff ?? []) for (const lane of staff.voices ?? []) for (const item of lane) {
    if (item.el_type === 'tempo') return fail();
    if (item.el_type !== 'note' && item.el_type !== 'bar') continue;
    const span = spanOf(item), voice = owner(item.startChar!);
    if (voice !== owner(item.endChar! - 1)) return fail();
    const key = `${voice}@${span}`;
    let signature: string;
    if (item.el_type === 'note') {
      const note = item as WrittenNote;
      if (note.gracenotes?.length || note.startTriplet || 'endTriplet' in note || !Number.isFinite(note.duration) || note.duration <= 0 ||
          (note.rest && !['rest', 'invisible'].includes(note.rest.type)) || notes.has(span)) return fail();
      const starts = [note.currentTrackWholeNotes].flat();
      if (!starts.length || starts.some(start => typeof start !== 'number' || !Number.isFinite(start))) return fail();
      // Accidentals and tie endpoints are part of the witness; do not accept pitch-only matches.
      signature = JSON.stringify(['note', note.duration, note.rest?.type, note.pitches?.map(p => [p.pitch, p.accidental, !!p.startTie, !!p.endTie]), starts]);
      const event = { key, span, voice, signature, note };
      notes.set(span, event);
      const list = voices.get(voice) ?? []; list.push(event); voices.set(voice, list);
    } else {
      signature = JSON.stringify(['bar', item.type, item.startEnding, item.endEnding]);
      const list = voices.get(voice) ?? []; list.push({ key, span, voice, signature }); voices.set(voice, list);
    }
  }
  const attacks: Attack[] = [];
  for (const track of sequence.tracks) for (const note of track) {
    if (note.cmd !== 'note') continue;
    const span = spanOf(note);
    if (!notes.has(span) || !Number.isInteger(note.pitch) || !Number.isFinite(note.start) || !Number.isFinite(note.duration) || note.duration <= 0 || !Number.isFinite(note.gap ?? 0) || ((note as abcjs.AudioTrackNoteItem & { cents?: number }).cents ?? 0) !== 0) return fail();
    if (attacks.some(a => a.span === span && a.pitch === note.pitch && close(a.start, note.start))) return fail();
    attacks.push({ span, pitch: note.pitch, start: note.start, end: note.start + note.duration, soundEnd: note.start + note.duration - Math.min(note.gap ?? 0, note.duration * 2 / 3), segments: [] });
  }
  for (const events of voices.values()) {
    events.sort((a, b) => Number(a.span.split(':')[0]) - Number(b.span.split(':')[0]));
    const ties = new Map<number, Attack[]>();
    for (const { key, span, note } of events) {
      if (!note || note.rest) continue;
      const starts = [note.currentTrackWholeNotes].flat() as number[];
      const own = attacks.filter(attack => attack.span === span);
      let attackPitch = 0;
      const pitches = note.pitches ?? [];
      if (!pitches.length || new Set(pitches.map(p => p.pitch)).size !== pitches.length) return fail();
      const distinctMidi = (note.midiPitches ?? []).map(pitch => pitch.pitch);
      for (const [head, pitch] of pitches.entries()) {
        const midi = pitch.endTie ? undefined : distinctMidi[attackPitch++];
        const linked = pitch.endTie ? ties.get(pitch.pitch) : own.filter(a => a.pitch === midi);
        if (!linked || linked.length !== starts.length) return fail();
        for (const start of starts) {
          const matches = linked.filter(a => pitch.endTie ? close(a.segments.at(-1)?.end ?? -1, start) : close(a.start, start));
          if (matches.length !== 1 || start + note.duration > matches[0].end + 0.000003) return fail();
          matches[0].segments.push({ key, head, start, end: start + note.duration });
        }
        if (pitch.startTie) ties.set(pitch.pitch, linked); else ties.delete(pitch.pitch);
      }
      if (attackPitch !== distinctMidi.length) return fail();
    }
    if (ties.size) return fail();
  }
  if (attacks.some(a => !a.segments.length || !close(a.segments[0].start, a.start) || !close(a.segments.at(-1)!.end, a.end))) return fail();
  return { abc, voices, notes, attacks };
}

export function validateWrittenProjection(canonical: WrittenScore, projected: WrittenScore): Map<string, Event> {
  const result = new Map<string, Event>();
  for (const [voice, projectedEvents] of projected.voices) {
    const original = canonical.voices.get(voice);
    if (!original || original.length !== projectedEvents.length || original.some((event, index) => event.signature !== projectedEvents[index].signature)) return fail();
    projectedEvents.forEach((event, index) => {
      if (!event.note) return;
      // Validate realized pitch, duration, tie head, and every repeat occurrence too.
      // This catches key/clef/MIDI changes even when written note letters match.
      const sounds = (score: WrittenScore, key: string) => score.attacks.flatMap(attack => attack.segments
        .filter(segment => segment.key === key).map(segment => [attack.pitch, segment.head, segment.start, segment.end]));
      if (JSON.stringify(sounds(canonical, original[index].key)) !== JSON.stringify(sounds(projected, event.key))) return fail();
      result.set(event.span, original[index]);
    });
  }
  if (!result.size) return fail();
  return result;
}

/** Snapshot only after existing muting and fermata transforms have completed. */
export function captureTrackingSequence(source: string, before: abcjs.NoteMapTrack[], after: abcjs.NoteMapTrack[]): CapturedTrackingSequence {
  const freeze = (tracks: abcjs.NoteMapTrack[]) => Object.freeze(tracks.map(track => Object.freeze(track.map(note => Object.freeze({ ...note })))));
  return Object.freeze({ source, before: freeze(before), after: freeze(after) });
}

export function buildTrackingSchedule(canonical: WrittenScore, capture: CapturedTrackingSequence, secondsPerWhole: number, transpose: number): TrackingSchedule {
  if (!Number.isFinite(secondsPerWhole) || secondsPerWhole <= 0 || !Number.isInteger(transpose)) return fail();
  const source = readWrittenScore(capture.source), projection = validateWrittenProjection(canonical, source);
  const intervals: TrackingInterval[] = [], starts = new Map<string, number>();
  if (capture.before.length !== capture.after.length) return fail();
  const seen = new Set<Attack>();
  capture.before.forEach((track, trackIndex) => {
    if (track.length !== capture.after[trackIndex].length) return fail();
    track.forEach((before, index) => {
      const after = capture.after[trackIndex][index];
      if (before.startChar !== after.startChar || before.endChar !== after.endChar || before.pitch !== after.pitch || before.instrument !== after.instrument || before.style !== after.style || before.cents !== after.cents ||
          !Number.isFinite(after.start) || !Number.isFinite(after.end) || after.start < 0 || after.end <= after.start) return fail();
      const attacks = source.attacks.filter(a => a.span === spanOf(before) && a.pitch + transpose === before.pitch && close(a.start, before.start) && close(a.soundEnd, before.end));
      if (attacks.length !== 1 || seen.has(attacks[0])) return fail();
      const attack = attacks[0]; seen.add(attack);
      if (after.volume <= 0) return;
      // Fermata placement within a sustained tied chain needs an explicit warp witness.
      // Until then, decline rather than interpolate an interior segment boundary.
      if (attack.segments.length > 1 && !close(after.end - after.start, before.end - before.start)) return fail();
      for (const [segmentIndex, segment] of attack.segments.entries()) {
        const written = [...source.notes.values()].find(event => event.key === segment.key);
        const key = written && projection.get(written.span)?.key;
        if (!key) return fail();
        const start = (after.start + segment.start - attack.start) * secondsPerWhole;
        const end = (segmentIndex === attack.segments.length - 1 ? after.end : after.start + segment.end - attack.start) * secondsPerWhole;
        intervals.push(Object.freeze({ key, head: segment.head, start, end }));
        starts.set(key, Math.min(starts.get(key) ?? Infinity, start));
      }
    });
  });
  if (seen.size !== source.attacks.length) return fail();
  return Object.freeze({ intervals: Object.freeze(intervals), starts: Object.freeze(Object.fromEntries(starts)) });
}

export type VisibleHead = {
  key: string; head: number; element: SVGElement; copy: number;
  voice: string; onset: number; description: string;
};

/** Describe the rendered note, including transposition and this copy's lyrics.
 * Written pitch/word context is useful without asking anyone to count notes. */
function visibleNoteDescription(note: abcjs.VoiceItemNote, pitch: NonNullable<abcjs.VoiceItemNote['pitches']>[number]): string {
  const letter = 'CDEFGAB'[((pitch.pitch % 7) + 7) % 7];
  const octave = Math.floor(pitch.pitch / 7) + 4;
  const accidentals: Record<string, string> = { sharp: ' sharp', flat: ' flat', natural: ' natural', dblsharp: ' double sharp', dblflat: ' double flat', quartersharp: ' quarter sharp', quarterflat: ' quarter flat' };
  const accidental = pitch.accidental ? accidentals[pitch.accidental] ?? '' : '';
  const durations: Record<number, string> = { 1: 'whole note', 0.75: 'dotted half note', 0.5: 'half note', 0.375: 'dotted quarter note', 0.25: 'quarter note', 0.1875: 'dotted eighth note', 0.125: 'eighth note', 0.0625: 'sixteenth note' };
  const lyrics = (note as abcjs.AbcElem).lyric?.map(lyric => lyric.syllable.trim()).filter(Boolean);
  return [`written ${letter}${accidental} ${octave}`, durations[note.duration] ?? 'note',
    lyrics?.length ? `lyrics ${[...new Set(lyrics)].join(' / ')}` : undefined,
    pitch.endTie ? 'tied continuation' : undefined].filter(Boolean).join(', ');
}
export function bindVisibleHeads(canonical: WrittenScore, registration: VisibleScoreRegistration): VisibleHead[] {
  if (!registration.supported || !registration.host.isConnected) return fail();
  const projection = validateWrittenProjection(canonical, readWrittenScore(registration.source));
  // ABCJS automatic wrapping reparses TuneBook's stripped source; a direct
  // render keeps the original prefix offset. Qualify this one exact source
  // relationship, then require the entire note-span set to match one convention.
  let offset = 0;
  const prefix = /^[ \t\r\n]+/.exec(registration.source)?.[0];
  if (prefix) {
    const book = new abcjs.TuneBook(registration.source);
    if (book.header || book.tunes.length !== 1 || book.tunes[0].startPos !== prefix.length ||
      book.tunes[0].abc !== registration.source.slice(prefix.length).trimEnd()) return fail();
    const notes = registration.tune.lines.flatMap(line => line.staff ?? []).flatMap(staff => staff.voices ?? []).flat()
      .filter(item => item.el_type === 'note');
    const matches = (shift: number) => {
      const spans = new Set(notes.map(note => spanOf(note, shift)));
      return spans.size === notes.length && spans.size === projection.size && [...spans].every(span => projection.has(span));
    };
    if (!matches(0)) {
      offset = prefix.length;
      if (!matches(offset)) return fail();
    }
  }
  const heads: VisibleHead[] = [], seen = new Set<string>(), glyphs = new Set<SVGElement>();
  for (const line of registration.tune.lines) for (const staff of line.staff ?? []) for (const voice of staff.voices ?? []) for (const item of voice) {
    if (item.el_type !== 'note' || item.rest) continue;
    const span = spanOf(item, offset), written = projection.get(span), absolute = (item as abcjs.AbcElem).abselem;
    if (!written?.note || seen.has(span) || !absolute || absolute.heads.length !== written.note.pitches?.length) return fail();
    seen.add(span);
    const sourceOrder = written.note.pitches!.map((pitch, index) => ({ pitch: pitch.pitch, index })).sort((a, b) => a.pitch - b.pitch);
    const renderedPitches = item.pitches;
    if (!renderedPitches || renderedPitches.length !== sourceOrder.length) return fail();
    for (const [order, glyph] of absolute.heads.entries()) {
      if (glyph.pitch !== renderedPitches[order].verticalPos || (order > 0 && renderedPitches[order].pitch <= renderedPitches[order - 1].pitch)) return fail();
      const head = sourceOrder[order].index;
      const element = (glyph as abcjs.RelativeElement & { graphelem?: SVGElement }).graphelem;
      // Coalesced/unison glyph ownership is not established by this adapter.
      // Reject shared nodes rather than let one voice erase another's red state
      // or choose an arbitrary owner on a tap.
      if (!element || !registration.host.contains(element) || glyphs.has(element)) return fail();
      glyphs.add(element);
      heads.push({ key: written.key, head, element, copy: registration.copy,
        voice: written.voice, onset: Math.min(...[written.note.currentTrackWholeNotes].flat() as number[]),
        description: visibleNoteDescription(item, renderedPitches[order]),
      });
    }
  }
  if (seen.size !== [...projection.values()].filter(event => !event.note?.rest).length) return fail();
  return heads;
}

/** Read the conversion used by this installed ABCJS release, not a guessed beat size. */
export function synthSecondsPerWhole(synth: abcjs.MidiBuffer): number {
  const runtime = synth as abcjs.MidiBuffer & { millisecondsPerMeasure?: number; meterSize?: number };
  const seconds = (runtime.millisecondsPerMeasure ?? NaN) / 1000 / (runtime.meterSize ?? NaN);
  if (!Number.isFinite(seconds) || seconds <= 0) return fail();
  return seconds;
}

/** Called only by Play, after prime, with the pre-loading selection snapshot. */
export function prepareTrackedStart({ synth, capture, written, source, song, transpose, selection, controller }: {
  synth: abcjs.MidiBuffer; capture?: CapturedTrackingSequence; written?: WrittenScore;
  source: string; song: string; transpose: number; selection?: TrackingSelection;
  controller: { setNotice: (message: string) => void; clearSelection: (message?: string) => void };
}): TrackingSchedule | undefined {
  const invalid = (): never => {
    controller.clearSelection('The selected start was cleared because it could not be matched safely.');
    throw new Error('The selected note could not be matched safely. Press Play again to start from the beginning.');
  };
  let schedule: TrackingSchedule;
  try {
    if (!capture) return fail();
    schedule = buildTrackingSchedule(written ?? readWrittenScore(source), capture, synthSecondsPerWhole(synth), transpose);
  } catch {
    controller.setNotice(TRACKING_UNSUPPORTED);
    if (selection) return invalid();
    return undefined;
  }
  if (selection) {
    const seconds = schedule.starts[selection.key];
    if (selection.song !== song || seconds === undefined || synth.getIsRunning()) return invalid();
    // The sole seek site: the new buffer is primed but still stopped.
    synth.seek(seconds, 'seconds');
  }
  return schedule;
}
