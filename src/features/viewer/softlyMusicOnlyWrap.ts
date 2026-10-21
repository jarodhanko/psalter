import abcjs from 'abcjs';
import { fitSoftlySystems, hasSoftlyWidthSource, measureSoftlyMusicOnlyWidths,
  recordCandidateSystems, softlyMinimumStaffWidth, softlyMusicOnlyNotation } from './completeInTheeWrap';
import { normalizeScreenCandidateViewport, readScreenElementSize, readScreenScoreGeometry, readScreenScoreIdentity } from './isolatedChordWrap';

const ATTRIBUTE = 'data-softly-music-only-wrap';
const EPSILON = 0.05;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;
type Score = NonNullable<ReturnType<typeof readScreenScoreIdentity>>;
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
type Size = NonNullable<ReturnType<typeof readScreenElementSize>>;
type Widths = { left: number; measureWidths: number[]; total: number };
type Settings = { requestedScale: number; scoreWidth: number; transpose: number; stanzasPerGroup: number;
  visibleKey: string; grouped: boolean; musicOnly: boolean; learnerAccidentals: boolean;
  repeatUnderlay: boolean; reviewedUnderlay: boolean; defaultLyricPolicy: boolean };
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap', 'format'];

// Exact source-token map in prepared ABC, derived without another source literal.
// Native event ranges also include whitespace; both complete ranges remain in
// readScreenScoreIdentity's signature and each before/after rest key below.
const RESTS = [...softlyMusicOnlyNotation.matchAll(/^\[V:([SATB])\].*$/gm)].flatMap(line =>
  [...line[0].matchAll(/z([24])/g)].map(rest => ({ voice: 'SATB'.indexOf(line[1]),
    tokenStart: line.index + rest.index, tokenEnd: line.index + rest.index + rest[0].length,
    duration: Number(rest[1]) / 16 })));

function restsOf(score: Score) {
  const rests = score.notes.filter(note => !!note.element.rest);
  return RESTS.length === 34 && rests.length === 34 && rests.every(({ voice, element }, index) => {
    const rest = RESTS[index], start = element.startChar, end = element.endChar;
    return voice === rest.voice && element.duration === rest.duration && element.rest?.type === 'rest' &&
      Object.keys(element.rest).length === 1 && !element.pitches?.length && !element.lyric?.length &&
      start !== undefined && end !== undefined && start <= rest.tokenStart && end >= rest.tokenEnd &&
      softlyMusicOnlyNotation.slice(start, end).trim() === softlyMusicOnlyNotation.slice(rest.tokenStart, rest.tokenEnd);
  }) ? rests : undefined;
}

function sourceScore(tune: abcjs.TuneObject | undefined, source: string) {
  const score = readScreenScoreIdentity(tune, source);
  return tune && score && score.meter === 0.75 && score.units.length === 17 && score.notes.length === 319 &&
    score.notes.every(note => note.voice <= 3 && !note.element.lyric?.length) &&
    new Set(score.notes.map(note => note.voice)).size === 4 &&
    score.notes.filter(note => note.element.pitches?.length === 1).length === 285 && restsOf(score) &&
    score.notes.filter(note => note.element.decoration?.includes('fermata')).length === 20 &&
    score.units.every((unit, index) => unit.duration === (index === 7 ? 0.625 : index === 8 ? 0.125 : 0.75)) &&
    score.systems.some(system => system.includes(7) && system.includes(8)) &&
    tune.metaText.tempo?.bpm === 68 && JSON.stringify(tune.metaText.tempo.duration) === '[0.25]' &&
    tune.lines.every(line => JSON.stringify(line.staff?.map(staff => staff.voices?.length)) === '[2,2]') ? score : undefined;
}

function glyphStyle(element: SVGElement) {
  const style = getComputedStyle(element);
  return JSON.stringify([style.fontFamily, style.fontSize, style.fontWeight, style.fontStyle,
    style.fill, style.fillOpacity, style.stroke, style.strokeWidth, style.opacity, style.vectorEffect,
    style.transform, element.getAttribute('transform')]);
}
function headStyles(score: Score) {
  return JSON.stringify(score.notes.map(({ element }) => element.abselem?.elemset?.map(root =>
    [glyphStyle(root), [...root.querySelectorAll<SVGElement>('.abcjs-notehead')].map(glyphStyle)])));
}
type RestSnapshot = { key: string; voice: number; start: number; end: number;
  tokenStart: number; tokenEnd: number; duration: number; size: Size; style: string }[];
