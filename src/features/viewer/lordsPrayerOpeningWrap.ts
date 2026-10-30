import abcjs from 'abcjs';
import { hasPsalter433OpeningSource, psalter433WrappedNotation, readPsalter433OpeningIdentity, psalter433OpeningPartition } from './psalter433OpeningSource';
import type { HymnOpeningSettings } from './hymnOpeningWrap';
import { normalizeScreenCandidateViewport, readScreenScoreGeometry, sameScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

const ATTRIBUTE = 'data-psalter433-opening-wrap';
const EPSILON = 0.05;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;

const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
type NativeWidths = { left: number; measureWidths: number[]; total: number };

export function clearPsalter433OpeningWrap(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: HymnOpeningSettings) {
  return abcjs.signature === 'abcjs-basic v6.7.0' && host.isConnected &&
    !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches && !host.closest('.print-score-canvas') &&
    settings.requestedScale === 1 && settings.transpose === 0 && !settings.learnerAccidentals &&
    settings.visibleKey === '0,1,2,3' && settings.stanzasPerGroup === 1 && !settings.grouped && !settings.musicOnly &&
    !settings.repeatUnderlay && !settings.reviewedUnderlay && Number.isFinite(settings.scoreWidth) && settings.scoreWidth >= 300 && settings.scoreWidth <= 450 &&
    Number.isFinite(options.staffwidth) && close(options.staffwidth!, settings.scoreWidth) &&
    Object.keys(options).every(key => optionKeys.includes(key)) && options.accentAbove === true && options.add_classes === true &&
    options.oneSvgPerLine === true && options.minPadding === 6 && options.responsive === 'resize' && options.scale === 1 &&
    (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false && !!options.wrap &&
    Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}

/** One exact-source opening attempt for the reported default phone layout.
 * Mixed meter and triplets stay signed by a separate reader, never admitted
 * by weakening the generic whole-score planner. This affects screen layout only.
 * Native unit estimates can reject this pair even when the full engraving fits. Keep
 * those shared planning rules unchanged: this separate attempt earns acceptance
 * only through the same complete source, ink, clearance and physical-size proof,
 * plus independent native typography controls. No other boundary is moved. */
export function reflowPsalter433OpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  canonical: string, prepared: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  clearPsalter433OpeningWrap(diagnosticHost);
  if (songId !== 'psalter433') return original;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported', settings };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost?.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    const parser = psalter433WrappedNotation(prepared);
    if (!hasPsalter433OpeningSource(canonical) || !parser) return finish(original, 'source');
    if (!supported(host, options, settings) || original.length !== 1) return finish(original, 'unsupported');
    const before = readPsalter433OpeningIdentity(original[0], parser);
    if (!before) return finish(original, 'source-identity');
    const systems = psalter433OpeningPartition(before.systems);
    if (!systems) return finish(original, 'unaffected-opening');
    const padding = original[0].engraver?.renderer?.padding;
    const section = (original[0] as abcjs.TuneObject & { explanation?: { widths?: NativeWidths; staffWidth?: number }[] }).explanation;
    const widths = section?.[0]?.widths;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined || section?.length !== 1 || section[0].staffWidth !== options.staffwidth ||
      !widths || !Number.isFinite(widths.left) || widths.left < padding.left || widths.left >= options.staffwidth! ||
      widths.measureWidths.length !== 30 || widths.measureWidths.some(width => !Number.isFinite(width) || width <= 0) ||
      !close(widths.measureWidths.reduce((sum, width) => sum + width, 0), widths.total)) return finish(original, 'native-widths');
    const geometry = readScreenScoreGeometry(host, before, false);
    if (!geometry) return finish(original, 'original-geometry');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'original-typography');
    const openingEstimate = widths.measureWidths[0] + widths.measureWidths[1];
    const originalAvailable = geometry.width - 30 - (widths.left - padding.left);
    // An already-inflated native viewport can fit with the ordinary margin.
    // Otherwise try seven units less on each side, as a bounded candidate. Neither
    // choice enlarges the measured SVG or reduces the existing glyph scale.
    const margin = openingEstimate <= originalAvailable ? 15 : 8;
    const staffwidth = geometry.width - margin * 2;
    if (!Number.isFinite(staffwidth) || staffwidth <= 0 || staffwidth + margin * 2 !== geometry.width)
      return finish(original, 'viewport-budget');
    diagnostic.originalUnits = before.systems; diagnostic.plannedUnits = systems;
    diagnostic.layout = { requestedStaffwidth: options.staffwidth, originalViewport: geometry.width,
      originalAvailable, openingEstimate, staffwidth, paddingleft: margin, paddingright: margin };
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const { wrap: _wrap, ...explicit } = options;
    const candidate = abcjs.renderAbc(host, parser, { ...explicit, staffwidth, paddingleft: margin, paddingright: margin,
      lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && readPsalter433OpeningIdentity(candidate[0], parser);
    if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems))
      diagnostic.reason = 'candidate-identity';
    else {
      preserveBlankLyricRows(host);
      if (!normalizeScreenCandidateViewport(host, candidate[0], after, geometry)) diagnostic.reason = 'candidate-viewport';
      else {
        containScreenSvgSystems(host);
        const next = readScreenScoreGeometry(host, after, true);
        const nextPadding = candidate[0].engraver?.renderer?.padding;
        if (!next || !sameScreenScoreGeometry(geometry, next) || next.width !== geometry.width ||
          candidate[0].engraver?.width !== staffwidth || nextPadding?.left !== margin || nextPadding.right !== margin)
          diagnostic.reason = 'candidate-geometry';
        else {
          const captured = captureLyricTypography(host, after.notes, next);
          const proof = captured && verifyLyricTypography(host, typography, captured, { preserveNaturalWidth: true });
          diagnostic.typography = proof;
          if (proof?.valid) { diagnostic.result = 'candidate'; return finish(candidate, 'accepted'); }
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
  return finish(original, String(diagnostic.reason));
}
