import { resolveSongbookSong, type SongbookPackage, type ResolvedSongbookSong } from '../../domain/songbookPackage';
import { normalizeViewerSettings, type ViewerSettings } from '../sharing/viewerSettings';

export const COLLECTIONS_STORAGE_KEY = 'psalter.collections.v1';
export const COLLECTION_LIMITS = {
  favorites: 200,
  recent: 30,
  lists: 30,
  entries: 100,
  name: 80,
  storedCharacters: 2_000_000,
} as const;

/** Identifies a particular setting in a particular book, never just its number. */
export interface SavedSongSelection {
  bookId: string;
  songId: string;
  number: number;
  title: string;
  bookName: string;
  settings: ViewerSettings;
}

export interface SavedSongVisit {
  song: SavedSongSelection;
  openedAt: number;
}

export interface SongListEntry {
  id: string;
  song: SavedSongSelection;
}

export interface SavedSongList {
  id: string;
  name: string;
  entries: readonly SongListEntry[];
}

export interface SongCollections {
  version: 1;
  favorites: readonly SavedSongSelection[];
  recent: readonly SavedSongVisit[];
  lists: readonly SavedSongList[];
}

export type CollectionsAction =
  | { type: 'favorite/toggle'; song: SavedSongSelection }
  | { type: 'favorite/add'; song: SavedSongSelection }
  | { type: 'favorite/remove'; bookId: string; songId: string }
  | { type: 'recent/open'; song: SavedSongSelection; now?: number }
  | { type: 'recent/clear' }
  | { type: 'list/create'; id: string; name: string }
  | { type: 'list/create-with-entry'; id: string; name: string; entryId: string; song: SavedSongSelection }
  | { type: 'list/rename'; id: string; name: string }
  | { type: 'list/delete'; id: string }
  | { type: 'list/add'; id: string; entryId: string; song: SavedSongSelection }
  | { type: 'list/remove'; id: string; entryId: string }
  | { type: 'list/move'; id: string; entryId: string; direction: -1 | 1 }
  | { type: 'list/update-entry'; id: string; entryId: string; song: SavedSongSelection }
  | { type: 'list/set-verse'; id: string; entryId: string; verse: number; selected: boolean };

export const emptySongCollections = (): SongCollections => ({ version: 1, favorites: [], recent: [], lists: [] });
export const savedSongKey = (song: Pick<SavedSongSelection, 'bookId' | 'songId'>): string => JSON.stringify([song.bookId, song.songId]);
export const isSongFavorite = (collections: SongCollections, song: Pick<SavedSongSelection, 'bookId' | 'songId'>) =>
  collections.favorites.some((favorite) => savedSongKey(favorite) === savedSongKey(song));

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
const onlyKeys = (value: Record<string, unknown>, keys: readonly string[]) => Object.keys(value).every(key => keys.includes(key));
const id = (value: unknown): value is string => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,159}$/.test(value);
const plainText = (value: unknown, maximum: number): string | undefined => typeof value === 'string'
  && value.length <= maximum && !/[\u0000-\u001f\u007f]/.test(value) ? value.trim() : undefined;
const listName = (value: unknown) => plainText(value, COLLECTION_LIMITS.name) || undefined;

export function normalizeSavedSong(value: unknown): SavedSongSelection | undefined {
  if (!object(value) || !onlyKeys(value, ['bookId', 'songId', 'number', 'title', 'bookName', 'settings']) || !id(value.bookId) || !id(value.songId)
      || !Number.isSafeInteger(value.number) || (value.number as number) < 1 || (value.number as number) > 100_000) return undefined;
  const title = plainText(value.title, 240);
  const bookName = plainText(value.bookName, 160);
  const settings = normalizeViewerSettings(value.settings);
  if (title === undefined || !bookName || !settings) return undefined;
  return { bookId: value.bookId, songId: value.songId, number: value.number as number, title, bookName, settings };
}

