import recordings from './psalterRecordings.json';

/** Number-level piano arrangements; never infer a match from a Psalm or hymn number. */
export function getPsalterRecordingUrl(bookId: string, number: number): string | undefined {
  if (bookId !== 'psalter-1912' || !Number.isInteger(number)) return undefined;
  return (recordings as Readonly<Partial<Record<number, string>>>)[number];
}
