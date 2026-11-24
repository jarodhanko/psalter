import { approvedAbc } from './render-approved-abc.mjs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
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
  assert.equal(hosting.rewrites?.length, 1);
  assert.equal(hosting.rewrites[0].destination, '/index.html');
  const fallback = new RegExp(hosting.rewrites[0].regex);
  for (const path of ['/', '/deep/link', '/about.html', '/ab', '/abcde']) assert.ok(fallback.test(path));
  for (const path of ['/abc', '/abc/', '/abc/psalter-1912/253.abc', '/abc/psalter-1912/foo', '/abc/foo']) assert.ok(!fallback.test(path));
  function header(source, key) {
    return hosting.headers?.flatMap((rule) => rule.source === source ? rule.headers : [])
      .filter((entry) => entry.key.toLowerCase() === key.toLowerCase()).map((entry) => entry.value);
  }
  // Firebase matches the original request path before applying a rewrite.
  // /index.html alone does not cover / or a ?number=... deep link.
  for (const route of ['/', '/index.html', '/sw.js', '/manifest.webmanifest']) {
    assert.deepEqual(header(route, 'Cache-Control'), ['no-cache'], `${name}: ${route} must revalidate`);
  }
  assert.deepEqual(header('/abc/psalter-1912/index.json', 'Cache-Control'), ['no-cache']);
  assert.deepEqual(header('/abc/psalter-1912/*.abc', 'Content-Type'), ['text/vnd.abc; charset=utf-8']);
  assert.deepEqual(header('/abc/psalter-1912/*.abc', 'Cache-Control'), ['no-cache']);
  for (const route of ['/assets/**', '/soundfonts/**']) {
    assert.deepEqual(header(route, 'Cache-Control'), ['public,max-age=31536000,immutable'], `${name}: ${route} must be immutable`);
  }
}

assert.ok(!production.hosting.headers.some((rule) => rule.headers.some((entry) =>
  entry.key.toLowerCase() === 'x-robots-tag' && /\b(?:noindex|nofollow|none)\b/i.test(entry.value))),
'production must not send a blocking robots header');

const landingPages = [
  ['index.html', 'https://oldpsalter.com/', '1912 Psalter Online: Sheet Music & Part Playback | Old Psalter'],
  ['public/about.html', 'https://oldpsalter.com/about.html', 'How to Use the 1912 Psalter Online | Old Psalter'],
  ['public/psalter-index.html', 'https://oldpsalter.com/psalter-index.html', '1912 Psalter Index: Numbers 1–434 | Old Psalter'],
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
assert.deepEqual([...sitemap.querySelectorAll('loc')].map((loc) => loc.textContent), landingPages.map((page) => page[1]), 'only the substantive homepage, guide and index are listed, not query-state song URLs');

const homepage = new JSDOM(await read('index.html')).window.document;
const discovery = homepage.querySelector('.psalter-discovery');
assert.ok(discovery?.textContent.includes('metrical psalms'), 'Home must have useful static copy');
for (const path of ['/psalter-index.html', '/about.html']) {
  assert.ok(discovery.querySelector(`a[href="${path}"]`), `Home discovery links to ${path} even without script execution`);
}
const website = JSON.parse(homepage.querySelector('script[type="application/ld+json"]').textContent);
assert.equal(website['@type'], 'WebSite');
assert.equal(website.url, 'https://oldpsalter.com/');
const index = new JSDOM(await read('public/psalter-index.html')).window.document;
assert.equal(index.scripts.length, 0, 'The number index must not need JavaScript');
const scoreLinks = [...index.querySelectorAll('.psalter-entry a:not(.source-abc)')];
assert.equal(scoreLinks.length, 434);
for (const [i, link] of scoreLinks.entries()) {
  assert.equal(link.getAttribute('href'), `/?book=psalter-1912&number=${i + 1}&tune=psalter${i + 1}`);
  assert.match(link.textContent, new RegExp(`^Psalter ${i + 1}: .+`));
}
assert.equal(scoreLinks[218].textContent, 'Psalter 219: Restoration and Revival');
assert.match(scoreLinks[432].textContent, /Lord.s Prayer/i);
for (const link of index.querySelectorAll('nav a')) assert.ok(index.getElementById(link.hash.slice(1)));
const staticDir = 'public/abc/psalter-1912';
const manifest = JSON.parse(await read(`${staticDir}/index.json`));
assert.equal(manifest.schemaVersion, 1);
assert.equal(manifest.collection, 'psalter-1912');
assert.deepEqual(manifest.sourceFiles.map(({ number, id, sourceSha256 }) => ({ number, id, sourceSha256 })),
  approvedAbc.map(({ number, id, sourceSha256 }) => ({ number, id, sourceSha256 })));
assert.deepEqual((await readdir(staticDir)).sort(), ['index.json', ...approvedAbc.map(({ slug }) => `${slug}.abc`)].sort());
const abcLinks = [...index.querySelectorAll('a.source-abc')];
assert.deepEqual(abcLinks.map(link => link.getAttribute('href')),
  approvedAbc.map(({ slug }) => `/abc/psalter-1912/${slug}.abc`));
for (const { slug, sourceSha256 } of approvedAbc) {
  const body = await read(`${staticDir}/${slug}.abc`);
  assert.equal(createHash('sha256').update(body).digest('hex'), sourceSha256);
}
const llms = await read('public/llms.txt');
for (const [, url] of landingPages) assert.ok(llms.includes(`(${url})`), `Agent reference links to ${url}`);

console.log('Hosting and discovery: preview noindex, indexable production, identical cache/rewrite settings, canonical metadata, robots.txt, and landing-page sitemap verified.');
