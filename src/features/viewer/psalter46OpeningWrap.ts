import abcjs from 'abcjs';
import type { HymnOpeningSettings } from './hymnOpeningWrap';
import { normalizeScreenCandidateViewport, readScreenScoreGeometry, readScreenScoreIdentity, sameScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

const ATTRIBUTE = 'data-psalter46-opening-wrap';
const EPSILON = 0.05;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;

// Frozen canonical source e70c7738, including all voices and all four stanzas.
// A changed canonical edition must be qualified again, not inherited by import.
const SOURCE = `
T:The Coronation of Jesus Christ
C:FALCONER; Alexander B. Morton
O:Psalm 21, L. M.
M:4/4
L:1/8
K:C
%%score (T1 T2)(B1 B2)
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
V:T1
E2 | E3 A G E C D | E4-E | E E E | E3 c AE ^F2 | G4-G
w:1.~The King re-joic-eth in Thy strength, * In Thy sal-va-tion, Lord * Most High, *
w:2.~A king-ly crown Thou giv-est Him, * Thy bless-ings meet Him on * His ways; *
w:3.~With maj-es-ty and hon-or crowned, * How great His glo-ry in * Thy grace! *
w:4.~The King doth in Je-ho-vah trust, * His lov-ing-kind-ness He * hath proved; *
G A B | c4-c e e d | c4-c | c B A | c2 G2 G3 F | E6 |]
w:For Thou hast filled * His heart's de-sire, * His prayer Thy love doth not de-ny.
w:He asked for life, * and un-to Him * Thou gav-est end-less length of days.
w:For-ev-er blest, * Thou mak-est Him * With joy to live be-fore Thy face.
w:Con-fid-ing in * the Lord Most High * He stand-eth ev-er-more un-moved.
V:T2
C2 | C3 F E C C C | C4-C | C D D | C3 E E2 D2 | D4-D
G ^F =F | E4-E G G F | E4-E | E G F | G2 E2 D3 B, | C6 |]
V:B1
G,2 | G,3 G, G, G, E, F, | G,4-G, | G, ^G, G, | A,3 A, C2 C2 | B,4-B,
B, C D | C4-C C C B, | C4-C | C C C | C2 C2 B,3 G, | G,6 |]
V:B2
C,2 | C,3 C, C, C, C, C, | C,4-C, | C, B,, B,, | A,,3 A,, A,,2 D,2 | G,4-G,
G, G, G, | C4-C C G, G, | C,4-C, | C, E, F, | E,2 C,2 G,,3 G,, | C,6 |]
N:Copyright, 1901, by United Presbyterian Board of Publication. Used by per.
N:[Selected Stanzas]
`;
const PREPARED = SOURCE.replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '');
const WRAPPED = PREPARED.replace(/^[ \t\r\n]+/, '');
/** Reuse the immutable edition for the separately bounded lyric prototype. */
export function hasPsalter46OpeningSource(source: string) { return source === SOURCE; }
export function psalter46WrappedNotation(prepared: string): string | undefined {
  if (prepared !== PREPARED) return;
  const book = new abcjs.TuneBook(prepared);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === PREPARED.length - WRAPPED.length &&
    book.tunes[0].abc === WRAPPED.trimEnd() ? book.tunes[0].abc : undefined;
}
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
type NativeWidths = { left: number; measureWidths: number[]; total: number };

export function clearPsalter46OpeningWrap(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: HymnOpeningSettings) {
  return abcjs.signature === 'abcjs-basic v6.7.0' && host.isConnected &&
    !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches && !host.closest('.print-score-canvas') &&
    settings.requestedScale === 1 && settings.transpose === 0 && !settings.learnerAccidentals &&
    settings.visibleKey === '0,1,2,3' && settings.stanzasPerGroup === 4 && !settings.grouped && !settings.musicOnly &&
    !settings.repeatUnderlay && !settings.reviewedUnderlay && Number.isFinite(settings.scoreWidth) && settings.scoreWidth > 0 &&
    Number.isFinite(options.staffwidth) && close(options.staffwidth!, settings.scoreWidth) &&
    Object.keys(options).every(key => optionKeys.includes(key)) && options.accentAbove === true && options.add_classes === true &&
    options.oneSvgPerLine === true && options.minPadding === 6 && options.responsive === 'resize' && options.scale === 1 &&
    (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false && !!options.wrap &&
    Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}

/** One exact-source opening attempt after the ordinary guarded planner. Native
 * unit estimates can reject this pair even when the full engraving fits. Keep
 * those shared planning rules unchanged: this separate attempt earns acceptance
 * only through the same complete source, ink, clearance and physical-size proof,
 * plus independent native typography controls. No other boundary is moved. */
export function reflowPsalter46OpeningScreenScore(diagnosticHost: HTMLElement | null, host: HTMLElement,
  canonical: string, prepared: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: HymnOpeningSettings): abcjs.TuneObjectArray {
  clearPsalter46OpeningWrap(diagnosticHost);
  if (songId !== 'psalter46') return original;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported', settings };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost?.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (canonical !== SOURCE || prepared !== PREPARED) return finish(original, 'source');
    if (!supported(host, options, settings) || original.length !== 1) return finish(original, 'unsupported');
    const book = new abcjs.TuneBook(prepared);
    if (book.header || book.tunes.length !== 1 || book.tunes[0].startPos !== prepared.length - WRAPPED.length ||
      book.tunes[0].abc !== WRAPPED.trimEnd()) return finish(original, 'source-prefix');
    const before = readScreenScoreIdentity(original[0], WRAPPED);
    const source = readScreenScoreIdentity(abcjs.parseOnly(WRAPPED, { lineBreaks: [[]] as unknown as number[] })[0], WRAPPED);
    if (!before || !source || before.signature !== source.signature || before.units.length !== 11 || before.notes.length !== 145)
      return finish(original, 'source-identity');
    if (before.systems.length < 2 || JSON.stringify(before.systems.slice(0, 2)) !== '[[0],[1]]')
      return finish(original, 'unaffected-opening');
    const padding = original[0].engraver?.renderer?.padding;
    const section = (original[0] as abcjs.TuneObject & { explanation?: { widths?: NativeWidths; staffWidth?: number }[] }).explanation;
    const widths = section?.[0]?.widths;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined || section?.length !== 1 || section[0].staffWidth !== options.staffwidth ||
      !widths || !Number.isFinite(widths.left) || widths.left < padding.left || widths.left >= options.staffwidth! ||
      widths.measureWidths.length !== 11 || widths.measureWidths.some(width => !Number.isFinite(width) || width <= 0) ||
      !close(widths.measureWidths.reduce((sum, width) => sum + width, 0), widths.total)) return finish(original, 'native-widths');
    const geometry = readScreenScoreGeometry(host, before, false);
    if (!geometry) return finish(original, 'original-geometry');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'original-typography');
    const systems = [[0, 1], ...before.systems.slice(2).map(system => [...system])];
    const openingEstimate = widths.measureWidths[0] + widths.measureWidths[1];
    const originalAvailable = geometry.width - 30 - (widths.left - padding.left);
    // An already-inflated native viewport can fit with the ordinary margin.
    // Otherwise reclaim only the witnessed seven units on each side. Neither
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
    const candidate = abcjs.renderAbc(host, WRAPPED, { ...explicit, staffwidth, paddingleft: margin, paddingright: margin,
      lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && readScreenScoreIdentity(candidate[0], WRAPPED);
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
