/** Exact Roll Call grouping=1 interior transaction; one shared source graph. */
import abcjs from 'abcjs';
import type EngraverController from 'abcjs/src/write/engraver-controller';
import { hasRollGroupingSource, readRollGroupingIdentity, rollGroupingWrappedNotation, rollGroupingStanza, ROLL_GROUPING_ID } from './rollGroupingWrap';
import type { RollGroupingBaseline } from './rollGroupingWrap';
import { readScreenScoreGeometry, readScreenElementSize } from './isolatedChordWrap';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';

const ATTRIBUTE = 'data-roll-interior-reflow';
const EPSILON = 0.05;
const ENGINE = 'abcjs-basic v6.7.0';
type Tune = abcjs.TuneObject;
type Event = abcjs.AbcElem;
type Data = Pick<Tune, 'lines' | 'formatting' | 'media' | 'metaText' | 'metaTextInfo' | 'version'>;
type Score = NonNullable<ReturnType<typeof readRollGroupingIdentity>>;
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
type Stats = { nodes: number; depth: number };
type View = [number, number, Event['lyric']?];
export type RollInteriorFrame = { profile: number; overlay: View[]; parser: string; signature: string; cuts?: Cut[] };
export type RollInteriorSession = { graph?: Data; view?: RollInteriorFrame; id: number; failure?: string };
type Cut = { unit: number; beat: number; count: number };
// Independent complete clean-view witnesses and the only reviewed cut per unit.
const PROFILES = [
  { data: [72850, 0x6d7a5bfb684116e4n] as const, natural: 1085, cuts: [[1,2],[2,2],[3,3],[5,2],[7,2],[15,2]] },
  { data: [72851, 0x17c028de07928f7an] as const, natural: 1083, cuts: [[1,2],[2,2],[3,2],[5,2],[6,2],[7,2],[15,2]] },
  { data: [72836, 0x438a3a888b8fb126n] as const, natural: 1071, cuts: [[1,2],[3,2],[5,2],[6,2],[7,2],[15,2]] },
];
const SINGLETONS = JSON.stringify(Array.from({ length: 17 }, (_, unit) => [unit]));
const voices = (tune: Pick<Tune, 'lines'>, line: number) => tune.lines[line].staff!.flatMap(staff => staff.voices!);
const key = (event: Event) => `${event.el_type}:${event.startChar}:${event.endChar}`;
const close = (a: number, b: number) => Math.abs(a - b) <= EPSILON;
export function clearRollInteriorReflow(host: HTMLElement) { host.removeAttribute(ATTRIBUTE); }
let ownerSequence = 0;
export function newRollInteriorSession(): RollInteriorSession { return { id: ++ownerSequence }; }
export function releaseRollInteriorFrame(owner?: RollInteriorSession) { if (owner) delete owner.view; }
export function disposeRollInteriorSession(owner: RollInteriorSession) { releaseRollInteriorFrame(owner); delete owner.graph; delete owner.failure; }
function matches(text: string, length: number, witness: bigint) {
  if (text.length !== length) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++) hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === witness;
}
/** All retained preparation roots, including metadata and the current lease.
 * No index, history, native Tune, controller or callback lives on this owner. */
function inventory(owner: RollInteriorSession, working?: unknown): Stats {
  const seen = new Set<object>(), active = new Set<object>(); const result = { nodes: 0, depth: 0 };
  const visit = (value: unknown, depth: number) => {
    result.nodes++; result.depth = Math.max(result.depth, depth);
    if (result.nodes > 20000 || depth > 32) throw new Error('retained-preparation-cap');
    if (value === null || value === undefined || ['string','number','boolean','bigint'].includes(typeof value)) return;
    if (typeof value !== 'object' || (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype)) throw new Error('retained-non-data');
    if (active.has(value)) throw new Error('retained-cycle');
    if (seen.has(value)) return; // Shared references cost one, never hide another reachable root.
    seen.add(value); active.add(value);
    Object.values(value).forEach(child => visit(child, depth + 1));
    active.delete(value);
  };
  visit({ owner, profiles: PROFILES, working }, 0);
  return result;
}
function copyData<T>(value: T, freeze = false, budget = 20000, omitView = false): T {
  const seen = new Set<object>(); let nodes = 0;
  const copy = (item: unknown, depth = 0): unknown => {
    if (++nodes > budget || depth > 32) throw new Error('snapshot-cap');
    if (item === null || item === undefined || ['string', 'number', 'boolean'].includes(typeof item)) return item;
    if (typeof item === 'object') { if (seen.has(item!)) throw new Error('snapshot-cycle'); seen.add(item!); }
    if (Array.isArray(item)) { const result = item.map(child => copy(child, depth + 1)); seen.delete(item); return freeze ? Object.freeze(result) : result; }
    if (typeof item !== 'object' || Object.getPrototypeOf(item) !== Object.prototype) throw new Error('snapshot-non-data');
    const event = item as Event;
    const result = Object.fromEntries(Object.entries(item).filter(([name]) => !(omitView && ['note','bar','tempo'].includes(event.el_type) &&
      ['startChar','endChar','lyric'].includes(name))).map(([name, child]) => [name, copy(child, depth + 1)]));
    seen.delete(item);
    return freeze ? Object.freeze(result) : result;
  };
  return copy(value) as T;
}
const dataOf = (tune: Tune): Data => ({ lines: tune.lines, formatting: tune.formatting, media: tune.media,
  metaText: tune.metaText, metaTextInfo: tune.metaTextInfo, version: tune.version });
