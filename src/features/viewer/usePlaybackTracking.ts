import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type abcjs from 'abcjs';
import { bindVisibleHeads, readWrittenScore, TRACKING_UNSUPPORTED } from './playbackTracking';
import type { RegisterVisibleScore, TrackingSchedule, TrackingSelection, VisibleHead } from './playbackTracking';
import { bindNotationKeyboard, refreshNotationTabStop } from './playbackNotationControls';
import { readFollowPreference, saveFollowPreference } from './playbackFollowPreference';
import './playbackTracking.css';

const EMPTY_VOICES: readonly { id: string; name?: string }[] = [];

type Run = { schedule: TrackingSchedule; context: AudioContext; origin: number; copy: number };
type Binding = { heads: VisibleHead[]; unsupported: boolean; dispose: () => void };

/** Selection and display-only state never receive a synth capable of seeking.
 * The only synth read is the validated audio-clock origin after Play starts. */
export function usePlaybackTracking(song: string, abc: string, enabled: boolean, busy?: boolean, voices: readonly { id: string; name?: string }[] = EMPTY_VOICES) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const written = useMemo(() => { if (!enabled) return undefined; try { return readWrittenScore(abc); } catch { return undefined; } }, [abc, enabled]);
  const [pending, setPending] = useState<TrackingSelection>();
  const pendingRef = useRef<TrackingSelection | undefined>(undefined);
  const [notice, setNotice] = useState('');
  const [layoutUnsupported, setLayoutUnsupported] = useState(false);
  const [available, setAvailable] = useState(false);
  const [overlapping, setOverlapping] = useState<readonly VisibleHead[]>([]);
  const focusMemory = useRef<VisibleHead | undefined>(undefined);
  const voiceNames = useMemo(() => new Map(voices.map(voice => [voice.id, voice.name])), [voices]);
  const label = useCallback((head: VisibleHead) => {
    const names: Record<string, string> = { s: 'Soprano', t1: 'Soprano', a: 'Alto', t2: 'Alto', t: 'Tenor', b1: 'Tenor', b: 'Bass', b2: 'Bass', default: 'Melody' };
    return `${voiceNames.get(head.voice) ?? names[head.voice.toLowerCase()] ?? head.voice}, ${head.description}`;
  }, [voiceNames]);
  const pointerCancelled = useRef(false);
  const [follow, setFollow] = useState(readFollowPreference);
  const [suspended, setSuspended] = useState(false);
  const followRef = useRef(follow), suspendedRef = useRef(false), busyRef = useRef(busy ?? false);
  const mounted = useRef(enabled);
  const identity = useRef({ song, abc });
  const registry = useRef(new Map<HTMLElement, Binding>());
  const run = useRef<Run | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  const validationFrame = useRef<number | undefined>(undefined);
  const scrollTarget = useRef<SVGElement | undefined>(undefined);
  const markerAnchor = useRef<SVGElement | undefined>(undefined);
  const markerBusy = useRef(false);
  const marker = useRef<SVGTextElement | undefined>(undefined);
  const allHeads = useCallback(() => [...registry.current.values()].flatMap(binding => binding.heads).filter(head => head.element.isConnected), []);
  const paint = useCallback(() => {
    const current = run.current;
    const position = current ? current.context.currentTime - current.origin : -1;
    const active = new Set(current?.schedule.intervals.filter(event => event.start <= position && position < event.end).map(event => `${event.key}/${event.head}`));
    const heads = allHeads();
    for (const head of heads) {
      const selected = pendingRef.current?.key === head.key && pendingRef.current.copy === head.copy;
      const pressed = String(selected);
      if (head.element.getAttribute('aria-pressed') !== pressed) head.element.setAttribute('aria-pressed', pressed);
      head.element.classList.toggle('playback-sounding-head', active.has(`${head.key}/${head.head}`) && head.copy === current?.copy);
      head.element.classList.toggle('playback-start-head', selected && !busyRef.current);
      head.element.classList.toggle('playback-next-head', selected && busyRef.current);
    }
    const selected = heads.find(head => pendingRef.current?.key === head.key && pendingRef.current.copy === head.copy);
    const markerChanged = markerAnchor.current !== selected?.element || markerBusy.current !== busyRef.current || (marker.current && !marker.current.isConnected);
    if (markerChanged) { marker.current?.remove(); marker.current = undefined; markerAnchor.current = selected?.element; markerBusy.current = busyRef.current; }
    if (selected && markerChanged) {
      const svg = selected.element.ownerSVGElement;
      try {
        const box = (selected.element as SVGGraphicsElement).getBBox();
        // Put the label in the same coordinate system as the head, including staff transforms.
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.textContent = busyRef.current ? 'Next Play' : 'Start';
        label.setAttribute('x', String(box.x)); label.setAttribute('y', String(box.y - 10));
        label.setAttribute('class', 'playback-start-marker');
        if (svg && selected.element.parentNode) { selected.element.parentNode.appendChild(label); marker.current = label; }
      } catch { /* The accessible status still names the pending start. */ }
    }
    if (current && followRef.current && !suspendedRef.current) {
      // Follow the latest reached onset, not the earliest still-sounding head.
      // A held bass on the old system stays red without pulling the viewport back.
      // Keep that frontier through articulation gaps and rests in the other parts.
      const latest = current.schedule.intervals.reduce((time, event) => event.start <= position ? Math.max(time, event.start) : time, -1);
      const frontier = new Set(current.schedule.intervals.filter(event => event.start === latest).map(event => `${event.key}/${event.head}`));
      const target = heads.find(head => head.copy === current.copy && frontier.has(`${head.key}/${head.head}`))?.element;
      if (target && target !== scrollTarget.current) {
        scrollTarget.current = target;
        const rect = target.getBoundingClientRect();
        const bar = document.querySelector('.viewer-controls--active')?.getBoundingClientRect();
        const top = Math.max(16, (bar?.bottom ?? 0) + 24), bottom = window.innerHeight - 64;
        if (rect.top < top || rect.bottom > bottom) {
          // Instant scrolling avoids drift and respects reduced motion. Manual input suspends it.
          window.scrollBy({ top: rect.top - top - Math.max(0, (bottom - top) * 0.25), behavior: 'instant' });
        }
      }
    }
  }, [allHeads]);
  // loading() can run before the optional controller has mounted. The parent
  // remains the authority for current loading/playing presentation, including
  // late mount; synchronizing it never changes the captured Play request/audio.
  useLayoutEffect(() => {
    if (!enabled || busy === undefined) return;
    busyRef.current = busy;
    paint();
  }, [busy, enabled, paint]);
  const clearActive = useCallback(() => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined; run.current = undefined; busyRef.current = false; scrollTarget.current = undefined;
    paint();
  }, [paint]);
  const clearSelection = useCallback((message = '') => {
    pendingRef.current = undefined; setPending(undefined); setOverlapping([]); setNotice(message); paint();
  }, [paint]);
  const interruptFollowing = useCallback(() => {
    if (busyRef.current && followRef.current) { suspendedRef.current = true; setSuspended(true); }
  }, []);
  const chooseHead = useCallback((head: VisibleHead) => {
    if (!allHeads().some(candidate => candidate.element === head.element)) {
      setOverlapping([]); setNotice('That note is no longer visible. Choose a note in the current score.'); return;
    }
    const selection = Object.freeze({ song, key: head.key, copy: head.copy });
    pendingRef.current = selection; setPending(selection); setOverlapping([]); setNotice('');
    focusMemory.current = head; refreshNotationTabStop(allHeads(), focusMemory); paint();
  }, [song, allHeads, paint]);
  const registerVisible = useCallback<RegisterVisibleScore>(registration => {
    if (!enabled) return () => {};
    const previous = registry.current.get(registration.host); previous?.dispose();
    const validateVisibility = () => {
      if (!enabledRef.current) return;
      if (validationFrame.current !== undefined) cancelAnimationFrame(validationFrame.current);
      validationFrame.current = requestAnimationFrame(() => {
        if (!mounted.current) return;
        const selection = pendingRef.current, visible = allHeads();
        setAvailable(visible.length > 0);
        // Layout failures belong to current connected copies, not to the last
        // registration attempt. Keep action/audio notices independent: the same
        // unsupported text can also describe a genuine timing or clock failure.
        setLayoutUnsupported([...registry.current].some(([host, binding]) => host.isConnected && binding.unsupported));
        setOverlapping(previous => previous.length && previous.some(head => !visible.includes(head)) ? [] : previous);
        refreshNotationTabStop(visible, focusMemory);
        if (selection && !visible.some(head => head.key === selection.key)) clearSelection('The selected start is no longer visible. Play will start at the beginning.');
        else if (selection && !visible.some(head => head.key === selection.key && head.copy === selection.copy)) {
          pendingRef.current = Object.freeze({ ...selection, copy: visible.find(head => head.key === selection.key)!.copy }); setPending(pendingRef.current);
        }
        if (run.current && !visible.some(head => head.copy === run.current!.copy)) run.current.copy = visible[0]?.copy ?? 0;
        paint();
      });
    };
    let disposed = false;
    let unsupported = false;
    const removers: (() => void)[] = [];
    let heads: VisibleHead[] = [];
    try {
      if (!written || !enabled) throw new Error(TRACKING_UNSUPPORTED);
      heads = bindVisibleHeads(written, registration);
      // Native click, not ABCJS touchend, owns taps. The browser already
      // cancels pointers for scrolling/pinching; do not invent gesture thresholds.
      const pointerDown = (event: PointerEvent) => { pointerCancelled.current = !event.isPrimary; };
      const pointerCancel = () => { pointerCancelled.current = true; };
      const multiTouch = (event: TouchEvent) => { if (event.touches.length > 1) pointerCancelled.current = true; };
      registration.host.addEventListener('pointerdown', pointerDown, true);
      registration.host.addEventListener('pointercancel', pointerCancel, true);
      registration.host.addEventListener('touchstart', multiTouch, {capture:true, passive:true});
      removers.push(() => {
        registration.host.removeEventListener('pointerdown', pointerDown, true);
        registration.host.removeEventListener('pointercancel', pointerCancel, true);
        registration.host.removeEventListener('touchstart', multiTouch, true);
      });
      const select = (event: MouseEvent) => {
        if (event.defaultPrevented || pointerCancelled.current || disposed || !registration.host.isConnected || registry.current.get(registration.host) !== binding) return;
        // A hollow head's unpainted center targets the surrounding SVG instead
        // of its path. Use only validated, current glyph bounds as a fallback;
        // never choose the nearest note or enlarge targets into adjacent voices.
        const target = event.target;
        const exact = heads.find(head => head.element.isConnected && target instanceof Node && head.element.contains(target));
        // Keyboard/assistive activation identifies one real glyph, even in a unison.
        if (event.detail === 0 && exact) { chooseHead(exact); return; }
        const candidates = heads.filter(head => {
          if (head === exact) return true;
          if (!head.element.isConnected) return false;
          const box = head.element.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
        });
        if (new Set(candidates.map(head => head.key)).size > 1) {
          const ordered = exact ? [exact, ...candidates.filter(head => head !== exact)] : candidates;
          setOverlapping(ordered.filter((head, index) => ordered.findIndex(candidate => candidate.key === head.key) === index));
          setNotice('These notes overlap. Choose the part below, or use the arrow keys on the music and press Enter.');
          return;
        }
        const head = candidates[0];
        if (!head) return;
        chooseHead(head);
      };
      registration.host.addEventListener('click', select);
      removers.push(() => registration.host.removeEventListener('click', select));
      removers.push(bindNotationKeyboard({ host: registration.host, heads, allHeads, memory: focusMemory, label, select: chooseHead, interrupt: interruptFollowing }));
      for (const head of heads) {
        head.element.classList.add('playback-selectable-head');
        removers.push(() => {
          head.element.classList.remove('playback-selectable-head', 'playback-sounding-head', 'playback-start-head', 'playback-next-head');
        });
      }
    } catch { unsupported = true; }
    const binding: Binding = { heads, unsupported, dispose: () => {
      if (disposed) return; disposed = true; removers.forEach(remove => remove());
      if (registry.current.get(registration.host) === binding) registry.current.delete(registration.host);
      validateVisibility();
    } };
    registry.current.set(registration.host, binding);
    validateVisibility();
    paint();
    return binding.dispose;
  }, [written, enabled, allHeads, clearSelection, paint, chooseHead, interruptFollowing, label]);
  useEffect(() => {
    if (!enabled) return;
    mounted.current = true;
    if (identity.current.song !== song || identity.current.abc !== abc) {
      pendingRef.current = undefined; setPending(undefined); setOverlapping([]);
      suspendedRef.current = false; setSuspended(false); focusMemory.current = undefined;
      paint(); identity.current = { song, abc };
    }
    return () => { mounted.current = false; clearActive(); marker.current?.remove(); if (validationFrame.current !== undefined) cancelAnimationFrame(validationFrame.current); };
  }, [song, abc, enabled, clearActive, paint]);
  useEffect(() => {
    if (!enabled) return;
    const suspend = () => { if (busyRef.current && followRef.current) { suspendedRef.current = true; setSuspended(true); } };
    const key = (event: KeyboardEvent) => {
      if (event.defaultPrevented || (event.target instanceof Element && event.target.closest('input,select,textarea,[contenteditable]'))) return;
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) suspend();
    };
    const focus = (event: FocusEvent) => {
      if (event.target instanceof Element && event.target.closest('.compact-header, .viewer-drawer, .viewer-controls, .score-settings, .playback-tracking-status, .song-actions, .song-action-panel, .add-to-list-panel')) suspend();
    };
    window.addEventListener('focusin', focus);
    window.addEventListener('wheel', suspend, { passive: true }); window.addEventListener('touchmove', suspend, { passive: true }); window.addEventListener('keydown', key);
    return () => { window.removeEventListener('focusin', focus); window.removeEventListener('wheel', suspend); window.removeEventListener('touchmove', suspend); window.removeEventListener('keydown', key); };
  }, [enabled]);
  const snapshot = () => pendingRef.current ? Object.freeze({ ...pendingRef.current }) : undefined;
  const loading = () => {
    if (!enabled) return;
    // Only a new explicit Play (or Resume following) begins a fresh follow session.
    busyRef.current = true; suspendedRef.current = false; setSuspended(false); scrollTarget.current = undefined; paint();
  };
  const start = (schedule: TrackingSchedule, context: AudioContext, synth: abcjs.MidiBuffer, selection?: TrackingSelection) => {
    if (!enabled) return;
    const origin = (synth as abcjs.MidiBuffer & { startTimeSec?: number }).startTimeSec;
    if (!Number.isFinite(origin)) { setNotice(TRACKING_UNSUPPORTED); return; }
    run.current = { schedule, context, origin: origin!, copy: selection?.copy ?? allHeads()[0]?.copy ?? 0 };
    // Preserve manual movement/focus interruptions made while samples were loading.
    busyRef.current = true;
    const tick = () => { if (!run.current) return; paint(); frame.current = requestAnimationFrame(tick); };
    tick();
  };
  const setAutoScroll = (value: boolean) => { saveFollowPreference(value); followRef.current = value; setFollow(value); suspendedRef.current = false; setSuspended(false); scrollTarget.current = undefined; };
  return { written, pending, notice: notice || (layoutUnsupported ? TRACKING_UNSUPPORTED : ''), available, overlapping, dismissOverlapping: () => { setOverlapping([]); setNotice(''); }, chooseHead, label, registerVisible, snapshot, loading, start, clearActive, clearSelection, setNotice, follow, suspended, setAutoScroll };
}
