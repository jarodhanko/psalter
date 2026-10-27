import type abcjs from 'abcjs';
import { readLyricReferenceWidth } from './lyricTypography';

const EPSILON = 0.05;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;
type Box = [number, number, number, number];
export type Glyph = { tag: string; name: string | null; classes: string | null; style: string; attributes: string;
  path?: (string | number)[]; box: Box; screen: Box; matrix: number[]; lyric: boolean; staff: boolean; arc: boolean };
type System = { svg: SVGSVGElement; wrapper: HTMLElement; width: number; viewBox: string; glyphs: Glyph[] };
export type HeKeepsInk = { systems: System[]; engine: string };

/** Translation-invariant, complete SVG path coordinates. Unsupported path syntax
 * fails closed. Relative coordinates remain untouched; every absolute coordinate
 * is measured from the first move, including later subpaths. */
export function heKeepsPathShape(path: string): (string | number)[] | undefined {
  const tokens = path.match(/[a-zA-Z]|[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?/g) ?? [];
  if (path.replace(/[a-zA-Z]|[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?|[\s,]/g, '') ||
    tokens[0] !== 'M' || tokens.length < 3) return undefined;
  const x = Number(tokens[1]), y = Number(tokens[2]);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  const lengths: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  const result: (string | number)[] = [];
  let command = '', count = 0;
  for (const token of tokens) {
    if (/^[a-zA-Z]$/.test(token)) {
      if (command && count % lengths[command.toUpperCase()] !== 0 && command.toUpperCase() !== 'Z') return undefined;
      command = token; count = 0;
      if (!(command.toUpperCase() in lengths)) return undefined;
      result.push(command); continue;
    }
    const length = lengths[command.toUpperCase()], value = Number(token), index = count++ % length;
    if (!length || !Number.isFinite(value)) return undefined;
    let delta = 0;
    if (command === command.toUpperCase()) {
      if (command === 'H') delta = x;
      else if (command === 'V') delta = y;
      else if (command === 'A') delta = index === 5 ? x : index === 6 ? y : 0;
      else delta = index % 2 ? y : x;
    }
    result.push(value - delta);
  }
  return command.toUpperCase() === 'Z' || count % lengths[command.toUpperCase()] === 0 ? result : undefined;
}
export const shapeEqual = (a: (string | number)[] | undefined, b: typeof a) => !a || !b ? a === b :
  a.length === b.length && a.every((value, index) => typeof value === 'number'
    ? typeof b[index] === 'number' && close(value, b[index] as number) : value === b[index]);
export const overlaps = (a: Box, b: Box) => Math.min(a[0] + a[2], b[0] + b[2]) > Math.max(a[0], b[0]) + EPSILON &&
  Math.min(a[1] + a[3], b[1] + b[3]) > Math.max(a[1], b[1]) + EPSILON;

// All source-owned drawing children, including accidentals, flags, stems, rests,
// bars, clefs and keys. Only absolute placement and DOM/cache references are
// omitted. The two corrected aggregate reservations are not glyph properties.
export function heKeepsEngineInk(tune: abcjs.TuneObject): string | undefined {
  type Group = { voices: { children: { type: string; abcelem: abcjs.AbcElem; minspacing: number;
    children: Record<string, unknown>[] }[] }[] };
  const groups = tune.engraver?.staffgroups as unknown as Group[] | undefined;
  if (!groups || groups.length !== 16) return undefined;
  const keys = ['type', 'c', 'dx', 'w', 'realWidth', 'pitch', 'pitch2', 'scalex', 'scaley', 'linewidth', 'klass', 'name'];
  return JSON.stringify(groups.map(group => group.voices.map(voice =>
    voice.children.map(absolute => ({ type: absolute.type, start: absolute.abcelem.startChar, end: absolute.abcelem.endChar,
      minspacing: absolute.minspacing, children: absolute.children.map(child => keys.map(key =>
        [key, (child as unknown as Record<string, unknown>)[key]])) })))));
}

export function glyph(element: SVGGraphicsElement, svg: SVGSVGElement): Glyph | undefined {
  const tag = element.tagName.toLowerCase(), box = element.getBBox(), screen = element.getBoundingClientRect();
  const matrix = element.getScreenCTM(), frame = svg.getScreenCTM();
  if (!matrix || !frame || ![box.x, box.y, box.width, box.height, screen.x, screen.y, screen.width, screen.height,
    matrix.a, matrix.b, matrix.c, matrix.d, frame.a, frame.b, frame.c, frame.d].every(Number.isFinite) ||
    box.width < 0 || box.height < 0 || Math.abs(frame.b) > 1e-5 || Math.abs(frame.c) > 1e-5 || frame.a <= 0 || !close(frame.a, frame.d)) return undefined;
  const local = frame.inverse().multiply(matrix);
  if (![local.a, local.b, local.c, local.d, local.e, local.f].every(Number.isFinite) ||
    Math.abs(local.b) > 1e-5 || Math.abs(local.c) > 1e-5 || local.a <= 0 || !close(local.a, local.d)) return undefined;
  const computed = getComputedStyle(element);
  const style = JSON.stringify(['font-family', 'font-size', 'font-style', 'font-weight', 'font-stretch', 'letter-spacing',
    'word-spacing', 'font-kerning', 'font-feature-settings', 'font-variation-settings', 'fill', 'stroke', 'stroke-width',
    'opacity', 'visibility', 'display'].map(key => [key, computed.getPropertyValue(key)]));
  // Preserve every non-position attribute. A transform is permitted only if
  // both native CTM and the exact source attribute remain unchanged below.
  const attributes = JSON.stringify([...element.attributes].filter(attribute =>
    !['d', 'x', 'y'].includes(attribute.name)).map(attribute => [attribute.name, attribute.value]));
  const path = tag === 'path' ? heKeepsPathShape(element.getAttribute('d') ?? '') : undefined;
  if (tag === 'path' && !path) return undefined;
  if (tag !== 'path' && tag !== 'text') return undefined;
  if (element.hasAttribute('textLength') || element.hasAttribute('lengthAdjust') ||
    [...element.querySelectorAll('[textLength],[lengthAdjust]')].length) return undefined;
  const name = element.getAttribute('data-name');
  return { tag, name, classes: element.getAttribute('class'), style: `${style}:${tag === 'text' ? element.textContent : ''}`,
    attributes, path, box: [box.x * local.a + local.e, box.y * local.d + local.f, box.width * local.a, box.height * local.d],
    screen: [screen.x, screen.y, screen.width, screen.height], matrix: [local.a, local.b, local.c, local.d],
    lyric: !!element.closest('.abcjs-lyric'), staff: !!element.closest('.abcjs-staff'), arc: name === 'slur' || name === 'tie' };
}

// Only the reference's intentional inherited visibility differs. Every live
// source/candidate style, including visibility and opacity, is still compared.
export function heKeepsReferenceStyle(style: string): string {
  const separator = style.indexOf(']:');
  if (separator < 0) return style;
  const properties = JSON.parse(style.slice(0, separator + 1)) as [string, string][];
  return JSON.stringify(properties.filter(([key]) => key !== 'visibility')) + style.slice(separator + 1);
}

/** Native read only. Every visible SVG leaf must be represented. No synthetic
 * or jsdom rectangle can qualify an application render through this function. */
export function readHeKeepsSizeInk(host: HTMLElement, tune: abcjs.TuneObject): HeKeepsInk | undefined {
  try {
    const engine = heKeepsEngineInk(tune);
    if (!host.isConnected || !engine) return undefined;
    const systems: System[] = [];
    for (const svg of host.querySelectorAll('svg')) {
      const wrapper = svg.parentElement;
      if (!(wrapper instanceof HTMLElement) || wrapper.parentElement !== host || wrapper.childElementCount !== 1) return undefined;
      const width = readLyricReferenceWidth(wrapper);
      if (!Number.isFinite(width) || width <= 0) return undefined;
      if (svg.querySelector('image,use,line,ellipse,circle,rect,polygon,polyline,foreignObject')) return undefined;
      const glyphs = [...svg.querySelectorAll<SVGGraphicsElement>('path,text')].map(element => glyph(element, svg));
      if (!glyphs.length || glyphs.some(item => !item)) return undefined;
      systems.push({ svg, wrapper, width, viewBox: svg.getAttribute('viewBox')!, glyphs: glyphs as Glyph[] });
    }
    return systems.length === 16 ? { systems, engine } : undefined;
  } catch { return undefined; }
}

/** Full path/shape preservation, plus new-collision rejection on every system.
 * Staff length and source-validated slur shape have their own native proofs.
 * Lyrics use the independent original-reference typography proof; other text
 * receives the same unchanged-original-at-candidate-viewport control here. */
export function verifyHeKeepsSizeInk(host: HTMLElement, before: HeKeepsInk, after: HeKeepsInk) {
  const result = { valid: false, glyphs: 0, pairs: 0, textControls: 0, naturalWidthMeasurements: 0, reason: 'engine-ink' };
  let holder: HTMLElement | undefined;
  const measure = (source: System, target: System) => {
    const wrapper = source.wrapper.cloneNode(false) as HTMLElement, svg = source.svg.cloneNode(true) as SVGSVGElement;
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.setAttribute('data-he-keeps-ink-reference', 'true');
    wrapper.style.cssText += 'visibility:hidden;pointer-events:none;';
    svg.setAttribute('viewBox', target.viewBox); wrapper.append(svg); holder = wrapper;
    try {
      host.append(wrapper);
      if (!source.wrapper.style.position && !source.wrapper.style.width && readLyricReferenceWidth(wrapper) === target.width)
        result.naturalWidthMeasurements++;
      else wrapper.style.cssText += `position:absolute;left:0;top:0;width:${target.width}px;`;
      return [...svg.querySelectorAll<SVGGraphicsElement>('path,text')].map(element => glyph(element, svg));
    } finally { wrapper.remove(); holder = undefined; }
  };
  try {
    if (before.engine !== after.engine || before.systems.length !== after.systems.length) return result;
    for (const [system, old] of before.systems.entries()) {
      const next = after.systems[system], ratio = old.svg.viewBox.baseVal.width / next.svg.viewBox.baseVal.width;
      if (!close(old.width, next.width) || old.glyphs.length !== next.glyphs.length || !(ratio > 1)) return result;
      let reference: Glyph[] | undefined;
      if (old.glyphs.some(item => item.tag === 'text' && !item.lyric)) {
        for (const source of [old, next]) {
          const control = measure(source, source);
          if (control.length !== source.glyphs.length || source.glyphs.some((item, index) => {
            if (item.tag !== 'text' || item.lyric) return false;
            const check = control[index]; result.textControls++;
            return !check || heKeepsReferenceStyle(item.style) !== heKeepsReferenceStyle(check.style) || item.attributes !== check.attributes ||
              item.matrix.some((value, i) => Math.abs(value - check.matrix[i]) > 1e-5) ||
              !close(item.box[2], check.box[2]) || !close(item.box[3], check.box[3]) ||
              !close(item.screen[2], check.screen[2]) || !close(item.screen[3], check.screen[3]);
          })) { result.reason = 'text-control'; return result; }
        }
        const measured = measure(old, next);
        if (measured.some(item => !item)) { result.reason = 'text-reference'; return result; }
        reference = measured as Glyph[];
      }
      for (const [index, a] of old.glyphs.entries()) {
        const b = next.glyphs[index]; result.glyphs++;
        if (a.tag !== b.tag || a.name !== b.name || a.classes !== b.classes || a.style !== b.style ||
          a.attributes !== b.attributes || a.matrix.some((value, i) => Math.abs(value - b.matrix[i]) > 1e-5) ||
          a.staff !== b.staff || a.arc !== b.arc || a.lyric !== b.lyric) { result.reason = 'glyph-style'; return result; }
        if (a.staff || a.arc || a.lyric) continue;
        const expected = a.tag === 'text' ? reference?.[index] : a;
        if (!expected || !shapeEqual(a.path, b.path) || !close(expected.box[2], b.box[2]) || !close(expected.box[3], b.box[3]) ||
          !close(expected.screen[2] * (a.tag === 'text' ? 1 : ratio), b.screen[2]) ||
          !close(expected.screen[3] * (a.tag === 'text' ? 1 : ratio), b.screen[3])) { result.reason = 'glyph-shape'; return result; }
        if (a.tag === 'text') result.textControls++;
      }
      for (let left = 0; left < next.glyphs.length; left++) for (let right = left + 1; right < next.glyphs.length; right++) {
        const a = next.glyphs[left], b = next.glyphs[right];
        if ((a.staff || b.staff || a.arc || b.arc) && !a.lyric && !b.lyric) continue;
        result.pairs++;
        if (overlaps(a.box, b.box) && !overlaps(old.glyphs[left].box, old.glyphs[right].box)) {
          result.reason = `new-collision:${system}:${left}:${right}`; return result;
        }
      }
    }
    // The newly reclaimed left reservation must be demonstrably clear of all
    // non-lyric ink, even when the original already contained an overlap.
    const first = after.systems[0].glyphs, lyric = first.find(item => item.lyric);
    if (!lyric || first.some(item => !item.lyric && overlaps(lyric.box, item.box))) {
      result.reason = 'first-lyric-collision'; return result;
    }
    result.valid = true; result.reason = 'accepted'; return result;
  } catch { result.reason = 'native-ink-exception'; return result; }
  finally { holder?.remove(); }
}