const sourceEvents = (data: Pick<Tune, 'lines'>) => data.lines.flatMap(line => line.staff!.flatMap(staff =>
  staff.voices!.flatMap(voice => voice.filter(event => event.el_type !== 'stem') as Event[])));
export function captureRollInteriorFrame(owner: RollInteriorSession, tune: Tune, parser: string, prepared: string) {
  releaseRollInteriorFrame(owner);
  const profile = rollGroupingStanza(prepared);
  if (abcjs.signature !== ENGINE || !profile || rollGroupingWrappedNotation(prepared) !== parser || owner.failure) return;
  const score = readRollGroupingIdentity(tune, parser);
  if (!score || JSON.stringify(score.systems) !== SINGLETONS) return;
  const data = dataOf(tune), witness = PROFILES[profile - 1].data;
  // An earlier automatic-wrap callback can contain cyclic native caches.
  // Serialization failure or mismatch is unqualified, not a persistent failure.
  try { if (!matches(JSON.stringify(data), witness[0], witness[1])) return; } catch { return; }
  try {
    if (!owner.graph) {
      owner.graph = copyData(data, true, 20000 - inventory(owner).nodes, true);
      if (!matches(JSON.stringify(owner.graph), 52928, 0x67ecd9e972e8e053n)) throw new Error('shared-skeleton-witness');
    }
    const overlay = sourceEvents(data).map(event => (event.lyric === undefined ? [event.startChar!, event.endChar!] :
      [event.startChar!, event.endChar!, copyData(event.lyric)]) as View);
    if (overlay.length !== 447) throw new Error('source-view-count');
    owner.view = { profile, overlay, parser, signature: score.signature };
    inventory(owner, { data, overlay });
    inventory(owner);
  } catch (error) { releaseRollInteriorFrame(owner); owner.failure = error instanceof Error ? error.message : 'snapshot'; }
}

