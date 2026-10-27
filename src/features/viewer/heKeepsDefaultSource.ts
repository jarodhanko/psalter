import type abcjs from 'abcjs';
import { engravedHeader, readHeKeepsDefaultIdentity } from './heKeepsSizeSource';

type Tune = abcjs.TuneObject;
type Event = abcjs.AbcElem;
type Staff = NonNullable<abcjs.TuneLine['staff']>[number];
export type HeKeepsDefaultFragmentGroups = readonly (readonly number[])[];
const SINGLETONS = JSON.stringify(Array.from({ length: 16 }, (_, index) => [index]));
// Fragment 0 is the opening prefix, 1 its suffix, and 2..16 are bars 1..15.
// Only these phrase-adjacent pairs may join. A narrower fit may retain either
// member as a singleton; no other join, reorder, or new split is admitted.
export const HE_KEEPS_DEFAULT_FRAGMENT_GROUPS: HeKeepsDefaultFragmentGroups = Object.freeze(
  [[0], [1, 2], [3, 4], [5], [6], [7, 8], [9, 10], [11, 12], [13, 14], [15, 16]]
    .map(group => Object.freeze(group)),
);
const JOIN_STARTS = new Set([1, 3, 7, 9, 11, 13, 15]);
// The canonical parser repeats the source voice directive at bars 4, 8, 12.
const SOURCE_STEM_REPEATS = new Set([5, 9, 13]);
const lanes = (line: abcjs.TuneLine) => line.staff!.flatMap(staff => staff.voices!);
const stem = (event: abcjs.VoiceItem, lane: number) => event?.el_type === 'stem' &&
  Object.keys(event).every(key => ['el_type', 'direction'].includes(key)) &&
  (event as typeof event & { direction?: string }).direction === (lane % 2 ? 'down' : 'up');
function list(value: unknown): value is unknown[] {
  return Array.isArray(value) && Object.keys(value).length === value.length &&
    Object.keys(value).every((key, index) => key === String(index));
}
function validLegacyGroups(groups: HeKeepsDefaultFragmentGroups) {
  let next = 0;
  return list(groups) && groups.length > 0 && groups.every(group =>
    list(group) && (group.length === 1 || group.length === 2 && JOIN_STARTS.has(next)) &&
    group.every(fragment => fragment === next++)) && next === 17;
}
// Fractional identifiers denote only the beat-2 suffix of the two verse
// approach bars. Integers retain their original v6 identity.
export const HE_KEEPS_FLOW_FRAGMENT_GROUPS: HeKeepsDefaultFragmentGroups = Object.freeze(
  [[0], [1, 2], [3], [4], [5], [6], [7], [7.5, 8], [9, 10], [11, 12], [13, 14], [15, 16]]
    .map(group => Object.freeze(group)),
);
export const HE_KEEPS_CADENCE_FRAGMENT_GROUPS: HeKeepsDefaultFragmentGroups = Object.freeze(
  [[0], [1, 2], [3], [3.5, 4], [5], [6], [7], [7.5, 8], [9, 10], [11, 12], [13, 14], [15, 16]]
    .map(group => Object.freeze(group)),
);
const cadencePlan = (groups: HeKeepsDefaultFragmentGroups) =>
  [HE_KEEPS_FLOW_FRAGMENT_GROUPS, HE_KEEPS_CADENCE_FRAGMENT_GROUPS]
    .some(plan => JSON.stringify(groups) === JSON.stringify(plan));
