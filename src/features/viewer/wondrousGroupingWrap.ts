import abcjs from 'abcjs';
import { readScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

const ID = 'hymn-remaining-openpsalm-i-will-sing-the-wondrous-story';
const ATTRIBUTE = 'data-wondrous-grouping-wrap';
const EPSILON = 0.05;
type Score = NonNullable<Parameters<typeof readScreenScoreGeometry>[1]>;
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
const matches = (text: string, length: number, expected: bigint) => {
  if (text.length !== length) return false;
  let hash = 14695981039346656037n;
  for (let i = 0; i < text.length; i++) hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(i))) * 1099511628211n);
  return hash === expected;
};
type Witness = readonly [number, bigint];
type Pair = readonly [number, number];
const REFRAIN_PAIR: Pair = [12, 13];
// Complete preparations captured through ScoreRenderer.onScreenAbc. Native
// review proves [12,13] separately for each profile, plus [8,9] only for
// [1,2,3]. Unlisted pairs and preparations never enter the retry path.
const profiles: readonly { verses: readonly number[]; prepared: Witness; parser: Witness; additionalPair?: Pair }[] = [
  { verses: [3], prepared: [3664, 0x6126177c4ef5c0acn], parser: [2169, 0x184eb57b7c9b6cean] },
  { verses: [1, 2], prepared: [3806, 0x55c61eda46c9a6fbn], parser: [2311, 0x68be836f5bddf02fn] },
  { verses: [3, 4], prepared: [3824, 0x6b74a54b14e4042cn], parser: [2329, 0x9148e5ca2a823892n] },
  { verses: [1, 2, 3], prepared: [3971, 0x13cdcfa50fe4581dn], parser: [2476, 0x88dfd329bff602a1n], additionalPair: [8, 9] },
  { verses: [4, 5], prepared: [3817, 0x58bbd5a0e8ff972cn], parser: [2322, 0x4e4aeb9604d64492n] },
];
/** Exact all-part grouped preparations for canonical fc387f305d77….
 * Unlisted groups, full source, print and changed preparations are excluded. */
export function wondrousGroupingWrappedNotation(prepared: string) {
  const profile = profiles.find(profile => matches(prepared, ...profile.prepared));
  if (!profile) return undefined;
  const book = new abcjs.TuneBook(prepared);
  return book.header === '' && book.tunes.length === 1 && book.tunes[0].startPos === 1494 &&
    book.tunes[0].abc === prepared.slice(1494).trimEnd() && matches(book.tunes[0].abc, ...profile.parser)
    ? book.tunes[0].abc : undefined;
}
const noteFields = ['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'rest', 'lyric', 'chord',
  'startTriplet', 'tripletMultiplier', 'tripletR', 'startBeam', 'endTriplet', 'endBeam', 'decoration'];
