import abcjs from 'abcjs';

/** These roles describe printed ink. An added small head is attached to its
 * named source lane for display/selection; it does not create a sung part.
 * The two existing-canonical roles retain canonical pitch storage;
 * normal-head playback ownership is resolved separately.
 */
export interface SourceHeadWitness {
  id: string;
  source: string;
  sourceOwner: string;
  otherVoice: string;
  ownerPitchCount: number;
  otherPitchCount: number;
  smallPitchIndex: number;
  stem: 'up' | 'down';
  onsets: readonly number[];
  durations: readonly number[];
  performance: 'display-only' | 'existing-canonical';
  replacements: readonly { before: string; after: string }[];
}

// Frozen current-source witnesses follow the helper. Guard BEFORE removing
// metadata, splitting stanzas, selecting voices, or adding learner accidentals.
export function sourceHeadWitness(songId: string, abc: string): SourceHeadWitness | undefined {
  return witnesses.find(witness => witness.id === songId && witness.source === abc.replace(/\r\n/g, '\n'));
}

/** Prepare source heads before learner accidentals and display selection.
 * No added head changes an onset or note duration, so lyric transfer retains
 * its normal carrier. The cached full tune keeps canonical ABC; the bounded
 * sourceSupplementAudio projection also reuses these exact additions.
 * For 347 this also removes only the two source-absent repeated flat prefixes;
 * the learner pass subsequently restores them when that mode is requested.
 */
export function withSourceHeads(abc: string, witness?: SourceHeadWitness): string {
  if (!witness || !abc) return abc;
  let result = abc;
  for (const { before, after } of witness.replacements) {
    const position = result.indexOf(before);
    if (position < 0 || result.indexOf(before, position + before.length) >= 0) return fail(witness);
    result = result.slice(0, position) + after + result.slice(position + before.length);
  }
  return result;
}

type SourcePitch = NonNullable<abcjs.VoiceItemNote['pitches']>[number] & { sourceSmallHead?: string };
type SourceNote = Omit<abcjs.VoiceItemNote, 'pitches'> & {
  pitches?: SourcePitch[];
  lyric?: unknown[];
  decoration?: unknown[];
  gracenotes?: unknown[];
  startSlur?: unknown;
  endSlur?: unknown;
  startTriplet?: unknown;
  endTriplet?: unknown;
  abselem?: abcjs.AbsoluteElement;
};
type SourceTune = abcjs.TuneObject & { sourceHeadPresentation?: { id: string; count: number } };
type DrawnHead = abcjs.RelativeElement & { graphelem?: SVGGraphicsElement; stemDir?: string };
type Target = { note: SourceNote; voice: abcjs.VoiceItem[]; direction: abcjs.StemDirection };
const close = (left: number, right: number) => Number.isFinite(left) && Number.isFinite(right) && Math.abs(left - right) < 1e-7;
const fail = (witness: SourceHeadWitness): never => { throw new Error(`Unable to preserve ${witness.id} source notehead roles.`); };

/** Merge only contemporaneous same-stem source heads in the engraving copy.
 * Keep the first selected lane as the target, because that lane owns any
 * transferred lyric rows. The other lane becomes an invisible timed carrier.
 * No mutation occurs until every source event and donor has been recognized.
 */
