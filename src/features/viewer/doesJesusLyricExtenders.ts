import abcjs from 'abcjs';
import { calcLineWraps } from 'abcjs/src/parse/wrap_lines';
import { addLearnerAccidentals } from './learnerAccidentals';

// Mobile Hymns #5018, https://www.mobilehymns.org/PDF/Does_Jesus_Care.pdf.
// The reviewed PDF (SHA-256 1aae741d4f1ec9a6e90dfc6d3935d3ab0c98ac18dcbab83f7517665f969a3b0c)
// prints no extender strokes at the nine imported '_' dividers. Freeze the
// exact imported edition, including words/music, before any display transform.
// Canonical ABC SHA-256: bbd5cc424df94491327e279b6dd353021faa6bd9e8b53eb928bff0ec85d7ed63.
const sourceWitness = "X:1\nT:Does Jesus Care?\nT:MY SAVIOR CARES\nC:Frank E. Graeff (1860-1919),1901\nC:Joseph L. Hall (1866-1930),1901\nS:Mobile Hymns #5018, downloaded 2026-09-30\nZ:Source-assisted manual transcription of the public-domain-labelled PDF\nN:Source 6/4 edition; three printed historical stanzas (original1,3,4) and common refrain.\nN:All four source voice streams preserved. Source ties may coincide with differing verse syllables.\nN:Source asserts public domain; no worldwide or recording-specific rights clearance claimed.\nM:6/4\nL:1/4\n%%score { ( 1 2 ) | ( 3 4 ) }\n%%measurenb 0\n%%staffsep 80\nV:1 clef=treble name=\"Soprano\"\nV:2 clef=treble name=\"Alto\"\nV:3 clef=bass name=\"Tenor\"\nV:4 clef=bass name=\"Bass\"\nK:Db\n[V:1] A | F2 E D2 B/B/ | A2 G F2 F/-F/ | E \nw: 1.~Does Je- sus care when my heart is pained Too_ deep-\nw: 2.~Does Je- sus care when I've tried and failed To re- sist\nw: 3.~Does Je- sus care when I've said \"good- bye\" To the dear-\n[V:1] =D E A2 G | F3- F2 F/G/ | A2 d d2 F/F/ | E2 \nw: ly for mirth or song,_ As the bur- dens press, and the cares\nw: some temp- ta- tion strong;_ When for my deep grief there is no\nw: est on earth to me,_ And my sad heart aches till it near-\n[V:1] B B2 B/B/ | A2 F A G E | D3- D2 ||\nw: dis- tress, And the way grows wear- y and long?_\nw: re- lief, Though my tears flow all the night long?_\nw: ly breaks— Is it aught to Him? Does He see?_\n[V:1] d | c2 G c2 e | d2 F A2 F | E2 c B F =G | A3- A2 \nw: O yes, He cares, I know He cares, His heart is touched with my grief;_\n[V:1] c/c/ | d2 e d A F | E2 B d c B | A2 D F2 E | D3- D2 |]\nw: When the days are wear- y, the long nights drear- y, I know my Sav- ior cares._\n[V:2] F | D2 D D2 D/D/ | D2 D D2 D/-D/ | C \n[V:2] =B, C (C _D) E | D3- D2 D/E/ | F2 F F2 D/D/ | D2 \n[V:2] D G2 G/G/ | F2 D C C C | D3- D2 ||\n[V:2] F | G2 E G2 G | F2 D D2 D | C2 E D D D | (C2 D C2) \n[V:2] G/G/ | F2 F F F D | D2 D D G G | F2 D C2 C | A,3- A,2 |]\n[V:3] D | A,2 G, F,2 G,/G,/ | F,2 B, A,2 A,/-A,/ | A, \n[V:3] A, A, E,2 A, | A,3- A,2 A,/A,/ | D2 A, A,2 _C/C/ | B,2 \n[V:3] B, D2 D/D/ | D2 A, A, E, G, | F,3- F,2 ||\n[V:3] A, | A,2 C E2 C | D2 A, F,2 A, | A,2 A, =G, A, B, | (A,2 F, G,2) \n[V:3] A,/A,/ | A,2 A, A, D A, | B,2 B, B, C D | D2 F, A,2 G, | F,3- F,2 |]\n[V:4] D, | D,2 D, D,2 D,/D,/ | D,2 D, D,2 D,/-D,/ | A,, \n[V:4] A,, A,, (A,, B,,) C, | D,3- D,2 D,/D,/ | D,2 D, D,2 D,/D,/ | G,2 \n[V:4] G, E,2 E,/E,/ | A,2 A, A,, A,, A,, | D,3- D,2 ||\n[V:4] D, | E,2 A, A,2 A, | D,2 D, D,2 D, | E,2 E, E, E, E, | A,,3- A,,2 \n[V:4] A,,/A,,/ | D,2 D, D, D, D, | G,2 G, G, G, G, | A,2 A,, A,,2 A,, | D,3- D,2 |]\n";

