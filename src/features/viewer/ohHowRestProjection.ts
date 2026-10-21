/** Exact HTG display projection. No ABC rewrite, audio owner or general rest support. */
import type abcjs from 'abcjs';
import { readOhHowOpeningIdentity } from './ohHowOpeningSource';

type Tune = abcjs.TuneObject;
type Event = abcjs.AbcElem;
type Note = Event & abcjs.VoiceItemNote;
type Cut = { beat: number; duration: number; moves: string[][] };
type Parent = Readonly<{ voice: 1 | 3; sourceVoice: '12' | '22'; event: Note;
  span: readonly [number, number]; interval: readonly [number, number] }>;
export type OhHowRestPlan = Readonly<{ cut: Cut; parents: readonly Parent[] }>;
type Fragment = Readonly<{ parent: Parent; ordinal: 0 | 1; interval: readonly [number, number]; event: Note }>;
type Phase = 'parsed' | 'measured' | 'engraved';
const BASE_FIELDS = ['duration', 'el_type', 'endChar', 'positioning', 'rest', 'startChar'];
const DERIVED = ['abselem', 'averagepitch', 'minpitch', 'maxpitch'];
const key = (event: Event) => `${event.el_type}:${event.startChar}:${event.endChar}`;
const voices = (tune: Pick<Tune, 'lines'>, line: number) => tune.lines[line].staff!.flatMap(staff => staff.voices!);
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);

/** The signed edition has two chordal active lanes and two supplemental silent
 * lanes here. Only the natural 3/8 boundary is considered, never enumerated. */
export function planOhHowRestProjection(frame: Pick<Tune, 'lines'>, parser: string): OhHowRestPlan | undefined {
  const score = readOhHowOpeningIdentity(frame as Tune, parser);
  if (!score || !same(score.systems.slice(0, 2), [[0], [1]])) return;
  const moves: string[][] = [[], [], [], []];
  const parents: Parent[] = [];
  for (const [voice, lane] of voices(frame, 1).entries()) {
    const notes = lane.filter((event): event is Note => event.el_type === 'note');
    if (lane.some(event => !['stem', 'note', 'bar'].includes(event.el_type))) return;
    if (voice === 1 || voice === 3) {
      const parent = notes[0];
      if (notes.length !== 1 || !parent || !Object.isFrozen(parent) ||
        !same(Object.keys(parent).sort(), BASE_FIELDS) || parent.duration !== 0.75 ||
        !same(parent.rest, { type: 'invisible' }) || !same(parent.positioning, { vocalPosition: voice === 1 ? 'below' : 'above' }) ||
        !Number.isInteger(parent.startChar) || !Number.isInteger(parent.endChar) ||
        !/^\s*x6\s*$/.test(parser.slice(parent.startChar, parent.endChar))) return;
      const pickup = voices(frame, 0)[voice].filter(event => event.el_type === 'note');
      if (pickup.length !== 1 || pickup[0].duration !== 0.125 || pickup[0].rest?.type !== 'invisible') return;
      parents.push(Object.freeze({ voice, sourceVoice: voice === 1 ? '12' : '22', event: parent,
        span: Object.freeze([parent.startChar!, parent.endChar!] as const), interval: Object.freeze([0.125, 0.875] as const) }));
      moves[voice] = [key(parent)];
      continue;
    }
    if (notes.some(event => event.rest || !event.pitches?.length || event.gracenotes?.length ||
      event.startTriplet || event.endTriplet || event.tripletMultiplier || event.decoration?.length ||
      event.chord?.length || event.startSlur || event.endSlur ||
      event.pitches?.some(pitch => pitch.accidental || pitch.startTie || pitch.endTie || pitch.startSlur || pitch.endSlur))) return;
    let duration = 0, count = 0;
    while (count < notes.length && duration < 0.375) {
      if (typeof notes[count].duration !== 'number') return;
      duration += notes[count++].duration!;
    }
    if (duration !== 0.375 || count !== 2) return;
    let open = false;
    for (const [index, note] of notes.entries()) {
      if ((note.startBeam !== undefined && note.startBeam !== true) || (note.endBeam !== undefined && note.endBeam !== true) ||
        (index < count && (note.startBeam || note.endBeam)) || (index === count && open) ||
        (note.startBeam && open) || (note.endBeam && !open && !note.startBeam)) return;
      if (note.startBeam) open = true;
      if (note.endBeam) open = false;
    }
    if (open) return;
    const last = notes[count - 1], next = notes[count], suffix = notes.slice(count);
    // Count attacks, not doubled chord heads. Silent lanes are proven above.
    if (suffix.length < 2) return;
    if (last.lyric || next.lyric) {
      if (last.lyric?.length !== 4 || next.lyric?.length !== 4 ||
        last.lyric.some(row => row.divider !== ' ' || !row.syllable.trim()) ||
        next.lyric.some(row => !row.syllable.trim() || /[_*]/.test(row.syllable)) ||
        Array.from({ length: 4 }, (_, row) => suffix.filter(event => {
          const text = event.lyric?.[row]?.syllable;
          return text?.trim() && !/[_*]/.test(text);
        }).length).some(count => count < 2)) return;
    }
    moves[voice] = notes.slice(0, count).map(key);
  }
  if (parents.length !== 2 || parents[0].voice !== 1 || parents[1].voice !== 3) return;
  return Object.freeze({ cut: { beat: 3, duration: 0.375, moves }, parents: Object.freeze(parents) });
}

/** All bookkeeping is local to this materialization. Canonical session data
 * remains frozen and unsegmented; nothing is attached to events or cached. */
