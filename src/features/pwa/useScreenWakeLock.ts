import { useEffect, useState } from 'react';

const SCREEN_AWAKE_MS = 10 * 60 * 1000;

export type ScreenWakeStatus = 'starting' | 'active' | 'expired' | 'unavailable' | 'unsupported' | 'inactive';

/** One bounded screen-awake period each time the app enters the foreground. */
export function useScreenWakeLock() {
  const [status, setStatus] = useState<ScreenWakeStatus>('inactive');
  useEffect(() => {
    if (!window.isSecureContext || !navigator.wakeLock?.request) {
      setStatus('unsupported');
      return;
    }

    let disposed = false;
    let foreground = false;
    let generation = 0;
    let deadline = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let sentinel: WakeLockSentinel | undefined;

    const release = (lock: WakeLockSentinel) => {
      void lock.release().catch(() => { /* The browser may already have released it. */ });
    };
    const finish = (nextStatus: ScreenWakeStatus) => {
      generation += 1;
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
      const held = sentinel;
      sentinel = undefined;
      if (held) release(held);
      if (!disposed) setStatus(nextStatus);
      // Keep foreground true after expiry: duplicate events and song changes
      // must not start another ten minutes without actually leaving the app.
    };
    const leave = () => {
      foreground = false;
      finish('inactive');
    };
    const enter = () => {
      if (disposed || foreground || document.visibilityState !== 'visible') return;
      foreground = true;
      setStatus('starting');
      const session = ++generation;
      deadline = Date.now() + SCREEN_AWAKE_MS;
      timer = setTimeout(() => finish('expired'), SCREEN_AWAKE_MS);
      void (async () => {
        try {
          const acquired = await navigator.wakeLock.request('screen');
          // A pending request can settle after hide, unmount, expiry, or even
          // a newer foreground session. Never let it outlive its own window.
          if (disposed || session !== generation || !foreground
            || document.visibilityState !== 'visible') {
            release(acquired);
            return;
          }
          if (Date.now() >= deadline) {
            release(acquired);
            finish('expired');
            return;
          }
          if (acquired.released) {
            release(acquired);
            finish('unavailable');
            return;
          }
          sentinel = acquired;
          setStatus('active');
          acquired.addEventListener('release', () => {
            if (sentinel === acquired) {
              sentinel = undefined;
              finish('unavailable');
            }
          }, { once: true });
        } catch {
          if (!disposed && session === generation) finish('unavailable');
          // Unsupported power modes and denied requests keep normal screen
          // behavior. Do not retry or fight an operating-system revocation.
        }
      })();
    };
    const visibilityChanged = () => {
      if (document.visibilityState === 'visible') enter();
      else leave();
    };

    document.addEventListener('visibilitychange', visibilityChanged);
    window.addEventListener('pagehide', leave);
    window.addEventListener('pageshow', enter);
    enter();
    return () => {
      disposed = true;
      document.removeEventListener('visibilitychange', visibilityChanged);
      window.removeEventListener('pagehide', leave);
      window.removeEventListener('pageshow', enter);
      leave();
    };
  }, []);
  return status;
}
