import { useCallback, useEffect, useRef, useState } from 'react';
import { instruments, isOptionalInstrument } from './instruments';
import type { Instrument } from './instruments';
import type { OptionalBank } from './optionalInstrumentBank';

export function useOptionalInstrument(instrument: Instrument, enabled: boolean) {
  const [state, setState] = useState<{ message: string; busy: boolean; retry: boolean }>({ message: '', busy: false, retry: false });
  const active = useRef<{ instrument: Instrument; controller: AbortController; pending?: Promise<OptionalBank>; bank?: OptionalBank } | undefined>(undefined);
  const cancel = useCallback(() => {
    if (!active.current?.pending || active.current.controller.signal.aborted) return;
    active.current.controller.abort();
    active.current.pending = undefined;
    if (isOptionalInstrument(active.current.instrument)) {
      setState({ message: 'Download paused. Choose Retry download or Play to continue.', busy: false, retry: true });
    }
  }, []);
  const prepare = useCallback((): Promise<OptionalBank | undefined> => {
    if (!enabled || !isOptionalInstrument(instrument)) return Promise.resolve(undefined);
    if (active.current?.instrument === instrument && active.current.pending) return active.current.pending;
    const bank = active.current?.instrument === instrument ? active.current.bank : undefined;
    active.current?.controller.abort();
    const request = { instrument, controller: new AbortController(), bank, pending: undefined as Promise<OptionalBank> | undefined };
    active.current = request;
    const label = instruments[instrument].label;
    setState({ message: `Checking ${label.toLowerCase()} download…`, busy: true, retry: false });
    const pending = import('./optionalInstrumentBank').then(({ loadOptionalBank }) => loadOptionalBank(instrument, request.controller.signal, ({ completed, total, bytes, totalBytes }) => {
      if (active.current !== request || request.controller.signal.aborted) return;
      setState({ message: `Preparing ${label.toLowerCase()}: ${completed}/${total} samples (${(bytes / 1e6).toFixed(1)}/${(totalBytes / 1e6).toFixed(1)} MB).`, busy: true, retry: false });
    }, bank)).then(result => {
      if (active.current !== request || request.controller.signal.aborted) throw new DOMException('Instrument download cancelled.', 'AbortError');
      request.bank = result;
      setState({ message: result.offlineReady
        ? `${label} is ready offline. Your browser may clear downloaded sounds if storage is needed.`
        : `${label} is ready for this session, but could not be saved for offline use.`, busy: false, retry: !result.offlineReady });
      return result;
    }).catch((error: unknown) => {
      if (active.current === request && !request.controller.signal.aborted) {
        request.controller.abort();
        setState({ message: error instanceof Error ? error.message : `${label} download failed. Please retry.`, busy: false, retry: true });
      }
      throw error;
    }).finally(() => { request.pending = undefined; });
    request.pending = pending;
    return pending;
  }, [enabled, instrument]);
  useEffect(() => {
    if (enabled && isOptionalInstrument(instrument)) void prepare().catch(() => undefined);
    else { active.current?.controller.abort(); active.current = undefined; setState({ message: '', busy: false, retry: false }); }
    return () => { active.current?.controller.abort(); if (active.current) active.current.pending = undefined; };
  }, [enabled, instrument, prepare]);
  return { ...state, instrument: active.current?.instrument, prepare, cancel, retryDownload: () => { void prepare().catch(() => undefined); } };
}
