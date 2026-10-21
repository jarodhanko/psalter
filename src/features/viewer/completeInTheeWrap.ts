import abcjs from 'abcjs';
import type EngraverController from 'abcjs/src/write/engraver-controller';
import { calcLineWraps } from 'abcjs/src/parse/wrap_lines';
import { readScreenScoreGeometry, readScreenScoreIdentity, renderScreenScore, normalizeScreenCandidateViewport } from './isolatedChordWrap';
import { preserveBlankLyricRows } from './lyricRows';
import { withInheritedHymnClefs } from './inheritedHymnClefs';
import { captureLyricTypography, verifyLyricTypography } from './lyricTypography';

// Frozen Mobile Hymns BITTIKOFER edition, canonical SHA-256:
// a1533292ac7cc29c4440aed0e49a08e1d7aa430a0b539cad311cf1179fdb5495.
// Bind before any display transformation; a revised edition needs fresh proof.
const sourceWitness = "X:1\nT:Complete in Thee\nT:BITTIKOFER\nC:Aaron R. Wolfe; refrain James M. Gray\nC:Talmage J. Bittikofer, 1921\nS:Mobile Hymns public-domain-labelled score, downloaded 2026-09-30\nZ:Source-assisted transcription preserving four source voices, four verses and common refrain\nN:Historical Bittikofer tune, not the modern Nyce setting. US-PD source basis; non-US rights review required.\nN:Common refrain placed after four verse rows; source displays its beginning inline on verse2 row for space.\nN:No added tempo or arrangement.\nM:3/2\nL:1/4\n%%score { ( 1 2 ) | ( 3 4 ) }\n%%staffsep 100\nV:1 clef=treble name=\"Soprano\"\nV:2 clef=treble name=\"Alto\"\nV:3 clef=bass name=\"Tenor\"\nV:4 clef=bass name=\"Bass\"\nK:F\n[V:1] C A G | F3 F E D | E3 C E F | G3 \nw: 1.~Com- plete in Thee! no work of mine May take, dear Lord,\nw: 2.~Com- plete in Thee! no more shall sin, Thy grace hath con-\nw: 3.~Com- plete in Thee— each want sup- plied, And no good thing\nw: 4.~Dear Sav- ior, when, be- fore Thy bar All tribes and tongues\n[V:1] E C B | A3 C A G | F3 F G A | B3 \nw: the place of Thine; Thy blood hath par- don bought for me,\nw: quered, reign with- in; Thy voice shall bid the tempt- er flee,\nw: to me de- nied; Since Thou my por- tion, Lord, will be,\nw: as- sem- bled are, A- mong Thy cho- sen I will be,\n[V:1] d d d | c3 A G3/2 F/ | F3 \nw: And I am now com- plete in Thee.\nw: And I shall stand com- plete in Thee.\nw: I ask no more, com- plete in Thee.\nw: At Thy right hand, com- plete in Thee.\n[V:1] c c c | c3 A G F | E3 \nw: Yea, jus- ti- fied! O bless- ed thought!\n[V:1] c c c | c3 B G ^G | A3 C A G \nw: And sanc- ti- fied! Sal- va- tion wrought! Thy blood hath\n[V:1] | F3 F G A | B3 d d d | c3 B A G | F3 |]\nw: par- don bought for me, And glo- ri- fied, I too, shall be!\n[V:2] C F E | F3 C C C | C3 B, B, A, | B,3 \n[V:2] B, B, D | C3 C F E | F3 F E _E | D3 \n[V:2] F F F | F3 F E3/2 F/ | F3 \n[V:2] F F F | F3 F F F | C3 \n[V:2] E E E | E3 E E E | F3 C F E \n[V:2] | F3 F E _E | D3 F F F | F3 E E E | F3 |]\n[V:3] A, C B, | A,3 A, G, F, | G,3 E, G, F, | E,3 \n[V:3] G, G, E, | F,3 A, C B, | A,3 A, B, C | B,3 \n[V:3] ^G, G, G, | A,3 C B,3/2 A,/ | A,3 \n[V:3] A, A, A, | A,3 C B, A, | C3 \n[V:3] B, B, B, | B,3 G, C C | C3 A, C B, \n[V:3] | A,3 A, B, C | B,3 ^G, G, G, | A,3 G, C B, | A,3 |]\n[V:4] F, F, F, | F,3 F, C, C, | C,3 C, C, C, | C,3 \n[V:4] C, C, C, | F,3 F, F, F, | F,3 F, F, F, | B,,3 \n[V:4] =B,, B,, B,, | C,3 C, C,3/2 F,/ | F,3 \n[V:4] F, F, F, | F,3 F, F, F, | G,3 \n[V:4] C, C, C, | C,3 C, C, C, | F,3 F, F, F, \n[V:4] | F,3 F, F, F, | B,,3 =B,, B,, B,, | C,3 C, C, C, | F,3 |]\n";
const notationWitness = sourceWitness.replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '')
  .replace(/^V:[^\r\n]*$/gm, line => line.replace(/\s+(?:name|subname|nm|snm)=(?:"[^"]*"|'[^']*'|[^\s]+)/g, ''));
// Frozen Mobile Hymns ST. MARGARET edition, canonical SHA-256:
// 7ad0152c427c56883f51071ff82a7db237d40faf23286508845a348862bd6abd.
// O Love has eleven 4/2 units, a half-note pickup and a dotted-whole final
// chord. Its whole bars can stand alone; Complete's cadence join does not apply.
const oLoveSource = "X:1\nT:O Love That Wilt Not Let Me Go\nT:ST. MARGARET\nC:George Matheson, 1882\nC:Albert L. Peace, 1884\nS:Mobile Hymns public-domain-labelled score, downloaded 2026-09-30\nZ:Source-assisted transcription preserving four source voices and all four printed verses\nN:No added tempo or arrangement; source-specific public-domain assertion, not worldwide clearance.\nM:4/2\nL:1/4\n%%score { ( 1 2 ) | ( 3 4 ) }\n%%staffsep 100\nV:1 clef=treble name=\"Soprano\"\nV:2 clef=treble name=\"Alto\"\nV:3 clef=bass name=\"Tenor\"\nV:4 clef=bass name=\"Bass\"\nK:Ab\n[V:1] E2 | E3 E E F G A | (A4 G2) G2 \nw: 1.~O Love that wilt not let me go,_ I\nw: 2.~O Light that foll'- west all my way,_ I\nw: 3.~O Joy that seek- est me through pain,_ I\nw: 4.~O Cross that lift- est up my head,_ I\n[V:1] | G3 G G A B c | (e4 d2) d2 | c3 c \nw: rest my wea- ry soul in Thee;_ I give Thee\nw: yield my flick- ring torch to Thee;_ My heart re-\nw: can- not close my heart to Thee;_ I trace the\nw: dare not ask to fly from Thee;_ I lay in\n[V:1] c B A G | (B4 A2) A2 | A3 A A A \nw: back the life I owe,_ That in Thine o- cean\nw: stores its bor- rowed ray,_ That in Thy sun- shine's\nw: rain- bow through the rain,_ And feel the prom- ise\nw: dust life's glo- ry dead,_ And from the ground there\n[V:1] G F | E3 F G2 A2 | c6 B2 | A6 |]\nw: depths its flow May rich- er, full- er be.\nw: blaze its day May bright- er, fair- er be.\nw: is not vain, That morn shall tear- less be.\nw: blos- soms red Life that shall end- less be.\n[V:2] C2 | E3 E E E =D D | E6 E2 \n[V:2] | E3 E E E G A | B6 E2 | E3 E \n[V:2] =E E E E | (G4 F2) C2 | =D3 D D D \n[V:2] =D D | C3 E E2 E2 | A4 G4 | E6 |]\n[V:3] A,2 | C3 C C C A, A, | (C4 B,2) B,2 \n[V:3] | D3 D D E E E | E6 B,2 | C3 C \n[V:3] C C C C | C6 A,2 | A,3 A, A, C \n[V:3] B, A, | A,3 A, B,2 C2 | E4 D4 | C6 |]\n[V:4] A,,2 | A,3 A, A, A, F, F, | E,6 E,2 \n[V:4] | D3 D D C B, A, | G,6 G,2 | A,3 A, \n[V:4] G, G, C, C, | F,6 F,2 | B,,3 B,, B,, B,, \n[V:4] B,, B,, | E,3 E, E,2 E,2 | E,4 E,4 | A,,6 |]\n";
const oLoveNotation = oLoveSource.replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '')
  .replace(/^V:[^\r\n]*$/gm, line => line.replace(/\s+(?:name|subname|nm|snm)=(?:"[^"]*"|'[^']*'|[^\s]+)/g, ''));
const O_LOVE_ATTRIBUTE = 'data-o-love-wrap';
export function hasOLoveWidthSource(songId: string | undefined, abc: string) {
  return songId === 'hymn-mobile-o-love' && abc.replace(/\r\n/g, '\n') === oLoveSource;
}
// Frozen Winkworth 1863 / Gastorius rhythmic-underlay edition, canonical SHA-256:
// da8bf230672af6db34349c5fd282032bc75b58200afda7a73d54b900d6ba74dc.
// Fifteen units: a quarter-note pickup followed by fourteen complete 4/4 bars.
// Keep all three reviewed subdivisions, five stanza rows and sixteen slurs.
const whateerSource = "X:1\nT:Whate'er My God Ordains Is Right\nT:WAS GOTT TUT / GASTORIUS\nC:Samuel Rodigast; translation Catherine Winkworth, The Chorale Book for England,1863\nC:Severus Gastorius, historical tune\nS:Music: Mobile Hymns PD-labelled Gastorius score; text: Winkworth1863 no.135\nZ:New verified historical-text underlay; source-reference instrumental ABC retained separately\nN:Three explicit melody subdivisions only: quarter37 into two eighths, halves45/53 into quarters. Pitches/order, harmonies and bar totals unchanged.\nN:Five original Winkworth1863 stanzas. Medicine is sung in two syllables; original around wording retained.\nN:This is a new rhythmic underlay edition, not a facsimile, modernGetty tune or exact recording arrangement.\nN:Source-specific US public-domain basis; retain attribution and territory caveats.\nM:4/4\nL:1/4\n%%score { ( 1 2 ) | ( 3 4 ) }\n%%staffsep 95\nV:1 clef=treble name=\"Soprano\"\nV:2 clef=treble name=\"Alto\"\nV:3 clef=bass name=\"Tenor\"\nV:4 clef=bass name=\"Bass\"\nK:F\n[V:1] C | F G A B | c3/ B/ A d | c B A (B/A/) | G2 F \nw: 1.~What- e'er my God or- dains is right, Ho- ly His will a-_ bi- deth;\nw: 2.~What- e'er my God or- dains is right, He nev- er will de-_ ceive me;\nw: 3.~What- e'er my God or- dains is right, His lov- ing thought at-_ tends me;\nw: 4.~What- e'er my God or- dains is right, Though now this cup in_ drink- ing\nw: 5.~What- e'er my God or- dains is right, Here shall my stand be_ tak- en;\n[V:1] C | F G A B | c3/ B/ A d | c B A (B/A/) | G2 F \nw: I will be still what- e'er He doth, And fol- low where He_ gui- deth.\nw: He leads me by the pro- per path, I know He will not_ leave me,\nw: No poi- son'd draught the cup can be That my Phy- si- cian_ sends me,\nw: May bit- ter seem to my faint heart, I take it all un-_ shrink- ing;\nw: Though sor- row, need, or death be mine, Yet am I not for-_ sak- en,\n[V:1] c | d d G G | c/c/ c F A | G F \nw: He is my God, Though dark_ my road, He holds me\nw: And take con- tent What He_ hath sent; His hand can\nw: But med- icine due For God_ is true, And on that\nw: Tears pass a- way With dawn_ of day, Sweet com- fort\nw: My Fa- ther's care Is a- round me there, He holds me\n[V:1] E (F/E/) | D D C c | B A G A | G G F2 |]\nw: that I_ shall not fall, Where- fore to Him I leave it all.\nw: turn my_ griefs a- way, And pa- tient- ly I wait His day.\nw: change- less_ truth I build, And all my heart with hope is fill'd.\nw: yet shall_ fill my heart, And pain and sor- row shall de- part.\nw: that I_ shall not fall, And so to Him I leave it all.\n[V:2] C | D E F F | E G F F | F (D/E/) F F | (F E) C \n[V:2] C | D E F F | E G F F | F (D/E/) F F | (F E) C \n[V:2] F | F F E E | E E D C | C =B, \n[V:2] C C | (C =B,) C F | F F E F | (F E) C2 |]\n[V:3] A, | A, C C B, | G, C C B, | A, B, C D | (C3/ B,/) A, \n[V:3] A, | A, C C B, | G, C C B, | A, B, C D | (C3/ B,/) A, \n[V:3] A, | B, G, G, G, | A, A, A, F, | E, F, \n[V:3] G, (F,/G,/) | A, (G,/F,/) E, C | D C C C | (D C/B,/) A,2 |]\n[V:4] F, | D, C, F, D, | C, E, F, B,, | F, G, F, B,, | C,2 F, \n[V:4] F, | D, C, F, D, | C, E, F, B,, | F, G, F, B,, | C,2 F, \n[V:4] F, | B,, =B,, C, _B,, | A,, C, D, A,, | C, D, \n[V:4] C, (A,,/G,,/) | F,, G,, C, A,, | B,, F, C,/B,,/ A,, | (B,, C,) F,2 |]\n";
const whateerNotation = whateerSource.replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '')
  .replace(/^V:[^\r\n]*$/gm, line => line.replace(/\s+(?:name|subname|nm|snm)=(?:"[^"]*"|'[^']*'|[^\s]+)/g, ''));
const WHATEER_ATTRIBUTE = 'data-whateer-wrap';
export function hasWhateerWidthSource(songId: string | undefined, abc: string) {
  // The existing stafftopmargin witness also binds the exact canonical bytes.
  return songId === 'hymn-winkworth-whateer-gastorius' && abc === whateerSource;
}
// Frozen Thompson edition, canonical SHA-256:
// b6d67a4968a97da5a07cf241d24297aaa1457f0faa6c8f97ab590675d6c642a4.
// Its internal double bar splits one 6/8 bar into units 7 and 8. Keep the
// source's soprano pickup and three visible rests together with that cadence.
const softlySource = "X:1\nT:Softly and Tenderly Jesus Is Calling\nT:THOMPSON\nC:Text and tune: Will L. Thompson, Sparkling Gems Nos.1 & 2, 1880\nS:Hymn Singer / Kenan Schaefkofer; commit4767dd24403f2d9c77f5c825595b6a6c8c2a6404\nZ:ABC conversion from exact LilyPond edition\nN:Three source stanzas corresponding to historical1,2,4 plus common refrain; source tenor echo retained.\nN:Source edition typesetter waives copyright/related rights to extent possible. Underlying work territory assessment required.\nM:6/8\nL:1/16\nQ:1/4=68\n%%score (S A) (T B)\nV:S clef=treble name=\"Soprano\"\nV:A clef=treble name=\"Alto\"\nV:T clef=bass name=\"Tenor\"\nV:B clef=bass name=\"Bass\"\nK:Ab\n[V:S] c3BA2 A2G2A2 | B2A2F2 F2E2 z2 | A2A2A2 c3BA2 | B6- B4 z2 \nw: 1.~Soft- ly and ten- der- ly Je- sus is call- ing, call- ing for you and for me._\nw: 2.~Why should we tar- ry when Je- sus is plead- ing, plead- ing for you and for me?_\nw: 3.~Oh, for the won- der- ful love he has prom- ised, prom- ised for you and for me!_\n[V:S] | c3BA2 A2G2A2 | B2A2F2 F2E2 z2 | A2A2d2 c3AB2 | A6- A4 || E2 \nw: See, on the por- tals he's wait- ing and watch- ing, watch- ing for you and for me._ \"Come\nw: Why should we lin- ger and heed not his mer- cies, mer- cies for you and for me._ *\nw: Though we have sinned he has mer- cy and par- don, par- don for you and for me._ *\n[V:S] | B6- B4 c2 | (A4 B2 c6) | B2B2B2 cc3=d2 | (!fermata!e4 !fermata!=d2 !fermata!_d4) z2 \nw: home,_ come home!__ You who are wea- ry, come home.\"__\nw: * * * * * * * * * * * * * * *\nw: * * * * * * * * * * * * * * *\n[V:S] | c3BA2 A2G2A2 | B2A2F2 F2E2 z2 | AA3d2 c!fermata!A3 !fermata!B2 | A6- A4 z2 |]\nw: Ear- nest- ly, ten- der- ly, Je- sus is call- ing, call- ing, \"O sin- ner, come home!\"_\nw: * * * * * * * * * * * * * * * * * * *\nw: * * * * * * * * * * * * * * * * * * *\n[V:A] E3DC2 E2D2C2 | D2D2D2 D2C2 z2 | E2E2E2 =D3DD2 | E6- E4 z2 \n[V:A] | E3DC2 E2D2C2 | D2D2D2 D2C2 z2 | E2E2F2 E3CD2 | C6- C4 || z2 \n[V:A] | z4 G2 G4 z2 | z4 G2 A6 | G2G2B2 =AA3_A2 | (!fermata!G4 !fermata!A2 !fermata!B4) z2 \n[V:A] | E3DC2 E2D2C2 | D2D2D2 D2C2 z2 | EE3F2 E!fermata!C3 !fermata!D2 | C6- C4 z2 |]\n[V:T] A,3A,A,2 A,2E,2E,2 | F,2F,2A,2 A,2A,2 z2 | C2C2C2 A,3A,B,2 | G,6- G,4 z2 \nw: * * * * * * * * * * * * * * * * * * *\n[V:T] | A,3A,A,2 A,2E,2E,2 | F,2F,2A,2 A,2A,2 z2 | A,2A,2A,2 A,3A,G,2 | A,6- A,4 || z2 \nw: * * * * * * * * * * * * * * * * * * *\n[V:T] | z4 D2 D4 E2 | C4 E2 E6 | E2E2E2 EE3B,2 | (!fermata!B,4 !fermata!B,2 !fermata!E4) z2 \nw: come home, * * Come home! * * * * * * * * *\n[V:T] | A,3A,A,2 A,2E,2E,2 | F,2F,2A,2 A,2A,2 z2 | A,A,3A,2 A,!fermata!A,3 !fermata!G,2 | A,6- A,4 z2 |]\nw: * * * * * * * * * * * * * * * * * * *\n[V:B] A,,3A,,A,,2 C,2B,,2A,,2 | D,2D,2D,2 A,,2A,,2 z2 | A,2A,2A,2 F,3F,F,2 | E,6- E,4 z2 \n[V:B] | A,,3A,,A,,2 C,2B,,2A,,2 | D,2D,2D,2 A,,2A,,2 z2 | C,2C,2D,2 E,3E,E,2 | A,,6- A,,4 || z2 \n[V:B] | z4 E,2 E,4 z2 | z4 E,2 A,6 | B,2B,2G,2 F,F,3B,2 | (!fermata!E,4 !fermata!F,2 !fermata!G,4) z2 \n[V:B] | A,,3A,,A,,2 C,2B,,2A,,2 | D,2D,2D,2 A,,2A,,2 z2 | C,C,3D,2 E,!fermata!E,3 !fermata!E,2 | A,,6- A,,4 z2 |]\n";
const softlyNotation = softlySource.replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '')
  .replace(/^V:[^\r\n]*$/gm, line => line.replace(/\s+(?:name|subname|nm|snm)=(?:"[^"]*"|'[^']*'|[^\s]+)/g, ''));
// Default lyric-policy projection, derived from the already-bound edition.
// Prepared SHA-256 ae5342d08f1382350888416bcd2a01bcb4a62456b47301da6c9616af2ba99e8e.
export const softlyMusicOnlyNotation = softlyNotation.replace(/^[ \t]*[wW]:.*(?:\r?\n|$)/gm, '');
const SOFTLY_ATTRIBUTE = 'data-softly-and-tenderly-wrap';
export function hasSoftlyWidthSource(songId: string | undefined, abc: string) {
  return songId === 'hymn-ly_softly-and-tenderly-thompson' && abc === softlySource;
}
const ATTRIBUTE = 'data-complete-in-thee-wrap';
const EPSILON = 0.05;
type Widths = { left: number; measureWidths: number[]; total: number };
type Geometry = NonNullable<ReturnType<typeof readScreenScoreGeometry>>;
type GeometryMismatch = { field: string; before?: number | string; after?: number | string | null;
  expected?: number; note?: number; item?: number; ratio?: number };
type Diagnostic = { typography?: { rows: number; nativeControls: number; compared: number; measurements: number }; version: 1; result: 'original' | 'candidate'; reason: string;
  requested?: number; originalWidth?: number; candidateWidth?: number;
  convergenceViewport?: { before: number; intended: number; serialized: number; excess: number; increases: number; normalized: boolean };
  candidateSystems?: { system: number; units: number[]; start: number | null; end: number | null;
    target: number; width: number | null; excess: number | null; raises: boolean;
    staff: number[] | null; ink: number[] | null }[]; widthSnapshotUnavailable?: boolean;
  originalUnits?: number[][]; plannedUnits?: number[][]; correctedWidths?: number[]; geometryMismatch?: GeometryMismatch;
  engraver?: { requestedStaffwidth: number; originalWidth: number | null; candidateWidth: number | null;
    originalPadding: [number, number]; candidatePadding: [number | null, number | null] } };

export function hasCompleteInTheeWidthSource(songId: string | undefined, abc: string) {
  return songId === 'hymn-mobile-complete-in-thee' && abc.replace(/\r\n/g, '\n') === sourceWitness;
}

// Frozen Open Hymnal edition. Exact string equality keeps this bounded to the
// reviewed bytes without rehashing them on mobile React updates. Derive the
// all-parts notation witness once, using the viewer's existing clef transform.
const ruggedCrossSource = "%abc-2.1\n% Normalized from Open Hymnal ABCPlus. See companion provenance JSON.\n% Source engraving directive: %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n% Source engraving directive: %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n% Source engraving directive: %%pagewidth\t21.6000cm\n% Source engraving directive: %%pageheight\t27.9000cm\n% Source engraving directive: %%scale\t\t0.750000\n% Source engraving directive: %%staffsep\t0.60000cm\n% Source engraving directive: %%exprabove\tfalse\n% Source engraving directive: %%measurebox\tfalse\n% Source engraving directive: %%postscript /st { moveto -8 0 rmoveto 0 8 rlineto 4 0 rlineto stroke } def\n% Source engraving directive: %%postscript /nd { moveto -8 0 rmoveto 0 8 rlineto -4 0 rlineto stroke } def\n% Source engraving directive: %%deco sintro 6 st 6 0 0\n% Source engraving directive: %%deco eintro 6 nd 6 0 0\nX:1\nT: The Old Rugged Cross\nC: Words: George Bennard, 1913. Music and Setting: 'The Old Rugged Cross' George Bennard, 1913.\nC: copyright: public domain.  This score is a part of the Open Hymnal Project, 2010 Revision.\nS: Music source: 'Gospel Melodies', 1918.  Hymn 194.\nM: 6/4 % time signature\nL: 1/4 % default length\n%%score (S1V1 S1V2) | (S2V1 S2V2)\nV: S1V1 clef=treble\n%%MIDI beat 127 125 110 1\nV: S1V2\n%%MIDI beat 127 125 110 1\nV: S2V1 clef=bass\n%%MIDI beat 127 125 110 1\nV: S2V2\n%%MIDI beat 127 125 110 1\nK: Bb % key signature\n%\n%%MIDI program 1 0 % Piano 1\n%%MIDI program 2 0 % Piano 1\n%%MIDI program 3 0 % Piano 1\n%%MIDI program 4 0 % Piano 1\n%\n% 1\n[V: S1V1] [Q:1/4=140] D/ E/ | F3/2 =E/ G F2 F/ F/ | G3/2 ^F/ A G2 .(G/ G/) | .(A3/2 G/)\nw: 1.~On a hill far a- way stood an old rug- ged cross, The * em- blem\nw: 2.~O that old rug- ged cross, so des- pised by the world, Has a won- drous\nw: 3.~In that old rug- ged cross, stained with blood so di- vine, A * won- *\nw: 4.~To the old rug- ged cross I will ev- er be true; Its * shame and\n[V: S1V2]  B,/ C/ | D3/2 ^C/ C D2 D/ D/ | E3/2 E/ E E2 .(=E/ =E/) | .(E3/2 E/)\n[V: S2V1]  F,/ F,/ | B,3/2 B,/ G, B,2 B,/ B,/ | B,3/2 A,/ C B,2 .(C/ C/) | .(C3/2 A,/)\n[V: S2V2]  B,,/ B,,/ | B,,3/2 B,,/ B,, B,,2 B,,/ B,,/ | E,3/2 E,/ E, E,2 .(C,/ C,/) | .(F,3/2 F,/)\n% 5\n[V: S1V1] F E F E | D3- D2 D/ E/ | F3/2 =E/ G F2 F/ F/ | G3/2 ^F/\nw: of suff'r- ing and shame;  * And I love that old cross where the dear- est\nw: a- ttrac- tion for me;  * For the dear Lamb of God left His glo- ry\nw: drous beau- ty I see,  * For 'twas on that old cross Je- sus suf- fered\nw: re- proach glad- ly bear;  * Then He'll call me some day to my home far\n[V: S1V2]  D C C C | B,3- B,2 B,/ C/ | D3/2 ^C/ C D2 D/ D/ | E3/2 E/\n[V: S2V1]  B, A, A, F, | F,3- F,2 F,/ F,/ | B,3/2 B,/ G, B,2 B,/ B,/ | B,3/2 A,/\n[V: S2V2]  F, F, F, F, | B,,3- B,,2 B,,/ B,,/ | B,,3/2 B,,/ B,, B,,2 B,,/ B,,/ | E,3/2 E,/\n% 9\n[V: S1V1]  A G2 .(G/ G/) | A3/2 G/ F e d c | B3- B2 A/ B/ |\nw: and best For a world of lost sin- ners was slain.  * So I'll\nw: a- bove To * bear it to dark Cal- va- ry.  *  *  *\nw: and died, To * par- don and sanc- ti- fy me.  *  *  *\nw: a- way, Where His glo- ry for- ev- er I'll share.  *  *  *\n[V: S1V2]  E E2 .(=E/ =E/) | E3/2 E/ E G F E | D3- D2 C/ D/ |\n[V: S2V1]  C B,2 .(C/ C/) | C3/2 B,/ A, A, B, A, | B,3- B,2 F,/ F,/ |\n[V: S2V2]  E, E,2 .(C,/ C,/) | F,3/2 F,/ F, F, F, F, | B,,3- B,,2 F,/ F,/ |\n% 13\n[V: S1V1]  c3/2 c/ c c B A | B3- B2 B/ A/ | G3/2 G/ G B A G | F3- F2\nw: cher- ish the old rug- ged cross,  * Till my tro- phies at last I lay down;  *\n[V: S1V2]  E3/2 E/ E E2 E | (D ^C E D2) F/ F/ | E3/2 E/ E G F E | D3- D2\n[V: S2V1]  A,3/2 A,/ A, A,2 F, | (F, =E, G, F,2) B,/ B,/ | B,3/2 B,/ B, B, B, B, | B,3- B,2\n[V: S2V2]  F,3/2 F,/ F, F,2 F, | (B,, B,, B,, B,,2) D,/ D,/ | E,3/2 E,/ E, E, E, E, | B,,3- B,,2\n% 13\n[V: S1V1]  F/ B/ | d3/2 d/ d d e d | G3- G2 e/ e/ | d3/2 c/ B F A c | B3- B2 |]\nw: I will cling to the old rug- ged cross,  * And ex- change it some day for a crown.  *\n[V: S1V2]  D/ D/ | F3/2 F/ F F G F | (E E E E2) G/ G/ | F3/2 E/ D E E E | D3- D2 |]\n[V: S2V1]  B,/ B,/ | B,3/2 B,/ B, B,2 B, | (B, B, B, B,2) B,/ B,/ | B,3/2 A,/ B, A, C F, | F,3- F,2 |]\n[V: S2V2]  B,,/ B,,/ | B,,3/2 B,,/ B,, B,,2 B,, | (E, E, E, E,2) E,/ E,/ | F,3/2 F,/ F, F, F, F, | B,,3- B,,2 |]\n% 19\n";
const ruggedCrossNotation = withInheritedHymnClefs(ruggedCrossSource, 'hymn-oh_the-old-rugged-cross-old-rugged-cross')
  .replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '');
export function hasOldRuggedCrossWidthSource(songId: string | undefined, abc: string) {
  return songId === 'hymn-oh_the-old-rugged-cross-old-rugged-cross' && abc === ruggedCrossSource;
}

/** Prove and retain this edition's one initial inline tempo. The shared
 * identity reader intentionally rejects tempo events; pass it a read-only
 * structural view without that already-verified event, never mutate the tune.
 */
function widthScore(tune: abcjs.TuneObject | undefined, abc: string, ruggedCross: boolean) {
  if (!ruggedCross || !tune) return readScreenScoreIdentity(tune, abc);
  let count = 0, invalid = false;
  const tempos: unknown[] = [];
  const structural = { ...tune, lines: tune.lines.map((line, lineIndex) => ({ ...line,
    staff: line.staff?.map((staff, staffIndex) => ({ ...staff,
      voices: staff.voices?.map((voice, voiceIndex) => voice.filter((raw, eventIndex) => {
        if (raw.el_type !== 'tempo') return true;
        const event = raw as abcjs.VoiceItemTempo;
        count++;
        const token = abc.slice(event.startChar, event.endChar);
        if (lineIndex !== 0 || staffIndex !== 0 || voiceIndex !== 0 ||
          voice.slice(0, eventIndex).some(item => item.el_type !== 'stem') ||
          token !== '[Q:1/4=140]' || event.bpm !== 140 || JSON.stringify(event.duration) !== '[0.25]') invalid = true;
        tempos.push([event.startChar, event.endChar, token, event.bpm, event.duration,
          event.preString, event.postString, event.suppress]);
        return false;
      })),
    })),
  })) };
  if (invalid || count !== 1) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  return score && { ...score, signature: JSON.stringify([score.signature, tempos]) };
}

function tempoIdentity(tune: abcjs.TuneObject) {
  const tempo = tune.metaText.tempo;
  // Engraving adds circular abselem references; compare only source tempo fields.
  return JSON.stringify(tempo && [tempo.bpm, tempo.duration, tempo.preString, tempo.postString, tempo.suppress]);
}

function close(left: number, right: number) { return Math.abs(left - right) <= EPSILON; }
function validWidths(widths: Widths | undefined, positive: boolean, unitCount = 17): widths is Widths {
  return !!widths && Number.isFinite(widths.left) && widths.left >= 0 &&
    Array.isArray(widths.measureWidths) && widths.measureWidths.length === unitCount &&
    widths.measureWidths.every(width => Number.isFinite(width) && (positive ? width > 0 : width >= 0)) &&
    Number.isFinite(widths.total) && close(widths.total, widths.measureWidths.reduce((sum, width) => sum + width, 0));
}

/** The native optimizer minimizes average line-width variance, not the widest
 * line. Subdivide only its over-budget systems at existing barlines. The last
 * half-bar is one sustained chord, so keep it with the preceding full bar.
 * This is a plan only: all existing source, fit and native geometry proofs
 * still apply before any candidate can replace the ordinary rendering.
 */
export function fitCompleteInTheeSystems(systems: number[][], measureWidths: number[], available: number): number[][] | undefined {
  if (!Number.isFinite(available) || available <= 0 || measureWidths.length !== 17 ||
    measureWidths.some(width => !Number.isFinite(width) || width <= 0) ||
    systems.some(system => !system.length) || systems.flat().length !== 17 ||
    systems.flat().some((unit, index) => unit !== index)) return undefined;
  const native = systems.map(system => [...system]);
  if (native.at(-1)!.length === 1) {
    const previous = native.at(-2)!;
    native.at(-1)!.unshift(previous.pop()!);
    if (!previous.length) native.splice(-2, 1);
  }
  const fitted: number[][] = [];
  for (const system of native) {
    let pending: number[] = [], width = 0;
    for (let index = 0; index < system.length; index++) {
      const unit = system[index];
      const block = unit === 15 ? [unit, system[++index]] : [unit];
      const blockWidth = block.reduce((sum, ordinal) => sum + measureWidths[ordinal], 0);
      if (!Number.isFinite(blockWidth) || blockWidth > available + EPSILON) return undefined;
      if (pending.length && width + blockWidth > available + EPSILON) {
        fitted.push(pending);
        pending = [];
        width = 0;
      }
      pending.push(...block);
      width += blockWidth;
    }
    if (pending.length) fitted.push(pending);
  }
  return fitted;
}

/** O Love: preserve every fitting native system and split only over-budget
 * systems at existing whole-bar boundaries. Never join the opening pickup or
 * borrow Complete's final-pair policy. No candidate can discard a source unit.
 */
export function fitOLoveSystems(systems: number[][], measureWidths: number[], available: number): number[][] | undefined {
  return subdivideWholeBarSystems(systems, measureWidths, available, 11);
}

/** Whate'er ends on a complete, multi-attack 4/4 bar. Preserve its native
 * boundaries and pickup; only split an over-budget system at an existing bar.
 */
export function fitWhateerSystems(systems: number[][], measureWidths: number[], available: number): number[][] | undefined {
  return subdivideWholeBarSystems(systems, measureWidths, available, 15);
}

/** Preserve fitting native systems and the reviewed [7, 8] cadence/pickup.
 * Never repair a native split by joining systems: that unreviewed case fails
 * closed. Visible rests make the shared single-attack shortcut inappropriate.
 */
export function fitSoftlySystems(systems: number[][], measureWidths: number[], available: number): number[][] | undefined {
  if (!Number.isFinite(available) || available <= 0 || measureWidths.length !== 17 ||
    measureWidths.some(width => !Number.isFinite(width) || width <= 0) ||
    systems.some(system => !system.length) || systems.flat().length !== 17 ||
    systems.flat().some((unit, index) => unit !== index) ||
    !systems.some(system => system.includes(7) && system.includes(8))) return undefined;
  const fitted: number[][] = [];
  for (const system of systems) {
    let pending: number[] = [], width = 0;
    for (let index = 0; index < system.length; index++) {
      const unit = system[index];
      const block = unit === 7 ? [unit, system[++index]] : [unit];
      const blockWidth = block.reduce((sum, ordinal) => sum + measureWidths[ordinal], 0);
      const terminalWidth = softlyTerminalBarWidth(block.at(-1)!);
      if (!Number.isFinite(blockWidth) || blockWidth + terminalWidth > available + EPSILON) return undefined;
      if (pending.length && width + blockWidth + terminalWidth > available + EPSILON) {
        fitted.push(pending); pending = []; width = 0;
      }
      pending.push(...block); width += blockWidth;
    }
    if (pending.length) fitted.push(pending);
  }
  return fitted;
}

function subdivideWholeBarSystems(systems: number[][], measureWidths: number[], available: number, unitCount: number): number[][] | undefined {
  if (!Number.isFinite(available) || available <= 0 || measureWidths.length !== unitCount ||
    measureWidths.some(width => !Number.isFinite(width) || width <= 0) ||
    systems.some(system => !system.length) || systems.flat().length !== unitCount ||
    systems.flat().some((unit, index) => unit !== index)) return undefined;
  const fitted: number[][] = [];
  for (const system of systems) {
    let pending: number[] = [], width = 0;
    for (const unit of system) {
      const next = measureWidths[unit];
      if (next > available + EPSILON) return undefined;
      if (pending.length && width + next > available + EPSILON) {
        fitted.push(pending); pending = []; width = 0;
      }
      pending.push(unit); width += next;
    }
    if (pending.length) fitted.push(pending);
  }
  return fitted;
}

/** Diagnostic only: retain candidate line geometry before strict rollback.
 * Reconstruct ABCJS 6.7's sequential max-width update from its final groups;
 * do not change layout, tolerances, SVG bounds, or acceptance decisions.
 */
export function recordCandidateSystems(host: HTMLElement, tune: abcjs.TuneObject, units: number[][],
  staffwidth: number, diagnostic: Diagnostic) {
  try {
    const svgs = [...host.querySelectorAll('svg')];
    const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : null;
    const bounds = (element: SVGGraphicsElement | null) => {
      if (!element || typeof element.getBBox !== 'function') return null;
      const box = element.getBBox();
      return Number.isFinite(box.x) && Number.isFinite(box.width) ? [box.x, box.width] : null;
    };
    let target = staffwidth;
    diagnostic.candidateSystems = tune.lines.filter(line => line.staff).slice(0, 20).map((line, system) => {
      const start = number(line.staffGroup?.startx), end = number(line.staffGroup?.w);
      const width = start !== null && end !== null ? end - start : null;
      const raises = width !== null && Math.round(width) > Math.round(target);
      const result = { system, units: units[system] ?? [], start, end, target, width,
        excess: width !== null ? width - target : null, raises,
        staff: bounds(svgs[system]?.querySelector<SVGGraphicsElement>('.abcjs-staff') ?? null),
        ink: bounds(svgs[system] ?? null) };
      if (raises) target = width!;
      return result;
    });
  } catch { diagnostic.widthSnapshotUnavailable = true; }
}

/** Recover only the measured ABCJS 6.7 convergence case. Its per-system
 * spacing loop can stop just under two units from target, then promote that
 * width for later systems. Do not accept a wider score: reclaim at most four
 * units of unused right viewport margin, with all ink still inside the exact
 * requested viewport. Existing post-normalization geometry and native-control
 * typography checks remain mandatory; a rejection restores original nodes.
 */
function normalizeRuggedCrossConvergence(host: HTMLElement, tune: abcjs.TuneObject,
  score: NonNullable<ReturnType<typeof readScreenScoreIdentity>>, geometry: Geometry,
  staffwidth: number, intendedWidth: number, diagnostic: Diagnostic) {
  // SVGRect reflects its width as float32. The shared helper requires exact
  // reflected equality, so pass a representable caller-local target while
  // retaining the mathematical request for all existing geometry checks.
  const viewportWidth = Math.fround(intendedWidth);
  if (!close(viewportWidth, intendedWidth)) return false;
  const inkLimit = Math.min(intendedWidth, viewportWidth);
  const excess = geometry.width - intendedWidth;
  if (!(excess > EPSILON && excess <= 4) || geometry.left !== 0 ||
    tune.engraver?.width !== staffwidth || tune.engraver?.renderer?.padding?.left !== 15 ||
    tune.engraver?.renderer?.padding?.right !== 15) return false;
  const lines = tune.lines.filter(line => line.staff);
  const svgs = [...host.querySelectorAll('svg')];
  if (lines.length !== score.systems.length || svgs.length !== lines.length) return false;
  let target = staffwidth, increases = 0;
  for (const [index, line] of lines.entries()) {
    const group = line.staffGroup;
    if (group?.startx !== 15 || !Number.isFinite(group.w)) return false;
    const width = group.w! - group.startx;
    if (!(width > 0)) return false;
    if (Math.round(width) > Math.round(target)) {
      // This is the native convergence bound, not a relaxed acceptance error.
      if (!(width - target > 0 && width - target < 2)) return false;
      target = width;
      increases++;
    }
    const ink = svgs[index].getBBox();
    if (![ink.x, ink.y, ink.width, ink.height].every(Number.isFinite) ||
      ink.width <= 0 || ink.height <= 0 || ink.x < 2 || ink.x + ink.width + 2 > inkLimit) return false;
  }
  if (!increases || !close(target + 30, geometry.width)) return false;
  diagnostic.convergenceViewport = { before: geometry.width, intended: intendedWidth, serialized: viewportWidth, excess, increases, normalized: false };
  const normalized = normalizeScreenCandidateViewport(host, tune, score, { left: 0, width: viewportWidth });
  diagnostic.convergenceViewport.normalized = normalized;
  return normalized;
}

/** Keep local font/glyph metrics exact. The intended screen-size increase must
 * be explained solely by removing the inflated global viewBox, never by resizing
 * notes, changing fonts, or stretching individual systems. Lyric dimensions
 * receive separate strict native-control and same-transform checks below.
 */
function geometryCheck(diagnostic: Diagnostic, valid: boolean, mismatch: GeometryMismatch) {
  // Record the first failed existing check only. Never expose lyric/source text.
  if (!valid && !diagnostic.geometryMismatch) diagnostic.geometryMismatch = mismatch;
  return valid;
}

function sameNotationSize(before: Geometry, after: Geometry, intendedWidth: number, diagnostic: Diagnostic) {
  const ratio = before.width / intendedWidth;
  const numeric = (field: string, a: number, b: number, expected = a, note?: number, item?: number) =>
    geometryCheck(diagnostic, close(expected, b), { field, before: a, after: b, expected, note, item, ratio });
  const sameSize = (a: Geometry['notes'][number]['heads'][number] | undefined,
    b: Geometry['notes'][number]['heads'][number] | undefined, kind: string, note: number, item: number) => !a || !b ?
    geometryCheck(diagnostic, a === b, { field: `${kind}.presence`, before: Number(!!a), after: Number(!!b), note, item }) :
    numeric(`${kind}.width`, a.width, b.width, a.width, note, item) &&
    numeric(`${kind}.height`, a.height, b.height, a.height, note, item) &&
    numeric(`${kind}.screenWidth`, a.screenWidth, b.screenWidth, a.screenWidth * ratio, note, item) &&
    numeric(`${kind}.screenHeight`, a.screenHeight, b.screenHeight, a.screenHeight * ratio, note, item);
  return numeric('viewport.width', before.width, after.width, intendedWidth) &&
    numeric('viewport.left', before.left, after.left) && numeric('viewport.screenWidth', before.screenWidth, after.screenWidth) &&
    geometryCheck(diagnostic, before.notes.length === after.notes.length,
      { field: 'notes.length', before: before.notes.length, after: after.notes.length }) &&
    before.notes.every((note, index) => {
      const other = after.notes[index];
      return geometryCheck(diagnostic, note.font === other.font,
        { field: 'font', before: note.font?.slice(0, 160), after: other.font?.slice(0, 160), note: index }) &&
        geometryCheck(diagnostic, note.heads.length === other.heads.length,
          { field: 'heads.length', before: note.heads.length, after: other.heads.length, note: index }) &&
        note.heads.every((head, i) => sameSize(head, other.heads[i], 'head', index, i)) &&
        geometryCheck(diagnostic, note.lyrics.length === other.lyrics.length,
          { field: 'lyrics.length', before: note.lyrics.length, after: other.lyrics.length, note: index }) &&
        note.lyrics.every((lyric, i) => geometryCheck(diagnostic, lyric.text === other.lyrics[i].text,
          { field: 'lyric.text', note: index, item: i }));
    });
}

function supportedScreenWidth(host: HTMLElement, abc: string, songId: string | undefined,
  options: abcjs.AbcVisualParams, ruggedCross: boolean) {
  return !((ruggedCross ? abc !== ruggedCrossNotation ||
    !host.ownerDocument.defaultView?.matchMedia?.('(max-width: 600px)').matches ||
    !options.staffwidth || options.staffwidth < 320 || options.staffwidth > 520 :
    songId === 'hymn-ly_softly-and-tenderly-thompson' ? abc !== softlyNotation :
    songId === 'hymn-winkworth-whateer-gastorius' ? abc !== whateerNotation :
    songId === 'hymn-mobile-o-love' ? abc.replace(/\r\n/g, '\n') !== oLoveNotation :
    songId !== 'hymn-mobile-complete-in-thee' || abc.replace(/\r\n/g, '\n') !== notationWitness) ||
    abcjs.signature !== 'abcjs-basic v6.7.0' || options.print || host.closest('.print-score-canvas') ||
    !host.isConnected || !options.wrap || options.lineBreaks ||
    options.oneSvgPerLine !== true || options.responsive !== 'resize' || options.scale !== 1 ||
    options.minPadding !== 6 || (options.visualTranspose ?? 0) !== 0 || options.format ||
    options.expandToWidest || options.timeBasedLayout || options.tablature ||
    options.wrap.minSpacing !== 1.5 || options.wrap.maxSpacing !== 2.7 || options.wrap.preferredMeasuresPerLine !== 0 ||
    options.wrap.minSpacingLimit !== undefined || options.wrap.lastLineLimit !== undefined ||
    options.viewportHorizontal || options.viewportVertical ||
    !Number.isFinite(options.staffwidth) || !(options.staffwidth! > 0) ||
    options.paddingleft !== undefined || options.paddingright !== undefined);
}

export type CompleteInTheeScreenFit = {
  requestedStaffwidth: number; effectiveStaffwidth: number; minimumStaffwidth?: number;
  limited: boolean; accepted: boolean; reason: string;
  // Scalar-only whole-bar metrics for the exact O Love interior transaction.
  wholeUnits?: Widths;
  proof?: {
    checks?: Record<string, boolean>; identityReason?: string; geometryReason?: string; exception?: true;
    typography?: { source: 'native' | 'candidate'; captured: boolean; frameWidths?: number[] } &
      Partial<ReturnType<typeof verifyLyricTypography>>;
  };
};

/** Smallest source-bound whole-bar budget, including the final cadence pair.
 * Reuse the established fit tolerance; round UP to an exactly representable
 * 1/1024 unit so serialized SVG widths cannot round below that same ceiling.
 * This never rounds/clamps the user's requested percentage or stored setting.
 */
export function completeInTheeMinimumStaffWidth(widths: Widths): number | undefined {
  if (!validWidths(widths, true) || widths.left < 15) return undefined;
  const widest = Math.max(...widths.measureWidths.slice(0, -2),
    widths.measureWidths[15] + widths.measureWidths[16]);
  const minimum = Math.ceil((widest + widths.left - 15 - EPSILON) * 1024) / 1024;
  return Number.isFinite(minimum) && minimum > 0 ? minimum : undefined;
}

/** O Love's smallest complete-bar budget. The same representable rounding
 * prevents a requested size increase from crossing below an indivisible bar.
 * Its final chord needs no preceding bar to remain musically complete.
 */
export function oLoveMinimumStaffWidth(widths: Widths): number | undefined {
  return wholeBarMinimumStaffWidth(widths, 11);
}

/** Whate'er's final full bar has no cadence-join requirement. Keep the same
 * representable width ceiling, based on its own fifteen native unit widths.
 */
export function whateerMinimumStaffWidth(widths: Widths): number | undefined {
  return wholeBarMinimumStaffWidth(widths, 15);
}

// ABCJS 6.7 tuneMetrics stops each width at the bar's x, but staff layout
// includes its right edge. Every legal Softly block ends in a one-unit thin
// bar, except the final thin-thick bar (4-unit offset + 4-unit width). Unit 7's
// double bar is internal to protected [7, 8], already counted by that sum.
function softlyTerminalBarWidth(unit: number) { return unit === 16 ? 8 : 1; }

/** Include the terminal bar in each indivisible source block's physical floor.
 * Do not subtract fit tolerance from a hard glyph-width requirement: that
 * would let the requested size cross below the first system's actual width.
 */
export function softlyMinimumStaffWidth(widths: Widths): number | undefined {
  if (!validWidths(widths, true) || widths.left < 15) return undefined;
  const widest = Math.max(...widths.measureWidths.flatMap((width, index) => index === 7 || index === 8 ? [] :
    [width + softlyTerminalBarWidth(index)]), widths.measureWidths[7] + widths.measureWidths[8] + softlyTerminalBarWidth(8));
  const minimum = Math.ceil((widest + widths.left - 15) * 1024) / 1024;
  return Number.isFinite(minimum) && minimum > 0 ? minimum : undefined;
}

function wholeBarMinimumStaffWidth(widths: Widths, unitCount: number): number | undefined {
  if (!validWidths(widths, true, unitCount) || widths.left < 15) return undefined;
  const minimum = Math.ceil((Math.max(...widths.measureWidths) + widths.left - 15 - EPSILON) * 1024) / 1024;
  return Number.isFinite(minimum) && minimum > 0 ? minimum : undefined;
}

/** Own the public engine's measurement nodes so failure/fallback cleanup is
 * guaranteed. abcjs.test exposes the same bundled controller used by renderAbc
 * and tuneMetrics; a separate runtime source import can have another cache.
 * Keep its default cached text measurement, already warmed by ordinary render.
 */
function measureSoftlyWidths(host: HTMLElement, abc: string, options: abcjs.AbcVisualParams,
  signature: string): ReturnType<typeof abcjs.tuneMetrics> | undefined {
  if (abc !== softlyNotation) return undefined;
  return measureBoundSoftlyWidths(host, abc, options, signature);
}

/** Dedicated stripped-source entry; full-lyrics admission stays unchanged. */
export function measureSoftlyMusicOnlyWidths(host: HTMLElement, abc: string, options: abcjs.AbcVisualParams,
  signature: string): ReturnType<typeof abcjs.tuneMetrics> | undefined {
  if (abc !== softlyMusicOnlyNotation) return undefined;
  return measureBoundSoftlyWidths(host, abc, options, signature);
}

function measureBoundSoftlyWidths(host: HTMLElement, abc: string, options: abcjs.AbcVisualParams,
  signature: string): ReturnType<typeof abcjs.tuneMetrics> | undefined {
  const BundledController = (abcjs as typeof abcjs & {
    test?: { EngraverController?: typeof EngraverController };
  }).test?.EngraverController;
  if (abcjs.signature !== 'abcjs-basic v6.7.0' || typeof BundledController !== 'function') return undefined;
  const tunes = abcjs.parseOnly(abc, options);
  const before = tunes.length === 1 && readScreenScoreIdentity(tunes[0], abc);
  if (!before || before.signature !== signature || before.systems.length !== 1 || before.units.length !== 17) return undefined;
  const measurementHost = host.ownerDocument.createElement('div');
  measurementHost.setAttribute('style', 'visibility: hidden;');
  let controller: EngraverController | undefined;
  try {
    host.ownerDocument.body.appendChild(measurementHost);
    controller = new BundledController(measurementHost, options);
    const sections = controller.getMeasureWidths(tunes[0]);
    const after = readScreenScoreIdentity(tunes[0], abc);
    if (controller.renderer.paper.dummySvg || !after || after.signature !== signature || after.systems.length !== 1) return undefined;
    return [{ sections }];
  } finally {
    try { controller?.renderer.paper.dummySvg?.remove(); }
    finally { measurementHost.remove(); }
  }
}

/** Apply the source-bound ceiling before the native render, including its
 * no-inflation path. Requests past the ceiling use identical render options.
 * Acceptance remains a separate native proof; a failed candidate keeps its
 * original listener-bearing nodes and cannot report maximum-size success.
 */
export function renderCompleteInTheeScreenScore(
  host: HTMLElement, abc: string, songId: string | undefined, options: abcjs.AbcVisualParams,
  active: boolean, ohHowPickup = false, onFit?: (fit: CompleteInTheeScreenFit | undefined) => void,
): abcjs.TuneObjectArray {
  const softly = songId === 'hymn-ly_softly-and-tenderly-thompson';
  const oLove = songId === 'hymn-mobile-o-love';
  const whateer = songId === 'hymn-winkworth-whateer-gastorius';
  const unitCount = whateer ? 15 : oLove ? 11 : 17;
  const attribute = softly ? SOFTLY_ATTRIBUTE : whateer ? WHATEER_ATTRIBUTE : oLove ? O_LOVE_ATTRIBUTE : ATTRIBUTE;
  const qualified = active && (songId === 'hymn-mobile-complete-in-thee' || oLove || whateer || softly) &&
    supportedScreenWidth(host, abc, songId, options, false);
  // Compose source-bound screen presentation before both ordinary and candidate
  // renders. Complete replaces its imported page spacing with the native default.
  // Whate'er retains stafftopmargin14 and adds 12 points of vocalspace beneath
  // its close alto down-slurs. Canonical ABC, exports and print stay unchanged.
  const screenOptions: abcjs.AbcVisualParams = qualified && (whateer || songId === 'hymn-mobile-complete-in-thee') ? { ...options,
    afterParsing: (tune, number, source) => {
      options.afterParsing?.(tune, number, source);
      // TuneBook trims the final newline before invoking this callback.
      if (number === 0) {
        if (whateer) {
          if (source === whateerNotation.trimEnd() && tune.formatting.staffsep === 95 &&
            tune.formatting.stafftopmargin === 14 && tune.formatting.vocalspace === undefined) tune.formatting.vocalspace = 12;
        } else if (source.replace(/\r\n/g, '\n') === notationWitness.trimEnd() &&
          tune.formatting.staffsep === 100) delete tune.formatting.staffsep;
      }
      return tune;
    },
  } : options;
  // Establish Softly's exact requested ordinary rendering before any parser or
  // metric preflight. The bundled measurement controller then shares its
  // already-warmed text cache, including after a browser-zoom/DPR change.
  // A rejected candidate keeps this tune and its actual listener-bearing nodes.
  const ordinary = qualified && softly ? {
    tunes: renderScreenScore(host, abc, songId, screenOptions, ohHowPickup), staffwidth: options.staffwidth!,
  } : undefined;
  let minimum: number | undefined;
  let preflightSignature: string | undefined;
  let wholeUnits: Widths | undefined;
  if (qualified) {
    try {
      const { wrap: _wrap, afterParsing: _afterParsing, clickListener: _clickListener, ...measurement } = options;
      const unbroken = { ...measurement, lineBreaks: [[]] as unknown as number[] };
      const flatTunes = abcjs.parseOnly(abc, unbroken);
      const flat = flatTunes.length === 1 && readScreenScoreIdentity(flatTunes[0], abc);
      const metrics = flat && (softly ? measureSoftlyWidths(host, abc, unbroken, flat.signature) : abcjs.tuneMetrics(abc, unbroken));
      if (flat && flat.meter === (softly ? 0.75 : whateer ? 1 : oLove ? 2 : 1.5) && flat.units.length === unitCount && flat.systems.length === 1 &&
        flat.systems[0].length === unitCount && flat.notes.every(note => note.voice <= 3) &&
        (!softly || flat.notes.length === 319) && (!oLove || flat.notes.length === 157) && (!whateer || flat.notes.length === 231) &&
        new Set(flat.notes.map(note => note.voice)).size === 4 &&
        flat.units.every((unit, index) => unit.duration === (softly ? index === 7 ? 0.625 : index === 8 ? 0.125 : 0.75 : whateer ? index === 0 ? 0.25 : 1 : oLove ?
          index === 0 ? 0.5 : index === 10 ? 1.5 : 2 : index === 0 || index === 16 ? 0.75 : 1.5)) &&
        metrics && metrics.length === 1 && metrics[0].sections.length === 1) {
        minimum = softly ? softlyMinimumStaffWidth(metrics[0].sections[0]) : whateer ? whateerMinimumStaffWidth(metrics[0].sections[0]) :
          oLove ? oLoveMinimumStaffWidth(metrics[0].sections[0]) : completeInTheeMinimumStaffWidth(metrics[0].sections[0]);
        preflightSignature = flat.signature;
        if (oLove) wholeUnits = { ...metrics[0].sections[0], measureWidths: [...metrics[0].sections[0].measureWidths] };
      }
    } catch { /* Failed preflight keeps the ordinary options and reports failure. */ }
  }
  const effectiveStaffwidth = minimum === undefined ? options.staffwidth : Math.max(options.staffwidth!, minimum);
  const effective = effectiveStaffwidth === options.staffwidth ? screenOptions : { ...screenOptions, staffwidth: effectiveStaffwidth };
  const tunes = renderWidthCorrectedScreenScore(host, abc, songId, effective,
    active && (!ordinary || minimum !== undefined), ohHowPickup, ordinary,
    oLove ? widths => { wholeUnits = { ...widths, measureWidths: [...widths.measureWidths] }; } : undefined);
  let fit: CompleteInTheeScreenFit | undefined;
  if (qualified) {
    fit = { requestedStaffwidth: options.staffwidth!, effectiveStaffwidth: effectiveStaffwidth!,
      minimumStaffwidth: minimum, limited: effectiveStaffwidth! > options.staffwidth!, accepted: false, reason: 'fit-measurement',
      ...(oLove && wholeUnits ? { wholeUnits } : {}) };
    try {
      if (ordinary && minimum === undefined) host.setAttribute(attribute,
        JSON.stringify({ version: 1, result: 'original', reason: 'fit-measurement' }));
      const diagnostic: Diagnostic = JSON.parse(host.getAttribute(attribute) ?? '{}');
      fit.reason = diagnostic.reason ?? 'fit-diagnostic';
      // The existing native no-inflation shortcut is not a geometry proof.
      // Verify it too before claiming a successful effective-size ceiling.
      preserveBlankLyricRows(host);
      const identityDiagnostic: NonNullable<Parameters<typeof readScreenScoreIdentity>[2]> = {
        version: 1, song: songId!, phase: 'fit-identity', result: 'original',
      };
      const geometryDiagnostic: NonNullable<Parameters<typeof readScreenScoreGeometry>[3]> = {
        version: 1, song: songId!, phase: 'fit-geometry', result: 'original',
      };
      const identity = tunes.length === 1 && readScreenScoreIdentity(tunes[0], abc, identityDiagnostic);
      const geometry = identity && readScreenScoreGeometry(host, identity, true, geometryDiagnostic);
      fit.accepted = minimum !== undefined && (diagnostic.reason === 'accepted' || diagnostic.reason === 'no-inflation') &&
        !!identity && identity.signature === preflightSignature && !!geometry && close(geometry.width, effectiveStaffwidth! + 30) &&
        tunes[0].engraver?.width === effectiveStaffwidth &&
        tunes[0].engraver?.renderer?.padding?.left === 15 && tunes[0].engraver?.renderer?.padding?.right === 15;
      // Passive proof detail only. Preserve the exact acceptance expression
      // above, and report fixed check names/counters rather than score text.
      fit.proof = {
        checks: { minimum: minimum !== undefined, result: diagnostic.reason === 'accepted' || diagnostic.reason === 'no-inflation',
          identity: !!identity, sourceParity: !!identity && identity.signature === preflightSignature, geometry: !!geometry,
          viewport: !!geometry && close(geometry.width, effectiveStaffwidth! + 30),
          engraver: tunes[0]?.engraver?.width === effectiveStaffwidth,
          padding: tunes[0]?.engraver?.renderer?.padding?.left === 15 && tunes[0]?.engraver?.renderer?.padding?.right === 15 },
        identityReason: identityDiagnostic.reason, geometryReason: geometryDiagnostic.reason,
        ...(diagnostic.reason === 'accepted' && diagnostic.typography ? {
          typography: { source: 'candidate' as const, captured: true, valid: true, ...diagnostic.typography },
        } : {}),
      };
      if (fit.accepted && diagnostic.reason === 'no-inflation' && identity && geometry) {
        // There is no candidate transform to compare on this native path,
        // but its unchanged rows must still match independent native controls.
        const typography = captureLyricTypography(host, identity.notes, geometry);
        const proof = typography && verifyLyricTypography(host, typography, typography);
        fit.accepted = !!typography && !!proof?.valid;
        fit.proof.typography = { source: 'native', captured: !!typography,
          frameWidths: typography?.systems.slice(0, 20).map(system => system.frame.parentWidth), ...proof };
      }
      if (!fit.accepted && (fit.reason === 'accepted' || fit.reason === 'no-inflation')) fit.reason = 'fit-geometry';
    } catch { fit.accepted = false; fit.reason = 'fit-geometry'; fit.proof = { ...fit.proof, exception: true }; }
    try {
      const diagnostic = JSON.parse(host.getAttribute(attribute) ?? '{}');
      host.setAttribute(attribute, JSON.stringify({ ...diagnostic, fitCeiling: fit }));
    } catch { /* Diagnostic availability cannot turn a failed proof into success. */ }
  }
  onFit?.(fit);
  return tunes;
}

/** One bounded screen-only attempt, after the ordinary renderer. Source lines
 * may split a musical bar: ABCJS 6.7's first width pass then budgets a real bar
 * as zero. Public tuneMetrics with one explicit unbroken section measures the
 * complete bars without rewriting ABC, lyrics, or source offsets. Feed those
 * widths to the already-used native planner, with an independent fit ceiling.
 * Keep the exact original tune and listener-bearing nodes on every rejection.
 */
function renderWidthCorrectedScreenScore(
  host: HTMLElement, abc: string, songId: string | undefined, options: abcjs.AbcVisualParams, active: boolean, ohHowPickup = false,
  ordinary?: { tunes: abcjs.TuneObjectArray; staffwidth: number }, onWidths?: (widths: Widths) => void,
): abcjs.TuneObjectArray {
  const ruggedCross = songId === 'hymn-oh_the-old-rugged-cross-old-rugged-cross';
  const softly = songId === 'hymn-ly_softly-and-tenderly-thompson';
  const oLove = songId === 'hymn-mobile-o-love';
  const whateer = songId === 'hymn-winkworth-whateer-gastorius';
  const unitCount = whateer ? 15 : oLove ? 11 : 17;
  const attribute = ruggedCross ? 'data-old-rugged-cross-wrap' : softly ? SOFTLY_ATTRIBUTE : whateer ? WHATEER_ATTRIBUTE : oLove ? O_LOVE_ATTRIBUTE : ATTRIBUTE;
  host.removeAttribute(ATTRIBUTE);
  host.removeAttribute(O_LOVE_ATTRIBUTE);
  host.removeAttribute(WHATEER_ATTRIBUTE);
  host.removeAttribute(SOFTLY_ATTRIBUTE);
  host.removeAttribute('data-old-rugged-cross-wrap');
  const original = ordinary?.tunes ?? renderScreenScore(host, abc, songId, options, ohHowPickup);
  if (!active) return original;
  const diagnostic: Diagnostic = { version: 1, result: 'original', reason: 'unsupported' };
  const finish = (tunes: abcjs.TuneObjectArray, reason: string) => {
    diagnostic.reason = reason;
    try { host.setAttribute(attribute, JSON.stringify(diagnostic)); } catch { /* Diagnostic only. */ }
    return tunes;
  };
  if (!supportedScreenWidth(host, abc, songId, options, ruggedCross) || original.length !== 1) return finish(original, 'unsupported');
  let retained: Node[] | undefined;
  let attributes: [string, string][] | undefined;
  try {
    const tune = original[0];
    // Automatic wrapping removes TuneBook's comment-only prefix. Explicit
    // reflow must use that exact parser input to preserve source/click offsets.
    if (ruggedCross) {
      const book = new abcjs.TuneBook(abc);
      if (book.header || book.tunes.length !== 1 || book.tunes[0].startPos !== 837 ||
        book.tunes[0].abc !== abc.slice(837).trimEnd()) return finish(original, 'source-prefix');
      abc = book.tunes[0].abc;
    }
    const before = widthScore(tune, abc, ruggedCross);
    if (!before || before.meter !== (softly ? 0.75 : whateer ? 1 : oLove ? 2 : 1.5) || before.units.length !== unitCount ||
      before.notes.some(note => note.voice > 3) || new Set(before.notes.map(note => note.voice)).size !== 4 ||
      (ruggedCross && before.notes.length !== 343) || (oLove && before.notes.length !== 157) ||
      (whateer && before.notes.length !== 231) || (softly && before.notes.length !== 319) ||
      before.units.some((unit, index) => unit.duration !== (softly ? index === 7 ? 0.625 : index === 8 ? 0.125 : 0.75 : whateer ? index === 0 ? 0.25 : 1 : oLove ? index === 0 ? 0.5 : index === 10 ? 1.5 : 2 : ruggedCross ?
        index === 0 ? 0.25 : index === 16 ? 1.25 : 1.5 : index === 0 || index === 16 ? 0.75 : 1.5)))
      return finish(original, 'source-structure');
    if (softly && (tune.metaText.tempo?.bpm !== 68 || JSON.stringify(tune.metaText.tempo.duration) !== '[0.25]' ||
      tune.lines.some(line => JSON.stringify(line.staff?.map(staff => staff.voices?.length)) !== '[2,2]')))
      return finish(original, 'source-presentation');
    if (softly && !before.systems.some(system => system.includes(7) && system.includes(8)))
      return finish(original, 'source-protected-boundary');
    // Preserve the reviewed slur/lyric clearance and imported page spacing.
    if (whateer && (tune.formatting.staffsep !== 95 || tune.formatting.stafftopmargin !== 14 || tune.formatting.vocalspace !== 12))
      return finish(original, 'source-presentation');
    diagnostic.originalUnits = before.systems;
    const padding = tune.engraver?.renderer?.padding;
    const staffwidth = options.staffwidth!;
    const nativeStaffwidth = ordinary?.staffwidth ?? staffwidth;
    if (padding?.left !== 15 || padding?.right !== 15 || tune.engraver?.width !== nativeStaffwidth ||
      tune.formatting.staffwidth !== undefined || tune.formatting.leftmargin !== undefined || tune.formatting.rightmargin !== undefined)
      return finish(original, 'padding');
    const intendedWidth = staffwidth + padding.left + padding.right;
    diagnostic.requested = intendedWidth;
    const viewportWidths = Array.from(host.querySelectorAll('svg'), svg => Number(svg.getAttribute('viewBox')?.trim().split(/\s+/)[2]));
    // Do not change a normally-sized rendering, including desktop controls.
    if (viewportWidths.length !== before.systems.length || viewportWidths.some(width => !Number.isFinite(width) ||
      !close(width, viewportWidths[0])) || !(viewportWidths[0] > intendedWidth + 2)) return finish(original, 'no-inflation');
    diagnostic.originalWidth = viewportWidths[0];
    const explanation = (tune as abcjs.TuneObject & { explanation?: { widths: Widths; staffWidth: number }[] }).explanation;
    const native = explanation?.[0]?.widths;
    if (explanation?.length !== 1 || explanation[0].staffWidth !== nativeStaffwidth || !validWidths(native, false, unitCount) ||
      (oLove || whateer || softly ? false : ruggedCross ? native.measureWidths.some(width => width <= 0) :
        native.measureWidths[12] !== 0 || native.measureWidths.some((width, index) => index !== 12 && width <= 0)))
      return finish(original, 'unrecognized-width-defect');
    const { wrap: _wrap, afterParsing: _afterParsing, clickListener: _clickListener, ...measurement } = options;
    const unbroken = { ...measurement, lineBreaks: [[]] as unknown as number[] };
    const flatTunes = abcjs.parseOnly(abc, unbroken);
    const flat = flatTunes.length === 1 && widthScore(flatTunes[0], abc, ruggedCross);
    if (!flat || flat.signature !== before.signature || flat.systems.length !== 1 || flat.systems[0].length !== unitCount)
      return finish(original, 'measurement-identity');
    const metrics = softly ? measureSoftlyWidths(host, abc, unbroken, flat.signature) : abcjs.tuneMetrics(abc, unbroken);
    const widths = metrics?.[0]?.sections?.[0];
    if (!metrics || metrics.length !== 1 || metrics[0].sections.length !== 1 || !validWidths(widths, true, unitCount) ||
      widths.left < padding.left || widths.left >= staffwidth)
      return finish(original, 'measurement-widths');
    if (ruggedCross && [3, 6, 12].some(unit => widths.measureWidths[unit] <= native.measureWidths[unit] + 2))
      return finish(original, 'unrecognized-split-measures');
    // Native section.left was overwritten at each source newline too. Use the
    // complete section's own start, not the malformed final source-line start.
    diagnostic.correctedWidths = widths.measureWidths;
    const available = staffwidth - (widths.left - padding.left);
    let systems: number[][];
    if (oLove || whateer || softly) {
      const fitted = softly ? fitSoftlySystems(before.systems, widths.measureWidths, available) : whateer ? fitWhateerSystems(before.systems, widths.measureWidths, available) :
        fitOLoveSystems(before.systems, widths.measureWidths, available);
      if (!fitted) return finish(original, 'planner-fit');
      systems = fitted;
    } else {
      const planned = calcLineWraps(flatTunes[0], [widths], options);
      const sections = planned.revisedParams.lineBreaks as unknown as number[][] | undefined;
      if (!planned.reParse || !Array.isArray(sections) || sections.length !== 1 || !Array.isArray(sections[0]) ||
        !sections[0].length || sections[0].some((end, index) => !Number.isInteger(end) || end < 0 || end >= 16 ||
          (index > 0 && end <= sections[0][index - 1]))) return finish(original, 'planner-shape');
      let start = 0;
      systems = [...sections[0], 16].map(end => {
        const units = Array.from({ length: end - start + 1 }, (_, index) => start + index);
        start = end + 1;
        return units;
      });
      // Keep the other source-bound wrapper and every already-fitting native
      // plan unchanged. A rejected subdivision never relaxes the fit ceiling.
      if (!ruggedCross && (systems.some(system => system.reduce((sum, unit) => sum + widths.measureWidths[unit], 0) > available + EPSILON) ||
        systems.at(-1)!.length < 2)) {
        const fitted = fitCompleteInTheeSystems(systems, widths.measureWidths, available);
        if (fitted) {
          systems = fitted;
        }
      }
    }
    diagnostic.plannedUnits = systems;
    if (systems.some(system => system.reduce((sum, unit) => sum + widths.measureWidths[unit], 0) > available + EPSILON) ||
      (!oLove && !whateer && !softly && systems.at(-1)!.length < 2)) return finish(original, 'planner-fit');
    preserveBlankLyricRows(host);
    const geometry = readScreenScoreGeometry(host, before, false);
    if (!geometry) return finish(original, 'original-geometry');
    const typographyBefore = captureLyricTypography(host, before.notes, geometry);
    if (!typographyBefore) return finish(original, 'original-typography');
    retained = Array.from(host.childNodes);
    attributes = Array.from(host.attributes, attribute => [attribute.name, attribute.value]);
    host.replaceChildren();
    const { wrap: _originalWrap, ...explicit } = options;
    const lineBreaks = [systems.slice(0, -1).map(system => system.at(-1)!)];
    const candidate = abcjs.renderAbc(host, abc, { ...explicit, lineBreaks: lineBreaks as unknown as number[] });
    const after = candidate.length === 1 && widthScore(candidate[0], abc, ruggedCross);
    if (!after || after.signature !== before.signature || JSON.stringify(after.systems) !== JSON.stringify(systems) ||
      (softly && (JSON.stringify(candidate[0].formatting) !== JSON.stringify(tune.formatting) ||
        tempoIdentity(candidate[0]) !== tempoIdentity(tune))) ||
      (whateer && (candidate[0].formatting.staffsep !== 95 || candidate[0].formatting.stafftopmargin !== 14 ||
        candidate[0].formatting.vocalspace !== 12))) {
      diagnostic.reason = 'candidate-identity';
    } else {
      preserveBlankLyricRows(host);
      // No glyph/style changes or expandToWidest. A bounded, ink-safe viewport
      // normalization is permitted only for the observed source/engine case.
      if (ruggedCross) recordCandidateSystems(host, candidate[0], systems, staffwidth, diagnostic);
      let candidateGeometry = readScreenScoreGeometry(host, after, true);
      if (ruggedCross && candidateGeometry && normalizeRuggedCrossConvergence(
        host, candidate[0], after, candidateGeometry, staffwidth, intendedWidth, diagnostic,
      )) candidateGeometry = readScreenScoreGeometry(host, after, true);
      diagnostic.candidateWidth = candidateGeometry?.width;
      diagnostic.engraver = { requestedStaffwidth: staffwidth, originalWidth: tune.engraver?.width ?? null,
        candidateWidth: candidate[0].engraver?.width ?? null, originalPadding: [padding.left, padding.right],
        candidatePadding: [candidate[0].engraver?.renderer?.padding?.left ?? null, candidate[0].engraver?.renderer?.padding?.right ?? null] };
      if (geometryCheck(diagnostic, !!candidateGeometry, { field: 'geometry.unreadable' }) && candidateGeometry &&
        sameNotationSize(geometry, candidateGeometry, intendedWidth, diagnostic) &&
        geometryCheck(diagnostic, candidate[0].engraver?.width === staffwidth,
          { field: 'engraver.width', before: staffwidth, after: candidate[0].engraver?.width ?? null }) &&
        geometryCheck(diagnostic, candidate[0].engraver?.renderer?.padding?.left === padding.left,
          { field: 'padding.left', before: padding.left, after: candidate[0].engraver?.renderer?.padding?.left ?? null }) &&
        geometryCheck(diagnostic, candidate[0].engraver?.renderer?.padding?.right === padding.right,
          { field: 'padding.right', before: padding.right, after: candidate[0].engraver?.renderer?.padding?.right ?? null })) {
        const typographyAfter = captureLyricTypography(host, after.notes, candidateGeometry);
        const proof = typographyAfter && verifyLyricTypography(host, typographyBefore, typographyAfter);
        if (proof) {
          diagnostic.typography = { rows: proof.rows, nativeControls: proof.nativeControls, compared: proof.compared, measurements: proof.measurements };
          diagnostic.geometryMismatch ??= proof.mismatch;
        } else diagnostic.geometryMismatch ??= { field: 'lyric.capture' };
        if (proof?.valid) {
          diagnostic.result = 'candidate';
          onWidths?.(widths);
          return finish(candidate, 'accepted');
        }
      }
      diagnostic.reason = 'candidate-geometry';
    }
  } catch { diagnostic.reason = 'exception'; }
  if (retained) {
    host.replaceChildren(...retained);
    for (const attribute of Array.from(host.attributes)) host.removeAttribute(attribute.name);
    for (const [name, value] of attributes!) host.setAttribute(name, value);
  }
  return finish(original, diagnostic.reason);
}
