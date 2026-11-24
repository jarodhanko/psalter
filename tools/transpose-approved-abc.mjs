import { createHash } from 'node:crypto';
import { approvedAbc } from './render-approved-abc.mjs';
import { readCanonicalPsalterCorpus } from './read-canonical-psalter-source.mjs';
import { materializeAbcTranspose } from '../src/features/export/transposeAbc.ts';

async function main() {
  const [number, steps, ...extra] = process.argv.slice(2);
  if (extra.length || !/^(?:2_tune2|[1-9]\d{0,2}b?)$/.test(number ?? '') || !/^-?(?:0|[1-9]\d*)$/.test(steps ?? ''))
    throw new Error('Usage: node --experimental-strip-types tools/transpose-approved-abc.mjs SETTING SEMITONES');
  const approval = approvedAbc.find(({ slug }) => slug === number);
  if (!approval) throw new Error('That setting is not in the reviewed ABC source index.');
  const transpose = Number(steps);
  if (!Number.isInteger(transpose) || transpose < -10 || transpose > 12)
    throw new Error('Choose an integer from -10 to 12 semitones.');
  const { values } = await readCanonicalPsalterCorpus();
  const source = values.get(approval.id);
  if (typeof source !== 'string' || createHash('sha256').update(source).digest('hex') !== approval.sourceSha256)
    throw new Error('The exact approved source is unavailable.');
  process.stdout.write(materializeAbcTranspose(source, transpose));
}

main().catch(error => {
  process.stderr.write(error.message + '\n');
  process.exitCode = 1;
});
