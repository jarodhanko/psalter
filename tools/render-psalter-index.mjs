/** Only bibliographic metadata for the selected number range, not lyrics,
 * audio, or crawler-specific text. */
const escape = (value) => String(value).replace(/[&<>"']/g, (ch) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);

export function renderPsalterIndex(metadata) {
  const entries = metadata.filter(({ number, variant }) => number >= 1 && number <= 434 && variant === '');
  if (entries.length !== 434 || entries.some(({ number, id, title }, i) =>
    number !== i + 1 || id !== `psalter${number}` || !title?.trim())) {
    throw new Error('Expected one titled primary setting for each 1912 Psalter number 1–434.');
  }
  const displayTitle = (number, title) => title.replace(new RegExp(`^${number}[.:]\\s+`), '');
  const groups = Array.from({ length: 9 }, (_, i) => entries.slice(i * 50, (i + 1) * 50));
  const heading = (group) => `${group[0].number}–${group.at(-1).number}`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Find 1912 Psalter numbers 1–434 by title, tune, or Psalm reference. Open the sheet music to hear parts, transpose, or print." />
  <link rel="canonical" href="https://oldpsalter.com/psalter-index.html" />
  <link rel="icon" href="/psalter-icon.svg" type="image/svg+xml" />
  <title>1912 Psalter Index: Numbers 1–434 | Old Psalter</title>
  <style>
    :root { color: #18352d; background: #f7f4eb; font-family: system-ui, sans-serif; }
    body { max-width: 52rem; margin: 0 auto; padding: 1.25rem; line-height: 1.65; }
    h1, h2 { font-family: Georgia, serif; line-height: 1.2; }
    a { color: #175c45; text-underline-offset: .2em; }
    nav ul { display: flex; flex-wrap: wrap; list-style: none; gap: .5rem 1rem; padding: 0; }
    .psalter-entry { margin: .45rem 0; }
  </style>
</head>
<body>
  <header><a href="/">Old Psalter viewer</a> · <a href="/about.html">Guide and source notes</a></header>
  <main>
    <h1>1912 Psalter index: Numbers 1–434</h1>
    <p>Browse selections 1–434 in Old Psalter, a collection based on <cite>The Psalter</cite> (1912). Each number links to its main sheet music setting, where you can practice parts, transpose, or print. The collection also includes later material; additional settings and selections are available in the viewer.</p>
    <p>This index works without JavaScript. The sheet music viewer requires JavaScript.</p>
    <nav aria-label="Jump to a number range"><ul>
      ${groups.map(group => `<li><a href="#numbers-${group[0].number}">${heading(group)}</a></li>`).join('\n      ')}
    </ul></nav>
    ${groups.map(group => `<section aria-labelledby="numbers-${group[0].number}">
      <h2 id="numbers-${group[0].number}">Psalter numbers ${heading(group)}</h2>
      <ul>
        ${group.map(({ number, id, title, psalmNumber, tune }) => `<li class="psalter-entry"><a href="/?book=psalter-1912&amp;number=${number}&amp;tune=${id}">Psalter ${number}: ${escape(displayTitle(number, title))}</a>${psalmNumber ? ` · Psalm ${psalmNumber}` : ''}${tune ? ` · Tune: ${escape(tune)}` : ''}</li>`).join('\n        ')}
      </ul>
    </section>`).join('\n    ')}
  </main>
</body>
</html>
`;
}
