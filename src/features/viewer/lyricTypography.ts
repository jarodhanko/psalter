import type abcjs from 'abcjs';

const SIZE_EPSILON = 0.05;
const MATRIX_EPSILON = 1e-5;
const FONT_PROPERTIES = ['font-family', 'font-size', 'font-weight', 'font-style', 'font-stretch', 'font-kerning',
  'font-feature-settings', 'font-variation-settings', 'font-variant-ligatures', 'letter-spacing', 'word-spacing', 'text-rendering'];
const FONT_ATTRIBUTES = ['font-family', 'font-size', 'font-weight', 'font-style', 'textLength', 'lengthAdjust', 'text-anchor'];
type Size = { width: number; height: number; screenWidth: number; screenHeight: number };
type GeometryRow = { text: string; size?: Size };
type Note = { voice: number; element: abcjs.AbcElem };
type Style = { font: string[]; written: (string | null)[]; inline: string | null };
type Row = { text: string; style: Style; size?: Size; matrix?: number[] };
type Column = { style: Style; rows: Row[] };
type Frame = { viewBox: number[]; parentWidth: number };
type System = { svg: SVGSVGElement; wrapper: HTMLElement; frame: Frame };
type Entry = { note: number; key: string; system: number; text: number; column: Column };
type Snapshot = { systems: System[]; entries: Entry[]; noteCount: number };
export type TypographyMismatch = { field: string; note?: number; item?: number; before?: number | string;
  after?: number | string | null; expected?: number };
type Result = { valid: boolean; rows: number; nativeControls: number; compared: number; measurements: number;
  naturalWidthMeasurements?: number;
  mismatch?: TypographyMismatch };

function style(element: SVGElement): Style {
  const computed = getComputedStyle(element);
  return { font: FONT_PROPERTIES.map(property => computed.getPropertyValue(property)),
    written: FONT_ATTRIBUTES.map(name => element.getAttribute(name)), inline: element.getAttribute('style') };
}

function column(svg: SVGSVGElement, index: number, known?: readonly GeometryRow[]): Column | undefined {
  const text = svg.querySelectorAll<SVGTextElement>('text.abcjs-lyric[data-name="lyric"]')[index];
  if (!text || text.childNodes.length !== text.children.length || (known && known.length !== text.children.length)) return undefined;
  const rows: Row[] = [];
  for (const [row, raw] of [...text.children].entries()) {
    if (!(raw instanceof SVGGraphicsElement) || raw.tagName.toLowerCase() !== 'tspan' || raw.children.length) return undefined;
    const content = raw.textContent ?? '';
    if (known && known[row].text !== content) return undefined;
    const item: Row = { text: content, style: style(raw) };
    if (content.trim()) {
      if (known) item.size = known[row].size;
      else {
        const box = raw.getBBox(), rect = raw.getBoundingClientRect();
        item.size = { width: box.width, height: box.height, screenWidth: rect.width, screenHeight: rect.height };
      }
      const matrix = raw.getScreenCTM();
      if (!item.size || !matrix) return undefined;
      item.matrix = [matrix.a, matrix.b, matrix.c, matrix.d];
      if (!Object.values(item.size).every(value => Number.isFinite(value) && value > 0) || !item.matrix.every(Number.isFinite)) return undefined;
    } else if (known?.[row].size) return undefined;
    rows.push(item);
  }
  return { style: style(text), rows };
}

/** CSSOM may serialize an exact 1075.8125px used width as "1075.81px".
 * Reapplying that rounded number changes a responsive control's native CTM.
 * Read the used content width only in an untransformed, undecorated context
 * where it equals the DOM rectangle. Unknown contexts keep the old CSSOM
 * width and all existing typography checks; no proof tolerance is changed.
 */
export function readLyricReferenceWidth(wrapper: HTMLElement): number {
  const computed = getComputedStyle(wrapper);
  const fallback = Number.parseFloat(computed.width);
  try {
    if (!wrapper.isConnected || wrapper.getRootNode() !== wrapper.ownerDocument ||
      !Number.isFinite(fallback) || fallback <= 0) return fallback;
    const used = wrapper.getBoundingClientRect().width;
    // Bound this correction to one layout quantum, not an arbitrary resize.
    if (!Number.isFinite(used) || used <= 0 || Math.abs(used - fallback) > 1 / 64) return fallback;
    if (used === fallback) return fallback;
    if (['padding-left', 'padding-right', 'border-left-width', 'border-right-width']
      .some(property => Number.parseFloat(computed.getPropertyValue(property)) !== 0) ||
      ['overflow-x', 'overflow-y'].some(property => !['hidden', 'clip'].includes(computed.getPropertyValue(property)))) return fallback;
    for (let ancestor: HTMLElement | null = wrapper; ancestor; ancestor = ancestor.parentElement) {
      // An SVG viewport/foreignObject ancestor can scale HTML descendants
      // without reporting an ordinary CSS transform on the HTML elements.
      if (!(ancestor instanceof HTMLElement)) return fallback;
      const context = getComputedStyle(ancestor);
      if (['transform', 'translate', 'rotate', 'scale', 'perspective', 'offset-path']
        .some(property => context.getPropertyValue(property) !== 'none') ||
        !['1', 'normal'].includes(context.getPropertyValue('zoom'))) return fallback;
    }
    return used;
  } catch { return fallback; }
}

