import { IT_IS_WELL_OPENING_ID, hasItIsWellOpeningSource, itIsWellOpeningWrappedNotation, readItIsWellOpeningIdentity, itIsWellOpeningTiePaths } from './itIsWellOpeningSource';
import { O_LOVE_OPENING_ID, hasOLoveOpeningSource, oLoveOpeningWrappedNotation, readOLoveOpeningIdentity } from './oLoveOpeningSource';
import type { CompleteInTheeScreenFit } from './completeInTheeWrap';
import { OH_HOW_OPENING_ID, hasOhHowOpeningSource, ohHowOpeningWrappedNotation, readOhHowOpeningIdentity } from './ohHowOpeningSource';
import { SANDS_OPENING_ID, hasSandsOpeningSource, sandsOpeningWrappedNotation, readSandsOpeningIdentity } from './sandsOpeningSource';
import { GOD_LEADS_OPENING_ID, hasGodLeadsOpeningSource, godLeadsOpeningWrappedNotation, readGodLeadsOpeningIdentity } from './godLeadsOpeningSource';
import { SWEET_HOUR_OPENING_ID, hasSweetHourOpeningSource, sweetHourOpeningWrappedNotation, readSweetHourOpeningIdentity } from './sweetHourOpeningSource';
import { ONLY_TRUST_OPENING_ID, hasOnlyTrustOpeningSource, onlyTrustOpeningWrappedNotation, readOnlyTrustOpeningIdentity } from './onlyTrustOpeningSource';
import { HE_LEADETH_OPENING_ID, hasHeLeadethOpeningSource, heLeadethOpeningWrappedNotation, readHeLeadethOpeningIdentity } from './heLeadethOpeningSource';
import abcjs from 'abcjs';
import type EngraverController from 'abcjs/src/write/engraver-controller';
import { normalizeScreenCandidateViewport, readScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

import { MELITA_OPENING_ID, hasMelitaOpeningSource, melitaOpeningWrappedNotation, readMelitaOpeningIdentity } from './melitaOpeningSource';
import { CORONATION_OPENING_ID, hasCoronationOpeningSource, coronationOpeningWrappedNotation, readCoronationOpeningIdentity } from './coronationOpeningSource';
import { SAVIORS_LOVE_OPENING_ID, hasSaviorsLoveOpeningSource, saviorsLoveOpeningWrappedNotation, readSaviorsLoveOpeningIdentity } from './saviorsLoveOpeningSource';
import { MIGHTY_FORTRESS_OPENING_ID, hasMightyFortressOpeningSource, mightyFortressOpeningWrappedNotation, readMightyFortressOpeningIdentity } from './mightyFortressOpeningSource';
import { FAITH_OPENING_ID, hasFaithOpeningSource, hasFaithOpeningReviewedNotation, faithOpeningWrappedNotation, readFaithOpeningIdentity } from './faithOpeningSource';
import { HIDETH_OPENING_ID, hasHidethOpeningSource, hidethOpeningWrappedNotation, readHidethOpeningIdentity } from './hidethOpeningSource';
import { CHURCH_OPENING_ID, hymnOpeningEdition, hasHymnOpeningSource, hymnOpeningWrappedNotation, readHymnOpeningIdentity } from './hymnOpeningSource';
import { getPublishedStanzaVariant } from '../../domain/publishedStanzaVariant';
import { allCreaturesGroupingWrappedNotation, readAllCreaturesGroupingIdentity, supportsAllCreaturesGroupingOptions } from './allCreaturesGroupingWrap';

const ATTRIBUTE = 'data-hymn-opening-wrap';
const O_LOVE_ATTRIBUTE = 'data-o-love-opening-wrap';
const SWEET_HOUR_ATTRIBUTE = 'data-sweet-hour-opening-wrap';
const ONLY_TRUST_ATTRIBUTE = 'data-only-trust-opening-wrap';
const HE_LEADETH_ATTRIBUTE = 'data-he-leadeth-opening-wrap';
const MELITA_ATTRIBUTE = 'data-melita-opening-wrap';
const CORONATION_ATTRIBUTE = 'data-coronation-opening-wrap';
const SAVIORS_LOVE_ATTRIBUTE = 'data-saviors-love-opening-wrap';
const MIGHTY_FORTRESS_ATTRIBUTE = 'data-mighty-fortress-opening-wrap';
const HIDETH_ATTRIBUTE = 'data-hideth-opening-wrap';
const FAITH_ATTRIBUTE = 'data-faith-opening-wrap';
const EPSILON = 0.05;
type Widths = { left: number; measureWidths: number[]; total: number };
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
export type HymnOpeningSettings = {
  requestedScale: number; scoreWidth: number; transpose: number; learnerAccidentals: boolean;
  visibleKey: string; stanzasPerGroup: number; grouped: boolean; musicOnly: boolean; repeatUnderlay: boolean; reviewedUnderlay: boolean;
};
type Status = 'not-checked' | 'match' | 'mismatch';
type Diagnostic = {
  version: 1; result: 'original' | 'candidate'; phase: string; reason: string; reasons: string[];
  engine: string; settings: HymnOpeningSettings;
  candidateEngraving: 'not-attempted' | 'attempted'; candidateGeometry: 'not-proven' | 'proven';
  identity: { canonical: Status; preparedParser: Status; original: Status; unbroken: Status; measured: Status; candidate?: Status };
  originalUnits?: number[][]; plannedUnits?: number[][]; requestedStaffwidth?: number; originalWidth?: number;
  complete?: Widths & { available: number; joinWidth: number; terminalWidth: number };
  measurementEngine?: 'abcjs-6.7.0-bundled-existing-cache';
  candidate?: { units?: number[][]; engravingStaffwidth: number; nativeWidth?: number;
    viewport?: { before: number; original: number; after?: number; systems: number; inkFits: boolean;
      minimumLeftMargin?: number; minimumRightMargin?: number; normalized: boolean } };
  geometryReason?: string;
  planning?: 'measured-width' | 'native-church-probe' | 'native-opening-probe';
  typography?: { rows: number; nativeControls: number; compared: number; measurements: number; valid: boolean };
};
function close(a: number, b: number) { return Math.abs(a - b) <= EPSILON; }
/** Delete only the first break, joining the entire next existing system.
 * Widths end at bar x positions; include its terminal glyph exactly once.
 * Unchanged systems still require full native candidate geometry proof. */
export function fitHymnOpeningSystems(systems: number[][], widths: number[], available: number, unitCount: number): number[][] | undefined {
  if (![9, 17].includes(unitCount)) return undefined;
  return fitOpeningSystems(systems, widths, available, unitCount);
}
export function fitHidethOpeningSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  return fitOpeningSystems(systems, widths, available, 21);
}
export function fitFaithOpeningSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  return fitOpeningSystems(systems, widths, available, 20);
}
export function fitMelitaOpeningSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  return fitOpeningSystems(systems, widths, available, 13);
}
export function fitCoronationOpeningSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  return fitOpeningSystems(systems, widths, available, 15);
}
export function fitOLoveOpeningSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  return fitOpeningSystems(systems, widths, available, 11);
}
function fitOpeningSystems(systems: number[][], widths: number[], available: number, unitCount: number): number[][] | undefined {
  if (systems.length < 2 || systems.some(system => !system.length) ||
    systems.flat().length !== unitCount || systems.flat().some((unit, index) => unit !== index) ||
    widths.length !== unitCount || widths.some(width => !Number.isFinite(width) || width <= 0) ||
    !Number.isFinite(available) || available <= 0 || systems[0].length !== 1 || systems[0][0] !== 0 || systems[1][0] !== 1) return undefined;
  const joined = [0, ...systems[1]];
  const terminal = joined.at(-1) === unitCount - 1 ? 8 : 1;
  if (joined.reduce((sum, unit) => sum + widths[unit], 0) + terminal > available + EPSILON) return undefined;
  return [joined, ...systems.slice(2).map(system => [...system])];
}
function validWidths(widths: Widths | undefined, count: number): widths is Widths {
  return !!widths && Number.isFinite(widths.left) && widths.left >= 15 &&
    Array.isArray(widths.measureWidths) && widths.measureWidths.length === count &&
    widths.measureWidths.every(width => Number.isFinite(width) && width > 0) && Number.isFinite(widths.total) &&
    close(widths.total, widths.measureWidths.reduce((sum, width) => sum + width, 0));
}
function settingReasons(settings: HymnOpeningSettings, stanzas: number, grouped = false) {
  const reasons: string[] = [];
  if (settings.visibleKey !== '0,1,2,3') reasons.push('parts');
  if (settings.stanzasPerGroup !== stanzas) reasons.push('stanzas');
  if (settings.transpose !== 0) reasons.push('transpose');
  if (settings.learnerAccidentals) reasons.push('learner');
  if (settings.grouped !== grouped) reasons.push('grouping');
  if (settings.musicOnly) reasons.push('music-only');
  if (settings.repeatUnderlay || (grouped ? !settings.reviewedUnderlay : settings.reviewedUnderlay)) reasons.push('alternate-underlay');
  if (!Number.isFinite(settings.requestedScale) || settings.requestedScale <= 0 ||
    !Number.isFinite(settings.scoreWidth) || settings.scoreWidth <= 0) reasons.push('requested-size');
  return reasons;
}
export function clearHymnOpeningWrap(host: HTMLElement | null) {
  host?.removeAttribute(ATTRIBUTE);
}
type OpeningAdapter = {
  units: number; slurs: number; ties: number; stanzas: number;
  grouped?: boolean;
  source: (abc: string) => boolean; wrapped: (abc: string) => string | undefined;
  read: (tune: abcjs.TuneObject, abc: string) => ReturnType<typeof readHymnOpeningIdentity>;
  fit: (systems: number[][], widths: number[], available: number) => number[][] | undefined;
};
// Only these pinned source adapters can enter the common rendering transaction.
// The established hymn path retains its own reader, planner and zero-tie gate.
function hymnAdapter(songId: string | undefined): OpeningAdapter | undefined {
  const edition = hymnOpeningEdition(songId);
  return edition && { units: edition.units, slurs: edition.slurs, ties: 0, stanzas: 5,
    source: abc => hasHymnOpeningSource(songId, abc), wrapped: abc => hymnOpeningWrappedNotation(songId, abc),
    read: (tune, abc) => readHymnOpeningIdentity(songId, tune, abc),
    fit: (systems, widths, available) => fitHymnOpeningSystems(systems, widths, available, edition.units) };
}
function hidethAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === HIDETH_OPENING_ID ? { units: 21, slurs: 3, ties: 17, stanzas: 4,
    source: abc => hasHidethOpeningSource(songId, abc), wrapped: hidethOpeningWrappedNotation,
    read: readHidethOpeningIdentity, fit: fitHidethOpeningSystems } : undefined;
}
function faithAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === FAITH_OPENING_ID ? { units: 20, slurs: 2, ties: 0, stanzas: 4,
    source: abc => hasFaithOpeningSource(songId, abc), wrapped: faithOpeningWrappedNotation,
    read: readFaithOpeningIdentity, fit: fitFaithOpeningSystems } : undefined;
}
function melitaAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === MELITA_OPENING_ID ? { units: 13, slurs: 0, ties: 0, stanzas: 1,
    source: abc => hasMelitaOpeningSource(songId, abc), wrapped: melitaOpeningWrappedNotation,
    read: readMelitaOpeningIdentity, fit: fitMelitaOpeningSystems } : undefined;
}
function coronationAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === CORONATION_OPENING_ID ? { units: 15, slurs: 4, ties: 0, stanzas: 5,
    source: abc => hasCoronationOpeningSource(songId, abc), wrapped: coronationOpeningWrappedNotation,
    read: readCoronationOpeningIdentity, fit: fitCoronationOpeningSystems } : undefined;
}
function saviorsLoveAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === SAVIORS_LOVE_OPENING_ID ? { units: 17, slurs: 0, ties: 0, stanzas: 1,
    source: abc => hasSaviorsLoveOpeningSource(songId, abc), wrapped: saviorsLoveOpeningWrappedNotation,
    read: readSaviorsLoveOpeningIdentity,
    fit: (systems, widths, available) => fitHymnOpeningSystems(systems, widths, available, 17) } : undefined;
}
function mightyFortressAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === MIGHTY_FORTRESS_OPENING_ID ? { units: 17, slurs: 15, ties: 0, stanzas: 4,
    source: abc => hasMightyFortressOpeningSource(songId, abc), wrapped: mightyFortressOpeningWrappedNotation,
    read: readMightyFortressOpeningIdentity,
    fit: (systems, widths, available) => fitHymnOpeningSystems(systems, widths, available, 17) } : undefined;
}
function oLoveAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === O_LOVE_OPENING_ID ? { units: 11, slurs: 5, ties: 0, stanzas: 4,
    source: abc => hasOLoveOpeningSource(songId, abc), wrapped: oLoveOpeningWrappedNotation,
    read: readOLoveOpeningIdentity, fit: fitOLoveOpeningSystems } : undefined;
}
export function clearOLoveOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(O_LOVE_ATTRIBUTE); }
export function clearMelitaOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(MELITA_ATTRIBUTE); }
export function clearCoronationOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(CORONATION_ATTRIBUTE); }
export function clearSaviorsLoveOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(SAVIORS_LOVE_ATTRIBUTE); }
export function clearMightyFortressOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(MIGHTY_FORTRESS_ATTRIBUTE); }
export function clearFaithOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(FAITH_ATTRIBUTE); }
export function clearHidethOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(HIDETH_ATTRIBUTE); }
function reportSettings(host: HTMLElement | null, adapter: OpeningAdapter | undefined, settings: HymnOpeningSettings, attribute: string) {
  host?.removeAttribute(attribute);
  if (!host || !adapter) return;
  const reasons = settingReasons(settings, adapter.stanzas, adapter.grouped);
  const diagnostic: Diagnostic = { version: 1, result: 'original', phase: 'settings',
    reason: reasons.length ? 'unsupported-settings' : 'render-unavailable', reasons, engine: abcjs.signature,
    settings: { ...settings }, candidateEngraving: 'not-attempted', candidateGeometry: 'not-proven',
    identity: { canonical: 'not-checked', preparedParser: 'not-checked', original: 'not-checked', unbroken: 'not-checked', measured: 'not-checked' } };
  try { host.setAttribute(attribute, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
  return diagnostic;
}
export function reportHymnOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, hymnAdapter(songId), settings, ATTRIBUTE);
}
export function reportHidethOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, hidethAdapter(songId), settings, HIDETH_ATTRIBUTE);
}
export function reportFaithOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, faithAdapter(songId), settings, FAITH_ATTRIBUTE);
}
export function reportMelitaOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, melitaAdapter(songId), settings, MELITA_ATTRIBUTE);
}
export function reportCoronationOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, coronationAdapter(songId), settings, CORONATION_ATTRIBUTE);
}
export function reportSaviorsLoveOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, saviorsLoveAdapter(songId), settings, SAVIORS_LOVE_ATTRIBUTE);
}
export function reportMightyFortressOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, mightyFortressAdapter(songId), settings, MIGHTY_FORTRESS_ATTRIBUTE);
}
export function reportOLoveOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, oLoveAdapter(songId), settings, O_LOVE_ATTRIBUTE);
}
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: HymnOpeningSettings) {
  return host.isConnected && !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches &&
    !options.print && !host.closest('.print-score-canvas') && !!options.wrap && !options.lineBreaks &&
    options.oneSvgPerLine === true && options.responsive === 'resize' && options.scale === 1 && options.minPadding === 6 &&
    (options.visualTranspose ?? 0) === 0 && !options.format && !options.expandToWidest && !options.timeBasedLayout &&
    !options.tablature && !options.viewportHorizontal && !options.viewportVertical &&
    Number.isFinite(options.staffwidth) && options.staffwidth! > 0 &&
    close(options.staffwidth!, settings.scoreWidth / settings.requestedScale) &&
    options.paddingleft === undefined && options.paddingright === undefined &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0 &&
    options.wrap.minSpacingLimit === undefined && options.wrap.lastLineLimit === undefined;
}
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


