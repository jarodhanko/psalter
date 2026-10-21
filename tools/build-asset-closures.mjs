/** Collect actual emitted static-JS imports from Vite's own build manifest.
 * Dynamic roots must be explicitly assigned to a loading phase by the caller;
 * traversing every dynamic import would count optional exports/audio and all
 * lazy song packages as startup work. Shared files and cycles are counted once.
 */
export function collectJavascriptClosure(manifest, roots, excludedFiles = new Set()) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('Invalid Vite build manifest');
  const visitedKeys = new Set(), files = new Set();
  const visit = (key) => {
    if (visitedKeys.has(key)) return;
    visitedKeys.add(key);
    const entry = manifest[key];
    if (!entry || typeof entry !== 'object' || typeof entry.file !== 'string') throw new Error(`Missing build-manifest entry: ${key}`);
    // Only JS belongs in these existing JS transfer budgets. CSS and all other
    // output remain covered by the unchanged total-distribution/offline checks.
    if (!/^assets\/[A-Za-z0-9_.-]+\.js$/.test(entry.file)) throw new Error(`Unexpected JavaScript build asset: ${entry.file}`);
    if (!excludedFiles.has(entry.file)) files.add(entry.file);
    if (entry.imports !== undefined && (!Array.isArray(entry.imports) || entry.imports.some(value => typeof value !== 'string'))) throw new Error(`Invalid build imports: ${key}`);
    for (const dependency of entry.imports ?? []) visit(dependency);
  };
  for (const root of roots) visit(root);
  return files;
}
