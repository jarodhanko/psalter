import { extractUnderlayModel } from '../../domain/underlayIdentity';
import { hasPsalter226KeySignatureSource } from './keySignatures226';

// RFPA PDF page 337 and the original 1912 score: q0–32 is one unison
// voice over organ. The six ABC lanes are not six continuous singers.
// The key helper's existing exact full-source witness also covers these words
// and roles. Bind before stanza selection, using its prepared notation frame.
const sourceRows = [
  [
    "1.~O Lord of Hosts, to Thee I cry, Our fa-thers' God, to Thee; Let my pe-ti-tion",
    '2.~A sin-gle day with-in Thy courts, Where I Thy beau-ty see, Is bet-ter than a',
    '3.~A sun and shield is God, the Lord, To light-en and de-fend; The Lord to such as',
  ],
  [
    'reach Thy ear, My prayer ac-cept-ed be; O _ God our shield, look Thou on us, Re-',
    'thou-sand days, My God, a-part from Thee. A _ low-ly sta-tion in Thy house Were',
    'look to Him Will grace and glo-ry send; To _ those that walk in right-eous-ness No',
  ],
  [
    'veal Thy-self in grace, And let Thy own a-noint-ed one Be-hold Thee face to face.',
    'dear-er to my heart Than in the tents of wick-ed-ness To claim the chief-est part.',
    'good will He de-ny; O Lord of Hosts, how blest are they Who on Thy grace re-ly.',
  ],
] as const;

const harmonyRows = [
  'God our shield, look Thou on us, Re-',
  'low-ly sta-tion in Thy house Were',
  'those that walk in right-eous-ness No',
] as const;
const harmonyPickup = ['O', 'A', 'To'] as const;
const tenorFinalRows = [
  'veal Thy- * self in grace, And let Thy own a-noint-ed one Be-hold Thee face to face.',
  'dear-er * to my heart Than in the tents of wick-ed-ness To claim the chief-est part.',
  'good will * He de-ny; O Lord of Hosts, how blest are they Who on Thy grace re-ly.',
] as const;

export interface Psalter226CarrierSource { readonly frame: string }
const reviewedSources = new WeakSet<Psalter226CarrierSource>();
const withoutUnderlay = (abc: string) => abc.split(/\r?\n/).filter(line => !/^\s*w:/.test(line)).join('\n');

/** Bind the original canonical source separately from its actual prepared
 * display frame. The caller supplies notationAbc(renderingAbc), where
 * renderingAbc is the reviewed key helper's output (or the unchanged source).
 * This does not compare transposed music to the original pitch spellings.
 */
export function bindPsalter226CarrierSource(
  songId: string, canonicalAbc: string, preparedNotationAbc: string,
): Psalter226CarrierSource | undefined {
  if (!hasPsalter226KeySignatureSource(songId, canonicalAbc)) return undefined;
  const source = Object.freeze({ frame: withoutUnderlay(preparedNotationAbc) });
  reviewedSources.add(source);
  return source;
}

/** Complete the selected vocal carrier on its own source attacks, before
 * learner accidentals and selectScoreVoices. Never use this presentation as
 * canonical/playback ABC. The exact prepared frame must remain unchanged.
 * Grouping and print filtering have already selected complete source stanza
 * vectors. Verify all their exact rows before supplying any alternative.
 * The caller disables generic lyric borrowing for this exact source even
 * when validation fails, so an organ-only lane never acquires sung words.
 */
export function presentPsalter226Carrier(
  abc: string, visibleVoiceIndexes: readonly number[], source?: Psalter226CarrierSource,
): string {
  if (!source || !reviewedSources.has(source) || withoutUnderlay(abc) !== source.frame) return abc;
  const ids = [...new Set(abc.split(/\r?\n/).flatMap(line => /^V:([^\s]+)/.exec(line)?.[1] ?? []))];
  const visibleVoiceIds = visibleVoiceIndexes.map(index => ids[index]).filter(Boolean);
  if (visibleVoiceIds.includes('T1')) return abc;
  const model = extractUnderlayModel(abc);
  const numbers = model.stanzaNumbers;
  const lines = abc.split(/\r?\n/);
  if (model.ambiguous || !numbers.length || numbers.some((number, index) =>
      number < 1 || number > 3 || (index > 0 && number <= numbers[index - 1])) ||
      model.rows.length !== numbers.length * 3 ||
      lines.filter(line => /^\s*w:/.test(line)).length !== model.rows.length) return abc;
  for (let segment = 0; segment < 3; segment++) for (const number of numbers) {
    const rows = model.rows.filter(row => row.voiceId === 'T1' &&
      row.musicSegment === segment && row.stanzaNumber === number);
    if (rows.length !== 1 || rows[0].sourceText !== sourceRows[segment][number - 1]) return abc;
  }
  // Retain the original six-lane, three-block structure. Pitch-only notation
  // transforms may change spellings, but not these source bar boundaries.
  for (const voiceId of ['T1', 'T2', 'T3', 'B1', 'B2', 'B3']) {
    const music = lines.filter(line => line.startsWith(`[V:${voiceId}] `));
    if (music.length !== 3 || music.some(line => (line.match(/\|(?:\||\])?/g) ?? []).length !== 8)) return abc;
  }
  // B1 owns the complete harmony pickup. T2 and B2 first sing at q33.
  // T3/B3 are organ-only throughout and are never lyric recipients.
  const carrier = ['B1', 'T2', 'B2'].find(voiceId => visibleVoiceIds.includes(voiceId));
  let segment = -1;
  return lines.flatMap(line => {
    if (/^\s*w:/.test(line)) return [];
    if (!carrier || !line.startsWith(`[V:${carrier}] `)) return [line];
    segment++;
    if (segment === 0) return [line];
    const rows = numbers.map(number => {
      if (segment === 1) {
        // Skip the four pre-harmony source bars, including their rests/ties.
        // Normal word attachment passes over T2/B2's silent q32 pickup.
        // Do not leave a fifth bar skip pending at the inline key: ABCJS
        // would attach a blank lyric property to that source-owned key.
        const pickup = carrier === 'B1' ? `${harmonyPickup[number - 1]} ` : '';
        return `w:| | | | ${number}.~${pickup}${harmonyRows[number - 1]}`;
      }
      // B1's q42 syllable spans two eighth heads; q42.5 is continuation.
      return `w:${carrier === 'B1' ? tenorFinalRows[number - 1] : sourceRows[2][number - 1]}`;
    });
    return [line, ...rows];
  }).join('\n');
}
