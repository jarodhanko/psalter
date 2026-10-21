import { sourceTempoPolicy } from './sourceTempoPolicy';
import { sopranoEmphasisVoiceId } from './sopranoEmphasis';
import { isSourceTimingReady } from '../../data/timingWitnesses';
import { projectHymnLyrics } from '../../domain/hymnLyricPolicy';
import { restoreSourceEditionUpdateVoices } from '../pwa/sourceEditionVoiceSelection';
import { hymnLyricTranscriptFromAbc } from '../../data/hymns/lyrics';
import { originalLyricsPreferenceKey, readOriginalLyricsPreference, saveOriginalLyricsPreference } from './originalLyricsPreference';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import abcjs from 'abcjs';
import { createPortal } from 'react-dom';
import { NOTATION_KEYBOARD_HELP } from './playbackNotationControls';
import { formatLyricTranscriptLine, lyricTranscriptStanzaNumber } from '../../domain/lyricTranscript';
import { getReviewedUnderlay, qualifyAllCreaturesUnderlayParts, reconstructReviewedUnderlayTranscript } from '../../domain/reviewedUnderlay';
import { getEditorialStanzaUnderlay } from '../../domain/editorialStanzaUnderlay';
import { getPublishedStanzaVariant } from '../../domain/publishedStanzaVariant';
import { lyricTranscriptFromAbc } from '../../data/legacyPsalterCatalog';
import type { LyricTranscriptLine } from '../../domain/lyricTranscript';
import type { SongbookSong } from '../../domain/songbook';
import type { SongbookPackage } from '../../domain/songbookPackage';
import { IssueReporter } from '../issues/IssueReporter';
import { issueIdentity } from '../issues/issueIdentity';
import { extractUnderlayModel, hasGroupedStanzas, ScoreRenderer } from './ScoreRenderer';
import type { ScreenScoreFit } from './ScoreRenderer';
import { psalter26UnderlayCarrier, reconstructCarrierTranscript } from './underlayCarrier';
import { psalter31UnderlayCarrier, reconstructPsalter31Transcript } from './underlayCarrier31';
import { hasPsalter99CarrierSource, reconstructPsalter99Transcript, withPsalter99StanzaIdentities } from './underlayCarrier99';
import { hasRepeatUnderlaySource, psalter211RepeatUnderlay, psalter345RepeatUnderlay } from './repeatUnderlay';
import { displayKey } from './displayKey';
import { useScorePinch } from './useScorePinch';
import { MIN_SCORE_SCALE, MAX_SCORE_SCALE, SCORE_SCALE_STEP } from './scoreScale';
import { psalter143DisplayKey } from './keySignatures143';
import { psalter226DisplayKey } from './keySignatures226';
import { TURN_YOUR_EYES_AUDIO_SOURCE } from './audioPlaybackIdentity';
import type { TrackingSchedule } from './playbackTracking';
import type { PlaybackTrackingControllerValue } from './PlaybackTrackingController';
import { installOptionalSamples, selectSoundFontCache } from './audioSampleCache';
import { instruments, isInstrument, isOptionalInstrument } from './instruments';
import type { Instrument } from './instruments';
import { useOptionalInstrument } from './useOptionalInstrument';
import { clearViewerUpdateSnapshot, readViewerAfterUpdate, saveViewerForUpdate, setUpdateBusy, UPDATE_PREPARE_EVENT } from '../pwa/updateSession';
import { restorePrintVerseSelection } from '../pwa/printSelection';
import type { ViewerUpdateSettings } from '../pwa/updateSession';
import { normalizeViewerSettings, voiceIdsToIndexes, voiceIndexesToIds } from '../sharing/viewerSettings';
import type { ViewerSettings } from '../sharing/viewerSettings';
import { SongActions } from './SongActions';
import type { SongActionPanel, SongCollectionActions } from './SongActions';
import { DeferredFeature } from '../DeferredFeature';
import '../sharing/ShareSettings.css';
import type { PreparedScreenAbc } from '../export/abcExport';
import './playbackTracking.css';

const loadPlaybackTracking = () => import('./PlaybackTrackingController').then(module => module.PlaybackTrackingController);
const emptyTracking: PlaybackTrackingControllerValue = {
  written: undefined, pending: undefined, notice: '', available: false, overlapping: [], follow: false, suspended: false,
  registerVisible: () => () => {}, snapshot: () => undefined,
  loading: () => {}, start: () => {}, clearActive: () => {}, clearSelection: () => {},
  setNotice: () => {}, setAutoScroll: () => {}, dismissOverlapping: () => {}, chooseHead: () => {}, label: () => '',
};

const loadAbcDownload = () => import('../export/AbcDownload').then(module => module.AbcDownload);
const loadShareSettings = () => import('../sharing/ShareSettingsContent').then(module => module.ShareSettingsContent);

interface ScoreViewerProps {
  song: SongbookSong;
  songbook?: SongbookPackage;
  navigation?: (placement: 'top' | 'bottom') => ReactNode;
  initialSettings?: ViewerSettings;
  onSettingsChange?: (settings: ViewerSettings) => void;
  presentationOnly?: boolean;
  onPrintReady?: (error?: string) => void;
  actionsTarget?: HTMLElement | null;
  collectionActions?: SongCollectionActions;
  drawerSettings?: { target: HTMLElement | null; playbackTarget?: HTMLElement | null; open: boolean; onOpen: (opener: HTMLButtonElement) => void };
}
type PlaybackState = 'idle' | 'loading' | 'playing' | 'stopped' | 'finished' | 'error';
const instrumentPreferenceKey = 'psalter.instrument';
const savedInstrument = (): Instrument => {
  try {
    const value = window.localStorage.getItem(instrumentPreferenceKey);
    if (isInstrument(value)) return value;
  } catch {
    // Playback still works when storage is unavailable (for example, in a restricted browser).
  }
  return 'concertGrand';
};
const MIN_TRANSPOSE = -10;
const MAX_TRANSPOSE = 12;

const playbackStatus = (state: PlaybackState, instrument: Instrument, download: { instrument?: Instrument; message: string; busy: boolean }) => {
  const name = instrument === 'piano' ? 'Piano' : instrument === 'organ' ? 'Organ' : instruments[instrument].label;
  if (isOptionalInstrument(instrument) && (state === 'idle' || (state !== 'playing' && download.busy))) {
    const selected = `${name} selected. Press Play to begin.`;
    return download.instrument === instrument ? download.message || selected : selected;
  }
  const downloadResult = isOptionalInstrument(instrument) && download.instrument === instrument && download.message ? ` ${download.message}` : '';
  if (state === 'loading') return `${name} is loading.`;
  if (state === 'playing') return `${name} is playing.`;
  if (state === 'stopped') return `${name} stopped.${downloadResult}`;
  if (state === 'finished') return `${name} playback finished.${downloadResult}`;
  if (state === 'error') return `${name} playback could not start.${downloadResult}`;
  return `${name} ready.`;
};

const playButtonLabel = (instrument: Instrument) => `Play ${instrument === 'piano' ? 'piano' : instrument === 'organ' ? 'organ' : instruments[instrument].label.toLowerCase()}`;

const voiceName = (id: string, name: string | undefined, index: number) => {
  if (name) return name;
  const normalized = id.toLowerCase();
  if (normalized === 's' || normalized === 't1') return 'Soprano';
  if (normalized === 'a' || normalized === 't2') return 'Alto';
  if (normalized === 't' || normalized === 'b1') return 'Tenor';
  if (normalized === 'b' || normalized === 'b2') return 'Bass';
  if (normalized === 't3') return 'Treble voice 3';
  if (normalized === 'b3') return 'Bass voice 3';
  if (normalized === 't12') return 'Treble voices';
  if (normalized === 'b12') return 'Bass voices';
  return `Voice ${index + 1} (${id})`;
};

