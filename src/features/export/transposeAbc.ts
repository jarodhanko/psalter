import abcjs from 'abcjs';

const failure = () => new Error('This score could not be safely transposed for ABC export.');

function parseOne(source: string, steps = 0): abcjs.TuneObject {
  const tunes = abcjs.parseOnly(source, { visualTranspose: steps });
  if (tunes.length !== 1 || !tunes[0].lines.some(line => line.staff?.some(staff =>
    staff.voices?.some(voice => voice.some(item => item.el_type === 'note'))))) throw failure();
  return tunes[0];
}

/** strTranspose searches every K: substring, even in lyrics and annotations.
 * Keep only actual standalone/inline key fields visible to that search. Parse
 * the protected string too, so its source offsets remain authoritative.
 */
function protectKeyText(source: string): { source: string; restore: (value: string) => string } {
  let marker = 'PSALTERPROTECTEDKEYCOLON';
  while (source.includes(marker)) marker += 'X';
  const keys = new Set<number>();
  let lineOffset = 0;
  for (const line of source.split('\n')) {
    const field = /^[ \t\uFEFF]*([A-Za-z+]):/.exec(line);
    const fieldKey = field?.[1] === 'K' ? line.indexOf('K:') : -1;
    if (fieldKey >= 0) keys.add(lineOffset + fieldKey);
    if (!field) {
      let quote = false;
      let decoration = '';
      for (let index = 0; index < line.length; index++) {
        const char = line[index];
        if (char === '\\') { index++; continue; }
        if (quote) { if (char === '"') quote = false; continue; }
        if (decoration) { if (char === decoration) decoration = ''; continue; }
        if (char === '%') break;
        if (char === '"') { quote = true; continue; }
        if (char === '!' || char === '+') { decoration = char; continue; }
        if (char === '[' && /^[A-Za-z]:/.test(line.slice(index + 1))) {
          if (line.slice(index + 1, index + 3) === 'K:') keys.add(lineOffset + index + 1);
          const end = line.indexOf(']', index + 1);
          if (end < 0) throw failure();
          index = end;
        }
      }
    }
    lineOffset += line.length + 1;
  }
  return {
    source: source.replace(/K:/g, (value, offset: number) => keys.has(offset) ? value : marker),
    restore: value => value.split(marker).join('K:'),
  };
}

/** ABCJS 6.7.0's string transposer expects keySignature, while its parser emits
 * key. Adapt a disposable view only, including no synthetic/source-less keys.
 */
