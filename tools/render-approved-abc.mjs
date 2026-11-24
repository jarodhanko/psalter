import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Freeze the evaluated cohort: later changes require a reasoned review, not automatic rehashing.
import cohort from './abc-original-cohort.json' with { type: 'json' };
const { publicRevision, exceptions, hashes, variants } = cohort;
const originalSourceNotes = Object.freeze({
  1: 'MEDITATION: original printed setting, with archival and app keys differing.',
  psalter2: 'Primary REDEEMER; the alternate SARDIS is separately indexed.',
  psalter64b: 'SPANISH HYMN for stanzas 4–6: app extraction and repeat expansion from the printed score, not a separately titled printed tune.',
  3: 'Additional lower cue is supported by the original printed notation.',
  5: 'Additional lower cue is supported by the original printed notation.',
  226: 'Printed page 193 has a unison opening with organ parts and a later harmony section in the same tune.',
  253: 'Printed pages 218–219 contain small-note material; app encodes a muted auxiliary voice.',
});
const known = [...Object.keys(exceptions).map(Number), ...hashes.map(([number]) => number)]
  .sort((a, b) => a - b);
if (known.length !== 413 || known.some((n, i) => n !== i + 1) ||
    Object.values(exceptions).some(reason => typeof reason !== 'string' || !reason.trim()) ||
    hashes.some(([n, hash], i) => !/^[a-f0-9]{64}$/.test(hash) || (i && n <= hashes[i - 1][0]))) {
  throw new Error('Original ABC cohort must explicitly cover each primary number exactly once.');
}
const slugOrder = (a, b) => a.number - b.number || a.slug.length - b.slug.length || a.slug.localeCompare(b.slug);
const buildRow = (slug, sourceSha256, scanPage) => Object.freeze({
  id: `psalter${slug}`, slug, number: Number.parseInt(slug, 10), sourceSha256, publicRevision,
  edition: 'The Psalter with Responsive Readings (1912), application transcription',
  historicalEntry: 'https://archive.org/details/psalterwithrespo00unit',
  evidence: `https://github.com/jarodhanko/psalter/blob/${publicRevision}/docs/provenance.md`,
  scanPage,
});
if (new Set(variants.map(([slug]) => slug)).size !== variants.length ||
    variants.some(([slug, page, hash]) => !/^(?:2_tune2|[1-9]\d{0,2}b)$/.test(slug) ||
      Number.parseInt(slug, 10) > 413 || !/^\d+(?:–\d+)?$/.test(page) || !/^[a-f0-9]{64}$/.test(hash))) {
  throw new Error('Invalid verified original-edition variant cohort.');
}
export const approvedAbc = Object.freeze([
  ...hashes.map(([number, hash]) => buildRow(String(number), hash)),
  ...variants.map(([slug, page, hash]) => buildRow(slug, hash, page)),
].sort(slugOrder));
const sha256 = abc => createHash('sha256').update(abc).digest('hex');
const originalScan = 'https://static1.squarespace.com/static/590be125ff7c502a07752a5b/t/5e4178c40f06b111260a9a8d/1581349077009/McNaugher%2C%2BJohn%2C%2BThe%2BPsalter%2Bwith%2BResponsive%2BReadings.pdf';
const codeHost = 'https://github.com/jarodhanko/psalter';
const rights = `${codeHost}/blob/${publicRevision}/docs/licensing.md#psalter-current-evidence-not-presumptive-removal`;

export async function renderApprovedAbc(root, songs) {
  const entries = new Map();
  const artifacts = new Map();
  for (const row of approvedAbc) {
    const { id, slug, number, sourceSha256, publicRevision, edition, historicalEntry, evidence, scanPage } = row;
    if (!Number.isSafeInteger(number) || number < 1 || number > 413 || id !== `psalter${slug}` ||
        entries.has(id) || !/^[0-9a-f]{40}$/.test(publicRevision)) {
      throw new Error('Unrecognized approved ABC source identity.');
    }
    const hits = songs.filter(song => song.id === id);
    const [song] = hits;
    if (hits.length !== 1 || song.number !== number || song.variant !== slug.slice(String(number).length) ||
        typeof song.title !== 'string' || !song.title.trim() || sha256(song.abc) !== sourceSha256) {
      throw new Error(`Exact ABC bytes for ${id} do not match the reviewed source; no new distribution generated.`);
    }
    const filename = `${slug}.abc`;
    artifacts.set(filename, song.abc);
    entries.set(id, {
      id, number, variant: song.variant, title: song.title, format: 'ABC notation', abc: `./${filename}`, sourceSha256,
      viewer: `https://oldpsalter.com/?book=psalter-1912&number=${number}&tune=${id}`,
      source: `${codeHost}/blob/${publicRevision}/src/psalter-abc/${id}.ts`,
      edition, historicalEntry, evidence, rights,
      ...(scanPage ? { originalEditionPdfPages: scanPage, originalEditionScan: `${originalScan}#page=${scanPage.split('–')[0]}` } : {}),
      ...((originalSourceNotes[id] || (slug === String(number) && originalSourceNotes[number])) ? { sourceNote: originalSourceNotes[id] ?? originalSourceNotes[number] } : {}),
      territory: 'Original-edition basis evaluated for the U.S.; not a worldwide or MIT content license.',
    });
  }
  const index = { schemaVersion: 1, collection: 'psalter-1912', scope: 'Primary and verified alternate 1912-family settings only; see rights and provenance, not a blanket license.', excludedPrimaryNumbers: exceptions, sourceFiles: [...entries.values()] };
  // This single predetermined directory is generated and ignored by Git.
  // Replace its contents atomically at build validation granularity: nothing is
  // written before all allowlisted rows pass, and failed build is never released.
  const output = resolve(root, 'public/abc/psalter-1912');
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const [filename, abc] of artifacts) await writeFile(resolve(output, filename), abc, { flag: 'wx' });
  await writeFile(resolve(output, 'index.json'), JSON.stringify(index, null, 2)+'\n', { flag:'wx' });
  return entries;
}
