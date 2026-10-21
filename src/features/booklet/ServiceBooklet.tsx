import { Component, useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { SongbookSong } from '../../domain/songbook';
import type { SongbookPackage } from '../../domain/songbookPackage';
import { COLLECTION_LIMITS, normalizeSavedSong, resolveSavedSong, type SavedSongList, type SongListEntry } from '../collections/songCollections';
import { normalizeViewerSettings, type ViewerSettings } from '../sharing/viewerSettings';
import { setUpdateBusy } from '../pwa/updateSession';
import { displayKey } from '../viewer/displayKey';
import { psalter143DisplayKey } from '../viewer/keySignatures143';
import { psalter226DisplayKey } from '../viewer/keySignatures226';
import { ScoreViewer } from '../viewer/ScoreViewer';
import './ServiceBooklet.css';

export interface ServiceBookletProps {
  list: SavedSongList;
  songbooks: readonly SongbookPackage[];
  onClose: () => void;
}

interface BookletRow {
  entry: SongListEntry;
  status: 'loading' | 'loaded' | 'error';
  songbook?: SongbookPackage;
  song?: SongbookSong;
  settings?: ViewerSettings;
  notice?: string;
  error?: string;
  renderStarted?: boolean;
  printReady?: boolean;
  renderError?: string;
}

const PARALLEL_SONGS = 4;

class PreviewBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onFailure(); }
  render() {
    return this.state.failed ? <p className="service-booklet-error" role="alert">This song’s print preview could not be rendered.</p> : this.props.children;
  }
}

function verseLabel(settings: ViewerSettings): string {
  if (settings.selectedPrintVerses !== undefined) return settings.selectedPrintVerses.length
    ? `Selected verses: ${settings.selectedPrintVerses.join(', ')}` : 'No verses selected';
  return settings.printVerseSelection === undefined ? 'All verses' : 'No verses selected';
}

function SongPreview({ row, index, generation, onReady }: {
  row: BookletRow;
  index: number;
  generation: number;
  onReady: (generation: number, index: number, error?: string) => void;
}) {
  const ready = useCallback((error?: string) => onReady(generation, index, error), [generation, index, onReady]);
  const failed = useCallback(() => ready('The score preview could not be rendered. Return to the song and try again.'), [ready]);
  return <PreviewBoundary onFailure={failed}>
    <ScoreViewer song={row.song!} songbook={row.songbook} initialSettings={row.settings} presentationOnly onPrintReady={ready} />
  </PreviewBoundary>;
}