type Runtime = { Parse: new () => { getTune(): Tune }; EngraverController: {
  new(host: HTMLElement, options: abcjs.AbcVisualParams): EngraverController & { engraveABC(tune: Tune, number: number, offset: number): void };
} };
function runtime(): Runtime | undefined {
  const engine = (abcjs as unknown as { test?: Runtime }).test;
  return abcjs.signature === ENGINE && typeof engine?.Parse === 'function' && typeof engine.EngraverController === 'function' ? engine : undefined;
}
function materialize(owner: RollInteriorSession, frame: RollInteriorFrame, engine: Runtime) {
  // Copy one working graph; no intermediate complete view or planned graph.
  const data = copyData(owner.graph!, false, 20000 - inventory(owner).nodes);
  // This reference list is temporary and explicitly included while hydrating.
  (() => {
    const events = sourceEvents(data);
    events.forEach((event, index) => {
      const view = frame.overlay[index];
      event.startChar = view[0]; event.endChar = view[1];
      if (view.length === 3) event.lyric = copyData(view[2], false, 20000 - inventory(owner, { data, events }).nodes);
    });
    inventory(owner, { data, events });
  })();
  inventory(owner, data);
  fragment(data, frame.cuts!, owner);
  const retained = inventory(owner, data);
  const tune = new engine.Parse().getTune();
  Object.assign(tune, data);
  return { tune, retained };
}
function allEvents(tune: Pick<Tune, 'lines'>, lane: number) {
  return tune.lines.flatMap((_line, line) => voices(tune, line)[lane].filter(event => event.el_type !== 'stem') as Event[]);
}
function timeline(tune: Tune, parser: string) {
  const seen = new Set<string>(), signatures: unknown[] = [];
  for (let lane = 0; lane < 4; lane++) {
    let ordinal = 0, onset = 0, unit = 0;
    const events: unknown[] = [];
    for (const event of allEvents(tune, lane)) {
      const id = `${lane}:${key(event)}`;
      if (seen.has(id) || !Number.isInteger(event.startChar) || !Number.isInteger(event.endChar) ||
        event.startChar! < 0 || event.endChar! <= event.startChar! || event.endChar! > parser.length) return;
      seen.add(id);
      events.push([id, unit, ordinal, onset, parser.slice(event.startChar, event.endChar), event.duration,
        event.pitches?.map(p => [p.pitch, p.name, p.accidental, p.verticalPos, p.startTie, p.endTie, p.startSlur, p.endSlur]),
        event.lyric, event.rest, event.startBeam, event.endBeam]);
      if (event.el_type === 'note') { if (typeof event.duration !== 'number') return; ordinal++; onset += event.duration * 4; }
      else if (event.el_type === 'bar') unit++;
      else if (event.el_type !== 'tempo') return;
    }
    if (unit !== 17 || onset !== 64 || ordinal !== [90, 90, 99, 99][lane]) return;
    signatures.push(events);
  }
  return JSON.stringify(signatures);
}
function cleanPlan(source: Tune, frame: RollInteriorFrame) {
  const natural = PROFILES[frame.profile - 1].natural;
  const soprano = allEvents(source, 0).filter(event => event.el_type === 'note');
  for (const cut of frame.cuts!) for (let lane = 0; lane < 4; lane++) {
    const raw = voices(source, cut.unit)[lane], notes = raw.filter(event => event.el_type === 'note') as Event[];
    if (raw.some(event => !['stem','note','bar'].includes(event.el_type)) || raw.filter(event => event.el_type === 'bar').length !== 1 ||
      raw.at(-1)?.el_type !== 'bar' || cut.count < 2 || notes.length - cut.count < 2) return false;
    let duration = 0;
    for (const [index,note] of notes.entries()) {
      if (note.rest || note.pitches?.length !== 1 || note.gracenotes?.length || note.decoration?.length || note.chord?.length ||
        note.startTriplet || note.endTriplet || note.tripletMultiplier || note.startSlur || note.endSlur || note.startBeam || note.endBeam ||
        note.pitches.some(p => p.startTie || p.endTie || p.startSlur || p.endSlur)) return false;
      const pitch = note.pitches[0];
      if (pitch.accidental && !(cut.unit === 3 && lane === 1 && index === 7 && note.startChar === natural && note.endChar === natural + 5 &&
        frame.parser.slice(natural,natural + 5).trim() === '=D/4' && note.duration === 0.0625 && pitch.pitch === 1 && pitch.name === '=D' && pitch.accidental === 'natural')) return false;
      if (lane === 0) {
        const ordinal = soprano.indexOf(note), rows = note.lyric;
        if (rows?.length !== (ordinal >= 41 && ordinal <= 51 ? 3 : 1) || rows.some(row => Object.keys(row).length !== 2) ||
          !rows[0].syllable.trim() || /[_*]/.test(rows[0].syllable) || rows.slice(1).some(row => row.syllable !== '' || row.divider !== ' ')) return false;
      } else if (note.lyric !== undefined) return false;
      if (typeof note.duration !== 'number') return false;
      duration += note.duration;
      if (index + 1 === cut.count && duration !== cut.beat / 4) return false;
    }
    if (duration !== 1 || (lane === 0 && notes[cut.count - 1].lyric![0].divider !== ' ')) return false;
  }
  const shared = soprano.filter(event => event.lyric?.length === 3);
  return JSON.stringify(soprano.slice(36,43).map(event => event.lyric?.length)) === '[1,1,1,1,1,3,3]' &&
    shared.length === 11 && shared.every((event,index) => event === soprano[41 + index] &&
      event.lyric!.slice(1).every(row => Object.keys(row).length === 2 && row.syllable === '' && row.divider === ' '));
}
function context(line: abcjs.TuneLine) {
  return JSON.stringify(line.staff?.map(staff => {
    const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
    return [staff.clef && [staff.clef.type, staff.clef.verticalPos, staff.clef.clefPos, staff.clef.transpose, staff.clef.stafflines, staff.clef.staffscale],
      staff.key && [staff.key.root, staff.key.acc, staff.key.mode, staff.key.accidentals?.map(a => [a.acc, a.note, a.verticalPos])],
      staff.meter && [staff.meter.type, staff.meter.value], staff.voices?.length, group.brace, group.bracket, group.connectBarLines];
  }));
}
function fragment(tune: Data, cuts: Cut[], owner: RollInteriorSession) {
  // Descending in-place insertion keeps all pending suffix topology reachable
  // from the audited working root; there is no parallel growing line graph.
  for (let unit = 16; unit >= 0; unit--) {
    const cut = cuts.find(cut => cut.unit === unit);
    if (!cut) continue;
    const line = tune.lines[unit];
    const suffix: abcjs.TuneLine = copyData({ ...line, staff: line.staff!.map(staff => ({ ...staff, voices: [] })) },
      false, 20000 - inventory(owner, tune).nodes);
    for (const [staffIndex,staff] of line.staff!.entries()) {
      const suffixStaff = suffix.staff![staffIndex];
      for (const voice of staff.voices!) {
        const notes: abcjs.VoiceItem[] = voice.filter(event => event.el_type === 'note').slice(0, cut.count);
        const prefix = voice.filter(event => event.el_type === 'stem' || notes.includes(event));
        const tail = voice.filter(event => !notes.includes(event));
        inventory(owner, { data: tune, suffix, notes, prefix, tail });
        voice.splice(0, voice.length, ...prefix);
        suffixStaff.voices!.push(tail);
      }
    }
    tune.lines.splice(unit + 1, 0, suffix);
    inventory(owner, tune);
  }
}
function fragmentProof(tune: Tune, frame: RollInteriorFrame, before: Score, originalTimeline: string, source: Tune) {
  if (tune.lines.length !== 17 + frame.cuts!.length) return;
  const lines: abcjs.TuneLine[] = [];
  let display = 0;
  for (let unit = 0; unit < 17; unit++) {
    const first = tune.lines[display++], cut = frame.cuts!.find(cut => cut.unit === unit);
    if (!first || context(first) !== context(source.lines[unit])) return;
    const sameStems = (line: abcjs.TuneLine) => line.staff!.flatMap(staff => staff.voices!).every((voice, lane) =>
      JSON.stringify(voice.filter(event => event.el_type === 'stem')) === JSON.stringify(voices(source, unit)[lane].filter(event => event.el_type === 'stem')));
    if (!sameStems(first)) return;
    const merged = { ...first, staff: first.staff!.map(staff => ({ ...staff, voices: staff.voices!.map(voice => [...voice]) })) };
    if (cut) {
      const second = tune.lines[display++];
      if (!second || context(second) !== context(source.lines[unit]) || !sameStems(second)) return;
      for (let lane = 0; lane < 4; lane++) {
        const prefix = voices(tune, display - 2)[lane], suffix = voices(tune, display - 1)[lane];
        const original = voices(source, unit)[lane];
        const expected = original.filter(event => event.el_type === 'note').slice(0, cut.count).map(event => key(event as Event));
        if (prefix.some(event => !['stem', 'note'].includes(event.el_type)) ||
          JSON.stringify(prefix.filter(event => event.el_type !== 'stem').map(event => key(event as Event))) !== JSON.stringify(expected) ||
          suffix.filter(event => event.el_type === 'bar').length !== 1 || suffix.at(-1)?.el_type !== 'bar') return;
        merged.staff![Math.floor(lane / 2)].voices![lane % 2].push(...suffix.filter(event => event.el_type !== 'stem'));
      }
    }
    lines.push(merged);
  }
  const whole = readRollGroupingIdentity({ ...tune, lines }, frame.parser);
  const timed = timeline(tune, frame.parser);
  if (!whole || whole.signature !== before.signature || JSON.stringify(whole.systems) !== SINGLETONS ||
    timed !== originalTimeline || readRollGroupingIdentity(tune, frame.parser)) return;
  // This is only a geometry view: no fragment is presented as a new source bar.
  return { ...whole, systems: tune.lines.map((_line, line) => [line]), notes: [0, 1, 2, 3].flatMap(lane =>
    allEvents(tune, lane).filter(event => event.el_type === 'note').map(element => ({ voice: lane, element }))) };
}

