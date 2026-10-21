import abcjs from 'abcjs';

// RFPA p128: the two lower voices have dotted-quarter rests at q40.
// Bind this workaround to the reviewed source, including its lyric clearance.
const sourceWitness = `
T:The Riches of God's Goodness
C:ARIEL; Arranged from Mozart
O:Psalm 31, C. P. M.
M:3/4
L:1/8
K:Eb
%%score (T1 T2)(B1 B2)
%%stretchlast 1
% Reserve lyric clearance for the lower-voice refrain rests.
%%vocalspace 22
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
V:T1
B2 | (B2 G2) G2 | (G2 E2) E2 | (E2 D2) EG | (G2 F2) | F2 |
w:1.~How great * the good- * ness kept * in * store * For
w:2.~Se-cured * by Thy * un-fail- * ing * grace, * In
w:3.~Blest be * the Lord, * for He * hath * showed, * While
w:4.~Ye saints, * Je-ho- * vah love * and * serve, * For
G3/2 A/2 B B c d | e4 | df | f e d2 c2 | B4 | G3/2A/2 |
w:those who fear Thee and a-dore In * meek hu-mil-i-ty. How *
w:Thee they find a hid-ing-place When * foes their plots de-vise; A *
w:giv-ing me a safe a-bode, His * love be-yond com-pare; Al- *
w:He the faith-ful will pre-serve, And * shield from men of pride; Be *
B3/2 e/2 e2 B2 | c3/2 c/2 B2 | G3/2A/2 | B3/2 e/2 e2 B2 | c3/2 c/2 B2 |
w:great the deeds with mer-cy fraught Which * o-pen-ly Thy hand hath wrought
w:sure re-treat Thou wilt pre-pare, And * keep them safe-ly shel-tered there,
w:tho' His face He seemed to hide, He * ev-er heard me when I cried,
w:strong and let your hearts be brave, All * ye that wait for Him to save,
GF | E3 E E E | F3 | F F F | G4 F2 | E4 |]
w:For * those who trust in Thee, For those who trust in Thee.
w:When * strife of tongues shall rise, When strife of tongues shall rise.
w:And * made my wants His care, And made my wants His care.
w:In * God the Lord con-fide, In God the Lord con-fide.
V:T2
G2 | (G2 E2) E2 | (E2 B,2) B,2 | B,4 B,E | (E2 D2) | D2 |
E3/2 F/2 G E E A | G4 | F2 | F F F2 E2 | D4 | E3/2F/2 |
G3/2 G/2 G2 G2 | A3/2 A/2 G2 | E3/2F/2 | G3/2 G/2 G2 G2 | A3/2 A/2 G2 |
z2 | z6 | z3 | D D D | E4 D2 | E4 |]
V:B1
E2 | (E2 B,2) B,2 | (B,2 G,2) B,2 | A,4 G,B, | B,4 | B,2 |
B,3/2 B,/2 B, E E B, | B,4 | B,D | D C B,2 =A,2 | B,4 | B,2 |
B,3/2 B,/2 B,2 E2 | E3/2 E/2 E2 | B,2 | B,3/2 B,/2 B,2 E2 | E3/2 E/2 E2 |
EB, | G,3 G, G, G, | B,3 | B, B, B, | B,4 A,2 | G,4 |]
V:B2
E,2 | E,4 E,2 | E,4 G,2 | F,4 E,2 | B,,4 | B,,2 |
E,3/2 E,/2 E, G, A, F, | E,4 | B,,2 | F, F, F,2 F,2 | B,,4 | E,2 |
E,3/2 E,/2 E,2 E,2 | A,3/2 A,/2 E,2 | E,2 | E,3/2 E,/2 E,2 E,2 | A,3/2 A,/2 E,2 |
z2 | z6 | z3 | B,, B,, B,, | (E,G,B,2) B,,2 | E,4 |]
N:[Stanzas 13–16]
`;

export function hasPsalter81DottedRestSource(songId: string, abc: string): boolean {
  return songId === 'psalter81' && abc.replace(/\r\n/g, '\n') === sourceWitness;
}

type EngravedNote = abcjs.VoiceItemNote & { abselem?: abcjs.AbsoluteElement };
type DrawnSymbol = abcjs.RelativeElement & { graphelem?: SVGElement; scalex?: number; scaley?: number };
const close = (left: number, right: number) => Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-7;
// ABCJS 6.7.0 uses 30 * 93 / 720 SVG units per diatonic pitch step.
const pitchStep = 3.875;

/** Complete ABCJS 6.7.0's intended displacement of these existing rest heads.
 * Its collision pass shifts children[0], which is the dot for a dotted rest.
 * No source, note, dot, lyric, timing, or playback event is replaced. Other
 * engine versions and unrecognized engraving shapes deliberately do nothing.
 */
