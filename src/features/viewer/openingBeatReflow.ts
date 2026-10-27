/** Source-pinned opening beat reflow. Canonical audio, print and export stay separate. */
import abcjs from 'abcjs';
import { ALL_CREATURES_OPENING_ID, hasAllCreaturesOpeningSource, hasAllCreaturesPrefixBeam, readAllCreaturesPrefixBeam } from './allCreaturesOpeningBeatProof';
import { allCreaturesDefaultWrappedNotation, readAllCreaturesGroupingIdentity } from './allCreaturesGroupingWrap';
import type EngraverController from 'abcjs/src/write/engraver-controller';
import { CHURCH_OPENING_ID, THOUSAND_OPENING_ID, hasHymnOpeningSource, hymnOpeningWrappedNotation, readHymnOpeningIdentity } from './hymnOpeningSource';
import { OH_HOW_OPENING_ID, hasOhHowOpeningSource, ohHowOpeningWrappedNotation, readOhHowOpeningIdentity } from './ohHowOpeningSource';
import { planOhHowRestProjection, projectOhHowRests } from './ohHowRestProjection';
import { planSupplementalOpeningRest, projectSupplementalOpeningRest } from './supplementalOpeningRest';
import { HIDETH_OPENING_ID, hasHidethOpeningSource, hidethOpeningWrappedNotation, readHidethOpeningIdentity } from './hidethOpeningSource';
import { GOD_LEADS_OPENING_ID, hasGodLeadsOpeningSource, godLeadsOpeningWrappedNotation, readGodLeadsOpeningIdentity } from './godLeadsOpeningSource';
import { HE_LEADETH_OPENING_ID, hasHeLeadethOpeningSource, heLeadethOpeningWrappedNotation, readHeLeadethOpeningIdentity } from './heLeadethOpeningSource';
import { hasPsalterGroupedOpeningSource, psalter50WrappedNotation, psalter47WrappedNotation, psalter44WrappedNotation, readPsalter44OpeningIdentity } from './psalter47OpeningWrap';
import { hasPsalter46OpeningSource, psalter46WrappedNotation } from './psalter46OpeningWrap';
import { PSALTER39_OPENING_ID, hasPsalter39OpeningSource, psalter39WrappedNotation, readPsalter39OpeningIdentity } from './psalter39OpeningSource';
import { PSALTER47_GROUPED_ID, readPsalter47OpeningIdentity, hasPsalter47LyricBoundary, readPsalter47NativeContinuation } from './psalter47LyricContinuation';
import { PSALTER46_LYRIC_ID, readPsalter46OpeningIdentity, hasPsalter46LyricBoundary, readPsalter46NativeContinuation } from './psalter46LyricContinuation';
import { SAVIORS_LOVE_OPENING_ID, hasSaviorsLoveOpeningSource, saviorsLoveOpeningWrappedNotation, readSaviorsLoveOpeningIdentity } from './saviorsLoveOpeningSource';
import { hasSaviorsLoveLyricBoundary, readSaviorsLoveNativeContinuation } from './saviorsLoveLyricContinuation';
import { MIGHTY_FORTRESS_OPENING_ID, hasMightyFortressOpeningSource, mightyFortressOpeningWrappedNotation, readMightyFortressOpeningIdentity } from './mightyFortressOpeningSource';
import { hasMightyFortressBeatBoundary, isMightyFortressSuffixAccidental, readMightyFortressNativeContinuation, readMightyFortressNativeSuffix, sameMightyFortressNativeSuffix } from './mightyFortressBeatProof';
import { readScreenScoreIdentity, readScreenScoreGeometry, sameScreenScoreGeometry, normalizeScreenCandidateViewport } from './isolatedChordWrap';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import type { HymnOpeningSettings } from './hymnOpeningWrap';