/** ABCJS may promote small spacing overshoots into a wider global viewport.
 * Reclaim only proven empty outer margin from this single rendered candidate.
 * Every root must have finite positive native ink fitting the original x/width
 * with the existing two-unit padding. The shared helper independently validates
 * all SVG/wrapper structure and changes only viewBox width; full geometry and
 * typography checks below remain mandatory after it restores the old frame. */
function restoreOriginalViewport(host: HTMLElement, tune: abcjs.TuneObject,
  score: NonNullable<ReturnType<typeof readHymnOpeningIdentity>>, original: Geometry,
  native: Geometry, diagnostic: Diagnostic) {
  if (native.left !== original.left || !Number.isFinite(native.width) || native.width <= original.width) return false;
  const svgs = [...host.querySelectorAll('svg')];
  const proof = diagnostic.candidate!.viewport = { before: native.width, original: original.width,
    systems: svgs.length, inkFits: false, normalized: false } as NonNullable<NonNullable<Diagnostic['candidate']>['viewport']>;
  if (svgs.length !== score.systems.length || !sameViewport(host, native, score.systems.length)) return false;
  let left = Infinity, right = Infinity;
  for (const svg of svgs) {
    const ink = svg.getBBox();
    if (![ink.x, ink.y, ink.width, ink.height].every(Number.isFinite) || ink.width <= 0 || ink.height <= 0) return false;
    left = Math.min(left, ink.x - 2 - original.left);
    right = Math.min(right, original.left + original.width - ink.x - ink.width - 2);
  }
  if (!Number.isFinite(left) || !Number.isFinite(right)) return false;
  proof.minimumLeftMargin = left; proof.minimumRightMargin = right;
  if (left < 0 || right < 0) return false;
  proof.inkFits = true;
  proof.normalized = normalizeScreenCandidateViewport(host, tune, score, original);
  if (proof.normalized) proof.after = svgs[0].viewBox.baseVal.width;
  return proof.normalized;
}

