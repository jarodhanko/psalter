/** Source-bound combined-score presentation. Authoritative part underlay
 * remains intact for isolated parts and playback; only a reviewed supplemental
 * carrier is suppressed when the printed carrier is also selected. */
export interface CarrierWitness {
  id: 'psalter26';
  staff: string;
  carrierVoice: string;
  supplementVoice: string;
  supplementMusicSegment: number;
  music: Record<string, string[]>;
  lyrics: Record<string, string[]>;
}
interface UnderlayRow { voiceId: string; musicSegment: number; stanzaNumber: number; sourceLineIndex: number; sourceText: string }
interface UnderlayModel { rows: UnderlayRow[]; stanzaNumbers: number[]; ambiguous: boolean }
type Extract = (abc: string) => UnderlayModel;

/** Bind once against the pristine song ABC, before grouping, printing,
 * learner accidentals or voice reduction. Exact musical/lyric witnesses are
 * reviewed against the source and fail closed when the source changes.
 */
export function hasCarrierWitness(songId: string, abc: string, witness: CarrierWitness): boolean {
  if (songId !== witness.id || !abc.split(/\r?\n/).includes(witness.staff)) return false;
  const music: Record<string, string[]> = {}, lyrics: Record<string, string[]> = {};
  let voice = '', body = false;
  for (const line of abc.split(/\r?\n/)) {
    const match = /^V:([^\s]+)(.*)$/.exec(line);
    if (match) { voice = match[1]; body = !match[2].trim(); continue; }
    if (!body) continue;
    if (/^w:/.test(line)) { (lyrics[voice] ??= []).push(line); continue; }
    const content = line.trim();
    if (content && !/^%|^[A-Z]:/.test(content)) (music[voice] ??= []).push(content.replace(/\s+/g, ' '));
  }
  return [witness.carrierVoice, witness.supplementVoice].every(id =>
    JSON.stringify(music[id]) === JSON.stringify(witness.music[id]) &&
    JSON.stringify(lyrics[id]) === JSON.stringify(witness.lyrics[id]));
}

/** Apply AFTER the current selectScoreVoices transformation. Keep authoritative
 * per-part rows as data; suppress the explicitly mapped supplemental carrier
 * in a combined engraving only when its printed carrier is also present.
 * Do not call on the full playback tune or use the result as canonical ABC.
 */
export function presentCombinedCarrier(
  selectedAbc: string, visibleVoiceIds: readonly string[],
  activeWitness: CarrierWitness | undefined, extract: Extract,
): string {
  if (!activeWitness || !visibleVoiceIds.includes(activeWitness.carrierVoice) ||
      !visibleVoiceIds.includes(activeWitness.supplementVoice)) return selectedAbc;
  const model = extract(selectedAbc);
  if (model.ambiguous) return selectedAbc;
  const lines = selectedAbc.split(/\r?\n/);
  const expected = activeWitness.lyrics[activeWitness.supplementVoice];
  const removable = model.rows.filter(row => row.voiceId === activeWitness.supplementVoice &&
    row.musicSegment === activeWitness.supplementMusicSegment &&
    row.stanzaNumber >= 1 && row.stanzaNumber <= expected.length &&
    lines[row.sourceLineIndex] === expected[row.stanzaNumber - 1]);
  // Never suppress a row unless the source-mapped printed carrier exists for
  // this exact stanza and music segment in this selected/grouped score.
  const indexes = new Set(removable.filter(row => model.rows.some(carrier =>
    carrier.voiceId === activeWitness.carrierVoice &&
    carrier.musicSegment === activeWitness.supplementMusicSegment &&
    carrier.stanzaNumber === row.stanzaNumber)).map(row => row.sourceLineIndex));
  return lines.filter((_, index) => !indexes.has(index)).join('\n');
}

/** A reviewed carrier can also provide complete numbered prose without
 * mistaking its system-continuation rows for independent unnumbered refrains.
 * This is deliberately source-bound; ambiguous or unrelated scores keep their
 * existing transcript behavior.
 */
