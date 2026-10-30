import abcjs from 'abcjs';

// Exact-source parser identity; separate native geometry proof gates layout.
// Canonical source SHA256: 08234a9de445fd035a5b3f12a1a64f67f6702cb8c3a7623c19ab0cf415d5a38e.
type Witness = readonly [number, bigint];
const SOURCE: Witness = [2869, 0x900b3c7d93d8a829n];
// Existing reviewed-fermatas display projection, not the canonical playback source.
// All event fields and exact parser offsets remain signed against this display.
const PREPARED: Witness = [2439, 0x405603b7d0a62d4bn];
const PARSER: Witness = [2437, 0x47e500f13099e5cbn];
const ENGINE = 'abcjs-basic v6.7.0';
const NOTE_COUNTS = [94, 97, 94, 96];
type Note = { voice: number; element: abcjs.AbcElem };
type Unit = { duration: number; singleAttack: boolean };
type Identity = { meter: number; units: Unit[]; systems: number[][]; notes: Note[]; signature: string };
type Data = Record<string, unknown>;

function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let i = 0; i < text.length; i++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(i))) * 1099511628211n);
  return hash === witness[1];
}
export function hasPsalter433OpeningSource(source: string) { return matches(source, SOURCE); }
export function psalter433WrappedNotation(prepared: string): string | undefined {
  if (!matches(prepared, PREPARED)) return;
  const book = new abcjs.TuneBook(prepared);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 1 &&
    book.tunes[0].abc === prepared.slice(1).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
function assert(value: unknown): asserts value { if (!value) throw new Error('Unrecognized Psalter 433 identity'); }
function keys(value: Data, allowed: readonly string[]) { assert(Object.keys(value).every(key => allowed.includes(key))); }
function sorted(value: unknown, depth = 0): unknown {
  assert(depth <= 12);
  if (value === undefined || value === null || ['string', 'boolean'].includes(typeof value)) return value;
  if (typeof value === 'number') { assert(Number.isFinite(value)); return value; }
  if (Array.isArray(value)) { assert(value.length <= 1000); return value.map(item => sorted(item, depth + 1)); }
  assert(typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype);
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, sorted((value as Data)[key], depth + 1)]));
}
function serialized(value: unknown) { return JSON.stringify(sorted(value)); }
function header(value: unknown, type: string, allowed: readonly string[]) {
  assert(value && typeof value === 'object');
  const data = value as Data;
  keys(data, [...allowed, 'el_type', 'abselem']);
  assert(data.el_type === undefined || data.el_type === type);
  return Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'el_type' && key !== 'abselem'));
}
const noteFields = ['pitches', 'duration', 'el_type', 'startChar', 'endChar', 'lyric', 'rest', 'decoration',
  'startTriplet', 'tripletMultiplier', 'tripletR', 'endTriplet', 'abselem', 'averagepitch', 'minpitch', 'maxpitch'];
const pitchFields = ['pitch', 'name', 'verticalPos', 'highestVert', 'startTie', 'endTie', 'accidental', 'startSlur', 'endSlur'];
function eventData(element: abcjs.AbcElem, voice: number, abc: string): Data {
  const data = element as unknown as Data;
  const kind = data.el_type === 'timeSignature' ? 'meter' : data.el_type;
  assert(kind === 'note' || kind === 'bar' || kind === 'meter');
  const start = data.startChar, end = data.endChar;
  assert(Number.isInteger(start) && Number.isInteger(end) && (start as number) >= 0 &&
    (end as number) > (start as number) && (end as number) <= abc.length);
  keys(data, kind === 'note' ? noteFields : kind === 'bar'
    ? ['type', 'el_type', 'startChar', 'endChar', 'abselem']
    : ['type', 'value', 'el_type', 'startChar', 'endChar', 'abselem']);
  const result: Data = { ...data, el_type: kind };
  delete result.abselem;
  if (kind === 'note') {
    const duration = element.duration;
    assert(typeof duration === 'number' && Number.isFinite(duration) && duration > 0);
    assert((element.pitches?.length === 1 && !element.rest) || (!element.pitches && element.rest?.type === 'rest'));
    const position = element.pitches?.[0].verticalPos ?? (voice % 2 === 0 ? 11 : 3);
    for (const cache of ['averagepitch', 'minpitch', 'maxpitch']) {
      assert(data[cache] === undefined || data[cache] === position);
      delete result[cache];
    }
    if (element.pitches) result.pitches = element.pitches.map(pitch => {
      const item = pitch as unknown as Data;
      keys(item, pitchFields);
      assert(item.highestVert === undefined || item.highestVert === pitch.verticalPos +
        (voice % 2 === 0 && duration < 1 ? 6 : 0));
      const clean = { ...item }; delete clean.highestVert; return clean;
    });
  }
  result.sourceToken = abc.slice(start as number, end as number);
  return result;
}

/** Reads the original events directly, without changing musical data or caches.
 * The sole normalization is ABCJS's witnessed meter -> timeSignature alias
 * plus validated engraving-only caches. Every source field, offset, tie/slur,
 * lyric, rest, tuplet parameter and meter event participates in the signature.
 */
