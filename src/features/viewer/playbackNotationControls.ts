import type { VisibleHead } from './playbackTracking';

type FocusMemory = { current: VisibleHead | undefined };
export const NOTATION_KEYBOARD_HELP = 'Tab to the music. Left and Right move through a part; Up and Down move between parts. Home and End go to the first or last note in the part. Enter or Space chooses the next Play start.';

export function refreshNotationTabStop(heads: VisibleHead[], memory: FocusMemory): void {
  const previous = memory.current;
  const current = heads.find(head => head.element === document.activeElement)
    ?? heads.find(head => head.key === previous?.key && head.head === previous.head && head.copy === previous.copy)
    ?? heads[0];
  memory.current = current;
  for (const head of heads) head.element.setAttribute('tabindex', head === current ? '0' : '-1');
}

/** The real glyphs are the controls. There is one Tab stop across all score
 * copies; arrow navigation never changes the pending start until activated. */
export function bindNotationKeyboard({ host, heads, allHeads, memory, label, select, interrupt }: {
  host: HTMLElement; heads: VisibleHead[]; allHeads: () => VisibleHead[]; memory: FocusMemory;
  label: (head: VisibleHead) => string; select: (head: VisibleHead) => void; interrupt: () => void;
}): () => void {
  const restore: (() => void)[] = [];
  const attribute = (element: Element, name: string, value: string) => {
    const old = element.getAttribute(name);
    element.setAttribute(name, value);
    restore.push(() => { if (old === null) element.removeAttribute(name); else element.setAttribute(name, old); });
  };
  // Image roles flatten descendants in assistive technology. Preserve the score
  // and system names, but expose these validated note buttons within groups.
  if (heads.length) {
    attribute(host, 'role', 'group');
    for (const svg of new Set(heads.map(head => head.element.ownerSVGElement))) {
      if (svg) attribute(svg, 'role', 'group');
    }
  }
  const focus = (head: VisibleHead) => {
    memory.current = head;
    refreshNotationTabStop(allHeads(), memory);
    head.element.focus({ preventScroll: true });
    head.element.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: 'instant' });
  };
  for (const head of heads) {
    attribute(head.element, 'role', 'button');
    attribute(head.element, 'tabindex', '-1');
    attribute(head.element, 'aria-label', `${label(head)}. Choose next Play start.`);
    attribute(head.element, 'aria-pressed', 'false');
    attribute(head.element, 'aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Home End Enter Space');
    attribute(head.element, 'aria-description', NOTATION_KEYBOARD_HELP);
    const onFocus = () => { interrupt(); memory.current = head; refreshNotationTabStop(allHeads(), memory); };
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.metaKey || event.ctrlKey) return;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation(); interrupt();
      if (event.key === 'Enter' || event.key === ' ') { select(head); return; }
      const available = allHeads().filter(candidate => candidate.copy === head.copy);
      const order = (a: VisibleHead, b: VisibleHead) => a.onset - b.onset || Number(a.key.split('@')[1]?.split(':')[0]) - Number(b.key.split('@')[1]?.split(':')[0]) || a.head - b.head;
      const part = available.filter(candidate => candidate.voice === head.voice).sort(order);
      const index = part.findIndex(candidate => candidate.element === head.element);
      let next: VisibleHead | undefined;
      if (event.key === 'Home') next = part[0];
      else if (event.key === 'End') next = part.at(-1);
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') next = part[index + (event.key === 'ArrowLeft' ? -1 : 1)];
      else {
        const parts = [...new Set(available.map(candidate => candidate.voice))];
        const voice = parts[parts.indexOf(head.voice) + (event.key === 'ArrowUp' ? -1 : 1)];
        next = available.filter(candidate => candidate.voice === voice)
          .sort((a, b) => Math.abs(a.onset - head.onset) - Math.abs(b.onset - head.onset) || order(a, b))[0];
      }
      if (next) focus(next);
    };
    head.element.addEventListener('focus', onFocus);
    head.element.addEventListener('keydown', onKey);
    restore.push(() => { head.element.removeEventListener('focus', onFocus); head.element.removeEventListener('keydown', onKey); });
  }
  return () => restore.reverse().forEach(remove => remove());
}
