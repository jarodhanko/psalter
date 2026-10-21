export interface IssueReportingEnvironment {
  VITE_ISSUE_REPORTS_ENABLED?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_ISSUE_REPORT_ALLOWED_ORIGINS?: string;
}

export interface IssueReportingConfig {
  projectId: string;
  documents: string;
  endpoint: string;
}

function isExactAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    return url.origin === origin && !url.username && !url.password && !url.hostname.includes('*')
      && (url.protocol === 'https:' || (url.protocol === 'http:' && local));
  } catch { return false; }
}

/** Public build settings, never credentials. Missing or malformed config fails closed.
 * The origin check prevents an unchanged fork or mirrored owner build from sending
 * reports to the owner's queue. It is not an authorization or abuse boundary;
 * Firestore Security Rules remain responsible for that.
 */
export function resolveIssueReportingConfig(environment: IssueReportingEnvironment, origin: string): IssueReportingConfig | undefined {
  if (environment.VITE_ISSUE_REPORTS_ENABLED !== 'true') return undefined;
  const projectId = environment.VITE_FIREBASE_PROJECT_ID ?? '';
  if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(projectId)) return undefined;
  const origins = (environment.VITE_ISSUE_REPORT_ALLOWED_ORIGINS ?? '').split(',').map(value => value.trim());
  if (!origins.length || origins.some(value => !isExactAllowedOrigin(value)) || !origins.includes(origin)) return undefined;
  const documents = `projects/${projectId}/databases/(default)/documents`;
  return { projectId, documents, endpoint: `https://firestore.googleapis.com/v1/${documents}:commit` };
}

export function readIssueReportingConfig(): IssueReportingConfig | undefined {
  // Direct access lets Vite remove disabled reporting configuration from default builds.
  if (import.meta.env.VITE_ISSUE_REPORTS_ENABLED !== 'true') return undefined;
  return resolveIssueReportingConfig(import.meta.env, globalThis.location?.origin ?? '');
}
