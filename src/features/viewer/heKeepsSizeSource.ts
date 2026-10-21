import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const HE_KEEPS_SIZE_ID = 'hymn-oh_he-keeps-me-singing-he-keeps-me-singing-melody-of-love';
type Witness = readonly [number, bigint];
// Canonical SHA-256 60bf29024e183ef281282789ab1ab17064140fa27d2c392ec595a74082a1197a.
// Only the exact fourth-stanza, all-four-parts, group-one screen preparation.
// These independently frozen witnesses never rewrite canonical/downloaded ABC.
const SOURCE: Witness = [3665, 0xf8154dd75711d318n];
const PREPARED: Witness = [2681, 0x156e9459bc09f540n];
const PARSER: Witness = [1786, 0x5ec5ed13bbf22222n];
// Derived from the canonical parser, not a rendered candidate: every timed
// rest, source range, pitch, accidental, lyric slot, bar and both source slurs.
const SIGNATURE: Witness = [51105, 0x5f1367e4e87eb0d4n];
// The common reader deliberately omits beam fields; bind their absence too.
const BEAMS: Witness = [8816, 0x4d58319c2e34ebd3n];
const grouping = JSON.stringify([[null, null, 'start'], [null, null, 'end']]);

function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}

export function hasHeKeepsSizeSource(songId: string | undefined, abc: string) {
  return songId === HE_KEEPS_SIZE_ID && matches(abc, SOURCE);
}

/** Automatic wrapping strips exactly this prefix and trailing newlines. The
 * owned explicit-break parser must use those same bytes and click offsets. */