function restSizes(host: HTMLElement, score: Score): RestSnapshot | undefined {
  const rests = restsOf(score), seen = new Set<SVGGraphicsElement>();
  if (!rests || host.querySelectorAll('.abcjs-rest').length !== 34) return undefined;
  const result: RestSnapshot = [];
  for (const [index, { voice, element }] of rests.entries()) {
    const roots = element.abselem?.elemset;
    // Every reviewed z2/z4 is one plain visible glyph, with no annotation.
    if (roots?.length !== 1) return undefined;
    const root = roots[0];
    if (!(root instanceof SVGGraphicsElement) || !root.matches('.abcjs-rest') ||
      !host.contains(root) || seen.has(root)) return undefined;
    seen.add(root);
    const glyph = root.firstElementChild;
    if (root.children.length !== 1 || !(glyph instanceof SVGGraphicsElement) || glyph.tagName.toLowerCase() !== 'path') return undefined;
    const size = readScreenElementSize(glyph);
    if (!size) return undefined;
    result.push({ key: JSON.stringify([voice, element.startChar, element.endChar, element.duration, element.rest]),
      voice, start: element.startChar!, end: element.endChar!, tokenStart: RESTS[index].tokenStart,
      tokenEnd: RESTS[index].tokenEnd, duration: RESTS[index].duration, size,
      style: JSON.stringify([glyphStyle(root), glyphStyle(glyph)]) });
  }
  return result;
}

type StaffSize = Size & { style: string; vertical: number[]; screenVertical: number[] };
function staffSizes(host: HTMLElement, systems: number): StaffSize[] | undefined {
  const staves = [...host.querySelectorAll<SVGGraphicsElement>('.abcjs-staff')];
  if (staves.length !== systems * 2 || staves.some(staff => staff.children.length !== 5)) return undefined;
  const sizes: StaffSize[] = [];
  for (const staff of staves) {
    const size = readScreenElementSize(staff), lines = [...staff.children];
    if (!size || lines.some(line => !(line instanceof SVGGraphicsElement) || line.tagName.toLowerCase() !== 'path')) return undefined;
    const local = (lines as SVGGraphicsElement[]).map(line => line.getBBox()).sort((a, b) => a.y - b.y);
    const screen = lines.map(line => line.getBoundingClientRect()).sort((a, b) => a.y - b.y);
    const vertical = local.flatMap((line, index) => [line.height, ...(index ? [line.y - local[index - 1].y] : [])]);
    const screenVertical = screen.flatMap((line, index) => [line.height, ...(index ? [line.y - screen[index - 1].y] : [])]);
    if (![...vertical, ...screenVertical].every(value => Number.isFinite(value) && value > 0)) return undefined;
    sizes.push({ ...size, style: JSON.stringify([glyphStyle(staff), (lines as SVGElement[]).map(glyphStyle)]), vertical, screenVertical });
  }
  return sizes;
}
function sameStaff(before: StaffSize, after: StaffSize, ratio: number) {
  return before.style === after.style && close(before.height, after.height) && close(before.screenHeight * ratio, after.screenHeight) &&
    before.vertical.every((value, index) => close(value, after.vertical[index])) &&
    before.screenVertical.every((value, index) => close(value * ratio, after.screenVertical[index]));
}
function sameSize(before: Size, after: Size, ratio: number) {
  return close(before.width, after.width) && close(before.height, after.height) &&
    close(before.screenWidth * ratio, after.screenWidth) && close(before.screenHeight * ratio, after.screenHeight);
}
function sameHeads(before: Geometry, after: Geometry, intended: number) {
  const ratio = before.width / intended;
  return close(after.width, intended) && close(before.left, after.left) && close(before.screenWidth, after.screenWidth) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const other = after.notes[index];
      return !note.lyrics.length && !other.lyrics.length && note.heads.length === other.heads.length &&
        note.heads.every((head, ordinal) => sameSize(head, other.heads[ordinal], ratio));
    });
}
function nativePresentation(tune: abcjs.TuneObject, staffwidth: number) {
  return tune.engraver?.width === staffwidth && tune.engraver?.renderer?.padding?.left === 15 &&
    tune.engraver?.renderer?.padding?.right === 15 && tune.formatting.staffwidth === undefined &&
    tune.formatting.leftmargin === undefined && tune.formatting.rightmargin === undefined;
}

/** Recover only proven empty right margin after native sequential convergence.
 * Each width promotion must satisfy ABCJS 6.7's strict two-unit stopping bound;
 * every complete ink box must retain two units inside the requested viewport.
 * No cumulative allowance, glyph/position changes, or second render is used.
 * The unchanged final physical-size, style and geometry proofs still decide. */
