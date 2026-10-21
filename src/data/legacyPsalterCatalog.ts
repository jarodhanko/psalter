import type { LyricTranscriptLine, UnderlayTranscriptLine } from '../domain/lyricTranscript';
import { legacySyllabifiedProseWitnesses } from './legacySyllabifiedProse';
import { reconstructUnderlayTranscript } from '../domain/underlayIdentity';
import type { SongbookCatalogSong, SongbookEntry, SongbookSearchIndex, SongbookSong } from "../domain/songbook";
import { legacyPsalterMetadata } from "./generated/legacyPsalterMetadata";
import { legacyPsalterManifest } from "./generated/legacyPsalterManifest";
export { legacyPsalterManifest };

/** Searchable catalog metadata is eager; ABC notation is fetched only for the selected arrangement. */
export const legacyPsalterSongs: readonly SongbookCatalogSong[] = legacyPsalterMetadata;

export const legacyPsalterCatalog: readonly SongbookEntry[] = Array.from({ length: legacyPsalterManifest.canonicalCount }, (_, index) => {
  const number = index + 1;
  return { number, songs: legacyPsalterSongs.filter((song) => song.number === number) };
});

export const legacyPsalterById: Readonly<Record<string, SongbookCatalogSong>> = legacyPsalterSongs.reduce<Record<string, SongbookCatalogSong>>((index, song) => {
  index[song.id] = song;
  return index;
}, {});

const abcModules = import.meta.glob<{ default: string }>("./generated/abc/*.ts");
const isRightsOrFooter = (line: string): boolean =>
  /^(?:copyright\b|©|all rights reserved\b|used by\b|published by\b|renewal\b|owner\b|by permission of\b|words and music copyrighted\b|photo footer:.*copyright)/i.test(line.trim());
const containsRightsNotice = (line: string): boolean =>
  isRightsOrFooter(line) || /\b(?:copyrighted by|copyright|all rights reserved|used by permission|by permission of)\b/i.test(line);

/** Preserve printed permission/copyright notices separately from song lyrics. */
export const rightsNoticesFromAbc = (abc: string): readonly string[] => [...new Set(abc.split(/\r?\n/)
  .flatMap((line) => {
    const match = line.match(/^\s*[NW]:\s*(.*?)\s*$/);
    return match?.[1] && containsRightsNotice(match[1]) ? [match[1]] : [];
  }))];

/** Keep each row's source semantics through stanza precedence and reconstruction.
 * A lazy viewer may supply an already source-qualified special reconstruction;
 * keep those witnesses out of the eagerly loaded catalog bundle. */
