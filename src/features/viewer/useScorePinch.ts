import { useEffect, useRef } from 'react';

/** Resize the engraving, rather than magnifying a fixed-layout SVG or the page. */
export function useScorePinch(scale: number, onScaleChange: (scale: number) => void, enabled = true) {
  const hostRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ scale, onScaleChange });
  latest.current = { scale, onScaleChange };

  useEffect(() => {
    const host = hostRef.current;
    if (!enabled || !host) return;
    let disposed = false;
    let unbind: (() => void) | undefined;
    // Gesture code is independent of engraving and loads without delaying the
    // score. If it cannot load, the native browser gesture remains available.
    void import('./scorePinch').then(({ bindScorePinch }) => {
      if (disposed) return;
      unbind = bindScorePinch(host, latest);
    }).catch(() => undefined);
    return () => { disposed = true; unbind?.(); };
  }, [enabled]);

  return hostRef;
}
