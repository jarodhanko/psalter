import type { SongVoice } from '../../domain/songbook';
import { isInstrument } from '../viewer/instrumentIds';
import type { Instrument } from '../viewer/instrumentIds';
import { MIN_SCORE_SCALE, MAX_SCORE_SCALE } from '../viewer/scoreScale';

/** Portable viewer choices. Voice IDs remain stable if a package reorders parts. */
export interface ViewerSettings {
  transpose?: number;
  tempo?: number;
  visibleVoiceIds?: readonly string[];
  selectedPrintVerses?: readonly number[];
  stanzasPerGroup?: number;
  scale?: number;
  learnerAccidentals?: boolean;
  /** Per-song opt-in; never carried automatically to another song. */
  showOriginalLyrics?: boolean;
  instrument?: Instrument;
  /** Optional listening mix for this song; default is the unchanged source mix. */
  sopranoEmphasis?: boolean;
  /** null deliberately forbids inferring that an old verse choice meant "all". */
  printVerseSelection?: { readonly version: 1; readonly available: readonly number[] } | null;
}

export interface ViewerSettingsContext {
  voiceIds?: readonly string[];
  /** Use the viewer's reviewed, reconstructed stanza numbers, not raw lyric rows. */
  printableVerseNumbers?: readonly number[];
}

const settingNames = new Set([
  'transpose', 'tempo', 'visibleVoiceIds', 'selectedPrintVerses', 'stanzasPerGroup',
  'scale', 'learnerAccidentals', 'instrument', 'printVerseSelection', 'showOriginalLyrics', 'sopranoEmphasis',
]);
const isRecord = (value: unknown): value is Record<string, unknown> => value !== null
  && typeof value === 'object' && !Array.isArray(value)
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const inRange = (value: unknown, min: number, max: number): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
const verseNumbers = (value: unknown): value is number[] => Array.isArray(value) && value.length <= 256
  && value.every(number => Number.isInteger(number) && number > 0 && number <= 1000)
  && new Set(value).size === value.length;
const voiceIds = (value: unknown): value is string[] => Array.isArray(value) && value.length <= 128
  && value.every(id => typeof id === 'string' && id.length > 0 && id.length <= 128 && !/[\s\u0000-\u001f\u007f,]/.test(id))
  && new Set(value).size === value.length;

/** Reject an invalid snapshot as a whole; never turn an invalid verse subset into "all". */
export function normalizeViewerSettings(input: unknown, context: ViewerSettingsContext = {}): ViewerSettings | undefined {
  if (!isRecord(input) || Object.keys(input).some(key => !settingNames.has(key))) return undefined;
  const settings: ViewerSettings = {};
  if (input.transpose !== undefined) {
    if (!inRange(input.transpose, -10, 12) || !Number.isInteger(input.transpose)) return undefined;
    settings.transpose = input.transpose;
  }
  if (input.tempo !== undefined) {
    if (!inRange(input.tempo, 40, 180)) return undefined;
    settings.tempo = input.tempo;
  }
  if (input.scale !== undefined) {
    if (!inRange(input.scale, MIN_SCORE_SCALE, MAX_SCORE_SCALE)) return undefined;
    settings.scale = input.scale;
  }
  if (input.stanzasPerGroup !== undefined) {
    if (!inRange(input.stanzasPerGroup, 0, 100) || !Number.isInteger(input.stanzasPerGroup)) return undefined;
    settings.stanzasPerGroup = input.stanzasPerGroup;
  }
  for (const key of ['learnerAccidentals', 'showOriginalLyrics', 'sopranoEmphasis'] as const) {
    if (input[key] === undefined) continue;
    if (typeof input[key] !== 'boolean') return undefined;
    settings[key] = input[key];
  }
  if (input.instrument !== undefined) {
    if (!isInstrument(input.instrument)) return undefined;
    settings.instrument = input.instrument;
  }
  if (input.visibleVoiceIds !== undefined) {
    if (!voiceIds(input.visibleVoiceIds) || (context.voiceIds && input.visibleVoiceIds.some(id => !context.voiceIds!.includes(id)))) return undefined;
    settings.visibleVoiceIds = [...input.visibleVoiceIds];
  }
  if (input.selectedPrintVerses !== undefined) {
    if (!verseNumbers(input.selectedPrintVerses)
      || (context.printableVerseNumbers && input.selectedPrintVerses.some(number => !context.printableVerseNumbers!.includes(number)))) return undefined;
    settings.selectedPrintVerses = [...input.selectedPrintVerses].sort((left, right) => left - right);
  }
  if (input.printVerseSelection !== undefined) {
    const selection = input.printVerseSelection;
    if (selection === null) settings.printVerseSelection = null;
    else {
      if (!isRecord(selection) || Object.keys(selection).some(key => key !== 'version' && key !== 'available')
        || selection.version !== 1 || !verseNumbers(selection.available)
        || settings.selectedPrintVerses?.some(number => !(selection.available as number[]).includes(number))) return undefined;
      settings.printVerseSelection = { version: 1, available: [...selection.available].sort((left, right) => left - right) };
    }
  }
  return settings;
}

/** Map only at the renderer boundary. An explicit empty part selection stays empty. */
export function voiceIdsToIndexes(selected: readonly string[], available: readonly { id: string }[]): number[] {
  return available.flatMap((voice, index) => selected.includes(voice.id) ? [index] : []);
}

export function voiceIndexesToIds(selected: readonly number[], available: readonly { id: string }[]): string[] {
  return available.flatMap((voice, index) => selected.includes(index) ? [voice.id] : []);
}

const voiceRole = (voice: SongVoice): string | undefined => {
  if (voice.kind && voice.kind !== 'independent') return undefined;
  const name = voice.name?.trim().toLowerCase();
  if (name) return ['soprano', 'alto', 'tenor', 'bass'].includes(name) ? name : undefined;
  return ({ s: 'soprano', t1: 'soprano', a: 'alto', t2: 'alto',
    t: 'tenor', b1: 'tenor', b: 'bass', b2: 'bass' } as Record<string, string>)[voice.id.toLowerCase()];
};

/** Carry display/playback preferences, never song-specific transpose, verse or note choices. */
export function settingsForSongNavigation(
  settings: ViewerSettings, previousVoices: readonly SongVoice[], nextVoices: readonly SongVoice[],
): ViewerSettings {
  const { tempo, stanzasPerGroup, scale, learnerAccidentals, instrument, visibleVoiceIds } = settings;
  // Each arrangement starts in its own key; explicit saved/shared settings bypass this mapper.
  const next: ViewerSettings = { transpose: 0, tempo, stanzasPerGroup, scale, learnerAccidentals, instrument };
  if (visibleVoiceIds !== undefined) {
    const allParts = previousVoices.length > 0 && previousVoices.every(voice => visibleVoiceIds.includes(voice.id));
    const selected = previousVoices.filter(voice => visibleVoiceIds.includes(voice.id));
    const roles = new Set(selected.map(voiceRole).filter(role => role !== undefined));
    const retained = nextVoices.filter(voice => selected.some(previous => previous.id === voice.id && previous.kind === voice.kind)
      || (voiceRole(voice) !== undefined && roles.has(voiceRole(voice)!))).map(voice => voice.id);
    // Preserve an explicitly empty selection, but do not make an unavailable
    // solo part silence a differently arranged score. All means this score's all.
    next.visibleVoiceIds = allParts || (visibleVoiceIds.length > 0 && retained.length === 0)
      ? nextVoices.map(voice => voice.id) : retained;
  }
  return next;
}
