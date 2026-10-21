import abcjs from 'abcjs';
import { legacyPsalterMetadata } from '../../data/generated/legacyPsalterMetadata';
import { preserveBlankLyricRows } from './lyricRows';
import { hasOhHowPickupNotation } from './hymnPickupSource';

const TIME_EPSILON = 1e-8;
const GEOMETRY_EPSILON = 0.05;
const MIN_LYRIC_GAP = 6;

// General reflow is qualified only for the shipped Psalter namespace.
// One separately source-bound hymn pickup can opt in from its prepared caller.
const PSALTER_ARRANGEMENT_IDS = new Set(legacyPsalterMetadata.map(song => song.id));

// Frozen notation witness: all four source voices and four stanzas, before
// visual transposition. Unknown revisions/selections keep the ordinary planner.
const PSALTER301_PHONE_SOURCE = `%abc-2.1
% validator: allow-photographed-partial-bars
M:4/4
L:1/4
K:Eb
%%score (S A)(T B)
V:S clef=treble
V:A clef=treble
V:T clef=bass
V:B clef=bass
V:S
G | A G F E | E D E || B | E E A A | G3 || G | e d c G | c B A || F | B E E D | E3 |]
w:1.~O Lord, my God, for Thy Name's sake In mer- cy deal with me; Be- cause Thy kind- ness is so great, From trou- ble set me free.
w:2.~O Thou Who art my Lord and God, Thy gra- cious help ex- tend, And for Thy lov- ing- kind- ness' sake O save me and de- fend.
w:3.~My voice shall great- ly bless the Lord And sing His wor- thy praise, And I a- mid the mul- ti- tude My thank- ful song will raise.
w:4.~The Lord be praised, for ev- er near The help- less poor He stands, Pro- tect- ing them with won- drous pow'r From their op- press- ors' hands.
V:A
E | E E D E | B, B, B, || E | E E F F | D3 || F | E F G G | G =E F || D | E B, B, B, | B,3 |]
V:T
B, | C B, A, G, | G, F, G, || _D | C C C C | =B,3 || =B, | C =B, C C | G, C C || B, | B, G, F, F, | G,3 |]
V:B
E, | E, E, B,, C, | B,, B,, E, || G, | A, A, F, F, | G,3 || G, | C, D, E, E, | =E, C, F, || A, | G, G,, B,, B,, | E,3 |]`;

// Frozen all-parts, five-stanza witness for the adjacent Size-tick case.
const PSALTER1_PHONE_SOURCE = `%abc-2.1
L:1/4
K:Eb
M:4/4
%%score (T1 T2)(B1 B2)
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
V:T1
  G | GGGG | G3/2 E/2 E   || E  | AAGF | B3 || B | BBcG  | BAG || F | GEED    | E3 |]
w:1.~That man is blest who, fear-ing God, From sin re-strains his feet, Who will not stand with wick-ed men, Who shuns the scorn-ers' seat.
w:2.~Yea, blest is he who makes God's law His por-tion and de-light, And med-i-tates up-on that law With glad-ness day and night.
w:3.~That man is nour-ished like a tree Set by the riv-er's side; Its leaf is green, its fruit is sure, And thus his works a-bide.
w:4.~The wick-ed like the driv-en chaff Are swept from off the land; They shall not gath-er with the just, Nor in the judg-ment stand.
w:5.~The Lord will guard the right-eous well, Their way to Him is known; The way of sin-ners, far from God, Shall sure-ly be o'er-thrown.
V:T2
  E | EEEE | E3/2 B,/2 B, || B, | CEDD | E3 || D | EE=EE| GFC || C |B,B,CB, | B,3 |]
V:B1
  B, | B,B,B,B, | B,3/2G,/2G, || G, | F, C B, B, | B,3 || A, | G,G,G,C | C C B, || A, | E,G,A,A, | G,3 |]
V:B2
  E, | E,E,D,C, | B,,3/2B,,/2B,, || B,, | B,,B,,B,A, | G,3 || F, | E,_D,C,C, | F,F,,G,, || A,, | B,,B,,B,,B,, | E,3 |]`;

type Unit = { duration: number; singleAttack: boolean; invisible?: boolean };
type Note = { voice: number; element: abcjs.AbcElem };
type Score = { meter: number; units: Unit[]; systems: number[][]; notes: Note[]; signature: string };
type NativeWidths = { left: number; measureWidths: number[]; total: number };
type Size = { width: number; height: number; screenWidth: number; screenHeight: number };
type NoteGeometry = { heads: Size[]; lyrics: { text: string; size?: Size }[]; font?: string };
type Geometry = { width: number; left: number; screenWidth: number; notes: NoteGeometry[] };

// Temporary, read-only diagnostic for structurally guarded screen reflow.
// Only fixed reason codes, numeric widths and unit ordinals reach this attribute.
const WRAP_DIAGNOSTIC_ATTRIBUTE = 'data-isolated-chord-wrap';
const DIAGNOSTIC_UNIT_LIMIT = 64;
const DIAGNOSTIC_CHARACTER_LIMIT = 8192;
type WrapDiagnostic = {
  version: 1;
  song: string;
  phase: string;
  reason?: string;
  result: 'original' | 'candidate';
  source?: { prefixLength: number; targetUnit: number };
  widths?: { requested: number | null; explanationStaff: number | null; engravedStaff: number | null;
    absoluteLeft: number | null; leftPadding: number | null; normalizedLeft: number | null;
    available: number | null; total: number | null; unitCount: number; units: (number | null)[] };
  original?: number[][];
  planned?: number[][];
  candidate?: number[][];
  retained?: number[][];
  truncated?: true;
  candidateLayout?: { staffwidth: number; paddingleft: number; paddingright: number; available: number; viewportWidth: number };
  candidateViewport?: { originalWidth: number; before: (number | null)[]; after: (number | null)[];
    systemCount: number; engravedStaff: number | null; leftPadding: number | null; rightPadding: number | null; normalized: boolean };
  firstPlanRejection?: { reason: string; orphan: number; from: number; to: number;
    changedWidths: number[]; available: number };
  errorClass?: string;
};

function diagnosticPhase(diagnostic: WrapDiagnostic | undefined, phase: string) {
  if (diagnostic && !diagnostic.reason) diagnostic.phase = phase;
}

