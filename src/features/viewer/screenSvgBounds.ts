/** Expand each responsive ABCJS system's own vertical viewport to contain its ink.
 * ABCJS oneSvgPerLine infers a top from the preceding system's bottom. A slur,
 * high accidental or ledger note can extend above that inferred boundary.
 * Keep x/width, SVG children, responsive styles and each wrapper's clipping intact:
 * the larger intrinsic aspect ratio reserves flow space instead of painting over
 * a neighboring system. Call only after an attached screen system is engraved.
 */
export function containScreenSvgSystems(container: HTMLElement) {
  for (const svg of container.querySelectorAll('svg')) {
    if (!svg.querySelector('g') || typeof svg.getBBox !== 'function') continue;
    const box = svg.getAttribute('viewBox')?.trim().split(/\s+/).map(Number);
    if (!box || box.length !== 4 || !box.every(Number.isFinite) || box[2] <= 0 || box[3] <= 0) continue;
    let ink: DOMRect;
    // Root getBBox measures owned children in this SVG's user coordinates,
    // including nested group transforms. It is independent of CSS screen scale.
    try { ink = svg.getBBox(); } catch { continue; }
    if (![ink.x, ink.y, ink.width, ink.height].every(Number.isFinite) || ink.width <= 0 || ink.height <= 0) continue;
    const padding = 2; // Includes the renderer's one-unit default stroke.
    const top = Math.min(box[1], ink.y - padding);
    const bottom = Math.max(box[1] + box[3], ink.y + ink.height + padding);
    if (top !== box[1] || bottom !== box[1] + box[3]) {
      svg.setAttribute('viewBox', `${box[0]} ${top} ${box[2]} ${bottom - top}`);
    }
    // Horizontal overflow remains diagnostic; never shrink or widen the score.
    if (ink.x - padding < box[0] || ink.x + ink.width + padding > box[0] + box[2]) {
      svg.setAttribute('data-screen-horizontal-overflow', 'true');
    } else svg.removeAttribute('data-screen-horizontal-overflow');
  }
}
