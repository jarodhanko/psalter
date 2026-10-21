import type { SongbookCatalogSong, SongbookEntry, SongbookSearchIndex, SongbookSong } from "./songbook";

/** Version of the browser-facing songbook package contract. */
export const songbookPackageSchemaVersion = 1;

export interface SongbookPackageManifest {
  packageId: string;
  schemaVersion: number;
  corpusVersion: string;
  releaseVersion: string;
  canonicalCount: number;
  arrangementCount: number;
  canonicalAbcSha256: string;
  generatedArtifactsSha256: string;
}

export interface SongbookPackage {
  /** Stable identifier used by future installed/downloaded package records. */
  readonly id: string;
  readonly displayName: string;
  readonly shortName: string;
  /** Optional owner-selected playlist for this installed book. */
  readonly playlistUrl?: string;
  readonly manifest: SongbookPackageManifest;
  readonly catalog: readonly SongbookEntry[];
  readonly songs: readonly SongbookCatalogSong[];
  /** Archived memberships that now open the same edition in another book. */
  readonly movedSongs?: readonly SongbookMembershipMove[];
  readonly range: Readonly<{ first: number; last: number }>;
  getEntry(number: number): SongbookEntry | undefined;
  clampNumber(number: number): number;
  select(number: number, requestedId?: string | null): SongbookCatalogSong | undefined;
  loadSong(id: string): Promise<SongbookSong | undefined>;
  loadSearchIndex(): Promise<SongbookSearchIndex>;
}

export interface SongbookMembershipMove {
  readonly songId: string;
  readonly number: number;
  readonly catalogId: string;
  readonly destination: Readonly<{ bookId: string; number: number; catalogId: string }>;
}

export interface ResolvedSongbookSong {
  songbook: SongbookPackage;
  song: SongbookCatalogSong;
  notice?: string;
}

/** Browsing is a projection; archived numbers, source manifests and links stay intact. */
export const listedSongbookSongs = (songbook: SongbookPackage): readonly SongbookCatalogSong[] =>
  songbook.movedSongs?.length ? songbook.songs.filter(song => !songbook.movedSongs!.some(move => move.songId === song.id)) : songbook.songs;

/** Resolve only an exact witnessed membership to the same retained source edition. */
export function resolveSongbookSong(songbook: SongbookPackage, song: SongbookCatalogSong,
  songbooks: readonly SongbookPackage[]): ResolvedSongbookSong | undefined {
  const move = songbook.movedSongs?.find(candidate => candidate.songId === song.id && candidate.number === song.number);
  if (!move) return { songbook, song };
  const destination = songbooks.find(book => book.id === move.destination.bookId);
  const retained = destination?.getEntry(move.destination.number)?.songs.find(candidate => candidate.id === song.id
    && candidate.catalogId === move.destination.catalogId && candidate.sourceEditionId === song.sourceEditionId);
  if (!destination || !retained || destination.movedSongs?.some(candidate => candidate.songId === retained.id)) return undefined;
  return { songbook: destination, song: retained,
    notice: `Moved from ${songbook.shortName}. This hymn is now in ${destination.shortName}.` };
}

/** A missing or changed destination must fail activation, never silently change tunes. */
export function validateSongbookMoves(songbooks: readonly SongbookPackage[]): void {
  for (const book of songbooks) for (const move of book.movedSongs ?? []) {
    const song = book.songs.find(candidate => candidate.id === move.songId);
    if (!song || !resolveSongbookSong(book, song, songbooks)) throw new SongbookPackageValidationError('Moved song destination does not match its source edition.');
  }
}

export class SongbookPackageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SongbookPackageValidationError";
  }
}

const isDigest = (value: string) => /^[a-f0-9]{64}$/.test(value);
const isPositiveInteger = (value: number) => Number.isInteger(value) && value > 0;

/** Validates all eager data before a package is allowed to drive the viewer. */
export const validateSongbookPackage = (songbook: SongbookPackage): SongbookPackage => {
  const { manifest, catalog, songs, range } = songbook;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(songbook.id)) throw new SongbookPackageValidationError("Songbook package id is invalid.");
  if (manifest.packageId !== songbook.id) throw new SongbookPackageValidationError("Songbook package id does not match its manifest.");
  if (manifest.schemaVersion !== songbookPackageSchemaVersion) throw new SongbookPackageValidationError("Songbook package schema is not supported.");
  if (!isPositiveInteger(manifest.canonicalCount) || !isPositiveInteger(manifest.arrangementCount) || manifest.arrangementCount < manifest.canonicalCount) {
    throw new SongbookPackageValidationError("Songbook manifest counts are invalid.");
  }
  if (!isDigest(manifest.canonicalAbcSha256) || !isDigest(manifest.generatedArtifactsSha256)) throw new SongbookPackageValidationError("Songbook manifest digests are invalid.");
  if (range.first !== 1 || range.last !== manifest.canonicalCount || catalog.length !== manifest.canonicalCount) {
    throw new SongbookPackageValidationError("Songbook catalog does not match the manifest's canonical range.");
  }
  if (songs.length !== manifest.arrangementCount) throw new SongbookPackageValidationError("Songbook arrangement count does not match its manifest.");

  const songIds = new Set<string>();
  for (const song of songs) {
    if (!song.id || songIds.has(song.id) || !Number.isInteger(song.number) || song.number < range.first || song.number > range.last) {
      throw new SongbookPackageValidationError("Songbook catalog contains an invalid or duplicate song.");
    }
    songIds.add(song.id);
  }

  const catalogSongOccurrences = new Map<string, number>();
  for (let index = 0; index < catalog.length; index += 1) {
    const entry = catalog[index];
    const expectedNumber = range.first + index;
    if (entry.number !== expectedNumber || entry.songs.length === 0 || entry.songs.some((song) => song.number !== expectedNumber || !songIds.has(song.id))) {
      throw new SongbookPackageValidationError("Songbook entries do not match the catalog range.");
    }
    if (!entry.songs.some((song) => song.variant === "")) throw new SongbookPackageValidationError("Songbook entry has no primary setting.");
    for (const song of entry.songs) {
      catalogSongOccurrences.set(song.id, (catalogSongOccurrences.get(song.id) ?? 0) + 1);
    }
  }
  if (catalogSongOccurrences.size !== songIds.size || [...songIds].some((id) => catalogSongOccurrences.get(id) !== 1)) {
    throw new SongbookPackageValidationError("Songbook catalog songs must appear exactly once.");
  }
  const movedIds = new Set<string>();
  for (const move of songbook.movedSongs ?? []) {
    const source = songs.find(song => song.id === move.songId && song.number === move.number && song.catalogId === move.catalogId);
    if (!source?.sourceEditionId || movedIds.has(move.songId) || move.destination.bookId === songbook.id
      || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(move.destination.bookId) || !isPositiveInteger(move.destination.number) || !move.destination.catalogId) {
      throw new SongbookPackageValidationError('Moved song does not match an archived membership.');
    }
    movedIds.add(move.songId);
  }
  return songbook;
};
