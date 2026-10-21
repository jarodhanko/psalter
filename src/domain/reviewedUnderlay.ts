import type { UnderlayIdentityWitness, UnderlayRowIdentity } from './underlayIdentity';
import { extractUnderlayModel } from './underlayIdentity';
import { getReportedDuplicateCarriers } from './reportedDuplicateCarriers';
import { getPublishedStanzaVariant } from './publishedStanzaVariant';

interface ReviewedPart {
  voiceId: string;
  musicSegment: number;
  stanzaNumbers: readonly number[];
  /** Complete shared words on this part's own printed note columns. */
  chorusRows?: readonly string[];
}
interface ReviewedSource {
  source: string;
  stanzaNumbers: readonly number[];
  paired?: boolean;
  parts: readonly ReviewedPart[];
}
export interface ReviewedUnderlay {
  /** Presentation only; the caller keeps the original ABC for audio. */
  abc: string;
  identity: UnderlayIdentityWitness;
  stanzaNumbers: readonly number[];
  chorusCarriers: readonly ReviewedPart[];
  /** Exact-source row classification/segmentation only; the musical stream
   * and source transcript are unchanged. Keep ordinary tracking validation. */
  identityOnly?: true;
  /** Prepare this exact source's line split with the ordinary hymn clefs and
   * vocal placement before stanza/part filtering. */
  lineSegmentation?: true;
  /** Source-reviewed prose verses have no note-aligned rows or shared ending. */
  textOnlyStanzaNumbers?: readonly number[];
}

