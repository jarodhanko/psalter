/** A single Psalm in the King James Version. Verse numbers follow eBible.org's VPL data. */
export type Psalm = {
  readonly number: number;
  /** Unnumbered superscription, when the source includes one. */
  readonly title?: string;
  readonly verses: readonly {
    readonly number: number;
    readonly text: string;
  }[];
};

let psalmsPromise: Promise<readonly Psalm[]> | undefined;

/** Load the compact JSON corpus on demand; Vite emits it as a lazy JS chunk,
 * which is included by this app's existing PWA JavaScript precache pattern.
 */
export function loadKjvPsalms(): Promise<readonly Psalm[]> {
  if (!psalmsPromise) {
    psalmsPromise = import('./psalms/kjvPsalms.json')
      .then(({ default: psalms }) => psalms as readonly Psalm[])
      .catch((error: unknown) => {
        psalmsPromise = undefined;
        throw error;
      });
  }

  return psalmsPromise;
}

/** Return one Psalm by its canonical KJV number, or undefined outside 1–150. */
export async function getKjvPsalm(number: number): Promise<Psalm | undefined> {
  if (!Number.isInteger(number) || number < 1 || number > 150) return undefined;
  return (await loadKjvPsalms())[number - 1];
}
