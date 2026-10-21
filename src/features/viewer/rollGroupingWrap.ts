import abcjs from 'abcjs';
import type EngraverController from 'abcjs/src/write/engraver-controller';
import { readScreenScoreGeometry, readScreenScoreIdentity, renderScreenScore } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

export const ROLL_GROUPING_ID = 'hymn-oh_when-the-roll-is-called-up-yonder-when-the-roll-is-called-up-yonder';
const ATTRIBUTE = 'data-roll-grouping-wrap';
const EPSILON = 0.05;
type Witness = readonly [number, bigint];
type Widths = { left: number; measureWidths: number[]; total: number };
export type RollGroupingBaseline = { widths: Widths; systems: number[][]; signature: string };
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
// Captured through ScoreRenderer.onScreenAbc for the byte-qualified canonical
// SHA-256 c6729bc14681e4f91c59dd74924cad69fa4e44e26e2b9af436d85ac8dc2e25a9.
// Only these complete all-part screen groups are admitted. Print and the
// ungrouped source never call this adapter; reduced/altered groups fail closed.
const GROUPS: readonly { verses: readonly number[]; prepared: Witness; parser: Witness }[] = [
  { verses: [1], prepared: [4163, 0x7e95abc4de2ec2f0n], parser: [3270, 0x06d655d3b17c6d5dn] },
  { verses: [2], prepared: [4166, 0xec4ea035d42ee109n], parser: [3273, 0x6c55b307fab350a0n] },
  { verses: [3], prepared: [4147, 0x384ba639e6536dffn], parser: [3254, 0xc197691f698ab2dcn] },
  { verses: [1, 2], prepared: [4373, 0x2df1b40e17d2e2e5n], parser: [3480, 0x166bbf57e163ac6en] },
];
function matches(text: string, witness: Witness) {
  if (text.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let i = 0; i < text.length; i++) hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(i))) * 1099511628211n);
  return hash === witness[1];
}
export function hasRollGroupingSource(songId: string | undefined, source: string) {
  return songId === ROLL_GROUPING_ID && matches(source, [4826, 0xe84cde21656d5a0cn]);
}
export function rollGroupingStanza(prepared: string) {
  const group = GROUPS.find(group => matches(prepared, group.prepared));
  return group?.verses.length === 1 ? group.verses[0] : undefined;
}
export function rollGroupingWrappedNotation(prepared: string) {
  const group = GROUPS.find(group => matches(prepared, group.prepared));
  if (!group) return undefined;
  const book = new abcjs.TuneBook(prepared);
  return book.header === '' && book.tunes.length === 1 && book.tunes[0].startPos === 892 &&
    book.tunes[0].abc === prepared.slice(892).trimEnd() && matches(book.tunes[0].abc, group.parser)
    ? book.tunes[0].abc : undefined;
}
const grouping = JSON.stringify([[null, null, 'start'], [null, null, 'end']]);
const noteFields = new Set(['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric',
  'abselem', 'averagepitch', 'minpitch', 'maxpitch']);
const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'startTie', 'endTie', 'highestVert']);
const tempoFields = new Set(['el_type', 'startChar', 'endChar', 'bpm', 'duration', 'type', 'abselem']);
/** Source-bound read-only structural view. Preserve the initial inline tempo
 * separately because the shared identity reader intentionally rejects tempos.
 * Validate engraving-derived single-head caches; never strip musical fields. */