/** Capture each source-mapped column once, using the already-read live bounds.
 * Keep references to the exact SVGs/wrappers, not listener-free replacement DOM.
 * They are read-only templates while the caller retains its original nodes.
 */
export function captureLyricTypography(host: HTMLElement, notes: readonly Note[], geometry: { notes: { lyrics: GeometryRow[] }[] }): Snapshot | undefined {
  try {
    if (notes.length !== geometry.notes.length) return undefined;
    const systems: System[] = [];
    for (const svg of host.querySelectorAll('svg')) {
      const wrapper = svg.parentElement;
      if (!(wrapper instanceof HTMLElement) || wrapper.parentElement !== host || wrapper.childElementCount !== 1) return undefined;
      const viewBox = (svg.getAttribute('viewBox') ?? '').trim().split(/\s+/).map(Number);
      const parentWidth = readLyricReferenceWidth(wrapper);
      if (viewBox.length !== 4 || !viewBox.every(Number.isFinite) || viewBox[2] <= 0 || viewBox[3] <= 0 || !Number.isFinite(parentWidth) || parentWidth <= 0) return undefined;
      systems.push({ svg, wrapper, frame: { viewBox, parentWidth } });
    }
    const entries: Entry[] = [], seen = new Set<string>();
    for (const [note, { voice, element }] of notes.entries()) {
      const texts = element.abselem?.elemset.flatMap(root => [...root.querySelectorAll<SVGTextElement>('text.abcjs-lyric[data-name="lyric"]')]) ?? [];
      const lyrics = geometry.notes[note].lyrics;
      if (!texts.length && !lyrics.length) continue;
      if (texts.length !== 1 || !lyrics.length || !Number.isInteger(element.startChar) || !Number.isInteger(element.endChar)) return undefined;
      const system = systems.findIndex(system => system.svg === texts[0].ownerSVGElement);
      if (system < 0) return undefined;
      const text = [...systems[system].svg.querySelectorAll('text.abcjs-lyric[data-name="lyric"]')].indexOf(texts[0]);
      const identity = `${system}:${text}`;
      const captured = column(systems[system].svg, text, lyrics);
      if (!captured || seen.has(identity)) return undefined;
      seen.add(identity);
      entries.push({ note, key: `${voice}:${element.startChar}:${element.endChar}`, system, text, column: captured });
    }
    if (!entries.length || entries.length !== host.querySelectorAll('text.abcjs-lyric[data-name="lyric"]').length) return undefined;
    return { systems, entries, noteCount: notes.length };
  } catch { return undefined; }
}

/** SVG text uses screen-sized fonts in some engines, so its local getBBox is
 * not invariant under responsive scaling. Require valid native controls for
 * BOTH renders, then compare EVERY row with the unchanged original content
 * measured in its mapped candidate system's exact viewport/containing block.
 * No tolerance changes, live SVG edits, or assumed linear font scaling.
 */