type NativeChild = { type?: string; c?: string | null; name?: string; graphelem?: SVGGraphicsElement;
  height?: number; lyricHeightBelow?: number; lyricHeightAbove?: number; scalex?: number; scaley?: number };
type NativeOwner = { abcelem?: Event; children?: NativeChild[]; elemset?: SVGElement[]; x: number; w: number; extraw: number };
function visible(element: SVGGraphicsElement, host: HTMLElement) {
  if (!host.contains(element)) return false;
  for (let node: Element | null = element; node && node !== host; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.display === 'none' || style.visibility !== 'visible' || Number(style.opacity) !== 1) return false;
  }
  const style = getComputedStyle(element);
  return style.fill !== 'none' && Number(style.fillOpacity) > 0;
}
/** Native note -> AbsoluteElement -> RelativeElement -> exact SVG path edge.
 * This is only the suffix-owned =D/4 natural, never accidental replay. */
function natural(host: HTMLElement, tune: Tune, frame: RollInteriorFrame) {
  const start = PROFILES[frame.profile - 1].natural;
  const notes = allEvents(tune, 1).filter(event => event.el_type === 'note');
  const event = notes[24];
  if (event?.startChar !== start || event.endChar !== start + 5 || event.duration !== 0.0625 ||
    event.pitches?.length !== 1 || event.pitches[0].pitch !== 1 || event.pitches[0].name !== '=D' || event.pitches[0].accidental !== 'natural') return;
  const owner = event.abselem as unknown as NativeOwner | undefined;
  const children = owner?.children?.filter(child => child.c === 'accidentals.nat');
  const glyph = children?.[0]?.graphelem;
  const owned = owner?.elemset?.flatMap(root => [...root.querySelectorAll<SVGGraphicsElement>('[data-name="accidentals.nat"]')]);
  if (owner?.abcelem !== event || children?.length !== 1 || !glyph || owned?.length !== 1 || owned[0] !== glyph ||
    host.querySelectorAll('[data-name="accidentals.nat"]').length !== 1 || !visible(glyph, host) ||
    glyph.getAttribute('data-name') !== 'accidentals.nat' || children[0].scalex !== 1 || children[0].scaley !== 1) return;
  const system = tune.lines.findIndex((_line, index) => voices(tune, index)[1].includes(event as abcjs.VoiceItem));
  if (system < 0 || glyph.ownerSVGElement !== host.querySelectorAll('svg')[system]) return;
  const size = readScreenElementSize(glyph);
  return size ? { system, size } : undefined;
}
/** Pin the unit-6 single-row q23 lead and all 11 three-row authored slots.
 * Preserve exact native cardinality/reserved height across the 1→3 transition. */
