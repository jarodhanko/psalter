import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const CORONATION_OPENING_ID = 'hymn-oh_all-hail-the-power-of-jesus-name-coronation';
type Witness = readonly [number, bigint];
// Canonical SHA-256 3391922a5dd603e73180d780e3921bb08a92c4ecb85f5d8c07bd3958de537a86.
// Bind this SATB edition, inherited-clef preparation and exact TuneBook bytes
// independently. All five lyric rows and the canonical W: verses stay intact.
const SOURCE: Witness = [4179, 0x40550aecad1ba4ddn];
const PREPARED: Witness = [3182, 0xb29e272f1a076aa0n];
const PARSER: Witness = [2344, 0xa6d67e6869355e06n];
// Complete source-offset, duration, pitch, accidental, lyric and pitch-slur
// identity after removing only the separately signed opening tempo.
const SIGNATURE: Witness = [47141, 0xf144d2ef8579baa3n];
// The shared identity omits beam flags. Sign their presence and values at every
// attack, in stable per-voice order, including every unbeamed attack.
const BEAMS: Witness = [6664, 0xb46dbb5532acd729n];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasCoronationOpeningSource(songId: string | undefined, abc: string) {
  return songId === CORONATION_OPENING_ID && matches(abc, SOURCE);
}
export function coronationOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 837 &&
    book.tunes[0].abc === abc.slice(837).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, null, 'start'], [null, null, 'end']]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'lyric',
    'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
  tempo: new Set(['el_type', 'startChar', 'endChar', 'duration', 'bpm', 'type', 'abselem']),
};
const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'startSlur', 'endSlur', 'highestVert']);

/** Read only the exact 15-unit connected SATB edition. Preserve the four
 * genuine pitch slurs verbatim, validate engraving caches before omission,
 * and reject unknown events or fields. No parser object is mutated. */
export function readCoronationOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
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
        if (!fields || Object.keys(element).some(key => !fields.has(key))) invalid = true;
        if (raw.el_type === 'stem' && (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) invalid = true;
        if (raw.el_type === 'tempo') {
          const event = raw as abcjs.VoiceItemTempo & { type?: string };
          const token = abc.slice(event.startChar, event.endChar);
          if (lineIndex !== 0 || staffIndex !== 0 || voiceIndex !== 0 ||
            voice.slice(0, eventIndex).some(item => item.el_type !== 'stem') ||
            event.startChar !== 421 || event.endChar !== 432 || token !== '[Q:1/4=120]' ||
            event.bpm !== 120 || JSON.stringify(event.duration) !== '[0.25]' ||
            (event.type !== undefined && event.type !== 'tempo')) invalid = true;
          tempos.push([event.startChar, event.endChar, token, event.bpm, event.duration]);
          return false;
        }
        if (raw.el_type !== 'note') return true;
        const engraved = element.abselem !== undefined;
        const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        if (element.pitches?.length !== 1) invalid = true;
        const expected = element.pitches?.[0]?.verticalPos;
        for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
          if ((engraved || derived[key] !== undefined) && derived[key] !== expected) invalid = true;
        if (element.pitches?.some(pitch => {
          const value = pitch as typeof pitch & { highestVert?: number };
          const highest = pitch.verticalPos + (voiceIndex === 0 && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
          return Object.keys(pitch).some(key => !pitchFields.has(key)) ||
            !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos) ||
            ((engraved || value.highestVert !== undefined) && value.highestVert !== highest);
        })) invalid = true;
        return true;
      })),
    })) };
  }) };
  if (invalid || tempos.length !== 1) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 15 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.25 : index === 14 ? 0.75 : 1)) ||
    score.notes.length !== 189 || !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, tempos, beams]) };
}
