import type { LyricTranscriptLine } from '../../domain/lyricTranscript';
import { formatLyricTranscriptLine } from '../../domain/lyricTranscript';

interface LyricBlock { voiceId: string; rows: string[] }
export interface HymnLyricSource {
  voiceId: string;
  /** The exact source underlay rows for this carrier, in music order. */
  rows: readonly string[];
  /** Reconstructed only across equally sized, consecutively ordered row groups. */
  transcript: readonly LyricTranscriptLine[];
}

/** Preserve source carrier identity, shared refrain blocks and later W: stanzas.
 * No missing verses or SATB text are synthesized. Unlike the Psalter importer,
 * this accepts whitespace after V: and never applies Psalter-specific witnesses. */
export function hymnLyricSourcesFromAbc(abc: string): readonly HymnLyricSource[] {
  const blocks: LyricBlock[] = [];
  let voiceId = 'default';
  let rows: string[] = [];
  const finish = () => {
    if (rows.length) blocks.push({ voiceId, rows });
    rows = [];
  };
  for (const line of abc.split(/\r?\n/)) {
    const lyric = /^\s*w:\s*(.*?)\s*$/.exec(line);
    if (lyric) {
      if (lyric[1]) rows.push(lyric[1]); else finish();
      continue;
    }
    // Comments between underlay rows do not change their ordinal positions.
    if (/^\s*%(?!%)/.test(line)) continue;
    finish();
    const voice = /^\s*(?:V:\s*([^\s]+)|\[V:\s*([^\]\s]+))/.exec(line);
    if (voice) voiceId = voice[1] ?? voice[2];
  }
  finish();
  const carriers = [...new Set(blocks.map(block => block.voiceId))];
  return carriers.map(carrier => {
    const source = blocks.filter(block => block.voiceId === carrier);
    const transcript: LyricTranscriptLine[] = [];
    let section: string[][] = [];
    const flush = () => {
      if (!section.length) return;
      for (let row = 0; row < section[0].length; row += 1) {
        // The first row keeps any printed stanza number; continuation rows
        // carry the source's literal hyphens and melismas through formatting.
        transcript.push({ kind: 'underlay', text: section.map(block => block[row]).join(' ') });
      }
      section = [];
    };
    for (const block of source) {
      const explicitlyNumbered = block.rows.some(row => /^\d+\.(?:\s|~|$)/.test(row));
      if (section.length && (section[0].length !== block.rows.length || explicitlyNumbered)) flush();
      section.push(block.rows);
    }
    flush();
    return { voiceId: carrier, rows: source.flatMap(block => block.rows), transcript };
  });
}

export const hymnLyricTranscriptFromAbc = (abc: string): readonly LyricTranscriptLine[] => {
  // Identical wording on multiple source carriers need only be read once.
  // Distinct echo/response wording remains, in carrier order.
  const seen = new Set<string>();
  const transcript = hymnLyricSourcesFromAbc(abc).flatMap(source => source.transcript).filter(line => {
    const formatted = formatLyricTranscriptLine(line);
    if (!formatted || !/[A-Za-z\u00c0-\u024f]/.test(formatted) || seen.has(formatted)) return false;
    seen.add(formatted);
    return true;
  });
  let prose: string[] = [];
  const flushProse = () => {
    if (prose.length) transcript.push({ kind: 'prose', text: prose.join(' ') });
    prose = [];
  };
  for (const line of abc.split(/\r?\n/)) {
    const match = /^\s*W:\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    const text = match[1];
    if (!text || /^\d+\./.test(text)) flushProse();
    // An editorial note in a source W: field is retained in provenance, not sung.
    if (/^Note that this hymn is sometimes published without the refrain/.test(text)) { flushProse(); continue; }
    if (text) prose.push(text);
  }
  flushProse();
  return transcript;
};
