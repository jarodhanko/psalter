import abcjs from 'abcjs';
import { readScreenScoreIdentity } from './isolatedChordWrap';
import { withInheritedHymnClefs } from './inheritedHymnClefs';

// Frozen Open Hymnal 2007 Bradbury edition. Canonical SHA-256:
// 2736e7020e77b0baa6cc1b4adaa5399a302918d48cd67f2b2b0ce79491bf3032.
// These display-only witnesses never rewrite canonical or downloadable ABC.
export const SAVIOR_WIDTH_ID = 'hymn-oh_savior-like-a-shepherd-lead-us-bradbury';
const sourceWitness = "%abc-2.1\n% Normalized from Open Hymnal ABCPlus. See companion provenance JSON.\n% Source engraving directive: %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n% Source engraving directive: %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%\n% Source engraving directive: %%pagewidth\t21.6000cm\n% Source engraving directive: %%pageheight\t27.9000cm\n% Source engraving directive: %%scale\t\t0.750000\n% Source engraving directive: %%staffsep\t1.60000cm\n% Source engraving directive: %%exprabove\tfalse\n% Source engraving directive: %%measurebox\tfalse\n% Source engraving directive: %%postscript /st { moveto -8 0 rmoveto 0 8 rlineto 4 0 rlineto stroke } def\n% Source engraving directive: %%postscript /nd { moveto -8 0 rmoveto 0 8 rlineto -4 0 rlineto stroke } def\n% Source engraving directive: %%deco sintro 6 st 6 0 0\n% Source engraving directive: %%deco eintro 6 nd 6 0 0\nX:1\nT: Savior, Like A Shepherd Lead Us\nC: Words: attr. Dorothy Ann Thrupp, 1836.\nC: Music and Setting: 'Bradbury' William B. Bradbury, 1859.\nC: copyright: public domain.  This score is a part of the Open Hymnal Project, 2007 Revision.\nS: Music source: \"The Golden Chain and Shower\", 1866 Hymn 94.  Ed. Wm. Bradbury\nM: 4/4 % time signature\nL: 1/4 % default length\n%%score (S1V1 S1V2) | (S2V1 S2V2)\nV: S1V1 clef=treble\n%%MIDI beat 127 125 110 1\nV: S1V2\n%%MIDI beat 127 125 110 1\nV: S2V1 clef=bass\n%%MIDI beat 127 125 110 1\nV: S2V2\n%%MIDI beat 127 125 110 1\nK: Eb % key signature\n%\n%%MIDI program 1 0 % Piano 1\n%%MIDI program 2 0 % Piano 1\n%%MIDI program 3 0 % Piano 1\n%%MIDI program 4 0 % Piano 1\n%\n% 1\n[V: S1V1] [Q:1/4=100] G G G/ F/ G/ A/ | (B e) (B G) | F G A/ c/ B/ A/ | G3 z |\nw: 1.~Sa- vior, like a shep- herd lead * us, * much we need Thy ten- der care;\nw: 2.~We are Thine, Thou dost be- friend * us, * be the guard- ian of our way;\nw: 3.~Thou hast pro- mised to re- ceive * us, * poor and sin- ful though we be;\nw: 4.~Ear- ly let us seek Thy fa- * vor, * ear- ly let us do Thy will;\n[V: S1V2]  E E E/ D/ E/ F/ | G2 (G E) | D E F/ A/ G/ F/ | E3 x |\n[V: S2V1]  B, B, B,/ B,/ B,/ B,/ | B,2 (E B,) | B, B, B,/ B,/ B,/ B,/ | B,3 z |\n[V: S2V2]  E, E, E,/ A,/ G,/ F,/ | E,2 E,2 | B,, B,, B,,/ B,,/ B,,/ B,,/ | E,3 x |\n% 5\n[V: S1V1]  G G G/ F/ G/ A/ | (B e) (B G) | F G A/ c/ B/ A/ | G3\nw: In Thy plea- sant pas- tures feed * us, * for our use Thy folds pre- pare.\nw: Keep Thy flock, from sin de- fend * us, * seek us when we go a- stray.\nw: Thou hast mer- cy to re- lieve * us, * grace to cleanse and pow'r to free.\nw: Bless- èd Lord and on- ly Sa- * vior, * with Thy love our bo- soms fill.\n[V: S1V2]  E E E/ D/ E/ F/ | G2 (G E) | D E F/ A/ G/ F/ | E3\n[V: S2V1]  B, B, B,/ B,/ B,/ B,/ | B,2 (E B,) | B, B, B,/ B,/ B,/ B,/ | B,3\n[V: S2V2]  E, E, E,/ A,/ G,/ F,/ | E,2 E,2 | B,, B,, B,,/ B,,/ B,,/ B,,/ | E,3\n% 9\n[V: S1V1]  B/ B/ | c e2 d/ c/ | B G2 G/ G/ | F c B A | G3\nw: Bless- èd Je- sus, bless- èd Je- sus! Thou hast bought us, Thine we are.\nw: Bless- èd Je- sus, bless- èd Je- sus! Hear, O hear us when we pray.\nw: Bless- èd Je- sus, bless- èd Je- sus! We will ear- ly turn to Thee.\nw: Bless- èd Je- sus, bless- èd Je- sus! Thou hast loved us, love us still.\n[V: S1V2]  G/ G/ | A c2 B/ A/ | G E2 E/ E/ | D A G F | E3\n[V: S2V1]  E/ E/ | E E2 E/ E/ | E B,2 B,/ B,/ | B, B, B, B, | B,3\n[V: S2V2]  E,/ E,/ | A, A,2 A,/ A,/ | E, E,2 E,/ E,/ | B,, B,, B,, B,, | E,3\n% 13\n[V: S1V1]  B/ B/ | c e2 d/ c/ | B !fermata!e2 E/ F/ | G B A3/2 F/ | E3 |]\nw: Bless- èd Je- sus, bless- èd Je- sus! Thou hast bought us, Thine we are.\nw: Bless- èd Je- sus, bless- èd Je- sus! Hear, O hear us when we pray.\nw: Bless- èd Je- sus, bless- èd Je- sus! We will ear- ly turn to Thee.\nw: Bless- èd Je- sus, bless- èd Je- sus! Thou hast loved us, love us still.\n[V: S1V2]  G/ G/ | A c2 B/ A/ | G G2 E/ E/ | E G F3/2 D/ | E3 |]\n[V: S2V1]  E/ E/ | E E2 E/ E/ | E !invertedfermata!B,2 G,/ A,/ | B, B, B,3/2 A,/ | G,3 |]\n[V: S2V2]  E,/ E,/ | A, A,2 A,/ A,/ | E, E,2 E,/ E,/ | E, E, B,,3/2 B,,/ | E,3 |]\n% 18\n";
const notationWitness = withInheritedHymnClefs(sourceWitness, SAVIOR_WIDTH_ID)
  .replace(/^[ \t]*[TCRSONWZ]:.*(?:\r?\n|$)/gm, '');
