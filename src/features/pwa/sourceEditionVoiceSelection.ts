import { restoreBattleUpdateVoices } from './battleVoiceSelection';
import type { ViewerUpdateSettings } from './updateSession';

export const WAYFARING_SATB_SOURCE_SHA256 = 'b299d63e35824dc23a42b12e6a468ec02afe0a643724607607e5c7b0a3a7bc98';
const WAYFARING_MELODY_SOURCE_SHA256 = '1bc409cc72ca798d278afacdd907a45f0e5a22abcfe655ae805a05c20a5504f8';

/** Only approved PWA update snapshots enter here. Portable saved/share choices
 * are explicit voice IDs and bypass these exact edition-to-edition migrations. */
export function restoreSourceEditionUpdateVoices(
  songId: string, sourceSha256: string | undefined, available: readonly string[],
  settings: Partial<ViewerUpdateSettings>,
): Partial<ViewerUpdateSettings> {
  const battle = restoreBattleUpdateVoices(songId, sourceSha256, available, settings);
  if (battle !== settings) return battle;
  const witness = settings.voiceSelection;
  // The old one-part Wayfaring edition wrote a source/available-voice witness.
  // Missing, malformed or new-edition witnesses never imply an all-parts choice.
  if (songId !== 'hymn-aperio-wayfaring-stranger' || sourceSha256 !== WAYFARING_SATB_SOURCE_SHA256
    || available.join(',') !== '1,2,3,4'
    || witness?.version !== 1 || witness.sourceSha256 !== WAYFARING_MELODY_SOURCE_SHA256
    || !Array.isArray(witness.available) || witness.available.length !== 1 || witness.available[0] !== '1'
    || settings.visibleVoices?.length !== 1 || settings.visibleVoices[0] !== 0) return settings;
  return { ...settings, visibleVoices: [0, 1, 2, 3] };
}