export { PSALTER47_GROUPED_ID, ALL_CREATURES_OPENING_ID, HIDETH_OPENING_ID, GOD_LEADS_OPENING_ID, MIGHTY_FORTRESS_OPENING_ID, CHURCH_OPENING_ID, HE_LEADETH_OPENING_ID, OH_HOW_OPENING_ID, PSALTER39_OPENING_ID, PSALTER46_LYRIC_ID, SAVIORS_LOVE_OPENING_ID, THOUSAND_OPENING_ID };
const ATTRIBUTE = 'data-opening-beat-reflow';
export function clearOpeningBeatReflow(host: HTMLElement | null) { host?.removeAttribute(ATTRIBUTE); }
export const PSALTER_BEAT_ID = 'psalter50';
export const PSALTER44_GROUPED_ID = 'psalter44';
// Only these exact-source profiles may split the opening measure.
function profile(song: string) {
  if (song === PSALTER44_GROUPED_ID) return {
    source: (source: string) => hasPsalterGroupedOpeningSource(song, source),
    parser: psalter44WrappedNotation, read: readPsalter44OpeningIdentity,
    numerator: 3, denominator: 4, stanzasPerGroup: 1, lyricRows: 1, suffixBeam: false,
    grouped: true, usefulRemainder: true,
  };
  if (song === PSALTER47_GROUPED_ID) return {
    source: (source: string) => hasPsalterGroupedOpeningSource(song, source),
    parser: psalter47WrappedNotation, read: readPsalter47OpeningIdentity,
    numerator: 3, denominator: 4, stanzasPerGroup: 5, lyricRows: 5, suffixBeam: false,
    grouped: true, usefulRemainder: true,
    lyricContinuation: { boundary: hasPsalter47LyricBoundary, read: readPsalter47NativeContinuation },
  };
  if (song === ALL_CREATURES_OPENING_ID) return {
    source: hasAllCreaturesOpeningSource, parser: allCreaturesDefaultWrappedNotation, read: readAllCreaturesGroupingIdentity,
    numerator: 6, denominator: 4, stanzasPerGroup: 5, lyricRows: 5, suffixBeam: false, reviewedUnderlay: true,
    prefixBeam: { boundary: hasAllCreaturesPrefixBeam, read: readAllCreaturesPrefixBeam },
  };
  if (song === HIDETH_OPENING_ID || song === GOD_LEADS_OPENING_ID) {
    const hideth = song === HIDETH_OPENING_ID;
    return {
      source: (source: string) => hideth ? hasHidethOpeningSource(song, source) : hasGodLeadsOpeningSource(song, source),
      parser: hideth ? hidethOpeningWrappedNotation : godLeadsOpeningWrappedNotation,
      read: hideth ? readHidethOpeningIdentity : readGodLeadsOpeningIdentity,
      numerator: 6, denominator: 8, stanzasPerGroup: 4, lyricRows: 4, suffixBeam: true, usefulRemainder: true,
      supplementalRest: hideth ? 'hideth' as const : 'god-leads' as const,
    };
  }
  if (song === PSALTER39_OPENING_ID) return {
    source: hasPsalter39OpeningSource,
    parser: psalter39WrappedNotation,
    read: readPsalter39OpeningIdentity,
    numerator: 6, denominator: 4, stanzasPerGroup: 4, lyricRows: 4, suffixBeam: false, usefulRemainder: true,
  };
  if (song === MIGHTY_FORTRESS_OPENING_ID) return {
    source: (source: string) => hasMightyFortressOpeningSource(song, source),
    parser: mightyFortressOpeningWrappedNotation,
    read: readMightyFortressOpeningIdentity,
    numerator: 4, denominator: 4, stanzasPerGroup: 4, lyricRows: 4, suffixBeam: true, usefulRemainder: true,
    lyricContinuation: { boundary: hasMightyFortressBeatBoundary, read: readMightyFortressNativeContinuation },
    suffixAccidental: { allows: isMightyFortressSuffixAccidental, read: readMightyFortressNativeSuffix, same: sameMightyFortressNativeSuffix },
  };
  if (song === PSALTER46_LYRIC_ID) return {
    source: hasPsalter46OpeningSource,
    parser: psalter46WrappedNotation,
    read: readPsalter46OpeningIdentity,
    numerator: 4, denominator: 4, stanzasPerGroup: 4, lyricRows: 4, suffixBeam: false, usefulRemainder: true,
    lyricContinuation: { boundary: hasPsalter46LyricBoundary, read: readPsalter46NativeContinuation },
  };
  if (song === SAVIORS_LOVE_OPENING_ID) return {
    source: (source: string) => hasSaviorsLoveOpeningSource(song, source),
    parser: saviorsLoveOpeningWrappedNotation,
    read: readSaviorsLoveOpeningIdentity,
    numerator: 4, denominator: 4, stanzasPerGroup: 1, lyricRows: 4, suffixBeam: false, usefulRemainder: true,
    lyricContinuation: { boundary: hasSaviorsLoveLyricBoundary, read: readSaviorsLoveNativeContinuation },
  };
  // Effective stanza grouping is a settings gate, distinct from the exact
  // authored lyric rows preserved at a cut (ambiguous underlay can retain more).
  if (song === OH_HOW_OPENING_ID) return {
    source: (source: string) => hasOhHowOpeningSource(song, source),
    parser: ohHowOpeningWrappedNotation,
    read: readOhHowOpeningIdentity,
    numerator: 6, denominator: 8, stanzasPerGroup: 1, lyricRows: 4, suffixBeam: true, usefulRemainder: true,
    invisibleRestProjection: true,
  };
  if (song === HE_LEADETH_OPENING_ID) return {
    source: (source: string) => hasHeLeadethOpeningSource(song, source),
    parser: heLeadethOpeningWrappedNotation,
    read: readHeLeadethOpeningIdentity,
    numerator: 4, denominator: 4, stanzasPerGroup: 1, lyricRows: 4, suffixBeam: false, usefulRemainder: true,
  };
  if (song === CHURCH_OPENING_ID) return {
    source: (source: string) => hasHymnOpeningSource(song, source),
    parser: (prepared: string) => hymnOpeningWrappedNotation(song, prepared),
    read: (tune: Tune, parser: string) => readHymnOpeningIdentity(song, tune, parser),
    numerator: 4, denominator: 4, stanzasPerGroup: 5, lyricRows: 5, suffixBeam: false,
  };
  if (song === THOUSAND_OPENING_ID) return {
    source: (source: string) => hasHymnOpeningSource(song, source),
    parser: (prepared: string) => hymnOpeningWrappedNotation(song, prepared),
    read: (tune: Tune, parser: string) => readHymnOpeningIdentity(song, tune, parser),
    numerator: 3, denominator: 2, stanzasPerGroup: 5, lyricRows: 5, suffixBeam: false,
  };
  if (song === PSALTER_BEAT_ID) return {
    source: (source: string) => hasPsalterGroupedOpeningSource(song, source),
    parser: psalter50WrappedNotation,
    read: (tune: Tune, parser: string) => {
      const score = readScreenScoreIdentity(tune, parser);
      // Exact prepared-source gate precedes this reader. Keep every original
      // whole bar and voice witness authoritative, including later accidentals.
      return score && score.meter === 1 && score.units.length === 24 && score.notes.length === 231 &&
        score.units.every((unit, index) => unit.duration === [0.25, 1, 0.75][index % 3]) &&
        [62, 54, 60, 55].every((count, voice) => score.notes.filter(note => note.voice === voice).length === count) &&
        tune.lines.every(line => line.staff?.length === 2 && line.staff.every(staff => {
          const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
          return staff.voices?.length === 2 && group.brace === undefined && group.bracket === undefined && group.connectBarLines === undefined;
        })) && score.notes.every(note => !note.element.rest && note.element.pitches?.length === 1) ? score : undefined;
    },
    numerator: 4, denominator: 4, stanzasPerGroup: 3, lyricRows: 3, suffixBeam: true,
  };
}
type Profile = NonNullable<ReturnType<typeof profile>>;
const ENGINE = 'abcjs-basic v6.7.0';
const EPSILON = 0.05;
type Tune = abcjs.TuneObject;
type Event = abcjs.AbcElem;
type Score = NonNullable<ReturnType<typeof readHymnOpeningIdentity>>;
type Data = Pick<Tune, 'lines' | 'formatting' | 'media' | 'metaText' | 'metaTextInfo' | 'version'>;
type Session = {
  source?: string; signature?: string;
  graph?: { data: Data; events: Readonly<Record<string, Event>>; shared: WeakSet<object> };
};
type Cut = { beat: number; duration: number; moves: string[][]; reason?: string };
export type BeatFrame = { data: Data; signature: string; parser: string; systems: string };
export function newOpeningBeatSession(): Session { return {}; }

