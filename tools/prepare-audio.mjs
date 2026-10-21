import assert from 'node:assert/strict';
import { normalizeOrganMetadata } from './normalize-organ-metadata.mjs';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { link, lstat, mkdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Deliberately explicit: no install hook, runtime download, remote program,
// credentials, package installation, upload, or deployment is performed here.
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const options = new Set(process.argv.slice(2));
const allowed = new Set(['--offline', '--verify-only', '--replace-mismatched', '--help']);
for (const option of options) if (!allowed.has(option)) throw new Error(`Unknown option: ${option}. Use --help.`);
if (options.has('--help')) {
  console.log(`Usage: npm run audio:prepare -- [--offline] [--verify-only] [--replace-mismatched]
Fetch 442 pinned upstream MP3s and derive three Db8 notes with installed FFmpeg 7.1.5.
Verify every file's exact size, SHA-256, and Git blob SHA-1 before use.
--offline             Use only already verified assets or .audio-cache objects; never fetch.
--verify-only         Check all 445 existing assets and notices; never write, fetch, or run FFmpeg.
--replace-mismatched  Explicitly allow replacing mismatching regular files, only after verification.
Existing correct assets are reused. Symlinks are always refused. See docs/audio/setup.md.`);
  process.exit(0);
}
const offline = options.has('--offline');
const verifyOnly = options.has('--verify-only');
const replace = options.has('--replace-mismatched');
const pins = {
  'paulrosen/midi-js-soundfonts': 'cbd6b6f6d1af89ebfb69402860741288f08ff8b7',
  'educandu/abcjs-soundfonts': 'ebd5724f5d334b5b6347562b0044f75e16df90b7',
};
const banks = new Set([
  'FluidR3_GM/acoustic_grand_piano-mp3',
  'FluidR3_GM/church_organ-mp3',
  'FluidR3_Salamander_GM/acoustic_grand_piano-mp3',
  'optional-v1/acoustic_guitar_nylon-mp3',
  'optional-v1/harpsichord-mp3',
]);
const digest = (algorithm, bytes) => createHash(algorithm).update(bytes).digest('hex');
const blobDigest = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');
const missing = error => error?.code === 'ENOENT';

async function safePath(path, createParents = false) {
  assert.equal(typeof path, 'string', 'Expected a relative file path');
  assert.ok(!isAbsolute(path) && !path.includes('\\') && !path.includes('\0'), `Unsafe path: ${path}`);
  assert.ok(path.split('/').every(part => part && part !== '.' && part !== '..'), `Unsafe path: ${path}`);
  const absolute = resolve(root, path);
  assert.ok(relative(root, absolute) && !relative(root, absolute).startsWith(`..${sep}`), `Path escapes repository: ${path}`);
  let current = root;
  const pieces = path.split('/');
  for (let index = 0; index < pieces.length; index++) {
    current = resolve(current, pieces[index]);
    let stat;
    try { stat = await lstat(current); } catch (error) { if (!missing(error)) throw error; }
    const parent = index < pieces.length - 1;
    if (!stat && parent && createParents) {
      try { await mkdir(current); } catch (error) { if (error.code !== 'EEXIST') throw error; }
      stat = await lstat(current);
    }
    if (stat) {
      assert.ok(!stat.isSymbolicLink(), `Refusing symlink: ${path}`);
      assert.ok(parent ? stat.isDirectory() : stat.isFile(), `Unexpected file type: ${path}`);
    }
  }
  return absolute;
}
function verify(bytes, asset, label) {
  assert.equal(bytes.length, asset.bytes, `${label}: byte count mismatch`);
  assert.equal(digest('sha256', bytes), asset.sha256, `${label}: SHA-256 mismatch`);
  assert.equal(blobDigest(bytes), asset.gitBlobSha1, `${label}: Git blob SHA-1 mismatch`);
}
async function existing(path, asset) {
  const absolute = await safePath(path);
  let bytes;
  try { bytes = await readFile(absolute); } catch (error) { if (missing(error)) return null; throw error; }
  try { verify(bytes, asset, path); return bytes; } catch (error) {
    if (!replace || verifyOnly) throw new Error(`${error.message}. Existing file preserved. Inspect it; use --replace-mismatched only if replacement is intended.`);
    return null;
  }
}
async function install(path, bytes, asset) {
  verify(bytes, asset, path);
  const destination = await safePath(path, true);
  if (await existing(path, asset)) return;
  // Unique sibling temporary file and atomic rename: no partial destination.
  const temporary = `${path}.partial-${randomUUID()}`;
  const temporaryPath = await safePath(temporary, true);
  try {
    await writeFile(temporaryPath, bytes, { flag: 'wx' });
    await safePath(path);
    if (replace) {
      // Explicit permission permits replacing a mismatching regular file.
      await rename(temporaryPath, destination);
    } else {
      // A hard-link insertion is atomic and never overwrites an existing path,
      // including a file created after the preceding safety check. Both paths
      // are siblings on one filesystem; failures are not retried as renames.
      try { await link(temporaryPath, destination); } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        if (!(await existing(path, asset))) throw new Error(`Destination changed during preparation: ${path}; preserved.`);
      }
    }
  } finally { await rm(temporaryPath, { force: true }); }
}
function cachePath(asset) { return `.audio-cache/sha256/${asset.sha256}.mp3`; }
function sourceUrl(asset) {
  return `https://raw.githubusercontent.com/${asset.repository}/${asset.commit}/${asset.upstreamPath}`;
}
async function fetchAsset(asset) {
  if (offline) throw new Error(`Offline: missing verified asset/cache for ${asset.path}. Run npm run audio:prepare with network access, or restore the matching .audio-cache object.`);
  const url = sourceUrl(asset);
  let response;
  try { response = await fetch(url, { redirect: 'error', credentials: 'omit', signal: AbortSignal.timeout(45000) }); }
  catch (error) { throw new Error(`Download failed for ${asset.path}: ${error.message}. Check network access to raw.githubusercontent.com and retry; completed verified files can be reused.`); }
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}. No unverified file was installed.`);
  const chunks = [];
  let count = 0;
  try {
    for await (const chunk of response.body) {
      count += chunk.length;
      if (count > asset.bytes) throw new Error(`Download exceeds pinned size for ${asset.path}`);
      chunks.push(chunk);
    }
  } catch (error) { throw new Error(`Incomplete or invalid download for ${asset.path}: ${error.message}`); }
  const bytes = Buffer.concat(chunks);
  verify(bytes, asset, url);
  return bytes;
}
function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-nostdin', '-hide_banner', '-loglevel', 'error', ...args], { encoding: null, maxBuffer: 8 * 1024 * 1024, timeout: 60000, shell: false });
  if (result.error || result.status !== 0) throw new Error(`FFmpeg failed: ${result.error?.message ?? result.stderr.toString().trim()}`);
  return result.stdout;
}
async function derive(asset, byPath) {
  const input = byPath.get(asset.derivedFrom);
  const source = await existing(input.path, input);
  if (!source) throw new Error(`Missing verified derivation input: ${input.path}`);
  const temporary = `.audio-cache/work/${randomUUID()}.mp3`;
  const output = await safePath(temporary, true);
  try {
    ffmpeg(['-i', await safePath(input.path), '-af', 'asetrate=46722,aresample=44100', '-codec:a', 'libmp3lame', '-q:a', '2', '-n', output]);
    let bytes = await readFile(output);
    if (asset.metadataNormalization) {
      assert.equal(asset.metadataNormalization, 'historical-organ-v1');
      assert.equal(asset.path, 'public/soundfonts/FluidR3_GM/church_organ-mp3/Db8.mp3');
      bytes = normalizeOrganMetadata(bytes);
      await writeFile(output, bytes);
    }
    verify(bytes, asset, `Generated ${asset.path}; FFmpeg/library builds must match the pinned recipe`);
    const pcm = ffmpeg(['-i', output, '-f', 's16le', '-acodec', 'pcm_s16le', '-']);
    assert.equal(pcm.length, asset.decodedPcmS16le.bytes, `${asset.path}: decoded PCM size mismatch`);
    assert.equal(digest('sha256', pcm), asset.decodedPcmS16le.sha256, `${asset.path}: decoded PCM SHA-256 mismatch`);
    return bytes;
  } finally { await rm(output, { force: true }); }
}

async function main() {
  const manifest = JSON.parse(await readFile(await safePath('docs/audio/source-manifest.json'), 'utf8'));
  assert.equal(manifest.version, 1);
  assert.equal(manifest.assets.length, 445, 'Expected all 445 audio samples');
  const byPath = new Map();
  const bankCounts = new Map();
  for (const asset of manifest.assets) {
    assert.match(asset.path, /^public\/soundfonts\/[A-Za-z0-9_/-]+\/[A-G]b?[0-8]\.mp3$/);
    const bank = dirname(asset.path).replace('public/soundfonts/', '');
    assert.ok(banks.has(bank), `Unrecognized bank: ${bank}`);
    await safePath(asset.path);
    assert.ok(!byPath.has(asset.path), `Duplicate path: ${asset.path}`);
    assert.ok(Number.isSafeInteger(asset.bytes) && asset.bytes > 0 && asset.bytes <= 2_000_000);
    assert.match(asset.sha256, /^[a-f0-9]{64}$/);
    assert.match(asset.gitBlobSha1, /^[a-f0-9]{40}$/);
    byPath.set(asset.path, asset);
    bankCounts.set(bank, (bankCounts.get(bank) ?? 0) + 1);
    if (!asset.derivedFrom) {
      assert.equal(asset.commit, pins[asset.repository], `Unreviewed upstream repository/commit: ${asset.path}`);
      assert.ok(Object.hasOwn(pins, asset.repository), 'Unknown upstream repository');
      assert.match(asset.upstreamPath, /^FluidR3_(?:Salamander_)?GM\/(?:acoustic_grand_piano|church_organ|acoustic_guitar_nylon|harpsichord)-mp3\/[A-G]b?[0-8]\.mp3$/);
    }
  }
  for (const bank of banks) assert.equal(bankCounts.get(bank), 89, `Incomplete bank: ${bank}`);
  const originals = manifest.assets.filter(asset => !asset.derivedFrom);
  const derivatives = manifest.assets.filter(asset => asset.derivedFrom);
  assert.equal(originals.length, 442);
  assert.equal(derivatives.length, 3);
  for (const asset of derivatives) {
    assert.ok(asset.path.endsWith('/Db8.mp3'));
    assert.equal(asset.derivedFrom, asset.path.replace('/Db8.mp3', '/C8.mp3'));
    assert.ok(byPath.has(asset.derivedFrom) && !byPath.get(asset.derivedFrom).derivedFrom);
    assert.match(asset.decodedPcmS16le.sha256, /^[a-f0-9]{64}$/);
    assert.ok(Number.isSafeInteger(asset.decodedPcmS16le.bytes) && asset.decodedPcmS16le.bytes > 0);
  }
  const notices = spawnSync(process.execPath, [resolve(root, 'tools/validate-license-notices.mjs')], { stdio: 'inherit', cwd: root });
  if (notices.error || notices.status !== 0) throw new Error('Required license notices failed validation; audio preparation stopped.');
  // Check every existing destination/cache before any download or mutation.
  const ready = new Set();
  for (const asset of manifest.assets) {
    if (await existing(asset.path, asset)) ready.add(asset.path);
    if (!verifyOnly) await existing(cachePath(asset), asset);
  }
  if (verifyOnly) {
    const absent = manifest.assets.filter(asset => !ready.has(asset.path));
    if (absent.length) throw new Error(`Audio not prepared: ${absent.length} of 445 samples missing (first: ${absent[0].path}). Run npm run audio:prepare before building. No network request was made.`);
    console.log('Audio verified: all 445 samples match pinned size, SHA-256 and Git blob SHA-1.');
    return;
  }
  const needDerivation = [];
  for (const asset of derivatives) if (!ready.has(asset.path) && !(await existing(cachePath(asset), asset))) needDerivation.push(asset);
  if (needDerivation.length) {
    const version = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8', timeout: 10000, shell: false });
    if (version.error || version.status !== 0 || !/^ffmpeg version 7\.1\.5(?:[\s-]|$)/.test(version.stdout)) {
      throw new Error('Missing required FFmpeg 7.1.5 with libmp3lame for Db8 generation. Install it yourself from https://ffmpeg.org/download.html or your trusted package manager, then retry. This script never installs software. See docs/audio/setup.md.');
    }
  }
  let next = 0, completed = 0;
  const workers = Array.from({ length: 6 }, async () => {
    while (next < originals.length) {
      const asset = originals[next++];
      if (!ready.has(asset.path)) {
        const bytes = await existing(cachePath(asset), asset) ?? await fetchAsset(asset);
        await install(cachePath(asset), bytes, asset);
        await install(asset.path, bytes, asset);
      }
      completed++;
      if (completed % 50 === 0 || completed === originals.length) console.log(`Original samples verified/prepared: ${completed}/${originals.length}.`);
    }
  });
  const results = await Promise.allSettled(workers);
  const failed = results.find(result => result.status === 'rejected');
  if (failed) throw failed.reason;
  for (const asset of derivatives) {
    if (!ready.has(asset.path)) {
      const bytes = await existing(cachePath(asset), asset) ?? await derive(asset, byPath);
      await install(cachePath(asset), bytes, asset);
      await install(asset.path, bytes, asset);
    }
  }
  for (const asset of manifest.assets) assert.ok(await existing(asset.path, asset), `Missing prepared asset: ${asset.path}`);
  console.log('Audio ready: 442 pinned upstream originals and 3 reproducible derivatives, all exact hashes verified. Audio and cache files remain ignored by Git.');
}
main().catch(error => { console.error(`Audio preparation failed: ${error.message}`); process.exitCode = 1; });
