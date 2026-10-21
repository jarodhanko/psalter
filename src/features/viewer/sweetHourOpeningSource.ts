import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const SWEET_HOUR_OPENING_ID = 'hymn-tt-supplemental-sweet-hour-of-prayer';
type Witness = readonly [number, bigint];
// Canonical SHA-256 dd230ad877ac514e545ac6d831ff44319e84a4c7614abdf1c78d84b9f0ce41fa.
// This edition has two chordal voices and two supplemental lanes, not four
// independent SATB lines. Bind canonical, prepared and TuneBook bytes separately.
const SOURCE: Witness = [3959, 0x8f5943d9a845b64dn];
const PREPARED: Witness = [3791, 0xbb51b64397790a86n];
const PARSER: Witness = [2761, 0x7d02ddee10aa0004n];
// Full parser event identity (all source offsets, words, rests, chords and arcs),
// with chords ordered by pitch exactly as the engraver orders them.
const SIGNATURE: Witness = [56369, 0x10e163aa2596b103n];
// Pin absent beam flags at every attack as well as the full musical identity.
const BEAMS: Witness = [7012, 0x791e50ab72383739n];
function matches(abc: string, witness: Witness) {
  if (abc.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasSweetHourOpeningSource(songId: string | undefined, abc: string) {
  return songId === SWEET_HOUR_OPENING_ID && matches(abc, SOURCE);
}
export function sweetHourOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 1029 &&
    book.tunes[0].abc === abc.slice(1029).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, 'start', null], [null, 'end', null]]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric',
    'decoration', 'startSlur', 'endSlur', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
};
const pitchFields = new Set(['pitch', 'name', 'verticalPos', 'startSlur', 'endSlur', 'highestVert']);
const lyricFields = new Set(['syllable', 'divider']);
function validSlurs(element: { startSlur?: { label?: number }[]; endSlur?: number[] }) {
  return (!('startSlur' in element) || Array.isArray(element.startSlur) && element.startSlur.length > 0 &&
    element.startSlur.every(arc => arc && Object.keys(arc).length === 1 && Number.isInteger(arc.label))) &&
    (!('endSlur' in element) || Array.isArray(element.endSlur) && element.endSlur.length > 0 &&
      element.endSlur.every(Number.isInteger));
}

/** Validate this exact chordal edition, including both nested whole-chord slurs,
 * all 52 invisible timed rests and four fermatas. Only chord sorting and proven
 * engraving copies of whole-chord endpoints are normalized, on identity copies.
 * Original source pitches, endpoint arrays, rendered nodes and listeners survive. */
export function readSweetHourOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0' ||
    tune.metaText?.tempo !== undefined) return undefined;
  let invalid = false;
  const structural = { ...tune, lines: tune.lines.map(line => {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== grouping || line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass') invalid = true;
    return { ...line, staff: line.staff?.map(staff => ({ ...staff,
      voices: staff.voices?.map((voice, voiceIndex) => voice.map(raw => {
        const element = raw as abcjs.AbcElem;
        const fields = eventFields[element.el_type];
        if (!fields || Object.keys(element).some(key => !fields.has(key))) invalid = true;
        if (raw.el_type === 'stem' && (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) invalid = true;
        if (!validSlurs(element) || element.lyric?.some(row =>
          Object.keys(row).some(key => !lyricFields.has(key)))) invalid = true;
        if (element.rest && (element.rest.type !== 'invisible' ||
          Object.keys(element.rest).some(key => key !== 'type'))) invalid = true;
        if (!element.pitches) {
          const rest = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
          for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
            if ((element.rest && element.abselem !== undefined || key in rest) && rest[key] !== 3) invalid = true;
          return raw;
        }
        if (raw.el_type !== 'note' || ![1, 2].includes(element.pitches.length) ||
          element.pitches.some(pitch => !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos))) {
          invalid = true; return raw;
        }
        const sorted = [...element.pitches].sort((a, b) => a.pitch - b.pitch);
        const up = voiceIndex === 0, target = up ? 0 : sorted.length - 1;
        const engraved = element.abselem !== undefined;
        const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        const expected = { averagepitch: sorted.reduce((sum, pitch) => sum + pitch.verticalPos, 0) / sorted.length,
          minpitch: sorted[0].verticalPos, maxpitch: sorted.at(-1)!.verticalPos };
        for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
          if ((engraved || key in derived) && derived[key] !== expected[key]) invalid = true;
        const pitches = sorted.map((pitch, index) => {
          const { highestVert, startSlur, endSlur, ...musical } = pitch as typeof pitch & {
            highestVert?: number };
          if (Object.keys(pitch).some(key => !pitchFields.has(key)) || !validSlurs(pitch)) invalid = true;
          const top = sorted.at(-1)!.verticalPos;
          const highest = index === target && (element.startSlur || element.endSlur || sorted.length === 1)
            ? top + (up && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0) : pitch.verticalPos;
          if ((engraved || 'highestVert' in pitch) && highestVert !== highest) invalid = true;
          const copiedStart = sorted.length > 1 && element.startSlur !== undefined;
          const copiedEnd = sorted.length > 1 && element.endSlur !== undefined;
          if (copiedStart && (engraved || startSlur !== undefined) &&
            JSON.stringify(startSlur) !== JSON.stringify(index === target ? element.startSlur : undefined)) invalid = true;
          if (copiedEnd && (engraved || endSlur !== undefined) &&
            JSON.stringify(endSlur) !== JSON.stringify(index === target ? element.endSlur : undefined)) invalid = true;
          return { ...musical, ...(!copiedStart && { startSlur }), ...(!copiedEnd && { endSlur }) };
        });
        return { ...raw, pitches };
      })),
    })) };
  }) };
  if (invalid) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 0.75 || score.units.length !== 20 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index % 5 === 0 ? 0.125 : index % 5 === 4 ? 0.625 : 0.75)) ||
    score.notes.length !== 197 ||
    score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 265 ||
    !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, beams]) };
}
