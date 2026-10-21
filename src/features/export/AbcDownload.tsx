import { useEffect, useState } from 'react';
import type { SongbookSong } from '../../domain/songbook';
import type { SongbookPackage } from '../../domain/songbookPackage';
import { downloadCurrentAbc, downloadOriginalAbc, isCurrentScreenAbc } from './abcExport';
import type { CurrentAbcSettings, PreparedScreenAbc } from './abcExport';

/** Load the exporter before its button appears, keeping the download in the click gesture. */
export function AbcDownload({ song, songbook, prepared, settings }: {
  song: SongbookSong;
  songbook?: SongbookPackage;
  prepared?: PreparedScreenAbc;
  settings: CurrentAbcSettings;
}) {
  const [error, setError] = useState('');
  const current = isCurrentScreenAbc(song, prepared, settings);
  useEffect(() => { setError(''); }, [prepared, settings.transpose, settings.learnerAccidentals, settings.stanzasPerGroup, settings.visibleVoiceIndexes.join(','), settings.tempo, settings.instrument, settings.chordsOff, settings.showOriginalLyrics]);
  return <>
    <p>Includes the displayed parts, key, verse grouping or music-only setting, tempo, and source credits. Verse groups become separate tunes in one ABC file.</p>
    <p>Screen spacing and special notehead or shared-rest engraving may look different elsewhere. The instrument uses its General MIDI equivalent, without the app’s sound samples. Fermata playback may differ between players.</p>
    <button type="button" disabled={!current || !settings.visibleVoiceIndexes.length || !!prepared?.unsupportedReason} onClick={() => {
      setError('');
      try { downloadCurrentAbc(song, prepared, settings, songbook); }
      catch (reason) { setError(reason instanceof Error ? reason.message : 'This browser could not download the ABC file. Please try again.'); }
    }}>Download current ABC file</button>
    {(settings.showOriginalLyrics !== undefined || prepared?.editorialUnderlay || prepared?.publishedVariant) && <details className="original-abc-download">
      <summary>Full original source</summary>
      <p>This download includes every original verse, including verses hidden or replaced in the current view. Current display settings and published verse variants are not applied.</p>
      <button type="button" onClick={() => {
        setError('');
        try { downloadOriginalAbc(song, songbook); }
        catch { setError('This browser could not download the original source. Please try again.'); }
      }}>Download full original ABC</button>
    </details>}
    {!settings.visibleVoiceIndexes.length && <p>Select a part to export its notation.</p>}
    {prepared?.unsupportedReason && <p role="status">{prepared.unsupportedReason}</p>}
    {error && <p role="alert">{error}</p>}
  </>;
}
