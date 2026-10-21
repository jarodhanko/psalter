import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const CHURCH_OPENING_ID = 'hymn-oh_the-churchs-one-foundation-aurelia';
export const THOUSAND_OPENING_ID = 'hymn-oh_o-for-a-thousand-tongues-azmon';
export const ST_ANNE_OPENING_ID = 'hymn-oh_our-god-our-help-in-ages-past-st-anne';
type Witness = readonly [number, bigint];
const editions = {
  // Canonical SHA-256 a21a7088d628d5b53ece7fcc6ccad0da44984c15b1541917deb4e2bc37ce2c38.
  [CHURCH_OPENING_ID]: {
    source: [4424, 0x2287430b1630e25fn] as Witness, prepared: [3491, 0x400263fe51bac788n] as Witness,
    parser: [2654, 0x4e66fe309ed53759n] as Witness, prefix: 836, tempoStart: 421, bpm: 130,
    meter: 1, pickup: 0.25, units: 17, notes: [52, 52, 52, 52],
    attacks: [1, 4, 3, 4, 2, 4, 3, 4, 2, 4, 3, 4, 2, 4, 3, 4, 1],
    opening: ['F', 'D', 'A,', 'D,'], words: ['The', 'She', 'The', 'Though', "'Mid"],
    dividers: [' ', ' ', ' ', ' ', ' '], slurs: 0,
  },
  // Canonical SHA-256 cb757f08245199d19cdeed78bcdb9a6a5f06d5969df309391768804a839e1de5.
  [THOUSAND_OPENING_ID]: {
    source: [4674, 0xfbc042f02a080b1en] as Witness, prepared: [2519, 0xb3d8a0af4a51b310n] as Witness,
    parser: [1681, 0x36e99ecc10a6bbf1n] as Witness, prefix: 837, tempoStart: 422, bpm: 200,
    meter: 1.5, pickup: 0.5, units: 9, notes: [29, 29, 28, 28],
    attacks: [1, 4, 4, 4, 2, 4, 5, 4, 1],
    opening: ['E2', 'E2', 'E,2', 'E,2'], words: ['O', 'My', 'Je', 'He', 'He'],
    dividers: [' ', ' ', '-', ' ', ' '], slurs: 2,
  },
  // Canonical SHA-256 066907fbdc4a85567f1a50895109ab2975a18db5ef59caedcfd546bdfc1cf7ce.
  [ST_ANNE_OPENING_ID]: {
    source: [3540, 0xe76a42de6855cfcan] as Witness, prepared: [2425, 0xb7fc39a3e64d654fn] as Witness,
    parser: [1586, 0x4d92b3722ef7bb73n] as Witness, prefix: 837, tempoStart: 421, bpm: 100,
    meter: 1, pickup: 0.25, units: 9, notes: [28, 28, 28, 28],
    attacks: [1, 4, 4, 4, 2, 4, 4, 4, 1],
    opening: ['G', 'C', 'E,', 'C,'], words: ['Our', 'Un', 'Be', 'Thy', 'A'],
    dividers: [' ', '-', '-', ' ', ' '], slurs: 0,
  },
} as const;
export function hymnOpeningEdition(songId: string | undefined) {
  return songId === CHURCH_OPENING_ID || songId === THOUSAND_OPENING_ID || songId === ST_ANNE_OPENING_ID
    ? editions[songId] : undefined;
}
function matches(abc: string, witness: Witness) {
  if (abc.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasHymnOpeningSource(songId: string | undefined, abc: string) {
  const edition = hymnOpeningEdition(songId);
  return !!edition && matches(abc, edition.source);
}
/** Verify automatic wrapping's exact TuneBook parser input and source offsets. */
export function hymnOpeningWrappedNotation(songId: string | undefined, abc: string): string | undefined {
  const edition = hymnOpeningEdition(songId);
  if (!edition || !matches(abc, edition.prepared)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === edition.prefix &&
    book.tunes[0].abc === abc.slice(edition.prefix).trimEnd() && matches(book.tunes[0].abc, edition.parser)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, null, 'start'], [null, null, 'end']]);
const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'startTie', 'endTie',
  'startSlur', 'endSlur', 'style', 'highestVert']);

