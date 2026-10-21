/** A lyric attachment to a written note, independent of the number of times it is sung. */
export interface RepeatLyricEvent {
  voiceId: string;
  musicSegment: number;
  eventIndex: number;
  stanzaNumber: number;
  repeatPass: number;
  syllable: string;
}

export interface RepeatUnderlay {
  voiceId: string;
  stanzaNumbers: readonly number[];
  /** Exact source music lines guard against attaching words after a transcription changes. */
  musicLines: readonly string[];
  /** Explicit note counts retain trailing lyric skips when a row ends before the music line does. */
  eventCounts?: readonly number[];
  events: readonly RepeatLyricEvent[];
}

type LyricRow = { segment: number; stanza: number; pass: number; words: readonly string[] };

const musicLines345 = [
  'D4 D2 | G4 G2 | (B3 A1) G2 | A6 ||',
  'B4 B2 | d4 G2 | (F3 G1) A2 | G6 :|',
  'c4 c2 | B4 B2 | (A3 B1) c2 | B6 ||',
  'd4 d2 | B4 B2 | c4 B2 | A6 ||',
  'D4 D2 | G4 G2 | (B3 A1) G2 | A6 ||',
  'B4 B2 | d4 G2 | (F3 G1) A2 | G6 ||',
] as const;

const musicLines211 = [
  'E3/4F/4 | G2 G3/4A/4 | (B G) E | (F3/2 G/) A | (A G) || E3/4G/4 | B2 c | B2 G | G2 F | F2 :|',
  'G | A2 B | c2 B | (B G) E | (G F) || B | (e d) B/e/ | (e c) A | G2 F | E2 |]',
] as const;

// The paired notes inside each slur have one sung syllable. The second note
// (index 5) therefore receives an ABC lyric skip when rows are engraved.
const lyricAnchors = [
  [0, 1, 2, 3, 4, 6, 7],
  [0, 1, 2, 3, 4, 6, 7],
  [0, 1, 2, 3, 4, 6, 7],
  [0, 1, 2, 3, 4, 5, 6],
  [0, 1, 2, 3, 4, 6, 7],
  [0, 1, 2, 3, 4, 6, 7],
] as const;

// Rows follow the vertical order of the printed page. Pass 2 of stanza 1
// reuses written segments 0–1, followed by both passes of stanza 2.
const rows345: readonly LyricRow[] = [
  { segment: 0, stanza: 1, pass: 1, words: ['To', 'the', 'hills', 'I', 'lift', 'my', 'eyes;'] },
  { segment: 0, stanza: 1, pass: 2, words: ['From', 'the', 'Lord', 'shall', 'come', 'my', 'aid,'] },
  { segment: 0, stanza: 2, pass: 1, words: ['Thy', 'pro-', 'tect-', 'or', 'is', 'the', 'Lord,'] },
  { segment: 0, stanza: 2, pass: 2, words: ['Nei-', 'ther', 'sun', 'nor', 'moon', 'shall', 'smite,'] },
  { segment: 1, stanza: 1, pass: 1, words: ['Whence', 'shall', 'help', 'for', 'me', 'a-', 'rise?'] },
  { segment: 1, stanza: 1, pass: 2, words: ['Who', 'the', "heav'n", 'and', 'earth', 'has', 'made.'] },
  { segment: 1, stanza: 2, pass: 1, words: ['Shade', 'for', 'thee', 'He', 'will', 'af-', 'ford;'] },
  { segment: 1, stanza: 2, pass: 2, words: ['God', 'shall', 'guard', 'by', 'day', 'and', 'night.'] },
  { segment: 2, stanza: 1, pass: 1, words: ['He', 'will', 'guide', "thro'", 'dan-', 'gers', 'all,'] },
  { segment: 2, stanza: 2, pass: 1, words: ['He', 'will', 'ev-', 'er', 'keep', 'thy', 'soul,'] },
  { segment: 3, stanza: 1, pass: 1, words: ['Will', 'not', 'suf-', 'fer', 'thee', 'to', 'fall;'] },
  { segment: 3, stanza: 2, pass: 1, words: ['What', 'would', 'harm', 'He', 'will', 'con-', 'trol;'] },
  { segment: 4, stanza: 1, pass: 1, words: ['He', 'Who', 'safe', 'His', 'peo-', 'ple', 'keeps'] },
  { segment: 4, stanza: 2, pass: 1, words: ['In', 'the', 'home', 'and', 'by', 'the', 'way'] },
  { segment: 5, stanza: 1, pass: 1, words: ['Slum-', 'bers', 'not', 'and', 'nev-', 'er', 'sleeps.'] },
  { segment: 5, stanza: 2, pass: 1, words: ['He', 'will', 'keep', 'thee', 'day', 'by', 'day.'] },
];

