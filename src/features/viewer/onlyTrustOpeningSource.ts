import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const ONLY_TRUST_OPENING_ID = 'hymn-mobile-only-trust-him';
type Witness = readonly [number, bigint];
// Canonical SHA-256 89fd7b13cb3866918b38b8bdfe5ad4a3e31af3263fd382f9e12bb5c4ac32738d.
// Bind this SATB edition, inherited-clef preparation and exact TuneBook bytes
// independently. Saved verses=1 keeps the ambiguous four verse rows and shared
// refrain unchanged. This source has no tempo event.
const SOURCE: Witness = [2469, 0x957d21717649b098n];
const PREPARED: Witness = [1732, 0xb3a5376cdf21a26an];
const PARSER: Witness = [1731, 0xf615b98c508cbae4n];
// Complete source-offset, note/rest, duration, pitch, lyric and pitch-slur
// identity; no event is filtered or normalized.
const SIGNATURE: Witness = [51054, 0x3b4410a5944ea78dn];
// The shared identity omits beam flags. Sign their presence and values at every
// attack, in stable per-voice order, including every unbeamed attack.
const BEAMS: Witness = [8085, 0x1e40f9b1afa0c1dan];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasOnlyTrustOpeningSource(songId: string | undefined, abc: string) {
  return songId === ONLY_TRUST_OPENING_ID && matches(abc, SOURCE);
}
export function onlyTrustOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 0 &&
    book.tunes[0].abc === abc.trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([['start', null, 'start'], ['end', null, 'end']]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric',
    'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
};
const pitchFields = new Set(['pitch', 'name', 'verticalPos', 'startSlur', 'endSlur', 'highestVert']);

/** Read only the exact 17-unit braced SATB edition. Preserve the four
 * genuine pitch slurs and eight rests verbatim, validate caches before omission,
 * and reject unknown events or fields. No parser object is mutated. */
export function readOnlyTrustOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0' ||
    tune.metaText?.tempo !== undefined) return undefined;
  let invalid = false;
  for (const line of tune.lines) {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== grouping || line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass') invalid = true;
    for (const staff of line.staff ?? []) for (const [voiceIndex, voice] of (staff.voices ?? []).entries()) {
      for (const raw of voice) {
        const element = raw as abcjs.AbcElem;
        const fields = eventFields[element.el_type];
        if (!fields || Object.keys(element).some(key => !fields.has(key))) invalid = true;
        if (raw.el_type === 'stem' && (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) invalid = true;
        if (raw.el_type !== 'note') continue;
        const engraved = element.abselem !== undefined;
        const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        if (element.pitches?.length !== (element.rest ? undefined : 1) ||
          (element.rest && (element.rest.type !== 'rest' || Object.keys(element.rest).some(key => key !== 'type')))) invalid = true;
        // Upper/lower means the voice within each staff: soprano/tenor rests
        // cache 11; alto/bass rests cache 3. Pitched caches retain verticalPos.
        const expected = element.rest ? (voiceIndex === 0 ? 11 : 3) : element.pitches?.[0]?.verticalPos;
        for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
          if ((engraved || key in derived) && derived[key] !== expected) invalid = true;
        if (element.pitches?.some(pitch => {
          const value = pitch as typeof pitch & { highestVert?: number };
          const highest = pitch.verticalPos + (voiceIndex === 0 && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
          return Object.keys(pitch).some(key => !pitchFields.has(key)) ||
            !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos) ||
            ((engraved || 'highestVert' in value) && value.highestVert !== highest);
        })) invalid = true;
      }
    }
  }
  if (invalid) return undefined;
  const score = readScreenScoreIdentity(tune, abc);
  if (!score || score.meter !== 1 || score.units.length !== 17 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.25 : index === 16 ? 0.75 : 1)) ||
    score.notes.length !== 228 || score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 220 ||
    !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, beams]) };
}
