export const MIN_SCORE_SCALE = 0.5;
export const MAX_SCORE_SCALE = 1.75;
export const SCORE_SCALE_STEP = 0.05;

export function clampScoreScale(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Number((Math.round(Math.min(MAX_SCORE_SCALE, Math.max(MIN_SCORE_SCALE, value)) / SCORE_SCALE_STEP) * SCORE_SCALE_STEP).toFixed(2));
}
