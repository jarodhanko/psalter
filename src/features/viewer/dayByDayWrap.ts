import abcjs from 'abcjs';
import { readScreenScoreGeometry, readScreenScoreIdentity } from './isolatedChordWrap';
import { withHymnVocalPlacement } from './hymnVocalPlacement';
import { preserveBlankLyricRows } from './lyricRows';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';
import type { TypographyMismatch } from './lyricTypography';

const SONG = 'hymn-final-htg-day-by-day';
const ATTRIBUTE = 'data-day-by-day-wrap';
const ENDING_ATTRIBUTE = 'data-day-by-day-ending-wrap';
const EPSILON = 0.05;
// Frozen HymnsToGod edition, canonical SHA-256:
// de04abc72946e58db46637b41c0a35be5d6f197da5aac95ef417ef1222d1f637.
// Bind original bytes before preparation and independently bind the exact
// all-parts/all-stanzas screen copy. Revised sources require fresh review.
const sourceWitness = "%abc-2.1\nX:1\nT:Day by Day\nC:Karolina W. Sandell-Berg, 1865; trans. by Andrew L. Skog | Oskar Ahnfelt, 1872\nS:HymnsToGod.org; original MUP and PDF retained\nM:4/4\nL:1/8\nQ:1/4=90\nN:Source MUP SHA-256 3b902ea1156235a18d4812af07a23b0dc2a6e0aaac18f1dae06d1efdba354ab4\nN:Source describes this hymn as believed public domain in the United States only\nN:MUP source code donated to public domain; no global-territory clearance implied\nN:Two chordal staves with supplemental MUP voices, not a four-independent-SATB reduction\nN:All-voice collapsible spaces normalized per MUP 7.2 semantics; see model and transformation map\n%%score { (11 12) | (21 22) }\n%%staffsep 90\n%%vocalspace 12\n%%pagewidth 1200\n%%barsperstaff 4\n%%measurenb 0\n%%flatbeams 1\nV:11 clef=treble\n%%vocal below\nV:12 clef=treble\n%%vocal below\nV:21 clef=bass\n%%vocal above\nV:22 clef=bass\n%%vocal above\nK:Eb\n% SOURCE title bold (19) \"\" \"Day by Day\" \"\"\n% SOURCE title (2)\"\"\n% SOURCE title (11) \"\" \"\\f(TI)For which cause we faint not; but though our outward man perish,\"\"\"\n% SOURCE title (11) \"\" \"\\f(TI)yet the inward man is renewed day by day. - 2 Cor. 4:16\"\"\"\n% SOURCE title (12) \"E \\(flat) - 4 - MI\" \"\" \"\"\n% SOURCE title (15) \"Karolina W. Sandell-Berg, 1865\\ntrans. by Andrew L. Skog\" \" \" \"Oskar Ahnfelt, 1872\"\n% SOURCE title (11) \"\" \"Public Domain\" \"HymnsToGod.org\"\n% SOURCE // Mup 7.2 arkkra.com\n% SOURCE // The hymn produced by this source code is believed to be in the public \n% SOURCE // domain in the United States of America.\n% SOURCE // This mup code is donated to the public domain.\n% SOURCE // Hymn Source: http://library.timelesstruths.org\n% SOURCE // Transcribed by: Ted Gatza, Jr. 12/21/2009\n% SOURCE // Revisions:\n% SOURCE //\t06/19/2026 [1]Updated Mup code\n% SOURCE // HymnsToGod.org\n% SOURCE //==== FOR 6X9 ======================\n% SOURCE //=========================\n% SOURCE //=========================\n% SOURCE //=========================\n% SOURCE //=========================\n% SOURCE //define macros\n% SOURCE    //Lyrics\n% SOURCE      //Lyrics Between Staffs\n% SOURCE      //Lyrics Below Bass Staff    \n% SOURCE      //Text - Above Staff\n% SOURCE      //Fermatas\n% SOURCE      //Note Accents\n% SOURCE      //Repeats\n% SOURCE //=========================\n% SOURCE // set midi\n% SOURCE //=========================\n% SOURCE //Verse \n% SOURCE //1\n% SOURCE //2\n% SOURCE //3a\n% SOURCE //3b\n% SOURCE //4\n% SOURCE //5a\n% SOURCE //5b\n% SOURCE //6\n% SOURCE //7a\n% SOURCE //7b\n% SOURCE //8\n% SOURCE //9\n% SOURCE //9\n% SOURCE //10\n% SOURCE //11a\n% SOURCE //11b\n% SOURCE //12\n% SOURCE //13a\n% SOURCE //13b\n% SOURCE //14\n% SOURCE //15a\n% SOURCE //15b\n% SOURCE //16\n% SOURCE //17\nV:11\n[GB,] [FB,] | [EB,]3 [EB,] [EB,] [EB,] [FB,] [GB,] | [GC]2 [FC]4 [|] [FC] [EC] | [DB,]3 [DB,] [DB,] [EB,] [FB,] [DB,] |\nw: 1.~Day by day, and with each pass- ing mo- ment, Strength I find, to meet my tri- als\nw: 2.~Ev- 'ry day, the Lord Him- self is near me, With a spe- cial mer- cy for each\nw: 3.~Help me then in ev- 'ry trib- u- la- tion, So to trust Thy prom- is- es, O\nV:12\nx2 | x8 | x6 [|] x2 | x8 |\nV:21\n[B,E,] [A,E,] | [G,E,]3 [G,E,] [G,E,] [G,E,] [A,E,] [B,E,] | [B,A,,]2 [A,A,,]4 [|] [A,A,,] [F,=A,,] | [F,B,,]3 [F,B,,] [F,B,,] [G,B,,] [A,B,,] [F,B,,] |\nV:22\nx2 | x8 | x6 [|] x2 | x8 |\nV:11\n[EB,]6 [|] [GB,] [FB,] | [EB,]3 [EB,] [EB,] [EB,] [FB,] [GB,] | [GC]2 [FC]4 [|] [FC] [EC] | [DB,]3 [DB,] [DB,] [EB,] [FB,] [DB,] |\nw: here; Trust- ing in my Fa- ther's wise be- stow- ment, I've no cause for wor- ry or for\nw: hour; All my cares He fain would bear, and cheer me, He Whose Name is Coun- se- lor and\nw: Lord, That I lose not faith's sweet con- so- la- tion, Of- fered me with- in Thy ho- ly\nV:12\nx6 [|] x2 | x8 | x6 [|] x2 | x8 |\nV:21\n[G,E,]6 [|] [B,E,] [A,E,] | [G,E,]3 [G,E,] [G,E,] [G,E,] [A,E,] [B,E,] | [B,A,,]2 [A,A,,]4 [|] [A,A,,] [F,=A,,] | [F,B,,]3 [F,B,,] [F,B,,] [G,B,,] [A,B,,] [F,B,,] |\nV:22\nx6 [|] x2 | x8 | x6 [|] x2 | x8 |\nV:11\n[EB,]6 ||\nw: fear.\nw: Pow'r.\nw: Word.\nV:12\nx6 ||\nV:21\n[G,E,]6 ||\nV:22\nx6 ||\nV:11\n[GE] [AE] | [BE]3 [BE] [BE] [BE] [eE] [dE] | [dE]2 [cE]4 [|] [FD] [GE] | [AD]3 [AD] [AF] [cD] [BE] [AF] |\nw: He whose heart, is kind be- yond all meas- ure Gives un- to each day what He deems\nw: The pro- tec- tion of His child and treas- ure Is a charge that on Him- self He\nw: Help me, Lord, when toil and trou- ble meet- ing, E'er to take, as from a fa- ther's\nV:12\nx2 | x8 | x6 [|] x2 | x8 |\nV:21\n[B,E,] [B,F,] | [B,G,]3 [B,G,] [B,G,] [B,G,] [B,G,,] [B,G,,] | [B,A,,]2 [A,A,,]4 [|] B, [B,G,] | [B,F,]3 [B,F,] [B,D,] [F,B,,] [B,C,] [B,D,] |\nV:22\nx2 | x8 | x2 x4 [|] A, x | x8 |\nV:11\n[GE]6 [|] [GB,] [FB,] | [EB,]3 [EB,] [EB,] [EB,] [FB,] [GB,] | [GC]2 [FC]4 [|] [FC] [EC] | [DB,]3 [DB,] (D E) (F D) |\nw: best, Lov- ing- ly, its part of pain and pleas- ure, Min- gling toil with peace * and *\nw: laid; \"As thy day, thy strength shall be in meas- ure,\" This the pledge to me * He *\nw: hand, One by one, the days, the mo- ments fleet- ing, Till I reach the prom- * ised *\nV:12\nx6 [|] x2 | x8 | x6 [|] x2 | x3 x B,2 B,2 |\nV:21\n[B,E,]6 [|] [B,E,] [A,E,] | [G,E,]3 [G,E,] [G,E,] [G,E,] [A,E,] [B,E,] | [B,A,,]2 [A,A,,]4 [|] [A,A,,] [F,=A,,] | [B,F,]3 [B,F,] (F, G,) [A,B,,]2 |\nV:22\nx6 [|] x2 | x8 | x6 [|] x2 | x3 x B,,2 x2 |\nV:11\n[EB,]6 |]\nw: rest.\nw: made.\nw: land.\nV:12\nx6 |]\nV:21\n[G,E,]6 |]\nV:22\nx6 |]\n";

