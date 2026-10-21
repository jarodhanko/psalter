import {
  legacyPsalterCatalog,
  legacyPsalterManifest,
  legacyPsalterSongs,
  loadLegacyPsalterSearchIndex,
  loadLegacyPsalterSong,
} from "../data/legacyPsalterCatalog";
import type { SongbookPackage } from "../domain/songbookPackage";

/** The shipped, local-first package. ABC remains in its existing lazy chunks. */
export const builtInPsalter: SongbookPackage = {
  id: "psalter-1912",
  displayName: "The Psalter",
  shortName: "Psalter",
  manifest: legacyPsalterManifest,
  catalog: legacyPsalterCatalog,
  songs: legacyPsalterSongs,
  range: { first: 1, last: legacyPsalterManifest.canonicalCount },
  getEntry: (number) => legacyPsalterCatalog[number - 1],
  clampNumber: (number) => Math.min(legacyPsalterManifest.canonicalCount, Math.max(1, number)),
  select: (number, requestedId) => {
    const entry = legacyPsalterCatalog[Math.min(legacyPsalterManifest.canonicalCount, Math.max(1, number)) - 1];
    return entry?.songs.find((song) => song.id === requestedId) ?? entry?.songs[0];
  },
  loadSong: loadLegacyPsalterSong,
  loadSearchIndex: loadLegacyPsalterSearchIndex,
};