// Syllable anchors follow the engraved note columns. Each of the two phrases
// in the first system is sung twice with different words, so the lyric map
// records separate repeat passes over the same written events.
const lyricAnchors211 = [
  [0, 2, 3, 5, 7, 8, 10, 11, 13, 15, 16, 17, 18, 19, 20, 21],
  [0, 1, 2, 3, 4, 5, 7, 8, 10, 11, 13, 15, 17, 18, 19, 20],
] as const;

const rows211: readonly LyricRow[] = [
  { segment: 0, stanza: 1, pass: 1, words: ['O', 'God,', 'most', 'ho-', 'ly', 'are', 'Thy', 'ways,', 'And', 'who', 'like', 'Thee', 'de-', 'serves', 'my', 'praise?'] },
  { segment: 0, stanza: 1, pass: 2, words: ['Thou', 'on-', 'ly', 'do-', 'est', 'won-', 'drous', 'things,', 'The', 'whole', 'wide', 'world', 'Thy', 'glo-', 'ry', 'sings;'] },
  { segment: 1, stanza: 1, pass: 1, words: ['Thy', 'out-', 'stretched', 'arm', 'Thy', 'peo-', 'ple', 'saved,', "Tho'", 'sore', 'dis-', 'tressed', 'and', 'long', 'en-', 'slaved.'] },
  { segment: 0, stanza: 2, pass: 1, words: ['O', 'God,', 'from', 'Thee', 'the', 'wa-', 'ters', 'fled,', 'The', 'depths', 'were', 'moved', 'with', 'might-', 'y', 'dread,'] },
  { segment: 0, stanza: 2, pass: 2, words: ['The', 'swell-', 'ing', 'clouds', 'their', 'tor-', 'rents', 'poured,', 'And', "o'er", 'the', 'earth', 'the', 'tem-', 'pest', 'roared;'] },
  { segment: 1, stanza: 2, pass: 1, words: ["'Mid", 'light-', "ning's", 'flash', 'and', 'thun-', "der's", 'sound', 'Great', 'trem-', 'bling', 'shook', 'the', 'sol-', 'id', 'ground.'] },
  { segment: 0, stanza: 3, pass: 1, words: ['Thy', 'way', 'was', 'in', 'the', 'sea,', 'O', 'God,', 'Thro\'', 'might-', 'y', 'wa-', 'ters,', 'deep', 'and', 'broad;'] },
  { segment: 0, stanza: 3, pass: 2, words: ['None', 'un-', 'der-', 'stood', 'but', 'God', 'a-', 'lone,', 'To', 'man', 'Thy', 'foot-', 'steps', 'were', 'un-', 'known;'] },
  { segment: 1, stanza: 3, pass: 1, words: ['But', 'safe', 'Thy', 'peo-', 'ple', 'Thou', 'didst', 'keep,', 'Al-', 'might-', 'y', 'Shep-', 'herd', 'of', 'Thy', 'sheep.'] },
];

