import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const MELITA_OPENING_ID = 'hymn-oh_my-hope-is-built-melita';
type Witness = readonly [number, bigint];
// Canonical SHA-256 4f40852fc6dc17f9fe04ac330890b80bfd80449ffb63a1d76d1568ab00dd6c9d.
// Bind this SATB edition, inherited-clef preparation and exact TuneBook bytes
// independently. The ambiguous underlay stays intact: saved verses=1 retains all four rows.
const SOURCE: Witness = [3507, 0x8a15ee1f27e5cf5dn];
const PREPARED: Witness = [3016, 0xf983c71fac9de375n];
const PARSER: Witness = [2123, 0x00d8a6a88c3d65f7n];
// Complete source-offset, duration, pitch, accidental, lyric and pitch-slur
// identity after removing only the separately signed opening tempo.
const SIGNATURE: Witness = [45021, 0x5602992e7eba5e81n];
// The shared identity omits beam flags. Sign their presence and values at every
// attack, in stable per-voice order, including every unbeamed attack.
const BEAMS: Witness = [7009, 0x65117b50dc1567b8n];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasMelitaOpeningSource(songId: string | undefined, abc: string) {
  return songId === MELITA_OPENING_ID && matches(abc, SOURCE);
}
export function melitaOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 892 &&
    book.tunes[0].abc === abc.slice(892).trimEnd() && matches(book.tunes[0].abc, PARSER)
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
const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'highestVert']);

/** Read only the exact 13-unit connected SATB edition with no arcs.
 * Preserve every lyric slot and beam, validate engraving caches before omission,
 * and reject unknown events or fields. No parser object is mutated. */
export function readMelitaOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
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
            event.startChar !== 422 || event.endChar !== 433 || token !== '[Q:1/4=100]' ||
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
  if (!score || score.meter !== 1 || score.units.length !== 13 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.25 : index === 12 ? 0.75 : 1)) ||
    score.notes.length !== 199 || !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, tempos, beams]) };
}
