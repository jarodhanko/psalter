import abcjs from 'abcjs';
import { normalizeScreenCandidateViewport, readScreenElementSize, readScreenScoreGeometry, readScreenScoreIdentity, sameScreenScoreGeometry } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { containScreenSvgSystems } from './screenSvgBounds';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

const ATTRIBUTE = 'data-psalter47-opening-wrap';
const ATTRIBUTE44 = 'data-psalter44-opening-wrap';
const ATTRIBUTE31 = 'data-psalter31-opening-wrap';
const ATTRIBUTE25 = 'data-psalter25-opening-wrap';
const ATTRIBUTE26 = 'data-psalter26-terminal-wrap';
const ATTRIBUTE50 = 'data-psalter50-opening-wrap';
const ATTRIBUTE28 = 'data-psalter28-opening-wrap';
export function clearPsalterGroupedOpeningWrap(host: HTMLElement) {
  host.removeAttribute(ATTRIBUTE);
  host.removeAttribute(ATTRIBUTE44);
  host.removeAttribute(ATTRIBUTE31);
  host.removeAttribute(ATTRIBUTE25);
  host.removeAttribute(ATTRIBUTE26);
  host.removeAttribute(ATTRIBUTE28);
  host.removeAttribute(ATTRIBUTE50);
}
const EPSILON = 0.05;
const close = (a: number, b: number) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= EPSILON;
// Frozen current corrected source SHA-256 363496ddf03b5687a34eb377b8976179998baf9b6f0f8ca7bd35af8c3babe6d8.
// The October 3 report predates seven later pitch corrections. Preserve those
// corrections and bind the complete edition, not an imported mutable source.
const SOURCE = "\nT:The Cross of Calvary\nC:Tune: HEBRON; Lowell Mason\nR:Psalm 22, L. M.\nM:3/4\nL:1/8\nK:Bb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nF2 | D F G2 F2 | G A B2 B2 | A c d2 B2 | A G F2 F2 | B c d2 B2 | e d c2 c2 | d B G2 F2 | G A B2 |]\nw:1.~My God, My God, I cry to Thee; O why hast Thou for-sak-en Me? A-far from Me, Thou dost not heed, Though day and night for help I plead.\nw:2.~But Thou art ho-ly in Thy ways, En-throned up-on Thy peo-ple's praise; Our fa-thers put their trust in Thee, Be-lieved, and Thou didst set them free.\nw:3.~They cried, and, trust-ing in Thy Name, Were saved, and were not put to shame; But in the dust My hon-or lies, While all re-proach and all de-spise.\nw:4.~My words a cause for scorn they make, The lip they curl, the head they shake; And mock-ing, bid Me trust the Lord Till He sal-va-tion shall af-ford.\nw:5.~My trust on Thee I learned to rest When I was on My moth-er's breast; From birth Thou art My God a-lone, Thy care My life has ev-er known.\nw:6.~O let Thy strength and pres-ence cheer, For trou-ble and dis-tress are near; Be Thou not far a-way from Me, I have no source of help but Thee.\nw:7.~Un-num-bered foes would do Me wrong, They press a-bout Me, fierce and strong, Like beasts of prey their rage they vent, My cour-age fails, My strength is spent.\nw:8.~Down un-to death Thou lead-est Me, Con-sumed by thirst and ag-o-ny; With cru-el hate and an-ger fierce My help-less hands and feet they pierce.\nw:9.~While on My wast-ed form they stare, The gar-ments torn from Me they share, My shame and sor-row heed-ing not, And for My robe they cast the lot.\nw:10.~O Lord, a-far no long-er stay; O Thou My help-er, haste, I pray; From death and e-vil set Me free; I live, for Thou didst an-swer Me.\nw:11.~I live and will de-clare Thy fame Where breth-ren gath-er in Thy Name; Where all Thy faith-ful peo-ple meet, I will Thy wor-thy praise re-peat.\nV:T2\nD2 | B, D E2 D2 | E E D2 F2 | F F F2 G2 | F =E F2 F2 | F F F2 F2 | F F F2 F2 | F F E2 D2 | E E D2 |]\nV:B1\nB,2 | B, B, B,2 B,2 | B, F, F,2 D2 | C A, B,2 D2 | C B, A,2 F,2 | F, A, B,2 B,2 | A, B, A,2 A,2 | B, B, B,2 B,2 | B, F, F,2 |]\nV:B2\nB,,2 | B,, B,, B,,2 B,,2 | E, F, B,,2 B,,2 | F, F, B,2 B,,2 | C, C, F,2 F,2 | D, F, B,2 D,2 | C, B,, F,2 F,2 | B, D, E,2 B,,2 | E, F, B,,2 |]\n";
// Only the all-four-part, second group (stanzas 6–10 of 11), prepared by the
// ordinary renderer at five stanzas per tune. Other groups remain untouched.
// Derive the exact prepared witness from the immutable literal above. This
// removes only duplicate metadata and the other six numbered lyric rows; it
// does not prepare caller input or admit any changed canonical/group source.
const withoutMetadata = (source: string) => source.replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '');
const PREPARED = withoutMetadata(SOURCE).replace(/^w:(?:[1-5]|11)\.~.*\n/gm, '');
// P44's complete current edition is immutable too. Its four independently
// admitted one-stanza copies retain all notes and intentional lyric blanks.
// SHA-256 3fd5f6e57cc6213011fcd28538c3bc1ecc0f3f2ab5016889be12927f7c4908e8.
const SOURCE44 = "\nT:The Safeguards of Prayer\nC:WIRTH; William B. Bradbury\nM:3/4\nL:1/8\nK:Ab\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE2 | E A c A A F | E4 A2 | G A B2 A2 | (A2 G2) | E2 | c c d d c A | (AG BA) GF | E A A2 G2 | A4 |]\nw:1.~Je-ho-vah hear thee in the day When troub-le He doth send; * And let our cov-enant-keep-ing God * * * From * ev-'ry ill de-fend.\nw:2.~O let Him send His help to thee Forth from His ho-ly place; * Let Him from Zi-on, His own hill, * * * Sus- * tain thee by His grace.\nw:3.~May He re-mem-ber all thy gifts, Ac-cept thy sac-ri-fice, * And, grant-ing thee thy heart's de-sire, * * * Ful- * fill thy coun-sels wise.\nw:4.~In thy sal-va-tion we will joy; When thou to God dost pray, * May He give an-swer, in Whose Name * * * Our * ban-ners we dis-play.\nV:T2\nC2 | C E E E D D | C4 E2 | E E E2 E2 | E4 | E2 | E E F F E E | (FE GF) ED | E C E2 D2 | C4 |]\nV:B1\nA,2 | A, C A, A, F, A, | A,4 C2 | B, C D2 C2 | (C2 B,2) | G,2 | A, A, A, A, A, A, | A,4 A,2 | A, E, C2 B,2 | A,4 |]\nV:B2\nA,,2 | A,, A,, A,, C, D, D, | A,,4 A,,2 | E, E, E,2 E,2 | E,4 | E,2 | A,, A,, A,, A,, A,, C, | D,4 D,2 | C, A,, E,2 E,2 | A,,4 |]\n";
// Frozen CALM edition, including the rest-aware canonical Bass underlay.
// SHA-256 3b64c6b3fed6611959ae6846e962a3949bf5616d9477b89da610d428ff50f7c9.
const SOURCE31 = "%abc-2.1\nT:The Prayer of the Righteous\nC:Tune: CALM; Thomas Hastings\nR:Psalm 17; C.H.M.\nM:6/4\nL:1/4\nK:C\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble name=\"Soprano\"\nV:T2 clef=treble name=\"Alto\"\nV:B1 clef=bass name=\"Tenor\"\nV:B2 clef=bass name=\"Bass\"\nV:T1\nE/2F/2 | G2 G e2 d | (c B) A (G F) || E | A2 G (G F) E | (E3 D2) || E/2F/2 | G2 G e2 d | (c B) A (G E) || G | A2 d c2 B | c3-c2 || c | B2 c d2 c | (c B) c d2 || c/2B/2 | A2 A G2 c/2d/2 | e3 d3 | c3-c2 ||\nw:1.~Lord, * hear the right, re- gard * my cry, * My prayer from lips * sin- cere; * Send * Thy ap- prov- al from * on high, * My right- eous- ness make clear. * Thou in the night my heart * hast tried, Nor * found it turned from * Thee a- side. *\nw:2.~With * stead- fast cour- age I * de- sign * No wrong to speak * or do; * Thy * path of life I choose * for mine, * And walk with pur- pose true. * For help, O God, I cry * to Thee, As- * sured that Thou wilt * an- swer me. *\nw:3.~O * Thou that ev- er sav- * est those * Whose trust on Thee * is stayed, * Pre- * serv- ing them from all * their foes * By Thy al- might- y aid. * Let me Thy lov- ing- kind- * ness see, Thy * won- drous mer- cy, * full and free. *\nw:4.~O * guard me well as one * doth guard * The ap- ple of * the eye; * While * dead- ly foes are press- * ing hard, * To Thee, to Thee I cry. * Do Thou my rest and ref- * uge be, O * let Thy wings o'er- * shad- ow me. *\nw:5.~My * en- e- my, grown strong * in pride, * Would take my life * a- way, * A * li- on lurk- ing by * my side, * Most greed- y for his prey. * Con- front and cast him down, * O Lord, From * e- vil save me * by Thy sword. *\nw:6.~De- * fend me from the men * of pride, * Whose por- tion is * be- low, * Who, * with life's treas- ures sat- * is- fied, * No bet- ter por- tion know; * They, with earth's joys and wealth * con- tent, Must * leave them all when * life is spent. *\nw:7.~When * I in right- eous- ness * at last * Thy glo- rious face * shall see, * When * all the wea- ry night * is past, * And I a- wake with Thee * To view the glo- ries that * a- bide, Then, * then I shall be * sat- is- fied. *\nV:T2\nC/2D/2 | E2 E G2 F | (E G) F (E D) || C | C2 C B,2 C | (C3 B,2) || C/2D/2 | E2 E G2 F | (E G) F (E C) || C | C2 F E2 D | E3-E2 || E | D2 E F2 E | (E D) E F2 || E | F2 F E2 G/2A/2 | G3 F3 | E3-E2 ||\nV:B1\nC | C2 C C2 G, | G,2 C (C G,) || G, | F,2 G, G,2 G, | G,3-G,2 || G, | C2 C C2 G, | G,2 C C2 || G, | F,2 A, G,2 G, | G,3-G,2 || C | G,2 G, G,2 C | G,2 G, G,2 || C | C2 C C2 C | C3 B,3 | C3-C2 ||\nV:B2\nC, | C,2 C, C,2 C, | C,2 C, C,2 || C, | F,2 E, D,2 C, | G,,3-G,,2 || C, | C,2 C, C,2 C, | C,2 C, C,2 || E, | F,2 D, G,2 G, | C,3-C,2 || z | z6 | z2 z z2 || C, | F,2 F, C2 E,/2F,/2 | G,3 G,,3 | C,3-C,2 ||\nw:1.~Lord, hear the right, re- gard my cry, My prayer from lips sin- cere; * Send Thy ap- prov- al from on high, My right- eous- ness make clear. * * * * * * Nor found it turned from * Thee a- side. *\nw:2.~With stead- fast cour- age I de- sign No wrong to speak or do; * Thy path of life I choose for mine, And walk with pur- pose true. * * * * * * As- sured that Thou wilt * an- swer me. *\nw:3.~O Thou that ev- er sav- est those Whose trust on Thee is stayed, * Pre- serv- ing them from all their foes By Thy al- might- y aid. * * * * * * Thy won- drous mer- cy, * full and free. *\nw:4.~O guard me well as one doth guard The ap- ple of the eye; * While dead- ly foes are press- ing hard, To Thee, to Thee I cry. * * * * * * O let Thy wings o'er- * shad- ow me. *\nw:5.~My en- e- my, grown strong in pride, Would take my life a- way, * A li- on lurk- ing by my side, Most greed- y for his prey. * * * * * * From e- vil save me * by Thy sword. *\nw:6.~De- fend me from the men of pride, Whose por- tion is be- low, * Who, with life's treas- ures sat- is- fied, No bet- ter por- tion know; * * * * * * Must leave them all when * life is spent. *\nw:7.~When I in right- eous- ness at last Thy glo- rious face shall see, * When all the wea- ry night is past, And I a- wake with Thee * * * * * * Then, then I shall be * sat- is- fied. *";
// Only its first five-stanza group after the existing printed-carrier
// presentation. Derive from this immutable witness, never caller input.
// Prepared SHA-256 6cc8a2ecd8e5f3c0ce3df661988725959cc95c89fff2b38c489f3f3dd7834e94.
const PREPARED31 = (() => {
  let voice = '';
  return withoutMetadata(SOURCE31).split('\n').filter(line => {
    const declaration = /^V:([^\s]+)/.exec(line);
    if (declaration) voice = declaration[1];
    return !line.startsWith('w:') || voice === 'T1' && /^w:[1-5]\.~/.test(line);
  }).map(line => line.startsWith('V:') ? line.replace(/\s+name="[^"]*"/g, '') : line).join('\n');
})();
// Frozen LISBON edition and complete four-stanza, all-parts screen witness.
// SHA-256 3c74b87b2f9eb069bc2ed151fa4b3a8af8bc5d18983d1a5e2ac119e99226995c.
const SOURCE25 = "%abc-2.1\nT:The Godly Man\nC:Tune: LISBON; Daniel Read\nR:Psalm 15; S.M.\nM:3/4\nL:1/8\nK:Ab\n%%score (S A)(T B)\nV:S clef=treble name=\"Soprano\"\nV:A clef=treble name=\"Alto\"\nV:T clef=bass name=\"Tenor\"\nV:B clef=bass name=\"Bass\"\nV:S\n  A2 | F E A2 B2 | c4 || c2 | B A d2 c2 | B4 || E2 | A A A2 B2 | c c c2 || e2 | e d c2 B2 | A4 |]\nw:1.~Lord, who shall come to Thee, And stand be-fore Thy face? Who shall a-bide, a wel-come guest, With-in Thy ho-ly place?\nw:2.~The man of up-right life, Sin-cere in word and deed, Who slan-ders nei-ther friend nor foe, Nor i-dle tales will heed.\nw:3.~Who hon-ors god-ly men, But scorns the false and vile, Who keeps his prom-ised word to all, Tho' loss be his the while.\nw:4.~Who loves not u-su-ry, Nor takes a base re-ward; Un-moved for-ev-er he shall be, And stand be-fore the Lord.\nV:A\n  C2 | D C C2 E2 | E4 || E2 | D C F2 E2 | E4 || E2 | E E E2 E2 | E E E2 || E2 | F F E2 D2 | C4 |]\nV:T\n  A,2 | A, A, A,2 G,2 | A,4 || A,2 | G, A, A,2 A,2 | G,4 || E,2 | A, A, A,2 G,2 | A, A, A,2 || A,2 | A, A, A,2 G,2 | A,4 |]\nV:B\n  A,,2 | A,, A,, F,2 E,2 | A,,4 || A,,2 | E, F, D,2 A,,2 | E,4 || E,2 | C, C, C,2 E,2 | A, A, A,2 || C,2 | D, D, E,2 E,2 | A,,4 |]";
const PREPARED25 = withoutMetadata(SOURCE25).replace(/^(V:.*)\s+name="[^"]*"/gm, '$1');
// Frozen INNOCENTS edition. Only the observed retained terminal boundary is
// eligible; all earlier systems and the existing combined-carrier presentation
// remain intact. SHA-256 6d0e1c886d3e88f61daa082231830ab900f475da878e502749041f7e81c524fa.
const SOURCE26 = "%abc-2.1\nT:An Ideal Worshiper\nC:Tune: INNOCENTS; The Parish Choir\nR:Psalm 15; 7s\nS:Psalter No. 26; annotated photo 20260829_110814.jpg; clean scan 1912/Score/_26.webp\nM:4/4\nL:1/4\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble name=\"Soprano\"\nV:T2 clef=treble name=\"Alto\"\nV:B1 clef=bass name=\"Tenor\"\nV:B2 clef=bass name=\"Bass\"\nV:T1\n  G> A | B e d c | B2 || E > F | G B A G | F2 ||\nw:1.~Who, O Lord, shall dwell with Thee In the tem-ple of Thy grace?\nw:2.~He who walks in right-eous-ness, All his ac-tions just and clear;\nw:3.~He to whom does not be-long Tongue of mal-ice or de-ceit;\nw:4.~Who the wick-ed man will spurn, Hon-or those that fear the Lord;\nw:5.~Who no u-su-ry will claim, Nor with bribes pol-lute his hand:\n  G > A | B e d c | B2 || E > F | G A G F | E2 |]\nw:Who Thy con-stant guest shall be In Thy high and ho-ly place?\nw:He whose words the truth ex-press, Spo-ken from a heart sin-cere.\nw:Who will not his neigh-bor wrong, Nor a slan-derous tale re-peat.\nw:Nor will from his prom-ise turn Tho' but loss be his re-ward.\nw:He who thus his life shall frame Shall un-moved for-ev-er stand.\nV:T2\n  E > D | E G F E/2F/2 | G2 || B, > D | E F E E | D2 ||\n  E > D | E G F > E | D2 || E > D | E F E D | E2 |]\nw:1.~Who Thy con-stant guest shall be In Thy high and ho-ly place?\nw:2.~He whose words the truth ex-press, Spo-ken from a heart sin-cere.\nw:3.~Who will not his neigh-bor wrong, Nor a slan-derous tale re-peat.\nw:4.~Nor will from his prom-ise turn Tho' but loss be his re-ward.\nw:5.~He who thus his life shall frame Shall un-moved for-ev-er stand.\nV:B1\n  B, > A, | G, B, A,/2B,/2 C/2D/2 | E2 || G, > A, | B, D C B, | B,2 ||\n  B, > A, | G, G, B, =A, | B,2 || B,  > B, | B, C B, A, | G,2 |]\nV:B2\n  E, > F, | G, E, F,/2G,/2 A, | E,2 || G, > F, | E, B,, C, E, | B,,2 ||\n  E, > F, | G, C, D,/2E,/2 F, | (B, A,) || G, > F, | E, A,, B,, B,, | E,2 |]";
// Derive the exact prepared witness from the immutable source, never caller
// input. Only the five supplemental Alto rows and duplicate labels disappear.
// Prepared SHA-256 131353505299110544937af5c4a79590fc351e510d62f077445d711697c8384a.
const PREPARED26 = (() => {
  let voice = '';
  return withoutMetadata(SOURCE26).split('\n').filter(line => {
    const declaration = /^V:([^\s]+)/.exec(line);
    if (declaration) voice = declaration[1];
    return !line.startsWith('w:') || voice === 'T1';
  }).map(line => line.startsWith('V:') ? line.replace(/\s+name="[^"]*"/g, '') : line).join('\n');
})();
// Frozen MAITLAND edition: all four voices and five complete stanza rows.
// Canonical SHA-256 2c7ad3294dc0d1a1793538bc8983495a60e12b4b0d81bfe9cdb02d78a283604f.
const SOURCE28 = "%abc-2.1\nT:Fellowship with God\nC:Tune: MAITLAND; George N. Allen\nR:Psalm 16; C.M.\nM:6/4\nL:1/4\nK:Bb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble name=\"Soprano\"\nV:T2 clef=treble name=\"Alto\"\nV:B1 clef=bass name=\"Tenor\"\nV:B2 clef=bass name=\"Bass\"\nV:T1\n  D/2E/2 | F2 F B2 d | c2 B (G < B) || G | F2 F B2 d | c3-c2 || d/2e/2 | f2 d B2 d | c2 B (G<B) || G | F2 B d2 c | B3-B2 |]\nw:1.~When * in the night I med-i-tate * On mer-cies mul-ti-plied, * My * grate-ful heart in-spires my tongue * To bless the Lord, my Guide. *\nw:2.~For- * ev-er in my tho't the Lord * Be-fore my face shall stand; * Se- * cure, un-moved, I shall re-main, * With Him at my right hand. *\nw:3.~My * in-most be-ing thrills with joy * And glad-ness fills my breast; * Be- * cause on Him my trust is stayed, * My flesh in hope shall rest. *\nw:4.~I * know that I shall not be left * For-got-ten in the grave, * And * from cor-rup-tion, Thou, O Lord, * Thy ho-ly one wilt save. *\nw:5.~The * path of life Thou show-est me; * Of joy a bound-less store * Is * ev-er found at Thy right hand, * And pleas-ures ev-er-more. *\nV:T2\n  B,/2C/2 | D2 D D2 F | E2 E (E < G) || E | F2 C F2 F | F3-F2 || F | F2 F D2 F | E2 E (E < G) || E | F2 D F2 E | D3-D2 |]\nV:B1\n  B, | B,2 B, F,2 B, | G,2 G, B,2 || B, | B,2 A, B,2 B, | A,3-A,2 || B,/2C/2 | D2 B, F,2 B, | G,2 G, B,2 || B, | B,2 B, B,2 A, | B,3-B,2 |]\nV:B2\n  B,, | B,,2 B,, B,,2 B,, | E,2 E, E,2 || E, | D,2 F,/2E,/2 D,2 D, | F,3-F,2 || B, | B,2 B, B,,2 B,, | E,2 E, E,2 || E, | D,2 B,, F,2 F, | B,,3-B,,2 |]";
// Derive only from the immutable witness, never caller input. The format
// marker and every source offset remain intact; only duplicate labels go.
// Prepared SHA-256 4c8f4b4cc341f6fa26a181c629e3cbfab8a9582799d1105952516ed1dc68c218.
const PREPARED28 = withoutMetadata(SOURCE28).replace(/^(V:.*)\s+name="[^"]*"/gm, '$1');
// Frozen TOURS edition, preserving the later Alto courtesy flat.
// Canonical SHA-256 0b5188271349507004f813613b0160aab271e845b20ef6f25f9ff74f69c13bb1.
const SOURCE50 = "\nT:The Dominion of Jesus Christ\nC:Tune: TOURS; Berthold Tours\nR:Psalm 22, 7s and 6s\nM:4/4\nL:1/8\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nG A | B2 e2 d2 c2 | B4 G2 || E F | G2 E F G2 F2 | E6 || G =A | B2 e2 d2 c2 | B4 G2 || G =A | B2 G =A B2 A2 | G6 || B2 | B2 B2 c2 e2 | d4 B2 || B c | d2 B c d2 c2 | B6 || B2 | e2 B2 B2 A2 | G4 E2 || E F | G2 E F G2 F2 | E6 |]\nw:1.~Come, * ye that fear Je-ho-vah, Ye * saints, your * voi-ces raise; Come, * stand in awe be-fore Him, And * sing His * glo-rious praise. Ye low-ly and af-flict-ed Who * on His * word re-ly, Your heart shall live for ev-er, The * Lord will * sat-is-fy.\nw:2.~All * kin-dreds of the na-tions To * Christ the * Lord shall turn, Thro' * earth's re-mot-est re-gions His * al-tar- * fires shall burn. All king-dom, pow'r, and glo-ry Be- * long to * Him a-lone; He rul-eth o'er the na-tions, Kings * bow be- * fore His throne.\nw:3.~Both * high and low shall wor-ship, Both * strong and * weak shall bend; A * faith-ful Church shall serve Him Till * gen-er- * a-tions end. His praise shall be re-count-ed To * na-tions * yet to be, The tri-umphs of His jus-tice A * new-born * world shall see.\nV:T2\nG2 | F2 E2 E2 E2 | E4 E2 || E2 | D2 E2 E2 D2 | E6 || E2 | F2 ^F2 G2 D2 | D4 D2 || G2 | F2 E2 D2 D2 | D6 || D2 | A2 G2 G2 _G2 | F4 F2 || E2 | D2 G2 F2 _E2 | D6 || D2 | E2 E D C2 D C | =B,4 C2 || C2 | _B,2 =A,2 B,2 B,2 | B,6 |]\nV:B1\nE2 | D2 C2 B,2 A,2 | G,4 E,2 || G,2 | G,2 G, A, B,2 A,2 | G,6 || B,2 | B,2 =A,2 D2 ^F,2 | G,4 B,2 || E2 | D2 C2 G,2 ^F, C | B,6 || B, C | D2 E2 E D C2 | D4 D2 || B,2 | B,2 D C B, G, =A,2 | B,6 || A,2 | G,2 E,2 E,2 F, E, | D,4 E,2 || E,2 | E,2 E,2 E,2 D, _A, | G,6 |]\nV:B2\nE,2 | E,2 E,2 A,,2 C, D, | E,4 E,2 || C,2 | =B,,2 C,2 _B,,2 B,,2 | E,6 || E,2 | D,2 C,2 B,,2 =A,,2 | G,,4 G,2 || E,2 | B,,2 C,2 D,2 D,2 | G,6 || G,2 | F,2 E, D, C, B,, =A,,2 | B,,4 B,2 || G,2 | F,2 =E,2 F,2 F,2 | B,,6 || B,,2 | C,2 G,,2 A,,2 F,,2 | G,,4 C,2 || A,,2 | G,,2 F,,2 B,,2 B,,2 | E,6 |]\n";
// Only duplicate headings are omitted. TuneBook strips the original leading
// newline; native event offsets are checked against that exact wrapped source.
// Prepared SHA-256 1d8ccdad33bd3cd36ab558326b0b893c3717620920da310c7dcedd6e89676cfd.
const PREPARED50 = withoutMetadata(SOURCE50);
/** Opening beat reflow reuses the exact existing prepared witness. */
export function psalter50WrappedNotation(prepared: string): string | undefined {
  if (prepared !== PREPARED50) return;
  const book = new abcjs.TuneBook(prepared);
  return prepared.startsWith('\n') && !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 1 &&
    book.tunes[0].abc === prepared.slice(1).trimEnd() ? book.tunes[0].abc : undefined;
}
// Whole unit 2: two independent attacks per voice, eight heads. Exact wrapped offsets.
const REMAINDER50 = [[0, 128, 132, 0.5], [0, 132, 135, 0.25], [1, 1146, 1150, 0.5], [1, 1150, 1153, 0.25], [2, 1379, 1384, 0.5], [2, 1384, 1388, 0.25], [3, 1657, 1662, 0.5], [3, 1662, 1666, 0.25]] as const;
function safePsalter50Remainder(score: NonNullable<ReturnType<typeof readScreenScoreIdentity>>) {
  return REMAINDER50.every(([voice,start,end,duration]) => {
    const notes = score.notes.filter(note => note.voice === voice && note.element.startChar === start && note.element.endChar === end);
    return notes.length === 1 && notes[0].element.duration === duration && !notes[0].element.rest &&
      notes[0].element.pitches?.length === 1 && !notes[0].element.pitches[0].startTie && !notes[0].element.pitches[0].endTie;
  });
}
const profiles = {
  psalter50: { source: SOURCE50, groups: [PREPARED50], verses: 3, notes: 231, voices: [62,54,60,55],
    durations: [0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75, 0.25, 1, 0.75], singles: [5,11,17,18,23] },
  psalter28: { source: SOURCE28, groups: [PREPARED28], verses: 5, notes: 129, voices: [34, 33, 31, 31],
    durations: [0.25, 1.5, 1.25, 0.25, 1.5, 1.25, 0.25, 1.5, 1.25, 0.25, 1.5, 1.25], singles: [3, 9] },
  psalter26: { source: SOURCE26, groups: [PREPARED26], verses: 5, notes: 118, voices: [28, 29, 30, 31],
    durations: [0.5, 1, 0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 0.5, 1, 0.5], singles: [2, 5, 11] },
  psalter25: { source: SOURCE25, groups: [PREPARED25], verses: 4, notes: 104, voices: [26, 26, 26, 26],
    durations: [0.25, 0.75, 0.5, 0.25, 0.75, 0.5, 0.25, 0.75, 0.5, 0.25, 0.75, 0.5],
    singles: [0, 2, 3, 5, 6, 9, 11] },
  psalter31: { source: SOURCE31, groups: [PREPARED31], verses: 5, notes: 205, voices: [57, 55, 48, 45],
    durations: [0.25, 1.5, 1.25, 0.25, 1.5, 1.25, 0.25, 1.5, 1.25, 0.25, 1.5, 1.25, 0.25, 1.5, 1.25, 0.25, 1.5, 1.5, 1.25],
    singles: [3, 9] },
  psalter47: { source: SOURCE, groups: [PREPARED], verses: 5, notes: 128, voices: [32, 32, 32, 32],
    durations: [0.25, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.75, 0.5], singles: [0] },
  psalter44: { source: SOURCE44, groups: [1, 2, 3, 4].map(stanza =>
    withoutMetadata(SOURCE44).replace(/^w:(\d+)\.~.*\n/gm, (row, number) => Number(number) === stanza ? row : '')),
    verses: 1, notes: 122, voices: [33, 32, 29, 28],
    durations: [0.25, 0.75, 0.75, 0.75, 0.5, 0.25, 0.75, 0.75, 0.75, 0.5], singles: [0, 5, 9] },
};
const profileFor = (songId: string | undefined) => songId === 'psalter50' ? profiles.psalter50 : songId === 'psalter28' ? profiles.psalter28 : songId === 'psalter47' || songId === 'psalter44' || songId === 'psalter31' || songId === 'psalter25' || songId === 'psalter26' ? profiles[songId] : undefined;
const optionKeys = ['afterParsing', 'accentAbove', 'add_classes', 'selectionColor', 'dragColor', 'clickListener',
  'oneSvgPerLine', 'minPadding', 'responsive', 'scale', 'staffwidth', 'visualTranspose', 'viewportHorizontal', 'wrap'];
type Settings = { requestedScale: number; scoreWidth: number; transpose: number; stanzasPerGroup: number;
  visibleKey?: string; grouped?: boolean; musicOnly?: boolean; learnerAccidentals?: boolean;
  repeatUnderlay?: boolean; reviewedUnderlay?: boolean };
type NativeWidths = { left: number; measureWidths: number[]; total: number };
type GeometryDiagnostic = NonNullable<Parameters<typeof readScreenScoreGeometry>[3]>;

export function hasPsalterGroupedOpeningSource(songId: string | undefined, source: string) {
  return source === profileFor(songId)?.source;
}
function supported(host: HTMLElement, options: abcjs.AbcVisualParams, settings: Settings, verses: number) {
  return abcjs.signature === 'abcjs-basic v6.7.0' && host.isConnected &&
    !!host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches && !host.closest('.print-score-canvas') &&
    settings.requestedScale === 1 && settings.transpose === 0 && settings.stanzasPerGroup === verses &&
    Number.isFinite(settings.scoreWidth) && settings.scoreWidth > 0 &&
    Number.isFinite(options.staffwidth) && close(options.staffwidth!, settings.scoreWidth) &&
    Object.keys(options).every(key => optionKeys.includes(key)) && options.accentAbove === true && options.add_classes === true &&
    options.oneSvgPerLine === true && options.minPadding === 6 && options.responsive === 'resize' && options.scale === 1 &&
    (options.visualTranspose ?? 0) === 0 && options.viewportHorizontal === false && !!options.wrap &&
    Object.keys(options.wrap).every(key => ['minSpacing', 'maxSpacing', 'preferredMeasuresPerLine'].includes(key)) &&
    options.wrap.minSpacing === 1.5 && options.wrap.maxSpacing === 2.7 && options.wrap.preferredMeasuresPerLine === 0;
}
function grouping(tune: abcjs.TuneObject) {
  return tune.lines.every(line => line.staff?.length === 2 && line.staff.every(staff => {
    const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
    return staff.voices?.length === 2 && group.brace === undefined && group.bracket === undefined && group.connectBarLines === undefined;
  }));
}

type ScreenScore = NonNullable<ReturnType<typeof readScreenScoreIdentity>>;
type RestSize = { width: number; height: number; screenWidth: number; screenHeight: number };
type RestSnapshot = { key: string; sizes: RestSize[] }[];
// Exact offsets in PREPARED31, in source order. The full-measure z6 is
// promoted to a whole-rest glyph by ABCJS 6.7's abstract engraver.
const RESTS31 = [
  [2026, 2029, 0.25, 'rest'], [2030, 2034, 1.5, 'whole'],
  [2035, 2039, 0.5, 'rest'], [2039, 2041, 0.25, 'rest'], [2041, 2044, 0.5, 'rest'],
] as const;
function psalter31Rests(score: ScreenScore, parsed = false) {
  const rests = score.notes.filter(note => !!note.element.rest);
  return rests.length === RESTS31.length && rests.every(({ voice, element }, index) => {
    const [start, end, duration, type] = RESTS31[index];
    return voice === 3 && element.startChar === start && element.endChar === end && element.duration === duration &&
      element.rest?.type === (parsed ? 'rest' : type) && Object.keys(element.rest).length === 1 &&
      !element.pitches?.length && !element.lyric?.length;
  }) ? rests : undefined;
}
function readPsalter31SourceIdentity(tune: abcjs.TuneObject | undefined, source: string) {
  const parsed = readScreenScoreIdentity(tune, source);
  const rests = parsed && psalter31Rests(parsed, true);
  if (!rests || source.slice(2030, 2034) !== ' z6 ') return undefined;
  // Detached parse witness only: mirror the exact native rest-to-whole
  // promotion. Every other source/event field and both live tunes stay intact.
  rests[1].element.rest!.type = 'whole';
  return readScreenScoreIdentity(tune, source);
}
function readPsalter31RestSizes(host: HTMLElement, score: ScreenScore): RestSnapshot | undefined {
  const rests = psalter31Rests(score);
  if (!rests) return undefined;
  const result: RestSnapshot = [], seen = new Set<SVGElement>();
  for (const { voice, element } of rests) {
    const roots = element.abselem?.elemset;
    if (!roots?.length) return undefined;
    const sizes: RestSize[] = [];
    for (const root of roots) {
      if (!(root instanceof SVGGraphicsElement) || !host.contains(root) || seen.has(root)) return undefined;
      seen.add(root);
      const size = readScreenElementSize(root);
      if (!size) return undefined;
      sizes.push(size);
    }
    result.push({ key: JSON.stringify([voice, element.startChar, element.endChar, element.duration, element.rest]), sizes });
  }
  return result;
}
function samePsalter31RestSizes(before: RestSnapshot, after: RestSnapshot | undefined) {
  return !!after && before.length === after.length && before.every((rest, index) =>
    rest.key === after[index].key && rest.sizes.length === after[index].sizes.length &&
    rest.sizes.every((size, root) => (Object.keys(size) as (keyof RestSize)[]).every(key =>
      close(size[key], after[index].sizes[root][key]))));
}

/** Shared transaction for immutable screen-score boundary profiles.
 * Native estimates reject this pair at a witnessed phone width even though
 * full native engraving can fit at the original glyph size. Try the ordinary
 * 15-unit margins first; only P28/P44/P47 may reclaim seven units per side.
 * P44/P50 may transfer complete unit1 from [1,2], retaining complete unit2.
 * P26 joins only the terminal [10],[11] pair at ordinary margins. P50 admits
 * only source-bound [0],[1] or [0],[1,2] openings, at ordinary margins with
 * fresh native fit proof at every render. Every
 * other boundary, shared planner rule, lyric and source offset stays intact.
 * Acceptance still requires complete source identity, ink, clearance, physical
 * geometry and independent native typography proof. A refusal restores the
 * original listener-bearing nodes and tune rather than reparsing or cloning. */
export function reflowPsalterGroupedOpeningScreenScore(host: HTMLElement, canonical: string | undefined,
  prepared: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  original: abcjs.TuneObjectArray, settings: Settings): abcjs.TuneObjectArray {
  clearPsalterGroupedOpeningWrap(host);
  const profile = profileFor(songId), psalter44 = songId === 'psalter44', psalter31 = songId === 'psalter31', psalter25 = songId === 'psalter25', psalter26 = songId === 'psalter26';
  const psalter28 = songId === 'psalter28', psalter50 = songId === 'psalter50';
  if (!profile || !songId) return original;
  const attribute = psalter50 ? ATTRIBUTE50 : psalter28 ? ATTRIBUTE28 : psalter26 ? ATTRIBUTE26 : psalter25 ? ATTRIBUTE25 : psalter31 ? ATTRIBUTE31 : psalter44 ? ATTRIBUTE44 : ATTRIBUTE;
  const diagnostic: Record<string, unknown> = { version: 1, result: 'original', reason: 'unsupported', settings };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(attribute, JSON.stringify(diagnostic)); } catch { /* Read-only diagnostic. */ }
    return tunes;
  };
  let retained: Node[] | undefined, attributes: [string, string][] | undefined;
  try {
    if (canonical !== profile.source) return finish(original, 'source-canonical');
    if (!profile.groups.includes(prepared)) return finish(original, 'source-group');
    // P28 also retains its format marker and original event offsets.
    const prefix = psalter28 ? 0 : psalter31 || psalter25 || psalter26 ? 0 : 1;
    const wrapped = prepared.slice(prefix);
    if ((psalter25 || psalter26) && (settings.visibleKey !== '0,1,2,3' || settings.grouped !== false || settings.musicOnly !== false ||
      settings.learnerAccidentals !== false || settings.repeatUnderlay !== false || settings.reviewedUnderlay !== false ||
      host.closest('.score-verse-group'))) return finish(original, 'unsupported');
    if ((psalter28 || psalter50) && (settings.visibleKey !== '0,1,2,3' || settings.grouped !== false || settings.musicOnly !== false ||
      settings.learnerAccidentals !== false || settings.repeatUnderlay !== false || settings.reviewedUnderlay !== false ||
      host.closest('.score-verse-group'))) return finish(original, 'unsupported');
    if (!supported(host, options, settings, profile.verses) || original.length !== 1) return finish(original, 'unsupported');
    const book = new abcjs.TuneBook(prepared);
    if ((prefix === 1 && !prepared.startsWith('\n')) || book.header || book.tunes.length !== 1 ||
      book.tunes[0].startPos !== prefix ||
      book.tunes[0].abc !== wrapped.trimEnd()) return finish(original, 'source-prefix');
    const before = readScreenScoreIdentity(original[0], wrapped);
    const parsed = abcjs.parseOnly(wrapped, { lineBreaks: [[]] as unknown as number[] })[0];
    const source = psalter31 ? readPsalter31SourceIdentity(parsed, wrapped) : readScreenScoreIdentity(parsed, wrapped);
    if (!before || !source || before.signature !== source.signature || !grouping(original[0]) || !grouping(parsed) ||
      before.meter !== (psalter50 ? 1 : psalter28 ? 1.5 : psalter26 ? 1 : psalter31 ? 1.5 : 0.75) || before.units.length !== profile.durations.length || before.notes.length !== profile.notes ||
      before.units.some((unit, index) => unit.duration !== profile.durations[index] ||
        unit.singleAttack !== profile.singles.includes(index)) ||
      profile.voices.some((count, voice) => before.notes.filter(note => note.voice === voice).length !== count) ||
      (psalter31 && before.notes.reduce((count, note) => count + (note.element.pitches?.length ?? 0), 0) !== 200) ||
      ((psalter25 || psalter26) && before.notes.some(note => note.element.rest || note.element.pitches?.length !== 1)))
      return finish(original, 'source-identity');
    if ((psalter28 || psalter50) && before.notes.some(note => note.element.rest || note.element.pitches?.length !== 1))
      return finish(original, 'source-identity');
    // P28 joins complete units 0 and 1 only at the native witnessed partition.
    // Unit 1 has no internal bar; no source split or later boundary is allowed.
    if (psalter28 && JSON.stringify(before.systems) !== '[[0],[1],[2,3],[4],[5,6],[7],[8],[9,10],[11]]')
      return finish(original, 'unaffected-opening');
    // The generic helper has already repaired the late orphan. Only its exact
    // retained 375-width partition admits the additional opening join.
    if (psalter25 && JSON.stringify(before.systems) !== '[[0],[1],[2,3],[4],[5,6],[7],[8,9],[10,11]]')
      return finish(original, 'unaffected-opening');
    if (psalter26 && JSON.stringify(before.systems) !== '[[0],[1],[2,3],[4],[5,6],[7],[8,9],[10],[11]]')
      return finish(original, 'unaffected-terminal');
    // P50's exact source admits only these two complete-unit opening shapes;
    // every later current-system boundary is cloned into the candidate plan.
    const opening = JSON.stringify(before.systems.slice(0, 2));
    if (!psalter26 && opening !== '[[0],[1]]' && !((psalter44 || psalter50) && opening === '[[0],[1,2]]')) return finish(original, 'unaffected-opening');
    if (psalter50 && opening === '[[0],[1,2]]' && !safePsalter50Remainder(before)) return finish(original, 'source-remainder');
    const padding = original[0].engraver?.renderer?.padding;
    const section = (original[0] as abcjs.TuneObject & { explanation?: { widths?: NativeWidths; staffWidth?: number }[] }).explanation;
    const widths = section?.[0]?.widths;
    if (padding?.left !== 15 || padding.right !== 15 || original[0].engraver?.width !== options.staffwidth ||
      original[0].formatting.staffwidth !== undefined || original[0].formatting.leftmargin !== undefined ||
      original[0].formatting.rightmargin !== undefined || (((!psalter44 && !psalter31 && !psalter25 && !psalter26) || section !== undefined) && (
        section?.length !== 1 || section[0].staffWidth !== options.staffwidth ||
        !widths || !Number.isFinite(widths.left) || widths.left < padding.left || widths.left >= options.staffwidth! ||
        widths.measureWidths.length !== profile.durations.length || widths.measureWidths.some(width => !Number.isFinite(width) || width <= 0) ||
        !close(widths.measureWidths.reduce((sum, width) => sum + width, 0), widths.total)))) return finish(original, 'native-widths');
    // P44/P31/P25/P26 may receive the generic helper's explicit-lineBreaks render, which
    // has no wrap explanation. Actual engraving and every geometry guard
    // remain mandatory; present explanations and all P47 renders stay strict.
    if (section === undefined) diagnostic.widthWitness = 'retained-engraver';
    preserveBlankLyricRows(host);
    const proof: GeometryDiagnostic = { version: 1, song: songId, phase: 'baseline', result: 'original' };
    const geometry = readScreenScoreGeometry(host, before, psalter50 || psalter28 || psalter25 || psalter26, proof);
    diagnostic.geometry = proof;
    if (!geometry || ((psalter25 || psalter26) && (!close(geometry.width, options.staffwidth! + 30) || host.querySelector('.abcjs-rest'))))
      return finish(original, 'original-geometry');
    // P28's ordinary engraving is slightly wider than requested staff + 30.
    // Keep that measured envelope; the candidate may never enlarge it.
    if (psalter28 && (geometry.width < options.staffwidth! + 30 || host.querySelector('.abcjs-rest')))
      return finish(original, 'original-geometry');
    if (psalter50 && ((opening === '[[0],[1,2]]'
      ? geometry.width < options.staffwidth! + 30 : !close(geometry.width, options.staffwidth! + 30)) || host.querySelector('.abcjs-rest')))
      return finish(original, 'original-geometry');
    const rests = psalter31 ? readPsalter31RestSizes(host, before) : undefined;
    if (psalter31 && !rests) return finish(original, 'original-rest-geometry');
    const typography = captureLyricTypography(host, before.notes, geometry);
    if (!typography) return finish(original, 'original-typography');
    // P44 and this exact P50 opening admit a complete-unit transfer.
    // Remaining unit2 has two attacks per voice; no new lone chord is created.
    const remainder = before.systems[1].slice(1);
    const systems = psalter26
      ? [...before.systems.slice(0, -2).map(system => [...system]), [10, 11]]
      : [[0, 1], ...(remainder.length ? [remainder] : []), ...before.systems.slice(2).map(system => [...system])];
    diagnostic.originalUnits = before.systems; diagnostic.plannedUnits = systems;
    const attempts: Record<string, unknown>[] = [];
    diagnostic.attempts = attempts;
    retained = [...host.childNodes]; attributes = [...host.attributes].map(attribute => [attribute.name, attribute.value]);
    const originalTune = original[0];
    const restore = () => {
      host.replaceChildren(...retained!);
      for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
      for (const [name, value] of attributes!) host.setAttribute(name, value);
      const nodes = [...host.childNodes];
      return {
        nodes: nodes.length === retained!.length && nodes.every((node, index) => node === retained![index]),
        attributes: JSON.stringify([...host.attributes].map(attribute => [attribute.name, attribute.value])) === JSON.stringify(attributes),
        tune: original[0] === originalTune,
        sourceIdentity: readScreenScoreIdentity(original[0], wrapped)?.signature === before.signature,
      };
    };
    const { wrap: _wrap, ...explicit } = options;
    // P31/P25/P26/P50 admit ordinary margins only, with no wider fallback.
    for (const margin of psalter50 || psalter31 || psalter25 || psalter26 ? [15] : [15, 8]) {
      // The first attempt keeps the requested staffwidth and both margins.
      // P47 retains its exact fourteen-unit budget. P28/P44 may retain their
      // slightly wider native viewport, never enlarge it or shrink glyphs.
      const staffwidth = margin === 15 ? options.staffwidth! : geometry.width - margin * 2;
      if (margin === 8 && psalter28 &&
        (geometry.width < options.staffwidth! + 30 || staffwidth + 16 !== geometry.width)) continue;
      if (margin === 8 && !psalter28 && (psalter44
        ? geometry.width < options.staffwidth! + 30 || staffwidth + 16 !== geometry.width
        : geometry.width !== options.staffwidth! + 30 || staffwidth !== options.staffwidth! + 14)) continue;
      const attempt: Record<string, unknown> = { margin, reason: 'candidate-exception',
        layout: { requestedStaffwidth: options.staffwidth, staffwidth, originalViewport: geometry.width,
          ...(widths && { [psalter26 ? 'terminalEstimate' : 'openingEstimate']: psalter26
            ? widths.measureWidths[10] + widths.measureWidths[11] : widths.measureWidths[0] + widths.measureWidths[1],
            available: staffwidth - (widths.left - padding.left) }), paddingleft: margin, paddingright: margin } };
      attempts.push(attempt);
      host.replaceChildren();
      try {
        const candidate = abcjs.renderAbc(host, wrapped, { ...explicit, staffwidth,
          paddingleft: margin, paddingright: margin,
          lineBreaks: [systems.slice(0, -1).map(system => system.at(-1)!)] as unknown as number[] });
        const after = candidate.length === 1 && readScreenScoreIdentity(candidate[0], wrapped);
        if (!after || after.signature !== before.signature || !grouping(candidate[0]) ||
          JSON.stringify(after.systems) !== JSON.stringify(systems)) attempt.reason = 'candidate-identity';
        else {
          preserveBlankLyricRows(host);
          const candidateProof: GeometryDiagnostic = { version: 1, song: songId, phase: 'candidate', result: 'candidate' };
          attempt.geometry = candidateProof;
          if (!normalizeScreenCandidateViewport(host, candidate[0], after, geometry, candidateProof)) attempt.reason = 'candidate-viewport';
          else {
            containScreenSvgSystems(host);
            const next = readScreenScoreGeometry(host, after, true, candidateProof);
            const nextPadding = candidate[0].engraver?.renderer?.padding;
            if (!next || !sameScreenScoreGeometry(geometry, next, candidateProof) || next.width !== geometry.width ||
              candidate[0].engraver?.width !== staffwidth || nextPadding?.left !== margin || nextPadding.right !== margin ||
              ((psalter25 || psalter26) && host.querySelector('.abcjs-rest')))
              attempt.reason = 'candidate-geometry';
            else if ((psalter28 || psalter50) && host.querySelector('.abcjs-rest'))
              attempt.reason = 'candidate-geometry';
            else if (psalter31 && !samePsalter31RestSizes(rests!, readPsalter31RestSizes(host, after)))
              attempt.reason = 'candidate-rest-geometry';
            else {
              const captured = captureLyricTypography(host, after.notes, next);
              const text = captured && verifyLyricTypography(host, typography, captured, { preserveNaturalWidth: true });
              attempt.typography = text;
              const complete28 = !psalter28 || !!text && text.rows === 204 && text.compared === text.rows &&
                text.nativeControls === text.rows * 2 && text.measurements > 0 &&
                text.naturalWidthMeasurements === text.measurements && !host.querySelector('[data-lyric-typography-reference]');
              const complete50 = !psalter50 || !!text && text.rows === 248 && text.compared === text.rows &&
                text.nativeControls === text.rows * 2 && text.measurements > 0 &&
                text.naturalWidthMeasurements === text.measurements && !host.querySelector('[data-lyric-typography-reference]');
              if (complete50 && complete28 && text?.valid && (!(psalter25 || psalter26) || text.rows === (psalter26 ? 168 : 130) &&
                (!psalter26 || text.compared === text.rows && text.nativeControls === text.rows * 2) &&
                text.measurements > 0 && text.naturalWidthMeasurements === text.measurements &&
                !host.querySelector('[data-lyric-typography-reference]'))) {
                attempt.reason = 'accepted'; diagnostic.result = 'candidate'; diagnostic.margin = margin;
                return finish(candidate, 'accepted');
              }
              attempt.reason = 'candidate-typography';
            }
          }
        }
      } catch { attempt.reason = 'candidate-exception'; }
      diagnostic.reason = attempt.reason;
      // Each failed attempt restores the original nodes and attributes before
      // another candidate may render. The original tune and click mapping live on.
      const rollback = restore();
      attempt.rollback = rollback;
      if (!Object.values(rollback).every(Boolean)) throw new Error('Unable to restore original score');
    }
  } catch { diagnostic.reason = 'exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of [...host.attributes]) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, String(diagnostic.reason));
}
