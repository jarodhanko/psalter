import abcjs from 'abcjs';
import { addLearnerAccidentals } from './learnerAccidentals';

interface LayerEvent { q: number; duration: number; count: number }
interface SourceLayer {
  id: string;
  owners: readonly string[];
  clef: 'treble' | 'bass';
  small: boolean;
  stem: 'up' | 'down';
  body: string;
  events: readonly LayerEvent[];
}
export interface SourceLayerWitness {
  id: string;
  source: string;
  audio: string;
  replacements: readonly { before: string; after: string; count: number }[];
  layers: readonly SourceLayer[];
}

const fail = (witness: SourceLayerWitness): never => { throw new Error(`Unable to preserve ${witness.id} source layers.`); };
const close = (left: number, right: number) => Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-7;

export function sourceLayerWitness(songId: string, abc: string): SourceLayerWitness | undefined {
  return witnesses.find(witness => witness.id === songId && witness.source === abc.replace(/\r\n/g, '\n'));
}

/** Musical display projection BEFORE lyric/part selection. Original named
 * lanes remain the only selection candidates. Supplementary mixed heads
 * never enter the independent canonical full-tune cache. Source 319 rests
 * are projected later, after lyric transfer, so outside underlay survives.
 * sourceSupplementAudio separately reuses the bounded 271 additions.
 */
export function withSourceLayerHeads(abc: string, witness?: SourceLayerWitness): string {
  if (!witness || !abc) return abc;
  let result = abc;
  for (const { before, after, count } of witness.replacements) {
    if (result.split(before).length - 1 !== count) return fail(witness);
    result = result.split(before).join(after);
  }
  return result;
}

/** Append explicitly owned timed source layers AFTER named-part and lyric
 * selection. They have no lyric rows or selectors; sourceSupplementAudio
 * separately assigns internal audio identities for its four allowed scores.
 * A final learner pass includes the newly introduced auxiliary voices.
 */
export function withSelectedSourceLayers(abc: string, witness?: SourceLayerWitness, learner = false): string {
  if (!witness || !abc) return abc;
  const scores = abc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1) return fail(witness);
  let score = scores[0];
  const definitions: string[] = [];
  const bodies: string[] = [];
  for (const layer of witness.layers) {
    if (abc.includes(layer.id)) return fail(witness);
    const groups = score.match(/\([^)]*\)/g) ?? [];
    const matching = groups.filter(group => group.slice(1, -1).trim().split(/\s+/).some(id => layer.owners.includes(id)));
    if (!matching.length) continue;
    if (matching.length !== 1) return fail(witness);
    score = score.replace(matching[0], matching[0].slice(0, -1).trimEnd() + ` ${layer.id})`);
    definitions.push(`V:${layer.id} clef=${layer.clef} cue=${layer.small ? 'on' : 'off'} stem=${layer.stem}`);
    bodies.push(`% Source-owned display-only layer: ${witness.id}/${layer.id}\nV:${layer.id}\n${layer.body}`);
  }
  if (!definitions.length) return abc;
  const result = abc.replace(scores[0], [score, ...definitions].join('\n')).trimEnd() + '\n' + bodies.join('\n') + '\n';
  return learner ? addLearnerAccidentals(result) : result;
}

type SourcePitch = NonNullable<abcjs.VoiceItemNote['pitches']>[number] & { sourceLayerSmall?: string };
type SourceNote = Omit<abcjs.VoiceItemNote, 'pitches'> & {
  pitches?: SourcePitch[]; lyric?: unknown[]; gracenotes?: unknown[]; decoration?: unknown[];
  startTriplet?: unknown; endTriplet?: unknown; abselem?: abcjs.AbsoluteElement;
};
type TimedNote = { q: number; note: SourceNote; voice: abcjs.VoiceItem[]; direction: abcjs.StemDirection; id: string };
type OwnedNote = TimedNote & { layer: SourceLayer; owner: string };
type LayerState = { id: string; auxiliary: OwnedNote[]; mixed: SourceNote[]; normal: Map<string, TimedNote[]>; presented?: boolean };
type SourceTune = abcjs.TuneObject & { sourceLayerPresentation?: LayerState };
type DrawnHead = abcjs.RelativeElement & { graphelem?: SVGGraphicsElement; stemDir?: string; scalex?: number; parent?: abcjs.AbsoluteElement };
type DrawnTie = {
  type: string; anchor1?: DrawnHead; anchor2?: DrawnHead; internalNotes?: unknown[];
  elemset?: SVGGraphicsElement[]; isTie?: boolean; above?: boolean;
  startX?: number; endX?: number; startY?: number; endY?: number;
};

function staffGroups(source: string, witness: SourceLayerWitness): string[][] {
  const scores = source.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1) return fail(witness);
  return (scores[0].match(/\([^)]*\)/g) ?? []).map(group => group.slice(1, -1).trim().split(/\s+/));
}

/** Recognize all affected events before changing the engraving object. Native
 * cue voices retain their independent timing, ties and stem directions.
 */
