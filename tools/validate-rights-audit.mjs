import { readCanonicalPsalterSource } from './read-canonical-psalter-source.mjs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = await readCanonicalPsalterSource({ root });
const audit = await readFile(resolve(root, 'docs/rights-audit.md'), 'utf8');
const provenance = await readFile(resolve(root, 'docs/provenance.md'), 'utf8');

const notices = new Map();
for (const [, id, abc] of source.matchAll(/export const (psalter\d+\w*) = `([\s\S]*?)`;/g)) {
  const number = Number(id.match(/^psalter(\d+)/)?.[1]);
  if (!Number.isInteger(number)) continue;
  const noticeLines = abc.split(/\r?\n/).filter((line) => /^(?:N|W):.*(?:copyright|used by arrangement|used by per|permission|all rights)/i.test(line));
  if (noticeLines.length === 0) continue;
  // Nos. 414–432 are in the core number range but their photographed settings
  // carry later 1934 words-and-music notices; their numbers do not clear them.
  const category = (number >= 414 && number <= 432) || number >= 435 ? 'later1934' : number >= 433 ? 'later1947' : noticeLines.some((line) => /\b(?:18|19)\d{2}\b/.test(line)) ? 'dated' : 'undated';
  const earlier = notices.get(number);
  if (earlier && earlier !== category) throw new Error(`Conflicting notice categories for Psalter ${number}: ${earlier}, ${category}`);
  notices.set(number, category);
}

const categories = [
  ['dated', 'Dated notice'],
  ['undated', 'Undated permission'],
  ['later1947', 'Later 1947'],
  ['later1934', 'Later 1934'],
];
const listed = new Set();
for (const [category, label] of categories) {
  const row = audit.split(/\r?\n/).find((line) => line.startsWith(`| ${label}`));
  if (!row) throw new Error(`Rights audit is missing its ${label} row.`);
  const [, title, numberColumn] = row.split('|').map((part) => part.trim());
  const declaredCount = Number(title.match(/\((\d+)\)/)?.[1]);
  const numbers = (numberColumn.match(/\d+/g) ?? []).map(Number);
  if (new Set(numbers).size !== numbers.length) throw new Error(`Duplicate Psalter number in ${label} row.`);
  if (numbers.length !== declaredCount) throw new Error(`${label} row declares ${declaredCount} notices but lists ${numbers.length}.`);
  for (const number of numbers) {
    if (listed.has(number)) throw new Error(`Psalter ${number} appears in multiple rights-audit categories.`);
    listed.add(number);
    if (notices.get(number) !== category) throw new Error(`Psalter ${number} is listed as ${category}, but the ABC notice is ${notices.get(number) ?? 'missing'}.`);
  }
  const actual = [...notices.values()].filter((value) => value === category).length;
  if (numbers.length !== actual) throw new Error(`${label} row lists ${numbers.length}; ABC has ${actual}.`);
}
for (const number of notices.keys()) if (!listed.has(number)) throw new Error(`Psalter ${number} has an ABC rights notice but is absent from the rights audit.`);

const total = notices.size;
if (!provenance.includes(`corpus has ${total} settings flagged`)) throw new Error(`Provenance notice total is not ${total}.`);
if (!audit.includes(`corpus contains ${total} flagged`)) throw new Error(`Rights-audit notice total is not ${total}.`);
console.log(`Rights audit: ${total} flagged settings (${categories.map(([category]) => `${[...notices.values()].filter((value) => value === category).length} ${category}`).join(', ')}), all reconciled with ABC.`);
