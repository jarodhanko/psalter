import type abcjs from 'abcjs';
import { glyph, shapeEqual, overlaps, heKeepsReferenceStyle, type Glyph } from './heKeepsSizeInk';
import { readLyricReferenceWidth } from './lyricTypography';
import { readHeKeepsDefaultGroups, readHeKeepsDefaultFragmentSource, heKeepsDefaultEventFragment, type HeKeepsDefaultFragmentGroups } from './heKeepsDefaultSource';

type Leaf = { key: string; system: number; event?: string; ink: Glyph; element: SVGGraphicsElement };
type System = { svg: SVGSVGElement; wrapper: HTMLElement; width: number; leaves: Leaf[] };
type Ink = { systems: System[]; leaves: Map<string, Leaf>; engine: string; order: string;
  fragmentSystems: number[][] | null; events: Map<string, { system: number; fragment: number; noteOrdinal: number }>;
  barPairs: Map<string, string> };
type Group = { voices: { children: { type: string; minspacing: number; abcelem: abcjs.AbcElem;
  children: Record<string, unknown>[]; elemset: SVGGraphicsElement[] }[] }[] };
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 0.05;
// Only ABCJS's display-location classes may change when the same source event
// moves. Voice, pitch, duration, styling and every other attribute stay signed.
const locations = (value: string | null) => value?.replace(/abcjs-(?:mm|l|m|n)\d+(?=\s|"|$)/g, 'abcjs-location')
  .replace(/abcjs-(start|end)-m\d+-n\d+(?=\s|"|$)/g, 'abcjs-$1-location');
const childKeys = ['type', 'c', 'dx', 'w', 'realWidth', 'pitch', 'pitch2', 'scalex', 'scaley', 'linewidth', 'klass', 'name'];

// ABCJS printStem uses this complete rectangle, bottom first. A matching box
// alone could hide a diagonal, extra subpath, or detached connector.
const nativeMatrix = (ink: Glyph) => ink.matrix.length === 4 &&
  ink.matrix.every((value, index) => Number.isFinite(value) && Math.abs(value - [1, 0, 0, 1][index]) <= 1e-5);
const verticalRectangle = (ink: Glyph, width = 0.6) => ink.tag === 'path' &&
  nativeMatrix(ink) &&
  close(ink.box[2], width) && ink.box[3] > 0 &&
  shapeEqual(ink.path, ['M', 0, 0, 'L', 0, -ink.box[3], 'L', ink.box[2], -ink.box[3], 'L', ink.box[2], 0, 'z']);

function staffEnds(rows: Glyph[]) {
  if (rows.length !== 5) return;
  const first = rows[0], last = rows[4], center = (row: Glyph) => row.box[1] + row.box[3] / 2;
  const screenCenter = (row: Glyph) => row.screen[1] + row.screen[3] / 2;
  const step = center(rows[1]) - center(first), screenStep = screenCenter(rows[1]) - screenCenter(first);
  if (!(step > 0 && screenStep > 0) || rows.some((row, index) => !row.staff || row.tag !== 'path' ||
    !row.box.every(Number.isFinite) || !row.screen.every(Number.isFinite) || row.box[2] <= 0 || row.box[3] <= 0 ||
    !nativeMatrix(row) ||
    !shapeEqual(row.path, ['M', 0, 0, 'L', row.box[2], 0, 'L', row.box[2], row.box[3], 'L', 0, row.box[3], 'z']) ||
    !close(row.box[0], first.box[0]) || !close(row.box[2], first.box[2]) || !close(row.box[3], first.box[3]) ||
    !close(center(row), center(first) + index * step) ||
    !close(screenCenter(row), screenCenter(first) + index * screenStep) ||
    !close(row.screen[0], first.screen[0]) || !close(row.screen[2], first.screen[2]))) return;
  return { left: first.box[0], right: first.box[0] + first.box[2], top: center(first), bottom: center(last),
    screenLeft: first.screen[0], screenTop: screenCenter(first), screenBottom: screenCenter(last) };
}

/** Endpoint proof for native source-paired bars and left staff connectors.
 * Their height follows their OWN staves, not the old system's lyric spacing.
 * This is also exercised by structural tests, which do not qualify native fit. */
export function readHeKeepsDefaultSpan(ink: Glyph, upperRows: Glyph[], lowerRows: Glyph[], upperBar?: Glyph) {
  const upper = staffEnds(upperRows), lower = staffEnds(lowerRows);
  // The final source bar has a separate native four-unit thick component.
  // It must still match its OWN upper component; no arbitrary width is allowed.
  const width = upperBar?.box[2] ?? 0.6;
  if (![0.6, 4].some(value => close(width, value)) || !upper || !lower || !verticalRectangle(ink, width) || !(lower.top > upper.bottom) ||
    !close(upper.left, lower.left) || !close(upper.right, lower.right)) return;
  // Every endpoint and rectangle must describe the same native SVG frame.
  // Derive scale from a long staff line, avoiding tiny-bar rounding error.
  const reference = upperRows[0], scale = reference.screen[2] / reference.box[2];
  const x = reference.screen[0] - reference.box[0] * scale, y = reference.screen[1] - reference.box[1] * scale;
  if (!(Number.isFinite(scale) && scale > 0) || [ink, ...upperRows, ...lowerRows, ...(upperBar ? [upperBar] : [])].some(row =>
    row.box.length !== 4 || row.screen.length !== 4 || !row.box.every(Number.isFinite) || !row.screen.every(Number.isFinite) ||
    row.box[2] <= 0 || row.box[3] <= 0 || row.screen[2] <= 0 || row.screen[3] <= 0 ||
    !close(row.screen[0], x + row.box[0] * scale) || !close(row.screen[1], y + row.box[1] * scale) ||
    !close(row.screen[2], row.box[2] * scale) || !close(row.screen[3], row.box[3] * scale))) return;
  const top = upperBar ? upper.bottom : upper.top, screenTop = upperBar ? upper.screenBottom : upper.screenTop;
  if (!close(ink.box[1], top) || !close(ink.box[1] + ink.box[3], lower.bottom) ||
    !close(ink.screen[1], screenTop) || !close(ink.screen[1] + ink.screen[3], lower.screenBottom)) return;
  if (upperBar) {
    if (!verticalRectangle(upperBar, width) || upperBar.name !== 'bar' || ink.name !== 'bar' ||
      !close(upperBar.box[1], upper.top) || !close(upperBar.box[1] + upperBar.box[3], upper.bottom) ||
      !close(upperBar.screen[1], upper.screenTop) || !close(upperBar.screen[1] + upperBar.screen[3], upper.screenBottom) ||
      !close(ink.box[0], upperBar.box[0]) || !close(ink.screen[0], upperBar.screen[0]) ||
      ink.box[0] < upper.left - 0.05 || ink.box[0] + ink.box[2] > upper.right + 0.05) return;
    return { edgeOffset: upper.right - ink.box[0] };
  }
  return close(ink.box[0], upper.left) && close(ink.screen[0], upper.screenLeft) ? { edgeOffset: 0 } : undefined;
}

function spanningPath(leaf: Leaf, ink: Ink) {
  const system = ink.systems[leaf.system], upperKey = ink.barPairs.get(leaf.key);
  const rows = (voice: number) => system.leaves.filter(item =>
    item.key.startsWith(`header:${leaf.system}:${voice}:staff:`)).map(item => item.ink);
  const upper = upperKey ? ink.leaves.get(upperKey) : undefined;
  if (upperKey && (!upper || upper.system !== leaf.system || !system.leaves.includes(upper))) return;
  const upperBar = upper?.ink;
  return readHeKeepsDefaultSpan(leaf.ink, rows(0), rows(2), upperBar);
}

/** Every leaf belongs to a canonical source event or a native staff/header.
 * The new continuation may repeat only an ordinary continuation header. */
export function readHeKeepsDefaultInk(host: HTMLElement, tune: abcjs.TuneObject,
  split: boolean | HeKeepsDefaultFragmentGroups): Ink | undefined {
  try {
    const fragmentSystems = split === false ? null : readHeKeepsDefaultGroups(split === true
      ? Array.from({ length: 17 }, (_, index) => [index]) : split);
    if (split !== false && !fragmentSystems) return;
    const svgs = [...host.querySelectorAll('svg')], groups = tune.engraver?.staffgroups as unknown as Group[] | undefined;
    if (!host.isConnected || svgs.length !== (fragmentSystems?.length ?? 16) || groups?.length !== svgs.length) return;
    const systems: System[] = [], leaves = new Map<string, Leaf>(), engine = new Map<string, unknown>();
    const events: Ink['events'] = new Map(), order = Array.from({ length: 4 }, () => [] as string[]);
    const bars = Array.from({ length: 4 }, () => [] as string[][]), barPairs = new Map<string, string>();
    let arcs = 0;
    for (const [system, svg] of svgs.entries()) {
      const wrapper = svg.parentElement;
      if (!(wrapper instanceof HTMLElement) || wrapper.parentElement !== host || wrapper.childElementCount !== 1 ||
        svg.querySelector('image,use,line,ellipse,circle,rect,polygon,polyline,foreignObject')) return;
      const width = readLyricReferenceWidth(wrapper);
      if (!Number.isFinite(width) || width <= 0) return;
      const owned = new Map<SVGGraphicsElement, string>();
      if (groups[system].voices.length !== 4) return;
      const notes = [0, 0, 0, 0];
      for (const [voice, lane] of groups[system].voices.entries()) for (const absolute of lane.children) {
        const event = absolute.abcelem;
        if (!['note', 'bar', 'tempo'].includes(event.el_type)) continue;
        if (!Number.isInteger(event.startChar) || !Number.isInteger(event.endChar)) return;
        const key = `${voice}:${event.el_type}:${event.startChar}:${event.endChar}`;
        if (engine.has(key)) return;
        if (event.el_type === 'note') notes[voice]++;
        events.set(key, { system, noteOrdinal: notes[voice],
          fragment: heKeepsDefaultEventFragment(system, notes[voice], event.el_type) });
        order[voice].push(key);
        engine.set(key, [absolute.type, absolute.minspacing, absolute.children.map(child =>
          // Native lyric/tempo vertical placement may change with the new
          // system. This is not a sounding pitch. Their full DOM shape,
          // typography and collision checks below remain mandatory.
          childKeys.filter(name => name !== 'pitch' || !['lyric', 'TempoElement'].includes(String(child.type)))
            .map(name => [name, child[name]]))]);
        const sourceLeaves = new Set<SVGGraphicsElement>();
        for (const root of absolute.elemset ?? []) {
          if (!svg.contains(root)) return;
          if (root.matches('path,text')) sourceLeaves.add(root);
          for (const leaf of root.querySelectorAll<SVGGraphicsElement>('path,text')) sourceLeaves.add(leaf);
        }
        // ABCJS draws this tempo group outside AbsoluteElement.elemset.
        // Bind its only permitted source and exact three-leaf native shape.
        if (key === '0:tempo:422:433' && system === 0 && !sourceLeaves.size) {
          const tempos = svg.querySelectorAll('g.abcjs-tempo[data-name="tempo"]');
          const children = [...(tempos[0]?.querySelectorAll<SVGGraphicsElement>('path,text') ?? [])];
          if (tempos.length !== 1 || children.length !== 3 ||
            children.map(child => child.getAttribute('data-name')).join(',') !== 'noteheads.quarter,stem,beats' ||
            children[2].textContent !== '= 100') return;
          children.forEach(child => sourceLeaves.add(child));
        }
        for (const [index, leaf] of [...sourceLeaves].entries()) {
          if (owned.has(leaf)) return;
          owned.set(leaf, `${key}:${index}`);
        }
        if (event.el_type === 'bar') bars[voice].push([...sourceLeaves].map((_, index) => `${key}:${index}`));
      }
      const current: System = { svg, wrapper, width, leaves: [] };
      for (const element of svg.querySelectorAll<SVGGraphicsElement>('path,text')) {
        const ink = glyph(element, svg);
        if (!ink) return;
        let key = owned.get(element);
        if (!key) {
          const staff = element.closest('g.abcjs-staff'), header = element.closest('g.abcjs-staff-extra');
          if (staff || header) {
            const root = (staff ?? header)!;
            const voice = root.getAttribute('class')?.match(/\babcjs-v(\d+)\b/)?.[1];
            const type = staff ? 'staff' : root.getAttribute('data-name');
            if (!['0', '2'].includes(voice ?? '') || !['staff', 'staff-extra clef', 'staff-extra key-signature', 'staff-extra time-signature'].includes(type ?? '')) return;
            key = `header:${system}:${voice}:${type}:${[...root.querySelectorAll('path,text')].indexOf(element)}`;
          } else if (ink.arc) {
            key = `arc:${arcs++}`;
          } else {
            // The sole native left staff connector has no source event. It
            // remains a narrow vertical path and is compared to its control.
            if (element.tagName !== 'path' || element.parentElement?.getAttribute('class') !== `abcjs-staff-wrapper abcjs-l${system}` ||
              element.attributes.length !== 3 || element.getAttribute('stroke') !== 'none' || element.getAttribute('fill') !== 'currentColor' ||
              !close(ink.box[0], 15) || !close(ink.box[2], 0.6) || ink.box[3] <= 0) return;
            key = `connector:${system}`;
          }
        }
        if (leaves.has(key)) return;
        const leaf = { key, system, event: owned.has(element) ? key.slice(0, key.lastIndexOf(':')) : undefined, ink, element };
        leaves.set(key, leaf); current.leaves.push(leaf);
      }
      if (!current.leaves.length || !leaves.has(`connector:${system}`)) return;
      systems.push(current);
    }
    if (arcs !== 2 || bars.some(voice => voice.length !== 16) || bars[1].some(bar => bar.length) || bars[3].some(bar => bar.length)) return;
    for (let bar = 0; bar < 16; bar++) {
      const upper = bars[0][bar], lower = bars[2][bar], count = bar === 15 ? 2 : 1;
      if (upper.length !== count || lower.length !== count) return;
      lower.forEach((key, index) => barPairs.set(key, upper[index]));
    }
    return { systems, leaves, fragmentSystems: fragmentSystems ?? null, events, barPairs, order: JSON.stringify(order),
      engine: JSON.stringify([...engine].sort(([a], [b]) => a.localeCompare(b))) };
  } catch { return; }
}

const scaffold = (key: string) => /^(header|connector):\d+(?=:|$)/.test(key);
const scaffoldSystem = (group: readonly number[]) => group[0] === 0 ? 0 : Math.max(1, readHeKeepsDefaultFragmentSource(group[0]));
const sameStyle = (a: Glyph, b: Glyph) => a.tag === b.tag && a.name === b.name &&
  locations(a.classes) === locations(b.classes) && locations(a.attributes) === locations(b.attributes) && a.style === b.style &&
  a.matrix.length === b.matrix.length && a.matrix.every((value, index) => Number.isFinite(value) &&
    Number.isFinite(b.matrix[index]) && Math.abs(value - b.matrix[index]) <= 1e-5) &&
  a.staff === b.staff && a.arc === b.arc && a.lyric === b.lyric;

/** Compare all source-owned paths one-to-one across only the audited fragment
 * groups. Only proven repeated continuation scaffolds may disappear. Native
 * bars retain their own source-paired upper path, including internal bars. */
export function verifyHeKeepsDefaultInk(host: HTMLElement, before: Ink, after: Ink) {
  const result = { valid: false, glyphs: 0, pairs: 0, reason: 'engine-ink' };
  const prior = new Map<Leaf, Leaf>();
  let holder: HTMLElement | undefined;
  const reference = (leaf: Leaf, target: System) => {
    const source = before.systems[leaf.system], wrapper = source.wrapper.cloneNode(false) as HTMLElement;
    const svg = source.svg.cloneNode(true) as SVGSVGElement;
    wrapper.setAttribute('aria-hidden', 'true'); wrapper.style.cssText += 'visibility:hidden;pointer-events:none;';
    svg.setAttribute('viewBox', target.svg.getAttribute('viewBox')!); wrapper.append(svg); holder = wrapper;
    try {
      host.append(wrapper);
      if (!close(readLyricReferenceWidth(wrapper), target.width)) return;
      const index = [...source.svg.querySelectorAll('path,text')].indexOf(leaf.element);
      const element = svg.querySelectorAll<SVGGraphicsElement>('path,text')[index];
      return element && glyph(element, svg);
    } finally { wrapper.remove(); holder = undefined; }
  };
  try {
    const groups = readHeKeepsDefaultGroups(after.fragmentSystems);
    if (before.systems.length !== 16 || before.fragmentSystems !== null || !groups || after.systems.length !== groups.length ||
      before.engine !== after.engine || before.order !== after.order ||
      JSON.stringify([...before.barPairs]) !== JSON.stringify([...after.barPairs])) return result;
    // Keep the DOM inventory, event order, and grouping map mutually bound.
    // A merged pair is not permission to move a third source event into it.
    for (const ink of [before, after]) {
      const seen = new Set<Leaf>();
      for (const [index, system] of ink.systems.entries()) for (const leaf of system.leaves) {
        if (seen.has(leaf) || leaf.system !== index || ink.leaves.get(leaf.key) !== leaf ||
          (leaf.event !== undefined && (leaf.key.slice(0, leaf.key.lastIndexOf(':')) !== leaf.event ||
            ink.events.get(leaf.event)?.system !== index))) { result.reason = 'glyph-inventory'; return result; }
        seen.add(leaf);
      }
      if (seen.size !== ink.leaves.size) { result.reason = 'glyph-inventory'; return result; }
      for (const [index, system] of ink.systems.entries()) {
        const connector = ink.leaves.get(`connector:${index}`);
        if (!connector || !system.leaves.includes(connector) || !spanningPath(connector, ink)) {
          result.reason = 'staff-span'; return result;
        }
      }
      const previous = new Map<number, number>();
      for (const [lowerKey, upperKey] of ink.barPairs) {
        const lower = ink.leaves.get(lowerKey), upper = ink.leaves.get(upperKey);
        if (!lower || !upper || !lower.event?.startsWith('2:bar:') || !upper.event?.startsWith('0:bar:') ||
          !spanningPath(lower, ink) || (previous.has(upper.system) && upper.ink.box[0] <= previous.get(upper.system)! + 0.05)) {
          result.reason = 'staff-span'; return result;
        }
        previous.set(upper.system, upper.ink.box[0]);
      }
    }
    if (before.events.size !== after.events.size) return result;
    for (const [key, next] of after.events) {
      const old = before.events.get(key);
      const fragment = old && heKeepsDefaultEventFragment(old.system, old.noteOrdinal, key.split(':')[1], groups);
      if (!old || fragment === undefined || !groups[next.system]?.includes(fragment)) { result.reason = 'source-system'; return result; }
    }
    for (const next of after.leaves.values()) {
      const mappedSystem = scaffoldSystem(groups[next.system]);
      const key = next.key.replace(/^(header|connector):\d+/, `$1:${mappedSystem}`);
      const old = before.leaves.get(key);
      if (!old || next.event !== old.event) { result.reason = 'unmapped-glyph'; return result; }
      if (!scaffold(next.key) && !next.event && (!next.ink.arc || !groups[next.system].includes(old.system + 1))) {
        result.reason = 'source-system'; return result;
      }
      prior.set(next, old); result.glyphs++;
      const a = old.ink, b = next.ink, from = before.systems[old.system], to = after.systems[next.system];
      const ratio = from.svg.viewBox.baseVal.width / to.svg.viewBox.baseVal.width;
      if (!(ratio > 1) || !close(from.width, to.width) || !sameStyle(a, b)) { result.reason = 'glyph-style'; return result; }
      // Staff length, native slurs and every lyric row have independent proofs.
      if (a.staff || a.arc || a.lyric) continue;
      if (after.barPairs.has(next.key) || next.key.startsWith('connector:')) {
        // An old line-ending bar may now be internal. Its source partner and
        // both staff endpoints, not its old distance from the right edge,
        // establish the native path. Path topology and thickness stay exact.
        const originalSpan = spanningPath(old, before), candidateSpan = spanningPath(next, after);
        if (!originalSpan || !candidateSpan ||
          !close(a.box[2], b.box[2]) || !close(a.screen[2] * ratio, b.screen[2])) {
          result.reason = 'staff-span'; return result;
        }
        continue;
      }
      const control = a.tag === 'text' ? reference(old, to) : a;
      if (!control || (a.tag === 'text' && heKeepsReferenceStyle(a.style) !== heKeepsReferenceStyle(control.style)) ||
        !shapeEqual(a.path, b.path) || !close(control.box[2], b.box[2]) || !close(control.box[3], b.box[3]) ||
        !close(control.screen[2] * (a.tag === 'text' ? 1 : ratio), b.screen[2]) ||
        !close(control.screen[3] * (a.tag === 'text' ? 1 : ratio), b.screen[3])) { result.reason = 'glyph-shape'; return result; }
    }
    const uses = new Map<Leaf, number>();
    for (const old of prior.values()) uses.set(old, (uses.get(old) ?? 0) + 1);
    for (const old of before.leaves.values()) {
      const count = uses.get(old) ?? 0;
      if (!scaffold(old.key)) {
        if (count !== 1) { result.reason = 'missing-glyph'; return result; }
        continue;
      }
      if (count) continue;
      // The omitted original must be the SECOND whole-bar fragment of an
      // admitted pair, not a source glyph or an opening time signature.
      const target = groups.findIndex(group => group.length === 2 && group[1] === old.system + 1);
      const replacementSystem = target < 0 ? -1 : scaffoldSystem(groups[target]);
      const repeated = before.leaves.get(old.key.replace(/^(header|connector):\d+/, `$1:${replacementSystem}`));
      if (old.system === 0 || target < 0 || !/^(?:connector:\d+|header:\d+:[02]:(?:staff|staff-extra clef|staff-extra key-signature):\d+)$/.test(old.key) ||
        !repeated || !sameStyle(old.ink, repeated.ink) || !close(old.ink.box[3], repeated.ink.box[3]) && !old.key.startsWith('connector:') ||
        (!old.ink.staff && !old.key.startsWith('connector:') && (!shapeEqual(old.ink.path, repeated.ink.path) ||
          !close(old.ink.box[2], repeated.ink.box[2])))) { result.reason = 'missing-glyph'; return result; }
    }
    for (const system of after.systems) for (let i = 0; i < system.leaves.length; i++) for (let j = i + 1; j < system.leaves.length; j++) {
      const a = system.leaves[i], b = system.leaves[j], x = prior.get(a)!, y = prior.get(b)!;
      if ((a.ink.staff || b.ink.staff || a.ink.arc || b.ink.arc) && !a.ink.lyric && !b.ink.lyric) continue;
      result.pairs++;
      if (overlaps(a.ink.box, b.ink.box) && (x.system !== y.system || !overlaps(x.ink.box, y.ink.box))) {
        result.reason = 'new-collision'; return result;
      }
    }
    result.valid = true; result.reason = 'accepted'; return result;
  } catch { result.reason = 'native-ink-exception'; return result; }
  finally { holder?.remove(); }
}
