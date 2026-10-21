/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

declare const __APP_VERSION__: string;
declare const __APP_BUILD__: string;

interface ImportMetaEnv {
  readonly VITE_ISSUE_REPORTS_ENABLED?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_ISSUE_REPORT_ALLOWED_ORIGINS?: string;
}
