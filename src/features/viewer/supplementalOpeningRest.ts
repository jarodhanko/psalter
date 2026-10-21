/** Display-only projection for two signed supplemental-voice editions. */
import type abcjs from 'abcjs';
import { readHidethOpeningIdentity } from './hidethOpeningSource';
import { readGodLeadsOpeningIdentity } from './godLeadsOpeningSource';

type Tune = abcjs.TuneObject;
type Event = abcjs.AbcElem;
type Note = Event & abcjs.VoiceItemNote;
type Parent = Readonly<{ voice: 1 | 3; event: Note; span: readonly [number, number];
  interval: readonly [number, number] }>;
export type SupplementalOpeningRestPlan = Readonly<{
  cut: { beat: number; duration: number; moves: string[][] };
  parents: readonly Parent[];
}>;
type Fragment = Readonly<{ parent: Parent; line: 0 | 1; interval: readonly [number, number]; event: Note }>;
type Absolute = { abcelem?: Event; type?: string; duration?: number; heads?: unknown[]; children?: unknown[]; elemset?: unknown[] };
type Phase = 'parsed' | 'measured' | 'engraved';
const DERIVED = ['abselem', 'averagepitch', 'minpitch', 'maxpitch'];
const key = (event: Event) => `${event.el_type}:${event.startChar}:${event.endChar}`;
const voices = (tune: Pick<Tune, 'lines'>, line: number) => tune.lines[line].staff!.flatMap(staff => staff.voices!);
const same = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const frozen = (value: unknown): boolean => !value || typeof value !== 'object' ||
  Object.isFrozen(value) && Object.values(value).every(frozen);

/** One exact cut per edition. Whole supplemental rests move intact; only the
 * signed lane-3 x6 is segmented. No new barline, note, lyric or source token. */
