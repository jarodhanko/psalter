import abcjs from 'abcjs';

// Photographed No. 226: six original organ/divisi voices, Eb-to-C at q32.
// The change is midline; the later authored line begins q41 without a new key.
// Bind the independent complete witness before any display transformations.
const sourceWitness = `%abc-2.1
T:Longings for Sanctuary Fellowship
C:Tune: AUDITE AUDIENTES ME; Arthur S. Sullivan
O:Psalm 84 C. M.
M:4/4
L:1/4
K:Eb
%%score (T1 T2 T3)(B1 B2 B3)
%%stretchlast 1
% validator: allow-photographed-partial-bars
V:T1 clef=treble
V:T2 clef=treble
V:T3 clef=treble
V:B1 clef=bass
V:B2 clef=bass
V:B3 clef=bass
[V:T1] "^Voices in Unison"G | G G F G | A A G | G | c G E D | C3 | G | G G F G |
w:1.~O Lord of Hosts, to Thee I cry, Our fa-thers' God, to Thee; Let my pe-ti-tion
w:2.~A sin-gle day with-in Thy courts, Where I Thy beau-ty see, Is bet-ter than a
w:3.~A sun and shield is God, the Lord, To light-en and de-fend; The Lord to such as
[V:T2] "_Organ"z | E2 D E | F2 E | z | x4 | x3 | z | E2-E2 |
[V:T3] x | C2-C2 | C2-C | x | x4 | x3 | x | _B,2 A, B, |
[V:B1] z | G,2 F, G, | A,2 G, | z | [G,C]3 [G,=B,] | [E,G,C]3 | z | E,2-E,2 |
[V:B2] x | C,2-C,2 | C,2-C, | x | E,3 F, | C,,3 | x | E,,2-E,,2 |
[V:B3] x | x4 | x3 | x | G,,4 | x3 | x | x4 |
[V:T1] A A G | G | F F c c | =B3 || [K:C] "^Voices in Harmony"G/F/ | G A G E | F G F | D |
w:reach Thy ear, My prayer ac-cept-ed be; O _ God our shield, look Thou on us, Re-
w:thou-sand days, My God, a-part from Thee. A _ low-ly sta-tion in Thy house Were
w:look to Him Will grace and glo-ry send; To _ those that walk in right-eous-ness No
[V:T2] E2-E | z | F2 ^F2 | G3 || [K:C] x | E E E C | B, B, B, | B, |
[V:T3] C2 B, | x | C2-C2 | [=B,D]3 || [K:C] x | x4 | x3 | x |
[V:B1] E,2-E, | z | F,2 ^F,2 | G,3 || [K:C] [G,B,] | C C C G, | G, G, G, | G, |
[V:B2] (A,,2 E,,) | x | A,,2-A,,2 | G,,3 || [K:C] x | C, G,, C, E, | D, G,, D, | F, |
[V:B3] x3 | x | x4 | x3 || [K:C] x | x4 | x3 | x |
[V:T1] G c B A | B3 | G | G e e d | c G B | A | G C E D | C3 |]
w:veal Thy-self in grace, And let Thy own a-noint-ed one Be-hold Thee face to face.
w:dear-er to my heart Than in the tents of wick-ed-ness To claim the chief-est part.
w:good will He de-ny; O Lord of Hosts, how blest are they Who on Thy grace re-ly.
[V:T2] C G G ^F | G3 | F | E G G G | G G G | F | E C C B, | C3 |]
[V:T3] x4 | x3 | x | x4 | x3 | x | x4 | x3 |]
[V:B1] G, G,/A,/ B, C | B,3 | D | C C B, B, | C C C | C | C E, G, F, | E,3 |]
[V:B2] E, _E, D, D, | G,3 | B, | C G, F, F, | E, E, F, | D, | G, G,, G,, G,, | C,3 |]
[V:B3] x4 | x3 | x | x4 | x3 | x | x4 | x3 |]
W:1. O Lord of Hosts, to Thee I cry,
W:Our fathers' God, to Thee;
W:Let my petition reach Thy ear,
W:My prayer accepted be;
W:O God our shield, look Thou on us,
W:Reveal Thyself in grace,
W:And let Thy own anointed one
W:Behold Thee face to face.
W:
W:2. A single day within Thy courts,
W:Where I Thy beauty see,
W:Is better than a thousand days,
W:My God, apart from Thee.
W:A lowly station in Thy house
W:Were dearer to my heart
W:Than in the tents of wickedness
W:To claim the chiefest part.
W:
W:3. A sun and shield is God, the Lord,
W:To lighten and defend;
W:The Lord to such as look to Him
W:Will grace and glory send;
W:To those that walk in righteousness
W:No good will He deny;
W:O Lord of Hosts, how blest are they
W:Who on Thy grace rely.
W:
W:[Stanzas 4-6]`;

