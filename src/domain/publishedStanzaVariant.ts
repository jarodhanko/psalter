/** Published stanza text in the byte-matched Open Hymnal musical setting.
 * Keep canonical source, playback, other stanzas and the shared refrain intact.
 * This changes words only; it does not claim the complete LUYH musical edition.
 */
export interface PublishedStanzaVariantInfo {
  readonly kind: 'published-stanza-variant';
  readonly sourceSha256: string;
  readonly stanzaNumbers: readonly number[];
  readonly edition: string;
  readonly note: string;
  readonly sharedRefrainNote: string;
  readonly credits: string;
  readonly rights: string;
  readonly sourceUrls: readonly string[];
}
export interface PublishedStanzaVariant {
  readonly abc: string;
  readonly info: PublishedStanzaVariantInfo;
}
const sourceWitness = "%abc-2.1\n% Normalized from Open Hymnal ABCPlus. See companion provenance JSON.\n% Source engraving directive: %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n% Source engraving directive: %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n% Source engraving directive: %%pagewidth\t21.6000cm\n% Source engraving directive: %%pageheight\t27.9000cm\n% Source engraving directive: %%scale\t\t0.710000\n% Source engraving directive: %%staffsep\t1.60000cm\n% Source engraving directive: %%exprabove\tfalse\n% Source engraving directive: %%measurebox\tfalse\n% Source engraving directive: %%postscript /st { moveto -8 0 rmoveto 0 8 rlineto 4 0 rlineto stroke } def\n% Source engraving directive: %%postscript /nd { moveto -8 0 rmoveto 0 8 rlineto -4 0 rlineto stroke } def\n% Source engraving directive: %%deco sintro 6 st 6 0 0\n% Source engraving directive: %%deco eintro 6 nd 6 0 0\nX:1\nT: All Creatures of Our God and King\nC: Words: Francis of Assisi circa 1225. Translated by William H. Draper, 1919.\nC: Music: 'Lasst Uns Erfreuen' from Geistliche Kirchengesäng, Köln, 1623. Setting: Ralph Vaughan Williams, 1906.\nC: copyright: public domain.  This score is a part of the Open Hymnal Project, 2005 Revision.\nS: Music source: 'Lutheran Worship' Hymnal, 1982 Hymn 436.\nM: 6/4 % time signature\nL: 1/4 % default length\n%%score (S1V1 S1V2) | (S2V1 S2V2)\nV: S1V1 clef=treble\n%%MIDI beat 127 125 110 1\nV: S1V2\n%%MIDI beat 127 125 110 1\nV: S2V1 clef=bass\n%%MIDI beat 127 125 110 1\nV: S2V2\n%%MIDI beat 127 125 110 1\nK: D % key signature\n%\n%%MIDI program 1 0 % Piano 1\n%%MIDI program 2 0 % Piano 1\n%%MIDI program 3 0 % Piano 1\n%%MIDI program 4 0 % Piano 1\n%\n% 1\n[V: S1V1] [Q:1/4=160] D2 | D E F D F G | [E4A4] D2 | D E F D F G | [E4A4]\nw: 1.~All crea- tures of our God and King Lift up your voice and with us sing,\nw: 2.~Thou rush- ing wind that art so strong Ye clouds that sail in Heaven a- long,\nw: 3.~Thou flow- ing wa- ter, pure and clear, Make mu- sic for thy Lord to hear,\nw: 4.~Dear mo- ther earth, who day by day Un- fold- est bless- ings on our way,\nw: 5.~And all ye men of ten- der heart, For- giv- ing o- thers, take your part,\n[V: S1V2]  A,2 | D4 D2 | (D2 C2) D2 | A, C D2 D2 | (D2 C2)\n[V: S2V1]  F,2 | F, G, A, F, B,2 | A,4 (A, B,) | A, G, A,2 B,2 | A,4\n[V: S2V2]  D,2 | D,2 D, D,/C,/ B,, E, | (A,,2 A, G,) (F, G,) | F, E, D, C, B,, E, | (A,,2 A, G,)\n% 5\n[V: S1V1]  (d c) | B2 A2 d c | B2 A2 d2 | d A A G F G | [E4A4]\nw: A- lle- lu- ia! A- lle- lu- ia! Thou burn- ing sun with gol- den beam,\nw: O * praise Him! A- lle- lu- ia! Thou ris- ing moon, in praise re- joice,\nw: O * praise Him! A- lle- lu- ia! Thou fire so mas- ter- ful and bright,\nw: O * praise Him! A- lle- lu- ia! The flowers and fruits that in thee grow,\nw: O * sing ye! A- lle- lu- ia! Ye who long pain and sor- row bear,\n[V: S1V2]  A2 | (A G) F2 D E | (F E) C2 (A G) | F2 F E D2 | (D2 C2)\n[V: S2V1]  D2 | D2 D2 F, A, | (A, ^G,) A,2 D2 | D2 D A, A, G, | (E,2 A,2)\n[V: S2V2]  F,2 | G,2 D,2 B,, C, | (D, E,) A,,2 (F, E,) | D, C, B,, C, D, B,, | (A,,2 A, G,)\n% 9\n[V: S1V1]  [A2d2] | [Ad] [GA] [FA] G F G | A4 (G F) | E2 D2\nw: Thou sil- ver moon with soft- er gleam! O * praise Him!\nw: Ye lights of eve- ning, find a voice!  *  *  *  *\nw: That giv- est man both warmth and light.  *  *  *  *\nw: Let them His glo- ry al- so show.  *  *  *  *\nw: Praise God and on Him cast your care!  *  *  *  *\n[V: S1V2]  (D E) | D C D D3 | (D C F E) D2 | (D C) D2\n[V: S2V1]  A,2 | A,2 A, D C B, | A,4  B,2 | (B, A,) A,2\n[V: S2V2]  (F, G,) | F, E, D, B, A, G, | (F, E, D, C,) (B,, A,,) | G,,2 F,,2\n% 13\n[V: S1V1] (G F) | E2 D2 d c | B2 A2 d c | B2 A2 G F | E6 | D4 |]\nw: O * praise Him! A- lle- lu- ia! A- lle- lu- ia! A- lle- lu- ia!\n[V: S1V2] D2 | (D C) B,2 F E | (F E) C2 [F2A2] | [FA] [E2G2] [B,F] B, D | (D2 C4) | A,4 |]\n[V: S2V1]  (B, A,) | (B, G,) F,2 F, A, | (A, ^G,) A,2 [F,2A,2] | (F, G,) (E, F,) G, A, | (B,2 A,2 G,2) | F,4 |]\n[V: S2V2] (E,, F,,) | (G,, A,,) B,,2 B,, C, | (D, E,) A,,2 B,, C, | (D, E,) (C, ^D,) E, F, | (G,2 A,2 A,,2) | D,4 |]\n% 19\nW:6. And thou most kind and gentle Death,\nW:Waiting to hush our latest breath,\nW:O praise Him! Alleluia!\nW:Thou leadest home the child of God,\nW:And Christ our Lord the way hath trod.\nW:\nW:7. Let all things their Creator bless,\nW:And worship Him in humbleness,\nW:O praise Him! Alleluia!\nW:Praise, praise the Father, praise the Son,\nW:And praise the Spirit, Three in One!\n";
const info: PublishedStanzaVariantInfo = {
  kind: 'published-stanza-variant',
  sourceSha256: 'cc0979466a1d1e13b0ba1a845b65ee003c156ef53e21aac5c8685a801d96c4fc',
  stanzaNumbers: [4],
  edition: 'Lift Up Your Hearts (2013), no. 551, stanza 4',
  note: 'Verse 4 uses the published “Earth ever fertile” text from Lift Up Your Hearts #551 in the retained Open Hymnal musical setting.',
  sharedRefrainNote: 'The shared closing refrain is sung with every stanza and retains the Open Hymnal capitalization and punctuation.',
  credits: 'Stanza 4: Francis of Assisi, 1225; translated by William H. Draper, circa 1910, altered; Lift Up Your Hearts (Faith Alive Christian Resources, 2013), no. 551.',
  rights: 'The publisher identifies these altered words as public domain. The retained Open Hymnal setting and existing U.S. rights scope remain unchanged; no worldwide clearance is inferred.',
  sourceUrls: [
    'https://liftupyourheartshymnal.org/songs/all-creatures-our-god-and-king',
    'https://www.hymnary.org/hymn/LUYH2013/551',
    'https://hymnary.org/hymn/PsH/431',
    'https://firstcrcmv.com/wp-content/uploads/2015/08/June-11-2017-Bulletin.pdf#page=2',
    'https://liftupyourheartshymnal.org/what-pd',
  ],
};
// Exact source rows. The first alleluia uses all four existing attacks, just
// as stanza 1 does; retaining the previous O-praise skip would lose a syllable.
const replacements: Readonly<Record<string, string>> = {
  'w: 4.~Dear mo- ther earth, who day by day Un- fold- est bless- ings on our way,':
    'w: 4.~Earth ev- er fer- tile, day by day bring forth your bless- ings on our way;',
  'w: O * praise Him! A- lle- lu- ia! The flowers and fruits that in thee grow,':
    'w: al- le- lu- ia, al- le- lu- ia! All flowers and fruits that in you grow,',
  'w: Let them His glo- ry al- so show.  *  *  *  *':
    'w: let them his glo- ry al- so show:  *  *  *  *',
};
const projected: PublishedStanzaVariant = {
  abc: sourceWitness.split('\n').map(line => replacements[line] ?? line).join('\n'),
  info,
};

/** Every source byte and the stable song identity must match before projection. */
export function getPublishedStanzaVariant(songId: string | undefined, abc: string): PublishedStanzaVariant | undefined {
  return songId === 'hymn-oh_all-creatures-of-our-god-and-king-lasst-uns-erfreuen' && abc === sourceWitness ? projected : undefined;
}
