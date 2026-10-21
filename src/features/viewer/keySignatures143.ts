import abcjs from 'abcjs';

// RFPA pp216–217: one Bb-to-G change at q32; no new key at q48.
// Bind the independent complete witness before any display transformations.
const sourceWitness = `T:Prayer for Pardon and Cleansing
C:Tune: VOX DILECTI; John B. Dykes
O:Psalm 51, C. M.
M:4/4
L:1/8
K:Bb
%%score (T1 T2) (B1 B2)
%%stretchlast 1
% validator: allow-photographed-partial-bars
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
[V:T1] D2 | D2 G2 G2 A2 | B3 B H A2 || A2 | G2 G2 G2 G2 | ^F6 |
w:1.~O God, ac-cord-ing to Thy grace Be mer-ci-ful to me,
w:2.~A-gainst Thee on-ly have I sinned, Done e-vil in Thy sight;
w:3.~From all pol-lu-tion make me clean, Yea, whit-er than the snow;
w:4.~From out Thy pres-ence cast me not, Thy face no more to see;
[V:T2] x2 | [B,D]6 [C F]2 | [D F]4 [C F]2 || E2 | D2 D2 C2 E2 | D6 |
[V:B1] D,2 | D,2 G,2 G,2 A,2 | B,3 B, A,2 || C2 | B,2 B,2 G,2 C2 | A,6 |
[V:B2] x2 | [G,,G,]6 ([F,,F,]2 | [B,,F,]4) !invertedfermata![F,,F,]2 || F,2 | G,2 G,2 E,2 C,2 | D,6 |
[V:T1] D2 | D2 G2 G2 A2 | B3 c A2 || d2 | c2 B2 A2 G2 | D6 | [K:G]
w: In Thy a-bound-ing love blot out All my in-iq-ui-ty;
w: Lord, in Thy judg-ment Thou art just, And in Thy sen-tence right.
w: O let my bro-ken heart re-joice And glad-ness make me know;
w: Thy Ho-ly Spir-it and His grace Take not a-way from me.
[V:T2] x2 | D2 D2 E2 E2 | D3 D D2 || D2 | G2 D2 E2 =E2 | D6 | [K:G]
[V:B1] A,2 | B,2 B,2 B,2 C2 | B,2 G,2 A,2 || A,2 | G,2 G,2 A,2 A,G, | ^F,6 | [K:G]
[V:B2] ^F,2 | G,2 G,2 E,2 C,2 | G,,2 G,2 F,2 || F,2 | E,2 D,2 C,2 ^C,2 | D,6 | [K:G]
[V:T1] DC | D2 B2 A2 G2 | G2 E2 D2 || D2 | G2 AB c2 BA | A6 |
w: O * wash me whol-ly from my guilt And make me * clean with- * in,
w: Be- * hold, in e-vil I was formed, And I was * born in * sin,
w: Blot * out all my in-iq-ui-ties, And hide my * sins from * view;
w: Re- * store me Thy sal-va-tion's joy, My will-ing * heart up- * hold;
[V:T2] x2 | B,2 D2 C2 B,2 | E2 C2 B,2 || A,2 | B,2 CD EF G2 | F6 |
[V:B1] B,A, | G,3 D, E,F, G,2 | G,2 G,2 G,2 || A,2 | G,2 G,F, G,A, B,C | D6 |
[V:B2] D,2 | x2 G,,2 G,,2 G,,2 | C,2 E,2 G,2 || F,2 | E,2 E,D, C,2 G,2 | D,6 |
[V:T1] A2 | d3 c B2 B2 | e3 d c2 || A2 | G2 B2 d3 F | G6 |]
w: For my trans-gres-sions I con-fess, I ev-er see my sin.
w: But Thou wilt make me wise in heart, Thou seek-est truth with-in.
w: Cre-ate in me a spir-it right, O God, my heart re-new.
w: Then sin-ners shall be turned to Thee When I Thy ways un-fold.
[V:T2] D2 | D3 D D2 E2 | E3 E E2 || EF | G2 G2 F3 D | D6 |]
[V:B1] F,G, | A,3 A, G,2 ^G,A, | B,3 B, A,2 || C2 | B,2 D2 C3 C | B,6 |]
[V:B2] D,E, | F,3 F, G,2 E,F, | ^G,3 ^G, A,2 || C,2 | D,2 D,2 D,3 D, | G,,6 |]`;