export function prepareSourceHeads(tune: SourceTune, selectedAbc: string, witness?: SourceHeadWitness): void {
  if (!witness) return;
  if (tune.sourceHeadPresentation) {
    if (tune.sourceHeadPresentation.id !== witness.id) return fail(witness);
    return;
  }
  const scores = selectedAbc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1) return fail(witness);
  const groups = (scores[0].match(/\([^)]*\)/g) ?? []).map(group => group.slice(1, -1).trim().split(/\s+/));
  const staffIndex = groups.findIndex(group => group.includes(witness.sourceOwner));
  if (staffIndex < 0) return;
  const ids = groups[staffIndex];
  if (ids.some(id => id !== witness.sourceOwner && id !== witness.otherVoice) || new Set(ids).size !== ids.length ||
      abcjs.signature !== 'abcjs-basic v6.7.0' || tune.warnings?.length) return fail(witness);
  const collect = (voiceIndex: number): Target[] => {
    let onset = 0;
    let direction: abcjs.StemDirection = 'auto';
    const targets: Target[] = [];
    for (const line of tune.lines) {
      const staff = line.staff?.[staffIndex];
      if (!staff) continue;
      if (!Array.isArray(staff.voices) || staff.voices.length !== ids.length) return fail(witness);
      const voice = staff.voices[voiceIndex];
      for (const item of voice) {
        if (item.el_type === 'stem') direction = item.direction;
        if (item.el_type !== 'note') continue;
        const note = item as SourceNote;
        // This bounded family has no tuplets. Reject unexpected timing rather
        // than matching later notes using an incorrect accumulated onset.
        if (note.startTriplet || note.endTriplet || !Number.isFinite(note.duration)) return fail(witness);
        if (witness.onsets.some(target => close(onset * 4, target))) targets.push({ note, voice, direction });
        onset += note.duration;
      }
    }
    if (targets.length !== witness.onsets.length) return fail(witness);
    return targets;
  };
  const ownerIndex = ids.indexOf(witness.sourceOwner);
  const otherIndex = ids.indexOf(witness.otherVoice);
  const owner = collect(ownerIndex);
  const other = otherIndex < 0 ? undefined : collect(otherIndex);
  const ordinary = (note: SourceNote, count: number, index: number) =>
    !note.rest && close(note.duration * 4, witness.durations[index]) && Array.isArray(note.pitches) && note.pitches.length === count &&
    !note.decoration?.length && !note.gracenotes?.length && !note.startSlur && !note.endSlur &&
    note.pitches.every(pitch => pitch && Number.isFinite(pitch.pitch) && Number.isFinite(pitch.verticalPos) &&
      !pitch.startTie && !pitch.endTie && !pitch.startSlur?.length && !pitch.endSlur?.length);
  const plans: { target: Target; donor?: Target; pitches: SourcePitch[] }[] = [];
  for (let index = 0; index < witness.onsets.length; index++) {
    if (!ordinary(owner[index].note, witness.ownerPitchCount, index) ||
        (other && !ordinary(other[index].note, witness.otherPitchCount, index))) return fail(witness);
    const ownerPitches = owner[index].note.pitches!;
    if (!ownerPitches[witness.smallPitchIndex] || ownerPitches.some((pitch, i) => i > 0 && pitch.pitch <= ownerPitches[i - 1].pitch)) return fail(witness);
    const marked = ownerPitches.map((pitch, pitchIndex) => ({
      ...pitch,
      ...(pitchIndex === witness.smallPitchIndex ? { sourceSmallHead: `${witness.id}:${witness.sourceOwner}:q${witness.onsets[index]}` } : {}),
    }));
    const target = other && otherIndex < ownerIndex ? other[index] : owner[index];
    const donor = other ? target === other[index] ? owner[index] : other[index] : undefined;
    if (donor?.note.lyric?.length) return fail(witness);
    const pitches = [...marked, ...(other?.[index].note.pitches?.map(pitch => ({ ...pitch })) ?? [])].sort((a, b) => a.pitch - b.pitch);
    if (pitches.some((pitch, i) => i > 0 && pitch.pitch <= pitches[i - 1].pitch)) return fail(witness);
    plans.push({ target, donor, pitches });
  }
  for (const { target, donor, pitches } of plans) {
    target.note.pitches = pitches;
    if (donor) {
      donor.voice.splice(donor.voice.indexOf(donor.note), 1, {
        el_type: 'note', startChar: donor.note.startChar, endChar: donor.note.endChar,
        duration: donor.note.duration, rest: { type: 'invisible' },
      });
    }
    const position = target.voice.indexOf(target.note);
    target.voice.splice(position, 1,
      { el_type: 'stem', direction: witness.stem }, target.note,
      { el_type: 'stem', direction: target.direction },
    );
  }
  tune.sourceHeadPresentation = { id: witness.id, count: plans.length };
}

/** ABCJS 6.7.0 has voice-wide cue scaling only. Scale recognized individual
 * head paths about the common stem, retaining normal heads and note timing.
 * Validate the entire family before changing any glyph. Re-entry is harmless.
 */
