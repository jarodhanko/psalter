import type { TimingWitness } from './types';

// Exact-source native lyric timing reviewed against Schaefkofer's 2021 SATB.
// The complete source/row identity prevents inference for an altered edition.
// Prefer S, then B (both enter at q1), then T (q17), then A (q33), so a
// reduced combination retains every phrase actually sung by its visible parts.
// No musical token is changed; full SATB keeps its one shared soprano row.
const witness: TimingWitness = {
  "id": "hymn-aperio-wayfaring-stranger",
  "source": "X:1\nT:Poor Wayfaring Stranger\nC:American traditional; arr. Kenan Schaefkofer, 2021\nS:Music: Hymn Singer, I am a poor wayfaring stranger, Kenan Schaefkofer, 2021\nS:Text: The Public Domain Song Anthology (Berger/Israels, 2020), printed p.344 / PDF p.364\nZ:Composite edition: Hymn Singer SATB music with the retained anthology stanza and refrain; editorial lyric underlay\nN:Four authored SATB parts, uniformly transposed from D minor to E minor; source rests, ties, slurs and 32-bar form retained.\nN:Soprano and bass enter together; tenor joins the second phrase and alto the third. Silent parts are not filled.\nN:Only the previously selected stanza and refrain are retained, including While journ-'ying, nor and going. Source stanzas 2 and 3 are omitted.\nN:Kenan Schaefkofer dedicates his copyright and related rights in the arrangement to the public domain to the extent possible under law; no formal CC0 instrument is established for the music.\nN:Retained anthology text: underlying US public-domain assertion; new anthology contributions CC0 1.0. No recording-specific arrangement clearance is claimed.\nM:2/2\nL:1/4\nQ:1/4=130\n%%score { ( 1 2 ) | ( 3 4 ) }\nV:1 clef=treble name=\"Soprano\" stem=up\nV:2 clef=treble name=\"Alto\" stem=down\nV:3 clef=bass name=\"Tenor\" stem=up\nV:4 clef=bass name=\"Bass\" stem=down\nK:Em\n[V:1] z E E B | B4- | B G A B | G E3 |\nw: I am a poor_ way-far-ing stran-ger\n[V:2] z x3 | x4 | x4 | x4 |\n[V:3] z x3 | x4 | x4 | x4 |\n[V:4] z E, E, B, | B,4- | B, G, A, B, | G, E,3 |\n[V:1] z E E B | A4- | A E G A | B4 |\nw: While journ-'ying through_ this world of woe,\n[V:2] z x3 | x4 | x4 | x4 |\n[V:3] z E, E, B, | C4- | C C C C | B,4 |\n[V:4] z E, E, B, | A,4- | A, E, G, A, | B,4 |\n[V:1] z E E B | B4- | B G A B | G E3 |\nw: Yet there's no sick- _ ness, toil, nor dan-ger\n[V:2] z E E G | G4- | G E E E | E E3 |\n[V:3] z B, B, B, | B,4- | B, B, C C | B, G,3 |\n[V:4] z E, E, E, | E,4- | E, E, E, E, | E, E,3 |\n[V:1] z E E B | A4- | A G E D | E4 |\nw: In that bright world_ to which I go.\n[V:2] z E E D | E4- | E E C B, | B,4 |\n[V:3] z E, G, B, | C4- | C B, A, A, | G,4 |\n[V:4] z E, C, B,, | A,,4- | A,, B,, C, D, | E,4 |\n[V:1] z B B d | e4- | e d e d | B G3 |\nw: I'm go-ing there_ to see my fath-er,\n[V:2] z G G G | G4- | G F G F | F2 E2 |\n[V:3] z B, B, B, | (C4 | B,) B, C B, | G, G,3 |\n[V:4] z E, E, D, | (C,2 E,2- | E,) E, E, F, | E, E,3 |\n[V:1] z B B d | e4- | e d (e/2 d/2) (B/2 A/2) | B4 |\nw: I'm go-ing there_ no more_ to_ roam;\n[V:2] z G G B | (c2 A2 | G) F F F | F4 |\n[V:3] z B, B, B, | (A,2 C2 | B,) D D D | (E2 ^D2) |\n[V:4] z E, E, D, | (C,4 | B,,) B,, B,, B,, | B,,4 |\n[V:1] z E E B | B4- | B G A B | G E3 |\nw: I'm just a go- _ ing o-ver Jor-dan.\n[V:2] z E E E | G4- | G E E E | E E3 |\n[V:3] z E E E | B,4- | B, B, C C | B, G,3 |\n[V:4] z E, E, E, | E,4- | E, E, E, E, | E, E,3 |\n[V:1] z E E B | A4- | A G E D | E4 |]\nw: I'm just a go- _ ing o-ver home.\n[V:2] z E E D | E4- | E E E D | E4 |]\n[V:3] z E, G, B, | C4- | C B, B, B, | B,4 |]\n[V:4] z E, C, B,, | A,,4- | A,, B,, B,, B,, | E,4 |]\n",
  "voiceIds": [
    "1",
    "2",
    "3",
    "4"
  ],
  "priority": [
    "1",
    "4",
    "3",
    "2"
  ],
  "rows": [
    [
      "w: I am a poor_ way-far-ing stran-ger"
    ],
    [
      "w: While journ-'ying through_ this world of woe,"
    ],
    [
      "w: Yet there's no sick- _ ness, toil, nor dan-ger"
    ],
    [
      "w: In that bright world_ to which I go."
    ],
    [
      "w: I'm go-ing there_ to see my fath-er,"
    ],
    [
      "w: I'm go-ing there_ no more_ to_ roam;"
    ],
    [
      "w: I'm just a go- _ ing o-ver Jor-dan."
    ],
    [
      "w: I'm just a go- _ ing o-ver home."
    ]
  ],
  "underlayIdentity": {
    "rows": [
      {
        "voiceId": "1",
        "musicSegment": 0,
        "stanzaNumber": 1,
        "sourceText": "I am a poor_ way-far-ing stran-ger"
      },
      {
        "voiceId": "1",
        "musicSegment": 1,
        "stanzaNumber": 1,
        "sourceText": "While journ-'ying through_ this world of woe,"
      },
      {
        "voiceId": "1",
        "musicSegment": 2,
        "stanzaNumber": 1,
        "sourceText": "Yet there's no sick- _ ness, toil, nor dan-ger"
      },
      {
        "voiceId": "1",
        "musicSegment": 3,
        "stanzaNumber": 1,
        "sourceText": "In that bright world_ to which I go."
      },
      {
        "voiceId": "1",
        "musicSegment": 4,
        "stanzaNumber": 1,
        "sourceText": "I'm go-ing there_ to see my fath-er,"
      },
      {
        "voiceId": "1",
        "musicSegment": 5,
        "stanzaNumber": 1,
        "sourceText": "I'm go-ing there_ no more_ to_ roam;"
      },
      {
        "voiceId": "1",
        "musicSegment": 6,
        "stanzaNumber": 1,
        "sourceText": "I'm just a go- _ ing o-ver Jor-dan."
      },
      {
        "voiceId": "1",
        "musicSegment": 7,
        "stanzaNumber": 1,
        "sourceText": "I'm just a go- _ ing o-ver home."
      }
    ]
  },
  "alternateSegments": {
    "2": {
      "0": [
        "w: "
      ],
      "1": [
        "w: "
      ],
      "2": [
        "w: Yet there's no sick-_ ness, toil, nor dan- ger"
      ],
      "3": [
        "w: In that bright world_ to which I go."
      ],
      "4": [
        "w: I'm go- ing there_ to see my fath- er,"
      ],
      "5": [
        "w: I'm go- ing there__ no more to roam;"
      ],
      "6": [
        "w: I'm just a go-_ ing o- ver Jor- dan."
      ],
      "7": [
        "w: I'm just a go-_ ing o- ver home."
      ]
    },
    "3": {
      "0": [
        "w: "
      ],
      "1": [
        "w: While journ- 'ying through_ this world of woe,"
      ],
      "2": [
        "w: Yet there's no sick-_ ness, toil, nor dan- ger"
      ],
      "3": [
        "w: In that bright world_ to which I go."
      ],
      "4": [
        "w: I'm go- ing there_ to see my fath- er,"
      ],
      "5": [
        "w: I'm go- ing there__ no more to roam;_"
      ],
      "6": [
        "w: I'm just a go-_ ing o- ver Jor- dan."
      ],
      "7": [
        "w: I'm just a go-_ ing o- ver home."
      ]
    },
    "4": {
      "0": [
        "w: I am a poor_ way- far- ing stran- ger"
      ],
      "1": [
        "w: While journ- 'ying through_ this world of woe,"
      ],
      "2": [
        "w: Yet there's no sick-_ ness, toil, nor dan- ger"
      ],
      "3": [
        "w: In that bright world_ to which I go."
      ],
      "4": [
        "w: I'm go- ing there__ to see my fath- er,"
      ],
      "5": [
        "w: I'm go- ing there_ no more to roam;"
      ],
      "6": [
        "w: I'm just a go-_ ing o- ver Jor- dan."
      ],
      "7": [
        "w: I'm just a go-_ ing o- ver home."
      ]
    }
  }
};

export default witness;