export const psalter345RepeatUnderlay: RepeatUnderlay = {
  voiceId: 'S',
  stanzaNumbers: [1, 2],
  musicLines: musicLines345,
  events: rows345.flatMap(({ segment, stanza, pass, words }) => words.map((syllable, index) => ({
    voiceId: 'S',
    musicSegment: segment,
    eventIndex: lyricAnchors[segment][index],
    stanzaNumber: stanza,
    repeatPass: pass,
    syllable,
  }))),
};

export const psalter211RepeatUnderlay: RepeatUnderlay = {
  voiceId: 'T1',
  stanzaNumbers: [1, 2, 3],
  musicLines: musicLines211,
  eventCounts: [22, 21],
  events: rows211.flatMap(({ segment, stanza, pass, words }) => words.map((syllable, index) => ({
    voiceId: 'T1',
    musicSegment: segment,
    eventIndex: lyricAnchors211[segment][index],
    stanzaNumber: stanza,
    repeatPass: pass,
    syllable,
  }))),
};

const isMusicLine = (line: string) => line.trim().length > 0 && !line.trim().startsWith('%') && !/^[A-Za-z]:/.test(line.trim());

/** Source music is never changed; rows are generated for this rendering only. */
export function hasRepeatUnderlaySource(abc: string, model: RepeatUnderlay): boolean {
  let inVoice = false;
  const lines: string[] = [];
  for (const line of abc.split(/\r?\n/)) {
    const voice = /^V:([^\s]+)/.exec(line);
    if (voice) { inVoice = voice[1] === model.voiceId; continue; }
    const inlineVoice = /^\[V:([^\s\]]+)[^\]]*\]\s*/.exec(line);
    if (inlineVoice) inVoice = inlineVoice[1] === model.voiceId;
    const musicLine = inlineVoice ? line.slice(inlineVoice[0].length) : line;
    if (inVoice && isMusicLine(musicLine)) lines.push(musicLine);
  }
  return lines.length === model.musicLines.length && lines.every((line, index) => line === model.musicLines[index]);
}

export function withRepeatUnderlay(abc: string, model: RepeatUnderlay, selectedStanzas: readonly number[] = model.stanzaNumbers): string {
  if (!hasRepeatUnderlaySource(abc, model)) return abc;
  const selected = new Set(selectedStanzas);
  let inVoice = false;
  let segment = 0;
  const output: string[] = [];
  for (const line of abc.split(/\r?\n/)) {
    const voice = /^V:([^\s]+)/.exec(line);
    if (voice) inVoice = voice[1] === model.voiceId;
    output.push(line);
    const inlineVoice = /^\[V:([^\s\]]+)[^\]]*\]\s*/.exec(line);
    if (inlineVoice) inVoice = inlineVoice[1] === model.voiceId;
    const musicLine = inlineVoice ? line.slice(inlineVoice[0].length) : line;
    if (!inVoice || !isMusicLine(musicLine)) continue;
    const segmentEvents = model.events.filter((event) => event.musicSegment === segment && selected.has(event.stanzaNumber));
    const rowKeys = [...new Set(segmentEvents.map((event) => `${event.stanzaNumber}:${event.repeatPass}`))];
    for (const key of rowKeys) {
      const [stanzaNumber, repeatPass] = key.split(':').map(Number);
      const events = segmentEvents.filter((event) => event.stanzaNumber === stanzaNumber && event.repeatPass === repeatPass);
      const slotCount = model.eventCounts?.[segment] ?? Math.max(...events.map((event) => event.eventIndex)) + 1;
      const slots = Array.from({ length: slotCount }, () => '*');
      for (const event of events) slots[event.eventIndex] = event.syllable;
      if (segment === 0 && repeatPass === 1) slots[0] = `${stanzaNumber}.~${slots[0]}`;
      output.push(`w:${slots.join(' ')}`);
    }
    segment += 1;
  }
  return output.join('\n');
}
