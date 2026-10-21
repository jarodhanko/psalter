import { readCanonicalPsalterSource } from './read-canonical-psalter-source.mjs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import {
  hashGeneratedArtifacts,
  legacyPsalterArrangementCount,
  legacyPsalterCanonicalCount,
  legacyPsalterCorpusVersion,
  legacyPsalterManifestSchemaVersion,
  legacyPsalterPackageId,
  parseGeneratedManifest,
  readGeneratedArtifacts,
  sha256,
} from './legacy-psalter-manifest.mjs';

const require = createRequire(import.meta.url);
const abcjs = require('abcjs');
// Initial pitch-class alterations only, agreed independently from pinned source images:
// https://github.com/jrvermeer/Psalter2025/tree/2a8fe6fa8d68ed0a7ef933aab65d7d109f24ef44/Psalter2025/public/1912/Score
// (_414.webp through _434.webp). Independent source-image readings establish only
// the initial key-signature alterations below. No tonic, mode, clef,
// performance octave, body-note, later-key-change or whole-setting assertion.
const reviewedInitialSignatures = new Map(Object.entries({
  psalter414: 'A:flat,B:flat,E:flat',
  psalter415: 'F:sharp',
  psalter416: 'F:sharp',
  psalter417: 'A:flat,B:flat,D:flat,E:flat',
  psalter418: 'A:flat,B:flat,E:flat',
  psalter419: 'F:sharp',
  psalter420: 'A:flat,B:flat,E:flat',
  psalter421: 'A:flat,B:flat,E:flat',
  psalter422: 'F:sharp',
  psalter423: 'C:sharp,F:sharp',
  psalter424: 'F:sharp',
  psalter425: 'C:sharp,F:sharp',
  psalter426: 'B:flat',
  psalter427: 'F:sharp',
  psalter428: 'F:sharp',
  psalter429: 'C:sharp,F:sharp',
  psalter430: 'A:flat,B:flat,E:flat',
  psalter431: 'C:sharp,F:sharp',
  psalter432: 'F:sharp',
  psalter433: 'A:flat,B:flat,D:flat,E:flat',
  psalter434: 'A:flat,B:flat,E:flat',
}));

function validateReviewedInitialSignature(name, tune, failures) {
  const expected = reviewedInitialSignatures.get(name);
  if (expected === undefined) return; // Alternate/unreviewed arrangements are outside this audit.
  const staves = tune.lines.find((line) => line.staff?.length)?.staff;
  if (staves?.length !== 2) {
    failures.push(`${name}: reviewed initial signature requires two initial staves`);
    return;
  }
  for (const [staffIndex, staff] of staves.entries()) {
    const voices = staff.voices ?? [];
    if (!voices.length) failures.push(`${name}: initial staff ${staffIndex + 1} has no parser voices`);
    for (const [voiceIndex, voice] of voices.entries()) {
      let key = staff.key;
      let reachedTimedEvent = false;
      for (const event of voice) {
        if (event.el_type === 'note') { reachedTimedEvent = true; break; }
        if (event.el_type === 'key') key = event; // Initial inline K: overrides the staff/header key.
      }
      const context = `${name}: initial staff ${staffIndex + 1}, parser voice ${voiceIndex + 1}`;
      if (!reachedTimedEvent) {
        failures.push(`${context} has no first timed event; reviewed signature cannot be checked`);
        continue;
      }
      // ABCJS can prepend cancellation naturals to inline keys; they are not alterations.
      const actual = (key?.accidentals ?? [])
        .filter(({ acc }) => String(acc).toLowerCase() !== 'natural')
        .map(({ note, acc }) => `${String(note).toUpperCase()}:${String(acc).toLowerCase()}`)
        .sort().join(',');
      if (actual !== expected) failures.push(`${context} signature ${actual || '(none)'}; expected ${expected}`);
    }
  }
}

const source = await readCanonicalPsalterSource();
const values = new Map();

for (const match of source.matchAll(/(?:export\s+)?const\s+(psalter[A-Za-z0-9_]+)\s*=\s*`([\s\S]*?)`;/g)) {
  values.set(match[1], match[2]);
}
for (const match of source.matchAll(/export\s+const\s+(psalter[A-Za-z0-9_]+)\s*=\s*(psalter[A-Za-z0-9_]+)\s*;/g)) {
  if (values.has(match[2])) values.set(match[1], values.get(match[2]));
}

const exportedNames = new Set(
  [...source.matchAll(/export\s+const\s+(psalter[A-Za-z0-9_]+)\s*=/g)].map((match) => match[1]),
);

