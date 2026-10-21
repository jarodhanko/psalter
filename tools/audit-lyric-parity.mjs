import { readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const abcjs = require('abcjs');
const generatedDirectory = resolve(process.cwd(), 'src/data/generated/abc');

function canonicalizeWordSequence(words) {
  return words.flatMap((word, index) => {
    if (word === 'for' && /^ever(?:more)?$/u.test(words[index + 1] ?? '')) {
      return [`for${words[index + 1]}`];
    }
    if (index > 0 && words[index - 1] === 'for' && /^ever(?:more)?$/u.test(word)) return [];
    return [word];
  });
}

function normalizeWords(text) {
  const matches = text
    .replace(/\brev['’]rence\b/giu, 'reverence')
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*(?:[-‐‑][\p{L}\p{N}]+)*/gu) ?? [];
  return canonicalizeWordSequence(matches.map((word) => word.toLocaleLowerCase('en-US').replace(/['’‐‑-]/gu, '')));
}

function readNumberedWStanzas(abc) {
  const rows = [...abc.matchAll(/^\s*W:(.*)$/gm)].map((match) => match[1].trim());
  const stanzas = new Map();
  let currentNumber;

  for (const row of rows) {
    if (!row) continue;
    const numbered = /^(\d+)\.\s*(.*)$/u.exec(row);
    if (numbered) {
      currentNumber = Number(numbered[1]);
      if (stanzas.has(currentNumber)) return { stanzas, reason: `duplicate W: stanza ${currentNumber}` };
      stanzas.set(currentNumber, numbered[2]);
    } else if (currentNumber === undefined) {
      return { stanzas, reason: 'W: text begins with an unnumbered row' };
    } else {
      if (/^\[?\s*(?:selected\s+)?stanzas?\b[^\]]*\]?$/iu.test(row)) {
        return { stanzas, reason: 'W: contains an unnumbered stanza-selection marker' };
      }
      stanzas.set(currentNumber, `${stanzas.get(currentNumber)} ${row}`.trim());
    }
  }

  if (stanzas.size < 2) return { stanzas, reason: 'fewer than two numbered W: stanzas' };
  if ([...stanzas.values()].some((text) => /\[\s*(?:selected\s+)?stanzas?\b[^\]]*\]\s*$/iu.test(text))) {
    return { stanzas, reason: 'W: transcript ends with a stanza-selection marker' };
  }
  return { stanzas };
}

function noteEvents(voice) {
  return Array.isArray(voice) ? voice.filter((event) => event.el_type === 'note') : [];
}

function hasLyricText(lyric) {
  return Boolean(lyric && typeof lyric.syllable === 'string' && lyric.syllable.trim() && lyric.syllable.trim() !== '*');
}

function lyricVoiceKey(tune) {
  const keys = new Set();
  for (const line of tune.lines.filter((candidate) => candidate.staff)) {
    line.staff.forEach((staff, staffIndex) => staff.voices.forEach((voice, voiceIndex) => {
      if (noteEvents(voice).some((event) => event.lyric?.some(hasLyricText))) keys.add(`${staffIndex}:${voiceIndex}`);
    }));
  }
  return keys.size === 1 ? [...keys][0] : undefined;
}

function collectMusicLines(tune, voiceKey) {
  const [staffIndex, voiceIndex] = voiceKey.split(':').map(Number);
  const musicLines = tune.lines.filter((candidate) => candidate.staff);
  const result = [];
  let expectedSlotCount;

  for (let index = 0; index < musicLines.length; index += 1) {
    const voice = musicLines[index].staff?.[staffIndex]?.voices?.[voiceIndex];
    const events = noteEvents(voice);
    if (!events.length) return { reason: `music system ${index + 1} lacks the lyric voice` };
    const slotCount = Math.max(0, ...events.map((event) => event.lyric?.length ?? 0));
    if (expectedSlotCount !== undefined && slotCount !== expectedSlotCount) {
      return { reason: `music system ${index + 1} has ${slotCount} stanza slots; expected ${expectedSlotCount}` };
    }
    expectedSlotCount = slotCount;
    if (!slotCount || events.some((event) => event.lyric && event.lyric.length !== slotCount)) {
      return { reason: `music system ${index + 1} has inconsistent lyric slot arrays` };
    }
    if (events.some((event) => event.rest && event.lyric?.some(hasLyricText))) {
      return { reason: `music system ${index + 1} attaches text to a rest` };
    }
    for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
      if (!events.some((event) => hasLyricText(event.lyric?.[slotIndex]))) {
        return { reason: `music system ${index + 1} has an empty stanza slot ${slotIndex + 1}` };
      }
    }
    result.push(events);
  }

  return { musicLines: result };
}

function firstTextForSlot(events, slotIndex) {
  for (const event of events) {
    const lyric = event.lyric?.[slotIndex];
    if (hasLyricText(lyric)) return lyric.syllable.trim();
  }
  return undefined;
}

function mapLyricSlots(firstSystem, wStanzas) {
  const slotCount = Math.max(0, ...firstSystem.map((event) => event.lyric?.length ?? 0));
  if (!slotCount || firstSystem.some((event) => event.lyric && event.lyric.length !== slotCount)) {
    return { reason: 'first music system has inconsistent stanza slots' };
  }
  const wNumbers = [...wStanzas.keys()].sort((left, right) => left - right);
  if (slotCount !== wNumbers.length) return { reason: `w: has ${slotCount} stanza slots but W: has ${wNumbers.length} numbered stanzas` };

  const labels = Array.from({ length: slotCount }, (_, slotIndex) => {
    const text = firstTextForSlot(firstSystem, slotIndex);
    const match = text && /^\s*(\d+)\.[\s\u00a0]*/u.exec(text);
    return match ? Number(match[1]) : undefined;
  });
  const labeledCount = labels.filter((number) => number !== undefined).length;
  if (labeledCount && labeledCount !== slotCount) return { reason: 'first-system w: stanza numbers are only partly present' };
  const numbers = labeledCount ? labels : wNumbers;
  if (new Set(numbers).size !== slotCount || numbers.some((number, index) => number !== wNumbers[index])) {
    return { reason: 'first-system w: stanza numbers do not match numbered W: order' };
  }
  return { numbers };
}

function stripStanzaPrefix(text) {
  return text.replace(/^\s*\d+\.[~\s\u00a0]*/u, '').replace(/^~+/u, '').trim();
}

function readUnderlaidWords(musicLines, slotIndex) {
  const words = [];
  let partialWord = '';

  for (const events of musicLines) {
    for (const event of events) {
      const lyric = event.lyric?.[slotIndex];
      if (!hasLyricText(lyric)) continue;
      const syllable = stripStanzaPrefix(lyric.syllable);
      if (!normalizeWords(syllable).length) continue;
      partialWord += syllable;
      if (lyric.divider === '-') continue;
      words.push(...normalizeWords(partialWord));
      partialWord = '';
    }
  }

  if (partialWord) words.push(...normalizeWords(partialWord));
  return canonicalizeWordSequence(words);
}

function editDistance(left, right) {
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      current[rightIndex] = Math.min(
        current[rightIndex - 1] + 1,
        previous[rightIndex] + 1,
        previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[right.length];
}

/** Report only close, word-level disagreements; this is a review lead, not a validation verdict. */
export function analyzeLyricParity({ id, abc }) {
  const { stanzas: wStanzas, reason: wReason } = readNumberedWStanzas(abc);
  if (wReason) return { id, candidates: [], skipped: wReason };
  if (!/^\s*w:/m.test(abc)) return { id, candidates: [], skipped: 'no lowercase w: underlay' };

  let tunes;
  try {
    tunes = abcjs.parseOnly(abc);
  } catch (error) {
    return { id, candidates: [], skipped: `ABCJS parse failed: ${error instanceof Error ? error.message : String(error)}` };
  }
  if (tunes.length !== 1) return { id, candidates: [], skipped: `ABCJS parsed ${tunes.length} tunes` };
  const tune = tunes[0];
  if (tune.warnings?.length) return { id, candidates: [], skipped: `ABCJS reported ${tune.warnings.length} warning(s)` };

  const voiceKey = lyricVoiceKey(tune);
  if (!voiceKey) return { id, candidates: [], skipped: 'lyrics occur on zero or multiple voices' };
  const { musicLines, reason: lineReason } = collectMusicLines(tune, voiceKey);
  if (lineReason) return { id, candidates: [], skipped: lineReason };
  if (!musicLines.length) return { id, candidates: [], skipped: 'no music systems found' };
  const { numbers, reason: slotReason } = mapLyricSlots(musicLines[0], wStanzas);
  if (slotReason) return { id, candidates: [], skipped: slotReason };

  const candidates = [];
  for (let slotIndex = 0; slotIndex < numbers.length; slotIndex += 1) {
    const stanzaNumber = numbers[slotIndex];
    const expected = normalizeWords(wStanzas.get(stanzaNumber));
    const underlaid = readUnderlaidWords(musicLines, slotIndex);
    if (expected.length < 8 || underlaid.length < 8) continue;
    const distance = editDistance(expected, underlaid);
    const similarity = 1 - distance / Math.max(expected.length, underlaid.length);
    if (distance > 3 || similarity < 0.85) continue;
    if (distance > 0) candidates.push({ id, stanzaNumber, expected, underlaid, distance, similarity });
  }

  return { id, candidates };
}

export function formatLyricParityCandidate(candidate) {
  return `${candidate.id} stanza ${candidate.stanzaNumber}: W: and parsed w: differ by ${candidate.distance} word edit(s) (${Math.round(candidate.similarity * 100)}% similar)\n  W: ${candidate.expected.join(' ')}\n  w: ${candidate.underlaid.join(' ')}`;
}

async function readGeneratedAbc(filePath) {
  const source = await readFile(filePath, 'utf8');
  const prefix = 'export default ';
  const line = source.split(/\r?\n/u).find((candidate) => candidate.startsWith(prefix));
  if (!line?.endsWith(';')) throw new Error(`Unexpected generated ABC module: ${filePath}`);
  return JSON.parse(line.slice(prefix.length, -1));
}

export async function runLyricParityAudit(directory = generatedDirectory) {
  const files = (await readdir(directory)).filter((file) => file.endsWith('.ts')).sort();
  const candidates = [];
  const skipped = new Map();
  let eligible = 0;

  for (const file of files) {
    const id = file.slice(0, -3);
    const abc = await readGeneratedAbc(join(directory, file));
    const result = analyzeLyricParity({ id, abc });
    candidates.push(...result.candidates);
    if (result.skipped) skipped.set(result.skipped, (skipped.get(result.skipped) ?? 0) + 1);
    else eligible += 1;
  }

  return { arrangements: files.length, eligible, candidates, skipped };
}

const isMain = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const result = await runLyricParityAudit();
  console.log(`Compared complete numbered underlays: ${result.eligible} of ${result.arrangements} generated arrangements.`);
  console.log(`Lyric parity review candidates: ${result.candidates.length}.`);
  for (const candidate of result.candidates) console.log(formatLyricParityCandidate(candidate));
  console.log(`Skipped as ambiguous or incomplete: ${[...result.skipped.values()].reduce((sum, count) => sum + count, 0)} arrangements.`);
  for (const [reason, count] of result.skipped) console.log(`  ${count}: ${reason}`);
  console.log('Report only: candidates require review against the source, and do not fail the command.');
}
