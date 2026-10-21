import type { Instrument } from './instrumentIds';
export { isInstrument } from './instrumentIds';
export type { Instrument } from './instrumentIds';

export const instruments = {
  concertGrand: { label: 'Concert grand', bank: 'FluidR3_Salamander_GM', sample: 'acoustic_grand_piano', program: 0, volume: 1, optional: false },
  piano: { label: 'Compact piano', bank: 'FluidR3_GM', sample: 'acoustic_grand_piano', program: 0, volume: 3, optional: false },
  organ: { label: 'Church organ', bank: 'FluidR3_GM', sample: 'church_organ', program: 19, volume: 2, optional: false },
  // Conservative gains follow first-second A3/C4/E4 RMS checks against both pianos.
  guitar: { label: 'Nylon guitar', bank: 'optional-v1', sample: 'acoustic_guitar_nylon', program: 24, volume: 1.5, optional: true },
  harpsichord: { label: 'Harpsichord', bank: 'optional-v1', sample: 'harpsichord', program: 6, volume: 1.5, optional: true },
} as const;

export type OptionalInstrument = { [K in Instrument]: typeof instruments[K]['optional'] extends true ? K : never }[Instrument];
export const isOptionalInstrument = (instrument: Instrument): instrument is OptionalInstrument => instruments[instrument].optional;

export const instrumentSampleForProgram = (program: number): string | undefined => Object.values(instruments).find(instrument => instrument.program === program)?.sample;
