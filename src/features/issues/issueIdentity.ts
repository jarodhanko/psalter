import type { SongbookSong } from '../../domain/songbook';
import type { SongbookPackage } from '../../domain/songbookPackage';

export const hymnReportBooks = {
  'traditional-christian-hymns': { name: 'Traditional Hymns', lastNumber: 52 },
  'christian-hymns-contemporary': { name: 'Traditional and Contemporary Hymns', lastNumber: 97 },
} as const;
export type HymnReportBookId = keyof typeof hymnReportBooks;
export interface PsalterIssueIdentity {
  bookId: 'psalter-1912';
  scoreId: string;
  number: number;
  tune: string;
}
export interface HymnIssueIdentity {
  bookId: HymnReportBookId;
  scoreId: string;
  number: number;
  tune: string;
  title: string;
  catalogId: string;
  sourceEditionId: string;
}
export type IssueIdentity = PsalterIssueIdentity | HymnIssueIdentity;

export function isHymnReportBook(bookId: string): bookId is HymnReportBookId {
  return Object.hasOwn(hymnReportBooks, bookId);
}

/** A book-local number must never be relabeled as a Psalter number. */
export function issueIdentity(song: SongbookSong, book?: SongbookPackage): IssueIdentity | undefined {
  if (!book) return undefined;
  if (book.id === 'psalter-1912') {
    if (!book.getEntry(song.number)?.songs.some(candidate => candidate.id === song.id)) return undefined;
    return { bookId: book.id, scoreId: song.id, number: song.number, tune: song.tune ?? '' };
  }
  if (!isHymnReportBook(book.id)) return undefined;
  const entry = book.getEntry(song.number)?.songs.find(candidate => candidate.id === song.id);
  if (!entry || !song.title || !song.catalogId || !song.sourceEditionId
    || song.catalogId !== entry.catalogId || song.sourceEditionId !== entry.sourceEditionId
    || song.id !== `hymn-${song.sourceEditionId}`) return undefined;
  return {
    bookId: book.id, scoreId: song.id, number: song.number, tune: song.tune ?? '',
    title: song.title, catalogId: song.catalogId, sourceEditionId: song.sourceEditionId,
  };
}

export function issueIdentityLabel(context: IssueIdentity): string {
  if (context.bookId === 'psalter-1912') return `Psalter ${context.number} · ${context.scoreId}${context.tune ? ` · ${context.tune}` : ''}`;
  return `${hymnReportBooks[context.bookId].name} · Hymn ${context.number} · ${context.title} · Catalog ${context.catalogId} · ${context.scoreId}${context.tune ? ` · ${context.tune}` : ''}`;
}