function BookletDocument({ list, songbooks, onClose }: ServiceBookletProps) {
  const id = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const generationRef = useRef(0);
  const [generation, setGeneration] = useState(0);
  const [rows, setRows] = useState<BookletRow[]>([]);
  const [printError, setPrintError] = useState('');
  const invalidList = list.entries.length > COLLECTION_LIMITS.entries
    ? `This list exceeds the ${COLLECTION_LIMITS.entries}-song booklet limit. Split it into smaller lists to print.`
    : new Set(list.entries.map((entry) => entry.id)).size !== list.entries.length
      ? 'This list contains duplicate row identifiers. Return to the list and recreate the affected selections.' : '';

  useEffect(() => { titleRef.current?.focus(); }, []);

  useEffect(() => {
    const run = ++generationRef.current;
    setGeneration(run);
    setPrintError('');
    if (invalidList) { setRows([]); return; }
    let cancelled = false;
    let cursor = 0;
    setRows(list.entries.map((entry) => ({ entry, status: 'loading' })));
    const loadNext = async () => {
      while (!cancelled && cursor < list.entries.length) {
        const index = cursor++;
        const entry = list.entries[index];
        let result: BookletRow;
        try {
          const selection = normalizeSavedSong(entry.song);
          if (!selection) throw new Error('This saved selection is invalid. Open the song and save its settings again.');
          const resolved = resolveSavedSong(selection, songbooks);
          if (!resolved) throw new Error('This saved book or tune is no longer available. Return to the list to replace or remove it.');
          const song = await resolved.songbook.loadSong(resolved.song.id);
          if (!song || song.id !== resolved.song.id || song.number !== resolved.song.number) {
            throw new Error('The saved score could not be found in this songbook. Return to the list and choose it again.');
          }
          const settings = normalizeViewerSettings(selection.settings, { voiceIds: song.voices.map((voice) => voice.id) });
          if (!settings) throw new Error('A saved part or setting is no longer available. Open the song and save its settings again.');
          // Verse identities are source-aware in ScoreViewer; keep the saved
          // subset and provenance intact instead of guessing from raw ABC rows.
          result = { entry, status: 'loaded', songbook: resolved.songbook, song, settings, notice: resolved.notice };
        } catch (error) {
          result = { entry, status: 'error', error: error instanceof Error ? error.message : 'This score could not be loaded. Return to the song and try again.' };
        }
        if (cancelled) return;
        setRows((current) => current.map((row, position) => position === index ? result : row));
      }
    };
    for (let worker = 0; worker < Math.min(PARALLEL_SONGS, list.entries.length); worker += 1) void loadNext();
    return () => { cancelled = true; generationRef.current += 1; };
  }, [list, songbooks, invalidList]);

  // Loading a whole list must not start one hundred ABC renderers at once.
  // Successful and failed previews retain their places as the next four start.
  useEffect(() => {
    const active = rows.filter((row) => row.renderStarted && !row.printReady && !row.renderError).length;
    if (active >= PARALLEL_SONGS || !rows.some((row) => row.status === 'loaded' && !row.renderStarted)) return;
    setRows((current) => {
      let slots = PARALLEL_SONGS - current.filter((row) => row.renderStarted && !row.printReady && !row.renderError).length;
      return current.map((row) => row.status === 'loaded' && !row.renderStarted && slots-- > 0
        ? { ...row, renderStarted: true } : row);
    });
  }, [rows]);

  const markReady = useCallback((run: number, index: number, error?: string) => {
    if (run !== generationRef.current) return;
    setRows((current) => {
      const row = current[index];
      if (!row || row.status !== 'loaded' || !row.renderStarted) return current;
      const renderError = typeof error === 'string' ? error || 'This score could not be prepared for printing.' : undefined;
      if (row.printReady === !renderError && row.renderError === renderError) return current;
      return current.map((item, position) => position === index ? { ...item, printReady: !renderError, renderError } : item);
    });
  }, []);

  useEffect(() => {
    const beforePrint = () => setUpdateBusy('printing', true);
    const afterPrint = () => setUpdateBusy('printing', false);
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
      setUpdateBusy('printing', false);
    };
  }, []);

  const readyCount = rows.filter((row) => row.printReady && !row.renderError).length;
  const loadedCount = rows.filter((row) => row.status !== 'loading').length;
  const errorCount = rows.filter((row) => row.status === 'error' || row.renderError).length;
  const ready = !invalidList && rows.length === list.entries.length && rows.length > 0 && readyCount === rows.length && errorCount === 0;
  const printBooklet = () => {
    if (!ready) return;
    setPrintError('');
    try { window.print(); }
    catch { setPrintError('The browser could not open printing. Check its print settings and try again.'); }
  };

  return <section className="service-booklet" aria-labelledby={`${id}-title`} data-ready={ready ? 'true' : 'false'}>
    <header className="service-booklet-header">
      <p className="service-booklet-eyebrow">Service booklet</p>
      <h2 id={`${id}-title`} ref={titleRef} tabIndex={-1}>{list.name}</h2>
      <p>{list.entries.length} {list.entries.length === 1 ? 'song' : 'songs'} · Each song starts on a new printed page.</p>
    </header>
    <div className="service-booklet-toolbar">
      <div className="service-booklet-actions">
        <button type="button" onClick={onClose}>Back to song</button>
        <button type="button" disabled={!ready} onClick={printBooklet}>Print booklet</button>
      </div>
      {!invalidList && list.entries.length > 0 && <>
        <progress aria-label="Booklet preparation" value={readyCount + errorCount} max={list.entries.length} />
        <p role="status" aria-live="polite">{ready ? 'All songs are ready to print.'
          : `${loadedCount} of ${list.entries.length} songs loaded; ${readyCount} ready to print.${errorCount ? ` ${errorCount} need attention below.` : ''}`}</p>
        {!ready && !errorCount && <p>You can return to the song at any time to cancel preparation.</p>}
      </>}
      {(invalidList || !list.entries.length) && <p className="service-booklet-error" role="alert">{invalidList || 'This list is empty. Return to the song and add selections first.'}</p>}
      {printError && <p className="service-booklet-error" role="alert">{printError}</p>}
      <p className="service-booklet-preview-help">This preview uses the saved print verses, key, and parts. Use your browser’s print dialog to print or save a PDF.</p>
    </div>
    <p className="service-booklet-print-blocked">This booklet is not ready to print. Close print preview and wait for every song to finish, or return to the list to resolve the errors shown.</p>
    <div className="service-booklet-entries">
      {rows.map((row, index) => {
        const song = row.song;
        const settings = row.settings ?? row.entry.song.settings;
        const transpose = settings.transpose ?? 0;
        const key = song ? psalter143DisplayKey(song.id, song.abc, transpose)
          ?? psalter226DisplayKey(song.id, song.abc, transpose) ?? displayKey(song.abc, transpose) : undefined;
        const title = song?.title || row.entry.song.title || `${row.entry.song.bookName} ${row.entry.song.number}`;
        const selectedParts = song ? (settings.visibleVoiceIds ?? song.voices.map((voice) => voice.id))
          .map((voiceId) => song.voices.find((voice) => voice.id === voiceId)?.name || voiceId) : undefined;
        return <article key={`${generation}-${row.entry.id}`} className="service-booklet-entry" aria-labelledby={`${id}-song-${index}`}>
          <header className="service-booklet-song-heading">
            <p>{index + 1}. {row.songbook?.displayName ?? row.entry.song.bookName} · No. {song?.number ?? row.entry.song.number}</p>
            <h3 id={`${id}-song-${index}`}>{title}</h3>
            {row.notice && <p>{row.notice}</p>}
            {song?.tune && <p>Tune: {song.tune}{song.composer ? ` · ${song.composer}` : ''}</p>}
            {!song?.tune && song?.composer && <p>{song.composer}</p>}
            <p>{verseLabel(settings)} · Key: {key || (transpose ? `${transpose > 0 ? '+' : ''}${transpose} semitones` : 'Original key')}</p>
            {selectedParts && <p>Parts: {selectedParts.length ? selectedParts.join(', ') : 'No parts selected'}</p>}
            {typeof __APP_VERSION__ === 'string' && typeof __APP_BUILD__ === 'string' && <p className="service-booklet-build">App {__APP_VERSION__} · {__APP_BUILD__}</p>}
          </header>
          {row.status === 'loading' && <p className="service-booklet-row-status">Loading score…</p>}
          {row.status === 'loaded' && !row.renderStarted && <p className="service-booklet-row-status">Waiting to prepare print preview…</p>}
          {(row.error || row.renderError) && <p className="service-booklet-error" role="alert">{row.error || row.renderError}</p>}
          {row.renderStarted && <SongPreview row={row} index={index} generation={generation} onReady={markReady} />}
        </article>;
      })}
    </div>
  </section>;
}

/** A changed list gets a fresh, cancellable preparation run and no stale readiness. */
export function ServiceBooklet(props: ServiceBookletProps) {
  return <BookletDocument key={JSON.stringify(props.list)} {...props} />;
}