// Exact matched-source witnesses qualify row identity and presentation only.
// RFPA PDF 77–78 (42), 150 (98), 179 (120), 183–184 (123),
// 566–567 (389b); 389b stanzas 5–6 have inferred, text-only underlay.
const sources: Readonly<Record<string, ReviewedSource>> = {
  psalter42: {
    source: `%abc-2.1
T:Love for God's Word
C:Tune: KINSMAN; James McGranahan
M:6/8
L:1/8
K:F
%%score (T1 T2)(B1 B2)
% validator: allow-photographed-partial-bars
V:T1 clef=treble name="Soprano"
V:T2 clef=treble name="Alto"
V:B1 clef=bass name="Tenor"
V:B2 clef=bass name="Bass"
V:T1
C | C F A A2 B | A2 G G2 C | C E G B2 B | (B3 A2) C | C F A c2 c | c2 B A2 G | F E F A2 G | (G3 F2) |
w:1.~Most per- * fect is the law of God, Re-stor- * ing those that stray; * His tes- * ti-mo-ny is most sure, Pro-claim- * ing wis-dom's way. *
w:2.~The pre- * cepts of the Lord are right; With joy * they fill the heart; * The Lord's * com-mand-ments all are pure, And clear- * est light im-part. *
w:3.~The fear * of God is un-de-filed And ev- * er shall en-dure; * The stat- * utes of the Lord are truth And right- * eous-ness most pure. *
w:4.~They warn * from ways of wick-ed-ness Dis-pleas- * ing to the Lord, * And in * the keep-ing of His word There is * a great re-ward. *
P:Chorus
z | c3 c3 | c =B c A3 | A3 A3 | A ^G A F3 | F F F E2 D | E3 G3 | c3-c d =B | c3-c3 | c3 c3 | c =B c A3 | A3 F3 | G F D D3 | C C C F2 G | A2 F G2 F | F6- | F3-F2 |]
w:O how love I Thy law! O how love I Thy law! It is my med-i-ta-tion all * * the day * O how love I Thy law! O how love I Thy law! It is my med-i-ta-tion all the day, * *
W:Echo: all the day ... (all the day).
V:T2
C | C2 F F2 F | F2 E E2 C | C2 E E F G | (G3 F2) C | C2 F F2 _E | D2 D D2 D | C2 C C2 C | C3-C2 |
z | A3 A3 | A ^G A F3 | F3 F3 | F E F C3 | D D D C2 =B, | C3 E3 | E3-E F D | E3-E3 | F3 F3 | F F F F3 | _E3 D3 | D D B, B,3 | A, A, A, C2 F | F2 C C2 C | C3 C _E D | C3-C2 |]
w:O how love I Thy law! O how love I Thy law! It is my med- i- ta- tion all * * the day * O how love I Thy law! O how love I Thy law! It is my med- i- ta- tion all the day, (all * the day) *
V:B1
A, | A,2 C C2 D | C2 C C2 C, | E, G, B, G,2 C | C3-C2 A, | A,2 C A,2 F, | F,2 F, F,2 B, | A, G, A, C2 B, | (B,3 A,2) |
z | z6 | z6 | C3 C3 | C =B, C A,3 | A, A, A, G,2 G, | G,3 C3 | z3 G,2 G, | (G,3 B,3) | A,3 A,3 | A, ^G, A, C3 | C3 C3 | B, B, F, F,3 | F, F, F, A,2 B, | C2 A, B,2 A, | A,3 A, C B, | A,3-A,2 |]
w:* * O how love I Thy law! It is my med- i- ta- tion * all the day * O how love I Thy law! O how love I Thy law! It is my med- i- ta- tion all the day, (all * the day) *
V:B2
F, | F,2 F, F,2 F, | C,2 C, C,2 C, | C,2 C, C, D, E, | F,3-F,2 F, | F,2 F, F,2 A,, | B,,2 B,, B,,2 B,, | C,2 C, C,2 C, | F,3-F,2 |
z | z6 | z6 | F,3 F,3 | F, F, F, F,3 | D, D, D, G,2 G, | C,3 C,3 | z3 G,2 G, | C,3-C,3 | F,3 F,3 | F, F, F, F,3 | F,3 A,,3 | B,, B,, B,, B,,3 | C, C, C, C,2 C, | C,2 C, C,2 C, | F,6- | F,3-F,2 |]
w:* * O how love I Thy law! It is my med- i- ta- tion * all the day * O how love I Thy law! O how love I Thy law! It is my med- i- ta- tion all the day, * *`,
    stanzaNumbers: [1, 2, 3, 4],
    parts: [
      { voiceId: 'T1', musicSegment: 0, stanzaNumbers: [1, 2, 3, 4] },
      { voiceId: 'T1', musicSegment: 1, stanzaNumbers: [0] },
      { voiceId: 'T2', musicSegment: 1, stanzaNumbers: [0] },
      { voiceId: 'B1', musicSegment: 1, stanzaNumbers: [0] },
      { voiceId: 'B2', musicSegment: 1, stanzaNumbers: [0] },
    ],
  },
  psalter98: {
    source: `T:The Rewards of the Righteous
C:Tune: LONSDALE; Arthur H. D. Troyte
M:4/4
L:1/4
K:G
%%score (T1 T2) (B1 B2)
%%stretchlast 1
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
[V:T1] G | G A B G | c B A || A | B d
w: The good man's steps are led a-right, His way is
w: He shall not per-ish though he fall, The might-y
w: Though I am old who young have been, No saint have
w: He ev-er lends in gra-cious ways, His life true
[V:T2] D | E F G G | G G F || F | G A
[V:B1] B, | B, D D E | E D D || D | D D
[V:B2] G, | E, D, G, E, | C, G, D, || D, | G, F,
[V:T1] c B | A G F || G | G G G F | G3 :|
w: pleas-ing in God's sight, Es-tab-lished it shall stand;
w: Lord who rules o'er all Up-holds him with His hand.
w: I for-sak-en seen, Nor yet his home in need;
w: char-i-ty dis-plays, His sons are blest in-deed.
[V:T2] G F | E B,/^C/ D || D | E E D D | D3 :|
[V:B1] E B, | C G, A, || B, | B, C B, A,/C/ | B,3 :|
[V:B2] E, D, | C, E, D, || G, | E, C, D, D, | G,3 :|
W:3 Depart from evil, do thou well,
W:And evermore securely dwell;
W:Jehovah loves the right.
W:His faithfulness His saints have proved,
W:Forever they shall stand unmoved,
W:But sinners God will smite.
W:
W:4 The righteous, through His favoring hand,
W:Shall yet inherit all the land
W:And dwell therein for aye;
W:He talks of wisdom and of right,
W:In God's pure law is his delight,
W:His steps go not astray.`,
    stanzaNumbers: [1, 2],
    paired: true,
    parts: [
      { voiceId: 'T1', musicSegment: 0, stanzaNumbers: [1, 1, 2, 2] },
      { voiceId: 'T1', musicSegment: 1, stanzaNumbers: [1, 1, 2, 2] },
    ],
  },
  psalter120: {
    source: `T:Hope and Trust
C:Tune: AMARA; William O. Perkins
M:9/8
L:1/8
K:Eb
% validator: allow-photographed-partial-bars
%%score (T1 T2) (B1 B2)
%%stretchlast 1
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
[V:T1] E2 F | G3 G3 B A G | F3 F3 || F2 G | A3 A3 c B A | G6 ||
w: Judge me, God of my * sal-va-tion, Plead my cause, for Thee * I trust;
w: On Thy strength a-lone * re-ly-ing, Why am I cast off * by Thee,
w: Light and truth, my way * at-tend-ing, Send Thou forth to be * my guide,
w: At Thy sa-cred al- * tar bend-ing, God, my God, my bound- * less joy,
[V:T2] E2 E | E3 E3 G F E | D3 D3 || D2 E | F3 F3 A G F | E6 ||
[V:B1] G,2 A, | B,3 B,3 E2 B, | B,3 B,3 || B,2 B, | B,3 B,3 B,2 B, | B,6 ||
[V:B2] E,2 E, | E,3 E,3 E,2 E, | B,,3 B,,3 || B,,2 B,, | B,,3 B,,3 B,,2 B,, | E,6 ||
[V:T1] E2 F | G3 G3 B A G | F3 F3 || F2 G | A3-A2 A A G F | E6 ||
w: Hear my ear-nest sup- * pli-ca-tion, Save me from * my foes * un-just.
w: In my help-less sor- * row sigh-ing, While the foe * op-press- * es me?
w: Till Thy ho-ly mount * as-cend-ing, I with-in * Thy house * a-bide.
w: Harp and voice, in wor- * ship blend-ing, For Thy praise * will I * em-ploy.
[V:T2] E2 E | E3 E3 G F E | D3 D3 || D2 E | F3-F2 F F E D | E6 ||
[V:B1] G,2 A, | B,3 B,3 E2 B, | B,3 B,3 || B,2 B, | B,3-B,2 B, B,2 A, | G,6 ||
[V:B2] E,2 E, | E,3 E,3 E,2 E, | B,,3 B,,3 || B,,2 B,, | B,,3-B,,2 B,, B,,2 B,, | E,6 ||
[V:T1] "^Chorus" B2 B | c3 c3 A B c | B3 G3 || B A G | F3-F2 F F E F | G6 ||
w: O my soul, why art * thou griev-ing? What * dis-qui- * ets and * dis-mays?
[V:T2] E2 E | E3 E3 E2 E | E3 E3 || G F E | D3-D2 D D C D | E6 ||
[V:B1] G,2 G, | A,3 A,3 C B, A, | G,3 B,3 || B,2 B, | B,3-B,2 B, B,2 B, | B,6 ||
[V:B2] E,2 E, | A,3 A,3 A,,2 C, | E,3 E,3 || E,2 E, | B,,3-B,,2 B,, B,,2 B,, | E,6 ||
[V:T1] B2 B | c3 c3 A B c | B3 G3 || B A G | F3-F2 F F G F | E6 |]
w: Hope in God; His help * re-ceiv-ing, I * shall yet * my Sav- * iour praise.
[V:T2] E2 E | E3 E3 E2 E | E3 E3 || G F E | D3-D2 D D2 D | E6 |]
[V:B1] G,2 G, | A,3 A,3 C B, A, | G,3 B,3 || B,2 B, | B,3-B,2 B, B,2 A, | G,6 |]
[V:B2] E,2 E, | A,3 A,3 A,,2 C, | E,3 E,3 || E,2 E, | B,,3-B,,2 B,, B,,2 B,, | E,6 |]`,
    stanzaNumbers: [1, 2, 3, 4],
    parts: [
      { voiceId: 'T1', musicSegment: 0, stanzaNumbers: [1, 2, 3, 4] },
      { voiceId: 'T1', musicSegment: 1, stanzaNumbers: [1, 2, 3, 4] },
      { voiceId: 'T1', musicSegment: 2, stanzaNumbers: [0] },
      { voiceId: 'T1', musicSegment: 3, stanzaNumbers: [0] },
    ],
  },
  psalter123: {
    source: `T:An Importunate Prayer
C:Tune: MAGNUS; John B. Herbert
M:6/8
L:1/8
Q:"Slowly"
K:Eb
%%score (T1 T2) (B1 B2)
%%stretchlast 1
% validator: allow-photographed-partial-bars
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
[V:T1] E | G G G F E G | B B c B2 || G | F F G
w: If we have for-got-ten the Name of our God, Or un-to an
w: We all the day long for Thy sake are con-sumed, De-feat-ed and
w: O why art Thou hid-ing the light of Thy face, For-get-ting our
[V:T2] E | E E E B, B, E | G G A G2 || E | D D E
[V:B1] G, | B, B, B, A, G, B, | E E E E2 || B, | B, B, B,
[V:B2] E, | E, E, E, E, E, E, | E, E, E, E,2 || E, | B,, B,, B,,
[V:T1] A d c | c B =A B2 || _A | G G G F E G |
w: i-dol our hands spread a-broad, Shall not the Al-might-y un-
w: help-less, to death we are doomed; Then why dost Thou tar-ry? Je-
w: bur-den of grief and dis-grace? Our soul is bowed down, yea, we
[V:T2] F B A | A G ^F G2 || =F | E E E B, B, E |
[V:B1] B, B, D | E E E E2 || B, | B, B, B, A, G, B, |
[V:B2] B,, B,, B,, | E, E, E, E,2 || E, | E, E, E, E, E, E, |
[V:T1] B B c d2 || d | e d c B F d | c G =A !fermata!B3 ||
w: cov-er this sin? He knows all our hearts and the se-crets with-in.
w: ho-vah, a-wake, Nor spurn us for-ev-er; a-rise for our sake.
w: cleave to the dust; Rise, help, and re-deem us, Thy mer-cy we trust.
[V:T2] G G G F2 || A | G G G F D F | E E E (D2 !invertedfermata!_A) ||
[V:B1] E B, B, B,2 || B, | B, B, C D B, B, | =A, B, C (B,2 !invertedfermata!D) ||
[V:B2] E, E, E, B,,2 || B,, | E, E, E, F, F, F, | F, F, F, !invertedfermata!B,,3 ||
[V:T1] "^CHORUS"!accent!B3 !accent!G F E | !accent!F3 E2 || B | c3-c d e | B3-B3 ||
w: Rise, help, and re-deem us, Thy mer- * cy we trust; *
[V:T2] G3 E B, B, | B,3 B,2 || G | A3 A2 A | G3-G3 ||
w: * * * * * * Thy mer-cy we trust; *
[V:B1] E3 B, A, G, | A,3 G,2 || E | E3-E D C | E3-E3 ||
[V:B2] E,3 E, E, E, | B,,3 E,2 || E, | A,3 A,2 A, | E,3-E,3 ||
[V:T1] !accent!e3 !accent!f e c | !accent!B3 !fermata!e2 || F | G3 FE F | E3-E2 |]
w: Rise, help, and re-deem us, Thy mer-cy * we trust. *
[V:T2] B3 A A A | G3 F2 || E | E3 DC B, | B,3-B,2 |]
[V:B1] _D3 C C E | E3 !fermata!=A,2 || A, | B,3 A,2 A, | G,3-G,2 |]
[V:B2] G,3 A, A, A, | E,3 C,2 || C, | B,,3 B,,2 B,, | E,3-E,2 |]
W:[Stanzas 10-12]`,
    stanzaNumbers: [1, 2, 3],
    parts: [
      { voiceId: 'T1', musicSegment: 0, stanzaNumbers: [1, 2, 3] },
      { voiceId: 'T1', musicSegment: 1, stanzaNumbers: [1, 2, 3] },
      { voiceId: 'T1', musicSegment: 2, stanzaNumbers: [1, 2, 3] },
      { voiceId: 'T1', musicSegment: 3, stanzaNumbers: [0] },
      { voiceId: 'T1', musicSegment: 4, stanzaNumbers: [0] },
      // The source's partial Alto row supplies its distinct cy at q32.
      // Complete the shared first phrase without borrowing Soprano's q32.5.
      { voiceId: 'T2', musicSegment: 3, stanzaNumbers: [0], chorusRows: ['Rise, help, and re-deem us, Thy mer-cy we trust; *'] },
      { voiceId: 'B1', musicSegment: 3, stanzaNumbers: [0], chorusRows: ['Rise, help, and re-deem us, Thy mer- * cy we trust; *'] },
      { voiceId: 'B2', musicSegment: 3, stanzaNumbers: [0], chorusRows: ['Rise, help, and re-deem us, Thy mer-cy we trust; *'] },
      { voiceId: 'T2', musicSegment: 4, stanzaNumbers: [0], chorusRows: ['Rise, help, and re-deem us, Thy mer-cy * we trust. *'] },
      { voiceId: 'B1', musicSegment: 4, stanzaNumbers: [0], chorusRows: ['Rise, help, and re-deem us, Thy mer-cy we trust. *'] },
      { voiceId: 'B2', musicSegment: 4, stanzaNumbers: [0], chorusRows: ['Rise, help, and re-deem us, Thy mer-cy we trust. *'] },
    ],
  },
  psalter389b: {
    source: `
T:Contrite Trust
C:Tune: BRADBURY; Anonymous
R:Psalm 143 · 6s
N:Printed pp. 332–333; annotated photos 326–327. Second tune.
M:6/8
L:1/8
K:Eb
%%score (T1 T2)(B1 B2)
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
V:T1
G | G2 G B2 B | G3-G2 || G | F2 G A2 B | G3-G2 ||
w:1.~Lord, hear me in dis-tress, _ Re-gard my sup-pliant cry, _
w:In judg-ment do not cause _ Thy serv-ant to be tried; _
w:2.~The en-e-my has sought _ My soul in dust to tread; _
w:My spir-it, crushed with grief, _ Is sad and o-ver-borne; _
w:3.~Re-call-ing for-mer days _ And all Thy won-drous deeds, _
w:To Thee I stretch my hands, _ Let me not plead in vain; _
w:4.~My fail-ing spir-it see, _ O Lord, to me make haste; _
w:O let the morn re-turn, _ Let mer-cy light my day; _
w:5.~Lord, save me from my foe, _ To Thee for help I flee; _
w:By Thy good Spir-it led _ From trou-ble and dis-tress, _
w:6.~O Lord, for Thy Name's sake _ Re-vive my faint-ing heart; _
w:Re-move my en-e-my _ My cru-el foe re-ward; _
G | G2 G B2 B | c3-c2 || c | B2 G F2 A | G3-G2 |]
w:And in Thy faith-ful-ness _ And right-eous-ness re-ply. _
w:Be-fore Thy ho-ly laws _ No man is jus-ti-fied. _
w:To dark-ness I am brought, _ For-got-ten as the dead. _
w:My heart finds no re-lief, _ But des-o-late I mourn. _
w:The mem-'ry of Thy ways _ To hope and com-fort leads. _
w:I wait as wea-ry lands _ Wait for re-fresh-ing rain. _
w:Hide not Thy face from me, _ Lest bit-ter death I taste. _
w:For Thee in faith I yearn, _ O guide me in the way. _
w:5.~Teach me Thy way to know _ I have no God but Thee. _
w:My err-ing feet shall tread _ The path of up-right-ness. _
w:6.~My soul from trou-ble take _ For just and true Thou art. _
w:In mer-cy res-cue me _ Who am Thy ser-vant, Lord. _
W:1. Lord, hear me in distress, Regard my suppliant cry; And in Thy faithfulness And righteousness reply. In judgment do not cause Thy servant to be tried; Before Thy holy laws No man is justified.
W:2. The enemy has sought My soul in dust to tread; To darkness I am brought, Forgotten as the dead. My spirit, crushed with grief, Is sad and overborne; My heart finds no relief, But desolate I mourn.
W:3. Recalling former days And all Thy wondrous deeds, The memory of Thy ways To hope and comfort leads. To Thee I stretch my hands, Let me not plead in vain; I wait as weary lands Wait for refreshing rain.
W:4. My failing spirit see, O Lord, to me make haste; Hide not Thy face from me, Lest bitter death I taste. O let the morn return, Let mercy light my day; For Thee in faith I yearn, O guide me in the way.
W:5. Lord, save me from my foe, To Thee for help I flee; Teach me Thy way to know, I have no God but Thee. By Thy good Spirit led From trouble and distress, My erring feet shall tread The path of uprightness.
W:6. O Lord, for Thy Name's sake Revive my fainting heart; My soul from trouble take, For just and true Thou art. Remove my enemy, My cruel foe reward; In mercy rescue me Who am Thy servant, Lord.
V:T2
E | E2 E G2 G | E3-E2 || E | D2 E F2 G | E3-E2 ||
E | E2 E G2 G | A3-A2 || A | G2 E D2 F | E3-E2 |]
V:B1
B, | B,2 B, E2 E | B,3-B,2 || B, | B,2 B, B,2 B, | B,3-B,2 ||
B, | B,2 B, E2 E | E3-E2 || E | E2 B, B,2 B, | B,3-B,2 |]
V:B2
E, | E,2 E, E,2 E, | E,3-E,2 || E, | B,,2 B,, B,,2 B,, | E,3-E,2 ||
E, | E,2 E, E,2 E, | A,3-A,2 || A, | B,2 B, B,,2 B,, | E,3-E,2 |]
`,
    stanzaNumbers: [1, 2, 3, 4, 5, 6],
    paired: true,
    parts: [
      { voiceId: 'T1', musicSegment: 0, stanzaNumbers: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6] },
      { voiceId: 'T1', musicSegment: 1, stanzaNumbers: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6] },
    ],
  },
};

