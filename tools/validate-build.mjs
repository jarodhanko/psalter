import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { legacyPsalterArrangementCount } from './legacy-psalter-manifest.mjs';
import { collectJavascriptClosure } from './build-asset-closures.mjs';
import { readPsalterRecordingPolicy, inspectSpotifyReferences, validatePsalterRecordingEmission } from './psalter-recording-policy.mjs';
import { HYMN_PLAYLISTS, readHymnRecordingPolicy, validateHymnRecordingEmission } from './hymn-recording-policy.mjs';

const root = resolve(import.meta.dirname, '..');
const dist = resolve(root, 'dist');
const assets = resolve(dist, 'assets');

const limits = {
  // Initial app static closure plus App-owned automatic scoreSwipe. Deduplicate
  // shared files before summing actual raw and per-file gzip transfer sizes.
  // Source-wide hymn divider and exact shared-refrain identity repairs.
  // Measured 2026-10-05: 491,938 raw / 127,929 gzip initial closure;
  // 870,673 raw / 264,153 gzip viewer closure. Smallest 100-byte steps
  // above each measured graph, including the CI build identifier.
  // Compact top and full bottom Psalter carousels measured 2026-10-05:
  // 494,381 raw / 128,708 gzip; smallest 100-byte steps above the graph.
  // Near's source-bound shared refrain and inherited stanza vector, 2026-10-06:
  // 496,958 / 129,357 initial and 905,665 / 273,689 viewer; next 100-byte steps.
  // Hymn recording footer plus guarded Near pickup join, measured 2026-10-06:
  // 497,238 / 129,452 initial; 916,538 / 276,375 viewer.
  // Smallest 100-byte steps above these complete emitted dependency closures.
  // Source-bound lyric defaults and lossless membership redirects, 2026-10-07:
  // measured 500,018 / 130,175; next 100-byte ceilings include CI identifier variance.
  // Battle source-update voice witness, measured 2026-10-08: 500,585 / 130,288.
  // Next 100-byte steps include established +2 raw / +13 gzip CI variance.
  initialRaw: 500_600,
  initialGzip: 130_400,
  // Exact-source Hideth chord/slur opening adapter, measured 2026-10-07:
  // 952,919 raw / 288,375 gzip; next 100-byte steps cover prior CI +2/+13.
  // Faith / He Keeps exact underlay witnesses: measured 954,971 / 288,759;
  // next 100-byte steps allow the established +2 raw / +13 gzip CI variance.
  // Per-song lyric defaults, source-preserving print/export and frozen report note:
  // measured 962,768 / 291,808; next 100-byte ceilings include CI identifier variance.
  // Faith source-bound opening adapter, rebased onto lyric defaults:
  // measured 966,215 / 292,401; next 100-byte ceilings include CI identifier variance.
  // Roll exact-source verse/shared-ending witness: measured 967,959 / 292,905.
  // Next 100-byte ceilings include established CI identifier variance.
  // Exact grouped Roll width transaction: measured 976,895 / 295,162, including one split-only refinement.
  // Next 100-byte ceilings include established CI identifier variance.
  // ST ANNE exact-source admission: measured 977,341 / 295,333.
  // Jordan exact-source verse carrier entry: measured 977,427 / 295,380.
  // Wondrous grouping + exact verse-3 width guard: measured 986,843 / 298,142.
  // Additional native-proven grouped profiles and [8,9] pair: 987,627 / 298,521.
  // My Savior's Love exact opening adapter: measured 991,235 / 299,616.
  // CORONATION exact opening adapter: measured 994,635 / 300,257 with CI marker.
  // MELITA exact opening adapter: measured 997,962 / 300,650 with CI marker.
  // Mighty Fortress, He Leadeth Me and Only Trust Him exact opening adapters:
  // measured 2026-10-08: 1,007,700 raw / 302,433 gzip. All Creatures withheld.
  // Next 100-byte ceilings include established CI identifier variance.
  // Sweet Hour and God Leads exact chordal opening adapters, measured 2026-10-08:
  // 1,017,193 raw / 304,200 gzip; next 100-byte steps include CI identifier variance.
  // Sands, Oh How opening unit 0, and It Is Well exact-source adapters, 2026-10-08:
  // measured 1,032,399 raw / 306,027 gzip with a seven-character CI marker.
  // Next 100-byte steps cover established +2 raw / +13 gzip CI identifier variance.
  // Battle's exact-source legacy voice migration: 1,032,844 / 306,175.
  // Next 100-byte steps include established +2 raw / +13 gzip CI variance.
  // Church size monotonicity and uncapped O Love opening, measured 2026-10-08:
  // 1,041,762 raw / 307,979 gzip; next100-byte steps include +2/+13 CI variance.
  // All Creatures exact-pair probe failed native fit and is withheld.
  // Source-preserving Amazing Grace editorial underlay and published All Creatures stanza 4,
  // measured 2026-10-08: 1,053,507 raw / 312,281 gzip; next 100-byte steps
  // include established +2 raw / +13 gzip CI identifier variance.
  // Exact All Creatures shared-ending identity and part-qualified fallback, measured 2026-10-08:
  // 1,055,660 raw / 312,682 gzip; next 100-byte steps include +2/+13 CI variance.
  // All Creatures exact-profile measured split transaction and prose completeness, 2026-10-08:
  // 1,070,171 raw / 318,068 gzip; next 100-byte steps include +2/+13 CI variance.
  // All-parts-only grouping plus two source-specific zoom corrections, measured 2026-10-08:
  // 1,076,185 raw / 318,425 gzip; next 100-byte steps include +2/+13 CI variance.
  // Exact measured Leadeth residual pair refinement, measured 2026-10-08:
  // 1,077,229 raw / 318,780 gzip; next 100-byte steps include +2/+13 CI variance.
  // Same-pair provisional viewport proof, measured 2026-10-08:
  // 1,077,453 raw / 318,895 gzip; next 100-byte steps include +2/+13 CI variance.
  // LAUDS exact native-quarter lyric carrier, with reviewed Psalter note/bar fixes:
  // measured 2026-10-08: 1,078,598 raw / 319,187 gzip (+1,098/+187 over ceilings).
  // Next 100-byte ceilings retain the established +2 raw / +13 gzip CI variance.
  // Source-qualified native underlay for Psalters 3/8/17b, measured 2026-10-08:
  // 1,095,388 raw / 322,597 gzip. This adds 16,790/3,410 over the preceding baseline;
  // cumulative printed-score recheck growth since the original baseline is 17,937/3,700.
  // Exact guards and per-part rows remain intact; next 100-byte steps include +2/+13 variance.
  // Psalter 43 exact native-Alto carrier and rebound #42 witness, measured 2026-10-08:
  // 1,099,190 raw / 323,456 gzip, +3,802 / +859 over the preceding baseline.
  // Cumulative growth since the original baseline: +21,739 raw / +4,559 gzip.
  // Next 100-byte ceilings retain the established +2 / +13 CI variance.
  // Safe-base #54/#56 shared fermatas and #55/#56 native timing witnesses, 2026-10-09:
  // 1,109,422 raw / 325,610 gzip (+10,232 / +2,150 over the safe baseline).
  // Cumulative since the original baseline: +31,971 / +6,713; next100 ceilings retain +2/+13 variance.
  // Rejected #46b presentation is absent; source guards and all other gates stay intact.
  // Shared exact-source Psalter 44 opening, measured 2026-10-16: 1,109,624 / 328,730,
  // +1,979 raw / +918 gzip over the prior build. Smallest 100-byte ceilings cover +2/+13
  // marker variance; native guards, closure measurement and other limits are unchanged.
  // Exact P31 opening/rest proof after shared size reuse, 2026-10-16: 1,115,531 / 330,797,
  // +5,907 raw / +2,078 gzip over live the prior build. Smallest 100-byte steps cover
  // established +2/+13 marker variance; every other limit and measurement is unchanged.
  // Exact P25 opening with shared native proof, measured 2026-10-16: 1,117,664 / 331,637,
  // +2,133 raw / +839 gzip over qualified P31. Smallest 100-byte ceilings retain
  // +2/+13 marker variance; all other limits, measurements and guards are unchanged.
  // Exact P26 terminal join with shared native proof, 2026-10-16: 1,120,376 / 332,589,
  // +2,712 raw / +950 gzip over actual the prior build. Smallest 100-byte ceilings cover
  // +2/+13 marker variance; other limits, measurements and runtime guards stay unchanged.
  // Exact P28 opening with retained native viewport, 2026-10-16: 1,122,977 / 333,314,
  // +2,601 raw / +732 gzip over actual the prior build. Smallest 100-byte ceilings cover
  // +2/+13 marker variance; other limits, measurements and runtime guards stay unchanged.
  // Exact P50 whole-unit opening with shared native proof, 2026-10-16: 1,126,225 / 334,426,
  // +3,248 raw / +1,102 gzip over actual the prior build (1,122,977 / 333,324).
  // Smallest 100-byte ceilings cover +2/+13 marker variance; other limits,
  // closure measurements and runtime guards remain unchanged.
  // Exact Softly default music-only proof/cleanup, measured 2026-10-17:
  // 1,135,334 raw / 336,747 gzip, +9,109 / +2,319 over actual the prior build
  // (1,126,225 / 334,428). Smallest 100-byte ceilings cover the existing
  // +2 raw / +13 gzip marker allowance; all other limits, closure measurements
  // and runtime guards stay unchanged.
  // Sourced Wayfaring SATB, quarter-note tempo and scoped text rights, 2026-10-17:
  // frozen V4 measured 1,136,787 raw / 337,245 gzip, +1,453 / +495 over
  // actual the prior build (1,135,334 / 336,750), and +244 / +89 over V3.
  // Smallest 100-byte ceilings cover the established +2 raw / +13 gzip
  // marker allowance. All other limits, closure roots/exclusions, gzip
  // settings, measurements and runtime guards stay unchanged.
  // Shared Sands/CORONATION/He Leadeth native opening, measured 2026-10-17:
  // V2 1,137,003 raw / 337,279 gzip, +216 / +31 over actual the prior build
  // (1,136,787 / 337,248). Smallest 100-byte raw ceiling retains +2/+13
  // marker allowance; gzip ceiling, other limits, measurements and guards stay unchanged.
  // Shared Faith/Sweet Hour native opening, measured 2026-10-17:
  // V2 1,137,102 raw / 337,285 gzip, +99 / +6 over actual the prior build
  // (1,137,003 / 337,279). Smallest 100-byte raw ceiling retains
  // +2 raw / +13 gzip marker allowance; gzip ceiling, other limits,
  // closure measurements and runtime guards remain unchanged.
  // Two source-bound beat-reflow profiles, measured 2026-10-17: 1,150,572 raw /
  // 342,521 gzip, +13,470 / +5,239 over actual the prior build (1,137,102 / 337,282).
  // Smallest 100-byte limits include +2 raw / +13 gzip build-marker allowance;
  // all other limits, closure measurements and runtime guards remain unchanged.
  // Church exact-source beat profile: 1,150,787 raw / 342,581 gzip; +215/+66
  // over qualified the prior build. Smallest raw step covers established +2/+13 marker
  // allowance; existing gzip ceiling and every other limit remain unchanged.
  // He Leadeth useful-remainder profile, measured 2026-10-17: 1,151,432 raw /
  // 343,565 gzip, +645 / +986 over actual the prior build (1,150,787 / 342,579).
  // Smallest 100-byte limits retain +2 raw / +13 gzip marker allowance;
  // every other limit, measurement and runtime guard remains unchanged.
  // Oh How exact invisible-rest projection, measured 2026-10-17: 1,158,053 raw /
  // 346,437 gzip, +6,621 / +2,867 over actual the prior build (1,151,432 / 343,570).
  // Smallest 100-byte limits retain +2 raw / +13 gzip marker allowance;
  // all other limits, measurements and runtime guards remain unchanged.
  // Psalter 46 native lyric continuation, measured 2026-10-17: 1,162,085 raw /
  // 347,493 gzip, +4,032 / +1,057 over actual the prior build (1,158,053 / 346,436).
  // Diagnostic-only cleanup saves 284 / 106. Smallest 100-byte ceilings retain
  // +2 raw / +13 gzip marker allowance; other limits and all guards are unchanged.
  // Roll Call exact group1, measured 2026-10-17: 1,180,688 raw / 353,557 gzip;
  // +18,603 / +6,072 over actual the prior build (1,162,085 / 347,485).
  // Diagnostic cleanup saves 1,517 / 571. Smallest 100-byte ceilings retain
  // +2 raw / +13 gzip marker allowance; all other limits and guards stay unchanged.
  // My Savior's Love exact beat-2 continuation, measured 2026-10-18:
  // 1,183,456 raw / 353,976 gzip; +2,768 / +416 over actual the prior build
  // (1,180,688 / 353,560). Smallest 100-byte ceilings retain +2 raw / +13 gzip
  // marker allowance; all other limits, measurements and runtime guards stay unchanged.
  // O Love exact joint reflow, measured 2026-10-18: 1,202,289 raw / 358,287 gzip;
  // +18,833 / +4,316 over actual the prior build (1,183,456 / 353,971).
  // Smallest 100-byte ceilings retain +2 raw / +13 gzip marker allowance;
  // all other limits, measurements and runtime guards remain unchanged.
  // Mighty Fortress exact opening half-bar, measured 2026-10-18:
  // 1,207,540 raw / 359,588 gzip; +5,251 / +1,305 over actual the prior build
  // (1,202,289 / 358,283). Smallest 100-byte ceilings retain +2 raw / +13 gzip
  // marker allowance; all other limits, measurements and runtime guards stay unchanged.
  // All Creatures default opening uses an exact native bass-beam proof.
  // Viewer ceilings include build-marker variance; all other limits and
  // source/native identity guards remain unchanged.
  viewerRaw: 1_218_800,
  // Source-bound Psalter 47 grouped opening, 2026-10-16: 1,107,645 raw / 327,812 gzip,
  // +7,751 / +2,240 over the prior build. Next100 gzip ceiling retains +13 marker variance;
  // exact source/native guards, raw ceiling, measurement and all other limits stay unchanged.
  viewerGzip: 362_800,
  // Sixteen photo-reviewed addenda add searchable stanza text; retain the
  // tighter 175 KB transferred-size ceiling while allowing that raw growth.
  searchRaw: 825_000,
  searchGzip: 175_000,
  // Long settings such as Psalter 213 now retain every note-aligned stanza;
  // keep a bounded per-arrangement budget without penalizing source fidelity.
  arrangementRaw: 8_000,
  totalDist: 30 * 1024 * 1024,
  // Separate hosted packs, excluded from the complete core offline precache.
  optionalAudio: 3_153_044,
};

