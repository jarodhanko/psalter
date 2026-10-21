import { extractUnderlayModel } from '../../domain/underlayIdentity';

/** RFPA page 151 prints five verses on one shared interstaff carrier. Tenor
 * rests during the middle phrase; Bass continues singing. This exact witness
 * qualifies presentation only, never canonical music or playback. */
const sourceWitness = `T:The Righteous and the Evil-Doer
C:Tune: RAPTURE; Edward Harwood
M:2/2
L:1/4
K:Ab
%%score (T1 T2) (B1 B2)
%%stretchlast 1
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
[V:T1] A | A2 E2 | (F3/2 G/) A2 | B2 (A G) | A3 || c | B2 A2 | (G B) (c A) | G2 F2 | E3 ||
w: The wick-ed, watch- * ing for their * prey, De-sire the right- * eous * man to slay,
w: Wait on the Lord * and keep His * way; He will ex-alt * thee, * nor de-lay
w: The wick-ed in * great pow'r are * seen, Like spread-ing tree * with * fo-liage green
w: Mark thou the up- * right day by * day, Be-hold the per- * fect * in his way;
w: Sal-va-tion is * from God a- * lone, Whom as their cov- * ert * saints have known
[V:T2] E | E2 E2 | (D3/2 E/) E2 | F2 E2 | E3 || E | E2 =D2 | E2 (E F) | E2 =D2 | E3 ||
[V:B1] C | C2 A,2 | (A,3/2 B,/) A,2 | (F, D) (C B,) | C3 || A, | B,2 B,2 | (B, G,) (A, C) | B,2 A,2 | G,3 ||
w: The wick-ed, watch- * ing for * their * prey, De-sire the right- * eous * man to slay,
w: Wait on the Lord * and keep * His * way; He will ex-alt * thee, * nor de-lay
w: The wick-ed in * great pow'r * are * seen, Like spread-ing tree * with * fo-liage green
w: Mark thou the up- * right day * by * day, Be-hold the per- * fect * in his way;
w: Sal-va-tion is * from God * a- * lone, Whom as their cov- * ert * saints have known
[V:B2] A,, | A,,2 C,2 | D,2 C,2 | D,2 E,2 | A,,3 || A, | G,2 F,2 | E,2 A,,2 | B,,2 B,,2 | E,3 ||
[V:T1] E | A2 E2 | F2 G2 | A4 || z2 e2 | (e3/2 f/) e d | c2 c2 | (d3/2 e/) d c | B3 ||
w: But God is on his side; He will * * not leave him in * * their hands,
w: To give the land to thee; And when * * the wick-ed are * * cut off,
w: That grows in na-tive ground. I looked * * a-gain, they were * * no more;
w: His jour-ney ends in peace. De-stroyed * * at once shall reb- * * els be;
w: When by sore troub-les tried; The Lord * * Who helped in troub- * * les past
[V:T2] E | A2 E2 | F2 E2 | E4 || x2 c2 | (c3/2 d/) c B | A2 A2 | (B3/2 c/) B A | G3 ||
[V:B1] E, | A,2 E,2 | F,2 B,2 | C4 || z4 | z4 | z4 | z4 | z3 ||
w: But God is on his side;
w: To give the land to thee;
w: That grows in na-tive ground.
w: His jour-ney ends in peace.
w: When by sore troub-les tried;
[V:B2] E, | A,2 E,2 | F,2 E,2 | A,,4 || z2 A,2 | A,3 A, | A,2 A,,2 | E,3 E, | E,3 ||
[V:T1] B | c2 B2 | c2 B2 | c2 =d2 | e3 || d | (c B c) d | c2 B2 | A3 |]
w: Nor count him guilt-y when he stands In judg- * * ment to be tried.
w: The wick-ed who a-gainst thee scoff, Their judg- * * ment thou shalt see.
w: I sought the men so proud be-fore, But they * * could not be found.
w: Cut off from all pos-ter-i-ty, Their ver- * * y name shall cease.
w: Will save them to the ver-y last, For they * * in Him con-fide.
[V:T2] E | E2 E2 | E2 E2 | E2 A2 | G3 || E | E3 F | E2 [EG]2 | E3 |]
[V:B1] G, | A,2 B,2 | A,2 G,2 | A,2 B,2 | B,3 || B, | (A, B, A,) A, | A,2 D2 | C3 |]
w: Nor count him guilt-y when he stands In judg- * * ment to be tried.
w: The wick-ed who a-gainst thee scoff, Their judg- * * ment thou shalt see.
w: I sought the men so proud be-fore, But they * * could not be found.
w: Cut off from all pos-ter-i-ty, Their ver- * * y name shall cease.
w: Will save them to the ver-y last, For they * * in Him con-fide.
[V:B2] E, | A,2 G,2 | A,2 E,2 | A,2 F,2 | E,3 || E, | (A, G, A,) D, | E,2 E,2 | A,,3 |]`;

