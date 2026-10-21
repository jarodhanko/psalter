import abcjs from 'abcjs';
import { reviewedFermataSources } from './reviewedFermataSources';

type Fermata = 'fermata' | 'invertedfermata';
export type ReviewedFermataSource = {
  readonly music: string;
  readonly holds: readonly {
    readonly onset: number;
    readonly duration: number;
    readonly voices: readonly string[];
    readonly orientation: Fermata;
  }[];
};
type DecoratedNote = abcjs.VoiceItemNote & { decoration?: string[] };

export function getReviewedFermataSource(songId: string, abc: string): ReviewedFermataSource | undefined {
  const source = reviewedFermataSources[songId];
  if (!source) return undefined;
  const music = abc.split(/\r?\n/)
    .filter((line) => line.trim() && !/^\s*(?:[TCRSONWw]:|%(?:[^%]|$))/.test(line)).join('\n');
  return music === source.music ? source : undefined;
}

/** Source-bound display projection after part selection. A staff sign belongs
 * to all reviewed simultaneous singers, but is printed once on that staff.
 * Lower signs use the source's orientation; any remaining selected singer
 * inherits the indication. Staggered holds (212) are separate policies and
 * never coalesced. Canonical notes, rests, durations and playback stay intact.
 */
export function presentReviewedFermatas(abc: string, source?: ReviewedFermataSource): string {
  if (!source || !abc) return abc;
  const scoreLines = abc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scoreLines.length !== 1) return abc;
  const groups = (scoreLines[0].match(/\([^)]*\)/g) ?? [])
    .map((group) => group.slice(1, -1).trim().split(/\s+/));
  const ids = groups.flat();
  const reviewedIds = new Set(source.holds.flatMap((hold) => hold.voices));
  if (!ids.length || new Set(ids).size !== ids.length || ids.some((id) => !reviewedIds.has(id))) return abc;
  try {
    const tune = abcjs.parseOnly(abc)[0];
    if (!tune || tune.warnings?.length) return abc;
    const positions = new Map<string, number>();
    const notes = new Map<string, DecoratedNote>();
    const noteSpans: { start: number; end: number }[] = [];
    for (const line of tune.lines) for (const [staffIndex, staff] of (line.staff ?? []).entries()) {
      if (!groups[staffIndex] || !staff.voices || staff.voices.length !== groups[staffIndex].length) return abc;
      for (const [voiceIndex, voice] of staff.voices.entries()) {
        const id = groups[staffIndex][voiceIndex];
        let onset = positions.get(id) ?? 0;
        for (const item of voice) {
          if (item.el_type !== 'note') continue;
          // Never let malformed parser offsets reach slice() or a staged edit.
          if (!Number.isInteger(item.startChar) || !Number.isInteger(item.endChar) ||
              item.startChar < 0 || item.endChar <= item.startChar || item.endChar > abc.length) return abc;
          noteSpans.push({ start: item.startChar, end: item.endChar });
          const key = `${id}:${onset * 4}`;
          if (notes.has(key)) return abc;
          notes.set(key, item);
          onset += item.duration ?? 0;
        }
        positions.set(id, onset);
      }
    }
    noteSpans.sort((left, right) => left.start - right.start);
    if (noteSpans.some((span, index) => index > 0 && span.start < noteSpans[index - 1].end)) return abc;
    const edits: { start: number; length: number; text: string }[] = [];
    const touched = new Set<string>();
    for (const hold of source.holds) for (const group of groups) {
      const participants = group.filter((id) => hold.voices.includes(id));
      if (!participants.length) continue;
      const carrier = hold.orientation === 'invertedfermata' ? participants.at(-1)! : participants[0];
      for (const id of participants) {
        const key = `${id}:${hold.onset}`;
        if (touched.has(key)) return abc;
        touched.add(key);
        const note = notes.get(key);
        if (!note || note.rest || note.duration !== hold.duration / 4 || note.startChar < 0 || note.endChar <= note.startChar) return abc;
        const raw = abc.slice(note.startChar, note.endChar);
        const hasHold = note.decoration?.some((decoration) => decoration === 'fermata' || decoration === 'invertedfermata');
        const marks = hasHold ? [...raw.matchAll(/!invertedfermata!|!fermata!|H/g)] : [];
        if ((hasHold && marks.length !== 1) || (!hasHold && marks.length)) return abc;
        if (marks.length) {
          const mark = marks[0];
          const wanted = id === carrier ? `!${hold.orientation}!` : ' '.repeat(mark[0].length);
          edits.push({ start: note.startChar + mark.index, length: mark[0].length, text: wanted });
        } else if (id === carrier) {
          edits.push({ start: note.startChar, length: 0, text: `!${hold.orientation}!` });
        }
      }
    }
    // Check the entire staged edit set before changing even one character.
    // Integer checks also reject NaN and infinities; equal starts are ambiguous
    // even for zero-width insertions and therefore fail closed.
    edits.sort((left, right) => left.start - right.start);
    if (edits.some((edit, index) => !Number.isInteger(edit.start) || !Number.isInteger(edit.length) ||
        edit.start < 0 || edit.length < 0 || edit.start + edit.length > abc.length ||
        (index > 0 && (edit.start === edits[index - 1].start || edit.start < edits[index - 1].start + edits[index - 1].length)))) return abc;
    let presented = abc;
    for (const edit of [...edits].reverse()) {
      presented = presented.slice(0, edit.start) + edit.text + presented.slice(edit.start + edit.length);
    }
    return presented;
  } catch {
    return abc;
  }
}
