import { instrumentSampleForProgram } from './instruments';
import abcjs from 'abcjs';

type Span = { startChar?: number; endChar?: number };
type ParsedNote = abcjs.VoiceItemNote & { gracenotes?: unknown[]; decoration?: string[]; startTriplet?: unknown; endTriplet?: unknown };
type Original = { voice: number; pitch: number; start: number; duration: number; gap: number };
type Expected = { voice: number; pitch: number; start: number; end: number; instrument: string; volume: number };
const voices = ['T1', 'T2', 'B1', 'B2'];
const releases = [2.25, 4.5, 6.75];
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-7;
const round = (value: number) => Math.round(value * 1e6) / 1e6;
const fail = (): never => { throw new Error('Unable to preserve Psalter 313’s shared fermata timing during playback.'); };

/** Each marked duration gets max(2, ceil(1.5 * quarter beats)) total beats.
 * A common release uses the largest extension once, keeping all parts together.
 * Thus bar 6's quarter lasts 3 beats while its dotted half lasts 5. Reserve
 * buffer time before prime; warp only after source-role guards and muting.
 * This exact-source rule is not a generic fermata implementation. */
export function preparePsalter313FermataAudio(
  songId: string, abc: string, tune: abcjs.TuneObject, sourceTracks: abcjs.AudioTrack[],
  voiceIds: readonly string[], visible: ReadonlySet<number>, midiTranspose: number,
  sourceVoice: (startChar: number | undefined, trackIndex: number) => number | undefined,
): ((tracks: abcjs.NoteMapTrack[]) => () => void) | undefined {
  if (songId !== 'psalter313') return undefined;
  if (abc !== reviewedAbc || abcjs.signature !== 'abcjs-basic v6.7.0' || tune.warnings?.length ||
      voiceIds.length !== 4 || new Set(voiceIds).size !== 4 || !voices.every(id => voiceIds.includes(id)) ||
      !Number.isInteger(midiTranspose) || [...visible].some(i => !Number.isInteger(i) || i < 0 || i >= 4)) return fail();
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
  const parsed = new Map<string, { voice: number; start: number; duration: number }>();
  const elapsed = new Map<number, number>();
  const marks = new Set<string>();
  const holds = new Map<number, number>();
  const requiredMarks = new Set(['T1:8:1', 'T1:17:1', 'T1:26:1', 'B1:8:1', 'B1:15:3', 'B1:26:1']);
  for (const line of tune.lines) for (const staff of line.staff ?? []) for (const voice of staff.voices ?? []) {
    for (const item of voice) {
      if (item.el_type !== 'note') continue;
      const note = item as ParsedNote, span = key(note), id = owner(note), start = elapsed.get(id) ?? 0;
      if (parsed.has(span) || note.rest || note.pitches?.length !== 1 || note.gracenotes?.length ||
          note.startTriplet || note.endTriplet || note.pitches.some(p => p.startTie || p.endTie) ||
          !Number.isFinite(note.duration) || note.duration <= 0) return fail();
      parsed.set(span, { voice: id, start, duration: note.duration });
      elapsed.set(id, start + note.duration);
      if (note.decoration?.length) {
        const identity = `${voiceIds[id]}:${start * 4}:${note.duration * 4}`;
        if (note.decoration.length !== 1 || note.decoration[0] !== 'fermata' || !requiredMarks.has(identity) || marks.has(identity)) return fail();
        marks.add(identity);
        const release = start + note.duration, beats = note.duration * 4;
        const extension = (Math.max(2, Math.ceil(1.5 * beats)) - beats) / 4;
        if (!releases.some(value => close(value, release)) || extension <= 0) return fail();
        holds.set(release, Math.max(holds.get(release) ?? 0, extension));
      }
    }
  }
  if (parsed.size !== 114 || marks.size !== requiredMarks.size || elapsed.size !== 4 ||
      [...elapsed.values()].some(end => !close(end, 9)) || sourceTracks.length !== 4) return fail();
  if (holds.size !== 3 || !close(holds.get(2.25) ?? NaN, 0.25) ||
      !close(holds.get(4.5) ?? NaN, 0.5) || !close(holds.get(6.75) ?? NaN, 0.25)) return fail();
  const addedDuration = [...holds.values()].reduce((sum, extension) => sum + extension, 0);
  const original = new Map<string, Original>();
  for (const track of sourceTracks) for (const note of track) {
    if (note.cmd !== 'note') continue;
    const span = key(note), id = owner(note), source = parsed.get(span);
    if (original.has(span) || !source || source.voice !== id || !close(note.start, source.start) ||
        !close(note.duration, source.duration) || !Number.isInteger(note.pitch) || !Number.isFinite(note.gap ?? 0)) return fail();
    original.set(span, { voice: id, pitch: note.pitch, start: note.start, duration: note.duration, gap: note.gap ?? 0 });
  }
  if (original.size !== parsed.size) return fail();
  for (const release of releases) {
    const ending = [...original.values()].filter(note => close(note.start + note.duration, release));
    if (ending.length !== 4 || new Set(ending.map(note => note.voice)).size !== 4 || ending.some(note => !close(note.gap, 0))) return fail();
  }

  let pending: Map<string, Expected> | undefined;
  const setUpAudio = tune.setUpAudio;
  tune.setUpAudio = function (options) {
    pending = undefined;
    const sequence = setUpAudio.call(this, options);
    if (!close(sequence.totalDuration, 9) || !Number.isFinite(sequence.tempo) || sequence.tempo <= 0 ||
        (options.midiTranspose ?? 0) !== midiTranspose || sequence.tracks.length !== sourceTracks.length) return fail();
    const expected = new Map<string, Expected>();
    for (const track of sequence.tracks) for (const note of track) {
      if (note.cmd !== 'note') continue;
      const span = key(note), source = original.get(span), id = owner(note);
      if (expected.has(span) || !source || source.voice !== id || note.pitch !== source.pitch + midiTranspose ||
          !close(note.start, source.start) || !close(note.duration, source.duration) || !close(note.gap ?? 0, source.gap) ||
          !Number.isFinite(note.volume) || note.volume < 0 || note.volume > 127 || !instrumentSampleForProgram(note.instrument)) return fail();
      expected.set(span, { voice: id, pitch: note.pitch, start: round(note.start),
        end: round(note.start + note.duration - Math.min(note.gap ?? 0, note.duration * 2 / 3)),
        instrument: instrumentSampleForProgram(note.instrument)!, volume: note.volume });
    }
    if (expected.size !== original.size) return fail();
    pending = expected;
    // Do not warp tracks here: source-role callbacks validate original times.
    // Each call receives a fresh sequence, so reservations cannot accumulate.
    return { ...sequence, totalDuration: sequence.totalDuration + addedDuration };
  };

  const shifted = (time: number) => round(time + [...holds].reduce((sum, [release, extension]) =>
    sum + (time > release || close(time, release) ? extension : 0), 0));
  return (tracks) => {
    const expected = pending;
    if (!expected || tracks.length !== sourceTracks.length) return fail();
    const seen = new Set<string>(), edits: { note: abcjs.NoteMapTrackItem; start: number; end: number }[] = [];
    // Validate every note before the caller changes volume or timing.
    for (const track of tracks) for (const note of track) {
      const span = key(note), source = expected.get(span);
      if (seen.has(span) || !source || owner(note) !== source.voice || note.pitch !== source.pitch ||
          !close(note.start, source.start) || !close(note.end, source.end) ||
          note.instrument !== source.instrument || note.volume !== source.volume || note.style || note.cents) return fail();
      seen.add(span);
      edits.push({ note, start: shifted(note.start), end: shifted(note.end) });
    }
    if (seen.size !== expected.size) return fail();
    let applied = false;
    return () => {
      if (applied || pending !== expected) return fail();
      applied = true;
      for (const { note, start, end } of edits) { note.start = start; note.end = end; }
    };
  };
}

