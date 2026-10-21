import abcjs from 'abcjs';
import { SOPRANO_BACKING_VOLUME } from './sopranoEmphasis';
import type { CapturedTrackingSequence } from './playbackTracking';
import { preparePsalter319CueMask } from './psalter319Audio';
import { prepareSourceHeadAudio } from './sourceHeadAudio';
import { prepareSourceSupplementAudio } from './sourceSupplementAudio';
import { preparePsalter313FermataAudio } from './psalter313FermataAudio';
import { prepareSharedFermataAudio } from './sharedFermataAudio';
import { prepareMightyFortressAudioSource } from './mightyFortressAudioSource';

/** Source-bound exceptions distinguish vocal heads from accompaniment;
 * other synthesized overlays retain their original V: ownership. */
import { TURN_YOUR_EYES_AUDIO_SOURCE } from './audioPlaybackIdentity';
export { TURN_YOUR_EYES_AUDIO_SOURCE } from './audioPlaybackIdentity';
const matchesTurnYourEyesAudioSource = (abc: string) => {
  if (abc.length !== 5256) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index += 1) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  }
  return hash === 0x36a4727c5d997329n;
};

export function prepareAudioPlayback(abc: string, voiceIds: readonly string[], visibleVoiceIndexes: readonly number[], songId: string, midiTranspose: number, sourceSha256?: string, emphasizedVoiceId?: string) {
  abc = prepareMightyFortressAudioSource(songId, abc);
  // Imported piano directives are edition playback preferences, not musical
  // events. Let the user's selected instrument drive all written voices.
  // Chord symbols stay on the score without inventing an accompaniment part.
  const importedHymn = songId.startsWith('hymn-');
  // ABCJS 6.7 accumulates this edition's hairpins across its repeated voices,
  // silencing the complete bass and part of the tenor. Preserve every musical
  // event and fixed dynamic; only this byte-qualified playback copy omits
  // gradual dynamics. Engraving and original ABC keep the printed hairpins.
  if (songId === 'hymn-hc-turn-your-eyes' && sourceSha256 === TURN_YOUR_EYES_AUDIO_SOURCE && matchesTurnYourEyesAudioSource(abc)) {
    abc = abc.replace(/!(?:[<>]|crescendo|diminuendo)[()]!/g, '');
  }
  if (importedHymn) abc = abc.replace(/^%%MIDI\s+program\b[^\r\n]*(?:\r?\n|$)/gm, '');
  const supplement = prepareSourceSupplementAudio(songId, abc, voiceIds, visibleVoiceIndexes);
  if (supplement) {
    abc = supplement.abc;
    voiceIds = supplement.voiceIds;
    visibleVoiceIndexes = supplement.visibleVoiceIndexes;
  }
  // Keep exact role witnesses and fresh parser spans in the same LF source.
  if (['psalter313', 'psalter319', 'psalter347', 'psalter378'].includes(songId)) abc = abc.replace(/\r\n/g, '\n');
  const tune = abcjs.parseOnly(abc)[0];
  if (!tune) throw new Error('Unable to prepare this score for playback.');
  const visible = new Set(visibleVoiceIndexes);
  const voiceChanges = [...abc.matchAll(/(?:^V:|\[V:)[ \t]*([^\s\]]+)/gm)].map((match) => ({
    start: match.index!,
    voice: voiceIds.indexOf(match[1]),
  }));
  const sourceVoice = (startChar: number | undefined, trackIndex: number) => {
    // A single-voice ABC tune can legitimately have no V: fields.
    if (!voiceChanges.length) return trackIndex;
    if (startChar === undefined || startChar < 0) return undefined;
    for (let index = voiceChanges.length - 1; index >= 0; index -= 1) {
      if (voiceChanges[index].start <= startChar) return voiceChanges[index].voice;
    }
    return undefined;
  };
  const sourceTracks = tune.setUpAudio(importedHymn ? { chordsOff: true } : {}).tracks;
  supplement?.validateTune(tune, sourceTracks);
  const cueMask = preparePsalter319CueMask(songId, abc, tune, sourceTracks, voiceIds, visible, midiTranspose, sourceVoice);
  const headAudio = prepareSourceHeadAudio(songId, abc, tune, sourceTracks, voiceIds, visible, midiTranspose, sourceVoice);
  const trackOwners = sourceTracks.map((track, trackIndex) => {
    const owners = track.filter((event) => event.cmd === 'note').map((event) => headAudio?.owners.get(event) ?? sourceVoice(event.startChar, trackIndex));
    return owners.map((owner, noteIndex) => {
      if (owner !== undefined) return owner;
      // ABCJS grace-note events have no source span; they precede their principal note.
      for (let next = noteIndex + 1; next < owners.length; next += 1) {
        if (owners[next] !== undefined) return owners[next];
      }
      for (let previous = noteIndex - 1; previous >= 0; previous -= 1) {
        if (owners[previous] !== undefined) return owners[previous];
      }
      return undefined;
    });
  });
  const emphasizedVoice = emphasizedVoiceId === undefined ? -1 : voiceIds.indexOf(emphasizedVoiceId);
  // Missing/muted soprano and uncertain source ownership leave the mix alone.
  const emphasize = emphasizedVoice >= 0 && visible.has(emphasizedVoice)
    && trackOwners.some(owners => owners.includes(emphasizedVoice))
    && trackOwners.every(owners => owners.every(owner => owner !== undefined && owner >= 0));
  const voicesOff = voiceChanges.length
    ? trackOwners.flatMap((owners, trackIndex) => {
      return owners.length && owners.every((voice) => voice !== undefined && !visible.has(voice)) ? [trackIndex] : [];
    })
    : voiceIds.flatMap((_, index) => visible.has(index) ? [] : [index]);
  const fermatas = preparePsalter313FermataAudio(songId, abc, tune, sourceTracks, voiceIds, visible, midiTranspose, sourceVoice)
    ?? prepareSharedFermataAudio(songId, abc, tune, sourceTracks, voiceIds, visible, midiTranspose, sourceVoice);
  let trackingSequence: CapturedTrackingSequence | undefined;
  const sequenceCallback = (tracks: abcjs.NoteMapTrack[]) => {
    const before = tracks.map(track => track.map(note => ({ ...note })));
    const applyFermatas = fermatas?.(tracks);
    supplement?.validateCallback(tracks);
    const cueNotesToMute = cueMask?.(tracks);
    const headOwners = headAudio?.callbackOwners(tracks);
    tracks.forEach((track, trackIndex) => track.forEach((note, noteIndex) => {
      const voice = headOwners?.get(note) ?? sourceVoice(note.startChar, trackIndex) ?? trackOwners[trackIndex]?.[noteIndex];
      // This also handles an overlay track containing notes from multiple V: parts.
      if ((voice !== undefined && !visible.has(voice)) || cueNotesToMute?.has(note)) note.volume = 0;
      else if (emphasize && voice !== undefined && voice >= 0 && voice !== emphasizedVoice && note.volume > 0) {
        // Integer volumes match ABCJS's sample-cache conversion; keep quiet
        // audible notes audible and preserve zero-volume source dynamics.
        note.volume = Math.max(1, Math.round(note.volume * SOPRANO_BACKING_VOLUME));
      }
    }));
    applyFermatas?.();
    const freeze = (value: abcjs.NoteMapTrack[]) => Object.freeze(value.map(track => Object.freeze(track.map(note => Object.freeze({ ...note })))));
    trackingSequence = Object.freeze({ source: abc, before: freeze(before), after: freeze(tracks) });
    return tracks;
  };
  return { tune, voicesOff, sequenceCallback, trackingSequence: () => trackingSequence };
}