/** No functions, DOM, native class instances or cyclic engraving graphs enter
 * this data-only snapshot. Capture is before ABCJS writes abselem/staffGroup. */
function dataCopy<T>(value: T, freeze = false, shared?: WeakSet<object>): T {
  let count = 0;
  const seen = new Set<object>();
  const copy = (item: unknown, depth = 0): unknown => {
    if (++count > 20000 || depth > 32) throw new Error('Unbounded parse snapshot');
    if (item === null || item === undefined || ['string', 'number', 'boolean'].includes(typeof item)) return item;
    // Only exact previously validated, deeply frozen event objects can be shared.
    // Every native materialization omits this set and receives a full deep copy.
    if (freeze && typeof item === 'object' && shared?.has(item!)) return item;
    if (typeof item === 'object') { if (seen.has(item!)) throw new Error('Cyclic parse snapshot'); seen.add(item!); }
    if (Array.isArray(item)) { const result = item.map(child => copy(child, depth + 1)); seen.delete(item); return freeze ? Object.freeze(result) : result; }
    if (typeof item !== 'object' || Object.getPrototypeOf(item) !== Object.prototype) throw new Error('Non-data parse snapshot');
    const result = Object.fromEntries(Object.entries(item).map(([key, child]) => [key, copy(child, depth + 1)]));
    seen.delete(item);
    return freeze ? Object.freeze(result) : result;
  };
  return copy(value) as T;
}
export function captureOpeningBeatFrame(session: Session, tune: Tune, parser: string, prepared: string, song = THOUSAND_OPENING_ID): BeatFrame | undefined {
  const edition = profile(song);
  if (abcjs.signature !== ENGINE || !edition || edition.parser(prepared) !== parser) return;
  const identity = edition.read(tune, parser);
  if (!identity) return;
  try {
    let data: Data;
    if (session.source !== prepared || !session.graph) {
      data = dataCopy({ lines: tune.lines, formatting: tune.formatting, media: tune.media,
        metaText: tune.metaText, metaTextInfo: tune.metaTextInfo, version: tune.version }, true);
      const events: Record<string, Event> = {};
      data.lines.forEach(line => line.staff!.flatMap(staff => staff.voices!).forEach((voice, index) => {
        voice.forEach(raw => { const event = raw as Event; if (event.el_type !== 'stem') events[`${index}:${key(event)}`] = event; });
      }));
      session.source = prepared; session.signature = identity.signature;
      session.graph = { data, events: Object.freeze(events), shared: new WeakSet(Object.values(events)) };
    } else {
      if (session.signature !== identity.signature) return;
      // Reuse immutable canonical events. Current parser supplies only clean
      // display-system headers and real source-event partition, never methods
      // or an already engraved graph. The ephemeral frame is not cached.
      const graph = session.graph;
      const lines = tune.lines.map(line => ({ ...line, staff: line.staff!.map((staff, staffIndex) => ({ ...staff,
        voices: staff.voices!.map((voice, voiceIndex) => voice.map(raw => {
          const event = raw as Event;
          if (event.el_type === 'stem') return raw;
          const saved = graph.events[`${staffIndex * 2 + voiceIndex}:${key(event)}`];
          if (!saved) throw new Error('Unknown canonical source event');
          return saved as typeof raw;
        })),
      })) }));
      data = dataCopy({ ...graph.data, lines }, true, graph.shared);
    }
    return { data, signature: identity.signature, parser, systems: JSON.stringify(identity.systems) };
  } catch { return; }
}

type Runtime = { Parse: new () => { getTune(): Tune }; EngraverController: {
  new(host: HTMLElement, options: abcjs.AbcVisualParams): EngraverController & { engraveABC(tune: Tune, number: number, offset: number): void };
} };
function runtime(): Runtime | undefined {
  const value = (abcjs as unknown as { test?: Runtime }).test;
  return abcjs.signature === ENGINE && typeof value?.Parse === 'function' && typeof value.EngraverController === 'function' ? value : undefined;
}
/** Parse constructor creates NEW Tune methods and closure helpers. getTune is
 * its normal ownership bridge; parser.parse is deliberately never called.
 * Data comes only from the immutable pre-engraving frame, never a live Tune. */