const eventFields: Record<string, readonly string[]> = {
  note: [...noteFields, 'abselem', 'averagepitch', 'minpitch', 'maxpitch'],
  bar: ['el_type', 'startChar', 'endChar', 'type', 'abselem'],
  meter: ['el_type', 'startChar', 'endChar', 'type', 'value', 'lyric', 'abselem'],
  timeSignature: ['el_type', 'startChar', 'endChar', 'type', 'value', 'lyric', 'abselem'],
};
const pitchFields = ['pitch', 'name', 'verticalPos', 'startTie', 'endTie', 'accidental'];
const omitEngraving = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(omitEngraving);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'abselem')
    .map(([key, item]) => [key, omitEngraving(item)]));
};
function readIdentity(tune: abcjs.TuneObject | undefined, abc: string): Score | undefined {
  if (!tune || tune.warnings?.length || !tune.lines.length || 'sourceHeadPresentation' in tune || 'sourceLayerPresentation' in tune) return undefined;
  const events: unknown[][] = [[], [], [], []], notes: Score['notes'][] = [[], [], [], []];
  const stemSlots: unknown[] = [];
  const systems: number[][] = [], units: Score['units'] = [];
  let invalid = false;
  const staffIds: string[] = [];
  for (const [lineIndex, line] of tune.lines.entries()) {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2)) return undefined;
    const lineDurations: number[][] = [];
    for (const [staffIndex, staff] of line.staff.entries()) {
      const { voices: _voices, meter, ...identity } = staff;
      // Ignore only circular engraving references. Clefs, keys, staff grouping,
      // voice metadata and any unknown staff property still enter the identity.
      const writtenStaff = omitEngraving(identity) as Record<string, Record<string, unknown>>;
      for (const [field, type] of [['clef', 'clef'], ['key', 'keySignature']]) {
        if (!writtenStaff[field] || (writtenStaff[field].el_type !== undefined && writtenStaff[field].el_type !== type)) return undefined;
        writtenStaff[field].el_type = type;
      }
      const staffId = JSON.stringify(writtenStaff);
      if (lineIndex === 0) staffIds.push(staffId);
      else if (staffIds[staffIndex] !== staffId) return undefined;
      const writtenMeter = omitEngraving(meter) as Record<string, unknown> | undefined;
      if (writtenMeter?.el_type === 'timeSignature') delete writtenMeter.el_type;
      if ((!lineIndex && !writtenMeter) || (writtenMeter && JSON.stringify(writtenMeter) !== '{"type":"specified","value":[{"num":"3","den":"4"}]}')) return undefined;
      for (const [voiceIndex, voice] of staff.voices!.entries()) {
        const voiceId = staffIndex * 2 + voiceIndex, durations: number[] = [];
        let duration = 0, multiplier = 1;
        for (const raw of voice) {
          const item = raw as abcjs.AbcElem & Record<string, unknown>;
          if (item.el_type === 'stem') {
            // Rewrapping adds source-compatible stem directives. This edition's
            // Alto directives also carry a single empty source spacer.
            if (Object.keys(item).some(key => !['el_type', 'direction', 'lyric'].includes(key)) ||
              item.direction !== (voiceIndex === 0 ? 'up' : 'down') ||
              (item.lyric && (voiceId !== 1 || JSON.stringify(item.lyric) !== '[{"syllable":"","divider":" "}]'))) return undefined;
            if (item.lyric) stemSlots.push([voiceId, events[voiceId].length, item.lyric]);
            continue;
          }
          const fields = eventFields[item.el_type];
          if (!fields || Object.keys(item).some(key => !fields.includes(key)) ||
            !Number.isInteger(item.startChar) || !Number.isInteger(item.endChar) || item.startChar! < 0 ||
            item.endChar! <= item.startChar! || item.endChar! > abc.length) return undefined;
          const semantic = Object.fromEntries(fields.filter(key => !['abselem', 'averagepitch', 'minpitch', 'maxpitch'].includes(key))
            .map(key => [key, key === 'el_type' && item.el_type === 'timeSignature' ? 'meter' : key === 'pitches'
              ? item.pitches?.map(pitch => Object.fromEntries(pitchFields.map(field => [field, (pitch as unknown as Record<string, unknown>)[field]])))
              : omitEngraving(item[key])]));
          events[voiceId].push(semantic);
          if (item.el_type === 'note') {
            if (typeof item.duration !== 'number' || !Number.isFinite(item.duration) || item.duration <= 0 || (!!item.rest === !!item.pitches?.length)) return undefined;
            if (item.pitches) for (const pitch of item.pitches) {
              if (item.pitches.length !== 1 || Object.keys(pitch).some(key => ![...pitchFields, 'highestVert'].includes(key))) return undefined;
              const highest = (pitch as typeof pitch & { highestVert?: number }).highestVert;
              if (highest !== undefined && highest !== pitch.verticalPos + (voiceIndex === 0 && item.duration! < 1 ? 6 : 0)) return undefined;
            }
            const cache = item.pitches?.[0]?.verticalPos ?? (voiceIndex === 0 ? 11 : 3);
            for (const key of ['averagepitch', 'minpitch', 'maxpitch']) if (item[key] !== undefined && item[key] !== cache) return undefined;
            if (item.startTriplet) multiplier = item.tripletMultiplier!;
            duration += item.duration! * multiplier;
            if (item.endTriplet) multiplier = 1;
            notes[voiceId].push({ voice: voiceId, element: item });
          } else if (item.el_type === 'bar') {
            if (duration <= 0 || multiplier !== 1) return undefined;
            durations.push(duration); duration = 0;
          }
        }
        if (duration !== 0 || !durations.length) return undefined;
        lineDurations.push(durations);
      }
    }
    const lead = lineDurations[0];
    if (lineDurations.some(voice => voice.length !== lead.length || voice.some((value, i) => Math.abs(value - lead[i]) > 1e-8))) return undefined;
    systems.push(lead.map(duration => { const index = units.length; units.push({ duration, singleAttack: false }); return index; }));
  }
  invalid ||= units.length !== 17 || units.some((unit, index) => Math.abs(unit.duration - (index < 9 ? 0.75 : 1)) > 1e-8);
  invalid ||= [71, 79, 84, 81].some((count, voice) => notes[voice].length !== count);
  const all = notes.flat();
  invalid ||= all.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 269;
  if (invalid) return undefined;
  const meta = omitEngraving(tune.metaText) as Record<string, Record<string, unknown>>;
  if (!meta.tempo || ['type', 'el_type'].some(key => meta.tempo[key] !== undefined && meta.tempo[key] !== 'tempo')) return undefined;
  meta.tempo.type = 'tempo'; meta.tempo.el_type = 'tempo';
  return { meter: 0.75, units, systems, notes: all,
    signature: JSON.stringify([staffIds, meta, events, stemSlots]) };
}
const expectedSignatures = new Map<string, string>();
/** Bind every parsed event, lyric slot, tuplet, tie, meter and source range to
 * this exact parser input. No fields are removed from the actual tune. */
