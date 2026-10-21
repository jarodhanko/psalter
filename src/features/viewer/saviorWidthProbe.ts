import abcjs from 'abcjs';
import { calcLineWraps } from 'abcjs/src/parse/wrap_lines';
import EngraverController from 'abcjs/src/write/engraver-controller';
import { readScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';
import { hasSaviorWidthSource, readSaviorWidthIdentity, saviorWrappedNotation, SAVIOR_WIDTH_ID } from './saviorWidthSource';

const ATTRIBUTE = 'data-savior-width-probe';
const EPSILON = 0.05;
type Widths = { left: number; measureWidths: number[]; total: number };
type Status = 'not-checked' | 'match' | 'mismatch';
type NativeTextProof = { provenance: 'abcjs-6.7.0-text-native-getBBox-uncached'; calls: number;
  nativeMeasurements: number; emptyTexts: number; ownedTextNodes: number; providedElements: number; invalidMeasurements: number };

/** Override only this fresh measurement paper's method. ABCJS's prototype
 * getTextSize reads/writes a module-global short-string cache and can cache
 * guessed fallback sizes. Never call it or guessWidth from this observer.
 * Native text construction/attributes and nonempty getBBox sizes are retained;
 * missing/invalid native bounds are a rejection, never a guessed measurement.
 */
export function installSaviorNativeTextMeasurement(paper: EngraverController['renderer']['paper']): NativeTextProof {
  const proof: NativeTextProof = { provenance: 'abcjs-6.7.0-text-native-getBBox-uncached', calls: 0,
    nativeMeasurements: 0, emptyTexts: 0, ownedTextNodes: 0, providedElements: 0, invalidMeasurements: 0 };
  paper.getTextSize = (value, attributes, element) => {
    proof.calls++;
    const text = typeof value === 'number' ? String(value) : value;
    if (!text || /^\s+$/.test(text)) { proof.emptyTexts++; return { width: 0, height: 0 }; }
    const owned = !element;
    const node = element || paper.text(text, attributes);
    if (owned) proof.ownedTextNodes++; else proof.providedElements++;
    try {
      const bounds = node.getBBox();
      if (!Number.isFinite(bounds.width) || bounds.width < 0 || !Number.isFinite(bounds.height) || bounds.height <= 0)
        throw new Error('Savior native text bounds are invalid.');
      proof.nativeMeasurements++;
      return { width: bounds.width, height: bounds.height };
    } catch (error) { proof.invalidMeasurements++; throw error; }
    finally { if (owned) node.remove(); }
  };
  return proof;
}
export type SaviorProbeSettings = {
  requestedScale: number; scoreWidth: number; transpose: number; learnerAccidentals: boolean;
  visibleKey: string; stanzasPerGroup: number; grouped: boolean; musicOnly: boolean;
  repeatUnderlay: boolean; reviewedUnderlay: boolean;
};
type Diagnostic = {
  version: 2; mode: 'size-preserving'; result: 'original' | 'candidate'; phase: string; reason: string; reasons: string[];
  candidateEngraving: 'not-attempted' | 'attempted'; candidateGeometry: 'not-proven' | 'proven';
  engine: string; settings: SaviorProbeSettings; nativeText?: NativeTextProof;
  identity: { canonical: Status; preparedParser: Status; original: Status; unbroken: Status; measured: Status; equal: Status; candidate?: Status };
  requestedStaffwidth?: number; requestedSvgWidth?: number;
  environment?: { narrowScreen: boolean | null };
  original?: { units: number[][]; width: number | null };
  candidate?: { units?: number[][]; engravingStaffwidth?: number; nativeWidth?: number; retainedWidth?: number };
  typography?: { rows: number; nativeControls: number; compared: number; measurements: number; valid: boolean };
  geometryReason?: string;
  complete?: Widths & { available: number; splitUnitIncreases?: number[]; recognizedSplits?: boolean };
  planner?: { units: number[][]; fits: boolean; mergedCadence: boolean; newSingleAttackUnits: number[] };
};
function close(a: number, b: number) { return Math.abs(a - b) <= EPSILON; }
function validWidths(value: Widths | undefined): value is Widths {
  return !!value && Number.isFinite(value.left) && value.left >= 15 &&
    Array.isArray(value.measureWidths) && value.measureWidths.length === 16 &&
    value.measureWidths.every(width => Number.isFinite(width) && width > 0) &&
    Number.isFinite(value.total) && close(value.total, value.measureWidths.reduce((sum, width) => sum + width, 0));
}

// Join only complete, independently measured bars when the whole plan fits.
// The optional care pair never determines a size ceiling.
export function planSaviorWidthSystems(systems: number[][], widths: number[], available: number) {
  if (!Number.isFinite(available) || available <= 0 || widths.length !== 16 ||
    widths.some(width => !Number.isFinite(width) || width <= 0) ||
    systems.some(system => !system.length) || systems.flat().length !== 16 ||
    systems.flat().some((unit, index) => unit !== index) ||
    systems.some(system => system.reduce((sum, unit) => sum + widths[unit], 0) > available + EPSILON)) return undefined;
  const planned = systems.map(system => [...system]);
  const cadence = planned.findIndex(system => system.length === 1 && system[0] === 3);
  const following = planned[cadence + 1];
  const merge = cadence >= 0 && following?.length === 1 && following[0] === 4 &&
    widths[3] + widths[4] <= available + EPSILON;
  if (merge) planned.splice(cadence, 2, [3, 4]);
  return { systems: planned, mergedCadence: merge };
}

function settingReasons(settings: SaviorProbeSettings) {
  const reasons: string[] = [];
  if (settings.visibleKey !== '0,1,2,3') reasons.push('parts');
  if (settings.stanzasPerGroup !== 4) reasons.push('stanzas');
  if (settings.transpose !== 0) reasons.push('transpose');
  if (settings.learnerAccidentals) reasons.push('learner');
  if (settings.grouped) reasons.push('grouping');
  if (settings.musicOnly) reasons.push('music-only');
  if (settings.repeatUnderlay || settings.reviewedUnderlay) reasons.push('alternate-underlay');
  if (!Number.isFinite(settings.requestedScale) || settings.requestedScale <= 0 ||
    !Number.isFinite(settings.scoreWidth) || settings.scoreWidth <= 0) reasons.push('requested-size');
  return reasons;
}
function optionReasons(host: HTMLElement, options: abcjs.AbcVisualParams) {
  const reasons: string[] = [];
  if (!host.isConnected) reasons.push('detached');
  if (options.print || host.closest('.print-score-canvas')) reasons.push('print');
  if (!options.wrap || options.lineBreaks || options.oneSvgPerLine !== true || options.responsive !== 'resize' ||
    options.scale !== 1 || options.minPadding !== 6 || (options.visualTranspose ?? 0) !== 0 || options.format ||
    options.expandToWidest || options.timeBasedLayout || options.tablature ||
    options.wrap.minSpacing !== 1.5 || options.wrap.maxSpacing !== 2.7 ||
    options.wrap.preferredMeasuresPerLine !== 0 || options.wrap.minSpacingLimit !== undefined ||
    options.wrap.lastLineLimit !== undefined || options.viewportHorizontal || options.viewportVertical ||
    !Number.isFinite(options.staffwidth) || options.staffwidth! <= 0 ||
    options.paddingleft !== undefined || options.paddingright !== undefined) reasons.push('layout-options');
  return reasons;
}

export function clearSaviorWidthProbe(host: HTMLElement | null) {
  host?.removeAttribute(ATTRIBUTE);
}

type Plan = { abc: string; before: NonNullable<ReturnType<typeof readSaviorWidthIdentity>>;
  systems: number[][]; diagnostic: Diagnostic };

/** Read-only source-bound measurement, after the ordinary screen presentation.
 * Returns a plan only; never replaces a tune or edits the score DOM.
 * The only persistent write is this diagnostic attribute on the measure host.
 * Uses the native getMeasureWidths engine with uncached native text sizing, on its own
 * parsed tune and hidden node. Own that node so exceptions also remove it;
 * ABCJS 6.7.0's public tuneMetrics only cleans up after normal return.
 * The live original never enters native measurement/planning.
 * Wide screens and already-paired care systems are deliberately excluded.
 */
export function observeSaviorWidthProbe(diagnosticHost: HTMLElement | null, host: HTMLElement | null,
  sourceAbc: string, preparedAbc: string | undefined, songId: string | undefined,
  options: abcjs.AbcVisualParams | undefined, original: abcjs.TuneObjectArray | undefined,
  settings: SaviorProbeSettings): Plan | undefined {
  clearSaviorWidthProbe(diagnosticHost);
  if (!diagnosticHost || songId !== SAVIOR_WIDTH_ID) return;
  const diagnostic: Diagnostic = { version: 2, mode: 'size-preserving', result: 'original', phase: 'source', reason: 'render-unavailable', reasons: [],
    candidateEngraving: 'not-attempted', candidateGeometry: 'not-proven', engine: abcjs.signature, settings: { ...settings },
    identity: { canonical: 'not-checked', preparedParser: 'not-checked', original: 'not-checked', unbroken: 'not-checked', measured: 'not-checked', equal: 'not-checked' } };
  const finish = (reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Observation cannot fail the score render. */ }
    return undefined;
  };
  try {
    diagnostic.identity.canonical = hasSaviorWidthSource(songId, sourceAbc) ? 'match' : 'mismatch';
    if (diagnostic.identity.canonical !== 'match') return finish('canonical-source');
    diagnostic.phase = 'settings';
    diagnostic.reasons = settingReasons(settings);
    if (diagnostic.reasons.length) return finish('unsupported-settings');
    diagnostic.requestedStaffwidth = settings.scoreWidth / settings.requestedScale;
    diagnostic.requestedSvgWidth = diagnostic.requestedStaffwidth + 30;
    if (abcjs.signature !== 'abcjs-basic v6.7.0') return finish('engine-version');
    if (!host || !options || !original || preparedAbc === undefined) return finish('render-unavailable');
    diagnostic.requestedStaffwidth = options.staffwidth;
    diagnostic.requestedSvgWidth = (options.staffwidth ?? NaN) + 30;
    diagnostic.phase = 'options';
    diagnostic.reasons = optionReasons(host, options);
    if (!close(options.staffwidth ?? NaN, settings.scoreWidth / settings.requestedScale)) diagnostic.reasons.push('requested-width');
    if (diagnostic.reasons.length) return finish('unsupported-options');
    const view = host.ownerDocument.defaultView;
    diagnostic.environment = { narrowScreen: view?.matchMedia?.('(max-width: 600px)').matches ?? null };
    if (!diagnostic.environment.narrowScreen) return finish('wide-screen');
    diagnostic.phase = 'prepared-source';
    const abc = saviorWrappedNotation(preparedAbc);
    diagnostic.identity.preparedParser = abc === undefined ? 'mismatch' : 'match';
    if (abc === undefined) return finish('prepared-source');
    diagnostic.phase = 'original';
    const before = original.length === 1 && readSaviorWidthIdentity(original[0], abc);
    diagnostic.identity.original = before ? 'match' : 'mismatch';
    if (!before) return finish('original-identity');
    diagnostic.original = { units: before.systems, width: null };
    if (!before.systems.some(system => system.length === 1 && system[0] === 3)) return finish('care-already-paired');
    const staffwidth = options.staffwidth!;
    const padding = original[0].engraver?.renderer?.padding;
    const paddingMatches = padding?.left === 15 && padding.right === 15 && original[0].engraver?.width === staffwidth &&
      original[0].formatting.staffwidth === undefined && original[0].formatting.leftmargin === undefined &&
      original[0].formatting.rightmargin === undefined;
    const svgs = [...host.querySelectorAll('svg')];
    const svgWidths = svgs.map(svg => {
      const box = svg.getAttribute('viewBox')?.trim().split(/\s+/).map(Number);
      return box?.length === 4 && box.every(Number.isFinite) && box[2] > 0 ? box[2] : null;
    });
    const originalWidth = svgWidths[0] ?? null;
    const uniform = svgWidths.length === before.systems.length && originalWidth !== null &&
      svgWidths.every(width => width !== null && close(width, originalWidth));
    diagnostic.original = { units: before.systems, width: originalWidth };
    if (!paddingMatches) diagnostic.reasons.push('original-padding');
    if (!uniform || originalWidth! < staffwidth + 30 - EPSILON) diagnostic.reasons.push('original-viewport');
    const explanation = (original[0] as abcjs.TuneObject & { explanation?: { widths: Widths; staffWidth: number }[] }).explanation;
    const native = explanation?.[0]?.widths;
    if (explanation?.length !== 1 || explanation[0].staffWidth !== staffwidth || !validWidths(native))
      diagnostic.reasons.push('native-widths');
    if (diagnostic.reasons.length || !native) return finish('original-layout');
    const { wrap: _wrap, afterParsing: _afterParsing, clickListener: _clickListener, ...measurement } = options;
    const unbroken = { ...measurement, lineBreaks: [[]] as unknown as number[] };
    diagnostic.phase = 'unbroken-identity';
    const flatTunes = abcjs.parseOnly(abc, unbroken);
    const flat = flatTunes.length === 1 && readSaviorWidthIdentity(flatTunes[0], abc);
    diagnostic.identity.unbroken = flat && flat.systems.length === 1 && flat.systems[0].length === 16 ? 'match' : 'mismatch';
    diagnostic.identity.equal = flat && flat.signature === before.signature ? 'match' : 'mismatch';
    if (diagnostic.identity.unbroken !== 'match' || diagnostic.identity.equal !== 'match') return finish('measurement-identity');
    diagnostic.phase = 'unbroken-metrics';
    // Keep the pristine unbroken parser tune for planning, exactly as the
    // former public tuneMetrics path did. The engine only sees this new parse.
    const measurementTunes = abcjs.parseOnly(abc, unbroken);
    const measurementIdentity = measurementTunes.length === 1 && readSaviorWidthIdentity(measurementTunes[0], abc);
    if (!measurementIdentity || measurementIdentity.signature !== before.signature) {
      diagnostic.identity.measured = 'mismatch'; return finish('measurement-identity');
    }
    const measurementHost = host.ownerDocument.createElement('div');
    measurementHost.setAttribute('style', 'visibility: hidden;');
    let measuredSections: Widths[], controller: EngraverController | undefined, usedFontFallback = false;
    try {
      host.ownerDocument.body.appendChild(measurementHost);
      controller = new EngraverController(measurementHost, unbroken);
      diagnostic.nativeText = installSaviorNativeTextMeasurement(controller.renderer.paper);
      measuredSections = controller.getMeasureWidths(measurementTunes[0]);
      usedFontFallback = !!controller.renderer.paper.dummySvg;
    } finally {
      // ABCJS's text fallback owns a second temporary body SVG. The normal
      // draw cleanup is not called by getMeasureWidths, so remove this exact
      // instance's fallback too, without scanning or touching other body nodes.
      try { controller?.renderer.paper.dummySvg?.remove(); }
      finally { measurementHost.remove(); }
    }
    if (usedFontFallback) return finish('measurement-font-fallback');
    if (!diagnostic.nativeText.nativeMeasurements) return finish('measurement-no-native-text');
    const measuredIdentity = readSaviorWidthIdentity(measurementTunes[0], abc);
    diagnostic.identity.measured = measuredIdentity && measuredIdentity.signature === before.signature ? 'match' : 'mismatch';
    if (diagnostic.identity.measured !== 'match') return finish('measurement-identity');
    const widths = measuredSections[0];
    if (measuredSections.length !== 1 || !validWidths(widths)) return finish('measurement-widths');
    const available = staffwidth - (widths.left - 15);
    diagnostic.complete = { ...widths, measureWidths: [...widths.measureWidths], available };
    diagnostic.complete.splitUnitIncreases = [7, 11].map(unit => widths.measureWidths[unit] - native.measureWidths[unit]);
    diagnostic.complete.recognizedSplits = diagnostic.complete.splitUnitIncreases.every(increase => increase > 2);
    if (!diagnostic.complete.recognizedSplits) return finish('unrecognized-split-measures');
    // These are necessary width conditions only, never safe-engraving claims.
    if (widths.left >= staffwidth) return finish('margin-does-not-fit');
    diagnostic.phase = 'planner';
    const plan = calcLineWraps(flatTunes[0], [{ ...widths, measureWidths: [...widths.measureWidths] }],
      { ...options, wrap: { ...options.wrap! } });
    const sections = plan.revisedParams.lineBreaks as unknown as number[][] | undefined;
    if (!plan.reParse || !Array.isArray(sections) || sections.length !== 1 || !Array.isArray(sections[0]) ||
      sections[0].some((end, index) => !Number.isInteger(end) || end < 0 || end >= 15 ||
        (index > 0 && end <= sections[0][index - 1]))) return finish('planner-shape');
    let start = 0;
    const systems = [...sections[0], 15].map(end => {
      const units = Array.from({ length: end - start + 1 }, (_, index) => start + index);
      start = end + 1;
      return units;
    });
    const fitted = planSaviorWidthSystems(systems, widths.measureWidths, available);
    const originalSingles = new Set(before.systems.filter(system => system.length === 1).map(system => system[0]));
    const newSingleAttackUnits = fitted?.systems.filter(system => system.length === 1 &&
      before.units[system[0]].singleAttack && !originalSingles.has(system[0])).map(system => system[0]) ?? [];
    diagnostic.planner = { units: fitted?.systems ?? systems, fits: !!fitted, mergedCadence: !!fitted?.mergedCadence, newSingleAttackUnits };
    if (!fitted) return finish('planner-fit');
    if (newSingleAttackUnits.length) return finish('new-singleton');
    if (!fitted.systems.some(system => system.length === 2 && system[0] === 3 && system[1] === 4))
      return finish('no-fitting-care-join');
    finish('plan-only');
    return { abc, before, systems: fitted.systems, diagnostic };
  } catch { return finish(diagnostic.nativeText?.invalidMeasurements ? 'measurement-text-bounds' : 'exception'); }
}

