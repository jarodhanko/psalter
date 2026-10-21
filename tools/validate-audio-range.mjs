import { readCanonicalPsalterSource } from './read-canonical-psalter-source.mjs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const abcjs = require('abcjs');
const source = await readCanonicalPsalterSource();
const values = new Map();

for (const match of source.matchAll(/(?:export\s+)?const\s+(psalter[A-Za-z0-9_]+)\s*=\s*`([\s\S]*?)`;/g)) values.set(match[1], match[2]);
for (const match of source.matchAll(/export\s+const\s+(psalter[A-Za-z0-9_]+)\s*=\s*(psalter[A-Za-z0-9_]+)\s*;/g)) {
  if (values.has(match[2])) values.set(match[1], values.get(match[2]));
}

const readUint32 = (bytes, offset) => ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0;
const readVariableLength = (bytes, state) => {
  let value = 0;
  do {
    const byte = bytes[state.offset++];
    value = (value << 7) | (byte & 0x7f);
    if (!(byte & 0x80)) return value;
  } while (state.offset < bytes.length);
  throw new Error('Truncated MIDI variable-length value.');
};

function midiNoteRange(bytes) {
  let offset = 8 + readUint32(bytes, 4);
  let minimum = Infinity;
  let maximum = -Infinity;
  while (offset + 8 <= bytes.length) {
    const chunkId = String.fromCharCode(...bytes.slice(offset, offset + 4));
    const length = readUint32(bytes, offset + 4);
    offset += 8;
    const end = offset + length;
    if (chunkId !== 'MTrk') { offset = end; continue; }
    const state = { offset };
    let runningStatus;
    while (state.offset < end) {
      readVariableLength(bytes, state);
      let status = bytes[state.offset];
      if (status & 0x80) {
        state.offset++;
        runningStatus = status < 0xf0 ? status : runningStatus;
      } else if (runningStatus !== undefined) {
        status = runningStatus;
      } else {
        throw new Error(`MIDI event at byte ${state.offset} is missing a status byte (next byte ${status}).`);
      }
      if (status === 0xff) {
        state.offset++;
        const metaLength = readVariableLength(bytes, state);
        state.offset += metaLength;
      } else if (status === 0xf0 || status === 0xf7) {
        const sysexLength = readVariableLength(bytes, state);
        state.offset += sysexLength;
      } else {
        const kind = status & 0xf0;
        const dataLength = kind === 0xc0 || kind === 0xd0 ? 1 : 2;
        const note = bytes[state.offset];
        const velocity = dataLength === 2 ? bytes[state.offset + 1] : 0;
        if (kind === 0x90 && velocity > 0) {
          minimum = Math.min(minimum, note);
          maximum = Math.max(maximum, note);
        }
        state.offset += dataLength;
      }
    }
    offset = end;
  }
  return { minimum, maximum };
}

const supportedMinimum = 21; // A0.mp3
const supportedMaximum = 109; // Db8.mp3
const transposeMinimum = -10;
const transposeMaximum = 12;
let corpusMinimum = Infinity;
let corpusMaximum = -Infinity;
const failures = [];

for (const [name, abc] of values) {
  const midi = abcjs.synth.getMidiFile(abc, { midiOutputType: 'binary' })[0];
  const range = midiNoteRange(midi);
  corpusMinimum = Math.min(corpusMinimum, range.minimum);
  corpusMaximum = Math.max(corpusMaximum, range.maximum);
  if (range.minimum + transposeMinimum < supportedMinimum || range.maximum + transposeMaximum > supportedMaximum) {
    failures.push(`${name}: MIDI ${range.minimum}-${range.maximum} becomes ${range.minimum + transposeMinimum}-${range.maximum + transposeMaximum}`);
  }
}

console.log(`Corpus MIDI range: ${corpusMinimum}-${corpusMaximum}; with UI transposition: ${corpusMinimum + transposeMinimum}-${corpusMaximum + transposeMaximum}.`);
console.log(`Bundled offline piano, concert grand, and church organ sample range: ${supportedMinimum}-${supportedMaximum}.`);
for (const failure of failures) console.log(`FAIL ${failure}`);
if (failures.length) process.exitCode = 1;