export function hasPsalter143KeySignatureSource(songId: string, abc: string): boolean {
  return songId === 'psalter143' && abc.replace(/\r\n/g, '\n') === sourceWitness;
}

const reviewedEngine = 'abcjs-basic v6.7.0';
const keyNames = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export interface Psalter143Display {
  readonly abc: string;
  readonly transpose: number;
  readonly initialKey: string;
  readonly changedKey: string;
}

// Only a preparation bound to the complete witness may authorize projection.
const preparedSources = new WeakSet<Psalter143Display>();

function destinationKeys(transpose: number) {
  if (!Number.isInteger(transpose) || transpose < -10 || transpose > 12) return;
  return {
    initialKey: keyNames[(10 + transpose + 12) % 12],
    changedKey: keyNames[(7 + transpose + 12) % 12],
  };
}

/** Keep the caption's spelling identical to strTranspose, including Gb. The
 * witness is major; other arrangements retain the ordinary mode/caption path.
 */
export function psalter143DisplayKey(songId: string, abc: string, transpose: number): string | undefined {
  if (!hasPsalter143KeySignatureSource(songId, abc) || abcjs.signature !== reviewedEngine) return;
  const keys = destinationKeys(transpose);
  return keys ? `${keys.initialKey} Major` : undefined;
}

// Compare musical meaning, not layout positions or the cancellation naturals
// that ABCJS adds only to the genuine source-owned transition.
function keyMeaning(key: abcjs.KeySignature | undefined): string | undefined {
  if (!key || !/^[A-G]$/.test(key.root) || !['', '#', 'b'].includes(key.acc) || key.mode !== '') return;
  const values: Record<string, number | undefined> = { natural: 0, sharp: 1, flat: -1, dblsharp: 2, dblflat: -2 };
  const alterations = [0, 0, 0, 0, 0, 0, 0];
  const seen = new Set<number>();
  for (const accidental of key.accidentals ?? []) {
    const letter = accidental.note.toUpperCase();
    if (!/^[A-G]$/.test(letter)) return;
    const index = letter.charCodeAt(0) - 65, value = values[accidental.acc];
    if (value === undefined || seen.has(index)) return;
    seen.add(index);
    alterations[index] = value;
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
  item: abcjs.VoiceItemKey, bass: boolean, singleBassVoice: boolean,
  keys: { initialKey: string; changedKey: string },
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
  // A lone bass voice can reuse its implied-natural objects at the next
  // authored line; ABCJS then repositions that prefix with the owning clef
  // while the genuine destination accidentals keep their treble positions.
  const inheritedNaturals = singleBassVoice && bass &&
    item.accidentals.slice(0, cancelled.length).every(accidental => accidental.verticalPos === keyPosition(accidental, true)) &&
    item.accidentals.slice(cancelled.length).every(accidental => accidental.verticalPos === keyPosition(accidental, false));
  if (!alreadyPositioned && !treblePositioned && !inheritedNaturals) return;
  if (alreadyPositioned) return item;
  // Do not use ABCJS fixKey: it shallow-copies and mutates shared accidentals.
  // Replace this voice occurrence, leaving every alias and audio tune intact.
  return { ...item, accidentals: item.accidentals.map(accidental => ({
    ...accidental, verticalPos: keyPosition(accidental, bass),
  })) };
}

interface KeySignatureEdits {
  removals: Map<abcjs.VoiceItem[], Set<abcjs.VoiceItem>>;
  replacements: Array<{ voice: abcjs.VoiceItem[]; index: number; key: abcjs.VoiceItemKey }>;
}

/** Validate every staff, source owner and key before proposing any mutation.
 * The only synthetic events admitted are equal q32/q48 duplicates. Genuine
 * key changes must remain at the physical end of their owned source lines:
 * the reviewed string-transposition mechanism is not safe for arbitrary
 * mid-line changes. This also validates preparation without projecting it.
 */
function keySignatureEdits(
  tune: abcjs.TuneObject, selectedAbc: string,
  keys: { initialKey: string; changedKey: string },
): KeySignatureEdits | undefined {
  if (tune.warnings?.length || abcjs.signature !== reviewedEngine) return;
  const scores = selectedAbc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1 ||
      (selectedAbc.match(/^M:[^\r\n]*$/gm) ?? []).join('\n') !== 'M:4/4' ||
      (selectedAbc.match(/^L:[^\r\n]*$/gm) ?? []).join('\n') !== 'L:1/8' ||
      (selectedAbc.match(/^K:[^\r\n]*$/gm) ?? []).join('\n') !== `K:${keys.initialKey}`) return;
  const groups = (scores[0].match(/\([^)]*\)/g) ?? []).map(group => group.slice(1, -1).split(' '));
  const upper = ['T1', 'T2', 'T1 T2'], lower = ['B1', 'B2', 'B1 B2'];
  if (!groups.length || groups.length > 2 ||
      scores[0] !== `%%score ${groups.map(group => `(${group.join(' ')})`).join(' ')}` ||
      (groups.length === 1 ? ![...upper, ...lower].includes(groups[0].join(' ')) :
        !upper.includes(groups[0].join(' ')) || !lower.includes(groups[1].join(' ')))) return;
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
  for (const line of tune.lines) {
    if (!line.staff) continue;
    if (line.staff.length !== groups.length) return;
    for (const [staffIndex, staff] of line.staff.entries()) {
      if (staff.voices?.length !== groups[staffIndex].length ||
          staff.clef?.type !== (groups[staffIndex][0][0] === 'T' ? 'treble' : 'bass') ||
          staff.clef.verticalPos !== (groups[staffIndex][0][0] === 'T' ? 0 : -12) ||
          staff.clef.clefPos !== (groups[staffIndex][0][0] === 'T' ? 4 : 8)) return;
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
                  !/^[ \t]*(?:\n|$)/.test(selectedAbc.slice(item.endChar))) return;
              const positioned = positionedGenuineKey(item, staff.clef.type === 'bass', ids.length === 1, keys);
              if (!positioned) return;
              if (positioned !== item) replacements.push({ voice, index: itemIndex, key: positioned });
              state.changes = 1;
              state.key = meaning;
            } else {
              if (item.startChar !== -1 || item.endChar !== -1 || state.changes !== 1 ||
                  ![32, 48].includes(state.quarter) || meaning !== state.key || state.removed.has(state.quarter)) return;
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
  return { removals, replacements };
}

