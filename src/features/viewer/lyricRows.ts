/** Keep empty stanza slots from collapsing SVG's relative lyric-row advances. */
export function preserveBlankLyricRows(container: HTMLElement) {
  for (const lyric of container.querySelectorAll('text.abcjs-lyric[data-name="lyric"]')) {
    const rows = Array.from(lyric.children);
    const x = lyric.getAttribute('x');
    // Only ABCJS's flat relative-row columns are understood here. Leave
    // nested text, custom positioning, or other row attributes untouched.
    if (x === null || lyric.childNodes.length !== rows.length || rows.some((row, index) =>
      row.tagName.toLowerCase() !== 'tspan' || row.childNodes.length > 1 ||
      (row.firstChild !== null && row.firstChild.nodeType !== 3) ||
      row.getAttribute('x') !== x || row.attributes.length !== (index === 0 ? 1 : 2) ||
      row.getAttribute('dy') !== (index === 0 ? null : '1.2em'))) continue;
    let lastWord = rows.length - 1;
    while (lastWord >= 0 && !rows[lastWord].textContent?.trim()) lastWord--;
    for (let index = 0; index < lastWord; index++) {
      const row = rows[index];
      // A nonbreaking space preserves leading and interior row advances.
      // Leave trailing blanks (including ABCJS's final dummy row) untouched
      // so they cannot enlarge the score's measured bounds.
      if (/^[ \t\r\n]*$/.test(row.textContent ?? '')) row.textContent = '\u00a0';
    }
  }
}