export function hasPsalter226KeySignatureSource(songId: string, abc: string): boolean {
  return songId === 'psalter226' && abc.replace(/\r\n/g, '\n') === sourceWitness;
}

const reviewedEngine = 'abcjs-basic v6.7.0';
const keyNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export interface Psalter226Display {
  readonly abc: string;
  readonly transpose: number;
  readonly initialKey: string;
  readonly changedKey: string;
}

// Only a preparation bound to the complete witness may authorize projection.
const preparedSources = new WeakSet<Psalter226Display>();

function destinationKeys(transpose: number) {
  if (!Number.isInteger(transpose) || transpose < -10 || transpose > 12) return;
  return {
    initialKey: keyNames[(3 + transpose + 12) % 12],
    changedKey: keyNames[(transpose + 12) % 12],
  };
}

/** Keep the caption's spelling identical to strTranspose, including Gb. The
 * witness is major; other arrangements retain the ordinary mode/caption path.
 */
export function psalter226DisplayKey(songId: string, abc: string, transpose: number): string | undefined {
  if (!hasPsalter226KeySignatureSource(songId, abc) || abcjs.signature !== reviewedEngine) return;
  const keys = destinationKeys(transpose);
  return keys ? `${keys.initialKey} Major` : undefined;
}

// Compare musical meaning, not layout positions or the cancellation naturals
// that ABCJS adds to the genuine transition or repeats in a captured header.
function keyMeaning(key: abcjs.KeySignature | undefined): string | undefined {
  if (!key || typeof key !== 'object' || typeof key.root !== 'string' || !/^[A-G]$/.test(key.root) ||
      !['', '#', 'b'].includes(key.acc) || key.mode !== '' || !Array.isArray(key.accidentals)) return;
  const values: Record<string, number | undefined> = { natural: 0, sharp: 1, flat: -1, dblsharp: 2, dblflat: -2 };
  const alterations = [0, 0, 0, 0, 0, 0, 0];
  const seen = new Set<number>();
  for (let index = 0; index < key.accidentals.length; index++) {
    const accidental: abcjs.Accidental | undefined = key.accidentals[index];
    if (!accidental || typeof accidental !== 'object' || typeof accidental.note !== 'string' ||
        typeof accidental.acc !== 'string') return;
    const letter: string = accidental.note.toUpperCase();
    if (!/^[A-G]$/.test(letter)) return;
    const letterIndex = letter.charCodeAt(0) - 65, value = values[accidental.acc];
    if (typeof value !== 'number' || seen.has(letterIndex)) return;
    seen.add(letterIndex);
    alterations[letterIndex] = value;
  }
  return `${key.root}${key.acc}:${key.mode}:${alterations.join(',')}`;
}

function expectedMeaning(key: string): string {
  const counts: Record<string, number> = { C: 0, Db: -5, D: 2, Eb: -3, E: 4, F: -1, Gb: -6, G: 1, Ab: -4, A: 3, Bb: -2, B: 5 };
  const count = counts[key], alterations = [0, 0, 0, 0, 0, 0, 0];
  for (const letter of (count < 0 ? 'BEADGCF' : 'FCGDAEB').slice(0, Math.abs(count))) {
    alterations[letter.charCodeAt(0) - 65] = Math.sign(count);
  }
  return `${key}::${alterations.join(',')}`;
}

