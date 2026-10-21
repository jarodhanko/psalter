import { builtInPsalter } from "./builtinPsalter";
import { builtInHymnbooks } from "./hymnbooks";
import { SongbookPackageValidationError, validateSongbookPackage, validateSongbookMoves } from "../domain/songbookPackage";
import type { SongbookPackage } from "../domain/songbookPackage";

/** The built-in package is the invariant fallback while downloadable packages are deferred. */
export const knownGoodBuiltInSongbook = validateSongbookPackage(builtInPsalter);

export interface SongbookActivation {
  songbook: SongbookPackage;
  usedFallback: boolean;
  error?: SongbookPackageValidationError;
}

export const activateSongbookPackage = (candidate: SongbookPackage | undefined): SongbookActivation => {
  if (!candidate) return { songbook: knownGoodBuiltInSongbook, usedFallback: false };
  try {
    return { songbook: validateSongbookPackage(candidate), usedFallback: false };
  } catch (error) {
    const validationError = error instanceof SongbookPackageValidationError
      ? error
      : new SongbookPackageValidationError("Songbook package could not be validated.");
    return { songbook: knownGoodBuiltInSongbook, usedFallback: true, error: validationError };
  }
};

/** Validated built-in catalogs; each edition and search index loads separately. */
export const installedSongbooks: readonly SongbookPackage[] = [knownGoodBuiltInSongbook, ...builtInHymnbooks];
validateSongbookMoves(installedSongbooks);

/** Resolve a route to an installed book, falling back to the built-in Psalter. */
export const getInstalledSongbook = (id?: string | null): SongbookPackage =>
  installedSongbooks.find((songbook) => songbook.id === id) ?? knownGoodBuiltInSongbook;

/** Default book used when a route has no valid book ID. */
export const selectedSongbook = knownGoodBuiltInSongbook;