export function heKeepsSizeWrappedNotation(prepared: string): string | undefined {
  if (!matches(prepared, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(prepared);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 892 &&
    book.tunes[0].abc === prepared.slice(892).trimEnd() && matches(book.tunes[0].abc, PARSER)
    ? book.tunes[0].abc : undefined;
}

function keys(value: unknown, allowed: readonly string[]) {
  return !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.entries(value).every(([key, field]) => allowed.includes(key) && field !== undefined);
}
function list(value: unknown): value is unknown[] {
  return Array.isArray(value) && Object.keys(value).length === value.length &&
    Object.keys(value).every((key, index) => key === String(index));
}
function engravedHeader(value: unknown, kind: string) {
  const header = value as { el_type?: string; abselem?: unknown };
  return (!('el_type' in header) || header.el_type === kind) &&
    (!('abselem' in header) || !!header.abselem && typeof header.abselem === 'object' && header.el_type === kind);
}
const eventFields: Partial<Record<abcjs.AbcElemType, readonly string[]>> = {
  note: ['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric',
    'startBeam', 'endBeam', 'abselem', 'averagepitch', 'minpitch', 'maxpitch'],
  bar: ['el_type', 'startChar', 'endChar', 'type', 'abselem'],
  stem: ['el_type', 'direction'],
  tempo: ['el_type', 'startChar', 'endChar', 'duration', 'bpm', 'type', 'abselem'],
};
const pitchFields = ['pitch', 'name', 'accidental', 'verticalPos', 'startSlur', 'endSlur', 'highestVert'];

/** Fail closed on unknown musical fields and invalid engraving caches. Only
 * the independently signed opening tempo is omitted from the structural view.
 * All returned note references are the original parser/engraver objects. */
export function readHeKeepsSizeIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matches(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0' ||
    !list(tune.lines) || !tune.lines.length || !keys(tune.metaText, [])) return undefined;
  let invalid = false;
  const tempos: unknown[] = [];
  const structural = { ...tune, lines: tune.lines.map((line, lineIndex) => {
    if (!keys(line, ['staff', 'staffGroup']) || !list(line.staff) || line.staff.length !== 2 ||
      line.staff.some(staff => !staff || !list(staff.voices) || staff.voices.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== grouping) { invalid = true; return line; }
    return { ...line, staff: line.staff.map((staff, staffIndex) => {
      if (!keys(staff, ['voices', 'clef', 'key', 'connectBarLines', 'meter']) ||
        !keys(staff.clef, ['type', 'verticalPos', 'clefPos', 'el_type', 'abselem']) ||
        !engravedHeader(staff.clef, 'clef') || staff.clef!.type !== (staffIndex === 0 ? 'treble' : 'bass') ||
        !keys(staff.key, ['root', 'acc', 'mode', 'accidentals', 'el_type', 'abselem']) ||
        !engravedHeader(staff.key, 'keySignature') || !list(staff.key!.accidentals) ||
        staff.key!.accidentals.some(accidental => !keys(accidental, ['acc', 'note', 'verticalPos'])) ||
        (lineIndex === 0 && !staff.meter) || ('meter' in staff &&
          (!keys(staff.meter, ['type', 'value', 'el_type', 'abselem']) ||
            !engravedHeader(staff.meter, 'timeSignature') || staff.meter?.type !== 'specified' ||
            !list(staff.meter.value) || staff.meter.value.length !== 1 ||
            !keys(staff.meter.value[0], ['num', 'den']) ||
            JSON.stringify([staff.meter.value[0].num, staff.meter.value[0].den]) !== '["4","4"]'))) invalid = true;
      return { ...staff, voices: staff.voices!.map((voice, voiceIndex) => {
        if (!list(voice)) { invalid = true; return voice; }
        if (voice[0]?.el_type !== 'stem') invalid = true;
        return voice.filter((raw, eventIndex) => {
          if (!raw || typeof raw !== 'object') { invalid = true; return true; }
          const element = raw as abcjs.AbcElem;
          const fields = eventFields[element.el_type];
          if (!fields || !keys(element, fields) || ('abselem' in element &&
            (!element.abselem || typeof element.abselem !== 'object'))) invalid = true;
          if (raw.el_type === 'stem' && (raw as typeof raw & { direction?: string }).direction !==
            (voiceIndex === 0 ? 'up' : 'down')) invalid = true;
          if (raw.el_type === 'tempo') {
            const event = raw as abcjs.VoiceItemTempo & { type?: string };
            const token = abc.slice(event.startChar, event.endChar);
            if (lineIndex !== 0 || staffIndex !== 0 || voiceIndex !== 0 ||
              voice.slice(0, eventIndex).some(item => item.el_type !== 'stem') ||
              event.startChar !== 422 || event.endChar !== 433 || token !== '[Q:1/4=100]' ||
              event.bpm !== 100 || !list(event.duration) || JSON.stringify(event.duration) !== '[0.25]' ||
              ('type' in event && event.type !== 'tempo') || ('abselem' in event && event.type !== 'tempo')) invalid = true;
            tempos.push([event.startChar, event.endChar, token, event.bpm, event.duration]);
            return false;
          }
          if (raw.el_type !== 'note') return true;
          if ('lyric' in element && (!list(element.lyric) || element.lyric.length !== 1 || element.lyric.some(row =>
            !keys(row, ['syllable', 'divider']) || typeof row.syllable !== 'string' || typeof row.divider !== 'string'))) invalid = true;
          const engraved = 'abselem' in element;
          const derived = element as typeof element & { averagepitch?: number; minpitch?: number; maxpitch?: number };
          if ('rest' in element) {
            if ('pitches' in element || !keys(element.rest, ['type']) ||
              !['rest', 'invisible'].includes(element.rest!.type)) invalid = true;
            for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
              if ((engraved || key in derived) && derived[key] !== (voiceIndex === 0 ? 11 : 3)) invalid = true;
            return true;
          }
          if (!list(element.pitches) || element.pitches.length !== 1) { invalid = true; return true; }
          const pitch = element.pitches[0] as typeof element.pitches[number] & { highestVert?: number };
          if (!pitch || typeof pitch !== 'object') { invalid = true; return true; }
          if (!keys(pitch, pitchFields) || !Number.isFinite(pitch.pitch) || !Number.isFinite(pitch.verticalPos) ||
            typeof pitch.name !== 'string' || ('accidental' in pitch && typeof pitch.accidental !== 'string') ||
            ('startSlur' in pitch && (!list(pitch.startSlur) || pitch.startSlur.length !== 1 ||
              !keys(pitch.startSlur[0], ['label']) || pitch.startSlur[0].label !== 101)) ||
            ('endSlur' in pitch && (!list(pitch.endSlur) || JSON.stringify(pitch.endSlur) !== '[101]'))) invalid = true;
          for (const key of ['averagepitch', 'minpitch', 'maxpitch'] as const)
            if ((engraved || key in derived) && derived[key] !== pitch.verticalPos) invalid = true;
          const highest = pitch.verticalPos + (voiceIndex === 0 && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0);
          if ((engraved || 'highestVert' in pitch) && pitch.highestVert !== highest) invalid = true;
          return true;
        });
      }) };
    }) };
  }) };
  if (invalid || tempos.length !== 1) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 16 || score.units.some(unit => unit.duration !== 1) ||
    score.notes.length !== 250 || score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 226 ||
    !matches(score.signature, SIGNATURE)) return undefined;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  if (!matches(beams, BEAMS)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, tempos, beams]) };
}