// The engine's major-key spelling/order, including octave case. Cancellation
// naturals retain the old signature's spelling and precede the new signature.
function signatureAccidentals(key: string) {
  const counts: Record<string, number> = { C: 0, Db: -5, D: 2, Eb: -3, E: 4, F: -1, Gb: -6, G: 1, Ab: -4, A: 3, Bb: -2, B: 5 };
  const count = counts[key];
  return [...(count < 0 ? 'BeAdGcF' : 'fcgdAeB').slice(0, Math.abs(count))].map(note => ({
    note, acc: count < 0 ? 'flat' : 'sharp',
  }));
}

// Restricted to this witness's ordinary treble/bass clefs. Derive absolute
// positions using the reviewed addPosToKey rule, never an octave-blind offset.
function keyPosition(accidental: abcjs.Accidental, bass: boolean): number {
  const pitches: Record<string, number> = { A: 5, B: 6, C: 0, D: 1, E: 2, F: 3, G: 4, a: 12, b: 13, c: 7, d: 8, e: 9, f: 10, g: 11 };
  let position = pitches[accidental.note];
  if (bass) {
    position += 5; // -(-12), followed by the engine's first -7 shift.
    if (position >= 11 || (position === 10 && accidental.acc === 'flat')) position -= 7;
    if (accidental.note === 'A' && accidental.acc === 'sharp') position -= 7;
    if ((accidental.note === 'G' || accidental.note === 'F') && accidental.acc === 'flat') position -= 7;
  }
  return position;
}

function positionedGenuineKey(
  item: abcjs.VoiceItemKey, bass: boolean,
  keys: { initialKey: string; changedKey: string },
  capturedSoloBass: boolean,
): abcjs.VoiceItemKey | undefined {
  if (Object.keys(item).sort().join(',') !== 'acc,accidentals,el_type,endChar,mode,root,startChar' ||
      !Array.isArray(item.accidentals)) return;
  const destination = signatureAccidentals(keys.changedKey);
  const cancelled = signatureAccidentals(keys.initialKey)
    .filter(old => !destination.some(next => next.note.toUpperCase() === old.note.toUpperCase()))
    .map(old => ({ ...old, acc: 'natural' }));
  const expected = [...cancelled, ...destination];
  if (item.accidentals.length !== expected.length || item.accidentals.some((accidental, index) =>
    !accidental || Object.keys(accidental).sort().join(',') !== 'acc,note,verticalPos' ||
    accidental.acc !== expected[index].acc || accidental.note !== expected[index].note ||
    !Number.isInteger(accidental.verticalPos))) return;
  const alreadyPositioned = item.accidentals.every(accidental => accidental.verticalPos === keyPosition(accidental, bass));
  const treblePositioned = item.accidentals.every(accidental => accidental.verticalPos === keyPosition(accidental, false));
  // A source-owned singleton bass lane shares this engine form:
  // every cancellation natural has owning-bass coordinates, followed by
  // every destination accidental at treble coordinates. Both complete
  // segments must exist; symbol identity/order was checked above.
  const capturedSplit = capturedSoloBass && bass && cancelled.length > 0 && destination.length > 0 &&
    item.accidentals.slice(0, cancelled.length).every(accidental =>
      accidental.verticalPos === keyPosition(accidental, true)) &&
    item.accidentals.slice(cancelled.length).every(accidental =>
      accidental.verticalPos === keyPosition(accidental, false));
  if (!alreadyPositioned && !treblePositioned && !capturedSplit) return;
  if (alreadyPositioned) return item;
  // Do not use ABCJS fixKey: it shallow-copies and mutates shared accidentals.
  // Replace this voice occurrence, leaving every alias and audio tune intact.
  return { ...item, accidentals: item.accidentals.map(accidental => ({
    ...accidental, verticalPos: keyPosition(accidental, bass),
  })) };
}