export function readWondrousGroupingIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (abcjs.signature !== 'abcjs-basic v6.7.0' || !profiles.some(profile => matches(abc, ...profile.parser))) return undefined;
  // Each complete parser source owns its lyric/stem/range witness. A prior
  // group must never supply the expected identity for another verse vector.
  let expectedSignature = expectedSignatures.get(abc);
  if (!expectedSignature) {
    expectedSignature = readIdentity(abcjs.parseOnly(abc, { lineBreaks: [[]] as unknown as number[] })[0], abc)?.signature;
    if (expectedSignature) expectedSignatures.set(abc, expectedSignature);
  }
  const result = readIdentity(tune, abc);
  return result && expectedSignature && result.signature === expectedSignature ? result : undefined;
}
/** Only divide one complete real-bar pair from the exact profile's allowlist. */
export function splitWondrousInflatedPair(systems: number[][], pair: Pair = REFRAIN_PAIR) {
  if (!systems.length || systems.some(system => !system.length) || systems.flat().length !== 17 ||
    systems.flat().some((unit, index) => unit !== index) ||
    !Number.isInteger(pair[0]) || pair[0] < 0 || pair[1] !== pair[0] + 1 || pair[1] > 16 ||
    systems.filter(system => system.length === 2 && system[0] === pair[0] && system[1] === pair[1]).length !== 1) return undefined;
  return systems.flatMap(system => system.length === 2 && system[0] === pair[0] && system[1] === pair[1] ? [[pair[0]], [pair[1]]] : [system]);
}
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
function supported(host: HTMLElement, options: abcjs.AbcVisualParams) {
  return host.isConnected && !host.closest('.print-score-canvas') && Object.keys(options).every(key => optionKeys.includes(key)) &&
    options.accentAbove === true && options.add_classes === true && options.oneSvgPerLine === true && options.minPadding === 6 &&
    options.responsive === 'resize' && options.scale === 1 && (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false &&
    Number.isFinite(options.staffwidth) && options.staffwidth! > 0 && !!options.wrap &&
    Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}
function sameSize(before: Geometry, after: Geometry, width: number) {
  const close = (a: number, b: number) => Math.abs(a - b) <= EPSILON, ratio = before.width / width;
  return close(after.width, width) && before.left === after.left && close(before.screenWidth, after.screenWidth) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const next = after.notes[index];
      return note.font === next.font && note.heads.length === next.heads.length && note.heads.every((head, i) =>
        close(head.width, next.heads[i].width) && close(head.height, next.heads[i].height) &&
        close(head.screenWidth * ratio, next.heads[i].screenWidth) && close(head.screenHeight * ratio, next.heads[i].screenHeight)) &&
        note.lyrics.length === next.lyrics.length && note.lyrics.every((row, i) => row.text === next.lyrics[i].text);
    });
}
/** Prove that this pair starts the width inflation seen in the native report.
 * Read local staff geometry only; no SVG dimensions or glyphs are changed. */
