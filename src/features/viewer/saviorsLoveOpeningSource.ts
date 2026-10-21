import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const SAVIORS_LOVE_OPENING_ID = 'hymn-oh_my-saviors-love-my-saviors-love-i-stand-amazed-in-the-presence';
type Witness = readonly [number, bigint];
// Canonical SHA-256 28899207b08ada12aa8a8736706ff16d1c5abc7179a0f7310fbffa3ce94c8ea9.
// Bind the original SATB edition, its inherited-clef preparation, and the exact
// TuneBook input independently. All four verse rows and both refrains remain.
const SOURCE: Witness = [3894, 0xbe89967f3bca2009n];
const PREPARED: Witness = [3483, 0x65e933afe7e58c92n];
const PARSER: Witness = [2590, 0x7bdd96d51b53a8a6n];
// Complete source-offset, note/rest, duration, pitch, lyric and decoration
// identity after removing only the separately signed opening tempo.
const SIGNATURE: Witness = [57638, 0xacd2d042b17c70edn];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasSaviorsLoveOpeningSource(songId: string | undefined, abc: string) {
  return songId === SAVIORS_LOVE_OPENING_ID && matches(abc, SOURCE);
}
export function saviorsLoveOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 892 &&
    book.tunes[0].abc === abc.slice(892).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, null, 'start'], [null, null, 'end']]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric',
    'decoration', 'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
  tempo: new Set(['el_type', 'startChar', 'endChar', 'duration', 'bpm', 'type', 'abselem']),
};
const pitchFields = new Set(['pitch', 'name', 'verticalPos', 'highestVert']);

/** Read this exact connected SATB source without changing parser objects.
 * Unknown event/pitch fields fail closed. Engraving caches are validated before
 * the shared reader omits them. The sole beam pair is signed separately because
 * the shared identity deliberately does not include beam flags. */
export function readSaviorsLoveOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
  let invalid = false;
  const tempos: unknown[] = [], beams: unknown[] = [];
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
        const startBeam = staffIndex === 0 && voiceIndex === 0 && element.startChar === 2140 && element.endChar === 2142;
        const endBeam = staffIndex === 0 && voiceIndex === 0 && element.startChar === 2142 && element.endChar === 2145;
        if (element.startBeam !== (startBeam ? true : undefined) || element.endBeam !== (endBeam ? true : undefined) ||
          (!startBeam && 'startBeam' in element) || (!endBeam && 'endBeam' in element)) invalid = true;
        if (startBeam || endBeam) beams.push([element.startChar, element.endChar, element.startBeam, element.endBeam]);
        const engraved = element.abselem !== undefined;
        const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        if (element.pitches?.length !== (element.rest ? undefined : 1)) invalid = true;
        const expected = element.rest ? (voiceIndex === 0 ? 11 : 3) : element.pitches?.[0]?.verticalPos;
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
  if (invalid || tempos.length !== 1 || beams.length !== 2) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 17 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.25 : index === 16 ? 0.75 : 1)) ||
    score.notes.length !== 257 || score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 253 ||
    !matches(score.signature, SIGNATURE)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, tempos, beams]) };
}