function normalizeMusicOnlyConvergence(host: HTMLElement, tune: abcjs.TuneObject,
  score: Score, geometry: Geometry, staffwidth: number, intended: number, diagnostic: Record<string, unknown>) {
  // The shared helper checks reflected SVGRect equality; keep both the exact
  // mathematical request and its float32 representation inside the ink guard.
  const viewportWidth = Math.fround(intended);
  if (!close(viewportWidth, intended)) return false;
  const inkLimit = Math.min(intended, viewportWidth), excess = geometry.width - intended;
  if (!(excess > EPSILON) || geometry.left !== 0 || !nativePresentation(tune, staffwidth)) return false;
  const lines = tune.lines.filter(line => line.staff), svgs = [...host.querySelectorAll('svg')];
  if (lines.length !== score.systems.length || svgs.length !== lines.length) return false;
  let target = staffwidth, increases = 0;
  for (const [index, line] of lines.entries()) {
    const group = line.staffGroup;
    if (group?.startx !== 15 || !Number.isFinite(group.w)) return false;
    const width = group.w! - group.startx;
    if (!(width > 0)) return false;
    if (Math.round(width) > Math.round(target)) {
      if (!(width - target > 0 && width - target < 2)) return false;
      target = width;
      increases++;
    }
    const ink = svgs[index].getBBox();
    if (![ink.x, ink.y, ink.width, ink.height].every(Number.isFinite) ||
      ink.width <= 0 || ink.height <= 0 || ink.x < 2 || ink.x + ink.width + 2 > inkLimit) return false;
  }
  if (!increases || !close(target + 30, geometry.width)) return false;
  const recovery = { before: geometry.width, intended, serialized: viewportWidth, excess, increases, normalized: false };
  diagnostic.convergenceViewport = recovery;
  recovery.normalized = normalizeScreenCandidateViewport(host, tune, score, { left: 0, width: viewportWidth });
  return recovery.normalized;
}

export function clearSoftlyMusicOnlyWrap(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }

/** Default-policy, all-parts 100% screen mode only. One whole-measure attempt,
 * no size ceiling, source rewrite or native margin change. Only proven empty
 * viewport margin from native convergence may be reclaimed after rendering.
 * Any failure restores the actual ordinary tune, nodes and host attributes.
 * Full original lyrics retain their independent, unchanged typography proof. */