// Frozen reviewed source, SHA-256 c4ab9687ecc978a09cc23c492c758ce80e134dca8de70a5d6c375a35422f1950.
const reviewedAbc = "%abc-2.1\nT:Consecration and Dedication\nT:LAMBETH\nC:William Schultes\nN:Psalm 116. C. M. (Stanzas 7–11.)\nM:3/4\nL:1/8\nK:G\n%%score (T1 T2)(B1 B2)\n%%stretchlast 1\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\n[V:T1] B2 B2 B2 | c4 F2 | E2 F2 !fermata!G2 || G2 A2 B2 | d4 c2 | (B4 !fermata!A2) |\nw:1.~What shall I ren- der to the Lord, What shall my of- f'ring be, _\nw:2.~Sal- va- tion's cup my soul will take, While to the Lord I pray, _\nw:3.~Not light- ly does the Lord per- mit His cho- sen saints to die; _\nw:4.~The sac- ri- fice of praise I bring, While to the Lord I pray, _\nw:5.~With- in His house, the house of prayer, My soul shall bless the Lord, _\nB2 B2 B2 | c4 F2 | E2 F2 !fermata!G2 || G2 F2 G2 | B4 A2 | G6 |]\nw:For all the gra- cious ben- e- fits He has be- stowed on me?\nw:And with His peo- ple I will meet, My thank- ful vows to pay.\nw:From death Thou hast de- liv- ered me, Thy serv- ant, Lord, am I.\nw:And with His peo- ple I will meet, My thank- ful vows to pay.\nw:And prais- es to His ho- ly Name Let all His saints ac- cord.\n[V:T2] G2 G2 G2 | F4 C2 | C2 C2 B,2 || D2 D2 D2 | E4 E2 | (G4 F2) |\nG2 G2 G2 | F4 C2 | C2 C2 B,2 || ^C2 C2 C2 | D4 =C2 | B,6 |]\n[V:B1] D2 D2 D2 | D4 A,2 | G,2 A,2 !fermata!G,2 || G,2 F,2 G,2 | ^G,4 A,2 | !fermata!D6 |\nD2 D2 D2 | D4 A,2 | G,2 A,2 !fermata!G,2 || G,2 A,2 G,2 | G,4 F,2 | G,6 |]\n[V:B2] G,2 G,2 G,2 | A,4 D,2 | D,2 D,2 G,,2 || B,,2 D,2 G,2 | C,4 C,2 | D,6 |\nG,2 G,2 G,2 | A,4 D,2 | D,2 D,2 E,2 || E,2 E,2 E,2 | D,4 D,2 | G,,6 |]\nW:1. What shall I render to the Lord, What shall my off'ring be, For all the gracious benefits He has bestowed on me?\nW:2. Salvation's cup my soul will take While to the Lord I pray, And with His people I will meet, My thankful vows to pay.\nW:3. Not lightly does the Lord permit His chosen saints to die; From death Thou hast delivered me, Thy servant, Lord, am I.\nW:4. The sacrifice of praise I bring While to the Lord I pray, And with His people I will meet, My thankful vows to pay.\nW:5. Within His house, the house of prayer, My soul shall bless the Lord, And praises to His holy Name Let all His saints accord.";