function materialize(frame: BeatFrame, engine: Runtime): Tune {
  const fresh = new engine.Parse().getTune();
  Object.assign(fresh, dataCopy(frame.data));
  return fresh;
}
function voices(tune: Pick<Tune, 'lines'>, line: number) { return tune.lines[line].staff!.flatMap(staff => staff.voices!); }
function key(event: Event) { return `${event.el_type}:${event.startChar}:${event.endChar}`; }
function identity(tune: Tune, parser: string, canonicalChordOrder = false, copiedChordSlurs = false) {
  const events: unknown[][] = [[], [], [], []], heads: string[][] = [[], [], [], []];
  const onsets = [0, 0, 0, 0], seen = new Set<string>();
  for (let line = 0; line < tune.lines.length; line++) {
    if (tune.lines[line].staff?.length !== 2 || tune.lines[line].staff!.some(staff => staff.voices?.length !== 2)) return;
    voices(tune, line).forEach((voice, index) => {
      for (const raw of voice) {
        const event = raw as Event;
        if (event.el_type === 'stem') continue;
        if (!['note', 'bar', 'tempo'].includes(event.el_type) || !Number.isInteger(event.startChar) || !Number.isInteger(event.endChar) ||
          event.startChar === undefined || event.endChar === undefined || event.startChar < 0 || event.endChar <= event.startChar || event.endChar > parser.length) throw new Error('Unknown source event');
        const id = `${index}:${key(event)}`;
        if (seen.has(id)) throw new Error('Duplicate source event');
        seen.add(id);
        // The exact chordal readers independently validate sorted caches.
        // Hideth additionally validates slurs copied from whole-chord events
        // onto an engraved pitch. Exclude only those proven derived copies;
        // the unchanged strict reader still signs their original chord arcs.
        const pitches = canonicalChordOrder ? event.pitches?.slice().sort((a, b) => a.pitch - b.pitch) : event.pitches;
        events[index].push([id, onsets[index], event.duration, parser.slice(event.startChar, event.endChar),
          pitches?.map(pitch => [pitch.pitch, pitch.name, pitch.accidental, pitch.verticalPos, pitch.startTie, pitch.endTie,
            copiedChordSlurs && pitches.length > 1 && event.startSlur ? undefined : pitch.startSlur,
            copiedChordSlurs && pitches.length > 1 && event.endSlur ? undefined : pitch.endSlur]),
          event.lyric, event.rest,
          (event as Event & { startBeam?: boolean }).startBeam, (event as Event & { endBeam?: boolean }).endBeam]);
        if (event.el_type === 'note') {
          event.pitches?.forEach((_pitch, head) => heads[index].push(`${id}:${head}:${onsets[index]}`));
          if (typeof event.duration !== 'number') throw new Error('Unknown duration');
          onsets[index] += event.duration;
        }
      }
    });
  }
  return { signature: JSON.stringify(events), heads: JSON.stringify(heads.flat()) };
}
/** Count attacks, not chord heads or rests. A useful continuation owns at
 * least two attacks per voice and two real syllables in each authored row. */
