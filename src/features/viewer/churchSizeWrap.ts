import abcjs from 'abcjs';
import { CHURCH_OPENING_ID, hasHymnOpeningSource, hymnOpeningWrappedNotation, readHymnOpeningIdentity } from './hymnOpeningSource';
import type { HymnOpeningSettings } from './hymnOpeningWrap';
import { readScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

const ATTRIBUTE = 'data-church-size-wrap';
const EPSILON = 0.05;
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;

// Native 400px/110% has only this pair. Its full-bar engraving widens every
// responsive SVG from requested 382.727273 to 439.920105 units. Restrict the
// repair to the complete reviewed partition; no other pair is authorized.
const originalSystems = Array.from({ length: 16 }, (_, index) =>
  index < 8 ? [index] : index === 8 ? [8, 9] : [index + 1]);
export function splitChurchInflatedPair(systems: number[][]): number[][] | undefined {
  return JSON.stringify(systems) === JSON.stringify(originalSystems)
    ? systems.flatMap(system => system.length === 2 ? [[8], [9]] : [system]) : undefined;
}
export function clearChurchSizeWrap(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }

const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: HymnOpeningSettings) {
  return host.isConnected && !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches &&
    !host.closest('.print-score-canvas') && settings.visibleKey === '0,1,2,3' && settings.stanzasPerGroup === 5 &&
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
function sameSize(before: Geometry, after: Geometry, width: number) {
  const ratio = before.width / width;
  return ratio > 1 && close(after.width, width) && before.left === after.left && close(before.screenWidth, after.screenWidth) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const next = after.notes[index];
      return note.font === next.font && note.heads.length === next.heads.length && note.heads.every((head, i) =>
        close(head.width, next.heads[i].width) && close(head.height, next.heads[i].height) &&
        close(head.screenWidth * ratio, next.heads[i].screenWidth) && close(head.screenHeight * ratio, next.heads[i].screenHeight)) &&
        note.lyrics.length === next.lyrics.length && note.lyrics.every((row, i) => row.text === next.lyrics[i].text);
    });
}
function staffSizes(host: HTMLElement, count: number) {
  const svgs = [...host.querySelectorAll('svg')];
  if (svgs.length !== count) return undefined;
  const sizes = svgs.flatMap(svg => {
    const staves = [...svg.querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')];
    return staves.length === 2 ? staves.map(staff => ({ local: staff.getBBox().height, screen: staff.getBoundingClientRect().height })) : [];
  });
  return sizes.length === count * 2 && sizes.every(size => Number.isFinite(size.local) && size.local > 0 &&
    Number.isFinite(size.screen) && size.screen > 0 && close(size.local, sizes[0].local) && close(size.screen, sizes[0].screen))
    ? sizes[0] : undefined;
}
function pairCausesInflation(host: HTMLElement, requested: number, viewport: number) {
  const svgs = [...host.querySelectorAll('svg')];
  if (svgs.length !== 16) return false;
  for (let index = 0; index <= 8; index++) {
    const staves = [...svgs[index].querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')];
    if (staves.length !== 2) return false;
    const boxes = staves.map(staff => staff.getBBox());
    if (boxes.some(box => !close(box.x, 15) || !Number.isFinite(box.width) || box.width <= 0 || !Number.isFinite(box.height) || box.height <= 0) ||
      !close(boxes[0].width, boxes[1].width)) return false;
    if (index < 8 ? boxes[0].width > requested + EPSILON
      : boxes[0].width <= requested + EPSILON || !close(boxes[0].width + 30, viewport)) return false;
  }
  return true;
}

/** Exact Church source only. Split the measured overflowing real-bar pair at
 * unchanged requested engraving width. Never change source, SVG widths, fonts,
 * or shared guards; reject and restore original nodes if any proof is absent. */
export function refineChurchSizeScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  source: string, prepared: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  clearChurchSizeWrap(diagnosticHost);
  if (songId !== CHURCH_OPENING_ID) return original;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported', settings };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost?.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (!hasHymnOpeningSource(songId, source)) return finish(original, 'canonical-source');
    if (!supported(host, options, settings) || original.length !== 1) return finish(original, 'unsupported');
    const abc = hymnOpeningWrappedNotation(songId, prepared);
    if (!abc) return finish(original, 'prepared-source');
    const before = readHymnOpeningIdentity(songId, original[0], abc);
    const canonical = readHymnOpeningIdentity(songId, abcjs.parseOnly(abc, { lineBreaks: [[]] as unknown as number[] })[0], abc);
    if (!before || !canonical || before.signature !== canonical.signature) return finish(original, 'source-identity');
    const systems = splitChurchInflatedPair(before.systems);
    if (!systems) return finish(original, 'unaffected-systems');
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined) return finish(original, 'source-padding');
    const geometry = readScreenScoreGeometry(host, before, false), staff = staffSizes(host, before.systems.length);
    const width = options.staffwidth! + 30;
    if (!geometry || !staff || host.querySelector('path[data-name="slur"], path[data-name="tie"]')) return finish(original, 'source-geometry');
    diagnostic.widths = { original: geometry.width, requested: width };
    if (geometry.width <= width + EPSILON) return finish(original, 'no-inflation');
    if (!pairCausesInflation(host, options.staffwidth!, geometry.width)) return finish(original, 'unproven-overflow-pair');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'source-typography');
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    diagnostic.originalUnits = before.systems; diagnostic.plannedUnits = systems;
    const { wrap: _wrap, ...explicit } = options;
    host.replaceChildren();
    const candidate = abcjs.renderAbc(host, abc, { ...explicit,
      lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && readHymnOpeningIdentity(songId, candidate[0], abc);
    if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems) ||
      JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting)) diagnostic.reason = 'candidate-identity';
    else {
      preserveBlankLyricRows(host); containScreenSvgSystems(host);
      const next = readScreenScoreGeometry(host, after, true), nextStaff = staffSizes(host, systems.length);
      diagnostic.candidateWidth = next?.width;
      const padding = candidate[0].engraver?.renderer?.padding;
      if (!next || !sameSize(geometry, next, width) || !nextStaff || !close(staff.local, nextStaff.local) ||
        !close(staff.screen * geometry.width / width, nextStaff.screen) || host.querySelector('path[data-name="slur"], path[data-name="tie"]') ||
        candidate[0].engraver?.width !== options.staffwidth || padding?.left !== 15 || padding.right !== 15) diagnostic.reason = 'candidate-geometry';
      else {
        const nextTypography = captureLyricTypography(host, after.notes, next);
        const proof = nextTypography && verifyLyricTypography(host, typography, nextTypography);
        diagnostic.typography = proof;
        if (proof?.valid) { diagnostic.result = 'candidate'; return finish(candidate, 'accepted'); }
        diagnostic.reason = 'candidate-typography';
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
