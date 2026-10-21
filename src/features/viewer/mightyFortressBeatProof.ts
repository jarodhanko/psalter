/** Exact Mighty Fortress beat-2 capability. No source, lyric or accidental replay. */
import abcjs from 'abcjs';
import { readScreenElementSize } from './isolatedChordWrap';

type Event = abcjs.AbcElem;
const STARTS = [[436,439,441,443,446],[857,860,862,864],[911,915,918,921,926],[1019,1023,1026,1029,1034]];
const ENDS = [[439,441,443,446,448],[860,862,864,866],[915,918,921,926,929],[1023,1026,1029,1034,1038]];
const PITCHES = [[8,8,5,6,7],[1,3,2,2],[-2,-2,-2,-3,-2],[-4,-6,-7,-8,-9]];
const NAMES = [['d','d','A','B','c'],['D','F','E','E'],['A,','A,','A,','^G,','A,'],['F,','D,','C,','B,,','A,,']];
const ROWS = [
  [['might','-'],['we',' '],['though',' '],['word',' ']],
  [['y',' '],['in',' '],['this',' '],['a','-']],
  [['for','-'],['our',' '],['world,',' '],['bove',' ']],
  [['',' '],['',' '],['',' '],['',' ']],
  [['tress',' '],['own',' '],['with',' '],['all',' ']],
];
const voices = (tune: Pick<abcjs.TuneObject, 'lines'>, line: number) => tune.lines[line]?.staff?.flatMap(staff => staff.voices ?? []);

/** The sole exception to the shared accidental rejection: an unchanged sharp
 * wholly in the suffix, whose preceding prefix has only A notes. Full source
 * identity and the complete boundary proof are independently mandatory. */
export function isMightyFortressSuffixAccidental(voice: number, event: Event, duration: number) {
  const pitch = event.pitches?.[0];
  return duration === 0.5 && voice === 2 && event.startChar === 921 && event.endChar === 926 &&
    event.duration === 0.125 && !event.rest && event.pitches?.length === 1 &&
    pitch?.pitch === -3 && pitch.name === '^G,' && pitch.verticalPos === 9 && pitch.accidental === 'sharp' &&
    event.startBeam === undefined && event.endBeam === true;
}
/** Exactly two quarter attacks move in each lane. Every source row, including
 * the four blank eighth-note cells, stays attached to its original event. */
export function hasMightyFortressBeatBoundary(voice: number, notes: Event[], moved: number, duration: number) {
  return duration === 0.5 && moved === 2 && voice >= 0 && voice < 4 && notes.length === STARTS[voice].length &&
    notes.every((event,index) => event.startChar === STARTS[voice][index] && event.endChar === ENDS[voice][index] &&
      event.duration === (voice !== 1 && (index === 2 || index === 3) ? 0.125 : 0.25) && !event.rest &&
      event.pitches?.length === 1 && event.pitches[0].pitch === PITCHES[voice][index] &&
      event.pitches[0].name === NAMES[voice][index] && event.pitches[0].verticalPos === PITCHES[voice][index] + (voice < 2 ? 0 : 12) &&
      event.pitches[0].accidental === (voice === 2 && index === 3 ? 'sharp' : undefined) &&
      event.startBeam === (voice !== 1 && index === 2 ? true : undefined) &&
      event.endBeam === (voice !== 1 && index === 3 ? true : undefined) &&
      (voice === 0 ? event.lyric?.length === 4 && event.lyric.every((row,stanza) =>
        Object.keys(row).length === 2 && row.syllable === ROWS[index][stanza][0] && row.divider === ROWS[index][stanza][1])
        : event.lyric === undefined));
}

type NativeChild = { type?: string; c?: string | null; graphelem?: SVGGraphicsElement; scalex?: number; scaley?: number };
type NativeBeam = { type?: string; elems?: NativeOwner[]; isgrace?: boolean; beams?: unknown[] };
type NativeOwner = { abcelem?: Event; children?: NativeChild[]; elemset?: SVGElement[]; beam?: NativeBeam };
function visible(element: SVGGraphicsElement, host: HTMLElement) {
  if (!host.contains(element)) return false;
  for (let node: Element | null = element; node && node !== host; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) !== 1) return false;
  }
  const style = getComputedStyle(element);
  return style.fill !== 'none' && Number(style.fillOpacity) > 0;
}
/** Source note -> native AbsoluteElement -> exact RelativeElement -> SVG.
 * Count this event's glyph, never the score's legitimate signature sharps.
 * The three source beam pairs retain their native suffix-lane owners. */
