import abcjs from 'abcjs';

// Psalter 366 prints an upright symbol above the upper staff and an inverted
// symbol below the lower staff at q34. The Tenor's upright canonical marker
// remains necessary when the Bass's shared inverted symbol is not selected.
const psalter366MusicWitness = [
  "M:3/2",
  "L:1/4",
  "K:Bb",
  "%%score (T1 T2)(B1 B2)",
  "V:T1 clef=treble",
  "V:T2 clef=treble",
  "V:B1 clef=bass",
  "V:B2 clef=bass",
  "V:T1",
  "F2 | G F B2 c2 | B4 || B2 | A B G2 G2 | F4 ||",
  "F2 | G F B2 A2 | B c HB2 || B2 | A B G2 F2 | F4 |]",
  "V:T2",
  "D2 | E D D2 E2 | D4 || =E2 | F G F2 =E2 | F4 ||",
  "D2 | E D D2 E2 | D E D2 || F2 | F F E2 C2 | D4 |]",
  "V:B1",
  "B,2 | B, B, B,2 A,2 | [F,B,]4 || B,2 | C D C3 B, | A,4 ||",
  "B,2 | B, B, B,2 C2 | B, A, !fermata!B,2 || D2 | C B, B,2 A,2 | B,4 |]",
  "V:B2",
  "B,,2 | B,, B,, G,2 F,2 | B,,4 || G,2 | F, B,, C,2 C,2 | F,4 ||",
  "B,,2 | B,, B,, B,,2 F,2 | G, F, !invertedfermata!B,2 || B,,2 | F, D, E,2 F,2 | B,,4 |]",
].join('\n');

export function hasPsalter366FermataSource(songId: string, abc: string): boolean {
  return songId === 'psalter366' && abc.split(/\r?\n/)
    .filter((line) => !/^\s*(?:[TCRSONWw]:|%abc)/.test(line) && line.trim())
    .join('\n') === psalter366MusicWitness;
}

type DecoratedNote = abcjs.VoiceItemNote & { decoration?: string[] };

/** Source-bound staff indications, never a canonical/playback edit.
 * The lower pair shares the Bass's inverted glyph. When Soprano is hidden,
 * Alto inherits the printed upper-staff indication at its simultaneous half.
 */
export function presentPsalter366Fermata(selectedAbc: string, active: boolean): string {
  if (!active || !selectedAbc) return selectedAbc;
  const scores = selectedAbc.match(/^%%score[^\r\n]*$/gm) ?? [];
  if (scores.length !== 1) return selectedAbc;
  const groups = (scores[0].match(/\([^)]*\)/g) ?? [])
    .map((group) => group.slice(1, -1).trim().split(/\s+/));
  const lowerStaff = groups.findIndex((ids) => ids.join(' ') === 'B1 B2');
  const altoStaff = groups.findIndex((ids) => ids.join(' ') === 'T2');
  const inheritAlto = altoStaff >= 0 && !groups.some((ids) => ids.includes('T1'));
  if (lowerStaff < 0 && !inheritAlto) return selectedAbc;
  try {
    const tune = abcjs.parseOnly(selectedAbc)[0];
    if (!tune || tune.warnings?.length) return selectedAbc;
    const positions = new Map<string, number>();
    const cadences = new Map<string, DecoratedNote>();
    for (const line of tune.lines) {
      for (const staffIndex of [lowerStaff, inheritAlto ? altoStaff : -1]) {
        if (staffIndex < 0) continue;
        const voices = line.staff?.[staffIndex]?.voices;
        if (!voices) continue;
        if (voices.length !== groups[staffIndex].length) return selectedAbc;
        for (const [voiceIndex, voice] of voices.entries()) {
          const key = `${staffIndex}:${voiceIndex}`;
          let onset = positions.get(key) ?? 0;
          for (const item of voice) {
            if (item.el_type !== 'note') continue;
            if (onset === 34 / 4 && item.duration === 1 / 2 && !item.rest) {
              if (cadences.has(key)) return selectedAbc;
              cadences.set(key, item);
            }
            onset += item.duration ?? 0;
          }
          positions.set(key, onset);
        }
      }
    }
    const edits: { start: number; length: number; text: string }[] = [];
    if (lowerStaff >= 0) {
      const tenor = cadences.get(`${lowerStaff}:0`);
      const bass = cadences.get(`${lowerStaff}:1`);
      if (!tenor?.decoration?.includes('fermata') || !bass?.decoration?.includes('invertedfermata')) return selectedAbc;
      const raw = selectedAbc.slice(tenor.startChar, tenor.endChar);
      const markers = [...raw.matchAll(/!fermata!/g)];
      if (markers.length !== 1) return selectedAbc;
      edits.push({ start: tenor.startChar + markers[0].index, length: '!fermata!'.length, text: ' '.repeat('!fermata!'.length) });
    }
    if (inheritAlto) {
      const alto = cadences.get(`${altoStaff}:0`);
      if (!alto) return selectedAbc;
      if (!alto.decoration?.some((decoration) => decoration.includes('fermata'))) {
        edits.push({ start: alto.startChar, length: 0, text: '!fermata!' });
      }
    }
    let presented = selectedAbc;
    for (const edit of edits.sort((left, right) => right.start - left.start)) {
      presented = presented.slice(0, edit.start) + edit.text + presented.slice(edit.start + edit.length);
    }
    return presented;
  } catch {
    return selectedAbc;
  }
}
