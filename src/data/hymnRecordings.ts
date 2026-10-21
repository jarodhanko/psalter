import recordingMap from './hymnRecordingMap';

export interface HymnRecording {
  readonly url: string;
  readonly linkLabel: string;
}

// Book membership matters: the same installed score can have a different
// recording in each playlist. This module loads only with the hymn footer.
const recordings: Readonly<Record<string, Readonly<Record<string, HymnRecording>>>> = recordingMap;

export function getHymnRecording(bookId: string, songId: string): HymnRecording | undefined {
  if (!Object.hasOwn(recordings, bookId) || !Object.hasOwn(recordings[bookId], songId)) return undefined;
  return recordings[bookId][songId];
}
