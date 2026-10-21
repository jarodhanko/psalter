import type abcjs from 'abcjs';
import type { readScreenScoreIdentity } from './isolatedChordWrap';

type Score = NonNullable<ReturnType<typeof readScreenScoreIdentity>>;
type Head = abcjs.RelativeElement & { parent?: abcjs.AbsoluteElement };
type Arc = { type: string; anchor1?: Head; anchor2?: Head; internalNotes?: Head[]; elemset?: SVGGraphicsElement[];
  isTie?: boolean; above?: boolean; fixedY?: boolean; dotted?: boolean; voiceNumber?: number;
  startX?: number; endX?: number; startY?: number; endY?: number;
  calcSlurDirection?: () => void; calcX?: (left: number, right: number) => void;
  calcSlurY?: () => void; avoidCollisionAbove?: () => void };
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 0.05;

// Check ABCJS 6.7.0's native filled slur, without editing its path. Reflow may
// change its horizontal span; source anchors, native curvature and thickness
// must still account for every path. This is not a zero-arc Church gate.
function nativeSlurPath(arc: Arc, zero: number) {
  const round = (value: number) => Number(value.toFixed(2));
  const spacing = arc.above ? 1.5 : -1.5;
  const x1 = round(arc.startX! + 6), x2 = round(arc.endX! + 4);
  const y1 = round(zero - (arc.startY! + spacing) * 3.875), y2 = round(zero - (arc.endY! + spacing) * 3.875);
  const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
  if (!Number.isFinite(length) || length <= 0 || x2 <= x1) return undefined;
  const ux = dx / length, uy = dy / length, flat = length / 3.5;
  const curve = (arc.above ? -1 : 1) * Math.min(25, Math.max(4, flat));
  const c1x = round(x1 + flat * ux - curve * uy), c1y = round(y1 + flat * uy + curve * ux);
  const c2x = round(x2 - flat * ux - curve * uy), c2y = round(y2 - flat * uy + curve * ux);
  return [x1, y1, c1x, c1y, c2x, c2y, x2, y2, round(c2x - 2 * uy), round(c2y + 2 * ux),
    round(c1x - 2 * uy), round(c1y + 2 * ux), x1, y1];
}

