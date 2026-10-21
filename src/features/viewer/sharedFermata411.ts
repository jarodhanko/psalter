import { presentCoincidentUprightFermatas } from './sharedFermatas';

// Independently reviewed Psalter 411: one upright symbol per staff at q26
// and q54. Its two visible lower-staff pairs differ from the overlaid upper
// pairs; the printed source is the authority for sharing both pairs.
const psalter411MusicWitness = [
  "M:2/2",
  "L:1/4",
  "K:D",
  "%%score (T1 T2)(B1 B2)",
  "V:T1 clef=treble",
  "V:T2 clef=treble",
  "V:B1 clef=bass",
  "V:B2 clef=bass",
  "V:T1",
  "(F G) | A2 d2 | d2 B2 | (A F) (D E) | F2 || (F G) |",
  "A2 (G F) | E2 E2 | !fermata!E2 || (F G) | A2 d2 | d2 B2 |",
  "(A F) (D E) | F2 || B2 | A2 (D E) | F2 E2 | !fermata!D2 |]",
  "V:T2",
  "(D E) | F2 F2 | G2 G2 | (F D) (D C) | D2 || (D E) |",
  "F2 (E D) | C2 D2 | !fermata!C2 || (D E) | F2 F2 | G2 G2 |",
  "(F D) (D C) | D2 || D2 | D2 D2 | D2 C2 | !fermata!D2 |]",
  "V:B1",
  "A,2 | D2 A,2 | B,2 D2 | (D A,) (F, G,) | A,2 || A,2 |",
  "D2 A,2 | A,2 (^G, B,) | !fermata!A,2 || A,2 | D2 A,2 | B,2 D2 |",
  "(D A,) (F, G,) | A,2 || G,2 | A,2 (B, _B,) | A,2 G,2 | !fermata!F,2 |]",
  "V:B2",
  "D,2 | D,2 D,2 | D,2 D,2 | D,2 D,2 | D,2 || D,2 |",
  "D,2 (C, D,) | E,2 E,2 | !fermata!A,,2 || D,2 | D,2 D,2 | D,2 D,2 |",
  "D,2 D,2 | D,2 || G,2 | F,2 G,2 | A,2 A,,2 | !fermata!D,2 |]",
].join('\n');

export function hasPsalter411FermataSource(songId: string, abc: string): boolean {
  return songId === 'psalter411' && abc.split(/\r?\n/)
    .filter((line) => !/^\s*(?:[TCRSONWw]:|%abc)/.test(line) && line.trim())
    .join('\n') === psalter411MusicWitness;
}

export function presentPsalter411Fermatas(selectedAbc: string, active: boolean): string {
  return presentCoincidentUprightFermatas(selectedAbc, active, [26, 54]);
}