export function prepareSourceLayers(tune: SourceTune, source: string, witness?: SourceLayerWitness): void {
  if (!witness) return;
  if (tune.sourceLayerPresentation) {
    if (tune.sourceLayerPresentation.id !== witness.id) return fail(witness);
    return;
  }
  const groups = staffGroups(source, witness);
  const active = witness.layers.filter(layer => groups.some(group => group.includes(layer.id)));
  if (!active.length) return;
  if (abcjs.signature !== 'abcjs-basic v6.7.0' || tune.warnings?.length) return fail(witness);
  const normal = new Map<string, TimedNote[]>();
  const collect = (id: string): TimedNote[] => {
    const existing = normal.get(id);
    if (existing) return existing;
    const staffIndex = groups.findIndex(group => group.includes(id));
    if (staffIndex < 0) return [];
    const voiceIndex = groups[staffIndex].indexOf(id);
    let q = 0;
    let direction: abcjs.StemDirection = 'auto';
    const found: TimedNote[] = [];
    for (const line of tune.lines) {
      const staff = line.staff?.[staffIndex];
      if (!staff) continue;
      if (!Array.isArray(staff.voices) || staff.voices.length !== groups[staffIndex].length) return fail(witness);
      const voice = staff.voices[voiceIndex];
      for (const item of voice) {
        if (item.el_type === 'stem') direction = item.direction;
        if (item.el_type !== 'note') continue;
        const note = item as SourceNote;
        if (!Number.isFinite(note.duration) || note.startTriplet || note.endTriplet) return fail(witness);
        found.push({ q, note, voice, direction, id });
        q += note.duration * 4;
      }
    }
    normal.set(id, found);
    return found;
  };
  const at = (id: string, q: number, duration: number, count: number): TimedNote => {
    const matches = collect(id).filter(event => close(event.q, q));
    const target = matches[0];
    if (matches.length !== 1 || !close(target.note.duration * 4, duration) || target.note.rest ||
        target.note.pitches?.length !== count || target.note.gracenotes?.length || target.note.decoration?.length ||
        !target.note.pitches.every(pitch => pitch && Number.isFinite(pitch.pitch) && Number.isFinite(pitch.verticalPos))) return fail(witness);
    return target;
  };
  const auxiliary: OwnedNote[] = [];
  for (const layer of active) {
    const group = groups.find(group => group.includes(layer.id))!;
    const owner = layer.owners.find(id => group.includes(id));
    if (!owner) return fail(witness);
    const pitched = collect(layer.id).filter(event => !!event.note.pitches?.length);
    if (pitched.length !== layer.events.length) return fail(witness);
    for (const [index, expected] of layer.events.entries()) {
      const event = at(layer.id, expected.q, expected.duration, expected.count);
      if (event !== pitched[index] || event.note.lyric?.length) return fail(witness);
      auxiliary.push({ ...event, layer, owner });
    }
    collect(owner);
  }
  const edits: (() => void)[] = [];
  const stems = new Map<SourceNote, { event: TimedNote; direction: 'up' | 'down' }>();
  const mixed: SourceNote[] = [];
  const stem = (event: TimedNote, direction: 'up' | 'down') => { stems.set(event.note, { event, direction }); };
  const small = (id: string, q: number, duration: number, count: number, indices: number[]) => {
    if (!groups.some(group => group.includes(id))) return;
    const event = at(id, q, duration, count);
    if (event.note.pitches!.some(pitch => pitch.startTie || pitch.endTie || pitch.startSlur?.length || pitch.endSlur?.length)) return fail(witness);
    edits.push(() => {
      event.note.pitches = event.note.pitches!.map((pitch, index) => ({ ...pitch,
        ...(indices.includes(index) ? { sourceLayerSmall: `${witness.id}:${id}:q${q}:head${index}` } : {}),
      }));
    });
    mixed.push(event.note);
    stem(event, 'down');
  };
  if (witness.id === 'psalter152') {
    stem(at('T2', 21, 2, 1), 'up');
    stem(at('T2', 23, 1, 1), 'up');
  } else if (witness.id === 'psalter271') {
    for (const id of ['T2', 'B2']) if (groups.some(group => group.includes(id))) {
      for (const q of [40, 41, 42, 43, 44]) stem(at(id, q, 1, 1), 'down');
    }
    small('T2', 45, 3, 3, [0, 1]);
    small('B2', 45, 3, 2, [0]);
    small('B2', 48, 1, 2, [0]);
    small('B2', 49, 1, 2, [0]);
    if (groups.some(group => group.includes('B1') && group.includes('B2'))) {
      for (const q of [48, 49]) {
        const target = at('B1', q, 1, 1), donor = at('B2', q, 1, 2);
        if (donor.note.lyric?.length || target.note.pitches!.some(pitch => pitch.startTie || pitch.endTie || pitch.startSlur?.length || pitch.endSlur?.length)) return fail(witness);
        edits.push(() => {
          // Earlier owned-head edits mark the donor before it is joined.
          target.note.pitches = [...target.note.pitches!, ...donor.note.pitches!].map(pitch => ({ ...pitch })).sort((a, b) => a.pitch - b.pitch);
          donor.voice.splice(donor.voice.indexOf(donor.note), 1, {
            el_type: 'note', startChar: donor.note.startChar, endChar: donor.note.endChar,
            duration: donor.note.duration, rest: { type: 'invisible' },
          });
        });
        mixed.splice(mixed.indexOf(donor.note), 1, target.note);
        stems.delete(donor.note);
        stem(target, 'down');
      }
    }
  } else if (witness.id === 'psalter294') {
    const beamStart = at('T2', 44, 0.5, 1);
    const beamEnd = at('T2', 44.5, 0.5, 1);
    if (beamStart.voice !== beamEnd.voice || beamStart.voice.indexOf(beamEnd.note) !== beamStart.voice.indexOf(beamStart.note) + 1) return fail(witness);
    // A stem directive between these eighths would break ABCJS's contiguous
    // beam group. Scope the direction around the complete printed pair.
    edits.push(() => {
      beamStart.voice.splice(beamStart.voice.indexOf(beamStart.note), 0, { el_type: 'stem', direction: 'down' });
      beamEnd.voice.splice(beamEnd.voice.indexOf(beamEnd.note) + 1, 0, { el_type: 'stem', direction: beamEnd.direction });
    });
    stem(at('T2', 45, 1, 1), 'up');
    stem(at('T2', 46, 2, 1), 'down');
    const held = auxiliary.filter(event => event.layer.id === 'SOURCE294HELD');
    if (held.length !== 2 || !held[0].note.pitches![0].startTie || !held[1].note.pitches![0].endTie) return fail(witness);
  } else if (witness.id === 'psalter319') {
    const ids = ['B1', 'B2'].filter(id => groups.some(group => group.includes(id)));
    const sourceEvents = [24, 25, 27, 28, 30, 31, 33, 34];
    const sourceDurations = [1, 2, 1, 2, 1, 2, 1, 2];
    for (const [voiceIndex, id] of ids.entries()) {
      const original = sourceEvents.map((q, index) => at(id, q, sourceDurations[index], 1));
      if (original.some(event => event.note.pitches!.some(pitch => pitch.startTie || pitch.endTie || pitch.startSlur?.length || pitch.endSlur?.length))) return fail(witness);
      // Lyric transfer has already completed on the canonical timing lanes.
      // Remove only the source-rest passage's underlay, preserving every row
      // and normal attack outside q24–36. Do not assign words to the cue layer.
      for (const [indices, duration] of [[[0], 1], [[1, 2], 3], [[3, 4], 3], [[5, 6], 3], [[7], 2]] as [number[], number][]) {
        const first = original[indices[0]], last = original[indices[indices.length - 1]];
        if (first.voice !== last.voice || first.voice.indexOf(last.note) !== first.voice.indexOf(first.note) + indices.length - 1) return fail(witness);
        const restType = voiceIndex > 0 ? 'invisible' : duration === 3 ? 'whole' : 'rest';
        edits.push(() => {
          // 'whole' is an ABCJS 6.7 runtime rest type missing from its public
          // TypeScript union; its duration remains the actual 3/4 measure.
          Object.assign(first.note, { rest: { type: restType }, duration: duration / 4, endChar: last.note.endChar });
          delete first.note.pitches;
          delete first.note.lyric;
          for (const index of indices.slice(1)) {
            const continuation = original[index];
            continuation.voice.splice(continuation.voice.indexOf(continuation.note), 1);
          }
        });
        if (voiceIndex === 0) stem(first, 'up');
      }
    }
  } else if (witness.id === 'psalter333') {
    const target = at('B1', 33, 3, 1);
    stem(target, 'down');
    if (groups.some(group => group.includes('B2'))) {
      const donor = at('B2', 33, 3, 1);
      if (donor.note.lyric?.length || [target, donor].some(event => event.note.pitches!.some(pitch =>
        pitch.startTie || pitch.endTie || pitch.startSlur?.length || pitch.endSlur?.length))) return fail(witness);
      edits.push(() => {
        target.note.pitches = [...target.note.pitches!, ...donor.note.pitches!].map(pitch => ({ ...pitch })).sort((a, b) => a.pitch - b.pitch);
        donor.voice.splice(donor.voice.indexOf(donor.note), 1, {
          el_type: 'note', startChar: donor.note.startChar, endChar: donor.note.endChar,
          duration: donor.note.duration, rest: { type: 'invisible' },
        });
      });
    }
  }
  for (const edit of edits) edit();
  for (const { event, direction } of stems.values()) {
    const position = event.voice.indexOf(event.note);
    event.voice.splice(position, 1, { el_type: 'stem', direction }, event.note,
      { el_type: 'stem', direction: event.direction });
  }
  tune.sourceLayerPresentation = { id: witness.id, auxiliary, mixed, normal };
}

