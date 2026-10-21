import {
  COLLECTIONS_STORAGE_KEY, COLLECTION_LIMITS, collectionsReducer, emptySongCollections, isSongFavorite,
  parseSongCollections, readableSongCollections, STORAGE_UNAVAILABLE_NOTICE, STORAGE_UNREADABLE_NOTICE,
  type CollectionsAction, type SongCollections,
} from './songCollections';

// Obsolete bundles know only the v1 localStorage key. Never mirror this database
// back to that key, or reimport it after migration: doing either revives deletions.
export const COLLECTIONS_DATABASE = 'psalter.collections.v2';
export const COLLECTIONS_STORE = 'library';
export const COLLECTIONS_CURRENT = 'current';
export const COLLECTIONS_BACKUP = 'legacy-v1';
export const COLLECTIONS_SIGNAL = 'psalter.collections.v2.changed';
export const COLLECTIONS_CHANGED_EVENT = 'psalter-collections-changed';
export const STORAGE_UPGRADED_NOTICE = 'Library storage is now protected from older tabs. Before reloading older tabs, note any songs or lists saved only there. Later edits in those tabs stay separate from this library.';
export const STORAGE_OLDER_TAB_NOTICE = 'Another tab changed the older library. Those changes are separate from this protected library. Before reloading that tab, note any songs or lists saved only there.';

export const STORAGE_CONFLICT_NOTICE = 'This change could not be saved because the saved item is unavailable or a library limit was reached. Review the current library and try again.';

export interface CollectionsSnapshot {
  collections: SongCollections;
  revision: number;
  recentClearedAt: number;
  storageNotice: string;
  writable: boolean;
  operationNotice?: string;
}
interface StoredCollections {
  version: 2;
  revision: number;
  recentClearedAt: number;
  raw: string;
}
// Intent is captured before entering the transaction. A stale toggle must never
// reverse its meaning merely because another tab has already added/removed it.
export interface CollectionsOperation {
  action: Exclude<CollectionsAction, { type: 'favorite/toggle' }>;
  issuedAt: number;
}

const unavailable = (notice = STORAGE_UNAVAILABLE_NOTICE): CollectionsSnapshot => ({
  collections: emptySongCollections(), revision: -1, recentClearedAt: 0, storageNotice: notice, writable: false,
});
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
function readRecord(value: unknown): CollectionsSnapshot {
  if (!record(value) || Object.keys(value).some(key => !['version', 'revision', 'recentClearedAt', 'raw'].includes(key))
      || value.version !== 2 || !Number.isSafeInteger(value.revision) || (value.revision as number) < 0
      || !Number.isSafeInteger(value.recentClearedAt) || (value.recentClearedAt as number) < 0
      || typeof value.raw !== 'string') return unavailable(STORAGE_UNREADABLE_NOTICE);
  const collections = parseSongCollections(value.raw);
  return { collections: collections ?? readableSongCollections(value.raw), revision: value.revision as number,
    recentClearedAt: value.recentClearedAt as number, writable: !!collections,
    storageNotice: collections ? '' : STORAGE_UNREADABLE_NOTICE };
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    let settled = false;
    const fail = () => { if (!settled) { settled = true; reject(new Error('Library storage unavailable')); } };
    try {
      if (!globalThis.indexedDB) { fail(); return; }
      request = globalThis.indexedDB.open(COLLECTIONS_DATABASE, 1);
    } catch { fail(); return; }
    request.onupgradeneeded = event => {
      if (settled) { request.transaction?.abort(); request.result.close(); return; }
      // A fresh store only. Never repair/delete an unfamiliar existing schema.
      if (event.oldVersion === 0) request.result.createObjectStore(COLLECTIONS_STORE);
    };
    request.onerror = fail;
    request.onblocked = fail;
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      if (settled) { database.close(); return; }
      settled = true;
      resolve(database);
    };
  });
}

function announceChange() {
  window.dispatchEvent(new Event(COLLECTIONS_CHANGED_EVENT));
  try {
    // A signal only: storage events never contain or supply an authoritative snapshot.
    window.localStorage.setItem(COLLECTIONS_SIGNAL, `${Date.now()}:${Math.random()}`);
  } catch { /* IndexedDB can remain available when localStorage is blocked. */ }
  try {
    const channel = new BroadcastChannel(COLLECTIONS_DATABASE);
    channel.postMessage('changed');
    channel.close();
  } catch { /* Focus/pageshow also refresh from the database. */ }
}