const cache = new Map<string, ReviewedUnderlay>();

/** Timeless Truths' My Faith Has Found a Resting Place mixes verse endings
 * and the refrain pickup in one source line. Split the presentation at its
 * explicit double bar in all four voices, and split the four lyric rows at
 * that same bar column. Canonical notation, audio and transcript stay original.
 * Exact canonical SHA-256: d08fdcf2605d3358af371d8263b6489870f8285635d09711958c7b24675eca70.
 * Source: https://library.timelesstruths.org/library/music/M/My_Faith_Has_Found_a_Resting_Place/My_Faith_Has_Found_a_Resting_Place.xml
 */
function getFaithUnderlay(abc: string): ReviewedUnderlay | undefined {
  const source = abc.replace(/\r\n/g, '\n');
  if (source.length !== 3312) return undefined;
  let hash = 14695981039346656037n;
  for (let index = 0; index < source.length; index++) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(source.charCodeAt(index))) * 1099511628211n);
  }
  if (hash !== 0x9fb809df26d6d667n) return undefined;
  const lines = source.split('\n');
  const output: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const boundary = line.indexOf('||');
    if (boundary < 0 || line.startsWith('w:')) {
      output.push(line);
      continue;
    }
    const rows: [string, string][] = [];
    while (lines[index + 1]?.startsWith('w:')) {
      const text = lines[++index].slice(2);
      // Two source bars end the verse; the next two hold refrain words.
      const column = text.indexOf('|', text.indexOf('|') + 1) + 1;
      rows.push([`w:${text.slice(0, column)}`, `w:${text.slice(column)}`]);
    }
    output.push(line.slice(0, boundary + 2), ...rows.map(row => row[0]),
      line.slice(boundary + 2), ...rows.map(row => row[1]));
  }
  const presentation = output.join('\n');
  const model = extractUnderlayModel(presentation);
  return {
    abc: presentation,
    identityOnly: true,
    lineSegmentation: true,
    stanzaNumbers: model.stanzaNumbers,
    chorusCarriers: [],
    identity: {
      rows: model.rows.map(({ voiceId, musicSegment, stanzaNumber, sourceText }) => ({
        voiceId, musicSegment, sourceText,
        stanzaNumber: musicSegment >= 3 ? 0 : stanzaNumber,
        role: musicSegment >= 3 ? 'chorus' : 'stanza',
        ...(musicSegment >= 3 ? { chorusRow: stanzaNumber } : {}),
      })),
      completeChorusSegments: [3, 4, 5].map(musicSegment => ({ voiceId: '1', musicSegment })),
    },
  };
}

