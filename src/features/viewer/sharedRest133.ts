import abcjs from 'abcjs';

// RFPA p199: one shared eighth rest per original staff at q31.5.
// Bind before any selection, lyric filtering, or learner transformation.
const sourceWitness = `T:The Church of the Living God
C:Tune: WINDERMERE; Ernest R. Kroeger
M:4/4
L:1/4
K:C
%%score (T1 T2) (B1 B2)
%%stretchlast 1
% validator: allow-photographed-partial-bars
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
[V:T1] E | G A G c/2A/2 | G3 || C | E E F F | E3 ||
w:1.~With-in Thy tem-ple, * Lord, We think on mer-cies past;
w:2.~A-bout Mount Zi-on * go, Her tow'rs and ram-parts tell;
w:3.~To all the com-ing * race Re-peat the mes-sage o'er:
[V:T2] C | E F E F | E3 || C | C C D B, | C3 ||
[V:B1] G, | C C C A,/2B,/2 | C3 || E, | G, G, G, G, | G,3 ||
[V:B2] C, | C, C, C, F,, | C,3 || C, | G, G, G,, G,, | C,3 ||
[V:T1] E | G A G c/2A/2 | G3 || A | B B c F | G2-G/2 z/2 |
w: Let earth all praise ac- * cord, Long as Thy Name shall last;
w: That ye her strength may * know, Mark her de-fens-es well;
w: This might-y God of * grace Is ours for ev-er-more;
[V:T2] C | E ^D E F | E3 || _E | D G ^F D | D2-D/2 z/2 |
[V:B1] G, | C ^F, G, A,/2B,/2 | C3 || C | G, B,/2D/2 D C | B,2-B,/2 z/2 |
[V:B2] C, | C, C, C, =F,, | C,3 || C, | D, D, D, D, | G,2-G,/2 z/2 |
[V:T1] G | d3/2 d/2 A B | c A !fermata!G || E | G3/2 G/2 G F | D2 G2 | !fermata!E3 |]
w: The right-eous judg-ments of her King Let Zi-on and her daugh-ters sing.
w: Her roy-al pal-a-ces be-hold That ye her glo-ries may un-fold.
w: Yea, He our Sav-iour will a-bide, And un-to death will be our guide.
[V:T2] G | F3/2 F/2 F F | E F E || C | C3/2 E/2 E D | C2 B,2 | C3 |]
[V:B1] B, | B,3/2 B,/2 C D | C C !fermata!C || G, | E,3/2 G,/2 _B, A, | G,2 G,2 | !fermata!G,3 |]
[V:B2] G, | G,3/2 G,/2 G, G, | A, F, C, || C, | C,3/2 C,/2 ^C, D, | G,2 G,,2 | C,3 |]
W:[Selected Stanzas]
W:Copyright, 1901, by United Presbyterian Board of Publication. Used by per.`;

export function hasPsalter133SharedRestSource(songId: string, abc: string): boolean {
  return songId === 'psalter133' && abc.replace(/\r\n/g, '\n') === sourceWitness;
}

type LocatedNote = {
  event: abcjs.VoiceItemNote;
  voice: abcjs.VoiceItem[];
  index: number;
  onset: number;
  stem?: abcjs.StemDirection;
};

/** Display-only afterParsing hook, invoked after ABCJS wraps/reparses. The
 * canonical ABC, source spans, pitched events, lyrics, and silent durations
 * remain intact. All contexts are checked before either staff is modified.
 * A solo keeps its original visible rest; unrelated voice pairs never share.
 */
