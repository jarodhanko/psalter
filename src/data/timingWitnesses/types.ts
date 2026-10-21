import type { UnderlayIdentityWitness } from '../../domain/underlayIdentity';

export type SourceBoundTimingId = 'psalter3' | 'psalter8' | 'psalter17b' | 'psalter23b' | 'psalter43' | 'psalter55' | 'psalter56' | 'psalter29' | 'psalter73' | 'psalter115' | 'psalter190' | 'hymn-aperio-wayfaring-stranger';
export type TimingVoice = 'T1' | 'T2' | 'B1' | 'B2' | 'S' | 'A' | 'T' | 'B' | 'B3' | '1' | '2' | '3' | '4';
export interface TimingWitness {
  readonly id: SourceBoundTimingId;
  readonly source: string;
  readonly priority: readonly TimingVoice[];
  /** Source declaration order; omitted for the existing T1/T2/B1/B2 editions. */
  readonly voiceIds?: readonly TimingVoice[];
  /** Reviewed cue-only lanes must never inherit the shared sung rows. */
  readonly lyricFreeVoices?: readonly TimingVoice[];
  /** Exact registered row identities for an unnumbered source; never inferred. */
  readonly underlayIdentity?: UnderlayIdentityWitness;
  readonly rows: readonly (readonly string[])[];
  readonly alternateSegments?: Readonly<Partial<Record<TimingVoice, Readonly<Record<number, readonly string[]>>>>>;
}