/** Open Hymnal's He Keeps Me Singing prints five complete verse rows over
 * measures 1–8, then one shared chorus over measures 9–16. The generic model
 * deliberately omits the two unnumbered chorus rows, so bind them explicitly.
 * Exact canonical SHA-256: 60bf29024e183ef281282789ab1ab17064140fa27d2c392ec595a74082a1197a.
 * Source: Open Hymnal, Tabernacle Hymns Issue 2 (1921), hymn 13, 2015 revision.
 * This only classifies existing rows; notation and source lyrics stay intact. */
function getHeKeepsUnderlay(abc: string): ReviewedUnderlay | undefined {
  const source = abc.replace(/\r\n/g, '\n');
  if (source.length !== 3665) return undefined;
  let hash = 14695981039346656037n;
  for (let index = 0; index < source.length; index++) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(source.charCodeAt(index))) * 1099511628211n);
  }
  if (hash !== 0xf8154dd75711d318n) return undefined;
  const model = extractUnderlayModel(source);
  const chorus = [...source.matchAll(/^w: (.+)$/gm)].slice(10);
  return {
    abc: source,
    identityOnly: true,
    stanzaNumbers: model.stanzaNumbers,
    chorusCarriers: [],
    identity: {
      rows: [
        ...model.rows.map(({ voiceId, musicSegment, stanzaNumber, sourceText }) => ({
          voiceId, musicSegment, stanzaNumber, sourceText, role: 'stanza' as const,
        })),
        ...chorus.map((row, index) => ({
          voiceId: 'S1V1', musicSegment: index + 2, stanzaNumber: 0,
          sourceText: row[1], role: 'chorus' as const,
        })),
      ],
      completeChorusSegments: [2, 3].map(musicSegment => ({ voiceId: 'S1V1', musicSegment })),
    },
  };
}

