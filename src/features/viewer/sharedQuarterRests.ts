import abcjs from 'abcjs';

// RFPA p230: shared quarter rests at q23 and q47 on T1/T2 and B1/B2.
// RFPA p421: shared quarter rest at q11 on S/A and T/B, after Name.
// Complete independent witnesses bind before selection/lyrics/learner changes.
const sourceWitness154 = `T:Danger and Rescue
C:Tune: SELWYN; arranged from Mendelssohn
O:Psalm 57, L. M.
M:3/4
L:1/8
K:Ab
%%score (T1 T2) (B1 B2)
%%stretchlast 1
V:T1 clef=treble
V:T2 clef=treble
V:B1 clef=bass
V:B2 clef=bass
[V:T1] E2 A2 B2 | c4 B2 | d4 c2 | (c4 B2) | A2 A2 A2 |
w:1.~O God, be mer- ci- ful to me, * My soul for
w:2.~To God Most High shall rise my prayer, * To God Who
w:3.~Great foes and fierce my soul a- larm, * In- flamed with
w:4.~Be Thou, O God, ex- alt- ed high, * Yea, far a-
[V:T2] C2 E2 E2 | E4 E2 | (F2 E2) E2 | E6 | C2 F2 =D2 |
[V:B1] A,2 A,2 G,2 | A,4 B,2 | (A,2 B,2) A,2 | (A,4 G,2) | A,2 B,2 B,2 |
[V:B2] A,,2 C,2 E,2 | A,4 G,2 | (F,2 G,2) A,2 | E,6 | F,2 =D,2 B,,2 |
[V:T1] (A2 G2) B2 | (BAG2) F2 | E4 z2 || E2 A2 B2 | c4 B2 |
w: ref- * uge comes * * to Thee; Be- neath Thy wings I
w: makes * my wants * * His care; From heav'n He will sal-
w: rage * and strong * * to harm, But God, from heav'n His
w: bove * the star- * * ry sky, And let Thy glo- ry
[V:T2] E4 E2 | (F2 E2) =D2 | E4 z2 || E2 E2 G2 | A4 E2 |
[V:B1] B,4 _D2 | (C2 B,2) A,2 | G,4 z2 || C2 E2 D2 | (C2 =D2) E2 |
[V:B2] E,4 G,,2 | (A,,2 B,,2) B,,2 | E,4 z2 || A,,2 C,2 E,2 | A,4 G,2 |
[V:T1] d4 c2 | (c4 B2) || A2 A2 A2 | (A2 d2) c2 | (cBA2) G2 | A4 z2 |]
w: safe will stay * Un- til these troub- * les pass * * a- way.
w: va- tion send, * And me from ev- * 'ry foe * * de- fend.
w: dwell- ing- place, * Will res- cue me * with truth * * and grace.
w: be dis- played * O'er all the earth * Thy hands * * have made.
[V:T2] (A2 B2) A2 | (A4 G2) || F2 _G2 G2 | (F2 =G2) A2 | (F2 E2) D2 | C4 z2 |]
[V:B1] (F2 E2) E2 | (E2 =D2 _D2) || C2 E2 C2 | D4 E2 | (EDC2) B,2 | A,4 z2 |]
[V:B2] (F,2 G,2) A,2 | E,6 || F,2 C,2 A,,2 | (D,2 B,,2) C,2 | (D,2 E,2) E,2 | A,,4 z2 |]`;

