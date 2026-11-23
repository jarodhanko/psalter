import type { EditorialStanzaUnderlay } from '../domain/editorialStanzaUnderlay';

// Psalter 233 prints verses 5–6 below the score. The app repeats their fourth
// line over the same closing phrase that the four printed rows repeat.
// Freeze the source independently so later ABC edits cannot activate stale rows.
const psalter233Witness = "%abc-2.1\nT:Confident Pleading\nT:ROLLAND\nC:William B. Bradbury\nN:Psalm 86. L. M.\n% validator: allow-photographed-partial-bars\nM:3/2\nL:1/4\nK:G\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nG2 | G G G2 A2 | B G E2 || E2 | D D G A B G | A4 || d2 | d d d2 c2 | B B B2 || (B3/2 A/2) |\nw:1.~Bow down Thy ear, O Lord, and hear, For I am poor and great my need; Pre- serve my soul, for Thee I fear; O _\nw:2.~O Lord, be mer- ci- ful to me, For all the day to Thee I cry; Re- joice Thy serv- ant, for to Thee I _\nw:3.~For Thou, O Lord, art good and kind, And read- y to for- give Thou art; A- bun- dant mer- cy they shall find Who _\nw:4.~O Lord, in- cline Thy ear to me, My voice of sup- pli- ca- tion heed; In troub- le I will cry to Thee, For _\nG G G G A A | B4 || G2 | A/2G/2 F/2E/2 D2 G2 | B A G2 |]\nw:God, Thy trust- ing serv- ant heed, O God, _ Thy _ trust- ing serv- ant heed.\nw:lift my soul, O Lord Most High, I lift _ my _ soul, O Lord Most High.\nw:call on Thee with all their heart, Who call _ on _ Thee with all their heart.\nw:Thou wilt an- swer when I plead, For Thou _ wilt _ an- swer when I plead.\nV:T2\nD2 | D D E2 F2 | G D C2 || C2 | D B, D D D ^C | D4 || F2 | G F G2 F2 | G A G2 || F2 |\nE E D D D D | D4 || D2 | E C D2 D2 | D D D2 |]\nV:B1\nB,2 | B, B, B,2 D2 | D G, G,2 || G,2 | G, G, G, F, G, A, | F,4 || A,2 | B, C D2 D2 | D ^D E2 || ^D2 |\nE C B, G, F, F, | G,4 || G,2 | G, G, G,2 B,2 | D C B,2 |]\nV:B2\nG,2 | G, G, E,2 D,2 | G, B,, C,2 || C,2 | B,, G,, B,, D, G, E, | D,4 || D,2 | G, A, B,2 A,2 | G, F, E,2 || B,,2 |\nC, C, G,, B,, D, D, | G,4 || B,,2 | C, C, B,,2 G,,2 | D, D, G,,2 |]\nW:5. There is no God but Thee alone,\nW:Nor works like Thine, O Lord Most High;\nW:All nations shall surround Thy throne\nW:And their Creator glorify.\nW:\nW:6. In all Thy deeds how great Thou art!\nW:Thou one true God, Thy way make clear;\nW:Teach me with undivided heart\nW:To trust Thy truth, Thy Name to fear.";
const psalter233Rows: Readonly<Record<string, readonly string[]>> = {
  "w:4.~O Lord, in- cline Thy ear to me, My voice of sup- pli- ca- tion heed; In troub- le I will cry to Thee, For _": [
    '5.~There is no God but Thee a- lone, Nor works like Thine, O Lord Most High; All na- tions shall sur- round Thy throne And _',
    '6.~In all Thy deeds how great Thou art! Thou one true God, Thy way make clear; Teach me with un- di- vid- ed heart To _',
  ],
  "w:Thou wilt an- swer when I plead, For Thou _ wilt _ an- swer when I plead.": [
    'their Cre- a- tor glo- ri- fy, And their _ Cre- _ a- tor glo- ri- fy.',
    'trust Thy truth, Thy Name to fear, To trust _ Thy _ truth, Thy Name to fear.',
  ],
};
const psalter233Projected: EditorialStanzaUnderlay = {
  abc: psalter233Witness.split('\n').flatMap(line =>
    [line, ...(psalter233Rows[line] ?? []).map(row => `w:${row}`)]).join('\n'),
  info: {
    kind: 'editorial-stanza-underlay',
    sourceSha256: '06a9a80ccffd9980c1dbe5445b332219f52f1675281567ddb2e9cd91b5c8b43c',
    stanzaNumbers: [5, 6],
    note: 'Verses 5 and 6 are aligned to the notes by the app. As in verses 1–4, the last line repeats. The printed Psalter places these verses below the score.',
    sourceUrls: [],
  },
};

export function psalter233EditorialUnderlay(abc: string): EditorialStanzaUnderlay | undefined {
  return abc === psalter233Witness ? psalter233Projected : undefined;
}
