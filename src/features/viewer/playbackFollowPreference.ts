const key = 'psalter.followPlayingNotes';
// Keep the preference during this visit even when storage is blocked or full.
let sessionPreference: boolean | undefined;

export function readFollowPreference(): boolean {
  if (sessionPreference !== undefined) return sessionPreference;
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === 'true' || saved === 'false') sessionPreference = saved === 'true';
  } catch { /* Storage is optional. */ }
  return sessionPreference ?? false;
}

export function saveFollowPreference(value: boolean): void {
  sessionPreference = value;
  try { window.localStorage.setItem(key, String(value)); } catch { /* Keep the session preference. */ }
}