/** Screen-only and one-break-only. Native complete-unit widths plan a join;
 * the pinned Church edition also permits one bounded native probe when that
 * estimate is conservative. Every native candidate must retain the ordinary
 * physical-size envelope, every head/row/staff, six-unit lyric clearance and
 * independent typography controls. Proven empty outer margin may be reclaimed
 * to the original viewport; no glyph coordinates, fonts or transforms change.
 * Every decline restores the original listener-bearing nodes and tune. */
export function reflowHymnOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, hymnAdapter(songId), ATTRIBUTE);
}
/** The published All Creatures groups have their own exact byte/voice/row
 * witnesses. Compose after the existing width repair and remove only the
 * opening break when the entire following system passes the common native
 * width, identity, physical-size and typography proofs. */
export function reflowAllCreaturesOpeningScreenScore(host: HTMLElement, prepared: string, songId: string | undefined,
  options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray, canonical: string | undefined,
  requestedScale: number, scoreWidth: number, stanzasPerGroup: number): abcjs.TuneObjectArray {
  const attribute = 'data-all-creatures-opening-wrap';
  host.removeAttribute(attribute);
  if (songId !== 'hymn-oh_all-creatures-of-our-god-and-king-lasst-uns-erfreuen' || !canonical ||
    ![1, 2, 3, 4].includes(stanzasPerGroup) || !supportsAllCreaturesGroupingOptions(host, options)) return original;
  const adapter: OpeningAdapter = { units: 17, slurs: 40, ties: 0, stanzas: stanzasPerGroup, grouped: true,
    source: abc => !!getPublishedStanzaVariant(songId, abc), wrapped: allCreaturesGroupingWrappedNotation,
    read: readAllCreaturesGroupingIdentity,
    fit: (systems, widths, available) => fitHymnOpeningSystems(systems, widths, available, 17) };
  return reflowOpening(host, host, canonical, prepared, songId, options, original,
    { requestedScale, scoreWidth, stanzasPerGroup, transpose: 0, learnerAccidentals: false,
      visibleKey: '0,1,2,3', grouped: true, musicOnly: false, repeatUnderlay: false, reviewedUnderlay: true }, adapter, attribute);
}
/** Compose only after the existing uncapped width correction passes its own
 * native proof. Capped/failed repairs retain their tune, nodes and fit report;
 * this separate opening attempt cannot change the established size ceiling. */
