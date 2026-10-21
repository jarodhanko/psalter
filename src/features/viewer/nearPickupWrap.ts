import abcjs from 'abcjs';
import EngraverController from 'abcjs/src/write/engraver-controller';
import { readScreenScoreGeometry, readScreenScoreIdentity } from './isolatedChordWrap';
import { installSaviorNativeTextMeasurement } from './saviorWidthProbe';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

export const NEAR_PICKUP_ID = 'hymn-final-htg-near-to-the-heart-of-god';
const ATTRIBUTE = 'data-near-pickup-wrap';
const OPENING_ATTRIBUTE = 'data-near-opening-wrap';
const EPSILON = 0.05;
// Frozen HymnsToGod canonical SHA-256:
// ce031bce15626ff19767ac86d70ff05ff0ada24ae361739efc83277105a14d4a.
// Bind original bytes separately from the exact all-parts/three-stanza screen
// preparation. This witness never changes notation or shared-refrain identity.
const SOURCE = [4656, 0xb36bd99edaf7be2cn] as const;
const PREPARED = [4369, 0x2c507ae687fcc637n] as const;
const PARSER = [4359, 0x5944ffdd6bd1c18cn] as const;
function matchesWitness(abc: string, witness: readonly [number, bigint]) {
  if (abc.length !== witness[0]) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  return hash === witness[1];
}
const DURATIONS = [0.25, 1, 1, 1, 0.75, 0.25, 1, 1, 1, 0.75, 0.25, 1, 1, 1, 0.75, 0.25, 1, 1, 1, 0.75];
const ATTACKS = [1, 4, 3, 5, 1, 1, 4, 3, 5, 1, 1, 4, 2, 5, 1, 1, 4, 2, 5, 1];
const GROUPING = JSON.stringify([['start', undefined, 'start'], ['end', undefined, 'end']]);
const PITCH_FIELDS = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'startTie', 'endTie',
  'startSlur', 'endSlur', 'style', 'highestVert']);
type Widths = { left: number; measureWidths: number[]; total: number };
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
export type NearPickupSettings = {
  requestedScale: number; scoreWidth: number; transpose: number; learnerAccidentals: boolean;
  visibleKey: string; stanzasPerGroup: number; grouped: boolean; musicOnly: boolean; repeatUnderlay: boolean;
};
type Status = 'not-checked' | 'match' | 'mismatch';
type Diagnostic = {
  version: 1; result: 'original' | 'candidate'; phase: string; reason: string; reasons: string[];
  engine: string; settings: NearPickupSettings;
  candidateEngraving: 'not-attempted' | 'attempted'; candidateGeometry: 'not-proven' | 'proven';
  identity: { canonical: Status; preparedParser: Status; original: Status; unbroken: Status; measured: Status; candidate?: Status };
  originalUnits?: number[][]; plannedUnits?: number[][]; requestedStaffwidth?: number; originalWidth?: number;
  complete?: Widths & { available: number; joinWidth: number };
  nativeText?: ReturnType<typeof installSaviorNativeTextMeasurement>;
  candidate?: { units?: number[][]; engravingStaffwidth: number; nativeWidth?: number };
  geometryReason?: string;
  typography?: { rows: number; nativeControls: number; compared: number; measurements: number; valid: boolean };
};
function close(a: number, b: number) { return Math.abs(a - b) <= EPSILON; }
function validPartition(systems: number[][]) {
  return systems.length > 0 && systems.every(system => system.length > 0) && systems.flat().length === 20 &&
    systems.flat().every((unit, index) => unit === index);
}
function validWidths(widths: Widths | undefined): widths is Widths {
  return !!widths && Number.isFinite(widths.left) && widths.left >= 15 &&
    Array.isArray(widths.measureWidths) && widths.measureWidths.length === 20 &&
    widths.measureWidths.every(width => Number.isFinite(width) && width > 0) && Number.isFinite(widths.total) &&
    close(widths.total, widths.measureWidths.reduce((sum, width) => sum + width, 0));
}
export function hasNearPickupSource(songId: string | undefined, abc: string) {
  return songId === NEAR_PICKUP_ID && matchesWitness(abc, SOURCE);
}
/** Match automatic wrapping's exact TuneBook prefix/offset behavior. */
export function nearPickupWrappedNotation(abc: string): string | undefined {
  if (!matchesWitness(abc, PREPARED)) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 9 &&
    book.tunes[0].abc === abc.slice(9).trimEnd() && matchesWitness(book.tunes[0].abc, PARSER) ? book.tunes[0].abc : undefined;
}