function validGroups(groups: HeKeepsDefaultFragmentGroups) {
  return validLegacyGroups(groups) || list(groups) && groups.every(group => list(group)) && cadencePlan(groups);
}
export const readHeKeepsDefaultFragmentSource = (fragment: number) => Math.max(0, Math.floor(fragment) - 1);
/** Classify a baseline source event against an admitted display partition. */
export function heKeepsDefaultEventFragment(system: number, noteOrdinal: number, eventType: string,
  groups?: HeKeepsDefaultFragmentGroups) {
  if (system === 0) return eventType === 'tempo' || eventType === 'note' && noteOrdinal <= 4 ? 0 : 1;
  const fragment = system + 1;
  return [3, 7].includes(fragment) && groups?.some(group => group.includes(fragment + 0.5)) &&
    (eventType === 'bar' || eventType === 'note' && noteOrdinal > 4) ? fragment + 0.5 : fragment;
}
/** Share the same narrow admission rule with native ink/ownership guards. */
export function readHeKeepsDefaultGroups(groups: unknown): number[][] | undefined {
  return validGroups(groups as HeKeepsDefaultFragmentGroups)
    ? (groups as HeKeepsDefaultFragmentGroups).map(group => [...group]) : undefined;
}
function mapping(groups: HeKeepsDefaultFragmentGroups) {
  const fragmentSystems = groups.map(group => [...group]);
  const fragmentToSystem = Array<number>(17);
  fragmentSystems.forEach((group, system) => group.forEach(fragment => { fragmentToSystem[fragment] = system; }));
  return { fragmentSystems, fragmentToSystem,
    systems: fragmentSystems.map(group => group.map(fragment => readHeKeepsDefaultFragmentSource(fragment))) };
}
function header(staff: Staff) {
  // Recomposition retains only prefix headers. Validate every actual display
  // header, including continuation caches, before omitting any references.
  const { voices: _voices, meter: _meter, ...rest } = staff;
  const uncached = (value: unknown, kind: string) => value && typeof value === 'object' &&
    !Array.isArray(value) && engravedHeader(value, kind) ? Object.fromEntries(Object.entries(value)
      .filter(([key]) => key !== 'el_type' && key !== 'abselem')) : undefined;
  const clef = uncached(staff.clef, 'clef'), key = uncached(staff.key, 'keySignature');
  return clef && key ? JSON.stringify({ ...rest, clef, key }) : undefined;
}
function withVoices(line: abcjs.TuneLine, voices: abcjs.VoiceItem[][]): abcjs.TuneLine {
  return { ...line, staff: line.staff!.map((staff, index) => ({ ...staff, voices: voices.slice(index * 2, index * 2 + 2) })) };
}

/** A source-audit view only, never an engraving input. Recover the actual
 * display partition before reconstructing the sixteen complete source bars.
 * Every note, bar, lyric, tempo, source span, and cache reference stays owned
 * by the real candidate. No arbitrary repartition can hide in this view. */
function auditLegacy(tune: Tune, parser: string, expected?: HeKeepsDefaultFragmentGroups) {
  if (!list(tune.lines) || tune.lines.length < 10 || tune.lines.length > 17 || tune.lines.some(line =>
    !line || Object.keys(line).some(key => !['staff', 'staffGroup'].includes(key) || line[key as keyof typeof line] === undefined) ||
    !list(line.staff) || line.staff.length !== 2 || line.staff.some(staff =>
      !staff || !list(staff.voices) || staff.voices.length !== 2 || staff.voices.some(voice => !list(voice))))) return undefined;
  const first = tune.lines[0], prefix = lanes(first);
  const headers = first.staff!.map(header);
  if (headers.some(value => !value)) return undefined;
  const fragments = [first], groups: number[][] = [[0]];
  for (let lineIndex = 1; lineIndex < tune.lines.length; lineIndex++) {
    const line = tune.lines[lineIndex];
    if (line.staff!.some((staff, index) => 'meter' in staff || header(staff) !== headers[index])) return undefined;
    const chunks: abcjs.VoiceItem[][][] = [];
    for (const [lane, voice] of lanes(line).entries()) {
      if (!stem(voice[0], lane)) return undefined;
      const bars: abcjs.VoiceItem[][] = [];
      let pending: abcjs.VoiceItem[] = [voice[0]];
      for (const event of voice.slice(1)) {
        const fragment = fragments.length + bars.length;
        if (!event || !['note', 'bar'].includes(event.el_type) &&
          !(pending.length === 1 && SOURCE_STEM_REPEATS.has(fragment) && stem(event, lane))) return undefined;
        pending.push(event);
        if (event.el_type === 'bar') {
          if ((pending[1]?.el_type === 'stem') !== SOURCE_STEM_REPEATS.has(fragment)) return undefined;
          bars.push(pending); pending = [voice[0]];
        }
      }
      if (pending.length !== 1 || ![1, 2].includes(bars.length)) return undefined;
      chunks.push(bars);
    }
    if (chunks.some(bars => bars.length !== chunks[0].length)) return undefined;
    const group = chunks[0].map((_, index) => fragments.length + index);
    groups.push(group);
    group.forEach((_, index) => fragments.push(withVoices(line, chunks.map(bars => bars[index]))));
  }
  if (!validLegacyGroups(groups) || expected && (!validLegacyGroups(expected) || JSON.stringify(groups) !== JSON.stringify(expected))) return undefined;
  const suffix = lanes(fragments[1]);
  for (let lane = 0; lane < 4; lane++) {
    const left = prefix[lane], right = suffix[lane];
    if (left.length !== (lane === 0 ? 6 : 5) || right.length !== 4 ||
      !stem(left[0], lane) || !stem(right[0], lane) || right.at(-1)?.el_type !== 'bar' ||
      left.filter(event => event.el_type === 'tempo').length !== (lane === 0 ? 1 : 0) ||
      (lane === 0 && left[1].el_type !== 'tempo')) return undefined;
    const a = left.slice(lane === 0 ? 2 : 1) as Event[], b = right.slice(1, -1) as Event[];
    if (a.some(event => event.el_type !== 'note' || event.duration !== 0.125) ||
      b.some(event => event.el_type !== 'note' || event.duration !== 0.25)) return undefined;
    // Exactly beat 2: all five authored rows end words, with two real notes
    // remaining per lane. Source naturals are wholly before this boundary.
    if (lane === 0 && (a.at(-1)?.lyric?.length !== 5 || b[0].lyric?.length !== 5 ||
      a.at(-1)!.lyric!.some(row => row.divider !== ' ' || !row.syllable.trim()) ||
      b[0].lyric!.some(row => !row.syllable.trim() || /[_*]/.test(row.syllable)))) return undefined;
  }
  const merged = withVoices(first, prefix.map((voice, lane) => [...voice, ...suffix[lane].slice(1)]));
  const whole = { ...tune, lines: [merged, ...fragments.slice(2)] };
  const score = readHeKeepsDefaultIdentity(whole, parser);
  return score && JSON.stringify(score.systems) === SINGLETONS ? { whole, score, ...mapping(groups) } : undefined;
}