export function reflowOLoveOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings, fit: CompleteInTheeScreenFit | undefined): abcjs.TuneObjectArray {
  const adapter = oLoveAdapter(songId);
  if (!fit?.accepted || fit.limited || fit.requestedStaffwidth !== options.staffwidth || fit.effectiveStaffwidth !== options.staffwidth) {
    const diagnostic = reportSettings(diagnosticHost, adapter, settings, O_LOVE_ATTRIBUTE);
    if (diagnostic && !diagnostic.reasons.length) {
      diagnostic.phase = 'width-correction';
      diagnostic.reason = fit?.accepted && fit.limited ? 'width-correction-limited' : 'width-correction-unaccepted';
      try { diagnosticHost!.setAttribute(O_LOVE_ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    }
    return original;
  }
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, adapter, O_LOVE_ATTRIBUTE);
}
export function reflowHidethOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, hidethAdapter(songId), HIDETH_ATTRIBUTE);
}
export function reflowFaithOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, faithAdapter(songId), FAITH_ATTRIBUTE);
}
export function reflowMelitaOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, melitaAdapter(songId), MELITA_ATTRIBUTE);
}
export function reflowCoronationOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, coronationAdapter(songId), CORONATION_ATTRIBUTE);
}
export function reflowSaviorsLoveOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, saviorsLoveAdapter(songId), SAVIORS_LOVE_ATTRIBUTE);
}
export function reflowMightyFortressOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, mightyFortressAdapter(songId), MIGHTY_FORTRESS_ATTRIBUTE);
}
function reflowOpening(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings, edition: OpeningAdapter | undefined, attribute: string): abcjs.TuneObjectArray {
  const diagnostic = reportSettings(diagnosticHost, edition, settings, attribute);
  if (!diagnostic || !edition) return original;
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost!.setAttribute(attribute, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    diagnostic.identity.canonical = edition.source(sourceAbc) ? 'match' : 'mismatch';
    if (diagnostic.identity.canonical !== 'match') return finish(original, 'canonical-source');
    // Faith's exact row-identity witness does not change this full-score ABC.
    // Qualify both source and preparation before clearing only that metadata veto.
    if (songId === FAITH_OPENING_ID && settings.reviewedUnderlay && !settings.repeatUnderlay &&
      hasFaithOpeningReviewedNotation(songId, sourceAbc, preparedAbc)) {
      diagnostic.reasons = diagnostic.reasons.filter(reason => reason !== 'alternate-underlay');
    }
    if (diagnostic.reasons.length) return finish(original, 'unsupported-settings');
    if (abcjs.signature !== 'abcjs-basic v6.7.0') return finish(original, 'engine-version');
    diagnostic.phase = 'options';
    diagnostic.requestedStaffwidth = options.staffwidth;
    if (!supported(host, options, settings)) return finish(original, 'unsupported-options');
    const abc = edition.wrapped(preparedAbc);
    diagnostic.identity.preparedParser = abc === undefined ? 'mismatch' : 'match';
    if (abc === undefined) return finish(original, 'prepared-source');
    diagnostic.phase = 'original';
    const before = original.length === 1 && edition.read(original[0], abc);
    diagnostic.identity.original = before ? 'match' : 'mismatch';
    if (!before) return finish(original, 'original-identity');
    diagnostic.originalUnits = before.systems;
    if (before.systems[0].length !== 1 || before.systems[0][0] !== 0)
      return finish(original, 'pickup-already-paired');
    const staffwidth = options.staffwidth!;
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined) return finish(original, 'original-padding');
    diagnostic.phase = 'original-geometry';
    const geometry = readScreenScoreGeometry(host, before, false);
    const staves = staffSizes(host, before.systems.length);
    if (!geometry || !sameViewport(host, geometry, before.systems.length) || !staves || staves.some(size =>
      !close(size.local, staves[0].local) || !close(size.screen, staves[0].screen)) || geometry.width < staffwidth + 30 - EPSILON)
      return finish(original, 'original-geometry');
    if (host.querySelectorAll('path[data-name="slur"]').length !== edition.slurs ||
      host.querySelectorAll('path[data-name="tie"]').length !== edition.ties) return finish(original, 'original-slurs');
    diagnostic.originalWidth = geometry.width;
    const nativeStaffwidth = geometry.width - 30;
    const { wrap: _wrap, afterParsing: _afterParsing, clickListener: _clickListener, ...measurement } = options;
    const unbroken = { ...measurement, staffwidth: nativeStaffwidth, lineBreaks: [[]] as unknown as number[] };
    diagnostic.phase = 'measurement';
    const flatTunes = abcjs.parseOnly(abc, unbroken);
    const flat = flatTunes.length === 1 && edition.read(flatTunes[0], abc);
    diagnostic.identity.unbroken = flat && flat.signature === before.signature && flat.systems.length === 1 ? 'match' : 'mismatch';
    if (!flat || diagnostic.identity.unbroken !== 'match') return finish(original, 'measurement-identity');
    const measurementHost = host.ownerDocument.createElement('div');
    measurementHost.setAttribute('style', 'visibility: hidden;');
    let sections: Widths[], controller: EngraverController | undefined, usedFallback = false;
    const BundledController = (abcjs as typeof abcjs & { test?: { EngraverController?: typeof EngraverController } }).test?.EngraverController;
    if (typeof BundledController !== 'function') return finish(original, 'measurement-engine');
    try {
      host.ownerDocument.body.appendChild(measurementHost);
      controller = new BundledController(measurementHost, unbroken);
      diagnostic.measurementEngine = 'abcjs-6.7.0-bundled-existing-cache';
      sections = controller.getMeasureWidths(flatTunes[0]);
      usedFallback = !!controller.renderer.paper.dummySvg;
    } finally {
      try { controller?.renderer.paper.dummySvg?.remove(); }
      finally { measurementHost.remove(); }
    }
    if (usedFallback) return finish(original, 'measurement-native-text');
    const measured = edition.read(flatTunes[0], abc);
    diagnostic.identity.measured = measured && measured.signature === before.signature ? 'match' : 'mismatch';
    if (diagnostic.identity.measured !== 'match') return finish(original, 'measurement-identity');
    const widths = sections[0];
    if (sections.length !== 1 || !validWidths(widths, edition.units)) return finish(original, 'measurement-widths');
    const available = nativeStaffwidth - (widths.left - 15);
    const joined = [0, ...before.systems[1]];
    const terminalWidth = joined.at(-1) === edition.units - 1 ? 8 : 1;
    diagnostic.complete = { ...widths, measureWidths: [...widths.measureWidths], available, terminalWidth,
      joinWidth: joined.reduce((sum, item) => sum + widths.measureWidths[item], terminalWidth) };
    diagnostic.phase = 'planner';
    let systems = edition.fit(before.systems, widths.measureWidths, available);
    if (systems) diagnostic.planning = 'measured-width';
    // getMeasureWidths describes the unbroken engraving, not a lower bound
    // for this exact two-unit system. Native Church captures at 410 CSS px
    // retain an isolated pickup even though the complete [0,1] join passes
    // every unchanged ink, physical-size, source and typography check below.
    // Probe only these pinned editions' pickup plus one whole following bar;
    // never split a bar, borrow part of another system, or widen the original
    // viewport. This is one provisional engraving, not a fit acceptance.
    if (!systems && (songId === CHURCH_OPENING_ID || songId === SANDS_OPENING_ID || songId === CORONATION_OPENING_ID ||
      songId === HE_LEADETH_OPENING_ID || songId === FAITH_OPENING_ID || songId === SWEET_HOUR_OPENING_ID) && before.systems[1]?.length === 1 && before.systems[1][0] === 1) {
      systems = [[0, 1], ...before.systems.slice(2).map(system => [...system])];
      diagnostic.planning = songId === CHURCH_OPENING_ID ? 'native-church-probe' : 'native-opening-probe';
    }
    if (!systems) return finish(original, 'no-fitting-forward-join');
    diagnostic.plannedUnits = systems;
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'original-typography');
    retained = [...host.childNodes];
    attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    diagnostic.phase = 'candidate-render'; diagnostic.candidateEngraving = 'attempted';
    const { wrap: _automatic, ...explicit } = options;
    const candidate = abcjs.renderAbc(host, abc, { ...explicit, staffwidth: nativeStaffwidth,
      lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && edition.read(candidate[0], abc);
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
      if (!nativeGeometry || nativeGeometry.left !== geometry.left ||
        (nativeGeometry.width !== geometry.width && !restoreOriginalViewport(host, candidate[0], after, geometry, nativeGeometry, diagnostic)) ||
        !sameViewport(host, geometry, after.systems.length)) diagnostic.reason = 'candidate-viewport';
      else {
        const geometryDiagnostic: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = {
          version: 1, song: songId!, phase: 'candidate-geometry', result: 'original',
        };
        const finalGeometry = readScreenScoreGeometry(host, after, true, geometryDiagnostic);
        const finalStaves = staffSizes(host, after.systems.length);
        diagnostic.geometryReason = geometryDiagnostic.reason;
        if (host.querySelectorAll('path[data-name="slur"]').length !== edition.slurs ||
          host.querySelectorAll('path[data-name="tie"]').length !== edition.ties) diagnostic.reason = 'candidate-slurs';
        else if (!finalGeometry || !samePhysicalSize(geometry, finalGeometry) || !finalStaves || finalStaves.some(size =>
          !close(size.local, staves[0].local) || !close(size.screen, staves[0].screen)) ||
          candidate[0].engraver?.width !== nativeStaffwidth || candidate[0].engraver?.renderer?.padding?.left !== 15 ||
          candidate[0].engraver?.renderer?.padding?.right !== 15) diagnostic.reason = 'candidate-geometry';
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

function heLeadethAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === HE_LEADETH_OPENING_ID ? { units: 17, slurs: 0, ties: 0, stanzas: 1,
    source: abc => hasHeLeadethOpeningSource(songId, abc), wrapped: heLeadethOpeningWrappedNotation,
    read: readHeLeadethOpeningIdentity,
    fit: (systems, widths, available) => fitHymnOpeningSystems(systems, widths, available, 17) } : undefined;
}

export function clearHeLeadethOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(HE_LEADETH_ATTRIBUTE); }

export function reportHeLeadethOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, heLeadethAdapter(songId), settings, HE_LEADETH_ATTRIBUTE);
}

