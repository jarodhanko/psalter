import { sourceTempoPolicy } from '../viewer/sourceTempoPolicy';
import abcjs from 'abcjs';
import type { EditorialStanzaUnderlayInfo } from '../../domain/editorialStanzaUnderlay';
import type { PublishedStanzaVariantInfo } from '../../domain/publishedStanzaVariant';
import type { SongbookSong } from '../../domain/songbook';
import type { SongbookPackage } from '../../domain/songbookPackage';
import { instruments } from '../viewer/instruments';
import type { Instrument } from '../viewer/instruments';
import { materializeAbcTranspose } from './transposeAbc';
import { addLearnerAccidentals } from '../viewer/learnerAccidentals';

export interface AbcExport {
  filename: string;
  content: string;
  mimeType: 'text/vnd.abc;charset=utf-8';
}

/** Produced by the screen's preparation pipeline, before SVG-only engraving. */
export interface PreparedScreenAbc {
  sourceAbc: string;
  /** Selected source notes before display-only lyric/notation projections. */
  referenceAbc: string;
  songId?: string;
  transpose: number;
  learnerAccidentals: boolean;
  stanzasPerGroup: number;
  visibleVoiceIndexes: readonly number[];
  engravingTranspose: number;
  musicOnly: boolean;
  unsupportedReason?: string;
  showOriginalLyrics?: boolean;
  lyricSourceAbc?: string;
  hiddenStanzaNumbers?: readonly number[];
  editorialUnderlay?: EditorialStanzaUnderlayInfo;
  publishedVariant?: PublishedStanzaVariantInfo;
  groups: readonly { abc: string; stanzaNumbers: readonly number[] }[];
}

export interface CurrentAbcSettings {
  transpose: number;
  learnerAccidentals: boolean;
  stanzasPerGroup: number;
  visibleVoiceIndexes: readonly number[];
  tempo: number;
  instrument: Instrument;
  chordsOff?: boolean;
  showOriginalLyrics?: boolean;
}

type ExportSong = SongbookSong & {
  catalogId?: string;
  sourceEditionId?: string;
  provenance?: unknown;
};
type ExportSongbook = Pick<SongbookPackage, 'id' | 'displayName' | 'manifest'>;

/** Add only the mandatory tune reference when a corpus source intentionally omits it. */
export function withAbcReference(source: string): string {
  if (!source.trim()) throw new Error('Select a part to export its notation.');
  if (/^X\s*:/m.test(source)) return source;
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const bomLength = source.startsWith('\uFEFF') ? 1 : 0;
  const firstField = /^[A-Za-z+]:/m.exec(source.slice(bomLength));
  if (firstField) {
    const at = bomLength + firstField.index;
    return `${source.slice(0, at)}X:1${newline}${source.slice(at)}`;
  }
  const signature = /^(?:\uFEFF)?%abc[^\r\n]*(?:\r\n|\n|\r|$)/.exec(source)?.[0];
  if (signature) return `${signature}${/[\r\n]$/.test(signature) ? '' : newline}X:1${newline}${source.slice(signature.length)}`;
  return `${source.slice(0, bomLength)}X:1${newline}${source.slice(bomLength)}`;
}

const safeFilenamePart = (value: string): string => value.normalize('NFKD').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100) || 'song';
const asComments = (text: string): string => text.split(/\r\n|\n|\r/).map(line => `% ${line}`).join('\n');
const oneLine = (text: string): string => text.replace(/[\r\n]+/g, ' ');

export function isCurrentScreenAbc(song: ExportSong, prepared: PreparedScreenAbc | undefined, settings: CurrentAbcSettings): prepared is PreparedScreenAbc {
  return !!prepared && prepared.sourceAbc === song.abc && prepared.songId === song.id &&
    prepared.transpose === settings.transpose && prepared.learnerAccidentals === settings.learnerAccidentals &&
    prepared.stanzasPerGroup === settings.stanzasPerGroup &&
    prepared.showOriginalLyrics === settings.showOriginalLyrics &&
    prepared.visibleVoiceIndexes.join(',') === settings.visibleVoiceIndexes.join(',');
}

/** Tied lyric anchors and hidden rests must not change sounding note events.
 * Ignore notation offsets and instrument samples; those are not musical data.
 */
function soundingMusic(source: string, chordsOff = false): string {
  const tunes = abcjs.parseOnly(source);
  if (tunes.length !== 1) throw new Error('This view cannot yet be exported as a single portable ABC tune.');
  const audio = tunes[0].setUpAudio({ qpm: 100, chordsOff });
  const round = (value: number) => {
    if (!Number.isFinite(value)) throw new Error('This view contains unsupported ABC timing.');
    return Math.round(value * 1e6) / 1e6;
  };
  return JSON.stringify([round(audio.totalDuration), audio.tracks.map(track => track
    .filter((event): event is abcjs.AudioTrackNoteItem => event.cmd === 'note')
    .map(event => [round(event.pitch), round(event.start), round(event.duration)])
    .sort((a, b) => a[1] - b[1] || a[0] - b[0] || a[2] - b[2]))]);
}

