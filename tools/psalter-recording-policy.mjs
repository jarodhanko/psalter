import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseSync } from 'vite';

// Independently pinned to the 2026-10-05 direct-page audit. Updating the JSON
// alone must never authorize a different number/recording pair. See provenance.
export const PSALTER_RECORDING_COUNT = 93;
export const PSALTER_RECORDING_PAIRS_SHA256 = '216446ab0e0b7efd038bde1e7ddabac89ed7315e4b92cb355b0da4a3bc82e2a5';

export function validatePsalterRecordingMap(recordings, catalogNumbers) {
  if (!recordings || Array.isArray(recordings) || typeof recordings !== 'object') {
    throw new Error('Psalter recordings must be a number-to-URL object');
  }
  const entries = Object.entries(recordings);
  if (entries.length !== PSALTER_RECORDING_COUNT) throw new Error(`Expected exactly ${PSALTER_RECORDING_COUNT} Psalter recording pairs`);
  const catalog = new Set(catalogNumbers);
  const approvedUrls = new Set();
  for (const [number, url] of entries) {
    if (!/^[1-9]\d*$/.test(number) || String(Number(number)) !== number || !Number.isSafeInteger(Number(number))) {
      throw new Error(`Noncanonical Psalter recording number: ${number}`);
    }
    if (!catalog.has(Number(number))) throw new Error(`Psalter recording ${number} is absent from the actual catalog`);
    if (typeof url !== 'string' || /^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/.exec(url)?.[0] !== url) {
      throw new Error(`Invalid complete Spotify track URL for Psalter ${number}`);
    }
    if (approvedUrls.has(url)) throw new Error(`Duplicate Spotify recording URL for Psalter ${number}`);
    approvedUrls.add(url);
  }
  const pairs = entries.sort(([left], [right]) => Number(left) - Number(right))
    .map(([number, url]) => `${number}=${url}`).join('\n');
  const digest = createHash('sha256').update(pairs).digest('hex');
  if (digest !== PSALTER_RECORDING_PAIRS_SHA256) throw new Error('Psalter recording number/URL pairs do not match the audited SHA256');
  return approvedUrls;
}

// JSON.parse alone silently collapses duplicate keys before the pair hash.
export function parsePsalterRecordingMap(text) {
  const recordings = JSON.parse(text);
  if (!recordings || Array.isArray(recordings) || typeof recordings !== 'object') return recordings;
  const source = parseSync('recordings.js', `const recordings = ${text};`);
  if (source.errors.length) throw new Error('Cannot parse the raw Psalter recording map');
  const keys = source.program.body[0].declarations[0].init.properties.map(property => property.key.value);
  if (new Set(keys).size !== keys.length) throw new Error('Duplicate raw Psalter recording number');
  return recordings;
}

export async function readPsalterRecordingPolicy(root) {
  const recordings = parsePsalterRecordingMap(await readFile(resolve(root, 'src/data/psalterRecordings.json'), 'utf8'));
  const metadata = await readFile(resolve(root, 'src/data/generated/legacyPsalterMetadata.ts'), 'utf8');
  const catalogLiteral = metadata.match(/legacyPsalterMetadata[^=]*=\s*(\[[\s\S]*\]);\s*$/)?.[1];
  if (!catalogLiteral) throw new Error('Cannot read the actual Psalter catalog for recording validation');
  return validatePsalterRecordingMap(recordings, JSON.parse(catalogLiteral).map(song => song.number));
}

/** Only complete, unescaped JavaScript strings or no-substitution templates
 * can consume approved URLs. Rolldown emits the audited map using backticks.
 * Raw source equality rejects escapes, prefixes and suffixes; AST context
 * rejects interpolation, tags, composition, comments and regexes.
 * Files without Spotify references need no parsing.
 * Non-app text and service workers pass allowApproved=false, without exception.
 */
export function inspectSpotifyReferences(text, approvedUrls, { allowApproved = true } = {}) {
  const emittedUrls = new Set();
  const spotifyReference = /spotify(?:\.[a-z0-9-]+)+\b|spotify:/i;
  if (!spotifyReference.test(text)) return { emittedUrls, hasUnapprovedReference: false };
  if (!allowApproved) return { emittedUrls, hasUnapprovedReference: true };
  const source = parseSync('application.js', text);
  if (source.errors.length) return { emittedUrls, hasUnapprovedReference: true };
  const spans = [];
  const visit = (node, composed = false) => {
    const plainTemplate = node.type === 'TemplateLiteral'
      && node.expressions.length === 0 && node.quasis.length === 1;
    composed ||= (node.type === 'TemplateLiteral' && !plainTemplate) || node.type === 'TaggedTemplateExpression'
      || (node.type === 'BinaryExpression' && node.operator === '+')
      || (node.type === 'AssignmentExpression' && node.operator === '+=')
      || node.type === 'MemberExpression';
    if (!composed && ((node.type === 'Literal' && typeof node.value === 'string') || plainTemplate)) {
      const start = node.start;
      const literal = text.slice(start, node.end);
      const url = literal.slice(1, -1);
      if (approvedUrls.has(url)) {
        emittedUrls.add(url);
        spans.push([start, node.end]);
      }
    }
    for (const child of Object.values(node)) {
      if (Array.isArray(child)) {
        for (const entry of child) if (entry && typeof entry.type === 'string') visit(entry, composed);
      } else if (child && typeof child.type === 'string') visit(child, composed);
    }
  };
  visit(source.program);
  let residual = '';
  let cursor = 0;
  for (const [start, end] of spans.sort(([left], [right]) => left - right)) {
    residual += text.slice(cursor, start) + '""';
    cursor = end;
  }
  residual += text.slice(cursor);
  return { emittedUrls, hasUnapprovedReference: spotifyReference.test(residual) };
}

export function validatePsalterRecordingEmission(approvedUrls, emittedUrls) {
  if (approvedUrls.size !== emittedUrls.size || [...approvedUrls].some(url => !emittedUrls.has(url))) {
    throw new Error('Emitted Psalter recording URL set does not equal the complete audited map');
  }
}
