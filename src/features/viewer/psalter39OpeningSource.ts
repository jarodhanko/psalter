import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const PSALTER39_OPENING_ID = 'psalter39';
type Witness = readonly [number, bigint];
// Current OLENA edition, including the independently corrected final Alto
// phrase. Canonical SHA-256:
// 19375884ceb3de3509cc9514ae6bb392b5ee14750280551c91250c7fc4518eb3.
const SOURCE: Witness = [1424, 0xce1c7658b41bcc06n];
// Only duplicate metadata and voice names are omitted. No notation, underlay,
// measure boundary or source offset is rewritten for the opening transaction.
const PREPARED: Witness = [1310, 0x83d6c1146e122f06n];
function matches(source: string, witness: Witness) {
  if (source.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < source.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(source.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
export function hasPsalter39OpeningSource(source: string) { return matches(source, SOURCE); }
export function psalter39WrappedNotation(prepared: string): string | undefined {
  if (!matches(prepared, PREPARED)) return;
  const book = new abcjs.TuneBook(prepared);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 0 &&
    book.tunes[0].abc === prepared && matches(book.tunes[0].abc, PREPARED) ? prepared : undefined;
}
/** Exact four-voice, four-stanza source only. The shared reader signs every
 * original event, lyric, slur, tie and source range. The existing transaction
 * separately proves clean synchronized cuts and native physical geometry. */
export function readPsalter39OpeningIdentity(tune: abcjs.TuneObject | undefined, parser: string) {
  if (!tune || abcjs.signature !== 'abcjs-basic v6.7.0' || !matches(parser, PREPARED)) return;
  const score = readScreenScoreIdentity(tune, parser);
  if (!score || score.meter !== 1.5 || score.units.length !== 12 || score.notes.length !== 144 ||
    score.units.some((unit, index) => unit.duration !== [0.25, 1.5, 1.25][index % 3]) ||
    [0, 1, 2, 3].some(voice => score.notes.filter(note => note.voice === voice).length !== 36) ||
    score.notes.some(note => note.element.rest || note.element.pitches?.length !== 1) ||
    tune.lines.some(line => line.staff?.length !== 2 || line.staff.some((staff, index) => {
      const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
      return staff.voices?.length !== 2 || staff.clef?.type !== (index ? 'bass' : 'treble') ||
        group.brace !== undefined || group.bracket !== undefined || group.connectBarLines !== undefined;
    }))) return;
  const pitches = score.notes.flatMap(note => note.element.pitches!);
  return pitches.reduce((count, pitch) => count + (pitch.startSlur?.length ?? 0), 0) === 8 &&
    pitches.filter(pitch => pitch.startTie).length === 8 ? score : undefined;
}
