// Entire frozen HymnsToGod edition, canonical SHA-256:
// 63836ac04c09952a78f1b9c12ccc688f80196fafa1038593225292183eb9b2bb.
// Length + FNV-1a64 follows the existing compact source-witness convention.
// Bind before transforms, then independently bind the full prepared engraving
// copy (including per-voice vocal-placement replay). Unknown copies fail closed.
function matches(abc: string, length: number, expected: bigint) {
  if (abc.length !== length) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index += 1) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  }
  return hash === expected;
}

export function hasOhHowPickupSource(songId: string | undefined, abc: string) {
  return songId === 'hymn-final-htg-oh-how-i-love-jesus' && matches(abc, 5276, 0x2b970b63b029bdbcn);
}

export function hasOhHowPickupNotation(songId: string | undefined, abc: string) {
  return songId === 'hymn-final-htg-oh-how-i-love-jesus' && matches(abc, 4966, 0x5547eae2931965b2n);
}
