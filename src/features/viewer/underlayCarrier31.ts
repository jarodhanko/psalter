/** Source-bound Psalter 31 carrier presentation and isolated Tenor underlay. */
export interface Psalter31CarrierWitness {
  id: 'psalter31';
  sourceSha256: string;
  staff: string;
  headers: string[];
  declarations: Record<string, string>;
  music: Record<string, string[]>;
  lyrics: Record<string, string[]>;
  supplementalVoice: string;
  musicSegment: number;
  printedCarrierPriority: string[];
  displayRows: Record<string, string[]>;
  partialTenorRows: string[];
  sourceQualification: string;
}
interface Row { voiceId: string; musicSegment: number; stanzaNumber: number; sourceLineIndex: number; sourceText: string }
interface Model { rows: Row[]; stanzaNumbers: number[]; ambiguous: boolean }
type Extract = (abc: string) => Model;

/** Admit the original, complete four-part source only. Bind before transforms. */
export function hasPsalter31CarrierSource(songId: string, abc: string, witness: Psalter31CarrierWitness): boolean {
  if (songId !== witness.id || JSON.stringify(abc.split(/\r?\n/).map(line => line.trim()).filter(line => /^%%(?:score|staves)\b/.test(line))) !== JSON.stringify([witness.staff]) || /^\s*W:/m.test(abc)) return false;
  const music: Record<string, string[]> = {}, lyrics: Record<string, string[]> = {}, declarations: Record<string, string> = {};
  const headers: string[] = [];
  let voice = '', body = false;
  for (const line of abc.split(/\r?\n/)) {
    if (/^(?:M:|L:|K:)/.test(line)) headers.push(line);
    const match = /^V:([^\s]+)(.*)$/.exec(line);
    if (match) {
      voice = match[1]; body = !match[2].trim();
      if (!body) declarations[voice] = line;
      continue;
    }
    if (!body) continue;
    if (/^w:/.test(line)) { (lyrics[voice] ??= []).push(line); continue; }
    const content = line.trim();
    if (content && !/^%|^[A-Z]:/.test(content)) (music[voice] ??= []).push(content.replace(/\s+/g, ' '));
  }
  const ids = Object.keys(witness.declarations);
  return Object.keys(music).every(id => ids.includes(id)) &&
    Object.keys(lyrics).every(id => ids.includes(id)) &&
    JSON.stringify(headers) === JSON.stringify(witness.headers) &&
    JSON.stringify(Object.keys(declarations)) === JSON.stringify(ids) &&
    ids.every(id => declarations[id] === witness.declarations[id] &&
      JSON.stringify(music[id] ?? []) === JSON.stringify(witness.music[id]) &&
      JSON.stringify(lyrics[id] ?? []) === JSON.stringify(witness.lyrics[id]));
}

/** Keep the rest-aware bass data, but use one reviewed printed carrier when
 * another singing part is visible. Match role, segment, stanza and exact
 * reviewed transferred/source rows. Repeated text alone is never sufficient.
 */
export function presentPsalter31Carrier(
  selectedAbc: string, visibleVoiceIds: readonly string[],
  activeWitness: Psalter31CarrierWitness | undefined, extract: Extract,
): string {
  if (!activeWitness) return selectedAbc;
  // The old same-staff donor falls back to the resting Bass when Tenor is
  // isolated. Repair only the exact reviewed incomplete Tenor row, using the
  // full T1-to-Tenor source-onset transfer that already works in Tenor+Bass.
  if (visibleVoiceIds.length === 1 && visibleVoiceIds[0] === 'B1') {
    const model = extract(selectedAbc);
    if (model.ambiguous) return selectedAbc;
    const lines = selectedAbc.split(/\r?\n/);
    for (const row of model.rows) {
      if (row.voiceId === 'B1' && row.musicSegment === activeWitness.musicSegment &&
          row.sourceText === activeWitness.partialTenorRows[row.stanzaNumber - 1]) {
        lines[row.sourceLineIndex] = `w:${activeWitness.displayRows.B1[row.stanzaNumber - 1]}`;
      }
    }
    return lines.join('\n');
  }
  if (!visibleVoiceIds.includes(activeWitness.supplementalVoice)) return selectedAbc;
  const carrier = activeWitness.printedCarrierPriority.find(id => visibleVoiceIds.includes(id));
  if (!carrier) return selectedAbc;
  const model = extract(selectedAbc);
  if (model.ambiguous) return selectedAbc;
  const expectedBass = activeWitness.displayRows[activeWitness.supplementalVoice];
  const expectedCarrier = activeWitness.displayRows[carrier];
  const removable = model.rows.filter(row => row.voiceId === activeWitness.supplementalVoice &&
    row.musicSegment === activeWitness.musicSegment &&
    row.sourceText === expectedBass[row.stanzaNumber - 1] &&
    model.rows.some(other => other.voiceId === carrier && other.musicSegment === activeWitness.musicSegment &&
      other.stanzaNumber === row.stanzaNumber && other.sourceText === expectedCarrier[row.stanzaNumber - 1]));
  const indexes = new Set(removable.map(row => row.sourceLineIndex));
  return selectedAbc.split(/\r?\n/).filter((_, index) => !indexes.has(index)).join('\n');
}

