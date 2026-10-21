import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Apply the reviewed dependency fix even when install scripts were disabled or
// Vite is invoked directly instead of through the npm lifecycle.
execFileSync(process.execPath, [fileURLToPath(new URL('./tools/patch-abcjs.mjs', import.meta.url))], {
  cwd: import.meta.dirname,
  stdio: 'inherit',
});

// Also covers direct Vite invocations, which bypass npm lifecycle hooks.
const generateCanonicalPsalter = () => execFileSync(process.execPath, [fileURLToPath(new URL('./tools/generate-legacy-psalter-data.mjs', import.meta.url))], {
  cwd: import.meta.dirname,
  stdio: 'inherit',
});
generateCanonicalPsalter();

const canonicalPsalterSource: Plugin = {
  name: 'canonical-psalter-source',
  configureServer(server) {
    const entrypoint = resolve(import.meta.dirname, 'src/psalter-abc.ts');
    const modules = resolve(import.meta.dirname, 'src/psalter-abc');
    server.watcher.add([entrypoint, modules]);
    let pending: ReturnType<typeof setTimeout> | undefined;
    const regenerate = (_event: string, changedPath: string) => {
      const path = resolve(changedPath);
      if (path !== entrypoint && !path.startsWith(`${modules}/`) && !path.startsWith(`${modules}\\`)) return;
      if (pending) clearTimeout(pending);
      pending = setTimeout(() => {
        try {
          generateCanonicalPsalter();
          server.moduleGraph.invalidateAll();
          server.ws.send({ type: 'full-reload' });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          server.config.logger.error(message);
          server.ws.send({ type: 'error', err: { message, stack: '' } });
        }
      }, 50);
    };
    server.watcher.on('all', regenerate);
    server.httpServer?.once('close', () => {
      if (pending) clearTimeout(pending);
      server.watcher.off('all', regenerate);
    });
  },
};

const packageVersion = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version;
const buildCommit = (() => {
  const ciCommit = process.env.GITHUB_SHA;
  if (ciCommit && /^[a-f0-9]{40}$/i.test(ciCommit)) return ciCommit.slice(0, 7);
  try {
    return execFileSync('git', ['rev-parse', '--short=7', 'HEAD'], { cwd: import.meta.dirname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch { return 'local'; }
})();

export default defineConfig({
  // These values travel with this JS bundle, including when it is served offline.
  define: {
    __APP_VERSION__: JSON.stringify(packageVersion),
    __APP_BUILD__: JSON.stringify(buildCommit),
  },
  plugins: [
    canonicalPsalterSource,
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'The Psalter',
        short_name: 'Psalter',
        description: 'Search, read, transpose, and hear the complete Psalter.',
        theme_color: '#18352d',
        background_color: '#f7f4eb',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'psalter-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'psalter-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'psalter-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,mp3,txt}'],
        globIgnores: ['**/soundfonts/optional-v1/**', '**/psalter-icon.svg', '**/psalter-icon-192.png', '**/psalter-icon-512.png'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  // Build validation follows emitted imports instead of one chunk filename.
  build: { manifest: true },
  server: {
    watch: {
      ignored: ['**/temp/**', '**/transcriptions/**', '**/psalter-work/**', '**/reference/**'],
    },
  },
});