export function hasDoesJesusLyricExtenderSource(songId: string | undefined, abc: string): boolean {
  return songId === 'hymn-mobile-does-jesus-care' && abc === sourceWitness;
}

type Lyric = { syllable: string; divider: string };
type Note = abcjs.VoiceItemNote & { lyric?: Lyric[]; startTriplet?: number; gracenotes?: unknown[] };
type LocatedNote = { event: Note; onset: number };
type Target = { start: number; end: number; row: number; syllable: string };
type Widths = { left: number; measureWidths: number[]; total: number }[];
type MeasuringEngine = { test?: { EngraverController?: new (host: HTMLElement, options: abcjs.AbcVisualParams) => {
  getMeasureWidths(tune: abcjs.TuneObject): Widths;
} } };
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function voices(tune: abcjs.TuneObject): LocatedNote[][] | undefined {
  if (tune.warnings?.length) return undefined;
  const result: LocatedNote[][] = [];
  const times: number[] = [];
  let shape: number[] | undefined;
  for (const line of tune.lines) {
    if (!line.staff) continue;
    const currentShape = line.staff.map(staff => staff.voices?.length ?? 0);
    if (shape && !same(shape, currentShape)) return undefined;
    shape = currentShape;
    let lane = 0;
    for (const staff of line.staff) for (const voice of staff.voices ?? []) {
      result[lane] ??= [];
      for (const item of voice) {
        const event = item as Note;
        if (event.el_type !== 'note') continue;
        if (!(event.duration > 0) || !Number.isFinite(event.duration) || event.startTriplet || event.gracenotes?.length) return undefined;
        const onset = times[lane] ?? 0;
        result[lane].push({ event, onset });
        times[lane] = onset + event.duration;
      }
      lane++;
    }
  }
  return result.length && times.every(time => time === 24) ? result : undefined;
}

function music(notes: LocatedNote[]) {
  return notes.map(({ event, onset }) => [onset, event.duration, event.rest,
    event.pitches?.map(pitch => [pitch.pitch, pitch.name, pitch.accidental,
      !!pitch.startTie, !!pitch.endTie, pitch.startSlur?.length ?? 0, pitch.endSlur?.length ?? 0])]);
}

function lyricRows(notes: LocatedNote[], chorus: boolean) {
  const rows: unknown[][] = [];
  for (const { event, onset } of notes) if ((onset >= 12) === chorus) {
    event.lyric?.forEach((lyric, row) => {
      if (lyric.syllable) (rows[row] ??= []).push([onset, lyric.syllable, lyric.divider]);
    });
  }
  return rows.filter(row => row?.length);
}

function barPatterns(tune: abcjs.TuneObject) {
  const patterns: unknown[][] = [], times: number[] = [];
  for (const line of tune.lines) {
    let lane = 0;
    for (const staff of line.staff ?? []) for (const voice of staff.voices ?? []) {
      patterns[lane] ??= [];
      for (const item of voice) {
        if (item.el_type === 'note') times[lane] = (times[lane] ?? 0) + item.duration;
        if (item.el_type === 'bar') patterns[lane].push([times[lane] ?? 0, item.type, item.startEnding, item.endEnding]);
      }
      lane++;
    }
  }
  return patterns;
}

