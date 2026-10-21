/** Observe a single horizontal stroke without taking over native scrolling. */
export function bindScoreSwipe(host: HTMLElement, onSwipe: (direction: number) => void) {
  let gesture: { id: number; x: number; y: number; direction: number } | undefined;
  const options = { passive: true, capture: true };
  const hasSelection = () => window.getSelection()?.isCollapsed === false;
  const cancel = () => {
    gesture = undefined;
    window.removeEventListener('touchstart', cancel, true);
    window.removeEventListener('touchmove', onMove, true);
    window.removeEventListener('touchend', onEnd, true);
    window.removeEventListener('touchcancel', cancel, true);
    window.removeEventListener('scroll', cancel, true);
  };
  const movement = (touch: Touch | undefined) => {
    if (!gesture || !touch || touch.identifier !== gesture.id) return cancel();
    const dx = touch.clientX - gesture.x;
    const dy = Math.abs(touch.clientY - gesture.y);
    const ax = Math.abs(dx);
    // Commit to the first meaningful direction. A vertical/diagonal start
    // cannot become navigation by curving sideways or returning to its origin.
    if (!gesture.direction && Math.max(ax, dy) >= 12) {
      if (ax <= dy * 2) return cancel();
      gesture.direction = Math.sign(dx);
    }
    // Also abandon a horizontal start that subsequently becomes a scroll.
    if (dy > 24 || (gesture.direction && dx * gesture.direction < 0)) return cancel();
    return dx;
  };
  function onMove(event: TouchEvent) {
    if (event.touches.length !== 1 || event.defaultPrevented) return cancel();
    movement(event.touches[0]);
  }
  function onEnd(event: TouchEvent) {
    const dx = event.touches.length === 0 && event.changedTouches.length === 1 && !event.defaultPrevented
      ? movement(event.changedTouches[0]) : undefined;
    const direction = gesture?.direction;
    cancel();
    if (direction && dx !== undefined && Math.abs(dx) >= 80 && !hasSelection()) onSwipe(-direction);
  }
  const onStart = (event: TouchEvent) => {
    cancel();
    const touch = event.touches[0];
    const target = event.target;
    if (event.touches.length !== 1 || !touch || event.defaultPrevented || hasSelection()
      || !(target instanceof Element) || !target.closest('.score-canvas, .lyrics-transcript')
      || target.closest('a, button, input, select, textarea, summary, [contenteditable], [role="button"]:not(.playback-selectable-head)')) return;
    gesture = { id: touch.identifier, x: touch.clientX, y: touch.clientY, direction: 0 };
    window.addEventListener('touchstart', cancel, options);
    window.addEventListener('touchmove', onMove, options);
    window.addEventListener('touchend', onEnd, options);
    window.addEventListener('touchcancel', cancel, options);
    window.addEventListener('scroll', cancel, options);
  };
  // Interruptions must not leave an old finger position armed for navigation.
  host.addEventListener('touchstart', onStart, { passive: true });
  window.addEventListener('blur', cancel);
  window.addEventListener('pagehide', cancel);
  document.addEventListener('visibilitychange', cancel);
  return () => {
    cancel();
    host.removeEventListener('touchstart', onStart);
    window.removeEventListener('blur', cancel);
    window.removeEventListener('pagehide', cancel);
    document.removeEventListener('visibilitychange', cancel);
  };
}