/** Open Hymnal's When the Roll Is Called Up Yonder shares the last eleven
 * syllables of its verse tune across all three verses, then prints a chorus
 * with distinct Bass responses. The shared ending starts at q24, inside the
 * source measure: split the four voices at their exact corresponding tokens,
 * and the three lyric rows after their ten verse-specific syllables. Retain
 * both eleven-slot spacer rows; never copy the Soprano chorus onto the Bass.
 * Exact canonical SHA-256: c6729bc14681e4f91c59dd74924cad69fa4e44e26e2b9af436d85ac8dc2e25a9.
 * Source: Open Hymnal, Epworth Songs (1893), hymn 57, 2011 revision.
 * Only grouped/selected-verse presentation uses this split; source, audio,
 * transcript and ungrouped engraving keep the original edition. */
function getRollUnderlay(abc: string): ReviewedUnderlay | undefined {
  const source = abc.replace(/\r\n/g, '\n');
  if (source.length !== 4826) return undefined;
  let hash = 14695981039346656037n;
  for (let index = 0; index < source.length; index++) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(source.charCodeAt(index))) * 1099511628211n);
  }
  if (hash !== 0xe84cde21656d5a0cn) return undefined;
  const musicPrefixes = [
    '[V: S1V1] c/4 c3/4 B/4 A3/4 A/4 | B3/4 A/4 A3/4 F/4 E',
    '[V: S1V2] E/4 E3/4 E/4 E3/4 E/4 | D3/4 D/4 D3/4 D/4 C',
    '[V: S2V1] A,/4 A,3/4 G,/4 A,3/4 A,/4 | F,3/4 F,/4 F,3/4 A,/4 A,',
    '[V: S2V2] A,,/4 A,,3/4 B,,/4 C,3/4 C,/4 | D,3/4  D,/4 D,3/4  D,/4 A,,',
  ];
  const versePrefixes = [
    'w: shall ga- ther ov- er on the o- ther shore,',
    'w: shall ga- ther to their home be- yond the skies,',
    'w: is ov- er, and our work on earth is done,',
  ];
  const lines = source.split('\n');
  const output: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const prefix = musicPrefixes.find(value => line.startsWith(value + ' '));
    if (!prefix) { output.push(line); continue; }
    const voice = prefix.slice(0, prefix.indexOf(']') + 1);
    const tail = `${voice}${line.slice(prefix.length)}`;
    if (voice !== '[V: S1V1]') { output.push(prefix, tail); continue; }
    // These exact source prefixes are the reviewed syllable boundary, not a
    // generic token-count or phrase-similarity rule for another edition.
    const rows = versePrefixes.map(versePrefix => {
      const row = lines[++index];
      return [versePrefix, `w:${row.slice(versePrefix.length)}`];
    });
    output.push(prefix, ...rows.map(row => row[0]), tail, ...rows.map(row => row[1]));
  }
  const presentation = output.join('\n');
  const texts = [...presentation.matchAll(/^w: (.+)$/gm)].map(row => row[1].trim());
  const verseRows = [0, 1, 2].flatMap(musicSegment => [1, 2, 3].map(stanzaNumber => ({
    voiceId: 'S1V1', musicSegment, stanzaNumber, role: 'stanza' as const,
  })));
  const sharedEnding = [1, 2, 3].map(chorusRow => ({
    voiceId: 'S1V1', musicSegment: 3, stanzaNumber: 0, role: 'chorus' as const, chorusRow,
  }));
  const chorus = [
    { voiceId: 'S1V1', musicSegment: 4 }, { voiceId: 'S2V2', musicSegment: 4 },
    { voiceId: 'S1V1', musicSegment: 5 }, { voiceId: 'S2V2', musicSegment: 5 },
    { voiceId: 'S1V1', musicSegment: 6 },
  ];
  return {
    abc: presentation, identityOnly: true, lineSegmentation: true,
    stanzaNumbers: [1, 2, 3], chorusCarriers: [],
    identity: {
      rows: [...verseRows, ...sharedEnding, ...chorus.map(part => ({
        ...part, stanzaNumber: 0, role: 'chorus' as const,
      }))].map((row, index) => ({ ...row, sourceText: texts[index] })),
      completeChorusSegments: [{ voiceId: 'S1V1', musicSegment: 3 }, ...chorus],
    },
  };
}

/** All Creatures' five verse endings precede one shared closing refrain.
 * First qualify the entire canonical source through the approved published
 * stanza projection; the witness must describe that projected fourth stanza.
 * Split at q60 (melody attack 40), inside logical unit 10, without changing
 * an event or adding a barline. Preserve all four spacer lanes and the second
 * O-praise occurrence plus three Alleluias in the following source block.
 * Exact canonical SHA-256: cc0979466a1d1e13b0ba1a845b65ee003c156ef53e21aac5c8685a801d96c4fc.
 * Source: Open Hymnal 2005 revision, official ABC/PDF and expanded lyric page.
 * Only grouped/selected notation uses the split; W:6–7 stay prose-only. */
function getAllCreaturesUnderlay(songId: string, abc: string): ReviewedUnderlay | undefined {
  const variant = getPublishedStanzaVariant(songId, abc);
  if (!variant) return undefined;
  const music = [
    ['[V: S1V1]  [A2d2] | [Ad] [GA] [FA] G F G | A4 ', '(G F) | E2 D2'],
    ['[V: S1V2]  (D E) | D C D D3 | (D C F E) ', 'D2 | (D C) D2'],
    ['[V: S2V1]  A,2 | A,2 A, D C B, | A,4  ', 'B,2 | (B, A,) A,2'],
    ['[V: S2V2]  (F, G,) | F, E, D, B, A, G, | (F, E, D, C,) ', '(B,, A,,) | G,,2 F,,2'],
  ];
  const lyrics = [
    ['w: Thou sil- ver moon with soft- er gleam! ', 'O * praise Him!'],
    ['w: Ye lights of eve- ning, find a voice!  ', '*  *  *  *'],
    ['w: That giv- est man both warmth and light.  ', '*  *  *  *'],
    ['w: let them his glo- ry al- so show:  ', '*  *  *  *'],
    ['w: Praise God and on Him cast your care!  ', '*  *  *  *'],
  ];
  const block = [music[0].join(''), ...lyrics.map(row => row.join('')), ...music.slice(1).map(row => row.join(''))].join('\n');
  const sourceBlock = `% 9\n${block}\n% 13\n`;
  if (variant.abc.split(sourceBlock).length !== 2) return undefined;
  const before = [music[0][0], ...lyrics.map(row => row[0]), ...music.slice(1).map(row => row[0])];
  const after = music.map(([prefix, tail]) => `${prefix.slice(0, prefix.indexOf(']') + 1)} ${tail}`);
  after.splice(1, 0, ...lyrics.map(row => `w: ${row[1]}`));
  const presentation = variant.abc.replace(sourceBlock, `% 9\n${[...before, ...after].join('\n')}\n% 13\n`);
  const texts = [...presentation.matchAll(/^w: (.+)$/gm)].map(row => row[1].trim());
  if (texts.length !== 21) return undefined;
  const stanzaNumbers = [1, 2, 3, 4, 5];
  const rows: Omit<UnderlayRowIdentity, 'sourceText'>[] = [
    ...[0, 1, 2].flatMap(musicSegment => stanzaNumbers.map(stanzaNumber => ({
      voiceId: 'S1V1', musicSegment, stanzaNumber, role: 'stanza' as const,
    }))),
    ...stanzaNumbers.map(chorusRow => ({
      voiceId: 'S1V1', musicSegment: 3, stanzaNumber: 0, role: 'chorus' as const, chorusRow,
    })),
    { voiceId: 'S1V1', musicSegment: 4, stanzaNumber: 0, role: 'chorus' },
  ];
  return {
    abc: presentation, identityOnly: true, lineSegmentation: true,
    stanzaNumbers, chorusCarriers: [], textOnlyStanzaNumbers: [6, 7],
    identity: {
      rows: rows.map((row, index) => ({ ...row, sourceText: texts[index] })),
      completeChorusSegments: [3, 4].map(musicSegment => ({ voiceId: 'S1V1', musicSegment })),
    },
  };
}