const sourceWitness280 = `%abc-2.1
% validator: allow-photographed-partial-bars
T:The Tender Mercies of God
T:AUTUMN
C:Louis von Esch
N:Psalm 103. 8s and 7s
M:3/4
L:1/16
K:Ab
%%score (S A)(T B)
V:S clef=treble
V:A clef=treble
V:T clef=bass
V:B clef=bass
V:S
A3 B | c6 B2 A3 F | E4 C4 || A3 B | c6 B2 c2 e2 | B4 z4 || A3 B | c6 B2 A3 F | E4 C4 || A3 f | e6 c2 B3 c | A8 || c3 d | e6 f2 e3 c | e4 c4 || A3 B | (c4 d2) c2 B2 A2 | (A4 G4) || A3 B | c6 B2 A3 F | E4 C4 || A3 f | e6 c2 B3 c | A8 |]
w:1.~O my soul, bless thou Je- ho- vah, All with- in me bless His Name; Bless Je- ho- vah and for- get not All His mer- cies to pro- claim. He for- gives all thy trans- gres- sions, Heals thy sick- * ness- es and pains; * He re- deems thee from de- struc- tion, And His love thy life sus- tains.
w:2.~He with ten- der mer- cies crowns thee, Sat- is- fies thy full re- quest, So that like the tire- less ea- gle Thou with youth re- newed art blessed. Right- eous is the Lord in judg- ment Un- to all * that are op- pressed; * To His peo- ple He has ev- er Made His good- ness man- i- fest.
w:3.~Yea, the Lord is full of mer- cy And com- pas- sion for dis- tress, Slow to an- ger and a- bun- dant In His grace and ten- der- ness. He will not be an- gry al- way, Nor will He * for- ev- er chide; * Tho' we oft have sinned a- gainst Him Still His love and grace a- bide.
w:4.~As the heav'ns are high a- bove us, Great His love to us has proved; Far as east from west is dis- tant, He has all our sins re- moved. As a fa- ther loves His chil- dren, Feel- ing pit- * y for their woes, * So the Lord to those who fear Him Mer- cy and com- pas- sion shows.
V:A
C3 D | E6 C2 D3 D | C4 A,4 || E3 E | E6 E2 E2 A2 | G4 z4 || C3 D | E6 E2 F3 D | C4 C4 || D3 F | A6 E2 D3 E | C8 || E3 E | A6 A2 A3 E | A4 E4 || E3 E | (E4 F2) E2 F2 F2 | E4-E2 D2 || C3 D | E6 E2 F3 D | C4 C4 || D3 F | A6 E2 D3 E | C8 |]
V:T
E,3 E, | A,6 E,2 F,3 A, | A,4 E,4 || A,3 G, | A,6 G,2 A,2 C2 | E4 z4 || A,3 A, | A,6 A,2 A,3 A, | A,4 A,4 || F,3 A, | C6 A,2 G,3 G, | A,8 || A,3 B, | C6 D2 C3 A, | C4 A,4 || A,3 G, | A,6 A,2 D2 C2 | (C4 B,4) || A,3 A, | A,6 A,2 A,3 A, | A,4 E,4 || F,3 A, | C6 A,2 G,3 G, | A,8 |]
V:B
A,,3 A,, | A,,6 A,,2 D,3 D, | A,,4 A,,4 || C,3 E, | A,6 E,2 C,2 A,,2 | E,4 z4 || A,,3 A,, | A,,6 C,2 D,3 F, | A,4 A,,4 || D,3 D, | E,6 E,2 E,3 E, | A,,8 || A,,3 A,, | A,6 A,2 A,3 A, | A,4 A,,4 || C,3 E, | A,6 A,2 D,2 =D,2 | E,8 || A,,3 A,, | A,,6 C,2 D,3 F, | A,4 A,,4 || D,3 D, | E,6 E,2 E,3 E, | A,,8 |]
W:1. O my soul, bless thou Jehovah, All within me bless His Name; Bless Jehovah and forget not All His mercies to proclaim. He forgives all thy transgressions, Heals thy sicknesses and pains; He redeems thee from destruction, And His love thy life sustains.
W:2. He with tender mercies crowns thee, Satisfies thy full request, So that like the tireless eagle Thou with youth renewed art blessed. Righteous is the Lord in judgment Unto all that are oppressed; To His people He has ever Made His goodness manifest.
W:3. Yea, the Lord is full of mercy And compassion for distress, Slow to anger and abundant In His grace and tenderness. He will not be angry alway, Nor will He forever chide; Tho' we oft have sinned against Him Still His love and grace abide.
W:4. As the heav'ns are high above us, Great His love to us has proved; Far as east from west is distant, He has all our sins removed. As a father loves His children, Feeling pity for their woes, So the Lord to those who fear Him Mercy and compassion shows.`;

export type SharedQuarterRestSource = 154 | 280;