/** Undo only the two exact display splits for the inherited source audit.
 * The temporary view shares every source event; no sounding or lyric event is
 * copied, removed, or rewritten, including the authored a-cross hyphen. */
function audit(tune: Tune, parser: string, expected?: HeKeepsDefaultFragmentGroups) {
  if (!expected || !cadencePlan(expected)) return auditLegacy(tune, parser, expected);
  if (!list(tune.lines) || tune.lines.length !== expected.length || tune.lines.some(line =>
    !line || Object.keys(line).some(key => !['staff', 'staffGroup'].includes(key) || line[key as keyof typeof line] === undefined) ||
    !list(line.staff) || line.staff.length !== 2 || line.staff.some(staff =>
      !staff || !list(staff.voices) || staff.voices.length !== 2 || staff.voices.some(voice => !list(voice))))) return undefined;
  const lines = [...tune.lines], legacy = expected.map(group => group.filter(Number.isInteger));
  for (const fragment of [3, 7]) {
    const suffixIndex = expected.findIndex(group => group.includes(fragment + 0.5));
    if (suffixIndex < 0) continue;
    const prefixIndex = suffixIndex - 1, prefix = lines[prefixIndex], suffix = lines[suffixIndex];
    if (!prefix?.staff || !suffix?.staff || prefix.staff.length !== 2 || suffix.staff.length !== 2 ||
      prefix.staff.some((staff, index) => 'meter' in staff || 'meter' in suffix.staff![index] ||
        !header(staff) || header(staff) !== header(suffix.staff![index]))) return undefined;
    const left = lanes(prefix), right = lanes(suffix);
    if (left.length !== 4 || right.length !== 4) return undefined;
    const joined: abcjs.VoiceItem[][] = [], remainder: abcjs.VoiceItem[][] = [];
    for (let lane = 0; lane < 4; lane++) {
      const a = left[lane], b = right[lane], end = b.findIndex(event => event.el_type === 'bar');
      if (a.length !== 5 || end !== 3 || !stem(a[0], lane) || !stem(b[0], lane) ||
        a.slice(1).some(event => event.el_type !== 'note' || (event as Event).duration !== 0.125) ||
        b.slice(1, end).some(event => event.el_type !== 'note' || (event as Event).duration !== 0.25)) return undefined;
      if (lane === 0) {
        const last = a[4] as Event, next = b[1] as Event;
        if (last.lyric?.length !== 5 || next.lyric?.length !== 5 ||
          last.lyric.some((row, index) => !row.syllable.trim() ||
            row.divider !== (fragment === 3 && index === 3 ? '-' : ' ')) ||
          next.lyric.some(row => !row.syllable.trim() || /[_*]/.test(row.syllable))) return undefined;
      }
      joined.push([...a, ...b.slice(1, end + 1)]);
      remainder.push([b[0], ...b.slice(end + 1)]);
    }
    lines[prefixIndex] = withVoices(prefix, joined);
    lines[suffixIndex] = withVoices(suffix, remainder);
  }
  const result = auditLegacy({ ...tune, lines }, parser, legacy);
  return result ? { ...result, ...mapping(expected) } : undefined;
}