/** The byte-matched OpenPsalm MusicXML places all five verse-final syllables
 * at q24, then explicitly starts the shared refrain pickup at q26, inside
 * measure 9. Split all four voices after that two-quarter verse-ending note.
 * Keep the Soprano spacer lanes and the independently timed Alto and Tenor
 * responses: the Tenor's "Yes" starts at q28, not the Soprano's q26.
 * Exact canonical SHA-256: fc387f305d77dd757c1cd77164808dab232d0b676741e71fb72a0c9f806b7757.
 * Source: https://openpsalm.com/api/songs/197/export/musicxml
 * Only grouped/selected-verse presentation uses this source-bound split. */
function getWondrousUnderlay(abc: string): ReviewedUnderlay | undefined {
  if (!getReportedDuplicateCarriers('hymn-remaining-openpsalm-i-will-sing-the-wondrous-story', abc)) return undefined;
  const source = abc.replace(/\r\n/g, '\n');
  const prefixes = [' E8"^Refrain."', ' E8 (3B2=A2_A2', ' G,8 z4', ' E,8 z4'];
  const lines = source.split('\n');
  const output: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];
    const part = prefixes.findIndex(prefix => line.startsWith(prefix));
    if (part < 0) { output.push(line); continue; }
    const boundary = part < 2 ? 3 : 4;
    const rows: string[] = [];
    while (lines[index + 1]?.startsWith('w:')) rows.push(lines[++index]);
    // Each source verse ends with one syllable and its full stop. The exact
    // gate binds these prefixes; no generic punctuation inference is used.
    const ends = rows.map(row => row.indexOf('.') + 1);
    const verse = part === 0 || part === 2;
    // Alto's original leading bar skip includes the q24 note. Preserve that
    // existing empty lyric column explicitly on the separated verse ending.
    output.push(line.slice(0, boundary), ...(verse ? rows.map((row, i) => row.slice(0, ends[i])) : part === 1 ? ['w: *'] : []),
      line.slice(boundary), ...rows.map((row, i) => verse ? `w:${row.slice(ends[i])}` : row));
  }
  const presentation = output.join('\n');
  const rows: UnderlayRowIdentity[] = [];
  let voiceId = '', segment = -1, rowIndex = 0;
  for (const line of output) {
    const voice = /^V:(\d+)(.*)$/.exec(line);
    if (voice) { voiceId = voice[1]; segment = -1; rowIndex = 0; continue; }
    if (line.startsWith('w:')) {
      const chorus = voiceId === '2' || segment >= 3;
      rows.push({ voiceId, musicSegment: segment, sourceText: line.slice(2).trim(),
        stanzaNumber: chorus ? 0 : rowIndex + 1, role: chorus ? 'chorus' : 'stanza',
        ...(chorus ? { chorusRow: rowIndex + 1 } : {}) });
      rowIndex++;
    } else if (voiceId && line.trim() && !/^(?:%|[A-Za-z]:)/.test(line.trim())) {
      segment++; rowIndex = 0;
    }
  }
  return {
    abc: presentation, identityOnly: true, lineSegmentation: true,
    stanzaNumbers: [1, 2, 3, 4, 5], chorusCarriers: [],
    identity: {
      rows,
      completeChorusSegments: rows.filter(row => row.role === 'chorus' && row.chorusRow === 1)
        .map(({ voiceId, musicSegment }) => ({ voiceId, musicSegment })),
    },
  };
}

/** Timeless Truths' Onward, Christian Soldiers: the final eight measures are
 * one shared refrain, split between source lyric rows 1 and 3. Preserve all
 * five rows, including bar-only spacers, rather than copying words per verse.
 * Exact canonical SHA-256: 36a7dbe747a567acfba0ef7f5ae7f00da02b518daef5e745182e20d99c0cd993.
 * Source: https://library.timelesstruths.org/library/music/O/Onward_Christian_Soldiers/Onward_Christian_Soldiers.pdf
 * Length + FNV-1a64 binds the complete edition before any display transform. */
function getOnwardUnderlay(abc: string): ReviewedUnderlay | undefined {
  const source = abc.replace(/\r\n/g, '\n');
  if (source.length !== 4125) return undefined;
  let hash = 14695981039346656037n;
  for (let index = 0; index < source.length; index++) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(source.charCodeAt(index))) * 1099511628211n);
  }
  if (hash !== 0x99007266e7d90bdfn) return undefined;
  const model = extractUnderlayModel(source);
  return {
    abc: source,
    identityOnly: true,
    stanzaNumbers: model.stanzaNumbers,
    chorusCarriers: [],
    identity: {
      rows: model.rows.map(({ voiceId, musicSegment, stanzaNumber, sourceText }) => ({
        voiceId, musicSegment, sourceText,
        stanzaNumber: musicSegment >= 4 ? 0 : stanzaNumber,
        role: musicSegment >= 4 ? 'chorus' : 'stanza',
        ...(musicSegment >= 4 ? { chorusRow: stanzaNumber } : {}),
      })),
      completeChorusSegments: [4, 5].map(musicSegment => ({ voiceId: '1', musicSegment })),
    },
  };
}