type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
function samePhysicalSize(before: Geometry, after: Geometry) {
  const equal = (a: Geometry['notes'][number]['heads'][number] | undefined,
    b: Geometry['notes'][number]['heads'][number] | undefined) => !a || !b ? a === b :
    (['width', 'height', 'screenWidth', 'screenHeight'] as const).every(key => close(a[key], b[key]));
  return before.width === after.width && before.left === after.left && close(before.screenWidth, after.screenWidth) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const other = after.notes[index];
      return note.font === other.font && note.heads.length === other.heads.length &&
        note.heads.every((head, i) => equal(head, other.heads[i])) && note.lyrics.length === other.lyrics.length &&
        note.lyrics.every((lyric, i) => lyric.text === other.lyrics[i].text && equal(lyric.size, other.lyrics[i].size));
    });
}
function sameViewport(host: HTMLElement, geometry: Geometry, systems: number) {
  const svgs = [...host.querySelectorAll('svg')];
  return svgs.length === systems && svgs.every(svg =>
    svg.viewBox.baseVal.x === geometry.left && svg.viewBox.baseVal.width === geometry.width);
}
function staffSizes(host: HTMLElement, systems: number): { local: number; screen: number }[] | undefined {
  const svgs = [...host.querySelectorAll('svg')];
  if (svgs.length !== systems) return undefined;
  const sizes = svgs.flatMap(svg => {
    const staves = [...svg.querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')];
    return staves.length === 2 ? staves.map(staff => ({ local: staff.getBBox().height,
      screen: staff.getBoundingClientRect().height })) : [];
  });
  return sizes.length === systems * 2 && sizes.every(size => Number.isFinite(size.local) && size.local > 0 &&
    Number.isFinite(size.screen) && size.screen > 0) ? sizes : undefined;
}

/** A bounded reflow only. Keep each request's ordinary physical-size envelope,
 * including its existing oversized viewport. A later native guard rejection
 * therefore cannot add a reverse-size cliff. No size ceiling or feedback is
 * claimed: a whole bar that cannot fit the requested budget keeps its original.
 * In particular, the optional care pair never sets a cap.
 *
 * Plan against the REQUESTED width, then ask the native engraver to keep the
 * original's measured viewport budget. Never edit an SVG viewport to make it
 * pass. Native convergence excess is a rejection, not a tolerated correction.
 * Ink, six-unit lyric clearance, every head/row/staff size and independent
 * native typography controls still have to pass at that exact viewport.
 */
export function reflowSaviorScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: SaviorProbeSettings): abcjs.TuneObjectArray {
  const plan = observeSaviorWidthProbe(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings);
  if (!plan) return original;
  const { abc, before, systems, diagnostic } = plan;
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost?.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    diagnostic.phase = 'original-geometry';
    const geometry = readScreenScoreGeometry(host, before, false);
    const staves = staffSizes(host, before.systems.length);
    if (!geometry || !sameViewport(host, geometry, before.systems.length) || !staves || staves.some(size => !close(size.local, staves[0].local) ||
      !close(size.screen, staves[0].screen))) return finish(original, 'original-geometry');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'original-typography');
    retained = [...host.childNodes];
    attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    diagnostic.phase = 'candidate-render';
    diagnostic.candidateEngraving = 'attempted';
    const { wrap: _wrap, ...explicit } = options;
    const nativeStaffwidth = geometry.width - 30;
    if (!Number.isFinite(nativeStaffwidth) || nativeStaffwidth < options.staffwidth! - EPSILON)
      throw new Error('Unsupported original viewport budget');
    const candidate = abcjs.renderAbc(host, abc, { ...explicit, staffwidth: nativeStaffwidth,
      lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && readSaviorWidthIdentity(candidate[0], abc);
    const identity = !!after && after.signature === before.signature && JSON.stringify(after.systems) === JSON.stringify(systems);
    diagnostic.identity.candidate = identity ? 'match' : 'mismatch';
    diagnostic.candidate = { engravingStaffwidth: nativeStaffwidth, ...(after && { units: after.systems }) };
    if (!identity || !after) diagnostic.reason = 'candidate-identity';
    else {
      preserveBlankLyricRows(host);
      containScreenSvgSystems(host);
      diagnostic.phase = 'candidate-geometry';
      const nativeGeometry = readScreenScoreGeometry(host, after, false);
      diagnostic.candidate.nativeWidth = nativeGeometry?.width;
      // No viewport writes: native output must already preserve the original
      // reflected viewport exactly, not merely within the fit tolerance.
      if (!nativeGeometry || nativeGeometry.left !== geometry.left || nativeGeometry.width !== geometry.width ||
        !sameViewport(host, geometry, after.systems.length))
        diagnostic.reason = 'candidate-viewport';
      else {
        const geometryDiagnostic: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = {
          version: 1, song: SAVIOR_WIDTH_ID, phase: 'candidate-geometry', result: 'original',
        };
        const finalGeometry = readScreenScoreGeometry(host, after, true, geometryDiagnostic);
        const finalStaves = staffSizes(host, after.systems.length);
        diagnostic.geometryReason = geometryDiagnostic.reason;
        diagnostic.candidate.retainedWidth = finalGeometry?.width;
        if (!finalGeometry || !samePhysicalSize(geometry, finalGeometry) || !finalStaves ||
          finalStaves.some(size => !close(size.local, staves[0].local) || !close(size.screen, staves[0].screen)) ||
          candidate[0].engraver?.width !== nativeStaffwidth ||
          candidate[0].engraver?.renderer?.padding?.left !== 15 || candidate[0].engraver?.renderer?.padding?.right !== 15)
          diagnostic.reason = 'candidate-geometry';
        else {
          const captured = captureLyricTypography(host, after.notes, finalGeometry);
          const proof = captured && verifyLyricTypography(host, typography, captured);
          if (proof) diagnostic.typography = { rows: proof.rows, nativeControls: proof.nativeControls,
            compared: proof.compared, measurements: proof.measurements, valid: proof.valid };
          if (proof?.valid) {
            diagnostic.result = 'candidate'; diagnostic.candidateGeometry = 'proven'; diagnostic.phase = 'accepted';
            return finish(candidate, 'accepted');
          }
          diagnostic.reason = 'candidate-typography';
        }
      }
    }
  } catch { diagnostic.reason = 'exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, diagnostic.reason);
}