export function reflowHeLeadethOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, heLeadethAdapter(songId), HE_LEADETH_ATTRIBUTE);
}

function onlyTrustAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === ONLY_TRUST_OPENING_ID ? { units: 17, slurs: 4, ties: 0, stanzas: 1,
    source: abc => hasOnlyTrustOpeningSource(songId, abc), wrapped: onlyTrustOpeningWrappedNotation,
    read: readOnlyTrustOpeningIdentity,
    fit: (systems, widths, available) => fitHymnOpeningSystems(systems, widths, available, 17) } : undefined;
}

export function clearOnlyTrustOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(ONLY_TRUST_ATTRIBUTE); }

export function reportOnlyTrustOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, onlyTrustAdapter(songId), settings, ONLY_TRUST_ATTRIBUTE);
}

export function reflowOnlyTrustOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, onlyTrustAdapter(songId), ONLY_TRUST_ATTRIBUTE);
}

function sweetHourAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === SWEET_HOUR_OPENING_ID ? { units: 20, slurs: 9, ties: 0, stanzas: 4,
    source: abc => hasSweetHourOpeningSource(songId, abc), wrapped: sweetHourOpeningWrappedNotation,
    read: readSweetHourOpeningIdentity, fit: fitFaithOpeningSystems } : undefined;
}

