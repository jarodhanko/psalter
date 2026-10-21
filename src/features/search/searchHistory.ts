/** Search belongs to this browser history entry, never to a shared song URL. */
export interface SearchSession {
  version: 1;
  key: string;
  bookId: string;
  query: string;
  view: 'results' | 'song';
  pageScroll: number;
  resultScroll: number;
  focusedSongId?: string;
}

let sequence = 0;
export const newSearchKey = () => `${Date.now().toString(36)}:${sequence++}`;

export function readSearchSession(state: unknown, bookId: string): SearchSession | undefined {
  if (!state || typeof state !== 'object') return undefined;
  const search = (state as { psalterSearch?: Partial<SearchSession> }).psalterSearch;
  if (!search || search.version !== 1 || typeof search.key !== 'string' || !search.key || search.bookId !== bookId || typeof search.query !== 'string'
    || !search.query.trim() || !['results', 'song'].includes(search.view ?? '')
    || !Number.isFinite(search.pageScroll) || search.pageScroll! < 0
    || !Number.isFinite(search.resultScroll) || search.resultScroll! < 0
    || (search.focusedSongId !== undefined && typeof search.focusedSongId !== 'string')) return undefined;
  return search as SearchSession;
}

export function searchHistoryState(state: unknown, search: SearchSession | undefined): Record<string, unknown> {
  const next = { ...(state && typeof state === 'object' && !Array.isArray(state) ? state : {}) } as Record<string, unknown>;
  if (search) next.psalterSearch = search;
  else delete next.psalterSearch;
  return next;
}

export function replaceSearchSession(search: SearchSession | undefined): void {
  try { window.history.replaceState(searchHistoryState(window.history.state, search), '', window.location.href); }
  catch { /* The in-memory search still works when history storage is restricted. */ }
}

/** Typed navigation rejects invalid input; shared-URL fallback parsing is separate. */
export function parseTypedNumber(input: string, first: number, last: number): number | undefined {
  const text = input.trim();
  if (!/^\d+$/.test(text)) return undefined;
  const number = Number(text);
  return Number.isSafeInteger(number) && number >= first && number <= last ? number : undefined;
}
