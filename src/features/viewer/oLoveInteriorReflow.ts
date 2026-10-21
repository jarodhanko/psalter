/** Exact O Love screen-only interior/opening transaction. No ABC edits or extra parses. */
import abcjs from 'abcjs';
import type EngraverController from 'abcjs/src/write/engraver-controller';
import { O_LOVE_OPENING_ID, hasOLoveOpeningSource, oLoveOpeningWrappedNotation, readOLoveOpeningIdentity } from './oLoveOpeningSource';
import type { CompleteInTheeScreenFit } from './completeInTheeWrap';
import type { HymnOpeningSettings } from './hymnOpeningWrap';
import { readScreenScoreGeometry, readScreenElementSize } from './isolatedChordWrap';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';

const ATTRIBUTE = 'data-o-love-interior-reflow';
const ENGINE = 'abcjs-basic v6.7.0';
const EPSILON = 0.05;
type Tune = abcjs.TuneObject;
type Event = abcjs.AbcElem;
type Data = Pick<Tune, 'lines' | 'formatting' | 'media' | 'metaText' | 'metaTextInfo' | 'version'>;
type Score = NonNullable<ReturnType<typeof readOLoveOpeningIdentity>>;
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
type Stats = { nodes: number; depth: number };
type Lease = { cuts?: number[]; widths?: NonNullable<CompleteInTheeScreenFit['wholeUnits']>; measured?: number[] };
export type OLoveSession = { graph?: Data; lease?: Lease; failure?: string };
// The accepted whole-bar baseline retains its final [9,10] pair.
const BASELINE = '[[0],[1],[2],[3],[4],[5],[6],[7],[8],[9,10]]';
const CUTS = [{ unit: 1, count: 2, duration: 1 }, { unit: 5, count: 2, duration: 1 }, { unit: 7, count: 4, duration: 1.5 }];
// All four authored natural owners. No synthetic/replayed accidental is admitted.
const NATURALS = [[1075,1078,0.25,1,'=D'],[1131,1135,0.25,2,'=E'],[1155,1160,0.75,1,'=D'],[1172,1176,0.25,1,'=D']] as const;
const voices = (tune: Pick<Tune, 'lines'>, line: number) => tune.lines[line].staff!.flatMap(staff => staff.voices!);
const key = (event: Event) => `${event.el_type}:${event.startChar}:${event.endChar}`;
const close = (a: number, b: number) => Math.abs(a - b) <= EPSILON;
export function newOLoveSession(): OLoveSession { return {}; }
export function releaseOLoveFrame(owner: OLoveSession) { delete owner.lease; }
export function disposeOLoveSession(owner: OLoveSession) { releaseOLoveFrame(owner); delete owner.graph; delete owner.failure; }
export function clearOLoveReflow(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }
function graphWitness(text: string) {
  // Complete clean ten-system parser data, independently captured from the
  // exact 1,554-character parser source, including all metadata and headers.
  if (text.length !== 38905) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++) hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === 0xd7ba903e96336077n;
}
/** All retained preparation roots, including metadata and the current lease.
 * No index, history, native Tune, controller or callback lives on this owner. */
function inventory(owner: OLoveSession, working?: unknown): Stats {
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
  visit({ owner, cuts: CUTS, naturals: NATURALS, working }, 0);
  return result;
}
function copyData<T>(value: T, freeze = false, budget = 20000): T {
  const seen = new Set<object>(); let nodes = 0;
  const copy = (item: unknown, depth = 0): unknown => {
    if (++nodes > budget || depth > 32) throw new Error('snapshot-cap');
    if (item === null || item === undefined || ['string', 'number', 'boolean'].includes(typeof item)) return item;
    if (typeof item === 'object') { if (seen.has(item!)) throw new Error('snapshot-cycle'); seen.add(item!); }
    if (Array.isArray(item)) { const result = item.map(child => copy(child, depth + 1)); seen.delete(item); return freeze ? Object.freeze(result) : result; }
    if (typeof item !== 'object' || Object.getPrototypeOf(item) !== Object.prototype) throw new Error('snapshot-non-data');
    const result = Object.fromEntries(Object.entries(item).map(([name, child]) => [name, copy(child, depth + 1)]));
    seen.delete(item);
    return freeze ? Object.freeze(result) : result;
  };
  return copy(value) as T;
}
const dataOf = (tune: Tune): Data => ({ lines: tune.lines, formatting: tune.formatting, media: tune.media,
  metaText: tune.metaText, metaTextInfo: tune.metaTextInfo, version: tune.version });