export function readMightyFortressNativeSuffix(host: HTMLElement, tune: abcjs.TuneObject) {
  if (abcjs.signature !== 'abcjs-basic v6.7.0' || tune.lines.length !== 17 || host.querySelectorAll('svg').length !== 17) return;
  const suffix = voices(tune,1), svg = host.querySelectorAll('svg')[1];
  const event = suffix?.[2]?.find(raw => raw.el_type === 'note' && raw.startChar === 921 && raw.endChar === 926) as Event | undefined;
  if (!event || !isMightyFortressSuffixAccidental(2,event,0.5)) return;
  const owner = event.abselem as unknown as NativeOwner | undefined;
  const children = owner?.children?.filter(child => child.c === 'accidentals.sharp'), child = children?.[0], glyph = child?.graphelem;
  const owned = owner?.elemset?.flatMap(root => [...root.querySelectorAll<SVGGraphicsElement>('[data-name="accidentals.sharp"]')]);
  if (owner?.abcelem !== event || children?.length !== 1 || child?.type !== 'symbol' || !glyph || owned?.length !== 1 || owned[0] !== glyph ||
    glyph.getAttribute('data-name') !== 'accidentals.sharp' || glyph.ownerSVGElement !== svg || !visible(glyph,host) ||
    child.scalex !== 1 || child.scaley !== 1) return;
  const size = readScreenElementSize(glyph), viewport = svg.getBoundingClientRect(), rect = glyph.getBoundingClientRect();
  if (!size || rect.left < viewport.left - 0.05 || rect.right > viewport.right + 0.05 ||
    rect.top < viewport.top - 0.05 || rect.bottom > viewport.bottom + 0.05) return;
  const group = tune.lines[1] as unknown as { staffGroup?: { voices?: { beams?: (NativeBeam | string)[] }[] } };
  if (group.staffGroup?.voices?.length !== 4) return;
  const seen = new Set<NativeBeam>();
  for (const lane of [0,2,3]) {
    const notes = [2,3].map(index => suffix![lane].find(raw => raw.el_type === 'note' &&
      raw.startChar === STARTS[lane][index] && raw.endChar === ENDS[lane][index]) as Event | undefined);
    const owners = notes.map(note => note?.abselem as unknown as NativeOwner | undefined), beam = owners[0]?.beam;
    if (!notes[0] || !notes[1] || owners.some((item,index) => !item || item.abcelem !== notes[index]) ||
      !beam || beam.type !== 'BeamElem' || beam.isgrace !== false || seen.has(beam) || owners[1]?.beam !== beam ||
      beam.elems?.length !== 2 || beam.elems.some((item,index) => item !== owners[index]) || beam.beams?.length !== 1 ||
      group.staffGroup.voices[lane].beams?.filter(item => item === beam).length !== 1) return;
    seen.add(beam);
  }
  return size;
}
export function sameMightyFortressNativeSuffix(before: ReturnType<typeof readMightyFortressNativeSuffix>, after: ReturnType<typeof readMightyFortressNativeSuffix>) {
  return before && after && (['width','height','screenWidth','screenHeight'] as const).every(axis => Math.abs(before[axis] - after[axis]) <= 0.05);
}

/** Original a-/bove and all four visible rows are native owned strings in the
 * correct systems. No synthetic hyphen, lyric carrier, or viewport change. */
export function readMightyFortressNativeContinuation(host: HTMLElement, tune: abcjs.TuneObject, fragmented: boolean) {
  if (abcjs.signature !== 'abcjs-basic v6.7.0') return;
  const systems = [...host.querySelectorAll('svg')], seen = new Set<SVGGraphicsElement>();
  for (const index of [1,2]) {
    const line = fragmented && index === 1 ? 0 : 1;
    const notes = voices(tune,line)?.[0]?.filter(event => event.el_type === 'note') as Event[] | undefined;
    const event = notes?.find(event => event.startChar === STARTS[0][index] && event.endChar === ENDS[0][index]);
    if (!event || !systems[line] || (fragmented && (index === 1 ? notes?.at(-1) !== event : notes?.[0] !== event))) return;
    const owner = event.abselem as unknown as NativeOwner | undefined;
    const lyrics = owner?.children?.filter(child => child.type === 'lyric');
    const expected = ROWS[index].map(([syllable,divider]) => syllable + (divider === ' ' ? '' : divider));
    if (owner?.abcelem !== event || lyrics?.length !== 1 || lyrics[0].c !== expected.join('\n') + '\n') return;
    const text = lyrics[0].graphelem;
    const owned = owner.elemset?.flatMap(root => [...root.querySelectorAll('text.abcjs-lyric[data-name="lyric"]')]);
    if (!text || text.ownerSVGElement !== systems[line] || seen.has(text) || owned?.length !== 1 || owned[0] !== text ||
      text.childNodes.length !== 5 || text.children.length !== 5) return;
    seen.add(text);
    const viewport = systems[line].getBoundingClientRect();
    for (const [row,raw] of [...text.children].entries()) {
      if (!(raw instanceof SVGGraphicsElement) || raw.tagName.toLowerCase() !== 'tspan' || raw.children.length ||
        raw.textContent !== (expected[row] ?? '')) return;
      if (row === 4) continue;
      const size = readScreenElementSize(raw), rect = raw.getBoundingClientRect();
      if (!size || !visible(raw,host) || rect.left < viewport.left - 0.05 || rect.right > viewport.right + 0.05 ||
        rect.top < viewport.top - 0.05 || rect.bottom > viewport.bottom + 0.05) return;
    }
  }
  return true;
}