function hasUsefulRemainder(events: Event[], lyricRows: number) {
  const attacks = events.filter(event => !event.rest && event.pitches?.length);
  if (attacks.length < 2) return false;
  return !events.some(event => event.lyric?.length) || Array.from({ length: lyricRows }, (_, row) =>
    attacks.filter(event => {
      const syllable = event.lyric?.[row]?.syllable;
      return syllable?.trim() && !/[_*]/.test(syllable);
    }).length >= 2).every(Boolean);
}
function cleanCuts(tune: Pick<Tune, 'lines'>, edition: Profile): Cut[] {
  const meter = tune.lines[0].staff?.[0].meter;
  if (meter?.type !== 'specified' || meter.value?.length !== 1 || Number(meter.value[0].num) !== edition.numerator || Number(meter.value[0].den) !== edition.denominator) return [];
  const beat = 1 / Number(meter.value[0].den), length = Number(meter.value[0].num) * beat;
  const cuts: Cut[] = [];
  for (let boundary = beat; boundary < length; boundary += beat) {
    const moves: string[][] = [];
    let reason: string | undefined;
    for (const [voiceIndex, voice] of voices(tune, 1).entries()) {
      const notes = voice.filter(event => event.el_type === 'note') as Event[];
      // These sources require only the signature at continuation. General
      // accidental, meter/key replay and spanning notation remain unsupported.
      if (voice.some(event => !['stem', 'note', 'bar'].includes(event.el_type)) || notes.some(event =>
        event.rest || event.gracenotes?.length || event.startTriplet || event.endTriplet || event.tripletMultiplier ||
        event.decoration?.length || event.chord?.length || event.startSlur || event.endSlur ||
        (!edition.suffixBeam && !edition.prefixBeam && ((event as Event & { startBeam?: boolean; endBeam?: boolean }).startBeam ||
          (event as Event & { startBeam?: boolean; endBeam?: boolean }).endBeam)) ||
        event.pitches?.some(pitch => (pitch.accidental && !edition.suffixAccidental?.allows(voiceIndex, event, boundary)) || pitch.startTie || pitch.endTie || pitch.startSlur || pitch.endSlur))) {
        reason = 'unsupported-crossing-context'; break;
      }
      let duration = 0;
      const moved: Event[] = [];
      for (const note of notes) {
        if (duration >= boundary) break;
        if (typeof note.duration !== 'number') throw new Error('Unknown duration');
        duration += note.duration; moved.push(note);
      }
      if (duration !== boundary || !moved.length || moved.length === notes.length) { reason = 'not-synchronized-event-end'; break; }
      // Existing suffix beams stay wholly in the suffix. Only the exact
      // All Creatures bass capability may move a complete native prefix beam.
      // Spanning, nested, unclosed and unknown flags always fail closed.
      if (edition.suffixBeam || edition.prefixBeam) {
        const prefixAllowed = edition.prefixBeam?.boundary(voiceIndex, notes, moved.length, boundary);
        let open = false;
        for (let index = 0; index < notes.length; index++) {
          const note = notes[index] as Event & { startBeam?: boolean; endBeam?: boolean };
          if ((note.startBeam !== undefined && note.startBeam !== true) || (note.endBeam !== undefined && note.endBeam !== true) ||
            (index < moved.length && (note.startBeam || note.endBeam) && !prefixAllowed) || (index === moved.length && open) ||
            (note.startBeam && open) || (note.endBeam && !open && !note.startBeam)) { reason = 'unsupported-crossing-beam'; break; }
          if (note.startBeam) open = true;
          if (note.endBeam) open = false;
        }
        if (open) reason = 'unsupported-crossing-beam';
        if (reason) break;
      }
      // Only an exact source-owned beat-2 capability may retain an authored hyphen
      // across systems. Its complete source-row witnesses and post-engraving
      // native ownership proof are mandatory; the general rule stays intact.
      const last = moved.at(-1)!, next = notes[moved.length];
      if (edition.lyricContinuation ? !edition.lyricContinuation.boundary(voiceIndex, notes, moved.length, boundary) :
        (last.lyric || next.lyric) && (last.lyric?.length !== edition.lyricRows || next.lyric?.length !== edition.lyricRows ||
        last.lyric.some(row => row.divider !== ' ' || !row.syllable.trim()) ||
        next.lyric.some(row => !row.syllable.trim() || /[_*]/.test(row.syllable)))) { reason = 'lyric-continuation'; break; }
      // This profile opts out of moving the one-attack orphan to system two.
      if (edition.usefulRemainder && !hasUsefulRemainder(notes.slice(moved.length), edition.lyricRows)) {
        reason = 'unhelpful-remainder'; break;
      }
      moves.push(moved.map(key));
    }
    cuts.push({ beat: boundary / beat, duration: boundary, moves, ...(reason ? { reason } : {}) });
  }
  return cuts;
}
function movePrefix(tune: Tune, cut: Cut) {
  const first = voices(tune, 0), second = voices(tune, 1);
  first.forEach((voice, index) => {
    const selected = new Set(cut.moves[index]);
    const moved = second[index].filter(event => selected.has(key(event as Event)));
    if (moved.length !== selected.size) throw new Error('Missing fragment event');
    voice.push(...moved);
    second[index].splice(0, second[index].length, ...second[index].filter(event => !selected.has(key(event as Event))));
  });
}
function recomposed(tune: Tune, cut: Cut): Tune {
  // Shallow ownership view ONLY for the unchanged strict whole-measure reader.
  // No candidate node or event is copied, altered, dropped or made into a bar.
  const lines = tune.lines.map(line => ({ ...line, staff: line.staff!.map(staff => ({ ...staff, voices: staff.voices!.map(voice => [...voice]) })) }));
  const whole = { ...tune, lines };
  const first = voices(whole, 0), second = voices(whole, 1);
  first.forEach((voice, index) => {
    const selected = new Set(cut.moves[index]);
    const moved = voice.filter(event => selected.has(key(event as Event)));
    first[index].splice(0, voice.length, ...voice.filter(event => !selected.has(key(event as Event))));
    const stemEnd = second[index].findIndex(event => event.el_type !== 'stem');
    second[index].splice(Math.max(0, stemEnd), 0, ...moved);
  });
  return whole;
}
function fragmentProof(tune: Tune, original: Tune, prior: NonNullable<ReturnType<typeof identity>>, frame: BeatFrame, before: Score, cut: Cut, edition: Profile,
  projection?: ReturnType<typeof projectOhHowRests>, phase: 'parsed' | 'measured' | 'engraved' = 'parsed') {
  // The exact adapter validates both raw fragments before this view collapses
  // their one signed parent for unchanged source/geometry/typography guards.
  const canonical = projection ? projection.collapse(phase) : tune;
  if (!canonical) return;
  const current = identity(canonical, frame.parser, !!(edition.invisibleRestProjection || edition.supplementalRest), edition.supplementalRest === 'hideth');
  const whole = edition.read(recomposed(canonical, cut), frame.parser);
  if (!current || prior.signature !== current.signature || prior.heads !== current.heads ||
    !whole || whole.signature !== before.signature || JSON.stringify(whole.systems) !== JSON.stringify(before.systems) ||
    edition.read(tune, frame.parser)) return;
  for (let line = 2; line < tune.lines.length; line++) for (let voice = 0; voice < 4; voice++) {
    if (JSON.stringify(voices(tune, line)[voice].map(event => key(event as Event))) !==
      JSON.stringify(voices(original, line)[voice].map(event => key(event as Event)))) return;
  }
  // Geometry consumes canonical voice/event order and system count only. It
  // does not confer a whole-measure identity on these two explicit fragments.
  const notes = [0, 1, 2, 3].flatMap(voice => canonical.lines.flatMap((_line, line) => voices(canonical, line)[voice]
    .filter(event => event.el_type === 'note').map(event => ({ voice, element: event as Event }))));
  return { ...before, notes };
}
type NativeMetric = { x: number; w: number; extraw: number };
/** getMeasureWidths constructs/layouts AbsoluteElements but does not draw.
 * Source event.abselem is assigned only by draw/absolute.js. Bridge through
 * the exact native child.abcelem ownership edge without mutating source data. */