const failures = [];
const assetNames = await readdir(assets);
const approvedRecordingUrls = await readPsalterRecordingPolicy(root);
const approvedHymnRecordingUrls = await readHymnRecordingPolicy(root);
const approvedSpotifyUrls = new Set([...approvedRecordingUrls, ...approvedHymnRecordingUrls, ...Object.values(HYMN_PLAYLISTS)]);
const emittedRecordingUrls = new Set();
const emittedHymnRecordingUrls = new Set();
const emittedSpotifyUrls = new Set();
// Retain production's asset-name checks alongside the expanded exact URL policy.
for (const name of assetNames) {
  if (inspectSpotifyReferences(name, approvedSpotifyUrls, { allowApproved: false }).hasUnapprovedReference) {
    failures.push(`unapproved Spotify reference in asset name ${name}`);
  }
}
// Each source map remains independently pinned. Only their exact URLs and the
// two existing book playlists may appear in executable application chunks.
for (const name of assetNames.filter(name => /\.(?:js|mjs|cjs)$/.test(name))) {
  const { emittedUrls, hasUnapprovedReference } = inspectSpotifyReferences(await readFile(resolve(assets, name), 'utf8'), approvedSpotifyUrls);
  if (hasUnapprovedReference) failures.push(`unapproved Spotify reference in ${name}`);
  for (const url of emittedUrls) {
    emittedSpotifyUrls.add(url);
    if (approvedRecordingUrls.has(url)) emittedRecordingUrls.add(url);
    if (approvedHymnRecordingUrls.has(url)) emittedHymnRecordingUrls.add(url);
  }
}
try { validatePsalterRecordingEmission(approvedRecordingUrls, emittedRecordingUrls); }
catch (error) { failures.push(error.message); }
try { validateHymnRecordingEmission(approvedHymnRecordingUrls, emittedHymnRecordingUrls); }
catch (error) { failures.push(error.message); }
for (const url of Object.values(HYMN_PLAYLISTS)) {
  if (!emittedSpotifyUrls.has(url)) failures.push(`missing full hymn playlist link: ${url}`);
}
// HTML, styles, public files and workers cannot turn approved links into
// embeds, preconnects or background requests. Only app JS consumes the map.
const inspectOtherSpotifyReferences = async directory => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) await inspectOtherSpotifyReferences(path);
    else if (/\.(?:js|mjs|cjs|css|html?|json|webmanifest|svg|txt|xml|map)$/i.test(entry.name)
      && !(directory === assets && /\.(?:js|mjs|cjs)$/.test(entry.name))) {
      if (inspectSpotifyReferences(await readFile(path, 'utf8'), approvedSpotifyUrls, { allowApproved: false }).hasUnapprovedReference) {
        failures.push(`Spotify reference outside executable application assets: ${path}`);
      }
    }
  }
};
await inspectOtherSpotifyReferences(dist);
const findOne = (pattern, label) => {
  const matches = assetNames.filter((name) => pattern.test(name));
  if (matches.length !== 1) failures.push(`expected one ${label} chunk, found ${matches.length}`);
  return matches[0];
};
const measure = async (name) => {
  if (!name) return { raw: 0, gzip: 0 };
  const bytes = await readFile(resolve(assets, name));
  return { raw: bytes.length, gzip: gzipSync(bytes).length };
};
const enforce = (label, value, maximum) => {
  if (value > maximum) failures.push(`${label} is ${value} bytes; budget is ${maximum}`);
};
const walkBytes = async (directory) => {
  let total = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    total += entry.isDirectory() ? await walkBytes(path) : (await stat(path)).size;
  }
  return total;
};

