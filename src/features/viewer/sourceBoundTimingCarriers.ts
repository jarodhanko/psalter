import { extractUnderlayModel } from '../../domain/underlayIdentity';
import { getSourceTimingWitness, type SourceTimingContext } from '../../data/timingWitnesses';
import type { SourceBoundTimingId, TimingVoice } from '../../data/timingWitnesses/types';
export type { SourceBoundTimingId } from '../../data/timingWitnesses/types';

/** Bind the complete pristine source before metadata, stanza or learner transforms.
 * A changed ID, word, label, note, rest, tie, key or role cannot inherit this policy. */
export function sourceBoundTimingId(songId: string, abc: string, context?: SourceTimingContext | null): SourceBoundTimingId | undefined {
  const witness = getSourceTimingWitness(context, songId);
  return witness && abc.replace(/\r\n/g, '\n') === witness.source ? witness.id : undefined;
}

/** The approved inputs have no music-changing preparation before this hook.
 * Mirror only notationAbc's metadata/name removal and selected-row removal.
 * Do not erase accidentals, pitches, ties, rests or rhythmic punctuation. */
function timingMusicFrame(abc: string): string {
  return abc.replace(/\r\n/g, '\n')
    .replace(/^[ \t]*[TCRSONWZ]:.*(?:\n|$)/gm, '')
    .replace(/^V:[^\n]*$/gm, (line) =>
      line.replace(/\s+(?:name|subname)=(?:"[^"]*"|'[^']*'|[^\s]+)/g, ''))
    .split('\n').filter((line) => !/^\s*w:/.test(line)).join('\n');
}

/** Locate complete music lines in the two exact source syntaxes: body V: and [V:].
 * This does not parse or rewrite a musical token. The full music frame is checked
 * first, so an unknown structure never obtains a guessed injection position. */
function timingMusicLines(lines: readonly string[], carrier: TimingVoice): number[] {
  const indexes: number[] = [];
  let voice = '', inBody = false;
  const isMusic = (line: string) => {
    const content = line.trim();
    return !!content && !content.startsWith('%') && !/^[A-Z]:/.test(content);
  };
  lines.forEach((line, index) => {
    const declaration = /^V:([^\s]+)(.*)$/.exec(line);
    if (declaration) {
      voice = declaration[1]; inBody = !declaration[2].trim();
      return;
    }
    const inline = /^\s*\[V:([^\]\s]+)([^\]]*)\](.*)$/.exec(line);
    if (inline) {
      voice = inline[1]; inBody = true;
      if (voice === carrier && isMusic(inline[3])) indexes.push(index);
      return;
    }
    if (/^\s*w:/.test(line)) return;
    if (inBody && voice === carrier && isMusic(line)) indexes.push(index);
  });
  return indexes;
}

/** Select a reviewed shared lyric carrier before learner spelling and before
 * selectScoreVoices can borrow another voice's onsets. Canonical/playback ABC is
 * never changed. All surviving note/rest/tie bytes stay exact, including the
 * non-carrier voices. Full SATB and every original-source-carried selection remain untouched.
 *
 * 3: native lower-part syllable slots; B3 remains a lyric-free cue lane.
 * 8: native melismas in each part; Tenor/Bass keep the q17/q25 quarters.
 * 17b: Alto/Bass q19/q43 halves; verses 2–5 remain editorial adaptations.
 * 23b: Alto/Bass sing de- on their quarter at q14, before Soprano/Tenor q14.5.
 * 43: Alto keeps its q56 dotted half and q59 quarter; no synthetic q58 tie.
 * 29: sole Tenor takes in-/my/of at q50, not the other voices' q50.5.
 * 73: lower half-note syllables start q35, with final q37. Verses5/6 are explicitly
 *     reviewed editorial scansion of prose, not independently engraved rows.
 * 115: lower m2 syllables q6; Bass m10 tie sustains q36..39 and takes text at q39.
 * 190: Alto/Bass are silent q18..24 and sing only the second final echo q24..30.
 */
export function presentSourceBoundTimingCarrier(
  abc: string, visibleVoiceIndexes: readonly number[], activeId: SourceBoundTimingId | undefined,
  context?: SourceTimingContext | null,
): string {
  const witness = getSourceTimingWitness(context, activeId);
  if (!witness) return abc;
  const voiceIds: readonly TimingVoice[] = witness.voiceIds ?? ['T1', 'T2', 'B1', 'B2'];
  if (!visibleVoiceIndexes.length ||
      new Set(visibleVoiceIndexes).size !== visibleVoiceIndexes.length ||
      visibleVoiceIndexes.some((index) => !Number.isInteger(index) || index < 0 || index >= voiceIds.length)) return abc;
  const originalCarrier = voiceIds[0];
  const visibleIds = visibleVoiceIndexes.map((index) => voiceIds[index]);
  const carrier = witness.priority.find((voice) => visibleIds.includes(voice));
  const lyricFree = !carrier && visibleIds.every((voice) => witness.lyricFreeVoices?.includes(voice));
  if ((!carrier && !lyricFree) || carrier === originalCarrier) return abc;
  if (timingMusicFrame(abc) !== timingMusicFrame(witness.source)) return abc;

  const lines = abc.split(/\r?\n/);
  const model = extractUnderlayModel(abc, witness.underlayIdentity);
  const numbers = model.stanzaNumbers;
  const stanzaCount = witness.rows[0].length;
  if (model.ambiguous || !numbers.length ||
      numbers.some((number, index) => !Number.isInteger(number) || number < 1 || number > stanzaCount ||
        (index > 0 && numbers[index - 1] >= number)) ||
      model.rows.length !== witness.rows.length * numbers.length ||
      lines.filter((line) => /^\s*w:/.test(line)).length !== model.rows.length) return abc;
  for (let segment = 0; segment < witness.rows.length; segment++) {
    const rows = model.rows.filter((row) => row.voiceId === originalCarrier && row.musicSegment === segment);
    if (rows.length !== numbers.length || rows.some((row, index) =>
      row.stanzaNumber !== numbers[index] || row.sourceText !== witness.rows[segment][numbers[index] - 1].replace(/^\s*w:\s*/, '').trimEnd())) return abc;
  }
  // Validate the complete selected row vector before removing it. In #3's
  // B3-only view no sung row is appropriate, so no donor enters the generic
  // lyric-anchor planner and the native q64 whole-to-quarter tie stays exact.
  if (lyricFree) return lines.filter((line) => !/^\s*w:/.test(line)).join('\n');
  if (!carrier) return abc;
  const carrierLines = timingMusicLines(lines, carrier);
  if (carrierLines.length !== witness.rows.length) return abc;
  const segmentsByLine = new Map(carrierLines.map((line, segment) => [line, segment]));
  return lines.flatMap((line, index) => {
    if (/^\s*w:/.test(line)) return [];
    const segment = segmentsByLine.get(index);
    if (segment === undefined) return [line];
    const rows = witness.alternateSegments?.[carrier]?.[segment] ?? witness.rows[segment];
    return [line, ...numbers.map((number) => rows[number - 1])];
  }).join('\n');
}
