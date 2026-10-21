import { mkdir, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { readSourceAbc, readGeneratedAbc } from './inspect-underlay.mjs';
import { scoreEventWorksheet } from './inspect-score-events.mjs';
import { underlayWorksheet } from './inspect-underlay.mjs';

const require = createRequire(import.meta.url);
const abcjs = require('abcjs');
const usage = 'Usage: node tools/qa-sheet.mjs <psalter-id> <owner-photo-path>\nExample: node tools/qa-sheet.mjs psalter346 "reference/psalter-annotated/pages/20260829_113012.jpg"';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const renderScore = (abc) => {
  const dom = new JSDOM('<!doctype html><html><body><div id="score"></div></body></html>');
  try {
    globalThis.window = dom.window;
    globalThis.document = dom.window.document;
    abcjs.renderAbc('score', abc, {
      add_classes: true,
      responsive: 'resize',
      staffwidth: 950,
      paddingleft: 12,
      paddingright: 12,
    });
    const svg = dom.window.document.querySelector('#score svg');
    if (!svg) throw new Error('ABCJS did not produce an SVG score');
    // ABCJS positions its SVG absolutely inside its own wrapper. The standalone
    // sheet does not contain that wrapper, so reset positioning before embedding.
    svg.setAttribute('style', 'display:block;width:100%;height:auto');
    return svg.outerHTML;
  } finally {
    dom.window.close();
    delete globalThis.window;
    delete globalThis.document;
  }
};

const buildSheet = ({ id, photoPath, scoreSvg, sourceAbc, renderedAbc }) => {
  const photoUrl = pathToFileURL(photoPath).href;
  const events = scoreEventWorksheet(id, sourceAbc);
  const underlay = underlayWorksheet(id, sourceAbc);
  const abcLines = renderedAbc.split(/\r?\n/u).map((line) => `<div>${escapeHtml(line) || '&nbsp;'}</div>`).join('');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(id)} photo QA sheet</title>
  <style>
    :root { color-scheme: light; font: 15px/1.45 system-ui, sans-serif; color: #17202a; background: #eef1f4; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 18px; }
    header, section { background: white; border: 1px solid #cbd2d9; border-radius: 8px; padding: 16px; margin: 0 0 14px; }
    h1 { font-size: 1.35rem; margin: 0 0 6px; }
    h2 { font-size: 1.05rem; margin: 0 0 10px; }
    .authority { color: #405060; font-size: .9rem; margin: 4px 0 10px; }
    .compare { display: grid; grid-template-columns: minmax(260px, .85fr) minmax(400px, 1.7fr); gap: 14px; align-items: start; }
    .photo-viewport { overflow: auto; max-height: 78vh; background: #e9ecef; }
    .photo { width: 100%; height: auto; display: block; }
    .score { overflow-x: auto; }
    .score svg { display: block; max-width: 100%; height: auto; }
    pre { white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; margin: 0; }
    .abc { padding: 10px; border: 1px solid #d7dce1; border-radius: 4px; white-space: pre-wrap; overflow-wrap: anywhere; font: 12px/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; }
    @media (max-width: 850px) { body { padding: 8px; } .compare { grid-template-columns: 1fr; } .photo-viewport { max-height: 70vh; } }
    @media print { :root { background: white; } body { padding: 0; } header, section { break-inside: avoid; border-radius: 0; margin-bottom: 8px; } .compare { grid-template-columns: 42% 58%; gap: 8px; } .photo-viewport { max-height: none; } .photo { width: 100% !important; } .photo-zoom { display:none; } }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(id)} · photo verification</h1>
    <div class="authority"><strong>Photo authority:</strong> ${escapeHtml(photoPath)} (linked in place; not copied).</div>
    <div class="authority"><strong>Score authority:</strong> generated viewer ABC at src/data/generated/abc/${escapeHtml(id)}.ts. Rendered locally by ABCJS; no network requests.</div>
    <div class="authority"><strong>Worksheet authority:</strong> canonical source modules exported by src/psalter-abc.ts; parser worksheet is a comparison aid, not an approval record.</div>
  </header>
  <main>
    <div class="compare">
      <section>
        <h2>Owner photo</h2>
        <label class="photo-zoom">Photo zoom <input type="range" min="1" max="4" step="0.25" value="1" oninput="document.querySelector('.photo').style.width = (this.value * 100) + '%'"></label>
        <div class="photo-viewport"><img class="photo" src="${escapeHtml(photoUrl)}" alt="Owner-provided source score photo"></div>
      </section>
      <section class="score">
        <h2>Current generated viewer score</h2>
        ${scoreSvg}
      </section>
    </div>
    <section>
      <h2>Rendered ABC input</h2>
      <div class="authority">Exact generated viewer ABC passed to ABCJS for the score above.</div>
      <div class="abc">${abcLines}</div>
    </section>
    <section>
      <h2>Parsed score event worksheet</h2>
      <pre>${escapeHtml(events)}</pre>
    </section>
    <section>
      <h2>Parsed lyric underlay worksheet</h2>
      <pre>${escapeHtml(underlay)}</pre>
    </section>
  </main>
</body>
</html>
`;
};

const main = async () => {
  const args = process.argv.slice(2);
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) {
    console.log(usage);
    return;
  }
  if (args.length !== 2) throw new Error(usage);

  const [id, photoArg] = args;
  if (!/^psalter\d+(?:[a-z]|_tune\d+)?$/u.test(id)) {
    throw new Error(`Expected an arrangement ID such as psalter191 or psalter2_tune2, got: ${id}`);
  }

  const photoPath = resolve(photoArg);
  if (!/^\.(?:jpe?g|png|webp|gif|avif)$/iu.test(extname(photoPath))) {
    throw new Error(`Unsupported photo type ${extname(photoPath) || '(no extension)'}; use JPG, PNG, WebP, GIF, or AVIF`);
  }
  const photo = await stat(photoPath);
  if (!photo.isFile() || !photo.size) throw new Error(`Photo file is empty or not a regular file: ${photoPath}`);

  const [sourceAbc, renderedAbc] = await Promise.all([readSourceAbc(id), readGeneratedAbc(id)]);
  if (sourceAbc !== renderedAbc) {
    throw new Error(`Generated viewer ABC for ${id} differs from canonical source; run npm run generate:psalter before comparing.`);
  }
  const scoreSvg = renderScore(renderedAbc);
  const outputDirectory = resolve('temp/qa-sheet');
  const outputPath = resolve(outputDirectory, `${id}.html`);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, buildSheet({ id, photoPath, scoreSvg, sourceAbc, renderedAbc }), 'utf8');
  console.log(`Wrote ${outputPath}`);
  console.log(`Photo linked directly from ${basename(photoPath)}; no photo copy was made.`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