const initialName = findOne(/^index-[^.]+\.js$/, 'initial application');
const viewerName = findOne(/^ScoreViewer-[^.]+\.js$/, 'score viewer');
const searchName = findOne(/^legacyPsalterSearchIndex-[^.]+\.js$/, 'search index');
const arrangementNames = assetNames.filter((name) => /^psalter.+\.js$/.test(name));
if (arrangementNames.length !== legacyPsalterArrangementCount) failures.push(`expected ${legacyPsalterArrangementCount} arrangement chunks, found ${arrangementNames.length}`);
const hymnAbcNames = assetNames.filter((name) => /^hymnAbc-.+\.js$/.test(name));
const hymnEditionNames = assetNames.filter((name) => /^hymnEdition-.+\.js$/.test(name));
const hymnSearchNames = assetNames.filter((name) => /^hymnBook[12]Search-.+\.js$/.test(name));
if (hymnAbcNames.length !== 97 || hymnEditionNames.length !== 97 || hymnSearchNames.length !== 2) {
  failures.push(`expected 97 hymn notation, 97 edition, and 2 search chunks; found ${hymnAbcNames.length}/${hymnEditionNames.length}/${hymnSearchNames.length}`);
}

// These are automatic loading phases in App/ScoreViewer/useScorePinch, not
// arbitrary hash-prefix buckets. Each root must exist in the emitted manifest.
// scoreSwipe is owned by App's mounting effect, so charge it to initial startup
// and exclude its shared dependencies from the later viewer phase exactly once.
const buildManifest = JSON.parse(await readFile(resolve(dist, '.vite/manifest.json'), 'utf8'));
const initialRoots = ['index.html', 'src/features/viewer/scoreSwipe.ts'];
// A module imported both statically and dynamically can become a shared entry
// without src. Resolve that automatic root using Vite's own unique chunk name,
// never a guessed hash, and fail closed if its identity becomes ambiguous.
const mappingEntries = Object.entries(buildManifest).filter(([key, entry]) =>
  key === 'src/features/viewer/playbackTracking.ts' || entry.src === 'src/features/viewer/playbackTracking.ts' || entry.name === 'playbackTracking');
