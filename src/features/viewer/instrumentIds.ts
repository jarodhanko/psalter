// Portable IDs stay small enough to validate shared/saved settings before the viewer loads.
const instrumentIds = ['piano', 'concertGrand', 'organ', 'guitar', 'harpsichord'] as const;
export type Instrument = typeof instrumentIds[number];
export const isInstrument = (value: unknown): value is Instrument => typeof value === 'string' && (instrumentIds as readonly string[]).includes(value);
