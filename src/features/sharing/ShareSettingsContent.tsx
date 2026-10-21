import { useId, useMemo, useRef, useState } from 'react';
import { createShareUrl } from './shareUrl';
import type { SongLocation } from './shareUrl';
import type { ViewerSettings } from './viewerSettings';

export function ShareSettingsContent({ location, settings }: { location: SongLocation; settings: ViewerSettings }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [feedback, setFeedback] = useState<{ url: string; message: string }>();
  const share = useMemo(() => {
    try { return { url: createShareUrl(window.location.href, location, settings) }; }
    catch (error) { return { error: error instanceof Error ? error.message : 'Unable to create this share link.' }; }
  }, [location.bookId, location.number, location.songId, settings]);
  const url = share.url ?? '';
  const copy = async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setFeedback({ url, message: 'Link copied.' });
    } catch {
      inputRef.current?.focus();
      inputRef.current?.select();
      setFeedback({ url, message: 'Automatic copying is unavailable. Copy the selected link below.' });
    }
  };
  return <>
    <p>The link keeps this song, key, parts, tempo, verse choices, and display settings.</p>
    {share.error ? <p role="alert">{share.error}</p> : <>
      <label htmlFor={inputId}>Link to this setting</label>
      <div className="share-settings-row">
        <input ref={inputRef} id={inputId} type="url" readOnly value={url} onFocus={event => event.currentTarget.select()} />
        <button type="button" onClick={() => { void copy(); }}>Copy link</button>
      </div>
      <p className="share-settings-status" role="status" aria-live="polite">{feedback?.url === url ? feedback.message : 'You can also select and copy the link directly.'}</p>
    </>}
  </>;
}
