import abcjs from 'abcjs';
import { MIGHTY_FORTRESS_OPENING_ID, hasMightyFortressOpeningSource, mightyFortressOpeningWrappedNotation, readMightyFortressOpeningIdentity } from './mightyFortressOpeningSource';
import { HE_LEADETH_OPENING_ID, hasHeLeadethOpeningSource, heLeadethOpeningWrappedNotation, readHeLeadethOpeningIdentity } from './heLeadethOpeningSource';
import type { HymnOpeningSettings } from './hymnOpeningWrap';
import { readScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';
import { readTwoHymnSizeArcs } from './twoHymnSizeArcs';

const MIGHTY_ATTRIBUTE = 'data-mighty-fortress-size-wrap', LEADETH_ATTRIBUTE = 'data-he-leadeth-size-wrap';
const EPSILON = 0.05;
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;
const partition = (...pairs: number[]) => Array.from({ length: 17 }, (_, i) => i)
  .filter(i => !pairs.includes(i - 1)).map(i => pairs.includes(i) ? [i, i + 1] : [i]);
const reviewed: Partial<Record<string, { systems: number[][]; pair: number }[]>> = {
  [MIGHTY_FORTRESS_OPENING_ID]: [{ systems: partition(8), pair: 8 }],
  [HE_LEADETH_OPENING_ID]: [{ systems: partition(3, 8), pair: 3 }, { systems: partition(3), pair: 3 }, { systems: partition(4), pair: 4 }],
};
/** Complete reviewed partitions only. First preserve Leadeth's [8,9] pair;
 * a separately measured residual may authorize its one additional split. */
export function splitTwoHymnInflatedPair(songId: string, systems: number[][]) {
  const match = reviewed[songId]?.find(item => JSON.stringify(item.systems) === JSON.stringify(systems));
  if (!match) return undefined;
  const index = systems.findIndex(system => system[0] === match.pair);
  return { index, pair: [match.pair, match.pair + 1],
    systems: systems.flatMap((system, i) => i === index ? system.map(unit => [unit]) : [[...system]]) };
}
/** The first split's native trace may reveal one residual [8,9] overflow.
 * Only Leadeth's exact original two-pair partition can take this second step;
 * earlier staves must fit; later widths may only inherit a proven native
 * viewport promotion from this pair. No general splitter or retry loop. */
export function splitHeLeadethResidualPair(songId: string, original: number[][], firstSplit: number[][],
  staffWidths: number[][], requested: number, actualViewport = requested + 30): number[][] | undefined {
  if (songId !== HE_LEADETH_OPENING_ID || JSON.stringify(original) !== JSON.stringify(partition(3, 8)) ||
    JSON.stringify(firstSplit) !== JSON.stringify(partition(8)) || !Number.isFinite(requested) || requested <= 0 ||
    !Number.isFinite(actualViewport) || staffWidths.length !== firstSplit.length ||
    staffWidths.some(widths => widths.length !== 2 || widths.some(width => !Number.isFinite(width) || width <= 0) ||
      !close(widths[0], widths[1]))) return undefined;
  const causedResidual = actualViewport > requested + 30 + EPSILON
    ? pairCausesInflation(staffWidths, 8, requested, actualViewport)
    : close(actualViewport, requested + 30) && staffWidths.every((widths, index) => widths.every(value =>
      index === 8 ? value > requested + EPSILON : value <= requested + EPSILON));
  return causedResidual ? partition() : undefined;
}
export function clearTwoHymnSizeWrap(host: HTMLElement | null) {
  host?.removeAttribute(MIGHTY_ATTRIBUTE); host?.removeAttribute(LEADETH_ATTRIBUTE);
}
function adapter(songId: string | undefined) {
  if (songId === MIGHTY_FORTRESS_OPENING_ID) return { attribute: MIGHTY_ATTRIBUTE, stanzas: 4, slurs: 15,
    source: (abc: string) => hasMightyFortressOpeningSource(songId, abc),
    wrapped: mightyFortressOpeningWrappedNotation, read: readMightyFortressOpeningIdentity };
  if (songId === HE_LEADETH_OPENING_ID) return { attribute: LEADETH_ATTRIBUTE, stanzas: 1, slurs: 0,
    source: (abc: string) => hasHeLeadethOpeningSource(songId, abc),
    wrapped: heLeadethOpeningWrappedNotation, read: readHeLeadethOpeningIdentity };
}
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: HymnOpeningSettings, stanzas: number) {
  return host.isConnected && !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches &&
    !host.closest('.print-score-canvas') && settings.visibleKey === '0,1,2,3' && settings.stanzasPerGroup === stanzas &&
    settings.transpose === 0 && !settings.learnerAccidentals && !settings.grouped && !settings.musicOnly &&
    !settings.repeatUnderlay && !settings.reviewedUnderlay && Number.isFinite(settings.requestedScale) &&
    settings.requestedScale >= 0.5 && settings.requestedScale <= 1.75 && Number.isFinite(settings.scoreWidth) &&
    settings.scoreWidth > 0 && Object.keys(options).every(key => optionKeys.includes(key)) &&
    options.accentAbove === true && options.add_classes === true && options.oneSvgPerLine === true && options.minPadding === 6 &&
    options.responsive === 'resize' && options.scale === 1 && (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false &&
    Number.isFinite(options.staffwidth) && options.staffwidth! > 0 && close(options.staffwidth!, settings.scoreWidth / settings.requestedScale) &&
    !!options.wrap && Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}
// Native text bounds can change nonlinearly with responsive scale; the
// independent original-reference typography proof below owns lyric dimensions.
function sameSize(before: Geometry, after: Geometry, width: number) {
  const ratio = before.width / width;
  const size = (a: Geometry['notes'][number]['heads'][number] | undefined, b: typeof a) => !a || !b ? a === b :
    close(a.width, b.width) && close(a.height, b.height) && close(a.screenWidth * ratio, b.screenWidth) && close(a.screenHeight * ratio, b.screenHeight);
  return ratio > 1 && close(after.width, width) && before.left === after.left && close(before.screenWidth, after.screenWidth) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const next = after.notes[index];
      return note.font === next.font && note.heads.length === next.heads.length && note.heads.every((head, i) => size(head, next.heads[i])) &&
        note.lyrics.length === next.lyrics.length && note.lyrics.every((row, i) => row.text === next.lyrics[i].text);
    });
}
function nativeSystems(host: HTMLElement, systems: number[][]) {
  const svgs = [...host.querySelectorAll('svg')];
  if (svgs.length !== systems.length) return undefined;
  const trace = svgs.map((svg, index) => {
    const ink = svg.getBBox(), viewport = svg.viewBox.baseVal;
    const staves = [...svg.querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')].map(staff => {
      const box = staff.getBBox(), screen = staff.getBoundingClientRect();
      return { box: [box.x, box.y, box.width, box.height], screen: [screen.width, screen.height] };
    });
    return { units: systems[index], viewport: [viewport.x, viewport.y, viewport.width, viewport.height],
      ink: [ink.x, ink.y, ink.width, ink.height], staves };
  });
  const first = trace[0]?.staves[0];
  if (!first || trace.some(system => system.staves.length !== 2 ||
    ![...system.viewport, ...system.ink].every(Number.isFinite) || system.viewport[2] <= 0 || system.viewport[3] <= 0 ||
    system.ink[2] <= 0 || system.ink[3] <= 0 || system.staves.some(staff =>
      ![...staff.box, ...staff.screen].every(Number.isFinite) || !close(staff.box[0], 15) || staff.box[2] <= 0 || staff.screen[0] <= 0 ||
      staff.box[3] <= 0 || staff.screen[1] <= 0 || !close(staff.box[3], first.box[3]) || !close(staff.screen[1], first.screen[1])) ||
    !close(system.staves[0].box[2], system.staves[1].box[2]))) return undefined;
  return trace;
}
function pairCausesInflation(staffWidths: number[][], index: number, requested: number, viewport: number) {
  // Read every original staff, including propagated widths after the pair.
  // The post-split trace below separately proves those later systems fit.
  return staffWidths.every((widths, i) => widths.every(value =>
    i < index ? value <= requested + EPSILON : i === index
      ? value > requested + EPSILON && close(value + 30, viewport)
      : value + 30 <= viewport + EPSILON));
}
function summary(geometry: Geometry) {
  const counts = (values: unknown[]) => [...values.reduce<Map<string, number>>((map, value) => {
    const key = JSON.stringify(value); map.set(key, (map.get(key) ?? 0) + 1); return map;
  }, new Map<string, number>())].map(([value, count]) => ({ value: JSON.parse(value), count }));
  return { viewport: geometry.width, screenWidth: geometry.screenWidth, notes: geometry.notes.length,
    heads: counts(geometry.notes.flatMap(note => note.heads)),
    lyricSizes: counts(geometry.notes.flatMap(note => note.lyrics.flatMap(row => row.size ? [row.size] : []))),
    fonts: [...new Set(geometry.notes.flatMap(note => note.font ? [note.font] : []))] };
}