const notationWitness = withHymnVocalPlacement(sourceWitness, SONG)
  .replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '')
  .replace(/^%%(?:staffsep 90|measurenb 0|pagewidth 1200|barsperstaff 4)\r?\n/gm, '');
const DURATIONS = [0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75,
  0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75];
const ATTACKS = [2, 6, 2, 2, 6, 1, 2, 6, 2, 2, 6, 1, 2, 6, 2, 2, 6, 1, 2, 6, 2, 2, 6, 1];
const JOINS = [8, 14, 17, 20] as const;
type Widths = { left: number; measureWidths: number[]; total: number };
type Score = NonNullable<ReturnType<typeof readScreenScoreIdentity>>;
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
type Diagnostic = { version: 1; result: 'original' | 'candidate'; reason: string;
  originalUnits?: number[][]; plannedUnits?: number[][]; measuredWidths?: number[]; available?: number;
  endingJoin?: 'predecessor' | 'following-pickup';
  typography?: { rows: number; nativeControls: number; compared: number; measurements: number;
    naturalWidthMeasurements?: number; mismatch?: TypographyMismatch } };

export function hasDayByDayWrapSource(songId: string | undefined, abc: string) {
  return songId === SONG && abc === sourceWitness;
}
export function hasDayByDayWrapNotation(songId: string | undefined, abc: string) {
  return songId === SONG && abc === notationWitness;
}
function close(a: number, b: number) { return Math.abs(a - b) <= EPSILON; }
function validWidths(widths: Widths | undefined): widths is Widths {
  return !!widths && Number.isFinite(widths.left) && widths.left >= 15 &&
    Array.isArray(widths.measureWidths) && widths.measureWidths.length === 24 &&
    widths.measureWidths.every(width => Number.isFinite(width) && width > 0) &&
    Number.isFinite(widths.total) && close(widths.total, widths.measureWidths.reduce((sum, width) => sum + width, 0));
}
function validPartition(systems: number[][]) {
  return systems.length > 0 && systems.every(system => system.length > 0) &&
    systems.flat().length === 24 && systems.flat().every((unit, index) => unit === index);
}
function shortSystems(systems: number[][]) {
  return systems.filter(system => system.reduce((count, unit) => count + ATTACKS[unit], 0) <= 2)
    .map(system => system.join(','));
}

