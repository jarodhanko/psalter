import type { FermataAudioScope } from './fermataAudioScope';

const song = 'hymn-oh_a-mighty-fortress-is-our-god-ein-feste-burg-isorhythmic';
type Witness = readonly [number, bigint];
// Canonical SHA-256 ad1c619c0ec3ee053d04096af771fb9847675809b7f72bec6ea286e4bf1da8ab.
// The second witness removes only its initial tempo and imported piano programs.
const canonical: Witness = [4355, 0x7c53276f66e23f7bn];
const playback: Witness = [4228, 0xb042ba8b94a5fc13n];
const fail = (): never => { throw new Error('Unable to preserve A Mighty Fortress Is Our God timing during playback.'); };
const matches = (text: string, [length, expected]: Witness): boolean => {
  if (text.length !== length) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < text.length; index++)
    hash = BigInt.asUintN(64, (hash ^ BigInt(text.charCodeAt(index))) * 1099511628211n);
  return hash === expected;
};

/** ABCJS treats this opening inline tempo as a change after the user's QPM,
 * defeating the tempo control. Keep the printed source intact; omit only this
 * verified opening directive in the separately parsed playback copy. */
export function prepareMightyFortressAudioSource(songId: string, abc: string): string {
  if (songId !== song) return abc;
  if (!matches(abc, canonical)) return fail();
  return abc.replace('[Q:1/4=110]', '');
}

/** The source has nine quarter-note holds shared by SATB. Its soprano and
 * tenor marks identify the same releases, including when either is muted.
 * Use the existing two-beat policy without expanding the Psalter inventory. */
export function getMightyFortressFermataScope(songId: string, abc: string): FermataAudioScope | undefined {
  if (songId !== song) return undefined;
  if (!matches(abc, playback)) return fail();
  return {
    voices: 'S1V1,S1V2,S2V1,S2V2', notes: 270, attacks: 270, tracks: 4, duration: 16, releases: 9,
    marks: 'S1V1@15:1:0.25;S1V1@23:1:0.25;S1V1@31:1:0.25;S1V1@37:1:0.25;S1V1@43:1:0.25;S1V1@49:1:0.25;S1V1@55:1:0.25;S1V1@63:1:0.25;S1V1@7:1:0.25;S2V1@15:1:0.25;S2V1@23:1:0.25;S2V1@31:1:0.25;S2V1@37:1:0.25;S2V1@43:1:0.25;S2V1@49:1:0.25;S2V1@55:1:0.25;S2V1@63:1:0.25;S2V1@7:1:0.25',
  };
}
