import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { createIssueSubmission, issueCooldown, submitIssue } from './issueReports';
import type { IssueContext, IssueSubmission } from './issueReports';
import './IssueReporter.css';
import { issueIdentityLabel } from './issueIdentity';
import { setUpdateBusy, UPDATE_PREPARE_EVENT } from '../pwa/updateSession';
import { readIssueReportingConfig } from './issueReportingConfig';

// Keep these bounds aligned with the deployed Firestore rules. Unsupported
// snapshots stay unchanged so a saved draft or retry is never rewritten.
function supportsDeployedReportContext(context: IssueContext) {
  return Number.isFinite(context.scale) && context.scale >= 0.5 && context.scale <= 1.75
    && ['piano', 'concertGrand', 'organ', 'guitar', 'harpsichord'].includes(context.instrument);
}

interface Props { context: IssueContext; lyricDisplayNote?: string; }

export function IssueReporter({ context, lyricDisplayNote }: Props) {
  const [open, setOpen] = useState(false);
  const [captured, setCaptured] = useState<IssueContext>();
  const [capturedLyricNote, setCapturedLyricNote] = useState<string>();
  const descriptionLimit = 2000 - (capturedLyricNote ? capturedLyricNote.length + 2 : 0);
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const pending = useRef<IssueSubmission | undefined>(undefined);
  const inFlight = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const mounted = useRef(true);
  const draftText = useRef('');
  const updateDescription = (text: string) => {
    draftText.current = text;
    setUpdateBusy('issue-report', !!text || inFlight.current);
    setDescription(text);
  };

  useEffect(() => {
    mounted.current = true;
    const update = () => setOnline(navigator.onLine);
    const preserveDraft = (event: Event) => { if (draftText.current || inFlight.current) event.preventDefault(); };
    window.addEventListener(UPDATE_PREPARE_EVENT, preserveDraft);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => { mounted.current = false; setUpdateBusy('issue-report', false); window.removeEventListener(UPDATE_PREPARE_EVENT, preserveDraft); window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  useEffect(() => { if (open && !receipt) textarea.current?.focus(); }, [open, receipt]);

  const close = () => { setOpen(false); trigger.current?.focus(); };
  const discardDraft = () => { pending.current = undefined; updateDescription(''); setError(''); setCaptured(undefined); setCapturedLyricNote(undefined); close(); };
  const reportContext = pending.current?.context ?? captured ?? context;
  const unsupportedContext = !supportsDeployedReportContext(reportContext);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (inFlight.current || receipt || !captured || !supportsDeployedReportContext(pending.current?.context ?? captured)) return;
    setError('');
    if (website) { setError('Unable to send this report. Please reload and try again.'); return; }
    if (!online) { setError('You’re offline. Keep this page open and submit when connected. Nothing is sent automatically.'); return; }
    if (!pending.current && issueCooldown() > 0) { setError('Please wait 10 seconds between reports. Your text is still here.'); return; }
    try { pending.current ??= createIssueSubmission(description, captured, capturedLyricNote); }
    catch (error) { setError(error instanceof Error ? error.message : 'Please check the description.'); return; }
    inFlight.current = true;
    setUpdateBusy('issue-report', true);
    setSending(true);
    try {
      const reference = await submitIssue(pending.current);
      if (mounted.current) { setReceipt(reference); updateDescription(''); pending.current = undefined; }
    } catch (error) {
      if (mounted.current) setError(error instanceof Error ? error.message : 'Unable to send the report. Please retry.');
    } finally {
      inFlight.current = false;
      if (mounted.current) { setUpdateBusy('issue-report', !!draftText.current); setSending(false); }
    }
  };

  if (!readIssueReportingConfig()) return null;

  return <section className="issue-reporter" aria-labelledby="issue-reporter-heading">
    <div className="issue-reporter-header">
      <div className="issue-reporter-intro">
        <h2 id="issue-reporter-heading">Help improve this score</h2>
        <p>Spotted a wrong note, missing word, or playback problem? Let us know.</p>
      </div>
      <button type="button" className="issue-report-trigger" ref={trigger} disabled={sending} aria-expanded={open} aria-controls="issue-report-panel" onClick={() => {
        if (open) close();
        else { if (!captured || (!description.trim() && !pending.current && !receipt)) { setCaptured(structuredClone(context)); setCapturedLyricNote(lyricDisplayNote); } setOpen(true); }
      }}>Report an issue</button>
    </div>
    {open && <section id="issue-report-panel" className="issue-report-panel" aria-label="Report a score issue" onKeyDown={(event) => { if (event.key === 'Escape' && !sending) close(); }}>
      {receipt ? <div role="status">
        <h2>Report received</h2>
        <p>Thank you. Your report is in the private review queue.</p>
        <p className="issue-reference">Reference: {receipt}</p>
        <div className="issue-actions"><button type="button" onClick={close}>Close</button><button type="button" className="text-button" onClick={() => { setReceipt(''); setCaptured(structuredClone(context)); setCapturedLyricNote(lyricDisplayNote); }}>Report another issue</button></div>
      </div> : unsupportedContext ? <div role="status">
        <h2>Issue reporting temporarily unavailable</h2>
        <p>The report queue accepts score sizes from 50% to 175% and the Piano, Concert grand, Organ, Nylon guitar, or Harpsichord instruments. This report’s settings are not supported.</p>
        {description || pending.current ? <>
          <p>Keep this page open to preserve your draft and its original settings.</p>
          <label>Saved description<textarea readOnly rows={5} value={description} /></label>
          {pending.current && <p className="issue-reference">Retry reference: {pending.current.id}. An earlier attempt may already have reached the queue.</p>}
        </> : <p>Close this panel and reopen it after changing the score settings.</p>}
        <div className="issue-actions"><button type="button" onClick={close}>Close</button>{(description || pending.current) && <button type="button" className="text-button" onClick={discardDraft}>Discard draft</button>}</div>
      </div> : <form onSubmit={submit}>
        <h2>Report an issue</h2>
        <p>Describe what looks or sounds wrong, including the verse, part, or measure if you can.</p>
        <p id="issue-report-privacy">Your description and the score settings below are sent to a private Firebase queue managed by this site’s maintainer. Please don’t include names, contact details, or other personal information. No account is needed.</p>
        <label htmlFor="issue-description">What needs correcting?</label>
        <textarea id="issue-description" ref={textarea} minLength={10} maxLength={descriptionLimit} required rows={5} value={description} readOnly={sending || !!pending.current} aria-describedby="issue-report-privacy issue-report-length" onChange={(event) => updateDescription(event.target.value)} />
        <small id="issue-report-length">{description.length.toLocaleString()} / {descriptionLimit.toLocaleString()} characters. At least 10 characters.</small>
        <div className="issue-honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} /></label></div>
        <details className="issue-context"><summary>Score details included</summary>
          <p>{captured && issueIdentityLabel(captured)}</p>
          <p>Parts: {captured?.parts.join(', ') || 'none'} · Key: {captured?.key} · Transpose: {captured?.transpose}</p>
          <p>Verses per tune: {captured?.versesPerTune} · Print verses: {captured?.printVerses.join(', ') || 'none'}</p>
          <p>Tempo: {captured?.tempo} · Instrument: {captured?.instrument} · Size: {Math.round((captured?.scale ?? 1) * 100)}% · Repeated accidentals: {captured?.learnerAccidentals ? 'on' : 'off'}</p>
          <p>Version: {captured?.appVersion} · Build: {captured?.build} · Corpus: {captured?.corpusVersion}</p>
          <p className="issue-reference">Source revision: {captured?.sourceSha256}</p>
          {capturedLyricNote && <p>{capturedLyricNote} This note is appended to your description.</p>}
        </details>
        {!online && <p className="notice">You’re offline. Keep this page open to keep your draft. Submit when connected; nothing is sent automatically.</p>}
        {error && <p className="notice error" role="alert">{error}</p>}
        {pending.current && !sending && <p className="issue-reference">Retry reference: {pending.current.id}. Retry keeps the original description and settings to avoid duplicates. Discarding stops retries; an earlier attempt may already have reached the queue.</p>}
        <div className="issue-actions"><button type="submit" disabled={sending || !online}>{sending ? 'Sending…' : pending.current ? 'Retry submission' : 'Submit issue'}</button><button type="button" className="text-button" disabled={sending} onClick={close}>Close</button><button type="button" className="text-button" disabled={sending} onClick={discardDraft}>Discard draft</button></div>
        <p className="issue-draft-note">Drafts stay only on this page. Leaving or reloading the score clears an unsent draft.</p>
      </form>}
    </section>}
  </section>;
}
