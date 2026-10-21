import type abcjs from 'abcjs';

// Frozen music/structure witnesses for the reviewed short print endings.
// Metadata and stanza text do not decide pagination. Unknown source revisions
// keep the ordinary print behavior.
const musicWitnesses: Readonly<Record<string, string>> = {
  "psalter219": "M:4/4\nL:1/4\nK:Ab\nQ:1/4=84\n%%score (Melody UpperDivisi) (LowerUpper LowerBass)\nV:Melody clef=treble name=\"Melody\"\nV:UpperDivisi clef=treble name=\"Upper divisi\"\nV:LowerUpper clef=bass name=\"Accomp. upper\"\nV:LowerBass clef=bass name=\"Accomp. lower\"\nV:Melody\n\"^Voices in Unison\"E | A2 G2 | G2 F2 | F G F C | E4 | E2 F G | F E F G | A2 B2 | B3 | \"^Voices in Harmony\"c | e2 c2 | d3 B | c c A B | B4 | B2 B B | c c =d e | G2 B2 | B4 | \"^Unison\"A2 G G | G2 F2 | F G F C | E4 | E2 A c | E3/2 E/ F \"^Harmony\"A | A2 B2 | A3 ||\nV:UpperDivisi\nx | x4 | x4 | x4 | x4 | x4 | x4 | x4 | x3 | A | A2 A2 | G3 G | A A A A | G4 | F2 G F | A G A G | E2 (G F) | G4 | x4 | x4 | x4 | x4 | x4 | x3 D | E2 E2 | E3 ||\nV:LowerUpper\nx | [E,A,C]4- | [E,A,C]4- | [E,A,(C]4 | [E,G,D)]4 | [(G,E-(B,]4 | [A,))-E-]4 | [A,E]2 [A,(=D]2 | [G,B,E)]3 | E | E2 E2 | E3 E | E E E =D | E4 | =D2 E D | F E F E | E2 =D2 | E4 | [E,A,C]4- | [E,A,C]4- | [E,A,(C]4 | [E,G,D)]4 | [A,E]4- | [A,-(E]2 [A,F)] A, | C2 D2 | C3 ||\nV:LowerBass\nE, | A,,4- | A,,4- | (A,,4 | B,,4) | [(D,E,-]4 | [(C,)E,-]4 | [_C,)E,]2 [(B,,F,]2 | [E,,)B,,E,]3 | A, | C2 A,2 | B,3 E, | A, G, F, B,, | E,4 | B,2 E, B, | F, C B, E, | B,2 B,,2 | E,4 | A,,4- | A,,4- | (A,,4 | B,,4) | [C,E,]4- | [(C,(E,]2 D,)) F, | E,2 E,2 | A,,3 ||",
  "psalter421": "M:4/4\nL:1/4\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE2 | B A G F | E2 F2 | G2 || G2 | c c B G |\nB2 A2 | G2 || B2 | A G F B | A G F2 | E2 |\nE2 | G A B2 | c2 B =A | B2 || E2 | G A B2 | c2 B =A | B2 |\ne2 | d c B G | A B c2 | B2 || B2 | B A G2 |\nc2 B A | G2 || E2 | G B F A | G2 F2 | !fermata!E2 |]\nV:T2\nE2 | E C E D | C2 D2 | E2 || E2 | E E B, E |\nE2 F2 | D2 || E2 | C E B, F | F E (E D) | B,2 |\nB,2 | E E D2 | E2 D C | D2 || E2 | E E E2 | E2 D C | D2 |\nE2 | F E D E | F F (F E) | D2 || E2 | F F E2 |\nE2 E C | E2 || E2 | E F D F | E2 D2 | B,2 |]\nV:B1\nG,2 | G, A, B, A, | G,2 B,2 | B,2 || B,2 | A, A, F, B, |\nB,2 C2 | =B,2 || G,2 | F, C F, D | C C (C B,/A,/) | G,2 |\nG,2 | B, A, F,2 | A,2 F, F, | F,2 || G,2 | C C B,2 | A,2 F, F, | B,2 |\nG,2 | B, G, G, C | C B, =A,2 | B,2 || G,2 | B, B, B,2 |\nA,2 G, A, | C2 || B,2 | B, B, B, C | B,2 (B, A,) | G,2 |]\nV:B2\nE,2 | E, F, B,, B,, | C,2 B,,2 | E,2 || E,2 | A,, C, D, E, |\nG,2 F,2 | G,2 || E,2 | F, C, D, B,, | F, C, (A,, B,,) | E,2 |\nE,2 | E, C, B,,2 | A,,2 B,, F, | B,,2 || E,2 | C, A,, G,,2 | A,,2 B,, F, | B,,2 |\nC,2 | B,, C, G, C, | F, D, F,2 | B,,2 || E,2 | D, B,, E,2 |\nA,,2 E, F, | C,2 || G,2 | E, D, B,, F, | (G, A,) (B, B,,) | !fermata!E,2 |]",
  "psalter434": "M:4/4\nL:1/8\nK:Eb\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nE2 | B2 A2 G2 F2 | E2 F2 !fermata!G2 G2 | F2 E2 E2 D2 | E6\nB2 | e2 e2 d2 B2 | c2 c2 !fermata!B2 E2 | G2 F E E2 D2 | E6\nEF | G2 G2 c2 c2 | B2 A2 !fermata!G2 EF | G2 G2 c2 e2 | d2 c2 !fermata!B2\n\"^rit.\"c2 | B2 A2 !fermata!G2 B2 | (A2 G2) !fermata!F2 \"^a tempo\"E2 | B2 A2 G2 F2 | E2 F2 !fermata!G2\nG G | F2 E2 E2 D2 | E4 E2 B2 | e2 e e d2 !fermata!B B |\nc2 c c B2 !fermata!B E | G2 F E E2 D2 | E6 z2 | E8 | E8 |]\nV:T2\nE2 | E2 F2 E2 D2 | E2 D2 E2 C2 | C2 C2 B,2 B,2 | B,6\nFG | F2 F2 F2 FG | G2 E2 D2 C2 | C2 C C B,2 B,A, | B,6\nCD | E2 E2 E2 E2 | E2 ED E2 CD | E2 E2 E2 G2 | F2 E2 D2\nA2 | G2 F2 E2 G2 | (F2 E2) D2 E2 | E2 F2 E2 D2 | E2 D2 E2\nC C | C2 C2 B,2 B,2 | B,4 B,2 FG | F2 F F F2 F F |\nG2 E E D2 D C | C2 C C B,2 B,A, | B,6 z2 | =B,8 | _B,8 |]\nV:B1\nG,A, | B,2 B,2 B,2 B,A, | G,2 B,2 !fermata!B,2 A,G, | A,2 A,2 G,2 F,A, | G,6\nB,2 | =A,2 A,2 B,2 B,2 | B,2 =A,2 !fermata!B,2 G,2 | A,2 A, A, G,2 F,2 | G,6\nG,2 | G,2 G,2 G,2 A,2 | G,2 A,B, B,2 G,2 | G,2 G,2 G,2 =A,2 | =A,2 A,2 F,2\n_A,2 | B,2 C2 B,2 B,2 | B,4 B,2 G,A, | B,2 B,2 B,2 B,A, | G,2 B,2 B,2\nA, A, | A,2 A,2 G,2 F,A, | A,4 G,2 B,2 | =A,2 A, A, B,2 B, B, |\nB,2 =A, A, B,2 B, G, | A,2 A, A, G,2 F,2 | G,6 z2 | A,8 | G,8 |]\nV:B2\nE,F, | G,2 D,2 E,2 B,,2 | C,2 B,,2 !fermata!E,2 A,,2 | A,,2 A,,2 B,,2 B,,2 | E,6\nD,2 | C,2 C,2 D,2 D,2 | E,2 F,2 !fermata!G,2 C,B,, | A,,2 A,, A,, B,,2 B,,2 | E,6\nC,2 | C,2 C,D, E,2 E,2 | E,2 F,2 !fermata!E,2 E,2 | C,2 C,D, E,2 F,,2 | F,,2 F,,2 !fermata!B,,2\nF,2 | G,2 A,2 !fermata!B,2 D,2 | (D,2 E,2) !fermata!B,,2 E,F, | G,2 D,2 E,2 B,,2 | C,2 B,,2 !fermata!E,2\nA,, A,, | A,,2 A,,2 B,,2 B,,2 | E,4 E,2 D,2 | C,2 C, C, D,2 !fermata!D, D, |\nE,2 F, F, G,2 !fermata!G, C, | A,,2 A,, A,, B,,2 B,,2 | E,6 z2 | E,8 | E,8 |]"
};

