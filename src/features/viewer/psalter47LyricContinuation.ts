/** Exact HEBRON repeated-group boundary: preserve the authored a- / far. */
import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';
export const PSALTER47_GROUPED_ID = 'psalter47';
type Event = abcjs.AbcElem;
const STARTS = [[113,116,118,121],[971,975,977,980],[1078,1082,1085,1089],[1211,1216,1220,1225]];
const ENDS = [[116,118,121,124],[975,977,980,983],[1082,1085,1089,1093],[1216,1220,1225,1230]];
const PITCHES = [[1,3,4,3],[-1,1,2,1],[-1,-1,-1,-1],[-8,-8,-8,-8]];
const ROWS = [
  [['let',' '],['num','-'],['un','-'],['on',' '],['Lord,',' ']],
  [['Thy',' '],['bered',' '],['to',' '],['My',' '],['a','-']],
  [['strength',' '],['foes',' '],['death',' '],['wast','-'],['far',' ']],
  [['and',' '],['would',' '],['Thou',' '],['ed',' '],['no',' ']],
];
/** Exact canonical/prepared literals gate this reader before use. */
export function readPsalter47OpeningIdentity(tune: abcjs.TuneObject, parser: string) {
  const score = readScreenScoreIdentity(tune, parser);
  return score && score.meter === 0.75 && score.units.length === 9 && score.notes.length === 128 &&
    score.units.every((unit, index) => unit.duration === (index === 0 ? 0.25 : index === 8 ? 0.5 : 0.75)) &&
    [0,1,2,3].every(voice => score.notes.filter(note => note.voice === voice).length === 32) &&
    tune.lines.every(line => line.staff?.length === 2 && line.staff.every(staff => {
      const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
      return staff.voices?.length === 2 && group.brace === undefined && group.bracket === undefined && group.connectBarLines === undefined;
    })) && score.notes.every(note => !note.element.rest && note.element.pitches?.length === 1 &&
      (note.voice !== 0 || note.element.lyric?.length === 5)) ? score : undefined;
}
export function hasPsalter47LyricBoundary(voice: number, notes: Event[], moved: number, duration: number) {
  return duration === 0.25 && moved === 2 && notes.length === 4 && voice >= 0 && voice < 4 &&
    notes.every((event, index) => event.startChar === STARTS[voice][index] && event.endChar === ENDS[voice][index] &&
      event.duration === (index < 2 ? 0.125 : 0.25) && !event.rest && event.pitches?.length === 1 &&
      event.pitches[0].pitch === PITCHES[voice][index] && (voice === 0
        ? event.lyric?.length === 5 && event.lyric.every((row, stanza) => Object.keys(row).length === 2 &&
          row.syllable === ROWS[index][stanza][0] && row.divider === ROWS[index][stanza][1]) : event.lyric === undefined));
}
const voices = (tune: Pick<abcjs.TuneObject, 'lines'>, line: number) => tune.lines[line]?.staff?.flatMap(staff => staff.voices ?? []);
type NativeLyric = { type?: string; c?: string; graphelem?: SVGTextElement };
type NativeOwner = { abcelem?: Event; children?: NativeLyric[]; elemset?: SVGElement[] };
/** ABCJS 6.7.0 addLyric appends the original divider to each syllable and
 * draw/relative renders that exact string. Prove that native ownership edge
 * and every visible row at both sides of the crossing; do not synthesize a
 * hyphen, rewrite a lyric, widen a viewport or alter a native element. */
export function readPsalter47NativeContinuation(host: HTMLElement, tune: abcjs.TuneObject, fragmented: boolean) {
  if (abcjs.signature !== 'abcjs-basic v6.7.0') return;
  const systems = [...host.querySelectorAll('svg')];
  const seen = new Set<SVGTextElement>();
  for (const index of [1,2]) {
    const line = fragmented && index === 1 ? 0 : 1;
    const voice = voices(tune, line)?.[0];
    const notes = voice?.filter(event => event.el_type === 'note') as Event[] | undefined;
    const event = notes?.find(event => event.startChar === STARTS[0][index] && event.endChar === ENDS[0][index]);
    if (!event || !systems[line] || (fragmented && (index === 1 ? notes?.at(-1) !== event : notes?.[0] !== event))) return;
    const owner = event.abselem as unknown as NativeOwner | undefined;
    const lyrics = owner?.children?.filter(child => child.type === 'lyric');
    const expected = ROWS[index].map(([syllable, divider]) => syllable + (divider === ' ' ? '' : divider));
    if (owner?.abcelem !== event || lyrics?.length !== 1 || lyrics[0].c !== expected.join('\n') + '\n') return;
    const text = lyrics[0].graphelem;
    const owned = owner.elemset?.flatMap(root => [...root.querySelectorAll<SVGTextElement>('text.abcjs-lyric[data-name="lyric"]')]);
    if (!text || !host.contains(text) || text.ownerSVGElement !== systems[line] || seen.has(text) ||
      owned?.length !== 1 || owned[0] !== text || text.childNodes.length !== 6 || text.children.length !== 6) return;
    seen.add(text);
    const viewport = systems[line].getBoundingClientRect();
    for (const [row, raw] of [...text.children].entries()) {
      if (!(raw instanceof SVGGraphicsElement) || raw.tagName.toLowerCase() !== 'tspan' || raw.children.length ||
        raw.textContent !== (expected[row] ?? '')) return;
      // Native SVG.text deliberately appends a final empty tspan.
      if (row === 5) continue;
      const box = raw.getBBox(), rect = raw.getBoundingClientRect();
      if (![box.width, box.height, rect.width, rect.height].every(value => Number.isFinite(value) && value > 0) ||
        rect.left < viewport.left - 0.05 || rect.right > viewport.right + 0.05 ||
        rect.top < viewport.top - 0.05 || rect.bottom > viewport.bottom + 0.05) return;
      for (let node: Element | null = raw; node && node !== host; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) !== 1) return;
      }
      const style = getComputedStyle(raw);
      if (style.fill === 'none' || Number(style.fillOpacity) <= 0) return;
    }
  }
  return true;
}
