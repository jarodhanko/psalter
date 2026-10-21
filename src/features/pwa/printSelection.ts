import { legacyPrintSelectionWitnesses } from '../../data/legacyPrintSelectionWitnesses';
import type { PrintVerseSelection } from './updateSession';

const sameNumbers = (left: readonly number[], right: readonly number[]) => left.length === right.length
  && left.every(number => right.includes(number));

/** Preserve explicit subsets; expand only a proven previous all/default choice. */
export function restorePrintVerseSelection(
  songId: string, sourceSha256: string | undefined, current: readonly number[],
  selected: readonly number[] | undefined, saved: PrintVerseSelection | undefined,
): number[] {
  if (selected === undefined) return saved === undefined ? [...current] : [];
  const retained = selected.filter(number => current.includes(number));
  if (saved !== undefined) {
    return saved && saved.available.every(number => current.includes(number))
      && sameNumbers(selected, saved.available) ? [...current] : retained;
  }
  if (!sourceSha256 || !Object.hasOwn(legacyPrintSelectionWitnesses, songId)) return retained;
  const witness = legacyPrintSelectionWitnesses[songId];
  return witness && witness.sha256 === sourceSha256 && sameNumbers(current, witness.current)
    && sameNumbers(selected, witness.previous) ? [...current] : retained;
}
