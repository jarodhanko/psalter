import type { ViewerUpdateSettings } from './updateSession';

// The prior melody-only Battle edition had exactly one selectable voice. Only its
// witness-free update snapshot can mean the old all-parts choice [0]. Portable
// saved/share selections are explicit IDs and never pass through this migration.
export const BATTLE_HARMONY_SOURCE_SHA256 = 'cd460169b67dc0706a7e228e20cbfc58d6920e7148af286464ee26fb7baac9cb';

export function restoreBattleUpdateVoices(
  songId: string, sourceSha256: string | undefined, available: readonly string[],
  settings: Partial<ViewerUpdateSettings>,
): Partial<ViewerUpdateSettings> {
  if (songId !== 'hymn-aperio-battle-hymn' || sourceSha256 !== BATTLE_HARMONY_SOURCE_SHA256
    || available.join(',') !== '1,2,3,4' || settings.voiceSelection !== undefined
    || settings.visibleVoices?.length !== 1 || settings.visibleVoices[0] !== 0) return settings;
  return { ...settings, visibleVoices: [0, 1, 2, 3] };
}
