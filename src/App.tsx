import { FormEvent, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SongbookCatalogSong, SongbookSearchIndex, SongbookSong, SongVoice } from './domain/songbook';
import { listedSongbookSongs, type SongbookPackage } from './domain/songbookPackage';
import { getInstalledSongbook, installedSongbooks } from './songbooks/registry';
import { getPsalterRecordingUrl } from './data/psalterRecordings';
import { PsalmReader } from './features/psalms/PsalmReader';
import { useScreenWakeLock } from './features/pwa/useScreenWakeLock';
import { ViewerDrawer } from './features/viewer/ViewerDrawer';
import { NumberNavigation } from './features/viewer/NumberNavigation';
import type { DrawerSection } from './features/viewer/ViewerDrawer';
import { useSongCollections } from './features/collections/useSongCollections';
import { COLLECTION_LIMITS, normalizeSavedSong, resolveSavedSong, sameResolvedSong, type SavedSongSelection, type SavedSongList } from './features/collections/songCollections';
import { clearSharedViewerSettings, createShareUrl, readSharedViewerSettings, readSongLocation } from './features/sharing/shareUrl';
import { settingsForSongNavigation, type ViewerSettings } from './features/sharing/viewerSettings';
import { newSearchKey, parseTypedNumber, readSearchSession, replaceSearchSession, searchHistoryState, type SearchSession } from './features/search/searchHistory';
import './App.css';

const AddToList = lazy(() => import('./features/collections/AddToList').then(module => ({ default: module.AddToList })));
const CollectionsPanel = lazy(() => import('./features/collections/CollectionsPanel').then(module => ({ default: module.CollectionsPanel })));
const ServiceBooklet = lazy(() => import('./features/booklet/ServiceBooklet').then(module => ({ default: module.ServiceBooklet })));
const ScoreViewer = lazy(() => import('./features/viewer/ScoreViewer').then((module) => ({ default: module.ScoreViewer })));
const HymnRecordingLink = lazy(() => import('./features/recordings/HymnRecordingLink').then(module => ({ default: module.HymnRecordingLink })));
// The irregular printed bar groups in no. 326 still need playback review;
// the final chord is source-verified as half notes.
const unusualPlaybackScores = new Set(['psalter326']);

interface AppSelection {
  songbook: SongbookPackage;
  song: SongbookCatalogSong;
  settings?: ViewerSettings;
  preferences?: NavigationPreferences;
  warning?: string;
  notice?: string;
}

interface NavigationPreferences {
  settings: ViewerSettings;
  voices: readonly SongVoice[];
}

const selectionFromLocation = (preferences?: NavigationPreferences): AppSelection => {
  const route = readSongLocation(window.location.search, installedSongbooks);
  const fallbackBook = getInstalledSongbook();
  const fallback = { songbook: fallbackBook, song: fallbackBook.select(fallbackBook.range.first)! };
  if (route.status === 'invalid') return { ...fallback, warning: `${route.reason} Showing the first Psalter selection.` };
  const selection = route.status === 'valid' ? { songbook: route.songbook, song: route.song, notice: route.notice } : fallback;
  const shared = readSharedViewerSettings(window.location.search);
  // The current history entry may contain choices made after its original URL
  // was opened. Reuse them only for this exact book, number, and setting.
  const historyEntry = window.history.state?.psalterViewer;
  const saved = historyEntry?.version === 1 ? normalizeSavedSong(historyEntry.selection) : undefined;
  const savedDestination = saved && resolveSavedSong(saved, installedSongbooks);
  const historySettings = shared.status !== 'invalid' && savedDestination?.songbook.id === selection.songbook.id
    && savedDestination.song.id === selection.song.id && savedDestination.song.number === selection.song.number ? saved?.settings : undefined;
  const settings = historySettings ?? (shared.status === 'valid' ? shared.settings : undefined);
  // Ordinary history navigation keeps the current preferences. Explicit shared
  // or saved settings still belong to their destination and take precedence.
  return { ...selection, settings, preferences: shared.status === 'none' ? preferences : undefined,
    warning: shared.status === 'invalid' ? shared.reason : undefined };
};

const normalize = (value: string) =>
  value.toLowerCase().normalize('NFKD').replace(/æ/g, 'ae').replace(/[^a-z0-9]+/g, ' ').trim();

const variantLabel = (variant: string) => {
  if (!variant) return '';
  if (/^b$/i.test(variant)) return 'Second tune';
  const tuneNumber = variant.match(/_tune(\d+)/i)?.[1];
  if (tuneNumber) return `Tune ${tuneNumber}`;
  return variant.replace(/^_/, '').replace(/_/g, ' ');
};