function read(tune: abcjs.TuneObject, abc: string): Identity {
  assert(!tune.warnings?.length && tune.lines.length > 0 && tune.lines.length <= 30 &&
    !('sourceHeadPresentation' in tune) && !('sourceLayerPresentation' in tune));
  const voices: Data[][] = Array.from({ length: 4 }, () => []);
  const notes: Note[][] = Array.from({ length: 4 }, () => []);
  const allUnits: Unit[][] = Array.from({ length: 4 }, () => []);
  const systems: number[][] = [];
  let expectedStaff: string | undefined;
  for (const [lineIndex, line] of tune.lines.entries()) {
    assert(Object.keys(line).every(key => key === 'staff' || key === 'staffGroup') && line.staff?.length === 2);
    const headers = line.staff.map(staff => {
      keys(staff as unknown as Data, ['voices', 'clef', 'key', 'meter']);
      assert(staff.voices?.length === 2);
      const clef = header(staff.clef, 'clef', ['type', 'verticalPos', 'clefPos']);
      const key = header(staff.key, 'keySignature', ['accidentals', 'root', 'acc', 'mode']);
      if (lineIndex === 0) assert(serialized(header(staff.meter, 'timeSignature', ['type'])) === '{"type":"common_time"}');
      else assert(staff.meter === undefined);
      return [clef, key];
    });
    const headerIdentity = serialized(headers);
    if (expectedStaff === undefined) expectedStaff = headerIdentity;
    else assert(headerIdentity === expectedStaff);
    const perLine: number[][] = [];
    for (const [voice, events] of line.staff.flatMap(staff => staff.voices!).entries()) {
      assert(events[0]?.el_type === 'stem');
      const ordinals: number[] = [];
      let duration = 0, count = 0, onlyNote: abcjs.AbcElem | undefined, remainingTriplet = 0, multiplier = 1;
      for (const raw of events) {
        const event = raw as abcjs.AbcElem;
        if (event.el_type === 'stem') {
          const stem = event as unknown as Data;
          keys(stem, ['el_type', 'direction']);
          assert(stem.direction === (voice % 2 === 0 ? 'up' : 'down'));
          // ABCJS retains source-line stems and inserts new system-start stems.
          continue;
        }
        const clean = eventData(event, voice, abc);
        voices[voice].push(clean);
        if (clean.el_type === 'meter') { assert(count === 0 && remainingTriplet === 0); continue; }
        if (clean.el_type === 'note') {
          if (event.startTriplet) {
            assert(remainingTriplet === 0 && event.startTriplet === 3 && event.tripletMultiplier === 2 / 3 && clean.tripletR === 3);
            remainingTriplet = 3; multiplier = 2 / 3;
          } else assert(event.tripletMultiplier === undefined && clean.tripletR === undefined);
          duration += (clean.duration as number) * multiplier;
          if (remainingTriplet) {
            remainingTriplet--;
            assert(!!event.endTriplet === (remainingTriplet === 0));
            if (!remainingTriplet) multiplier = 1;
          } else assert(!event.endTriplet);
          notes[voice].push({ voice, element: event }); count++; onlyNote = event;
        } else {
          assert(count > 0 && remainingTriplet === 0);
          const ordinal = allUnits[voice].length;
          const expected = ordinal === 0 ? 0.125 : ordinal >= 9 && ordinal <= 15 ? 0.75 : 1;
          assert(Math.abs(duration - expected) < 1e-9);
          allUnits[voice].push({ duration: expected, singleAttack: count === 1 && !!onlyNote?.pitches?.length &&
            !onlyNote.pitches.some(pitch => pitch.endTie) });
          ordinals.push(ordinal); duration = 0; count = 0;
        }
      }
      assert(count === 0 && remainingTriplet === 0 && ordinals.length > 0);
      perLine.push(ordinals);
    }
    assert(perLine.every(ordinals => serialized(ordinals) === serialized(perLine[0])));
    systems.push(perLine[0]);
  }
  assert(allUnits.every(units => units.length === 30) && notes.every((lane, voice) => lane.length === NOTE_COUNTS[voice]));
  return { meter: 1, systems, notes: notes.flat(), units: allUnits[0].map((unit, index) => ({ ...unit,
    singleAttack: allUnits.every(lane => lane[index].singleAttack) })),
    signature: serialized([expectedStaff, voices, tune.metaText, tune.metaTextInfo, tune.media, tune.version, tune.formatting]) };
}
let expectedSignature: string | undefined;
export function readPsalter433OpeningIdentity(tune: abcjs.TuneObject | undefined, parser: string): Identity | undefined {
  if (abcjs.signature !== ENGINE || !tune || !matches(parser, PARSER)) return;
  try {
    expectedSignature ??= read(abcjs.parseOnly(parser, { lineBreaks: [[]] as unknown as number[] })[0], parser).signature;
    const actual = read(tune, parser);
    return actual.signature === expectedSignature ? actual : undefined;
  } catch { return; }
}

/** Only join the whole opening pickup and the complete following measure.
 * Every other boundary is copied; no MIDI, note duration or barline is edited.
 * Native same-size, typography, clearance and full-ink proofs are still required.
 */
export function psalter433OpeningPartition(systems: number[][]) {
  if (serialized(systems.slice(0, 2)) !== '[[0],[1]]' || systems.some(system => !system.length) ||
    serialized(systems.flat()) !== serialized(Array.from({ length: 30 }, (_, index) => index))) return;
  return [[0, 1], ...systems.slice(2).map(system => [...system])];
}
