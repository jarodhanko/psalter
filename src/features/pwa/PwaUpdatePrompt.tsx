import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { clearViewerUpdateSnapshot, getUpdateBusyReason, prepareUpdateReload, reloadUpdatedApp, setUpdateBusy, subscribeUpdateBusy } from './updateSession';
import './PwaUpdatePrompt.css';

const UPDATE_CHECK_THROTTLE_MS = 5 * 60 * 1000;
const UPDATE_TIMEOUT_MS = 45_000;
type CheckState = 'idle' | 'checking' | 'current' | 'available' | 'offline' | 'error' | 'unavailable';

async function checkRegistration(registration: ServiceWorkerRegistration): Promise<'available' | 'current'> {
  let installing = registration.installing;
  const rememberInstallation = () => { installing = registration.installing; };
  registration.addEventListener('updatefound', rememberInstallation);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let removeStateListener = () => {};
  let finished = false;
  try {
    return await Promise.race([
      (async () => {
        await registration.update();
        // A network update can settle after our timeout; do not attach a late listener.
        if (finished) return 'current' as const;
        const worker = installing ?? registration.installing;
        if (worker && worker.state !== 'activated') {
          await new Promise<void>((resolve, reject) => {
            const checkState = () => {
              if (worker.state === 'installed' || worker.state === 'activated') resolve();
              else if (worker.state === 'redundant') reject(new Error('The replacement could not install.'));
            };
            worker.addEventListener('statechange', checkState);
            removeStateListener = () => worker.removeEventListener('statechange', checkState);
            checkState();
          });
        }
        return registration.waiting ? 'available' as const : 'current' as const;
      })(),
      new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error('Update check timed out.')), UPDATE_TIMEOUT_MS); }),
    ]);
  } finally {
    finished = true;
    clearTimeout(timer);
    removeStateListener();
    registration.removeEventListener('updatefound', rememberInstallation);
  }
}