function reject(diagnostic: WrapDiagnostic | undefined, reason: string): undefined {
  if (diagnostic && !diagnostic.reason) diagnostic.reason = reason;
  return undefined;
}

function observed(check: boolean, diagnostic: WrapDiagnostic | undefined, reason: string) {
  if (!check) reject(diagnostic, reason);
  return check;
}

function recordSystems(diagnostic: WrapDiagnostic | undefined, key: 'original' | 'planned' | 'candidate', systems: number[][]) {
  if (!diagnostic) return;
  try {
    let remaining = DIAGNOSTIC_UNIT_LIMIT;
    diagnostic[key] = systems.slice(0, DIAGNOSTIC_UNIT_LIMIT).map(system => {
      const bounded = system.slice(0, remaining);
      remaining -= bounded.length;
      if (bounded.length !== system.length) diagnostic.truncated = true;
      return bounded;
    });
    if (systems.length > DIAGNOSTIC_UNIT_LIMIT) diagnostic.truncated = true;
  } catch { /* An unavailable diagnostic never rejects an otherwise valid layout. */ }
}

function recordNativeWidths(diagnostic: WrapDiagnostic | undefined, tune: abcjs.TuneObject, requested: unknown) {
  if (!diagnostic) return;
  try {
    const section = (tune as abcjs.TuneObject & { explanation?: { widths?: NativeWidths; staffWidth?: number }[] }).explanation?.[0];
    const widths = section?.widths;
    const leftPadding: unknown = tune.engraver?.renderer?.padding?.left;
    const normalizedLeft = finite(widths?.left) && finite(leftPadding) ? widths.left - leftPadding : null;
    const number = (value: unknown) => finite(value) ? value : null;
    const unitWidths = Array.isArray(widths?.measureWidths) ? widths.measureWidths : [];
    diagnostic.widths = {
      requested: number(requested), explanationStaff: number(section?.staffWidth), engravedStaff: number(tune.engraver?.width),
      absoluteLeft: number(widths?.left), leftPadding: number(leftPadding), normalizedLeft,
      available: finite(requested) && normalizedLeft !== null ? number(requested - normalizedLeft) : null,
      total: number(widths?.total), unitCount: unitWidths.length,
      units: unitWidths.slice(0, DIAGNOSTIC_UNIT_LIMIT).map(number),
    };
    if (unitWidths.length > DIAGNOSTIC_UNIT_LIMIT) diagnostic.truncated = true;
  } catch { /* Diagnostic reads never decide whether the native layout is used. */ }
}

function publishDiagnostic(host: HTMLElement, diagnostic: WrapDiagnostic | undefined) {
  try {
    if (!diagnostic) {
      host.removeAttribute(WRAP_DIAGNOSTIC_ATTRIBUTE);
      return;
    }
    diagnostic.retained = diagnostic.result === 'candidate' ? diagnostic.candidate : diagnostic.original;
    const payload = JSON.stringify(diagnostic);
    host.setAttribute(WRAP_DIAGNOSTIC_ATTRIBUTE, payload.length <= DIAGNOSTIC_CHARACTER_LIMIT ? payload : JSON.stringify({
      version: diagnostic.version, song: diagnostic.song, phase: diagnostic.phase,
      reason: diagnostic.reason, result: diagnostic.result, truncated: true,
    }));
  } catch { /* The diagnostic cannot change rendering, fallback or click mapping. */ }
}

