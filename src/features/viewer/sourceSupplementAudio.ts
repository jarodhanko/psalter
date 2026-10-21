import abcjs from 'abcjs';
import { sourceHeadWitness, withSourceHeads } from './sourceHeadPresentation';
import { sourceLayerWitness, withSourceLayerHeads, withSelectedSourceLayers } from './sourceTimedLayers';

const headFamilies = new Set(['psalter3', 'psalter72', 'psalter302', 'psalter307']);
const layerFamilies = new Set(['psalter152', 'psalter271', 'psalter294', 'psalter333']);
const fail = (id: string): never => { throw new Error(`Unable to preserve ${id} full-score accompaniment.`); };
type Span = { startChar?: number; endChar?: number };

/** The approved practice convention is applied only to these exact sources.
 * Partial selections keep their original ABC, voices and playback path.
 * Existing 319/347/378 sonorities have separate guards; never inject them.
 */
export function prepareSourceSupplementAudio(
  songId: string, abc: string, voiceIds: readonly string[], visibleVoiceIndexes: readonly number[],
) {
  if (!headFamilies.has(songId) && !layerFamilies.has(songId)) return undefined;
  const visible = new Set(visibleVoiceIndexes);
  if (!voiceIds.length || new Set(voiceIds).size !== voiceIds.length || visible.size !== visibleVoiceIndexes.length ||
      [...visible].some(index => !Number.isInteger(index) || index < 0 || index >= voiceIds.length)) return fail(songId);
  if (visible.size !== voiceIds.length) return undefined;

  // Bind the ORIGINAL complete source before adding any pitches or voices.
  // Using the retained witnesses avoids a second, drifting pitch ledger.
  const heads = headFamilies.has(songId) ? sourceHeadWitness(songId, abc) : undefined;
  const layers = layerFamilies.has(songId) ? sourceLayerWitness(songId, abc) : undefined;
  const original = heads?.source ?? layers?.source;
  if (!original || (heads && heads.performance !== 'display-only') || abcjs.signature !== 'abcjs-basic v6.7.0') return fail(songId);
  const originalIds = [...new Set([...original.matchAll(/(?:^V:|\[V:)([^\s\]]+)/gm)].map(match => match[1]))];
  // Include every existing part, including Psalter 3's original B3 cue lane.
  // Caller order may differ from source order; indexes retain caller meaning.
  if (originalIds.length !== voiceIds.length || originalIds.some(id => !voiceIds.includes(id))) return fail(songId);

  const addedIds = layers?.layers.map(layer => layer.id) ?? [];
  if (new Set(addedIds).size !== addedIds.length || addedIds.some(id => voiceIds.includes(id))) return fail(songId);
  let audioAbc = layers
    ? withSelectedSourceLayers(withSourceLayerHeads(original, layers), layers)
    : withSourceHeads(original, heads);
  if (layers) {
    // ABCJS numbers audio voices by flattening each system's staves. A
    // display layer may occupy fewer systems than its original owner, so
    // keep every original staff first and append independent audio staves.
    const scores = original.match(/^%%score[^\r\n]*$/gm) ?? [];
    if (scores.length !== 1) return fail(songId);
    audioAbc = audioAbc.replace(/^%%score[^\r\n]*$/m,
      `${scores[0]} ${addedIds.map(id => `(${id})`).join(' ')}`);
  }
  if (audioAbc === original) return fail(songId);
  const audioVoiceIds = [...voiceIds, ...addedIds];
  const audioVisibleVoiceIndexes = [...visibleVoiceIndexes, ...addedIds.map((_, index) => voiceIds.length + index)];

  // These indexes are internal accompaniment identities, never new singer
  // selectors or aliases for T2/B2. Ownership comes from the exact input that
  // will be parsed once, after projection; original offsets are not reused.
  const changes = [...audioAbc.matchAll(/(?:^V:|\[V:)([^\s\]]+)/gm)].map(match => ({
    start: match.index!, voice: audioVoiceIds.indexOf(match[1]),
  }));
  if (changes.some(change => change.voice < 0) ||
      audioVoiceIds.some((_, index) => !changes.some(change => change.voice === index))) return fail(songId);
  const sourceOwner = (position: number): number | undefined => {
    for (let index = changes.length - 1; index >= 0; index -= 1) {
      if (changes[index].start <= position) return changes[index].voice;
    }
    return undefined;
  };
  const validateSpans = (notes: readonly Span[]) => {
    for (const note of notes) {
      if (!Number.isInteger(note.startChar) || !Number.isInteger(note.endChar) ||
          note.startChar! < 0 || note.endChar! <= note.startChar! || note.endChar! > audioAbc.length) return fail(songId);
      const first = sourceOwner(note.startChar!), last = sourceOwner(note.endChar! - 1);
      if (first === undefined || first !== last || !audioVisibleVoiceIndexes.includes(first)) return fail(songId);
    }
  };
  return {
    abc: audioAbc, voiceIds: audioVoiceIds, visibleVoiceIndexes: audioVisibleVoiceIndexes,
    validateTune: (tune: abcjs.TuneObject, tracks: abcjs.AudioTrack[]) => {
      if (tune.warnings?.length) return fail(songId);
      validateSpans(tracks.flatMap(track => track.filter(event => event.cmd === 'note')));
    },
    validateCallback: (tracks: abcjs.NoteMapTrack[]) => validateSpans(tracks.flat()),
  };
}
