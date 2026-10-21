/** Rebuild deterministic catalogs, or compare their committed bytes with --check. */
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const defaultRoot = dirname(fileURLToPath(import.meta.url));
const digest = value => createHash('sha256').update(value).digest('hex');
const stable = value => `${JSON.stringify(value, null, 2)}\n`;
const unique = values => [...new Set(values.filter(Boolean))];
const normalize = value => value.replace(/\\-/g, '\u0000').replace(/-\s*(?:[_*|]\s*)*/g, '').replace(/[~_*|]/g, ' ').replace(/\u0000/g, '-').replace(/\s+/g, ' ').trim();
const strings = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];
const fields = (abc, letters) => abc.split(/\r?\n/).flatMap(line => {
  const match = /^([A-Za-z]):\s*(.*)$/.exec(line);
  return match && letters.includes(match[1]) && match[2].trim() ? [match[2].trim()] : [];
});

function voicesFromAbc(abc) {
  const voices = new Map();
  const bodies = new Map();
  let current;
  for (const line of abc.split(/\r?\n/)) {
    const declaration = /^V:\s*([^\s]+)(.*)/.exec(line);
    const inline = /^\s*\[V:\s*([^\]\s]+)[^\]]*\](.*)/.exec(line);
    if (declaration) {
      current = declaration[1];
      const voice = voices.get(current) ?? { id: current };
      const clef = /(?:clef=|^\s+)(treble(?:-8)?|bass|alto|tenor)\b/.exec(declaration[2]);
      const name = /(?:^|\s)(?:name|nm)="([^"]+)"/.exec(declaration[2]);
      if (clef) voice.clef = clef[1];
      if (name) voice.sourceName = name[1];
      voices.set(current, voice);
      continue;
    }
    if (inline) current = inline[1];
    const music = inline?.[2] ?? line;
    if (!current || /^\s*(?:%|[A-Za-z]:)/.test(music)) continue;
    bodies.set(current, `${bodies.get(current) ?? ''} ${music.replace(/"[^"]*"|![^!]*!|\[[A-Za-z]:[^\]]*\]/g, '')}`);
  }
  // %%score explicitly places the paired Open Hymnal identifiers on two staves.
  for (const voice of voices.values()) {
    if (!voice.clef && /^S[12]V\d+$/.test(voice.id)) voice.clef = voice.id.startsWith('S2') ? 'bass' : 'treble';
    const body = bodies.get(voice.id) ?? '';
    const chord = /\[(?:[_^=]*[A-Ga-g][,']*\d*\/?\d*){2,}\]/.test(body);
    const silent = !/[_^=]*[A-Ga-g][,']*/.test(body);
    voice.kind = chord ? 'chordal' : silent ? 'supplemental' : 'independent';
    const clefName = voice.clef?.startsWith('bass') ? 'Lower' : 'Upper';
    const combinedLabel = voice.sourceName && /\b(?:alto|bass)\b/i.test(voice.sourceName) && /\b(?:soprano|tenor)\b/i.test(voice.sourceName);
    // Source MusicXML part names label staves, not necessarily this ABC voice.
    if (chord) voice.name = `${clefName} staff (${voice.id})`;
    else if (silent) voice.name = `${clefName} supplemental layer (${voice.id})`;
    else if (voice.sourceName && !combinedLabel && /^(?:Melody|Soprano|Alto|Tenor|Bass)$/.test(voice.sourceName) && !/^(?:tt-|remaining-tt-|final-tt-)/.test(abc.match(/^% Source edition: (.+)$/m)?.[1] ?? '')) voice.name = voice.sourceName;
    else voice.name = `${clefName} voice (${voice.id})`;
  }
  return [...voices.values()];
}

// Pin the reviewed import's 429 ordered decisions, including all held/excluded rows.
// Updating this requires an explicit source-selection review, not regeneration.
const SOURCE_DECISIONS_SHA256 = 'e5e241c881f7d54999ea554394e17ceb2953e2dbc884436e6963fa017556a8ce';

async function assertInventory(root, directory, expected) {
  let entries;
  try {
    entries = await readdir(resolve(root, directory), { withFileTypes: true });
  } catch (error) {
    if (error.code === 'ENOENT') throw Error(`Missing hymn directory: ${directory}`);
    throw error;
  }
  const actual = new Set(entries.filter(entry => entry.isFile()).map(entry => entry.name));
  const missing = expected.filter(name => !actual.has(name));
  const extra = entries.filter(entry => !entry.isFile() || !expected.includes(entry.name)).map(entry => entry.name);
  if (missing.length || extra.length) throw Error(`Hymn inventory mismatch in ${directory}: missing [${missing.join(', ')}]; extra or non-file [${extra.join(', ')}]`);
}

export async function generateHymns({ root = defaultRoot, check = false } = {}) {
  const read = path => readFile(resolve(root, path), 'utf8');
  const json = async path => JSON.parse(await read(path));
  const outputs = new Map();
  const write = (path, value) => outputs.set(path, stable(value));
  const selected = await json('source/selected_editions.json');
  const indexes = await Promise.all(['book1', 'book2'].map(book => json(`source/${book}_index.json`)));
  const files = await json('source/SHA256SUMS.json');
  if (selected.length !== 97 || new Set(selected.map(item => item.source_id)).size !== 97) throw Error('Expected exactly 97 unique selected editions.');
  const sourceIds = new Set(selected.map(edition => edition.source_id));
  for (const edition of selected) {
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(edition.source_id) || edition.file !== `abc/${edition.source_id}.abc`) throw Error(`Invalid selected source path: ${edition.source_id}`);
    if (!/^[a-f0-9]{64}$/.test(edition.sha256)) throw Error(`Invalid source digest: ${edition.source_id}`);
  }
  const expectedAbc = selected.map(edition => `${edition.source_id}.abc`);
  await assertInventory(root, 'abc', expectedAbc);
  const manifestAbc = Object.keys(files).filter(path => path.startsWith('abc/')).sort();
  if (stable(manifestAbc) !== stable(expectedAbc.map(name => `abc/${name}`).sort())) throw Error('Source hash manifest must cover exactly the 97 selected ABC files.');
  if (digest(await readFile(resolve(root, 'source/selected_editions.json'))) !== files['selected_editions.json']) throw Error('Selected edition evidence changed without its source manifest digest.');
  const decisions = indexes.flatMap(index => index.entries.map(row => [row.book, row.catalog_id, row.status, row.source_id ?? null, row.abc_file ?? null]));
  if (digest(stable(decisions)) !== SOURCE_DECISIONS_SHA256) throw Error('Source inclusion decisions changed: held/excluded rows and selected memberships require explicit review.');
  for (const [index, book] of indexes.map((index, n) => [index, `book${n + 1}`])) {
    if (index.book !== book || new Set(index.entries.map(row => row.catalog_id)).size !== index.entries.length) throw Error(`Duplicate or invalid catalog identities: ${book}`);
    for (const row of index.entries) {
      if (row.book !== book) throw Error(`Wrong source book: ${row.catalog_id}`);
      if (row.status === 'included' && (!sourceIds.has(row.source_id) || row.abc_file !== `abc/${row.source_id}.abc`)) throw Error(`Included entry does not have selected notation: ${row.catalog_id}`);
      if (row.status !== 'included' && (row.source_id || row.abc_file)) throw Error(`Held/excluded entry has notation: ${row.catalog_id}`);
    }
  }
  const metadata = {}, texts = {}, fullEditions = {};
  for (const edition of selected) {
    const abcBytes = await readFile(resolve(root, edition.file));
    const abc = abcBytes.toString('utf8');
    if (!abcBytes.equals(Buffer.from(abc))) throw Error(`Invalid UTF-8 source bytes: ${edition.source_id}`);
    if (digest(abcBytes) !== edition.sha256 || edition.sha256 !== files[edition.file]) throw Error(`Source bytes changed: ${edition.source_id}`);
    const memberships = indexes.flatMap(index => index.entries.filter(row => row.status === 'included' && row.source_id === edition.source_id));
    const membershipKeys = rows => rows.map(row => `${row.book}/${row.catalog_id}`).sort();
    if (stable(membershipKeys(memberships)) !== stable(membershipKeys(edition.book_memberships))) throw Error(`Membership mismatch: ${edition.source_id}`);
    const voices = voicesFromAbc(abc);
    const cs = fields(abc, 'C').filter(value => !/copyright|public domain|this score is a part/i.test(value));
    const composer = cs.join(' · ') || fields(abc, 'Z').find(value => /MUSIC:/i.test(value))?.match(/MUSIC:\s*(.*?)(?:\s+Public Domain\.?$|$)/i)?.[1];
    const tune = fields(abc, 'CZ').map(value => value.match(/(?:Music:\s*|MUSIC:\s*)[‘'“"]([^’'”"]+)[’'”"]/i)?.[1]).find(Boolean);
    const voiceStructure = voices.length === 1 && voices[0].name === 'Melody' ? 'melody' : voices.some(v => v.kind === 'chordal') ? (voices.every(v => v.kind !== 'independent') ? 'chordal-staves' : 'mixed-parts') : 'independent-parts';
    metadata[edition.source_id] = { id: `hymn-${edition.source_id}`, title: edition.title, ...(composer ? { composer } : {}), ...(tune ? { tune } : {}), voices, voiceStructure };
    const creditComments = abc.split(/\r?\n/).flatMap(line => {
      const match = /^%\s*(?:Original creator \([^)]+\)|Original rights|Original credit-words|Changes|Source arrangement license|License URL):\s*(.*)$/.exec(line);
      return match?.[1] ? [match[1]] : [];
    });
    const credits = unique([...fields(abc, 'CSZ'), ...creditComments]);
    const rightsData = edition.rights_and_attribution;
    const structured = rightsData.structured_source_evidence;
    const rights = unique([
      ...Object.entries(rightsData).filter(([key, value]) => typeof value === 'string' && !/^(?:evidence_|license$)/.test(key)).map(([, value]) => value),
      ...strings(structured?.copyrightNotice),
      ...strings(rightsData.evidence_warnings),
      ...creditComments.filter(value => /copyright|public domain|license|cc.by|cc0/i.test(value)),
      ...fields(abc, 'CNZ').filter(value => /copyright|public.domain|license|territor|cc.by|cc0|worldwide/i.test(value)),
    ]);
    const licenseUrls = unique(strings(rightsData).filter(value => /^https:\/\/creativecommons.org\/(?:licenses|publicdomain)\//.test(value)));
    const territory = rightsData.territory || 'Source-specific U.S. public-domain assertions and stated edition licenses; no blanket worldwide or recording-specific arrangement clearance.';
    const changes = unique(['Imported the selected ABCJS-compatible edition without changing notation or printed lyrics.', ...creditComments.filter(value => /convert|normaliz|transcrib|encoding repairs/i.test(value)), ...strings(edition.editorial_corrections)]);
    const provenance = { sourceId: edition.source_id, sourceUrls: Array.isArray(edition.source_url) ? edition.source_url : [edition.source_url], collection: edition.collection || credits.find(value => /Anthology|HymnsToGod/.test(value)) || 'Selected source edition', credits, licenseUrls, rights, territory, editionNotes: unique([...edition.scope_and_edition_notes, ...fields(abc, 'N'), ...fields(abc, 'W').filter(value => /^Note that this hymn/.test(value))]), changes, record: edition };
    const data = { sourceSha256: edition.sha256, metadata: metadata[edition.source_id], provenance, memberships };
    fullEditions[edition.source_id] = data;
    await write(`editions/hymnEdition-${edition.source_id}.json`, data);
    outputs.set(`notation/hymnAbc-${edition.source_id}.ts`, `// Generated from byte-preserved abc/${edition.source_id}.abc.\nconst abc = ${JSON.stringify(abc)};\nexport default abc;\n`);
    texts[edition.source_id] = [edition.title, ...fields(abc, 'TCZR'), ...fields(abc, 'w').map(normalize), ...fields(abc, 'W')].join(' ').replace(/\s+/g, ' ').toLowerCase();
  }
  await write('generated/hymnMetadata.json', metadata);
  const configurations = [
    { key: 'book1', id: 'traditional-christian-hymns', name: 'Traditional Hymns', shortName: 'Traditional Hymns', playlistUrl: 'https://open.spotify.com/playlist/1b9jWFcBFsHhBPaBIGGmkn', count: 52 },
    { key: 'book2', id: 'christian-hymns-contemporary', name: 'Traditional and Contemporary Hymns', shortName: 'Traditional and Contemporary Hymns', playlistUrl: 'https://open.spotify.com/playlist/15KG94mLEF2aw944IzsTN4', count: 97 },
  ];
  // Every book displays the selected notation edition, not catalog/recording wording.
  const sources = selected.map(edition => [edition.source_id, edition.title]);
  const sourceIndexes = new Map(sources.map(([id], index) => [id, index]));
  const books = [];
  for (const [index, config] of configurations.entries()) {
    const included = indexes[index].entries.filter(row => row.status === 'included');
    if (included.length !== config.count) throw Error(`Wrong included count: ${config.key}`);
    const entries = included.map((row, n) => ({ number: n + 1, catalogId: row.catalog_id, sourceEditionId: row.source_id, title: metadata[row.source_id].title }));
    if (entries.some(entry => !metadata[entry.sourceEditionId])) throw Error('Included entry does not have selected notation.');
    const search = Object.fromEntries(entries.map(entry => [metadata[entry.sourceEditionId].id, `${entry.number} ${entry.catalogId.toLowerCase()} ${entry.title.toLowerCase()} ${texts[entry.sourceEditionId]}`]));
    await write(`generated/hymn${config.key[0].toUpperCase()}${config.key.slice(1)}Search.json`, search);
    const canonicalAbcSha256 = digest(entries.map(entry => `${entry.catalogId}\t${entry.sourceEditionId}\t${fullEditions[entry.sourceEditionId].sourceSha256}\n`).join(''));
    const generatedArtifactsSha256 = digest(stable({ entries, search, editions: entries.map(entry => ({ metadata: metadata[entry.sourceEditionId], ...fullEditions[entry.sourceEditionId] })) }));
    books.push({ id: config.id, displayName: config.name, shortName: config.shortName, playlistUrl: config.playlistUrl, key: config.key, entries: entries.map(entry => [sourceIndexes.get(entry.sourceEditionId), entry.catalogId]), manifest: { packageId: config.id, schemaVersion: 1, corpusVersion: '2026-09-30-import-v2', releaseVersion: '1.0.0', canonicalCount: config.count, arrangementCount: config.count, canonicalAbcSha256, generatedArtifactsSha256 } });
  }
  await write('generated/hymnbooks.json', { sources, books });
  if (check) {
    // Never mkdir, write, delete, or repair in verification mode, including on failure.
    for (const directory of ['generated', 'editions', 'notation']) {
      const expected = [...outputs.keys()].filter(path => path.startsWith(`${directory}/`)).map(path => path.slice(directory.length + 1));
      await assertInventory(root, directory, expected);
    }
    for (const [path, expected] of outputs) {
      if (!(await readFile(resolve(root, path))).equals(Buffer.from(expected))) throw Error(`Generated hymn artifact differs from source: ${path}. Review the source change, then regenerate explicitly.`);
    }
  } else {
    await Promise.all(['generated', 'editions', 'notation'].map(path => mkdir(resolve(root, path), { recursive: true })));
    for (const [path, expected] of outputs) await writeFile(resolve(root, path), expected);
  }
  return { sourceCount: selected.length, membershipCount: books.reduce((count, book) => count + book.entries.length, 0), generatedFileCount: outputs.size };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2);
    if (args.length && (args.length !== 1 || args[0] !== '--check')) throw Error('Usage: node src/data/hymns/generate.mjs [--check]');
    const check = args[0] === '--check';
    const result = await generateHymns({ check });
    console.log(`${check ? 'Verified' : 'Generated'} two hymnbook catalogs: 52 + 97 memberships, ${result.sourceCount} unmodified selected editions, ${result.generatedFileCount} generated files${check ? ' (read-only)' : ''}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