/** Borrow the existing ordinary callback. There is one immutable graph and
 * only a scalar current-render lease, with no resize history or native caches. */
export function captureOLoveFrame(owner: OLoveSession, tune: Tune, parser: string, prepared: string) {
  releaseOLoveFrame(owner);
  if (owner.failure || abcjs.signature !== ENGINE || oLoveOpeningWrappedNotation(prepared) !== parser) return;
  const score = readOLoveOpeningIdentity(tune, parser);
  if (!score || JSON.stringify(score.systems) !== BASELINE) return;
  const data = dataOf(tune);
  // Earlier callbacks can already carry cyclic engine caches. Skip them.
  try { if (!graphWitness(JSON.stringify(data))) return; } catch { return; }
  try {
    if (!owner.graph) owner.graph = copyData(data, true, 20000 - inventory(owner, data).nodes);
    owner.lease = {};
    inventory(owner, data);
  } catch (error) { releaseOLoveFrame(owner); owner.failure = error instanceof Error ? error.message : 'snapshot'; }
}

type Runtime = { Parse: new () => { getTune(): Tune }; EngraverController: {
  new(host: HTMLElement, options: abcjs.AbcVisualParams): EngraverController & { engraveABC(tune: Tune, number: number, offset: number): void };
} };
function runtime(): Runtime | undefined {
  const engine = (abcjs as unknown as { test?: Runtime }).test;
  return abcjs.signature === ENGINE && typeof engine?.Parse === 'function' && typeof engine.EngraverController === 'function' ? engine : undefined;
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
    if (unit !== 11 || onset !== 80 || ordinal !== [41, 39, 39, 38][lane]) return;
    signatures.push(events);
  }
  return JSON.stringify(signatures);
}
function context(line: abcjs.TuneLine) {
  return JSON.stringify(line.staff?.map(staff => {
    const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
    return [staff.clef && [staff.clef.type, staff.clef.verticalPos, staff.clef.clefPos, staff.clef.transpose, staff.clef.stafflines, staff.clef.staffscale],
      staff.key && [staff.key.root, staff.key.acc, staff.key.mode, staff.key.accidentals?.map(a => [a.acc, a.note, a.verticalPos])],
      staff.meter && [staff.meter.type, staff.meter.value], staff.voices?.length, group.brace, group.bracket, group.connectBarLines];
  }));
}
/** Exact source reader signs every event; this additionally proves the only
 * three cut bars, useful syllabic suffixes, and explicit accidental resets. */
