/** Exact-edition attribution and limitations, loaded together with notation. */
export interface SongProvenance {
  sourceId: string;
  sourceUrls: readonly string[];
  collection: string;
  credits: readonly string[];
  licenseUrls: readonly string[];
  rights: readonly string[];
  territory: string;
  editionNotes: readonly string[];
  changes: readonly string[];
  /** Unabridged selected-edition evidence; assertions are not new legal clearance. */
  record: Readonly<Record<string, unknown>>;
  /** Unabridged original catalog membership, including original ID and caveats. */
  catalogRecord: Readonly<Record<string, unknown>>;
}