// Reflow may carry a destination signature in treble coordinates into a bass
// header. Any source-owned singleton lane also repeats the q32 cancellations
// at the q41 authored header: ABCJS retains impliedNaturals when the next
// inline voice is unchanged. Admit only that complete source-owned suffix.
function positionedHeaderKey(
  key: abcjs.KeySignature | undefined, bass: boolean, expectedKey: string,
  repeatedCancellationKey?: string,
): abcjs.KeySignature | undefined {
  if (!key || typeof key !== 'object' || Object.keys(key).sort().join(',') !== 'acc,accidentals,mode,root' ||
      !Array.isArray(key.accidentals)) return;
  const destination = signatureAccidentals(expectedKey);
  const cancelled = repeatedCancellationKey === undefined ? [] : signatureAccidentals(repeatedCancellationKey)
    .filter(old => !destination.some(next => next.note.toUpperCase() === old.note.toUpperCase()))
    .map(old => ({ ...old, acc: 'natural' }));
  const repeated = cancelled.length > 0 && key.accidentals.length === destination.length + cancelled.length;
  const expected = repeated ? [...destination, ...cancelled] : destination;
  if (key.accidentals.length !== expected.length) return;
  // Index explicitly: Array.some/every skip sparse holes. Validate structure
  // before keyMeaning so malformed arrays and members reject without throwing.
  for (let index = 0; index < expected.length; index++) {
    const accidental = key.accidentals[index];
    if (!accidental || typeof accidental !== 'object' ||
        Object.keys(accidental).sort().join(',') !== 'acc,note,verticalPos' ||
        accidental.acc !== expected[index].acc || accidental.note !== expected[index].note ||
        !Number.isInteger(accidental.verticalPos)) return;
  }
  if (keyMeaning(key) !== expectedMeaning(expectedKey)) return;
  const owning = key.accidentals.every(accidental => accidental.verticalPos === keyPosition(accidental, bass));
  const treble = key.accidentals.every(accidental => accidental.verticalPos === keyPosition(accidental, false));
  if (repeated ? !owning : !owning && !treble) return;
  if (owning && !repeated) return key;
  // Drop only the validated repeated cancellation suffix, and clone all
  // retained destination accidentals. Every old alias remains unchanged.
  return { ...key, accidentals: key.accidentals.slice(0, destination.length).map(accidental => ({
    ...accidental, verticalPos: keyPosition(accidental, bass),
  })) };
}

interface KeySignatureEdits {
  removals: Map<abcjs.VoiceItem[], Set<abcjs.VoiceItem>>;
  replacements: Array<{ voice: abcjs.VoiceItem[]; index: number; key: abcjs.VoiceItemKey }>;
  headers: Array<{ staff: NonNullable<abcjs.TuneLine['staff']>[number]; key: abcjs.KeySignature }>;
}

/** Validate every staff, source owner and key before proposing any mutation.
 * The only synthetic events admitted are equal q41 duplicates. Genuine
 * q32 keys retain their midline source spans and cancellation meaning. This
 * validates preparation without projecting it; the separate disposable
 * string-transposition view explicitly handles the engine event-tag mismatch.
 */
