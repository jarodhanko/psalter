import { useId, useState, type FormEvent } from 'react';
import type { SongbookPackage } from '../../domain/songbookPackage';
import {
  COLLECTION_LIMITS, newCollectionId, resolveSavedSong, sameResolvedSong, savedSongKey,
  type SavedSongList, type SavedSongSelection, type SongListEntry,
} from './songCollections';
import type { SongCollectionsController } from './useSongCollections';
import './CollectionsPanel.css';

export interface CollectionsPanelProps {
  controller: SongCollectionsController;
  currentSelection?: SavedSongSelection;
  songbooks: readonly SongbookPackage[];
  onOpen: (selection: SavedSongSelection) => void;
  onPrint: (list: SavedSongList) => void;
  printBusy?: boolean;
  showCurrentActions?: boolean;
}

function verseSummary(selection: SavedSongSelection): string {
  const verses = selection.settings.selectedPrintVerses;
  return verses === undefined ? 'All verses' : verses.length ? `Verses ${verses.join(', ')}` : 'No verses selected';
}

function SongLabel({ selection, songbooks }: { selection: SavedSongSelection; songbooks: readonly SongbookPackage[] }) {
  const resolved = resolveSavedSong(selection, songbooks);
  const title = resolved?.song.title || selection.title || `${selection.bookName} ${selection.number}`;
  return <>
    <strong>{title}</strong>
    <small>{resolved?.songbook.shortName ?? selection.bookName} {resolved?.song.number ?? selection.number}{resolved?.song.variant ? ` · ${resolved.song.tune || 'Alternate tune'}` : ''}</small>
    {resolved?.notice && <small>{resolved.notice}</small>}
  </>;
}

function ListEntry({ entry, index, list, props, announce }: {
  entry: SongListEntry;
  index: number;
  list: SavedSongList;
  props: CollectionsPanelProps;
  announce: (message: string) => void;
}) {
  const { controller, currentSelection, songbooks, onOpen } = props;
  const { dispatch } = controller;
  const resolved = resolveSavedSong(entry.song, songbooks);
  const canUpdate = currentSelection && sameResolvedSong(currentSelection, entry.song, songbooks);
  const available = entry.song.settings.printVerseSelection?.available;
  const selected = entry.song.settings.selectedPrintVerses ?? available ?? [];
  const title = entry.song.title || `${entry.song.bookName} ${entry.song.number}`;

  const selectVerse = (verse: number, checked: boolean) => {
    dispatch({ type: 'list/set-verse', id: list.id, entryId: entry.id, verse, selected: checked });
  };

  return <li className="collections-entry">
    <button className="collections-song" type="button" disabled={!resolved} onClick={() => onOpen(entry.song)}>
      <SongLabel selection={entry.song} songbooks={songbooks} />
      <small>{verseSummary(entry.song)}{entry.song.settings.transpose ? ` · Key ${entry.song.settings.transpose > 0 ? '+' : ''}${entry.song.settings.transpose}` : ''}</small>
    </button>
    {!resolved && <p className="collections-hint">This book or tune is unavailable. You can keep or remove it.</p>}
    <div className="collections-entry-actions">
      <button type="button" aria-label={`Move ${title} up`} disabled={index === 0} onClick={() => {
        dispatch({ type: 'list/move', id: list.id, entryId: entry.id, direction: -1 });
        announce(`${title} moved to position ${index}.`);
      }}>↑ Up</button>
      <button type="button" aria-label={`Move ${title} down`} disabled={index === list.entries.length - 1} onClick={() => {
        dispatch({ type: 'list/move', id: list.id, entryId: entry.id, direction: 1 });
        announce(`${title} moved to position ${index + 2}.`);
      }}>↓ Down</button>
      <button type="button" aria-label={`Remove ${title} from ${list.name}`} onClick={() => {
        dispatch({ type: 'list/remove', id: list.id, entryId: entry.id });
        announce(`${title} removed from ${list.name}.`);
      }}>Remove</button>
    </div>
    <details className="collections-verse-editor">
      <summary>Saved verses and settings</summary>
      {available?.length ? <fieldset>
        <legend>Verses for {title}</legend>
        <div className="collections-verses">
          {available.map((verse) => <label key={verse}>
            <input type="checkbox" checked={selected.includes(verse)} onChange={(event) => selectVerse(verse, event.target.checked)} />
            Verse {verse}
          </label>)}
        </div>
      </fieldset> : <p className="collections-hint">Open this song to choose verses, then save its current settings here.</p>}
      {canUpdate ? <button type="button" onClick={() => {
        dispatch({ type: 'list/update-entry', id: list.id, entryId: entry.id, song: { ...entry.song, settings: currentSelection.settings } });
        announce(`Updated saved settings for ${title}.`);
      }}>Use current song settings</button> : <p className="collections-hint">Open this song to update its saved key, parts, and tempo.</p>}
    </details>
  </li>;
}