/** Delete exactly the break after the isolated O pickup. Keep the next whole
 * existing system and every other original break. In particular, never join
 * backward across unit 9's double bar or touch unit 15's Hold pickup.
 * These synthetic width conditions do not prove native fit. */
export function fitNearPickupSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  if (!validPartition(systems) || widths.length !== 20 || widths.some(width => !Number.isFinite(width) || width <= 0) ||
    !Number.isFinite(available) || available <= 0) return undefined;
  const index = systems.findIndex(system => system.length === 1 && system[0] === 10);
  if (index < 0 || systems[index + 1]?.[0] !== 11) return undefined;
  const fitted = systems.map(system => [...system]);
  fitted.splice(index, 2, [10, ...systems[index + 1]]);
  return fitted.every(system => system.reduce((sum, unit) => sum + widths[unit], 0) <= available + EPSILON)
    ? fitted : undefined;
}

/** Delete only the opening break, preserving the entire following system.
 * Validate all measurements, but budget only this changed system: an unchanged
 * long system is still subject to the full native candidate geometry checks. */
export function fitNearOpeningSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  if (!validPartition(systems) || widths.length !== 20 || widths.some(width => !Number.isFinite(width) || width <= 0) ||
    !Number.isFinite(available) || available <= 0 || systems[0].length !== 1 || systems[0][0] !== 0 ||
    systems[1]?.[0] !== 1) return undefined;
  const joined = [0, ...systems[1]];
  if (joined.reduce((sum, unit) => sum + widths[unit], 0) > available + EPSILON) return undefined;
  return [joined, ...systems.slice(2).map(system => [...system])];
}

/** Source-local, read-only chord sorting mirrors ABCJS 6.7's engraving sort.
 * Keep every musical pitch field and exact source/lyric position in the shared
 * signature. This edition has no slurs: highestVert is only the known derived
 * single-head up-stem cache or the chord head's own position. Unknown pitch
 * fields, including every MIDI override, fail closed. */
export function readNearPickupIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || !matchesWitness(abc, PARSER) || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
  let invalid = false;
  const structural = { ...tune, lines: tune.lines.map(line => {
    if (line.staff?.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== GROUPING || line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass') invalid = true;
    return { ...line, staff: line.staff?.map(staff => ({ ...staff,
      voices: staff.voices?.map((voice, voiceIndex) => voice.map(raw => {
        if (raw.el_type !== 'note') return raw;
        const element = raw as abcjs.AbcElem;
        if (element.startSlur || element.endSlur || element.pitches?.some(pitch => {
          const value = pitch as typeof pitch & { highestVert?: number };
          return Object.keys(pitch).some(key => !PITCH_FIELDS.has(key)) || pitch.startSlur || pitch.endSlur ||
            (value.highestVert !== undefined && value.highestVert !== pitch.verticalPos +
              (element.pitches!.length === 1 && voiceIndex === 0 && typeof element.duration === 'number' && element.duration < 1 ? 6 : 0));
        })) invalid = true;
        return element.pitches ? { ...element, pitches: [...element.pitches].sort((a, b) => a.pitch - b.pitch) } : raw;
      })),
    })) };
  }) } as abcjs.TuneObject;
  if (invalid) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 20 || score.notes.length !== 160 || !validPartition(score.systems) ||
    score.units.some((unit, index) => unit.duration !== DURATIONS[index]) ||
    score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 218 ||
    [54, 29, 54, 23].some((count, voice) => score.notes.filter(note => note.voice === voice).length !== count)) return undefined;
  for (let voice = 0; voice < 4; voice++) {
    const events = structural.lines.flatMap(line => line.staff!.flatMap(staff => staff.voices ?? [])[voice]);
    let unit = 0, attacks = 0, onset = 0;
    for (const raw of events) {
      const event = raw as abcjs.AbcElem;
      if (event.el_type === 'note') {
        if ((voice === 0 && (event.rest || event.lyric?.length !== 3)) || (voice !== 0 && event.lyric?.length)) return undefined;
        if (unit === 10 && (onset !== 8 || event.duration !== 0.25 ||
          abc.slice(event.startChar, event.endChar).trim() !== ['D2', 'D2', '[F,D,]2', 'x2'][voice] ||
          (voice === 0 && event.lyric?.[0].syllable !== 'O'))) return undefined;
        if (event.pitches?.length) attacks++;
        if (typeof event.duration !== 'number') return undefined;
        onset += event.duration;
      } else if (event.el_type === 'bar') {
        if (voice === 0 && attacks !== ATTACKS[unit]) return undefined;
        if (unit === 9 && (event.type !== 'bar_thin_thin' || abc.slice(event.startChar, event.endChar).trim() !== '||')) return undefined;
        if (unit === 10 && (event.type !== 'bar_thin' || abc.slice(event.startChar, event.endChar).trim() !== '|')) return undefined;
        unit++; attacks = 0;
      }
    }
    if (unit !== 20 || onset !== 16 || attacks) return undefined;
  }
  const tempo = tune.metaText.tempo;
  if (!tempo || tempo.startChar !== 16 || tempo.endChar !== 24 || tempo.bpm !== 95 || JSON.stringify(tempo.duration) !== '[0.25]' ||
    tempo.preString !== undefined || tempo.postString !== undefined || tempo.suppress !== undefined ||
    Object.keys(tempo).some(key => !['startChar', 'endChar', 'duration', 'bpm', 'type', 'el_type', 'abselem'].includes(key))) return undefined;
  const derived = tempo as typeof tempo & { type?: string; el_type?: string };
  if ((derived.type !== undefined && derived.type !== 'tempo') || (derived.el_type !== undefined && derived.el_type !== 'tempo')) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, GROUPING,
    [tempo.startChar, tempo.endChar, tempo.duration, tempo.bpm]]) };
}