/** Match ABCJS 6.7.0's native filled tie shape using its already established
 * pitches/staff origin, changing only the horizontal source-owned endpoints.
 */
function tiePath(startX: number, endX: number, startPitch: number, endPitch: number, zero: number): string {
  const round = (value: number) => Number(value.toFixed(2));
  const x1 = round(startX + 6), x2 = round(endX + 4);
  const y1 = round(zero - (startPitch - 1.2) * 3.875), y2 = round(zero - (endPitch - 1.2) * 3.875);
  const dx = x2 - x1, dy = y2 - y1, length = Math.hypot(dx, dy);
  if (length <= 0) throw new Error('Invalid source tie endpoints.');
  const ux = dx / length, uy = dy / length, flat = length / 3.5, curve = Math.min(10, Math.max(4, flat));
  const c1x = round(x1 + flat * ux - curve * uy), c1y = round(y1 + flat * uy + curve * ux);
  const c2x = round(x2 - flat * ux - curve * uy), c2y = round(y2 - flat * uy + curve * ux);
  return `M ${x1} ${y1} C ${c1x} ${c1y} ${c2x} ${c2y} ${x2} ${y2} C ${round(c2x - 2 * uy)} ${round(c2y + 2 * ux)} ${round(c1x - 2 * uy)} ${round(c1y + 2 * ux)} ${x1} ${y1} z`;
}

/** Finish only recognized owned ink. All geometry/ownership checks precede
 * SVG changes. The 294 tie uses the existing normal endpoint, with no extra
 * terminal head or extra audio attack. Re-entry never applies transforms twice.
 */