function overflowingPair(host: HTMLElement, systems: number[][], requested: number, viewport: number, allowedPair: Pair) {
  const pair = systems.findIndex(system => system.length === 2 && system[0] === allowedPair[0] && system[1] === allowedPair[1]);
  const svgs = [...host.querySelectorAll('svg')];
  if (pair < 0 || svgs.length !== systems.length) return false;
  for (let index = 0; index <= pair; index++) {
    const staffs = [...svgs[index].querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')];
    if (staffs.length !== 2) return false;
    const boxes = staffs.map(staff => staff.getBBox());
    if (boxes.some(box => ![box.x, box.width, box.height].every(Number.isFinite) ||
      Math.abs(box.x - 15) > EPSILON || box.height <= 0 || box.width <= 0) ||
      Math.abs(boxes[0].width - boxes[1].width) > EPSILON) return false;
    if (index < pair ? boxes[0].width > requested + EPSILON
      : boxes[0].width <= requested + EPSILON || Math.abs(boxes[0].width + 30 - viewport) > EPSILON) return false;
  }
  return true;
}
/** A single rollback-safe retry for the reviewed grouped overflow. The original
 * nodes survive every rejected identity, physical-size or typography proof.
 * Never change a viewport, glyph size, requested budget, source or print view. */
export function refineWondrousGroupingScreenScore(host: HTMLElement, prepared: string, songId: string | undefined,
  options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray): abcjs.TuneObjectArray {
  host.removeAttribute(ATTRIBUTE);
  if (songId !== ID) return original;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported' };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Read-only diagnostic. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (!supported(host, options) || original.length !== 1) return finish(original, 'unsupported');
    const abc = wondrousGroupingWrappedNotation(prepared);
    if (!abc) return finish(original, 'unsupported');
    const before = readWondrousGroupingIdentity(original[0], abc);
    if (!before) return finish(original, 'source-identity');
    const profile = profiles.find(profile => matches(abc, ...profile.parser))!;
    const pairs = profile.additionalPair ? [REFRAIN_PAIR, profile.additionalPair] : [REFRAIN_PAIR];
    const plans = pairs.flatMap(pair => {
      const systems = splitWondrousInflatedPair(before.systems, pair);
      return systems ? [{ pair, systems }] : [];
    });
    if (!plans.length) return finish(original, 'unaffected-systems');
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined) return finish(original, 'source-padding');
    preserveBlankLyricRows(host);
    const geometry = readScreenScoreGeometry(host, before, false);
    const width = options.staffwidth! + 30;
    if (!geometry) return finish(original, 'source-geometry');
    diagnostic.widths = { original: geometry.width, requested: width };
    if (geometry.width <= width + EPSILON) return finish(original, 'no-inflation');
    const plan = plans.find(plan => overflowingPair(host, before.systems, options.staffwidth!, geometry.width, plan.pair));
    if (!plan) return finish(original, 'unproven-overflow-pair');
    const { systems } = plan;
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'source-typography');
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    diagnostic.originalUnits = before.systems; diagnostic.plannedUnits = systems; diagnostic.plannedPair = plan.pair;
    const { wrap: _wrap, ...explicit } = options;
    host.replaceChildren();
    const candidate = abcjs.renderAbc(host, abc, { ...explicit,
      lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && readWondrousGroupingIdentity(candidate[0], abc);
    if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems) ||
      JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting)) diagnostic.reason = 'candidate-identity';
    else {
      preserveBlankLyricRows(host);
      const next = readScreenScoreGeometry(host, after, true);
      diagnostic.candidateWidth = next?.width;
      const padding = candidate[0].engraver?.renderer?.padding;
      if (!next || !sameSize(geometry, next, width) || candidate[0].engraver?.width !== options.staffwidth ||
        padding?.left !== 15 || padding.right !== 15) diagnostic.reason = 'candidate-geometry';
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
