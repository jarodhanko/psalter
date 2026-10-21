import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const license = (await read('LICENSE')).trim();
const scope = await read('LICENSE-SCOPE.md');
const runtimeNotices = await read('public/THIRD_PARTY_NOTICES.txt');
const repositoryNotices = await read('THIRD_PARTY_NOTICES.md');
assert.ok(license.startsWith('MIT License\n'), 'Original application license must be identified as MIT');
assert.ok(runtimeNotices.includes(license), 'The complete original-code MIT notice must ship with the offline application');
assert.ok(scope.includes('[MIT License](LICENSE)'), 'The separate scope statement must link the original-code license');
assert.ok(runtimeNotices.includes("The project's MIT grant does not cover musical works"), 'Runtime notices must retain the code/content scope distinction');
for (const metadata of [JSON.parse(await read('package.json')), JSON.parse(await read('package-lock.json')).packages['']]) {
  assert.equal(metadata.license, 'SEE LICENSE IN LICENSE-SCOPE.md', 'Package metadata must not imply that MIT relicenses the content');
}

// These separately licensed audio assets must retain both the original source
// notice and the immediate export's attribution/license. The project MIT grant
// does not replace either of them.
const normalizeWhitespace = text => text.replace(/\s+/g, ' ').trim();
const fluidMitNotice = `Copyright (c) 2000-2002, 2008 Frank Wen <getfrank@gmail.com>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.`;
for (const [label, notices] of [['repository', repositoryNotices], ['runtime', runtimeNotices]]) {
  assert.ok(normalizeWhitespace(notices).includes(normalizeWhitespace(fluidMitNotice)), `${label}: complete original FluidR3 Frank Wen MIT notice is required`);
  assert.ok(notices.includes('https://creativecommons.org/licenses/by/3.0/us/'), `${label}: FluidR3 MP3 export CC BY 3.0 US license link is required`);
  assert.ok(notices.includes('https://creativecommons.org/licenses/by/3.0/'), `${label}: Salamander CC BY 3.0 Unported license link is required`);
  assert.ok(notices.includes('Salamander Grand Piano by Alexander Holm'), `${label}: Salamander creator attribution is required`);
  assert.ok(notices.includes('https://rytmenpinne.wordpress.com/sounds-and-such/salamander-grandpiano/'), `${label}: Salamander creator source link is required`);
  assert.ok(notices.includes('pitch-shifted intervening notes with SoundStretch'), `${label}: upstream Salamander adaptations must be identified`);
  assert.ok(!notices.includes('2022-04-03'), `${label}: do not convert the creator's ambiguous 4.3.2022 date to an unverified ISO date`);
}

console.log('License notices: original-code MIT, separate code/content scope, FluidR3 MIT/CC BY, and Salamander CC BY attribution retained.');
