import { clampScoreScale } from './scoreScale';

const distance = (first: Touch, second: Touch) => Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);

/** Native listeners stay local to an owned score gesture, including reflow. */
export function bindScorePinch(host: HTMLDivElement, latest: { current: { scale: number; onScaleChange: (scale: number) => void } }) {
  // Share the Score size slider's limits and 5% increments.
  const scoreSize = clampScoreScale;
  let gesture: { ids: [number, number]; distance: number; scale: number } | undefined;
  let session = false;
  let interrupted = false;
  let frame: number | undefined;
  let pendingScale: number | undefined;
  const targets = new Set<EventTarget>();
  const handled = new WeakSet<Event>();
  const options = { passive: false, capture: true };

  const discardPending = () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    pendingScale = undefined;
  };
  const commitPending = () => {
    if (frame !== undefined) window.cancelAnimationFrame(frame);
    frame = undefined;
    const next = pendingScale;
    pendingScale = undefined;
    if (next !== undefined && next !== latest.current.scale) {
      latest.current.scale = next;
      latest.current.onScaleChange(next);
    }
  };
  const cancelGesture = () => {
    gesture = undefined;
    discardPending();
  };
  const clearSession = () => {
    cancelGesture();
    session = false;
    window.removeEventListener('touchstart', onAdditionalTouch, true);
    for (const target of [window, ...targets]) {
      target.removeEventListener('touchmove', onMove as EventListener, true);
      target.removeEventListener('touchend', onEnd as EventListener, true);
      target.removeEventListener('touchcancel', onCancel as EventListener, true);
    }
    targets.clear();
  };
  const trackTargets = (touches: TouchList) => {
    // ABCJS replaces SVG children when scale changes. Touch events continue
    // targeting those detached nodes, so a wrapper/window listener alone is
    // insufficient. Retain each original target until every finger is up.
    for (const touch of Array.from(touches)) {
      if (targets.has(touch.target)) continue;
      targets.add(touch.target);
      touch.target.addEventListener('touchmove', onMove as EventListener, options);
      touch.target.addEventListener('touchend', onEnd as EventListener, options);
      touch.target.addEventListener('touchcancel', onCancel as EventListener, options);
    }
  };
  const once = (event: TouchEvent) => {
    if (handled.has(event)) return false;
    handled.add(event);
    return true;
  };
  const pair = (touches: TouchList) => {
    if (!gesture || touches.length !== 2) return undefined;
    const active = Array.from(touches);
    const first = active.find(touch => touch.identifier === gesture!.ids[0]);
    const second = active.find(touch => touch.identifier === gesture!.ids[1]);
    return first && second ? [first, second] as const : undefined;
  };
  function onAdditionalTouch(event: TouchEvent) {
    trackTargets(event.touches);
    // A third finger, or a replacement finger, ends this gesture. Never
    // restart it while fingers from the interrupted sequence remain down.
    if (!pair(event.touches)) cancelGesture();
  }
  function onMove(event: TouchEvent) {
    if (!once(event) || !gesture) return;
    const touches = pair(event.touches);
    if (!touches || !event.cancelable) return cancelGesture();
    const separation = distance(...touches);
    if (!Number.isFinite(separation) || separation <= 0) return cancelGesture();
    event.preventDefault();
    pendingScale = scoreSize(gesture.scale * separation / gesture.distance);
    if (frame === undefined) frame = window.requestAnimationFrame(commitPending);
  }
  function onEnd(event: TouchEvent) {
    if (!once(event)) return;
    if (gesture && !pair(event.touches)) {
      commitPending();
      gesture = undefined;
    }
    if (event.touches.length === 0) clearSession();
  }
  function onCancel(event: TouchEvent) {
    if (!once(event)) return;
    interrupted = true;
    clearSession();
  }
  const onStart = (event: TouchEvent) => {
    if (session) return;
    // After a browser interruption, require a fresh touch sequence. Browsers
    // need not deliver the old sequence's final touchend on blur/pagehide.
    if (interrupted) {
      if (event.touches.length !== event.changedTouches.length) return;
      interrupted = false;
    }
    if (event.touches.length !== 2 || !event.cancelable) return;
    const [first, second] = Array.from(event.touches);
    if (![first, second].every(touch => touch.target instanceof Node && host.contains(touch.target))) return;
    const separation = distance(first, second);
    if (!Number.isFinite(separation) || separation <= 0) return;
    event.preventDefault();
    session = true;
    gesture = { ids: [first.identifier, second.identifier], distance: separation, scale: latest.current.scale };
    trackTargets(event.touches);
    window.addEventListener('touchstart', onAdditionalTouch, { passive: true, capture: true });
    window.addEventListener('touchmove', onMove, options);
    window.addEventListener('touchend', onEnd, options);
    window.addEventListener('touchcancel', onCancel, options);
  };
  const interrupt = () => {
    interrupted = true;
    clearSession();
  };
  const onVisibilityChange = () => { if (document.hidden) interrupt(); };
  // Only a two-finger gesture beginning inside this score is canceled.
  // No viewport restriction, global preventDefault, or touch-action override:
  // single-finger scrolling and browser magnification elsewhere stay native.
  host.addEventListener('touchstart', onStart, { passive: false });
  window.addEventListener('blur', interrupt);
  window.addEventListener('pagehide', interrupt);
  document.addEventListener('visibilitychange', onVisibilityChange);
  return () => {
    clearSession();
    host.removeEventListener('touchstart', onStart);
    window.removeEventListener('blur', interrupt);
    window.removeEventListener('pagehide', interrupt);
    document.removeEventListener('visibilitychange', onVisibilityChange);
  };
}
