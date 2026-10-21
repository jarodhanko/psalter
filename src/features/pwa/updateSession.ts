import { isInstrument } from '../viewer/instrumentIds';
import type { Instrument } from '../viewer/instrumentIds';
import { MIN_SCORE_SCALE, MAX_SCORE_SCALE } from '../viewer/scoreScale';

/** null records invalid metadata and forbids a legacy selection inference. */
export type PrintVerseSelection = { readonly version: 1; readonly available: readonly number[] } | null;

/** An invalid witness is null, which forbids inference from a legacy snapshot. */
export type VoiceSelection = {
  readonly version: 1;
  readonly sourceSha256: string;
  readonly available: readonly string[];
} | null;

const isVerseNumberList = (value: unknown): value is number[] => Array.isArray(value)
  && value.every(number => Number.isInteger(number) && number > 0)
  && new Set(value).size === value.length;

export const UPDATE_PREPARE_EVENT = 'psalter:prepare-update';
const snapshotKey = 'psalter.update-session';

export interface ViewerUpdateSettings {
  transpose: number;
  learnerAccidentals: boolean;
  scale: number;
  stanzasPerGroup: number;
  tempo: number;
  instrument: Instrument;
  visibleVoices: readonly number[];
  voiceSelection?: VoiceSelection;
  selectedPrintVerses: number[];
  printVerseSelection?: PrintVerseSelection;
  showOriginalLyrics?: boolean;
  sopranoEmphasis?: boolean;
}

export function saveViewerForUpdate(songId: string, settings: ViewerUpdateSettings) {
  // A short-lived, tab-local snapshot is written only for an approved reload.
  // Throw on storage failure so the caller can keep the current page intact.
  sessionStorage.setItem(snapshotKey, JSON.stringify({ songId, settings, href: location.href, savedAt: Date.now() }));
}

export function readViewerAfterUpdate(songId: string): Partial<ViewerUpdateSettings> {
  try {
    const snapshot = JSON.parse(sessionStorage.getItem(snapshotKey) ?? 'null');
    if (snapshot?.songId !== songId || snapshot.href !== location.href ||
        !Number.isFinite(snapshot.savedAt) || Date.now() - snapshot.savedAt > 30 * 60 * 1000) return {};
    const s = snapshot.settings;
    if (!s || typeof s !== 'object') return { selectedPrintVerses: [], printVerseSelection: null };
    const numberInRange = (value: unknown, min: number, max: number) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
    const numberList = (value: unknown): value is number[] => Array.isArray(value) && value.every((n) => Number.isInteger(n) && n >= 0);
    const validSelection = isVerseNumberList(s.selectedPrintVerses);
    return {
      transpose: numberInRange(s.transpose, -10, 12) && Number.isInteger(s.transpose) ? s.transpose : undefined,
      learnerAccidentals: typeof s.learnerAccidentals === 'boolean' ? s.learnerAccidentals : undefined,
      showOriginalLyrics: typeof s.showOriginalLyrics === 'boolean' ? s.showOriginalLyrics : undefined,
      sopranoEmphasis: typeof s.sopranoEmphasis === 'boolean' ? s.sopranoEmphasis : undefined,
      scale: numberInRange(s.scale, MIN_SCORE_SCALE, MAX_SCORE_SCALE) ? s.scale : undefined,
      stanzasPerGroup: numberInRange(s.stanzasPerGroup, 0, 100) && Number.isInteger(s.stanzasPerGroup) ? s.stanzasPerGroup : undefined,
      tempo: numberInRange(s.tempo, 40, 180) ? s.tempo : undefined,
      instrument: isInstrument(s.instrument) ? s.instrument : undefined,
      visibleVoices: numberList(s.visibleVoices) ? s.visibleVoices : undefined,
      voiceSelection: !Object.hasOwn(s, 'voiceSelection') ? undefined
        : s.voiceSelection?.version === 1 && typeof s.voiceSelection.sourceSha256 === 'string'
          && /^[a-f0-9]{64}$/.test(s.voiceSelection.sourceSha256)
          && Array.isArray(s.voiceSelection.available) && s.voiceSelection.available.length <= 128
          && s.voiceSelection.available.every((id: unknown) => typeof id === 'string' && id.length > 0 && id.length <= 128 && !/[\s\u0000-\u001f\u007f,]/.test(id))
          && new Set(s.voiceSelection.available).size === s.voiceSelection.available.length
          ? { version: 1, sourceSha256: s.voiceSelection.sourceSha256, available: s.voiceSelection.available } : null,
      selectedPrintVerses: validSelection ? s.selectedPrintVerses : [],
      printVerseSelection: !validSelection ? null : !Object.hasOwn(s, 'printVerseSelection') ? undefined
        : s.printVerseSelection?.version === 1 && isVerseNumberList(s.printVerseSelection.available)
          ? { version: 1, available: s.printVerseSelection.available } : null,
    };
  } catch { return {}; }
}

export function clearViewerUpdateSnapshot() {
  try { sessionStorage.removeItem(snapshotKey); } catch { /* The app also works without storage. */ }
}

const busyReasons = new Set<'playback' | 'printing' | 'issue-report'>();
const listeners = new Set<() => void>();
export const getUpdateBusyReason = () => busyReasons.has('printing') ? 'Finish printing before updating.'
  : busyReasons.has('playback') ? 'Stop playback before updating.'
    : busyReasons.has('issue-report') ? 'Submit or discard your issue report before updating.' : '';
export function setUpdateBusy(reason: 'playback' | 'printing' | 'issue-report', busy: boolean) {
  if (busy) busyReasons.add(reason);
  else busyReasons.delete(reason);
  listeners.forEach((listener) => listener());
}
export function subscribeUpdateBusy(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function prepareUpdateReload() {
  // Navigation may have removed the viewer since approval. Never leave an old
  // score snapshot behind when there is no current viewer to replace it.
  sessionStorage.removeItem(snapshotKey);
  // Event listeners can cancel when settings cannot be safely preserved.
  const event = new Event(UPDATE_PREPARE_EVENT, { cancelable: true });
  const prepared = window.dispatchEvent(event);
  const snapshot = JSON.parse(sessionStorage.getItem(snapshotKey) ?? 'null');
  if (!prepared || snapshot?.href !== location.href || !snapshot?.settings) {
    clearViewerUpdateSnapshot();
    throw new Error('Unable to preserve the current settings.');
  }
}

export function reloadUpdatedApp() { window.location.reload(); }