let reference: LocatedNote[][] | undefined;
let referenceBars: unknown[][] | undefined;
let learnerReference: LocatedNote[][] | undefined;
function targetsFor(selectedAbc: string): Target[] | undefined {
  const tunes = abcjs.parseOnly(selectedAbc);
  if (tunes.length !== 1) return undefined;
  const selected = voices(tunes[0]);
  if (!reference) {
    const source = abcjs.parseOnly(sourceWitness)[0];
    reference = voices(source);
    referenceBars = barPatterns(source);
  }
  if (!selected || !reference || ['M:6/4', 'L:1/4', 'K:Db'].some(header =>
      selectedAbc.split(/\r?\n/).filter(line => line.startsWith(header.slice(0, 2))).join('\n') !== header) ||
      /\[K:/.test(selectedAbc)) return undefined;
  const definitions = [...selectedAbc.matchAll(/^V:[ \t]*([1-4])(?:[ \t]|$)/gm)].map(match => match[1]);
  const scores = [...selectedAbc.matchAll(/^%%score[ \t]+([^\r\n]+)$/gm)];
  if (scores.length !== 1) return undefined;
  const score = scores[0][1];
  const groups = [...score.matchAll(/\(([1-4 \t]+)\)/g)].map(match => match[1].trim().split(/\s+/));
  const reducedScore = groups.map(group => `(${group.join(' ')})`).join(' ');
  if (score !== '{ ( 1 2 ) | ( 3 4 ) }' && score !== (groups.length > 1 ? `{ ${reducedScore} }` : reducedScore)) return undefined;
  if (!groups.length || groups.length > 2 || /[^{}|\s]/.test(score.replace(/\([1-4 \t]+\)/g, '')) ||
      !same(groups.flat(), definitions) || groups.some(group => group.some(id => (Number(id) < 3) !== (Number(group[0]) < 3))) ||
      tunes[0].lines.some(line => line.staff && !same(line.staff.map(staff => staff.voices?.length), groups.map(group => group.length)))) return undefined;
  const bars = barPatterns(tunes[0]);
  if (bars.some((pattern, index) => !same(pattern, referenceBars?.[Number(definitions[index]) - 1])) ||
      tunes[0].lines.some(line => line.staff?.some((staff, index) => staff.clef?.type !== (Number(groups[index][0]) < 3 ? 'treble' : 'bass')))) return undefined;
  if (definitions.length !== selected.length || new Set(definitions).size !== definitions.length ||
      definitions.some((id, index) => index > 0 && id <= definitions[index - 1])) return undefined;
  if (selected.some((notes, index) => {
    const voice = Number(definitions[index]) - 1;
    if (same(music(notes), music(reference![voice]))) return false;
    learnerReference ??= voices(abcjs.parseOnly(addLearnerAccidentals(sourceWitness))[0]);
    return !learnerReference || !same(music(notes), music(learnerReference[voice]));
  })) return undefined;
  // Selection may transfer underlay to the first retained part. All words must
  // remain on their exact onsets, in complete original stanza/refrain rows.
  if (selected.slice(1).some(notes => notes.some(({ event }) => event.lyric?.some(lyric => lyric.syllable)))) return undefined;
  const verses = lyricRows(selected[0], false);
  const expectedVerses = lyricRows(reference[0], false);
  const rowIds = verses.map(row => expectedVerses.findIndex(expected => same(row, expected)));
  if (!rowIds.length || rowIds.some((id, index) => id < 0 || (index > 0 && id <= rowIds[index - 1])) ||
      !same(lyricRows(selected[0], true), lyricRows(reference[0], true))) return undefined;
  const targets: Target[] = [];
  const anchors = new Map<number, readonly string[]>([
    [3, ['Too']], [4.75, ['song,', 'strong;', 'me,']], [10.75, ['long?', 'long?', 'see?']],
    [16.75, ['grief;']], [22.75, ['cares.']],
  ]);
  for (const { event, onset } of selected[0]) event.lyric?.forEach((lyric, row) => {
    if (lyric.divider !== '_') return;
    if (!anchors.get(onset)?.includes(lyric.syllable)) return;
    targets.push({ start: event.startChar, end: event.endChar, row, syllable: lyric.syllable });
  });
  const expectedCount = rowIds.length * 2 + (rowIds.includes(0) ? 1 : 0) + 2;
  return targets.length === expectedCount ? targets : undefined;
}

function normalize(tune: abcjs.TuneObject, targets: Target[]): boolean {
  const found: Lyric[] = [];
  const matched = new Set<Target>();
  let unexpected = false;
  for (const line of tune.lines) for (const staff of line.staff ?? []) for (const voice of staff.voices ?? []) {
    for (const item of voice) {
      const event = item as Note;
      if (event.el_type === 'note') event.lyric?.forEach((lyric, row) => {
        if (lyric.divider !== '_') return;
        const target = targets.find(target => target.start === event.startChar && target.end === event.endChar &&
          target.row === row && target.syllable === lyric.syllable);
        if (!target || matched.has(target)) { unexpected = true; return; }
        matched.add(target);
        found.push(lyric);
      });
    }
  }
  if (unexpected || found.length !== targets.length || tune.warnings?.length) return false;
  // Do not change syllables, source offsets, notes, or canonical token strings.
  for (const lyric of found) lyric.divider = ' ';
  return true;
}

/** ABCJS 6.7 calls afterParsing only AFTER automatic wrap measurement. Plan
 * native breaks on a separate normalized parse, then invoke the ordinary
 * renderer with explicit breaks and normalize its final parsed engraving copy.
 * No global engine patch or reserialization of source lyric tokens is involved.
 * Unknown engine versions, sources, lyric transfer shapes and options fail closed.
 */
export function withDoesJesusLyricExtenders(
  host: HTMLElement, selectedAbc: string, options: abcjs.AbcVisualParams, active: boolean,
): abcjs.AbcVisualParams {
  if (!active || abcjs.signature !== 'abcjs-basic v6.7.0' || options.lineBreaks || !options.wrap ||
      !Number.isFinite(options.staffwidth) || !(options.staffwidth! > 0) ||
      options.viewportHorizontal || options.viewportVertical || options.oneSvgPerLine !== true ||
      options.responsive !== 'resize' || options.scale !== 1) return options;
  const Engine = (abcjs as unknown as MeasuringEngine).test?.EngraverController;
  if (!Engine) return options;
  try {
    const targets = targetsFor(selectedAbc);
    if (!targets) return options;
    const tunes = abcjs.parseOnly(selectedAbc, options);
    if (tunes.length !== 1 || !normalize(tunes[0], targets)) return options;
    // Use the ordinary renderer's attached host for real SVG text metrics.
    // The immediately following render clears this temporary measurement SVG.
    const widths = new Engine(host, options).getMeasureWidths(tunes[0]);
    if (!widths.length || widths.some(section => !Number.isFinite(section.left) ||
        !section.measureWidths.length || section.measureWidths.some(width => !Number.isFinite(width) || width <= 0))) return options;
    const plan = calcLineWraps(tunes[0], widths, options);
    if (!plan.reParse || !plan.revisedParams.lineBreaks) return options;
    const prepared = {
      ...plan.revisedParams,
      afterParsing: (tune: abcjs.TuneObject, number: number, source: string) => {
        normalize(tune, targets);
        return options.afterParsing?.(tune, number, source) ?? tune;
      },
    };
    // Verify source offsets survive the native explicit-break reparse before
    // choosing normalized widths. A changed parser/layout keeps its old path.
    const check = abcjs.parseOnly(selectedAbc, prepared);
    return check.length === 1 && normalize(check[0], targets) ? prepared : options;
  } catch { return options; }
}
