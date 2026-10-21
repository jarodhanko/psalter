import abcjs from 'abcjs';

/** Qualified on the complete pristine edition, before engraving transforms. */
export interface ReportedDuplicateCarriers {
  segments: readonly number[];
}

// Each pair was checked against the byte-matched upstream MusicXML named in
// the canonical ABC header: its verse/syllable identities and absolute onsets
// agree in the upper/lower parts. Different melisma slots are intentional.
// Wondrous Story agrees only before its independently timed refrain. Jordan's
// imported MusicXML hash was recovered by reverting only subtitle/title-block
// metadata; its notation and lyrics are unchanged. Its standalone [L:] lines
// occupy scanner segment 0, so segments 1–2 are music measures 1–8 only.
const sources: Readonly<Record<string, { length: number; hash: bigint; segments: readonly number[] }>> = {
  'o-worship-the-king': { length: 4829, hash: 0x0de8d4d5deb90d2en, segments: [0, 1, 2, 3, 4] },
  'all-people': { length: 3817, hash: 0x4469aa9ad4a81289n, segments: [0, 1, 2, 3] },
  'all-the-way-my-savior-leads-me': { length: 5298, hash: 0x1f23b58c9b76e0c4n, segments: [0, 1, 2, 3, 4, 5] },
  'great-is-thy-faithfulness': { length: 5540, hash: 0x0d1a0be58b40a4cbn, segments: [0, 1, 2, 3, 4, 5, 6, 7] },
  'i-will-sing-the-wondrous-story': { length: 5242, hash: 0x2b6757db0500d42bn, segments: [0, 1] },
  'on-jordans-stormy-banks-i-stand': { length: 5041, hash: 0x01dc20a398b56302n, segments: [1, 2] },
  'praise-him-praise-him': { length: 6031, hash: 0x55b1e4e220caa031n, segments: [0, 1, 2, 3, 4, 5, 6, 7] },
  'sound-the-battle-cry': { length: 4518, hash: 0xde1f8d0f1117e8dbn, segments: [0, 1, 2, 3] },
  'tell-me-the-story-of-jesus': { length: 5689, hash: 0x8f6ba85fb79c357bn, segments: [0, 1, 2, 3, 4, 5] },
};

export function getReportedDuplicateCarriers(songId: string | undefined, abc: string): ReportedDuplicateCarriers | undefined {
  const prefix = 'hymn-remaining-openpsalm-';
  if (!songId?.startsWith(prefix)) return undefined;
  const spec = sources[songId.slice(prefix.length)];
  const source = abc.replace(/\r\n/g, '\n');
  if (!spec || source.length !== spec.length) return undefined;
  let hash = 14695981039346656037n;
  for (let index = 0; index < source.length; index++) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(source.charCodeAt(index))) * 1099511628211n);
  }
  return hash === spec.hash ? spec : undefined;
}

/** Suppress only reviewed lower rows with a complete visible timed equivalent.
 * Run after part selection so an upper carrier transferred to Alto can qualify;
 * a lower-only view keeps its own underlay. This never changes a music line.
 * The source witness limits the comparison to reviewed pairs, while the final
 * onset check rejects changed/differently timed responses after preparation. */
export function presentReportedDuplicateCarriers(abc: string, witness?: ReportedDuplicateCarriers): string {
  if (!witness || typeof abcjs.parseOnly !== 'function') return abc;
  // ABCJS reports positions in its normalized LF input. Use that same text
  // for range offsets, while every rejected preparation returns the input.
  const source = abc.replace(/\r\n/g, '\n');
  const lines = source.split('\n');
  const groups = new Map<string, { start: number; end: number; rowLines: number[] }>();
  const segments = new Map<string, number>();
  let voiceId = '', inBody = false, offset = 0;
  for (const [index, line] of lines.entries()) {
    const voice = /^V:[ \t]*([^\s]+)(.*)$/.exec(line);
    const inline = /^\s*\[V:[ \t]*([^\]\s]+)[^\]]*\](.*)$/.exec(line);
    if (voice) { voiceId = voice[1]; inBody = !voice[2].trim(); }
    else {
      if (inline) { voiceId = inline[1]; inBody = true; }
      const music = (inline ? inline[2] : line).trim();
      if (inBody && /^w:/.test(music)) {
        groups.get(`${voiceId}:${segments.get(voiceId)}`)?.rowLines.push(index);
      } else if (inBody && music && !/^(?:%|[A-Za-z]:)/.test(music)) {
        const segment = (segments.get(voiceId) ?? -1) + 1;
        segments.set(voiceId, segment);
        groups.set(`${voiceId}:${segment}`, { start: offset, end: offset + line.length, rowLines: [] });
      }
    }
    offset += line.length + 1;
  }
  const upper = ['1', '2'].find(id => witness.segments.some(segment => groups.get(`${id}:${segment}`)?.rowLines.length));
  if (!upper || !witness.segments.some(segment => groups.get(`3:${segment}`)?.rowLines.length)) return abc;
  const ranges = [...groups].flatMap(([key, group]) =>
    group.rowLines.length && witness.segments.some(segment => key === `${upper}:${segment}` || key === `3:${segment}`)
      ? [{ key, ...group }] : []);
  const ledger = new Map<string, { onset: number; syllable: string; row: number }[]>();
  try {
    const tune = abcjs.parseOnly(source)[0];
    if (!tune || tune.warnings?.length) return abc;
    const clocks = new Map<string, { onset: number; multiplier: number }>();
    for (const line of tune.lines) for (const [s, staff] of (line.staff ?? []).entries()) {
      for (const [v, voice] of (staff.voices ?? []).entries()) {
        const clockKey = `${s}:${v}`;
        const clock = clocks.get(clockKey) ?? { onset: 0, multiplier: 1 };
        clocks.set(clockKey, clock);
        for (const event of voice) if (event.el_type === 'note') {
          const note = event as abcjs.VoiceItemNote & {
            lyric?: { syllable: string }[]; startTriplet?: number; tripletMultiplier?: number; endTriplet?: boolean;
          };
          if (note.startTriplet) clock.multiplier = note.tripletMultiplier ?? 1;
          const range = ranges.find(range => note.startChar >= range.start && note.startChar < range.end);
          if (range && !note.rest) {
            const events = ledger.get(range.key) ?? [];
            note.lyric?.forEach((lyric, row) => {
              if (lyric.syllable.trim()) events.push({ onset: clock.onset, syllable: lyric.syllable, row });
            });
            ledger.set(range.key, events);
          }
          clock.onset += note.duration * clock.multiplier;
          if (note.endTriplet) clock.multiplier = 1;
        }
      }
    }
  } catch { return abc; }
  const omitted = new Set<number>();
  for (const segment of witness.segments) {
    const upperEvents = ledger.get(`${upper}:${segment}`);
    const lowerEvents = ledger.get(`3:${segment}`);
    if (!upperEvents?.length || !lowerEvents?.length || upperEvents.length !== lowerEvents.length ||
        upperEvents.some((event, index) => event.row !== lowerEvents[index].row || event.syllable !== lowerEvents[index].syllable ||
          Math.abs(event.onset - lowerEvents[index].onset) >= 1e-8)) continue;
    for (const index of groups.get(`3:${segment}`)?.rowLines ?? []) omitted.add(index);
  }
  return omitted.size ? lines.filter((_, index) => !omitted.has(index)).join('\n') : abc;
}