function cleanPlan(source: Tune, cuts: number[], parser: string) {
  for (const unit of cuts) {
    const cut = CUTS.find(cut => cut.unit === unit);
    if (!cut) return false;
    for (let lane = 0; lane < 4; lane++) {
      const raw = voices(source, unit)[lane], notes = raw.filter(event => event.el_type === 'note') as Event[];
      if (raw.some(event => !['stem','note','bar'].includes(event.el_type)) || raw.at(-1)?.el_type !== 'bar' ||
        raw.filter(event => event.el_type === 'bar').length !== 1 || notes.length !== 6) return false;
      for (const [index,note] of notes.entries()) {
        if (note.duration !== (index === 0 ? 0.75 : 0.25) || note.rest || note.pitches?.length !== 1 ||
          note.gracenotes?.length || note.decoration?.length || note.chord?.length || note.startTriplet || note.endTriplet ||
          note.tripletMultiplier || note.startSlur || note.endSlur || note.startBeam || note.endBeam ||
          note.pitches.some(p => p.startTie || p.endTie || p.startSlur || p.endSlur)) return false;
        const p = note.pitches[0];
        if (p.accidental && !(lane === 1 && NATURALS.some(([start,end,duration,pitch,name]) =>
          note.startChar === start && note.endChar === end && note.duration === duration && p.pitch === pitch && p.name === name &&
          p.accidental === 'natural' && parser.slice(start,end).trim() === name + (duration === 0.75 ? '3' : '')))) return false;
        if (lane === 0 ? note.lyric?.length !== 4 || note.lyric.some(row =>
          Object.keys(row).length !== 2 || !row.syllable.trim() || /[_*]/.test(row.syllable)) : note.lyric !== undefined) return false;
      }
      if (notes.slice(0,cut.count).reduce((sum,note) => typeof note.duration === 'number' ? sum + note.duration : NaN,0) !== cut.duration ||
        notes.length - cut.count < 2) return false;
      if (lane === 0) {
        const outgoing = notes[cut.count - 1].lyric!;
        const expected = unit === 1 ? [['that',' '],['that',' '],['that',' '],['that',' ']] : unit === 5 ?
          [['Thee',' '],['re','-'],['the',' '],['in',' ']] : [['cean',' '],["shine's",' '],['ise',' '],['there',' ']];
        if (JSON.stringify(outgoing.map(row => [row.syllable,row.divider])) !== JSON.stringify(expected)) return false;
      }
      // A reset within a suffix is safe only before its first use. The exact
      // unit-1 suffix starts with E-flat; its later =D precedes the only D.
      if (lane === 1 && (unit === 5 || unit === 7) &&
        notes[cut.count].pitches![0].name !== (unit === 5 ? '=E' : '=D')) return false;
    }
  }
  return cuts.includes(1);
}

function fragment(data: Data, cuts: number[], owner: OLoveSession) {
  for (const unit of [7,5,1]) {
    if (!cuts.includes(unit)) continue;
    const count = CUTS.find(cut => cut.unit === unit)!.count, line = data.lines[unit];
    const suffix: abcjs.TuneLine = copyData({ ...line, staff: line.staff!.map(staff => ({ ...staff, voices: [] })) },
      false, 20000 - inventory(owner, data).nodes);
    for (const [staffIndex,staff] of line.staff!.entries()) for (const [voiceIndex,voice] of staff.voices!.entries()) {
      const notes = voice.filter(event => event.el_type === 'note').slice(0,count);
      const prefix = voice.filter(event => event.el_type === 'stem' || (event.el_type === 'note' && notes.includes(event)));
      const tail = voice.filter(event => event.el_type !== 'note' || !notes.includes(event));
      inventory(owner, { data, suffix, notes, prefix, tail });
      if (unit === 1) {
        // Keep the real pickup bar and append only the two whole prefix notes.
        data.lines[0].staff![staffIndex].voices![voiceIndex].push(...notes);
      } else voice.splice(0,voice.length,...prefix);
      suffix.staff![staffIndex].voices!.push(tail);
    }
    if (unit === 1) data.lines.splice(1,1,suffix);
    else data.lines.splice(unit + 1,0,suffix);
    inventory(owner,data);
  }
}
function materialize(owner: OLoveSession, cuts: number[], engine: Runtime) {
  const data = copyData(owner.graph!,false,20000 - inventory(owner).nodes);
  inventory(owner,data);
  fragment(data,cuts,owner);
  inventory(owner,data);
  const tune = new engine.Parse().getTune();
  Object.assign(tune,data); // Creates normal Tune methods; never calls parse().
  return tune;
}

/** Recompose the original ten systems/eleven real units as a read-only view.
 * Every fragment's exact source range and context must match its original.
 * This never presents a display continuation as an invented musical bar. */