/** Exact source and partition only, before opening composition. Keep requested
 * engraving width and demand actual native fit: no viewport normalization or
 * cropping. A rejected attempt restores the original listener-bearing nodes. */
export function refineTwoHymnSizeScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  source: string, prepared: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  clearTwoHymnSizeWrap(diagnosticHost);
  const edition = adapter(songId);
  if (!edition) return original;
  const diagnostic: Record<string, unknown> = { version: 1, songId, result: 'original', reason: 'unsupported', settings };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost?.setAttribute(edition.attribute, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (!edition.source(source)) return finish(original, 'canonical-source');
    if (!supported(host, options, settings, edition.stanzas) || original.length !== 1) return finish(original, 'unsupported');
    const abc = edition.wrapped(prepared);
    if (!abc) return finish(original, 'prepared-source');
    const before = edition.read(original[0], abc);
    const canonical = edition.read(abcjs.parseOnly(abc, { lineBreaks: [[]] as unknown as number[] })[0], abc);
    if (!before || !canonical || before.signature !== canonical.signature) return finish(original, 'source-identity');
    const plan = splitTwoHymnInflatedPair(songId!, before.systems);
    if (!plan) return finish(original, 'unaffected-systems');
    diagnostic.originalUnits = before.systems; diagnostic.plannedUnits = plan.systems;
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined) return finish(original, 'source-padding');
    const originalProof: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = {
      version: 1, song: songId!, phase: 'before-split-and-opening', result: 'original' };
    const geometry = readScreenScoreGeometry(host, before, false, originalProof), trace = nativeSystems(host, before.systems);
    diagnostic.originalGeometryReason = originalProof.reason;
    const width = options.staffwidth! + 30;
    if (!geometry || !trace) return finish(original, 'source-geometry');
    const arcs = readTwoHymnSizeArcs(host, original[0], before, edition.slurs);
    diagnostic.originalNative = { phase: 'before-split-and-opening', ...summary(geometry), systems: trace, arcs: arcs?.arcs };
    diagnostic.requestedViewport = width;
    if (!arcs) return finish(original, 'source-arcs');
    if (geometry.width <= width + EPSILON) return finish(original, 'no-inflation');
    const cause = pairCausesInflation(trace.map(system => system.staves.map(staff => staff.box[2])), plan.index, options.staffwidth!, geometry.width);
    diagnostic.cause = { firstOversizedSystem: plan.index, pair: plan.pair, proven: cause };
    if (!cause) return finish(original, 'unproven-overflow-pair');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'source-typography');
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    const { wrap: _wrap, ...explicit } = options;
    const attempt = (systems: number[][], residual: boolean) => {
      const phase = residual ? 'after-second-split-before-opening' : 'after-split-before-opening';
      const reject = (reason: string) => { diagnostic.reason = residual ? `residual-${reason}` : reason; return undefined; };
      host.replaceChildren();
      const candidate = abcjs.renderAbc(host, abc, { ...explicit,
        lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
      const after = candidate.length === 1 && edition.read(candidate[0], abc);
      if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems) ||
        JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting)) return reject('candidate-identity');
      preserveBlankLyricRows(host); containScreenSvgSystems(host);
      const splitProof: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = {
        version: 1, song: songId!, phase, result: 'candidate' };
      const next = readScreenScoreGeometry(host, after, true, splitProof), nextTrace = nativeSystems(host, systems);
      diagnostic[residual ? 'residualGeometryReason' : 'splitGeometryReason'] = splitProof.reason;
      const nextArcs = readTwoHymnSizeArcs(host, candidate[0], after, edition.slurs);
      diagnostic[residual ? 'residualSplitNative' : 'splitNative'] = {
        phase, ...(next && summary(next)), systems: nextTrace, arcs: nextArcs?.arcs };
      const staffWidths = nextTrace?.map(system => system.staves.map(staff => staff.box[2]));
      // Only a proven source-specific residual can be inspected at its actual
      // viewport. It remains provisional; nominal fit alone permits acceptance.
      const secondPlan = !residual && next && staffWidths
        ? splitHeLeadethResidualPair(songId!, before.systems, systems, staffWidths, options.staffwidth!, next.width) : undefined;
      const physicalWidth = secondPlan ? next!.width : width;
      const padding = candidate[0].engraver?.renderer?.padding;
      if (!next || !sameSize(geometry, next, physicalWidth) || !nextTrace || nextTrace.some(system => system.staves.some(staff =>
        !close(staff.box[3], trace[0].staves[0].box[3]) ||
        !close(staff.screen[1], trace[0].staves[0].screen[1] * geometry.width / physicalWidth))) ||
        candidate[0].engraver?.width !== options.staffwidth || padding?.left !== 15 || padding.right !== 15) return reject('candidate-geometry');
      if (!nextArcs || nextArcs.signature !== arcs.signature) return reject('candidate-arcs');
      const nextTypography = captureLyricTypography(host, after.notes, next);
      const proof = nextTypography && verifyLyricTypography(host, typography, nextTypography);
      diagnostic[residual ? 'residualTypography' : 'typography'] = proof;
      if (!proof?.valid) return reject('candidate-typography');
      const fits = !secondPlan && close(next.width, width) && staffWidths!.every(widths => widths.every(value => value <= options.staffwidth! + EPSILON));
      if (!fits) reject('candidate-geometry');
      return { candidate, staffWidths: staffWidths!, viewport: next.width, fits, secondPlan };
    };
    const first = attempt(plan.systems, false);
    if (first?.fits) { diagnostic.result = 'candidate'; diagnostic.acceptedUnits = plan.systems; return finish(first.candidate, 'accepted'); }
    const secondPlan = first?.secondPlan;
    if (secondPlan) {
      diagnostic.residualCause = { phase: 'after-first-split', pair: [8, 9], system: 8,
        staffWidths: first!.staffWidths[8], requested: options.staffwidth,
        viewport: first!.viewport, nominalViewport: width, provisional: true, proven: true };
      diagnostic.residualPlannedUnits = secondPlan;
      // Retain only the original rollback snapshot. The first candidate is never
      // a fallback, and its temporary host attributes cannot leak into the next.
      for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
      for (const [name, value] of attributes) host.setAttribute(name, value);
      const second = attempt(secondPlan, true);
      if (second?.fits) { diagnostic.result = 'candidate'; diagnostic.acceptedUnits = secondPlan; return finish(second.candidate, 'accepted'); }
    }
  } catch { diagnostic.reason = 'exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, String(diagnostic.reason));
}