function keySignatureEdits(
  tune: abcjs.TuneObject, selectedAbc: string,
  keys: { initialKey: string; changedKey: string },
): KeySignatureEdits | undefined {
  if (tune.warnings?.length || abcjs.signature !== reviewedEngine) return;
  const scores = selectedAbc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1 ||
      (selectedAbc.match(/^M:[^\r\n]*$/gm) ?? []).join('\n') !== 'M:4/4' ||
      (selectedAbc.match(/^L:[^\r\n]*$/gm) ?? []).join('\n') !== 'L:1/4' ||
      (selectedAbc.match(/^K:[^\r\n]*$/gm) ?? []).join('\n') !== `K:${keys.initialKey}`) return;
  const groups = (scores[0].match(/\([^)]*\)/g) ?? []).map(group => group.slice(1, -1).split(' '));
  const validGroup = (group: string[], expected: string[]) => group.length > 0 &&
    expected.filter(id => group.includes(id)).join(' ') === group.join(' ');
  const upper = (group: string[]) => validGroup(group, ['T1', 'T2', 'T3']);
  const lower = (group: string[]) => validGroup(group, ['B1', 'B2', 'B3']);
  const groupText = groups.map(group => `(${group.join(' ')})`);
  if (!groups.length || groups.length > 2 ||
      ![groupText.join(' '), groupText.join('')].some(text => scores[0] === `%%score ${text}`) ||
      (groups.length === 1 ? !(upper(groups[0]) || lower(groups[0])) :
        !upper(groups[0]) || !lower(groups[1]))) return;
  const ids = groups.flat(), changedToken = `[K:${keys.changedKey}]`;
  const definitions = selectedAbc.match(/^V:[^\r\n]*$/gm) ?? [];
  const inlineKeys = selectedAbc.match(/\[K:[^\]]*\]/g) ?? [];
  if (definitions.join('\n') !== ids.map(id => `V:${id} clef=${id[0] === 'T' ? 'treble' : 'bass'}`).join('\n') ||
      inlineKeys.length !== ids.length || inlineKeys.some(token => token !== changedToken)) return;
  const voiceStarts = [...selectedAbc.matchAll(/\[V:([^\]]+)\]/g)];
  if (voiceStarts.some(match => !ids.includes(match[1]))) return;
  const owned = (start: number, end: number, id: string) => {
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > selectedAbc.length) return false;
    for (let index = voiceStarts.length - 1; index >= 0; index--) {
      const block = voiceStarts[index];
      if (block.index! + block[0].length <= start) {
        return block[1] === id && end <= (voiceStarts[index + 1]?.index ?? selectedAbc.length);
      }
    }
    return false;
  };
  const initialMeaning = expectedMeaning(keys.initialKey), changedMeaning = expectedMeaning(keys.changedKey);
  const states = groups.map(group => group.map(() => ({ quarter: 0, lastBar: -1, changes: 0, key: initialMeaning, removed: new Set<number>() })));
  const removals = new Map<abcjs.VoiceItem[], Set<abcjs.VoiceItem>>();
  const replacements: KeySignatureEdits['replacements'] = [];
  const headers: KeySignatureEdits['headers'] = [];
  for (const line of tune.lines) {
    if (!line.staff) continue;
    if (line.staff.length !== groups.length) return;
    for (const [staffIndex, staff] of line.staff.entries()) {
      if (staff.voices?.length !== groups[staffIndex].length ||
          staff.clef?.type !== (groups[staffIndex][0][0] === 'T' ? 'treble' : 'bass') ||
          staff.clef.verticalPos !== (groups[staffIndex][0][0] === 'T' ? 0 : -12) ||
          staff.clef.clefPos !== (groups[staffIndex][0][0] === 'T' ? 4 : 8)) return;
      const expectedHeader = states[staffIndex][0].changes === 0 ? keys.initialKey : keys.changedKey;
      const repeatedCancellationKey = ids.length === 1 &&
        states[staffIndex][0].quarter === 41 && states[staffIndex][0].changes === 1 ? keys.initialKey : undefined;
      const positionedHeader = positionedHeaderKey(staff.key, staff.clef.type === 'bass', expectedHeader, repeatedCancellationKey);
      if (!positionedHeader) return;
      if (positionedHeader !== staff.key) headers.push({ staff, key: positionedHeader });
      const headerKey = keyMeaning(staff.key);
      for (const [voiceIndex, voice] of staff.voices.entries()) {
        const state = states[staffIndex][voiceIndex], id = groups[staffIndex][voiceIndex];
        if (headerKey !== state.key) return;
        for (const [itemIndex, item] of voice.entries()) {
          if (item.el_type === 'note') {
            if (!(item.duration > 0) || !Number.isFinite(item.duration) || 'startTriplet' in item || 'endTriplet' in item ||
                !owned(item.startChar, item.endChar, id)) return;
            state.quarter += item.duration * 4;
          } else if (item.el_type === 'bar') {
            if (!owned(item.startChar, item.endChar, id)) return;
            state.lastBar = state.quarter;
          } else if (item.el_type === 'key') {
            const meaning = keyMeaning(item);
            if (!meaning || state.lastBar !== state.quarter) return;
            if (item.startChar >= 0 && item.endChar > item.startChar) {
              if (state.quarter !== 32 || state.changes !== 0 || !owned(item.startChar, item.endChar, id) ||
                  selectedAbc.slice(item.startChar, item.endChar) !== changedToken || meaning !== changedMeaning ||
                  /^[ \t]*(?:\n|$)/.test(selectedAbc.slice(item.endChar))) return;
              const capturedSoloBass = ids.length === 1 && ['B1', 'B2', 'B3'].includes(id);
              const positioned = positionedGenuineKey(item, staff.clef.type === 'bass', keys, capturedSoloBass);
              if (!positioned) return;
              if (positioned !== item) replacements.push({ voice, index: itemIndex, key: positioned });
              state.changes = 1;
              state.key = meaning;
            } else {
              if (item.startChar !== -1 || item.endChar !== -1 || state.changes !== 1 ||
                  state.quarter !== 41 || meaning !== state.key || state.removed.has(state.quarter)) return;
              state.removed.add(state.quarter);
              const pending = removals.get(voice) ?? new Set<abcjs.VoiceItem>();
              pending.add(item);
              removals.set(voice, pending);
            }
          } else if (item.el_type !== 'stem') return;
        }
      }
    }
  }
  if (states.some(staff => staff.some(state => state.quarter !== 64 || state.changes !== 1 || state.key !== changedMeaning))) return;
  return { removals, replacements, headers };
}

