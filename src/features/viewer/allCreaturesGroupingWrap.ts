import abcjs from 'abcjs';
import { getPublishedStanzaVariant } from '../../domain/publishedStanzaVariant';
import { allCreaturesGroupingProfiles } from './allCreaturesGroupingProfiles';
import { readScreenScoreGeometry, readScreenScoreIdentity } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

const ID = 'hymn-oh_all-creatures-of-our-god-and-king-lasst-uns-erfreuen';
const ATTRIBUTE = 'data-all-creatures-grouping-wrap';
const EPSILON = 0.05;
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
type StaffSize = { local: number; screen: number };
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;
const fingerprint = (text: string) => {
  let hash = 14695981039346656037n;
  for (let i = 0; i < text.length; i++) hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(i))) * 1099511628211n);
  return `${text.length}:${hash}`;
};
const profiles = allCreaturesGroupingProfiles.map(([verses, mask, length, hash, parserLength, parserHash, prefix]) => ({
  verses, mask, prefix, prepared: `${length}:${hash}`, parser: `${parserLength}:${parserHash}`,
  parts: [0, 1, 2, 3].filter(part => mask & 1 << part),
}));
type Profile = typeof profiles[number];
// The static byte witnesses are generated once, not parsed on every render.
// Only the active parser's expected identity is parsed and cached below.
const preparedProfiles = new Map(profiles.map(profile => [profile.prepared, profile]));
const parserProfiles = new Map(profiles.map(profile => [profile.parser, profile]));
export function allCreaturesGroupingWrappedNotation(prepared: string) {
  const profile = preparedProfiles.get(fingerprint(prepared));
  if (!profile) return undefined;
  const book = new abcjs.TuneBook(prepared);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === profile.prefix &&
    book.tunes[0].abc === prepared.slice(profile.prefix).trimEnd() && fingerprint(book.tunes[0].abc) === profile.parser
    ? book.tunes[0].abc : undefined;
}
const attacks = [60, 61, 62, 78], heads = [67, 65, 63, 78], chords = [7, 4, 1, 0], slurs = [3, 12, 10, 15];
const count = (values: number[], profile: Profile) => profile.parts.reduce((sum, part) => sum + values[part], 0);
const noteFields = ['el_type', 'startChar', 'endChar', 'duration', 'pitches', 'lyric', 'startBeam', 'endBeam',
  'abselem', 'averagepitch', 'minpitch', 'maxpitch'];