if (mappingEntries.length !== 1) throw new Error(`Expected one playback-mapping manifest entry, found ${mappingEntries.length}`);
const viewerRoots = [
  'src/features/viewer/ScoreViewer.tsx',
  // Its emitted static imports include the mapping adapter and shared ABCJS.
  'src/features/viewer/PlaybackTrackingController.tsx',
  mappingEntries[0][0],
  'src/features/viewer/scorePinch.ts',
];
const initialFiles = collectJavascriptClosure(buildManifest, initialRoots);
const viewerFiles = collectJavascriptClosure(buildManifest, viewerRoots, initialFiles);
const hymnRecordingFiles = collectJavascriptClosure(buildManifest, ['src/features/recordings/HymnRecordingLink.tsx'], new Set([...initialFiles, ...viewerFiles]));
const lazyHymnUrls = new Set();
for (const file of hymnRecordingFiles) {
  const { emittedUrls } = inspectSpotifyReferences(await readFile(resolve(dist, file), 'utf8'), approvedHymnRecordingUrls);
  for (const url of emittedUrls) lazyHymnUrls.add(url);
}
try { validateHymnRecordingEmission(approvedHymnRecordingUrls, lazyHymnUrls); }
catch { failures.push('complete hymn recording map must remain in the separate lazy hymn footer closure'); }
for (const file of [...initialFiles, ...viewerFiles]) {
  if (inspectSpotifyReferences(await readFile(resolve(dist, file), 'utf8'), approvedHymnRecordingUrls).emittedUrls.size) {
    failures.push(`hymn recording data loaded by Psalter startup or viewer: ${file}`);
  }
}
if (buildManifest['index.html']?.file !== `assets/${initialName}`) failures.push('initial application does not match the build-manifest entry');
if (buildManifest['src/features/viewer/ScoreViewer.tsx']?.file !== `assets/${viewerName}`) failures.push('score viewer does not match the build-manifest entry');
const measureFiles = async files => {
  const sizes = await Promise.all([...files].sort().map(async file => {
    const bytes = await readFile(resolve(dist, file));
    return { file, raw: bytes.length, gzip: gzipSync(bytes).length };
  }));
  return { raw: sizes.reduce((sum, item) => sum + item.raw, 0), gzip: sizes.reduce((sum, item) => sum + item.gzip, 0), sizes };
};
const [initial, viewer, search, arrangementSizes] = await Promise.all([
  measureFiles(initialFiles),
  measureFiles(viewerFiles),
  measure(searchName),
  Promise.all(arrangementNames.map(async (name) => ({ name, ...(await measure(name)) }))),
]);
enforce('initial application raw size', initial.raw, limits.initialRaw);
enforce('initial application gzip size', initial.gzip, limits.initialGzip);
enforce('score viewer raw size', viewer.raw, limits.viewerRaw);
enforce('score viewer gzip size', viewer.gzip, limits.viewerGzip);
enforce('search index raw size', search.raw, limits.searchRaw);
enforce('search index gzip size', search.gzip, limits.searchGzip);

