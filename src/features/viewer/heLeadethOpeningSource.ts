import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const HE_LEADETH_OPENING_ID = 'hymn-oh_he-leadeth-me-he-leadeth-me';
type Witness = readonly [number, bigint];
// Canonical SHA-256 84b75a9b1e6233a3665eeb7fa904c4ba646bff70d268d0447d1d337a0a26a725.
// Bind this SATB edition, inherited-clef preparation and exact TuneBook bytes
// independently. Saved verses=1 retains the ambiguous four source rows and
// the single shared refrain without reinterpreting either.
const SOURCE: Witness = [3535, 0x6fc90e5b9febbcd1n];
const PREPARED: Witness = [3268, 0x96b9c8e0fa40570fn];
const PARSER: Witness = [2430, 0x600a33f809c4f5b1n];
// Complete source-offset, duration, pitch, lyric and fermata
// identity after removing only the separately signed opening tempo.
const SIGNATURE: Witness = [60056, 0xcc7796f0b014836bn];
// The shared identity omits beam flags. Sign their presence and values at every
// attack, in stable per-voice order, including every unbeamed attack.
const BEAMS: Witness = [9685, 0x718827892a4baf29n];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasHeLeadethOpeningSource(songId: string | undefined, abc: string) {
  return songId === HE_LEADETH_OPENING_ID && matches(abc, SOURCE);
}
export function heLeadethOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 837 &&
    book.tunes[0].abc === abc.slice(837).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, null, 'start'], [null, null, 'end']]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'lyric', 'decoration',
    'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
  tempo: new Set(['el_type', 'startChar', 'endChar', 'duration', 'bpm', 'type', 'abselem']),
};
const pitchFields = new Set(['pitch', 'name', 'verticalPos', 'highestVert']);

/** Read only the exact 17-unit connected SATB edition with no arcs.
 * Preserve all four fermatas, every lyric slot and beam, validate engraving
 * caches before omission,
 * and reject unknown events or fields. No parser object is mutated. */
export function readHeLeadethOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
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
            event.startChar !== 421 || event.endChar !== 432 || token !== '[Q:1/4=100]' ||
            event.bpm !== 100 || JSON.stringify(event.duration) !== '[0.25]' ||
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
          if ((engraved || key in derived) && derived[key] !== expected) invalid = true;
        if (element.pitches?.some(pitch => {
          const value = pitch as typeof pitch & { highestVert?: number };
          const highest = pitch.verticalPos + (voiceIndex === 0 && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
          return Object.keys(pitch).some(key => !pitchFields.has(key)) ||
            !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos) ||
            ((engraved || 'highestVert' in value) && value.highestVert !== highest);
        })) invalid = true;
        return true;
      })),
    })) };
  }) };
  if (invalid || tempos.length !== 1) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 17 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.25 : index === 16 ? 0.75 : 1)) ||
    score.notes.length !== 273 || !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, tempos, beams]) };
}