const pitchFields = ['pitch', 'name', 'accidental', 'verticalPos', 'startSlur', 'endSlur', 'highestVert', 'printer_shift'];
function readIdentity(tune: abcjs.TuneObject | undefined, abc: string, profile: Profile) {
  if (!tune || tune.warnings?.length) return undefined;
  let invalid = false, starts = 0, ends = 0, chordCount = 0, beamStarts = 0, beamEnds = 0;
  const tempos: unknown[] = [], beams: unknown[][] = profile.parts.map(() => []);
  const ordinals = profile.parts.map(() => 0);
  const shape = [profile.parts.filter(part => part < 2).length, profile.parts.filter(part => part >= 2).length].filter(Boolean);
  const tempoStart = abc.indexOf('[Q:1/4=160]');
  const structural = { ...tune, lines: tune.lines.map((line, lineIndex) => {
    if (line.staff?.length !== shape.length || line.staff.some((staff, i) => staff.voices?.length !== shape[i]) ||
      line.staff[0].clef?.type !== 'treble' || (shape.length === 2 && line.staff[1].clef?.type !== 'bass')) invalid = true;
    return { ...line, staff: line.staff?.map((staff, staffIndex) => {
      if (Object.keys(staff).some(key => !['clef', 'key', 'meter', 'connectBarLines', 'voices'].includes(key)) ||
        (staff as typeof staff & { connectBarLines?: string }).connectBarLines !== (profile.mask === 15 ? staffIndex === 0 ? 'start' : 'end' : undefined)) invalid = true;
      return { ...staff, voices: staff.voices?.map((voice, voiceIndex) => {
        // The sole source beam is internal to one real bar. In a single-voice
        // staff its native stem direction follows the beam's average pitch.
        const beamDirections = new Map<abcjs.AbcElem, boolean>();
        let beam: abcjs.AbcElem[] | undefined;
        for (const raw of voice) {
          const note = raw as abcjs.AbcElem & { startBeam?: boolean; endBeam?: boolean };
          if (note.startBeam) { if (beam) invalid = true; beam = []; }
          if (beam && note.el_type === 'note') beam.push(note);
          if (note.endBeam) {
            if (!beam?.length) invalid = true;
            else {
              const average = beam.reduce((sum, event) => sum + event.pitches!.reduce((value, pitch) => value + pitch.verticalPos, 0) / event.pitches!.length, 0) / beam.length;
              beam.forEach(event => beamDirections.set(event, average < 6));
            }
            beam = undefined;
          }
        }
        if (beam) invalid = true;
        return voice.filter((raw, eventIndex) => {
        const event = raw as abcjs.AbcElem & { startBeam?: boolean; endBeam?: boolean; averagepitch?: number; minpitch?: number; maxpitch?: number };
        const voiceId = (staffIndex === 0 ? 0 : shape[0]) + voiceIndex;
        if (raw.el_type === 'tempo') {
          const tempo = raw as abcjs.VoiceItemTempo & { type?: string };
          if (lineIndex !== 0 || voiceId !== 0 || voice.slice(0, eventIndex).some(item => item.el_type !== 'stem') ||
            Object.keys(raw).some(key => !['el_type', 'startChar', 'endChar', 'duration', 'bpm', 'type', 'abselem'].includes(key)) ||
            tempo.startChar !== tempoStart || tempo.endChar !== tempoStart + 11 || tempoStart < 0 ||
            tempo.bpm !== 160 || JSON.stringify(tempo.duration) !== '[0.25]' || (tempo.type !== undefined && tempo.type !== 'tempo')) invalid = true;
          tempos.push([tempo.startChar, tempo.endChar, tempo.bpm, tempo.duration]);
          return false;
        }
        if (raw.el_type === 'stem') {
          if (Object.keys(raw).some(key => !['el_type', 'direction'].includes(key)) ||
            staff.voices!.length !== 2 || (raw as typeof raw & { direction?: string }).direction !== (voiceIndex === 0 ? 'up' : 'down')) invalid = true;
        } else if (raw.el_type === 'bar') {
          if (Object.keys(raw).some(key => !['el_type', 'startChar', 'endChar', 'type', 'abselem'].includes(key))) invalid = true;
        } else if (raw.el_type === 'note') {
          if (Object.keys(raw).some(key => !noteFields.includes(key)) || !event.pitches?.length || event.rest) invalid = true;
          const pitches = event.pitches ?? [], positions = pitches.map(pitch => pitch.verticalPos);
          chordCount += Number(pitches.length > 1);
          const expected = { averagepitch: positions.reduce((a, b) => a + b, 0) / positions.length,
            minpitch: Math.min(...positions), maxpitch: Math.max(...positions) };
          for (const field of ['averagepitch', 'minpitch', 'maxpitch'] as const) {
            if (event[field] !== undefined && event[field] !== expected[field]) invalid = true;
          }
          const stemUp = staff.voices!.length === 2 ? voiceIndex === 0 : beamDirections.get(event) ?? expected.averagepitch < 6;
          for (const [index, pitch] of pitches.entries()) {
            const derived = pitch as typeof pitch & { highestVert?: number; printer_shift?: string };
            const highest = pitch.verticalPos + (pitches.length === 1 && stemUp && typeof event.duration === 'number' && event.duration < 1 ? 6 : 0);
            const neighbor = pitches[index + (stemUp ? -1 : 1)];
            const shifted = neighbor && Math.abs(pitch.pitch - neighbor.pitch) <= 1;
            if (Object.keys(pitch).some(key => !pitchFields.includes(key)) ||
              (derived.highestVert !== undefined && derived.highestVert !== highest) ||
              (derived.printer_shift !== undefined && (!shifted || derived.printer_shift !== (pitch.pitch === neighbor.pitch ? 'same' : 'different')))) invalid = true;
            starts += pitch.startSlur?.length ?? 0; ends += pitch.endSlur?.length ?? 0;
          }
          if (event.startBeam) beamStarts++; if (event.endBeam) beamEnds++;
          beams[voiceId].push([ordinals[voiceId]++, event.startBeam, event.endBeam]);
        } else invalid = true;
        return true;
      }); }) };
    }) };
  }) };
  if (invalid || tempos.length !== 1 || starts !== count(slurs, profile) || ends !== starts || chordCount !== count(chords, profile) ||
    beamStarts !== Number(profile.parts.includes(3)) || beamEnds !== beamStarts) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1.5 || score.units.length !== 17 || score.notes.length !== count(attacks, profile) ||
    score.units.some((unit, index) => unit.duration !== (index === 0 ? .5 : index === 16 ? 1 : 1.5)) ||
    profile.parts.some((part, voice) => score.notes.filter(note => note.voice === voice).length !== attacks[part]) ||
    score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== count(heads, profile)) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, tempos, beams, tune.metaText]) };
}
const signatures = new Map<string, string>();
/** The shared reader signs every chord head, slur endpoint and lyric slot;
 * this wrapper also binds the exact tempo, beam flags, staff grouping and
 * derived chord caches. Never remove musical fields from the rendered tune. */
export function readAllCreaturesGroupingIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
  const profile = parserProfiles.get(fingerprint(abc));
  if (!profile) return undefined;
  let expected = signatures.get(abc);
  if (!expected) {
    expected = readIdentity(abcjs.parseOnly(abc, { lineBreaks: [[]] as unknown as number[] })[0], abc, profile)?.signature;
    if (expected) signatures.set(abc, expected);
  }
  const actual = readIdentity(tune, abc, profile);
  return actual && expected && actual.signature === expected ? actual : undefined;
}
/** Subdivide only the measured overflowing original system at real bars.
 * No other system moves or joins; a single-bar overflow has no safe plan. */
export function splitAllCreaturesOverflowSystem(systems: number[][], index: number) {
  if (!Number.isInteger(index) || index < 0 || index >= systems.length || systems.some(system => !system.length) ||
    systems.flat().length !== 17 || systems.flat().some((unit, i) => unit !== i) || systems[index].length < 2) return undefined;
  return systems.flatMap((system, i) => i === index ? system.map(unit => [unit]) : [system]);
}
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
export function supportsAllCreaturesGroupingOptions(host: HTMLElement, options: abcjs.AbcVisualParams) {
  return host.isConnected && !host.closest('.print-score-canvas') && Object.keys(options).every(key => optionKeys.includes(key)) &&
    options.accentAbove === true && options.add_classes === true && options.oneSvgPerLine === true && options.minPadding === 6 &&
    options.responsive === 'resize' && options.scale === 1 && (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false &&
    Number.isFinite(options.staffwidth) && options.staffwidth! > 0 && !!options.wrap &&
    Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}
export function preservesAllCreaturesRequestedSize(before: Geometry, after: Geometry, requested: number, staff: StaffSize, nextStaff: StaffSize) {
  const ratio = before.width / requested;
  return ratio > 1 && close(after.width, requested) && before.left === after.left && close(before.screenWidth, after.screenWidth) &&
    close(staff.local, nextStaff.local) && close(staff.screen * ratio, nextStaff.screen) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const next = after.notes[index];
      return note.font === next.font && note.heads.length === next.heads.length && note.heads.every((head, i) =>
        close(head.width, next.heads[i].width) && close(head.height, next.heads[i].height) &&
        close(head.screenWidth * ratio, next.heads[i].screenWidth) && close(head.screenHeight * ratio, next.heads[i].screenHeight)) &&
        note.lyrics.length === next.lyrics.length && note.lyrics.every((row, i) => row.text === next.lyrics[i].text);
    });
}
function staffSize(host: HTMLElement, count: number, staffCount: number) {
  const svgs = [...host.querySelectorAll('svg')];
  if (svgs.length !== count) return undefined;
  const groups = svgs.map(svg => [...svg.querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')]);
  if (groups.some(staves => staves.length !== staffCount)) return undefined;
  const sizes = groups.flatMap(staves => staves.map(staff => ({ local: staff.getBBox().height, screen: staff.getBoundingClientRect().height })));
  return sizes.length === staffCount * count && sizes.every(size => Number.isFinite(size.local) && size.local > 0 &&
    Number.isFinite(size.screen) && size.screen > 0 && close(size.local, sizes[0].local) && close(size.screen, sizes[0].screen)) ? sizes[0] : undefined;
}
/** Identify the first native width expansion, before it propagates into later
 * systems. Every earlier staff must fit and the expanded staff must exactly
 * explain the shared viewport width. Data-only predicate is independently tested. */
export function findAllCreaturesOverflowSystem(systems: number[][], widths: number[][], requested: number, viewport: number, staffCount: number) {
  if (!Number.isFinite(requested) || requested <= 0 || !Number.isFinite(viewport) || viewport <= requested + 30 + EPSILON ||
    widths.length !== systems.length || ![1, 2].includes(staffCount) || widths.some(row => row.length !== staffCount ||
      row.some(value => !Number.isFinite(value) || value <= 0 || !close(value, row[0])))) return undefined;
  const index = widths.findIndex(row => row[0] > requested + EPSILON);
  return index >= 0 && systems[index].length >= 2 && close(widths[index][0] + 30, viewport) ? index : undefined;
}
function overflowingSystem(host: HTMLElement, systems: number[][], requested: number, viewport: number, staffCount: number) {
  const svgs = [...host.querySelectorAll('svg')];
  if (svgs.length !== systems.length) return undefined;
  const boxes = svgs.map(svg => [...svg.querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')].map(staff => staff.getBBox()));
  if (boxes.some(row => row.some(box => ![box.x, box.width, box.height].every(Number.isFinite) || !close(box.x, 15) || box.width <= 0 || box.height <= 0))) return undefined;
  return findAllCreaturesOverflowSystem(systems, boxes.map(row => row.map(box => box.width)), requested, viewport, staffCount);
}
const arcsIntact = (host: HTMLElement, profile: Profile) => host.querySelectorAll('path[data-name="slur"]').length === count(slurs, profile) && !host.querySelector('path[data-name="tie"]');
/** One source/profile-bound split-only retry. Requested width, fonts, source,
 * print and export stay fixed. A failed proof restores the original nodes;
 * never normalize into the shrunken viewport or force a new opening join. */
export function refineAllCreaturesGroupingScreenScore(host: HTMLElement, prepared: string, songId: string | undefined,
  options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray, canonical?: string): abcjs.TuneObjectArray {
  host.removeAttribute(ATTRIBUTE);
  if (songId !== ID || !canonical || !getPublishedStanzaVariant(songId, canonical)) return original;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported' };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(ATTRIBUTE, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (!supportsAllCreaturesGroupingOptions(host, options) || original.length !== 1) return finish(original, 'unsupported');
    const abc = allCreaturesGroupingWrappedNotation(prepared);
    if (!abc) return finish(original, 'prepared-source');
    const before = readAllCreaturesGroupingIdentity(original[0], abc);
    if (!before) return finish(original, 'source-identity');
    const profile = parserProfiles.get(fingerprint(abc))!;
    const staffCount = profile.parts.some(part => part >= 2) ? 2 : 1;
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined || original[0].formatting.rightmargin !== undefined) return finish(original, 'source-padding');
    preserveBlankLyricRows(host);
    const geometry = readScreenScoreGeometry(host, before, false), staff = staffSize(host, before.systems.length, staffCount), requested = options.staffwidth! + 30;
    if (!geometry || !staff || !arcsIntact(host, profile)) return finish(original, 'source-geometry');
    diagnostic.widths = { original: geometry.width, requested };
    if (geometry.width <= requested + EPSILON) return finish(original, 'no-inflation');
    const overflow = overflowingSystem(host, before.systems, options.staffwidth!, geometry.width, staffCount);
    const systems = overflow === undefined ? undefined : splitAllCreaturesOverflowSystem(before.systems, overflow);
    if (!systems) return finish(original, 'unproven-real-bar-overflow');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'source-typography');
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    diagnostic.originalUnits = before.systems; diagnostic.plannedUnits = systems;
    const { wrap: _wrap, ...explicit } = options;
    host.replaceChildren();
    const candidate = abcjs.renderAbc(host, abc, { ...explicit, lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
    const after = candidate.length === 1 && readAllCreaturesGroupingIdentity(candidate[0], abc);
    if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems) ||
      JSON.stringify(candidate[0].formatting) !== JSON.stringify(original[0].formatting)) diagnostic.reason = 'candidate-identity';
    else {
      preserveBlankLyricRows(host); containScreenSvgSystems(host);
      const next = readScreenScoreGeometry(host, after, true), nextStaff = staffSize(host, systems.length, staffCount);
      diagnostic.candidateWidth = next?.width;
      const padding = candidate[0].engraver?.renderer?.padding;
      if (!next || !nextStaff || !preservesAllCreaturesRequestedSize(geometry, next, requested, staff, nextStaff) || !arcsIntact(host, profile) ||
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