/** Alternate callers must meet the same readiness boundary as the async song loader. */
export function ScoreViewer(props: ScoreViewerProps) {
  const ready = isSourceTimingReady(props.song.id, props.song.sourceTimingContext);
  useEffect(() => {
    if (!ready) props.onPrintReady?.('This score could not be loaded.');
  }, [ready, props.onPrintReady]);
  return ready ? <ReadyScoreViewer {...props} />
    : <p className="notice error" role="alert">This score could not be loaded. Try opening the score again.</p>;
}

function ReadyScoreViewer({ song, songbook, navigation, initialSettings, onSettingsChange, presentationOnly = false, onPrintReady, actionsTarget, collectionActions, drawerSettings }: ScoreViewerProps) {
  const repeatUnderlay = song.id === 'psalter211' && hasRepeatUnderlaySource(song.abc, psalter211RepeatUnderlay)
    ? psalter211RepeatUnderlay
    : song.id === 'psalter345' && hasRepeatUnderlaySource(song.abc, psalter345RepeatUnderlay)
      ? psalter345RepeatUnderlay : undefined;
  const carrier99 = hasPsalter99CarrierSource(song.id, song.abc);
  const sourceReviewedUnderlay = useMemo(() => getReviewedUnderlay(song.id, song.abc), [song.id, song.abc]);
  const editorialUnderlay = useMemo(() => getEditorialStanzaUnderlay(song.id, song.abc), [song.id, song.abc]);
  const publishedVariant = useMemo(() => getPublishedStanzaVariant(song.id, song.abc), [song.id, song.abc]);
  const sourceUnderlayAbc = useMemo(() => sourceReviewedUnderlay?.abc ?? editorialUnderlay?.abc ?? publishedVariant?.abc ?? withPsalter99StanzaIdentities(song.id, song.abc), [song.id, song.abc, sourceReviewedUnderlay, editorialUnderlay, publishedVariant]);
  const sourceUnderlayModel = useMemo(() => extractUnderlayModel(sourceUnderlayAbc, sourceReviewedUnderlay?.identity), [sourceUnderlayAbc, sourceReviewedUnderlay]);
  const sourceLyrics = useMemo<readonly LyricTranscriptLine[]>(() => {
    if (publishedVariant) return hymnLyricTranscriptFromAbc(publishedVariant.abc);
    const carrier = reconstructCarrierTranscript(song.id, song.abc, psalter26UnderlayCarrier, extractUnderlayModel)
      ?? reconstructPsalter31Transcript(song.id, song.abc, psalter31UnderlayCarrier, extractUnderlayModel)
      ?? reconstructPsalter99Transcript(song.id, song.abc);
    // Reviewed carrier reconstructions retain w: syntax. For legacy packages
    // without provenance, retain their historical underlay-style formatting.
    if (carrier) return carrier.map((text) => ({ kind: 'underlay', text }));
    const reviewed = reconstructReviewedUnderlayTranscript(song.id, song.abc);
    if (reviewed) return lyricTranscriptFromAbc(song.abc, song.id, reviewed);
    return song.lyricTranscript ?? song.lyrics.map((text) => ({ kind: 'underlay', text }));
  }, [song.id, song.abc, song.lyricTranscript, song.lyrics, publishedVariant]);
  const sourceVoiceIds = useMemo(() => [...new Set(song.abc.split(/\r?\n/).flatMap((line) => /^V:[ \t]*([^\s]+)/.exec(line)?.[1] ?? []))], [song.abc]);
  const printableVerseNumbers = useMemo(() => [...new Set([
    ...sourceUnderlayModel.stanzaNumbers,
    ...(repeatUnderlay?.stanzaNumbers ?? []),
    ...sourceLyrics.flatMap((line) => {
      const number = lyricTranscriptStanzaNumber(line);
      return number === undefined ? [] : [number];
    }),
  ])].sort((left, right) => left - right), [sourceLyrics, sourceUnderlayModel.stanzaNumbers, repeatUnderlay]);
  const allVoiceIndexes = useMemo(() => song.voices.map((_, index) => index), [song.voices]);
  const [initialState] = useState<{ settings: Partial<ViewerUpdateSettings>; error?: string }>(() => {
    // An approved update snapshot captures newer choices than an older share URL.
    // Presentation-only copies must neither consume nor overwrite this tab state.
    const afterUpdate = presentationOnly ? {} : restoreSourceEditionUpdateVoices(
      song.id, song.sourceSha256, song.voices.map(voice => voice.id), readViewerAfterUpdate(song.id),
    );
    if (Object.keys(afterUpdate).length > 0) return { settings: afterUpdate };
    if (initialSettings === undefined) return { settings: {} };
    const settings = normalizeViewerSettings(initialSettings, { voiceIds: song.voices.map(voice => voice.id), printableVerseNumbers });
    if (!settings) return {
      settings: { visibleVoices: [], selectedPrintVerses: [], printVerseSelection: null },
      error: 'These saved choices no longer match this score. Open the song, choose its parts and verses again, then save it again.',
    };
    return { settings: {
      ...settings,
      visibleVoices: settings.visibleVoiceIds === undefined ? undefined : voiceIdsToIndexes(settings.visibleVoiceIds, song.voices),
      selectedPrintVerses: settings.selectedPrintVerses === undefined ? undefined : [...settings.selectedPrintVerses],
    } };
  });
  const restoredSettings = initialState.settings;
  const [visibleVoices, setVisibleVoices] = useState<readonly number[]>(() => restoredSettings.visibleVoices?.filter((index) => allVoiceIndexes.includes(index)) ?? allVoiceIndexes);
  const defaultLyricProjection = useMemo(() => projectHymnLyrics(song.id, song.abc), [song.id, song.abc]);
  const [showOriginalLyrics, setShowOriginalLyrics] = useState(() => restoredSettings.showOriginalLyrics
    ?? (defaultLyricProjection && defaultLyricProjection.sourceSupported ? readOriginalLyricsPreference(song.id, defaultLyricProjection.policy.sourceSha256) : false));
  const [lyricsPreferenceNotice, setLyricsPreferenceNotice] = useState('');
  const lyricProjection = useMemo(() => showOriginalLyrics ? projectHymnLyrics(song.id, song.abc, true)
    : defaultLyricProjection, [song.id, song.abc, showOriginalLyrics, defaultLyricProjection]);
  const lyricFiltered = !!lyricProjection && lyricProjection.status !== 'original';
  const reviewedUnderlay = lyricFiltered ? undefined : qualifyAllCreaturesUnderlayParts(song.id, sourceReviewedUnderlay, visibleVoices);
  const underlayAbc = lyricFiltered ? lyricProjection.projectedABC
    : sourceReviewedUnderlay && !reviewedUnderlay ? publishedVariant?.abc ?? song.abc : sourceUnderlayAbc;
  const underlayIdentity = lyricFiltered ? lyricProjection.identity : reviewedUnderlay?.identity;
  const underlayModel = useMemo(() => {
    if (!lyricFiltered) return sourceReviewedUnderlay && !reviewedUnderlay ? extractUnderlayModel(underlayAbc) : sourceUnderlayModel;
    const model = extractUnderlayModel(underlayAbc, underlayIdentity);
    return lyricProjection.underlaySelectionSupported || lyricProjection.allowedStanzaNumbers.length === 0
      ? model : { ...model, ambiguous: true };
  }, [lyricFiltered, lyricProjection, underlayAbc, underlayIdentity, sourceUnderlayModel, sourceReviewedUnderlay, reviewedUnderlay]);
  const lyrics = useMemo(() => lyricFiltered ? hymnLyricTranscriptFromAbc(lyricProjection.projectedABC)
    : sourceLyrics, [lyricFiltered, lyricProjection, sourceLyrics]);
  const availablePrintVerseNumbers = lyricFiltered
    ? printableVerseNumbers.filter(number => lyricProjection.allowedStanzaNumbers.includes(number)) : printableVerseNumbers;
  const allLyricsHidden = lyricFiltered && lyricProjection.allowedStanzaNumbers.length === 0;
  const lyricDisplayNote = !lyricProjection ? undefined : showOriginalLyrics
    ? 'Lyric display: full original verses enabled.'
    : lyricProjection.status === 'unsupported-source'
      ? 'Lyric display: source revision is unverified for default verse selection; all lyrics hidden.'
      : `Lyric display: default selection; original verses ${lyricProjection.hiddenStanzaNumbers.join(', ')} hidden.${allLyricsHidden ? ' All stanza and refrain words hidden; music only.' : ` Retained original verses: ${lyricProjection.allowedStanzaNumbers.join(', ')}.`}`;
  useEffect(() => {
    if (!defaultLyricProjection?.sourceSupported || presentationOnly) return;
    const key = originalLyricsPreferenceKey(song.id, defaultLyricProjection.policy.sourceSha256);
    const changed = (event: StorageEvent) => {
      try {
        if (event.storageArea === localStorage && (event.key === key || event.key === null)) setShowOriginalLyrics(readOriginalLyricsPreference(song.id, defaultLyricProjection.policy.sourceSha256));
      } catch { /* Keep this visit's choice if storage access becomes unavailable. */ }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, [defaultLyricProjection, presentationOnly, song.id]);

  const [transpose, setTranspose] = useState(restoredSettings.transpose ?? 0);
  const [learnerAccidentals, setLearnerAccidentals] = useState(restoredSettings.learnerAccidentals ?? false);
  const [scale, setScale] = useState(restoredSettings.scale ?? 1);
  const [screenFit, setScreenFit] = useState<ScreenScoreFit>();
  const scoreSizeFitId = useId();
  const scorePinchRef = useScorePinch(scale, setScale, !presentationOnly);
  const [stanzasPerGroup, setStanzasPerGroup] = useState(restoredSettings.stanzasPerGroup ?? 5);
  const [tempo, setTempo] = useState(restoredSettings.tempo ?? 100);
  const tempoPolicy = useMemo(() => sourceTempoPolicy(song), [song.id, song.abc, song.sourceSha256, song.sourceTimingContext]);
  const tempoUnit = tempoPolicy?.label ?? 'BPM';
  const [instrument, setInstrument] = useState<Instrument>(() => restoredSettings.instrument ?? savedInstrument());
  const sopranoVoiceId = useMemo(() => sopranoEmphasisVoiceId(song), [song.voices, song.voiceStructure, song.abc]);
  const [sopranoEmphasis, setSopranoEmphasis] = useState(restoredSettings.sopranoEmphasis ?? false);
  const sopranoEmphasisHelpId = useId();
  const optionalInstrument = useOptionalInstrument(instrument, !presentationOnly);
  const [renderedTune, setRenderedTune] = useState<abcjs.TuneObject>();
  const [playback, setPlaybackState] = useState<PlaybackState>('idle');
  const playbackActiveRef = useRef(false);
  const setPlayback = useCallback((state: PlaybackState) => {
    // Update the reload guard in the same task as the playback request, before
    // React's passive effects can run or a worker activation can be delivered.
    playbackActiveRef.current = state === 'loading' || state === 'playing';
    if (!presentationOnly) setUpdateBusy('playback', playbackActiveRef.current);
    setPlaybackState(state);
  }, [presentationOnly]);
  const [audioError, setAudioError] = useState('');
  const [exportOpened, setExportOpened] = useState(false);
  const [preparedScreenAbc, setPreparedScreenAbc] = useState<PreparedScreenAbc>();
  const underlaySourceVisible = visibleVoices.length > 0 && (repeatUnderlay || carrier99 || (reviewedUnderlay && !reviewedUnderlay.identityOnly)
    ? visibleVoices.length > 0
    : underlayModel.rows.length === 0 || underlayModel.rows.some((row) => visibleVoices.includes(Math.max(0, sourceVoiceIds.indexOf(row.voiceId)))));
  const [savedPrintVerses, setSelectedPrintVerses] = useState<number[]>(() => restorePrintVerseSelection(
    song.id, song.sourceSha256, printableVerseNumbers, restoredSettings.selectedPrintVerses, restoredSettings.printVerseSelection,
  ));
  const selectedPrintVerses = lyricFiltered ? savedPrintVerses.filter(number => lyricProjection.allowedStanzaNumbers.includes(number)) : savedPrintVerses;
  const [actionPanelState, setActionPanelState] = useState<{ song: string; abc: string; panel: SongActionPanel }>();
  const actionPanel = actionPanelState?.song === song.id && actionPanelState.abc === song.abc ? actionPanelState.panel : undefined;
  const actionsToggleRef = useRef<HTMLButtonElement>(null);
  const actionPanelRef = useRef<HTMLElement>(null);
  const actionHeadingRef = useRef<HTMLHeadingElement>(null);
  const actionPanelId = useId();
  const closeActionPanel = () => {
    setActionPanelState(undefined);
    actionsToggleRef.current?.focus({ preventScroll: true });
  };
  const openActionPanel = (panel: SongActionPanel) => {
    setSettingsOpen(false);
    if (panel === 'export') setExportOpened(true);
    setActionPanelState({ song: song.id, abc: song.abc, panel });
  };
  useEffect(() => {
    if (!actionPanel) return;
    actionHeadingRef.current?.focus({ preventScroll: true });
    const bounds = actionPanelRef.current?.getBoundingClientRect();
    if (bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
      actionPanelRef.current?.scrollIntoView?.({ block: 'start', behavior: 'auto' });
    }
  }, [actionPanel, actionPanelState]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsId = useId();
  const settingsToggleRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLElement>(null);
  useEffect(() => {
    // An active toolbar may be pinned far below its original place in the song.
    // Bring its opened settings into view rather than opening them offscreen.
    if (settingsOpen && (settingsPanelRef.current?.getBoundingClientRect().top ?? 0) < 0) {
      settingsPanelRef.current?.scrollIntoView({ block: 'start', behavior: 'auto' });
    }
  }, [settingsOpen]);
  // The renderer keeps ambiguous hymn underlay together for every positive preference.
  const unsplitHymnLyrics = song.id.startsWith('hymn-') && underlayModel.ambiguous;
  const underlaidStanzaCount = repeatUnderlay?.stanzaNumbers.length ?? (underlayModel.ambiguous ? 0 : underlayModel.stanzaNumbers.length);
  const displayedStanzasPerGroup = allLyricsHidden ? 0 : Math.min(stanzasPerGroup, Math.max(1, underlaidStanzaCount));
  // A fit belongs only to this exact screen request. Keep the reader's size
  // preference intact, and hide late reports from a previous song or setting.
  const currentScreenFit = screenFit
    && screenFit.abc === song.abc
    && screenFit.songId === song.id
    && screenFit.requestedScale === scale
    && screenFit.transpose === transpose
    && screenFit.learnerAccidentals === learnerAccidentals
    && screenFit.visibleKey === visibleVoices.join(',')
    && screenFit.stanzasPerGroup === displayedStanzasPerGroup
    && screenFit.effectiveScale > 0 && screenFit.effectiveScale < scale
    ? screenFit : undefined;
  const requestedSize = `${Math.round(scale * 100)}%`;
  const effectiveSize = currentScreenFit ? `${Math.round(currentScreenFit.effectiveScale * 1000) / 10}%` : undefined;
  const musicOnly = displayedStanzasPerGroup === 0;
  const groupedStanzas = !musicOnly && !(lyricFiltered && !lyricProjection.underlaySelectionSupported) && (repeatUnderlay
    ? repeatUnderlay.stanzaNumbers.length > displayedStanzasPerGroup
    : hasGroupedStanzas(underlayAbc, displayedStanzasPerGroup, underlayIdentity));
  const completeUnderlaidNumbers = useMemo(() => {
    if (repeatUnderlay) return new Set(repeatUnderlay.stanzaNumbers);
    // Reviewed source-carrier rows include complete paired stanzas and shared
    // choruses. Keep the full transcript available for lower-only transfers.
    if (reviewedUnderlay && !reviewedUnderlay.identityOnly) return new Set(visibleVoices.some(index => sourceVoiceIds[index] === 'T1')
      ? reviewedUnderlay.stanzaNumbers : []);
    // Tenor's printed rests omit the middle phrase. Its full poem must remain
    // available, including when the score is grouped or selected for printing.
    if (carrier99) return new Set(visibleVoices.some(index => ['T1', 'T2', 'B2'].includes(sourceVoiceIds[index]))
      ? underlayModel.stanzaNumbers : []);
    if (underlayModel.ambiguous || underlayModel.stanzaNumbers.length === 0) return new Set<number>();
    // This exact, part-qualified witness includes all five complete stanzas
    // and their shared ending. Its final singleton row belongs to every
    // stanza, so ordinal lyric slots cannot establish completeness here.
    if (song.id === 'hymn-oh_all-creatures-of-our-god-and-king-lasst-uns-erfreuen' && reviewedUnderlay
      && underlayModel.rows.length === reviewedUnderlay.identity.rows.length) return new Set(reviewedUnderlay.stanzaNumbers);
    try {
      const tune = abcjs.parseOnly(underlayAbc)[0];
      const scoreLines = tune.lines.filter((line) => line.staff?.length);
      if (scoreLines.length === 0) return new Set<number>();
      return new Set(underlayModel.stanzaNumbers.filter((_, stanzaIndex) => scoreLines.every((line) =>
        line.staff?.some((staff) => staff.voices?.some((voice) => {
          const sungNotes = voice.filter((event) => event.el_type === 'note' && !('rest' in event && event.rest));
          return sungNotes.length > 0 && sungNotes.every((event) =>
            'lyric' in event && Array.isArray(event.lyric) && event.lyric.length > stanzaIndex,
          );
        })),
      )));
    } catch { return new Set<number>(); }
  }, [song.id, underlayAbc, underlayModel, repeatUnderlay, reviewedUnderlay, carrier99, visibleVoices, sourceVoiceIds]);
  const transcriptLyrics = useMemo(() => {
    if (!groupedStanzas || repeatUnderlay || (reviewedUnderlay && !reviewedUnderlay.identityOnly) || !underlaySourceVisible) return lyrics;
    return lyrics.filter((line) => {
      const number = lyricTranscriptStanzaNumber(line);
      return !number || !completeUnderlaidNumbers.has(Number(number));
    });
  }, [completeUnderlaidNumbers, groupedStanzas, repeatUnderlay, reviewedUnderlay, lyrics, underlaySourceVisible]);
  const allLyricsUnderlaid = useMemo(() => {
    if (musicOnly || !underlaySourceVisible) return false;
    return lyrics.length > 0 && lyrics.every((line) => {
      const number = lyricTranscriptStanzaNumber(line);
      return number !== undefined && completeUnderlaidNumbers.has(Number(number));
    });
  }, [completeUnderlaidNumbers, musicOnly, underlaySourceVisible, lyrics]);
  const printTranscriptLyrics = useMemo(() => {
    // An explicitly empty numbered selection has no shared chorus or echo,
    // including browser printing that does not use the disabled picker button.
    if ((reviewedUnderlay || printableVerseNumbers.length > 0) && selectedPrintVerses.length === 0) return [];
    return lyrics.filter((line) => {
      const number = lyricTranscriptStanzaNumber(line);
      return !number || (selectedPrintVerses.includes(Number(number)) && (musicOnly || !completeUnderlaidNumbers.has(Number(number)) || !underlaySourceVisible));
    });
  }, [completeUnderlaidNumbers, musicOnly, underlaySourceVisible, selectedPrintVerses, printableVerseNumbers, lyrics, reviewedUnderlay]);
  const currentSettings = useMemo<ViewerSettings>(() => ({
    transpose, learnerAccidentals, scale, stanzasPerGroup, tempo, instrument,
    ...(sopranoVoiceId ? { sopranoEmphasis } : {}),
    visibleVoiceIds: voiceIndexesToIds(visibleVoices, song.voices),
    selectedPrintVerses: savedPrintVerses,
    ...(lyricProjection ? { showOriginalLyrics } : {}),
    printVerseSelection: { version: 1, available: printableVerseNumbers },
  }), [transpose, learnerAccidentals, scale, stanzasPerGroup, tempo, instrument, visibleVoices, song.voices, savedPrintVerses, printableVerseNumbers, !!lyricProjection, showOriginalLyrics, sopranoVoiceId, sopranoEmphasis]);
  const settingsCallbackRef = useRef(onSettingsChange);
  settingsCallbackRef.current = onSettingsChange;
  useEffect(() => { if (!presentationOnly) settingsCallbackRef.current?.(currentSettings); }, [currentSettings, presentationOnly]);
  const printReadyRef = useRef(onPrintReady);
  printReadyRef.current = onPrintReady;
  const bookletError = !presentationOnly ? undefined : initialState.error
    ?? (visibleVoices.length > 0 && underlayModel.ambiguous && !repeatUnderlay && !musicOnly
      && !(lyricFiltered && selectedPrintVerses.length === 0)
      && availablePrintVerseNumbers.some(number => !selectedPrintVerses.includes(number))
      ? 'This score’s note-aligned verses cannot be separated reliably. Choose all verses, or choose music only and the selected transcript verses, then save it again.' : undefined)
    ?? (visibleVoices.length === 0 && !printTranscriptLyrics.some(line => formatLyricTranscriptLine(line).trim())
      ? 'This selection has no parts or printable words. Choose at least one part or a verse, then save it again.' : undefined);
  useEffect(() => { if (bookletError) printReadyRef.current?.(bookletError); }, [bookletError]);
  const reportPrintReady = useCallback((error?: string) => { printReadyRef.current?.(bookletError ?? error); }, [bookletError]);
  const rightsNotices = song.rightsNotices ?? [];
  const printNotes = useMemo(() => song.abc.split(/\r?\n/)
    .flatMap((line) => {
      const match = line.match(/^\s*N:\s*(.*?)\s*$/);
      return match?.[1] && !rightsNotices.includes(match[1]) ? [match[1]] : [];
    }), [song.abc, rightsNotices]);
  const [trackingDeferred, setTrackingDeferred] = useState(false);
  const [tracking, setTracking] = useState<PlaybackTrackingControllerValue>(emptyTracking);
  const followToggleRef = useRef<HTMLButtonElement>(null);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;
  const synthRef = useRef<abcjs.MidiBuffer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playRequestRef = useRef(0);

  useLayoutEffect(() => { if (!presentationOnly) clearViewerUpdateSnapshot(); }, [presentationOnly]);

  useEffect(() => { if (!presentationOnly) return () => setUpdateBusy('playback', false); }, [presentationOnly]);

  useLayoutEffect(() => {
    if (presentationOnly) return;
    const saveSettings = (event: Event) => {
      try {
        saveViewerForUpdate(song.id, { transpose, learnerAccidentals, scale, stanzasPerGroup, tempo, instrument, visibleVoices, selectedPrintVerses: savedPrintVerses,
          ...(sopranoVoiceId ? { sopranoEmphasis } : {}),
          voiceSelection: song.sourceSha256 ? { version: 1, sourceSha256: song.sourceSha256, available: song.voices.map(voice => voice.id) } : null,
          ...(lyricProjection ? { showOriginalLyrics } : {}),
          printVerseSelection: { version: 1, available: printableVerseNumbers } });
      } catch { event.preventDefault(); }
    };
    window.addEventListener(UPDATE_PREPARE_EVENT, saveSettings);
    return () => window.removeEventListener(UPDATE_PREPARE_EVENT, saveSettings);
  }, [presentationOnly, song.id, song.sourceSha256, song.voices, transpose, learnerAccidentals, scale, stanzasPerGroup, tempo, instrument, visibleVoices, savedPrintVerses, printableVerseNumbers, !!lyricProjection, showOriginalLyrics, sopranoVoiceId, sopranoEmphasis]);

  useEffect(() => {
    if (presentationOnly) return;
    try { window.localStorage.setItem(instrumentPreferenceKey, instrument); } catch { /* Storage is optional. */ }
  }, [instrument, presentationOnly]);

  const stop = useCallback(() => {
    trackingRef.current.clearActive();
    playRequestRef.current += 1;
    optionalInstrument.cancel();
    const hadActiveSynth = synthRef.current !== null;
    synthRef.current?.stop();
    synthRef.current = null;
    if (hadActiveSynth || playbackActiveRef.current) setPlayback('stopped');
  }, [optionalInstrument.cancel]);

  useEffect(() => () => {
    playRequestRef.current += 1;
    synthRef.current?.stop();
    void audioContextRef.current?.close();
  }, []);

  const beginPlayback = useCallback(async () => {
    // Freeze the next-start choice before the first await. Taps during loading
    // and playback only update the later Play request.
    const startSelection = trackingRef.current.snapshot();
    const written = trackingRef.current.written;
    if (!renderedTune || !abcjs.synth.supportsAudio()) {
      setAudioError('Audio synthesis is not supported by this browser.');
      setPlayback('error');
      return;
    }
    const requestId = playRequestRef.current + 1;
    playRequestRef.current = requestId;
    try {
      setAudioError('');
      setPlayback('loading');
      setTrackingDeferred(false);
      trackingRef.current.loading();
      const audioContext = audioContextRef.current ?? new window.AudioContext();
      audioContextRef.current = audioContext;
      await audioContext.resume();
      if (playRequestRef.current !== requestId) return;
      const optionalBank = await optionalInstrument.prepare();
      if (playRequestRef.current !== requestId) return;
      const { prepareAudioPlayback } = await import('./audioPlayback');
      if (playRequestRef.current !== requestId) return;
      const synth = new abcjs.synth.CreateSynth();
      synthRef.current = synth;
      const audio = prepareAudioPlayback(song.abc, song.voices.map((voice) => voice.id), visibleVoices, song.id, transpose, song.sourceSha256, sopranoEmphasis ? sopranoVoiceId : undefined);
      const config = instruments[instrument];
      const soundFontUrl = `${import.meta.env.BASE_URL}soundfonts/${config.bank}/`;
      if (optionalBank) installOptionalSamples(soundFontUrl, config.sample, optionalBank.samples, audioContext);
      else selectSoundFontCache(soundFontUrl);
      await synth.init({
        audioContext,
        // Playback uses canonical notation plus source-bound full-score
        // accompaniment, independently of selected or grouped display underlay.
        visualObj: audio.tune,
        // ABCJS's sequencer integer-parses qpm. The outer buffer-time override
        // preserves odd quarter-note controls (105 => 52.5 half-note beats).
        // Tracking reads this actual synth timing after prime; do not rescale it.
        ...(tempoPolicy ? { millisecondsPerMeasure: audio.tune.millisecondsPerMeasure(tempo * tempoPolicy.engineBeatsPerControlBeat) } : {}),
        options: {
          onEnded: () => {
            if (playRequestRef.current !== requestId) return;
            synthRef.current = null;
            trackingRef.current.clearActive();
            setPlayback('finished');
          },
          // Keep playback available after installation or loss of network.
          // ABCJS otherwise fetches these samples from a third-party host.
          soundFontUrl,
          // The Salamander concert-grand samples peak about 10 dB above the compact piano set.
          soundFontVolumeMultiplier: config.volume,
          program: config.program,
          midiTranspose: transpose,
          qpm: tempo,
          chordsOff: song.id.startsWith('hymn-'),
          voicesOff: audio.voicesOff,
          sequenceCallback: audio.sequenceCallback,
        },
      });
      if (playRequestRef.current !== requestId) return synth.stop();
      await synth.prime();
      if (playRequestRef.current !== requestId) return synth.stop();
      let schedule: TrackingSchedule | undefined;
      try {
        const adapter = await import('./playbackTracking');
        if (playRequestRef.current !== requestId) return synth.stop();
        schedule = adapter.prepareTrackedStart({ synth, capture: audio.trackingSequence(), written,
          source: song.abc, song: song.id, transpose, selection: startSelection, controller: trackingRef.current });
      } catch (error) {
        if (startSelection) throw error;
        trackingRef.current.setNotice('Note following is unavailable. Audio starts at the beginning.');
      }
      if (playRequestRef.current !== requestId) return synth.stop();
      synth.start();
      if (schedule && trackingRef.current !== emptyTracking) trackingRef.current.start(schedule, audioContext, synth, startSelection);
      else if (trackingRef.current === emptyTracking) setTrackingDeferred(true);
      setPlayback('playing');
    } catch (error) {
      if (playRequestRef.current !== requestId) return;
      synthRef.current?.stop();
      synthRef.current = null;
      trackingRef.current.clearActive();
      setAudioError(error instanceof Error ? error.message : 'Unable to synthesize this score.');
      setPlayback('error');
    }
  }, [instrument, optionalInstrument.prepare, renderedTune, song.abc, song.id, song.sourceSha256, song.voices, tempo, tempoPolicy, transpose, visibleVoices, sopranoVoiceId, sopranoEmphasis]);

  const play = () => {
    if (playback === 'playing' || playback === 'loading') return stop();
    void beginPlayback();
  };

  const toggleVoice = (index: number) => {
    stop();
    setVisibleVoices((current) => current.includes(index) ? current.filter((voice) => voice !== index) : [...current, index].sort((a, b) => a - b));
  };

  // Portals preserve this viewer's state and audio owner across drawer changes.
  const drawerStopFocused = useRef(false);
  const audioActive = playback === 'loading' || playback === 'playing';
  const focusDrawerClose = () => drawerSettings?.playbackTarget?.closest('[role="dialog"]')
    ?.querySelector<HTMLButtonElement>('[aria-label="Close menu"]')?.focus({ preventScroll: true });
  useLayoutEffect(() => {
    // Completion may remove the focused temporary control without a blur event.
    if (!audioActive && drawerStopFocused.current) { drawerStopFocused.current = false; focusDrawerClose(); }
  }, [audioActive, drawerSettings?.playbackTarget]);
  const inDrawer = (content: ReactNode, target?: HTMLElement | null) => !drawerSettings ? content : target ? createPortal(content, target) : null;

  const reportIdentity = issueIdentity(song, songbook);

  return (
    <div className={`score-viewer${presentationOnly ? ' score-presentation' : ''}`}>
      {initialState.error && !presentationOnly && <p className="notice error" role="alert">{initialState.error}</p>}
      {!presentationOnly && <SongActions key={`${songbook?.id ?? ''}:${song.id}`} target={actionsTarget} inline={!!drawerSettings} triggerRef={actionsToggleRef} collectionActions={collectionActions} printDisabled={!!initialState.error || (!renderedTune && visibleVoices.length > 0)} shareDisabled={!songbook} onOpenPanel={openActionPanel} />}
      {!presentationOnly && drawerSettings?.playbackTarget && (playback === 'loading' || playback === 'playing') && createPortal(<button type="button" className="drawer-stop" aria-label="Stop playback" onFocus={() => { drawerStopFocused.current = true; }} onBlur={() => { drawerStopFocused.current = false; }} onClick={() => { focusDrawerClose(); stop(); }}>Stop</button>, drawerSettings.playbackTarget)}
      {!presentationOnly && <section className={`viewer-controls viewer-controls--with-follow${playback === 'loading' || playback === 'playing' ? ' viewer-controls--active' : ''}`} aria-label="Score and playback controls">
        <div className="playback-control">
          <button
            className="play-button"
            type="button"
            aria-label={playback === 'loading' ? 'Stop loading' : playback === 'playing' ? 'Stop' : playButtonLabel(instrument)}
            aria-pressed={playback === 'loading' || playback === 'playing'}
            disabled={!renderedTune || visibleVoices.length === 0}
            onClick={play}
          >
            {playback === 'loading' || playback === 'playing' ? 'Stop' : 'Play'}
          </button>
          <p className="visually-hidden" role="status" aria-live="polite">{playbackStatus(playback, instrument, optionalInstrument)}</p>
          <span className="playback-caption" aria-hidden="true">{playback === 'loading' ? 'Loading audio…' : playback === 'playing' ? `Playing · ${tempo} ${tempoUnit}` : instruments[instrument].label}</span>
        </div>
        <div className={`control-group range-control score-size-control${currentScreenFit ? ' score-size-control--limited' : ''}`}>
          <label htmlFor="score-size">Score size <span aria-hidden="true">{requestedSize}{currentScreenFit ? ' requested' : ''}</span></label>
          {currentScreenFit && <small id={scoreSizeFitId} className="score-size-fit">Showing {effectiveSize} · maximum size for this width</small>}
          <input id="score-size" type="range" min={MIN_SCORE_SCALE} max={MAX_SCORE_SCALE} step={SCORE_SCALE_STEP} value={scale} aria-valuetext={currentScreenFit ? `${requestedSize} requested; showing ${effectiveSize}, maximum size for this width` : requestedSize} aria-describedby={currentScreenFit ? scoreSizeFitId : undefined} onChange={(event) => setScale(Number(event.target.value))} />
        </div>
        <div className="playback-follow-control">
          <button type="button" ref={followToggleRef} className="follow-toggle" aria-label="Follow playing notes with automatic scrolling" aria-pressed={tracking.follow} disabled={tracking === emptyTracking || !tracking.available} aria-describedby={tracking !== emptyTracking && !tracking.available ? 'follow-unavailable' : undefined} title="Automatic scrolling is remembered between songs. Manual scrolling pauses following without stopping audio." onClick={() => tracking.setAutoScroll(!tracking.follow)}>
            <span aria-hidden="true">{tracking.follow ? '✓ ' : ''}Follow</span>
          </button>
          {tracking !== emptyTracking && !tracking.available && <span id="follow-unavailable" className="playback-follow-unavailable" role="status">Following unavailable for this score</span>}
          {tracking.available && tracking.follow && tracking.suspended && (playback === 'loading' || playback === 'playing') && <div className="playback-follow-paused">
            <span role="status">Follow paused</span>
            <button type="button" className="text-button" aria-label="Resume following" onClick={() => {
              // Keep keyboard focus on a stable control when Resume disappears.
              // Focus can suspend following, so restore it after moving focus.
              followToggleRef.current?.focus({ preventScroll: true });
              tracking.setAutoScroll(true);
            }}>Resume</button>
          </div>}
        </div>
        <button ref={settingsToggleRef} className="disclosure-button settings-toggle" type="button" aria-label="Score settings" title="Score settings" aria-expanded={drawerSettings?.open ?? settingsOpen} aria-controls={settingsId} onClick={event => drawerSettings ? drawerSettings.onOpen(event.currentTarget) : setSettingsOpen(open => !open)}>
          <svg className="disclosure-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="M10 3h4l.6 2.4 1.5.9 2.4-.7 2 3.4-1.8 1.7v2.6l1.8 1.7-2 3.4-2.4-.7-1.5.9L14 21h-4l-.6-2.4-1.5-.9-2.4.7-2-3.4 1.8-1.7v-2.6L3.5 9l2-3.4 2.4.7 1.5-.9Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </section>}
      {!presentationOnly && actionPanel && inDrawer(<section ref={actionPanelRef} className="song-action-panel" aria-labelledby={actionPanelId} onKeyDown={event => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeActionPanel(); }
      }}>
        <div className="song-action-panel-header">
          <h2 ref={actionHeadingRef} tabIndex={-1} id={actionPanelId}>{actionPanel === 'print' ? 'Print song' : actionPanel === 'share' ? 'Share this setting' : 'Download current ABC'}</h2>
          <button type="button" className="text-button" aria-label={`Close ${actionPanel === 'print' ? 'print options' : actionPanel === 'share' ? 'share options' : 'ABC export'}`} onClick={closeActionPanel}>Close</button>
        </div>
        {actionPanel === 'print' && <>
          <p>Print the current key and displayed parts, or save a PDF from your browser’s print dialog.</p>
          {availablePrintVerseNumbers.length > 0 ? <section className="print-verse-picker" aria-label="Choose verses to print">
            <p>Choose verses to print</p>
            <p className="print-verse-help">Refrains and other unnumbered text are included with the selected verses.</p>
            <div className="print-verse-options">
              {availablePrintVerseNumbers.map((number) => <label key={number}>
                <input type="checkbox" checked={selectedPrintVerses.includes(number)} onChange={() => setSelectedPrintVerses((current) => current.includes(number) ? current.filter((verse) => verse !== number) : [...current, number].sort((left, right) => left - right))} />
                Verse {number}
              </label>)}
            </div>
            <div className="print-verse-actions">
              <button type="button" className="text-button" onClick={() => setSelectedPrintVerses(availablePrintVerseNumbers)}>Select all</button>
              <button type="button" className="text-button" onClick={() => setSelectedPrintVerses([])}>Clear</button>
              <button type="button" className="print-button" disabled={selectedPrintVerses.length === 0} onClick={() => window.print()}>Print selected verses</button>
            </div>
            {underlayModel.ambiguous && !musicOnly && <p className="notice">This setting’s note-aligned lyrics cannot yet be separated reliably; all currently enabled score lyrics will print, with only the selected transcript verses below.</p>}
          </section> : <button className="print-button" type="button" onClick={() => window.print()}>Print song</button>}
        </>}
        {actionPanel === 'share' && songbook && <div className="share-settings"><DeferredFeature load={loadShareSettings} featureProps={{ location: { bookId: songbook.id, number: song.number, songId: song.id }, settings: currentSettings }} label="Share link" /></div>}
        {actionPanel === 'export' && <div className="share-settings abc-export"><DeferredFeature load={loadAbcDownload} featureProps={{ song, songbook, prepared: preparedScreenAbc, settings: { transpose, learnerAccidentals, stanzasPerGroup: displayedStanzasPerGroup, visibleVoiceIndexes: visibleVoices, tempo, instrument, chordsOff: song.id.startsWith('hymn-'), ...(lyricProjection ? { showOriginalLyrics } : {}) } }} label="ABC export" /></div>}
      </section>, actionsTarget)}
      {!presentationOnly && inDrawer(<section ref={settingsPanelRef} className="score-settings" id={settingsId} hidden={!drawerSettings && !settingsOpen} aria-label="Score settings" onKeyDown={(event) => {
        if (event.key === 'Escape' && !drawerSettings) {
          event.preventDefault();
          event.stopPropagation();
          setSettingsOpen(false);
          settingsToggleRef.current?.focus();
        }
      }}>
        <div className="score-settings-grid">
          <div className="control-group displayed-key" aria-live="polite">
            <span>Displayed key</span>
            <output>{psalter143DisplayKey(song.id, song.abc, transpose) ?? psalter226DisplayKey(song.id, song.abc, transpose) ?? displayKey(song.abc, transpose) ?? 'Unknown'}</output>
          </div>
          <div className="control-group">
            <label htmlFor="transpose">Transpose</label>
            <div className="stepper">
              <button type="button" aria-label="Transpose down one semitone" disabled={transpose === MIN_TRANSPOSE} onClick={() => { stop(); setTranspose((value) => Math.max(MIN_TRANSPOSE, value - 1)); }}>−</button>
              <output id="transpose">{transpose > 0 ? `+${transpose}` : transpose} semitones</output>
              <button type="button" aria-label="Transpose up one semitone" disabled={transpose === MAX_TRANSPOSE} onClick={() => { stop(); setTranspose((value) => Math.min(MAX_TRANSPOSE, value + 1)); }}>+</button>
            </div>
          </div>
          <div className="learner-accidentals-control">
            <label>
              <input
                type="checkbox"
                checked={learnerAccidentals}
                onChange={(event) => { stop(); setLearnerAccidentals(event.target.checked); }}
              />
              Repeat sharps and flats beside notes
            </label>
          </div>
          {(underlayModel.rows.length > 0 || lyrics.length > 0) && <div className="control-group instrument-control">
            <label htmlFor="verses-per-score">{unsplitHymnLyrics ? 'Lyric display' : 'Verses per repeated tune'}</label>
            <select id="verses-per-score" aria-describedby={unsplitHymnLyrics ? `${settingsId}-lyric-help` : undefined} value={displayedStanzasPerGroup} onChange={(event) => setStanzasPerGroup(Number(event.target.value))}>
              <option value={0}>{unsplitHymnLyrics ? 'Music only' : '0 — music only'}</option>
              {Array.from({ length: Math.max(1, underlaidStanzaCount) }, (_, index) => <option key={index + 1} value={index + 1}>{unsplitHymnLyrics ? lyricFiltered ? 'All enabled lyric rows' : publishedVariant ? 'All current lyric rows' : 'All source lyric rows' : index + 1}</option>)}
            </select>
            {unsplitHymnLyrics && <p id={`${settingsId}-lyric-help`} className="print-verse-help">This source’s note-aligned lyrics cannot yet be separated reliably. Music only hides these rows; the lyrics transcript remains available.</p>}
            {sourceReviewedUnderlay?.textOnlyStanzaNumbers && !reviewedUnderlay && !lyricFiltered && <p className="print-verse-help">Verse grouping requires All parts. With fewer parts selected, the current lyrics stay together and the full text remains in the transcript.</p>}
          </div>}
          <div className="control-group range-control">
            <label htmlFor="tempo">Tempo: {tempo} {tempoUnit}</label>
            <input id="tempo" type="range" min="40" max="180" step="5" value={tempo} aria-valuetext={`${tempo} ${tempoPolicy?.accessibleUnit ?? 'beats per minute'}`} onChange={(event) => { stop(); setTempo(Number(event.target.value)); }} />
          </div>
          {sopranoVoiceId && <div className="soprano-emphasis-control">
            <label><input type="checkbox" checked={sopranoEmphasis} aria-describedby={sopranoEmphasisHelpId} onChange={event => { stop(); setSopranoEmphasis(event.target.checked); }} />Emphasize soprano</label>
            <small id={sopranoEmphasisHelpId}>Softens the other parts while soprano is selected. Applies when you press Play.</small>
          </div>}
          <div className="control-group instrument-control">
            <label htmlFor="instrument">Instrument</label>
            <select id="instrument" value={instrument} onChange={(event) => { stop(); setInstrument(event.target.value as Instrument); setPlayback('idle'); }}>
              {Object.entries(instruments).map(([value, config]) => <option key={value} value={value}>{config.label}{config.optional ? ' · download on demand' : ''}</option>)}
            </select>
            {isOptionalInstrument(instrument) && <div className="instrument-download">
              <p>{optionalInstrument.message}</p>
              {optionalInstrument.busy && <button type="button" className="text-button" onClick={stop}>Cancel download</button>}
              {optionalInstrument.retry && <button type="button" className="text-button" onClick={optionalInstrument.retryDownload}>Retry download</button>}
            </div>}
          </div>
        </div>
        {song.voices.length > 0 && (
          <fieldset className="voice-controls">
            <legend>Visible and audible parts</legend>
            {song.voiceStructure === 'chordal-staves' || song.voiceStructure === 'mixed-parts'
              ? <p className="voice-structure-note">This edition keeps the source’s chordal staves and any supplemental voices. Part buttons select those written layers.</p>
              : song.voiceStructure === 'melody'
                ? <p className="voice-structure-note">This edition contains the melody and its source chord symbols. Playback follows the written melody.</p> : null}
            <button type="button" className="text-button" onClick={() => { stop(); setVisibleVoices(allVoiceIndexes); }}>All parts</button>
            <div>
              {song.voices.map((voice, index) => {
                const label = voiceName(voice.id, voice.name, index);
                return (
                  <span className="voice-control-item" key={`${voice.id}-${index}`}>
                    <label>
                      <input type="checkbox" checked={visibleVoices.includes(index)} onChange={() => toggleVoice(index)} />
                      {label}
                    </label>
                    <button type="button" className="voice-only-button" aria-label={`Show only ${label}`} onClick={() => { stop(); setVisibleVoices([index]); }}>Only</button>
                  </span>
                );
              })}
            </div>
          </fieldset>
        )}
        <div className="score-help">
          <h3>Playing from a note</h3>
          <p>Tap a note to choose where the next Play starts. Selecting notes or opening this menu does not interrupt the audio already playing.</p>
          <details className="playback-keyboard-help"><summary>Keyboard note selection</summary><p>{NOTATION_KEYBOARD_HELP} Changes apply the next time you press Play.</p></details>
          <p>Follow scrolls with the playing notes. Manual scrolling pauses following; use Resume to continue. Pinch the music or use Score size to zoom.</p>
        </div>
      </section>, drawerSettings?.target)}

      {!presentationOnly && <div className="playback-tracking-tools"><DeferredFeature load={loadPlaybackTracking} featureProps={{ song: song.id, abc: song.abc, voices: song.voices, deferred: trackingDeferred, busy: playback === 'loading' || playback === 'playing', onChange: setTracking }} label="note following" /></div>}
      {!presentationOnly && audioError && <p className="notice error audio-error" role="alert">{audioError}</p>}
      {!presentationOnly && song.id === 'hymn-hc-turn-your-eyes' && song.sourceSha256 === TURN_YOUR_EYES_AUDIO_SOURCE && <p className="notice playback-edition-note">Playback follows fixed dynamic markings for this edition; the printed crescendos and diminuendos remain on the score.</p>}
      {lyricProjection && <aside className="notice hymn-lyric-defaults" aria-label="Lyric selection">
        <p>{showOriginalLyrics ? lyricProjection.sourceSupported ? 'Full original lyrics are shown.'
          : 'Full original lyrics are shown. This source revision has not been matched to the default verse selection.' : lyricProjection.status === 'unsupported-source'
          ? 'This source revision has not been matched to the default verse selection. Lyrics are hidden; the music remains available.'
          : allLyricsHidden ? 'All three verses and the refrain are hidden by default. Music only is shown.'
            : `Verses ${lyricProjection.hiddenStanzaNumbers.join(', ')} are hidden by default. Original verse numbers are retained.`}</p>
        {!presentationOnly && <label className="screen-only"><input type="checkbox" checked={showOriginalLyrics} onChange={event => {
          const enabled = event.target.checked; setShowOriginalLyrics(enabled);
          setLyricsPreferenceNotice(!lyricProjection.sourceSupported
            ? 'This source revision is unverified. Your choice will not change the default for this hymn.'
            : saveOriginalLyricsPreference(song.id, lyricProjection.policy.sourceSha256, enabled)
              ? '' : 'This choice applies for this visit. Your browser could not save the preference.');
        }} /> Show full original lyrics</label>}
        {!presentationOnly && lyricsPreferenceNotice && <p role="status">{lyricsPreferenceNotice}</p>}
      </aside>}
      {bookletError && <p className="notice error" role="alert">{bookletError}</p>}
      {!bookletError && <div ref={scorePinchRef}><ScoreRenderer
        abc={song.abc}
        songId={song.id}
        sourceTimingContext={song.sourceTimingContext}
        accessibleLabel={`Music notation for ${song.title || `Psalter ${song.number}`}`}
        scale={scale}
        transpose={transpose}
        learnerAccidentals={learnerAccidentals}
        stanzasPerGroup={displayedStanzasPerGroup}
        printStanzaNumbers={lyricProjection && selectedPrintVerses.length === 0 ? [] : underlayModel.ambiguous && !repeatUnderlay ? undefined : selectedPrintVerses}
        showOriginalLyrics={lyricProjection ? showOriginalLyrics : undefined}
        repeatUnderlay={repeatUnderlay}
        visibleVoiceIndexes={visibleVoices}
        onRendered={setRenderedTune}
        onScreenFit={presentationOnly ? undefined : setScreenFit}
        onScreenAbc={exportOpened ? setPreparedScreenAbc : undefined}
        registerVisible={presentationOnly ? undefined : tracking.registerVisible}
        onPrintReady={onPrintReady ? reportPrintReady : undefined}
      /></div>}
      {!presentationOnly && navigation?.('bottom')}
      {!presentationOnly && transcriptLyrics.length > 0 && <section className={`lyrics-transcript${allLyricsUnderlaid ? ' print-duplicate-lyrics' : ''}`} aria-label={`Lyrics transcript for ${song.title || `Psalter ${song.number}`}`}>
        <h2>Lyrics transcript</h2>
        {allLyricsUnderlaid
          ? <details className="lyrics-transcript-disclosure">
            <summary>Show full lyrics</summary>
            {transcriptLyrics.map((line, index) => <p key={`${index}-${line.kind}-${line.text}`}>{formatLyricTranscriptLine(line)}</p>)}
          </details>
          : transcriptLyrics.map((line, index) => <p key={`${index}-${line.kind}-${line.text}`}>{formatLyricTranscriptLine(line)}</p>)}
      </section>}
      {!bookletError && printTranscriptLyrics.length > 0 && <section className="lyrics-transcript print-lyrics-transcript print-only" aria-label="Selected verses for printing">
        <h2>Lyrics transcript</h2>
        {printTranscriptLyrics.map((line, index) => <p key={`${index}-${line.kind}-${line.text}`}>{formatLyricTranscriptLine(line)}</p>)}
      </section>}
      {editorialUnderlay && <p className="editorial-underlay-note">{editorialUnderlay.info.note}</p>}
      {publishedVariant && <p className="published-stanza-note">{publishedVariant.info.note} {publishedVariant.info.sharedRefrainNote}</p>}
      {rightsNotices.length > 0 && <aside className="source-rights-note" aria-label="Source and rights notices">
        {rightsNotices.map((notice) => <p key={notice}>{notice === 'Retained anthology text: CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/)'
          ? <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">Retained anthology text: CC0 1.0</a>
          : notice}</p>)}
        {song.provenance?.licenseUrls.map((url) => <p key={url}><a href={url} target="_blank" rel="noreferrer">License: {url}</a></p>)}
      </aside>}
      {!presentationOnly && song.provenance && <details className="source-edition-details">
        <summary>Source edition and attribution</summary>
        {publishedVariant && <section aria-label="Published verse variant">
          <p>{publishedVariant.info.credits}</p>
          <p>{publishedVariant.info.rights}</p>
          {publishedVariant.info.sourceUrls.map((url, index) => <p key={url}><a href={url} target="_blank" rel="noreferrer">Verse 4 source {index + 1}</a></p>)}
          <p>The following credits describe the retained Open Hymnal source setting; verse 4 uses the published variant credited above.</p>
        </section>}
        {typeof song.provenance.catalogRecord.title === 'string' && song.provenance.catalogRecord.title !== song.title && <p>Original catalog title: {song.provenance.catalogRecord.title}. This catalog wording may describe a different recording or arrangement.</p>}
        {song.provenance.credits.map((credit, index) => <p key={`credit-${index}`}>{credit}</p>)}
        {song.provenance.sourceUrls.map((url, index) => <p key={url}><a href={url} target="_blank" rel="noreferrer">Source {index + 1}</a></p>)}
        <p>{song.provenance.territory}</p>
        {[...song.provenance.editionNotes, ...song.provenance.changes].map((note, index) => <p key={`edition-${index}`}>{note}</p>)}
      </details>}
      {printNotes.length > 0 && <p className="source-rights-note print-only">Notes: {printNotes.join(' · ')}</p>}
      {!presentationOnly && songbook && reportIdentity && <IssueReporter key={`issue-report:${songbook.id}:${song.id}`} lyricDisplayNote={[lyricDisplayNote, sopranoVoiceId && sopranoEmphasis ? 'Soprano emphasis: on.' : undefined].filter(Boolean).join('\n') || undefined} context={{
        ...reportIdentity,
        parts: visibleVoices.map((index) => song.voices[index].id), versesPerTune: displayedStanzasPerGroup,
        printVerses: selectedPrintVerses, key: psalter143DisplayKey(song.id, song.abc, transpose) ?? psalter226DisplayKey(song.id, song.abc, transpose) ?? displayKey(song.abc, transpose) ?? 'Unknown',
        transpose, learnerAccidentals, scale, tempo, instrument,
        appVersion: __APP_VERSION__, build: __APP_BUILD__, corpusVersion: songbook.manifest.corpusVersion,
        sourceSha256: song.sourceSha256 ?? '',
      }} />}
      {!presentationOnly && songbook && !reportIdentity && <aside className="issue-reporter" aria-label="Hymn issue reporting">
        <div className="issue-reporter-intro">
          <h2>Hymn issue reporting</h2>
          <p>Issue reporting is unavailable for this score because its book and edition could not be verified.</p>
        </div>
      </aside>}
    </div>
  );
}