export function presentSourceHeads(tune: SourceTune | undefined, witness?: SourceHeadWitness): void {
  if (!witness || !tune?.sourceHeadPresentation) return;
  if (tune.sourceHeadPresentation.id !== witness.id) return fail(witness);
  const changes: { glyph: SVGGraphicsElement; x: number; y: number; selectable: abcjs.Selectable; role: string }[] = [];
  let recognized = 0;
  for (const line of tune.lines) for (const staff of line.staff ?? []) for (const voice of staff.voices ?? []) for (const item of voice) {
    if (item.el_type !== 'note') continue;
    const note = item as SourceNote;
    const indices = note.pitches?.flatMap((pitch, index) => pitch.sourceSmallHead ? [index] : []) ?? [];
    if (!indices.length) continue;
    if (indices.length !== 1) return fail(witness);
    recognized += 1;
    const pitchIndex = indices[0];
    const role = note.pitches![pitchIndex].sourceSmallHead!;
    const abs = note.abselem;
    const head = abs?.heads[pitchIndex] as DrawnHead | undefined;
    const glyph = head?.graphelem;
    const stems = abs?.children.filter(child => child.type === 'stem') ?? [];
    const selectable = tune.engraver?.selectables?.find(value => value.absEl === abs);
    if (!abs || abs.abcelem !== note || !head || !glyph || stems.length !== 1 || !selectable?.staffPos ||
        head.stemDir !== witness.stem || !['noteheads.half', 'noteheads.quarter'].includes(head.c) ||
        glyph.tagName.toLowerCase() !== 'path' || glyph.getAttribute('data-name') !== head.name ||
        !Number.isFinite(stems[0].x) || !Number.isFinite(head.pitch)) return fail(witness);
    if (glyph.getAttribute('data-source-small-head') === role) continue;
    if (glyph.hasAttribute('transform') || glyph.style.transform || glyph.hasAttribute('data-source-small-head')) return fail(witness);
    const y = selectable.staffPos.zero - head.pitch * 3.875;
    if (!Number.isFinite(y)) return fail(witness);
    changes.push({ glyph, x: stems[0].x, y, selectable, role });
  }
  if (recognized !== tune.sourceHeadPresentation.count || recognized !== witness.onsets.length) return fail(witness);
  if (!changes.length) return;
  if (changes.length !== recognized) return fail(witness);
  for (const { glyph, x, y, selectable, role } of changes) {
    glyph.setAttribute('transform', `translate(${x} ${y}) scale(0.6) translate(${-x} ${-y})`);
    glyph.setAttribute('data-source-small-head', role);
    glyph.setAttribute('data-source-head-performance', witness.performance);
    delete (selectable as abcjs.Selectable & { dim?: unknown }).dim;
  }
}