function blankLanes(host: HTMLElement, tune: Tune) {
  const notes = allEvents(tune, 0).filter(event => event.el_type === 'note');
  const events = notes.slice(40, 52);
  if (JSON.stringify([40,41,42].map(index => notes.slice(0,index).reduce((sum,event) => sum + (typeof event.duration === 'number' ? event.duration * 4 : NaN),0))) !== '[23,24,24.75]') return;
  const entries: unknown[] = [];
  for (const [slot,event] of events.entries()) {
    const authoredRows = slot === 0 ? 1 : 3;
    if (event.lyric?.length !== authoredRows || event.lyric.slice(1).some(row => Object.keys(row).length !== 2 || row.syllable !== '' || row.divider !== ' ')) return;
    const owner = event.abselem as unknown as NativeOwner | undefined;
    const children = owner?.children?.filter(child => child.type === 'lyric');
    const child = children?.[0], text = child?.graphelem;
    const expected = event.lyric.map(row => row.syllable + (row.divider === ' ' ? '' : row.divider)).join('\n') + '\n';
    const owned = owner?.elemset?.flatMap(root => [...root.querySelectorAll('text.abcjs-lyric[data-name="lyric"]')]);
    if (owner?.abcelem !== event || children?.length !== 1 || child?.c !== expected || !text ||
      owned?.length !== 1 || owned[0] !== text || !host.contains(text) || text.children.length !== authoredRows + 1 || text.childNodes.length !== authoredRows + 1 ||
      !Number.isFinite(child.height) || child.height! <= 0 || child.lyricHeightBelow !== child.height) return;
    const rows = [...text.children];
    if (rows.some((row, index) => row.tagName.toLowerCase() !== 'tspan' || row.children.length ||
      row.getAttribute('x') !== text.getAttribute('x') || row.getAttribute('dy') !== (index === 0 ? null : '1.2em') ||
      (index > 0 && !!row.textContent?.trim()))) return;
    entries.push([event.startChar, event.endChar, child.c, child.height, child.lyricHeightBelow, child.lyricHeightAbove,
      rows.map(row => [row.textContent, row.getAttribute('dy'), getComputedStyle(row).fontSize, getComputedStyle(row).fontFamily])]);
  }
  return entries.length === 12 ? JSON.stringify(entries) : undefined;
}
function nativeSymbols(host: HTMLElement, tune: Tune) {
  const symbols: { key: string; scale: string; size: NonNullable<ReturnType<typeof readScreenElementSize>> }[] = [];
  for (let lane = 0; lane < 4; lane++) for (const event of allEvents(tune, lane).filter(event => event.el_type === 'note')) {
    if (event.rest?.type === 'invisible') continue;
    const owner = event.abselem as unknown as NativeOwner | undefined;
    if (owner?.abcelem !== event) return;
    for (const [index, child] of (owner.children ?? []).entries()) {
      if (child.type !== 'symbol' || !child.c) continue;
      const glyph = child.graphelem;
      if (!glyph || !visible(glyph, host) || !owner.elemset?.some(root => root.contains(glyph))) return;
      const size = readScreenElementSize(glyph);
      if (!size) return;
      symbols.push({ key: `${lane}:${key(event)}:${index}:${child.c}`, scale: JSON.stringify([child.scalex, child.scaley]), size });
    }
  }
  return symbols.length ? symbols : undefined;
}
function sameSymbols(before: NonNullable<ReturnType<typeof nativeSymbols>>, after: ReturnType<typeof nativeSymbols>, ratio: number) {
  return after && before.length === after.length && before.every((item, index) => {
    const next = after[index];
    return item.key === next.key && item.scale === next.scale && close(item.size.width, next.size.width) && close(item.size.height, next.size.height) &&
      close(item.size.screenWidth * ratio, next.size.screenWidth) && close(item.size.screenHeight * ratio, next.size.screenHeight);
  });
}
/** getMeasureWidths omits an unbarred prefix from its bar list. Read exact
 * native owner metrics for every event in all 23 systems and all four lanes. */