/** Delete only reviewed invisible-boundary breaks between two whole original
 * systems. Never move units out of a system, subdivide it, or force a density.
 * These synthetic planning rules are not a native visual-fit proof.
 */
export function fitDayByDaySystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  if (!validPartition(systems) || widths.length !== 24 || widths.some(width => !Number.isFinite(width) || width <= 0) ||
    !Number.isFinite(available) || available <= 0) return undefined;
  const fitted = systems.map(system => [...system]);
  for (const left of JOINS) {
    const index = fitted.findIndex(system => system.length === 1 && system[0] === left);
    if (index < 0 || fitted[index + 1]?.length !== 1 || fitted[index + 1][0] !== left + 1 ||
      widths[left] + widths[left + 1] > available + EPSILON) continue;
    fitted.splice(index, 2, [left, left + 1]);
  }
  const originalShort = new Set(shortSystems(systems));
  if (fitted.length === systems.length || !validPartition(fitted) ||
    fitted.some(system => system.reduce((sum, unit) => sum + widths[unit], 0) > available + EPSILON) ||
    shortSystems(fitted).length >= originalShort.size || shortSystems(fitted).some(system => !originalShort.has(system))) return undefined;
  return fitted;
}

/** Attach only the isolated phrase-ending unit to its complete predecessor.
 * The double bar after unit 11 and every other existing break remain intact.
 * A failed width/geometry proof must retain the earlier short-system result.
 */