export function reflowSoftlyMusicOnlyScreenScore(host: HTMLElement, canonical: string, prepared: string,
  songId: string | undefined, options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray,
  settings: Settings): abcjs.TuneObjectArray {
  clearSoftlyMusicOnlyWrap(host);
  if (!hasSoftlyWidthSource(songId, canonical) || !settings.defaultLyricPolicy) return original;
  const diagnostic: Record<string, unknown> & { version: 1; result: 'original' | 'candidate'; reason: string } =
    { version: 1, result: 'original', reason: 'unsupported' };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  if (prepared !== softlyMusicOnlyNotation || abcjs.signature !== 'abcjs-basic v6.7.0' || !host.isConnected ||
    host.closest('.print-score-canvas') || original.length !== 1 || settings.requestedScale !== 1 ||
    settings.transpose !== 0 || settings.stanzasPerGroup !== 0 || settings.visibleKey !== '0,1,2,3' ||
    settings.grouped || !settings.musicOnly || settings.learnerAccidentals || settings.repeatUnderlay || settings.reviewedUnderlay ||
    !Number.isFinite(settings.scoreWidth) || settings.scoreWidth <= 0 || !close(options.staffwidth!, settings.scoreWidth) ||
    Object.keys(options).some(key => !optionKeys.includes(key)) || options.accentAbove !== true || options.add_classes !== true ||
    options.oneSvgPerLine !== true || options.minPadding !== 6 || options.responsive !== 'resize' || options.scale !== 1 ||
    (options.visualTranspose ?? 0) !== 0 || options.viewportHorizontal !== false ||
    !options.format || Object.keys(options.format).length !== 1 || options.format.vocalfont !== '0' ||
    !options.wrap || Object.keys(options.wrap).some(key => !['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) ||
    options.wrap.minSpacing !== 1.5 || options.wrap.maxSpacing !== 2.7 || options.wrap.preferredMeasuresPerLine !== 0)
    return finish(original, 'unsupported');
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    const tune = original[0], before = sourceScore(tune, prepared), staffwidth = options.staffwidth!;
    if (!before || !nativePresentation(tune, staffwidth)) return finish(original, 'source-identity');
    const geometry = readScreenScoreGeometry(host, before, true), rests = restSizes(host, before);
    const staves = staffSizes(host, before.systems.length);
    if (!geometry || !rests || !staves || host.querySelector('.abcjs-lyric')) return finish(original, 'original-geometry');
    const intended = staffwidth + 30;
    diagnostic.originalUnits = before.systems;
    diagnostic.requested = intended;
    diagnostic.originalWidth = geometry.width;
    diagnostic.originalRests = rests;
    if (geometry.width <= intended + 2) return finish(original, close(geometry.width, intended) ? 'no-inflation' : 'ordinary-width');
    const explanation = (tune as abcjs.TuneObject & { explanation?: { widths: Widths; staffWidth: number }[] }).explanation;
    const native = explanation?.[0]?.widths;
    if (explanation?.length !== 1 || explanation[0].staffWidth !== staffwidth || !native ||
      !Number.isFinite(native.left) || native.left < 0 || native.measureWidths.length !== 17 ||
      native.measureWidths.some(width => !Number.isFinite(width) || width < 0) ||
      !close(native.total, native.measureWidths.reduce((sum, width) => sum + width, 0)))
      return finish(original, 'native-widths');
    diagnostic.nativeWidths = native;
    const { wrap: _wrap, afterParsing: _afterParsing, clickListener: _clickListener, ...measurement } = options;
    const unbroken = { ...measurement, lineBreaks: [[]] as unknown as number[] };
    const parsed = abcjs.parseOnly(prepared, unbroken);
    const flat = parsed.length === 1 && sourceScore(parsed[0], prepared);
    if (!flat || flat.signature !== before.signature || flat.systems.length !== 1) return finish(original, 'measurement-identity');
    const metrics = measureSoftlyMusicOnlyWidths(host, prepared, unbroken, flat.signature);
    const widths = metrics?.[0]?.sections[0];
    const minimum = widths && softlyMinimumStaffWidth(widths);
    if (metrics?.length !== 1 || metrics[0].sections.length !== 1 || minimum === undefined || !widths ||
      widths.left < 15 || widths.left >= staffwidth) return finish(original, 'measurement-widths');
    diagnostic.minimumStaffwidth = minimum;
    diagnostic.correctedWidths = widths.measureWidths;
    // Never silently reduce the requested size to fit an indivisible measure.
    if (staffwidth < minimum) return finish(original, 'whole-measure-floor');
    const systems = fitSoftlySystems(before.systems, widths.measureWidths, staffwidth - (widths.left - 15));
    if (!systems) return finish(original, 'planner-fit');
    diagnostic.plannedUnits = systems;
    const stylesBefore = headStyles(before);
    retained = [...host.childNodes];
    attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const { wrap: _originalWrap, ...explicit } = options;
    const lineBreaks = [systems.slice(0, -1).map(system => system.at(-1)!)];
    const candidate = abcjs.renderAbc(host, prepared, { ...explicit, lineBreaks: lineBreaks as unknown as number[] });
    const after = candidate.length === 1 && sourceScore(candidate[0], prepared);
    if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems) ||
      JSON.stringify(candidate[0].formatting) !== JSON.stringify(tune.formatting) || !nativePresentation(candidate[0], staffwidth)) {
      diagnostic.reason = 'candidate-identity';
    } else {
      recordCandidateSystems(host, candidate[0], systems, staffwidth, diagnostic);
      let candidateGeometry = readScreenScoreGeometry(host, after, true);
      if (candidateGeometry && normalizeMusicOnlyConvergence(host, candidate[0], after,
        candidateGeometry, staffwidth, intended, diagnostic)) candidateGeometry = readScreenScoreGeometry(host, after, true);
      const candidateRests = restSizes(host, after);
      const candidateStaves = staffSizes(host, after.systems.length), ratio = geometry.width / intended;
      diagnostic.candidateWidth = candidateGeometry?.width;
      diagnostic.candidateRests = candidateRests;
      const proof = {
        heads: !!candidateGeometry && sameHeads(geometry, candidateGeometry, intended) && stylesBefore === headStyles(after),
        rests: !!candidateRests && rests.every((rest, index) => rest.key === candidateRests[index]?.key &&
          rest.style === candidateRests[index].style &&
          sameSize(rest.size, candidateRests[index].size, ratio)),
        staff: !!candidateStaves && staves.every(size => sameStaff(staves[0], size, 1)) &&
          candidateStaves.every(size => sameStaff(staves[0], size, ratio)),
        noLyrics: !host.querySelector('.abcjs-lyric'),
      };
      diagnostic.proof = { ...proof, headsCompared: 285, restsCompared: 34, viewportRatio: ratio,
        originalStaff: staves.map(({ height, screenHeight, vertical, screenVertical }) => ({ height, screenHeight, vertical, screenVertical })),
        candidateStaff: candidateStaves?.map(({ height, screenHeight, vertical, screenVertical }) => ({ height, screenHeight, vertical, screenVertical })) };
      if (Object.values(proof).every(Boolean)) {
        diagnostic.result = 'candidate';
        return finish(candidate, 'accepted');
      }
      diagnostic.reason = 'candidate-geometry';
    }
  } catch { diagnostic.reason = 'exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, String(diagnostic.reason));
}