function measuredEdges(tune: Tune) {
  return tune.lines.map((line, index) => {
    const expected = new Set(voices(tune, index).flat().filter(event => ['note', 'bar'].includes(event.el_type)) as Event[]);
    const group = line as unknown as { staffGroup?: { voices?: { children?: NativeOwner[] }[] } };
    if (group.staffGroup?.voices?.length !== 4) throw new Error('native-metric-voices');
    const seen = new Set<Event>(), edges: number[] = [];
    for (const voice of group.staffGroup.voices) for (const child of voice.children ?? []) {
      if (!child.abcelem || !['note', 'bar'].includes(child.abcelem.el_type)) continue;
      if (!expected.has(child.abcelem) || seen.has(child.abcelem) || ![child.x, child.w, child.extraw].every(Number.isFinite)) throw new Error('native-metric-owner');
      seen.add(child.abcelem); edges.push(child.x + child.w);
    }
    if (seen.size !== expected.size || !edges.length) throw new Error('native-metric-count');
    // Fifteen native padding units plus the unchanged two-unit ink clearance.
    return Math.max(...edges) + 17;
  });
}
function median(values: number[]) {
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}
function readable(before: Geometry, after: Geometry, target: number) {
  const ratio = before.width / target;
  const notes = after.notes.flatMap(note => note.heads.map(head => head.screenWidth));
  const priorLyrics = before.notes.flatMap(note => note.lyrics.flatMap(row => row.size ? [row.size.screenHeight] : []));
  const lyrics = after.notes.flatMap(note => note.lyrics.flatMap(row => row.size ? [row.size.screenHeight] : []));
  const result = { frameRatio: after.screenWidth / after.width, medianHeadWidthCss: median(notes),
    medianLyricHeightCss: median(lyrics), priorMedianLyricHeightCss: median(priorLyrics) };
  const valid = before.notes.length === after.notes.length && close(after.width, target) && before.left === after.left &&
    close(before.screenWidth, after.screenWidth) && ratio > 1 && result.frameRatio >= 0.89 && result.medianHeadWidthCss >= 8.5 &&
    result.medianLyricHeightCss >= 16 && result.medianLyricHeightCss > result.priorMedianLyricHeightCss + EPSILON &&
    before.notes.every((note, index) => {
      const next = after.notes[index];
      return note.font === next.font && note.heads.length === next.heads.length && note.heads.every((head, item) =>
        close(head.width, next.heads[item].width) && close(head.height, next.heads[item].height) &&
        close(head.screenWidth * ratio, next.heads[item].screenWidth) && close(head.screenHeight * ratio, next.heads[item].screenHeight)) &&
        note.lyrics.length === next.lyrics.length && note.lyrics.every((row, item) => {
          const following = next.lyrics[item];
          return row.text === following.text && (!row.size ? !following.size : !!following.size &&
            following.size.screenWidth + EPSILON >= row.size.screenWidth && following.size.screenHeight + EPSILON >= row.size.screenHeight);
        });
    });
  return valid;
}
const optionKeys = new Set(['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap']);

/** The measurement Tune/controller cannot escape this call. Its native data is
 * unreachable before the single provisional candidate is constructed. */
