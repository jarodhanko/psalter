import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const GOD_LEADS_OPENING_ID = 'hymn-final-htg-god-leads-us-along';
type Witness = readonly [number, bigint];
// Canonical SHA-256 6affc0fd9540d9b6e8fb617c32d845c5c3a2ad7b11f532a9b68206180dbceb7b.
// Bind the chordal HTG edition and its existing vocal-placement/staff-spacing
// preparation independently. Four lyric rows, including the explicit shared-
// refrain placeholders, remain source text; no source music is rewritten.
const SOURCE: Witness = [6101, 0xa6840a0e9866fbf2n];
const PREPARED: Witness = [5688, 0xb8fe4807fc71231en];
const PARSER: Witness = [5678, 0xbad5e524f7835fb1n];
// Full source-offset, duration, pitch, rest, lyric, annotation and arc identity,
// sorting only copied pitch arrays into the bundled engraver's order.
const SIGNATURE: Witness = [70266, 0xd4c98b5772866ba4n];
// The common reader omits beams and header tempo. Sign them independently.
const BEAMS: Witness = [8783, 0x1e6037362d180e13n];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasGodLeadsOpeningSource(songId: string | undefined, abc: string) {
  return songId === GOD_LEADS_OPENING_ID && matches(abc, SOURCE);
}
export function godLeadsOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return abc.startsWith('%abc-2.1\n') && !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 9 &&
    book.tunes[0].abc === abc.slice(9).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([['start', null, 'start'], ['end', null, 'end']]);
const sourceAnnotations = JSON.stringify([
  [0, 4316, 4327, [{ name: 'Chorus', position: 'above' }]],
  [0, 5086, 5105, [{ name: 'Ritard.', position: 'above' }]],
]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric', 'chord', 'positioning',
    'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
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
export function readGodLeadsOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
  const tempo = tune.metaText?.tempo as (abcjs.VoiceItemTempo & { type?: string; abselem?: unknown }) | undefined;
  if (!keys(tempo, ['startChar', 'endChar', 'duration', 'bpm', 'type', 'el_type', 'abselem']) ||
    tempo!.startChar !== 16 || tempo!.endChar !== 24 || abc.slice(16, 24) !== 'Q:1/4=80' ||
    tempo!.bpm !== 80 || !list(tempo!.duration) || JSON.stringify(tempo!.duration) !== '[0.25]' ||
    ('type' in tempo! && tempo!.type !== 'tempo') || ('el_type' in tempo! && tempo!.el_type !== 'tempo') ||
    ('abselem' in tempo! && (!tempo!.abselem || typeof tempo!.abselem !== 'object' ||
      tempo!.type !== 'tempo' || tempo!.el_type !== 'tempo')))
    return undefined;
  const tempoSignature = JSON.stringify([tempo!.startChar, tempo!.endChar, abc.slice(16, 24), tempo!.duration, tempo!.bpm]);
  let invalid = false;
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
          !keys(chord, ['name', 'position']) || chord.position !== 'above' || !['Chorus', 'Ritard.'].includes(chord.name)))) invalid = true;
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
              !keys(slur, ['label']) || slur.label !== 101))) ||
            ('endSlur' in pitch && (!list(pitch.endSlur) || pitch.endSlur.some(label => label !== 101)))) invalid = true;
          return musical;
        });
        return { ...raw, pitches };
      })),
    })) };
  }) };
  if (invalid) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 0.75 || score.units.length !== 17 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.125 : index === 16 ? 0.625 : 0.75)) ||
    score.notes.length !== 244 || score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 320 ||
    !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  // The two source annotations are independently signed, including location.
  const annotations = JSON.stringify(score.notes.filter(note => note.element.chord).map(({ voice, element }) =>
    [voice, element.startChar, element.endChar, element.chord]));
  if (annotations !== sourceAnnotations) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, beams, tempoSignature, annotations]) };
}
