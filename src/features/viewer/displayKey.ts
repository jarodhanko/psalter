const NOTE_CLASS: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
};
const KEY_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

/** Name the tonic that abcjs displays after visual transposition. */
export function displayKey(abc: string, transpose: number): string | undefined {
  const key = /^K:\s*([A-G])([#b]?)([^\r\n]*)/im.exec(abc);
  if (!key) return undefined;
  const base = NOTE_CLASS[key[1].toUpperCase()] + (key[2] === '#' ? 1 : key[2] === 'b' ? -1 : 0);
  const tonic = KEY_NAMES[((base + transpose) % 12 + 12) % 12];
  const mode = /^(?:m|min|minor)(?:\b|$)/i.test(key[3].trim()) ? 'Minor' : 'Major';
  return `${tonic} ${mode}`;
}
