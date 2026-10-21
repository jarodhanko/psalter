import type { IssueIdentity } from './issueIdentity';
import { readIssueReportingConfig } from './issueReportingConfig';

/** Deliberately has no Firebase SDK, account, analytics, or background outbox. */
export type IssueContext = IssueIdentity & {
  parts: string[];
  versesPerTune: number;
  printVerses: number[];
  key: string;
  transpose: number;
  learnerAccidentals: boolean;
  scale: number;
  tempo: number;
  instrument: string;
  appVersion: string;
  build: string;
  corpusVersion: string;
  sourceSha256: string;
}

export interface IssueSubmission {
  id: string;
  description: string;
  context: IssueContext;
}

export class IssueSubmissionError extends Error {
  constructor(message: string, readonly uncertain = false) { super(message); }
}

const lastSubmissionKey = 'psalter.lastIssueSubmission';
const cooldownMs = 10_000;

function requireIssueReportingConfig() {
  const config = readIssueReportingConfig();
  if (!config) throw new IssueSubmissionError('Issue reporting is not enabled for this site. Nothing was sent.');
  return config;
}

export function issueCooldown(): number {
  try { return Math.max(0, cooldownMs - (Date.now() - Number(sessionStorage.getItem(lastSubmissionKey) || 0))); }
  catch { return 0; }
}

export function createIssueSubmission(description: string, context: IssueContext, displayNote?: string): IssueSubmission {
  const clean = description.trim();
  if (clean.length < 10 || clean.length > 2000) throw new IssueSubmissionError('Describe the issue in 10–2,000 characters.');
  const combined = displayNote ? `${clean}\n\n${displayNote}` : clean;
  if (combined.length > 2000) throw new IssueSubmissionError('Shorten the description so it and the displayed score settings fit within 2,000 characters.');
  if (!globalThis.crypto?.randomUUID) throw new IssueSubmissionError('This browser cannot create a safe report reference. Please use an up-to-date browser.');
  return { id: crypto.randomUUID(), description: combined, context: structuredClone(context) };
}

type FirestoreValue = { stringValue: string } | { integerValue: string } | { doubleValue: number }
  | { booleanValue: boolean } | { arrayValue: { values: FirestoreValue[] } } | { mapValue: { fields: Record<string, FirestoreValue> } };
function value(input: string | number | boolean | string[] | number[] | IssueContext): FirestoreValue {
  if (typeof input === 'string') return { stringValue: input };
  if (typeof input === 'boolean') return { booleanValue: input };
  if (typeof input === 'number') return Number.isInteger(input) ? { integerValue: String(input) } : { doubleValue: input };
  if (Array.isArray(input)) return { arrayValue: { values: input.map(value) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(input).map(([key, item]) => [key, value(item)])) } };
}

/** Each accepted report consumes a server-enforced ingress slot in the same atomic commit. */
export function issueCommit(submission: IssueSubmission) {
  const { documents } = requireIssueReportingConfig();
  return { writes: [
    {
      update: { name: `${documents}/issueReports/${submission.id}`, fields: {
        schemaVersion: value(submission.context.bookId === 'psalter-1912' ? 1 : 2), description: value(submission.description), context: value(submission.context), status: value('open'),
      } },
      currentDocument: { exists: false },
      updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
    },
    {
      update: { name: `${documents}/issueReportIngress/global`, fields: { reportId: value(submission.id) } },
      updateMask: { fieldPaths: ['reportId'] },
      updateTransforms: [
        { fieldPath: 'total', increment: { integerValue: '1' } },
        { fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' },
      ],
    },
  ] };
}

export async function submitIssue(submission: IssueSubmission): Promise<string> {
  // Guard the transport too, rather than relying only on the hidden form.
  const { endpoint } = requireIssueReportingConfig();
  if (!navigator.onLine) throw new IssueSubmissionError('You’re offline. Keep this page open and submit when you’re connected. Nothing is sent automatically.');
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(issueCommit(submission)), signal: controller.signal,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => undefined) as { error?: { status?: string } } | undefined;
      // Do not claim success for a failed retry: public reads are intentionally forbidden.
      if (error?.error?.status === 'ALREADY_EXISTS') throw new IssueSubmissionError(`A report with reference ${submission.id} already exists. Your earlier submission may have arrived; please keep this reference.`, true);
      if (response.status === 429) throw new IssueSubmissionError('The report queue is busy. Please wait a minute and retry.');
      if (response.status === 403 || response.status === 404) throw new IssueSubmissionError('The report queue is temporarily unavailable or busy. Please wait a minute and retry. Your text is still here.');
      throw new IssueSubmissionError('We couldn’t confirm this report’s delivery. Please retry in a minute using the same reference.', true);
    }
    const receipt = await response.json() as { commitTime?: string; writeResults?: unknown[] };
    if (!receipt.commitTime || receipt.writeResults?.length !== 2) throw new IssueSubmissionError('The server’s receipt could not be confirmed. Retry with the same reference.', true);
    try { sessionStorage.setItem(lastSubmissionKey, String(Date.now())); } catch { /* An optional local cooldown. */ }
    return submission.id;
  } catch (error) {
    if (error instanceof IssueSubmissionError) throw error;
    throw new IssueSubmissionError('We couldn’t confirm delivery. Your text is still here. Retry with the same reference when connected; nothing is sent automatically.', true);
  } finally { window.clearTimeout(timer); }
}