/** Prepare the complete source exactly once, before learner/selection work.
 * Unrecognized source/engine contexts keep their ordinary rendering path.
 * A recognized source with failed preparation throws rather than displaying
 * untransposed notes with a zero visualTranspose setting.
 */
export function preparePsalter143Display(songId: string, abc: string, transpose: number): Psalter143Display | undefined {
  if (!hasPsalter143KeySignatureSource(songId, abc) || abcjs.signature !== reviewedEngine) return;
  const keys = destinationKeys(transpose);
  if (!keys) throw new Error('Unsupported Psalter 143 display transposition.');
  const parsed = abcjs.parseOnly(sourceWitness, { visualTranspose: 0 });
  if (parsed.length !== 1 || !keySignatureEdits(parsed[0], sourceWitness, { initialKey: 'Bb', changedKey: 'G' })) {
    throw new Error('Unable to validate the Psalter 143 display source.');
  }
  const prepared = transpose === 0 ? sourceWitness : abcjs.strTranspose(sourceWitness, parsed, transpose);
  const result = transpose === 0 ? parsed : abcjs.parseOnly(prepared, { visualTranspose: 0 });
  if (!/^%%score \(T1 T2\) \(B1 B2\)$/m.test(prepared) ||
      result.length !== 1 || !keySignatureEdits(result[0], prepared, keys)) {
    throw new Error('Unable to validate the transposed Psalter 143 display source.');
  }
  const display = Object.freeze({ abc: prepared, transpose, ...keys });
  preparedSources.add(display);
  return display;
}

/** Display-only afterParsing projection. Keep staff headers and source-owned
 * keys, correcting only genuine bass-key glyph positions. Preserve cancellation
 * naturals and all other fields; never apply to detached/audio tunes.
 */
export function presentPsalter143KeySignatures(
  tune: abcjs.TuneObject, selectedAbc: string, display: Psalter143Display | undefined,
): boolean {
  if (!display || !preparedSources.has(display)) return false;
  const edits = keySignatureEdits(tune, selectedAbc, display);
  if (!edits) return false;
  for (const { voice, index, key } of edits.replacements) voice[index] = key;
  for (const [voice, pending] of edits.removals) {
    for (let index = voice.length - 1; index >= 0; index--) if (pending.has(voice[index])) voice.splice(index, 1);
  }
  return true;
}
