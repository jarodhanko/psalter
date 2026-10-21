import abcjs from 'abcjs';
import EngraverController from 'abcjs/src/write/engraver-controller';
import { HE_KEEPS_SIZE_ID, hasHeKeepsSizeSource, heKeepsSizeWrappedNotation, readHeKeepsSizeIdentity } from './heKeepsSizeSource';
import { readScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';
import { readTwoHymnSizeArcs } from './twoHymnSizeArcs';
import { readHeKeepsSizeInk, verifyHeKeepsSizeInk } from './heKeepsSizeInk';

const ATTRIBUTE = 'data-he-keeps-size-wrap', EPSILON = 0.05;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;
const systems = Array.from({ length: 16 }, (_, index) => [index]);
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
export type HeKeepsSizeSettings = { requestedScale: number; scoreWidth: number; transpose: number; stanzasPerGroup: number };
type Child = { type: string; c?: string; dx: number; w: number };
type Absolute = { type: string; abcelem: abcjs.AbcElem; w: number; extraw: number; minspacing: number;
  children: Child[]; extra: Child[] };
type Group = { voices: { children: Absolute[]; beams: { type: string }[] }[] };
type OwnedController = EngraverController & { constructTuneElements(tune: abcjs.TuneObject): void;
  engraveABC(tune: abcjs.TuneObject, number: number, offset: number): void };
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];

export function clearHeKeepsSizeWrap(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: HeKeepsSizeSettings) {
  return host.isConnected && !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches &&
    !host.closest('.print-score-canvas') && settings.requestedScale === 1 && settings.transpose === 0 && settings.stanzasPerGroup === 1 &&
    Number.isFinite(settings.scoreWidth) && Number.isFinite(options.staffwidth) &&
    options.staffwidth! >= 388 && options.staffwidth! <= 431 && close(options.staffwidth!, settings.scoreWidth) &&
    Object.keys(options).every(key => optionKeys.includes(key)) && options.accentAbove === true && options.add_classes === true &&
    options.oneSvgPerLine === true && options.minPadding === 6 && options.responsive === 'resize' && options.scale === 1 &&
    (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false && !!options.wrap &&
    Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}

/** Exactly two aggregate collision reservations, on the owned fourth-stanza
 * first bar. Drawing children, source notes, padding and spacing are untouched.
 * This is a provisional layout request, never evidence of native ink fit. */
export function heKeepsSizeReservations(group: Group | undefined, apply = false) {
  if (!group || group.voices.length !== 4 || group.voices.some(voice =>
    !Array.isArray(voice.children) || !Array.isArray(voice.beams) || voice.beams.some(beam => beam.type === 'BeamElem'))) return undefined;
  const notes = group.voices[0].children.filter(child => child.type === 'note');
  if (notes.length !== 6 || notes.some(note => note.minspacing !== 1 || !Array.isArray(note.children) || !Array.isArray(note.extra))) return undefined;
  const first = notes[0], fourth = notes[3], next = notes[4];
  const lyrics = notes.map(note => note.children.filter(child => child.type === 'lyric'));
  if (lyrics.some(row => row.length !== 1) || JSON.stringify(lyrics.map(row => row[0].c)) !==
    JSON.stringify(['4.\u00a0Though\n', 'some-\n', 'times\n', 'He\n', 'leads\n', 'through\n']) ||
    first.abcelem.startChar !== 433 || first.abcelem.endChar !== 437 || fourth.abcelem.startChar !== 444 || fourth.abcelem.endChar !== 447 ||
    notes.some((note, index) => !close(note.extraw, -lyrics[index][0].w / 2)) ||
    !close(first.w, lyrics[0][0].w / 2) || !close(next.w, lyrics[4][0].w / 2)) return undefined;
  const flag = fourth.children.filter(child => child.type === 'symbol' && child.c === 'flags.u8th');
  const left = Math.min(0, ...first.extra.filter(child => child.type !== 'lyric').map(child => child.dx));
  const right = lyrics[3][0].w / 2;
  if (flag.length !== 1 || !close(flag[0].dx, 9.21) || !close(flag[0].w, 6.692) ||
    !close(fourth.w, flag[0].dx + flag[0].w) || left !== 0 ||
    !Number.isFinite(right) || right <= 9.81 || right >= fourth.w || first.extraw >= 0 ||
    first.extra.filter(child => child.type === 'lyric').length !== 1 ||
    !first.extra.includes(lyrics[0][0])) return undefined;
  const proof = { first: { before: first.extraw, after: left }, fourth: { before: fourth.w, after: right } };
  if (apply) { first.extraw = left; fourth.w = right; }
  return proof;
}

export function readHeKeepsSizeStaves(host: HTMLElement) {
  const svgs = [...host.querySelectorAll('svg')];
  if (svgs.length !== 16) return undefined;
  const staves = svgs.map(svg => [...svg.querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')].map(staff => {
    const box = staff.getBBox(), screen = staff.getBoundingClientRect();
    return { width: box.width, height: box.height, screenHeight: screen.height, left: box.x };
  }));
  if (staves.some(rows => rows.length !== 2 || rows.some(row => !Object.values(row).every(Number.isFinite) ||
    !close(row.left, 15) || row.width <= 0 || row.height <= 0 || row.screenHeight <= 0 ||
    !close(row.height, staves[0][0].height) || !close(row.screenHeight, staves[0][0].screenHeight)) || !close(rows[0].width, rows[1].width))) return undefined;
  return staves;
}
function sameSize(before: Geometry, after: Geometry, width: number) {
  const ratio = before.width / width;
  return ratio > 1 && close(after.width, width) && close(before.left, after.left) && close(before.screenWidth, after.screenWidth) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const next = after.notes[index];
      return note.font === next.font && note.heads.length === next.heads.length && note.heads.every((head, i) =>
        close(head.width, next.heads[i].width) && close(head.height, next.heads[i].height) &&
        close(head.screenWidth * ratio, next.heads[i].screenWidth) && close(head.screenHeight * ratio, next.heads[i].screenHeight)) &&
        note.lyrics.length === next.lyrics.length && note.lyrics.every((row, i) => row.text === next.lyrics[i].text);
    });
}
const sourcePadding = (tune: abcjs.TuneObject, width: number) => tune.engraver?.width === width &&
  tune.engraver?.renderer?.padding?.left === 15 && tune.engraver.renderer.padding.right === 15 &&
  tune.formatting.staffwidth === undefined && tune.formatting.leftmargin === undefined && tune.formatting.rightmargin === undefined;

