import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const FAITH_OPENING_ID = 'hymn-tt-my-faith-has-found-a-resting-place';
type Witness = readonly [number, bigint];
// Canonical SHA-256 d08fdcf2605d3358af371d8263b6489870f8285635d09711958c7b24675eca70.
// This exact edition has two chordal voices and two supplemental lanes.
// Canonical, prepared and TuneBook bytes are separate admission witnesses.
const SOURCE: Witness = [3312, 0x9fb809df26d6d667n];
const PREPARED: Witness = [3112, 0xe0b05f0e215a54e1n];
const PARSER: Witness = [1982, 0xcaa4372eed9b455fn];
// Complete parser event identity, including every source offset, word, rest,
// accidental and ordinary pitch-level slur; chord pitches use engraving order.
const SIGNATURE: Witness = [48125, 0xf71989455913ca6fn];
function matches(abc: string, witness: Witness) {
  if (abc.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasFaithOpeningSource(songId: string | undefined, abc: string) {
  return songId === FAITH_OPENING_ID && matches(abc, SOURCE);
}
export function faithOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 1129 &&
    book.tunes[0].abc === abc.slice(1129).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, 'start', null], [null, 'end', null]]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric',
    'chord', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
};
const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos',
  'startSlur', 'endSlur', 'highestVert', 'printer_shift']);

/** Normalize only validated ABCJS chord ordering and engraving-derived fields
 * on copied identity objects. Faith's two slurs are already on single pitches;
 * preserve them verbatim. Whole-chord slurs, ties and unknown fields fail closed.
 * No source, parser pitch array, rendered node or listener is changed. */
export function readFaithOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
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
            if (((element.rest && element.abselem !== undefined) || rest[key] !== undefined) && rest[key] !== 3) invalid = true;
          return raw;
        }
        if (raw.el_type !== 'note' || ![1, 2].includes(element.pitches.length) ||
          element.pitches.some(pitch => !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos))) {
          invalid = true; return raw;
        }
        const sorted = [...element.pitches].sort((a, b) => a.pitch - b.pitch);
        const up = voiceIndex === 0;
        const engraved = element.abselem !== undefined;
        const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        const expected = { averagepitch: sorted.reduce((sum, pitch) => sum + pitch.verticalPos, 0) / sorted.length,
          minpitch: sorted[0].verticalPos, maxpitch: sorted.at(-1)!.verticalPos };
        for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
          if ((engraved || derived[key] !== undefined) && derived[key] !== expected[key]) invalid = true;
        const pitches = sorted.map((pitch, index) => {
          const { highestVert, printer_shift, ...musical } = pitch as typeof pitch & {
            highestVert?: number; printer_shift?: string };
          if (Object.keys(pitch).some(key => !pitchFields.has(key))) invalid = true;
          const highest = pitch.verticalPos +
            (sorted.length === 1 && up && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
          if ((engraved || highestVert !== undefined) && highestVert !== highest) invalid = true;
          const shifted = sorted.length === 2 && sorted[1].pitch - sorted[0].pitch === 1 && index === (up ? 1 : 0);
          if ((engraved || printer_shift !== undefined) && printer_shift !== (shifted ? 'different' : undefined)) invalid = true;
          return musical;
        });
        return { ...raw, pitches };
      })),
    })) };
  }) };
  if (invalid) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 0.75 || score.units.length !== 20 || !score.units[0].singleAttack ||
    score.units[0].duration !== 0.25 || score.notes.length !== 159 ||
    score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 226 ||
    !matches(score.signature, SIGNATURE)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping]) };
}

/** Only the exact original full-score preparation may remove the row-identity
 * metadata veto. Grouped/refrain-split and altered preparations remain excluded. */
export function hasFaithOpeningReviewedNotation(songId: string | undefined, source: string, prepared: string) {
  return hasFaithOpeningSource(songId, source) && faithOpeningWrappedNotation(prepared) !== undefined;
}