function measurementMetrics(tune: Tune, line = 0): ReadonlyMap<Event, NativeMetric> {
  const expected = new Set(voices(tune, line).flat().filter(event => event.el_type === 'note' || event.el_type === 'bar') as Event[]);
  const firstLine = tune.lines[line] as unknown as { staffGroup?: { voices?: { children?: (NativeMetric & { abcelem?: Event })[] }[] } };
  const nativeVoices = firstLine.staffGroup?.voices;
  if (nativeVoices?.length !== 4) throw new Error('Unavailable native metric voices');
  const metrics = new Map<Event, NativeMetric>();
  for (const voice of nativeVoices) for (const child of voice.children ?? []) {
    const event = child.abcelem;
    if (!event || !['note', 'bar'].includes(event.el_type)) continue;
    if (!expected.has(event) || metrics.has(event) || ![child.x, child.w, child.extraw].every(Number.isFinite))
      throw new Error('Ambiguous native metric ownership');
    metrics.set(event, { x: child.x, w: child.w, extraw: child.extraw });
  }
  if (metrics.size !== expected.size || [...expected].some(event => !metrics.has(event))) throw new Error('Incomplete native metrics');
  return metrics;
}
function metricEdges(event: Event, measured?: ReadonlyMap<Event, NativeMetric>) {
  const absolute = measured ? measured.get(event) : event.abselem as unknown as NativeMetric | undefined;
  if (!absolute || ![absolute.x, absolute.w, absolute.extraw].every(Number.isFinite)) throw new Error('Unavailable native metric');
  return { left: absolute.x + absolute.extraw, right: absolute.x + absolute.w };
}
function staffSizes(host: HTMLElement) {
  return [...host.querySelectorAll<SVGGraphicsElement>('g.abcjs-staff')].map(staff => [staff.getBBox().height, staff.getBoundingClientRect().height]);
}

