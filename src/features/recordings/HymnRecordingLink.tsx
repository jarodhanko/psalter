import { getHymnRecording } from '../../data/hymnRecordings';

/** An ordinary outbound link; viewing scores never contacts Spotify. */
export function HymnRecordingLink({ bookId, songId }: { bookId: string; songId: string }) {
  const recording = getHymnRecording(bookId, songId);
  if (!recording) return null;
  return <a href={recording.url} target="_blank" rel="noopener noreferrer"
    aria-label={`${recording.linkLabel} (opens in a new tab)`}>{recording.linkLabel}</a>;
}
