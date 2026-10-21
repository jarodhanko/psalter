import { extractUnderlayModel } from './underlayIdentity';
import type { UnderlayIdentityWitness } from './underlayIdentity';

export interface HymnLyricPolicy {
  readonly sourceSha256: string;
  readonly stanzaCount: number;
  /** Original source numbers, including when the full original is restored. */
  readonly hiddenStanzaNumbers: readonly number[];
}

interface SourcePolicy extends HymnLyricPolicy {
  readonly sourceLength: number;
  readonly sourceHash: bigint;
  /** One-based, reviewed whole source lyric lines; never inferred by wording. */
  readonly removedLines?: readonly number[];
  readonly lyricFree?: true;
  readonly underlaySelectionSupported?: true;
}

export interface HymnLyricProjection {
  readonly status: 'filtered' | 'original' | 'unsupported-source';
  readonly sourceSupported: boolean;
  readonly policy: HymnLyricPolicy;
  /** Canonical source for playback, provenance and an explicit original view. */
  readonly originalABC: string;
  /** Presentation only. Never substitute this for the canonical song record. */
  readonly projectedABC: string;
  readonly originalStanzaNumbers: readonly number[];
  readonly allowedStanzaNumbers: readonly number[];
  /** Policy numbers stay available while showing the full original. */
  readonly hiddenStanzaNumbers: readonly number[];
  readonly removedSourceLineNumbers: readonly number[];
  /** Only simple, fully classified carriers qualify for independent selection. */
  readonly underlaySelectionSupported: boolean;
  readonly identity?: UnderlayIdentityWitness;
}

const policies: Readonly<Record<string, SourcePolicy>> = {
  'hymn-oh_o-for-a-thousand-tongues-azmon': {
    sourceSha256: 'cb757f08245199d19cdeed78bcdb9a6a5f06d5969df309391768804a839e1de5',
    sourceLength: 4674, sourceHash: 0xfbc042f02a080b1en,
    stanzaCount: 19, hiddenStanzaNumbers: [15, 18],
    // All four W: lines and the trailing W: separator belong to each stanza.
    removedLines: [104, 105, 106, 107, 108, 119, 120, 121, 122, 123],
    underlaySelectionSupported: true,
  },
  'hymn-final-htg-love-lifted-me': {
    sourceSha256: '24267d538beba5b948c516e30c603b07eb8698c43430524cf0d8f7cdcbb2c54b',
    sourceLength: 5710, sourceHash: 0x3d852c0bb67dfb60n,
    stanzaCount: 3, hiddenStanzaNumbers: [3],
    // Voice 11, verse blocks only. The shared chorus and voice 12 echo remain.
    removedLines: [93, 106, 119, 132],
  },
  'hymn-hc-wonderful-grace': {
    sourceSha256: 'ba05b33a13ec7487a7db0ea06a7fbbff65c0aba3960267ec4d0d359729cd4b4e',
    sourceLength: 5836, sourceHash: 0x75e0120d317ab69bn,
    stanzaCount: 3, hiddenStanzaNumbers: [2],
    // Voice 1, second row of each verse segment. Row 46 begins the shared
    // refrain after verse 1's last word. Voice 3 carries distinct chorus words.
    removedLines: [31, 35, 39, 43, 47],
  },
  'hymn-ly_softly-and-tenderly-thompson': {
    sourceSha256: 'b6d67a4968a97da5a07cf241d24297aaa1457f0faa6c8f97ab590675d6c642a4',
    sourceLength: 3027, sourceHash: 0x38c92aee64818a28n,
    stanzaCount: 3, hiddenStanzaNumbers: [1, 2, 3],
    // With no retained stanza, the shared chorus and tenor echo also disappear.
    lyricFree: true,
  },
  'hymn-remaining-openpsalm-christ-the-lord-is-risen-today': {
    sourceSha256: 'fc98ee48e4232ab39e0ef05703d4934d2c5ad403c9a7053c431fd61344c30376',
    sourceLength: 5586, sourceHash: 0xec77f16d0535480cn,
    stanzaCount: 5, hiddenStanzaNumbers: [3],
    // Both source carriers, including each stanza's own Alleluia.
    removedLines: [43, 49, 55, 61, 75, 81, 87, 93],
    underlaySelectionSupported: true,
  },
};