/** These pinned connected SATB editions only. Keep tempo and grouping signed,
 * reject unknown pitch/MIDI fields, and validate the sole derived pitch cache.
 * The shared reader still signs all music, slurs, words and source offsets. */
export function readHymnOpeningIdentity(songId: string | undefined, tune: abcjs.TuneObject | undefined, abc: string) {
  const edition = hymnOpeningEdition(songId);
  if (!edition || !tune || !matches(abc, edition.parser) || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
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
        const note = raw as abcjs.AbcElem;
        if (note.pitches?.some(pitch => {
          const value = pitch as typeof pitch & { highestVert?: number };
          return Object.keys(pitch).some(key => !pitchFields.has(key)) ||
            (value.highestVert !== undefined && value.highestVert !== pitch.verticalPos +
              (voiceIndex === 0 && typeof note.duration === 'number' && note.duration < 1 ? 6 : 0));
        })) invalid = true;
        if (raw.el_type !== 'tempo') return true;
        const event = raw as abcjs.VoiceItemTempo;
        const token = abc.slice(event.startChar, event.endChar);
        if (lineIndex !== 0 || staffIndex !== 0 || voiceIndex !== 0 ||
          voice.slice(0, eventIndex).some(item => item.el_type !== 'stem') ||
          event.startChar !== edition.tempoStart || event.endChar !== edition.tempoStart + 11 ||
          token !== `[Q:1/4=${edition.bpm}]` || event.bpm !== edition.bpm || JSON.stringify(event.duration) !== '[0.25]' ||
          event.preString !== undefined || event.postString !== undefined || event.suppress !== undefined ||
          ((event as abcjs.VoiceItemTempo & { type?: string }).type !== undefined &&
            (event as abcjs.VoiceItemTempo & { type?: string }).type !== 'tempo') ||
          Object.keys(event).some(key => !['startChar', 'endChar', 'duration', 'bpm', 'el_type', 'type', 'abselem'].includes(key))) invalid = true;
        tempos.push([event.startChar, event.endChar, token, event.bpm, event.duration]);
        return false;
      })),
    })) };
  }) };
  if (invalid || tempos.length !== 1) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== edition.meter || score.units.length !== edition.units ||
    !score.units[0].singleAttack || score.units[1].singleAttack ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? edition.pickup :
      index === edition.units - 1 ? edition.meter - edition.pickup : edition.meter)) ||
    score.notes.length !== edition.notes.reduce((sum, count) => sum + count, 0) ||
    score.notes.some(note => note.voice > 3 || note.element.pitches?.length !== 1 || note.element.rest ||
      (note.voice === 0 ? note.element.lyric?.length !== 5 : !!note.element.lyric?.length))) return undefined;
  let starts = 0, ends = 0;
  for (let voice = 0; voice < 4; voice++) {
    if (score.notes.filter(note => note.voice === voice).length !== edition.notes[voice]) return undefined;
    const events = structural.lines.flatMap(line => line.staff!.flatMap(staff => staff.voices!)[voice]);
    let unit = 0, attacks = 0;
    for (const raw of events) {
      const event = raw as abcjs.AbcElem;
      if (event.el_type === 'note') {
        attacks++;
        if (unit === 0 && (event.duration !== edition.pickup || abc.slice(event.startChar, event.endChar).trim() !== edition.opening[voice])) return undefined;
        if (unit === 0 && voice === 0 && event.lyric?.some((row, index) =>
          row.syllable !== `${index + 1}.\u00a0${edition.words[index]}` || row.divider !== edition.dividers[index])) return undefined;
        if (event.startSlur || event.endSlur || event.pitches?.some(pitch => {
          if (pitch.startSlur) starts += pitch.startSlur.length;
          if (pitch.endSlur) ends += pitch.endSlur.length;
          return (pitch.startSlur || pitch.endSlur) && (edition.slurs === 0 || unit !== 6 || voice > 1);
        })) return undefined;
      } else if (event.el_type === 'bar') {
        if ((voice === 0 && attacks !== edition.attacks[unit]) ||
          event.type !== (unit === edition.units - 1 ? 'bar_thin_thick' : 'bar_thin')) return undefined;
        unit++; attacks = 0;
      }
    }
    if (unit !== edition.units || attacks) return undefined;
  }
  if (starts !== edition.slurs || ends !== edition.slurs) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, tempos]) };
}
