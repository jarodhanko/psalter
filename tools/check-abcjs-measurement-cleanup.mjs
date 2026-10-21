// Optional, bounded diagnostic. Synthetic geometry proves ownership/cleanup,
// not browser memory usage or the cause of Chromium Error 9.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('../', import.meta.url));
const sha256 = (text) => createHash('sha256').update(text).digest('hex');
const [dependency, kind, geometry] = process.argv.slice(2);

if (dependency) {
  const dom = new JSDOM('<!doctype html><body><div id="score"></div></body>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
  dom.window.SVGElement.prototype.getBBox = function () {
    return geometry.startsWith('zero') || (geometry === 'detached-zero' && !this.isConnected)
      ? { x: 0, y: 0, width: 0, height: 0 }
      : { x: 0, y: 0, width: Math.max(1, this.textContent.length * 7), height: 16 };
  };
  const abcjs = require(join(dependency, 'index.js'));
  const Controller = require(join(dependency, 'src/write/engraver-controller.js'));
  const failure = new Error('Injected measurement failure');
  const getMeasureWidths = Controller.prototype.getMeasureWidths;
  const measurementControllers = [];
  Controller.prototype.getMeasureWidths = function (...args) {
    measurementControllers.push(this);
    const result = getMeasureWidths.apply(this, args);
    if (geometry.endsWith('-throw')) throw failure;
    return result;
  };
  if (geometry === 'constructor-throw') {
    Controller.prototype.reset = function () { throw failure; };
  }
  // Similar-looking nodes not owned by the measurement must never be removed.
  const unrelatedSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const unrelatedDiv = document.createElement('div');
  unrelatedDiv.style.visibility = 'hidden';
  document.body.append(unrelatedSvg, unrelatedDiv);
  const host = kind === 'wrap-detached' ? document.createElement('div') : document.getElementById('score');
  const witness = readFileSync(join(root, 'src/features/viewer/completeInTheeWrap.ts'), 'utf8');
  const source = JSON.parse(witness.match(/const sourceWitness = ("(?:\\.|[^"\\])*");/)[1]);
  const abc = source.replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '')
    .replace(/^V:[^\r\n]*$/gm, (line) => line.replace(/\s+(?:name|subname|nm|snm)=(?:"[^"]*"|'[^']*'|[^\s]+)/g, ''));
  const options = { staffwidth: 220, oneSvgPerLine: true, wrap: { minSpacing: 1.5, maxSpacing: 2.7 } };
  const samples = [];
  for (let iteration = 0; iteration < 3; iteration++) {
    let result;
    let error;
    try {
      if (kind === 'metrics') result = abcjs.tuneMetrics(abc, { staffwidth: 220 });
      else if (kind === 'direct') {
        const controller = new Controller(host, options);
        result = controller.getMeasureWidths(abcjs.parseOnly(abc)[0]);
      } else {
        const tunes = abcjs.renderAbc(host, abc, options);
        result = { count: tunes.length, explanation: tunes.map((tune) => tune.explanation), html: host.innerHTML };
      }
    } catch (caught) {
      assert.equal(caught, failure, 'Original exception identity must be preserved');
      error = caught.message;
    }
    assert.ok(unrelatedSvg.isConnected && unrelatedDiv.isConnected, 'Unrelated nodes must survive');
    assert.equal(host.isConnected, kind !== 'wrap-detached', 'The supplied host must survive');
    samples.push({
      bodySvg: document.querySelectorAll('body > svg').length - 1,
      hiddenDiv: [...document.body.children].filter((node) => node.tagName === 'DIV' && node.style.visibility === 'hidden').length - 1,
      resultHash: result === undefined ? null : sha256(JSON.stringify(result)),
      error: error ?? null,
      dummyVisible: Boolean(measurementControllers.at(-1)?.renderer.paper.dummySvg),
      dummyConnected: Boolean(measurementControllers.at(-1)?.renderer.paper.dummySvg?.isConnected),
    });
  }
  console.log(JSON.stringify(samples));
  dom.window.close();
} else {
  const installed = join(root, 'node_modules/abcjs');
  const patch = JSON.parse(readFileSync(join(root, 'patches/abcjs-6.7.0-measurement-cleanup.json'), 'utf8'));
  const temporary = mkdtempSync(join(tmpdir(), 'psalter-abcjs-cleanup-'));
  try {
    const upstream = join(temporary, 'upstream');
    cpSync(installed, upstream, { recursive: true });
    for (const entry of patch.patches) {
      const target = join(upstream, entry.file);
      const patched = readFileSync(target, 'utf8');
      assert.equal(sha256(patched), entry.afterSha256, 'Run npm run patch:abcjs first');
      const original = patched.replace(entry.after, entry.before);
      assert.equal(sha256(original), entry.beforeSha256);
      writeFileSync(target, original);
    }
    const run = (directory, kind, geometry) => {
      const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), directory, kind, geometry], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr || result.stdout);
      return JSON.parse(result.stdout);
    };
    let scenarios = 0;
    for (const kind of ['metrics', 'wrap-attached', 'wrap-detached']) {
      for (const geometry of ['positive', 'zero', 'detached-zero', 'positive-throw', 'zero-throw', 'constructor-throw']) {
        const before = run(upstream, kind, geometry);
        const after = run(installed, kind, geometry);
        for (let index = 0; index < after.length; index++) {
          assert.equal(after[index].bodySvg, 0, `${kind}/${geometry}: leaked SVG`);
          assert.equal(after[index].hiddenDiv, 0, `${kind}/${geometry}: leaked hidden host`);
          assert.equal(after[index].resultHash, before[index].resultHash, `${kind}/${geometry}: changed result/render`);
          assert.equal(after[index].error, before[index].error, `${kind}/${geometry}: changed exception`);
          assert.equal(after[index].dummyConnected, false, `${kind}/${geometry}: attached measurement SVG`);
        }
        if (geometry.startsWith('zero') || (kind === 'wrap-detached' && geometry === 'detached-zero')) {
          assert.equal(before.at(-1).bodySvg, 3, 'Upstream control must reproduce the SVG leak');
        }
        if (kind === 'metrics' && geometry.endsWith('-throw')) {
          assert.equal(before.at(-1).hiddenDiv, 3, 'Upstream control must reproduce the hidden-host leak');
        }
        scenarios++;
        console.log(`PASS ${kind}/${geometry}: identical output/errors, no retained measurement DOM.`);
      }
    }
    // Keep the lower-level fallback signal intact for source-bound callers.
    const before = run(upstream, 'direct', 'zero');
    const after = run(installed, 'direct', 'zero');
    assert.deepEqual(after, before);
    assert.ok(after.every((sample) => sample.dummyVisible));
    console.log(`PASS ${scenarios} API scenarios × 3 repeats, plus unchanged direct-controller fallback signal.`);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}