export function readRollGroupingIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || abcjs.signature !== 'abcjs-basic v6.7.0' || !GROUPS.some(group => matches(abc, group.parser))) return undefined;
  let invalid = false, tempos = 0, ties = 0, tieEnds = 0;
  const tempoIdentity: unknown[] = [];
  const structural = { ...tune, lines: tune.lines.map((line, lineIndex) => {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass' ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== grouping) invalid = true;
    return { ...line, staff: line.staff?.map((staff, staffIndex) => ({ ...staff,
      voices: staff.voices?.map((voice, voiceIndex) => voice.filter((raw, eventIndex) => {
        const event = raw as abcjs.AbcElem;
        if (raw.el_type === 'tempo') {
          const tempo = raw as abcjs.VoiceItemTempo;
          tempos++;
          if (lineIndex !== 0 || staffIndex !== 0 || voiceIndex !== 0 ||
            voice.slice(0, eventIndex).some(item => item.el_type !== 'stem') ||
            Object.keys(raw).some(key => !tempoFields.has(key)) ||
            ((raw as typeof raw & { type?: string }).type !== undefined && (raw as typeof raw & { type?: string }).type !== 'tempo') ||
            abc.slice(tempo.startChar, tempo.endChar) !== '[Q:1/4=100]' || tempo.bpm !== 100 ||
            JSON.stringify(tempo.duration) !== '[0.25]') invalid = true;
          tempoIdentity.push([tempo.startChar, tempo.endChar, tempo.bpm, tempo.duration]);
          return false;
        }
        if (raw.el_type === 'stem') {
          if (Object.keys(raw).some(key => !['el_type', 'direction'].includes(key)) ||
            (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) invalid = true;
        } else if (raw.el_type === 'bar') {
          if (Object.keys(raw).some(key => !['el_type', 'startChar', 'endChar', 'type', 'abselem'].includes(key))) invalid = true;
        } else if (raw.el_type !== 'note' || Object.keys(raw).some(key => !noteFields.has(key))) invalid = true;
        if (event.pitches) {
          if (event.pitches.length !== 1) invalid = true;
          for (const pitch of event.pitches) {
            const highest = (pitch as typeof pitch & { highestVert?: number }).highestVert;
            if (Object.keys(pitch).some(key => !pitchFields.has(key)) ||
              (highest !== undefined && highest !== pitch.verticalPos + (voiceIndex === 0 && typeof event.duration === 'number' && event.duration < 1 ? 6 : 0))) invalid = true;
            if (pitch.startTie) ties++;
            if (pitch.endTie) tieEnds++;
          }
        }
        const derived = raw as typeof raw & { averagepitch?: number; minpitch?: number; maxpitch?: number };
        for (const field of ['averagepitch', 'minpitch', 'maxpitch'] as const) {
          // ABCJS lifts this edition's visible up-stem Tenor rests; the
          // invisible Bass timing rests keep its ordinary neutral cache.
          const expected = event.pitches?.[0]?.verticalPos ?? (event.rest?.type === 'rest' && staffIndex === 1 && voiceIndex === 0 ? 11 : 3);
          if (derived[field] !== undefined && derived[field] !== expected) invalid = true;
        }
        return true;
      })),
    })) };
  }) };
  if (invalid || tempos !== 1 || ties !== 6 || tieEnds !== 6) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 17 || score.notes.length !== 378 ||
    score.units.some((unit, i) => unit.duration !== (i === 0 ? 0.25 : i === 16 ? 0.75 : 1)) ||
    [90, 90, 99, 99].some((count, voice) => score.notes.filter(note => note.voice === voice).length !== count) ||
    score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 366) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, grouping, tempoIdentity]) };
}
function validWidths(widths: Widths | undefined): widths is Widths {
  return !!widths && Number.isFinite(widths.left) && widths.left >= 15 &&
    Array.isArray(widths.measureWidths) && widths.measureWidths.length === 17 && widths.measureWidths.every(w => Number.isFinite(w) && w > 0) &&
    Number.isFinite(widths.total) && Math.abs(widths.total - widths.measureWidths.reduce((a, b) => a + b, 0)) <= EPSILON;
}
function terminal(unit: number) { return unit === 16 ? 8 : 1; }
export function rollGroupingMinimumStaffWidth(widths: Widths) {
  if (!validWidths(widths)) return undefined;
  return Math.ceil((Math.max(...widths.measureWidths.map((w, i) => w + terminal(i))) + widths.left - 15) * 1024) / 1024;
}
/** Only subdivide over-budget existing systems at real bars. Never invent a
 * break at q24, merge source units, or borrow space by shrinking typography. */
export function fitRollGroupingSystems(systems: number[][], widths: number[], available: number) {
  if (!systems.length || systems.some(s => !s.length) || systems.flat().length !== 17 ||
    systems.flat().some((unit, i) => unit !== i) || widths.length !== 17 ||
    widths.some(w => !Number.isFinite(w) || w <= 0) || !Number.isFinite(available) || available <= 0) return undefined;
  const fitted: number[][] = [];
  for (const system of systems) {
    let row: number[] = [], sum = 0;
    for (const unit of system) {
      if (widths[unit] + terminal(unit) > available + EPSILON) return undefined;
      if (row.length && sum + widths[unit] + terminal(unit) > available + EPSILON) {
        fitted.push(row); row = []; sum = 0;
      }
      row.push(unit); sum += widths[unit];
    }
    fitted.push(row);
  }
  return fitted;
}
/** A single conservative fallback for proven native viewport inflation.
 * Split only existing multi-bar systems; all real bars and ordering survive.
 * This never changes the viewport budget or makes another join attempt. */