export function planSupplementalOpeningRest(frame: Pick<Tune, 'lines'>, parser: string,
  song: 'hideth' | 'god-leads'): SupplementalOpeningRestPlan | undefined {
  if (!['hideth', 'god-leads'].includes(song) || !frozen(frame)) return;
  const hideth = song === 'hideth';
  const score = (hideth ? readHidethOpeningIdentity : readGodLeadsOpeningIdentity)(frame as Tune, parser);
  if (!score || !same(score.systems.slice(0, 2), [[0], [1]])) return;
  const duration = hideth ? 0.375 : 0.25, count = hideth ? 3 : 2;
  const moves: string[][] = [[], [], [], []], parents: Parent[] = [];
  const fields = ['duration', 'el_type', 'endChar', ...(hideth ? [] : ['positioning']), 'rest', 'startChar'];
  const rest = (event: Note, voice: number, token: string, length: number) =>
    !!event && same(Object.keys(event).sort(), fields) && event.duration === length &&
    same(event.rest, { type: 'invisible' }) &&
    (hideth || same(event.positioning, { vocalPosition: voice === 1 ? 'below' : 'above' })) &&
    Number.isInteger(event.startChar) && Number.isInteger(event.endChar) &&
    event.startChar! >= 0 && event.endChar! > event.startChar! && event.endChar! <= parser.length &&
    parser.slice(event.startChar, event.endChar).trim() === token;
  for (const [voice, lane] of voices(frame, 1).entries()) {
    const notes = lane.filter((event): event is Note => event.el_type === 'note');
    if (lane.some(event => !['stem', 'note', 'bar'].includes(event.el_type)) ||
      notes.some(event => typeof event.duration !== 'number' || !Number.isFinite(event.duration) || event.duration <= 0)) return;
    if (voice === 1 || voice === 3) {
      const pickup = voices(frame, 0)[voice].filter((event): event is Note => event.el_type === 'note');
      // God Leads' lane-1 pickup is a signed sounding E, never segmented.
      if (pickup.length !== 1 || pickup[0].duration !== 0.125 ||
        ((hideth || voice === 3) && !rest(pickup[0], voice, 'x', 0.125))) return;
      const tokens = voice === 3 ? ['x6'] : hideth ? ['x3'] : ['x3/2', 'x1/2'];
      const lengths = voice === 3 ? [0.75] : hideth ? [0.375] : [0.1875, 0.0625];
      if (voice === 3 && notes.length !== 1) return;
      let onset = 0.125;
      for (const [index, token] of tokens.entries()) {
        const event = notes[index];
        if (!rest(event, voice, token, lengths[index])) return;
        parents.push(Object.freeze({ voice, event, span: Object.freeze([event.startChar!, event.endChar!] as const),
          interval: Object.freeze([onset, onset + lengths[index]] as const) }));
        onset += lengths[index];
      }
      moves[voice] = notes.slice(0, tokens.length).map(key);
      continue;
    }
    if (notes.some(event => event.rest || !event.pitches?.length || event.gracenotes?.length ||
      event.startTriplet || event.endTriplet || event.tripletMultiplier || event.decoration?.length ||
      event.chord?.length || event.startSlur || event.endSlur ||
      event.pitches.some(pitch => pitch.accidental || pitch.startTie || pitch.endTie || pitch.startSlur || pitch.endSlur)) ||
      notes.slice(0, count).reduce((sum, event) => sum + event.duration!, 0) !== duration ||
      notes.length - count < 2) return;
    let open = false;
    for (const [index, note] of notes.entries()) {
      if ((note.startBeam !== undefined && note.startBeam !== true) || (note.endBeam !== undefined && note.endBeam !== true) ||
        (index < count && (note.startBeam || note.endBeam)) || (index === count && open) ||
        (note.startBeam && open) || (note.endBeam && !open && !note.startBeam)) return;
      if (note.startBeam) open = true;
      if (note.endBeam) open = false;
    }
    if (open) return;
    if (voice === 0) {
      const last = notes[count - 1], next = notes[count], suffix = notes.slice(count);
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
  return Object.freeze({ cut: { beat: duration * 8, duration, moves }, parents: Object.freeze(parents) });
}

/** Local materialization only. The frozen canonical events remain unsegmented. */
export function projectSupplementalOpeningRest(tune: Tune, plan: SupplementalOpeningRestPlan) {
  const fragments: Fragment[] = [];
  const first = voices(tune, 0), second = voices(tune, 1);
  for (const parent of plan.parents) {
    const lane = second[parent.voice];
    const index = lane.findIndex(raw => key(raw as Event) === key(parent.event));
    const original = lane[index] as Note | undefined;
    if (!original || !same(original, parent.event)) throw new Error('Unknown supplemental-rest parent');
    const end = parent.interval[1], cut = parent.interval[0] + plan.cut.duration;
    for (const line of (parent.voice === 3 ? [0, 1] : [0]) as (0 | 1)[]) {
      const interval = parent.voice === 3 ? [line === 0 ? parent.interval[0] : cut, line === 0 ? cut : end] as const : parent.interval;
      const event: Note = parent.voice === 3 ? { ...original, rest: { ...original.rest! },
        ...(original.positioning && { positioning: { ...original.positioning } }), duration: interval[1] - interval[0] } : original;
      fragments.push(Object.freeze({ parent, line, interval: Object.freeze(interval), event }));
      if (parent.voice === 3) {
        if (line === 0) first[3].push(event);
        else lane.splice(index, 1, event);
      }
    }
  }
  for (const voice of [0, 1, 2]) {
    const selected = new Set(plan.cut.moves[voice]);
    const moved = second[voice].filter(event => selected.has(key(event as Event)));
    const prefix = second[voice].filter(event => event.el_type === 'note').slice(0, selected.size);
    if (moved.length !== selected.size || !moved.length || moved.some((event, index) => event !== prefix[index]))
      throw new Error('Unknown supplemental prefix');
    first[voice].push(...moved);
    second[voice].splice(0, second[voice].length, ...second[voice].filter(event => !selected.has(key(event as Event))));
  }
  Object.freeze(fragments);
  return {
    /** Prove raw fragments, interval partition and native no-ink ownership
     * before returning one logical event per signed source rest. */
    collapse(phase: Phase): Tune | undefined {
      if (fragments.length !== plan.parents.length + 1 || new Set(fragments.map(item => item.event)).size !== fragments.length) return;
      const found = new Map<Fragment, readonly [number, number]>(), owned = new Map<Fragment, Absolute>();
      const onsets = [0, 0, 0, 0];
      for (let line = 0; line < tune.lines.length; line++) {
        if (tune.lines[line].staff?.length !== 2 || tune.lines[line].staff!.some(staff => staff.voices?.length !== 2)) return;
        const native = (tune.lines[line] as unknown as { staffGroup?: { voices?: { children?: Absolute[] }[] } }).staffGroup?.voices;
        if (phase !== 'parsed' && native?.length !== 4) return;
        for (const [voice, lane] of voices(tune, line).entries()) {
          for (const raw of lane) {
            const event = raw as Event;
            const fragment = fragments.find(item => item.event === event);
            const parent = plan.parents.find(item => item.span[0] === event.startChar && item.span[1] === event.endChar);
            if (parent && (!fragment || fragment.parent !== parent)) return;
            const duration = event.el_type === 'note' ? event.duration : 0;
            if (typeof duration !== 'number' || !Number.isFinite(duration) || (event.el_type === 'note' && duration <= 0)) return;
            if (fragment) {
              if (found.has(fragment) || voice !== fragment.parent.voice || line !== fragment.line || event.el_type !== 'note') return;
              found.set(fragment, [onsets[voice], onsets[voice] + duration]);
            }
            onsets[voice] += duration;
          }
          if (phase !== 'parsed') for (const absolute of native![voice].children ?? []) {
            const fragment = fragments.find(item => item.event === absolute.abcelem);
            if (!fragment) continue;
            if (owned.has(fragment) || fragment.line !== line || fragment.parent.voice !== voice) return;
            owned.set(fragment, absolute);
          }
        }
      }
      if (found.size !== fragments.length) return;
      for (const parent of plan.parents) {
        const parts = fragments.filter(fragment => fragment.parent === parent);
        if (parts.length !== (parent.voice === 3 ? 2 : 1) ||
          parts[0].interval[0] !== parent.interval[0] || parts.at(-1)!.interval[1] !== parent.interval[1] ||
          parts.some((part, index) => index && parts[index - 1].interval[1] !== part.interval[0]) ||
          parts.reduce((sum, fragment) => sum + fragment.event.duration!, 0) !== parent.event.duration) return;
        for (const fragment of parts) {
          const { event, interval } = fragment;
          if (!same(found.get(fragment), interval) || interval[0] >= interval[1] ||
            event.duration !== interval[1] - interval[0] ||
            !same(Object.keys(event).filter(field => !DERIVED.includes(field)).sort(), Object.keys(parent.event).sort()) ||
            !Object.keys(parent.event).every(field => field === 'duration' ||
              same(event[field as keyof Event], parent.event[field as keyof Event]))) return;
          const derived = event as Event & { averagepitch?: number; minpitch?: number; maxpitch?: number };
          for (const field of ['averagepitch', 'minpitch', 'maxpitch'] as const)
            if ((phase !== 'parsed' || field in derived) && derived[field] !== 3) return;
          if (phase === 'parsed') { if ('abselem' in event) return; continue; }
          const absolute = owned.get(fragment);
          if (!absolute || absolute.type !== 'rest' || absolute.duration !== event.duration ||
            absolute.heads?.length !== 0 || absolute.children?.length !== 0 ||
            (phase === 'engraved' ? event.abselem !== absolute || absolute.elemset?.length !== 0 :
              event.abselem !== undefined || (absolute.elemset !== undefined && absolute.elemset.length !== 0))) return;
        }
      }
      const lines = tune.lines.map(line => ({ ...line, staff: line.staff!.map(staff => ({ ...staff,
        voices: staff.voices!.map(lane => lane.flatMap<abcjs.VoiceItem>(raw => {
          const fragment = fragments.find(item => item.event === raw);
          if (!fragment || fragment.parent.voice !== 3) return [raw];
          return fragment.line === 0 ? [{ ...(raw as Note), duration: fragment.parent.event.duration }] : [];
        })),
      })) }));
      return { ...tune, lines };
    },
  };
}
