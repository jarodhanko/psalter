import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const O_LOVE_OPENING_ID = 'hymn-mobile-o-love';
type Witness = readonly [number, bigint];
// Canonical SHA-256 7ad0152c427c56883f51071ff82a7db237d40faf23286508845a348862bd6abd.
// Bind the ST. MARGARET source, all-parts/four-verse preparation and exact
// TuneBook parser bytes independently. No music or source spacing is changed.
const SOURCE: Witness = [1959, 0xc854bf9d26c1beb6n];
const PREPARED: Witness = [1555, 0xc5756c21ffb93719n];
const PARSER: Witness = [1554, 0x8da5a050b4150609n];
const SIGNATURE: Witness = [37210, 0x39e3ba5b866ed576n];
// The shared event identity omits beam flags; sign their absence separately.
const BEAMS: Witness = [5571, 0xc32bc635be841d33n];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasOLoveOpeningSource(songId: string | undefined, abc: string) {
  return songId === O_LOVE_OPENING_ID && matches(abc, SOURCE);
}
export function oLoveOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 0 &&
    book.tunes[0].abc === abc.trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([['start', null, 'start'], ['end', null, 'end']]);
const eventFields: Partial<Record<abcjs.AbcElemType, readonly string[]>> = {
  note: ['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'lyric',
    'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch'],
  bar: ['el_type', 'startChar', 'endChar', 'type', 'abselem'],
  stem: ['el_type', 'direction'],
};
const pitchFields = ['pitch', 'name', 'accidental', 'verticalPos', 'startSlur', 'endSlur', 'highestVert'];
function keys(value: unknown, allowed: readonly string[]) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.entries(value).every(([key, item]) => allowed.includes(key) && item !== undefined);
}
function list(value: unknown): value is unknown[] {
  return Array.isArray(value) && Object.keys(value).length === value.length &&
    Object.keys(value).every((key, index) => key === String(index));
}

/** Exact 157-head, five-slur, four-verse SATB identity. Validate engraving
 * caches before the shared reader omits them. Keep all source objects intact,
 * including the four explicit alto naturals and twelve blank melisma slots. */
export function readOLoveOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0' ||
    !keys(tune.metaText, []) || tune.formatting.staffsep !== 100) return undefined;
  let invalid = false;
  for (const line of tune.lines) {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== grouping || line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass') return undefined;
    for (const staff of line.staff) for (const [voiceIndex, voice] of staff.voices!.entries()) for (const raw of voice) {
      const element = raw as abcjs.AbcElem;
      const fields = eventFields[element.el_type];
      if (!fields || !keys(element, fields)) return undefined;
      if (raw.el_type === 'stem' && (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) return undefined;
      if (raw.el_type !== 'note') continue;
      if (!list(element.pitches) || element.pitches.length !== 1 ||
        ('lyric' in element && (!list(element.lyric) || element.lyric.some(row =>
          !keys(row, ['syllable', 'divider']) || typeof row.syllable !== 'string' || typeof row.divider !== 'string')))) return undefined;
      const engraved = element.abselem !== undefined;
      const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
      const pitch = element.pitches[0] as typeof element.pitches[number] & { highestVert?: number };
      if (!keys(pitch, pitchFields) || !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos) ||
        typeof pitch.name !== 'string' || ('accidental' in pitch && typeof pitch.accidental !== 'string') ||
        ('startSlur' in pitch && (!list(pitch.startSlur) || pitch.startSlur.some(slur =>
          !keys(slur, ['label']) || !Number.isInteger(slur.label)))) ||
        ('endSlur' in pitch && (!list(pitch.endSlur) || pitch.endSlur.some(label => !Number.isInteger(label))))) return undefined;
      for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
        if ((engraved || key in derived) && derived[key] !== pitch.verticalPos) invalid = true;
      const highest = pitch.verticalPos + (voiceIndex === 0 && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
      if ((engraved || 'highestVert' in pitch) && pitch.highestVert !== highest) invalid = true;
    }
  }
  if (invalid) return undefined;
  const score = readScreenScoreIdentity(tune, abc);
  if (!score || score.meter !== 2 || score.units.length !== 11 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.5 : index === 10 ? 1.5 : 2)) ||
    score.notes.length !== 157 || !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, beams, tune.formatting.staffsep]) };
}
