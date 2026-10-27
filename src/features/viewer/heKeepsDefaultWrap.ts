import abcjs from 'abcjs';
import EngraverController from 'abcjs/src/write/engraver-controller';
import { HE_KEEPS_SIZE_ID, hasHeKeepsSizeSource, heKeepsDefaultWrappedNotation, readHeKeepsDefaultIdentity } from './heKeepsSizeSource';
import { projectHeKeepsDefault } from './heKeepsDefaultSource';
import { readScreenScoreGeometry } from './isolatedChordWrap';
import { readHeKeepsSizeStaves, sameSize, sourcePadding } from './heKeepsSizeWrap';
import { readHeKeepsDefaultInk, verifyHeKeepsDefaultInk } from './heKeepsDefaultInk';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';
import { readTwoHymnSizeArcs } from './twoHymnSizeArcs';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import type { HymnOpeningSettings } from './hymnOpeningWrap';

const ATTRIBUTE = 'data-he-keeps-default-wrap';
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= 0.05;
const systems = Array.from({ length: 16 }, (_, index) => [index]);
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
export function clearHeKeepsDefaultWrap(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }

function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: HymnOpeningSettings) {
  return host.isConnected && !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches &&
    !host.closest('.print-score-canvas') && settings.requestedScale === 1 && settings.transpose === 0 &&
    settings.visibleKey === '0,1,2,3' && settings.stanzasPerGroup === 5 && !settings.grouped &&
    !settings.musicOnly && !settings.learnerAccidentals && !settings.repeatUnderlay && settings.reviewedUnderlay &&
    Number.isFinite(options.staffwidth) && options.staffwidth! >= 320 && options.staffwidth! <= 431 &&
    close(options.staffwidth!, settings.scoreWidth) && Object.keys(options).every(key => optionKeys.includes(key)) &&
    options.accentAbove === true && options.add_classes === true && options.oneSvgPerLine === true && options.minPadding === 6 &&
    options.responsive === 'resize' && options.scale === 1 && (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false &&
    !!options.wrap && Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}

/** Display-only beat-2 split with adjacent phrase-ending bar joins.
 * Keep sparse cadences with their phrase instead of stretching one note
 * across an otherwise empty system.
 * No note, lyric, real bar, accidental, padding or SVG scale is rewritten.
 * A later whole bar may still set a natural width above the requested width.
 * Accept only the actual native maximum, fully contained ink, and a measured
 * increase in every notehead and staff on screen. Never rewrite SVG scale.
 * Audio/print/export ownership is kept outside this display transaction. */
export function reflowHeKeepsDefault({ host, source, prepared, songId, options, original, settings, current }: {
  host: HTMLElement; source: string; prepared: string; songId: string | undefined;
  options: abcjs.AbcVisualParams; original: abcjs.TuneObjectArray; settings: HymnOpeningSettings; current: () => boolean;
}): abcjs.TuneObjectArray {
  clearHeKeepsDefaultWrap(host);
  if (songId !== HE_KEEPS_SIZE_ID) return original;
  const diagnostic: Record<string, unknown> = { version: 3, result: 'original', reason: 'unsupported' };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (!hasHeKeepsSizeSource(songId, source) || !supported(host, options, settings) || original.length !== 1 || !current())
      return finish(original, 'unsupported-or-stale');
    const parser = heKeepsDefaultWrappedNotation(prepared);
    const before = parser && readHeKeepsDefaultIdentity(original[0], parser);
    if (!parser || !before || JSON.stringify(before.systems) !== JSON.stringify(systems) || !sourcePadding(original[0], options.staffwidth!))
      return finish(original, 'ordinary-identity');
    const geometry = readScreenScoreGeometry(host, before, true), staves = readHeKeepsSizeStaves(host);
    if (!geometry || !staves) return finish(original, 'ordinary-geometry');
    const width = options.staffwidth! + 30;
    diagnostic.originalWidth = geometry.width; diagnostic.targetWidth = width;
    if (geometry.width <= width + 0.05) return finish(original, 'no-inflation');
    if (!staves[0].every(staff => close(staff.width + 30, geometry.width))) return finish(original, 'unproven-first-bar');
    const arcs = readTwoHymnSizeArcs(host, original[0], before, 2), ink = readHeKeepsDefaultInk(host, original[0], false);
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!arcs || !ink || !typography) return finish(original, 'ordinary-proof');
    const { wrap: _wrap, afterParsing: _after, ...plain } = options;
    const explicit = { ...plain, lineBreaks: [systems.slice(0, -1).map(system => system[0])] as unknown as number[] };
    const candidate = abcjs.parseOnly(parser, explicit);
    if (candidate.length !== 1) return finish(original, 'candidate-count');
    options.afterParsing?.(candidate[0], 0, parser);
    const parsed = readHeKeepsDefaultIdentity(candidate[0], parser);
    if (!parsed || parsed.signature !== before.signature || JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting))
      return finish(original, 'candidate-identity');
    // Keep the opening and chorus joins; move audited beat-2 approach
    // suffixes into their cadence lines without changing source music.
    const projection = projectHeKeepsDefault(candidate[0], parser,
      [[0], [1, 2], [3], [3.5, 4], [5], [6], [7], [7.5, 8], [9, 10], [11, 12], [13, 14], [15, 16]]);
    if (!projection || projection.read()?.signature !== before.signature || !current()) return finish(original, 'projection-or-stale');
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const controller = new EngraverController(host, plain) as EngraverController & {
      engraveABC(tune: abcjs.TuneObject, number: number, offset: number): void;
    };
    try { controller.engraveABC(candidate[0], 0, 0); }
    finally { controller.renderer.paper.dummySvg?.remove(); controller.renderer.paper.dummySvg = null; }
    candidate[0].engraver = controller as unknown as typeof candidate[0]['engraver'];
    preserveBlankLyricRows(host); containScreenSvgSystems(host);
    const after = projection.read();
    if (!after || after.signature !== before.signature || JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting))
      throw new Error('engraved-identity');
    const next = readScreenScoreGeometry(host, after, true), nextStaves = readHeKeepsSizeStaves(host, projection.systems.length);
    diagnostic.candidateWidth = next?.width;
    diagnostic.fragmentSystems = projection.fragmentSystems;
    diagnostic.nativeSystemWidths = nextStaves?.map(rows => rows[0].width + 30);
    if (!next || !nextStaves || !close(next.width, Math.max(width, ...nextStaves.flatMap(rows => rows.map(staff => staff.width + 30)))) ||
      !sameSize(geometry, next, next.width) || !sourcePadding(candidate[0], options.staffwidth!) ||
      geometry.notes.some((note, index) => note.heads.some((head, i) =>
        next.notes[index].heads[i].screenWidth <= head.screenWidth + 0.05 ||
        next.notes[index].heads[i].screenHeight <= head.screenHeight + 0.05)) ||
      nextStaves.some(rows => rows.some(staff => staff.width + 30 > next.width + 0.05 ||
        !close(staff.height, staves[0][0].height) || !close(staff.screenHeight, staves[0][0].screenHeight * geometry.width / next.width))))
      throw new Error('candidate-fit');
    diagnostic.screenSizeGain = geometry.width / next.width;
    const nextArcs = readTwoHymnSizeArcs(host, candidate[0], after, 2);
    if (!nextArcs || nextArcs.signature !== arcs.signature) throw new Error('candidate-arcs');
    const captured = captureLyricTypography(host, after.notes, next);
    const text = captured && verifyLyricTypography(host, typography, captured, { preserveNaturalWidth: true });
    diagnostic.typography = text;
    if (!text?.valid) throw new Error('candidate-typography');
    const nextInk = readHeKeepsDefaultInk(host, candidate[0], projection.fragmentSystems), inkProof = nextInk && verifyHeKeepsDefaultInk(host, ink, nextInk);
    diagnostic.ink = inkProof;
    if (!inkProof?.valid) throw new Error('candidate-ink');
    if (!current()) throw new Error('stale-generation');
    diagnostic.result = 'candidate'; diagnostic.systems = projection.systems.length; diagnostic.beat = 2;
    return finish(candidate, 'accepted');
  } catch (error) { diagnostic.reason = error instanceof Error ? error.message : 'candidate-exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, String(diagnostic.reason));
}