export function refineRollGroupingSystems(systems: number[][]) {
  if (!systems.length || systems.some(system => !system.length) || systems.flat().length !== 17 ||
    systems.flat().some((unit, index) => unit !== index) || systems.every(system => system.length === 1)) return undefined;
  return systems.flatMap(system => system.map(unit => [unit]));
}
const optionKeys = new Set(['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap']);
function supported(host: HTMLElement, options: abcjs.AbcVisualParams) {
  return abcjs.signature === 'abcjs-basic v6.7.0' && host.isConnected &&
    !host.closest('.print-score-canvas') && Object.keys(options).every(key => optionKeys.has(key)) &&
    options.accentAbove === true && options.add_classes === true && options.oneSvgPerLine === true &&
    options.minPadding === 6 && options.responsive === 'resize' && options.scale === 1 &&
    (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false &&
    Number.isFinite(options.staffwidth) && options.staffwidth! > 0 &&
    !!options.wrap && Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}
function sameSize(before: Geometry, after: Geometry, viewport: number) {
  const close = (a: number, b: number) => Math.abs(a - b) <= EPSILON;
  const ratio = before.width / viewport;
  return close(after.width, viewport) && before.left === after.left && close(before.screenWidth, after.screenWidth) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const other = after.notes[index];
      return note.font === other.font && note.heads.length === other.heads.length && note.heads.every((head, i) =>
        close(head.width, other.heads[i].width) && close(head.height, other.heads[i].height) &&
        close(head.screenWidth * ratio, other.heads[i].screenWidth) && close(head.screenHeight * ratio, other.heads[i].screenHeight)) &&
        note.lyrics.length === other.lyrics.length && note.lyrics.every((row, i) => row.text === other.lyrics[i].text);
    });
}
/** Warm the ordinary bundled text cache, then measure the same parser source
 * with no line breaks. A separate source-module controller has a different
 * cache, so use the existing bundle's controller and own its temporary nodes. */
function measure(host: HTMLElement, abc: string, options: abcjs.AbcVisualParams, signature: string) {
  const Controller = (abcjs as typeof abcjs & { test?: { EngraverController?: typeof EngraverController } }).test?.EngraverController;
  if (typeof Controller !== 'function') return undefined;
  const tunes = abcjs.parseOnly(abc, options);
  const before = tunes.length === 1 && readRollGroupingIdentity(tunes[0], abc);
  if (!before || before.signature !== signature || before.systems.length !== 1) return undefined;
  const holder = host.ownerDocument.createElement('div');
  holder.setAttribute('style', 'visibility: hidden;');
  let controller: EngraverController | undefined;
  try {
    host.ownerDocument.body.appendChild(holder);
    controller = new Controller(holder, options);
    const sections = controller.getMeasureWidths(tunes[0]);
    const after = readRollGroupingIdentity(tunes[0], abc);
    if (controller.renderer.paper.dummySvg || !after || after.signature !== signature || sections.length !== 1) return undefined;
    return sections[0];
  } finally {
    try { controller?.renderer.paper.dummySvg?.remove(); } finally { holder.remove(); }
  }
}

/** One bounded, source-bound grouped-screen transaction. The caller supplies
 * the original source only for authorized all-part, untransposed, ordinary
 * lyric groups. No canonical, export, print or ungrouped preparation changes. */
