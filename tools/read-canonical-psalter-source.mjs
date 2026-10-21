import { readFile, readdir } from 'node:fs/promises';
import { basename, resolve } from 'node:path';

const defaultRoot = resolve(import.meta.dirname, '..');
const barrelEntry = /^export \* from ["']\.\/psalter-abc\/(psalter[\w]+)["'];$/u;
const trivia = /^(?:\s+|\/\/[^\n]*(?:\n|$)|\/\*[\s\S]*?\*\/)*$/u;
const declaration = /(?:^|\n)(export )?const (psalter\w+) = (`([\s\S]*?)`|(psalter\w+));/gu;

/**
 * The barrel is the only module manifest. Its order defines the canonical byte
 * stream; joining the original parts without separators preserves source hashes.
 * Reject drift rather than allowing Node tooling and TypeScript to see two corpora.
 */
export async function readCanonicalPsalterCorpus({ root = defaultRoot } = {}) {
  const entrypoint = await readFile(resolve(root, 'src/psalter-abc.ts'), 'utf8');
  if (entrypoint.includes('\r')) throw new Error('Canonical barrel must use LF line endings.');
  const moduleIds = [];
  for (const rawLine of entrypoint.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;
    const match = barrelEntry.exec(line);
    if (!match) throw new Error(`Unsupported canonical barrel statement: ${line}`);
    if (moduleIds.includes(match[1])) throw new Error(`Duplicate canonical module: ${match[1]}`);
    moduleIds.push(match[1]);
  }
  if (!moduleIds.length) throw new Error('Canonical barrel has no source modules.');
  const directory = resolve(root, 'src/psalter-abc');
  const entries = await readdir(directory, { withFileTypes: true });
  const expected = new Set(moduleIds.map((id) => `${id}.ts`));
  for (const entry of entries) {
    if (!entry.isFile() || !expected.has(entry.name)) throw new Error(`Orphan or unsupported canonical source: ${entry.name}`);
  }
  const present = new Set(entries.map((entry) => entry.name));
  for (const file of expected) if (!present.has(file)) throw new Error(`Missing canonical source module: ${file}`);

  const values = new Map();
  const exportedNames = new Set();
  const parts = [];
  for (const id of moduleIds) {
    const path = resolve(directory, `${id}.ts`);
    const source = await readFile(path, 'utf8');
    if (source.includes('\r')) throw new Error(`Canonical module ${id} must use LF line endings.`);
    const localValues = new Map();
    const exportedLiterals = [];
    let cursor = 0;
    for (const match of source.matchAll(declaration)) {
      if (!trivia.test(source.slice(cursor, match.index))) throw new Error(`Unsupported syntax in ${basename(path)}`);
      const [, exported, name, initializer, literal, alias] = match;
      if (values.has(name)) throw new Error(`Duplicate canonical declaration: ${name}`);
      if (alias && !localValues.has(alias)) throw new Error(`Unresolved canonical alias: ${name} = ${alias}`);
      if (!alias && (literal.includes('\\') || literal.includes('${'))) {
        throw new Error(`Escaped or interpolated canonical literal is unsupported: ${name}`);
      }
      const abc = alias ? localValues.get(alias) : literal;
      values.set(name, abc);
      localValues.set(name, abc);
      if (exported) {
        exportedNames.add(name);
        if (!alias) exportedLiterals.push(name);
      }
      cursor = match.index + match[0].length;
    }
    if (!trivia.test(source.slice(cursor))) throw new Error(`Unsupported syntax in ${basename(path)}`);
    if (exportedLiterals.length !== 1 || exportedLiterals[0] !== id) {
      throw new Error(`Canonical module ${id} must declare exactly its matching exported literal.`);
    }
    parts.push({ path: `src/psalter-abc/${id}.ts`, source });
  }
  return { source: parts.map((part) => part.source).join(''), parts, values, exportedNames };
}

export async function readCanonicalPsalterSource(options) {
  return (await readCanonicalPsalterCorpus(options)).source;
}
