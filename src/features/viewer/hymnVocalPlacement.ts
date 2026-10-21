/** Replay source-local lyric placement when an imported hymn switches voices.
 * ABCJS treats header %%vocal directives globally; the imported editions attach
 * them to voice declarations. Only the engraving copy receives these replays.
 */
export function withHymnVocalPlacement(abc: string, songId?: string): string {
  if (!songId?.startsWith('hymn-')) return abc;
  const headerEnd = abc.search(/^K:/m);
  if (headerEnd < 0) return abc;
  const header = abc.slice(0, headerEnd);
  const placements = new Map<string, string>();
  let voice = '';
  for (const line of header.split(/\r?\n/)) {
    const declaration = /^V:[ \t]*([^\s%]+)/.exec(line);
    if (declaration) voice = declaration[1];
    const placement = /^%%vocal[ \t]+(above|below|hidden|auto)[ \t]*(?:%.*)?$/.exec(line);
    if (voice && placement) placements.set(voice, placement[1]);
  }
  if (!placements.size) return abc;
  const body = abc.slice(headerEnd);
  return header + body.replace(/^(V:[ \t]*([^\s%]+)[ \t]*(?:%[^\r\n]*)?)(\r?\n|$)/gm,
    (line, declaration: string, id: string, newline: string, offset: number) => {
      const placement = placements.get(id);
      if (!placement) return line;
      const directive = `%%vocal ${placement}`;
      if (body.slice(offset + line.length).startsWith(directive + newline)) return line;
      return `${declaration}${newline || '\n'}${directive}${newline}`;
    });
}