function fragmentProof(tune: Tune, cuts: number[], parser: string, before: Score, timed: string, source: Tune, owner?: OLoveSession) {
  if (tune.lines.length !== 9 + cuts.length || JSON.stringify(tune.formatting) !== JSON.stringify(source.formatting) ||
    JSON.stringify([tune.media,tune.metaText,tune.metaTextInfo,tune.version]) !==
      JSON.stringify([source.media,source.metaText,source.metaTextInfo,source.version])) return;
  const whole: abcjs.TuneLine[] = [];
  let display = 0;
  const check = (line: abcjs.TuneLine, unit: number, expected: Event[][]) => {
    if (!line || context(line) !== context(source.lines[unit])) return false;
    return line.staff!.flatMap(staff => staff.voices!).every((voice,lane) =>
      JSON.stringify(voice.filter(event => event.el_type === 'stem')) === JSON.stringify(voices(source,unit)[lane].filter(event => event.el_type === 'stem')) &&
      JSON.stringify(voice.filter(event => event.el_type !== 'stem').map(event => key(event as Event))) === JSON.stringify(expected[lane].map(key)));
  };
  for (let unit = 0; unit < 10; unit++) {
    const sourceVoices = voices(source,unit).map(voice => voice.filter(event => event.el_type !== 'stem') as Event[]);
    const first = tune.lines[display++];
    let reconstructed: abcjs.VoiceItem[][];
    if (unit === 0) {
      const prefix = voices(source,1).map(voice => voice.filter(event => event.el_type === 'note').slice(0,2) as Event[]);
      if (!check(first,0,sourceVoices.map((voice,lane) => [...voice,...prefix[lane]]))) return;
      reconstructed = first.staff!.flatMap(staff => staff.voices!).map(voice => {
        const bar = voice.findIndex(event => event.el_type === 'bar');
        return voice.slice(0,bar + 1);
      });
    } else if (unit === 1) {
      const suffix = sourceVoices.map(voice => voice.slice(2));
      if (!check(first,1,suffix)) return;
      reconstructed = first.staff!.flatMap(staff => staff.voices!).map((voice,lane) => [
        ...voice.filter(event => event.el_type === 'stem'),
        ...voices(tune,0)[lane].slice(voices(tune,0)[lane].findIndex(event => event.el_type === 'bar') + 1),
        ...voice.filter(event => event.el_type !== 'stem'),
      ]);
    } else if (cuts.includes(unit)) {
      const count = CUTS.find(cut => cut.unit === unit)!.count, second = tune.lines[display++];
      if (!check(first,unit,sourceVoices.map(voice => voice.slice(0,count))) ||
        !check(second,unit,sourceVoices.map(voice => voice.slice(count)))) return;
      reconstructed = first.staff!.flatMap(staff => staff.voices!).map((voice,lane) => [
        ...voice,...second.staff!.flatMap(staff => staff.voices!)[lane].filter(event => event.el_type !== 'stem'),
      ]);
    } else {
      if (!check(first,unit,sourceVoices)) return;
      reconstructed = first.staff!.flatMap(staff => staff.voices!);
    }
    whole.push({ ...first, staff: first.staff!.map((staff,staffIndex) => ({ ...staff,
      voices: reconstructed.slice(staffIndex * 2,staffIndex * 2 + 2),
    })) });
  }
  // Before native mutation, include the complete temporary recomposition too.
  if (owner) inventory(owner,{ data: dataOf(tune), whole });
  const restored = readOLoveOpeningIdentity({ ...tune, lines: whole },parser);
  if (!restored || restored.signature !== before.signature || JSON.stringify(restored.systems) !== BASELINE ||
    timeline(tune,parser) !== timed || readOLoveOpeningIdentity(tune,parser)) return;
  return { ...restored, systems: tune.lines.map((_line,index) => [index]), notes: [0,1,2,3].flatMap(lane =>
    allEvents(tune,lane).filter(event => event.el_type === 'note').map(element => ({ voice: lane, element }))) };
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
/** Preserve the sole cross-system word's two native four-row columns, and
 * all twelve authored blank melisma slots. No synthetic text or lyric edits. */
function protectedLyrics(host: HTMLElement, tune: Tune, crosses: boolean) {
  const spans = [[381,382],[581,584],[156,160],[369,373],[596,600]];
  const rows = [[['Thee',' '],['re','-'],['the',' '],['in',' ']],
    [['back',' '],['stores',' '],['rain','-'],['dust',' ']]];
  const records: unknown[] = [], seen = new Set<SVGGraphicsElement>();
  let prefixSystem = -1;
  for (const [slot,[start,end]] of spans.entries()) {
    const event = allEvents(tune,0).find(event => event.el_type === 'note' && event.startChar === start && event.endChar === end);
    const expected = slot < 2 ? rows[slot] : Array.from({ length: 4 },() => ['',' ']);
    if (!event || JSON.stringify(event.lyric?.map(row => [row.syllable,row.divider])) !== JSON.stringify(expected)) return;
    const system = tune.lines.findIndex((_line,index) => voices(tune,index)[0].includes(event as abcjs.VoiceItem));
    const notes = voices(tune,system)[0].filter(event => event.el_type === 'note');
    if (slot === 0) { prefixSystem = system; if (crosses && notes.at(-1) !== event) return; }
    if (slot === 1 && (crosses ? system !== prefixSystem + 1 || notes[0] !== event : system !== prefixSystem)) return;
    const owner = event.abselem as unknown as NativeOwner | undefined;
    const children = owner?.children?.filter(child => child.type === 'lyric'), child = children?.[0], text = child?.graphelem;
    const content = expected.map(([syllable,divider]) => syllable + (divider === ' ' ? '' : divider));
    // ABCJS 6.7.0 draw/text transforms exactly four empty authored rows into
    // this five-tspan tuple; retain the strict original child.c proof below.
    const nativeContent = slot < 2 ? [...content,''] : ['\u00a0',' ','',' ',''];
    const owned = owner?.elemset?.flatMap(root => [...root.querySelectorAll('text.abcjs-lyric[data-name="lyric"]')]);
    if (owner?.abcelem !== event || children?.length !== 1 || child?.c !== content.join('\n') + '\n' || !text ||
      owned?.length !== 1 || owned[0] !== text || seen.has(text) || text.ownerSVGElement !== host.querySelectorAll('svg')[system] ||
      text.children.length !== 5 || text.childNodes.length !== 5 || !Number.isFinite(child.height) || child.height! <= 0 ||
      child.lyricHeightBelow !== child.height) return;
    seen.add(text);
    const viewport = text.ownerSVGElement!.getBoundingClientRect();
    for (const [row,raw] of [...text.children].entries()) {
      if (!(raw instanceof SVGGraphicsElement) || raw.tagName.toLowerCase() !== 'tspan' || raw.children.length ||
        raw.textContent !== nativeContent[row] || raw.getAttribute('x') !== text.getAttribute('x') ||
        raw.getAttribute('dy') !== (row === 0 ? null : '1.2em')) return;
      if (!content[row]) continue;
      const rect = raw.getBoundingClientRect();
      if (!visible(raw,host) || !readScreenElementSize(raw) || rect.left < viewport.left - EPSILON ||
        rect.right > viewport.right + EPSILON || rect.top < viewport.top - EPSILON || rect.bottom > viewport.bottom + EPSILON) return;
    }
    records.push([start,end,child.c,child.height,child.lyricHeightBelow,child.lyricHeightAbove]);
  }
  return JSON.stringify(records);
}

/** The five slurs stay wholly within untouched source units. Verify native
 * endpoint ownership as well as the five drawn paths, not just a path count. */
function slurs(host: HTMLElement, tune: Tune) {
  const expected = [[0,151,156],[2,1235,1240],[0,364,369],[0,591,596],[1,1142,1147]];
  const found: number[][] = [];
  for (const [lineIndex,line] of tune.lines.entries()) {
    const group = line as unknown as { staffGroup?: { voices?: { otherchildren?: unknown[] }[] } };
    if (group.staffGroup?.voices?.length !== 4) return false;
    for (const [lane,voice] of group.staffGroup.voices.entries()) for (const raw of voice.otherchildren ?? []) {
      if (typeof raw !== 'object' || raw === null) continue;
      const slur = raw as { type?: string; anchor1?: { parent?: NativeOwner }; anchor2?: { parent?: NativeOwner } };
      if (slur.type !== 'TieElem') continue;
      const first = slur.anchor1?.parent?.abcelem, last = slur.anchor2?.parent?.abcelem;
      if (!first || !last || !voices(tune,lineIndex)[lane].includes(first as abcjs.VoiceItem) ||
        !voices(tune,lineIndex)[lane].includes(last as abcjs.VoiceItem)) return false;
      found.push([lane,first.startChar!,last.startChar!]);
    }
  }
  const sorted = (items: number[][]) => JSON.stringify(items.slice().sort((a,b) => a[1] - b[1]));
  const paths = [...host.querySelectorAll<SVGGraphicsElement>('path[data-name="slur"]')];
  return sorted(found) === sorted(expected) && paths.length === 5 && paths.every(path => visible(path,host) && !!readScreenElementSize(path)) &&
    host.querySelectorAll('path[data-name="tie"]').length === 0;
}

function nativeSymbols(host: HTMLElement, tune: Tune) {
  const naturalSpans = new Set<number>();
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
      if (child.c === 'accidentals.nat') {
        // Share this symbol's visibility/size read, retaining the exact four
        // original natural owners, one glyph apiece, and their native systems.
        const pitch = event.pitches?.[0];
        const owned = owner.elemset?.flatMap(root => [...root.querySelectorAll('[data-name="accidentals.nat"]')]);
        const system = tune.lines.findIndex((_line,index) => voices(tune,index)[lane].includes(event as abcjs.VoiceItem));
        if (lane !== 1 || event.pitches?.length !== 1 || !NATURALS.some(([start,end,duration,p,name]) =>
          event.startChar === start && event.endChar === end && event.duration === duration && pitch?.pitch === p &&
          pitch.name === name && pitch.accidental === 'natural') || naturalSpans.has(event.startChar!) ||
          owner.children?.filter(child => child.c === 'accidentals.nat').length !== 1 ||
          owned?.length !== 1 || owned[0] !== glyph || glyph.ownerSVGElement !== host.querySelectorAll('svg')[system]) return;
        naturalSpans.add(event.startChar!);
      }
      symbols.push({ key: `${lane}:${key(event)}:${index}:${child.c}`, scale: JSON.stringify([child.scalex, child.scaley]), size });
    }
  }
  return symbols.length && naturalSpans.size === 4 && host.querySelectorAll('[data-name="accidentals.nat"]').length === 4
    ? symbols : undefined;
}
function sameSymbols(before: NonNullable<ReturnType<typeof nativeSymbols>>, after: ReturnType<typeof nativeSymbols>, ratio: number) {
  return after && before.length === after.length && before.every((item, index) => {
    const next = after[index];
    return item.key === next.key && item.scale === next.scale && close(item.size.width, next.size.width) && close(item.size.height, next.size.height) &&
      close(item.size.screenWidth * ratio, next.size.screenWidth) && close(item.size.screenHeight * ratio, next.size.screenHeight);
  });
}
/** Measure every native note/bar owner, including unbarred prefixes. */
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

