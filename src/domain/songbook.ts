import type { SourceTimingContext } from '../data/timingWitnesses';
import type { LyricTranscriptLine } from './lyricTranscript';
import type { SongProvenance } from './songProvenance';

/** A small, UI-independent representation of an ABC tune in a songbook. */
export interface SongVoice {
  /** ABC voice identifier, e.g. `S` or `T12`. */
  id: string;
  clef?: string;
  name?: string;
  /** Original staff label, retained even when it names combined parts. */
  sourceName?: string;
  /** A chordal staff or supplemental source layer is not an isolated SATB part. */
  kind?: "independent" | "chordal" | "supplemental";
}

export interface SongMetadata {
  title?: string;
  composer?: string;
  tune?: string;
  note?: string;
  /** The source line containing a Psalm and (usually) its meter. */
  reference?: string;
  psalmNumber?: number;
  meter?: string;
  lyrics: readonly string[];
  voices: readonly SongVoice[];
  /** Lowercase, whitespace-normalized text suitable for simple corpus search. */
  searchText: string;
}

/** Metadata needed for search, navigation, and the score heading before notation loads. */
export interface SongbookCatalogSong extends Omit<SongMetadata, "lyrics" | "searchText"> {
  /** Stable edition identifier; legacy Psalter IDs match the source export name. */
  id: string;
  number: number;
  /** Empty for the principal setting and non-empty for an alternate setting. */
  variant: string;
  /** Original catalog identity, distinct from a generated display number. */
  catalogId?: string;
  sourceEditionId?: string;
  voiceStructure?: "melody" | "independent-parts" | "chordal-staves" | "mixed-parts";
}

/** A catalog song with its notation source loaded for viewing or playback. */
export interface SongbookSong extends SongbookCatalogSong {
  abc: string;
  /** Loaded independent timing evidence; null explicitly means this edition has no policy. */
  sourceTimingContext?: SourceTimingContext | null;
  /** Per-edition credits, source links, rights assertions and territory limits. */
  provenance?: SongProvenance;
  /** Native SHA-256 of this loaded ABC, used only by conservative update migration. */
  sourceSha256?: string;
  /** Legacy raw lyric strings, interpreted as underlay when no typed transcript is supplied. */
  lyrics: readonly string[];
  /** Source-tagged transcript rows. New loaders should always supply this field. */
  lyricTranscript?: readonly LyricTranscriptLine[];
  /** Printed source permission/copyright lines, kept separate from singable text. */
  rightsNotices?: readonly string[];
  /** Present only when the optional full-text index has been loaded. */
  searchText?: string;
}

/** On-demand normalized text used to search catalog entries by their stable IDs. */
export type SongbookSearchIndex = Readonly<Record<string, string>>;

export interface SongbookEntry {
  number: number;
  songs: readonly SongbookCatalogSong[];
}
