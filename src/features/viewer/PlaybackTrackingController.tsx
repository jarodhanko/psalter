import { memo, useEffect, useLayoutEffect, useRef } from 'react';
import { usePlaybackTracking } from './usePlaybackTracking';

export type PlaybackTrackingControllerValue = ReturnType<typeof usePlaybackTracking>;

/** Optional tracking loads independently; static booklet copies never mount it. */
export const PlaybackTrackingController = memo(function PlaybackTrackingController({ song, abc, voices, busy, deferred, onChange }: {
  song: string; abc: string; voices: readonly { id: string; name?: string }[]; busy: boolean; deferred: boolean; onChange: (controller: PlaybackTrackingControllerValue) => void;
}) {
  const controller = usePlaybackTracking(song, abc, true, busy, voices);
  useEffect(() => { onChange(controller); }, [controller, onChange]);
  const overlapPanel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    // This is a nonmodal choice: start on a real option without trapping Tab or
    // restoring focus on unmount, which could interfere with song navigation.
    if (controller.overlapping.length) overlapPanel.current?.querySelector<HTMLButtonElement>('button')?.focus({ preventScroll: true });
  }, [controller.overlapping]);
  const focusNote = (head: (typeof controller.overlapping)[number] | undefined) => {
    if (head?.element.isConnected && head.element.classList.contains('playback-selectable-head')) head.element.focus({ preventScroll: true });
  };
  const dismissOverlap = () => {
    // The tapped glyph is first; a hollow-center hit uses the first validated
    // candidate. Do not focus an old glyph after reflow or navigation.
    const target = controller.overlapping.find(head => head.element.isConnected && head.element.classList.contains('playback-selectable-head'));
    controller.dismissOverlapping();
    focusNote(target);
  };
  if (!controller.pending && !controller.notice && !controller.overlapping.length && !(busy && deferred)) return null;
  return <div className="playback-tracking-status">
    <div aria-live="polite">
      {controller.pending ? <span>{busy ? 'Next Play starts at the outlined note.' : 'Play starts at the red note.'} Repeated notes use their first occurrence. </span> : null}
      {busy && deferred && <p role="status">Note following wasn’t ready when this playback started. Press Play again to retry note following.</p>}
      {controller.notice && <p role="status">{controller.notice}</p>}
    </div>
    {controller.pending && <button type="button" className="text-button" onClick={() => controller.clearSelection('Play will start from the beginning.')}>Start from beginning</button>}
    {controller.overlapping.length > 0 && <div ref={overlapPanel} className="playback-overlapping-notes" role="group" aria-label="Choose the overlapping note for the next Play start" onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dismissOverlap(); } }}>
      <strong>Choose a part at this note</strong>
      {controller.overlapping.map(head => <button type="button" key={`${head.key}/${head.copy}`} onClick={() => { controller.chooseHead(head); focusNote(head); }}>{controller.label(head)}</button>)}
      <button type="button" onClick={dismissOverlap}>Cancel</button>
    </div>}
  </div>;
});
