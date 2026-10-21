/** Make a shared staff's clef explicit before reducing an imported hymn to parts.
 * This is an engraving copy only: canonical source and downloadable ABC stay intact.
 */
export function withInheritedHymnClefs(abc: string, songId?: string): string {
  if (!songId?.startsWith('hymn-')) return abc;
  const headerEnd = abc.search(/^K:/m);
  if (headerEnd < 0) return abc;
  const header = abc.slice(0, headerEnd);
  const scores = [...header.matchAll(/^%%score\s+([^\r\n%]+)/gm)];
  if (scores.length !== 1) return abc;
  const definitions = [...header.matchAll(/^V:[ \t]*([^\s%]+)([^\r\n]*)/gm)];
  const explicitClefs = new Map(definitions.flatMap(([, id, attributes]) => {
    const clef = /(?:^|\s)clef\s*=\s*([^\s%]+)/.exec(attributes.split('%')[0]);
    return clef ? [[id, clef[1]] as const] : [];
  }));
  const inheritedClefs = new Map<string, string>();
  const groups = scores[0][1].match(/\([^)]*\)|[^\s{}[\]|()]+/g) ?? [];
  for (const group of groups) {
    const ids = group.replace(/[()]/g, '').trim().split(/\s+/);
    const clefs = [...new Set(ids.flatMap(id => explicitClefs.has(id) ? [explicitClefs.get(id)!] : []))];
    // Never guess when a staff's declarations disagree or omit its clef entirely.
    if (clefs.length !== 1) continue;
    for (const id of ids) if (!explicitClefs.has(id)) inheritedClefs.set(id, clefs[0]);
  }
  if (!inheritedClefs.size) return abc;
  return header.replace(/^V:[ \t]*([^\s%]+)([^\r\n]*)/gm, (line, id: string, attributes: string) => {
    const clef = inheritedClefs.get(id);
    // Preserve shorthand clefs as well as explicit clef= declarations.
    if (!clef || /(?:^|\s)(?:treble|bass|alto|tenor|perc|none)(?:[-+\d]|\b)/.test(attributes.split('%')[0])) return line;
    const comment = line.indexOf('%');
    return comment < 0 ? `${line} clef=${clef}` : `${line.slice(0, comment).trimEnd()} clef=${clef} ${line.slice(comment)}`;
  }) + abc.slice(headerEnd);
}