function ListEditor({ list, props, announce }: { list: SavedSongList; props: CollectionsPanelProps; announce: (message: string) => void }) {
  const { controller, currentSelection, songbooks, onPrint, printBusy } = props;
  const { dispatch } = controller;
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(list.name);
  const [deleting, setDeleting] = useState(false);
  const nameId = useId();
  const unavailable = list.entries.some((entry) => !resolveSavedSong(entry.song, songbooks));
  const rename = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    dispatch({ type: 'list/rename', id: list.id, name: name.trim() });
    setRenaming(false);
    announce('List renamed.');
  };

  return <div className="collections-list-editor">
    <div className="collections-entry-actions">
      <button type="button" onClick={() => { setName(list.name); setRenaming(!renaming); setDeleting(false); }}>Rename list</button>
      <button type="button" onClick={() => { setDeleting(!deleting); setRenaming(false); }}>Delete list</button>
    </div>
    {renaming && <form className="collections-form" onSubmit={rename}>
      <label htmlFor={nameId}>Rename list to</label>
      <input id={nameId} value={name} maxLength={COLLECTION_LIMITS.name} required onChange={(event) => setName(event.target.value)} />
      <div className="collections-entry-actions">
        <button type="submit" disabled={!name.trim()}>Save name</button>
        <button type="button" onClick={() => setRenaming(false)}>Cancel rename</button>
      </div>
    </form>}
    {deleting && <div className="collections-delete-confirmation">
      <p>Delete “{list.name}” and its {list.entries.length} saved song selections?</p>
      <div className="collections-entry-actions">
        <button type="button" onClick={() => { dispatch({ type: 'list/delete', id: list.id }); announce(`Deleted ${list.name}.`); }}>Confirm delete</button>
        <button type="button" onClick={() => setDeleting(false)}>Keep list</button>
      </div>
    </div>}
    {props.showCurrentActions !== false && <><button className="collections-primary" type="button" disabled={!currentSelection || list.entries.length >= COLLECTION_LIMITS.entries} onClick={() => {
      if (!currentSelection) return;
      dispatch({ type: 'list/add', id: list.id, entryId: newCollectionId(), song: currentSelection });
      announce(`Added ${currentSelection.title || currentSelection.number} to ${list.name}.`);
    }}>Add current song to list</button>
    <p className="collections-hint">Saves this song’s current key, parts, tempo, and print verse selection.</p></>}
    {list.entries.length >= COLLECTION_LIMITS.entries && <p className="collections-hint">This list has reached its {COLLECTION_LIMITS.entries}-song limit.</p>}
    {list.entries.length ? <ol className="collections-list">
      {list.entries.map((entry, index) => <ListEntry key={entry.id} entry={entry} index={index} list={list} props={props} announce={announce} />)}
    </ol> : <p className="collections-hint">{props.showCurrentActions === false ? 'Your list is empty. Open This song and choose Add this song to a list.' : 'Your list is empty. Find a song, choose its verses, and add it here.'}</p>}
    <button className="collections-primary" type="button" disabled={!list.entries.length || unavailable || printBusy} onClick={() => onPrint(list)}>
      {printBusy ? 'Preparing booklet…' : 'Print list booklet'}
    </button>
    {unavailable && <p className="collections-hint">Printing is unavailable while this list contains a missing book or tune.</p>}
  </div>;
}

