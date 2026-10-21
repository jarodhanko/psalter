import abcjs from 'abcjs';

type AccidentalName = abcjs.AccidentalName;
type KeySignature = abcjs.KeySignature;

interface PitchToken {
  start: number;
  accidentalEnd: number;
  letter: string;
  accidental: string;
}

interface TextEdit {
  start: number;
  end: number;
  text: string;
}

interface VoiceAccidentalState {
  signature: KeySignature;
  measure: Map<number, number | null>;
}

const accidentalSemitones: Record<AccidentalName, number | undefined> = {
  flat: -1,
  natural: 0,
  sharp: 1,
  dblflat: -2,
  dblsharp: 2,
  quarterflat: undefined,
  quartersharp: undefined,
};

const accidentalValue = (source: string): number | undefined => {
  if (source === '__') return -2;
  if (source === '_') return -1;
  if (source === '=') return 0;
  if (source === '^^') return 2;
  if (source === '^') return 1;
  return undefined;
};

const accidentalText = (value: number) => value === -2 ? '__' : value === -1 ? '_' : value === 0 ? '=' : value === 1 ? '^' : '^^';

function signatureMap(signature: KeySignature) {
  const result = new Map<string, number | null>();
  for (const accidental of signature.accidentals ?? []) {
    result.set(accidental.note.toLowerCase(), accidentalSemitones[accidental.acc] ?? null);
  }
  return result;
}

function sameSignature(left: KeySignature, right: KeySignature) {
  const a = signatureMap(left);
  const b = signatureMap(right);
  return a.size === b.size && [...a].every(([note, value]) => b.get(note) === value);
}

function parsePitchTokens(source: string, start: number, end: number, expectedCount: number): PitchToken[] | undefined {
  const eventText = source.slice(start, end);
  const chordOpen = eventText.indexOf('[');
  let bodyStart = 0;
  let bodyEnd = eventText.length;
  if (chordOpen >= 0) {
    const chordClose = eventText.indexOf(']', chordOpen + 1);
    if (chordClose < 0) return undefined;
    bodyStart = chordOpen + 1;
    bodyEnd = chordClose;
  }

  const tokens: PitchToken[] = [];
  let index = bodyStart;
  while (index < bodyEnd) {
    const match = /^(\^\^|__|\^|_|=)?([A-Ga-g])([,']*)/.exec(eventText.slice(index, bodyEnd));
    if (!match) {
      if (tokens.length === expectedCount) break;
      // A single-note event starts at its accidental or note letter. Chords may
      // contain whitespace, but any other syntax inside one is left untouched.
      if (eventText[index] === ' ' || eventText[index] === '\t') {
        index += 1;
        continue;
      }
      return undefined;
    }
    const prefix = match[1] ?? '';
    tokens.push({
      start: start + index,
      accidentalEnd: start + index + prefix.length,
      letter: match[2],
      accidental: prefix,
    });
    index += match[0].length;
  }
  return tokens.length === expectedCount ? tokens : undefined;
}

/**
 * Repeat a key signature's alterations beside every matching note and repeat
 * local accidentals through the measure. The rewrite is token-only: ABCJS
 * reparses it for display/audio, so click-to-play offsets use the same string.
 */
export function addLearnerAccidentals(abc: string) {
  let tunes: abcjs.TuneObject[];
  try {
    tunes = abcjs.parseOnly(abc);
  } catch {
    return abc;
  }
  const edits: TextEdit[] = [];

  for (const tune of tunes) {
    const voices = new Map<string, VoiceAccidentalState>();
    for (let lineIndex = 0; lineIndex < tune.lines.length; lineIndex += 1) {
      const line = tune.lines[lineIndex];
      for (let staffIndex = 0; staffIndex < (line.staff?.length ?? 0); staffIndex += 1) {
        const staff = line.staff![staffIndex];
        const staffSignature = staff.key ?? tune.getKeySignature();
        for (let voiceIndex = 0; voiceIndex < (staff.voices?.length ?? 0); voiceIndex += 1) {
          const voiceKey = `${staffIndex}:${voiceIndex}`;
          let state = voices.get(voiceKey);
          if (!state) {
            state = { signature: staffSignature, measure: new Map() };
            voices.set(voiceKey, state);
          } else if (!sameSignature(state.signature, staffSignature)) {
            state.signature = staffSignature;
            state.measure.clear();
          }

          for (const event of staff.voices![voiceIndex]) {
            if (event.el_type === 'key') {
              state.signature = event;
              state.measure.clear();
              continue;
            }
            if (event.el_type === 'bar') {
              state.measure.clear();
              continue;
            }
            if (event.el_type !== 'note' || event.rest || !event.pitches?.length || event.startChar < 0 || event.endChar <= event.startChar) continue;

            // Grace-note bundles and other extended constructs have separate
            // source ranges in ABCJS. Leave those source events unchanged.
            if ((event as abcjs.AbcElem).gracenotes?.length) continue;
            const tokens = parsePitchTokens(abc, event.startChar, event.endChar, event.pitches.length);
            if (!tokens) continue;

            const keyAccidentals = signatureMap(state.signature);
            const eventEdits: TextEdit[] = [];
            const pendingMeasure = new Map(state.measure);
            let supported = true;
            event.pitches.forEach((pitch, index) => {
              const token = tokens[index];
              const pitchKey = pitch.pitch;
              const noteName = token.letter.toLowerCase();
              const storedKeyValue = keyAccidentals.get(noteName);
              const keyValue = storedKeyValue === undefined ? 0 : storedKeyValue;
              const sourceValue = accidentalValue(token.accidental);
              if (token.accidental && sourceValue === undefined) {
                pendingMeasure.set(pitchKey, null);
                supported = false;
                return;
              }
              const explicitValue = sourceValue;
              const storedValue = pendingMeasure.get(pitchKey);
              const hasLocalAccidental = explicitValue !== undefined || pendingMeasure.has(pitchKey);
              const inheritedValue = storedValue === undefined ? keyValue : storedValue;
              if (inheritedValue === null || keyValue === null || inheritedValue === undefined) {
                if (explicitValue !== undefined) pendingMeasure.set(pitchKey, explicitValue);
                supported = false;
                return;
              }
              const effectiveValue = explicitValue ?? inheritedValue;
              if (explicitValue !== undefined) pendingMeasure.set(pitchKey, explicitValue);

              const target = hasLocalAccidental
                ? accidentalText(effectiveValue)
                : keyValue === 0 ? '' : accidentalText(keyValue);
              // Keep every source accidental byte-for-byte. Added prefixes are
              // only needed for notes whose pitch currently comes from the key
              // signature or an earlier accidental in this measure.
              if (!token.accidental && target) {
                eventEdits.push({ start: token.start, end: token.start, text: target });
              }
            });

            state.measure = pendingMeasure;
            if (supported) edits.push(...eventEdits);
          }
        }
      }
    }
  }

  if (!edits.length) return abc;
  const ordered = edits.sort((left, right) => right.start - left.start || right.end - left.end);
  let result = abc;
  let previousStart = Infinity;
  for (const edit of ordered) {
    if (edit.start === previousStart) continue;
    if (edit.end > previousStart) continue;
    result = `${result.slice(0, edit.start)}${edit.text}${result.slice(edit.end)}`;
    previousStart = edit.start;
  }
  return result;
}