export function fitDayByDayEndingSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  if (!validPartition(systems) || widths.length !== 24 || widths.some(width => !Number.isFinite(width) || width <= 0) ||
    !Number.isFinite(available) || available <= 0) return undefined;
  const index = systems.findIndex(system => system.length === 1 && system[0] === 11);
  if (index < 1 || systems[index - 1].at(-1) !== 10) return undefined;
  const fitted = systems.map(system => [...system]);
  fitted.splice(index - 1, 2, [...fitted[index - 1], 11]);
  if (fitted.some(system => system.reduce((sum, unit) => sum + widths[unit], 0) > available + EPSILON)) return undefined;
  return fitted;
}

/** If the complete predecessor plan is rejected, retain the ending with the next
 * phrase's complete two-note pickup. Keep the source double bar between them.
 * Only these two singleton systems change; unchanged systems still require
 * their own full native geometry proof after re-engraving. The first-system
 * metrics budget is deliberately not a proof of their later-system widths.
 */
export function fitDayByDayEndingPickupSystems(systems: number[][], widths: number[], available: number): number[][] | undefined {
  if (!validPartition(systems) || widths.length !== 24 || widths.some(width => !Number.isFinite(width) || width <= 0) ||
    !Number.isFinite(available) || available <= 0) return undefined;
  const index = systems.findIndex(system => system.length === 1 && system[0] === 11);
  if (index < 0 || systems[index + 1]?.length !== 1 || systems[index + 1][0] !== 12 ||
    widths[11] + widths[12] > available + EPSILON) return undefined;
  const fitted = systems.map(system => [...system]);
  fitted.splice(index, 2, [11, 12]);
  return fitted;
}

function hasEndingBoundaries(tune: abcjs.TuneObject, abc: string) {
  return [0, 1, 2, 3].every(voice => {
    const bars = tune.lines.flatMap(line => line.staff?.flatMap(staff => staff.voices ?? [])[voice] ?? [])
      .filter(event => event.el_type === 'bar') as abcjs.AbcElem[];
    return bars.length === 24 && bars[10].type === 'bar_thin' && bars[11].type === 'bar_thin_thin' && bars[12].type === 'bar_thin' &&
      abc.slice(bars[10].startChar, bars[10].endChar).trim() === '|' &&
      abc.slice(bars[11].startChar, bars[11].endChar).trim() === '||' &&
      abc.slice(bars[12].startChar, bars[12].endChar).trim() === '|';
  });
}