function hasOpeningPickup(score: NonNullable<ReturnType<typeof readNearPickupIdentity>>, abc: string) {
  if (!score.units[0].singleAttack || score.units[0].duration !== 0.25 ||
    score.units[1].singleAttack || score.units[1].duration !== score.meter) return false;
  return ['[FD]2', 'x2', '[A,D,]2', 'x2'].every((source, voice) => {
    const first = score.notes.find(note => note.voice === voice)?.element;
    return !!first && first.duration === 0.25 && abc.slice(first.startChar, first.endChar).trim() === source &&
      (voice !== 0 || first.lyric?.every((row, index) => row.syllable === `${index + 1}.\u00a0There` && row.divider === ' '));
  });
}

function settingReasons(settings: NearPickupSettings) {
  const reasons: string[] = [];
  if (settings.visibleKey !== '0,1,2,3') reasons.push('parts');
  if (settings.stanzasPerGroup !== 3) reasons.push('stanzas');
  if (settings.transpose !== 0) reasons.push('transpose');
  if (settings.learnerAccidentals) reasons.push('learner');
  if (settings.grouped) reasons.push('grouping');
  if (settings.musicOnly) reasons.push('music-only');
  if (settings.repeatUnderlay) reasons.push('alternate-underlay');
  if (!Number.isFinite(settings.requestedScale) || settings.requestedScale <= 0 ||
    !Number.isFinite(settings.scoreWidth) || settings.scoreWidth <= 0) reasons.push('requested-size');
  return reasons;
}
export function clearNearPickupWrap(host: HTMLElement | null) {
  host?.removeAttribute(ATTRIBUTE);
  host?.removeAttribute(OPENING_ATTRIBUTE);
}
function reportSettings(host: HTMLElement | null, songId: string | undefined, settings: NearPickupSettings, attribute: string) {
  host?.removeAttribute(attribute);
  if (!host || songId !== NEAR_PICKUP_ID) return;
  const reasons = settingReasons(settings);
  const diagnostic: Diagnostic = { version: 1, result: 'original', phase: 'settings',
    reason: reasons.length ? 'unsupported-settings' : 'render-unavailable', reasons, engine: abcjs.signature,
    settings: { ...settings }, candidateEngraving: 'not-attempted', candidateGeometry: 'not-proven',
    identity: { canonical: 'not-checked', preparedParser: 'not-checked', original: 'not-checked', unbroken: 'not-checked', measured: 'not-checked' } };
  try { host.setAttribute(attribute, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
  return diagnostic;
}
export function reportNearPickupSettings(host: HTMLElement | null, songId: string | undefined, settings: NearPickupSettings) {
  reportSettings(host, songId, settings, OPENING_ATTRIBUTE);
  return reportSettings(host, songId, settings, ATTRIBUTE);
}
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: NearPickupSettings) {
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


// Only the successful O attempt can construct this witness, and only the
// immediately following opening attempt consumes it. A DOM diagnostic cannot
// authorize a different staffwidth or enlarge the original planning budget.
type VerifiedBaseline = {
  tunes: abcjs.TuneObjectArray; host: HTMLElement; options: abcjs.AbcVisualParams;
  staffwidth: number; requestedStaffwidth: number; signature: string; systems: string; nodes: Node[];
};
type AttemptResult = { tunes: abcjs.TuneObjectArray; verified?: VerifiedBaseline };
type ReflowArgs = [diagnosticHost: HTMLElement | null, host: HTMLElement, sourceAbc: string, preparedAbc: string,
  songId: string | undefined, options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray, settings: NearPickupSettings];

/** Preserve the established O-only entry point and planner independently. */
export function reflowNearPickupScreenScore(...args: ReflowArgs): abcjs.TuneObjectArray {
  return reflowPickup(...args, 10).tunes;
}

/** Each attempt owns its own rollback and diagnostics. The opening attempt
 * starts from the accepted O layout when present, including its live nodes. */
export function reflowNearScreenScore(...args: ReflowArgs): abcjs.TuneObjectArray {
  const refrain = reflowPickup(...args, 10);
  const openingArgs: ReflowArgs = [...args];
  openingArgs[6] = refrain.tunes;
  return reflowPickup(...openingArgs, 0, refrain.verified).tunes;
}

/** Screen-only and one-break-only. Native complete-unit widths at the requested
 * budget are necessary, then the native candidate must retain the ordinary
 * physical-size envelope, every head/row/staff, six-unit lyric clearance and
 * independent typography controls. No viewport normalization or type scaling.
 * Every decline restores the original listener-bearing nodes and tune. */
function reflowPickup(diagnosticHost: HTMLElement | null, host: HTMLElement,
  sourceAbc: string, preparedAbc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: NearPickupSettings, unit: 0 | 10, baseline?: VerifiedBaseline): AttemptResult {
  const attribute = unit === 0 ? OPENING_ATTRIBUTE : ATTRIBUTE;
  const diagnostic = reportSettings(diagnosticHost, songId, settings, attribute);
  if (!diagnostic) return { tunes: original };
  let verified: VerifiedBaseline | undefined;
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { diagnosticHost!.setAttribute(attribute, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return { tunes, verified };
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    diagnostic.identity.canonical = hasNearPickupSource(songId, sourceAbc) ? 'match' : 'mismatch';
    if (diagnostic.identity.canonical !== 'match') return finish(original, 'canonical-source');
    if (diagnostic.reasons.length) return finish(original, 'unsupported-settings');
    if (abcjs.signature !== 'abcjs-basic v6.7.0') return finish(original, 'engine-version');
    diagnostic.phase = 'options';
    diagnostic.requestedStaffwidth = options.staffwidth;
    if (!supported(host, options, settings)) return finish(original, 'unsupported-options');
    const abc = nearPickupWrappedNotation(preparedAbc);
    diagnostic.identity.preparedParser = abc === undefined ? 'mismatch' : 'match';
    if (abc === undefined) return finish(original, 'prepared-source');
    diagnostic.phase = 'original';
    const before = original.length === 1 && readNearPickupIdentity(original[0], abc);
    diagnostic.identity.original = before ? 'match' : 'mismatch';
    if (!before) return finish(original, 'original-identity');
    diagnostic.originalUnits = before.systems;
    const pickup = before.systems.findIndex(system => system.length === 1 && system[0] === unit);
    if (pickup < 0) return finish(original, 'pickup-already-paired');
    if (unit === 0 && (pickup !== 0 || before.systems[1]?.[0] !== 1 || !hasOpeningPickup(before, abc)))
      return finish(original, 'opening-identity');
    const staffwidth = options.staffwidth!;
    if (baseline && (unit !== 0 || baseline.tunes !== original || baseline.host !== host || baseline.options !== options ||
      baseline.requestedStaffwidth !== staffwidth || baseline.signature !== before.signature ||
      baseline.systems !== JSON.stringify(before.systems) || baseline.nodes.length !== host.childNodes.length ||
      baseline.nodes.some((node, index) => node !== host.childNodes[index]))) return finish(original, 'original-baseline');
    const baselineStaffwidth = baseline?.staffwidth ?? staffwidth;
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== baselineStaffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined) return finish(original, 'original-padding');
    const { wrap: _wrap, afterParsing: _afterParsing, clickListener: _clickListener, ...measurement } = options;
    const unbroken = { ...measurement, lineBreaks: [[]] as unknown as number[] };
    diagnostic.phase = 'measurement';
    const flatTunes = abcjs.parseOnly(abc, unbroken);
    const flat = flatTunes.length === 1 && readNearPickupIdentity(flatTunes[0], abc);
    diagnostic.identity.unbroken = flat && flat.signature === before.signature && flat.systems.length === 1 ? 'match' : 'mismatch';
    if (!flat || diagnostic.identity.unbroken !== 'match') return finish(original, 'measurement-identity');
    const measurementHost = host.ownerDocument.createElement('div');
    measurementHost.setAttribute('style', 'visibility: hidden;');
    let sections: Widths[], controller: EngraverController | undefined, usedFallback = false;
    try {
      host.ownerDocument.body.appendChild(measurementHost);
      controller = new EngraverController(measurementHost, unbroken);
      diagnostic.nativeText = installSaviorNativeTextMeasurement(controller.renderer.paper);
      sections = controller.getMeasureWidths(flatTunes[0]);
      usedFallback = !!controller.renderer.paper.dummySvg;
    } finally {
      try { controller?.renderer.paper.dummySvg?.remove(); }
      finally { measurementHost.remove(); }
    }
    if (usedFallback || !diagnostic.nativeText.nativeMeasurements) return finish(original, 'measurement-native-text');
    const measured = readNearPickupIdentity(flatTunes[0], abc);
    diagnostic.identity.measured = measured && measured.signature === before.signature ? 'match' : 'mismatch';
    if (diagnostic.identity.measured !== 'match') return finish(original, 'measurement-identity');
    const widths = sections[0];
    if (sections.length !== 1 || !validWidths(widths)) return finish(original, 'measurement-widths');
    const available = staffwidth - (widths.left - 15);
    diagnostic.complete = { ...widths, measureWidths: [...widths.measureWidths], available,
      joinWidth: [unit, ...before.systems[pickup + 1]].reduce((sum, item) => sum + widths.measureWidths[item], 0) };
    diagnostic.phase = 'planner';
    const systems = (unit === 0 ? fitNearOpeningSystems : fitNearPickupSystems)(before.systems, widths.measureWidths, available);
    if (!systems) return finish(original, 'no-fitting-forward-join');
    diagnostic.plannedUnits = systems;
    diagnostic.phase = 'original-geometry';
    const geometry = readScreenScoreGeometry(host, before, false);
    const staves = staffSizes(host, before.systems.length);
    if (!geometry || !sameViewport(host, geometry, before.systems.length) || !staves || staves.some(size =>
      !close(size.local, staves[0].local) || !close(size.screen, staves[0].screen)) || geometry.width < staffwidth + 30 - EPSILON ||
      (baseline && geometry.width !== baselineStaffwidth + 30))
      return finish(original, 'original-geometry');
    diagnostic.originalWidth = geometry.width;
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'original-typography');
    retained = [...host.childNodes];
    attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    diagnostic.phase = 'candidate-render'; diagnostic.candidateEngraving = 'attempted';
    const { wrap: _automatic, ...explicit } = options;
    const nativeStaffwidth = geometry.width - 30;
    const candidate = abcjs.renderAbc(host, abc, { ...explicit, staffwidth: nativeStaffwidth,
      lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && readNearPickupIdentity(candidate[0], abc);
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
      if (!nativeGeometry || nativeGeometry.width !== geometry.width || nativeGeometry.left !== geometry.left ||
        !sameViewport(host, geometry, after.systems.length)) diagnostic.reason = 'candidate-viewport';
      else {
        const geometryDiagnostic: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = {
          version: 1, song: NEAR_PICKUP_ID, phase: 'candidate-geometry', result: 'original',
        };
        const finalGeometry = readScreenScoreGeometry(host, after, true, geometryDiagnostic);
        const finalStaves = staffSizes(host, after.systems.length);
        diagnostic.geometryReason = geometryDiagnostic.reason;
        if (!finalGeometry || !samePhysicalSize(geometry, finalGeometry) || !finalStaves || finalStaves.some(size =>
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
            verified = { tunes: candidate, host, options, staffwidth: nativeStaffwidth, requestedStaffwidth: staffwidth,
              signature: after.signature, systems: JSON.stringify(after.systems), nodes: [...host.childNodes] };
            return finish(candidate, 'accepted');
          }
          diagnostic.reason = 'candidate-typography';
        }
      }
    }
  } catch { diagnostic.reason = diagnostic.nativeText?.invalidMeasurements ? 'measurement-text-bounds' : 'exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, diagnostic.reason);
}