const largestArrangement = arrangementSizes.sort((left, right) => right.raw - left.raw)[0];
if (largestArrangement) enforce(`largest arrangement (${largestArrangement.name})`, largestArrangement.raw, limits.arrangementRaw);

const sampleUrls = [];
const sampleSets = [
  { soundFont: 'FluidR3_GM', instrument: 'acoustic_grand_piano' },
  { soundFont: 'FluidR3_GM', instrument: 'church_organ' },
  { soundFont: 'FluidR3_Salamander_GM', instrument: 'acoustic_grand_piano' },
];
for (const { soundFont, instrument } of sampleSets) {
  const sampleDirectory = resolve(dist, `soundfonts/${soundFont}/${instrument}-mp3`);
  const sampleNames = (await readdir(sampleDirectory)).filter((name) => name.endsWith('.mp3'));
  if (sampleNames.length !== 89) failures.push(`expected 89 ${soundFont}/${instrument} samples, found ${sampleNames.length}`);
  sampleUrls.push(...sampleNames.map((name) => `soundfonts/${soundFont}/${instrument}-mp3/${name}`));
}

const serviceWorker = await readFile(resolve(dist, 'sw.js'), 'utf8');
const precacheUrls = [...serviceWorker.matchAll(/\{url:("(?:[^"\\]|\\.)*"),revision:(?:null|"(?:[^"\\]|\\.)*")\}/g)]
  .map((match) => JSON.parse(match[1]));