const witnesses: readonly SourceHeadWitness[] = [
  {
    "id": "psalter3",
    "sourceOwner": "T2",
    "otherVoice": "T1",
    "ownerPitchCount": 2,
    "otherPitchCount": 1,
    "smallPitchIndex": 1,
    "stem": "up",
    "onsets": [
      77
    ],
    "durations": [
      1
    ],
    "performance": "display-only",
    "replacements": [
      {
        "before": "|| D F G > G | D D D2 |]",
        "after": "|| D F G > G | D [DF] D2 |]"
      }
    ],
    "source": "%abc-2.1\nT:The Kingship of Jesus Christ\nC:Tune: HERALD ANGELS; arranged from Mendelssohn\nR:Psalm 2; 7s\nM:4/4\nL:1/4\nK:G\n%%score (T1 T2)(B1 B2 B3)\nV:T1 clef=treble name=\"Soprano\"\nV:T2 clef=treble name=\"Alto\"\nV:B1 clef=bass name=\"Tenor\"\nV:B2 clef=bass name=\"Bass\"\nV:B3 clef=bass cue=on\nV:T1\n  D G G > F | G B (B A) || d d d > c | B A B2 || D G G > F | G B (B A) || d A A > F | F E D2 || d d d G | c B (B A) || d d d G | c B (B A) || e e e d | c B c2 || A B/2c/2 d > G | G A B2 || e > e e d | c B c2 || A B/2c/2 d > G | G A G2 |]\nw:1.~Where-fore do the | na-tions rage _ | And the peo-ple | vain-ly dream | That in tri-umph | they can wage _ | War a-gainst the | King su-preme? | Christ His Son a | scoff they make, _ | And the rul-ers | plot-ting say: _ | Their do-min-ion | let us break, | Let us _ cast their | yoke a-way, | Their do-min-ion | let us break, | Let us _ cast their | yoke a-way.\nw:2.~But the Lord will | scorn them all, _ | Calm He sits en- | throned on high; | Soon His wrath will | on them fall, _ | Sore dis-pleased He | will re-ply: | Yet ac-cord-ing | to My will _ | I have set My | King to reign, _ | And on Zi-on's | ho-ly hill | My A- _ noint-ed | I main-tain; | And on Zi-on's | ho-ly hill | My A- _ noint-ed | I main-tain.\nw:3.~This His word shall | be made known, _ | This Je-ho-vah's | firm de-cree: | Thou art My be- | lov-ed Son, _ | Yea, I have be- | got-ten Thee. | All the earth at | Thy re-quest _ | I will give Thee | for Thy own; _ | Then Thy might shall | be con-fessed | And Thy _ foes be | o-ver-thrown; | Then Thy might shall | be con-fessed | And Thy _ foes be | o-ver-thrown.\nw:4.~There-fore, kings, be | wise, give ear; _ | Hear-ken, judg-es | of the earth; | Learn to serve the | Lord with fear, _ | Min-gle trem-bling | with your mirth. | Kiss the Son, lest | o'er your way _ | His con-sum-ing | wrath should break; _ | But su-preme-ly | blest are they | Who in _ Christ their | ref-uge take; | But su-preme-ly | blest are they | Who in _ Christ their | ref-uge take.\nV:T2\n  D D D > D | D G (G F) || G F E A | G F G2 || D D D > D | B, G G2 | F E F > D | D ^C D2 || D D D G | A G (G F) || D D D G | A G (G F) || c c c B | A ^G A2 || F F =G > D | D F G2 || c c c B | A ^G A2 || D F G > G | D D D2 |]\nV:B1\n  B, B, B, > A, | G, D D2 || D D E E | D D D2 || B, B, B, > A, | G, D E2 || D E D > A, | B, G, F,2 || D D D D | D D D2 | D D D D | D D D2 || E E E E | E D C2 || D D D > B, | B, D D2 || E E E D | C B, C2 || D D D > B, | B, C B,2 |]\nV:B2\n  G, G, G, D, | B,, G,, D,2 || B,, B,, C, C, | D, D, G,,2 || G, G, G, D, | E, D, (^C,> A,,) || B,, ^C, D, F,, | G,, A,, D,2 || D D D B, | F, G, D,2 || D D D B, | F, G, D,2 || C, C, C, C, | C, E, A,2 || C C B, G, | D, D, G,2 || C C C B, | A, ^G, (A, =G,) || F, C B, G, | D, D, G,2 |]\nV:B3\nx4 | x4 || x4 | x4 || x4 | x4 || x4 | x4 || x4 | x4 | x4 | x4 || x4 | x4 || x4 | x2 G,,2 | C,4- | C, E, x2 | x4 | x2 G,,2 |]"
  },
  {
    "id": "psalter72",
    "sourceOwner": "T2",
    "otherVoice": "T1",
    "ownerPitchCount": 2,
    "otherPitchCount": 1,
    "smallPitchIndex": 0,
    "stem": "up",
    "onsets": [
      41,
      42,
      43,
      44
    ],
    "durations": [
      1,
      1,
      1,
      2
    ],
    "performance": "display-only",
    "replacements": [
      {
        "before": "| D G F E | D2 C2 | D4 ||",
        "after": "| D [B,G] [B,F] [B,E] | [A,D]2 C2 | D4 ||"
      }
    ],
    "source": "\nT:Entreaty and Hopeful Trust\nC:Tune: SAMUEL; Arthur S. Sullivan\nR:Psalm 27; H. M.\nM:4/4\nL:1/4\nK:D\nN:Printed page 64; [Stanzas 6–9]\n%%score (T1 T2)(B1 B2)\nV:T1 treble\nV:T2 treble\nV:B1 bass\nV:B2 bass\nV:T1\nF2 F A | G3/2 F/2 G B | A ^G A d | (d2 c) d | B A G A | F ^G A B | c2 B2 | A3 A | e3/2 c/2 A G | F G A D | D B A G | F2 E2 | D4 ||\nw:1.~Lord, hear me when I pray, And an-swer me in grace; * Oft as I hear Thee say, Come ye and seek My face, My heart and lips their an-swer speak, Thy face, Je-ho-vah, will I seek.\nw:2.~Hide not Thy face from me, In wrath turn not a-way, * My help and Sav-iour be, For-sake me not, I pray; Should fa-ther, moth-er, both for-sake, The Lord on me will pit-y take.\nw:3.~Teach me, O Lord, Thy way, Make plain to me my path; * Be-cause of foes, I pray, Pro-tect me from their wrath; To false ac-cus-ers, cru-el foes, O Lord, do not my soul ex-pose.\nw:4.~Faint-heart-ed would I be, Didst Thou not prom-ise, Lord, * I shall Thy good-ness see While Thou dost life ac-cord. Wait on the Lord, nor faint, nor fear, Yea, trust and wait, the Lord is near.\nV:T2\nD2 D F | C3/2 C/2 C C | D D D D | E3 A | G D D C | D E E F | E2 D2 | C3 A | G3/2 G/2 F E | D C D D | D G F E | D2 C2 | D4 ||\nV:B1\nA,2 A, A, | A,3/2 A,/2 A, A, | A, A, A, G, | A,3 D | D A, B, A, | A, B, A, A, | A,2 ^G,2 | A,3 A, | C3/2 C/2 D A, | A, A, A, A, | B, D, ^D, E, | F,2 G,2 | F,4 ||\nV:B2\nD,2 A,, A,, | E,3/2 ^D,/2 E, A,, | F, F, F,, B,, | A,,3 F, | G, F, E, A,, | D, D, C, D, | E,2 E,2 | A,,3 A, | A,3/2 A,,/2 B,, C, | D, E, F, F, | G, G,, G,, G,, | A,,2 A,,2 | D,4 ||\n"
  },
  {
    "id": "psalter302",
    "sourceOwner": "B",
    "otherVoice": "T",
    "ownerPitchCount": 2,
    "otherPitchCount": 1,
    "smallPitchIndex": 1,
    "stem": "down",
    "onsets": [
      45,
      46,
      47,
      48
    ],
    "durations": [
      1,
      1,
      1,
      1
    ],
    "performance": "display-only",
    "replacements": [
      {
        "before": "C,3/2 C,/ C, C, | B,, B,, B,, || B,, |",
        "after": "C,3/2 C,/ C, C, | [B,,E,] [B,,E,] [B,,E,] || [B,,E,] |"
      }
    ],
    "source": "%abc-2.1\n% validator: allow-photographed-partial-bars\nT:Our Lord Jesus\nT:BIRDSTOWN\nC:Charles H. Gabriel\nN:Psalm 110. 8s and 7s\nM:4/4\nL:1/4\nK:Ab\n%%score (S A)(T B)\nV:S clef=treble name=\"Soprano\"\nV:A clef=treble name=\"Alto\"\nV:T clef=bass name=\"Tenor\"\nV:B clef=bass name=\"Bass\"\nV:S\nE | A3/2 A/ A B | c A F || B | A3/2 A/ G G | A2 A || E | B3/2 B/ B c | d B G || B | A3/2 B/ c =d | e2 e || E | F3/2 F/ F F | G G G || E | A3/2 A/ A A | B B B || E | c2 d2 | e2 d2 | B4 | A3 |]\nw:1.~The Lord un- to His Christ hath said, In glo- ry I en- throne Thee Till all Thy foes, in tri- umph led, Their sov'- reign King shall own Thee; From Zi- on shall Je- ho- vah send Thy scep- ter, till be- fore Thee bend The knees of proud re- bel- lion.\nw:2.~Thy peo- ple will be glad- ly Thine When Thou shalt come vic- to- rious, In ho- ly beau- ty Thou shalt shine, Like morn- ing fair and glo- rious; The word of God shall not de- part: The King of Right- eous- ness Thou art, A Roy- al Priest for- ev- er.\nw:3.~The Lord at Thy right hand shall smite Earth's kings in in- dig- na- tion, And He shall judge with sov'- reign right Thro'- out His wide cre- a- tion; While liv- ing streams His strength sus- tain, The Christ the vic- to- ry shall gain, Head o- ver all ex- alt- ed.\nV:A\nE | C3/2 C/ E E | E E D || F | E3/2 E/ D D | C2 C || E | E3/2 E/ E E | E E E || E | E3/2 E/ E A | G2 G || E | B,3/2 B,/ B, B, | E E E || E | E3/2 E/ E E | E E E || E | E2 E2 | E2 F2 | (A G F E) | E3 |]\nV:T\nE, | E,3/2 E,/ A, G, | A, A, A, || D | C3/2 C/ B, B, | A,2 A, || A, | G,3/2 G,/ G, A, | B, G, B, || G, | A,3/2 G,/ A, B, | B,2 B, || G, | A,3/2 A,/ A, A, | B, B, B, || B, | A,3/2 A,/ A, A, | G, G, G, || G, | A,2 G,2 | A,2 A,2 | D4 | C3 |]\nV:B\nE, | A,,3/2 A,,/ C, E, | A, C, D, || D, | E,3/2 E,/ E, E, | A,,2 A,, || C, | E,3/2 E,/ E, E, | E, E, E, || D, | C,3/2 E,/ A, F, | E,2 E, || E, | =D,3/2 D,/ D, D, | _D, D, D, || D, | C,3/2 C,/ C, C, | B,, B,, B,, || B,, | A,,2 B,,2 | C,2 D,2 | E,4 | A,,3 |]\nW:1. The Lord unto His Christ hath said, In glory I enthrone Thee Till all Thy foes, in triumph led, Their sov'reign King shall own Thee; From Zion shall Jehovah send Thy scepter, till before Thee bend The knees of proud rebellion.\nW:2. Thy people will be gladly Thine When Thou shalt come victorious, In holy beauty Thou shalt shine, Like morning fair and glorious; The word of God shall not depart: The King of Righteousness Thou art, A Royal Priest forever.\nW:3. The Lord at Thy right hand shall smite Earth's kings in indignation, And He shall judge with sov'reign right Thro'out His wide creation; While living streams His strength sustain, The Christ the victory shall gain, Head over all exalted.\nN:Copyright, 1912, by United Presbyterian Board of Publication. Used by per."
  },
  {
    "id": "psalter307",
    "sourceOwner": "B",
    "otherVoice": "T",
    "ownerPitchCount": 2,
    "otherPitchCount": 1,
    "smallPitchIndex": 1,
    "stem": "down",
    "onsets": [
      19
    ],
    "durations": [
      2
    ],
    "performance": "display-only",
    "replacements": [
      {
        "before": "| E, E, E,2 A,,2 | D,3 |",
        "after": "| E, E, E,2 [A,,E,]2 | D,3 |"
      }
    ],
    "source": "%abc-2.1\n% validator: allow-photographed-partial-bars\nT:Bondage and Deliverance\nT:BLOOMFIELD CHANT\nC:William B. Bradbury\nN:Psalm 114. L. M.\nM:3/2\nL:1/4\nK:G\n%%score (S A)(T B)\nV:S clef=treble name=\"Soprano\"\nV:A clef=treble name=\"Alto\"\nV:T clef=bass name=\"Tenor\"\nV:B clef=bass name=\"Bass\"\nV:S\nD D D | G G G2 A2 | B3 | B B B | B B B2 ^c2 | d3 | d d B | G3 G G F | E3 | e e e | d B G2 A2 | G3 |]\nw:1.~When Is- rael out of E- gypt went, From peo- ple of a speech un- known, The Lord a- mong His peo- ple dwelt, And there He set His roy- al throne.\nw:2.~The sea be- held and fled a- way, The Jor- dan's wa- ters back- ward turned, The loft- y moun- tains and the hills With trem- bling awe our God dis- cerned.\nw:3.~What ail- eth thee, O trou- bled sea? Thou Jor- dan, why thy riv- en tide? Ye moun- tains and ye lit- tle hills, Why thus dis- mayed on ev- 'ry side?\nw:4.~O trem- ble, earth, be- fore the Lord, In pres- ence of Je- ho- vah fear, Be- neath Whose touch the flin- ty rock Be- came a fount of wa- ters clear.\nV:A\nB, B, B, | B, B, B,2 D2 | D3 | ^D D D | E E E2 G2 | F3 | D D D | D3 D D D | C3 | G G G | G D D2 D2 | D3 |]\nV:T\nG, G, G, | G, G, G,2 F,2 | G,3 | F, F, F, | G, G, G,2 A,2 | A,3 | B, B, B, | B,3 B, B, G, | G,3 | G, G, G, | G, G, B,2 C2 | [G,B,]3 |]\nV:B\nG, G, G, | G, G, E,2 D,2 | G,3 | B,, B,, B,, | E, E, E,2 A,,2 | D,3 | G, G, G, | G,3 G,, G,, B,, | C,3 | C, C, C, | B,, G,, D,2 D,2 | G,,3 |]\nW:1. When Israel out of Egypt went, From people of a speech unknown, The Lord among His people dwelt, And there He set His royal throne.\nW:2. The sea beheld and fled away, The Jordan's waters backward turned, The lofty mountains and the hills, With trembling awe our God discerned.\nW:3. What aileth thee, O troubled sea? Thou Jordan, why thy riven tide? Ye mountains and ye little hills, Why thus dismayed on ev'ry side?\nW:4. O tremble, earth, before the Lord, In presence of Jehovah fear, Beneath Whose touch the flinty rock, Became a fount of waters clear.\n"
  },
  {
    "id": "psalter347",
    "sourceOwner": "A",
    "otherVoice": "S",
    "ownerPitchCount": 2,
    "otherPitchCount": 1,
    "smallPitchIndex": 1,
    "stem": "up",
    "onsets": [
      64,
      66,
      67
    ],
    "durations": [
      2,
      1,
      1
    ],
    "performance": "existing-canonical",
    "replacements": [
      {
        "before": "[E_G]4 [E_G]2 [E_G]2",
        "after": "[E_G]4 [EG]2 [EG]2"
      }
    ],
    "source": "%abc-2.1\nT:The Watchful Care of God\nT:LUX BEATA\nC:Albert L. Peace\nM:4/4\nL:1/8\nK:Ab\n%%score (S A)(T B)\nV:S clef=treble\nV:A clef=treble\nV:T clef=bass\nV:B clef=bass\nV:S\nE4 F2 E2 | E6 E2 | E2 E2 F2 G2 | A8 || G4 F2 G2 |\nw:1.~Un- to the hills a- round do I lift up My long- ing\nw:2.~He will not suf- fer that thy foot be moved, Safe shalt thou\nw:3.~Je- ho- vah is Him- self thy keep- er true; Thy change- less\nw:4.~From ev- 'ry e- vil shall He keep thy soul, From ev- 'ry\nE8 | E4 F2 E2 | E6 E2 | E2 E2 F2 E2 | A8 |\nw:eyes; O whence for me shall my sal- va- tion come,\nw:be; No care- less slum- ber shall His eye- lids close\nw:shade Je- ho- vah, ev- er- more on thy right hand,\nw:sin; Je- ho- vah shall pre- serve thy go- ing out,\nB4 A2 B2 | c8 || c4 d2 c2 | B4 F4 | A2 G2 F2 E2 |\nw:From whence a- rise? From God the Lord doth come my cer- tain\nw:Who keep- eth thee; Be- hold He sleep- eth not, He slumb'- reth\nw:Him- self hath made; And thee no sun by day shall ev- er\nw:Thy com- ing in; A- bove thee watch- ing, He Whom we a-\ne8 || e4 d2 c2 | B2 A2 G2 F2 | E4 B4 | A8 |]\nw:aid, From God the Lord Who heav'n and earth hath made.\nw:ne'er, Who keep- eth Is- rael in His ho- ly care.\nw:smite, No moon shall harm thee in the si- lent night.\nw:dore Shall keep thee hence- forth, yea, for ev- er- more.\nV:A\nC4 C2 C2 | D6 D2 | C2 E2 E2 E2 | E8 || =D4 D2 D2 |\nE8 | C4 C2 C2 | D6 D2 | C2 C2 C2 C2 | D8 |\nF4 F2 F2 | =E8 || _E4 E2 E2 | D4 D4 | D2 D2 B,2 B,2 |\nE8 || [E_G]4 [E_G]2 [E_G]2 | F2 B,2 =B,2 B,2 | C4 D4 | C8 |]\nV:T\nA,4 A,2 A,2 | B,6 B,2 | C2 C2 C2 B,2 | A,8 || B,4 A,2 B,2 |\nG,8 | A,4 A,2 A,2 | B,6 B,2 | _A,2 A,2 A,2 A,2 | A,8 |\nF,4 F,2 F,2 | G,8 || =A,4 A,2 A,2 | B,4 B,4 | B,2 B,2 G,2 G,2 |\nA,8 || =A,4 A,2 A,2 | B,2 F,2 G,2 A,2 | A,4 G,4 | A,8 |]\nV:B\nA,4 A,2 A,2 | G,6 G,2 | A,2 A,2 A,2 G,2 | F,8 || B,,4 B,,2 B,,2 |\nE,8 | A,4 A,2 A,2 | G,6 G,2 | G,2 G,2 G,2 G,2 | F,8 |\nD,4 D,2 D,2 | C,8 || F,4 F,2 F,2 | B,,4 B,,4 | E,2 E,2 D,2 D,2 |\nC,8 || C,4 C,2 C,2 | D,2 D,2 =D,2 D,2 | E,4 E,4 | A,,8 |]\nW:1. Unto the hills around do I lift up my longing eyes; O whence for me shall my salvation come, From whence arise? From God the Lord doth come my certain aid, From God the Lord Who heav'n and earth hath made.\nW:2. He will not suffer that thy foot be moved, Safe shalt thou be; No careless slumber shall His eyelids close Who keepeth thee; Behold He sleepeth not, He slumb'reth ne'er, Who keepeth Israel in His holy care.\nW:3. Jehovah is Himself thy keeper true; Thy changeless shade Jehovah evermore on thy right hand Himself hath made; And thee no sun by day shall ever smite, No moon shall harm thee in the silent night.\nW:4. From ev'ry evil shall He keep thy soul, From ev'ry sin; Jehovah shall preserve thy going out, Thy coming in; Above thee watching, He Whom we adore Shall keep thee henceforth, yea, for evermore."
  },
  {
    "id": "psalter378",
    "sourceOwner": "T1",
    "otherVoice": "T2",
    "ownerPitchCount": 1,
    "otherPitchCount": 2,
    "smallPitchIndex": 0,
    "stem": "up",
    "onsets": [
      13
    ],
    "durations": [
      1
    ],
    "performance": "existing-canonical",
    "replacements": [],
    "source": "T:The Unfailing Mercy of God\nR:Psalm 136; 8s and 7s\nC:Tune: CONSTANCE; Arthur S. Sullivan\nN:Printed page 323\nM:4/4\nL:1/4\nK:F\n%%score (T1 T2)(B1 B2)\nV:T1 clef=treble\nV:T2 clef=treble\nV:B1 clef=bass\nV:B2 clef=bass\nV:T1\nA | A A B G | c3/2 d/ c || B | A A B G | B F z ||\nw:1.~Give thanks to God, for good is He, His grace a-bid-eth ev-er;\nw:2.~His wis-dom made the heav'ns to be, His grace a-bid-eth ev-er;\nw:3.~He helped us in our deep-est woes, His grace a-bid-eth ev-er;\nA | c B B A | A3/2 G/ F || F | E A c =B | =B A z ||\nw:To Him all praise and glo-ry be, His mer-cy fail-eth nev-er.\nw:He spread the earth a-bove the sea, His mer-cy fail-eth nev-er.\nw:He ran-somed us from all our foes, His mer-cy fail-eth nev-er.\nA | A G/A/ B B | A G/A/ B || c | d3/2 c/ B A | A G z ||\nw:His won-drous _ works with praise re- _ cord, His grace a-bid-eth ev-er,\nw:Praise Him Whose _ sun doth bring the _ day, His grace a-bid-eth ev-er;\nw:Each crea-ture's _ need He doth sup- _ ply, His grace a-bid-eth ev-er;\nc | c c f3/2 A/ | A B c3/2 || F/ | F F A3/2 G/ | G !fermata!F z |]\nw:The on-ly God, the sov'-reign Lord, Whose mer-cy fail-eth nev-er.\nw:The moon and stars His might dis-play, Whose mer-cy fail-eth nev-er.\nw:Give thanks to God, en-throned on high, Whose mer-cy fail-eth nev-er.\nV:T2\nF | F F E E | F3/2 F/ F || F | F F E E | [EG] F z ||\nF | A G G F | E3/2 E/ D || D | C E A ^G | ^G A z ||\nA | ^F E/F/ G G | ^F E/F/ G || A | B3/2 A/ G F | F E z ||\nE | F E F3/2 F/ | E D C3/2 || D/ | C C F3/2 E/ | E F z |]\nV:B1\nC | C C C C | C3/2 B,/ C || D | C C G, B, | B, A, z ||\nC | C C C C | ^C3/2 C/ D || A, | A, C E D | D C z ||\nA, | C C B, D | D D D || _E | D3/2 D/ D D | C C z ||\nC | C B, A,3/2 F,/ | F, F, F,3/2 || B,/ | A, A, C3/2 B,/ | B, !fermata!A, z |]\nV:B2\nF, | F, F, G, B, | A,3/2 B,/ A, || B, | C C, C, C, | C, F, z ||\nF, | E, E, F, F,/G,/ | A,3/2 A,/ D, || D, | E, E, E, E, | E, A,, z ||\nA, | D, D, G, B,,/C,/ | D, D, G, || F, | B,3/2 B,,/ B,, =B,, | C, C, z ||\nB, | A, G, F,3/2 D,/ | C, B,, A,,3/2 || B,,/ | C, C, C,3/2 C,/ | C, F, z |]\nW:1. Give thanks to God, for good is He, His grace abideth ever; To Him all praise and glory be, His mercy faileth never. His wondrous works with praise record, His grace abideth ever, The only God, the sov'reign Lord, Whose mercy faileth never.\nW:2. His wisdom made the heav'ns to be, His grace abideth ever; He spread the earth above the sea, His mercy faileth never. Praise Him Whose sun doth bring the day, His grace abideth ever; The moon and stars His might display, Whose mercy faileth never.\nW:3. He helped us in our deepest woes, His grace abideth ever; He ransomed us from all our foes, His mercy faileth never. Each creature's need He doth supply, His grace abideth ever; Give thanks to God, enthroned on high, Whose mercy faileth never.\n"
  }
];
