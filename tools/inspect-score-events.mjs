import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { readSourceAbc } from './inspect-underlay.mjs';

const require = createRequire(import.meta.url);
const abcjs = require('abcjs');

const lyricText = (event) => event.lyric?.map((slot) => slot.syllable ?? '').join(' / ') ?? '';

export const scoreEventWorksheet = (id, abc) => {
  const [tune] = abcjs.parseOnly(abc);
  if (!tune) throw new Error(`ABCJS could not parse ${id}`);
  const sourceLines = tune.lines.filter((line) => line.staff?.length);
  const rows = [`${id}: ${sourceLines.length} music source lines; ${tune.warnings?.length ?? 0} parser warnings`];
  const barNumbers = new Map();
  const eventNumbers = new Map();

  for (const [systemIndex, line] of sourceLines.entries()) {
    for (const [staffIndex, staff] of line.staff.entries()) {
      for (const [voiceIndex, voice] of staff.voices.entries()) {
        const voiceId = `${staffIndex + 1}.${voiceIndex + 1}`;
        let bar = barNumbers.get(voiceId) ?? 1;
        let eventNumber = eventNumbers.get(voiceId) ?? 0;
        rows.push(`System ${systemIndex + 1}, voice ${voiceId}:`);
        for (const event of voice) {
          if (event.el_type === 'bar') {
            rows.push(`  barline ${event.type ?? '|'} after bar ${bar}`);
            bar += 1;
            continue;
          }
          if (event.el_type !== 'note') continue;
          eventNumber += 1;
          const token = abc.slice(event.startChar ?? 0, event.endChar ?? 0).trim().replace(/\s+/gu, ' ') || '?';
          const pitches = event.rest
            ? `rest:${event.rest.type ?? '?'}`
            : event.pitches?.map((pitch) => `${pitch.accidental ?? ''}${pitch.name}${pitch.startTie ? '~' : ''}${pitch.endTie ? '(tie-end)' : ''}`).join('+') ?? '?';
          const lyric = lyricText(event);
          rows.push(`  ${String(eventNumber).padStart(3)} bar ${String(bar).padStart(2)}  ${token.padEnd(15)} ${pitches.padEnd(22)} dur=${event.duration}${lyric ? `  lyric=${lyric}` : ''}`);
        }
        barNumbers.set(voiceId, bar);
        eventNumbers.set(voiceId, eventNumber);
      }
    }
  }
  return rows.join('\n');
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const id = process.argv[2];
  if (!id) {
    console.error('Usage: node tools/inspect-score-events.mjs psalter316');
    process.exitCode = 1;
  } else {
    try {
      console.log(scoreEventWorksheet(id, await readSourceAbc(id)));
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 1;
    }
  }
}