/** A compact local library; navigation and booklet rendering stay with the host. */
export function CollectionsPanel(props: CollectionsPanelProps) {
  const { controller, currentSelection, songbooks, onOpen } = props;
  const { collections, dispatch, storageNotice } = controller;
  const [newName, setNewName] = useState('');
  const [selectedListId, setSelectedListId] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const id = useId();
  const selectedList = collections.lists.find((list) => list.id === selectedListId) ?? collections.lists[0];
  const savedFavorites = currentSelection ? collections.favorites.filter(saved => sameResolvedSong(saved, currentSelection, songbooks)) : [];
  const savedFavorite = savedFavorites.find(saved => saved.bookId === currentSelection?.bookId) ?? savedFavorites[0];
  const favorite = !!savedFavorite;
  const favoriteFull = collections.favorites.length >= COLLECTION_LIMITS.favorites;

  const createList = (event: FormEvent) => {
    event.preventDefault();
    if (!newName.trim() || collections.lists.length >= COLLECTION_LIMITS.lists) return;
    const listId = newCollectionId();
    dispatch({ type: 'list/create', id: listId, name: newName.trim() });
    setSelectedListId(listId);
    setNewName('');
    setAnnouncement('List created.');
  };

  if (!controller.ready) return <section className="collections-panel" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>My library</h2>
    <p role="status">Loading saved library…</p>
  </section>;

  return <section className="collections-panel" aria-labelledby={`${id}-title`}>
    <h2 id={`${id}-title`}>My library</h2>
    <p className="collections-hint">Saved only in this browser on this website. Other devices, browsers, and website addresses have separate libraries. Clearing site data removes these saves.</p>
    {storageNotice && <p className="collections-storage-notice" role="status">{storageNotice}</p>}
    {props.showCurrentActions !== false && <button className="collections-primary" type="button" aria-pressed={favorite} disabled={!currentSelection || (!favorite && favoriteFull)} onClick={() => {
      if (!currentSelection) return;
      dispatch(savedFavorite ? { type: 'favorite/remove', bookId: savedFavorite.bookId, songId: savedFavorite.songId }
        : { type: 'favorite/add', song: currentSelection });
      setAnnouncement(savedFavorites.length > 1 ? `Removed the favorite saved in ${savedFavorite.bookName}. Another saved version remains in favorites.`
        : favorite ? 'Removed from favorites.' : 'Added to favorites.');
    }}>{savedFavorites.length > 1 ? `Remove favorite saved in ${savedFavorite.bookName}` : favorite ? 'Remove current song from favorites' : 'Favorite current song'}</button>}
    {favoriteFull && <p className="collections-hint">Your {COLLECTION_LIMITS.favorites} favorites are full. Remove one to add another.</p>}
    <details className="collections-section">
      <summary>View favorites ({collections.favorites.length})</summary>
      {collections.favorites.length ? <ul className="collections-songs">
        {collections.favorites.map((song) => <li key={savedSongKey(song)}>
          <button className="collections-song" type="button" disabled={!resolveSavedSong(song, songbooks)} onClick={() => onOpen(song)}>
            <SongLabel selection={song} songbooks={songbooks} />
          </button>
          {!resolveSavedSong(song, songbooks) && <small>Book or tune unavailable</small>}
          <button type="button" aria-label={`Remove ${song.title || song.number} from favorites`} onClick={() => dispatch({ type: 'favorite/remove', bookId: song.bookId, songId: song.songId })}>Remove</button>
        </li>)}
      </ul> : <p className="collections-hint">Favorite a song to find it here.</p>}
    </details>
    <details className="collections-section">
      <summary>Recently opened ({collections.recent.length})</summary>
      {collections.recent.length ? <>
        <ol className="collections-songs">
          {collections.recent.map(({ song }) => <li key={savedSongKey(song)}>
            <button className="collections-song" type="button" disabled={!resolveSavedSong(song, songbooks)} onClick={() => onOpen(song)}>
              <SongLabel selection={song} songbooks={songbooks} />
            </button>
            {!resolveSavedSong(song, songbooks) && <small>Book or tune unavailable</small>}
          </li>)}
        </ol>
        <button type="button" onClick={() => { dispatch({ type: 'recent/clear' }); setAnnouncement('Recent songs cleared.'); }}>Clear recent songs</button>
      </> : <p className="collections-hint">The last {COLLECTION_LIMITS.recent} songs you open will appear here.</p>}
    </details>
    <details className="collections-section" open>
      <summary>Manage lists ({collections.lists.length})</summary>
      <form className="collections-form" onSubmit={createList}>
        <label htmlFor={`${id}-new-list`}>New list name</label>
        <input id={`${id}-new-list`} maxLength={COLLECTION_LIMITS.name} value={newName} required onChange={(event) => setNewName(event.target.value)} placeholder="Sunday service" />
        <button type="submit" disabled={!newName.trim() || collections.lists.length >= COLLECTION_LIMITS.lists}>Create list</button>
      </form>
      {collections.lists.length >= COLLECTION_LIMITS.lists && <p className="collections-hint">You have reached the {COLLECTION_LIMITS.lists}-list limit.</p>}
      {selectedList && <>
        <label className="collections-field-label" htmlFor={`${id}-choose-list`}>Saved list</label>
        <select id={`${id}-choose-list`} value={selectedList.id} onChange={(event) => setSelectedListId(event.target.value)}>
          {collections.lists.map((list) => <option key={list.id} value={list.id}>{list.name} ({list.entries.length})</option>)}
        </select>
        <ListEditor key={selectedList.id} list={selectedList} props={props} announce={setAnnouncement} />
      </>}
    </details>
    <p className="collections-announcement" role="status" aria-live="polite">{announcement}</p>
  </section>;
}
