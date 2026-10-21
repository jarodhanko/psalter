import { useLayoutEffect, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';

export type DrawerSection = 'song' | 'library' | 'settings';

/** One modal surface. Its children stay mounted so drafts and viewer portals survive dismissal. */
export function ViewerDrawer({ open, section, onSection, onClose, opener, restorePosition, playbackTargetRef, children }: {
  playbackTargetRef?: (element: HTMLDivElement | null) => void;
  open: boolean; section: DrawerSection; onSection: (section: DrawerSection) => void; onClose: () => void;
  opener: RefObject<HTMLElement | null>; restorePosition: RefObject<boolean>; children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const focusAfterClose = useRef<HTMLElement | null>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useLayoutEffect(() => {
    if (!open) {
      // Run after React removes background inertness, not in effect cleanup.
      if (focusAfterClose.current?.isConnected) focusAfterClose.current.focus({ preventScroll: true });
      focusAfterClose.current = null;
      return;
    }
    const body = document.body;
    const scroll = { top: window.scrollY, left: window.scrollX };
    const previous = { position: body.style.position, top: body.style.top, left: body.style.left,
      width: body.style.width, overflow: body.style.overflow };
    // Freeze the measured page width before removing its scrollbar. Otherwise
    // opening the menu can reflow notation (and invalidate its active mapping).
    const width = body.getBoundingClientRect().width || document.documentElement.clientWidth;
    Object.assign(body.style, { position: 'fixed', top: `${-scroll.top}px`, left: `${-scroll.left}px`, width: `${width}px`, overflow: 'hidden' });
    const focusable = () => [...(panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), summary, [tabindex="0"]') ?? [])]
      .filter(element => {
        if (element.closest('[hidden]')) return false;
        for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
          if (ancestor.tagName === 'DETAILS' && !ancestor.hasAttribute('open') && element.closest('summary')?.parentElement !== ancestor) return false;
        }
        return true;
      });
    const focusInside = () => panel.current?.querySelector<HTMLElement>('[data-drawer-section]:not([hidden]) [data-drawer-heading]')?.focus({ preventScroll: true });
    focusInside();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items.at(-1);
      if (!first) { event.preventDefault(); focusInside(); return; }
      const index = items.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (index === -1 || document.activeElement === last)) { event.preventDefault(); first.focus(); }
    };
    const keepFocus = (event: FocusEvent) => { if (!panel.current?.contains(event.target as Node)) focusInside(); };
    document.addEventListener('keydown', keyboard);
    document.addEventListener('focusin', keepFocus);
    return () => {
      document.removeEventListener('keydown', keyboard);
      document.removeEventListener('focusin', keepFocus);
      Object.assign(body.style, previous);
      if (restorePosition.current) {
        window.scrollTo({ ...scroll, behavior: 'auto' });
        focusAfterClose.current = opener.current;
      }
    };
  }, [open, opener, restorePosition]);
  useLayoutEffect(() => {
    if (open) {
      panel.current?.querySelector<HTMLElement>(`[data-drawer-section="${section}"] h2`)?.focus({ preventScroll: true });
      const content = panel.current?.querySelector('.viewer-drawer-content');
      if (content) content.scrollTop = 0;
    }
  }, [open, section]);
  return <div className="viewer-drawer-backdrop" hidden={!open} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={panel} className="viewer-drawer" role="dialog" aria-modal="true" aria-label="Song, library, and score settings">
      <div className="viewer-drawer-header"><strong>Menu</strong><div className="drawer-playback" ref={playbackTargetRef} /><button type="button" aria-label="Close menu" onClick={onClose}>×</button></div>
      <nav className="viewer-drawer-tabs" aria-label="Menu sections">
        {(['song', 'library', 'settings'] as const).map(value => <button type="button" key={value} aria-current={value === section ? 'page' : undefined} onClick={() => onSection(value)}>{value === 'song' ? 'This song' : value === 'library' ? 'Library' : 'Settings'}</button>)}
      </nav>
      <div className="viewer-drawer-content">{children}</div>
    </div>
  </div>;
}