const parserWitness = notationWitness.slice(837).trimEnd();

export function hasSaviorWidthSource(songId: string | undefined, abc: string) {
  return songId === SAVIOR_WIDTH_ID && abc === sourceWitness;
}

/** Automatic wrapping strips this exact comment prefix, while explicit
 * lineBreaks retain it. Verify TuneBook independently before adopting the
 * same parser input, keeping every source/click offset unchanged. */
export function saviorWrappedNotation(abc: string): string | undefined {
  if (abc !== notationWitness) return undefined;
  const book = new abcjs.TuneBook(abc);
  return !book.header && book.tunes.length === 1 && book.tunes[0].startPos === 837 &&
    book.tunes[0].abc === parserWitness && book.tunes[0].abc === abc.slice(837).trimEnd()
    ? parserWitness : undefined;
}

const pitchFields = new Set(['pitch', 'name', 'accidental', 'verticalPos', 'startTie', 'endTie',
  'startSlur', 'endSlur', 'style', 'highestVert']);
const groupingWitness = JSON.stringify([[null, null, 'start'], [null, null, 'end']]);

/** Local read-only adapter. Tempo remains part of the full signature. Reject
 * unrecognized pitch fields (including midipitch) rather than hiding them from
 * the shared reader. highestVert is ABCJS's derived engraving cache and must
 * match ABCJS's one-pitch, fixed-stem derived position; musical fields remain signed.
 * This source has connected staves without a brace or bracket. */
