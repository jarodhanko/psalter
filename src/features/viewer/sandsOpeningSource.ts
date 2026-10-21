import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const SANDS_OPENING_ID = 'hymn-ly_sands-of-time-rutherford';
type Witness = readonly [number, bigint];
// Canonical SHA-256 6d61697fefa5f51ca3b728179798713324d98f5d0bc91f47fc0f0c536846357b.
// Bind this independent SATB edition, its four-row preparation and TuneBook
// parser bytes separately. Source line endings can fall inside complete bars.
const SOURCE: Witness = [2908, 0x79795e52c671c2c9n];
const PREPARED: Witness = [2222, 0x2cb7e8b704b7bd7bn];
const PARSER: Witness = [2221, 0x48a14d925ec2a113n];
// Complete source-offset, duration, pitch, lyric, harmony and pitch-slur identity.
const SIGNATURE: Witness = [52435, 0x54a568989c8831ddn];
// Sign absence as well as values at every attack; this edition has no beams.
const BEAMS: Witness = [7515, 0xca5bd8f92f1ef63bn];
// All 31 exact [voice, startChar, endChar, chord] tuples, including slash chords.
const ANNOTATIONS: Witness = [1523, 0xc5dfe0965fe65f76n];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasSandsOpeningSource(songId: string | undefined, abc: string) {
  return songId === SANDS_OPENING_ID && matches(abc, SOURCE);
}
export function sandsOpeningWrappedNotation(abc: string): string | undefined {
  if (!matches(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 0 &&
    book.tunes[0].abc === abc.trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, null, null], [null, null, null]]);
const eventFields: Partial<Record<abcjs.AbcElemType, Set<string>>> = {
  note: new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'lyric', 'chord',
    'abselem', 'averagepitch', 'minpitch', 'maxpitch']),
  bar: new Set(['el_type', 'startChar', 'endChar', 'type', 'abselem']),
  stem: new Set(['el_type', 'direction']),
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

/** Read only the exact 17-unit ungrouped SATB edition. Validate all single-head
 * engraving caches before the common reader omits them; sign header tempo and
 * every harmony annotation independently. Original tune objects, source text,
 * seven within-unit pitch slurs, SVG nodes and listeners are never changed. */
export function readSandsOpeningIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
  const tempo = tune.metaText?.tempo as (abcjs.VoiceItemTempo & { type?: string; abselem?: unknown }) | undefined;
  if (!keys(tempo, ['startChar', 'endChar', 'duration', 'bpm', 'type', 'el_type', 'abselem']) ||
    tempo!.startChar !== 16 || tempo!.endChar !== 24 || abc.slice(16, 24) !== 'Q:1/4=96' ||
    tempo!.bpm !== 96 || !list(tempo!.duration) || JSON.stringify(tempo!.duration) !== '[0.25]' ||
    ('type' in tempo! && tempo!.type !== 'tempo') || ('el_type' in tempo! && tempo!.el_type !== 'tempo') ||
    ('abselem' in tempo! && (!tempo!.abselem || typeof tempo!.abselem !== 'object' ||
      tempo!.type !== 'tempo' || tempo!.el_type !== 'tempo')))
    return undefined;
  const tempoSignature = JSON.stringify([tempo!.startChar, tempo!.endChar, abc.slice(16, 24), tempo!.duration, tempo!.bpm]);
  for (const line of tune.lines) {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== grouping || line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass') return undefined;
    for (const staff of line.staff) for (const [voiceIndex, voice] of staff.voices!.entries()) for (const raw of voice) {
      const element = raw as abcjs.AbcElem;
      const fields = eventFields[element.el_type];
      if (!fields || Object.entries(element).some(([key, value]) => !fields.has(key) || value === undefined)) return undefined;
      if (raw.el_type === 'stem' && (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) return undefined;
      if (raw.el_type !== 'note') continue;
      if ('chord' in element && (!list(element.chord) || element.chord.some(chord =>
        !keys(chord, ['name', 'position']) || chord.position !== 'default' || typeof chord.name !== 'string'))) return undefined;
      if ('lyric' in element && (!list(element.lyric) || element.lyric.some(row =>
        !keys(row, ['syllable', 'divider']) || typeof row.syllable !== 'string' || typeof row.divider !== 'string'))) return undefined;
      if (!list(element.pitches) || element.pitches.length !== 1) return undefined;
      const pitch = element.pitches[0] as typeof element.pitches[number] & { highestVert?: number };
      if (!keys(pitch, pitchFields) || !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos) ||
        typeof pitch.name !== 'string' || ('accidental' in pitch && typeof pitch.accidental !== 'string') ||
        ('startSlur' in pitch && (!list(pitch.startSlur) || pitch.startSlur.some(slur =>
          !keys(slur, ['label']) || slur.label !== 101))) ||
        ('endSlur' in pitch && (!list(pitch.endSlur) || pitch.endSlur.some(label => label !== 101)))) return undefined;
      const engraved = element.abselem !== undefined;
      const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
      for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
        if ((engraved || key in derived) && derived[key] !== pitch.verticalPos) return undefined;
      const highest = pitch.verticalPos + (voiceIndex === 0 && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
      if ((engraved || 'highestVert' in pitch) && pitch.highestVert !== highest) return undefined;
    }
  }
  const score = readScreenScoreIdentity(tune, abc);
  if (!score || score.meter !== 1 || score.units.length !== 17 || !score.units[0].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? 0.25 : index === 16 ? 0.75 : 1)) ||
    score.notes.length !== 211 || !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  const annotations = JSON.stringify(score.notes.filter(note => note.element.chord).map(({ voice, element }) =>
    [voice, element.startChar, element.endChar, element.chord]));
  if (!matches(annotations, ANNOTATIONS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, beams, tempoSignature, annotations]) };
}