function finite(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function close(left: number, right: number, epsilon = TIME_EPSILON) {
  return Math.abs(left - right) <= epsilon;
}

function meterLength(meter: abcjs.Meter | undefined): number | undefined {
  if (meter?.type === 'common_time' || meter?.type === 'cut_time') return 1;
  if (meter?.type !== 'specified' || meter.value?.length !== 1) return undefined;
  const { num, den } = meter.value[0];
  if (!/^\d+$/.test(String(num)) || !/^\d+$/.test(String(den))) return undefined;
  const duration = Number(num) / Number(den);
  return finite(duration) && duration > 0 ? duration : undefined;
}

function staffIdentity(staff: NonNullable<abcjs.TuneLine['staff']>[number]) {
  // Engraving adds circular abselem references to clef/key objects. Compare
  // their musical fields, never their rendered object graphs.
  const { clef, key } = staff;
  return JSON.stringify([
    clef && [clef.type, clef.verticalPos, clef.clefPos, clef.transpose, clef.stafflines, clef.staffscale],
    key && [key.root, key.acc, key.mode, key.accidentals?.map(accidental =>
      [accidental.acc, accidental.note, accidental.verticalPos])],
    staff.voices?.length,
  ]);
}

// The source-bound hymn has a braced pair of connected staves. Keep grouping
// explicit: the existing musical signature deliberately omits these fields.
function hymnGrouping(tune: abcjs.TuneObject | undefined): string | undefined {
  const expected = JSON.stringify([['start', undefined, 'start'], ['end', undefined, 'end']]);
  return tune?.lines.length && tune.lines.every(line => line.staff &&
    JSON.stringify(line.staff.map(staff => {
      const grouping = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
      return [grouping.brace, grouping.bracket, grouping.connectBarLines];
    })) === expected)
    ? expected : undefined;
}

function sourceRange(element: abcjs.AbcElem, abc: string) {
  const { startChar, endChar } = element;
  if (!Number.isInteger(startChar) || !Number.isInteger(endChar) ||
    startChar === undefined || endChar === undefined || startChar < 0 || endChar <= startChar || endChar > abc.length) return undefined;
  return [startChar, endChar, abc.slice(startChar, endChar)];
}

function eventIdentity(element: abcjs.AbcElem, abc: string) {
  return [
    element.el_type, sourceRange(element, abc), element.type, element.duration,
    element.pitches?.map(pitch => [pitch.pitch, pitch.name, pitch.accidental, pitch.verticalPos,
      pitch.startTie, pitch.endTie, pitch.startSlur, pitch.endSlur, pitch.style]),
    element.rest, element.lyric, element.decoration, element.chord,
    element.startSlur, element.endSlur, element.startEnding, element.endEnding,
    element.gracenotes, element.startTriplet, element.endTriplet, element.tripletMultiplier,
    element.style, element.head, element.noStem, element.fonts, element.positioning,
  ];
}

/** ABCJS's automatic-wrap reparse uses the stripped TuneBook source without
 * the original leading-whitespace offset; explicit breaks retain that offset.
 * Prove the exact prefix relationship, then use the same parser input for the
 * candidate and source identity. The original render and canonical ABC stay
 * untouched, and source positions are still compared exactly. The admitted
 * hymn also has an exact format-marker prefix that TuneBook removes before
 * automatic wrapping; other songs retain the established whitespace-only path.
 */
function wrappedSource(abc: string, diagnostic?: WrapDiagnostic, hymnPickup = false): string | undefined {
  const prefix = hymnPickup && abc.startsWith('%abc-2.1\n')
    ? '%abc-2.1\n' : /^[ \t\r\n]+/.exec(abc)?.[0];
  if (!prefix) return abc;
  const source = abc.slice(prefix.length);
  const book = new abcjs.TuneBook(abc);
  if (book.header || book.tunes.length !== 1 || book.tunes[0].startPos !== prefix.length ||
    book.tunes[0].abc !== source.trimEnd()) return reject(diagnostic, 'source.wrap-prefix');
  return source;
}

/** Read only a synchronized, single-section score. No parsing or tune mutation. */
function readScore(tune: abcjs.TuneObject | undefined, abc: string, diagnostic?: WrapDiagnostic): Score | undefined {
  // These prepared scores receive caller-owned SVG edits after this helper
  // returns. Until those edits participate in candidate validation, preserve
  // the native tune and listener-bearing nodes without attempting reflow.
  if (tune && ('sourceHeadPresentation' in tune || 'sourceLayerPresentation' in tune))
    return reject(diagnostic, 'score.pending-presentation');
  if (!tune || tune.warnings?.length || !tune.lines.length || tune.lines.some(line => !line.staff?.length)) return reject(diagnostic, 'score.structure');
  const firstStaff = tune.lines[0].staff!;
  const meter = meterLength(firstStaff[0].meter);
  if (meter === undefined) return reject(diagnostic, 'score.meter');
  const staffIds = firstStaff.map(staffIdentity);
  const shape = firstStaff.map(staff => staff.voices?.length ?? 0);
  if (shape.some(count => count < 1)) return reject(diagnostic, 'score.empty-voice');
  const voiceCount = shape.reduce((sum, count) => sum + count, 0);
  const identities: unknown[][] = Array.from({ length: voiceCount }, () => []);
  const notesByVoice: Note[][] = Array.from({ length: voiceCount }, () => []);
  const units: Unit[] = [];
  const systems: number[][] = [];
  for (const line of tune.lines) {
    if (line.staff!.length !== shape.length || line.staff!.some((staff, index) =>
      staffIdentity(staff) !== staffIds[index] || (staff.meter && meterLength(staff.meter) !== meter))) return reject(diagnostic, 'score.staff-identity');
    const voices = line.staff!.flatMap(staff => staff.voices ?? []);
    const lineUnits: Unit[][] = [];
    for (let voice = 0; voice < voices.length; voice += 1) {
      const finished: Unit[] = [];
      let pending: abcjs.AbcElem[] = [];
      for (const raw of voices[voice]) {
        const element = raw as abcjs.AbcElem;
        // Wrapping inserts stem directives. A source voice may begin with a
        // cue-size declaration; retain it in the per-voice musical identity.
        // Later scale changes and all other unfamiliar directives fail closed.
        if (element.el_type === 'stem') continue;
        if (element.el_type === 'scale') {
          const size = (element as abcjs.AbcElem & { size?: number }).size;
          if (identities[voice].length || pending.length || !finite(size) || size <= 0 || size > 1)
            return reject(diagnostic, 'score.voice-scale');
          identities[voice].push(['scale', size]);
          continue;
        }
        if (element.el_type !== 'note' && element.el_type !== 'bar') return reject(diagnostic, 'score.event-kind');
        if (!sourceRange(element, abc)) return reject(diagnostic, 'score.source-range');
        identities[voice].push(eventIdentity(element, abc));
        if (element.el_type === 'note') {
          if (!finite(element.duration) || element.duration <= 0 || element.gracenotes?.length ||
            element.startTriplet || element.endTriplet || element.tripletMultiplier ||
            (!!element.rest === !!element.pitches?.length) ||
            element.pitches?.some(pitch => !finite(pitch.pitch))) return reject(diagnostic, 'score.note-structure');
          pending.push(element);
          notesByVoice[voice].push({ voice, element });
        } else {
          if (!pending.length) return reject(diagnostic, 'score.empty-unit');
          const duration = pending.reduce((sum, note) => sum + (note.duration as number), 0);
          if (duration > meter + TIME_EPSILON) return reject(diagnostic, 'score.unit-duration');
          finished.push({
            duration,
            invisible: pending.every(note => note.rest?.type === 'invisible' || note.rest?.type === 'spacer'),
            singleAttack: pending.length === 1 && !pending[0].rest && !!pending[0].pitches?.length &&
              pending[0].pitches.every(pitch => !pitch.endTie),
          });
          pending = [];
        }
      }
      if (pending.length || !finished.length) return reject(diagnostic, 'score.unfinished-unit');
      lineUnits.push(finished);
    }
    const lead = lineUnits[0];
    if (lineUnits.length !== voiceCount || lineUnits.some(voice => voice.length !== lead.length ||
      voice.some((unit, index) => !close(unit.duration, lead[index].duration)))) return reject(diagnostic, 'score.voice-synchrony');
    systems.push(lead.map((unit, index) => {
      const ordinal = units.length;
      // Silent cue lanes do not turn one audible chord into a multi-note line.
      // Their timed events remain in notes and the full identity signature.
      units.push({ duration: unit.duration, singleAttack:
        lineUnits.some(voice => voice[index].singleAttack) &&
        lineUnits.every(voice => voice[index].singleAttack || voice[index].invisible) });
      return ordinal;
    }));
  }
  if (!units.length) return reject(diagnostic, 'score.no-units');
  return {
    meter, units, systems, notes: notesByVoice.flat(),
    signature: JSON.stringify([staffIds, meter, identities]),
  };
}

function singleUnits(score: Score, systems = score.systems, partialOnly = false) {
  return systems.filter(system => system.length === 1 && score.units[system[0]].singleAttack &&
    (!partialOnly || score.units[system[0]].duration < score.meter - TIME_EPSILON)).map(system => system[0]);
}

function nativeWidths(tune: abcjs.TuneObject, score: Score, staffwidth: number, diagnostic?: WrapDiagnostic): NativeWidths | undefined {
  // ABCJS 6.7 returns this public render explanation but omits it from its types.
  const explanation = (tune as abcjs.TuneObject & { explanation?: { widths?: NativeWidths; staffWidth?: number }[] }).explanation;
  if (!Array.isArray(explanation) || explanation.length !== 1) return reject(diagnostic, 'widths.explanation');
  const section = explanation[0];
  const widths = section.widths;
  if (!widths || !finite(section.staffWidth) || !close(section.staffWidth, staffwidth) ||
    !finite(widths.left) || widths.left < 0 || widths.left >= staffwidth ||
    !Array.isArray(widths.measureWidths) || widths.measureWidths.length !== score.units.length ||
    widths.measureWidths.some(width => !finite(width) || width <= 0) || !finite(widths.total) ||
    !close(widths.measureWidths.reduce((sum, width) => sum + width, 0), widths.total, GEOMETRY_EPSILON)) return reject(diagnostic, 'widths.section');
  const engraver = tune.engraver;
  const renderedStaffwidth = engraver?.width;
  const leftPadding: unknown = engraver?.renderer?.padding?.left;
  if (!finite(renderedStaffwidth) || !close(renderedStaffwidth, staffwidth) ||
    !finite(leftPadding) || leftPadding < 0 || leftPadding > widths.left) return reject(diagnostic, 'widths.engraver');
  // ABCJS reports an absolute SVG x for left, including the staff's outer
  // padding. Its layout target is staffwidth + that padding; normalize left
  // to the staff origin before applying the existing planning width ceiling.
  return { ...widths, left: widths.left - leftPadding };
}

function chooseSystems(score: Score, widths: NativeWidths, staffwidth: number, diagnostic?: WrapDiagnostic, allowThreeSystemRepair = false, targetOrphan?: number): number[][] | undefined {
  let systems = score.systems.map(system => [...system]);
  const initialSingles = new Set(singleUnits(score));
  const widthOf = (system: number[]) => system.reduce((sum, unit) => sum + widths.measureWidths[unit], 0);
  const originalOrphans = singleUnits(score, systems);
  // Bound the new multi-boundary fallback across this entire render. Ordinary
  // neighbor moves and the existing source-qualified alternative are unchanged.
  let repartitionsLeft = 128;
  // At most one change for each original orphan, and one eventual render of
  // the whole plan. Source units remain intact; a multi-boundary fallback may
  // also rebalance a bounded window of three adjacent systems.
  for (const orphan of originalOrphans.filter(unit => targetOrphan === undefined || unit === targetOrphan)) {
    const index = systems.findIndex(system => system.length === 1 && system[0] === orphan);
    if (index < 0) continue;
    const choices: { systems: number[][]; removed: number; widest: number; neighbor: number }[] = [];
    for (const neighbor of [index - 1, index + 1]) {
      if (neighbor < 0 || neighbor >= systems.length) continue;
      // Either borrow one neighboring unit or move this lone unit into the
      // neighbor. The latter can avoid stranding the neighbor's own pickup.
      for (const moveOrphan of [false, true]) {
        const candidate = systems.map(system => [...system]);
        const from = moveOrphan ? index : neighbor;
        const to = moveOrphan ? neighbor : index;
        const donor = candidate[from];
        const moved = from < to ? donor.pop()! : donor.shift()!;
        if (from < to) candidate[to].unshift(moved);
        else candidate[to].push(moved);
        const changedWidths = [widthOf(candidate[to]), widthOf(donor)];
        if (changedWidths.some(width => width > staffwidth - widths.left + TIME_EPSILON)) {
          if (diagnostic && !diagnostic.firstPlanRejection) diagnostic.firstPlanRejection = {
            reason: 'plan.width', orphan, from, to, changedWidths, available: staffwidth - widths.left,
          };
          continue;
        }
        if (donor.length === 0) candidate.splice(from, 1);
        if (singleUnits(score, candidate).some(unit => !initialSingles.has(unit))) {
          if (diagnostic && !diagnostic.firstPlanRejection) diagnostic.firstPlanRejection = {
            reason: 'plan.new-single', orphan, from, to, changedWidths, available: staffwidth - widths.left,
          };
          continue;
        }
        const removed = singleUnits(score, systems).length - singleUnits(score, candidate).length;
        if (removed > 0) choices.push({ systems: candidate, removed, widest: Math.max(...changedWidths), neighbor });
      }
    }
    if (allowThreeSystemRepair) {
      // A single boundary move can strand the next pickup. Repartition three
      // adjacent systems into two while retaining every complete source unit.
      // This bounded alternative is enabled only for Psalter 1; the existing
      // native-width, no-new-single and rendered-geometry checks still apply.
      for (let start = Math.max(0, index - 2); start <= Math.min(index, systems.length - 3); start += 1) {
        const units = systems.slice(start, start + 3).flat();
        for (let split = 1; split < units.length; split += 1) {
          const replacement = [units.slice(0, split), units.slice(split)];
          const changedWidths = replacement.map(widthOf);
          if (changedWidths.some(width => width > staffwidth - widths.left + TIME_EPSILON)) continue;
          const candidate = systems.map(system => [...system]);
          candidate.splice(start, 3, ...replacement);
          if (singleUnits(score, candidate).some(unit => !initialSingles.has(unit))) continue;
          const removed = singleUnits(score, systems).length - singleUnits(score, candidate).length;
          if (removed > 0) choices.push({ systems: candidate, removed, widest: Math.max(...changedWidths), neighbor: start });
        }
      }
    }
    if (!choices.length && repartitionsLeft > 0) {
      // One move can strand the donor's pickup or cadence. Rebalance at most
      // three adjacent systems into two or three, preserving complete units.
      // Try this only when the existing moves found no admissible improvement.
      for (let start = Math.max(0, index - 2); start <= Math.min(index, systems.length - 3) && repartitionsLeft > 0; start += 1) {
        const units = systems.slice(start, start + 3).flat();
        if (units.length > 12) continue;
        for (let first = 1; first < units.length && repartitionsLeft > 0; first += 1) {
          for (let second = first + 1; second <= units.length && repartitionsLeft > 0; second += 1) {
            repartitionsLeft -= 1;
            const replacement = [units.slice(0, first), units.slice(first, second)];
            if (second < units.length) replacement.push(units.slice(second));
            if (replacement.some(system => system.length === 1 && system[0] === orphan)) continue;
            const changedWidths = replacement.map(widthOf);
            if (changedWidths.some(width => width > staffwidth - widths.left + TIME_EPSILON)) continue;
            const candidate = systems.map(system => [...system]);
            candidate.splice(start, 3, ...replacement);
            if (singleUnits(score, candidate).some(unit => !initialSingles.has(unit))) continue;
            const removed = singleUnits(score, systems).length - singleUnits(score, candidate).length;
            if (removed > 0) choices.push({ systems: candidate, removed, widest: Math.max(...changedWidths), neighbor: start });
          }
        }
      }
    }
    choices.sort((left, right) => right.removed - left.removed || left.widest - right.widest || left.neighbor - right.neighbor);
    if (choices[0]) systems = choices[0].systems;
  }
  return singleUnits(score, systems).length < originalOrphans.length ? systems : reject(diagnostic, 'plan.no-improvement');
}

/** Source-bound alternatives for the observed 1/301 edge-orphan partition.
 * Reuse outer SVG padding inside the staff; never enlarge the SVG or its scale.
 * ABCJS's ordinary render and the 303 planner are untouched.
 */
function psalterPhonePaddingPlan(
  songId: string | undefined, abc: string, tune: abcjs.TuneObject, score: Score,
  widths: NativeWidths, options: abcjs.AbcVisualParams,
): { systems: number[][]; layout: { staffwidth: number; paddingleft: number; paddingright: number; available: number; viewportWidth: number } } | undefined {
  const witness = songId === 'psalter301' ? { source: PSALTER301_PHONE_SOURCE, stanzas: 4 } :
    songId === 'psalter1' ? { source: PSALTER1_PHONE_SOURCE, stanzas: 5 } : undefined;
  if (!witness || abc.replace(/\r\n/g, '\n').trim() !== witness.source ||
    (options.visualTranspose ?? 0) !== 0 || !finite(options.staffwidth) ||
    options.paddingleft !== undefined || options.paddingright !== undefined ||
    tune.formatting.leftmargin !== undefined || tune.formatting.rightmargin !== undefined ||
    tune.formatting.staffwidth !== undefined ||
    score.units.length !== 12 || score.notes.length !== 112 ||
    score.notes.some(note => note.voice === 0 && note.element.lyric?.length !== witness.stanzas) ||
    JSON.stringify(score.systems) !== '[[0],[1],[2,3],[4],[5,6],[7],[8],[9,10],[11]]') return undefined;
  // Preserve Psalter 1's ordinary planner whenever the opening already fits.
  // This bounded padding alternative addresses only its native width ceiling.
  if (songId === 'psalter1' && widths.measureWidths[0] + widths.measureWidths[1] <=
    options.staffwidth - widths.left + TIME_EPSILON) return undefined;
  const padding = tune.engraver?.renderer?.padding;
  if (padding?.left !== 15 || padding?.right !== 15) return undefined;
  const viewportWidth = options.staffwidth + padding.left + padding.right;
  const paddingleft = 8, paddingright = 8;
  const staffwidth = viewportWidth - paddingleft - paddingright;
  if (!finite(staffwidth) || staffwidth <= 0 ||
    staffwidth + paddingleft + paddingright !== viewportWidth) return undefined;
  const available = staffwidth - widths.left;
  // Move complete units only: merge the opening and redistribute the final
  // three systems across two boundaries, without stranding the middle pickup.
  const systems = [[0, 1], [2, 3], [4], [5, 6], [7], [8, 9], [10, 11]];
  const originalSingles = new Set(singleUnits(score));
  if (systems.some(system => system.reduce((sum, unit) => sum + widths.measureWidths[unit], 0) > available + TIME_EPSILON) ||
    singleUnits(score, systems).some(unit => !originalSingles.has(unit)) ||
    singleUnits(score, systems, true).length >= singleUnits(score, score.systems, true).length) return undefined;
  return { systems, layout: { staffwidth, paddingleft, paddingright, available, viewportWidth } };
}

function recordCandidateViewport(
  diagnostic: WrapDiagnostic | undefined, tune: abcjs.TuneObject | undefined,
  svgs: SVGSVGElement[], originalWidth: number, after = false,
) {
  if (!diagnostic) return;
  try {
    const number = (value: unknown) => finite(value) ? value : null;
    const widths = svgs.slice(0, DIAGNOSTIC_UNIT_LIMIT).map(svg => number(svg.viewBox.baseVal.width));
    if (svgs.length > DIAGNOSTIC_UNIT_LIMIT) diagnostic.truncated = true;
    if (after && diagnostic.candidateViewport) {
      diagnostic.candidateViewport.after = widths;
      diagnostic.candidateViewport.normalized = widths.length === svgs.length && widths.every(width => width === originalWidth);
    } else diagnostic.candidateViewport = {
      originalWidth, before: widths, after: widths, systemCount: svgs.length,
      engravedStaff: number(tune?.engraver?.width), leftPadding: number(tune?.engraver?.renderer?.padding?.left),
      rightPadding: number(tune?.engraver?.renderer?.padding?.right), normalized: false,
    };
  } catch { /* Diagnostic reads never decide candidate acceptance or fallback. */ }
}

/** ABCJS can stop spacing within two units and enlarge maxWidth. Restore only
 * this candidate's viewport to the measured original; the unchanged ink and
 * physical-size guards below still decide whether all drawn music fits.
 */
function normalizeCandidateViewport(
  host: HTMLElement, tune: abcjs.TuneObject | undefined, score: Score | undefined,
  original: Pick<Geometry, 'left' | 'width'>, diagnostic?: WrapDiagnostic,
) {
  const svgs = Array.from(host.querySelectorAll('svg'));
  recordCandidateViewport(diagnostic, tune, svgs, original.width);
  if (!score) return false;
  const boxes = svgs.map(svg => (svg.getAttribute('viewBox') ?? '').trim().split(/\s+/));
  const svgNumber = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
  if (!svgs.length || svgs.length !== score.systems.length || host.style.paddingBottom ||
    boxes.some(box => box.length !== 4 || box.some(value => !svgNumber.test(value) || !finite(Number(value))) || Number(box[0]) !== original.left ||
      Number(box[2]) <= 0 || Number(box[3]) <= 0 || box[2] !== boxes[0][2]) ||
    svgs.some(svg => {
      const wrapper = svg.parentElement;
      const box = svg.viewBox.baseVal;
      return ![box.x, box.y, box.width, box.height].every(finite) || box.width <= 0 || box.height <= 0 ||
        !wrapper || wrapper.parentElement !== host || wrapper.childElementCount !== 1 ||
        wrapper.style.width || wrapper.style.height || wrapper.style.paddingBottom || wrapper.style.position || wrapper.style.transform ||
        svg.hasAttribute('width') || svg.hasAttribute('height') || svg.hasAttribute('transform') ||
        svg.style.width || svg.style.height || svg.style.position || svg.style.transform ||
        svg.getAttribute('preserveAspectRatio') !== 'xMinYMin meet';
    })) return observed(false, diagnostic, 'candidate.viewport-structure');
  try {
    // Keep x, y and height verbatim. No glyph/position/transform/style changes.
    svgs.forEach((svg, index) => {
      const box = boxes[index];
      svg.setAttribute('viewBox', `${box[0]} ${box[1]} ${original.width} ${box[3]}`);
    });
  } finally {
    recordCandidateViewport(diagnostic, tune, svgs, original.width, true);
  }
  return observed(svgs.every(svg => svg.viewBox.baseVal.width === original.width), diagnostic, 'candidate.viewport-normalization');
}

// Reuse the same finite-positive physical size proof for source-bound rest glyphs.
export { sizeOf as readScreenElementSize };
function sizeOf(element: SVGGraphicsElement): Size | undefined {
  const box = element.getBBox();
  const rect = element.getBoundingClientRect();
  const size = { width: box.width, height: box.height, screenWidth: rect.width, screenHeight: rect.height };
  return Object.values(size).every(value => finite(value) && value > 0) ? size : undefined;
}

function svgBox(element: SVGGraphicsElement, svg: SVGSVGElement) {
  const box = element.getBBox();
  const root = svg.getScreenCTM();
  const local = element.getScreenCTM();
  if (!root || !local || ![box.x, box.y, box.width, box.height].every(finite)) return undefined;
  const transform = root.inverse().multiply(local);
  const points = [new DOMPoint(box.x, box.y), new DOMPoint(box.x + box.width, box.y),
    new DOMPoint(box.x, box.y + box.height), new DOMPoint(box.x + box.width, box.y + box.height)]
    .map(point => point.matrixTransform(transform));
  if (points.some(point => !finite(point.x) || !finite(point.y))) return undefined;
  return { left: Math.min(...points.map(point => point.x)), right: Math.max(...points.map(point => point.x)) };
}

function readGeometry(host: HTMLElement, score: Score, checkClearance: boolean, diagnostic?: WrapDiagnostic): Geometry | undefined {
  if (!host.isConnected || host.getBoundingClientRect().width <= 0) return reject(diagnostic, 'geometry.host');
  const svgs = Array.from(host.querySelectorAll('svg'));
  if (svgs.length !== score.systems.length) return reject(diagnostic, 'geometry.svg-count');
  const viewports = svgs.map(svg => svg.viewBox.baseVal);
  const first = viewports[0];
  if (!first || !finite(first.width) || first.width <= 0 || !finite(first.x)) return reject(diagnostic, 'geometry.viewport');
  const screenWidth = svgs[0].getBoundingClientRect().width;
  if (!finite(screenWidth) || screenWidth <= 0) return reject(diagnostic, 'geometry.screen-width');
  for (let index = 0; index < svgs.length; index += 1) {
    const svg = svgs[index];
    const box = viewports[index];
    if (!close(box.x, first.x, GEOMETRY_EPSILON) || !close(box.width, first.width, GEOMETRY_EPSILON) ||
      !close(svg.getBoundingClientRect().width, screenWidth, GEOMETRY_EPSILON)) return reject(diagnostic, 'geometry.system-width');
    const ink = svg.getBBox();
    if (![ink.x, ink.y, ink.width, ink.height].every(finite) || ink.width <= 0 || ink.height <= 0 ||
      ink.x - 2 < box.x - GEOMETRY_EPSILON || ink.x + ink.width + 2 > box.x + box.width + GEOMETRY_EPSILON) return reject(diagnostic, 'geometry.ink-bounds');
  }
  const rows = new Map<string, { left: number; right: number }[]>();
  const notes: NoteGeometry[] = [];
  let lyricCount = 0;
  let headCount = 0;
  for (const { voice, element } of score.notes) {
    const roots = element.abselem?.elemset;
    // ABCJS intentionally draws no root for a plain invisible timed rest.
    // Keep its place in the identity/geometry sequence without inventing ink.
    if (roots?.length === 0 && (element.rest?.type === 'invisible' || element.rest?.type === 'spacer') &&
      !element.pitches?.length && !element.lyric?.length && !element.decoration?.length && !element.chord?.length) {
      notes.push({ heads: [], lyrics: [] });
      continue;
    }
    if (!roots?.length || roots.some(root => !host.contains(root))) return reject(diagnostic, 'geometry.note-roots');
    const heads = roots.flatMap(root => Array.from(root.querySelectorAll<SVGGraphicsElement>('.abcjs-notehead')));
    const lyrics = roots.flatMap(root => Array.from(root.querySelectorAll<SVGTextElement>('text.abcjs-lyric[data-name="lyric"]')));
    if (heads.length !== (element.pitches?.length ?? 0) || lyrics.length !== (element.lyric?.length ? 1 : 0)) return reject(diagnostic, 'geometry.note-element-count');
    const headSizes = heads.map(sizeOf);
    if (headSizes.some(size => !size)) return reject(diagnostic, 'geometry.head-size');
    headCount += heads.length;
    lyricCount += lyrics.length;
    const note: NoteGeometry = { heads: headSizes as Size[], lyrics: [] };
    for (const lyric of lyrics) {
      const svg = lyric.ownerSVGElement;
      const system = svg ? svgs.indexOf(svg) : -1;
      if (!svg || system < 0 || lyric.childNodes.length !== lyric.children.length) return reject(diagnostic, 'geometry.lyric-owner');
      const style = getComputedStyle(lyric);
      note.font = [style.fontFamily, style.fontSize, style.fontWeight, style.fontStyle, style.letterSpacing].join('|');
      for (let row = 0; row < lyric.children.length; row += 1) {
        const span = lyric.children[row];
        if (!(span instanceof SVGGraphicsElement) || span.tagName.toLowerCase() !== 'tspan' || span.children.length) return reject(diagnostic, 'geometry.lyric-span');
        const text = span.textContent ?? '';
        if (!text.trim()) {
          note.lyrics.push({ text });
          continue;
        }
        const size = sizeOf(span);
        const box = svgBox(span, svg);
        if (!size || !box || box.left < first.x - GEOMETRY_EPSILON || box.right > first.x + first.width + GEOMETRY_EPSILON) return reject(diagnostic, 'geometry.lyric-bounds');
        note.lyrics.push({ text, size });
        const key = `${system}:${voice}:${row}`;
        const words = rows.get(key) ?? [];
        words.push(box);
        rows.set(key, words);
      }
    }
    notes.push(note);
  }
  if (headCount !== host.querySelectorAll('.abcjs-notehead').length ||
    lyricCount !== host.querySelectorAll('text.abcjs-lyric[data-name="lyric"]').length) return reject(diagnostic, 'geometry.total-element-count');
  if (checkClearance) for (const words of rows.values()) {
    words.sort((left, right) => left.left - right.left);
    if (words.some((word, index) => index > 0 && word.left - words[index - 1].right < MIN_LYRIC_GAP - GEOMETRY_EPSILON)) return reject(diagnostic, 'geometry.lyric-clearance');
  }
  return { width: first.width, left: first.x, screenWidth, notes };
}

function sameGeometry(before: Geometry, after: Geometry, diagnostic?: WrapDiagnostic) {
  const sameSize = (left: Size | undefined, right: Size | undefined) => !left || !right ? left === right :
    (Object.keys(left) as (keyof Size)[]).every(key => close(left[key], right[key], GEOMETRY_EPSILON));
  return observed(close(before.width, after.width, GEOMETRY_EPSILON), diagnostic, 'same-geometry.viewport-width') &&
    observed(close(before.left, after.left, GEOMETRY_EPSILON), diagnostic, 'same-geometry.viewport-left') &&
    observed(close(before.screenWidth, after.screenWidth, GEOMETRY_EPSILON), diagnostic, 'same-geometry.screen-width') &&
    observed(before.notes.length === after.notes.length, diagnostic, 'same-geometry.note-count') &&
    before.notes.every((note, index) => {
      const candidate = after.notes[index];
      return observed(note.font === candidate.font, diagnostic, 'same-geometry.font') &&
        observed(note.heads.length === candidate.heads.length, diagnostic, 'same-geometry.head-count') &&
        observed(note.heads.every((head, headIndex) => sameSize(head, candidate.heads[headIndex])), diagnostic, 'same-geometry.head-size') &&
        observed(note.lyrics.length === candidate.lyrics.length, diagnostic, 'same-geometry.lyric-count') &&
        note.lyrics.every((lyric, row) =>
          observed(lyric.text === candidate.lyrics[row].text, diagnostic, 'same-geometry.lyric-text') &&
          observed(sameSize(lyric.size, candidate.lyrics[row].size), diagnostic, 'same-geometry.lyric-size'));
    });
}

/** One ordinary render and, only for structurally verified phone orphans, one guarded attempt. */
export function renderScreenScore(host: HTMLElement, abc: string, songId: string | undefined, options: abcjs.AbcVisualParams, ohHowPickup = false): abcjs.TuneObjectArray {
  // Never leave a prior render's diagnostic on a reused host if rendering throws.
  try { host.removeAttribute(WRAP_DIAGNOSTIC_ATTRIBUTE); } catch { /* Diagnostic only. */ }
  const original = abcjs.renderAbc(host, abc, options);
  const hymnPickup = ohHowPickup && hasOhHowPickupNotation(songId, abc);
  const eligibleSong = (!!songId && PSALTER_ARRANGEMENT_IDS.has(songId)) || hymnPickup;
  const diagnostic: WrapDiagnostic | undefined = eligibleSong && songId &&
    !options.print && !host.closest('.print-score-canvas') ?
    { version: 1, song: songId, phase: 'eligibility', result: 'original' } : undefined;
  const finish = (rendered: abcjs.TuneObjectArray) => {
    publishDiagnostic(host, diagnostic);
    return rendered;
  };
  if (!eligibleSong || abcjs.signature !== 'abcjs-basic v6.7.0' ||
    options.print || host.closest('.print-score-canvas') ||
    !host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches ||
    !host.isConnected || original.length !== 1 || !options.wrap || options.lineBreaks || options.oneSvgPerLine !== true ||
    options.viewportHorizontal || options.viewportVertical ||
    options.responsive !== 'resize' || options.scale !== 1 || options.minPadding !== MIN_LYRIC_GAP ||
    !finite(options.staffwidth) || options.staffwidth <= 0 ||
    (hymnPickup && ((options.visualTranspose ?? 0) !== 0 || options.format || options.expandToWidest ||
      options.timeBasedLayout || options.tablature || options.paddingleft !== undefined || options.paddingright !== undefined ||
      options.wrap.minSpacing !== 1.5 || options.wrap.maxSpacing !== 2.7 || options.wrap.preferredMeasuresPerLine !== 0 ||
      options.wrap.minSpacingLimit !== undefined || options.wrap.lastLineLimit !== undefined))) {
    reject(diagnostic, 'eligibility.unsupported');
    return finish(original);
  }
  let retained: Node[] | undefined;
  let attributes: [string, string][] | undefined;
  try {
    recordNativeWidths(diagnostic, original[0], options.staffwidth);
    diagnosticPhase(diagnostic, 'baseline-score');
    const source = wrappedSource(abc, diagnostic, hymnPickup);
    if (source === undefined) return finish(original);
    if (hymnPickup && diagnostic) diagnostic.source = { prefixLength: abc.length - source.length, targetUnit: 18 };
    const beforeGrouping = hymnPickup ? hymnGrouping(original[0]) : undefined;
    if (hymnPickup && !observed(!!beforeGrouping, diagnostic, 'score.hymn-grouping')) return finish(original);
    const before = readScore(original[0], source, diagnostic);
    if (!before) return finish(original);
    recordSystems(diagnostic, 'original', before.systems);
    // Only the witnessed Be- pickup is eligible. The tied me. cadence is two
    // events, not another singleton; no attempt is made to "repair" its system.
    if (hymnPickup && !observed(before.meter === 0.75 && before.units.length === 23 && before.notes.length === 196 &&
      before.units[18].duration === 0.125 && before.units[18].singleAttack &&
      before.units[20].duration === 0.625 && !before.units[20].singleAttack &&
      before.systems.some(system => system.length === 1 && system[0] === 18), diagnostic, 'score.hymn-pickup')) return finish(original);
    if (!singleUnits(before).length) {
      reject(diagnostic, 'score.no-singletons');
      return finish(original);
    }
    diagnosticPhase(diagnostic, 'native-widths');
    const widths = nativeWidths(original[0], before, options.staffwidth, diagnostic);
    diagnosticPhase(diagnostic, 'plan');
    const sourcePaddingPlan = widths && psalterPhonePaddingPlan(songId, source, original[0], before, widths, options);
    const systems = sourcePaddingPlan?.systems ?? (widths && chooseSystems(before, widths, options.staffwidth, diagnostic, songId === 'psalter1', hymnPickup ? 18 : undefined));
    if (diagnostic && sourcePaddingPlan) diagnostic.candidateLayout = sourcePaddingPlan.layout;
    if (!systems) return finish(original);
    recordSystems(diagnostic, 'planned', systems);
    diagnosticPhase(diagnostic, 'baseline-geometry');
    preserveBlankLyricRows(host);
    const geometry = readGeometry(host, before, false, diagnostic);
    if (!geometry) return finish(original);
    // Retain the actual listener-bearing nodes and tune. A rejection never
    // reparses the baseline, clones nodes, or changes the requested score size.
    retained = Array.from(host.childNodes);
    attributes = Array.from(host.attributes, attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const { wrap: _wrap, ...explicitOptions } = options;
    // ABCJS 6.7 expects one break array per section, despite its number[] type.
    const lineBreaks = [systems.slice(0, -1).map(system => system.at(-1)!)];
    diagnosticPhase(diagnostic, 'candidate-render');
    const candidate = abcjs.renderAbc(host, source, {
      ...explicitOptions,
      ...(sourcePaddingPlan && { staffwidth: sourcePaddingPlan.layout.staffwidth,
        paddingleft: sourcePaddingPlan.layout.paddingleft, paddingright: sourcePaddingPlan.layout.paddingright }),
      lineBreaks: lineBreaks as unknown as number[],
    });
    diagnosticPhase(diagnostic, 'candidate-score');
    const after = readScore(candidate[0], source, diagnostic);
    if (after) recordSystems(diagnostic, 'candidate', after.systems);
    // Validate the complete music/source partition before restoring the original
    // viewport. The candidate must still pass every ink, lyric-clearance and
    // physical-size check below; a wider or smaller score is never accepted.
    if (!after || (hymnPickup && !observed(hymnGrouping(candidate[0]) === beforeGrouping, diagnostic, 'candidate.hymn-grouping')) ||
      !observed(after.signature === before.signature, diagnostic, 'candidate.identity') ||
      !observed(JSON.stringify(after.systems) === JSON.stringify(systems), diagnostic, 'candidate.partition')) {
      throw new Error('Unsupported candidate score');
    }
    diagnosticPhase(diagnostic, 'candidate-viewport');
    preserveBlankLyricRows(host);
    const candidateViewport = normalizeCandidateViewport(host, candidate[0], after, geometry, diagnostic);
    diagnosticPhase(diagnostic, 'candidate-geometry');
    const candidateGeometry = after && candidateViewport && readGeometry(host, after, true, diagnostic);
    const originalSingles = new Set(singleUnits(before));
    diagnosticPhase(diagnostic, 'candidate-acceptance');
    if (after && candidateGeometry && observed(after.signature === before.signature, diagnostic, 'candidate.identity') &&
      observed(JSON.stringify(after.systems) === JSON.stringify(systems), diagnostic, 'candidate.partition') &&
      observed(singleUnits(after).length < singleUnits(before).length, diagnostic, 'candidate.no-improvement') &&
      observed(singleUnits(after).every(unit => originalSingles.has(unit)), diagnostic, 'candidate.new-single') &&
      sameGeometry(geometry, candidateGeometry, diagnostic) &&
      (!sourcePaddingPlan || observed(candidateGeometry.width === geometry.width &&
        candidate[0].engraver?.width === sourcePaddingPlan.layout.staffwidth &&
        candidate[0].engraver?.renderer?.padding?.left === sourcePaddingPlan.layout.paddingleft &&
        candidate[0].engraver?.renderer?.padding?.right === sourcePaddingPlan.layout.paddingright, diagnostic, 'candidate.padding-budget'))) {
      if (diagnostic) diagnostic.result = 'candidate';
      diagnosticPhase(diagnostic, 'accepted');
      return finish(candidate);
    }
  } catch (error) {
    reject(diagnostic, 'exception');
    // Error text and stacks can contain source/user data; expose only known classes.
    try {
      if (diagnostic) {
        const name = error instanceof Error ? error.name : 'non-error';
        diagnostic.errorClass = ['Error', 'TypeError', 'RangeError', 'SyntaxError', 'ReferenceError', 'DOMException', 'non-error'].includes(name) ? name : 'Error';
      }
    } catch { /* Custom error accessors must not interfere with native fallback. */ }
    // Missing/changed native structures, unreadable geometry, or a candidate
    // render error all leave the ordinary rendering and its click mapping intact.
  }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of Array.from(host.attributes)) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original);
}

export { readScore as readScreenScoreIdentity, readGeometry as readScreenScoreGeometry,
  normalizeCandidateViewport as normalizeScreenCandidateViewport, sameGeometry as sameScreenScoreGeometry };