export function reconstructCarrierTranscript(
  songId: string, abc: string, witness: CarrierWitness, extract: Extract,
): readonly string[] | undefined {
  if (!hasCarrierWitness(songId, abc, witness) || /^\s*W:/m.test(abc)) return undefined;
  const model = extract(abc);
  if (model.ambiguous || model.rows.some(row => ![witness.carrierVoice, witness.supplementVoice].includes(row.voiceId))) return undefined;
  const segmentCount = witness.music[witness.carrierVoice].length;
  const stanzaCount = witness.lyrics[witness.supplementVoice].length;
  const numbers = Array.from({ length: stanzaCount }, (_, index) => index + 1);
  if (JSON.stringify(model.stanzaNumbers) !== JSON.stringify(numbers)) return undefined;
  const reconstructed: string[] = [];
  for (const number of numbers) {
    const rows = model.rows.filter(row => row.voiceId === witness.carrierVoice && row.stanzaNumber === number)
      .sort((left, right) => left.musicSegment - right.musicSegment);
    if (rows.length !== segmentCount || rows.some((row, index) => row.musicSegment !== index)) return undefined;
    // Strip only the source's stanza label. Keep every lexical character and
    // ABC syllable/continuation marker for the existing display normalizer.
    const parts = rows.map(row => row.sourceText.replace(/^\d+\.(?:\s|~)*/, ''));
    reconstructed.push(`${number}. ${parts.join(' ')}`);
  }
  return reconstructed;
}

/** Psalter 26: the printed source has one interstaff lyric carrier. Alto
 * has different second-segment attacks, so its authoritative rows are retained
 * in canonical ABC but must not double the combined score's text. */
export const psalter26UnderlayCarrier: CarrierWitness = {
  "id": "psalter26",
  "staff": "%%score (T1 T2)(B1 B2)",
  "carrierVoice": "T1",
  "supplementVoice": "T2",
  "supplementMusicSegment": 1,
  "music": {
    "T1": [
      "G> A | B e d c | B2 || E > F | G B A G | F2 ||",
      "G > A | B e d c | B2 || E > F | G A G F | E2 |]"
    ],
    "T2": [
      "E > D | E G F E/2F/2 | G2 || B, > D | E F E E | D2 ||",
      "E > D | E G F > E | D2 || E > D | E F E D | E2 |]"
    ]
  },
  "lyrics": {
    "T1": [
      "w:1.~Who, O Lord, shall dwell with Thee In the tem-ple of Thy grace?",
      "w:2.~He who walks in right-eous-ness, All his ac-tions just and clear;",
      "w:3.~He to whom does not be-long Tongue of mal-ice or de-ceit;",
      "w:4.~Who the wick-ed man will spurn, Hon-or those that fear the Lord;",
      "w:5.~Who no u-su-ry will claim, Nor with bribes pol-lute his hand:",
      "w:Who Thy con-stant guest shall be In Thy high and ho-ly place?",
      "w:He whose words the truth ex-press, Spo-ken from a heart sin-cere.",
      "w:Who will not his neigh-bor wrong, Nor a slan-derous tale re-peat.",
      "w:Nor will from his prom-ise turn Tho' but loss be his re-ward.",
      "w:He who thus his life shall frame Shall un-moved for-ev-er stand."
    ],
    "T2": [
      "w:1.~Who Thy con-stant guest shall be In Thy high and ho-ly place?",
      "w:2.~He whose words the truth ex-press, Spo-ken from a heart sin-cere.",
      "w:3.~Who will not his neigh-bor wrong, Nor a slan-derous tale re-peat.",
      "w:4.~Nor will from his prom-ise turn Tho' but loss be his re-ward.",
      "w:5.~He who thus his life shall frame Shall un-moved for-ev-er stand."
    ]
  }
};
