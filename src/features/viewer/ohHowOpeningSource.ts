import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const OH_HOW_OPENING_ID = 'hymn-final-htg-oh-how-i-love-jesus';
type Witness = readonly [number, bigint];
// Canonical SHA-256 63836ac04c09952a78f1b9c12ccc688f80196fafa1038593225292183eb9b2bb.
// Bind the chordal HTG edition and its existing vocal-placement/staff-spacing
// preparation independently. Four lyric rows, including the explicit shared-
// refrain placeholders, remain source text; no source music is rewritten.
const SOURCE: Witness = [5276, 0x2b970b63b029bdbcn];
const PREPARED: Witness = [4966, 0x5547eae2931965b2n];
const PARSER: Witness = [4956, 0xfe70b2658198f28dn];
// Full source-offset, duration, pitch, rest, lyric, annotation and arc identity,
// sorting only copied pitch arrays into the bundled engraver's order.
const SIGNATURE: Witness = [61129, 0xa4ecac8b6f13cd19n];
// The common reader omits beams and header tempo. Sign them independently.
const BEAMS: Witness = [7045, 0x4493f20ff51407d4n];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasOhHowOpeningSource(songId: string | undefined, abc: string) {
  return songId === OH_HOW_OPENING_ID && matches(abc, SOURCE);
}
export function ohHowOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return abc.startsWith('%abc-2.1\n') && !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 9 &&
    book.tunes[0].abc === abc.slice(9).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([['start', null, 'start'], ['end', null, 'end']]);
const sourceAnnotations = JSON.stringify([
  [0, 3777, 3792, [{ name: 'Chorus', position: 'above' }]],
]);
const sourceStemRows = JSON.stringify([3304, 4016, 4525].map(start =>
  [1, start, Array.from({ length: 4 }, () => ({ syllable: '', divider: ' ' }))]));
const durations = [0.125, 0.75, 0.625, 0.125, 0.75, 0.625, 0.125, 0.75, 0.625,
  0.125, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.625, 0.125, 0.75, 0.625, 0.75, 0.75];
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric', 'chord', 'positioning',
    'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction', 'lyric']),
};
const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'startTie', 'endTie',
  'startSlur', 'endSlur', 'highestVert']);
function keys(value: unknown, allowed: readonly string[]) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).every(key => allowed.includes(key));
}
function list(value: unknown): value is unknown[] {
  return Array.isArray(value) && Object.keys(value).length === value.length &&
    Object.keys(value).every((key, index) => key === String(index));
}

/** Validate all chord/rest caches before omission from identity copies. The
 * original tune, descending source chords, doubled sounding heads, pitch arcs,
 * annotations, tempo, SVG nodes and listeners are never changed here. */
