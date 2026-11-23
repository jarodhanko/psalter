import abcjs from 'abcjs';
import { reflowPsalter433OpeningScreenScore } from './lordsPrayerOpeningWrap';
import type { HymnOpeningSettings } from './hymnOpeningWrap';
import { normalizeScreenCandidateViewport, readScreenScoreGeometry, readScreenScoreIdentity, sameScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

const ATTRIBUTE = 'data-psalter211-repeat-wrap';
const EPSILON = 0.05;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;

// Exact unchanged canonical and prepared repeat-underlay witnesses.
// Unknown revisions retain the ordinary renderer.
function witnessed(source: string, length: number, expected: bigint) {
  if (source.length !== length) return false;
  let hash = 14695981039346656037n;
  for (let i = 0; i < source.length; i++) hash = BigInt.asUintN(64, (hash ^ BigInt(source.charCodeAt(i))) * 1099511628211n);
  return hash === expected;
}
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
type NativeWidths = { left: number; measureWidths: number[]; total: number };

export function clearPsalter211RepeatWrap(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: HymnOpeningSettings) {
  return abcjs.signature === 'abcjs-basic v6.7.0' && host.isConnected &&
    !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches && !host.closest('.print-score-canvas') &&
    settings.requestedScale === 0.75 && settings.transpose === 0 && !settings.learnerAccidentals &&
    settings.visibleKey === '0,1,2,3' && settings.stanzasPerGroup === 3 && !settings.grouped && !settings.musicOnly &&
    settings.repeatUnderlay && !settings.reviewedUnderlay && Number.isFinite(settings.scoreWidth) && settings.scoreWidth >= 300 && settings.scoreWidth <= 450 &&
    Number.isFinite(options.staffwidth) && close(options.staffwidth!, settings.scoreWidth / 0.75) &&
    Object.keys(options).every(key => optionKeys.includes(key)) && options.accentAbove === true && options.add_classes === true &&
    options.oneSvgPerLine === true && options.minPadding === 6 && options.responsive === 'resize' && options.scale === 1 &&
    (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false && !!options.wrap &&
    Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.6 && options.wrap.maxSpacing === 3.2 && options.wrap.preferredMeasuresPerLine === 0;
}

/** Source-bound post-repeat reflow for the reported 75% phone setting.
 * Preserve every pre-repeat boundary, source event, lyric and physical glyph.
 * One bounded whole-unit candidate uses the existing geometry and typography
 * proofs; unsupported settings or failed proofs retain the original nodes. */
export function reflowPsalter211RepeatScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  canonical: string, prepared: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  clearPsalter211RepeatWrap(diagnosticHost);
  if (songId !== 'psalter211') return original;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported', settings };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost?.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (!witnessed(canonical, 1738, 0xe8a6ef68fa69a51bn) || !witnessed(prepared, 1779, 0x71aabb0811b6a5aan)) return finish(original, 'source');
    if (!supported(host, options, settings) || original.length !== 1) return finish(original, 'unsupported');
    const book = new abcjs.TuneBook(prepared);
    if (book.header || book.tunes.length !== 1) return finish(original, 'source-prefix');
    const parser = book.tunes[0].abc;
    const before = readScreenScoreIdentity(original[0], parser);
    const source = readScreenScoreIdentity(abcjs.parseOnly(parser, { lineBreaks: [[]] as unknown as number[] })[0], parser);
    if (!before || !source || before.signature !== source.signature || before.units.length !== 20)
      return finish(original, 'source-identity');
    if (JSON.stringify(before.systems) !== '[[0,1],[2,3],[4,5],[6,7],[8,9],[10,11],[12,13],[14,15],[16,17],[18,19]]')
      return finish(original, 'unaffected-partition');
    const padding = original[0].engraver?.renderer?.padding;
    const section = (original[0] as abcjs.TuneObject & { explanation?: { widths?: NativeWidths; staffWidth?: number }[] }).explanation;
    const widths = section?.[0]?.widths;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined || section?.length !== 1 || section[0].staffWidth !== options.staffwidth ||
      !widths || !Number.isFinite(widths.left) || widths.left < padding.left || widths.left >= options.staffwidth! ||
      widths.measureWidths.length !== 20 || widths.measureWidths.some(width => !Number.isFinite(width) || width <= 0) ||
      !close(widths.measureWidths.reduce((sum, width) => sum + width, 0), widths.total)) return finish(original, 'native-widths');
    const geometry = readScreenScoreGeometry(host, before, false);
    if (!geometry) return finish(original, 'original-geometry');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'original-typography');
    const systems = [...before.systems.slice(0, 5).map(system => [...system]), [10,11,12], [13,14], [15,16], [17,18,19]];
    const margin = 15;
    const staffwidth = geometry.width - margin * 2;
    const available = staffwidth - (widths.left - padding.left);
    if (!Number.isFinite(staffwidth) || staffwidth <= 0 || staffwidth !== options.staffwidth ||
      systems.slice(5).some(system => system.reduce((sum, index) => sum + widths.measureWidths[index], 0) > available))
      return finish(original, 'viewport-budget');
    diagnostic.originalUnits = before.systems; diagnostic.plannedUnits = systems;
    diagnostic.layout = { requestedStaffwidth: options.staffwidth, originalViewport: geometry.width,
      available, staffwidth, paddingleft: margin, paddingright: margin };
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const { wrap: _wrap, ...explicit } = options;
    const candidate = abcjs.renderAbc(host, parser, { ...explicit, staffwidth, paddingleft: margin, paddingright: margin,
      lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && readScreenScoreIdentity(candidate[0], parser);
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

// Keep the two exact-source repairs in one optional chunk, outside the common
// viewer closure. Each implementation retains its own source/settings guards.
export function reflowOptionalPsalterScreenScore(...args: Parameters<typeof reflowPsalter433OpeningScreenScore>) {
  return args[4] === 'psalter433' ? reflowPsalter433OpeningScreenScore(...args) : reflowPsalter211RepeatScreenScore(...args);
}