/** Keep all supplemental lanes, exact per-voice events/source ranges/lyrics,
 * and the source's brace and barline connection. The shared singleton
 * definition is deliberately irrelevant to this local partial-bar pilot.
 */
export function readDayByDayScreenIdentity(tune: abcjs.TuneObject | undefined, abc: string): Score | undefined {
  if (!tune || abc !== notationWitness.slice(9).trimEnd()) return undefined;
  // ABCJS 6.7 abstract-engraver.js setAveragePitch/sortPitch (390/431)
  // sorts this edition's chord pitches in place. Compare a
  // read-only ascending permutation before AND after engraving, retaining
  // every pitch field and the exact original source token/range. Do not
  // mutate the tune or relax the shared reader for unrelated scores.
  const structural = { ...tune, lines: tune.lines.map(line => ({ ...line,
    staff: line.staff?.map(staff => ({ ...staff,
      voices: staff.voices?.map(voice => voice.map(raw => {
        if (raw.el_type !== 'note') return raw;
        const element = raw as abcjs.AbcElem;
        return element.pitches ? { ...element, pitches: [...element.pitches].sort((a, b) => a.pitch - b.pitch) } : raw;
      })),
    })),
  })) } as abcjs.TuneObject;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 24 || score.notes.length !== 207 ||
    !validPartition(score.systems) || score.units.some((unit, index) => unit.duration !== DURATIONS[index]) ||
    score.notes.reduce((count, note) => count + (note.element.pitches?.length ?? 0), 0) !== 299 ||
    [76, 27, 75, 29].some((count, voice) => score.notes.filter(note => note.voice === voice).length !== count)) return undefined;
  const expectedGrouping = JSON.stringify([['start', undefined, 'start'], ['end', undefined, 'end']]);
  if (!tune!.lines.every(line => line.staff?.length === 2 && JSON.stringify(line.staff.map(staff => {
    const grouping = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
    return [grouping.brace, grouping.bracket, grouping.connectBarLines];
  })) === expectedGrouping)) return undefined;
  const voices = [0, 1, 2, 3].map(() => [] as abcjs.AbcElem[]);
  for (const line of tune!.lines) line.staff!.flatMap(staff => staff.voices ?? []).forEach((voice, index) => {
    voices[index].push(...voice as abcjs.AbcElem[]);
  });
  for (const [voice, events] of voices.entries()) {
    let unit = 0, attacks = 0;
    for (const event of events) {
      if (event.el_type === 'note') {
        // The frozen edition has no MIDI pitch overrides. ABCJS's synth
        // prioritizes midipitch over written pitch/accidentals; the shared
        // visual signature does not cover it. Reject any override here,
        // including zero/nonfinite values, rather than silently ignoring it.
        if (event.pitches?.some(pitch => pitch.midipitch !== undefined)) return undefined;
        if (voice === 0 && (event.rest || event.lyric?.length !== 3)) return undefined;
        if (voice !== 0 && event.lyric?.length) return undefined;
        if (event.pitches?.length) attacks++;
      } else if (event.el_type === 'bar') {
        if (voice === 0 && attacks !== ATTACKS[unit]) return undefined;
        if (JOINS.some(left => left === unit) && (event.type !== 'bar_invisible' ||
          abc.slice(event.startChar, event.endChar).trim() !== '[|]')) return undefined;
        unit++; attacks = 0;
      }
    }
    if (unit !== 24 || attacks) return undefined;
  }
  return { ...score, signature: JSON.stringify([score.signature, expectedGrouping]) };
}

