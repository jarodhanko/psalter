import { resolveSongbookSong, type SongbookPackage, type ResolvedSongbookSong } from '../../domain/songbookPackage';
import { normalizeViewerSettings } from './viewerSettings';
import type { ViewerSettings, ViewerSettingsContext } from './viewerSettings';

export interface SongLocation { bookId: string; number: number; songId: string; }
export const MAX_SHARE_QUERY_LENGTH = 8192;
const viewerParameters = ['view', 'transpose', 'tempo', 'parts', 'verses', 'stanzas', 'scale', 'accidentals', 'instrument', 'originalLyrics', 'sopranoEmphasis'] as const;
const reservedParameters = new Set<string>(['book', 'number', 'tune', ...viewerParameters]);
const invalid = (reason: string) => ({ status: 'invalid' as const, reason });

function readParameters(search: string): URLSearchParams | undefined {
  if (search.length > MAX_SHARE_QUERY_LENGTH || /%(?![\da-f]{2})/i.test(search)) return undefined;
  const params = new URLSearchParams(search);
  for (const key of reservedParameters) {
    const values = params.getAll(key);
    if (values.length > 1 || values.some(value => /[\u0000-\u001f\u007f\ufffd]/.test(value))) return undefined;
  }
  return params;
}
const identifier = (value: string | null): value is string => value !== null && value.length > 0
  && value.length <= 128 && !/[\s\u0000-\u001f\u007f]/.test(value);
const numericValue = (value: string): number | undefined => /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)
  && Number.isFinite(Number(value)) ? Number(value) : undefined;

export type SharedViewerSettingsResult = { status: 'none' }
  | { status: 'valid'; settings: ViewerSettings }
  | { status: 'invalid'; reason: string };

/** Pure parser: call again on popstate, including history entries for the same tune. */
export function readSharedViewerSettings(search: string, context: ViewerSettingsContext = {}): SharedViewerSettingsResult {
  const params = readParameters(search);
  if (!params) return invalid('This link has duplicate, malformed, or oversized parameters.');
  if (!viewerParameters.some(key => params.has(key))) return { status: 'none' };
  if (params.get('view') !== '1') return invalid('This link uses an unsupported viewer settings version.');
  // Settings belong to one explicit setting, never a fallback song selected by the app.
  if (!identifier(params.get('book')) || !identifier(params.get('tune')) || !/^[1-9]\d*$/.test(params.get('number') ?? '')
    || !Number.isSafeInteger(Number(params.get('number')))) {
    return invalid('This settings link is missing its song identity.');
  }
  const input: Record<string, unknown> = {};
  const numericParameters = { transpose: 'transpose', tempo: 'tempo', stanzas: 'stanzasPerGroup', scale: 'scale' } as const;
  for (const [parameter, setting] of Object.entries(numericParameters)) {
    if (!params.has(parameter)) continue;
    const value = numericValue(params.get(parameter)!);
    if (value === undefined) return invalid('This link contains a malformed numeric setting.');
    input[setting] = value;
  }
  if (params.has('parts')) input.visibleVoiceIds = params.get('parts') === '' ? [] : params.get('parts')!.split(',');
  if (params.has('verses')) {
    const values = params.get('verses') === '' ? [] : params.get('verses')!.split(',');
    if (values.some(value => !/^[1-9]\d*$/.test(value))) return invalid('This link contains a malformed verse selection.');
    input.selectedPrintVerses = values.map(Number);
    // A shared subset is an explicit choice, even after the source gains new verses.
    input.printVerseSelection = null;
  }
  for (const [parameter, setting, label] of [
    ['accidentals', 'learnerAccidentals', 'accidental'],
    ['originalLyrics', 'showOriginalLyrics', 'original-lyrics'],
    ['sopranoEmphasis', 'sopranoEmphasis', 'soprano-emphasis'],
  ]) {
    if (!params.has(parameter)) continue;
    const value = params.get(parameter);
    if (value !== '0' && value !== '1') return invalid(`This link contains a malformed ${label} preference.`);
    input[setting] = value === '1';
  }
  if (params.has('instrument')) input.instrument = params.get('instrument');
  const settings = normalizeViewerSettings(input, context);
  return settings ? { status: 'valid', settings } : invalid('This link contains settings that are not valid for this score.');
}