export function renderRollGroupingScreenScore(host: HTMLElement, prepared: string, songId: string | undefined,
  options: abcjs.AbcVisualParams, canonical?: string, settled?: { baseline?: RollGroupingBaseline }): abcjs.TuneObjectArray {
  if (settled) settled.baseline = undefined;
  host.removeAttribute(ATTRIBUTE);
  const original = renderScreenScore(host, prepared, songId, options);
  if (!canonical || !hasRollGroupingSource(songId, canonical)) return original;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported' };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Read-only diagnostics. */ }
    return tunes;
  };
  let retained: Node[] | undefined;
  let attributes: [string, string][] | undefined;
  try {
    if (!supported(host, options) || original.length !== 1) return finish(original, 'unsupported');
    // TuneBook admission can throw too. Keep it inside the transaction so an
    // exception never escapes to the canvas and clears the ordinary score.
    const abc = rollGroupingWrappedNotation(prepared);
    if (!abc) return finish(original, 'unsupported');
    const before = readRollGroupingIdentity(original[0], abc);
    if (!before) return finish(original, 'source-identity');
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined) return finish(original, 'source-padding');
    const { wrap: _wrap, afterParsing: _after, clickListener: _click, ...measurement } = options;
    const unbroken = { ...measurement, lineBreaks: [[]] as unknown as number[] };
    const flat = abcjs.parseOnly(abc, unbroken);
    const flatIdentity = flat.length === 1 && readRollGroupingIdentity(flat[0], abc);
    if (!flatIdentity || flatIdentity.signature !== before.signature || flatIdentity.systems.length !== 1) return finish(original, 'measurement-identity');
    const widths = measure(host, abc, unbroken, flatIdentity.signature);
    if (!validWidths(widths)) return finish(original, 'measurement-widths');
    const minimum = rollGroupingMinimumStaffWidth(widths)!;
    const requested = options.staffwidth!, effective = Math.max(requested, minimum);
    const available = effective - (widths.left - padding.left);
    const fitted = fitRollGroupingSystems(before.systems, widths.measureWidths, available);
    diagnostic.originalUnits = before.systems;
    diagnostic.widths = widths;
    diagnostic.fit = { requestedStaffwidth: requested, effectiveStaffwidth: effective, minimumStaffwidth: minimum, limited: effective > requested };
    diagnostic.plannedUnits = fitted;
    if (!fitted) return finish(original, 'planner-fit');
    let systems: number[][] = fitted;
    preserveBlankLyricRows(host);
    const sourceGeometry: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = {
      version: 1, song: ROLL_GROUPING_ID, phase: 'source-geometry', result: 'original',
    };
    const geometry = readScreenScoreGeometry(host, before, false, sourceGeometry);
    diagnostic.sourceGeometryReason = sourceGeometry.reason;
    const typography = geometry && captureLyricTypography(host, before.notes, geometry);
    if (!geometry || !typography) return finish(original, 'source-geometry');
    retained = [...host.childNodes]; attributes = [...host.attributes].map(a => [a.name, a.value]);
    const { wrap: _automaticWrap, ...explicit } = options;
    const attempts: { units: number[][]; width?: number; reason: string }[] = [];
    diagnostic.attempts = attempts;
    // At most the measured partition and one all-real-bar refinement. A failed
    // identity, unreadable geometry or typography failure cannot trigger retry.
    for (let attempt = 0; attempt < 2; attempt++) {
      host.replaceChildren();
      diagnostic.plannedUnits = systems;
      const record = { units: systems, reason: 'candidate-identity' } as typeof attempts[number];
      attempts.push(record);
      const candidate = abcjs.renderAbc(host, abc, { ...explicit, staffwidth: effective,
        lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
      const after = candidate.length === 1 && readRollGroupingIdentity(candidate[0], abc);
      if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems) ||
        JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting)) {
        diagnostic.reason = record.reason; break;
      }
      preserveBlankLyricRows(host);
      const candidateGeometry: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = {
        version: 1, song: ROLL_GROUPING_ID, phase: 'candidate-geometry', result: 'original',
      };
      const nextGeometry = readScreenScoreGeometry(host, after, true, candidateGeometry);
      diagnostic.candidateGeometryReason = candidateGeometry.reason;
      diagnostic.candidateWidth = nextGeometry?.width;
      record.width = nextGeometry?.width;
      record.reason = 'candidate-geometry';
      const nativePadding = candidate[0].engraver?.renderer?.padding;
      const sameFrame = candidate[0].engraver?.width === effective && nativePadding?.left === 15 && nativePadding.right === 15;
      if (!nextGeometry || !sameSize(geometry, nextGeometry, effective + 30) || !sameFrame) {
        diagnostic.reason = record.reason;
        // ABCJS's spacing loop may promote a small overshoot into the common
        // viewport. Do not accept or normalize that width: remove all remaining
        // multi-bar joins once, then repeat every ordinary acceptance proof.
        const refined: number[][] | undefined = attempt === 0 && nextGeometry && sameFrame && nextGeometry.width > effective + 30 + EPSILON &&
          sameSize(geometry, nextGeometry, nextGeometry.width) ? refineRollGroupingSystems(systems) : undefined;
        if (refined) { systems = refined; record.reason = 'refine-inflated-multibar'; continue; }
        break;
      }
      const nextTypography = captureLyricTypography(host, after.notes, nextGeometry);
      const proof = nextTypography && verifyLyricTypography(host, typography, nextTypography);
      diagnostic.typography = proof;
      if (proof?.valid) {
        if (settled) settled.baseline = { widths, systems, signature: after.signature };
        record.reason = 'accepted'; diagnostic.result = 'candidate'; return finish(candidate, 'accepted');
      }
      record.reason = 'candidate-typography'; diagnostic.reason = record.reason; break;
    }
  } catch { diagnostic.reason = 'exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, String(diagnostic.reason));
}