/** Export the exact screen-prepared music, materializing only portable settings. */
export function createCurrentAbcExport(song: ExportSong, prepared: PreparedScreenAbc | undefined, settings: CurrentAbcSettings, songbook?: ExportSongbook): AbcExport {
  if (!isCurrentScreenAbc(song, prepared, settings)) throw new Error('The current score is still being prepared. Please try again.');
  if (prepared.unsupportedReason) throw new Error(prepared.unsupportedReason);
  if (!settings.visibleVoiceIndexes.length || !prepared.groups.length) throw new Error('Select a part to export its notation.');
  if (!Number.isFinite(settings.tempo) || settings.tempo <= 0) throw new Error('Choose a valid tempo before exporting.');
  const instrument = instruments[settings.instrument];
  // CreateSynth uses this score's natural meter beat for its qpm override.
  // Exact source policies may preserve a different user-facing beat unit.
  // Without a policy, 2/2 remains half-note and 6/8 dotted-quarter as before.
  const playbackTune = abcjs.parseOnly(song.abc)[0];
  const beatLength = sourceTempoPolicy(song)?.abcBeatLength ?? playbackTune?.getBeatLength();
  const denominator = [1, 2, 4, 8, 16, 32, 64].find(value => beatLength > 0 && Number.isInteger(beatLength * value));
  if (!denominator) throw new Error('This score’s playback beat cannot yet be exported reliably.');
  const beatUnit = `${beatLength * denominator}/${denominator}`;
  const sourceMusic = soundingMusic(prepared.referenceAbc, settings.chordsOff);
  const tunes = prepared.groups.map((group, index) => {
    if (soundingMusic(group.abc, settings.chordsOff) !== sourceMusic) throw new Error('This view’s special note or lyric layout cannot yet be preserved in a portable ABC file. No file was downloaded.');
    // Music-only is applied after source-bound guards, matching the renderer's
    // afterParsing lyric removal without touching canonical source or playback.
    const notation = prepared.musicOnly ? group.abc.replace(/^\s*w:[^\r\n]*(?:\r?\n|$)/gm, '') : group.abc;
    let current = materializeAbcTranspose(withAbcReference(notation), prepared.engravingTranspose);
    if (settings.learnerAccidentals) current = addLearnerAccidentals(current);
    const verses = group.stanzaNumbers.length ? ` (verses ${group.stanzaNumbers.join(', ')})` : '';
    const title = oneLine(`${song.title || `Song ${song.number}`}${verses}`);
    // The playback override replaces the initial tempo. Keep any later written
    // tempo changes, which ABCJS also honors while playing with a qpm override.
    const keyAt = current.search(/^[ \t]*K:/m);
    if (keyAt < 0) throw new Error('This score has no portable ABC key header.');
    current = current.slice(0, keyAt).replace(/^[ \t]*Q:[^\r\n]*(?:\r?\n|$)/gm, '') + current.slice(keyAt);
    current = current.replace(/^[ \t]*(?:%%MIDI|I:\s*MIDI)\s+program\b[^\r\n]*(?:\r?\n|$)/gm, '')
      .replace(/\[I:\s*MIDI\s+program\b[^\]\r\n]*\]/g, '')
      .replace(/^X\s*:[^\r\n]*/m, `X:${index + 1}\nT:${title}\nQ:${beatUnit}=${settings.tempo}\n%%MIDI program ${instrument.program}`);
    if (settings.chordsOff) {
      current = current.replace(/^[ \t]*(?:%%MIDI|I:\s*MIDI)\s+gchord(?:on|off)?\b[^\r\n]*(?:\r?\n|$)/gm, '')
        .replace(/\[I:\s*MIDI\s+gchord(?:on|off)?\b[^\]\r\n]*\]/g, '')
        .replace(/^X:[^\n]*\n/m, value => `${value}%%MIDI gchordoff\n%%MIDI gchord z\n`);
    }
    // A prepared screen group must remain one complete tune, never reveal a
    // second section that the viewer's ABC parser stopped at a blank line.
    current = current.trim().replace(/\r\n/g, '\n');
    if (/\n[ \t]*\n/.test(current)) throw new Error('This view contains a tune boundary that cannot yet be exported reliably.');
    const parsed = abcjs.parseOnly(current);
    if (parsed.length !== 1 || !parsed[0].lines.some(line => line.staff?.some(staff => staff.voices?.some(voice => voice.some(event => event.el_type === 'note'))))) {
      throw new Error('This score could not be exported as valid ABC. Its source has not been changed.');
    }
    return current;
  });
  // Unabridged provenance can contain embedded lyric transcripts. Current
  // filtered exports carry attribution and rights, while the unchanged source
  // record remains available with the explicitly original edition.
  const provenance = song.provenance && prepared.showOriginalLyrics === false ? {
    sourceId: song.provenance.sourceId, sourceUrls: song.provenance.sourceUrls,
    collection: song.provenance.collection, credits: song.provenance.credits,
    licenseUrls: song.provenance.licenseUrls, rights: song.provenance.rights,
    territory: song.provenance.territory, editionNotes: song.provenance.editionNotes,
    changes: song.provenance.changes,
  } : song.provenance;
  const metadata = {
    export: 'Current screen-prepared ABC. Each displayed verse group is a separate numbered tune.',
    limitations: [
      'Responsive line breaks, zoom, notehead sizing, shared-note/rest engraving, and other SVG-only presentation are not portable ABC.',
      'The instrument is a General MIDI program; exact sound samples and playback-only accompaniment are not embedded.',
      'Written durations and fermata marks are retained. External players may interpret fermata holds differently.',
      'Source text-only lyrics and credits removed from the notation canvas are retained in sourceTextFields below.',
    ],
    settings: {
      transpose: settings.transpose, learnerAccidentals: settings.learnerAccidentals,
      stanzasPerGroup: settings.stanzasPerGroup, musicOnly: prepared.musicOnly,
      ...(prepared.showOriginalLyrics !== undefined ? { showOriginalLyrics: prepared.showOriginalLyrics, hiddenStanzaNumbers: prepared.hiddenStanzaNumbers } : {}),
      visibleVoiceIds: settings.visibleVoiceIndexes.map(index => song.voices[index]?.id),
      verseGroups: prepared.groups.map(group => group.stanzaNumbers),
      tempo: { beatsPerMinute: settings.tempo, beatUnit },
      ...(settings.chordsOff ? { chordSymbolPlayback: false } : {}),
      instrument: { id: settings.instrument, label: instrument.label, generalMidiProgram: instrument.program },
    },
    ...(songbook ? { songbook: { id: songbook.id, title: songbook.displayName, manifest: songbook.manifest } } : {}),
    song: {
      id: song.id, number: song.number, variant: song.variant, title: song.title,
      composer: song.composer, tune: song.tune, note: song.note, reference: song.reference,
      catalogId: song.catalogId, sourceEditionId: song.sourceEditionId, sourceSha256: song.sourceSha256,
    },
    ...(prepared.editorialUnderlay ? { editorialUnderlay: prepared.editorialUnderlay } : {}),
    ...(prepared.publishedVariant ? { publishedVariant: prepared.publishedVariant,
      sourceEditionScope: 'The song and provenance fields describe the retained Open Hymnal source setting. Verse 4 words use the separately credited published variant.' } : {}),
    sourceTextFields: (prepared.lyricSourceAbc ?? song.abc).split(/\r?\n/).filter(line => /^[ \t]*[TCRSONW]:/.test(line)),
    rightsNotices: song.rightsNotices ?? [],
    ...(provenance !== undefined ? { provenance } : {}),
  };
  const appendix = asComments(`Psalter Project current ABC export metadata\n${JSON.stringify(metadata, null, 2)}`);
  return {
    filename: `${safeFilenamePart(songbook?.id ?? 'songbook')}-${song.number}-${safeFilenamePart(song.id)}-current.abc`,
    content: `${tunes.join('\n\n')}\n\n${appendix}\n`,
    mimeType: 'text/vnd.abc;charset=utf-8',
  };
}

