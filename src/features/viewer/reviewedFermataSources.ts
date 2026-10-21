import type { ReviewedFermataSource } from './reviewedFermatas';

// Exact music witnesses, independently read from the adopted source engraving.
// Metadata and lyric-only corrections do not silently invalidate musical scope.
export const reviewedFermataSources: Readonly<Record<string, ReviewedFermataSource>> = {
  // CARTER: RFPA pp298–299 / original1912 p170; both shared-stem chords hold.
  "psalter202": {
    "music": "M:6/8\nL:1/8\nK:F\n%%score (T1 T2)(B1 B2)\n%%stretchlast 1\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\n[V:T1] C3 C D F | E3 C3 | C3 C D F | E3-E3 |\n[V:T2] A,3 A, A, C | B,3 B,3 | A,3 A, A, C | B,3-B,3 |\n[V:B1] F,3 C, C, A, | G,3 E,3 | F,3 C, C, A, | G,3-G,3 |\n[V:B2] F,,3 F,, F,, F,, | C,3 C,3 | F,,3 F,, F,, F,, | C,3-C,3 |\n[V:T1] F3 F E F | A3 F3 | F3 G F G | A3-A3 |\n[V:T2] A,3 D D D | F3 D3 | D3 D D D | E3-E3 |\n[V:B1] F,3 A, G, A, | D3 A,3 | B,3 B, B, D | ^C3-C3 |\n[V:B2] D,3 D, D, D, | D,3 D,3 | B,,3 B,, B,, B,, | A,,3-A,,3 |\n[V:T1] c3 G A G | F3 C3 | c3 G F G | A3-A3 |\n[V:T2] E3 E E E | C3 C3 | E3 C C E | F3-F3 |\n[V:B1] =C3 B, C B, | A,3 A,3 | C3 B, A, C | C3-C3 |\n[V:B2] C,3 C, C, C, | F,3 F,3 | C,3 C, C, C, | F,3-F,3 |\n[V:T1] A3 A B c | B3 !fermata!D3 | \"^rit.\"C3 C C C | C3-C3 |\n[V:T2] F3 F F F | F3 B,3 | A,3 G, A, B, | A,3-A,3 |\n[V:B1] C3 C C A, | B,3 !fermata!F,3 | F,3 E, F, G, | F,3-F,3 |\n[V:B2] F,3 _E, E, E, | D,3 B,,3 | C,3 C, C, C, | F,,3-F,,3 |\n[V:T1] \"^CHORUS\"c | c2 G GA G | F3 A2 || A | G2 G A2 G | G3-G3 |\n[V:T2] F | E2 E E2 E | C3 F2 || F | F2 F F2 F | E3-E3 |\n[V:B1] A, | G,2 C B,C B, | A,3 C2 || C | =B,2 B, B,2 B, | C3-C3 |\n[V:B2] F, | C,2 C, C,2 C, | F,3 F,2 || F, | G,2 G, G,2 G, | C,3-C,3 |\n[V:T1] c | c2 B A2 G | F2 G !fermata!A2 || G | \"^rit.\"F2 C D2 E | F3-F3 |]\n[V:T2] E | F2 F F2 E | D2 D ^C2 || D | C2 C =B,2 _B, | A,3-A,3 |]\n[V:B1] _B, | A,2 D C2 B, | A,2 G, !fermata!E,2 || G, | A,2 A, G,2 G, | F,3-F,3 |]\n[V:B2] C, | F,2 F, F,2 C, | D,2 B,, A,,2 || B,, | C,2 C, C,2 C, | F,,3-F,,3 |]",
    "holds": [
      {
        "onset": 40.5,
        "duration": 1.5,
        "voices": [
          "T1",
          "T2",
          "B1",
          "B2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 65.5,
        "duration": 1,
        "voices": [
          "T1",
          "T2",
          "B1",
          "B2"
        ],
        "orientation": "fermata"
      }
    ]
  },
  // GIVE: RFPA p222 / original1912 p126; two shared SATB cadences.
  "psalter148": {
    "music": "M:3/4\nL:1/8\nK:G\n%%score (T1 T2) (B1 B2)\n%%stretchlast 1\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\n[V:T1] D2 | G4 B2 | d4 B2 | (A2 G2) A2 | B4 || A2 |\n[V:T2] D2 | D4 G2 | G4 G2 | (F2 G2) F2 | G4 || F2 |\n[V:B1] B,2 | B,4 D2 | B,4 D2 | (C2 B,2) D2 | D4 || D2 |\n[V:B2] G,2 | G,4 G,2 | G,4 G,2 | D,4 D,2 | G,4 || D,2 |\n[V:T1] (G2 A2) B2 | c4 B2 | !fermata!A4 || D2 | G4 B2 | d4 B2 |\n[V:T2] (G2 F2) G2 | G4 G2 | F4 || D2 | D4 G2 | G4 G2 |\n[V:B1] D4 D2 | E4 D2 | !fermata!D4 || B,2 | B,4 D2 | B,4 D2 |\n[V:B2] (B,,2 D,2) G,2 | C,4 G,,2 | D,4 || G,2 | G,4 G,2 | G,4 G,2 |\n[V:T1] A4 B2 | c4 || BA | (G2 B2) d2 | (d2 A2) B2 | !fermata!G4 |]\n[V:T2] F4 G2 | G4 || G2 | G4 G2 | F4 F2 | G4 |]\n[V:B1] D4 D2 | E4 || DC | (B,2 D2) D2 | D4 C2 | !fermata!B,4 |]\n[V:B2] D,4 G,2 | C,4 || D,2 | G,4 B,,2 | D,4 D,2 | G,,4 |]",
    "holds": [
      {
        "onset": 19,
        "duration": 2,
        "voices": [
          "T1",
          "T2",
          "B1",
          "B2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 40,
        "duration": 2,
        "voices": [
          "T1",
          "T2",
          "B1",
          "B2"
        ],
        "orientation": "fermata"
      }
    ]
  },
  "psalter56": {
    "music": "M:3/4\nL:1/8\nK:Ab\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE A B | c3/2 c/2 B A F A | (F2 E4) | A2 G2 A2 | B3 || E A B | c3/2 c/2 B A F A | (F2 E4) | E2 A3 G | (G2 A4) || B2 B2 B2 | B4 B2 | B c B A G F | E6 | c2 B2 A2 | A3 A G F | (E2 A3) G | (G2 HA) |]\nV:T2\nE E E | E3/2 C/2 D E E D | (D2 E4) | E2 E2 E C | D3 || E E E | E3/2 C/2 D E E D | (D2 C4) | C2 E3 E | E6 || E2 =D2 E2 | F4 E2 | E E =D2 D2 | (E2 C2 _D2) | C2 D2 E =E | F3 F E D | (C2 E3) D | (D2 C) |]\nV:B1\nC C D | C3/2 A,/2 A, A, A, A, | (A,2 C2 D2) | E2 D2 C A, | (A,2 G,) || D D D | C3/2 A,/2 A, A, A, A, | A,6 | A,2 C3 B, | (D2 C4) || B,2 A,2 G, C | (B,2 A,2) G,2 | G, G, A,2 A,2 | (G,2 A,2 B,2) | A,2 F, G, A,2 | A,3 F, G, A, | (A,2 C3) B, | (B,2 HA,) |]\nV:B2\nA, A, A, | A,3/2 A,,/2 B,, C, D, F, | (A,4 B,2) | C2 B,2 A,2 | E,3 || E, F, G, | A,3/2 A,,/2 B,, C, D, F, | (A,2 A,,2 C,2) | E,2 E,3 E, | (E,2 A,4) || G,2 F,2 E,2 | =D,4 E,2 | B,, B,, B,,2 B,,2 | E,6 | A,,2 B,,2 C,2 | D,3 D, D, D, | E,4 E,2 | (E,2 A,,) |]",
    "holds": [
      {
        "onset": 47.5,
        "duration": 0.5,
        "voices": [
          "T1",
          "T2",
          "B1",
          "B2"
        ],
        "orientation": "fermata"
      }
    ]
  },
  // HERMON: original 1912 p51 / RFPA p96, one upright final sign per staff.
  "psalter54": {
    "music": "M:3/2\nL:1/8\nK:Ab\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE4 | C2 D2 E2 A2 F2 A2 | E6 || A2 A2 A2 | (G3 A B4) G4 | A8 || c4 | c2 c2 c4 c4 | c2 B2 B2 || G2 A2 E2 | F8 F4 | HE8 |]\nV:T2\nC4 | A,2 B,2 C2 C2 D2 F2 | C6 || E2 E2 E2 | E8 E4 | E8 || E4 | E2 E2 F4 F4 | F2 F2 E2 || E2 E2 C2 | D8 D4 | C8 |]\nV:B1\nA,4 | A,2 A,2 A,2 A,2 A,2 A,2 | A,6 || C2 E2 C2 | (B,3 C D4) B,4 | C8 || A,4 | A,2 A,2 A,4 A,4 | A,2 A,2 G,2 || B,2 A,2 A,2 | A,8 A,4 | HA,8 |]\nV:B2\nA,,4 | A,,2 A,,2 A,,2 A,,2 A,,2 A,,2 | A,,6 || A,,2 C,2 A,,2 | E,8 E,4 | A,,8 || A,4 | A,2 A,2 F,4 F,4 | =D,2 D,2 E,2 || _D,2 C,2 A,,2 | D,8 D,4 | A,,8 |]",
    "holds": [
      {
        "onset": 44,
        "duration": 4,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 44,
        "duration": 4,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "fermata"
      }
    ]
  },
  "psalter212": {
    "music": "M:3/4\nL:1/4\nK:Ab\n%%score (T1 T2)(B1 B2)\n%%stretchlast 1\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\n[V:T1] E | (E A) B | c2 c | (d A) B | c2 || c | (c B) F | G2 A | !fermata!B2 ||\n[V:T2] C | (C E) E | E2 _G | F2 _F | E2 || E | =D2 D | E2 =D | !fermata!_D2 ||\n[V:B1] A, | A,2 G, | A,2 A, | A,2 A, | A,2 || A, | F,2 B, | B,2 B, | !fermata!B,2 ||\n[V:B2] A,, | (A,, C,) E, | A,2 A, | D,2 D, | A,,2 || A,, | B,,2 B,, | E,2 F, | !fermata!G,2 ||\n[V:T1] E | (E A) B | c2 e | (e d) A | c2 || c | (c B) F | (G !fermata!c) B | !fermata!A2 |]\n[V:T2] D | (C E) E | E2 _G | F2 F | E2 || E | =D2 D | (_D !fermata!E) D | !fermata!C2 |]\n[V:B1] G, | A,2 G, | A,2 A, | A,2 A, | A,2 || A, | A,2 A, | (B, !fermata!A,) G, | !fermata!A,2 |]\n[V:B2] E, | (A,, C,) E, | A,2 C, | D,2 D, | A,,2 || A,, | B,,2 B,, | !fermata!E,2 E, | !fermata!A,,2 |]",
    "holds": [
      {
        "onset": 19,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 19,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 37,
        "duration": 2,
        "voices": [
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 38,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 38,
        "duration": 1,
        "voices": [
          "B1"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 40,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 40,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "fermata"
      }
    ]
  },
  "psalter279": {
    "music": "M:6/4\nL:1/4\nK:Ab\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble name=\"Soprano\"\nV:T2 clef=treble name=\"Alto\"\nV:B1 clef=bass name=\"Tenor\"\nV:B2 clef=bass name=\"Bass\"\nV:T1\nE | c2 c c2 B | A2 F A2 || d | c2 c (c B) A | (B3 !fermata!e2) | E | c2 c c2 B | A2 F A2 || d | c2 e B2 c | A3- A2 |]\nV:T2\nC | E2 E E2 C | D2 D D2 || F | E2 E =D2 D | E3- !fermata!E2 | D | (C E) E E2 C | D2 D D2 || F | E2 A G2 E | E3- E2 |]\nV:B1\nA, | A,2 A, A,2 _G, | F,2 A, F,2 || A, | A,2 A, A,2 A, | G,3- !fermata!G,2 | _B, | A,2 A, A,2 _G, | F,2 A, F,2 || A, | A,2 C D2 E | C3- C2 |]\nV:B2\nA,, | A,,2 A,, A,,2 A,, | _D,2 D, _D,2 || _D, | A,,2 A, F,2 F, | E,3- !fermata!E,2 | E, | A,,2 A,, A,,2 A,, | _D,2 D, _D,2 || _D, | E,2 E, E,2 E, | A,,3- A,,2 |]",
    "holds": [
      {
        "onset": 22,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 22,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter288": {
    "music": "M:3/4\nL:1/8\nK:Ab\n%%score (S A)(T B)\nV:S clef=treble name=\"Soprano\"\nV:A clef=treble name=\"Alto\"\nV:T clef=bass name=\"Tenor\"\nV:B clef=bass name=\"Bass\"\nV:S\nE2 | (E2 c2) B2 | (B2 A2) F2 | E4 C2 | E4 || E2 | (E2 B2) A2 | (G2 d2) c2 | !fermata!B4 || e2 | (e2 d2) c2 | (c2 B2) A2 | (A2 B2) c2 | E4 || E2 | (F2 B2) A2 | A4 G2 | A4 |]\nV:A\nC2 | (C2 E2) D2 | C4 D2 | C4 A,2 | C4 || C2 | E2- E2 E2 | E4 E2 | !fermata!E4 || G2 | A4 A2 | E4 E2 | (C2 D2) E2 | C4 || C2 | (D2 F2) F2 | E4 E2 | E4 |]\nV:T\nA,2 | A,4 E,2 | E,4 A,2 | A,4 E,2 | A,4 || A,2 | (G,2 D2) C2 | B,4 A,2 | !fermata!G,4 || B,2 | (C2 F2) E2 | (E2 D2) C2 | A,4 A,2 | A,4 || A,2 | (A,2 D2) D2 | C4 B,2 | C4 |]\nV:B\nA,,2 | A,,4 A,,2 | A,,4 A,,2 | A,,4 A,,2 | A,,4 || A,,2 | E,4 E,2 | E,4 E,2 | !fermata!E,4 || E,2 | A,4 A,2 | A,4 A,2 | A,,4 A,,2 | A,,4 || A,,2 | D,4 D,2 | E,4 E,2 | A,,4 |]",
    "holds": [
      {
        "onset": 19,
        "duration": 2,
        "voices": [
          "S",
          "A"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 19,
        "duration": 2,
        "voices": [
          "T",
          "B"
        ],
        "orientation": "fermata"
      }
    ]
  },
  "psalter415": {
    "music": "M:4/4\nL:1/4\nK:G\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nG2 F2 | E D G A | B2 G2 || B2 B2 | c B G2 | A2 !fermata!G2 |\nG2 F2 | E D G A | B2 G2 || B2 B2 | c B G2 | A2 !fermata!G2 |\nG2 A2 | B2 G2 | c c B2 || G2 E2 | F D E G | F2 !fermata!G2 |\nB2 B2 | G2 c2 | B A G2 || B2 d2 | c B A G | A2 !fermata!G2 |]\nV:T2\nD2 D2 | C B, D D | D2 E2 || D2 E2 | E F E2 | F2 !fermata!D2 |\nE2 D2 | C A, D D | D2 E2 || E2 D2 | E D B,2 | D2 !fermata!D2 |\nE2 F2 | G2 E2 | E D D2 || D2 C2 | D D C B, | (D C) !fermata!B,2 |\nD2 ^D2 | E2 E2 | G F E2 || E2 F2 | E G E E | (E D) !fermata!B,2 |]\nV:B1\nB,2 B,2 | G, G, G, F, | G,2 G,2 || G,2 G,2 | G, D B,2 | C2 B,2 |\nB,2 B,2 | G, F, G, F, | G,2 B,2 || G,2 G,2 | G, F, E,2 | F,2 B,2 |\nB,2 D2 | D2 C2 | G, F, G,2 || G,2 G,2 | A, G, G, G, | A,2 G,2 |\nG,2 B,2 | B,2 A,2 | D C B,2 || G,2 B,2 | G, D C A, | (G, F,) G,2 |]\nV:B2\nG,2 B,,2 | C, G,, B,, D, | G,,2 C,2 || G,,2 E,2 | C, D, E,2 | D,2 !fermata!G,2 |\nE,2 B,,2 | C, D, B,, D, | G,,2 E,2 || E,2 G,2 | C, D, E,2 | D,2 !fermata!G,,2 |\nE,2 D,2 | G,,2 C,2 | A,, D, G,,2 || B,,2 C,2 | C, B,, C, E, | D,2 !fermata!G,2 |\nG,2 F,2 | E,2 A,,2 | B,, ^D, E,2 || E,2 B,,2 | C, G,, C, ^C, | D,2 !fermata!G,,2 |]",
    "holds": [
      {
        "onset": 22,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 22,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 46,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 46,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 70,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 70,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 94,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 94,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter416": {
    "music": "M:3/2\nL:1/4\nK:G\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nG A | B3 A G F | E2 D2 || G A | B3 c B A | G4 |\nG A | B3 A G F | E2 D2 || G A | B3 c B A | G4 |\nB B | d3 c B A | B4 || d d | e3 d c B | A4 |\nB d | c3 B G A | B2 !fermata!G2 || B B | c3 B A G | F2 !fermata!G2 |]\nV:T2\nD F | D3 F E =D | C2 B,2 || E F | G3 G G F | D4 |\nE F | G3 F E D | C2 A,2 || E F | G3 E D D/C/ | B,4 |\nD E | F3 G G E | F4 || G G | G3 G A G | F4 |\nG A | G3 D E E | F2 !fermata!E2 || D G | G3 G F D | (D C) !fermata!B,2 |]\nV:B1\nB, D | G,3 B, B, B, | G,2 G,2 || B, D | D3 E D D | B,4 |\nB, D | D3 D B, B, | G,2 F,2 || B, D | D3 G, G, F, | G,4 |\nG, G, | B,3 E D E | ^D4 || =D B, | C3 D D D | D4 |\nD D | E3 G, B, E | ^D2 B,2 || G, E | E3 D D D | A,2 G,2 |]\nV:B2\nG, D, | G,3 ^D, E, B,, | C,2 G,2 || E, D, | G,3 E, G, D, | G,4 |\nE, D, | G,3 D, E, B,, | C,2 D,2 || E, D, | G,,3 C, G,, D, | G,,4 |\nG, E, | B,,3 C, G, C, | B,,4 || B, G, | C3 B, F, G, | D,4 |\nG, F, | E,3 G, E, C, | B,,2 !fermata!E,2 || G, E, | C,3 G, D, B,, | D,2 !fermata!G,,2 |]",
    "holds": [
      {
        "onset": 82,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 82,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 94,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 94,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter417": {
    "music": "M:4/4\nL:1/4\nK:Ab\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nA2 B2 | B2 A A | d d c2 | B2 || A2 | B2 d2 |\nc B A G | A2 || c2 | c c B2 | B2 c e |\n=d2 e2 || B2 B B | c2 B2 | A G F2 | E2 ||\nc2 | e d c2 | B2 c d | c2 || c2 | B A A2 | G2 !fermata!A2 |]\nV:T2\nE2 F2 | (E D) C D | F E E2 | E2 || C2 | E2 F2 |\nE E C E/D/ | C2 || E2 | =E F F2 | E2 E E |\n(F A) G2 || G2 F E | E2 F2 | F E (E =D) | E2 ||\nE2 | _G F C2 | E2 E F | E2 || E2 | E C F2 | E2 !fermata!E2 |]\nV:B1\nC2 D2 | G,2 F, F, | B, G, A,2 | G,2 || A,2 | G,2 A,2 |\nA, G, A, B, | A,2 || A,2 | G, A, A,2 | G,2 A, G, |\nB,2 B,2 || E2 A, G, | A,2 (A, B,) | _C B, A,2 | G,2 ||\nA,2 | =A, B, A,2 | G,2 A, A, | A,2 || A,2 | G, A, D2 | B,2 C2 |]\nV:B2\nA,2 D,2 | E,2 F, D, | B,, E, A,,2 | E,2 || F,2 | E,2 D,2 |\nE, E, F, E, | A,,2 || A,,2 | C, F, =D,2 | E,2 A,, C, |\nB,,2 E,2 || E,2 =D, E, | A,,2 D,2 | =D, E, B,,2 | E,2 ||\nA,,2 | C, D, F,2 | E,2 A,, D, | A,2 || A,,2 | E, F, D,2 | E,2 !fermata!A,,2 |]",
    "holds": [
      {
        "onset": 74,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 74,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter418": {
    "music": "M:4/2\nL:1/4\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nB G E2 F2 G2 | A G F2 F2 E2 |\nB B c2 d2 e2 | B c A2 B2 G2 || E F |\nG2 A2 G2 || F E E2 D2 E2 || B c | B2 A2 G2 |\nG F G2 =A2 B2 | e d c2 c2 B2 || c B |\nA2 G2 F2 || E G B2 A2 G2 || F E E2 D2 !fermata!E2 |]\nV:T2\nE D C2 D2 E2 | F E C2 D2 B,2 |\nE E E2 A2 G2 | E E D2 F2 E2 || E D |\nE2 C2 E2 || C C C2 B,2 B,2 || E E | E2 D2 E2 |\nE E E2 E2 D2 | E G E2 A2 G2 || E E |\nF2 E2 D2 || B, E G2 E2 E2 || C C B,2 B,2 !fermata!B,2 |]\nV:B1\nG, B, G,2 B,2 B,2 | B, B, A,2 A,2 G,2 |\nB, G, A,2 B,2 B,2 | B, A, B,2 B,2 B,2 || B, B, |\nB,2 A,2 B,2 || A, G, =A,2 _A,2 G,2 || B, A, | B,2 B,2 B,2 |\nC C B,2 C2 B,2 | G, B, A,2 D2 E2 || A, B, |\nB,2 B,2 B,2 || G, C D2 C2 B,2 || A, F, (F, G,) A,2 G,2 |]\nV:B2\nE, B,, C,2 B,,2 E,2 | D, E, A,,2 B,,2 E,2 |\nG, E, A,2 F,2 E,2 | G, A, F,2 D,2 E,2 || G, B,, |\nE,2 A,,2 E,2 || A,, C, F,,2 B,,2 E,2 || G, A, | G,2 F,2 E,2 |\nC, =A, B,2 F,2 B,,2 | C, G, A,2 F,2 G,2 || A, G, |\nD,2 E,2 B,,2 || E, C, G,,2 A,,2 E,2 || A,, =A,, B,,2 B,,2 !fermata!E,2 |]",
    "holds": [
      {
        "onset": 94,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 94,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter419": {
    "music": "M:4/4\nL:1/4\nK:G\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nB2 B B | E2 B2 | c B A2 | G2 || A2 | B A G2 | F2 !fermata!E2 |\nB2 B B | E2 B2 | c B A2 | G2 || A2 | B A G2 | F2 !fermata!E2 |\nE2 G G | F F G A | B2 A2 || B2 c B | A2 A2 | G4 |\nB2 A G | F D E F | G2 F2 || G2 A G | F2 F2 | E4 |]\nV:T2\nE2 ^D E | C2 D2 | E D (D C) | B,2 || D2 | D D D2 | D2 B,2 |\n^D2 E =F | E2 D2 | C D D2 | D2 || D2 | D D B,2 | B,2 B,2 |\nC2 D E | D C B, E | D2 D2 || D2 C D | F2 F2 | E4 |\nD2 C B, | D D C C | D2 D2 || D2 E D | C2 (B, A,) | G,4 |]\nV:B1\nG,2 F, B, | G,2 G,2 | G, G, F,2 | G,2 || F,2 | G, F, G,2 | A,2 G,2 |\nF,2 G, G, | G,2 ^G,2 | A, G, (F, C) | B,2 || F,2 | G, F, E,2 | (^D, A,) G,2 |\nG,2 G, C | A, A, G, E,/F,/ | G,2 F,2 || G,2 E, G, | C2 B,2 | B,4 |\nG,2 F, G, | A, G, G, A, | G,2 A,2 || B,2 A, B, | E,2 ^D,2 | E,4 |]\nV:B2\nE,2 B,, G,, | C,2 G,,2 | C, G,, D,2 | G,,2 || D,2 | G,, D, B,,2 | D,2 !fermata!E,2 |\nB,,2 E, D, | C,2 E,2 | A,, B,, D,2 | G,2 || D,2 | G,, D, E,2 | B,,2 !fermata!E,2 |\nC,2 B,, C, | D, ^D, E, C, | (B,, C,) D,2 || G,,2 A,, B,,/C,/ | D,2 ^D,2 | E,4 |\nG,,2 D, E, | D, B,, C, A,, | B,,2 D,2 || G,2 C, B,, | A,,2 B,,2 | E,,4 |]",
    "holds": [
      {
        "onset": 22,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 22,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 46,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 46,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter420": {
    "music": "M:4/4\nL:1/4\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE2 E F | G2 E2 | G =A B2 || B2 A G | F2 E2 | G =A B2 |\nc2 B A | G E F2 | !fermata!E2 || E2 | E F G2 | E2 G =A | B2 |\nB2 | A G F2 | E2 G =A | B2 || c2 | B A G E | F2 !fermata!E2 |\ne2 e e | d2 B2 | c c B2 || e2 e e | d2 B2 | c c B2 |\nG2 A c | B G A2 | G2 || F2 | G A B2 | A2 G G | F2 |\nB2 | c d e2 | d2 c c | B2 || E2 | F G A G | F2 !fermata!E2 |]\nV:T2\nB,2 C D | E2 E2 | E E D2 || F2 D E | D2 E2 | E E D2 |\nD2 E C | D C D2 | B,2 || B,2 | C D E2 | E2 E E | D2 |\nE2 | C E D2 | E2 E E | D2 || D2 | E C D C | D2 B,2 |\nG2 A F | F2 F2 | G F/E/ D2 || G2 E G | F2 F2 | G F/E/ D2 |\nE2 E E | D C C2 | B,2 || D2 | E E E2 | E2 E E | D2 |\nF2 | A A G2 | F2 F E | D2 || E2 | D E E E | (E D) B,2 |]\nV:B1\nG,2 G, B, | B,2 B,2 | C C B,2 || B,2 B, B, | B,2 B,2 | C C B,2 |\nF,2 G, E, | B, G, (B, A,) | G,2 || G,2 | A, A, B,2 | C2 B, F, | B,2 |\nG,2 | A, B, B,2 | B,2 C C | B,2 || F,2 | G, E, B, G, | (B, A,) G,2 |\nB,2 C C | B,2 B,2 | G, =A, B,2 || B,2 B, B, | B,2 B,2 | G, =A, B,2 |\nB,2 A, A, | F, E, E,2 | E,2 || B,2 | B, C B,2 | C2 B, B, | B,2 |\nD2 | E B, B,2 | B,2 =A, A, | B,2 || G,2 | B, B, C B, | (C B,/A,/) G,2 |]\nV:B2\nE,2 C, B,, | E,2 G,2 | C, F, B,,2 || D,2 F, G, | (B, A,) G,2 | C, F, B,,2 |\nA,,2 G,, A,, | B,, C, B,,2 | !fermata!E,2 || E,2 | A,/G,/ F, E,2 | A,2 E, F, | B,,2 |\nE,2 | F, G, (B, A,) | G,2 C, F, | B,,2 || A,,2 | G,, A,, B,, C, | B,,2 !fermata!E,2 |\nE,2 A, =A, | B,2 D,2 | E, F, G,2 || E,2 G, E, | B,,2 D,2 | E, F, B,,2 |\nE,2 C, A,, | B,, C, A,,2 | E,2 || B,,2 | E, C, G,,2 | A,,2 E, E, | B,,2 |\nB,2 | A, F, E,2 | B,,2 F, F, | B,,2 || C,2 | B,, E,/D,/ C,/D,/ E, | (A,, B,,) !fermata!E,2 |]",
    "holds": [
      {
        "onset": 32,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 32,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 66,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 66,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 134,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 134,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter421": {
    "music": "M:4/4\nL:1/4\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE2 | B A G F | E2 F2 | G2 || G2 | c c B G |\nB2 A2 | G2 || B2 | A G F B | A G F2 | E2 |\nE2 | G A B2 | c2 B =A | B2 || E2 | G A B2 | c2 B =A | B2 |\ne2 | d c B G | A B c2 | B2 || B2 | B A G2 |\nc2 B A | G2 || E2 | G B F A | G2 F2 | !fermata!E2 |]\nV:T2\nE2 | E C E D | C2 D2 | E2 || E2 | E E B, E |\nE2 F2 | D2 || E2 | C E B, F | F E (E D) | B,2 |\nB,2 | E E D2 | E2 D C | D2 || E2 | E E E2 | E2 D C | D2 |\nE2 | F E D E | F F (F E) | D2 || E2 | F F E2 |\nE2 E C | E2 || E2 | E F D F | E2 D2 | B,2 |]\nV:B1\nG,2 | G, A, B, A, | G,2 B,2 | B,2 || B,2 | A, A, F, B, |\nB,2 C2 | =B,2 || G,2 | F, C F, D | C C (C B,/A,/) | G,2 |\nG,2 | B, A, F,2 | A,2 F, F, | F,2 || G,2 | C C B,2 | A,2 F, F, | B,2 |\nG,2 | B, G, G, C | C B, =A,2 | B,2 || G,2 | B, B, B,2 |\nA,2 G, A, | C2 || B,2 | B, B, B, C | B,2 (B, A,) | G,2 |]\nV:B2\nE,2 | E, F, B,, B,, | C,2 B,,2 | E,2 || E,2 | A,, C, D, E, |\nG,2 F,2 | G,2 || E,2 | F, C, D, B,, | F, C, (A,, B,,) | E,2 |\nE,2 | E, C, B,,2 | A,,2 B,, F, | B,,2 || E,2 | C, A,, G,,2 | A,,2 B,, F, | B,,2 |\nC,2 | B,, C, G, C, | F, D, F,2 | B,,2 || E,2 | D, B,, E,2 |\nA,,2 E, F, | C,2 || G,2 | E, D, B,, F, | (G, A,) (B, B,,) | !fermata!E,2 |]",
    "holds": [
      {
        "onset": 94,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 94,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter423": {
    "music": "M:4/4\nL:1/4\nK:D\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nA2 | B d d c | d2 || d2 | B c d B | A2 |\nA2 | d B c d | B2 A2 || D2 F A |\nG F E2 | D2 || F2 | E A A ^G | A2 |\nF2 | E A A ^G | A2 || F2 | B B A G | F2 |\nF2 | B B A G | F2 || A2 D G | F2 E2 | !fermata!D2 |]\nV:T2\nF2 | D F G E | F2 || F2 | G G F D | C2 |\nD2 | D D E F | (F E/D/) C2 || A,2 D F |\nD D (D C) | D2 || D2 | E E D D | C2 |\nD2 | E C B, D | C2 || D2 | D G E C | D2 |\nD2 | D D E C | C2 || D2 D D | D2 (D C) | D2 |]\nV:B1\nD2 | G, A, B, A, | A,2 || B,2 | D A, A, ^G, | E,2 |\nF,2 | A, B, G, B, | (A, ^G,) A,2 || F,2 A, D |\nD A, (B, A,/G,/) | F,2 || A,2 | A, C B, B, | A,2 |\nA,2 | A, A, F, B, | A,2 || A,2 | G, E A, A, | A,2 |\nB,2 | D G, E, A, | ^A,2 || F,2 F, B, | A,2 (A, G,) | F,2 |]\nV:B2\nD,2 | G, D, G, A, | D,2 || B,,2 | G, E, D, E, | A,,2 |\nD,2 | F, G, E, B,, | (D, E,) A,,2 || D,2 D, D, |\nB,, D, (G,, A,,) | D,2 || D,2 | C, A,, B,, E, | A,,2 |\nD,2 | C, F, ^D, E, | A,,2 || D,2 | G, E, C, E, | D,2 |\nB,,2 | G,, B,, C, E, | F,2 || D,2 B,, G,, | A,,2 A,,2 | !fermata!D,2 |]",
    "holds": [
      {
        "onset": 76,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 76,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter429": {
    "music": "M:4/4\nL:1/4\nK:D\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nD2 F G | A2 d2 | c B A2 || A2 B A | F2\nF2 | G F E2 | !fermata!D2 || D2 | F G A2 | d2 c B\nA2 || A2 | B A F2 || F2 G F | E2 !fermata!D2 |\nd2 c B | A d c2 | B2 A2 || A2 E2 | G2 F\nE | F G (A2 | B2) !fermata!A2 || D2 D E | F D F2 |\n^G2 A2 || A2 E2 | G2 F || A | G F E2 | !fermata!D2 z2 |]\nV:T2\nA,2 D E | E2 D2 | F D C2 || D2 D E | D2\nD2 | D D C2 | !fermata!A,2 || B,2 | C D D2 | F2 F D\nC2 || D2 | D C D2 || D2 E D | C2 !fermata!D2 |\nF2 F D | D F F2 | D2 C2 || D2 C2 | D2 D\nC | D D D2- | D2 !fermata!C2 || A,2 B, C | D D D2 |\nD2 E2 || D2 E2 | D2 D || E | D D C2 | !fermata!A,2 z2 |]\nV:B1\nF,2 B, B, | A,2 F,2 | A, G, E,2 || F,2 F, A, | A,2\nB,2 | B, A, A,2 | !fermata!F,2 || F,2 | A, B, A,2 | B,2 A, G,\nE,2 || F,2 | G, E, D,2 || B,2 B, A, | A,2 !fermata!F,2 |\nB,2 A, G, | A, B, A,2 | G,2 E,2 || F,2 A,2 | B,2 A,\nA, | A, B, (A,2 | G,2) !fermata!E,2 || F,2 F, A, | A, B, A,2 |\nB,2 C2 || F,2 A,2 | B,2 A, || C | B, A, (A, G,) | !fermata!F,2 z2 |]\nV:B2\nD,2 B,, E, | C,2 B,,2 | F,, G,, A,,2 || D,2 B,, C, | D,2\nB,,2 | G,, D, A,,2 | !fermata!D,2 || B,,2 | A,, G,, F,,2 | B,,2 F,, G,,\nA,,2 || D,2 | G,, A,, B,,2 || B,,2 E,, F,, | A,,2 !fermata!D,2 |\nB,,2 F, G, | F, B,, F,,2 | G,,2 A,,2 || D,2 A,,2 | G,,2 D,\nA,, | D, G,, (F,,2 | G,,2) !fermata!A,,2 || D,2 B,, A,, | D, G, D,2 |\nB,,2 A,,2 || D,2 C,2 | B,,2 D, || A,, | B,, D, A,,2 | !fermata!D,2 z2 |]",
    "holds": [
      {
        "onset": 24,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 24,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 50,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 50,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 78,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 78,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 104,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 104,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter431": {
    "music": "M:4/4\nL:1/4\nK:D\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nA2 A2 | B c d2 | d2 c2 | B A B2 | A4 |\nA2 A2 | B c d2- | d2 || A B | A2 G2 | F2 |\nA B | A2 G2 | F4 || B A G F | E2 !fermata!D2 |]\nV:T2\nF2 D2 | G G F2 | F2 F2 | D F G2 | F4 |\nE2 F2 | F G F2- | F2 || D D | D2 D2 | D2 |\nD G | E2 E2 | D4 || D D D D | C2 !fermata!D2 |]\nV:B1\nD2 A,2 | D A, A,2 | B,2 A,2 | D D D2 | D4 |\nA,2 D2 | D E [A,D]2- | [A,D]2 || A, G, | A,2 B,2 | A,2 |\nA, D | A,2 B,2 | B,4 || G, A, B, A, | (A, G,) !fermata!F,2 |]\nV:B2\nD,2 F,2 | G, E, D,2 | B,,2 F,2 | G, D, G,2 | D,4 |\nC,2 D,2 | B, A, D,2- | D,2 || F, G, | F,2 G,2 | D,2 |\nF, G, | C,2 E,2 | B,,4 || G, F, G, D, | A,,2 !fermata!D,2 |]",
    "holds": [
      {
        "onset": 54,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 54,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter432": {
    "music": "M:2/2\nL:1/4\nK:G\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nG D | E2 F2 | G2 || B B | c2 A2 | G2 || d d | B2 ^c2 | d2 |\nB d | c2 c2 | B2 || d c | B2 A2 | G2 || E ^F | G2 E2 | D4 |\nD G A B | c2 B2 || G A B c | A2 !fermata!G2 |]\nV:T2\nB, D | C2 D2 | D2 || D G | E2 F2 | G2 || G F | D2 E2 | F2 |\nD G | E2 F2 | D2 || D E | D2 F2 | E2 || E ^D | E2 ^C2 | D4 |\nD D D D | E2 D2 || E F G G | ^F2 D2 |]\nV:B1\nG, G, | G,2 C2 | B,2 || G, D | A,2 C2 | B,2 || G, A, | G,2 G,2 | A,2 |\nG, G, | A,2 A,2 | G,2 || G, G, | G,2 C2 | B,2 || B, B, | B,2 (A, G,) | F,4 |\nB, B, F, G, | G,2 G,2 || B, D D C | (D C) B,2 |]\nV:B2\nG,, B,, | C,2 A,,2 | G,,2 || G,, B,, | A,,2 D,2 | G,,2 || G, D, | G,2 E,2 | D,2 |\nG, B,, | A,,2 D,2 | G,2 || B,, C, | D,2 ^D,2 | E,2 || G, B,, | E,2 A,,2 | D,4 |\nG,, B,, D, G,, | C,2 G,,2 || E, D, G, E, | D,2 !fermata!G,,2 |]",
    "holds": [
      {
        "onset": 64,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 64,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter433": {
    "music": "M:C\nL:1/8\nK:Ab\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE | E4 F3/2 F/2 E3/2 A/2 | A4 G4 | A4- A G/2 A/2 B3/2 E/2 | c4- c3/2\nc/2 d3/2 c/2 | B4- B3/2 B/2 c3/2 B/2 | A6 A2 | G4- G F/2 G/2 A3/2 F/2 |\nF4 =E4 | [M:3/4] F2 F2 F2 | F6 | G2 F3 G | E4 z A | A2 A2 A2 |\nc4 c2 | =d3 d c d | [M:C] e4 !fermata!e2 E2 | A3 A G2 (3F G F |\nF4 E2 E3/2 E/2 | A3 A G2 F2 | F4 E2 !ff!E2 | A4 A3 A | A2 A2 z2 A2 |\nc4 c3 d | e4 e4 | !fff!f4 c3 d | e4 e4 | e8 | (B6 c2) | A8 |]\nV:T2\nC | C4 C3/2 C/2 E3/2 E/2 | D4 D4 | C4- C C/2 C/2 D3/2 D/2 | C4- C3/2\nA/2 A3/2 A/2 | G4- G3/2 G/2 G3/2 G/2 | F6 F2 | F4- F F/2 G/2 A3/2 C/2 |\nC4 C4 | [M:3/4] C2 C2 C2 | D6 | D2 D2 D2 | C4 z F | F2 F2 F2 |\nA4 A2 | A3 A A A | [M:C] G4 !fermata!G2 E2 | A3 A G2 (3F G F |\nF4 E2 E3/2 E/2 | E3 E D2 D2 | D4 D2 E2 | C4 C3 C | C2 C2 z2 F2 |\nF4 F2 A2 | (A2 F2) G4 | A4 F2 A2 | (A2 F2) G4 | A8 | (G2 F2 G4) | E8 |]\nV:B1\nA, | A,4 A,3/2 A,/2 A,3/2 A,/2 | E,4 E,4 | E,4- E, E,/2 E,/2 E,3/2 G,/2 | A,4- A,3/2\nE/2 F3/2 E/2 | D4- D3/2 D/2 E3/2 D/2 | C6 C2 | =B,4- B, F,/2 G,/2 A,3/2 A,/2 |\nA,4 G,4 | [M:3/4] F,2 F,2 F,2 | B,6 | B,2 B,2 B,2 | A,4 z C | C2 C2 C2 |\nC4 C2 | B,3 B, B, B, | [M:C] B,4 !fermata!B,2 E,2 | A,3 A, G,2 (3F, G, F, |\nF,4 E,2 E,3/2 E,/2 | A,3 A, B,2- B, A, | A,4 G,2 E,2 | E,4 E,3 E, | F,2 F,2 z2 C2 |\nA,4 A,3 B, | B,4 D4 | C4 A,3 B, | B,4 D4 | C8 | D8 | C8 |]\nV:B2\nA,, | A,,4 A,,3/2 A,,/2 C,3/2 C,/2 | B,,4 B,,4 | A,,2 A,,2 A,,2 G,,3/2 E,/2 | A,,4- A,,3/2\nA,/2 A,3/2 A,/2 | (E,2 F,2 G,3/2) E,/2 E,3/2 E,/2 | (F,2 G,2 A,2) F,2 | G,2 G,2 G, F,/2 G,/2 A,3/2 F,/2 |\nC,4 C,4 | [M:3/4] A,,2 A,,2 A,,2 | G,,6 | E,2 E,2 E,2 | A,,4 z F, | F,2 F,2 F,2 |\nF,4 F,2 | B,,3 B,, B,, B,, | [M:C] E,4 !fermata!E,2 E,2 | A,3 A, G,2 (3F, G, F, |\nF,4 E,2 E,3/2 E,/2 | C,2 =B,,2 _B,,2 B,,2 | E,4 E,2 E,2 | A,,4 _G,,3 G,, | F,,2 F,,2 z2 F,2 |\nF,4 F,2 =E,2 | E,4 E,4 | F,4 F,2 =E,2 | E,4 E,4 | A,8 | E,8 | A,8 |]",
    "holds": [
      {
        "onset": 55.5,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 55.5,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter434": {
    "music": "M:4/4\nL:1/8\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE2 | B2 A2 G2 F2 | E2 F2 !fermata!G2 G2 | F2 E2 E2 D2 | E6\nB2 | e2 e2 d2 B2 | c2 c2 !fermata!B2 E2 | G2 F E E2 D2 | E6\nEF | G2 G2 c2 c2 | B2 A2 !fermata!G2 EF | G2 G2 c2 e2 | d2 c2 !fermata!B2\n\"^rit.\"c2 | B2 A2 !fermata!G2 B2 | (A2 G2) !fermata!F2 \"^a tempo\"E2 | B2 A2 G2 F2 | E2 F2 !fermata!G2\nG G | F2 E2 E2 D2 | E4 E2 B2 | e2 e e d2 !fermata!B B |\nc2 c c B2 !fermata!B E | G2 F E E2 D2 | E6 z2 | E8 | E8 |]\nV:T2\nE2 | E2 F2 E2 D2 | E2 D2 E2 C2 | C2 C2 B,2 B,2 | B,6\nFG | F2 F2 F2 FG | G2 E2 D2 C2 | C2 C C B,2 B,A, | B,6\nCD | E2 E2 E2 E2 | E2 ED E2 CD | E2 E2 E2 G2 | F2 E2 D2\nA2 | G2 F2 E2 G2 | (F2 E2) D2 E2 | E2 F2 E2 D2 | E2 D2 E2\nC C | C2 C2 B,2 B,2 | B,4 B,2 FG | F2 F F F2 F F |\nG2 E E D2 D C | C2 C C B,2 B,A, | B,6 z2 | =B,8 | _B,8 |]\nV:B1\nG,A, | B,2 B,2 B,2 B,A, | G,2 B,2 !fermata!B,2 A,G, | A,2 A,2 G,2 F,A, | G,6\nB,2 | =A,2 A,2 B,2 B,2 | B,2 =A,2 !fermata!B,2 G,2 | A,2 A, A, G,2 F,2 | G,6\nG,2 | G,2 G,2 G,2 A,2 | G,2 A,B, B,2 G,2 | G,2 G,2 G,2 =A,2 | =A,2 A,2 F,2\n_A,2 | B,2 C2 B,2 B,2 | B,4 B,2 G,A, | B,2 B,2 B,2 B,A, | G,2 B,2 B,2\nA, A, | A,2 A,2 G,2 F,A, | A,4 G,2 B,2 | =A,2 A, A, B,2 B, B, |\nB,2 =A, A, B,2 B, G, | A,2 A, A, G,2 F,2 | G,6 z2 | A,8 | G,8 |]\nV:B2\nE,F, | G,2 D,2 E,2 B,,2 | C,2 B,,2 !fermata!E,2 A,,2 | A,,2 A,,2 B,,2 B,,2 | E,6\nD,2 | C,2 C,2 D,2 D,2 | E,2 F,2 !fermata!G,2 C,B,, | A,,2 A,, A,, B,,2 B,,2 | E,6\nC,2 | C,2 C,D, E,2 E,2 | E,2 F,2 !fermata!E,2 E,2 | C,2 C,D, E,2 F,,2 | F,,2 F,,2 !fermata!B,,2\nF,2 | G,2 A,2 !fermata!B,2 D,2 | (D,2 E,2) !fermata!B,,2 E,F, | G,2 D,2 E,2 B,,2 | C,2 B,,2 !fermata!E,2\nA,, A,, | A,,2 A,,2 B,,2 B,,2 | E,4 E,2 D,2 | C,2 C, C, D,2 !fermata!D, D, |\nE,2 F, F, G,2 !fermata!G, C, | A,,2 A,, A,, B,,2 B,,2 | E,6 z2 | E,8 | E,8 |]",
    "holds": [
      {
        "onset": 7,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 7,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 23,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 23,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 39,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 39,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 47,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 47,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 51,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 51,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 55,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 55,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 63,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 63,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 76,
        "duration": 0.5,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 76,
        "duration": 0.5,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 80,
        "duration": 0.5,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 80,
        "duration": 0.5,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter435": {
    "music": "L:1/4\nM:C|\nK:G\n%%score (T1 T2) (B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nG2 | G2 A2 | B2 B2 | c2 c2 | B4 | !fermata!A2 B2 | c2 B2 | A2 G2 | F2 G2 | !fermata!A2 d2 | c2 B2 | A2 F2 | G2 F2 | E4 | !fermata!D2 B2 | c2 B2 | A2 G2 | B2 A2 | !fermata!G2 |]\nV:T2\nB,2 | D2 D2 | D2 E2 | E2 (E F) | G4 | !fermata!F2 G2 | G2 G2 | F2 E2 | ^D2 E2 | !fermata!F2 D2 | E2 E2 | E2 (D C) | (B, ^C) D2 | ^C4 | !fermata!D2 D2 | E2 D2 | (D C) B,2 | D2 C2 | !fermata!B,2 |]\nV:B1\nD,2 | G,2 F,2 | G,2 G,2 | G,2 A,2 | D4 | !fermata!D2 D2 | C2 D2 | (D C) B,2 | B,2 B,2 | !fermata!D2 A,2 | A,2 G,2 | A,2 A,2 | G,2 A,2 | (A,2 G,2) | !fermata!F,2 G,2 | G,2 G,2 | F,2 G,2 | G,2 (G, F,) | !fermata!G,2 |]\nV:B2\nG,,2 | B,,2 D,2 | G,2 E,2 | C,2 A,,2 | (B,,2 C,2) | !fermata!D,2 G,2 | E,2 G,2 | D,2 E,2 | B,,2 E,2 | !fermata!D,2 F,2 | A,2 (E, D,) | C,2 D,2 | E,2 (F, D,) | A,,4 | !fermata!D,2 G,,2 | C,2 G,,2 | D,2 E,2 | (B,, C,) D,2 | !fermata!G,,2 |]",
    "holds": [
      {
        "onset": 18,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 18,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 34,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 34,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 54,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 54,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 70,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 70,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter437": {
    "music": "M:2/4\nL:1/4\nK:Em\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\n[V:T1] E2 | E E | D2 | D2 | (E G- | G F) | HG2 || B2 | B d | c B | A2 | HG2 || D2 | E G | F E | HB2 || d2 | d c | B A | G2 | HE2 | A2 | A G | F E | G2 | HD2 || E2 | B B | A2 | F2 | HE2 |]\n[V:T2] B,2 | C C | B,2 | B,2 | (C D | E D) | HD2 || D2 | E F | E D | D2 | HB,2 || B,2 | C D | D B, | HD2 || F2 | F E | D E | E2 | HE2 | E2 | E E | D C | B,2 | HB,2 || B,2 | B, D | E2 | D2 | HB,2 |]\n[V:B1] G,2 | G, A, | F,2 | G,2 | (G, G, | C A,) | H[G,B,]2 || G,2 | G, A, | A, F, | F,2 | HG,2 || G,2 | G, G, | A, G, | HF,2 || B,2 | A, A, | F, A, | B,2 | HG,2 | C2 | A, B, | B, G, | G,2 | HG,2 || G,2 | F, F, | A,2 | A,2 | HG,2 |]\n[V:B2] E,2 | C, A,, | B,,2 | G,,2 | (C, B,, | C, D,) | HG,,2 || G,2 | E, D, | A,, B,, | D,2 | HG,,2 || G,2 | C, B,, | D, E, | HB,,2 || B,,2 | D, A,, | B,, C, | E,2 | HE,2 | A,,2 | C, E, | B,, C, | G,,2 | HG,2 || E,2 | D, B,, | C,2 | D,2 | HE,2 |]",
    "holds": [
      {
        "onset": 12,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 12,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 22,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 22,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 30,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 30,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 40,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 40,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 50,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 50,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 60,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 60,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter441": {
    "music": "L:1/4\nM:4/4\nK:G\n%%score (T1 T2) (B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nD | G2 A2 | B2 B2 | B B A c | B2 HA || D | G2 A2 | B2 c2 | B A B c | d2 HB || B | A2 A2 | G2 G2 | G F G F | E2 HD || G | G2 F2 | G2 D2 | E G A B | A2 HG || D | G F G A | HB3 || D | G F G A | B3 || B | B B A c | B2 HA || d | c B A c | B3 || B | A G F E | D3 || D | E G A B | A2 HG |]\nV:T2\nB, | B,2 D2 | D2 E2 | F E E E | G2 HF || D | E2 F2 | G2 G2 | G F G G | F2 HD || G | F2 F2 | E2 E2 | D D B, D | ^C2 HD || D | B,2 D2 | B,2 B,2 | C B, D D | (E F) HB, || D | E B, B, D | HD3 || B, | B, D B, E | ^D3 || E | F E E C | (D E) HD || D | E D D E | ^D3 || D | F E D ^C | D3 || D | C B, D D | (D C) HB, |]\nV:B1\nG, | G,2 F,2 | G,2 G,2 | A, G, A, A, | D2 HD || B, | B,2 D2 | D2 E2 | D D D G, | A,2 HG, || D | D2 C2 | B,2 C2 | G, B, G, A, | (A, G,) HF, || G, | G,2 A,2 | G,2 G,2 | G, G, F, G, | (G, F,) HG, || B, | B, A, G, F, | HG,3 || G, | G, A, G, F, | F,3 || G, | A, G, C A, | G,2 HF, || B, | G, G, F, A, | F,3 || G, | D B, A, A, | A,3 || G, | G, G, F, G, | F,2 HG, |]\nV:B2\nG, | E,2 D,2 | G,,2 E,2 | ^D, E, C, A,, | (B,, C,) HD, || G, | E,2 D,2 | G,,2 C,2 | G,, D, G, E, | D,2 HG, || G, | D,2 D,2 | E,2 C,2 | B,, B,, E, D, | A,,2 HD, || B,, | E,2 D,2 | E,2 G,,2 | C, E, D, G,, | (C, D,) HG,, || G, | D, ^D, E, =D, | HG,,3 || G, | E, D, E, C, | B,,3 || E, | ^D, E, A,, A,, | (D, ^C,) HD, || B,, | C, G, D, A,, | B,,3 || G, | D, E, F, G, | F,3 || B,, | C, E, D, G,, | D,2 HG,, |]",
    "holds": [
      {
        "onset": 15,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 15,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 31,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 31,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 47,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 47,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 63,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 63,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 69,
        "duration": 3,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 69,
        "duration": 3,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 87,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 87,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      },
      {
        "onset": 111,
        "duration": 1,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 111,
        "duration": 1,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  },
  "psalter450": {
    "music": "M:4/4\nL:1/4\nK:F\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\n[V:T1] c2 d c | B A G2 || B2 A F | G G F2 || F2 | c c d c | B2 A2 || c2 A B | A G F2 || F2 D E | F D C2 || F2 G A | B A G2 | !fermata!F2 |]\n[V:T2] F2 F F | G F E2 || F2 F C | D E C2 || D2 | G F F F | (F E) F2 || G2 F G | F E C2 || D2 D ^C | D =B, C2 || D2 D F | E F (F E) | C2 |]\n[V:B1] A,2 B, C | D C C2 || B,2 C A, | D B, A,2 || A,2 | C C B, C | (D C) C2 || C2 C D | C B, A,2 || A,2 A, A, | A, G, G,2 || A,2 B, C | C C (D C/)B,/ | [F,A,]2 |]\n[V:B2] F,2 B,, A,, | G,, A,,/B,,/ C,2 || D,2 F, A,, | B,, C, F,2 || D,2 | E, A,, B,, A,, | (G,, C,) F,2 || E,2 F, B,, | C, C, F,2 || D,2 F, E, | D, F, E,2 || D,2 B,, A,, | G,, A,, (B,, C,) | !fermata!F,,2 |]",
    "holds": [
      {
        "onset": 50,
        "duration": 2,
        "voices": [
          "T1",
          "T2"
        ],
        "orientation": "fermata"
      },
      {
        "onset": 50,
        "duration": 2,
        "voices": [
          "B1",
          "B2"
        ],
        "orientation": "invertedfermata"
      }
    ]
  }
};
