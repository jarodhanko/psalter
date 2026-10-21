import { loadSourceTimingContext } from '../timingWitnesses';
import type { SongbookCatalogSong, SongbookSong } from '../../domain/songbook';
import type { SongProvenance } from '../../domain/songProvenance';
import { hymnLyricTranscriptFromAbc } from './lyrics';

interface Membership extends Record<string, unknown> { book: string; catalog_id: string; source_id: string }
interface EditionPayload {
  sourceSha256: string;
  metadata: Pick<SongbookCatalogSong, 'id' | 'title' | 'composer' | 'tune' | 'voices' | 'voiceStructure'>;
  provenance: Omit<SongProvenance, 'catalogRecord'>;
  memberships: Membership[];
}
const notationModules = import.meta.glob<{ default: string }>('./notation/hymnAbc-*.ts');
const editionModules = import.meta.glob<{ default: EditionPayload }>('./editions/hymnEdition-*.json');

/** Load one verified edition without loading either book's other notation. */
export async function loadHymnEdition(song: SongbookCatalogSong, book: 'book1' | 'book2'): Promise<SongbookSong | undefined> {
  if (!song.sourceEditionId) return undefined;
  const loadAbc = notationModules[`./notation/hymnAbc-${song.sourceEditionId}.ts`];
  const loadEdition = editionModules[`./editions/hymnEdition-${song.sourceEditionId}.json`];
  if (!loadAbc || !loadEdition) return undefined;
  const [{ default: abc }, { default: edition }, sourceTimingContext] = await Promise.all([loadAbc(), loadEdition(), loadSourceTimingContext(song.id)]);
  const catalogRecord = edition.memberships.find(row => row.book === book && row.catalog_id === song.catalogId);
  if (!catalogRecord) throw new Error(`Hymn edition is missing its catalog membership: ${song.catalogId}`);
  const provenance: SongProvenance = { ...edition.provenance, catalogRecord };
  const lyricTranscript = hymnLyricTranscriptFromAbc(abc);
  return {
    ...song,
    ...edition.metadata,
    abc,
    sourceSha256: edition.sourceSha256,
    sourceTimingContext,
    lyricTranscript,
    lyrics: lyricTranscript.map(line => line.text),
    provenance,
    // Attribution, conversion statement and territory limits must travel to
    // print/export, not disappear inside a collapsed source-details panel.
    rightsNotices: [...new Set([
      ...provenance.credits,
      ...provenance.rights,
      provenance.territory,
      ...provenance.changes,
      ...provenance.licenseUrls,
    ])],
  };
}