/** HymnsToGod's Near To The Heart Of God: three numbered verses followed by
 * one shared refrain in voice 11, segments 3–5. Keep all nine refrain rows,
 * including the two placeholder lanes. The three identical verse-ending
 * "God." rows in segment 2 inherit the qualified numbered stanza vector.
 * Exact canonical SHA-256: ce031bce15626ff19767ac86d70ff05ff0ada24ae361739efc83277105a14d4a.
 * Source: https://www.hymnstogod.org/Hymn-Files/Public-Domain-Hymns/N-Hymns/Near-To-The-Heart-Of-God/Near-To-The-Heart-Of-God-6x9.pdf
 * Length + FNV-1a64 binds the complete edition before any display transform. */
function getNearUnderlay(abc: string): ReviewedUnderlay | undefined {
  const source = abc.replace(/\r\n/g, '\n');
  if (source.length !== 4656) return undefined;
  let hash = 14695981039346656037n;
  for (let index = 0; index < source.length; index++) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(source.charCodeAt(index))) * 1099511628211n);
  }
  if (hash !== 0xb36bd99edaf7be2cn) return undefined;
  const model = extractUnderlayModel(source);
  return {
    abc: source,
    identityOnly: true,
    stanzaNumbers: model.stanzaNumbers,
    chorusCarriers: [],
    identity: {
      rows: model.rows.map(({ voiceId, musicSegment, stanzaNumber, sourceText }) => ({
        voiceId, musicSegment, sourceText,
        stanzaNumber: musicSegment >= 3 ? 0 : stanzaNumber,
        role: musicSegment >= 3 ? 'chorus' : 'stanza',
        ...(musicSegment >= 3 ? { chorusRow: stanzaNumber } : {}),
      })),
      completeChorusSegments: [3, 4, 5].map(musicSegment => ({ voiceId: '11', musicSegment })),
      inheritedStanzaSegments: [{ voiceId: '11', musicSegment: 2 }],
    },
  };
}

/** Byte-matched OpenPsalm MusicXML explicitly starts the shared refrain at
 * measure 9 (Sound), 17 (Great/Tell), or 25 (Praise). Both lyric-bearing parts
 * carry one sung lane and two spacer lanes; none belongs only to verse 1.
 * The complete-source gate is shared with the independently reviewed carrier
 * pairs. Preserve every original lyric byte and each carrier's spacer vector. */
function getOpenPsalmRefrain(songId: string | undefined, abc: string): ReviewedUnderlay | undefined {
  const starts: Readonly<Record<string, number>> = {
    'hymn-remaining-openpsalm-sound-the-battle-cry': 2,
    'hymn-remaining-openpsalm-great-is-thy-faithfulness': 4,
    'hymn-remaining-openpsalm-praise-him-praise-him': 6,
    'hymn-remaining-openpsalm-tell-me-the-story-of-jesus': 4,
  };
  const start = songId ? starts[songId] : undefined;
  if (start === undefined || !getReportedDuplicateCarriers(songId, abc)) return undefined;
  const source = abc.replace(/\r\n/g, '\n');
  const model = extractUnderlayModel(source);
  const segments = [...new Set(model.rows.filter(row => row.musicSegment >= start).map(row => row.musicSegment))];
  return {
    abc: source,
    identityOnly: true,
    stanzaNumbers: model.stanzaNumbers,
    chorusCarriers: [],
    identity: {
      rows: model.rows.map(({ voiceId, musicSegment, stanzaNumber, sourceText }) => ({
        voiceId, musicSegment, sourceText,
        stanzaNumber: musicSegment >= start ? 0 : stanzaNumber,
        role: musicSegment >= start ? 'chorus' : 'stanza',
        ...(musicSegment >= start ? { chorusRow: stanzaNumber } : {}),
      })),
      completeChorusSegments: ['1', '3'].flatMap(voiceId => segments.map(musicSegment => ({ voiceId, musicSegment }))),
    },
  };
}

/** Restrict an already source-qualified All Creatures witness to all four
 * original parts. Partial selections retain the unsplit published variant:
 * their grouped lyric transfer or native geometry is not qualified. Never
 * rebuild a source or change another edition's witness for this part gate. */
export function qualifyAllCreaturesUnderlayParts(
  songId: string | undefined, reviewed: ReviewedUnderlay | undefined, visibleVoiceIndexes: readonly number[],
): ReviewedUnderlay | undefined {
  return songId === 'hymn-oh_all-creatures-of-our-god-and-king-lasst-uns-erfreuen' && reviewed &&
    !(visibleVoiceIndexes.length === 4 && [0, 1, 2, 3].every(part => visibleVoiceIndexes.includes(part)))
    ? undefined : reviewed;
}

/** Bind the reviewed roles to the entire pristine source before any transform.
 * A changed note, row, header, or voice fails closed. No text similarity is
 * used to infer that two half-stanzas or two chorus carriers are equivalent. */