const unique = <T,>(values: readonly T[], key: (value: T) => string): T[] => {
  const seen = new Set<string>();
  return values.filter((value) => {
    const identity = key(value);
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
};

/** Readable rows are only a display projection, never a replacement for invalid data. */
export function readableSongCollections(raw: string | null): SongCollections {
  if (raw === null || raw.length > COLLECTION_LIMITS.storedCharacters) return emptySongCollections();
  try {
    const value: unknown = JSON.parse(raw);
    if (!object(value) || value.version !== 1) return emptySongCollections();
    const favorites = unique((Array.isArray(value.favorites) ? value.favorites : []).slice(0, COLLECTION_LIMITS.favorites)
      .flatMap(item => normalizeSavedSong(item) ?? []), savedSongKey);
    const recent = unique((Array.isArray(value.recent) ? value.recent : []).slice(0, COLLECTION_LIMITS.recent)
      .flatMap((item): SavedSongVisit[] => {
        if (!object(item) || !Number.isSafeInteger(item.openedAt) || (item.openedAt as number) < 0) return [];
        const song = normalizeSavedSong(item.song);
        return song ? [{ song, openedAt: item.openedAt as number }] : [];
      }), visit => savedSongKey(visit.song));
    const lists = unique((Array.isArray(value.lists) ? value.lists : []).slice(0, COLLECTION_LIMITS.lists)
      .flatMap((item): SavedSongList[] => {
        if (!object(item) || !id(item.id) || !Array.isArray(item.entries)) return [];
        const name = listName(item.name);
        if (!name) return [];
        const entries = unique(item.entries.slice(0, COLLECTION_LIMITS.entries).flatMap((entry): SongListEntry[] => {
          if (!object(entry) || !id(entry.id)) return [];
          const song = normalizeSavedSong(entry.song);
          return song ? [{ id: entry.id, song }] : [];
        }), entry => entry.id);
        return [{ id: item.id, name, entries }];
      }), list => list.id);
    return { version: 1, favorites, recent, lists };
  } catch { return emptySongCollections(); }
}

/** Reject the entire write model if any row or field cannot round-trip safely. */
export function parseSongCollections(raw: string | null): SongCollections | undefined {
  if (raw === null) return emptySongCollections();
  if (raw.length > COLLECTION_LIMITS.storedCharacters) return undefined;
  try {
    const value: unknown = JSON.parse(raw);
    if (!object(value) || !onlyKeys(value, ['version', 'favorites', 'recent', 'lists']) || value.version !== 1
        || !Array.isArray(value.favorites) || value.favorites.length > COLLECTION_LIMITS.favorites
        || !Array.isArray(value.recent) || value.recent.length > COLLECTION_LIMITS.recent
        || !Array.isArray(value.lists) || value.lists.length > COLLECTION_LIMITS.lists) return undefined;
    if (value.favorites.some(item => !normalizeSavedSong(item))) return undefined;
    if (value.recent.some(item => !object(item) || !onlyKeys(item, ['song', 'openedAt'])
        || !Number.isSafeInteger(item.openedAt) || (item.openedAt as number) < 0 || !normalizeSavedSong(item.song))) return undefined;
    if (value.lists.some(item => !object(item) || !onlyKeys(item, ['id', 'name', 'entries']) || !id(item.id)
        || !listName(item.name) || !Array.isArray(item.entries) || item.entries.length > COLLECTION_LIMITS.entries
        || item.entries.some(entry => !object(entry) || !onlyKeys(entry, ['id', 'song']) || !id(entry.id) || !normalizeSavedSong(entry.song))
        || new Set(item.entries.map(entry => entry.id)).size !== item.entries.length)) return undefined;
    const collections = readableSongCollections(raw);
    if (collections.favorites.length !== value.favorites.length || collections.recent.length !== value.recent.length
        || collections.lists.length !== value.lists.length) return undefined;
    return collections;
  } catch { return undefined; }
}

/** Resolve by exact book + tune identity. Missing packages never fall back to Psalter 1. */
export function resolveSavedSong(selection: SavedSongSelection, songbooks: readonly SongbookPackage[]):
  ResolvedSongbookSong | undefined {
  const songbook = songbooks.find((book) => book.id === selection.bookId);
  const song = songbook?.songs.find((candidate) => candidate.id === selection.songId && candidate.number === selection.number);
  return songbook && song ? resolveSongbookSong(songbook, song, songbooks) : undefined;
}

/** Compare the displayed destinations without rewriting either saved source record. */
export function sameResolvedSong(left: SavedSongSelection, right: SavedSongSelection, songbooks: readonly SongbookPackage[]): boolean {
  const a = resolveSavedSong(left, songbooks);
  const b = resolveSavedSong(right, songbooks);
  return !!a && !!b && a.songbook.id === b.songbook.id && a.song.id === b.song.id && a.song.number === b.song.number;
}

/** IDs belong to rows, so a service may intentionally contain the same song twice. */
export function newCollectionId(): string {
  return typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID()
    : `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

export function collectionsReducer(state: SongCollections, action: CollectionsAction): SongCollections {
  if (action.type === 'favorite/remove') {
    const favorites = state.favorites.filter((song) => savedSongKey(song) !== savedSongKey(action));
    return favorites.length === state.favorites.length ? state : { ...state, favorites };
  }
  if (action.type === 'favorite/toggle' || action.type === 'favorite/add' || action.type === 'recent/open') {
    const song = normalizeSavedSong(action.song);
    if (!song) return state;
    if (action.type === 'favorite/toggle' || action.type === 'favorite/add') {
      if (isSongFavorite(state, song)) return action.type === 'favorite/add' ? state
        : collectionsReducer(state, { type: 'favorite/remove', ...song });
      if (state.favorites.length >= COLLECTION_LIMITS.favorites) return state;
      return { ...state, favorites: [...state.favorites, song] };
    }
    const openedAt = action.now ?? Date.now();
    if (!Number.isSafeInteger(openedAt) || openedAt < 0) return state;
    return { ...state, recent: [{ song, openedAt }, ...state.recent.filter((item) => savedSongKey(item.song) !== savedSongKey(song))].slice(0, COLLECTION_LIMITS.recent) };
  }
  if (action.type === 'recent/clear') return state.recent.length ? { ...state, recent: [] } : state;
  if (!id(action.id)) return state;
  if (action.type === 'list/create' || action.type === 'list/create-with-entry') {
    const name = listName(action.name);
    if (!name || state.lists.length >= COLLECTION_LIMITS.lists || state.lists.some((list) => list.id === action.id)) return state;
    const song = action.type === 'list/create-with-entry' ? normalizeSavedSong(action.song) : undefined;
    if (action.type === 'list/create-with-entry' && (!song || !id(action.entryId))) return state;
    const entries = action.type === 'list/create-with-entry' && song ? [{ id: action.entryId, song }] : [];
    return { ...state, lists: [...state.lists, { id: action.id, name, entries }] };
  }
  const target = state.lists.find((list) => list.id === action.id);
  if (!target) return state;
  if (action.type === 'list/delete') return { ...state, lists: state.lists.filter((list) => list !== target) };
  let updated: SavedSongList = target;
  if (action.type === 'list/rename') {
    const name = listName(action.name);
    if (name && name !== target.name) updated = { ...target, name };
  } else if (action.type === 'list/add') {
    const song = normalizeSavedSong(action.song);
    if (song && id(action.entryId) && target.entries.length < COLLECTION_LIMITS.entries && !target.entries.some((entry) => entry.id === action.entryId)) {
      updated = { ...target, entries: [...target.entries, { id: action.entryId, song }] };
    }
  } else if (action.type === 'list/remove') {
    const entries = target.entries.filter((entry) => entry.id !== action.entryId);
    if (entries.length !== target.entries.length) updated = { ...target, entries };
  } else if (action.type === 'list/move') {
    const index = target.entries.findIndex((entry) => entry.id === action.entryId);
    const destination = index + action.direction;
    if ((action.direction === -1 || action.direction === 1) && index >= 0 && destination >= 0 && destination < target.entries.length) {
      const entries = [...target.entries];
      [entries[index], entries[destination]] = [entries[destination], entries[index]];
      updated = { ...target, entries };
    }
  } else if (action.type === 'list/set-verse') {
    const entry = target.entries.find(item => item.id === action.entryId);
    if (entry && Number.isInteger(action.verse) && action.verse > 0 && action.verse <= 1000) {
      const selected = entry.song.settings.selectedPrintVerses ?? entry.song.settings.printVerseSelection?.available ?? [];
      const song = normalizeSavedSong({ ...entry.song, settings: { ...entry.song.settings,
        selectedPrintVerses: action.selected ? [...new Set([...selected, action.verse])].sort((a, b) => a - b)
          : selected.filter(verse => verse !== action.verse) } });
      if (song) updated = { ...target, entries: target.entries.map(item => item === entry ? { ...item, song } : item) };
    }
  } else if (action.type === 'list/update-entry') {
    const song = normalizeSavedSong(action.song);
    const entry = target.entries.find((item) => item.id === action.entryId);
    // A settings edit cannot quietly substitute a different tune or book.
    if (song && entry && savedSongKey(song) === savedSongKey(entry.song)) {
      updated = { ...target, entries: target.entries.map((item) => item === entry ? { ...item, song } : item) };
    }
  }
  return updated === target ? state : { ...state, lists: state.lists.map((list) => list === target ? updated : list) };
}

export const STORAGE_UNAVAILABLE_NOTICE = 'This browser cannot save your library right now. Changes will last only for this visit.';
export const STORAGE_UNREADABLE_NOTICE = 'Some saved library data is not understood by this version. It has been preserved; available songs are shown below. Changes will last only for this visit.';