/** Prepare the complete source exactly once, before learner/selection work.
 * Unrecognized source/engine contexts keep their ordinary rendering path.
 * A recognized source with failed preparation throws rather than displaying
 * untransposed notes with a zero visualTranspose setting.
 */
export function preparePsalter226Display(songId: string, abc: string, transpose: number): Psalter226Display | undefined {
  if (!hasPsalter226KeySignatureSource(songId, abc) || abcjs.signature !== reviewedEngine) return;
  const keys = destinationKeys(transpose);
  if (!keys) throw new Error('Unsupported Psalter 226 display transposition.');
  const parsed = abcjs.parseOnly(sourceWitness, { visualTranspose: 0 });
  if (parsed.length !== 1 || !keySignatureEdits(parsed[0], sourceWitness, { initialKey: 'Eb', changedKey: 'C' })) {
    throw new Error('Unable to validate the Psalter 226 display source.');
  }
  // strTranspose 6.7.0 tests for "keySignature", while its parser emits
  // "key". Adapt only validated source-owned keys on a disposable view.
  // The original tune, every note/rest, header and audio input stays untouched.
  const transpositionView: abcjs.TuneObject = {
    ...parsed[0],
    lines: parsed[0].lines.map(line => ({
      ...line,
      ...(line.staff ? { staff: line.staff.map(staff => ({
        ...staff,
        voices: staff.voices!.map(voice => voice.map(item => item.el_type === 'key'
          ? { ...item, el_type: 'keySignature' } as unknown as abcjs.VoiceItem
          : item)),
      })) } : {}),
    })),
  };
  const prepared = transpose === 0 ? sourceWitness : abcjs.strTranspose(sourceWitness, [transpositionView], transpose);
  const result = transpose === 0 ? parsed : abcjs.parseOnly(prepared, { visualTranspose: 0 });
  if (!/^%%score \(T1 T2 T3\)\(B1 B2 B3\)$/m.test(prepared) ||
      result.length !== 1 || !keySignatureEdits(result[0], prepared, keys)) {
    throw new Error('Unable to validate the transposed Psalter 226 display source.');
  }
  const display = Object.freeze({ abc: prepared, transpose, ...keys });
  preparedSources.add(display);
  return display;
}

/** Display-only afterParsing projection. Correct owning-clef coordinates in
 * genuine keys and exact recurring headers, preserving genuine cancellations
 * and removing only exact source-singleton q41 repeated header cancellations.
 * Never apply to detached/audio tunes. Validate the complete edit plan before replacing any object.
 */
export function presentPsalter226KeySignatures(
  tune: abcjs.TuneObject, selectedAbc: string, display: Psalter226Display | undefined,
): boolean {
  if (!display || !preparedSources.has(display)) return false;
  const edits = keySignatureEdits(tune, selectedAbc, display);
  if (!edits) return false;
  for (const { staff, key } of edits.headers) staff.key = key;
  for (const { voice, index, key } of edits.replacements) voice[index] = key;
  for (const [voice, pending] of edits.removals) {
    for (let index = voice.length - 1; index >= 0; index--) if (pending.has(voice[index])) voice.splice(index, 1);
  }
  return true;
}
