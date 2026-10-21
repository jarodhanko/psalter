/** Exact-edition beat-2 lyric continuation. No source/text edits. */
import abcjs from 'abcjs';

type Event = abcjs.AbcElem;
// Exact TuneBook offsets signed by saviorsLoveOpeningSource.ts. Five whole
// first-bar attacks per voice; the pickup is separate and remains untouched.
const STARTS = [[437,440,443,445,450], [784,787,790,792,797],
  [847,852,856,860,867], [929,934,938,942,949]];
const ENDS = [[440,443,445,450,454], [787,790,792,797,801],
  [852,856,860,867,873], [934,938,942,949,955]];
const PITCHES = [[2,0,2,5,6], [0,-2,0,0,1], [-2,-5,-2,-2,-2], [-9,-9,-9,-9,-9]];
const DURATIONS = [0.25,0.25,0.25,0.1875,0.0625];
const ROWS = [
  [['stand',' '],['me',' '],['pit','-'],['with',' ']],
  [['a','-'],['it',' '],['y',' '],['the',' ']],
  [['mazed',' '],['was',' '],['an','-'],['ran','-']],
  [['in',' '],['in',' '],['gels',' '],['somed',' ']],
  [['the',' '],['the',' '],['be','-'],['in',' ']],
];
const voices = (tune: Pick<abcjs.TuneObject, 'lines'>, line: number) => tune.lines[line]?.staff?.flatMap(staff => staff.voices ?? []);

/** Only the synchronized half-note cut is admitted. Two authored attacks
 * join the pickup; three attacks and all four lyric rows stay in the suffix.
 * The sole crossing word is a-/mazed. Full-source identity is required by the
 * caller; these independent witnesses bind the exact boundary in every voice. */
export function hasSaviorsLoveLyricBoundary(voice: number, notes: Event[], moved: number, duration: number) {
  return duration === 0.5 && moved === 2 && notes.length === 5 && voice >= 0 && voice < 4 &&
    notes.every((event, index) => event.startChar === STARTS[voice][index] && event.endChar === ENDS[voice][index] &&
      event.duration === DURATIONS[index] && !event.rest && event.pitches?.length === 1 &&
      event.pitches[0].pitch === PITCHES[voice][index] && (voice === 0
        ? event.lyric?.length === 4 && event.lyric.every((row, stanza) =>
          Object.keys(row).length === 2 && row.syllable === ROWS[index][stanza][0] && row.divider === ROWS[index][stanza][1])
        : event.lyric === undefined));
}

type NativeLyric = { type?: string; c?: string; graphelem?: SVGTextElement };
type NativeOwner = { abcelem?: Event; children?: NativeLyric[]; elemset?: SVGElement[] };
/** ABCJS 6.7.0 addLyric appends the original divider to each syllable and
 * draw/relative renders that exact string. Prove that native ownership edge
 * and every visible row at both sides of the crossing; do not synthesize a
 * hyphen, rewrite a lyric, widen a viewport or alter a native element. */
export function readSaviorsLoveNativeContinuation(host: HTMLElement, tune: abcjs.TuneObject, fragmented: boolean) {
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
      owned?.length !== 1 || owned[0] !== text || text.childNodes.length !== 5 || text.children.length !== 5) return;
    seen.add(text);
    const viewport = systems[line].getBoundingClientRect();
    for (const [row, raw] of [...text.children].entries()) {
      if (!(raw instanceof SVGGraphicsElement) || raw.tagName.toLowerCase() !== 'tspan' || raw.children.length ||
        raw.textContent !== (expected[row] ?? '')) return;
      // Native SVG.text deliberately appends a final empty tspan.
      if (row === 4) continue;
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