export function PwaUpdatePrompt() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const lastUpdateCheckAtRef = useRef(0);
  const updateCheckInFlightRef = useRef<Promise<'available' | 'current'> | null>(null);
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(false);
  const mountedRef = useRef(true);
  const baselineWorkerRef = useRef<ServiceWorker | null>(null);
  const offeredWorkerRef = useRef<ServiceWorker | null>(null);
  const installingWorkerRef = useRef<ServiceWorker | null>(null);
  const activationRef = useRef<{ worker: ServiceWorker; registration: ServiceWorkerRegistration } | null>(null);
  const removeActivationListenerRef = useRef<() => void>(() => {});
  const removeRegistrationListenerRef = useRef<() => void>(() => {});
  const activationTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const reloadPendingRef = useRef(false);
  const busyReason = useSyncExternalStore(subscribeUpdateBusy, getUpdateBusyReason);
  const showUpdateRef = useRef<() => void>(() => {});

  const cancelActivation = useCallback(() => {
    activationRef.current = null;
    clearTimeout(activationTimerRef.current);
    removeActivationListenerRef.current();
    removeActivationListenerRef.current = () => {};
  }, []);

  const failActivation = useCallback(() => {
    cancelActivation();
    clearViewerUpdateSnapshot();
    if (mountedRef.current) { setIsUpdating(false); setUpdateError(true); }
  }, [cancelActivation]);

  const completeActivation = useCallback(() => {
    const attempt = activationRef.current;
    if (!mountedRef.current || !attempt) return;
    const { worker, registration } = attempt;
    if (worker === baselineWorkerRef.current || offeredWorkerRef.current !== worker || registrationRef.current !== registration
        || worker.state === 'redundant'
        || (registration.waiting && registration.waiting !== worker)
        || (registration.installing && registration.installing !== worker)) {
      failActivation();
      return;
    }
    if (worker.state !== 'activated') return;
    // Only the exact offered replacement may complete this approval. An initial
    // worker, an unrelated controller event, or a newer update is not evidence.
    if (registration.active !== worker) { failActivation(); return; }
    reloadPendingRef.current = true;
    cancelActivation();
    if (getUpdateBusyReason()) {
      clearViewerUpdateSnapshot();
      setIsUpdating(false);
      showUpdateRef.current();
      return;
    }
    try { prepareUpdateReload(); reloadUpdatedApp(); }
    catch { clearViewerUpdateSnapshot(); setIsUpdating(false); setUpdateError(true); }
  }, [cancelActivation, failActivation]);

  const checkForUpdate = useCallback(async (manual = false) => {
    if (!navigator.onLine) {
      if (manual) setCheckState('offline');
      return;
    }
    const offered = offeredWorkerRef.current;
    reloadPendingRef.current = !!offered && offered !== baselineWorkerRef.current && offered.state === 'activated'
      && registrationRef.current?.active === offered;
    if (reloadPendingRef.current) {
      if (manual) { setCheckState('available'); showUpdateRef.current(); }
      return;
    }
    const registration = registrationRef.current;
    if (!registration) {
      if (manual) setCheckState('unavailable');
      return;
    }
    const now = Date.now();
    if (!manual && now - lastUpdateCheckAtRef.current < UPDATE_CHECK_THROTTLE_MS) return;
    if (manual) setCheckState('checking');
    if (!updateCheckInFlightRef.current) {
      lastUpdateCheckAtRef.current = now;
      updateCheckInFlightRef.current = checkRegistration(registration);
    }
    const check = updateCheckInFlightRef.current;
    try {
      const checked = await check;
      if (!mountedRef.current) return;
      const currentOffer = offeredWorkerRef.current;
      reloadPendingRef.current = !!currentOffer && currentOffer !== baselineWorkerRef.current
        && currentOffer.state === 'activated' && registrationRef.current?.active === currentOffer;
      const outcome = reloadPendingRef.current ? 'available'
        : checked === 'available' && registration.waiting === baselineWorkerRef.current ? 'current' : checked;
      if (outcome === 'available') showUpdateRef.current();
      if (manual) setCheckState(outcome);
    } catch {
      // Network/precache failure leaves the current worker and score intact.
      if (manual && mountedRef.current) setCheckState(navigator.onLine ? 'error' : 'offline');
    } finally {
      if (updateCheckInFlightRef.current === check) updateCheckInFlightRef.current = null;
    }
  }, []);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisteredSW: (_serviceWorkerUrl, registration) => {
      if (!mountedRef.current) return;
      removeRegistrationListenerRef.current();
      registrationRef.current = registration ?? null;
      if (registration) {
        baselineWorkerRef.current = registration.active ?? navigator.serviceWorker?.controller
          ?? registration.installing ?? registration.waiting;
        installingWorkerRef.current = registration.installing;
        const rememberInstallation = () => {
          installingWorkerRef.current = registration.installing;
          if (!baselineWorkerRef.current && !registration.active && !navigator.serviceWorker?.controller) {
            baselineWorkerRef.current = registration.installing;
          }
          if (activationRef.current) completeActivation();
        };
        registration.addEventListener('updatefound', rememberInstallation);
        removeRegistrationListenerRef.current = () => registration.removeEventListener('updatefound', rememberInstallation);
        if (registration.waiting) {
          if (registration.waiting !== baselineWorkerRef.current) offeredWorkerRef.current = registration.waiting;
          else showUpdateRef.current();
        }
      }
      void checkForUpdate();
    },
    onRegisterError: () => { if (mountedRef.current) setCheckState('error'); },
    onNeedRefresh: () => showUpdateRef.current(),
    onNeedReload: () => {
      if (!mountedRef.current) return;
      if (activationRef.current) { completeActivation(); return; }
      const active = registrationRef.current?.active;
      // Other tabs can change the controller without this tab's approval.
      // Offer that verified worker, but never inherit a canceled approval.
      if (active && active !== baselineWorkerRef.current && active === navigator.serviceWorker.controller && active.state === 'activated') {
        offeredWorkerRef.current = active;
        reloadPendingRef.current = true;
        showUpdateRef.current();
      }
    },
  });
  showUpdateRef.current = () => {
    if (!mountedRef.current) return;
    const candidate = registrationRef.current?.waiting ?? installingWorkerRef.current;
    if (candidate && candidate === baselineWorkerRef.current && !reloadPendingRef.current) {
      setNeedRefresh(false);
      return;
    }
    if (candidate && candidate !== baselineWorkerRef.current && candidate.state !== 'redundant' && !activationRef.current) {
      if (candidate !== offeredWorkerRef.current) reloadPendingRef.current = false;
      offeredWorkerRef.current = candidate;
    }
    setNeedRefresh(true); setOfflineReady(false); setCheckState('available');
  };

  useEffect(() => {
    mountedRef.current = true;
    const checkWhenVisibleAndOnline = () => {
      if (document.visibilityState === 'visible') void checkForUpdate();
    };
    const beforePrint = () => setUpdateBusy('printing', true);
    const afterPrint = () => setUpdateBusy('printing', false);
    window.addEventListener('focus', checkWhenVisibleAndOnline);
    window.addEventListener('online', checkWhenVisibleAndOnline);
    document.addEventListener('visibilitychange', checkWhenVisibleAndOnline);
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => {
      window.removeEventListener('focus', checkWhenVisibleAndOnline);
      window.removeEventListener('online', checkWhenVisibleAndOnline);
      document.removeEventListener('visibilitychange', checkWhenVisibleAndOnline);
      window.removeEventListener('beforeprint', beforePrint);
      window.removeEventListener('afterprint', afterPrint);
      setUpdateBusy('printing', false);
      mountedRef.current = false;
      cancelActivation();
      removeRegistrationListenerRef.current();
      clearViewerUpdateSnapshot();
    };
  }, [checkForUpdate, cancelActivation]);

  const dismiss = () => {
    cancelActivation();
    setIsUpdating(false);
    clearViewerUpdateSnapshot();
    setOfflineReady(false);
    setNeedRefresh(false);
    setUpdateError(false);
  };

  const applyUpdate = async () => {
    if (getUpdateBusyReason() || activationRef.current || isUpdating) return;
    setIsUpdating(true);
    setUpdateError(false);
    const worker = offeredWorkerRef.current;
    const registration = registrationRef.current;
    if (!worker || !registration) { failActivation(); return; }
    const attempt = { worker, registration };
    activationRef.current = attempt;
    try {
      // Verify preservation before activation, then save fresh settings again
      // immediately before reload in case settings or navigation have changed.
      prepareUpdateReload();
      worker.addEventListener('statechange', completeActivation);
      removeActivationListenerRef.current = () => worker.removeEventListener('statechange', completeActivation);
      activationTimerRef.current = setTimeout(() => {
        if (activationRef.current === attempt) failActivation();
      }, UPDATE_TIMEOUT_MS);
      // First-visit pages may never receive controlling/isUpdate from Workbox.
      // The exact offered worker may even have activated before this click.
      completeActivation();
      if (activationRef.current !== attempt) return;
      if (registration.waiting === worker) await updateServiceWorker(true);
      else if (registration.active !== worker || worker.state !== 'activating') failActivation();
    } catch {
      // A canceled attempt's delayed rejection must not cancel a newer one.
      if (activationRef.current === attempt && mountedRef.current) failActivation();
    }
  };

  const status = checkState === 'checking' ? 'Checking for updates…'
    : checkState === 'current' ? 'You’re up to date.'
      : checkState === 'available' ? 'An update is ready. Choose Update now when you’re ready.'
        : checkState === 'offline' ? 'You’re offline. Connect to check for updates.'
          : checkState === 'error' ? 'Could not check for updates. Keep using this version and try again.'
            : checkState === 'unavailable' ? ('serviceWorker' in navigator && !import.meta.env.DEV
              ? 'Update checks are not ready yet. Try again in a moment.'
              : 'Update checks are unavailable in this browser or local preview.') : '';

  return (
    <>
      <footer className="app-version-footer" aria-label="App version and updates">
        <span>The Psalter v{__APP_VERSION__} · build {__APP_BUILD__}</span>
        <button type="button" onClick={() => void checkForUpdate(true)} disabled={checkState === 'checking' || isUpdating}>
          {checkState === 'checking' ? 'Checking…' : 'Check for updates'}
        </button>
        {status && <p role="status">{status}</p>}
      </footer>
      {(updateError || needRefresh || offlineReady) && <aside className="pwa-prompt" aria-label="Application update">
        {updateError
          ? <p role="alert">We could not install the latest version or preserve your settings. You can keep using this version and try again.</p>
          : <p role="status">{needRefresh ? 'A new version of The Psalter is ready.' : 'The Psalter is ready to use offline.'}</p>}
        {(updateError || needRefresh) && <p className="pwa-update-help">{busyReason || 'Updating reloads the app and keeps your current score and settings.'}</p>}
        <div className="pwa-prompt-actions">
          {(updateError || needRefresh) && <button type="button" onClick={() => void applyUpdate()} disabled={isUpdating || !!busyReason}>
            {isUpdating ? 'Updating…' : updateError ? 'Try again' : 'Update now'}
          </button>}
          <button type="button" className="pwa-prompt-dismiss" onClick={dismiss}>{needRefresh && !updateError ? 'Later' : 'Dismiss'}</button>
        </div>
      </aside>}
    </>
  );
}