function measurePlan(host: HTMLElement, owner: RollInteriorSession, frame: RollInteriorFrame, engine: Runtime,
  options: abcjs.AbcVisualParams, before: Score, source: Tune, timed: string) {
  const { tune } = materialize(owner, frame, engine);
  if (!fragmentProof(tune, frame, before, timed, source)) throw new Error('parsed-fragment-identity');
  const holder = host.ownerDocument.createElement('div');
  holder.setAttribute('style', 'visibility:hidden;pointer-events:none;position:absolute;');
  let controller: EngraverController | undefined;
  try {
    host.ownerDocument.body.append(holder);
    controller = new engine.EngraverController(holder, options);
    controller.getMeasureWidths(tune);
    if (controller.renderer.paper.dummySvg || !fragmentProof(tune, frame, before, timed, source)) throw new Error('measured-fragment-identity');
    return measuredEdges(tune);
  } finally { try { controller?.renderer.paper.dummySvg?.remove(); } finally { holder.remove(); } }
}

export function reflowRollInterior({ host, canonical, prepared, options, original, baseline, session, scale, stanzasPerGroup, current }: {
  host: HTMLElement; canonical?: string; prepared: string; options: abcjs.AbcVisualParams; original: abcjs.TuneObjectArray;
  baseline?: RollGroupingBaseline; session?: RollInteriorSession; scale: number; stanzasPerGroup: number; current: () => boolean;
}): abcjs.TuneObjectArray {
  clearRollInteriorReflow(host);
  if (!session) return original;
  const owner = session, frame = owner.view;
  const diagnostic: Record<string, unknown> = { version: 3, result: 'original', candidateEngravings: 0,
    owner: owner.id, profile: rollGroupingStanza(prepared) };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => { diagnostic.reason = reason; return tunes; };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  let reason = 'exception';
  try {
    if (!canonical || !hasRollGroupingSource(ROLL_GROUPING_ID, canonical)) return finish(original, 'source');
    const engine = runtime();
    if (!engine || owner.failure) return finish(original, owner.failure ?? 'native-engine');
    diagnostic.retainedPreparation = inventory(owner);
    if (scale !== 1 || stanzasPerGroup !== 1 || !host.isConnected || host.closest('.print-score-canvas') ||
      Object.keys(options).some(name => !optionKeys.has(name)) || options.accentAbove !== true || options.add_classes !== true ||
      options.oneSvgPerLine !== true || options.minPadding !== 6 || options.responsive !== 'resize' || options.scale !== 1 ||
      (options.visualTranspose ?? 0) !== 0 || options.viewportHorizontal !== false || !Number.isFinite(options.staffwidth) ||
      options.wrap?.minSpacing !== 1.5 || options.wrap.maxSpacing !== 2.7 || options.wrap.preferredMeasuresPerLine !== 0 ||
      Object.keys(options.wrap).some(name => !['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(name)) || !current()) return finish(original, 'unsupported-or-stale');
    const requested = options.staffwidth!, target = requested + 30;
    if (!baseline) return finish(original, 'settled-baseline');
    const necessary = baseline.widths.measureWidths.flatMap((width, unit) => width + (unit === 16 ? 8 : 1) > requested - (baseline.widths.left - 15) + EPSILON ? [unit] : []);
    diagnostic.necessaryUnits = necessary;
    if (!necessary.length) return finish(original, 'ordinary-width-sufficient');
    if (!frame || frame.parser !== rollGroupingWrappedNotation(prepared)) return finish(original, 'source-frame');
    const before = original.length === 1 && readRollGroupingIdentity(original[0], frame.parser);
    if (!before || before.signature !== frame.signature || JSON.stringify(before.systems) !== SINGLETONS ||
      JSON.stringify(baseline.systems) !== SINGLETONS || baseline.signature !== before.signature) return finish(original, 'settled-baseline');
    const allowed = PROFILES[frame.profile - 1].cuts;
    if (necessary.some(unit => !allowed.some(cut => cut[0] === unit))) return finish(original, 'unsupported-needed-unit');
    frame.cuts = necessary.map(unit => { const [,beat] = allowed.find(cut => cut[0] === unit)!; return { unit, beat, count: beat * 2 }; });
    diagnostic.retainedPreparation = inventory(owner);
    if (!cleanPlan(original[0], frame)) return finish(original, 'source-cut-proof');
    const systems = 17 + frame.cuts.length;
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].formatting.staffwidth !== undefined ||
      original[0].formatting.leftmargin !== undefined || original[0].formatting.rightmargin !== undefined) return finish(original, 'baseline-padding');
    preserveBlankLyricRows(host); containScreenSvgSystems(host);
    const geometry = readScreenScoreGeometry(host, before, false);
    const typography = geometry && captureLyricTypography(host, before.notes, geometry);
    const originalTimeline = timeline(original[0], frame.parser);
    const originalNatural = natural(host, original[0], frame), originalBlanks = blankLanes(host, original[0]), symbols = nativeSymbols(host, original[0]);
    if (!geometry || !typography || !originalTimeline || !originalNatural || !originalBlanks || !symbols) return finish(original, 'baseline-native-proof');
    const { wrap: _wrap, afterParsing: _after, clickListener: _click, ...plain } = options;
    const nativeOptions = { ...plain, staffwidth: requested };
    const widths = measurePlan(host, owner, frame, engine, nativeOptions, before, original[0], originalTimeline);
    diagnostic.fit = { target, measured: Math.max(...widths) };
    diagnostic.stage = 'measured';
    if (widths.length !== systems || widths.some(width => !Number.isFinite(width) || width > target + EPSILON)) return finish(original, 'native-target-width');
    // measurePlan has returned only scalar data. No measured Tune/controller is live here.
    const built = materialize(owner, frame, engine), candidate = built.tune;
    if (!fragmentProof(candidate, frame, before, originalTimeline, original[0]) || !current()) return finish(original, 'candidate-plan-or-stale');
    diagnostic.candidateRetained = built.retained;
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const candidateController = new engine.EngraverController(host, { ...nativeOptions, clickListener: options.clickListener });
    diagnostic.candidateEngravings = 1;
    try { candidateController.engraveABC(candidate, 0, 0); }
    finally { candidateController.renderer.paper.dummySvg?.remove(); }
    candidate.engraver = candidateController as unknown as NonNullable<Tune['engraver']>;
    const proof = fragmentProof(candidate, frame, before, originalTimeline, original[0]);
    if (!proof) reason = 'engraved-fragment-identity';
    else {
      diagnostic.stage = 'engraved';
      preserveBlankLyricRows(host); containScreenSvgSystems(host);
      const next = readScreenScoreGeometry(host, proof, true);
      const nextNatural = natural(host, candidate, frame), nextBlanks = blankLanes(host, candidate);
      const ratio = geometry.width / target;
      const nativePadding = candidate.engraver?.renderer?.padding;
      const frameFits = candidate.engraver?.width === requested && nativePadding?.left === 15 && nativePadding.right === 15 &&
        host.querySelectorAll('svg').length === systems && [...host.querySelectorAll('svg')].every(svg => close(svg.viewBox.baseVal.width, target) && !svg.hasAttribute('data-screen-horizontal-overflow')) &&
        host.scrollWidth <= host.clientWidth + 1;
      if (!next || !frameFits) reason = 'candidate-target-geometry';
      else {
        const size = readable(geometry, next, target);
        const naturalSystem = 3 + frame.cuts.filter(cut => cut.unit < 3).length + Number(frame.cuts.some(cut => cut.unit === 3));
        const sameNatural = nextNatural && nextNatural.system === naturalSystem && close(originalNatural.size.width, nextNatural.size.width) && close(originalNatural.size.height, nextNatural.size.height) &&
          close(originalNatural.size.screenWidth * ratio, nextNatural.size.screenWidth) && close(originalNatural.size.screenHeight * ratio, nextNatural.size.screenHeight);
        if (!size || !sameSymbols(symbols, nativeSymbols(host, candidate), ratio)) reason = 'candidate-native-size';
        else if (!sameNatural) reason = 'candidate-natural-owner';
        else if (!nextBlanks || nextBlanks !== originalBlanks ||
          JSON.stringify(allEvents(candidate,0).filter(event => event.el_type === 'note').slice(36,43).map(event => event.lyric?.length)) !== '[1,1,1,1,1,3,3]') reason = 'candidate-blank-lanes';
        else {
          const captured = captureLyricTypography(host, proof.notes, next);
          const typographic = captured && verifyLyricTypography(host, typography, captured, { preserveNaturalWidth: true });
          if (!typographic?.valid) reason = 'candidate-typography';
          else if (!current()) reason = 'stale-generation';
          else { diagnostic.result = 'candidate'; diagnostic.guards = true; return finish([candidate] as abcjs.TuneObjectArray, 'accepted'); }
        }
      }
    }
  } catch (error) { reason = error instanceof Error ? error.message : 'exception'; }
  finally {
    releaseRollInteriorFrame(owner);
    diagnostic.leaseReleased = owner.view === undefined;
    try { diagnostic.retainedAfterRelease = inventory(owner); } catch { diagnostic.retainedAfterRelease = 'cap-failure'; }
    // Written below for failures after rollback; early returns write here.
    if (diagnostic.reason) host.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic));
  }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  diagnostic.reason = reason;
  host.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic));
  return original;
}
