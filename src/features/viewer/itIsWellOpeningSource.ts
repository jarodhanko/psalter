import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const IT_IS_WELL_OPENING_ID = 'hymn-oh_it-is-well-with-my-soul-it-is-well-ville-du-havre';
type Witness = readonly [number, bigint];
// Canonical SHA-256 7261e3c2590276c6ae9f686c042dca5bf4b2119e5a3ee02e5f2bb62c6bf97c6e.
// Bind this SATB edition, inherited-clef preparation and exact TuneBook bytes
// independently. Saved verses=1 retains the ambiguous five source rows, tenor
// response and shared refrain; verse 6 remains transcript-only in the source.
const SOURCE: Witness = [4465, 0x16b9ecd1e0c88ee1n];
const PREPARED: Witness = [3881, 0xf7f5998a00c7f159n];
const PARSER: Witness = [3042, 0x3afe27920859c9dfn];
// Complete source-offset, duration, pitch, rest, lyric, annotation and arc
// identity after removing only the separately signed opening tempo.
const SIGNATURE: Witness = [57726, 0x022a20c384fbeb3bn];
// The shared identity omits beam flags. Sign their presence and values at every
// attack, in stable per-voice order, including every unbeamed attack.
const BEAMS: Witness = [8290, 0x6abf65dc40fafc94n];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasItIsWellOpeningSource(songId: string | undefined, abc: string) {
  return songId === IT_IS_WELL_OPENING_ID && matches(abc, SOURCE);
}
export function itIsWellOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 837 &&
    book.tunes[0].abc === abc.slice(837).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, null, 'start'], [null, null, 'end']]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric', 'decoration', 'chord',
    'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
  tempo: new Set(['el_type', 'startChar', 'endChar', 'duration', 'bpm', 'type', 'abselem']),
};
const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'highestVert',
  'startSlur', 'endSlur', 'startTie', 'endTie']);
function keys(value: unknown, allowed: readonly string[]) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.entries(value).every(([key, item]) => allowed.includes(key) && item !== undefined);
}
function list(value: unknown): value is unknown[] {
  return Array.isArray(value) && Object.keys(value).length === value.length &&
    Object.keys(value).every((key, index) => key === String(index));
}

/** Exact connected SATB source. Validate the opening tempo, twelve visible
 * rests and single-head caches before identity-only omission. The two cross-
 * unit ties and all five underlay rows stay unchanged; no tune is mutated. */
export function readItIsWellOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0' ||
    !keys(tune.metaText, []) || Object.keys(tune.metaText).length !== 0) return undefined;
  let invalid = false;
  const tempos: unknown[] = [];
  const structural = { ...tune, lines: tune.lines.map((line, lineIndex) => {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== grouping || line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass') invalid = true;
    return { ...line, staff: line.staff?.map((staff, staffIndex) => ({ ...staff,
      voices: staff.voices?.map((voice, voiceIndex) => voice.filter((raw, eventIndex) => {
        const element = raw as abcjs.AbcElem;
        const fields = eventFields[element.el_type];
        if (!fields || Object.entries(element).some(([key, value]) => !fields.has(key) || value === undefined)) invalid = true;
        if (raw.el_type === 'stem' && (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) invalid = true;
        if (raw.el_type === 'tempo') {
          const event = raw as abcjs.VoiceItemTempo & { type?: string };
          const token = abc.slice(event.startChar, event.endChar);
          if (lineIndex !== 0 || staffIndex !== 0 || voiceIndex !== 0 ||
            voice.slice(0, eventIndex).some(item => item.el_type !== 'stem') ||
            event.startChar !== 422 || event.endChar !== 433 || token !== '[Q:1/4=100]' ||
            event.bpm !== 100 || !list(event.duration) || JSON.stringify(event.duration) !== '[0.25]' ||
            ('type' in event && event.type !== 'tempo') ||
            ('abselem' in event && (!event.abselem || typeof event.abselem !== 'object' || event.type !== 'tempo'))) invalid = true;
          tempos.push([event.startChar, event.endChar, token, event.bpm, event.duration]);
          return false;
        }
        if (raw.el_type !== 'note') return true;
        const engraved = element.abselem !== undefined;
        const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        if ('lyric' in element && (!list(element.lyric) || element.lyric.some(row =>
          !keys(row, ['syllable', 'divider']) || typeof row.syllable !== 'string' || typeof row.divider !== 'string'))) invalid = true;
        if ('decoration' in element && (!list(element.decoration) || element.decoration.some(value =>
          !['fermata', 'invertedfermata'].includes(value)))) invalid = true;
        if ('chord' in element && (!list(element.chord) || element.chord.length !== 1 || element.chord.some(chord =>
          !keys(chord, ['name', 'position']) || chord.name !== 'Refrain' || chord.position !== 'above'))) invalid = true;
        if (element.rest) {
          if ('pitches' in element || !keys(element.rest, ['type']) || element.rest.type !== 'rest') invalid = true;
          for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
            if ((engraved || key in derived) && derived[key] !== (voiceIndex === 0 ? 11 : 3)) invalid = true;
          return true;
        }
        if ('rest' in element || !list(element.pitches) || element.pitches.length !== 1) invalid = true;
        const expected = element.pitches?.[0]?.verticalPos;
        for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
          if ((engraved || key in derived) && derived[key] !== expected) invalid = true;
        if (element.pitches?.some(pitch => {
          const value = pitch as typeof pitch & { highestVert?: number };
          const highest = pitch.verticalPos + (voiceIndex === 0 && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
          return !keys(pitch, [...pitchFields]) ||
            !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos) ||
            ((engraved || 'highestVert' in value) && value.highestVert !== highest) ||
            ('accidental' in pitch && typeof pitch.accidental !== 'string') ||
            ('startTie' in pitch && (!keys(pitch.startTie, []) || Object.keys(pitch.startTie!).length !== 0)) ||
            ('endTie' in pitch && pitch.endTie !== true) ||
            ('startSlur' in pitch && (!list(pitch.startSlur) || pitch.startSlur.some(slur =>
              !keys(slur, ['label']) || slur.label !== 101))) ||
            ('endSlur' in pitch && (!list(pitch.endSlur) || pitch.endSlur.some(label => label !== 101)));
        })) invalid = true;
        return true;
      })),
    })) };
  }) };
  if (invalid || tempos.length !== 1) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 22 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.25 : index === 21 ? 0.75 : 1)) ||
    score.notes.length !== 233 || score.notes.filter(note => note.element.rest).length !== 12 || !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, tempos, beams]) };
}

/** ABCJS 6.7.0 emits one path for each of the exact source ties (soprano
 * pitch 5: 2217→2224 and 2233→2239), plus one continuation when that tie
 * crosses a system. Derive this only from a validated original partition,
 * never from observed DOM paths. The opening-only join cannot change either
 * boundary; the dedicated planner independently rechecks that fact. */
export function itIsWellOpeningTiePaths(systems: number[][]): number | undefined {
  if (!systems.length || systems.some(system => !system.length) || systems.flat().length !== 22 ||
    systems.flat().some((unit, index) => unit !== index)) return undefined;
  const systemOf = (unit: number) => systems.findIndex(system => system.includes(unit));
  return 2 + Number(systemOf(15) !== systemOf(16)) + Number(systemOf(17) !== systemOf(18));
}