export function getReviewedUnderlay(songId: string | undefined, abc: string): ReviewedUnderlay | undefined {
  if (songId === 'hymn-oh_all-creatures-of-our-god-and-king-lasst-uns-erfreuen') return getAllCreaturesUnderlay(songId, abc);
  if (songId === 'hymn-tt-my-faith-has-found-a-resting-place') return getFaithUnderlay(abc);
  if (songId === 'hymn-oh_he-keeps-me-singing-he-keeps-me-singing-melody-of-love') return getHeKeepsUnderlay(abc);
  if (songId === 'hymn-oh_when-the-roll-is-called-up-yonder-when-the-roll-is-called-up-yonder') return getRollUnderlay(abc);
  if (songId === 'hymn-remaining-openpsalm-i-will-sing-the-wondrous-story') return getWondrousUnderlay(abc);
  const openPsalm = getOpenPsalmRefrain(songId, abc);
  if (openPsalm) return openPsalm;
  if (songId === 'hymn-tt-supplemental-onward-christian-soldiers') return getOnwardUnderlay(abc);
  if (songId === 'hymn-final-htg-near-to-the-heart-of-god') return getNearUnderlay(abc);
  const spec = songId ? sources[songId] : undefined;
  if (!songId || !spec || abc.replace(/\r\n/g, '\n') !== spec.source) return undefined;
  const cached = cache.get(songId);
  if (cached) return cached;
  const lines = spec.source.split('\n');
  const segments: { voiceId: string; musicSegment: number; lineIndex: number; rows: string[] }[] = [];
  const nextSegment = new Map<string, number>();
  let voiceId = '', inBody = false;
  let current: typeof segments[number] | undefined;
  for (const [lineIndex, line] of lines.entries()) {
    const voice = /^V:([^\s]+)(.*)$/.exec(line);
    if (voice) { voiceId = voice[1]; inBody = !voice[2].trim(); current = undefined; continue; }
    const inlineVoice = /^\[V:([^\s\]]+)[^\]]*\]\s*/.exec(line);
    if (inlineVoice) { voiceId = inlineVoice[1]; inBody = true; }
    if (/^w:/.test(line)) {
      if (!current) return undefined;
      current.rows.push(line.replace(/^w:\s*/, ''));
      continue;
    }
    const music = (inlineVoice ? line.slice(inlineVoice[0].length) : line).trim();
    if (inBody && music && !music.startsWith('%') && !/^[A-Za-z]:/.test(music)) {
      const musicSegment = nextSegment.get(voiceId) ?? 0;
      nextSegment.set(voiceId, musicSegment + 1);
      current = { voiceId, musicSegment, lineIndex, rows: [] };
      segments.push(current);
    }
  }
  const identities: UnderlayRowIdentity[] = [];
  const replacementRows = new Map<number, string[]>();
  for (const segment of segments) {
    const part = spec.parts.find(item => item.voiceId === segment.voiceId && item.musicSegment === segment.musicSegment);
    if (!part) { if (segment.rows.length) return undefined; continue; }
    const rows = segment.rows;
    if (rows.length !== part.stanzaNumbers.length && !(part.chorusRows && rows.length === 0)) return undefined;
    const preparedRows = rows.map((sourceText, rowIndex) => {
      const stanzaNumber = part.stanzaNumbers[rowIndex];
      const repeatPass = spec.paired ? rowIndex % 2 + 1 : 1;
      // Only the beginning of the complete stanza receives a new label.
      // Original continuation labels (389b's later verses) remain untouched.
      const label = segment.musicSegment === 0 && repeatPass === 1 && stanzaNumber > 0 && !/^\d+\.(?:\s|~)/.test(sourceText);
      const text = label ? `${stanzaNumber}.~${sourceText}` : sourceText;
      identities.push({ voiceId: part.voiceId, musicSegment: part.musicSegment, sourceText: text,
        stanzaNumber, repeatPass, role: stanzaNumber === 0 ? 'chorus' : 'stanza' });
      return `w:${text}`;
    });
    for (const sourceText of part.chorusRows ?? []) {
      // Alternative complete carriers are used only when the printed shared
      // Soprano carrier is hidden. The full score retains its original rows.
      if (!identities.some(row => row.voiceId === part.voiceId && row.musicSegment === part.musicSegment && row.sourceText === sourceText)) {
        identities.push({ voiceId: part.voiceId, musicSegment: part.musicSegment,
          sourceText, stanzaNumber: 0, repeatPass: 1, role: 'chorus' });
      }
    }
    replacementRows.set(segment.lineIndex, preparedRows);
  }
  if (spec.parts.some(part => !segments.some(segment => part.voiceId === segment.voiceId && part.musicSegment === segment.musicSegment))) return undefined;
  const prepared: ReviewedUnderlay = {
    abc: lines.flatMap((line, index) => /^w:/.test(line) ? [] : [line, ...(replacementRows.get(index) ?? [])]).join('\n'),
    identity: { rows: identities },
    stanzaNumbers: spec.stanzaNumbers,
    chorusCarriers: spec.parts.filter(part => part.chorusRows),
  };
  cache.set(songId, prepared);
  return prepared;
}

/** Supply one complete chorus carrier when Soprano is hidden. Alto/Bass and
 * Soprano/Tenor retain their different printed mercy onsets; no note changes.
 * Apply before generic donor transfer, with the source-bound witness. */
export function presentReviewedChorus(abc: string, visibleVoiceIds: readonly string[], reviewed?: ReviewedUnderlay): string {
  if (!reviewed?.chorusCarriers.length || visibleVoiceIds.includes('T1')) return abc;
  const model = extractUnderlayModel(abc, reviewed.identity);
  // An empty print selection removes the source chorus. Never recreate it.
  if (model.ambiguous || !model.rows.length || !reviewed.identity.rows.filter(row => row.voiceId === 'T1' && row.role === 'chorus').every(expected =>
    model.rows.some(row => row.voiceId === expected.voiceId && row.musicSegment === expected.musicSegment && row.sourceText === expected.sourceText))) return abc;
  const carrier = ['T2', 'B1', 'B2'].find(voiceId => visibleVoiceIds.includes(voiceId));
  if (!carrier) return abc;
  const parts = reviewed.chorusCarriers.filter(part => part.voiceId === carrier);
  if (!parts.length) return abc;
  let voiceId = '', musicSegment = -1;
  const next = new Map<string, number>();
  let replacement: ReviewedPart | undefined;
  return abc.split(/\r?\n/).flatMap(line => {
    const voice = /^V:([^\s]+)/.exec(line);
    if (voice) { voiceId = voice[1]; replacement = undefined; }
    const music = /^\[V:([^\s\]]+)[^\]]*\]\s*/.exec(line);
    if (music) {
      voiceId = music[1];
      musicSegment = next.get(voiceId) ?? 0;
      next.set(voiceId, musicSegment + 1);
      replacement = parts.find(part => part.voiceId === voiceId && part.musicSegment === musicSegment);
      if (replacement) return [line, ...replacement.chorusRows!.map(text => `w:${text}`)];
    }
    return replacement && /^w:/.test(line) ? [] : [line];
  }).join('\n');
}

/** Read complete poems in singing order: all music segments of repeat pass 1,
 * then all music segments of repeat pass 2. Shared chorus text appears once;
 * its distinct lower echoes stay in the score and the existing echo addendum. */
export function reconstructReviewedUnderlayTranscript(songId: string | undefined, abc: string): readonly string[] | undefined {
  const reviewed = getReviewedUnderlay(songId, abc);
  if (!reviewed) return undefined;
  const rows = reviewed.identity.rows.filter(row => row.voiceId === 'T1');
  // Imported editions keep their existing source-derived prose transcript.
  if (!rows.length) return undefined;
  const fragment = (row: UnderlayRowIdentity) => row.sourceText.replace(/^\d+\.(?:\s|~)*/, '').trim();
  const transcript = reviewed.stanzaNumbers.map(number => `${number}. ${rows
    .filter(row => row.stanzaNumber === number)
    .sort((left, right) => (left.repeatPass ?? 1) - (right.repeatPass ?? 1) || left.musicSegment - right.musicSegment)
    .map(fragment).join(' ')}`);
  const chorus = rows.filter(row => row.role === 'chorus').sort((a, b) => a.musicSegment - b.musicSegment);
  if (chorus.length) transcript.push(`Chorus: ${chorus.map(fragment).join(' ')}`);
  transcript.push(...abc.split(/\r?\n/).flatMap(line => /^W:Echo:/.test(line) ? [line.slice(2)] : []));
  return transcript;
}