export function presentSourceLayers(tune: SourceTune | undefined, witness?: SourceLayerWitness): void {
  const state = tune?.sourceLayerPresentation;
  if (!witness || !tune || !state || state.presented) return;
  if (state.id !== witness.id) return fail(witness);
  const selectables = tune.engraver?.selectables;
  if (!Array.isArray(selectables)) return fail(witness);
  const geometry = (note: SourceNote) => {
    const abs = note.abselem;
    const selectable = selectables.find(value => value.absEl === abs);
    if (!abs || abs.abcelem !== note || !selectable?.staffPos || !Array.isArray(abs.heads) ||
        abs.heads.length !== note.pitches?.length || !abs.elemset.length) return fail(witness);
    const heads = abs.heads as DrawnHead[];
    if (heads.some(head => !Number.isFinite(head.x) || !Number.isFinite(head.w) || !Number.isFinite(head.pitch) ||
      !head.graphelem || head.graphelem.tagName.toLowerCase() !== 'path' || head.graphelem.getAttribute('data-name') !== head.name)) return fail(witness);
    return { abs, heads, selectable, zero: selectable.staffPos.zero };
  };
  const at = (id: string, q: number): TimedNote => {
    const found = state.normal.get(id)?.filter(event => close(event.q, q)) ?? [];
    if (found.length !== 1) return fail(witness);
    return found[0];
  };
  const moves = new Map<SourceNote, number>();
  const actions: (() => void)[] = [];
  for (const event of state.auxiliary) {
    const own = geometry(event.note);
    if (own.heads.some(head => !close(head.scalex ?? 1, event.layer.small ? 0.6 : 1) || head.stemDir !== event.layer.stem)) return fail(witness);
    for (const group of own.abs.elemset) {
      if (group.hasAttribute('transform')) return fail(witness);
      actions.push(() => {
        group.setAttribute('data-source-layer', `${witness.id}:${event.layer.id}:q${event.q}`);
        group.setAttribute('data-source-layer-owner', event.owner);
        group.setAttribute('data-source-layer-performance', 'display-only');
      });
    }
    let shift = 0;
    if (witness.id === 'psalter152' || witness.id === 'psalter294' && close(event.q, 44) || event.layer.id === 'SOURCE271UPPER') {
      const owner = geometry(at(event.owner, event.q).note);
      const right = Math.max(...owner.heads.map(head => head.x + head.w));
      shift = right + 1 - Math.min(...own.heads.map(head => head.x));
    } else if (event.layer.id === 'SOURCE271LOWER') {
      const owner = geometry(at(event.owner, event.q).note);
      shift = owner.heads[0].x + (owner.heads[0].w - own.heads[0].w) / 2 - own.heads[0].x;
    } else if (witness.id === 'psalter333' && close(event.q, 33)) {
      const owner = geometry(at('B1', 33).note);
      const matching = owner.heads.filter(head => close(head.pitch, own.heads[0].pitch));
      if (matching.length !== 1) return fail(witness);
      shift = matching[0].x - own.heads[0].w - 1 - own.heads[0].x;
    }
    if (!Number.isFinite(shift)) return fail(witness);
    moves.set(event.note, shift);
    if (shift) actions.push(() => {
      for (const group of own.abs.elemset) group.setAttribute('transform', `translate(${shift} 0)`);
      own.abs.x += shift;
      for (const child of new Set(own.abs.children)) child.x += shift;
      for (const position of own.abs.notePositions ?? []) position.x += shift;
      delete (own.selectable as abcjs.Selectable & { dim?: unknown }).dim;
    });
  }
  for (const note of state.mixed) {
    const own = geometry(note);
    const stems = own.abs.children.filter(child => child.type === 'stem');
    if (stems.length !== 1 || !Number.isFinite(stems[0].x)) return fail(witness);
    for (const [index, pitch] of note.pitches!.entries()) if (pitch.sourceLayerSmall) {
      const head = own.heads[index], glyph = head.graphelem!;
      if (head.stemDir !== 'down' || glyph.hasAttribute('transform') || glyph.style.transform ||
          !['noteheads.half', 'noteheads.quarter'].includes(head.c)) return fail(witness);
      const x = stems[0].x, y = own.zero - head.pitch * 3.875;
      actions.push(() => {
        glyph.setAttribute('transform', `translate(${x} ${y}) scale(0.6) translate(${-x} ${-y})`);
        glyph.setAttribute('data-source-small-head', pitch.sourceLayerSmall!);
        glyph.setAttribute('data-source-head-performance', 'display-only');
        delete (own.selectable as abcjs.Selectable & { dim?: unknown }).dim;
      });
    }
  }
  const heldStart = witness.id === 'psalter294' ? state.auxiliary.find(event => close(event.q, 44)) : undefined;
  const heldEnd = witness.id === 'psalter294' ? state.auxiliary.find(event => close(event.q, 46)) : undefined;
  const endpoint = heldEnd ? geometry(at('T2', 46).note) : undefined;
  if (heldEnd && endpoint) {
    const donor = geometry(heldEnd.note);
    if (donor.heads.length !== 1 || endpoint.heads.length !== 1 || !close(donor.heads[0].pitch, endpoint.heads[0].pitch) ||
        donor.heads[0].graphelem!.ownerSVGElement !== endpoint.heads[0].graphelem!.ownerSVGElement) return fail(witness);
    actions.push(() => {
      for (const group of donor.abs.elemset) group.remove();
      donor.abs.invisible = true;
      // ABCJS's coordinate fallback scans selectables even for detached SVG.
      // Remove the hidden duplicate hit target and retain coherent indices.
      selectables.splice(selectables.indexOf(donor.selectable), 1);
      selectables.forEach((selectable, index) => selectable.svgEl.setAttribute('data-index', String(index)));
      endpoint.heads[0].graphelem!.setAttribute('data-source-shared-endpoint', 'psalter294:SOURCE294HELD:q46');
    });
  }
  const tieEvents = state.auxiliary.filter(event => event.note.pitches!.some(pitch => pitch.startTie || pitch.endTie));
  const tieNotes = new Set(tieEvents.map(event => event.note));
  const coveredStart = new Set<SourceNote>(), coveredEnd = new Set<SourceNote>();
  for (const group of tune.engraver?.staffgroups ?? []) for (const voice of group.voices ?? []) for (const raw of voice.otherchildren ?? []) {
    const tie = raw as DrawnTie;
    if (tie?.type !== 'TieElem') continue;
    const first = tie.anchor1?.parent?.abcelem as SourceNote | undefined;
    const last = tie.anchor2?.parent?.abcelem as SourceNote | undefined;
    if (!(first && tieNotes.has(first)) && !(last && tieNotes.has(last))) continue;
    if (!tie.isTie || tie.above || tie.internalNotes?.length || tie.elemset?.length !== 1 ||
        ![tie.startX, tie.endX, tie.startY, tie.endY].every(value => typeof value === 'number' && Number.isFinite(value))) return fail(witness);
    const path = tie.elemset[0];
    if (path.tagName.toLowerCase() !== 'path' || path.getAttribute('data-name') !== 'tie' || path.hasAttribute('transform')) return fail(witness);
    const reference = first && tieNotes.has(first) ? geometry(first) : geometry(last!);
    let x1 = tie.startX! + (first ? moves.get(first) ?? 0 : 0);
    let x2 = tie.endX! + (last ? moves.get(last) ?? 0 : 0);
    if (first && tieNotes.has(first)) coveredStart.add(first);
    if (last && tieNotes.has(last)) coveredEnd.add(last);
    const shared = heldStart && heldEnd && endpoint && first === heldStart.note && last === heldEnd.note;
    if (shared) x2 = endpoint.heads[0].x;
    const d = tiePath(x1, x2, tie.startY!, tie.endY!, reference.zero);
    actions.push(() => {
      path.setAttribute('d', d);
      path.setAttribute('data-source-layer-tie', witness.id);
      tie.startX = x1; tie.endX = x2;
      if (shared && endpoint) tie.anchor2 = endpoint.heads[0];
    });
  }
  for (const event of tieEvents) for (const pitch of event.note.pitches!) {
    if (pitch.startTie && !coveredStart.has(event.note) || pitch.endTie && !coveredEnd.has(event.note)) return fail(witness);
  }
  if (heldEnd && (!coveredEnd.has(heldEnd.note) || !coveredStart.has(heldStart!.note))) return fail(witness);
  for (const action of actions) action();
  state.presented = true;
}