if (!precacheUrls.length) failures.push('service worker contains no recognizable Workbox precache entries');
if (precacheUrls.some(url => /(?:^|\/)\.vite(?:\/|$)/.test(url))) failures.push('build-only Vite manifest must not be in the service-worker precache');
const precacheCounts = new Map();
for (const url of precacheUrls) precacheCounts.set(url, (precacheCounts.get(url) ?? 0) + 1);
const swExternalUrls = serviceWorker.match(/https?:\/\//g) ?? [];
if (swExternalUrls.length) failures.push(`service worker contains ${swExternalUrls.length} external URL references`);

const noticeName = 'THIRD_PARTY_NOTICES.txt';
const installIcons = ['psalter-icon.svg', 'psalter-icon-192.png', 'psalter-icon-512.png'];
const expectedPrecacheUrls = [
  // Every lazy feature and shared dependency, including all hymn assets,
  // must remain available offline. Preserve the production-wide gate.
  ...assetNames.filter((name) => /\.(?:js|css)$/.test(name)).map((name) => `assets/${name}`),
  ...sampleUrls,
  noticeName,
  'manifest.webmanifest',
  ...installIcons,
];
for (const url of expectedPrecacheUrls) {
  const count = precacheCounts.get(url) ?? 0;
  if (count === 0) failures.push(`service worker is missing expected precache URL ${url}`);
  if (count > 1) failures.push(`service worker precaches ${url} ${count} times`);
  try { await stat(resolve(dist, url)); } catch { failures.push(`expected precache file is missing from dist: ${url}`); }
}

const manifest = JSON.parse(await readFile(resolve(dist, 'manifest.webmanifest'), 'utf8'));
const expectedManifestFields = {
  name: 'The Psalter',
  short_name: 'Psalter',
  start_url: '/',
  display: 'standalone',
  theme_color: '#18352d',
  background_color: '#f7f4eb',
};
for (const [field, value] of Object.entries(expectedManifestFields)) {
  if (manifest[field] !== value) failures.push(`manifest ${field} must be ${JSON.stringify(value)}, found ${JSON.stringify(manifest[field])}`);
}
if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) failures.push('manifest must include SVG, 192px, and 512px icons');
for (const icon of installIcons) {
  try { await stat(resolve(dist, icon)); } catch { failures.push(`missing install icon ${icon}`); }
}