function transpositionView(tune: abcjs.TuneObject, source: string): abcjs.TuneObject {
  return {
    ...tune,
    lines: tune.lines.map(line => ({
      ...line,
      ...(line.staff ? { staff: line.staff.map(staff => ({
        ...staff,
        voices: staff.voices?.map(voice => voice.map(item => {
          if (item.el_type !== 'key') return item;
          if (typeof item.startChar !== 'number' || typeof item.endChar !== 'number' ||
              !/^\[?K:/.test(source.slice(item.startChar, item.endChar))) throw failure();
          return { ...item, el_type: 'keySignature' } as unknown as abcjs.VoiceItem;
        })),
      })) } : {}),
    })),
  };
}

const pitchClasses: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const accidentals: Record<string, number> = { natural: 0, sharp: 1, flat: -1, dblsharp: 2, dblflat: -2 };
const mod12 = (value: number) => (value % 12 + 12) % 12;

// F# and Gb are equivalent here: the visual and string engines deliberately
// choose different enharmonic spellings. Compare tonic, mode and sounding scale.
function keyMeaning(key: abcjs.KeySignature | undefined): unknown {
  if (!key || !Object.hasOwn(pitchClasses, key.root) || !['', '#', 'b'].includes(key.acc)) throw failure();
  const scale = { ...pitchClasses };
  for (const accidental of key.accidentals ?? []) {
    const note = accidental.note.toUpperCase();
    if (!Object.hasOwn(scale, note) || !Object.hasOwn(accidentals, accidental.acc)) throw failure();
    scale[note] = pitchClasses[note] + accidentals[accidental.acc];
  }
  return [mod12(pitchClasses[key.root] + (key.acc === '#' ? 1 : key.acc === 'b' ? -1 : 0)),
    key.mode, Object.values(scale).map(mod12).sort((a, b) => a - b)];
}

function notationFingerprint(tune: abcjs.TuneObject): unknown {
  return tune.lines.filter(line => line.staff).map(line => line.staff!.map(staff => ({
    key: keyMeaning(staff.key),
    voices: staff.voices?.map(voice => voice.flatMap<unknown>(item => {
      if (item.el_type === 'key') return [{ key: keyMeaning(item as unknown as abcjs.KeySignature) }];
      if (item.el_type === 'note') return [{ duration: item.duration, rest: item.rest?.type,
        lyric: (item as unknown as { lyric?: unknown[] }).lyric ?? [], pitches: item.pitches?.length ?? 0 }];
      return [];
    })),
  })));
}

function audioFingerprint(tune: abcjs.TuneObject, steps: number): unknown {
  // The audio sequencer subtracts tune.visualTranspose. Passing the same offset
  // is required to hear the displayed pitches rather than concert pitches.
  const audio = tune.setUpAudio({ midiTranspose: steps });
  const rounded = (value: number) => {
    if (!Number.isFinite(value)) throw failure();
    return Math.round(value * 1e9) / 1e9;
  };
  return [rounded(audio.totalDuration), audio.tracks.map(track => track
    .filter((event): event is abcjs.AudioTrackNoteItem => event.cmd === 'note')
    .map(event => [rounded(event.pitch), rounded(event.start), rounded(event.duration)])
    .sort((a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2]))];
}

function nonMusicLines(source: string): string[] {
  return source.split('\n').filter(line => /^[ \t\uFEFF]*(?:%|[A-JL-Za-z+]:)/.test(line));
}

/** The string engine can drop a cancellation after an octave-marked note:
 * e.g. ^D, ... =D, becomes ^E, ... E, rather than ^E, ... =E,.
 * Restore only explicit accidentals present in the displayed parse, where both
 * parses agree on the diatonic pitch. Never rewrite pitches or guess a spelling.
 * The complete audio/notation comparison still has to pass after this repair.
 */
function restoreMissingAccidentals(source: string, expected: abcjs.TuneObject, actual: abcjs.TuneObject): string {
  const notes = (tune: abcjs.TuneObject) => tune.lines.flatMap(line => line.staff?.flatMap(staff =>
    staff.voices?.flatMap(voice => voice.filter(item => item.el_type === 'note')) ?? []) ?? []);
  const reference = notes(expected), exported = notes(actual);
  if (reference.length !== exported.length) throw failure();
  const symbols: Record<string, string> = { natural: '=', flat: '_', sharp: '^', dblflat: '__', dblsharp: '^^' };
  const edits = new Map<number, string>();
  exported.forEach((item, index) => {
    const desired = reference[index];
    if (!item.pitches || !desired.pitches || item.pitches.length !== desired.pitches.length) return;
    const missing = item.pitches.map((pitch, pitchIndex) => {
      const target = desired.pitches![pitchIndex];
      return !pitch.accidental && target.accidental && target.pitch === pitch.pitch ? symbols[target.accidental] : undefined;
    });
    if (!missing.some(Boolean)) return;
    if ((item as unknown as { gracenotes?: unknown[] }).gracenotes?.length ||
        typeof item.startChar !== 'number' || typeof item.endChar !== 'number') throw failure();
    const segment = source.slice(item.startChar, item.endChar);
    const tokens: { at: number; text: string }[] = [];
    for (let at = 0; at < segment.length; at++) {
      const char = segment[at];
      if (char === '"' || char === '!' || char === '+') {
        const end = segment.indexOf(char, at + 1);
        if (end < 0) throw failure();
        at = end;
        continue;
      }
      const token = /^[\^_=]*[A-Ga-g][,']*/.exec(segment.slice(at));
      if (token) { tokens.push({ at, text: token[0] }); at += token[0].length - 1; }
    }
    if (tokens.length !== item.pitches.length) throw failure();
    missing.forEach((symbol, pitchIndex) => {
      if (!symbol) return;
      const token = tokens[pitchIndex];
      if (token.text !== item.pitches![pitchIndex].name || !/^[A-Ga-g][,']*$/.test(token.text)) throw failure();
      const at = item.startChar! + token.at;
      if (edits.has(at) && edits.get(at) !== symbol) throw failure();
      edits.set(at, symbol);
    });
  });
  for (const [at, symbol] of [...edits].sort((a, b) => b[0] - a[0])) {
    source = source.slice(0, at) + symbol + source.slice(at);
  }
  return source;
}

/** Materialize the remaining visual transpose of the already-prepared score.
 * Callers must pass a display witness's ABC and residual offset (usually zero),
 * rather than reapplying the viewer offset to an already-transposed witness.
 * Unsupported engine contexts fail closed instead of exporting wrong pitches.
 */
export function materializeAbcTranspose(source: string, steps: number): string {
  if (!Number.isInteger(steps) || steps < -10 || steps > 12) throw failure();
  const endings = source.match(/\r\n|\r|\n/g) ?? [];
  const normalized = source.replace(/\r\n|\r/g, '\n');
  const input = parseOne(normalized);
  if (steps === 0) return source;
  const protectedText = protectKeyText(normalized);
  const parsed = parseOne(protectedText.source);
  const transposed = abcjs.strTranspose(protectedText.source,
    [transpositionView(parsed, protectedText.source)], steps);
  let output = protectedText.restore(transposed);
  const expected = parseOne(normalized, steps);
  let actual = parseOne(output);
  if (JSON.stringify(notationFingerprint(expected)) !== JSON.stringify(notationFingerprint(actual))) throw failure();
  if (JSON.stringify(audioFingerprint(expected, steps)) !== JSON.stringify(audioFingerprint(actual, 0))) {
    output = restoreMissingAccidentals(output, expected, actual);
    actual = parseOne(output);
  }
  if ((actual.warnings?.length ?? 0) > (input.warnings?.length ?? 0) ||
      JSON.stringify(nonMusicLines(normalized)) !== JSON.stringify(nonMusicLines(output)) ||
      JSON.stringify(notationFingerprint(expected)) !== JSON.stringify(notationFingerprint(actual)) ||
      JSON.stringify(audioFingerprint(expected, steps)) !== JSON.stringify(audioFingerprint(actual, 0)) ||
      (output.match(/\n/g)?.length ?? 0) !== endings.length) throw failure();
  let ending = 0;
  return output.replace(/\n/g, () => endings[ending++]);
}