/** Geometry uses original event references and the ACTUAL displayed groups.
 * Repeated source unit 0 denotes two fragments, not an extra source bar. */
export function readHeKeepsDefaultProjection(tune: Tune, parser: string, groups?: HeKeepsDefaultFragmentGroups) {
  try {
    const result = audit(tune, parser, groups);
    return result ? { ...result.score, systems: result.systems,
      fragmentSystems: result.fragmentSystems, fragmentToSystem: result.fragmentToSystem } : undefined;
  } catch { return undefined; }
}

/** Only a newly parsed, source-qualified singleton Tune may be changed. The
 * caller owns parseOnly and afterParsing; no live render or native cache is
 * cloned. Optional plans may undo admitted joins, never add different ones. */
export function projectHeKeepsDefault(tune: Tune, parser: string,
  groups: HeKeepsDefaultFragmentGroups = HE_KEEPS_DEFAULT_FRAGMENT_GROUPS) {
  if (!validGroups(groups)) return undefined;
  const plan = groups.map(group => [...group]);
  const before = readHeKeepsDefaultIdentity(tune, parser);
  if (!before || JSON.stringify(before.systems) !== SINGLETONS || tune.engraver ||
    tune.lines.some((line, index) => 'staffGroup' in line || line.staff!.some(staff =>
      index > 0 && 'meter' in staff || [staff.clef, staff.key, staff.meter].some(value => value && 'abselem' in value)) ||
      lanes(line).some(voice => voice.some(event => 'abselem' in event)))) return undefined;
  const original = tune.lines, first = original[0];
  const prefix = withVoices(first, [[], [], [], []]);
  const suffix = { ...first, staff: first.staff!.map(staff => {
    const copy = { ...staff, clef: { ...staff.clef! }, key: { ...staff.key!,
      accidentals: staff.key!.accidentals?.map(accidental => ({ ...accidental })) }, voices: [] as abcjs.VoiceItem[][] };
    delete copy.meter;
    return copy;
  }) };
  for (let lane = 0; lane < 4; lane++) {
    const voice = lanes(first)[lane];
    const moved = new Set<abcjs.VoiceItem>(voice.filter(event => event.el_type === 'note').slice(0, 4));
    prefix.staff![lane >> 1].voices![lane % 2] = voice.filter(event => event.el_type === 'stem' || event.el_type === 'tempo' || moved.has(event));
    suffix.staff[lane >> 1].voices.push(voice.filter(event => event.el_type === 'stem' ||
      (event.el_type !== 'tempo' && !moved.has(event))).map(event => event.el_type === 'stem' ? { ...event } : event));
  }
  const fragments = [prefix, suffix, ...original.slice(1)];
  for (const fragment of [3, 7]) {
    if (!plan.some(group => group.includes(fragment + 0.5))) continue;
    const line = fragments[fragment];
    fragments[fragment] = withVoices(line, lanes(line).map(voice => voice.slice(0, 5)));
    const continuation = withVoices(line, lanes(line).map(voice => [{ ...voice[0] }, ...voice.slice(5)]));
    // Each newly engraved header owns its cache; source events alone retain
    // shared identity. Never alias header abselem caches across systems.
    continuation.staff = continuation.staff!.map(staff => ({ ...staff,
      clef: { ...staff.clef! }, key: { ...staff.key!,
        accidentals: staff.key!.accidentals?.map(accidental => ({ ...accidental })) } }));
    fragments[fragment + 0.5] = continuation;
  }
  tune.lines = plan.map(group => group.length === 1 ? fragments[group[0]] : withVoices(fragments[group[0]],
    lanes(fragments[group[0]]).map((voice, lane) => [...voice, ...lanes(fragments[group[1]])[lane].slice(1)])));
  const result = readHeKeepsDefaultProjection(tune, parser, plan);
  if (!result || result.signature !== before.signature) { tune.lines = original; return undefined; }
  return {
    ...mapping(plan),
    read: () => readHeKeepsDefaultProjection(tune, parser, plan),
    recomposed: () => { try { return audit(tune, parser, plan)?.whole; } catch { return undefined; } },
  };
}
