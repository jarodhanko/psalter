/** Exact-edition beat-2 lyric continuation. No source/text edits. */
import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';

export const PSALTER46_LYRIC_ID = 'psalter46';
type Event = abcjs.AbcElem;
// Runtime TuneBook offsets, after metadata and leading newline removal.
// These are whole authored attacks, never synthetic fragments or lyric slots.
const STARTS = [[112,116,118,120,122,124], [867,871,873,875,877,879],
  [984,989,992,995,998,1001], [1119,1124,1127,1130,1133,1136]];
const ENDS = [[116,118,120,122,124,126], [871,873,875,877,879,881],
  [989,992,995,998,1001,1004], [1124,1127,1130,1133,1136,1139]];
const PITCHES = [[2,5,4,2,0,1], [0,3,2,0,0,0], [-3,-3,-3,-3,-5,-4], [-7,-7,-7,-7,-7,-7]];
const ROWS = [
  [['King',' '],['king','-'],['maj','-'],['King',' ']],
  [['re','-'],['ly',' '],['es','-'],['doth',' ']],
  [['joic','-'],['crown',' '],['ty',' '],['in',' ']],
  [['eth',' '],['Thou',' '],['and',' '],['Je','-']],
  [['in',' '],['giv','-'],['hon','-'],['ho','-']],
  [['Thy',' '],['est',' '],['or',' '],['vah',' ']],
];
const DURATIONS = [0.25,1,0.625,0.375,1,1,1,0.625,0.375,1,0.75];
const voices = (tune: Pick<abcjs.TuneObject, 'lines'>, line: number) => tune.lines[line]?.staff?.flatMap(staff => staff.voices ?? []);
// Independent complete parser-event witness, including native beam flags.
// Signature SHA-256 846494f68dff694b734d5365752ff2e7e98345c6f0a14ecdfad6fb1b736a4b59.
function sourceIdentity(signature: string) {
  if (signature.length !== 41903) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < signature.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(signature.charCodeAt(index))) * 1099511628211n);
  return hash === 0x6254ff7f6452092cn;
}

/** Source/prepared gates run before this reader. Retain every complete unit,
 * voice order, lyric row, later accidental and tie in the shared signature. */
export function readPsalter46OpeningIdentity(tune: abcjs.TuneObject, parser: string) {
  const score = readScreenScoreIdentity(tune, parser);
  if (!score || score.meter !== 1 || score.notes.length !== 145 || score.units.length !== DURATIONS.length ||
    score.units.some((unit, index) => unit.duration !== DURATIONS[index])) return;
  const beams = JSON.stringify(score.notes.map(({ voice, element }) => [voice, element.startChar, element.endChar,
    'startBeam' in element, element.startBeam, 'endBeam' in element, element.endBeam]));
  const signature = JSON.stringify([score.signature, beams]);
  return sourceIdentity(signature) &&
    [37,36,36,36].every((count, voice) => score.notes.filter(note => note.voice === voice).length === count) &&
    tune.lines.every(line => line.staff?.length === 2 && line.staff.every(staff => {
      const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
      return staff.voices?.length === 2 && group.brace === undefined && group.bracket === undefined && group.connectBarLines === undefined;
    })) && score.notes.every(note => !note.element.rest && note.element.pitches?.length === 1) ? { ...score, signature } : undefined;
}

/** Each voice must own exactly the six original attacks. Only beat 2 may
 * cross lyrics, with four real attacks and four authored rows in the suffix.
 * The other profiles still require completed outgoing words. */
export function hasPsalter46LyricBoundary(voice: number, notes: Event[], moved: number, duration: number) {
  return duration === 0.5 && moved === 2 && notes.length === 6 && voice >= 0 && voice < 4 &&
    notes.every((event, index) => event.startChar === STARTS[voice][index] && event.endChar === ENDS[voice][index] &&
      event.duration === (index === 0 ? 0.375 : 0.125) && !event.rest && event.pitches?.length === 1 &&
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
export function readPsalter46NativeContinuation(host: HTMLElement, tune: abcjs.TuneObject, fragmented: boolean) {
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