/** Alternate carriers were transferred only to matching source note onsets.
 * Every source syllable has a slot; no notes, rests or ties are synthesized. */
const alternateRows: Record<string, string[][]> = {
  "T2": [
    [
      "The wick- ed, watch- * ing for their prey, De- sire the right- eous * man to slay,",
      "Wait on the Lord * and keep His way; He will ex- alt thee, * nor de- lay",
      "The wick- ed in * great pow'r are seen, Like spread- ing tree with * fo- liage green",
      "Mark thou the up- * right day by day, Be- hold the per- fect * in his way;",
      "Sal- va- tion is * from God a- lone, Whom as their cov- ert * saints have known"
    ],
    [
      "But God is on his side; * He will * * not leave him in * * their hands,",
      "To give the land to thee; * And when * * the wick- ed are * * cut off,",
      "That grows in na- tive ground. * I looked * * a- gain, they were * * no more;",
      "His jour- ney ends in peace. * De- stroyed * * at once shall reb- * * els be;",
      "When by sore troub- les tried; * The Lord * * Who helped in troub- * * les past"
    ],
    [
      "Nor count him guilt- y when he stands In judg- ment to be tried.",
      "The wick- ed who a- gainst thee scoff, Their judg- ment thou shalt see.",
      "I sought the men so proud be- fore, But they could not be found.",
      "Cut off from all pos- ter- i- ty, Their ver- y name shall cease.",
      "Will save them to the ver- y last, For they in Him con- fide."
    ]
  ],
  "B2": [
    [
      "The wick- ed, watch- ing for their prey, De- sire the right- eous man to slay,",
      "Wait on the Lord and keep His way; He will ex- alt thee, nor de- lay",
      "The wick- ed in great pow'r are seen, Like spread- ing tree with fo- liage green",
      "Mark thou the up- right day by day, Be- hold the per- fect in his way;",
      "Sal- va- tion is from God a- lone, Whom as their cov- ert saints have known"
    ],
    [
      "But God is on his side; * He will not leave him in their hands,",
      "To give the land to thee; * And when the wick- ed are cut off,",
      "That grows in na- tive ground. * I looked a- gain, they were no more;",
      "His jour- ney ends in peace. * De- stroyed at once shall reb- els be;",
      "When by sore troub- les tried; * The Lord Who helped in troub- les past"
    ],
    [
      "Nor count him guilt- y when he stands In judg- * * ment to be tried.",
      "The wick- ed who a- gainst thee scoff, Their judg- * * ment thou shalt see.",
      "I sought the men so proud be- fore, But they * * could not be found.",
      "Cut off from all pos- ter- i- ty, Their ver- * * y name shall cease.",
      "Will save them to the ver- y last, For they * * in Him con- fide."
    ]
  ]
};

function sourceRows(abc: string): Record<string, string[][]> {
  const rows: Record<string, string[][]> = {};
  let voice = '', segment = -1;
  const next = new Map<string, number>();
  for (const line of abc.split(/\r?\n/)) {
    const music = /^\[V:([^\]]+)\] /.exec(line);
    if (music) {
      voice = music[1];
      segment = next.get(voice) ?? 0;
      next.set(voice, segment + 1);
    } else if (/^w:/.test(line)) {
      ((rows[voice] ??= [])[segment] ??= []).push(line.replace(/^w:\s*/, ''));
    }
  }
  return rows;
}
const canonicalRows = sourceRows(sourceWitness);

