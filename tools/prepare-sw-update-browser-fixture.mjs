import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { access, cp, readFile, rm, writeFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const scratchRoot = resolve(root, 'temp');
const defaultSource = resolve(root, 'dist');
const defaultOutput = resolve(scratchRoot, 'service-worker-update-fixture');

const usage = `Usage: node tools/prepare-sw-update-browser-fixture.mjs [options]

Create three static Hosting roots for the manual real-browser service-worker
update gate. The script never builds or changes source/corpus files.

Options:
  --source <dir>  validated production dist directory (default: dist)
  --output <dir>  ignored scratch directory under temp/ (default: temp/service-worker-update-fixture)
  --force         replace an existing output fixture directory
  --help          show this message
`;

const args = process.argv.slice(2);
let source = defaultSource;
let output = defaultOutput;
let force = false;

for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === '--help') {
    console.log(usage);
    process.exit(0);
  }
  if (argument === '--force') {
    force = true;
    continue;
  }
  if (argument === '--source' || argument === '--output') {
    const value = args[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`${argument} requires a directory.`);
    if (argument === '--source') source = resolve(root, value);
    else output = resolve(root, value);
    index += 1;
    continue;
  }
  throw new Error(`Unknown option: ${argument}\n\n${usage}`);
}

const outputRelativeToScratch = relative(scratchRoot, output);
if (!outputRelativeToScratch || outputRelativeToScratch.startsWith('..') || /^[A-Za-z]:/.test(outputRelativeToScratch)) {
  throw new Error(`Output must be a child directory of ${scratchRoot}.`);
}

const releaseA = resolve(output, 'release-a');
const releaseBBroken = resolve(output, 'release-b-broken');
const releaseBRepaired = resolve(output, 'release-b-repaired');
const brokenOnlyUrl = '__sw-update-fixture__/missing-release-b-asset.txt';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function digest(contents) {
  return createHash('md5').update(contents).digest('hex');
}

function addReleaseMarker(indexHtml, release) {
  const marker = `<!-- service-worker-update-fixture: ${release} -->`;
  assert.ok(indexHtml.includes('</head>'), 'source index.html must contain </head>');
  assert.ok(!indexHtml.includes(marker), 'source index.html already contains the fixture marker');
  return indexHtml.replace('</head>', `  ${marker}\n</head>`);
}

function updateIndexRevision(worker, indexRevision) {
  const matcher = /url:"index\.html",revision:"[a-f0-9]{32}"/;
  assert.equal((worker.match(new RegExp(matcher.source, 'g')) ?? []).length, 1, 'worker must precache index.html exactly once');
  return worker.replace(matcher, `url:"index.html",revision:"${indexRevision}"`);
}

function addBrokenPrecacheEntry(worker) {
  const marker = 's.precacheAndRoute([{';
  assert.equal(worker.split(marker).length - 1, 1, 'worker must contain one Workbox precache list');
  return worker.replace(marker, `${marker}url:"${brokenOnlyUrl}",revision:"fixture-release-b-broken"},{`);
}

async function writeMarkedRelease(releaseRoot, { release, broken = false }) {
  const indexPath = resolve(releaseRoot, 'index.html');
  const workerPath = resolve(releaseRoot, 'sw.js');
  const markedIndex = addReleaseMarker(await readFile(indexPath, 'utf8'), release);
  let worker = updateIndexRevision(await readFile(workerPath, 'utf8'), digest(markedIndex));
  if (broken) worker = addBrokenPrecacheEntry(worker);
  await writeFile(indexPath, markedIndex);
  await writeFile(workerPath, worker);
}

async function validateFixture() {
  const [aWorker, aIndex, brokenWorker, repairedWorker, repairedIndex] = await Promise.all([
    readFile(resolve(releaseA, 'sw.js'), 'utf8'),
    readFile(resolve(releaseA, 'index.html'), 'utf8'),
    readFile(resolve(releaseBBroken, 'sw.js'), 'utf8'),
    readFile(resolve(releaseBRepaired, 'sw.js'), 'utf8'),
    readFile(resolve(releaseBRepaired, 'index.html'), 'utf8'),
  ]);
  assert.notEqual(aWorker, brokenWorker, 'broken release B must cause a worker update from release A');
  assert.notEqual(brokenWorker, repairedWorker, 'repaired release B must cause a retry after the failed worker');
  assert.ok(brokenWorker.includes(`{url:"${brokenOnlyUrl}",revision:"fixture-release-b-broken"},{url:`), 'broken release B must precache its intentionally missing asset as a separate entry');
  assert.ok(!repairedWorker.includes(brokenOnlyUrl), 'repaired release B must not retain the intentionally missing asset');
  assert.ok(aIndex.includes('<!-- service-worker-update-fixture: release-a -->'), 'release A must carry its distinct marker');
  assert.ok(repairedIndex.includes('<!-- service-worker-update-fixture: release-b -->'), 'repaired release B must carry its distinct marker');
  assert.ok(repairedWorker.includes(`url:"index.html",revision:"${digest(repairedIndex)}"`), 'repaired release B worker must match its marked index.html');
}

if (!await exists(resolve(source, 'index.html')) || !await exists(resolve(source, 'sw.js'))) {
  throw new Error(`Source must be a built PWA directory containing index.html and sw.js: ${source}`);
}

if (await exists(output)) {
  if (!force) throw new Error(`Fixture already exists: ${output}\nRe-run with --force to replace only this scratch directory.`);
  await rm(output, { recursive: true, force: true });
}

await cp(source, releaseA, { recursive: true });
await cp(source, releaseBBroken, { recursive: true });
await cp(source, releaseBRepaired, { recursive: true });
await Promise.all([
  writeMarkedRelease(releaseA, { release: 'release-a' }),
  writeMarkedRelease(releaseBBroken, { release: 'release-b', broken: true }),
  writeMarkedRelease(releaseBRepaired, { release: 'release-b' }),
]);
await validateFixture();

console.log(`Prepared static service-worker update fixture under ${output}`);
console.log(`  A:          ${releaseA}`);
console.log(`  B (broken): ${releaseBBroken}`);
console.log(`  B (repair): ${releaseBRepaired}`);
console.log('Serve exactly one directory at a time from the same HTTPS origin. Install A, switch to broken B and reload to observe the failed install while A remains usable offline, then switch to repaired B and reload to accept the update.');