export function verifyLyricTypography(host: HTMLElement, before: Snapshot, after: Snapshot,
  options: { preserveNaturalWidth?: boolean } = {}): Result {
  const result: Result = { valid: false, rows: before.entries.reduce((sum, entry) => sum + entry.column.rows.length, 0), nativeControls: 0, compared: 0, measurements: 0 };
  let holder: HTMLElement | undefined;
  const fail = (field: string, note?: number, item?: number, expected?: number, actual?: number) => {
    result.mismatch ??= { field, note, item, before: expected, after: actual, expected };
    return false;
  };
  const equalStyle = (a: Style, b: Style, stage: string, note: number, item?: number) =>
    JSON.stringify(a) === JSON.stringify(b) || fail(`lyric.${stage}.font`, note, item);
  const equalColumn = (a: Column, b: Column, stage: 'original-control' | 'candidate-control' | 'reference', note: number) => {
    if (!equalStyle(a.style, b.style, stage, note) || a.rows.length !== b.rows.length) return fail(`lyric.${stage}.rows`, note);
    for (let item = 0; item < a.rows.length; item++) {
      const expected = a.rows[item], actual = b.rows[item];
      if (expected.text !== actual.text) return fail(`lyric.${stage}.text`, note, item);
      if (!equalStyle(expected.style, actual.style, stage, note, item)) return false;
      if (!!expected.size !== !!actual.size) return fail(`lyric.${stage}.presence`, note, item);
      if (expected.size && actual.size) {
        for (const key of ['width', 'height', 'screenWidth', 'screenHeight'] as const) {
          if (Math.abs(expected.size[key] - actual.size[key]) > SIZE_EPSILON)
            return fail(`lyric.${stage}.${key}`, note, item, expected.size[key], actual.size[key]);
        }
        for (let coefficient = 0; coefficient < 4; coefficient++) {
          if (Math.abs(expected.matrix![coefficient] - actual.matrix![coefficient]) > MATRIX_EPSILON)
            return fail(`lyric.${stage}.matrix-${coefficient}`, note, item, expected.matrix![coefficient], actual.matrix![coefficient]);
        }
      }
      if (stage === 'reference') result.compared++;
      else result.nativeControls++;
    }
    return true;
  };
  const cache = new Map<string, Map<number, Column>>();
  const measure = (snapshot: Snapshot, side: string, system: number, target: Frame) => {
    const key = `${side}:${system}:${JSON.stringify(target)}`;
    if (cache.has(key)) return cache.get(key)!;
    const source = snapshot.systems[system], svg = source.svg.cloneNode(true) as SVGSVGElement;
    const wrapper = source.wrapper.cloneNode(false) as HTMLElement;
    wrapper.setAttribute('aria-hidden', 'true');
    wrapper.setAttribute('data-lyric-typography-reference', 'true');
    wrapper.style.cssText += 'visibility:hidden;pointer-events:none;';
    // Preserve the SVG's original sizing/style rules. Crossing the complete
    // target viewBox reproduces its intrinsic aspect ratio and screen CTM.
    svg.setAttribute('viewBox', target.viewBox.join(' '));
    wrapper.append(svg);
    holder = wrapper;
    try {
      host.append(wrapper);
      // A source-bound caller may retain the ordinary wrapper's used width.
      // At non-integer browser zoom, serializing and reapplying that width can
      // quantize it a second time. Measure this attached clone in normal flow
      // first; use it only if it reproduces the target width exactly. All
      // native font, glyph-size and CTM controls below remain mandatory. The
      // synchronous probe is removed before this function returns.
      if (options.preserveNaturalWidth && !source.wrapper.style.position && !source.wrapper.style.width &&
        readLyricReferenceWidth(wrapper) === target.parentWidth) {
        result.naturalWidthMeasurements = (result.naturalWidthMeasurements ?? 0) + 1;
      } else {
        wrapper.style.cssText += `position:absolute;left:0;top:0;width:${target.parentWidth}px;`;
      }
      result.measurements++;
      const measured = new Map<number, Column>();
      for (const entry of snapshot.entries.filter(entry => entry.system === system)) {
        const value = column(svg, entry.text);
        if (!value) throw new Error('Unavailable lyric reference metrics');
        measured.set(entry.text, value);
      }
      cache.set(key, measured);
      return measured;
    } finally { wrapper.remove(); holder = undefined; }
  };
  try {
    if (before.noteCount !== after.noteCount || before.entries.length !== after.entries.length || before.entries.some((entry, index) =>
      entry.note !== after.entries[index].note || entry.key !== after.entries[index].key)) {
      fail('lyric.mapping'); return result;
    }
    for (const [snapshot, side, stage] of [[before, 'before', 'original-control'], [after, 'after', 'candidate-control']] as const) {
      for (const entry of snapshot.entries) {
        const measured = measure(snapshot, side, entry.system, snapshot.systems[entry.system].frame).get(entry.text);
        if (!measured || !equalColumn(entry.column, measured, stage, entry.note)) return result;
      }
    }
    for (const [index, entry] of before.entries.entries()) {
      const target = after.entries[index];
      const expected = measure(before, 'before', entry.system, after.systems[target.system].frame).get(entry.text);
      if (!expected || !equalColumn(expected, target.column, 'reference', entry.note)) return result;
    }
    result.valid = result.compared === result.rows && result.nativeControls === result.rows * 2;
    return result;
  } catch { fail('lyric.measurement'); return result; }
  finally { holder?.remove(); }
}
