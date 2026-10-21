/**
 * One-based lookup for the printed 1912 Psalter: index n is Psalter n.
 *
 * Derived from the complete local 1912 catalog at
 * reference/jrvermeer-psalter-2025/Psalter2025/public/1912/psalter.json.
 * Every explicit R:/O:/N: Psalm reference in the canonical ABC agrees with
 * this map. Numbers 433 and 434 are Lord's Prayer settings, not Psalms.
 * The separately photographed 435–450 addenda have their own mapping below.
 */
export const psalmNumbersByPsalterNumber: readonly (number | null)[] = [null,1,1,2,2,3,4,4,4,5,5,5,6,7,8,8,9,9,10,10,11,12,13,14,15,15,15,16,16,16,16,17,17,17,18,18,18,19,19,19,19,19,19,20,20,21,21,22,22,22,22,22,23,23,23,23,23,24,24,24,25,25,25,25,25,25,25,25,25,26,26,27,27,27,27,28,29,30,30,30,31,31,31,32,32,33,33,33,34,34,34,34,35,36,36,37,37,37,37,37,37,37,38,38,39,39,39,39,40,40,40,40,40,41,42,42,42,42,42,43,43,44,44,44,45,45,46,46,46,47,47,48,48,48,48,49,49,50,50,50,51,51,51,51,51,52,53,54,55,55,55,56,56,56,57,57,58,59,60,61,61,62,62,63,63,64,65,65,65,65,65,65,65,66,66,66,67,67,67,68,68,68,68,68,69,69,69,69,70,70,71,71,71,72,72,72,72,72,72,72,72,73,73,73,73,74,75,76,76,77,77,77,77,78,78,78,79,79,80,80,80,80,81,82,83,84,84,84,84,84,85,85,85,86,86,86,86,87,87,87,88,89,89,89,90,90,90,90,91,91,92,92,93,94,95,95,95,96,96,96,97,98,98,98,98,99,99,99,100,100,100,101,102,102,102,102,102,103,103,103,103,103,103,103,103,104,104,104,104,105,106,106,107,107,107,107,107,107,108,108,109,109,110,110,111,112,113,114,115,115,116,116,116,116,117,117,117,118,118,118,118,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,119,120,121,121,121,121,122,122,122,123,124,124,125,125,125,126,126,127,128,129,130,130,130,130,131,132,132,133,133,133,134,135,135,135,136,136,136,137,137,138,139,139,139,140,141,142,142,143,143,143,144,144,145,145,145,145,145,145,146,146,147,147,148,148,149,149,149,150,150,150,150,150,3,25,42,43,47,65,68,84,89,97,98,105,116,118,119,138,150,81,99,null,null];

/** Offset zero is no. 435; null marks a non-Psalm liturgical text. */
export const laterPsalmNumbersByPsalterNumber: readonly (number | null)[] = [null,134,6,19,73,77,79,87,101,103,121,130,122,null,133,null];

export const nonPsalmPsalterItems = {
  433: { kind: 'prayer', label: "The Lord's Prayer (with Amen)" },
  434: { kind: 'prayer', label: 'Our Father Which In Heaven Art (with Amen)' },
  435: { kind: 'commandments', label: 'The Ten Commandments' },
  448: { kind: 'canticle', label: 'The Song of Zacharias (Luke 1)' },
  450: { kind: 'canticle', label: 'Nunc Dimittis (Luke 2)' },
} as const;

export function getPsalmNumber(psalterNumber: number): number | undefined {
  const value = psalterNumber >= 435
    ? laterPsalmNumbersByPsalterNumber[psalterNumber - 435]
    : psalmNumbersByPsalterNumber[psalterNumber];
  return typeof value === 'number' ? value : undefined;
}