function supported(host: HTMLElement, abc: string, songId: string | undefined, options: abcjs.AbcVisualParams) {
  return hasDayByDayWrapNotation(songId, abc) && abcjs.signature === 'abcjs-basic v6.7.0' &&
    !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches && host.isConnected &&
    !options.print && !host.closest('.print-score-canvas') && !!options.wrap && !options.lineBreaks &&
    options.oneSvgPerLine === true && options.responsive === 'resize' && options.scale === 1 && options.minPadding === 6 &&
    (options.visualTranspose ?? 0) === 0 && !options.format && !options.expandToWidest && !options.timeBasedLayout &&
    !options.tablature && !options.viewportHorizontal && !options.viewportVertical &&
    Number.isFinite(options.staffwidth) && options.staffwidth! >= 320 && options.staffwidth! <= 520 &&
    options.paddingleft === undefined && options.paddingright === undefined &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0 &&
    options.wrap.minSpacingLimit === undefined && options.wrap.lastLineLimit === undefined;
}
function sameSize(before: Geometry, after: Geometry) {
  const equal = (a: Geometry['notes'][number]['heads'][number] | undefined,
    b: Geometry['notes'][number]['heads'][number] | undefined) => !a || !b ? a === b :
    (['width', 'height', 'screenWidth', 'screenHeight'] as const).every(key => close(a[key], b[key]));
  return close(before.width, after.width) && close(before.left, after.left) && close(before.screenWidth, after.screenWidth) &&
    before.notes.length === after.notes.length && before.notes.every((note, index) => {
      const other = after.notes[index];
      return note.font === other.font && note.heads.length === other.heads.length &&
        note.heads.every((head, i) => equal(head, other.heads[i])) && note.lyrics.length === other.lyrics.length &&
        note.lyrics.every((lyric, i) => lyric.text === other.lyrics[i].text && equal(lyric.size, other.lyrics[i].size));
    });
}

/** A post-render, screen-only attempt; the ordinary renderer remains the
 * owner of every unsupported configuration. Complete-unit metrics are taken
 * from the exact flattened parse, never guessed from another viewport.
 * Every failure returns the actual original tune and listener-bearing nodes.
 */
export function reflowDayByDayScreenScore(host: HTMLElement, abc: string, songId: string | undefined,
  options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray, active: boolean): abcjs.TuneObjectArray {
  return reflowDayByDayTransaction(host, abc, songId, options, original, active, false);
}

export function reflowDayByDayEndingScreenScore(host: HTMLElement, abc: string, songId: string | undefined,
  options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray, active: boolean): abcjs.TuneObjectArray {
  return reflowDayByDayTransaction(host, abc, songId, options, original, active, true);
}

