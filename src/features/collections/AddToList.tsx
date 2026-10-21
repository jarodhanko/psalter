import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { COLLECTION_LIMITS, newCollectionId, type SavedSongSelection } from './songCollections';
import type { SongCollectionsController } from './useSongCollections';
import './CollectionsPanel.css';

/** A direct song action using the same local collection reducer as My library. */
export function AddToList({ controller, currentSelection, onClose, focusRequest }: {
  controller: SongCollectionsController;
  focusRequest: number;
  currentSelection?: SavedSongSelection;
  onClose: () => void;
}) {
  const { collections, dispatch, storageNotice } = controller;
  const [listId, setListId] = useState(collections.lists[0]?.id ?? '');
  const [name, setName] = useState('');
  const [notice, setNotice] = useState('');
  const panelRef = useRef<HTMLElement>(null);
  const id = useId();
  const list = collections.lists.find(candidate => candidate.id === listId) ?? collections.lists[0];
  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
    panelRef.current?.scrollIntoView?.({ block: 'nearest', behavior: 'auto' });
  }, [focusRequest]);
  const createAndAdd = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !currentSelection || collections.lists.length >= COLLECTION_LIMITS.lists) return;
    const nextId = newCollectionId();
    dispatch({ type: 'list/create-with-entry', id: nextId, name: name.trim(), entryId: newCollectionId(), song: currentSelection });
    setListId(nextId);
    setNotice(`Created ${name.trim()} and added this song.`);
    setName('');
  };
  if (!controller.ready) return <section ref={panelRef} className="add-to-list-panel" tabIndex={-1} aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`}>Add this song to a list</h3>
    <p role="status">Loading saved library…</p>
    <button type="button" onClick={onClose}>Close</button>
  </section>;
  return <section ref={panelRef} className="add-to-list-panel" tabIndex={-1} aria-labelledby={`${id}-title`} onKeyDown={event => {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
  }}>
    <h3 id={`${id}-title`}>Add this song to a list</h3>
    <p>Saves the current key, parts, tempo, and print verses only in this browser on this website.</p>
    {list && <form onSubmit={event => {
      event.preventDefault();
      if (!currentSelection || list.entries.length >= COLLECTION_LIMITS.entries) return;
      dispatch({ type: 'list/add', id: list.id, entryId: newCollectionId(), song: currentSelection });
      setNotice(`Added this song to ${list.name}.`);
    }}>
      <label htmlFor={`${id}-list`}>Saved list</label>
      <select id={`${id}-list`} value={list.id} onChange={event => { setListId(event.target.value); setNotice(''); }}>
        {collections.lists.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name} ({candidate.entries.length})</option>)}
      </select>
      <button type="submit" disabled={!currentSelection || list.entries.length >= COLLECTION_LIMITS.entries}>Add song</button>
      {list.entries.length >= COLLECTION_LIMITS.entries && <p>This list has reached its {COLLECTION_LIMITS.entries}-song limit.</p>}
    </form>}
    <form onSubmit={createAndAdd}>
      <label htmlFor={`${id}-name`}>New list name</label>
      <input id={`${id}-name`} value={name} maxLength={COLLECTION_LIMITS.name} onChange={event => setName(event.target.value)} />
      <button type="submit" disabled={!currentSelection || !name.trim() || collections.lists.length >= COLLECTION_LIMITS.lists}>Create list and add song</button>
      {collections.lists.length >= COLLECTION_LIMITS.lists && <p>Your {COLLECTION_LIMITS.lists} lists are full.</p>}
    </form>
    <p role="status">{notice}{storageNotice ? ` ${storageNotice}` : ''}</p>
    <button type="button" onClick={onClose}>Close</button>
  </section>;
}