/** Match the complete, unnormalized source, as with other source witnesses.
 * Tests also pin the canonical SHA-256; line endings and final newlines matter. */
function matchesSource(abc: string, policy: SourcePolicy): boolean {
  if (abc.length !== policy.sourceLength) return false;
  let hash = 14695981039346656037n;
  for (let index = 0; index < abc.length; index++) {
    hash = BigInt.asUintN(64, (hash ^ BigInt(abc.charCodeAt(index))) * 1099511628211n);
  }
  return hash === policy.sourceHash;
}

/** Keep each surviving byte, including whitespace and the original line end. */
const sourceLines = (abc: string): string[] => abc.match(/[^\n]*\n|[^\n]+$/g) ?? [];

/** A changed source has no reviewed stanza mapping. Omit all lyric fields,
 * including their ABC continuations, without guessing which stanza they name. */
function lyricLineNumbers(lines: readonly string[]): number[] {
  const removed: number[] = [];
  let previousFieldWasLyric = false;
  let continuedLyric = false;
  lines.forEach((line, index) => {
    const isLyric = /^[ \t]*[wW]:/.test(line);
    const isContinuation = previousFieldWasLyric && /^[ \t]*\+:/.test(line);
    const remove = isLyric || isContinuation || continuedLyric;
    if (remove) {
      removed.push(index + 1);
      previousFieldWasLyric = true;
      continuedLyric = /\\[ \t]*(?:\r?\n)?$/.test(line);
    } else {
      continuedLyric = false;
      if (!/^[ \t]*(?:%[^\n]*|\r?\n)?$/.test(line)) previousFieldWasLyric = false;
    }
  });
  return removed;
}

/** Derive a display copy only after binding the policy to the exact source.
 * A known ID with changed source fails closed to music without lyrics. The
 * explicit original option always returns the input byte-for-byte. Unknown
 * song IDs have no policy and return undefined for ordinary caller handling. */
export function projectHymnLyrics(
  songId: string | undefined,
  originalABC: string,
  showOriginalLyrics = false,
): HymnLyricProjection | undefined {
  const policy = songId && Object.hasOwn(policies, songId) ? policies[songId] : undefined;
  if (!policy) return undefined;
  const sourceSupported = matchesSource(originalABC, policy);
  const originalStanzaNumbers = Array.from({ length: policy.stanzaCount }, (_, index) => index + 1);
  const allowedStanzaNumbers = showOriginalLyrics ? originalStanzaNumbers : sourceSupported
    ? originalStanzaNumbers.filter(number => !policy.hiddenStanzaNumbers.includes(number)) : [];
  const lines = sourceLines(originalABC);
  const removedSourceLineNumbers = showOriginalLyrics ? [] : !sourceSupported || policy.lyricFree
    ? lyricLineNumbers(lines) : [...policy.removedLines!];
  const removed = new Set(removedSourceLineNumbers);
  const projectedABC = showOriginalLyrics ? originalABC
    : lines.filter((_, index) => !removed.has(index + 1)).join('');
  const model = sourceSupported && policy.underlaySelectionSupported ? extractUnderlayModel(originalABC) : undefined;
  const underlaySelectionSupported = !!model && !model.ambiguous;
  return {
    status: showOriginalLyrics ? 'original' : sourceSupported ? 'filtered' : 'unsupported-source',
    sourceSupported,
    policy: { sourceSha256: policy.sourceSha256, stanzaCount: policy.stanzaCount,
      hiddenStanzaNumbers: [...policy.hiddenStanzaNumbers] },
    originalABC, projectedABC, originalStanzaNumbers, allowedStanzaNumbers,
    hiddenStanzaNumbers: [...policy.hiddenStanzaNumbers], removedSourceLineNumbers,
    underlaySelectionSupported,
    ...(underlaySelectionSupported ? { identity: { rows: model!.rows.map(row => ({
      voiceId: row.voiceId, musicSegment: row.musicSegment, stanzaNumber: row.stanzaNumber,
      sourceText: row.sourceText, role: 'stanza' as const,
    })) } } : {}),
  };
}