export function readSaviorWidthIdentity(tune: abcjs.TuneObject | undefined, abc: string) {
  if (!tune || abc !== parserWitness || abcjs.signature !== 'abcjs-basic v6.7.0') return undefined;
  let count = 0, invalid = false;
  const tempos: unknown[] = [];
  const structural = { ...tune, lines: tune.lines.map((line, lineIndex) => {
    if (!line.staff || line.staff.length !== 2 || line.staff.some(staff => staff.voices?.length !== 2) ||
      JSON.stringify(line.staff.map(staff => {
        const group = staff as typeof staff & { brace?: unknown; bracket?: unknown; connectBarLines?: unknown };
        return [group.brace, group.bracket, group.connectBarLines];
      })) !== groupingWitness || line.staff[0].clef?.type !== 'treble' || line.staff[1].clef?.type !== 'bass') invalid = true;
    return { ...line, staff: line.staff?.map((staff, staffIndex) => ({ ...staff,
      voices: staff.voices?.map((voice, voiceIndex) => voice.filter((raw, eventIndex) => {
        const note = raw as abcjs.AbcElem;
        if (note.pitches?.some(pitch => {
          const value = pitch as typeof pitch & { highestVert?: number };
          return Object.keys(pitch).some(key => !pitchFields.has(key)) ||
            (value.highestVert !== undefined && value.highestVert !== pitch.verticalPos +
              (voiceIndex === 0 && typeof note.duration === 'number' && note.duration < 1 ? 6 : 0));
        })) invalid = true;
        if (raw.el_type !== 'tempo') return true;
        const event = raw as abcjs.VoiceItemTempo;
        count++;
        const token = abc.slice(event.startChar, event.endChar);
        if (lineIndex !== 0 || staffIndex !== 0 || voiceIndex !== 0 ||
          voice.slice(0, eventIndex).some(item => item.el_type !== 'stem') ||
          event.startChar !== 422 || event.endChar !== 433 || token !== '[Q:1/4=100]' ||
          event.bpm !== 100 || JSON.stringify(event.duration) !== '[0.25]' ||
          event.preString !== undefined || event.postString !== undefined || event.suppress !== undefined ||
          ((event as abcjs.VoiceItemTempo & { type?: string }).type !== undefined &&
            (event as abcjs.VoiceItemTempo & { type?: string }).type !== 'tempo') ||
          Object.keys(event).some(key => !['startChar', 'endChar', 'duration', 'bpm', 'el_type', 'type', 'abselem'].includes(key))) invalid = true;
        tempos.push([event.startChar, event.endChar, token, event.bpm, event.duration]);
        return false;
      })),
    })) };
  }) };
  if (invalid || count !== 1) return undefined;
  const score = readScreenScoreIdentity(structural, abc);
  if (!score || score.meter !== 1 || score.units.length !== 16 || score.notes.length !== 252 ||
    score.units.some((unit, index) => unit.duration !== (index === 15 ? 0.75 : 1)) ||
    score.units[3].singleAttack || new Set(score.notes.map(note => note.voice)).size !== 4 ||
    score.notes.some(note => note.voice > 3 || (note.element.pitches && note.element.pitches.length !== 1) ||
      (note.element.lyric && (note.voice !== 0 || note.element.lyric.length !== 4))) ||
    score.notes.reduce((sum, note) => sum + (note.element.pitches?.length ?? 0), 0) !== 248 ||
    score.notes.filter(note => note.element.lyric?.length).length !== 64) return undefined;
  return { ...score, signature: JSON.stringify([score.signature, groupingWitness, tempos]) };
}
