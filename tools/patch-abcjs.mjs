import { createHash } from 'node:crypto';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';

// Deliberately version- and whole-file-bound. An upstream update needs a review,
// not a fuzzy patch or silent fallback to an unpatched measurement API.
const root = new URL('../', import.meta.url);
const dependency = new URL('node_modules/abcjs/', root);
const patch = JSON.parse(readFileSync(new URL('patches/abcjs-6.7.0-measurement-cleanup.json', root), 'utf8'));
const installed = JSON.parse(readFileSync(new URL('package.json', dependency), 'utf8'));
const sha256 = (text) => createHash('sha256').update(text).digest('hex');

if (installed.name !== patch.package || installed.version !== patch.version) {
  throw new Error(`ABCJS cleanup requires ${patch.package}@${patch.version}; found ${installed.name}@${installed.version}. Review the patch before upgrading.`);
}

// Validate every input before changing either file. A partly applied patch can
// be safely resumed; unrecognized input cannot leave a new partial patch.
const changes = patch.patches.flatMap(({ file, beforeSha256, afterSha256, before, after }) => {
  const target = new URL(file, dependency);
  const original = readFileSync(target, 'utf8');
  if (sha256(original) === afterSha256) return [];
  if (sha256(original) !== beforeSha256 || original.split(before).length !== 2) {
    throw new Error(`ABCJS cleanup refused unexpected contents in ${file}. Reinstall the locked dependency or review the patch.`);
  }
  const updated = original.replace(before, after);
  if (sha256(updated) !== afterSha256) throw new Error(`Invalid ABCJS cleanup patch for ${file}.`);
  return [{ target, updated }];
});

for (const { target, updated } of changes) {
  const temporary = new URL(`${target.href}.psalter-patch-${process.pid}`);
  writeFileSync(temporary, updated, { flag: 'wx' });
  renameSync(temporary, target);
}
console.log(`ABCJS ${patch.version} measurement cleanup: ${changes.length ? 'applied' : 'already applied'}.`);