export function presentPsalter133SharedRests(
  tune: abcjs.TuneObject, selectedAbc: string, active: boolean,
): abcjs.TuneObject {
  if (!active || tune.warnings?.length || abcjs.signature !== 'abcjs-basic v6.7.0') return tune;
  const scores = selectedAbc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1) return tune;
  if ((selectedAbc.match(/^M:4\/4$/gm) ?? []).length !== 1 ||
      (selectedAbc.match(/^L:1\/4$/gm) ?? []).length !== 1 ||
      (selectedAbc.match(/^K:C$/gm) ?? []).length !== 1) return tune;
  const groups = (scores[0].match(/\([^)]*\)/g) ?? []).map(group => group.slice(1, -1).split(' '));
  if (!groups.length || groups.length > 2 ||
      scores[0] !== `%%score ${groups.map(group => `(${group.join(' ')})`).join(' ')}`) return tune;
  const upperGroups = ['T1', 'T2', 'T1 T2'], lowerGroups = ['B1', 'B2', 'B1 B2'];
  if (groups.length === 1
    ? ![...upperGroups, ...lowerGroups].includes(groups[0].join(' '))
    : !upperGroups.includes(groups[0].join(' ')) || !lowerGroups.includes(groups[1].join(' '))) return tune;
  const definitions = selectedAbc.match(/^V:[^\r\n]*$/gm) ?? [];
  if (definitions.join('\n') !== groups.flat().map(id => `V:${id} clef=${id[0] === 'T' ? 'treble' : 'bass'}`).join('\n')) return tune;
  const voiceStarts = [...selectedAbc.matchAll(/\[V:([^\]]+)\]/g)];
  if (voiceStarts.some(match => !groups.flat().includes(match[1]))) return tune;
  // Offsets belong to this freshly transformed source, never the witness.
  const owned = (event: abcjs.VoiceItemNote, id: string) => {
    const { startChar: start, endChar: end } = event;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > selectedAbc.length) return false;
    for (let index = voiceStarts.length - 1; index >= 0; index--) {
      const block = voiceStarts[index], begin = block.index! + block[0].length;
      if (begin <= start) return block[1] === id && end <= (voiceStarts[index + 1]?.index ?? selectedAbc.length);
    }
    return false;
  };
  const notes = groups.map(group => group.map(() => [] as LocatedNote[]));
  const times = groups.map(group => group.map(() => 0));
  for (const line of tune.lines) {
    if (!line.staff) continue;
    if (line.staff.length !== groups.length) return tune;
    for (const [staffIndex, staff] of line.staff.entries()) {
      if (staff.voices?.length !== groups[staffIndex].length ||
          staff.clef?.type !== (groups[staffIndex][0][0] === 'T' ? 'treble' : 'bass')) return tune;
      for (const [voiceIndex, voice] of staff.voices.entries()) {
        let stem: abcjs.StemDirection | undefined;
        for (const [index, item] of voice.entries()) {
          if (item.el_type === 'stem') stem = item.direction;
          if (item.el_type !== 'note') continue;
          if (!(item.duration > 0) || !Number.isFinite(item.duration)) return tune;
          notes[staffIndex][voiceIndex].push({ event: item, voice, index, onset: times[staffIndex][voiceIndex], stem });
          times[staffIndex][voiceIndex] += item.duration;
        }
      }
    }
  }
  if (times.some(staff => staff.some(duration => duration !== 13))) return tune;
  const pairs: [LocatedNote, LocatedNote][] = [];
  for (const [staffIndex, group] of groups.entries()) {
    if (!['T1 T2', 'B1 B2'].includes(group.join(' '))) continue;
    const rests: LocatedNote[] = [];
    for (const [voiceIndex, sequence] of notes[staffIndex].entries()) {
      const targets = sequence.filter(note => note.onset === 63 / 8);
      if (targets.length !== 1) return tune;
      const target = targets[0], at = sequence.indexOf(target);
      const half = sequence[at - 2], tied = sequence[at - 1], next = sequence[at + 1];
      const event = target.event;
      // ABCJS emits exactly these empty placeholders when lyric skips reach a
      // rest (including B1+B2 donor transfer). Preserve the array and objects.
      const emptyLyrics = !('lyric' in event) || (Array.isArray(event.lyric) && event.lyric.length > 0 &&
        Object.getPrototypeOf(event.lyric) === Array.prototype && Reflect.ownKeys(event.lyric).length === event.lyric.length + 1 &&
        Array.from(event.lyric).every(row => row && typeof row === 'object' && Object.getPrototypeOf(row) === Object.prototype && Reflect.ownKeys(row).length === 2 &&
          Object.hasOwn(row, 'syllable') && Object.hasOwn(row, 'divider') && row.syllable === '' && row.divider === ' '));
      if (target.stem !== (voiceIndex === 0 ? 'up' : 'down') || event.duration !== 1 / 8 ||
          event.rest?.type !== 'rest' || Object.keys(event.rest).length !== 1 || event.pitches ||
          !/^z\/2\s*$/.test(selectedAbc.slice(event.startChar, event.endChar)) ||
          !emptyLyrics || ['decoration', 'gracenotes', 'chord', 'startTriplet', 'endTriplet'].some(key => key in event) ||
          !half || half.onset !== 29 / 4 || half.event.duration !== 1 / 2 || half.event.rest ||
          half.event.pitches?.length !== 1 || !half.event.pitches[0].startTie ||
          !tied || tied.onset !== 31 / 4 || tied.event.duration !== 1 / 8 || tied.event.rest ||
          tied.event.pitches?.length !== 1 || !tied.event.pitches[0].endTie ||
          tied.event.pitches[0].pitch !== half.event.pitches[0].pitch ||
          !next || next.onset !== 8 || next.event.duration !== 1 / 4 || next.event.rest ||
          next.event.pitches?.length !== 1 ||
          ![half, tied, target, next].every(note => owned(note.event, group[voiceIndex]))) return tune;
      rests.push(target);
    }
    pairs.push([rests[0], rests[1]]);
  }
  for (const [upper, lower] of pairs) {
    // ABCJS 6.7.0 centers a multivoice rest when its temporary stem is auto.
    // Restore the original upper-voice stem immediately after this event.
    upper.voice.splice(upper.index, 1,
      { el_type: 'stem', direction: 'auto' }, upper.event,
      { el_type: 'stem', direction: 'up' });
    lower.event.rest!.type = 'invisible';
  }
  return tune;
}