export function hasPsalter99CarrierSource(songId: string, abc: string): boolean {
  return songId === 'psalter99' && abc.replace(/\r\n/g, '\n') === sourceWitness;
}

/** Number only the initial reviewed blocks, before stanza grouping/filtering.
 * Continuations keep their source text and inherit each verse's identity. */
export function withPsalter99StanzaIdentities(songId: string, abc: string): string {
  if (!hasPsalter99CarrierSource(songId, abc)) return abc;
  let voice = '', row = 0;
  const next = new Map<string, number>();
  let segment = -1;
  return abc.split(/\r?\n/).map(line => {
    const music = /^\[V:([^\]]+)\] /.exec(line);
    if (music) {
      voice = music[1];
      segment = next.get(voice) ?? 0;
      next.set(voice, segment + 1);
      row = 0;
    } else if (/^w:/.test(line) && segment === 0) {
      return line.replace(/^w:\s*/, `w:${++row}.~`);
    }
    return line;
  }).join('\n');
}

/** Apply before selectScoreVoices so generic same-staff donor transfer cannot
 * borrow Tenor's rest-aware partial text for the sounding Bass. The active
 * flag must be bound to the pristine source before notation transforms.
 * Admit only complete selected stanza vectors from that reviewed source;
 * repeated words alone never authorize removing a lyric row.
 */
export function presentPsalter99Carrier(
  abc: string, visibleVoiceIds: readonly string[], active: boolean,
): string {
  if (!active) return abc;
  const carrier = ['T1', 'T2', 'B2', 'B1'].find(id => visibleVoiceIds.includes(id));
  if (!carrier) return abc;
  const model = extractUnderlayModel(abc);
  const numbers = model.stanzaNumbers;
  if (model.ambiguous || !numbers.length || numbers.some(number => number < 1 || number > 5) ||
      model.rows.length !== numbers.length * 6) return abc;
  for (const voice of ['T1', 'B1']) for (let segment = 0; segment < 3; segment++) {
    for (const number of numbers) {
      const expected = `${segment === 0 ? `${number}.~` : ''}${canonicalRows[voice][segment][number - 1]}`;
      const rows = model.rows.filter(row => row.voiceId === voice && row.musicSegment === segment && row.stanzaNumber === number);
      if (rows.length !== 1 || rows[0].sourceText !== expected) return abc;
    }
  }
  const rows = canonicalRows[carrier] ?? alternateRows[carrier];
  const carrierLines = abc.split(/\r?\n/).filter(line => line.startsWith(`[V:${carrier}] `));
  if (carrierLines.length !== rows.length) return abc;
  // RFPA151's upper half rest at q45 is shared by Soprano and Alto.
  // When Alto carries alone, expose that exact rest, including learner E-flat.
  // The existing lyric * consumes this rest without shifting a source word.
  const sharedUpperRest = /(\| _?E4 \|\| )x2(?= c2 \|)/g;
  if (carrier === 'T2' && carrierLines[1].match(sharedUpperRest)?.length !== 1) return abc;
  let segment = -1;
  return abc.split(/\r?\n/).flatMap(line => {
    if (/^\s*w:/.test(line)) return [];
    const music = /^\[V:([^\]]+)\] /.exec(line);
    if (music?.[1] !== carrier) return [line];
    segment++;
    const carrierLine = carrier === 'T2' && segment === 1 ? line.replace(sharedUpperRest, '$1z2') : line;
    return [carrierLine, ...numbers.map(number => `w:${segment === 0 ? `${number}.~` : ''}${rows[segment][number - 1]}`)];
  }).join('\n');
}

/** Reconstruct all five complete poems from the printed Soprano carrier.
 * The lower rest-aware realization is not a second poem or a missing verse. */
export function reconstructPsalter99Transcript(songId: string, abc: string): readonly string[] | undefined {
  if (!hasPsalter99CarrierSource(songId, abc)) return undefined;
  return [1, 2, 3, 4, 5].map(number =>
    `${number}. ${canonicalRows.T1.map(segment => segment[number - 1]).join(' ')}`);
}
