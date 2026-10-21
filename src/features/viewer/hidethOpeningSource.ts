import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const HIDETH_OPENING_ID = 'hymn-remaining-tt-he-hideth-my-soul';
type Witness = readonly [number, bigint];
// Canonical SHA-256 542e943f9f6896e5b31264d4113b6ff44b275d2b859aa2afb1a42e199691df77.
// This edition has two chordal voices and two supplemental lanes, not four
// independent SATB lines. Bind canonical, prepared and TuneBook bytes separately.
const SOURCE: Witness = [4026, 0xb508fe97357009fan];
const PREPARED: Witness = [3871, 0xdde183dec2ca2873n];
const PARSER: Witness = [2854, 0xa01eb081b736a02an];
// Full parser event identity (all source offsets, words, rests, chords and arcs),
// with chords ordered by pitch exactly as the engraver orders them.
const SIGNATURE: Witness = [68812, 0xbc1a7decde87e1a6n];
function matches(abc: string, witness: Witness) {
  if (abc.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasHidethOpeningSource(songId: string | undefined, abc: string) {
  return songId === HIDETH_OPENING_ID && matches(abc, SOURCE);
}
export function hidethOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 1016 &&
    book.tunes[0].abc === abc.slice(1016).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, 'start', null], [null, 'end', null]]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric',
    'decoration', 'chord', 'startSlur', 'endSlur', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
};
const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'startTie', 'endTie',
  'startSlur', 'endSlur', 'style', 'highestVert', 'printer_shift']);

/** Sign every source event after validating the three known ABCJS engraving
 * changes: chord sorting, seconds displacement and copied whole-chord slurs.
 * Unknown pitch/MIDI fields are rejected, never stripped. Normalization affects
 * only copied identity objects; original pitches, nodes and listeners survive. */
export function readHidethOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
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
        if (!element.pitches) {
          const rest = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
          for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
            if ((element.rest && element.abselem !== undefined || rest[key] !== undefined) && rest[key] !== 3) invalid = true;
          return raw;
        }
        if (raw.el_type !== 'note') { invalid = true; return raw; }
        const sorted = [...element.pitches].sort((a, b) => a.pitch - b.pitch);
        const up = voiceIndex === 0, target = up ? 0 : sorted.length - 1;
        const engraved = element.abselem !== undefined;
        const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        const expected = { averagepitch: sorted.reduce((sum, pitch) => sum + pitch.verticalPos, 0) / sorted.length,
          minpitch: sorted[0].verticalPos, maxpitch: sorted.at(-1)!.verticalPos };
        for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
          if ((engraved || derived[key] !== undefined) && derived[key] !== expected[key]) invalid = true;
        const pitches = sorted.map((pitch, index) => {
          const { highestVert, printer_shift, startSlur, endSlur, ...musical } = pitch as typeof pitch & {
            highestVert?: number; printer_shift?: string };
          if (Object.keys(pitch).some(key => !pitchFields.has(key))) invalid = true;
          const top = sorted.at(-1)!.verticalPos;
          const highest = index === target && (element.startSlur || element.endSlur || sorted.length === 1)
            ? top + (up && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0) : pitch.verticalPos;
          if ((engraved || highestVert !== undefined) && highestVert !== highest) invalid = true;
          const shifted = sorted.length === 2 && sorted[1].pitch - sorted[0].pitch === 1 && index === (up ? 1 : 0);
          if ((engraved || printer_shift !== undefined) && printer_shift !== (shifted ? 'different' : undefined)) invalid = true;
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
  if (!score || score.meter !== 0.75 || score.units.length !== 21 || !score.units[0].singleAttack ||
    score.units[0].duration !== 0.125 || score.notes.length !== 241 ||
    score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 359 ||
    !matches(score.signature, SIGNATURE)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping]) };
}