export function reflowOpeningBeats({ diagnosticHost, host, source, prepared, options, original, settings, frame, current, onRestProjection, song = THOUSAND_OPENING_ID }: {
  diagnosticHost: HTMLElement | null; host: HTMLElement; source: string; prepared: string; options: abcjs.AbcVisualParams;
  song?: string; onRestProjection?: (tune: Tune) => void; original: abcjs.TuneObjectArray; settings: HymnOpeningSettings; frame?: BeatFrame; current: () => boolean;
}): abcjs.TuneObjectArray {
  const edition = profile(song);
  // Current bounded projection facts only; no event graphs or history in DOM.
  const restEvidence: {
    canonicalEvents?: number; displayEvents?: number; canonicalHeads?: number;
    measuredWidths?: number[]; measurementRecomposed?: boolean; parsedRecomposed?: boolean;
    engravedRecomposed?: boolean; selectionSpansUnique?: boolean;
  } = {};
  const suffixEvidence: { candidateEngravings: number; ordinaryOwnership?: boolean; candidateOwnership?: boolean;
    measurement?: { target: number; whole: number; prefix?: number; suffix?: number } } = { candidateEngravings: 0 };
  // One current outcome supports native inspection; no histories or timelines.
  const finish = (tunes: abcjs.TuneObjectArray, reason: string, beat?: number) => {
    try { diagnosticHost?.setAttribute(ATTRIBUTE, JSON.stringify({ result: beat === undefined ? 'original' : 'candidate', reason, ...(beat === undefined ? {} : { beat }), ...(edition?.invisibleRestProjection || edition?.supplementalRest ? { rest: restEvidence } : {}), ...(edition?.suffixAccidental ? { suffix: suffixEvidence } : {}) })); }
    catch { /* Inspection must never change acceptance or rollback. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  let reason = 'exception';
  try {
    const engine = runtime();
    if (!engine || !edition?.source(source) || !frame || frame.parser !== edition.parser(prepared)) return finish(original, 'source-or-frame');
    if (settings.visibleKey !== '0,1,2,3' || settings.stanzasPerGroup !== edition.stanzasPerGroup || settings.transpose !== 0 || settings.learnerAccidentals ||
      !!settings.grouped !== !!edition.grouped || settings.musicOnly || settings.repeatUnderlay || settings.reviewedUnderlay !== !!edition.reviewedUnderlay || options.print ||
      host.closest('.print-score-canvas') || !host.isConnected || !options.wrap || options.lineBreaks || options.visualTranspose ||
      options.scale !== 1 || options.responsive !== 'resize' || options.oneSvgPerLine !== true || options.minPadding !== 6 ||
      options.format || options.expandToWidest || options.timeBasedLayout || options.tablature || options.viewportHorizontal || options.viewportVertical ||
      options.paddingleft !== undefined || options.paddingright !== undefined || options.wrap.minSpacing !== 1.5 || options.wrap.maxSpacing !== 2.7 ||
      options.wrap.preferredMeasuresPerLine !== 0 || options.wrap.minSpacingLimit !== undefined || options.wrap.lastLineLimit !== undefined ||
      !Number.isFinite(options.staffwidth) || Math.abs(options.staffwidth! - settings.scoreWidth / settings.requestedScale) > EPSILON || !current()) return finish(original, 'unsupported-or-stale');
    if (edition.grouped && !host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches) return finish(original, 'unsupported-grouped-width');
    if (edition.lyricContinuation && settings.requestedScale !== 1) return finish(original, 'unsupported-lyric-scale');
    if (edition.prefixBeam && (settings.requestedScale !== 1 ||
      !host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches)) return finish(original, 'unsupported-prefix-size');
    if (edition.supplementalRest && (settings.requestedScale !== 1 ||
      !host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches)) return finish(original, 'unsupported-rest-size');
    const before = original.length === 1 && edition.read(original[0], frame.parser);
    if (!before || before.signature !== frame.signature || JSON.stringify(before.systems) !== frame.systems) return finish(original, 'ordinary-identity');
    if (JSON.stringify(before.systems.slice(0, 2)) !== '[[0],[1]]') return finish(original, 'ordinary-opening-already-paired');
    if (original[0].engraver?.renderer?.padding?.left !== 15 || original[0].engraver?.renderer?.padding?.right !== 15 ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined || original[0].formatting.rightmargin !== undefined) return finish(original, 'ordinary-padding');
    const geometry = readScreenScoreGeometry(host, before, false), sizes = staffSizes(host);
    if (!geometry || sizes.length !== before.systems.length * 2 || sizes.some(size => size.some((number, index) => !Number.isFinite(number) || number <= 0 || Math.abs(number - sizes[0][index]) > EPSILON))) return finish(original, 'ordinary-geometry');
    const prior = identity(original[0], frame.parser, !!(edition.invisibleRestProjection || edition.supplementalRest), edition.supplementalRest === 'hideth');
    if (!prior) return finish(original, 'ordinary-events');
    if (edition.lyricContinuation && !edition.lyricContinuation.read(host, original[0], false))
      return finish(original, 'ordinary-lyric-ownership');
    if (edition.prefixBeam && !edition.prefixBeam.read(host, original[0], false)) return finish(original, 'ordinary-prefix-ownership');
    const suffixOwned = edition.suffixAccidental?.read(host, original[0]);
    if (edition.suffixAccidental && !suffixOwned) return finish(original, 'ordinary-suffix-ownership');
    if (suffixOwned) suffixEvidence.ordinaryOwnership = true;
    const ohHowPlan = edition.invisibleRestProjection ? planOhHowRestProjection(frame.data, frame.parser) : undefined;
    const supplementalPlan = edition.supplementalRest ? planSupplementalOpeningRest(frame.data, frame.parser, edition.supplementalRest) : undefined;
    const restPlan = ohHowPlan ?? supplementalPlan;
    const projectRests = (tune: Tune) => ohHowPlan ? projectOhHowRests(tune, ohHowPlan) :
      supplementalPlan ? projectSupplementalOpeningRest(tune, supplementalPlan) : undefined;
    if ((edition.invisibleRestProjection || edition.supplementalRest) && !restPlan) return finish(original, 'rest-plan');
    if (restPlan) {
      restEvidence.canonicalEvents = before.notes.length;
      restEvidence.canonicalHeads = before.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0);
    }
    const cuts: Cut[] = restPlan ? [restPlan.cut] : cleanCuts(frame.data, edition);
    if (!cuts.some(cut => !cut.reason)) return finish(original, 'no-clean-beat');
    const measured = materialize(frame, engine);
    const measuredProjection = projectRests(measured);
    if (!restPlan) {
      const first = voices(measured, 0), second = voices(measured, 1);
      first.forEach((voice, index) => voice.push(...second[index].filter(event => event.el_type !== 'stem')));
      measured.lines.splice(1, 1);
    }
    const measurementHost = host.ownerDocument.createElement('div');
    measurementHost.setAttribute('style', 'visibility:hidden;pointer-events:none;position:absolute;');
    measurementHost.setAttribute('data-beat-measurement', 'true');
    let controller: EngraverController | undefined;
    const { wrap: _wrap, afterParsing: _after, clickListener: _click, ...plain } = options;
    const nativeOptions = { ...plain, staffwidth: geometry.width - 30 };
    try {
      host.ownerDocument.body.append(measurementHost);
      controller = new engine.EngraverController(measurementHost, nativeOptions);
      controller.getMeasureWidths(measured);
      if (controller.renderer.paper.dummySvg) return finish(original, 'non-native-text-metrics');
      if (restPlan) {
        if (!fragmentProof(measured, original[0], prior, frame, before, restPlan.cut, edition, measuredProjection, 'measured'))
          return finish(original, 'measurement-projection');
        restEvidence.measurementRecomposed = true;
        restEvidence.measuredWidths = [];
        // Measure the actual segmented rhythm in BOTH systems and all four
        // lanes. A trailing unbarred prefix is absent from the API's bar list.
        for (const line of [0, 1]) {
          const metrics = measurementMetrics(measured, line);
          const edges = [...metrics].map(([event]) => metricEdges(event, metrics).right);
          const width = Math.max(...edges) + 17;
          restEvidence.measuredWidths.push(width);
          if (!edges.length || width > geometry.width + EPSILON) cuts[0].reason = 'native-width';
        }
      } else {
        const strict = edition.read(measured, frame.parser);
        if (!strict || strict.signature !== before.signature) return finish(original, 'measurement-identity');
        const measureVoices = voices(measured, 0);
        const metrics = measurementMetrics(measured);
        const ending = measureVoices.flatMap(voice => voice.filter(event => event.el_type === 'bar').map(event => metricEdges(event as Event, metrics).right));
        const wholeWidth = Math.max(...ending) + 17;
        if (edition.suffixAccidental) suffixEvidence.measurement = { target: geometry.width, whole: wholeWidth };
        if (wholeWidth <= geometry.width + EPSILON) return finish(original, 'whole-measure-preferred');
        for (const cut of cuts.filter(cut => !cut.reason)) {
          const prefix: Event[] = [], suffix: Event[] = [];
          measureVoices.forEach((voice, index) => {
            let bar = 0;
            for (const raw of voice) {
              const event = raw as Event;
              if (event.el_type === 'stem' || event.el_type === 'tempo') continue;
              if (bar === 0 || cut.moves[index].includes(key(event))) prefix.push(event); else suffix.push(event);
              if (event.el_type === 'bar') bar++;
            }
          });
          const prefixWidth = Math.max(...prefix.map(event => metricEdges(event, metrics).right)) + 17;
          const suffixLeft = Math.min(...suffix.map(event => metricEdges(event, metrics).left));
          const continuationLeft = Math.min(...voices(original[0], 1).flatMap(voice => voice.filter(event => event.el_type === 'note').slice(0, 1).map(event => metricEdges(event as Event).left)));
          const suffixWidth = continuationLeft + Math.max(...suffix.map(event => metricEdges(event, metrics).right)) - suffixLeft + 17;
          if (suffixEvidence.measurement) Object.assign(suffixEvidence.measurement, { prefix: prefixWidth, suffix: suffixWidth });
          if (Math.max(prefixWidth, suffixWidth) > geometry.width + EPSILON) cut.reason = 'native-width';
        }
      }
    } finally { try { controller?.renderer.paper.dummySvg?.remove(); } finally { measurementHost.remove(); } }
    const cut = cuts.filter(cut => !cut.reason).sort((a, b) => b.duration - a.duration)[0];
    if (!cut) return finish(original, 'no-fitting-clean-beat');
    const candidate = materialize(frame, engine);
    const projection = projectRests(candidate);
    if (!projection) movePrefix(candidate, cut);
    if (!fragmentProof(candidate, original[0], prior, frame, before, cut, edition, projection)) return finish(original, 'projection-continuity');
    if (projection) {
      restEvidence.parsedRecomposed = true;
      restEvidence.displayEvents = candidate.lines.flatMap(line => line.staff!.flatMap(staff => staff.voices!).flat()).filter(event => event.el_type === 'note').length;
    }
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography || !current()) return finish(original, 'typography-or-stale');
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const candidateController = new engine.EngraverController(host, { ...nativeOptions, clickListener: options.clickListener });
    if (edition.suffixAccidental) suffixEvidence.candidateEngravings = 1;
    try { candidateController.engraveABC(candidate, 0, 0); }
    finally { candidateController.renderer.paper.dummySvg?.remove(); }
    candidate.engraver = candidateController as unknown as NonNullable<Tune['engraver']>;
    const proof = fragmentProof(candidate, original[0], prior, frame, before, cut, edition, projection, 'engraved');
    if (!proof) reason = 'engraved-continuity';
    else {
      if (projection) restEvidence.engravedRecomposed = true;
      preserveBlankLyricRows(host); containScreenSvgSystems(host);
      const inkFits = [...host.querySelectorAll('svg')].every(svg => {
        const ink = svg.getBBox(); return [ink.x, ink.width].every(Number.isFinite) && ink.width > 0 &&
          ink.x - 2 >= geometry.left - EPSILON && ink.x + ink.width + 2 <= geometry.left + geometry.width + EPSILON;
      });
      if (!inkFits || !normalizeScreenCandidateViewport(host, candidate, proof, geometry)) reason = 'candidate-ink';
      else {
        const after = readScreenScoreGeometry(host, proof, true), nextSizes = staffSizes(host);
        // Bounds belong to the final accepted viewport, after normalization.
        const lyricOwned = !edition.lyricContinuation || edition.lyricContinuation.read(host, candidate, true);
        if (!after || !sameScreenScoreGeometry(geometry, after) || nextSizes.length !== sizes.length || nextSizes.some((size, index) =>
          size.some((number, axis) => Math.abs(number - sizes[index][axis]) > EPSILON))) reason = 'candidate-size-or-spacing';
        else if (!lyricOwned) reason = 'candidate-lyric-ownership';
        else if (edition.prefixBeam && !edition.prefixBeam.read(host, candidate, true)) reason = 'candidate-prefix-ownership';
        else if (edition.suffixAccidental && !edition.suffixAccidental.same(suffixOwned, edition.suffixAccidental.read(host, candidate)))
          reason = 'candidate-suffix-ownership';
        else {
          if (edition.suffixAccidental) suffixEvidence.candidateOwnership = true;
          const captured = captureLyricTypography(host, proof.notes, after);
          const typographyProof = captured && verifyLyricTypography(host, typography, captured, { preserveNaturalWidth: true });
          if (!typographyProof?.valid) reason = 'candidate-typography';
          else if (!current()) reason = 'stale-generation';
          else {
            const registration = projection?.collapse('engraved');
            const selectedNotes = registration?.lines.flatMap(line => line.staff!.flatMap(staff => staff.voices!).flat()).filter(event => event.el_type === 'note');
            const unique = selectedNotes && selectedNotes.length === before.notes.length &&
              new Set(selectedNotes.map(event => `${event.startChar}:${event.endChar}`)).size === selectedNotes.length;
            if (projection && (!registration || !unique)) reason = 'selection-projection';
            else {
              if (registration) { restEvidence.selectionSpansUnique = true; onRestProjection?.(registration); }
              return finish([candidate] as abcjs.TuneObjectArray, 'accepted', cut.beat);
            }
          }
        }
      }
    }
  } catch { /* Fail closed, restoring the exact listener-bearing ordinary nodes. */ }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, reason);
}