export function clearSweetHourOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(SWEET_HOUR_ATTRIBUTE); }

export function reportSweetHourOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, sweetHourAdapter(songId), settings, SWEET_HOUR_ATTRIBUTE);
}

export function reflowSweetHourOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, sweetHourAdapter(songId), SWEET_HOUR_ATTRIBUTE);
}

const GOD_LEADS_ATTRIBUTE = 'data-god-leads-opening-wrap';
function godLeadsAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === GOD_LEADS_OPENING_ID ? { units: 17, slurs: 4, ties: 10, stanzas: 4,
    source: abc => hasGodLeadsOpeningSource(songId, abc), wrapped: godLeadsOpeningWrappedNotation,
    read: readGodLeadsOpeningIdentity,
    fit: (systems, widths, available) => fitHymnOpeningSystems(systems, widths, available, 17) } : undefined;
}
export function clearGodLeadsOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(GOD_LEADS_ATTRIBUTE); }
export function reportGodLeadsOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, godLeadsAdapter(songId), settings, GOD_LEADS_ATTRIBUTE);
}
export function reflowGodLeadsOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, godLeadsAdapter(songId), GOD_LEADS_ATTRIBUTE);
}

const SANDS_ATTRIBUTE = 'data-sands-opening-wrap';
function sandsAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === SANDS_OPENING_ID ? { units: 17, slurs: 7, ties: 0, stanzas: 4,
    source: abc => hasSandsOpeningSource(songId, abc), wrapped: sandsOpeningWrappedNotation,
    read: readSandsOpeningIdentity,
    fit: (systems, widths, available) => fitHymnOpeningSystems(systems, widths, available, 17) } : undefined;
}
export function clearSandsOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(SANDS_ATTRIBUTE); }
export function reportSandsOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, sandsAdapter(songId), settings, SANDS_ATTRIBUTE);
}
export function reflowSandsOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, sandsAdapter(songId), SANDS_ATTRIBUTE);
}