/** The measured Tune/controller dies before the sole candidate is made. */
function measurePlan(host: HTMLElement, owner: OLoveSession, cuts: number[], engine: Runtime,
  options: abcjs.AbcVisualParams, parser: string, before: Score, source: Tune, timed: string) {
  const tune = materialize(owner,cuts,engine);
  if (!fragmentProof(tune,cuts,parser,before,timed,source,owner)) throw new Error('parsed-fragment-identity');
  const holder = host.ownerDocument.createElement('div');
  holder.setAttribute('style','visibility:hidden;pointer-events:none;position:absolute;');
  let controller: EngraverController | undefined;
  try {
    host.ownerDocument.body.append(holder);
    controller = new engine.EngraverController(holder,options);
    controller.getMeasureWidths(tune);
    if (controller.renderer.paper.dummySvg || !fragmentProof(tune,cuts,parser,before,timed,source)) throw new Error('measured-fragment-identity');
    return measuredEdges(tune);
  } finally { try { controller?.renderer.paper.dummySvg?.remove(); } finally { holder.remove(); } }
}

export function reflowOLove({ host, canonical, prepared, options, original, fit, session, settings, current }: {
  host: HTMLElement; canonical: string; prepared: string; options: abcjs.AbcVisualParams; original: abcjs.TuneObjectArray;
  fit?: CompleteInTheeScreenFit; session: OLoveSession; settings: HymnOpeningSettings; current: () => boolean;
}): abcjs.TuneObjectArray {
  clearOLoveReflow(host);
  const diagnostic: Record<string,unknown> = { version: 1, result: 'original', candidateEngravings: 0 };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => { diagnostic.reason = reason; return tunes; };
  let retained: Node[] | undefined, attributes: [string,string][] | undefined, reason = 'exception';
  try {
    const engine = runtime(), parser = oLoveOpeningWrappedNotation(prepared);
    if (!hasOLoveOpeningSource(O_LOVE_OPENING_ID,canonical) || !parser || !engine || session.failure) return finish(original,session.failure ?? 'source-or-engine');
    if (settings.requestedScale !== 1 || settings.stanzasPerGroup !== 4 || settings.transpose !== 0 || settings.learnerAccidentals ||
      settings.visibleKey !== '0,1,2,3' || settings.grouped || settings.musicOnly || settings.repeatUnderlay || settings.reviewedUnderlay ||
      !host.isConnected || host.closest('.print-score-canvas') || !host.ownerDocument.defaultView?.matchMedia('(max-width: 600px)').matches ||
      Object.keys(options).some(name => !optionKeys.has(name)) || options.accentAbove !== true || options.add_classes !== true ||
      options.oneSvgPerLine !== true || options.minPadding !== 6 || options.responsive !== 'resize' || options.scale !== 1 ||
      (options.visualTranspose ?? 0) !== 0 || options.viewportHorizontal !== false || !Number.isFinite(options.staffwidth) ||
      options.staffwidth! <= 0 || !close(options.staffwidth!,settings.scoreWidth) ||
      options.wrap?.minSpacing !== 1.5 || options.wrap.maxSpacing !== 2.7 || options.wrap.preferredMeasuresPerLine !== 0 ||
      Object.keys(options.wrap).some(name => !['minSpacing','maxSpacing','preferredMeasuresPerLine'].includes(name)) || !current()) return finish(original,'unsupported-or-stale');
    if (!fit?.accepted || !fit.limited || fit.requestedStaffwidth !== options.staffwidth ||
      !session.lease || !session.graph) return finish(original,'settled-baseline');
    const before = original.length === 1 && readOLoveOpeningIdentity(original[0],parser), widths = fit.wholeUnits;
    if (!before || JSON.stringify(before.systems) !== BASELINE || !widths || widths.measureWidths.length !== 11 ||
      !Number.isFinite(widths.left) || widths.left < 15 || widths.measureWidths.some(width => !Number.isFinite(width) || width <= 0) ||
      !close(widths.total,widths.measureWidths.reduce((sum,width) => sum + width,0))) return finish(original,'settled-baseline');
    const requested = options.staffwidth!, target = requested + 30, available = requested - (widths.left - 15);
    const necessary = widths.measureWidths.flatMap((width,unit) => width > available + EPSILON ? [unit] : []);
    if (!necessary.length || necessary.some(unit => !CUTS.some(cut => cut.unit === unit))) return finish(original,'unsupported-needed-unit');
    // Unit 1's one reviewed cut also repairs the independently isolated pickup.
    const cuts = [...new Set([1,...necessary])].sort((a,b) => a - b);
    session.lease.cuts = cuts; session.lease.widths = widths;
    diagnostic.cuts = cuts; inventory(session);
    if (!cleanPlan(original[0],cuts,parser)) return finish(original,'source-cut-proof');
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== fit.effectiveStaffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined) return finish(original,'baseline-padding');
    preserveBlankLyricRows(host); containScreenSvgSystems(host);
    const geometry = readScreenScoreGeometry(host,before,false);
    const typography = geometry && captureLyricTypography(host,before.notes,geometry), timed = timeline(original[0],parser);
    const lyrics = protectedLyrics(host,original[0],false), symbols = nativeSymbols(host,original[0]);
    if (!geometry || !close(geometry.width,fit.effectiveStaffwidth + 30) || !typography || !timed || !lyrics || !symbols ||
      !slurs(host,original[0])) return finish(original,'baseline-native-proof');
    const { wrap: _wrap, afterParsing: _after, clickListener: _click, ...plain } = options;
    const nativeOptions = { ...plain, staffwidth: requested };
    const measured = measurePlan(host,session,cuts,engine,nativeOptions,parser,before,original[0],timed);
    session.lease.measured = measured;
    diagnostic.fit = { target, measured: Math.max(...measured) };
    const systems = 9 + cuts.length;
    if (measured.length !== systems || measured.some(width => !Number.isFinite(width) || width > target + EPSILON)) return finish(original,'native-target-width');
    const candidate = materialize(session,cuts,engine);
    if (!fragmentProof(candidate,cuts,parser,before,timed,original[0],session) || !current()) return finish(original,'candidate-plan-or-stale');
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name,attribute.value]);
    host.replaceChildren();
    const controller = new engine.EngraverController(host,{ ...nativeOptions, clickListener: options.clickListener });
    diagnostic.candidateEngravings = 1;
    try { controller.engraveABC(candidate,0,0); } finally { controller.renderer.paper.dummySvg?.remove(); }
    candidate.engraver = controller as unknown as NonNullable<Tune['engraver']>;
    const proof = fragmentProof(candidate,cuts,parser,before,timed,original[0]);
    if (!proof) reason = 'engraved-fragment-identity';
    else {
      preserveBlankLyricRows(host); containScreenSvgSystems(host);
      const next = readScreenScoreGeometry(host,proof,true), nativePadding = candidate.engraver?.renderer?.padding;
      const frameFits = candidate.engraver?.width === requested && nativePadding?.left === 15 && nativePadding.right === 15 &&
        host.querySelectorAll('svg').length === systems && [...host.querySelectorAll('svg')].every(svg =>
          close(svg.viewBox.baseVal.width,target) && !svg.hasAttribute('data-screen-horizontal-overflow')) && host.scrollWidth <= host.clientWidth + 1;
      if (!next || !frameFits) reason = 'candidate-target-geometry';
      else if (!readable(geometry,next,target) || !sameSymbols(symbols,nativeSymbols(host,candidate),geometry.width / target)) reason = 'candidate-native-size';
      else if (!slurs(host,candidate) || protectedLyrics(host,candidate,cuts.includes(5)) !== lyrics) reason = 'candidate-native-ownership';
      else {
        const captured = captureLyricTypography(host,proof.notes,next);
        const typographyProof = captured && verifyLyricTypography(host,typography,captured,{ preserveNaturalWidth: true });
        if (!typographyProof?.valid) reason = 'candidate-typography';
        else if (!current()) reason = 'stale-generation';
        else { diagnostic.result = 'candidate'; return finish([candidate] as abcjs.TuneObjectArray,'accepted'); }
      }
    }
  } catch (error) { reason = error instanceof Error ? error.message : 'exception'; }
  finally {
    releaseOLoveFrame(session);
    try { inventory(session); } catch { diagnostic.resourceFailure = true; }
    if (diagnostic.reason) host.setAttribute(ATTRIBUTE,JSON.stringify(diagnostic));
  }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name,value] of attributes!) host.setAttribute(name,value);
  }
  diagnostic.reason = reason; host.setAttribute(ATTRIBUTE,JSON.stringify(diagnostic));
  return original;
}
