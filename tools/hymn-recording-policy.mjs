import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseSync } from 'vite';

// Independent of the runtime literal. Updating that file alone cannot authorize a
// different book/song/URL/qualification. Evidence: docs/hymn-recordings-audit.json.
export const HYMN_RECORDING_COUNT = 149;
export const HYMN_RECORDING_URL_COUNT = 101;
export const HYMN_RECORDING_ENTRIES_SHA256 = 'b3fff1369060ef75df3eda61c402d1a0298e3059afb1ef36c9bb129106426712';
export const HYMN_PLAYLISTS = Object.freeze({
  'traditional-christian-hymns': 'https://open.spotify.com/playlist/1b9jWFcBFsHhBPaBIGGmkn',
  'christian-hymns-contemporary': 'https://open.spotify.com/playlist/15KG94mLEF2aw944IzsTN4',
});

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function validateHymnRecordingMap(recordings, catalogs) {
  if (!isObject(recordings)) throw new Error('Hymn recordings must be a book/song object');
  if (Object.keys(recordings).length !== Object.keys(HYMN_PLAYLISTS).length
    || Object.keys(recordings).some(bookId => !Object.hasOwn(HYMN_PLAYLISTS, bookId))) {
    throw new Error('Hymn recordings must contain exactly the two audited books');
  }
  const approvedUrls = new Set();
  const entries = [];
  for (const bookId of Object.keys(recordings).sort()) {
    const book = recordings[bookId];
    const catalog = catalogs.find(item => item.id === bookId);
    if (!catalog || catalog.playlistUrl !== HYMN_PLAYLISTS[bookId]) throw new Error(`Unexpected hymn playlist for ${bookId}`);
    if (!isObject(book)) throw new Error(`Hymn recording book ${bookId} must be a song object`);
    const songs = new Set(catalog.songIds);
    if (songs.size !== catalog.songIds.length || songs.size !== Object.keys(book).length) {
      throw new Error(`Hymn recording coverage differs from the actual catalog for ${bookId}`);
    }
    for (const songId of Object.keys(book).sort()) {
      if (!songs.has(songId)) throw new Error(`Hymn recording ${bookId}/${songId} is absent from the actual catalog`);
      const recording = book[songId];
      if (!isObject(recording) || Object.keys(recording).sort().join(',') !== 'linkLabel,url') {
        throw new Error(`Unexpected hymn recording fields for ${bookId}/${songId}`);
      }
      if (typeof recording.url !== 'string'
        || /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/.exec(recording.url)?.[0] !== recording.url) {
        throw new Error(`Invalid complete Spotify track URL for ${bookId}/${songId}`);
      }
      if (typeof recording.linkLabel !== 'string') throw new Error(`Missing hymn recording label for ${bookId}/${songId}`);
      approvedUrls.add(recording.url);
      entries.push(JSON.stringify([bookId, songId, recording.url, recording.linkLabel]));
    }
  }
  if (entries.length !== HYMN_RECORDING_COUNT) throw new Error(`Expected exactly ${HYMN_RECORDING_COUNT} hymn recording memberships`);
  if (approvedUrls.size !== HYMN_RECORDING_URL_COUNT) throw new Error(`Expected exactly ${HYMN_RECORDING_URL_COUNT} distinct hymn recordings`);
  if (createHash('sha256').update(entries.join('\n')).digest('hex') !== HYMN_RECORDING_ENTRIES_SHA256) {
    throw new Error('Hymn book/song/URL/label entries do not match the audited SHA256');
  }
  return approvedUrls;
}

// Check every object level before JSON.parse can conceal duplicate book, song,
// URL or label keys. The independently pinned digest checks their values.
export function parseHymnRecordingMap(text) {
  const recordings = JSON.parse(text);
  const source = parseSync('recordings.js', `const recordings = ${text};`);
  if (source.errors.length) throw new Error('Cannot parse the raw hymn recording map');
  const visit = node => {
    if (node.type === 'ObjectExpression') {
      const keys = node.properties.map(property => property.key.value);
      if (new Set(keys).size !== keys.length) throw new Error('Duplicate raw hymn recording key');
      for (const property of node.properties) visit(property.value);
    }
  };
  visit(source.program.body[0].declarations[0].init);
  return recordings;
}

export async function readHymnRecordingPolicy(root) {
  const source = await readFile(resolve(root, 'src/data/hymnRecordingMap.ts'), 'utf8');
  const literal = /^export default (\{[\s\S]*\});\s*$/.exec(source)?.[1];
  if (!literal) throw new Error('Hymn recording module must export only the audited object literal');
  const recordings = parseHymnRecordingMap(literal);
  const catalog = JSON.parse(await readFile(resolve(root, 'src/data/hymns/generated/hymnbooks.json'), 'utf8'));
  return validateHymnRecordingMap(recordings, catalog.books.map(book => ({
    id: book.id,
    playlistUrl: book.playlistUrl,
    songIds: book.entries.map(entry => `hymn-${catalog.sources[Number(entry[0])][0]}`),
  })));
}

export function validateHymnRecordingEmission(approvedUrls, emittedUrls) {
  if (approvedUrls.size !== emittedUrls.size || [...approvedUrls].some(url => !emittedUrls.has(url))) {
    throw new Error('Emitted hymn recording URL set does not equal the complete audited map');
  }
}