export function readOhHowOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
  const tempo = tune.metaText?.tempo as (abcjs.VoiceItemTempo & { type?: string; abselem?: unknown }) | undefined;
  if (!keys(tempo, ['startChar', 'endChar', 'duration', 'bpm', 'type', 'el_type', 'abselem']) ||
    tempo!.startChar !== 16 || tempo!.endChar !== 25 || abc.slice(16, 25) !== 'Q:1/4=100' ||
    tempo!.bpm !== 100 || !list(tempo!.duration) || JSON.stringify(tempo!.duration) !== '[0.25]' ||
    ('type' in tempo! && tempo!.type !== 'tempo') || ('el_type' in tempo! && tempo!.el_type !== 'tempo') ||
    ('abselem' in tempo! && (!tempo!.abselem || typeof tempo!.abselem !== 'object' ||
      tempo!.type !== 'tempo' || tempo!.el_type !== 'tempo')))
    return undefined;
  const tempoSignature = JSON.stringify([tempo!.startChar, tempo!.endChar, abc.slice(16, 25), tempo!.duration, tempo!.bpm]);
  let invalid = false;
  // ABCJS attaches three source placeholder rows to the supplemental voice's
  // stem events. They have no source range; bind them to the following note,
  // across every layout, before the common note/bar reader omits stems.
  const stemRows: unknown[] = [];
  for (let voice = 0; voice < 4; voice++) {
    const events = tune.lines.flatMap(line => line.staff?.flatMap(staff => staff.voices ?? [])[voice] ?? []);
    events.forEach((raw, index) => {
      const element = raw as abcjs.AbcElem;
      if (raw.el_type !== 'stem' || !('lyric' in element)) return;
      if (!list(element.lyric) || element.lyric.length !== 4 || element.lyric.some(row =>
        !keys(row, ['syllable', 'divider']) || row.syllable !== '' || row.divider !== ' ')) invalid = true;
      stemRows.push([voice, events.slice(index + 1).find(event => event.el_type === 'note')?.startChar, element.lyric]);
    });
  }
  if (JSON.stringify(stemRows) !== sourceStemRows) invalid = true;
  const structural = { ...tune, lines: tune.lines.map(line => {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== grouping || line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass') invalid = true;
    return { ...line, staff: line.staff?.map((staff, staffIndex) => ({ ...staff,
      voices: staff.voices?.map((voice, voiceIndex) => voice.map(raw => {
        const element = raw as abcjs.AbcElem;
        const fields = eventFields[element.el_type];
        if (!fields || Object.entries(element).some(([key, value]) => !fields.has(key) || value === undefined)) invalid = true;
        if (raw.el_type === 'stem' && (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) invalid = true;
        if (raw.el_type !== 'note') return raw;
        if (!keys(element.positioning, ['vocalPosition']) ||
          element.positioning?.vocalPosition !== (staffIndex === 0 ? 'below' : 'above')) invalid = true;
        if ('chord' in element && (!list(element.chord) || element.chord.some(chord =>
          !keys(chord, ['name', 'position']) || chord.position !== 'above' || chord.name !== 'Chorus'))) invalid = true;
        if ('lyric' in element && (!list(element.lyric) || element.lyric.some(row =>
          !keys(row, ['syllable', 'divider']) || typeof row.syllable !== 'string' || typeof row.divider !== 'string'))) invalid = true;
        if ('rest' in element && (!keys(element.rest, ['type']) ||
          !['rest', 'invisible'].includes(element.rest?.type ?? ''))) invalid = true;
        const engraved = element.abselem !== undefined;
        const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        if (element.rest) {
          if (element.pitches !== undefined || !keys(element.rest, ['type']) ||
            !['rest', 'invisible'].includes(element.rest.type)) invalid = true;
          for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
            if ((engraved || key in derived) && derived[key] !== (voiceIndex === 0 ? 11 : 3)) invalid = true;
          return raw;
        }
        if (!list(element.pitches) || !element.pitches.length || element.pitches.some(pitch =>
          !keys(pitch, [...pitchFields]) || !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos))) {
          invalid = true; return raw;
        }
        const sorted = [...element.pitches].sort((a, b) => a.pitch - b.pitch);
        const expected = { averagepitch: sorted.reduce((sum, pitch) => sum + pitch.verticalPos, 0) / sorted.length,
          minpitch: sorted[0].verticalPos, maxpitch: sorted.at(-1)!.verticalPos };
        for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
          if ((engraved || key in derived) && derived[key] !== expected[key]) invalid = true;
        const pitches = sorted.map(pitch => {
          const { highestVert, ...musical } = pitch as typeof pitch & { highestVert?: number };
          const highest = pitch.verticalPos + (sorted.length === 1 && voiceIndex === 0 &&
            typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
          if (Object.entries(pitch).some(([key, value]) => !pitchFields.has(key) || value === undefined) ||
            !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos) ||
            ('accidental' in pitch && typeof pitch.accidental !== 'string') ||
            ((engraved || 'highestVert' in pitch) && highestVert !== highest) ||
            ('startTie' in pitch && (!keys(pitch.startTie, []) || Object.keys(pitch.startTie!).length !== 0)) ||
            ('endTie' in pitch && pitch.endTie !== true) ||
            ('startSlur' in pitch && (!list(pitch.startSlur) || pitch.startSlur.some(slur =>
              !keys(slur, ['label']) || ![101, 201].includes(slur.label!)))) ||
            ('endSlur' in pitch && (!list(pitch.endSlur) || pitch.endSlur.some(label => ![101, 201].includes(label))))) invalid = true;
          return musical;
        });
        return { ...raw, pitches };
      })),
    })) };
  }) };
  if (invalid) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 0.75 || score.units.length !== 23 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== durations[index]) ||
    score.notes.length !== 196 || score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 240 ||
    !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  // The source annotation are independently signed, including location.
  const annotations = JSON.stringify(score.notes.filter(note => note.element.chord).map(({ voice, element }) =>
    [voice, element.startChar, element.endChar, element.chord]));
  if (annotations !== sourceAnnotations) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, beams, tempoSignature, annotations, sourceStemRows]) };
}
