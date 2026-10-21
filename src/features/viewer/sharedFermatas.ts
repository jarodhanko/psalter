import abcjs from 'abcjs';

// Reviewed against Psalter 338's printed source: each of the q19 and q40
// cadences has one upper fermata per staff. Canonical per-part tags remain
// authoritative for isolated parts and playback. Fail closed on source edits.
const psalter338MusicWitness = [
  "M:3/4",
  "L:1/8",
  "K:Ab",
  "%%score (S A)(T B)",
  "V:S clef=treble",
  "V:A clef=treble",
  "V:T clef=bass",
  "V:B clef=bass",
  "V:S",
  "E2 | (E2 c2) A2 | B4 E2 | (B2 c2) B2 | A4 | c2 | (e2 c2) d2 | (B2 A2) B2 | !fermata!c4 ||",
  "E2 | (F2 d2) F2 | (E2 c2) A2 | (G2 A2) B2 | c4 | e2 | (e2 d2) B2 | (AE c2) B2 | !fermata!A4 ||",
  "V:A",
  "C2 | (C2 E2) C2 | D4 D2 | (D2 E2) D2 | C4 | E2 | (E2 F2) F2 | (E2 C2) D2 | !fermata!E4 ||",
  "C2 | (D2 F2) D2 | (C2 E2) C2 | (D2 C2) D2 | E4 | _G2 | F4 F2 | E4 D2 | !fermata!C4 ||",
  "V:T",
  "A,2 | A,4 A,2 | G,4 G,2 | (B,2 A,2) G,2 | A,4 | A,2 | (A,2 =A,2) B,2 | (G,2 A,2) G,2 | !fermata!A,4 ||",
  "A,2 | A,4 A,2 | A,4 A,2 | (B,2 A,2) G,2 | A,4 | A,2 | A,4 D2 | (C2 A,2) G,2 | !fermata!A,4 ||",
  "V:B",
  "A,,2 | A,,4 A,,2 | E,4 E,2 | E,4 E,2 | A,,4 | A,,2 | (C,2 F,2) B,,2 | E,4 E,2 | !fermata!A,,4 ||",
  "A,,2 | D,4 D,2 | A,,4 A,,2 | E,4 E,2 | A,,4 | C,2 | D,4 D,2 | E,4 E,2 | !fermata!A,,4 ||",
].join('\n');

export function hasSharedFermataSource(songId: string, abc: string): boolean {
  return songId === 'psalter338' && abc.split(/\r?\n/)
    .filter((line) => !/^\s*(?:[TCRSONWw]:|%abc)/.test(line) && line.trim())
    .join('\n') === psalter338MusicWitness;
}

/** Only a display projection, after part selection. Equal source-backed
 * indications share a glyph only on the same staff at the reviewed onset and
 * duration. Distinct-time, opposite-orientation and solo marks stay intact.
 * Spaces preserve source offsets; the canonical/playback ABC is never edited.
 */
export function presentSharedFermatas(selectedAbc: string, active: boolean): string {
  return presentCoincidentUprightFermatas(selectedAbc, active, [19, 40]);
}

/** Reuse only the mechanics after a caller binds a separate exact source
 * witness and supplies its independently reviewed two-quarter cadences. */
export function presentCoincidentUprightFermatas(
  selectedAbc: string, active: boolean, reviewedOnsets: readonly number[],
): string {
  if (!active || !selectedAbc) return selectedAbc;
  try {
    const tune = abcjs.parseOnly(selectedAbc)[0];
    if (!tune || tune.warnings?.length) return selectedAbc;
    const positions = new Map<string, number>();
    const marked = new Map<string, { voice: number; start: number }[]>();
    for (const line of tune.lines) for (const [staffIndex, staff] of (line.staff ?? []).entries()) {
      for (const [voiceIndex, voice] of (staff.voices ?? []).entries()) {
        const voiceKey = `${staffIndex}:${voiceIndex}`;
        let onset = positions.get(voiceKey) ?? 0;
        for (const event of voice) {
          if (event.el_type !== 'note') continue;
          const duration = event.duration ?? 0;
          if (reviewedOnsets.includes(onset * 4) && duration === 1 / 2 &&
              (event as abcjs.VoiceItemNote & { decoration?: string[] }).decoration?.includes('fermata') && !event.rest) {
            const raw = selectedAbc.slice(event.startChar, event.endChar);
            const matches = [...raw.matchAll(/!fermata!/g)];
            if (matches.length !== 1) return selectedAbc;
            const key = `${staffIndex}:${onset}:${duration}`;
            const marks = marked.get(key) ?? [];
            marks.push({ voice: voiceIndex, start: event.startChar + matches[0].index });
            marked.set(key, marks);
          }
          onset += duration;
        }
        positions.set(voiceKey, onset);
      }
    }
    const removals = [...marked.values()].flatMap((marks) => {
      // Never collapse repeated indications within one voice.
      if (marks.length < 2 || new Set(marks.map((mark) => mark.voice)).size !== marks.length) return [];
      return marks.sort((left, right) => left.voice - right.voice).slice(1).map((mark) => mark.start);
    }).sort((left, right) => right - left);
    let presented = selectedAbc;
    for (const start of removals) presented = presented.slice(0, start) + ' '.repeat('!fermata!'.length) + presented.slice(start + '!fermata!'.length);
    return presented;
  } catch {
    return selectedAbc;
  }
}