export function sharedQuarterRestSource(songId: string, abc: string): SharedQuarterRestSource | undefined {
  const source = abc.replace(/\r\n/g, '\n');
  if (songId === 'psalter154' && source === sourceWitness154) return 154;
  if (songId === 'psalter280' && source === sourceWitness280) return 280;
}

type LocatedNote = {
  event: abcjs.VoiceItemNote;
  voice: abcjs.VoiceItem[];
  index: number;
  onset: number;
  stem?: abcjs.StemDirection;
};

/** Display-only afterParsing projection. Keep every real silent event, source
 * span, lyric object, pitch and duration; the detached playback tune is pristine.
 * All original staff pairs/cadences validate before any write. Solos and mixed
 * cross-staff selections retain their own visible rests.
 */
export function presentSharedQuarterRests(
  tune: abcjs.TuneObject, selectedAbc: string, source: SharedQuarterRestSource | undefined,
): abcjs.TuneObject {
  if ((source !== 154 && source !== 280) || tune.warnings?.length || abcjs.signature !== 'abcjs-basic v6.7.0') return tune;
  const ids = source === 154 ? ['T1', 'T2', 'B1', 'B2'] : ['S', 'A', 'T', 'B'];
  const scores = selectedAbc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1 ||
      (selectedAbc.match(/^M:3\/4$/gm) ?? []).length !== 1 ||
      (selectedAbc.match(source === 154 ? /^L:1\/8$/gm : /^L:1\/16$/gm) ?? []).length !== 1 ||
      (selectedAbc.match(/^K:Ab$/gm) ?? []).length !== 1) return tune;
  const groups = (scores[0].match(/\([^)]*\)/g) ?? []).map(group => group.slice(1, -1).split(' '));
  const normalizedScore = `%%score ${groups.map(group => `(${group.join(' ')})`).join(' ')}`;
  if (!groups.length || groups.length > 2 ||
      (scores[0] !== normalizedScore && !(source === 280 && scores[0] === '%%score (S A)(T B)'))) return tune;
  const upperGroups = [ids[0], ids[1], `${ids[0]} ${ids[1]}`];
  const lowerGroups = [ids[2], ids[3], `${ids[2]} ${ids[3]}`];
  if (groups.length === 1
    ? ![...upperGroups, ...lowerGroups].includes(groups[0].join(' '))
    : !upperGroups.includes(groups[0].join(' ')) || !lowerGroups.includes(groups[1].join(' '))) return tune;
  const selectedIds = groups.flat();
  const clef = (id: string) => ids.indexOf(id) < 2 ? 'treble' : 'bass';
  const declarations = selectedAbc.match(/^V:[^\r\n]*$/gm) ?? [];
  const definitions = declarations.filter(line => !/^V:[^\s]+$/.test(line));
  if (definitions.join('\n') !== selectedIds.map(id => `V:${id} clef=${clef(id)}`).join('\n')) return tune;
  // 154 uses inline voice blocks; 280 uses bare V: body switches. Reduced
  // and grouped scores retain their original, source-owned voice switches.
  const bodyVoices = declarations.filter(line => /^V:[^\s]+$/.test(line));
  if (bodyVoices.join('\n') !== (source === 280 ? selectedIds.map(id => `V:${id}`).join('\n') : '')) return tune;
  const voiceStarts = [...selectedAbc.matchAll(/\[V:([^\]]+)\]|^V:([^\s]+)$/gm)];
  if (voiceStarts.some(match => !selectedIds.includes(match[1] ?? match[2]))) return tune;
  const owned = (event: abcjs.VoiceItemNote, id: string) => {
    const { startChar: start, endChar: end } = event;
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end <= start || end > selectedAbc.length) return false;
    for (let index = voiceStarts.length - 1; index >= 0; index--) {
      const block = voiceStarts[index], begin = block.index! + block[0].length;
      if (begin <= start) return (block[1] ?? block[2]) === id && end <= (voiceStarts[index + 1]?.index ?? selectedAbc.length);
    }
    return false;
  };
  const notes = groups.map(group => group.map(() => [] as LocatedNote[]));
  const times = groups.map(group => group.map(() => 0));
  for (const line of tune.lines) {
    if (!line.staff) continue;
    if (line.staff.length !== groups.length) return tune;
    for (const [staffIndex, staff] of line.staff.entries()) {
      if (staff.voices?.length !== groups[staffIndex].length || staff.clef?.type !== clef(groups[staffIndex][0])) return tune;
      for (const [voiceIndex, voice] of staff.voices.entries()) {
        let stem: abcjs.StemDirection | undefined;
        for (const [index, item] of voice.entries()) {
          if (item.el_type === 'stem') stem = item.direction;
          if (item.el_type !== 'note') continue;
          if (!(item.duration > 0) || !Number.isFinite(item.duration) ||
              ['startTriplet', 'endTriplet', 'tripletMultiplier'].some(key => key in item)) return tune;
          notes[staffIndex][voiceIndex].push({ event: item, voice, index, onset: times[staffIndex][voiceIndex], stem });
          times[staffIndex][voiceIndex] += item.duration;
        }
      }
    }
  }
  if (times.some(staff => staff.some(duration => duration !== 12))) return tune;
  const onsets = source === 154 ? [23 / 4, 47 / 4] : [11 / 4];
  const precedingDuration = source === 154 ? 1 / 2 : 1 / 4;
  const nextDuration = source === 154 ? 1 / 4 : 3 / 16;
  const pairs: [LocatedNote, LocatedNote][] = [];
  for (const [staffIndex, group] of groups.entries()) {
    if (group.length !== 2) continue;
    for (const onset of onsets) {
      const rests: LocatedNote[] = [];
      for (const [voiceIndex, sequence] of notes[staffIndex].entries()) {
        const targets = sequence.filter(note => note.onset === onset);
        if (targets.length !== 1) return tune;
        const target = targets[0], at = sequence.indexOf(target);
        const previous = sequence[at - 1], next = sequence[at + 1], event = target.event;
        // Preserve the exact empty lyric placeholders produced by donor transfer.
        const emptyLyrics = !('lyric' in event) || (Array.isArray(event.lyric) && event.lyric.length > 0 &&
          Object.getPrototypeOf(event.lyric) === Array.prototype && Reflect.ownKeys(event.lyric).length === event.lyric.length + 1 &&
          Array.from(event.lyric).every(row => row && typeof row === 'object' && Object.getPrototypeOf(row) === Object.prototype && Reflect.ownKeys(row).length === 2 &&
            Object.hasOwn(row, 'syllable') && Object.hasOwn(row, 'divider') && row.syllable === '' && row.divider === ' '));
        if (target.stem !== (voiceIndex === 0 ? 'up' : 'down') || event.duration !== 1 / 4 ||
            event.rest?.type !== 'rest' || Object.keys(event.rest).length !== 1 || event.pitches ||
            !(source === 154 ? /^z2\s*$/ : /^z4\s*$/).test(selectedAbc.slice(event.startChar, event.endChar)) ||
            !emptyLyrics || ['decoration', 'gracenotes', 'chord', 'startTriplet', 'endTriplet'].some(key => key in event) ||
            !previous || previous.onset !== onset - precedingDuration || previous.event.duration !== precedingDuration ||
            previous.event.rest || previous.event.pitches?.length !== 1 ||
            !owned(previous.event, group[voiceIndex]) || !owned(event, group[voiceIndex])) return tune;
        if (onset === 47 / 4 ? next !== undefined :
          !next || next.onset !== onset + 1 / 4 || next.event.duration !== nextDuration ||
          next.event.rest || next.event.pitches?.length !== 1 || !owned(next.event, group[voiceIndex])) return tune;
        rests.push(target);
      }
      pairs.push([rests[0], rests[1]]);
    }
  }
  // Later events first: 154 can have two targets in one wrapped voice array.
  for (const [upper, lower] of pairs.reverse()) {
    upper.voice.splice(upper.index, 1,
      { el_type: 'stem', direction: 'auto' }, upper.event,
      { el_type: 'stem', direction: 'up' });
    lower.event.rest!.type = 'invisible';
  }
  return tune;
}