const failures = [];
const warnings = [];
for (const name of reviewedInitialSignatures.keys()) {
  if (!values.has(name) || !exportedNames.has(name)) failures.push(`${name}: missing reviewed canonical setting`);
}
for (const [name, abc] of values) {
  try {
    const tunes = abcjs.parseOnly(abc);
    if (tunes.length !== 1) failures.push(`${name}: parsed ${tunes.length} tunes`);
    else validateReviewedInitialSignature(name, tunes[0], failures);
    for (const warning of tunes.flatMap((tune) => tune.warnings || [])) warnings.push(`${name}: ${warning}`);
    // This score corpus has no playable chord-symbol accompaniment. Bare quoted
    // prose such as "CHORUS" can silently synthesize an unprinted C-major track.
    for (const tune of tunes) for (const line of tune.lines) for (const staff of line.staff ?? []) {
      for (const voice of staff.voices ?? []) for (const event of voice) {
        for (const chord of event.chord ?? []) {
          if (!chord.position || chord.position === 'default') {
            failures.push(`${name}: unpositioned quoted marker "${chord.name}" may sound as a chord; use an ABC text annotation`);
          }
        }
      }
    }
  } catch (error) {
    failures.push(`${name}: threw ${error instanceof Error ? error.message : String(error)}`);
  }
}

const primary = new Set();
for (const name of values.keys()) {
  const match = name.match(/^psalter(\d+)$/);
  if (match) primary.add(Number(match[1]));
}
const highestSourceNumber = Math.max(...primary);
const missing = Array.from({ length: highestSourceNumber }, (_, index) => index + 1).filter((number) => !primary.has(number));
const distinctViewerArrangements = new Set();
const expectedGeneratedAbc = new Map();
for (const name of exportedNames) {
  const match = name.match(/^psalter(\d+)(.*)$/);
  const abc = values.get(name);
  if (!match || !abc || Number(match[1]) < 1 || Number(match[1]) > legacyPsalterCanonicalCount || match[2] === 'combined') continue;
  const arrangementKey = `${match[1]}\0${abc}`;
  if (!distinctViewerArrangements.has(arrangementKey)) expectedGeneratedAbc.set(name, abc);
  distinctViewerArrangements.add(arrangementKey);
}
if (distinctViewerArrangements.size !== legacyPsalterArrangementCount) failures.push(`viewer corpus has ${distinctViewerArrangements.size} distinct arrangements; expected ${legacyPsalterArrangementCount}`);

try {
  const root = resolve(import.meta.dirname, '..');
  const manifest = parseGeneratedManifest(await readFile(resolve(root, 'src/data/generated/legacyPsalterManifest.ts'), 'utf8'));
  const { version: releaseVersion } = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));
  const generatedArtifacts = await readGeneratedArtifacts(resolve(root, 'src/data/generated'));
  const generatedAbc = generatedArtifacts.filter(({ path }) => path.startsWith('abc/'));
  if (generatedAbc.length !== expectedGeneratedAbc.size) failures.push(`generated ABC contains ${generatedAbc.length} modules; expected ${expectedGeneratedAbc.size}`);
  const generatedIds = new Set();
  for (const { path, source: moduleSource } of generatedAbc) {
    const id = /^abc\/(psalter\w+)\.ts$/u.exec(path)?.[1];
    const declaration = moduleSource.split('\n').find((line) => line.startsWith('export default '));
    if (!id || !declaration?.endsWith(';')) throw new Error(`Malformed generated ABC module: ${path}`);
    generatedIds.add(id);
    const abc = JSON.parse(declaration.slice('export default '.length, -1));
    if (!expectedGeneratedAbc.has(id) || abc !== expectedGeneratedAbc.get(id)) failures.push(`generated ABC ${id} differs from canonical source`);
  }
  for (const id of expectedGeneratedAbc.keys()) if (!generatedIds.has(id)) failures.push(`generated ABC is missing ${id}`);
  const expected = {
    packageId: legacyPsalterPackageId,
    schemaVersion: legacyPsalterManifestSchemaVersion,
    corpusVersion: legacyPsalterCorpusVersion,
    releaseVersion,
    canonicalCount: legacyPsalterCanonicalCount,
    arrangementCount: legacyPsalterArrangementCount,
    canonicalAbcSha256: sha256(source),
    generatedArtifactsSha256: hashGeneratedArtifacts(generatedArtifacts),
  };
  for (const [field, value] of Object.entries(expected)) {
    if (manifest[field] !== value) failures.push(`generated manifest ${field} is stale (expected ${value}, found ${manifest[field] ?? 'missing'})`);
  }
} catch (error) {
  failures.push(`generated manifest unavailable: ${error instanceof Error ? error.message : String(error)}`);
}

console.log(`Parsed ${values.size} concrete ABC constants (${exportedNames.size} exported).`);
console.log(`Primary source numbers: ${primary.size}/${highestSourceNumber}; generated viewer range: 1–${legacyPsalterCanonicalCount}; missing: ${missing.join(',') || 'none'}.`);
console.log(`Viewer corpus: ${distinctViewerArrangements.size} distinct arrangements.`);
console.log(`Exceptions/cardinality failures: ${failures.length}.`);
for (const failure of failures) console.log(`FAIL ${failure}`);
console.log(`ABCJS warnings: ${warnings.length}.`);
for (const warning of warnings) console.log(`WARN ${warning}`);
if (missing.length || failures.length || warnings.length) process.exitCode = 1;
