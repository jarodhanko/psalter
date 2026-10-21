import booksJson from './generated/hymnbooks.json';
import type { SongbookCatalogSong, SongbookEntry, SongbookSearchIndex } from '../../domain/songbook';
import { listedSongbookSongs, type SongbookPackage, type SongbookMembershipMove } from '../../domain/songbookPackage';

// These are browsing moves, not source deletions. Keep every generated membership,
// original number, provenance record and recording binding recoverable.
const traditionalMoves: readonly SongbookMembershipMove[] = [
  { songId: 'hymn-ly_softly-and-tenderly-thompson', number: 16, catalogId: 'H022',
    destination: { bookId: 'christian-hymns-contemporary', number: 74, catalogId: 'B022' } },
  { songId: 'hymn-oh_o-for-a-thousand-tongues-azmon', number: 29, catalogId: 'H042',
    destination: { bookId: 'christian-hymns-contemporary', number: 61, catalogId: 'B040' } },
];
const searchLoaders = {
  book1: async (): Promise<SongbookSearchIndex> => (await import('./generated/hymnBook1Search.json')).default,
  book2: async (): Promise<SongbookSearchIndex> => (await import('./generated/hymnBook2Search.json')).default,
};

/** Shared source editions are stored once, with book-local catalog identities.
 * Only catalog headings and stable IDs load eagerly. Notation, full provenance and
 * full-text search remain independently loadable, local Workbox-precache chunks. */
export const createHymnbookPackage = (key: 'book1' | 'book2'): SongbookPackage => {
  const book = booksJson.books.find(item => item.key === key);
  if (!book) throw new Error(`Unknown hymnbook ${key}`);
  const songs: readonly SongbookCatalogSong[] = book.entries.map((entry, index) => {
    const [sourceEditionId, sourceTitle] = booksJson.sources[Number(entry[0])];
    return {
      id: `hymn-${sourceEditionId}`,
      sourceEditionId,
      title: sourceTitle,
      number: index + 1,
      catalogId: String(entry[1]),
      voices: [],
      variant: '',
    };
  });
  const byId = new Map(songs.map(song => [song.id, song]));
  const catalog: readonly SongbookEntry[] = songs.map(song => ({ number: song.number, songs: [song] }));
  const clampNumber = (number: number) => Number.isFinite(number)
    ? Math.min(songs.length, Math.max(1, Math.trunc(number))) : 1;
  const songbook: SongbookPackage = {
    id: book.id,
    displayName: book.displayName,
    shortName: book.shortName,
    playlistUrl: book.playlistUrl,
    manifest: book.manifest,
    songs,
    movedSongs: key === 'book1' ? traditionalMoves : undefined,
    catalog,
    range: { first: 1, last: songs.length },
    clampNumber,
    getEntry: number => catalog[number - 1],
    select: (number, requestedId) => {
      const entry = catalog[clampNumber(number) - 1];
      return entry?.songs.find(song => song.id === requestedId) ?? entry?.songs[0];
    },
    loadSearchIndex: async () => {
      const index = await searchLoaders[key]();
      return Object.fromEntries(listedSongbookSongs(songbook).map(song => [song.id, index[song.id]]));
    },
    loadSong: async (id: string) => {
      const song = byId.get(id);
      if (!song?.sourceEditionId) return undefined;
      return (await import('./runtime')).loadHymnEdition(song, key);
    },
  };
  return songbook;
};
