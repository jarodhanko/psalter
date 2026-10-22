/** The exact default All Creatures view may move its intact bass beam only. */
import abcjs from 'abcjs';
import { getPublishedStanzaVariant } from '../../domain/publishedStanzaVariant';
import { readScreenElementSize } from './isolatedChordWrap';

export const ALL_CREATURES_OPENING_ID = 'hymn-oh_all-creatures-of-our-god-and-king-lasst-uns-erfreuen';
export const hasAllCreaturesOpeningSource = (source: string) => !!getPublishedStanzaVariant(ALL_CREATURES_OPENING_ID, source);
type Event = abcjs.AbcElem;
const STARTS = [1035,1040,1043,1046,1050,1054], ENDS = [1040,1043,1046,1050,1054,1057];
const PITCHES = [-6,-6,-6,-7,-8,-5], NAMES = ['D,','D,','D,','C,','B,,','E,'];
function bassEvent(event: Event, index: number) {
  const pitch = event.pitches?.[0];
  return event.el_type === 'note' && event.startChar === STARTS[index] && event.endChar === ENDS[index] &&
    event.duration === [0.5,0.25,0.125,0.125,0.25,0.25][index] && !event.rest && event.lyric === undefined &&
    event.pitches?.length === 1 && pitch?.pitch === PITCHES[index] && pitch.name === NAMES[index] &&
    pitch.verticalPos === PITCHES[index] + 12 && pitch.accidental === undefined &&
    event.startBeam === (index === 2 ? true : undefined) && event.endBeam === (index === 3 ? true : undefined);
}
/** Four complete beats move. The only beam ends exactly at the cut; the two
 * remaining bass attacks stay together. Generic prefix beams remain rejected. */
export function hasAllCreaturesPrefixBeam(voice: number, notes: Event[], moved: number, duration: number) {
  return voice === 3 && duration === 1 && moved === 4 && notes.length === 6 && notes.every(bassEvent);
}
type Owner = { abcelem?: Event; beam?: Beam };
type Beam = { type?: string; elems?: Owner[]; isgrace?: boolean; stemsUp?: boolean;
  beams?: { startX: number; endX: number; startY: number; endY: number; dy: number; split?: unknown }[] };
/** Trace both original events through their native owners to one BeamElem,
 * then bind its exact ABCJS path to the visible bass SVG. No synthetic beam. */
export function readAllCreaturesPrefixBeam(host: HTMLElement, tune: abcjs.TuneObject, fragmented: boolean) {
  if (abcjs.signature !== 'abcjs-basic v6.7.0' || tune.lines.length < 2 ||
    host.querySelectorAll('svg').length !== tune.lines.length || host.querySelectorAll('path[data-name="slur"]').length !== 40 ||
    host.querySelector('path[data-name="tie"]') || host.querySelectorAll('path.abcjs-beam-elem').length !== 1) return false;
  const line = fragmented ? 0 : 1, svg = host.querySelectorAll('svg')[line];
  const notes = tune.lines[line].staff?.[1]?.voices?.[1]?.filter(event => event.el_type === 'note') as Event[] | undefined;
  const pair = [2,3].map(index => notes?.find(event => bassEvent(event,index)));
  const owners = pair.map(event => event?.abselem as unknown as Owner | undefined), beam = owners[0]?.beam;
  const group = tune.lines[line] as unknown as { staffGroup?: { staffs?: { absoluteY: number }[]; voices?: { beams?: (Beam | string)[] }[] } };
  if (!pair[0] || !pair[1] || owners.some((owner,index) => owner?.abcelem !== pair[index]) ||
    !beam || beam.type !== 'BeamElem' || beam.isgrace !== false || beam.stemsUp !== false || owners[1]?.beam !== beam ||
    beam.elems?.length !== 2 || beam.elems.some((owner,index) => owner !== owners[index]) || beam.beams?.length !== 1 ||
    group.staffGroup?.voices?.length !== 4 || group.staffGroup.voices[3].beams?.filter(item => item === beam).length !== 1) return false;
  const native = beam.beams[0], y = group.staffGroup.staffs?.[1]?.absoluteY;
  if (!Number.isFinite(y) || native.split || native.dy !== -3.875 ||
    ![native.startX,native.endX,native.startY,native.endY].every(Number.isFinite) || native.endX <= native.startX) return false;
  // ABCJS 6.7.0 draw/beam.js rounds each native coordinate to two decimals.
  const round = (value: number) => Number(value.toFixed(2));
  const x1 = round(native.startX), x2 = round(native.endX), y1 = round(y! - native.startY * 3.875), y2 = round(y! - native.endY * 3.875);
  const path = `M${x1} ${y1} L${x2} ${y2}L${x2} ${round(y2 + native.dy)} L${x1} ${round(y1 + native.dy)}z`;
  const glyphs = svg.querySelectorAll<SVGGraphicsElement>(`path.abcjs-beam-elem.abcjs-l${line}.abcjs-v3`), glyph = glyphs[0];
  if (glyphs.length !== 1 || glyph.getAttribute('d') !== path || !readScreenElementSize(glyph)) return false;
  for (let node: Element | null = glyph; node && node !== host; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) !== 1) return false;
  }
  const style = getComputedStyle(glyph), rect = glyph.getBoundingClientRect(), viewport = svg.getBoundingClientRect();
  return style.fill !== 'none' && Number(style.fillOpacity) > 0 && rect.left >= viewport.left - 0.05 &&
    rect.right <= viewport.right + 0.05 && rect.top >= viewport.top - 0.05 && rect.bottom <= viewport.bottom + 0.05;
}