function reflowDayByDayTransaction(host: HTMLElement, abc: string, songId: string | undefined,
  options: abcjs.AbcVisualParams, original: abcjs.TuneObjectArray, active: boolean, ending: boolean): abcjs.TuneObjectArray {
  const attribute = ending ? ENDING_ATTRIBUTE : ATTRIBUTE;
  host.removeAttribute(attribute);
  if (!active) return original;
  const diagnostic: Diagnostic = { version: 1, result: 'original', reason: 'unsupported' };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(attribute, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  if (!supported(host, abc, songId, options) || original.length !== 1) return finish(original, 'unsupported');
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    // Automatic wrapping strips exactly the format-marker prefix. Explicit
    // reflow uses this same parser input, preserving every click/source offset.
    const book = new abcjs.TuneBook(abc);
    if (!abc.startsWith('%abc-2.1\n') || book.header || book.tunes.length !== 1 || book.tunes[0].startPos !== 9 ||
      book.tunes[0].abc !== abc.slice(9).trimEnd()) return finish(original, 'source-prefix');
    abc = book.tunes[0].abc;
    const before = readDayByDayScreenIdentity(original[0], abc);
    if (!before) return finish(original, 'source-structure');
    if (ending && !hasEndingBoundaries(original[0], abc)) return finish(original, 'source-boundaries');
    diagnostic.originalUnits = before.systems;
    const staffwidth = options.staffwidth!;
    const padding = original[0].engraver?.renderer?.padding;
    if (padding?.left !== 15 || padding?.right !== 15 || original[0].engraver?.width !== staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined) return finish(original, 'padding');
    const { wrap: _wrap, afterParsing: _afterParsing, clickListener: _clickListener, ...measurement } = options;
    const unbroken = { ...measurement, lineBreaks: [[]] as unknown as number[] };
    const flatTunes = abcjs.parseOnly(abc, unbroken);
    const flat = flatTunes.length === 1 && readDayByDayScreenIdentity(flatTunes[0], abc);
    if (!flat || flat.signature !== before.signature || flat.systems.length !== 1 || flat.systems[0].length !== 24)
      return finish(original, 'measurement-identity');
    const metrics = abcjs.tuneMetrics(abc, unbroken), widths = metrics[0]?.sections?.[0];
    if (metrics.length !== 1 || metrics[0].sections.length !== 1 || !validWidths(widths) || widths.left >= staffwidth)
      return finish(original, 'measurement-widths');
    const available = staffwidth - (widths.left - padding.left);
    diagnostic.measuredWidths = widths.measureWidths;
    diagnostic.available = available;
    let systems = (ending ? fitDayByDayEndingSystems : fitDayByDaySystems)(before.systems, widths.measureWidths, available);
    if (ending) {
      if (systems) diagnostic.endingJoin = 'predecessor';
      else {
        systems = fitDayByDayEndingPickupSystems(before.systems, widths.measureWidths, available);
        if (systems) diagnostic.endingJoin = 'following-pickup';
      }
    }
    if (!systems) return finish(original, 'no-fitting-join');
    diagnostic.plannedUnits = systems;
    preserveBlankLyricRows(host);
    const geometry = readScreenScoreGeometry(host, before, false);
    if (!geometry || !close(geometry.width, staffwidth + 30)) return finish(original, 'original-geometry');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'original-typography');
    retained = [...host.childNodes];
    attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const { wrap: _automatic, ...explicit } = options;
    const lineBreaks = [systems.slice(0, -1).map(system => system.at(-1)!)];
    const candidate = abcjs.renderAbc(host, abc, { ...explicit, lineBreaks: lineBreaks as unknown as number[] });
    const after = candidate.length === 1 && readDayByDayScreenIdentity(candidate[0], abc);
    if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems)) {
      diagnostic.reason = 'candidate-identity';
    } else {
      preserveBlankLyricRows(host);
      // No viewport, type, note, padding or scale normalization is used to make
      // a join fit. Native ink bounds and six-unit lyric clearance must pass.
      const candidateGeometry = readScreenScoreGeometry(host, after, true);
      if (candidateGeometry && sameSize(geometry, candidateGeometry) && candidate[0].engraver?.width === staffwidth &&
        candidate[0].engraver?.renderer?.padding?.left === padding.left && candidate[0].engraver?.renderer?.padding?.right === padding.right &&
        shortSystems(after.systems).every(system => shortSystems(before.systems).includes(system)) &&
        shortSystems(after.systems).length < shortSystems(before.systems).length) {
        const captured = captureLyricTypography(host, after.notes, candidateGeometry);
        const proof = captured && verifyLyricTypography(host, typography, captured, { preserveNaturalWidth: true });
        if (proof) diagnostic.typography = { rows: proof.rows, nativeControls: proof.nativeControls,
          compared: proof.compared, measurements: proof.measurements,
          ...(proof.naturalWidthMeasurements !== undefined && { naturalWidthMeasurements: proof.naturalWidthMeasurements }),
          ...(proof.mismatch && { mismatch: proof.mismatch }) };
        if (proof?.valid) { diagnostic.result = 'candidate'; return finish(candidate, 'accepted'); }
      }
      diagnostic.reason = 'candidate-geometry';
    }
  } catch { diagnostic.reason = 'exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, diagnostic.reason);
}
