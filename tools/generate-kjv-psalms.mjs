import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const scratch = resolve(root, 'temp', 'psalter-work', 'kjv-import');
const zipPath = resolve(scratch, 'eng-kjv2006_usfx.zip');
const textPath = resolve(scratch, 'eng-kjv2006_usfx.xml');
// The Psalter generator replaces src/data/generated wholesale. Keep this
// independent Bible asset in its own directory so normal builds retain it.
const outputPath = resolve(root, 'src', 'data', 'psalms', 'kjvPsalms.json');
const sourceUrl = 'https://ebible.org/Scriptures/eng-kjv2006_usfx.zip';
const sourceSha256 = '4ffc59aee7be6eac10ef274e1b4e245e4e720c86ede556d986216d32078e4c7d';
const expectedVerseCounts = JSON.parse(
  await readFile(resolve(root, 'src', 'data', 'kjvPsalmVerseCounts.json'), 'utf8'),
);

await mkdir(scratch, { recursive: true });
await mkdir(dirname(outputPath), { recursive: true });

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`eBible download failed: HTTP ${response.status}`);
const archive = new Uint8Array(await response.arrayBuffer());
const actualSha256 = createHash('sha256').update(archive).digest('hex');
if (actualSha256 !== sourceSha256) {
  throw new Error(`eBible source archive changed (${actualSha256}); review its text and rights before updating the pinned SHA-256.`);
}
await writeFile(zipPath, archive);

// USFX keeps the unnumbered Psalm superscriptions (`<d>`) separate from numbered
// verses (`<v>`). `tar` avoids adding an importer dependency.
const usfx = execFileSync('tar', ['-xOf', zipPath, 'eng-kjv2006_usfx.xml'], {
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
});
await writeFile(textPath, usfx, 'utf8');

const psalms = Array.from({ length: 150 }, (_, index) => ({ number: index + 1, verses: [] }));
const decodeXml = (text) => text
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");
const normalize = (parts) => parts.join('')
  .replace(/\s+/g, ' ')
  .replace(/\s+([,.;:!?])/g, '$1')
  .trim();

let currentBook = '';
let currentPsalm = 0;
let currentVerse;
let currentHeading;
let skippingFootnote = false;
const tokenPattern = /<[^>]+>|[^<]+/g;
for (const match of usfx.matchAll(tokenPattern)) {
  const token = match[0];
  if (!token.startsWith('<')) {
    if (!skippingFootnote) {
      if (currentVerse) currentVerse.parts.push(decodeXml(token));
      else if (currentHeading) currentHeading.parts.push(decodeXml(token));
    }
    continue;
  }

  if (/^<f\b/.test(token)) { skippingFootnote = true; continue; }
  if (/^<\/f\s*>/.test(token)) { skippingFootnote = false; continue; }
  if (skippingFootnote) continue;

  if (/^<book\b/.test(token)) {
    currentBook = /\bid="([^"]+)"/.exec(token)?.[1] ?? '';
    currentPsalm = 0;
  } else if (/^<c\b/.test(token) && currentBook === 'PSA') {
    currentPsalm = Number(/\bid="(\d+)"/.exec(token)?.[1] ?? 0);
  } else if (/^<d\b/.test(token) && currentBook === 'PSA' && currentPsalm > 0 && !currentVerse) {
    currentHeading = { psalm: currentPsalm, parts: [] };
  } else if (/^<\/d\s*>/.test(token) && currentHeading) {
    const title = normalize(currentHeading.parts);
    if (title && currentHeading.psalm >= 1 && currentHeading.psalm <= 150) {
      const psalm = psalms[currentHeading.psalm - 1];
      if (psalm.verses.length === 0) psalm.title = title;
    }
    currentHeading = undefined;
  } else if (/^<v\b/.test(token) && currentBook === 'PSA') {
    const id = Number(/\bid="(\d+)"/.exec(token)?.[1] ?? 0);
    const bcv = /\bbcv="PSA\.(\d+)\.(\d+)"/.exec(token);
    if (bcv) {
      const psalmNumber = Number(bcv[1]);
      const verseNumber = Number(bcv[2]);
      if (psalmNumber >= 1 && psalmNumber <= 150 && verseNumber === id) {
        currentPsalm = psalmNumber;
        currentVerse = { psalm: psalmNumber, number: verseNumber, parts: [] };
      }
    }
  } else if (/^<ve\s*\/>/.test(token) && currentVerse) {
    const text = normalize(currentVerse.parts);
    psalms[currentVerse.psalm - 1].verses.push({ number: currentVerse.number, text });
    currentVerse = undefined;
  }
}

if (expectedVerseCounts.length !== 150 || psalms.length !== 150) {
  throw new Error(`Expected 150 Psalms and verse counts; got ${psalms.length} Psalms and ${expectedVerseCounts.length} counts.`);
}
for (const [index, psalm] of psalms.entries()) {
  if (psalm.verses.length !== expectedVerseCounts[index]) {
    throw new Error(
      `Psalm ${psalm.number}: expected ${expectedVerseCounts[index]} verses, got ${psalm.verses.length}.`,
    );
  }
  for (const [verseIndex, verse] of psalm.verses.entries()) {
    if (verse.number !== verseIndex + 1 || !verse.text) {
      throw new Error(`Psalm ${psalm.number} has a missing or malformed verse at ${verseIndex + 1}.`);
    }
  }
}

await writeFile(outputPath, `${JSON.stringify(psalms)}\n`, 'utf8');
console.log(`Wrote ${outputPath} (${psalms.length} Psalms, ${psalms.reduce((n, p) => n + p.verses.length, 0)} verses).`);