export function projectOhHowRests(tune: Tune, plan: OhHowRestPlan) {
  const fragments: Fragment[] = [];
  const first = voices(tune, 0), second = voices(tune, 1);
  for (const parent of plan.parents) {
    const lane = second[parent.voice];
    const index = lane.findIndex(raw => key(raw as Event) === key(parent.event));
    const original = lane[index] as Note | undefined;
    if (!original || !same(original, parent.event)) throw new Error('Unknown invisible-rest parent');
    const pair = ([0, 1] as const).map(ordinal => {
      const event: Note = { ...original, rest: { ...original.rest! }, positioning: { ...original.positioning }, duration: 0.375 };
      const fragment: Fragment = Object.freeze({ parent, ordinal,
        interval: Object.freeze([0.125 + ordinal * 0.375, 0.5 + ordinal * 0.375] as const), event });
      fragments.push(fragment);
      return event;
    });
    lane.splice(index, 1, pair[1]);
    first[parent.voice].push(pair[0]);
  }
  for (const voice of [0, 2]) {
    const selected = new Set(plan.cut.moves[voice]);
    const moved = second[voice].filter(event => selected.has(key(event as Event)));
    if (moved.length !== 2 || moved.length !== selected.size) throw new Error('Unknown pitched prefix');
    first[voice].push(...moved);
    second[voice].splice(0, second[voice].length, ...second[voice].filter(event => !selected.has(key(event as Event))));
  }
  Object.freeze(fragments);
  return {
    /** Prove every raw fragment before the canonical view hides any of them.
     * Return live pitched objects and one logical no-ink parent per pair. */
    collapse(phase: Phase): Tune | undefined {
      if (fragments.length !== 4 || new Set(fragments.map(item => item.event)).size !== 4) return;
      const found = new Map<Fragment, { line: number; voice: number; start: number; end: number }>();
      const onsets = [0, 0, 0, 0];
      for (let line = 0; line < tune.lines.length; line++) {
        if (tune.lines[line].staff?.length !== 2 || tune.lines[line].staff!.some(staff => staff.voices?.length !== 2)) return;
        for (const [voice, lane] of voices(tune, line).entries()) for (const raw of lane) {
          const event = raw as Event;
          const fragment = fragments.find(item => item.event === event);
          const parent = plan.parents.find(item => item.span[0] === event.startChar && item.span[1] === event.endChar);
          if (parent && (!fragment || fragment.parent !== parent)) return;
          if (fragment) {
            if (found.has(fragment) || voice !== fragment.parent.voice || line !== fragment.ordinal || event.el_type !== 'note') return;
            found.set(fragment, { line, voice, start: onsets[voice], end: onsets[voice] + (event.duration as number) });
          }
          if (event.el_type === 'note') {
            if (typeof event.duration !== 'number' || !Number.isFinite(event.duration) || event.duration <= 0) return;
            onsets[voice] += event.duration;
          }
        }
      }
      if (found.size !== 4) return;
      for (const parent of plan.parents) {
        const pair = fragments.filter(fragment => fragment.parent === parent);
        if (pair.length !== 2 || pair[0].ordinal !== 0 || pair[1].ordinal !== 1 ||
          pair[0].interval[0] !== parent.interval[0] || pair[0].interval[1] !== pair[1].interval[0] ||
          pair[1].interval[1] !== parent.interval[1] ||
          pair.reduce((sum, fragment) => sum + fragment.event.duration!, 0) !== parent.event.duration) return;
        for (const fragment of pair) {
          const { event, interval, ordinal } = fragment;
          const position = found.get(fragment)!;
          if (position.start !== interval[0] || position.end !== interval[1] || interval[0] >= interval[1] ||
            event.duration !== interval[1] - interval[0] ||
            !same(Object.keys(event).filter(field => !DERIVED.includes(field)).sort(), BASE_FIELDS) ||
            !Object.keys(parent.event).every(field => field === 'duration' ||
              same(event[field as keyof Event], parent.event[field as keyof Event]))) return;
          const derived = event as Event & { averagepitch?: number; minpitch?: number; maxpitch?: number };
          for (const field of ['averagepitch', 'minpitch', 'maxpitch'] as const)
            if ((phase !== 'parsed' || field in derived) && derived[field] !== 3) return;
          const lane = voices(tune, ordinal)[parent.voice];
          const notes = lane.filter(item => item.el_type === 'note');
          if (ordinal === 0 ? notes.at(-1) !== event : notes[0] !== event) return;
          if (phase === 'parsed') { if ('abselem' in event) return; continue; }
          type Absolute = { abcelem?: Event; type?: string; duration?: number; heads?: unknown[]; children?: unknown[]; elemset?: unknown[] };
          const line = tune.lines[ordinal] as unknown as { staffGroup?: { voices?: { children?: Absolute[] }[] } };
          const owned = line.staffGroup?.voices?.[parent.voice]?.children?.filter(child => child.abcelem === event);
          const absolute = owned?.length === 1 ? owned[0] : undefined;
          if (!absolute || absolute.type !== 'rest' || absolute.duration !== event.duration ||
            absolute.heads?.length !== 0 || absolute.children?.length !== 0 ||
            (phase === 'engraved' ? event.abselem !== absolute || absolute.elemset?.length !== 0 :
              event.abselem !== undefined || (absolute.elemset !== undefined && absolute.elemset.length !== 0))) return;
        }
      }
      const lines = tune.lines.map(line => ({ ...line, staff: line.staff!.map(staff => ({ ...staff,
        voices: staff.voices!.map(lane => lane.flatMap<abcjs.VoiceItem>(raw => {
          const fragment = fragments.find(item => item.event === raw);
          if (!fragment) return [raw];
          return fragment.ordinal === 0 ? [{ ...(raw as Note), duration: fragment.parent.event.duration }] : [];
        })),
      })) }));
      return { ...tune, lines };
    },
  };
}
