import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { createPortal } from 'react-dom';
import './SongActions.css';

export type SongActionPanel = 'print' | 'share' | 'export';
export interface SongCollectionActions {
  favorite: boolean;
  favoriteDisabled: boolean;
  favoriteLabel?: string;
  addToListDisabled?: boolean;
  onFavorite: () => void;
  onAddToList: () => void;
}

/** Both drawer and standalone menu use the same viewer-owned action callbacks. */
export function SongActions({ target, inline = false, triggerRef, collectionActions, printDisabled, shareDisabled, onOpenPanel }: {
  target?: HTMLElement | null;
  inline?: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  collectionActions?: SongCollectionActions;
  printDisabled: boolean;
  shareDisabled: boolean;
  onOpenPanel: (panel: SongActionPanel) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastItemOnOpen = useRef(false);
  const items = () => [...(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [])];
  const dismiss = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  };
  useLayoutEffect(() => {
    if (!open) return;
    const choices = items();
    (lastItemOnOpen.current ? choices.at(-1) : choices[0])?.focus({ preventScroll: true });
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: Event) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', outside);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', outside);
    };
  }, [open]);
  const select = (action: () => void, trigger: HTMLButtonElement) => {
    if (inline) triggerRef.current = trigger;
    else dismiss(true);
    action();
  };
  const content = <div className="song-actions" ref={rootRef} onKeyDown={event => {
    if (event.key === 'Escape' && open) {
      event.preventDefault();
      event.stopPropagation();
      dismiss(true);
    }
  }}>
    {!inline && <button type="button" ref={triggerRef} className="song-actions-toggle" aria-label="Song actions" title="Song actions" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} onClick={() => {
      lastItemOnOpen.current = false;
      setOpen(value => !value);
    }} onKeyDown={event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        lastItemOnOpen.current = event.key === 'ArrowUp';
        if (open) (lastItemOnOpen.current ? items().at(-1) : items()[0])?.focus();
        else setOpen(true);
      }
    }}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
    </button>}
    {(inline || open) && <div ref={menuRef} id={menuId} role={inline ? 'group' : 'menu'} aria-label="Song actions" className={inline ? 'song-actions-list' : 'song-actions-menu'} onKeyDown={event => {
      if (inline) return;
      const choices = items();
      const index = choices.indexOf(document.activeElement as HTMLButtonElement);
      let next: HTMLButtonElement | undefined;
      if (event.key === 'ArrowDown') next = choices[(index + 1) % choices.length];
      else if (event.key === 'ArrowUp') next = choices[(index - 1 + choices.length) % choices.length];
      else if (event.key === 'Home') next = choices[0];
      else if (event.key === 'End') next = choices.at(-1);
      if (next) { event.preventDefault(); next.focus(); }
    }}>
      <button type="button" role={inline ? undefined : 'menuitem'} tabIndex={inline ? undefined : -1} disabled={printDisabled} onClick={event => select(() => onOpenPanel('print'), event.currentTarget)}>Print</button>
      <button type="button" role={inline ? undefined : 'menuitem'} tabIndex={inline ? undefined : -1} disabled={shareDisabled} onClick={event => select(() => onOpenPanel('share'), event.currentTarget)}>Share</button>
      <button type="button" role={inline ? undefined : 'menuitem'} tabIndex={inline ? undefined : -1} disabled={!collectionActions || collectionActions.favoriteDisabled} onClick={event => select(() => collectionActions?.onFavorite(), event.currentTarget)}>{collectionActions?.favoriteLabel ?? (collectionActions?.favorite ? 'Remove from favorites' : 'Favorite this song')}</button>
      <button type="button" role={inline ? undefined : 'menuitem'} tabIndex={inline ? undefined : -1} disabled={!collectionActions || collectionActions.addToListDisabled} data-add-to-list onClick={event => select(() => collectionActions?.onAddToList(), event.currentTarget)}>Add this song to a list</button>
      <button type="button" role={inline ? undefined : 'menuitem'} tabIndex={inline ? undefined : -1} onClick={event => select(() => onOpenPanel('export'), event.currentTarget)}>Download current ABC</button>
    </div>}
  </div>;
  if (inline && !target) return null;
  return target ? createPortal(content, target) : <div className="song-actions-local">{content}</div>;
}