export const lyricTranscriptFromAbc = (abc: string, songId?: string, reviewedUnderlay?: readonly string[]): readonly LyricTranscriptLine[] => {
  const legacyProse = new Set(legacySyllabifiedProseWitnesses(songId, abc));
  const underlayRow = (text: string): UnderlayTranscriptLine => ({ kind: 'underlay', text });
  const prose = (text: string): LyricTranscriptLine => legacyProse.has(text)
    ? { kind: 'underlay', text, legacyProse: true }
    : { kind: 'prose', text };
  const lines = abc.split(/\r?\n/);
  // Reconstruct only proven single-carrier stanza identities before applying
  // the existing precedence of full W: prose over note-aligned fragments.
  const underlay = reviewedUnderlay ?? reconstructUnderlayTranscript(abc) ?? lines.flatMap((line) => {
    const match = line.match(/^\s*w:\s*(.*?)\s*$/);
    return match?.[1] ? [match[1]] : [];
  });
  const stanzaLines = lines.flatMap((line) => {
    const match = line.match(/^\s*W:\s*(.*?)\s*$/);
    return match?.[1] ? [match[1]] : [];
  });

  // Bare numbers are stanza labels only when the source supplies a consecutive
  // sequence. Keep isolated numeric prose, years and meter lines as prose.
  const bareStanza = (line: string): RegExpMatchArray | null => {
    const match = line.match(/^([1-9]\d?)\s+((?:[~"'“‘(]\s*)*[A-Za-z].*)$/);
    const isDate = match && /^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?(?:\s+\d{2,4})?$/i.test(match[2]);
    return match && !isDate && !containsRightsNotice(line) ? match : null;
  };
  const bareStanzaNumbers = stanzaLines.flatMap((line) => {
    const match = bareStanza(line);
    return match ? [Number(match[1])] : [];
  });
  const hasBareStanzaSequence = bareStanzaNumbers.length > 1 &&
    bareStanzaNumbers.every((number, index) => index === 0 || number === bareStanzaNumbers[index - 1] + 1);

  // W: is prose, but one stanza can span several W: fields. Parse numbered
  // stanzas independently of chorus and rights blocks so those extra fields
  // cannot prevent otherwise complete stanzas from being joined.
  const proseBlocks: string[][] = [];
  let proseBlock: string[] = [];
  for (const line of lines) {
    const match = line.match(/^\s*W:\s*(.*?)\s*$/);
    if (!match) continue;
    if (!match[1]) {
      if (proseBlock.length) proseBlocks.push(proseBlock);
      proseBlock = [];
    } else proseBlock.push(match[1]);
  }
  if (proseBlock.length) proseBlocks.push(proseBlock);

  const numberedProse = new Map<number, { text: string; order: number }>();
  const unnumberedProse: { text: string; order: number }[] = [];
  let proseOrder = 0;
  for (const block of proseBlocks) {
    if (block.every((line) => /^\[[^\]]+\]$/.test(line.trim()))) continue;
    let stanzaNumber: number | undefined;
    let stanzaParts: string[] = [];
    const finishStanza = (): void => {
      if (stanzaNumber !== undefined && stanzaParts.length) {
        const text = `${stanzaNumber}. ${stanzaParts.join(" ")}`;
        // Prefer the later full prose record if an ABC source repeats a stanza.
        numberedProse.set(stanzaNumber, { text, order: proseOrder++ });
      }
      stanzaNumber = undefined;
      stanzaParts = [];
    };
    for (const line of block) {
      if (/^\[[^\]]+\]$/.test(line.trim())) {
        finishStanza();
        continue;
      }
      const numbered = line.match(/^(\d+)\.\s*(.*)$/) ??
        (hasBareStanzaSequence ? bareStanza(line) : null);
      if (numbered) {
        finishStanza();
        stanzaNumber = Number(numbered[1]);
        const text = numbered[2].replace(/^~\s*/, "").trim();
        if (text) stanzaParts.push(text);
      } else if (isRightsOrFooter(line) || (hasBareStanzaSequence && containsRightsNotice(line))) {
        finishStanza();
      } else if (stanzaNumber !== undefined) {
        stanzaParts.push(line.trim());
      } else if (line.trim()) {
        unnumberedProse.push({ text: line.trim(), order: proseOrder++ });
      }
    }
    finishStanza();
  }

  const numberedUnderlay = new Map<number, string>();
  for (const line of underlay) {
    const number = line.match(/^(\d+)\.\s*/)?.[1];
    if (number && !numberedUnderlay.has(Number(number))) numberedUnderlay.set(Number(number), line);
  }
  const orderedProse = [...numberedProse.entries()].sort((a, b) => a[1].order - b[1].order);
  const stanzaText = orderedProse.map(([, value]) => value.text);
  const extraText = unnumberedProse.sort((a, b) => a.order - b.order).map(({ text }) => text);
  const largestUnderlayRowGroup = lines.reduce((state, line) => {
    const current = /^\s*w:/.test(line) ? state.current + 1 : 0;
    return { current, largest: Math.max(state.largest, current) };
  }, { current: 0, largest: 0 }).largest;
  const firstNumberedUnderlayIndex = underlay.findIndex((line) => /^\d+\.\s*/.test(line));

  if (numberedProse.size > 0) {
    if (underlay.length > 0) {
      // Some tunes print later stanzas as W: addenda. Once those stanzas gain
      // note underlay, keep the earlier unnumbered rows but not their repeated
      // addendum fragments from each successive music system.
      if (firstNumberedUnderlayIndex > 0 &&
          Math.min(...numberedProse.keys()) === firstNumberedUnderlayIndex + 1 &&
          [...numberedUnderlay.keys()].every((number) => numberedProse.has(number))) {
        const earlierRows: string[] = [];
        let rowInGroup = 0;
        for (const line of lines) {
          const match = line.match(/^\s*w:\s*(.*?)\s*$/);
          if (match) {
            if (rowInGroup < firstNumberedUnderlayIndex && match[1]) earlierRows.push(match[1]);
            rowInGroup += 1;
          } else rowInGroup = 0;
        }
        return [...earlierRows.map(underlayRow), ...stanzaText.map(prose), ...extraText.map(prose)];
      }
      // A complete W: transcript wins over duplicated note-aligned text.
      if (numberedUnderlay.size > 0 &&
          [...numberedUnderlay.keys()].every((number) => numberedProse.has(number))) {
        return [...stanzaText, ...extraText].map(prose);
      }
      // Some scores split unnumbered w: rows across music systems but also
      // include complete, numbered W: stanzas. Those fragments are not extra
      // verses; one consecutive w: group shows how many stanzas were underlaid.
      if (numberedUnderlay.size === 0 && largestUnderlayRowGroup > 0 &&
          numberedProse.size >= largestUnderlayRowGroup &&
          [...numberedProse.keys()].sort((a, b) => a - b).every((number, index) => number === index + 1)) {
        return [...stanzaText, ...extraText].map(prose);
      }
      // Earlier underlay stanzas and later W: addenda coexist in some scores.
      // Preserve unnumbered/system-fragmented underlay, while replacing any
      // same-number underlay row with its complete W: stanza.
      const underlayIsOneRowPerStanza = numberedUnderlay.size === underlay.length;
      if (underlayIsOneRowPerStanza) {
        const merged = new Map<number, LyricTranscriptLine>([...numberedUnderlay].map(([number, text]) => [number, underlayRow(text)]));
        for (const [number, value] of numberedProse) merged.set(number, prose(value.text));
        return [...merged.entries()].sort((a, b) => a[0] - b[0]).map(([, row]) => row).concat(extraText.map(prose));
      }
      const earlierUnderlay = underlay.filter((line) => {
        const number = line.match(/^(\d+)\.\s*/)?.[1];
        return !number || !numberedProse.has(Number(number));
      });
      return [...earlierUnderlay.map(underlayRow), ...stanzaText.map(prose), ...extraText.map(prose)];
    }
    return [...stanzaText, ...extraText].map(prose);
  }

  if (underlay.length > 0) return underlay.map(underlayRow);
  // Some legacy entries only have unnumbered W: text, such as a chorus.
  return (extraText.length > 0 ? extraText : stanzaLines.filter((line) => !isRightsOrFooter(line))).map(prose);
};

/** Compatibility projection for consumers that inspect unformatted lyric text. */
export const lyricsFromAbc = (abc: string): readonly string[] => lyricTranscriptFromAbc(abc).map((line) => line.text);

/** Returns eager catalog metadata without fetching the notation chunk. */
export const getLegacyPsalterSong = (id: string): SongbookCatalogSong | undefined => legacyPsalterById[id];

/** Loads the full-text search index only after the visitor begins a search. */
export const loadLegacyPsalterSearchIndex = async (): Promise<SongbookSearchIndex> =>
  (await import("./generated/legacyPsalterSearchIndex")).legacyPsalterSearchIndex;

/** Loads the selected arrangement's ABC source from its own Vite chunk. */
export const loadLegacyPsalterSong = async (id: string): Promise<SongbookSong | undefined> => {
  const song = legacyPsalterById[id];
  const loadAbc = abcModules[`./generated/abc/${id}.ts`];
  if (!song || !loadAbc) return undefined;
  return (await import('./legacyPsalterSource')).loadLegacyPsalterSource(song, loadAbc);
};