const witnesses: readonly SourceLayerWitness[] = [
  {
    "id": "psalter152",
    "audio": "canonical notes unchanged; source stanza3 praise comma restored",
    "replacements": [],
    "layers": [
      {
        "id": "SOURCE152SMALL",
        "owners": [
          "T2"
        ],
        "clef": "treble",
        "small": true,
        "stem": "down",
        "body": "x2 | x8 | x6 || x2 | x8 | x6 | x2 | x8 | D6 || x2 | x8 | x6 |]",
        "events": [
          {
            "q": 21,
            "duration": 3,
            "count": 1
          }
        ]
      }
    ],
    "source": "T:Fear and Faith\nC:Tune: HOLY GUIDE; Uzziah C. Burnap\nO:Psalm 56, 6s\nM:4/4\nL:1/8\nK:Ab\n%%score (T1 T2) (B1 B2)\n%%stretchlast 1\n% validator: allow-photographed-partial-bars\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\n[V:T1] E2 | E2 F2 G2 A2 | (A4 G2) || F2 | E2 c2 c2 B2 | (A4 G2) |\nw:1.~What time I am a- fraid * I put my trust in Thee; *\nw:2.~In God I put my trust, * I nei- ther doubt nor fear, *\nw:3.~In God, the Lord, I rest, * His word of grace I praise, *\nw:4.~Up- on me are Thy vows, * O God, in Whom I live; *\nw:5.~For Thou hast saved from death, * From fall- ing kept me free, *\n[V:T2] C2 | C2 C2 C2 C2 | D6 || D2 | C2 E2 F2 F2 | E6 |\n[V:B1] E,2 | E,2 E,2 E,2 E,2 | E,6 || F,G, | A,2 A,2 A,=A, B,2 | (C4 B,2) |\n[V:B2] A,,2 | A,,2 A,,2 A,,2 A,,2 | B,,6 || B,,2 | C,2 C,2 D,2 D,2 | E,6 |\n[V:T1] G2 | c2 B2 A2 G2 | (G4 F2) || _F2 | E2 E2 E2 E2 | E6 |]\nw: In God I rest, and praise * His word, so rich and free.\nw: For man can nev- er harm * With God my help- er near.\nw: His prom- ise stands se- cure, * Nor fear nor foe dis- mays.\nw: The sac- ri- fice of praise * To Thee I now will give.\nw: That in the light of life * My walk may be with Thee.\n[V:T2] E2 | =E2 E2 E2 E2 | (=E4 F2) || =B,2 | C2 C2 D2 D2 | C6 |]\n[V:B1] B,2 | B,2 D2 C2 B,2 | (B,4 A,2) || A,2 | A,2 A,2 G,F, G,2 | A,6 |]\n[V:B2] D,2 | C,2 C,2 C,2 C,2 | D,6 || =D,2 | E,2 E,2 E,2 E,2 | A,,6 |]\nW:Copyright, 1895, by Trustees of Presbyterian Board of Publication and Sunday School Work\nW:Used by per.\nW:[Selected Stanzas]"
  },
  {
    "id": "psalter271",
    "audio": "source-normal T2/B2 corrected; cues display-only",
    "replacements": [
      {
        "before": "|| C | D E F G | F3 |",
        "after": "|| C | D E F G | [A,CF]3 |",
        "count": 1
      },
      {
        "before": "|| C, | D, E, F, G, | C,3 |",
        "after": "|| C, | D, E, F, G, | [F,,C,]3 |",
        "count": 1
      },
      {
        "before": "E, | A, A,, B,, B,, | E,2 =F,",
        "after": "[E,,E,] | [A,,A,] A,, B,, B,, | E,2 =F,",
        "count": 1
      }
    ],
    "layers": [
      {
        "id": "SOURCE271UPPER",
        "owners": [
          "T2"
        ],
        "clef": "treble",
        "small": true,
        "stem": "down",
        "body": "x | x4 | x3 || x | x4 | x3 |\nx | x4 | x3 || x | x4 | x3 |\nx | x4 | x3 || [E,_B,] | [F,_B,] [B,C] [B,C] [B,C] | x3 |\nx | x4 | x3 || x | x4 | x3 |]",
        "events": [
          {
            "q": 40,
            "duration": 1,
            "count": 2
          },
          {
            "q": 41,
            "duration": 1,
            "count": 2
          },
          {
            "q": 42,
            "duration": 1,
            "count": 2
          },
          {
            "q": 43,
            "duration": 1,
            "count": 2
          },
          {
            "q": 44,
            "duration": 1,
            "count": 2
          }
        ]
      },
      {
        "id": "SOURCE271LOWER",
        "owners": [
          "B2"
        ],
        "clef": "bass",
        "small": true,
        "stem": "down",
        "body": "x | x4 | x3 || x | x4 | x3 |\nx | x4 | x3 || x | x4 | x3 |\nx | x4 | x3 || C,,- | C,,2 D,, E,, | x3 |\nx | x4 | x3 || x | x4 | x3 |]",
        "events": [
          {
            "q": 40,
            "duration": 1,
            "count": 1
          },
          {
            "q": 41,
            "duration": 2,
            "count": 1
          },
          {
            "q": 43,
            "duration": 1,
            "count": 1
          },
          {
            "q": 44,
            "duration": 1,
            "count": 1
          }
        ]
      }
    ],
    "source": "%abc-2.1\nT:Godly Resolves\nT:SOJOURNER\nC:R. DeWitt Mallary\nN:Psalm 101. 7s and 6s.\nM:4/4\nL:1/4\nK:C\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nC | D E F E | D2 C || D | E F G A | G3 |\nw:1.~Of mer- cy and of jus- tice My thank- ful song shall be;\nw:2.~On what is base and e- vil I will not set my heart;\nw:3.~The faith- ful and the up- right Shall min- is- ter to me;\nG | c c B A | G2 E || E | D G G ^F | G3 |\nw:O Lord, in joy- ful prais- es My song shall rise to Thee.\nw:Trans- gress- ors' ways ab- hor- ring, With them I take no part.\nw:The ly- ing and de- ceit- ful My fa- vor shall not see.\nG | d B A G | e2 c || C | D E F G | A3 |\nw:With- in my house I pur- pose To walk in wis- dom's way;\nw:No fro- ward man or e- vil Shall my com- pan- ion be;\nw:I will in dai- ly judg- ment All wick- ed- ness re- ward,\nB | c c B A | G2 G || F | E C E D | C3 |]\nw:O Lord, I need Thy pres- ence; How long wilt Thou de- lay?\nw:I will not suf- fer slan- der Or pride or treach- er- y.\nw:And cleanse from e- vil- do- ers The cit- y of the Lord.\nV:T2\nC | C C C C | B,2 C || B, | C C C F | E3 |\nE | E E F F | E2 C || _B, | =B, D C C | B,3 |\nG | F F F F | E2 E || C | D E F G | F3 |\n^G | E E ^D D | E2 =D || D | C C B, B, | G,3 |]\nV:B1\nE, | F, G, A, G, | F,2 E, || G, | G, G, G, C | C3 |\nC | G, G, A, B, | C2 G, || G, | G, B, A, A, | G,3 |\nG, | B, D C B, | C2 G, || C, | D, E, F, G, | A,3 |\nD | C A, ^F, B, | B,2 A, || A, | G, G, F, F, | E,3 |]\nV:B2\nC, | C, C, C, C, | G,,2 A,, || G,, | C, D, E, F, | C,3 |\nC, | C, C, C, C, | C,2 C, || ^C, | D, D, D, D, | G,3 |\nG, | G, G, G, G, | C,2 C, || C, | D, E, F, G, | C,3 |\nE, | A, A,, B,, B,, | E,2 =F, || F, | G, E, G,, G,, | C,3 |]\nW:1. Of mercy and of justice My thankful song shall be; O Lord, in joyful praises My song shall rise to Thee. Within my house I purpose To walk in wisdom's way; O Lord, I need Thy presence; How long wilt Thou delay?\nW:2. On what is base and evil I will not set my heart; Transgressors' ways abhorring, With them I take no part. No froward man or evil Shall my companion be; I will not suffer slander Or pride or treachery.\nW:3. The faithful and the upright Shall minister to me; The lying and deceitful My favor shall not see. I will in daily judgment All wickedness reward, And cleanse from evildoers The city of the Lord."
  },
  {
    "id": "psalter294",
    "audio": "normal moving Alto corrected; held Bb3 in display and full-score accompaniment, shared endpoint",
    "replacements": [],
    "layers": [
      {
        "id": "SOURCE294HELD",
        "owners": [
          "T2"
        ],
        "clef": "treble",
        // Editorial size choice (2026-10-03), supported by the NRC re-engraving;
        // the original print's initial held-head size remains unresolved.
        // Only the initial head is visible: presentation removes the auxiliary
        // terminal head and joins the original long tie to the normal Alto Bb3.
        "small": true,
        "stem": "down",
        "body": "x4 | x4 | x4 | x4 | x4 | x4 | x4 | x4 | x4 | x4 | x4 | B,2-B,2 |]",
        "events": [
          {
            "q": 44,
            "duration": 2,
            "count": 1
          },
          {
            "q": 46,
            "duration": 2,
            "count": 1
          }
        ]
      }
    ],
    "source": "%abc-2.1\nT:Praise for Gracious Deliverances\nT:SACRED MORN\nC:William H. Squires\nN:Psalm 107. 7s.\nM:4/4\nL:1/4\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble name=\"Soprano\"\nV:T2 clef=treble name=\"Alto\"\nV:B1 clef=bass name=\"Tenor\"\nV:B2 clef=bass name=\"Bass\"\nV:T1\nG B E F | G A B2 | c B A G | F c B2 | B B c B | c d e2 | d B G B | B c B2 | B e d c | B A3/4 G/4 (G F) | G A B E | E F E2 |]\nw:1.~Men who walk in fol- ly's way, And to e- vil turn a- side, Find that sor- row will re- pay Those who wis- dom's laws de- fied; Down to death's dark por- tals _ led, _ They ab- hor their dai- ly bread.\nw:2.~To Je- ho- vah then they cry In their troub- le, and He saves, Sends com- pas- sion- ate re- ply, Gives the health their spir- it craves, Res- cues them with gra- cious _ aid _ From the snares their fol- ly laid.\nw:3.~Sons of men, a- wake to praise God the Lord Who reigns a- bove, Gra- cious in His works and ways, Won- drous in re- deem- ing love; Let them all thank- of- f'rings _ bring, _ Cel- e- brate His deeds, and sing.\nV:T2\nE E E D | E D E2 | E E D E | D E D2 | E E E E | E A G2 | F F E E | D E D2 | E G A F | B, E (E D) | E E _D C | B,/E/ D B,2 |]\nV:B1\nB, G, G, B, | B, B, B,2 | A, B, B, B, | B, =A, (B, _A,) | G, G, A, G, | A, B, B,2 | B, B, B, B, | B, =A, B,2 | G, B, B, D | E C3/4 B,/4 B,2 | B, A, E, E,/F,/ | G, A, G,2 |]\nV:B2\nE, E, C, B,, | E, F, G,2 | A, G, F, E, | F, F,, B,,2 | E, E, E, E, | A, F, E,2 | B,, D, E, G, | F, F,, B,,2 | E, E, F, A, | G, E, B,,2 | E, C, G,, A,, | B,, B,, E,2 |]\nN:Copyright, 1895, by Trustees of Presbyterian Board of Publication and Sunday School Work. Used by per.\nN:[Stanzas 9-11]\nW:1. Men who walk in folly's way, And to evil turn aside, Find that sorrow will repay Those who wisdom's laws defied; Down to death's dark portals led, They abhor their daily bread.\nW:2. To Jehovah then they cry In their trouble, and He saves, Sends compassionate reply, Gives the health their spirit craves, Rescues them with gracious aid From the snares their folly laid.\nW:3. Sons of men, awake to praise God the Lord Who reigns above, Gracious in His works and ways, Wondrous in redeeming love; Let them all thank-off'rings bring, Celebrate His deeds, and sing."
  },
  {
    "id": "psalter319",
    "audio": "canonical unchanged; displayed rest/cue roles do not certify current sung ownership",
    "replacements": [],
    "layers": [
      {
        "id": "SOURCE319SMALL",
        "owners": [
          "B1",
          "B2"
        ],
        "clef": "bass",
        "small": true,
        "stem": "down",
        "body": "x | x3 | x3 | x3 | x2 || x | x3 | x3 | x3 | x2 || E, | C,2 C, | F,2 F, | B,,2 B,, | E,2 || x | x3 | x3 | x3 | x2 |]",
        "events": [
          {
            "q": 24,
            "duration": 1,
            "count": 1
          },
          {
            "q": 25,
            "duration": 2,
            "count": 1
          },
          {
            "q": 27,
            "duration": 1,
            "count": 1
          },
          {
            "q": 28,
            "duration": 2,
            "count": 1
          },
          {
            "q": 30,
            "duration": 1,
            "count": 1
          },
          {
            "q": 31,
            "duration": 2,
            "count": 1
          },
          {
            "q": 33,
            "duration": 1,
            "count": 1
          },
          {
            "q": 34,
            "duration": 2,
            "count": 1
          }
        ]
      }
    ],
    "source": "%abc-2.1\nT:Deliverance and Victory\nT:STONEFIELD\nC:Samuel Stanley\nO:The Psalter, 1912\nS:Annotated photo 20260829_112848.jpg\nN:Psalm 118. L. M.\nM:3/4\nL:1/4\nK:Eb\n%%score { ( T1 T2 ) ( B1 B2 ) }\n%%stretchlast 1\nV:T1 clef=treble name=\"Soprano\"\nV:T2 clef=treble name=\"Alto\"\nV:B1 clef=bass name=\"Tenor\"\nV:B2 clef=bass name=\"Bass\"\nV:T1\nE | (G3/4 A/4 G) F | E2 B | (B c) d | e2 || e | e2 e | d2 B | (c B) =A | B2 || B | (B c/B/) A/G/ | A2 A | (A B/A/) G/F/ | G2 || B | (B c) d | e2 B | (B/A/ G) F | E2 |]\nw:1.~Give thanks _ _ and praise to God _ a- bove, For ev- er- last- ing is _ His love; Praise Him, _ _ ye _ saints, your Sav- _ _ iour _ praise, For- ev- _ er good in all _ _ His ways.\nw:2.~Let all _ _ His serv- ants tell _ a- broad The nev- er- fail- ing grace _ of God; Let all _ _ who _ fear Je- ho- _ _ vah's _ Name His ev- _ er- last- ing love _ _ pro- claim.\nw:3.~In bond- _ _ age of dis- tress _ and grief To God I cried, and sought _ re- lief; In won- _ _ drous _ love He heard _ _ my _ plea And set _ my soul at lib- _ _ er- ty.\nw:4.~Though foes _ _ as- sail I will _ not fear, For at my side the Lord _ is near; The Lord _ _ my _ help- er, I _ _ shall _ win The vic- _ 'try o'er the hosts _ _ of sin.\nw:5.~Who put _ _ their trust in God _ Most High On ev- er- last- ing strength _ re- ly; Their con- _ _ fi- _ dence shall pass _ _ a- _ way Who make _ the arm of flesh _ _ their stay.\nV:T2\nE | E2 D | E2 E | E2 A | G2 || G | E2 G | F2 F | (G F) F | F2 || G | (G A/G/) F/=E/ | F2 F | (F G/F/) E/D/ | E2 || G | E2 A | G2 E/G/ | (G/F/ E) D | E2 |]\nV:B1\nG, | (B,3/4 C/4 B,) A, | G,2 E | E2 B, | B,2 || B, | B,2 B, | (B, F) F | (E D) C | D2 || E, | C,2 C, | F,2 F, | B,,2 B,, | E,2 || E | E2 B, | B,2 B, | (B,/C/ B,) A, | G,2 |]\nV:B2\nE, | E,2 B,, | C,2 G, | (G, A,) F, | E,2 || E, | G,2 E, | B,2 D, | (E, F,) F, | B,,2 || E, | C,2 C, | F,2 F, | B,,2 B,, | E,2 || E, | (G, A,) F, | E,2 G, | (G,/A,/ B,) B,, | E,2 |]\nW:1. Give thanks and praise to God above, For everlasting is His love; Praise Him, ye saints, your Saviour praise, Forever good in all His ways.\nW:2. Let all His servants tell abroad The never-failing grace of God; Let all who fear Jehovah's Name His everlasting love proclaim.\nW:3. In bondage of distress and grief To God I cried, and sought relief; In wondrous love He heard my plea And set my soul at liberty.\nW:4. Though foes assail I will not fear, For at my side the Lord is near; The Lord my helper, I shall win The vict'ry o'er the hosts of sin.\nW:5. Who put their trust in God Most High On everlasting strength rely; Their confidence shall pass away Who make the arm of flesh their stay."
  },
  {
    "id": "psalter333",
    "audio": "canonical unchanged",
    "replacements": [],
    "layers": [
      {
        "id": "SOURCE333SMALL",
        "owners": [
          "B1"
        ],
        "clef": "bass",
        "small": true,
        "stem": "up",
        "body": "x6 | x6 | x6 | x6 || x6 | x6 | x6 | x6 || x6 | x6 | x6 | C2 B,2 G,2 || x6 | x6 | x6 | x6 |]",
        "events": [
          {
            "q": 33,
            "duration": 1,
            "count": 1
          },
          {
            "q": 34,
            "duration": 1,
            "count": 1
          },
          {
            "q": 35,
            "duration": 1,
            "count": 1
          }
        ]
      }
    ],
    "source": "%abc-2.1\nT:The Profit of Bible Study\nC:Tune: ALETTA; William B. Bradbury\nM:3/4\nL:1/8\nK:F\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\n(A2 c2) F2 | G4 G2 | (G2 F2) G2 | A6 ||\nw:1.~How * I love Thy law, * O Lord!\nw:2.~Thy * com- mand- ments in * my heart\nw:3.~While * my heart Thy word * o- beys,\nw:4.~Sweet- * er are Thy words * to me\n(A2 c2) F2 | G4 G2 | (G2 A2) G2 | F6 ||\nw:Dai- * ly joy its truths * af- ford;\nw:Tru- * est wis- dom can * im- part;\nw:I * am kept from e- * vil ways;\nw:Than * all oth- er good * can be;\nB4 B2 | A4 A2 | G4 F2 | c6 ||\nw:In its con- stant light I go,\nw:To my eyes Thy pre- cepts show\nw:From Thy law, with Thee to guide,\nw:Safe I walk, Thy truth my light,\n(c2 A2) F2 | G4 G2 | (G2 A2) G2 | F6 |]\nw:Wise * to con- quer ev- * 'ry foe.\nw:Wis- * dom more than sa- * ges know.\nw:I * have nev- er turned * a- side.\nw:Hat- * ing false- hood, lov- * ing right.\nV:T2\nF4 F2 | E4 E2 | (E2 D2) E2 | F6 ||\nF4 F2 | E4 E2 | E4 E2 | F6 ||\nF4 F2 | F4 F2 | C4 D2 | E6 ||\nF4 F2 | E4 E2 | E4 E2 | F6 |]\nV:B1\n(C2 A,2) A,2 | C4 C2 | C4 C2 | C6 ||\n(C2 A,2) A,2 | C4 C2 | (B,2 C2) B,2 | A,6 ||\nD4 D2 | C4 C2 | C4 =B,2 | C6 ||\n(A,2 C2) A,2 | G,4 B,2 | (B,2 C2) B,2 | A,6 |]\nV:B2\nF,4 F,2 | C,4 C,2 | C,4 C,2 | F,6 ||\nF,4 F,2 | C,4 C,2 | C,4 C,2 | F,6 ||\nF,4 F,2 | F,4 F,2 | E,4 D,2 | C,6 ||\nF,4 F,2 | C,4 C,2 | C,4 C,2 | F,6 |]\nW:1. How I love Thy law, O Lord! Daily joy its truths afford; In its constant light I go, Wise to conquer every foe.\nW:\nW:2. Thy commandments in my heart Truest wisdom can impart; To my eyes Thy precepts show Wisdom more than sages know.\nW:\nW:3. While my heart Thy word obeys, I am kept from evil ways; From Thy law, with Thee to guide, I have never turned aside.\nW:\nW:4. Sweeter are Thy words to me Than all other good can be; Safe I walk, Thy truth my light, Hating falsehood, loving right."
  }
];