export function presentPsalter81DottedRests(tune: abcjs.TuneObject | undefined, selectedAbc: string, active: boolean): void {
  if (!active || !tune || tune.warnings?.length || abcjs.signature !== 'abcjs-basic v6.7.0') return;
  const scores = selectedAbc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1) return;
  const groups = (scores[0].match(/\([^)]*\)/g) ?? []).map(group => group.slice(1, -1).trim().split(/\s+/));
  for (const pair of ['T1 T2', 'B1 B2']) {
    const staffIndex = groups.findIndex(ids => ids.join(' ') === pair);
    if (staffIndex < 0) continue; // The original same-staff sounding partner must remain.
    const onsets = [0, 0];
    const events: EngravedNote[][] = [[], []];
    for (const line of tune.lines) {
      const voices = line.staff?.[staffIndex]?.voices;
      if (!voices) continue;
      if (voices.length !== 2) return;
      for (const [voiceIndex, voice] of voices.entries()) for (const item of voice) {
        if (item.el_type !== 'note') continue;
        if (close(onsets[voiceIndex], 10)) events[voiceIndex].push(item);
        onsets[voiceIndex] += item.duration;
      }
    }
    if (events.some(voice => voice.length !== 1)) continue;
    const [sung, rest] = [events[0][0], events[1][0]];
    if (sung.rest || !sung.pitches?.length || sung.duration !== 3 / 8 || rest.duration !== 3 / 8 ||
        rest.rest?.type !== 'rest' || rest.pitches) continue;
    const abs = rest.abselem, other = sung.abselem;
    if (!abs || !other || abs.abcelem !== rest || abs.type !== 'rest' || abs.duration !== 3 / 8 ||
        !Array.isArray(abs.children) || abs.children.length !== 2 || !Array.isArray(abs.heads) || abs.heads.length !== 1 ||
        abs.notePositions?.length !== 1 || abs.elemset?.length !== 1 || !abs.fixed || !Array.isArray(other.children)) continue;
    const [dot, head] = abs.children as DrawnSymbol[];
    if (dot.c !== 'dots.dot' || dot.name !== 'dots.dot' || head.c !== 'rests.quarter' || head.name !== 'rests.quarter' ||
        dot.type !== 'symbol' || head.type !== 'symbol' || abs.heads[0] !== head ||
        [dot, head].some(symbol => symbol.scalex !== 1 || symbol.scaley !== 1)) continue;
    const shift = dot.pitch - head.pitch;
    if (close(shift, 0)) continue; // Correctly aligned already, including a repeat invocation.
    const otherBottom = Math.min(...other.children.filter(child => child.type !== 'lyric').map(child => child.bottom));
    if (!(shift < 0) || !close(head.pitch, 3) || !close(dot.top, dot.pitch) || !close(dot.bottom, dot.pitch) ||
        !close(head.w, 7.888) || !close(dot.w, 3.45) || !close(head.dx, 0) || !close(dot.dx, 10.888) ||
        !close(head.top - head.pitch, 2.765806451612903) || !close(head.pitch - head.bottom, 2.765806451612903) ||
        !close(shift, -(head.top - otherBottom + 2)) || !close(abs.top, head.top + shift) || !close(abs.bottom, head.bottom + shift) ||
        !close(abs.fixed.t, head.top) || !close(abs.fixed.b, head.bottom)) continue;
    const glyph = head.graphelem, dotGlyph = dot.graphelem, group = abs.elemset[0];
    if (!glyph || !dotGlyph || glyph.tagName.toLowerCase() !== 'path' || dotGlyph.tagName.toLowerCase() !== 'path' ||
        glyph.getAttribute('data-name') !== head.name || dotGlyph.getAttribute('data-name') !== dot.name ||
        glyph.parentNode !== group || dotGlyph.parentNode !== group || group.childElementCount !== 2 ||
        glyph.hasAttribute('transform') || dotGlyph.hasAttribute('transform')) continue;
    const target = tune.engraver?.selectables?.find(item => item.absEl === abs);
    if (!target?.staffPos || target.svgEl !== group || !close(abs.notePositions[0].y, target.staffPos.zero - head.pitch * pitchStep)) continue;
    glyph.setAttribute('transform', `translate(0 ${-shift * pitchStep})`);
    head.pitch += shift;
    head.top += shift;
    head.bottom += shift;
    abs.top = abs.fixed.t = Math.max(head.top, dot.top);
    abs.bottom = abs.fixed.b = Math.min(head.bottom, dot.bottom);
    abs.notePositions[0].y -= shift * pitchStep;
    // ABCJS caches coordinate hit targets lazily. Invalidate any earlier read.
    delete (target as abcjs.Selectable & { dim?: unknown }).dim;
  }
}