type ReviewedPrintEndingSource = 'single-chord' | 'psalter434-amen';

export function getReviewedPrintEndingSource(songId: string | undefined, abc: string): ReviewedPrintEndingSource | undefined {
  if (!songId || musicWitnesses[songId] !== abc.split(/\r?\n/)
    .filter(line => line.trim() && !/^\s*(?:[TCRSONWw]:|%abc)/.test(line))
    .map(line => line.trim()).join('\n')) return undefined;
  return songId === 'psalter434' ? 'psalter434-amen' : 'single-chord';
}

/** Keep a reviewed short ending with the preceding printed system.
 * Only pagination changes: the SVGs, source, engraving and screen stay intact.
 */
export function keepReviewedPrintEndingWithPrevious(
  container: HTMLElement, tune: abcjs.TuneObject | undefined, source: ReviewedPrintEndingSource | undefined,
) {
  if (!source || !tune || tune.warnings?.length) return;
  const systems = tune.lines.filter(line => line.staff?.length);
  const wrappers = Array.from(container.children);
  if (systems.length < 2 || wrappers.length !== systems.length || wrappers.some(wrapper =>
    !(wrapper instanceof HTMLElement) || wrapper.childElementCount !== 1 ||
    wrapper.firstElementChild?.tagName.toLowerCase() !== 'svg')) return;
  const last = systems[systems.length - 1].staff!;
  const previous = systems[systems.length - 2].staff!;
  // The reviewed all-part shape has two voices on each of two staves. Reduced
  // parts, unfamiliar extra sections and changed wrapping fail closed.
  if ([last, previous].some(staves => staves.length !== 2 ||
    staves.some(staff => staff.voices?.length !== 2))) return;
  const voices = last.flatMap(staff => staff.voices!);
  const notes = voices.map(voice => voice.filter(element => element.el_type === 'note'));
  if (source === 'psalter434-amen') {
    // The reviewed ending is either “more. A-MEN.” (dotted half,
    // quarter rest, whole, whole) or just the two whole-note Amen chords.
    // Other wrapping or event sequences skip.
    const durations = notes[0]?.length === 2 ? [1, 1] : [0.75, 0.25, 1, 1];
    const restIndex = durations.length === 4 ? 1 : -1;
    if (notes.some(voice => voice.length !== durations.length || voice.some((note, index) =>
      note.duration !== durations[index] || (note as abcjs.AbcElem).gracenotes?.length ||
      (index === restIndex
        ? note.rest?.type !== 'rest' || !!note.pitches?.length
        : !!note.rest || note.pitches?.length !== 1)))) return;
  } else {
    if (notes.some(voice => voice.length !== 1 || voice[0].rest || !voice[0].pitches?.length ||
      (voice[0] as abcjs.AbcElem).gracenotes?.length || !Number.isFinite(voice[0].duration) || (voice[0].duration ?? 0) <= 0) ||
      notes.some(voice => voice[0].duration !== notes[0][0].duration)) return;
  }
  // Never chain together two single-chord systems or bind an empty wrapper.
  if (previous.flatMap(staff => staff.voices!).some(voice =>
    voice.filter(element => element.el_type === 'note').length < 2)) return;
  const finalSvg = wrappers[wrappers.length - 1].firstElementChild!;
  if (source === 'psalter434-amen') {
    const amenOnly = notes[0].length === 2;
    if (finalSvg.querySelectorAll('.abcjs-note').length !== (amenOnly ? 8 : 12) ||
      finalSvg.querySelectorAll('.abcjs-rest').length !== (amenOnly ? 0 : 4)) return;
  } else if (finalSvg.querySelectorAll('.abcjs-note').length !== 4) return;
  wrappers[wrappers.length - 2].classList.add('print-score-keep-next');
}
