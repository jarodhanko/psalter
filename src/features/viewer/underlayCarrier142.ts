/** RFPA page 214 has singing Soprano/Tenor through q0–24 while Alto/Bass
 * are silent. Prefer the complete singing carrier in this exact arrangement.
 * Bind to pristine source before notation/learner transforms; source drift
 * disables this presentation choice rather than inferring new ownership.
 */
const sourceWitness = `T:A Penitent's Plea
C:Tune: REFUGE; Joseph P. Holbrook
O:Psalm 51, 7s
M:3/4
L:1/8
K:D
%%score (T1 T2) (B1 B2)
%%stretchlast 1
%%stafftopmargin 10
% validator: allow-photographed-partial-bars
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
[V:T1] F3/2 F/2 | F3 D G3/2 F/2 | (F2 D2) || (3DE F | G3 B A3/2 G/2 | F4 |
w:1.~God be mer-ci-ful to me, * On * Thy grace I rest my plea;
w:2.~I am e-vil, born in sin; * Thou * de-sir-est truth with-in.
w:3.~Gra-cious God, my heart re-new, * Make * my spir-it right and true;
w:4.~Sin-ners then shall learn from me * And * re-turn, O God, to Thee;
[V:T2] x2 | x6 | x4 || x2 | x6 | x4 |
[V:B1] A,3/2 A,/2 | A,3 F, B,3/2 A,/2 | (A,2 F,2) || (3F,G, A, | B,3 D C3/2 B,/2 | A,4 |
[V:B2] x2 | x6 | x4 || x2 | x6 | x4 |
[V:T1] D3/2 D/2 | E2- (3E^DE (3EDE | (F2 D2) || D3/2 D/2 | E2- (3E^DE (3EGF | D4 |
w: Plen-teous in * * com-pas- * sion Thou, * Blot out my * * trans-gres- * sions now;
w: Thou a-lone * * my Sav- * iour art, * Teach Thy wis- * * dom to * my heart;
w: Cast me not * * a-way * from Thee, * Let Thy Spir- * * it dwell * in me;
w: Sav-iour, all * * my guilt * re-move, * And my tongue * * shall sing * Thy love;
[V:T2] x2 | x6 | x4 || x2 | x6 | x4 |
[V:B1] F,3/2 F,/2 | G,2- (3G,F,G, (3G,F,G, | (A,2 F,2) || F,3/2 F,/2 | G,2- (3G,F,G, (3G,B,A, | F,4 |
[V:B2] x2 | x6 | x4 || x2 | x6 | x4 |
[V:T1] A3/2 A/2 | f3 e (3edB | (A2 F2) || d3/2 B/2 | A3 F E3/2 F/2 | H G4 |
w: Wash me, make me pure * with-in, * Cleanse, O cleanse me from my sin,
w: Make me pure, Thy grace * be-stow, * Wash me whit-er than the snow,
w: Thy sal-va-tion's joy * im-part, * Stead-fast make my will-ing heart,
w: Touch my si-lent lips, * O Lord, * And my mouth shall praise ac-cord,
[V:T2] F3/2 F/2 | A3 G (3:2:2G2 G | (F2 D2) || F3/2 G/2 | F3 D C3/2 D/2 | E4 |
[V:B1] A,3/2 A,/2 | D3 C (3:2:2B,2 D | (D2 A,2) || A,3/2 B,/2 | D3 A, A,3/2 D/2 | H C4 |
[V:B2] D,3/2 D,/2 | D,3 D, (3:2:2G,2 G,, | D,4 || D,3/2 D,/2 | D,3 D, A,,3/2 A,,/2 | A,,4 |
[V:T1] F3/2 A/2 | f3 e (3edB | (A2 F2) || d3/2 B/2 | A3 D F3/2 E/2 | D4 |]
w: Wash me, make me pure * with-in, * Cleanse, O cleanse me from my sin.
w: Make me pure, Thy grace * be-stow, * Wash me whit-er than the snow.
w: Thy sal-va-tion's joy * im-part, * Stead-fast make my will-ing heart.
w: Touch my si-lent lips, * O Lord, * And my mouth shall praise ac-cord.
[V:T2] D3/2 F/2 | A3 G (3:2:2G2 G | (F2 D2) || F3/2 G/2 | F3 D D3/2 C/2 | D4 |]
[V:B1] A,3/2 A,/2 | D3 C (3:2:2B,2 D | (D2 A,2) || A,3/2 B,/2 | D3 F, A,3/2 G,/2 | F,4 |]
[V:B2] D,3/2 D,/2 | D,3 D, (3:2:2G,2 G,, | D,4 || D,3/2 D,/2 | D,3 D, A,,3/2 A,,/2 | D,4 |]
W:[Selected Stanzas]`;

export function hasPsalter142CarrierSource(songId: string, abc: string): boolean {
  return songId === 'psalter142' && abc.replace(/\r\n/g, '\n') === sourceWitness;
}

export const psalter142RecipientPriority = ['T1', 'B1', 'T2', 'B2'] as const;