export type SongLocationResult = { status: 'none' }
  | ({ status: 'valid' } & ResolvedSongbookSong)
  | { status: 'invalid'; reason: string };

/** Legacy number-only links still work; conflicting tune/number pairs never silently switch tunes. */
export function readSongLocation(search: string, songbooks: readonly SongbookPackage[]): SongLocationResult {
  const params = readParameters(search);
  if (!params) return invalid('This link has duplicate, malformed, or oversized parameters.');
  if (!['book', 'number', 'tune'].some(key => params.has(key))) return { status: 'none' };
  const book = params.get('book');
  const songbook = book === null ? songbooks[0] : songbooks.find(candidate => candidate.id === book);
  if (!songbook) return invalid('This songbook is not installed.');
  const numberText = params.get('number');
  if (numberText !== null && !/^[1-9]\d*$/.test(numberText)) return invalid('This song number is invalid.');
  const number = numberText === null ? songbook.range.first : Number(numberText);
  const entry = Number.isSafeInteger(number) ? songbook.getEntry(number) : undefined;
  if (!entry) return invalid('This song number is not in the selected book.');
  const tune = params.get('tune');
  const song = tune === null ? entry.songs.find(candidate => candidate.variant === '') ?? entry.songs[0]
    : entry.songs.find(candidate => candidate.id === tune);
  if (!song) return invalid('This tune does not belong to the selected song.');
  const resolved = resolveSongbookSong(songbook, song, songbooks);
  return resolved ? { status: 'valid', ...resolved } : invalid('This hymn’s new songbook is not installed.');
}

/** Remove stale choices before navigating to another song; mutates the caller's URL. */
export function clearSharedViewerSettings(url: URL): void {
  for (const parameter of viewerParameters) url.searchParams.delete(parameter);
}

/** Pass window.location.href: no production hostname or external redirect is embedded. */
export function createShareUrl(
  currentHref: string, location: SongLocation, input: ViewerSettings, context: ViewerSettingsContext = {},
): string {
  const url = new URL(currentHref);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('A share link needs the current HTTP or HTTPS page.');
  if (!identifier(location.bookId) || !identifier(location.songId) || !Number.isSafeInteger(location.number) || location.number < 1) {
    throw new Error('A share link needs a valid song identity.');
  }
  const settings = normalizeViewerSettings(input, context);
  if (!settings) throw new Error('These viewer settings cannot be shared safely.');
  // Do not copy unrelated query strings, fragments, or private service-list data.
  url.search = '';
  url.hash = '';
  url.searchParams.set('book', location.bookId);
  url.searchParams.set('number', String(location.number));
  url.searchParams.set('tune', location.songId);
  url.searchParams.set('view', '1');
  if (settings.transpose !== undefined) url.searchParams.set('transpose', String(settings.transpose));
  if (settings.tempo !== undefined) url.searchParams.set('tempo', String(settings.tempo));
  if (settings.visibleVoiceIds !== undefined) url.searchParams.set('parts', settings.visibleVoiceIds.join(','));
  if (settings.selectedPrintVerses !== undefined) url.searchParams.set('verses', settings.selectedPrintVerses.join(','));
  if (settings.stanzasPerGroup !== undefined) url.searchParams.set('stanzas', String(settings.stanzasPerGroup));
  if (settings.scale !== undefined) url.searchParams.set('scale', String(settings.scale));
  for (const [parameter, setting] of [
    ['accidentals', 'learnerAccidentals'], ['originalLyrics', 'showOriginalLyrics'], ['sopranoEmphasis', 'sopranoEmphasis'],
  ] as const) {
    if (settings[setting] !== undefined) url.searchParams.set(parameter, settings[setting] ? '1' : '0');
  }
  if (settings.instrument !== undefined) url.searchParams.set('instrument', settings.instrument);
  if (url.search.length > MAX_SHARE_QUERY_LENGTH) throw new Error('These settings are too large for a share link.');
  return url.href;
}
