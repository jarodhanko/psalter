import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const preview = JSON.parse(await read('firebase.json'));
const production = JSON.parse(await read('firebase.production.json'));
const previewRobots = {
  source: '**',
  headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
};
assert.deepEqual(preview.hosting?.headers?.[0], previewRobots, 'preview must protect every response with noindex, nofollow');

// A Hosting clone preserves the source version's headers. Production must use
// a separate version of the same frozen app bytes, not the preview's config.
const indexablePreview = structuredClone(preview);
indexablePreview.hosting.headers.shift();
assert.deepEqual(production, indexablePreview, 'production may differ only by omitting the preview robots header');

for (const [name, config] of Object.entries({ preview, production })) {
  const hosting = config.hosting;
  assert.equal(hosting?.public, 'dist', `${name}: Firebase Hosting must publish only dist/`);
  assert.ok(hosting.rewrites?.some((rule) => rule.source === '**' && rule.destination === '/index.html'), `${name}: SPA routes must rewrite to index.html`);
  function header(source, key) {
    return hosting.headers?.flatMap((rule) => rule.source === source ? rule.headers : [])
      .filter((entry) => entry.key.toLowerCase() === key.toLowerCase()).map((entry) => entry.value);
  }
  // Firebase matches the original request path before applying a rewrite.
  // /index.html alone does not cover / or a ?number=... deep link.
  for (const route of ['/', '/index.html', '/sw.js', '/manifest.webmanifest']) {
    assert.deepEqual(header(route, 'Cache-Control'), ['no-cache'], `${name}: ${route} must revalidate`);
  }
  for (const route of ['/assets/**', '/soundfonts/**']) {
    assert.deepEqual(header(route, 'Cache-Control'), ['public,max-age=31536000,immutable'], `${name}: ${route} must be immutable`);
  }
}

assert.ok(!production.hosting.headers.some((rule) => rule.headers.some((entry) =>
  entry.key.toLowerCase() === 'x-robots-tag' && /\b(?:noindex|nofollow|none)\b/i.test(entry.value))),
'production must not send a blocking robots header');

const landingPages = [
  ['index.html', 'https://oldpsalter.com/', 'Old Psalter | Psalter Sheet Music and Part Playback'],
  ['public/about.html', 'https://oldpsalter.com/about.html', 'About and Guide | Old Psalter'],
];
for (const [path, canonical, title] of landingPages) {
  const html = new JSDOM(await read(path)).window.document;
  for (const meta of html.querySelectorAll('meta[name]')) {
    if (/^(?:robots|googlebot|bingbot)$/i.test(meta.getAttribute('name'))) {
      assert.doesNotMatch(meta.getAttribute('content') ?? '', /\b(?:noindex|nofollow|none)\b/i, `${path}: shared HTML must not block production indexing`);
    }
  }
  assert.equal(html.querySelectorAll('link[rel="canonical"]').length, 1, `${path}: one canonical URL is required`);
  assert.equal(html.querySelector('link[rel="canonical"]').getAttribute('href'), canonical);
  assert.equal(html.title, title);
  assert.ok(html.querySelector('meta[name="description"]')?.getAttribute('content')?.length > 40, `${path}: provide a factual search description`);
}

const robots = await read('public/robots.txt');
assert.match(robots, /^User-agent: \*$/m, 'robots.txt must include the general crawler group');
assert.doesNotMatch(robots, /^Disallow:[ \t]*\S+/m, 'robots.txt must not disallow crawling');
assert.match(robots, /^Sitemap: https:\/\/oldpsalter\.com\/sitemap\.xml$/m, 'robots.txt must advertise the canonical sitemap');
const sitemap = new JSDOM(await read('public/sitemap.xml'), { contentType: 'application/xml' }).window.document;
assert.equal(sitemap.documentElement.namespaceURI, 'http://www.sitemaps.org/schemas/sitemap/0.9');
assert.equal(sitemap.documentElement.localName, 'urlset');
assert.deepEqual([...sitemap.querySelectorAll('loc')].map((loc) => loc.textContent), landingPages.map((page) => page[1]), 'only the substantive homepage and guide are listed, not query-state song URLs');

console.log('Hosting and discovery: preview noindex, indexable production, identical cache/rewrite settings, canonical metadata, robots.txt, and landing-page sitemap verified.');