/** The read, optional one-time import, reduction, and write share one transaction. */
export async function transactSongCollections(operation?: CollectionsOperation): Promise<CollectionsSnapshot> {
  let database: IDBDatabase;
  try { database = await openDatabase(); } catch { return unavailable(); }
  return new Promise(resolve => {
    let transaction: IDBTransaction;
    let result = unavailable();
    let changed = false;
    let settled = false;
    const finish = (snapshot: CollectionsSnapshot) => {
      if (settled) return;
      settled = true;
      database.close();
      resolve(snapshot);
    };
    try {
      try {
        transaction = database.transaction(COLLECTIONS_STORE, 'readwrite', { durability: 'strict' });
      } catch (error) {
        if (!(error instanceof TypeError) && !(error instanceof DOMException && error.name === 'NotSupportedError')) throw error;
        transaction = database.transaction(COLLECTIONS_STORE, 'readwrite');
      }
      const store = transaction.objectStore(COLLECTIONS_STORE);
      transaction.onabort = () => finish(unavailable());
      transaction.onerror = () => { /* Abort is the terminal failure event. */ };
      transaction.oncomplete = () => {
        finish(result);
        if (changed) announceChange();
      };
      const apply = (stored: unknown) => {
        result = readRecord(stored);
        if (!result.writable || !operation) return;
        const { action } = operation;
        // An automatic settings snapshot from a visit opened before a clear may
        // arrive later. Its original visit time must not repopulate the history.
        if (action.type === 'recent/open' && result.recentClearedAt > 0 && (action.now ?? operation.issuedAt) <= result.recentClearedAt) return;
        const collections = collectionsReducer(result.collections, action);
        const recentClearedAt = action.type === 'recent/clear' ? Math.max(result.recentClearedAt, operation.issuedAt) : result.recentClearedAt;
        if (collections === result.collections && recentClearedAt === result.recentClearedAt) {
          const idempotent = action.type === 'favorite/remove' || action.type === 'recent/clear' || action.type === 'list/delete' || action.type === 'list/remove'
            || (action.type === 'favorite/add' && isSongFavorite(result.collections, action.song))
            || (action.type === 'list/create' && result.collections.lists.some(list => list.id === action.id))
            || (action.type === 'list/rename' && result.collections.lists.some(list => list.id === action.id && list.name === action.name.trim()));
          if (!idempotent) result = { ...result, operationNotice: STORAGE_CONFLICT_NOTICE };
          return;
        }
        const raw = JSON.stringify(collections);
        if (raw.length > COLLECTION_LIMITS.storedCharacters || result.revision >= Number.MAX_SAFE_INTEGER) {
          result = { ...result, writable: false, storageNotice: STORAGE_UNAVAILABLE_NOTICE };
          return;
        }
        const next: StoredCollections = { version: 2, raw, revision: result.revision + 1, recentClearedAt };
        store.put(next, COLLECTIONS_CURRENT);
        result = { ...result, collections, revision: next.revision, recentClearedAt };
        changed = true;
      };
      const current = store.get(COLLECTIONS_CURRENT);
      current.onsuccess = () => {
        try {
          if (current.result !== undefined) { apply(current.result); return; }
          const backup = store.get(COLLECTIONS_BACKUP);
          backup.onsuccess = () => {
            try {
              // A surviving migration marker means missing current data is damage,
              // not permission to reimport an obsolete snapshot and resurrect saves.
              if (backup.result !== undefined) {
                result = unavailable(STORAGE_UNREADABLE_NOTICE);
                return;
              }
              const raw = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY);
              if (raw !== null && raw.length > COLLECTION_LIMITS.storedCharacters) {
                result = unavailable(STORAGE_UNREADABLE_NOTICE);
                return;
              }
              const imported: StoredCollections = { version: 2, revision: 0, recentClearedAt: 0,
                raw: raw ?? JSON.stringify(emptySongCollections()) };
              // Exactly one bounded raw backup, including malformed/future data.
              // Both writes commit together; failure leaves v1 completely untouched.
              store.put(raw, COLLECTIONS_BACKUP);
              store.put(imported, COLLECTIONS_CURRENT);
              changed = true;
              apply(imported);
              if (raw !== null && result.writable) result = { ...result, storageNotice: STORAGE_UPGRADED_NOTICE };
            } catch { transaction.abort(); }
          };
        } catch { transaction.abort(); }
      };
    } catch { finish(unavailable()); }
  });
}
