import { readCanonicalPsalterSource } from './read-canonical-psalter-source.mjs';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const abcjs = require('abcjs');

const checkId = (id) => {
  if (!/^psalter\d+(?:[a-z]|_tune\d+)?$/u.test(id)) {
    throw new Error(`Expected an arrangement ID such as psalter191 or psalter2_tune2, got: ${id}`);
  }
};

export const readSourceAbc = async (id) => {
  checkId(id);
  const source = await readCanonicalPsalterSource();
  const start = source.indexOf(`export const ${id} = \``);
  if (start < 0) throw new Error(`Could not find source ABC for ${id}`);
  const first = source.indexOf('`', start);
  const last = source.indexOf('`;', first + 1);
  if (last < 0) throw new Error(`Unterminated source ABC for ${id}`);
  return source.slice(first + 1, last);
};

export const readGeneratedAbc = async (id) => {
  checkId(id);
  const path = resolve(process.cwd(), 'src/data/generated/abc', `${id}.ts`);
  const source = await readFile(path, 'utf8');
  const declaration = source.split('\n').find((line) => line.startsWith('export default '));
  if (!declaration?.endsWith(';')) throw new Error(`Could not read generated ABC for ${id}`);
  return JSON.parse(declaration.slice('export default '.length, -1));
};

const slotText = (slot) => {
  if (!slot) return '·';
  const syllable = slot.syllable?.replace(/^\d+\.\s*/u, '') ?? '';
  return `${syllable}${slot.divider === '-' ? '-' : ''}` || '·';
};

export const underlayWorksheet = (id, abc) => {
  const [tune] = abcjs.parseOnly(abc);
  if (!tune) throw new Error(`ABCJS could not parse ${id}`);
  const musicLines = tune.lines.filter((line) => line.staff);
  const rows = [`${id}: ${musicLines.length} music systems${tune.warnings?.length ? `, ${tune.warnings.length} parser warnings` : ''}`];

  for (const [systemIndex, line] of musicLines.entries()) {
    const voice = line.staff[0]?.voices[0];
    if (!voice) throw new Error(`No first music voice on system ${systemIndex + 1}`);
    const events = voice.filter((event) => event.el_type === 'note');
    rows.push(`System ${systemIndex + 1}: ${events.length} first-voice note/rest events`);
    rows.push('  #  ABC       pitch/rest   lyric slots');
    for (const [index, event] of events.entries()) {
      const sourceToken = abc.slice(event.startChar, event.endChar).trim() || '?';
      const note = event.rest ? 'rest' : event.pitches?.map((pitch) => pitch.name).join('+') || '?';
      const lyric = event.lyric?.map(slotText).join(' | ') || '·';
      rows.push(`  ${String(index + 1).padStart(2)}  ${sourceToken.padEnd(9)} ${note.padEnd(12)} ${lyric}`);
    }
  }

  const printed = abc.split('\n').filter((line) => line.startsWith('W:'));
  if (printed.length) rows.push('Printed W: text (compare with the photograph):', ...printed);
  return rows.join('\n');
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node tools/inspect-underlay.mjs psalter191 [--generated]');
    process.exitCode = 1;
  } else {
    try {
      const abc = process.argv.includes('--generated') ? await readGeneratedAbc(id) : await readSourceAbc(id);
      console.log(underlayWorksheet(id, abc));
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }
}
