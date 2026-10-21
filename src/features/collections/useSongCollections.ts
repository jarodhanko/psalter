import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  COLLECTIONS_STORAGE_KEY, collectionsReducer, emptySongCollections, isSongFavorite, readableSongCollections,
  type CollectionsAction, type SongCollections,
} from './songCollections';
import {
  COLLECTIONS_CHANGED_EVENT, COLLECTIONS_DATABASE, COLLECTIONS_SIGNAL, STORAGE_OLDER_TAB_NOTICE,
  STORAGE_UPGRADED_NOTICE, transactSongCollections, type CollectionsOperation, type CollectionsSnapshot,
} from './collectionStorage';

export interface SongCollectionsController {
  collections: SongCollections;
  dispatch: (action: CollectionsAction) => void;
  storageNotice: string;
  ready: boolean;
}

function createController() {
  let initial = emptySongCollections();
  let legacyPresent = false;
  try {
    const raw = window.localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    legacyPresent = raw !== null;
    initial = readableSongCollections(raw);
  } catch { /* Read asynchronously below. */ }
  let base: CollectionsSnapshot = { collections: initial, revision: -1, recentClearedAt: 0, writable: false, storageNotice: '' };
  let ready = false;
  let visitOnly = false;
  let busy = false;
  let refreshNeeded = false;
  let generation = 0;
  let compatibilityNotice = legacyPresent ? STORAGE_UPGRADED_NOTICE : '';
  let operationNotice = '';
  const pending: CollectionsOperation[] = [];
  const listeners = new Set<() => void>();
  let snapshot = { collections: initial, storageNotice: 'Loading saved library…', ready: false };

  const publish = () => {
    let collections = base.collections;
    let clearedAt = base.recentClearedAt;
    for (const operation of pending) {
      const { action } = operation;
      if (action.type === 'recent/open' && clearedAt > 0 && (action.now ?? operation.issuedAt) <= clearedAt) continue;
      collections = collectionsReducer(collections, action);
      if (action.type === 'recent/clear') clearedAt = Math.max(clearedAt, operation.issuedAt);
    }
    snapshot = { collections, ready, storageNotice: visitOnly ? base.storageNotice
      : !ready ? 'Loading saved library…'
        : pending.length ? 'Saving library changes…' : operationNotice || compatibilityNotice };
    listeners.forEach(listener => listener());
  };
  const accept = (value: CollectionsSnapshot) => {
    if (value.storageNotice === STORAGE_UPGRADED_NOTICE) compatibilityNotice = STORAGE_UPGRADED_NOTICE;
    if (!value.writable) {
      // Keep our last readable view and queued changes on a failed transaction.
      // A known but partially unreadable record can still show its valid rows.
      const olderOnly = base.revision < 0 && value.revision < 0 && (base.collections.favorites.length || base.collections.lists.length || base.collections.recent.length);
      const storageNotice = olderOnly ? `${value.storageNotice} The older saved data shown here may be out of date; protected saves could not be opened.` : value.storageNotice;
      base = { ...(value.revision >= 0 && value.revision >= base.revision ? value : base), storageNotice, writable: false };
      visitOnly = true;
    } else if (value.revision >= base.revision) base = value;
  };
  const refresh = async (currentGeneration = generation) => {
    if (visitOnly) return;
    if (busy) { refreshNeeded = true; return; }
    const value = await transactSongCollections();
    if (currentGeneration !== generation || visitOnly) return;
    // Never overlay an in-flight action twice (for example, moving a list row).
    if (busy) { refreshNeeded = true; return; }
    accept(value);
    ready = true;
    publish();
    void flush();
  };
  const flush = async () => {
    if (!ready || busy || visitOnly || !pending.length) return;
    busy = true;
    while (pending.length && !visitOnly) {
      const operation = pending[0];
      const value = await transactSongCollections(operation);
      if (value.writable) { pending.shift(); operationNotice = value.operationNotice ?? operationNotice; }
      accept(value);
      publish();
    }
    busy = false;
    if (refreshNeeded && !visitOnly) { refreshNeeded = false; void refresh(); }
  };
  const dispatch = (action: CollectionsAction) => {
    const intent = action.type === 'favorite/toggle'
      ? isSongFavorite(snapshot.collections, action.song)
        ? { type: 'favorite/remove' as const, bookId: action.song.bookId, songId: action.song.songId }
        : { type: 'favorite/add' as const, song: action.song }
      : action;
    const issuedAt = Date.now();
    if (intent.type !== 'recent/open') operationNotice = '';
    pending.push({ action: intent.type === 'recent/open' ? { ...intent, now: intent.now ?? issuedAt } : intent, issuedAt });
    publish();
    void flush();
  };
  return {
    dispatch,
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    start: () => {
      const currentGeneration = ++generation;
      const reload = () => { void refresh(currentGeneration); };
      const storage = (event: StorageEvent) => {
        if (event.key === COLLECTIONS_STORAGE_KEY) {
          compatibilityNotice = STORAGE_OLDER_TAB_NOTICE;
          publish();
        }
        if (event.key === COLLECTIONS_SIGNAL || event.key === null) reload();
      };
      const visible = () => { if (document.visibilityState === 'visible') reload(); };
      const beforeUnload = (event: BeforeUnloadEvent) => {
        if (pending.length && !visitOnly) { event.preventDefault(); event.returnValue = ''; }
      };
      let channel: BroadcastChannel | undefined;
      try { channel = new BroadcastChannel(COLLECTIONS_DATABASE); channel.onmessage = reload; } catch { /* Storage/focus fallback. */ }
      window.addEventListener('storage', storage);
      window.addEventListener(COLLECTIONS_CHANGED_EVENT, reload);
      window.addEventListener('focus', reload);
      window.addEventListener('pageshow', reload);
      window.addEventListener('beforeunload', beforeUnload);
      document.addEventListener('visibilitychange', visible);
      reload();
      return () => {
        generation++;
        channel?.close();
        window.removeEventListener('storage', storage);
        window.removeEventListener(COLLECTIONS_CHANGED_EVENT, reload);
        window.removeEventListener('focus', reload);
        window.removeEventListener('pageshow', reload);
        window.removeEventListener('beforeunload', beforeUnload);
        document.removeEventListener('visibilitychange', visible);
      };
    },
  };
}

/** UI intent is optimistic; only committed transactions become the saved base. */
export function useSongCollections(): SongCollectionsController {
  const [controller] = useState(createController);
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  useEffect(controller.start, [controller]);
  return { ...state, dispatch: controller.dispatch };
}
