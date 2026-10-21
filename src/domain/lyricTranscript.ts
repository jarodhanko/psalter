/** Plain W: prose and syllabified lyrics have different punctuation semantics. */
export interface ProseTranscriptLine {
  readonly kind: 'prose';
  readonly text: string;
}

export interface UnderlayTranscriptLine {
  readonly kind: 'underlay';
  readonly text: string;
  /** Present only for exact, source-guarded legacy syllabified W: rows. */
  readonly legacyProse?: true;
}

export type LyricTranscriptLine = ProseTranscriptLine | UnderlayTranscriptLine;

/** W: text is already prose. Its punctuation is literal, not ABC underlay. */
export const formatProseTranscriptLine = (line: ProseTranscriptLine): string => line.text;

/** Normalize w: underlay and explicitly witnessed legacy syllabified W: rows. */
export const formatUnderlayTranscriptLine = (line: UnderlayTranscriptLine): string => line.text
  .replace(/\\-/g, '\u0000')
  // Join syllables across ABC melisma/skip tokens before removing those tokens.
  .replace(/-\s*(?:[_*|]\s*)*/g, '')
  .replace(/[~_*|]/g, ' ')
  .replace(/\u0000/g, '-')
  .replace(/\s+/g, ' ')
  .trim();

export const formatLyricTranscriptLine = (line: LyricTranscriptLine): string => line.kind === 'prose'
  ? formatProseTranscriptLine(line)
  : formatUnderlayTranscriptLine(line);

/** Prose stanza labels may be printed without a following space (for example
 * W:19.With). Underlay keeps its stricter syllable-boundary convention. */
export function lyricTranscriptStanzaNumber(line: LyricTranscriptLine): number | undefined {
  const match = (line.kind === 'prose' ? /^\s*(\d+)\./ : /^\s*(\d+)\.(?:\s|~)/).exec(line.text);
  const number = match ? Number(match[1]) : 0;
  return Number.isInteger(number) && number > 0 && number <= 1000 ? number : undefined;
}