/** Only the signed stanza-four preparation can reach the owned controller.
 * Original listener-bearing nodes and attributes remain the sole fallback.
 * No global prototype, ABC, glyph, SVG scale, viewport or break is rewritten. */
export function refineHeKeepsSizeScreenScore(host: HTMLElement, source: string | undefined, prepared: string,
  songId: string | undefined, options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray,
  settings: HeKeepsSizeSettings): abcjs.TuneObjectArray {
  clearHeKeepsSizeWrap(host);
  if (songId !== HE_KEEPS_SIZE_ID) return original;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported', settings };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (!source || !hasHeKeepsSizeSource(songId, source)) return finish(original, 'canonical-source');
    if (!supported(host, options, settings) || original.length !== 1) return finish(original, 'unsupported');
    const abc = heKeepsSizeWrappedNotation(prepared);
    if (!abc) return finish(original, 'prepared-source');
    const before = readHeKeepsSizeIdentity(original[0], abc);
    if (!before || JSON.stringify(before.systems) !== JSON.stringify(systems)) return finish(original, 'source-identity');
    if (!sourcePadding(original[0], options.staffwidth!)) return finish(original, 'source-padding');
    const geometry = readScreenScoreGeometry(host, before, true), staves = readHeKeepsSizeStaves(host);
    if (!geometry || !staves) return finish(original, 'source-geometry');
    const width = options.staffwidth! + 30;
    diagnostic.original = { viewport: geometry.width, heads: geometry.notes.reduce((n, note) => n + note.heads.length, 0), systems: before.systems, staves };
    diagnostic.requestedViewport = width;
    if (geometry.width <= width + EPSILON) return finish(original, 'no-inflation');
    if (!staves[0].every(staff => close(staff.width + 30, geometry.width)) ||
      staves.slice(1).some(rows => rows.some(staff => staff.width + 30 > geometry.width + EPSILON))) return finish(original, 'unproven-first-bar');
    const reservations = heKeepsSizeReservations(original[0].engraver?.staffgroups[0] as unknown as Group);
    const arcs = readTwoHymnSizeArcs(host, original[0], before, 2), ink = readHeKeepsSizeInk(host, original[0]);
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!reservations || !arcs || !ink || !typography) return finish(original, 'source-proof');
    diagnostic.reservations = reservations;
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const { wrap: _wrap, ...explicit } = options;
    const candidateOptions = { ...explicit, lineBreaks: [systems.slice(0, -1).map(system => system[0])] as unknown as number[] };
    const candidate = abcjs.parseOnly(abc, candidateOptions);
    if (candidate.length !== 1) throw new Error('candidate-count');
    options.afterParsing?.(candidate[0], 0, abc);
    const parsed = readHeKeepsSizeIdentity(candidate[0], abc);
    if (!parsed || parsed.signature !== before.signature || JSON.stringify(parsed.systems) !== JSON.stringify(systems) ||
      JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting)) throw new Error('candidate-identity');
    const controller = new EngraverController(host, candidateOptions) as OwnedController;
    const nativeConstruct = controller.constructTuneElements, construct = nativeConstruct.bind(controller);
    let applied = 0;
    controller.constructTuneElements = tune => {
      if (tune !== candidate[0] || applied) throw new Error('controller-scope');
      construct(tune);
      const first = (tune.lines[0] as unknown as { staffGroup?: Group }).staffGroup;
      const proof = heKeepsSizeReservations(first);
      if (!proof || JSON.stringify(proof) !== JSON.stringify(reservations) || !heKeepsSizeReservations(first, true)) throw new Error('controller-reservations');
      applied++;
    };
    try { controller.engraveABC(candidate[0], 0, 0); }
    finally {
      controller.constructTuneElements = nativeConstruct;
      // A failed draw does not reach ABCJS's ordinary temporary-text cleanup.
      // Remove only this controller's own fallback, never another render's.
      controller.renderer.paper.dummySvg?.remove();
      controller.renderer.paper.dummySvg = null;
    }
    candidate[0].engraver = controller as unknown as typeof candidate[0]['engraver'];
    if (applied !== 1) throw new Error('controller-not-applied');
    preserveBlankLyricRows(host); containScreenSvgSystems(host);
    const after = readHeKeepsSizeIdentity(candidate[0], abc);
    if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems) ||
      JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting)) throw new Error('candidate-identity');
    const proof: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = { version: 1, song: songId, phase: 'owned-controller', result: 'candidate' };
    const next = readScreenScoreGeometry(host, after, true, proof), nextStaves = readHeKeepsSizeStaves(host);
    diagnostic.geometry = proof;
    diagnostic.candidateGeometry = { viewport: next?.width, noteCount: next?.notes.length, staves: nextStaves,
      sameSize: !!next && sameSize(geometry, next, width), padding: sourcePadding(candidate[0], options.staffwidth!),
      staffFit: !!nextStaves && nextStaves.every(rows => rows.every(staff => staff.width <= options.staffwidth! + EPSILON)),
      staffSize: !!nextStaves && nextStaves.every(rows => rows.every(staff => close(staff.height, staves[0][0].height) &&
        close(staff.screenHeight, staves[0][0].screenHeight * geometry.width / width))) };
    if (!next || !nextStaves || !sameSize(geometry, next, width) || !sourcePadding(candidate[0], options.staffwidth!) ||
      nextStaves.some(rows => rows.some(staff => staff.width > options.staffwidth! + EPSILON ||
        !close(staff.height, staves[0][0].height) || !close(staff.screenHeight, staves[0][0].screenHeight * geometry.width / width)))) throw new Error('candidate-geometry');
    const nextArcs = readTwoHymnSizeArcs(host, candidate[0], after, 2);
    if (!nextArcs || nextArcs.signature !== arcs.signature) throw new Error('candidate-arcs');
    const nextTypography = captureLyricTypography(host, after.notes, next);
    const text = nextTypography && verifyLyricTypography(host, typography, nextTypography, { preserveNaturalWidth: true });
    diagnostic.typography = text;
    if (!text?.valid) throw new Error('candidate-typography');
    const nextInk = readHeKeepsSizeInk(host, candidate[0]), inkProof = nextInk && verifyHeKeepsSizeInk(host, ink, nextInk);
    diagnostic.ink = inkProof;
    if (!inkProof?.valid) throw new Error('candidate-ink');
    diagnostic.result = 'candidate'; diagnostic.candidate = { viewport: next.width, staves: nextStaves, arcs: nextArcs.arcs };
    return finish(candidate, 'accepted');
  } catch (error) { diagnostic.reason = error instanceof Error ? error.message : 'candidate-exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, String(diagnostic.reason));
}