/** Trigger a local download; keep it inside the click gesture. */
export function downloadCurrentAbc(song: ExportSong, prepared: PreparedScreenAbc | undefined, settings: CurrentAbcSettings, songbook?: ExportSongbook): void {
  const file = createCurrentAbcExport(song, prepared, settings, songbook);
  const url = URL.createObjectURL(new Blob([file.content], { type: file.mimeType }));
  const link = document.createElement('a');
  link.href = url;
  link.download = file.filename;
  try {
    document.body.appendChild(link);
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

/** An explicit source download always preserves the historical source bytes. */
export function createOriginalAbcExport(song: ExportSong, songbook?: ExportSongbook): AbcExport {
  return { filename: `${safeFilenamePart(songbook?.id ?? 'songbook')}-${song.number}-${safeFilenamePart(song.id)}-original.abc`,
    content: song.abc, mimeType: 'text/vnd.abc;charset=utf-8' };
}
export function downloadOriginalAbc(song: ExportSong, songbook?: ExportSongbook): void {
  const file = createOriginalAbcExport(song, songbook);
  const url = URL.createObjectURL(new Blob([file.content], { type: file.mimeType }));
  const link = document.createElement('a'); link.href = url; link.download = file.filename;
  try { document.body.appendChild(link); link.click(); }
  finally { link.remove(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
