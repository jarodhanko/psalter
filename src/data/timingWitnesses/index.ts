import type { SourceBoundTimingId, TimingWitness } from './types';

// The only admission route is this explicit roster of independently reviewed modules.
// Keep imports lazy: common viewer/catalog code must not carry all timing records.
const loaders = {
  'hymn-aperio-wayfaring-stranger': () => import('./timing-hymn-aperio-wayfaring-stranger'),
  psalter55: () => import('./timing-psalter55'),
  psalter56: () => import('./timing-psalter56'),
  psalter43: () => import('./timing-psalter43'),
  psalter3: () => import('./timing-psalter3'),
  psalter8: () => import('./timing-psalter8'),
  psalter17b: () => import('./timing-psalter17b'),
  psalter23b: () => import('./timing-psalter23b'),
  psalter29: () => import('./timing-psalter29'),
  psalter73: () => import('./timing-psalter73'),
  psalter115: () => import('./timing-psalter115'),
  psalter190: () => import('./timing-psalter190'),
} satisfies Record<SourceBoundTimingId, () => Promise<{ default: TimingWitness }>>;

declare const sourceTimingContextBrand: unique symbol;
/** Opaque, per-song evidence. Cloning or structurally imitating this object cannot admit a record. */
export interface SourceTimingContext { readonly [sourceTimingContextBrand]: true; }
const admitted = new WeakMap<SourceTimingContext, TimingWitness>();
const pending = new Map<SourceBoundTimingId, Promise<SourceTimingContext>>();

function freezeEvidence<T>(value: T): T {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freezeEvidence(child);
    Object.freeze(value);
  }
  return value;
}

/** Unsupported IDs explicitly have no timing policy. A known record's failed load rejects. */
export function loadSourceTimingContext(songId: string): Promise<SourceTimingContext | null> {
  if (!Object.hasOwn(loaders, songId)) return Promise.resolve(null);
  const id = songId as SourceBoundTimingId;
  const existing = pending.get(id);
  if (existing) return existing;
  const loading = loaders[id]().then(({ default: record }) => {
    if (record.id !== id) throw new Error('Timing evidence does not match the requested arrangement.');
    const context = Object.freeze({}) as SourceTimingContext;
    admitted.set(context, freezeEvidence(record));
    return context;
  }).catch((error: unknown) => {
    pending.delete(id);
    throw error;
  });
  pending.set(id, loading);
  return loading;
}

/** Internal read access never admits caller-provided evidence or a different arrangement. */
export function getSourceTimingWitness(
  context: SourceTimingContext | null | undefined, songId: string | undefined,
): TimingWitness | undefined {
  const record = context && admitted.get(context);
  return record && record.id === songId ? record : undefined;
}

/** A known arrangement cannot render or play before its own evidence is loaded. */
export function isSourceTimingReady(songId: string | undefined, context?: SourceTimingContext | null): boolean {
  return !songId || !Object.hasOwn(loaders, songId) || !!getSourceTimingWitness(context, songId);
}