/** The poem uses the full reviewed shared carrier, never the shortened
 * rest-aware Bass realization. Keep every lexical character and ABC syllable
 * marker for the existing transcript normalizer. This does not change the
 * notation or the inferred musical placement of stanzas 6–7. */
export function reconstructPsalter31Transcript(
  songId: string, abc: string, witness: Psalter31CarrierWitness, extract: Extract,
): readonly string[] | undefined {
  if (!hasPsalter31CarrierSource(songId, abc, witness)) return undefined;
  const model = extract(abc);
  if (model.ambiguous) return undefined;
  const rows = model.rows.filter(row => row.voiceId === 'T1');
  const expected = witness.displayRows.T1;
  if (rows.length !== expected.length || rows.some((row, index) =>
    row.musicSegment !== witness.musicSegment || row.stanzaNumber !== index + 1 || row.sourceText !== expected[index])) return undefined;
  return rows.map(row => row.sourceText);
}

/** The source has a single shared interstaff lyric carrier. Its Tenor sings
 * the complete phrase while Bass rests. Verses 6–7 retain the existing
 * inferred-placement qualification; this descriptor does not ratify it. */
export const psalter31UnderlayCarrier: Psalter31CarrierWitness = {
  "partialTenorRows": [
    "1.~Lord, hear the right, re- gard my cry, * My prayer from lips sin- cere; * Send Thy ap- prov- al from on high, My right- eous- ness make clear. * * * * * * * * * Nor found it turned from Thee a- side. *",
    "2.~With stead- fast cour- age I de- sign * No wrong to speak or do; * Thy path of life I choose for mine, And walk with pur- pose true. * * * * * * * * * As- sured that Thou wilt an- swer me. *",
    "3.~O Thou that ev- er sav- est those * Whose trust on Thee is stayed, * Pre- serv- ing them from all their foes By Thy al- might- y aid. * * * * * * * * * Thy won- drous mer- cy, full and free. *",
    "4.~O guard me well as one doth guard * The ap- ple of the eye; * While dead- ly foes are press- ing hard, To Thee, to Thee I cry. * * * * * * * * * O let Thy wings o'er- shad- ow me. *",
    "5.~My en- e- my, grown strong in pride, * Would take my life a- way, * A li- on lurk- ing by my side, Most greed- y for his prey. * * * * * * * * * From e- vil save me by Thy sword. *",
    "6.~De- fend me from the men of pride, * Whose por- tion is be- low, * Who, with life's treas- ures sat- is- fied, No bet- ter por- tion know; * * * * * * * * * Must leave them all when life is spent. *",
    "7.~When I in right- eous- ness at last * Thy glo- rious face shall see, * When all the wea- ry night is past, And I a- wake with Thee * * * * * * * * * Then, then I shall be sat- is- fied. *"
  ],
  "id": "psalter31",
  "sourceSha256": "3b64c6b3fed6611959ae6846e962a3949bf5616d9477b89da610d428ff50f7c9",
  "staff": "%%score (T1 T2)(B1 B2)",
  "headers": [
    "M:6/4",
    "L:1/4",
    "K:C"
  ],
  "declarations": {
    "T1": "V:T1 clef=treble name=\"Soprano\"",
    "T2": "V:T2 clef=treble name=\"Alto\"",
    "B1": "V:B1 clef=bass name=\"Tenor\"",
    "B2": "V:B2 clef=bass name=\"Bass\""
  },
  "music": {
    "T1": [
      "E/2F/2 | G2 G e2 d | (c B) A (G F) || E | A2 G (G F) E | (E3 D2) || E/2F/2 | G2 G e2 d | (c B) A (G E) || G | A2 d c2 B | c3-c2 || c | B2 c d2 c | (c B) c d2 || c/2B/2 | A2 A G2 c/2d/2 | e3 d3 | c3-c2 ||"
    ],
    "T2": [
      "C/2D/2 | E2 E G2 F | (E G) F (E D) || C | C2 C B,2 C | (C3 B,2) || C/2D/2 | E2 E G2 F | (E G) F (E C) || C | C2 F E2 D | E3-E2 || E | D2 E F2 E | (E D) E F2 || E | F2 F E2 G/2A/2 | G3 F3 | E3-E2 ||"
    ],
    "B1": [
      "C | C2 C C2 G, | G,2 C (C G,) || G, | F,2 G, G,2 G, | G,3-G,2 || G, | C2 C C2 G, | G,2 C C2 || G, | F,2 A, G,2 G, | G,3-G,2 || C | G,2 G, G,2 C | G,2 G, G,2 || C | C2 C C2 C | C3 B,3 | C3-C2 ||"
    ],
    "B2": [
      "C, | C,2 C, C,2 C, | C,2 C, C,2 || C, | F,2 E, D,2 C, | G,,3-G,,2 || C, | C,2 C, C,2 C, | C,2 C, C,2 || E, | F,2 D, G,2 G, | C,3-C,2 || z | z6 | z2 z z2 || C, | F,2 F, C2 E,/2F,/2 | G,3 G,,3 | C,3-C,2 ||"
    ]
  },
  "lyrics": {
    "T1": [
      "w:1.~Lord, * hear the right, re- gard * my cry, * My prayer from lips * sin- cere; * Send * Thy ap- prov- al from * on high, * My right- eous- ness make clear. * Thou in the night my heart * hast tried, Nor * found it turned from * Thee a- side. *",
      "w:2.~With * stead- fast cour- age I * de- sign * No wrong to speak * or do; * Thy * path of life I choose * for mine, * And walk with pur- pose true. * For help, O God, I cry * to Thee, As- * sured that Thou wilt * an- swer me. *",
      "w:3.~O * Thou that ev- er sav- * est those * Whose trust on Thee * is stayed, * Pre- * serv- ing them from all * their foes * By Thy al- might- y aid. * Let me Thy lov- ing- kind- * ness see, Thy * won- drous mer- cy, * full and free. *",
      "w:4.~O * guard me well as one * doth guard * The ap- ple of * the eye; * While * dead- ly foes are press- * ing hard, * To Thee, to Thee I cry. * Do Thou my rest and ref- * uge be, O * let Thy wings o'er- * shad- ow me. *",
      "w:5.~My * en- e- my, grown strong * in pride, * Would take my life * a- way, * A * li- on lurk- ing by * my side, * Most greed- y for his prey. * Con- front and cast him down, * O Lord, From * e- vil save me * by Thy sword. *",
      "w:6.~De- * fend me from the men * of pride, * Whose por- tion is * be- low, * Who, * with life's treas- ures sat- * is- fied, * No bet- ter por- tion know; * They, with earth's joys and wealth * con- tent, Must * leave them all when * life is spent. *",
      "w:7.~When * I in right- eous- ness * at last * Thy glo- rious face * shall see, * When * all the wea- ry night * is past, * And I a- wake with Thee * To view the glo- ries that * a- bide, Then, * then I shall be * sat- is- fied. *"
    ],
    "B2": [
      "w:1.~Lord, hear the right, re- gard my cry, My prayer from lips sin- cere; * Send Thy ap- prov- al from on high, My right- eous- ness make clear. * * * * * * Nor found it turned from * Thee a- side. *",
      "w:2.~With stead- fast cour- age I de- sign No wrong to speak or do; * Thy path of life I choose for mine, And walk with pur- pose true. * * * * * * As- sured that Thou wilt * an- swer me. *",
      "w:3.~O Thou that ev- er sav- est those Whose trust on Thee is stayed, * Pre- serv- ing them from all their foes By Thy al- might- y aid. * * * * * * Thy won- drous mer- cy, * full and free. *",
      "w:4.~O guard me well as one doth guard The ap- ple of the eye; * While dead- ly foes are press- ing hard, To Thee, to Thee I cry. * * * * * * O let Thy wings o'er- * shad- ow me. *",
      "w:5.~My en- e- my, grown strong in pride, Would take my life a- way, * A li- on lurk- ing by my side, Most greed- y for his prey. * * * * * * From e- vil save me * by Thy sword. *",
      "w:6.~De- fend me from the men of pride, Whose por- tion is be- low, * Who, with life's treas- ures sat- is- fied, No bet- ter por- tion know; * * * * * * Must leave them all when * life is spent. *",
      "w:7.~When I in right- eous- ness at last Thy glo- rious face shall see, * When all the wea- ry night is past, And I a- wake with Thee * * * * * * Then, then I shall be * sat- is- fied. *"
    ],
    "T2": [],
    "B1": []
  },
  "supplementalVoice": "B2",
  "musicSegment": 0,
  "printedCarrierPriority": [
    "T1",
    "T2",
    "B1"
  ],
  "displayRows": {
    "T1": [
      "1.~Lord, * hear the right, re- gard * my cry, * My prayer from lips * sin- cere; * Send * Thy ap- prov- al from * on high, * My right- eous- ness make clear. * Thou in the night my heart * hast tried, Nor * found it turned from * Thee a- side. *",
      "2.~With * stead- fast cour- age I * de- sign * No wrong to speak * or do; * Thy * path of life I choose * for mine, * And walk with pur- pose true. * For help, O God, I cry * to Thee, As- * sured that Thou wilt * an- swer me. *",
      "3.~O * Thou that ev- er sav- * est those * Whose trust on Thee * is stayed, * Pre- * serv- ing them from all * their foes * By Thy al- might- y aid. * Let me Thy lov- ing- kind- * ness see, Thy * won- drous mer- cy, * full and free. *",
      "4.~O * guard me well as one * doth guard * The ap- ple of * the eye; * While * dead- ly foes are press- * ing hard, * To Thee, to Thee I cry. * Do Thou my rest and ref- * uge be, O * let Thy wings o'er- * shad- ow me. *",
      "5.~My * en- e- my, grown strong * in pride, * Would take my life * a- way, * A * li- on lurk- ing by * my side, * Most greed- y for his prey. * Con- front and cast him down, * O Lord, From * e- vil save me * by Thy sword. *",
      "6.~De- * fend me from the men * of pride, * Whose por- tion is * be- low, * Who, * with life's treas- ures sat- * is- fied, * No bet- ter por- tion know; * They, with earth's joys and wealth * con- tent, Must * leave them all when * life is spent. *",
      "7.~When * I in right- eous- ness * at last * Thy glo- rious face * shall see, * When * all the wea- ry night * is past, * And I a- wake with Thee * To view the glo- ries that * a- bide, Then, * then I shall be * sat- is- fied. *"
    ],
    "T2": [
      "1.~Lord, * hear the right, re- gard * my cry, * My prayer from lips sin- cere; * Send * Thy ap- prov- al from * on high, * My right- eous- ness make clear. * Thou in the night my heart * hast tried, Nor found it turned from * Thee a- side. *",
      "2.~With * stead- fast cour- age I * de- sign * No wrong to speak or do; * Thy * path of life I choose * for mine, * And walk with pur- pose true. * For help, O God, I cry * to Thee, As- sured that Thou wilt * an- swer me. *",
      "3.~O * Thou that ev- er sav- * est those * Whose trust on Thee is stayed, * Pre- * serv- ing them from all * their foes * By Thy al- might- y aid. * Let me Thy lov- ing- kind- * ness see, Thy won- drous mer- cy, * full and free. *",
      "4.~O * guard me well as one * doth guard * The ap- ple of the eye; * While * dead- ly foes are press- * ing hard, * To Thee, to Thee I cry. * Do Thou my rest and ref- * uge be, O let Thy wings o'er- * shad- ow me. *",
      "5.~My * en- e- my, grown strong * in pride, * Would take my life a- way, * A * li- on lurk- ing by * my side, * Most greed- y for his prey. * Con- front and cast him down, * O Lord, From e- vil save me * by Thy sword. *",
      "6.~De- * fend me from the men * of pride, * Whose por- tion is be- low, * Who, * with life's treas- ures sat- * is- fied, * No bet- ter por- tion know; * They, with earth's joys and wealth * con- tent, Must leave them all when * life is spent. *",
      "7.~When * I in right- eous- ness * at last * Thy glo- rious face shall see, * When * all the wea- ry night * is past, * And I a- wake with Thee * To view the glo- ries that * a- bide, Then, then I shall be * sat- is- fied. *"
    ],
    "B1": [
      "1.~Lord, hear the right, re- gard my cry, * My prayer from lips sin- cere; * Send Thy ap- prov- al from on high, My right- eous- ness make clear. * Thou in the night my heart hast tried, Nor found it turned from Thee a- side. *",
      "2.~With stead- fast cour- age I de- sign * No wrong to speak or do; * Thy path of life I choose for mine, And walk with pur- pose true. * For help, O God, I cry to Thee, As- sured that Thou wilt an- swer me. *",
      "3.~O Thou that ev- er sav- est those * Whose trust on Thee is stayed, * Pre- serv- ing them from all their foes By Thy al- might- y aid. * Let me Thy lov- ing- kind- ness see, Thy won- drous mer- cy, full and free. *",
      "4.~O guard me well as one doth guard * The ap- ple of the eye; * While dead- ly foes are press- ing hard, To Thee, to Thee I cry. * Do Thou my rest and ref- uge be, O let Thy wings o'er- shad- ow me. *",
      "5.~My en- e- my, grown strong in pride, * Would take my life a- way, * A li- on lurk- ing by my side, Most greed- y for his prey. * Con- front and cast him down, O Lord, From e- vil save me by Thy sword. *",
      "6.~De- fend me from the men of pride, * Whose por- tion is be- low, * Who, with life's treas- ures sat- is- fied, No bet- ter por- tion know; * They, with earth's joys and wealth con- tent, Must leave them all when life is spent. *",
      "7.~When I in right- eous- ness at last * Thy glo- rious face shall see, * When all the wea- ry night is past, And I a- wake with Thee * To view the glo- ries that a- bide, Then, then I shall be sat- is- fied. *"
    ],
    "B2": [
      "1.~Lord, hear the right, re- gard my cry, My prayer from lips sin- cere; * Send Thy ap- prov- al from on high, My right- eous- ness make clear. * * * * * * Nor found it turned from * Thee a- side. *",
      "2.~With stead- fast cour- age I de- sign No wrong to speak or do; * Thy path of life I choose for mine, And walk with pur- pose true. * * * * * * As- sured that Thou wilt * an- swer me. *",
      "3.~O Thou that ev- er sav- est those Whose trust on Thee is stayed, * Pre- serv- ing them from all their foes By Thy al- might- y aid. * * * * * * Thy won- drous mer- cy, * full and free. *",
      "4.~O guard me well as one doth guard The ap- ple of the eye; * While dead- ly foes are press- ing hard, To Thee, to Thee I cry. * * * * * * O let Thy wings o'er- * shad- ow me. *",
      "5.~My en- e- my, grown strong in pride, Would take my life a- way, * A li- on lurk- ing by my side, Most greed- y for his prey. * * * * * * From e- vil save me * by Thy sword. *",
      "6.~De- fend me from the men of pride, Whose por- tion is be- low, * Who, with life's treas- ures sat- is- fied, No bet- ter por- tion know; * * * * * * Must leave them all when * life is spent. *",
      "7.~When I in right- eous- ness at last Thy glo- rious face shall see, * When all the wea- ry night is past, And I a- wake with Thee * * * * * * Then, then I shall be * sat- is- fied. *"
    ]
  },
  "sourceQualification": "Verses 1–5 have source-engraved underlay. Verses 6–7 have verified printed text but inferred musical placement; this presentation correction does not change that placement."
};