function pushLocation(songbook: SongbookPackage, song: SongbookCatalogSong, settings?: ViewerSettings, search?: SearchSession) {
  const url = settings ? new URL(createShareUrl(window.location.href,
    { bookId: songbook.id, number: song.number, songId: song.id }, settings)) : new URL(window.location.href);
  if (!settings) clearSharedViewerSettings(url);
  url.searchParams.set('book', songbook.id);
  url.searchParams.set('number', String(song.number));
  url.searchParams.set('tune', song.id);
  if (url.href !== window.location.href || search) window.history.pushState(searchHistoryState(undefined, search), '', url);
}

// One vector shape keeps both directions independent of platform arrow glyphs.
function NavigationArrow({ direction }: { direction: 'previous' | 'next' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M5 12h14m-6-6 6 6-6 6" transform={direction === 'previous' ? 'rotate(180 12 12)' : undefined} />
  </svg>;
}

export default function App() {
  const screenWakeStatus = useScreenWakeLock();
  const [selection, setSelection] = useState<AppSelection>(() => selectionFromLocation());
  const navigationPreferences = useRef<NavigationPreferences | undefined>(undefined);
  const { songbook, song: selectedSong } = selection;
  const recordingUrl = getPsalterRecordingUrl(songbook.id, selectedSong.number);
  const isPsalter = songbook.id === 'psalter-1912';
  const listedSongs = useMemo(() => listedSongbookSongs(songbook), [songbook]);
  const hymnsByTitle = useMemo(() => isPsalter ? [] : [...listedSongs].sort((left, right) =>
    (left.title ?? '').localeCompare(right.title ?? '', 'en', { sensitivity: 'base', numeric: true }) || left.id.localeCompare(right.id)), [listedSongs, isPsalter]);
  const hymnIndex = hymnsByTitle.findIndex(song => song.id === selectedSong.id);
  const previousHymn = hymnsByTitle[hymnIndex - 1];
  const nextHymn = hymnsByTitle[hymnIndex + 1];
  const [loadedSelection, setLoadedSelection] = useState<{ songbook: SongbookPackage; song: SongbookSong }>();
  const loadedSong = loadedSelection?.songbook === songbook && loadedSelection.song.id === selectedSong.id
    ? loadedSelection.song : undefined;
  const [loadError, setLoadError] = useState('');
  const collections = useSongCollections();
  const [viewerRevision, setViewerRevision] = useState(0);
  const [currentSnapshot, setCurrentSnapshot] = useState<{ viewer: string; song: SavedSongSelection }>();
  const [booklet, setBooklet] = useState<SavedSongList>();
  const viewerIdentity = `${viewerRevision}:${songbook.id}:${selectedSong.id}`;
  const activeViewer = useRef(viewerIdentity);
  activeViewer.current = booklet ? '' : viewerIdentity;
  const recordedVisit = useRef<{ viewer: string; snapshot: string; openedAt: number } | undefined>(undefined);
  const [searchSession, setSearchSession] = useState<SearchSession | undefined>(() => readSearchSession(window.history.state, songbook.id));
  const query = searchSession?.query ?? '';
  const searchSessionRef = useRef(searchSession);
  // Keep the final scroll even if Back/Forward interrupts a throttled write.
  const searchSnapshots = useRef(new Map<string, SearchSession>());
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const pendingSearchRestore = useRef<SearchSession | undefined>(searchSession?.view === 'results' ? searchSession : undefined);
  const setSearch = (next: SearchSession | undefined) => {
    searchSessionRef.current = next;
    setSearchSession(next);
  };
  const snapshotSearch = (focusedSongId?: string) => {
    const current = searchSessionRef.current;
    if (!current) return undefined;
    return current.view === 'results' ? { ...current, pageScroll: window.scrollY,
      resultScroll: resultsRef.current?.scrollTop ?? 0, focusedSongId: focusedSongId ?? current.focusedSongId } : current;
  };
  const updateQuery = (value: string) => {
    pendingSearchRestore.current = undefined;
    const next: SearchSession | undefined = value.trim() ? { version: 1, key: newSearchKey(), bookId: songbook.id, query: value,
      view: 'results', pageScroll: window.scrollY, resultScroll: 0 } : undefined;
    // Editing an open song starts a fresh results visit; ordinary keystrokes do
    // not create a history entry each. Keep the viewer's current settings intact.
    if (searchSessionRef.current?.view === 'song' && next) {
      window.history.pushState(searchHistoryState(window.history.state, next), '', window.location.href);
    } else replaceSearchSession(next);
    setSearch(next);
    setSearchError('');
    setNumberError('');
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
  };
  const returnToResults = () => {
    const current = searchSessionRef.current;
    if (!current || current.bookId !== songbook.id) return;
    const next: SearchSession = { ...current, view: 'results' };
    // Explicitly reopen these local results; never blindly leave the app with
    // history.back() when the previous entry may be an external/direct link.
    window.history.pushState(searchHistoryState(window.history.state, next), '', window.location.href);
    pendingSearchRestore.current = next;
    setSearch(next);
  };
  const [searchIndex, setSearchIndex] = useState<{ songbookId: string; index: SongbookSearchIndex }>();
  const [searchError, setSearchError] = useState('');
  const [numberError, setNumberError] = useState('');
  const [psalmOpen, setPsalmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<DrawerSection>('song');
  const drawerOpener = useRef<HTMLElement | null>(null);
  const restoreDrawerPosition = useRef(true);
  const closeDrawer = (restore = true) => { restoreDrawerPosition.current = restore; setDrawerOpen(false); };
  const openDrawer = (section: DrawerSection, opener: HTMLElement) => {
    drawerOpener.current = opener; restoreDrawerPosition.current = true;
    setDrawerSection(section); setDrawerOpen(true); setLibraryVisited(true);
  };
  const [libraryVisited, setLibraryVisited] = useState(false);
  const libraryToggleRef = useRef<HTMLButtonElement>(null);
  const [settingsTarget, setSettingsTarget] = useState<HTMLDivElement | null>(null);
  const [drawerPlaybackTarget, setDrawerPlaybackTarget] = useState<HTMLDivElement | null>(null);
  const [focusScoreHeading, setFocusScoreHeading] = useState(false);
  const scoreHeadingRef = useRef<HTMLHeadingElement>(null);
  const [actionsTarget, setActionsTarget] = useState<HTMLDivElement | null>(null);
  const [addToListOpen, setAddToListOpen] = useState(false);
  const [addToListFocusRequest, setAddToListFocusRequest] = useState(0);
  const [collectionNotice, setCollectionNotice] = useState('');
  const swipeHostRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    setLoadedSelection(undefined);
    setLoadError('');
    void songbook.loadSong(selectedSong.id)
      .then((song) => {
        if (!active) return;
        const matching = song?.id === selectedSong.id ? song : undefined;
        setLoadedSelection(matching ? { songbook, song: matching } : undefined);
        if (!matching) setLoadError('This score could not be found in the installed songbook.');
      })
      .catch(() => {
        if (active) setLoadError('This score could not be loaded. Try again or reinstall the latest app version.');
      });
    return () => { active = false; };
  }, [selectedSong.id, songbook.id]);

  useEffect(() => {
    if (!normalize(query) || searchIndex?.songbookId === songbook.id || searchError) return;
    let active = true;
    void songbook.loadSearchIndex()
      .then((index) => { if (active) setSearchIndex({ songbookId: songbook.id, index }); })
      .catch(() => { if (active) setSearchError('Search is unavailable until the local index finishes loading.'); });
    return () => { active = false; };
  }, [query, searchError, searchIndex, songbook]);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const restoreLocation = () => {
      const leavingSearch = searchSessionRef.current;
      if (leavingSearch?.view === 'results' && !pendingSearchRestore.current) searchSnapshots.current.set(leavingSearch.key, leavingSearch);
      const nextSelection = selectionFromLocation(navigationPreferences.current);
      setSelection(nextSelection);
      setViewerRevision(value => value + 1);
      setCurrentSnapshot(undefined);
      setBooklet(undefined);
      const historySearch = readSearchSession(window.history.state, nextSelection.songbook.id);
      const cachedSearch = historySearch && searchSnapshots.current.get(historySearch.key);
      const restoredSearch = historySearch && cachedSearch ? { ...cachedSearch, view: historySearch.view } : historySearch;
      pendingSearchRestore.current = restoredSearch?.view === 'results' ? restoredSearch : undefined;
      setSearch(restoredSearch);
      setNumberError('');
      setAddToListOpen(false);
      setCollectionNotice('');
      setSearchIndex(undefined);
      setSearchError('');
      setPsalmOpen(false);
      closeDrawer(false);
      setFocusScoreHeading(restoredSearch?.view !== 'results');
    };
    window.addEventListener('popstate', restoreLocation);
    return () => {
      window.removeEventListener('popstate', restoreLocation);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  useEffect(() => {
    if (!focusScoreHeading) return;
    scoreHeadingRef.current?.focus();
    setFocusScoreHeading(false);
  }, [focusScoreHeading, selectedSong.id]);

  useEffect(() => {
    if (searchSession?.view !== 'results') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const recordScroll = () => {
      const current = searchSessionRef.current;
      if (current?.view !== 'results' || pendingSearchRestore.current) return;
      searchSessionRef.current = { ...current, pageScroll: window.scrollY, resultScroll: resultsRef.current?.scrollTop ?? 0 };
      // Never replace history on every animation frame: some browsers impose
      // history-write rate limits. One trailing snapshot per 500ms is enough.
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        const latest = searchSessionRef.current;
        if (latest?.view === 'results' && latest.key === current.key) replaceSearchSession(latest);
      }, 500);
    };
    window.addEventListener('scroll', recordScroll, { passive: true });
    const resultsHost = resultsRef.current;
    resultsHost?.addEventListener('scroll', recordScroll, { passive: true });
    return () => { clearTimeout(timer); window.removeEventListener('scroll', recordScroll); resultsHost?.removeEventListener('scroll', recordScroll); };
  }, [searchSession?.view, query]);

  const captureSettings = useCallback((settings: ViewerSettings) => {
    if (!loadedSong || activeViewer.current !== viewerIdentity) return;
    navigationPreferences.current = { settings, voices: loadedSong.voices };
    const next: SavedSongSelection = { bookId: songbook.id, songId: loadedSong.id, number: loadedSong.number,
      title: loadedSong.title || `${songbook.shortName} ${loadedSong.number}`, bookName: songbook.shortName, settings };
    setCurrentSnapshot(current => current?.viewer === viewerIdentity && JSON.stringify(current.song) === JSON.stringify(next)
      ? current : { viewer: viewerIdentity, song: next });
    // Keep browser Back/Forward faithful without making a history entry for
    // every slider movement, or replacing an unsupported link's warning URL.
    try {
      const state = window.history.state;
      const previous = state?.psalterViewer;
      if (previous?.version !== 1 || JSON.stringify(previous.selection) !== JSON.stringify(next)) {
        window.history.replaceState({ ...(state && typeof state === 'object' && !Array.isArray(state) ? state : {}),
          psalterViewer: { version: 1, selection: next } }, '', window.location.href);
      }
    } catch { /* Saving a song still works if the browser restricts history state. */ }
  }, [loadedSong, songbook, viewerIdentity]);
  const currentSelection = currentSnapshot?.viewer === viewerIdentity && currentSnapshot.song.bookId === songbook.id
    && currentSnapshot.song.songId === selectedSong.id ? currentSnapshot.song : undefined;
  useEffect(() => {
    if (!currentSelection) return;
    const snapshot = JSON.stringify(currentSelection);
    const previous = recordedVisit.current;
    const newVisit = previous?.viewer !== viewerIdentity;
    if (!newVisit && previous.snapshot === snapshot) return;
    const openedAt = newVisit ? Date.now() : previous.openedAt;
    recordedVisit.current = { viewer: viewerIdentity, snapshot, openedAt };
    // Keep later edits when reopening a recent song, but honor an explicit
    // clear in this visit (including a clear received from another tab).
    if (!newVisit && !collections.collections.recent.some(visit => visit.song.bookId === currentSelection.bookId
      && visit.song.songId === currentSelection.songId)) return;
    collections.dispatch({ type: 'recent/open', song: currentSelection, now: openedAt });
  }, [currentSelection, viewerIdentity, collections.collections.recent, collections.dispatch]);

  const results = useMemo(() => {
    const needle = normalize(query);
    if (!needle) return [];
    const exactNumber = Number(needle);
    const bookSearchIndex = searchIndex?.songbookId === songbook.id ? searchIndex.index : undefined;
    if (!bookSearchIndex) return [];
    return listedSongs
      .filter((song) => (Number.isInteger(exactNumber) && exactNumber === song.number) || bookSearchIndex[song.id]?.includes(needle))
      .slice(0, 30);
  }, [query, searchIndex, songbook, listedSongs]);

  const chooseSong = (song: SongbookCatalogSong, nextSongbook = songbook, settings?: ViewerSettings, fromResults = false, notice?: string) => {
    const previousSearch = snapshotSearch(fromResults ? song.id : undefined);
    if (previousSearch) searchSnapshots.current.set(previousSearch.key, previousSearch);
    replaceSearchSession(previousSearch);
    const nextSearch = previousSearch?.bookId === nextSongbook.id ? { ...previousSearch, view: 'song' as const } : undefined;
    pendingSearchRestore.current = undefined;
    if (nextSongbook.id !== songbook.id) {
      setSearchIndex(undefined);
      setSearchError('');
    }
    setSelection({ songbook: nextSongbook, song, settings, notice,
      preferences: settings === undefined ? navigationPreferences.current : undefined });
    setViewerRevision(value => value + 1);
    setCurrentSnapshot(undefined);
    setBooklet(undefined);
    setSearch(nextSearch);
    setNumberError('');
    setAddToListOpen(false);
    setCollectionNotice('');
    setPsalmOpen(false);
    closeDrawer(false);
    pushLocation(nextSongbook, song, settings, nextSearch);
    setFocusScoreHeading(true);
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const openSavedSong = (saved: SavedSongSelection) => {
    const resolved = resolveSavedSong(saved, installedSongbooks);
    if (resolved) chooseSong(resolved.song, resolved.songbook, saved.settings, false, resolved.notice);
  };
  const openBooklet = (list: SavedSongList) => {
    if (currentSelection) setSelection(current => ({ ...current, settings: currentSelection.settings, preferences: undefined }));
    closeDrawer(false);
    setBooklet(list);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const chooseSongbook = (songbookId: string) => {
    const nextSongbook = installedSongbooks.find((candidate) => candidate.id === songbookId);
    const firstSong = nextSongbook?.getEntry(nextSongbook.range.first)?.songs[0];
    if (nextSongbook && firstSong) chooseSong(firstSong, nextSongbook);
  };

  const chooseNumber = (number: number) => {
    if (!Number.isSafeInteger(number)) {
      return;
    }
    const next = songbook.getEntry(songbook.clampNumber(number))?.songs[0];
    if (next) chooseSong(next);
  };

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const text = query.trim();
    if (!text) {
      setNumberError(isPsalter ? 'Enter a Psalter number from 1 to 450, or search by title, tune, or lyric.' : 'Enter a hymn title, tune, or lyric.');
      return;
    }
    // Only a whole-number submission navigates. “Psalm 23” and other text
    // retain their live results; malformed numeric input never clamps.
    if (isPsalter && /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) {
      const number = parseTypedNumber(text, songbook.range.first, songbook.range.last);
      if (number === undefined) {
        setNumberError(`Enter a whole number from ${songbook.range.first} to ${songbook.range.last}.`);
        return;
      }
      chooseNumber(number);
    } else if (searchSessionRef.current?.view === 'song') returnToResults();
  };

  useEffect(() => {
    const host = swipeHostRef.current;
    if (!host || booklet) return;
    let disposed = false;
    let unbind: (() => void) | undefined;
    // Gesture tracking is independent of rendering and never blocks scrolling.
    void import('./features/viewer/scoreSwipe').then(({ bindScoreSwipe }) => {
      if (!disposed) unbind = bindScoreSwipe(host, direction => {
        if (isPsalter) chooseNumber(selectedSong.number + direction);
        else {
          const next = direction > 0 ? nextHymn : previousHymn;
          if (next) chooseSong(next);
        }
      });
    }).catch(() => undefined);
    return () => { disposed = true; unbind?.(); };
  }, [viewerIdentity, booklet]);

  const entry = songbook.getEntry(selectedSong.number)!;
  const hasCurrentBookSearchIndex = !normalize(query) || searchIndex?.songbookId === songbook.id;
  useEffect(() => {
    const pending = pendingSearchRestore.current;
    if (!pending || searchSession?.view !== 'results' || pending.bookId !== songbook.id || pending.query !== query
      || (!hasCurrentBookSearchIndex && !searchError)) return;
    const frame = requestAnimationFrame(() => {
      if (pendingSearchRestore.current !== pending) return;
      const target = Array.from(resultsRef.current?.querySelectorAll<HTMLButtonElement>('[data-song-id]') ?? [])
        .find(button => button.dataset.songId === pending.focusedSongId);
      (target ?? searchInputRef.current)?.focus({ preventScroll: true });
      if (resultsRef.current) resultsRef.current.scrollTop = pending.resultScroll;
      window.scrollTo({ top: pending.pageScroll, behavior: 'auto' });
      pendingSearchRestore.current = undefined;
    });
    return () => cancelAnimationFrame(frame);
  }, [searchSession, songbook.id, query, hasCurrentBookSearchIndex, searchError, results]);
  const savedFavorites = currentSelection ? collections.collections.favorites.filter(saved => sameResolvedSong(saved, currentSelection, installedSongbooks)) : [];
  const savedFavorite = savedFavorites.find(saved => saved.bookId === currentSelection?.bookId) ?? savedFavorites[0];
  const duplicateFavoriteLabel = savedFavorites.length > 1 ? `Remove favorite saved in ${savedFavorite.bookName}` : undefined;
  const favorite = !!savedFavorite;


  if (booklet) return <div className="app-shell booklet-shell">
    <Suspense fallback={<p className="notice" role="status">Loading booklet preview…</p>}>
      <ServiceBooklet list={booklet} songbooks={installedSongbooks} onClose={() => {
        setBooklet(undefined); setViewerRevision(value => value + 1); setCurrentSnapshot(undefined); setFocusScoreHeading(true);
      }} />
    </Suspense>
  </div>;

  return (
    <div className="app-shell">
      <div className="app-page" inert={drawerOpen}>
      <header className="compact-header">
        <h1 className="visually-hidden">{songbook.shortName}{isPsalter ? ` ${selectedSong.number}` : ''}</h1>
        <button ref={libraryToggleRef} className="compact-icon-button menu-toggle" type="button" aria-label="Open menu" title="Song, library, and settings" aria-haspopup="dialog" aria-expanded={drawerOpen} onClick={event => openDrawer('song', event.currentTarget)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <form className="compact-search" role="search" onSubmit={submitSearch} noValidate>
          <label className="visually-hidden" htmlFor="library-search">Search {isPsalter ? songbook.shortName : 'hymns'}</label>
          <input id="library-search" ref={searchInputRef} type="search" aria-invalid={!!numberError} aria-describedby={`library-search-help${numberError ? ' number-error' : ''}`} placeholder={isPsalter ? 'Psalter number or search…' : 'Search hymn titles…'} value={query} onChange={event => updateQuery(event.target.value)} />
          <span id="library-search-help" className="visually-hidden">{isPsalter ? 'Search by number, scripture reference, title, tune, composer, or lyric. Enter a whole Psalter number from 1 to 450 and submit to open it.' : 'Search this hymnbook by title, tune, composer, or lyric.'}</span>
          <button type="submit" aria-label={isPsalter ? 'Go or search' : 'Search hymns'} title={isPsalter ? 'Go or search' : 'Search hymns'}>Go</button>
        </form>
        <nav className="compact-navigation" aria-label={isPsalter ? 'Psalter navigation' : 'Hymn navigation'}>
          <button className="compact-icon-button" type="button" aria-label={isPsalter ? 'Previous Psalter number' : previousHymn ? `Previous hymn: ${previousHymn.title}` : 'Previous hymn'} disabled={isPsalter ? selectedSong.number <= songbook.range.first : !previousHymn} onClick={() => isPsalter ? chooseNumber(selectedSong.number - 1) : previousHymn && chooseSong(previousHymn)}><NavigationArrow direction="previous" /></button>
          <button className="compact-icon-button" type="button" aria-label={isPsalter ? 'Next Psalter number' : nextHymn ? `Next hymn: ${nextHymn.title}` : 'Next hymn'} disabled={isPsalter ? selectedSong.number >= songbook.range.last : !nextHymn} onClick={() => isPsalter ? chooseNumber(selectedSong.number + 1) : nextHymn && chooseSong(nextHymn)}><NavigationArrow direction="next" /></button>
        </nav>
        {numberError && <p id="number-error" className="number-error" role="alert">{numberError}</p>}
      </header>
      <main className="viewer-layout">
        {!isPsalter && <div className="hymn-title-picker">
          <label htmlFor="hymn-title">Choose hymn by title</label>
          <select id="hymn-title" value={selectedSong.id} onChange={event => { const hymn = listedSongs.find(song => song.id === event.target.value); if (hymn) chooseSong(hymn); }}>
            {hymnsByTitle.map(hymn => <option key={hymn.id} value={hymn.id}>{hymn.title || 'Untitled hymn'}</option>)}
          </select>
        </div>}
        {isPsalter && <NumberNavigation bookName={songbook.shortName} first={songbook.range.first} last={songbook.range.last} selected={selectedSong.number} placement="top" onSelect={chooseNumber} />}
        <section className="search-context" aria-label={`${songbook.shortName} search`} hidden={!searchSession || !!numberError || (isPsalter && searchSession.view === 'song' && /^\d+$/.test(query.trim()))}>
          {searchSession && <div className="search-context-actions">
            {searchSession.view === 'song' && <button type="button" onClick={returnToResults}>← Back to results for “{query}”</button>}
            <button type="button" onClick={() => { updateQuery(''); searchInputRef.current?.focus(); }}>Clear search</button>
          </div>}
          {searchSession?.view === 'results' ? (
            <div ref={resultsRef} className="search-results" role="region" aria-label="Search results">
              {!hasCurrentBookSearchIndex && !searchError ? <p className="result-count" role="status">Loading the complete search index…</p> : searchError ? <p className="notice error" role="alert">{searchError}</p> : <p className="result-count" role="status">{results.length === 30 ? 'First 30 matches' : `${results.length} ${results.length === 1 ? 'match' : 'matches'}`}</p>}
              {results.map((song) => (
                <button className={`result-card${isPsalter ? '' : ' result-card--title'}`} type="button" aria-current={song.id === selectedSong.id ? 'true' : undefined} key={song.id} data-song-id={song.id} onClick={() => chooseSong(song, songbook, undefined, true)}>
                  {isPsalter && <span className="result-number">{song.number}</span>}
                  <span>
                    <strong>{song.title || `${songbook.shortName} ${song.number}`}</strong>
                    <small>{[song.psalmNumber ? `Psalm ${song.psalmNumber}` : '', song.tune, variantLabel(song.variant), !isPsalter ? songbook.shortName : ''].filter(Boolean).join(' · ')}</small>
                  </span>
                </button>
              ))}
              {hasCurrentBookSearchIndex && !searchError && !results.length && <p className="empty-state">No matching songbook settings.</p>}
            </div>
          ) : null}
        </section>

        <section className="score-panel" aria-labelledby="score-title" ref={swipeHostRef}>
          <div className="score-heading">
            <p className="print-only">{songbook.shortName} {selectedSong.number}{selectedSong.variant ? ` · ${variantLabel(selectedSong.variant)}` : ''}<span className="print-build-marker">· App v{__APP_VERSION__} · build {__APP_BUILD__}</span></p>
            <p className="eyebrow">{isPsalter ? `${songbook.shortName} ${selectedSong.number}` : songbook.shortName}</p>
            <h2 id="score-title" ref={scoreHeadingRef} tabIndex={-1}>{selectedSong.title || `${songbook.shortName} ${selectedSong.number}`}</h2>
            <div className="song-information">
              <details className="song-credits">
                <summary>Tune &amp; credits</summary>
                <p>{[loadedSong?.tune ?? selectedSong.tune, loadedSong?.composer ?? selectedSong.composer].filter(Boolean).join(' · ')}</p>
                {selectedSong.catalogId && <p className="catalog-reference">Original catalog: {selectedSong.catalogId}</p>}
              </details>
              {selectedSong.psalmNumber && <button className="psalm-toggle" type="button" aria-expanded={psalmOpen} aria-controls={psalmOpen ? 'current-psalm' : undefined} onClick={() => setPsalmOpen(open => !open)}>{psalmOpen ? 'Hide' : 'Read'} Psalm {selectedSong.psalmNumber}</button>}
            </div>
            <p className="print-only">{[loadedSong?.tune ?? selectedSong.tune, loadedSong?.composer ?? selectedSong.composer].filter(Boolean).join(' · ')}{selectedSong.catalogId ? ` · Original catalog: ${selectedSong.catalogId}` : ''}</p>
            <p className="visually-hidden" role="status">Showing {songbook.shortName} {selectedSong.number}: {selectedSong.title || `${songbook.shortName} ${selectedSong.number}`}</p>
          </div>
          {psalmOpen && selectedSong.psalmNumber && <PsalmReader number={selectedSong.psalmNumber} />}

          {songbook.id === 'psalter-1912' && unusualPlaybackScores.has(selectedSong.id) && (
            <p className="notice" role="status">This setting follows the photographed notes, but its unusual bar lengths are still under playback review.</p>
          )}

          {entry.songs.length > 1 && (
            <fieldset className="variant-picker">
              <legend className="visually-hidden">Tune setting</legend>
              {entry.songs.map((song, index) => (
                <label key={song.id}>
                  <input
                    type="radio"
                    name="tune-setting"
                    checked={song.id === selectedSong.id}
                    onChange={() => chooseSong(song)}
                  />
                  <span>{variantLabel(song.variant) || (index === 0 ? 'Primary tune' : `Tune ${index + 1}`)}</span>
                </label>
              ))}
            </fieldset>
          )}

          {selection.warning && <p className="notice" role="alert">{selection.warning}</p>}
          {selection.notice && <p className="notice" role="status">{selection.notice}</p>}
          {loadedSong ? (
            <Suspense fallback={<p className="notice" role="status">Loading score viewer…</p>}>
              <ScoreViewer key={`${songbook.id}:${loadedSong.id}:${viewerRevision}`} song={loadedSong} songbook={songbook} initialSettings={selection.preferences
                ? settingsForSongNavigation(selection.preferences.settings, selection.preferences.voices, loadedSong.voices) : selection.settings} onSettingsChange={captureSettings} actionsTarget={actionsTarget} drawerSettings={{ target: settingsTarget, playbackTarget: drawerPlaybackTarget, open: drawerOpen && drawerSection === 'settings', onOpen: opener => openDrawer('settings', opener) }} collectionActions={{
                favorite, favoriteLabel: duplicateFavoriteLabel, addToListDisabled: !collections.ready || !currentSelection, favoriteDisabled: !collections.ready || !currentSelection || (!favorite && collections.collections.favorites.length >= COLLECTION_LIMITS.favorites),
                onFavorite: () => {
                  if (!collections.ready || !currentSelection) return;
                  collections.dispatch(savedFavorite ? { type: 'favorite/remove', bookId: savedFavorite.bookId, songId: savedFavorite.songId }
                    : { type: 'favorite/add', song: currentSelection });
                  setCollectionNotice(savedFavorites.length > 1 ? `Removed the favorite saved in ${savedFavorite.bookName}. Another saved version remains in favorites.`
                    : favorite ? 'Removed from favorites.' : 'Added to favorites.');
                },
                onAddToList: () => { if (collections.ready && currentSelection) { setAddToListOpen(true); setAddToListFocusRequest(value => value + 1); setCollectionNotice(''); } },
              }} />
            </Suspense>
          ) : loadError ? <p className="notice error" role="alert">{loadError}</p> : <p className="notice" role="status">Loading score…</p>}
        </section>
        {isPsalter && <NumberNavigation bookName={songbook.shortName} first={songbook.range.first} last={songbook.range.last} selected={selectedSong.number} placement="bottom" onSelect={chooseNumber} />}
      </main>

      <footer className="site-footer">
        <span>Content from {songbook.displayName}.</span>
        <a href="/about.html">About &amp; guide</a>
        {recordingUrl && <a href={recordingUrl} target="_blank" rel="noopener noreferrer" aria-label="Maria Van Dyke piano arrangement on Spotify (opens in a new tab)">Maria Van Dyke piano arrangement on Spotify</a>}
        {!isPsalter && <Suspense fallback={null}><HymnRecordingLink bookId={songbook.id} songId={selectedSong.id} /></Suspense>}
        {songbook.playlistUrl && <a href={songbook.playlistUrl} target="_blank" rel="noopener noreferrer" aria-label={`${songbook.displayName} on Spotify (opens in a new tab)`}>{songbook.displayName} on Spotify</a>}
        <a href={`${import.meta.env.BASE_URL}THIRD_PARTY_NOTICES.txt`}>Third-party notices</a>
      </footer>
      </div>
      <ViewerDrawer playbackTargetRef={setDrawerPlaybackTarget} open={drawerOpen} section={drawerSection} onSection={setDrawerSection} onClose={() => closeDrawer()} opener={drawerOpener} restorePosition={restoreDrawerPosition}>
        <section data-drawer-section="song" hidden={drawerSection !== 'song'}>
          <h2 data-drawer-heading tabIndex={-1}>This song</h2>
          <p className="drawer-song-title">{isPsalter ? `${songbook.shortName} ${selectedSong.number} · ` : ''}{selectedSong.title}</p>
          <div className="song-actions-target" ref={setActionsTarget}>{!loadedSong && <p role="status">Song actions are available when the score loads.</p>}</div>
          {addToListOpen && <Suspense fallback={<p className="notice" role="status">Loading song lists…</p>}>
            <AddToList focusRequest={addToListFocusRequest} controller={collections} currentSelection={currentSelection} onClose={() => {
              setAddToListOpen(false);
              actionsTarget?.querySelector<HTMLButtonElement>('[data-add-to-list]')?.focus({ preventScroll: true });
            }} />
          </Suspense>}
          {collectionNotice && <p className="notice collection-notice" role="status">{collectionNotice}{collections.storageNotice ? ` ${collections.storageNotice}` : ''}</p>}
        </section>
        <section data-drawer-section="library" hidden={drawerSection !== 'library'}>
          <h2 data-drawer-heading tabIndex={-1}>Books &amp; my library</h2>
          <div className="book-picker">
            <label htmlFor="songbook-select">Current book</label>
            <select id="songbook-select" aria-label="Select songbook" value={songbook.id} onChange={event => chooseSongbook(event.target.value)}>
              {installedSongbooks.map(installed => <option key={installed.id} value={installed.id}>{installed.displayName}</option>)}
            </select>
          </div>
          {libraryVisited && <Suspense fallback={<p className="notice" role="status">Loading saved library…</p>}>
            <CollectionsPanel showCurrentActions={false} controller={collections} currentSelection={currentSelection} songbooks={installedSongbooks} onOpen={openSavedSong} onPrint={openBooklet} />
          </Suspense>}
          <details className="library-help"><summary>About this book</summary>
            <p>{songbook.displayName} is available locally: {isPsalter ? songbook.manifest.canonicalCount : listedSongs.length} {isPsalter ? 'numbered selections' : 'hymns'} and {songbook.manifest.arrangementCount - songbook.manifest.canonicalCount} alternate settings.</p>
            <p>Search includes every encoded stanza, including hyphenated lyric underlay.</p>
            {!isPsalter && <p>Original catalog IDs, source credits, and edition notes stay with each hymn. Rights vary by source and territory.</p>}
            {songbook.playlistUrl && <p><a href={songbook.playlistUrl} target="_blank" rel="noreferrer">{songbook.displayName} on Spotify</a></p>}
          </details>
        </section>
        <section data-drawer-section="settings" hidden={drawerSection !== 'settings'}>
          <h2 data-drawer-heading tabIndex={-1}>Score settings</h2>
          <p className="screen-wake-status" aria-live="polite">{{
            starting: 'Screen awake: starting…',
            active: 'Screen awake: on.',
            expired: 'Screen awake: 10 minutes finished. Normal screen timeout applies.',
            unavailable: 'Screen awake: unavailable. Your browser or device is using its normal timeout.',
            unsupported: 'Screen awake: not supported by this browser.',
            inactive: 'Screen awake: off.',
          }[screenWakeStatus]} Keeps your screen on for up to 10 minutes after opening or returning, when your browser and battery allow.</p>
          <div ref={setSettingsTarget}>{!loadedSong && <p role="status">Settings are available when the score loads.</p>}</div>
        </section>
      </ViewerDrawer>
    </div>
  );
}