const OH_HOW_ATTRIBUTE = 'data-oh-how-opening-wrap';
export function fitOhHowOpeningSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  return fitOpeningSystems(systems, widths, available, 23);
}
function ohHowAdapter(songId: string | undefined): OpeningAdapter | undefined {
  return songId === OH_HOW_OPENING_ID ? { units: 23, slurs: 7, ties: 9, stanzas: 1,
    source: abc => hasOhHowOpeningSource(songId, abc), wrapped: ohHowOpeningWrappedNotation,
    read: readOhHowOpeningIdentity, fit: fitOhHowOpeningSystems } : undefined;
}
export function clearOhHowOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(OH_HOW_ATTRIBUTE); }
export function reportOhHowOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, ohHowAdapter(songId), settings, OH_HOW_ATTRIBUTE);
}
/** Compose after the existing unit-18 pickup transaction. Its retained tune
 * and listener-bearing nodes are this transaction's baseline. The unchanged
 * opening planner deletes only the first break and preserves every later
 * system, including any already accepted [17,18] pickup join. */
export function reflowOhHowOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings, ohHowAdapter(songId), OH_HOW_ATTRIBUTE);
}

const IT_IS_WELL_ATTRIBUTE = 'data-it-is-well-opening-wrap';
export function fitItIsWellOpeningSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  const joined = fitOpeningSystems(systems, widths, available, 22);
  return joined && JSON.stringify(joined.slice(1)) === JSON.stringify(systems.slice(2)) &&
    itIsWellOpeningTiePaths(joined) === itIsWellOpeningTiePaths(systems) ? joined : undefined;
}
function itIsWellAdapter(songId: string | undefined, ties = -1): OpeningAdapter | undefined {
  return songId === IT_IS_WELL_OPENING_ID ? { units: 22, slurs: 1, ties, stanzas: 1,
    source: abc => hasItIsWellOpeningSource(songId, abc), wrapped: itIsWellOpeningWrappedNotation,
    read: readItIsWellOpeningIdentity, fit: fitItIsWellOpeningSystems } : undefined;
}
export function clearItIsWellOpeningWrap(host: HTMLElement | null) { host?.removeAttribute(IT_IS_WELL_ATTRIBUTE); }
export function reportItIsWellOpeningSettings(host: HTMLElement | null, songId: string | undefined, settings: HymnOpeningSettings) {
  return reportSettings(host, itIsWellAdapter(songId), settings, IT_IS_WELL_ATTRIBUTE);
}
export function reflowItIsWellOpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  // Bind the scalar tie-path check to the exact original source partition.
  // Keep the common transaction and its candidate partition equality unchanged.
  let ties = -1;
  try { if (hasItIsWellOpeningSource(songId, sourceAbc)) {
    const parser = itIsWellOpeningWrappedNotation(preparedAbc);
    const before = parser !== undefined && original.length === 1 && readItIsWellOpeningIdentity(original[0], parser);
    if (before) ties = itIsWellOpeningTiePaths(before.systems) ?? -1;
  } } catch { /* The common transaction reports the identity failure safely. */ }
  return reflowOpening(diagnosticHost, host, sourceAbc, preparedAbc, songId, options, original, settings,
    itIsWellAdapter(songId, ties), IT_IS_WELL_ATTRIBUTE);
}