export function readTwoHymnSizeArcs(host: HTMLElement, tune: abcjs.TuneObject, score: Score, count: number) {
  const paths = [...host.querySelectorAll<SVGGraphicsElement>('path[data-name="slur"], path[data-name="tie"]')];
  if (paths.length !== count || paths.some(path => path.getAttribute('data-name') !== 'slur')) return undefined;
  if (!count) return { signature: '[]', arcs: [] };
  const pairs = new Map<abcjs.AbcElem, { end: abcjs.AbcElem; voice: number; label: number; interior: abcjs.AbcElem[] }>();
  for (let voice = 0; voice < 4; voice++) {
    const pending = new Map<number, number>();
    const notes = score.notes.filter(note => note.voice === voice);
    for (const [index, { element }] of notes.entries()) {
      for (const pitch of element.pitches ?? []) {
        for (const label of pitch.endSlur ?? []) {
          const startIndex = pending.get(label), start = startIndex === undefined ? undefined : notes[startIndex].element;
          if (!start || pairs.has(start)) return undefined;
          pairs.set(start, { end: element, voice, label, interior: notes.slice(startIndex! + 1, index).map(note => note.element) }); pending.delete(label);
        }
        for (const slur of pitch.startSlur ?? []) {
          if (pending.has(slur.label)) return undefined;
          pending.set(slur.label, index);
        }
      }
    }
    if (pending.size) return undefined;
  }
  if (pairs.size !== count || !Array.isArray(tune.engraver?.staffgroups)) return undefined;
  const seen = new Set<SVGGraphicsElement>(), identities: string[] = [];
  const arcs: { source: number[]; box: number[]; screen: number[] }[] = [];
  const svgs = [...host.querySelectorAll('svg')];
  for (const [system, group] of tune.engraver.staffgroups.entries()) {
    for (const [voiceIndex, voice] of group.voices.entries()) for (const raw of voice.otherchildren ?? []) {
      const arc = raw as Arc;
      if (arc?.type !== 'TieElem') continue;
      const first = arc.anchor1?.parent?.abcelem as abcjs.AbcElem | undefined;
      const last = arc.anchor2?.parent?.abcelem as abcjs.AbcElem | undefined;
      const pair = first && pairs.get(first);
      if (!pair || pair.end !== last || pair.voice !== voiceIndex || arc.isTie !== false || typeof arc.above !== 'boolean' ||
        arc.fixedY || arc.dotted || arc.elemset?.length !== 1 ||
        ![arc.startX, arc.endX, arc.startY, arc.endY, voice.staff?.absoluteY].every(Number.isFinite)) return undefined;
      if (arc.anchor1 !== first!.abselem?.heads?.[0] || arc.anchor2 !== last!.abselem?.heads?.[0] ||
        arc.voiceNumber !== voiceIndex % 2 || arc.above !== (voiceIndex % 2 === 0) ||
        arc.internalNotes?.length !== pair.interior.length || pair.interior.some((note, index) =>
          !note.abselem?.heads?.[0] || arc.internalNotes![index] !== note.abselem.heads[0])) return undefined;
      // Recompute from the actual source-owned heads, not cached path endpoints.
      // The pinned engine's layout methods write only this shallow copy. Never
      // call them on the retained engraving or change the canonical parser tree.
      const native = Object.assign(Object.create(Object.getPrototypeOf(arc)), arc) as Arc;
      if (![native.calcSlurDirection, native.calcX, native.calcSlurY, native.avoidCollisionAbove]
        .every(method => typeof method === 'function')) return undefined;
      native.calcSlurDirection!(); native.calcX!(0, 0); native.calcSlurY!(); native.avoidCollisionAbove!();
      if (native.above !== arc.above || (['startX', 'endX', 'startY', 'endY'] as const)
        .some(key => !close(native[key]!, arc[key]!))) return undefined;
      const path = arc.elemset[0], svg = path.ownerSVGElement;
      if (!paths.includes(path) || seen.has(path) || !svg || svg !== svgs[system] ||
        first!.abselem?.elemset.some(root => root.ownerSVGElement !== svg) ||
        last!.abselem?.elemset.some(root => root.ownerSVGElement !== svg)) return undefined;
      for (let node: Element | null = path; node && node !== svg; node = node.parentElement)
        if (node.hasAttribute('transform') || (node as SVGGraphicsElement).style?.transform) return undefined;
      const d = path.getAttribute('d') ?? '';
      const tokens = d.match(/[a-zA-Z]|[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/g) ?? [];
      const commands = tokens.filter(token => /^[a-zA-Z]$/.test(token)).join('');
      const values = tokens.filter(token => !/^[a-zA-Z]$/.test(token)).map(Number);
      const expected = nativeSlurPath(arc, voice.staff.absoluteY);
      if (commands !== 'MCCz' || !expected || values.length !== expected.length ||
        values.some((value, index) => !close(value, expected[index]))) return undefined;
      const box = path.getBBox(), rect = path.getBoundingClientRect(), viewport = svg.viewBox.baseVal;
      const ratio = svg.getBoundingClientRect().width / viewport.width;
      if (![box.x, box.y, box.width, box.height, rect.width, rect.height, ratio].every(Number.isFinite) ||
        box.width <= 0 || box.height <= 0 || ratio <= 0 || !close(rect.width, box.width * ratio) || !close(rect.height, box.height * ratio) ||
        box.x - 2 < viewport.x - 0.05 || box.x + box.width + 2 > viewport.x + viewport.width + 0.05 ||
        box.y - 2 < viewport.y - 0.05 || box.y + box.height + 2 > viewport.y + viewport.height + 0.05) return undefined;
      seen.add(path); pairs.delete(first!);
      const source = [voiceIndex, first!.startChar, last!.endChar, pair.label];
      identities.push(JSON.stringify(source));
      arcs.push({ source, box: [box.x, box.y, box.width, box.height], screen: [rect.width, rect.height] });
    }
  }
  return seen.size === count && !pairs.size ? { signature: JSON.stringify(identities.sort()), arcs } : undefined;
}