const optionalDirectory = resolve(dist, 'soundfonts/optional-v1');
const optionalAudio = await walkBytes(optionalDirectory);
enforce('optional on-demand audio size', optionalAudio, limits.optionalAudio);
const optionalFiles = await Promise.all((await readdir(optionalDirectory)).map(async name => (await readdir(resolve(optionalDirectory, name))).filter(file => file.endsWith('.mp3')).length));
if (optionalFiles.length !== 2 || optionalFiles.some(count => count !== 89)) failures.push('expected two optional banks of 89 samples');
if (precacheUrls.some(url => url.includes('soundfonts/optional-v1/'))) failures.push('optional audio must not be downloaded during initial offline installation');
const totalDist = await walkBytes(dist);
enforce('core offline distributable size', totalDist - optionalAudio, limits.totalDist);

console.log(`Initial app closure (including automatic scoreSwipe): ${initial.raw} bytes (${initial.gzip} gzip).`);
for (const item of initial.sizes) console.log(`  initial ${item.file}: ${item.raw} raw / ${item.gzip} gzip`);
console.log(`Additional viewer closure (including automatic tracking and scorePinch, initial dependencies excluded): ${viewer.raw} bytes (${viewer.gzip} gzip).`);
for (const item of viewer.sizes) console.log(`  viewer ${item.file}: ${item.raw} raw / ${item.gzip} gzip`);
console.log(`Search: ${search.raw} bytes (${search.gzip} gzip).`);
console.log(`Arrangements: ${arrangementNames.length}; largest: ${largestArrangement?.name ?? 'none'} at ${largestArrangement?.raw ?? 0} bytes.`);
console.log(`Supported hymn assets: ${hymnAbcNames.length} notation, ${hymnEditionNames.length} edition, ${hymnSearchNames.length} search chunks; all emitted JS/CSS precached.`);
console.log(`Offline assets: ${arrangementNames.length} arrangements, ${sampleUrls.length} piano/concert-grand/organ samples, ${noticeName}, manifest, ${installIcons.length} install icons.`);
console.log(`On-demand audio: ${optionalAudio} hosted bytes excluded from initial precache; core distribution: ${totalDist - optionalAudio} bytes.`);
console.log(`Distribution: ${totalDist} bytes; external service-worker URLs: ${swExternalUrls.length}.`);
for (const failure of failures) console.error(`FAIL ${failure}`);
if (failures.length) process.exitCode = 1;
