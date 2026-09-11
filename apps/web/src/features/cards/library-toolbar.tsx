import { useEffect, useRef, type RefObject } from 'react';
import { Select, TextField } from '@radix-ui/themes';
import { Search } from 'lucide-react';
import type { Deck } from '@recall/contracts';
import type { LibraryViewProps, LibraryViewState } from './library-types';
import { DeleteDeckButton } from './delete-deck';
import { NewDeckDialog } from './new-deck-dialog';

interface FilterRefocus {
  trigger: RefObject<HTMLButtonElement | null>;
  refocus: () => void;
}

/** Keep search controls stable while results reload. Example: <LibraryToolbar library={props} state={state} />. */
export function LibraryToolbar({
  library,
  state,
}: {
  library: LibraryViewProps;
  state: LibraryViewState;
}): React.JSX.Element {
  const filter = useFilterRefocus();
  return (
    <div className="library-toolbar">
      <LibrarySearch state={state} />
      <LibraryDeckFilter decks={library.decks} state={state} trigger={filter.trigger} />
      <DeleteFilteredDeck library={library} state={state} deleted={filter.refocus} />
      {(state.query.search || state.query.deck) && (
        <button type="button" className="text-button" onClick={() => clearLibraryFilters(state)}>
          Clear filters
        </button>
      )}
      <NewDeckDialog
        client={library.client}
        done={(deck) => {
          // A deck someone just created is the one they mean to fill, so the library shows it right away.
          state.selectDeck(deck.id);
          library.refresh();
        }}
      />
    </div>
  );
}

/** Clear search and deck, then give focus back to the search field, since the pressed button leaves. Example: clearLibraryFilters(state). */
export function clearLibraryFilters(state: LibraryViewState): void {
  state.clear();
  document.querySelector<HTMLInputElement>('.library-toolbar input')?.focus();
}

// The delete control leaves with its deck, so focus returns to the filter, which now shows all decks.
function useFilterRefocus(): FilterRefocus {
  const trigger = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  useEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    trigger.current?.focus();
  });
  return {
    trigger,
    refocus: () => {
      pending.current = true;
    },
  };
}

// Deleting a deck belongs where a deck is already chosen: the filter the library is showing.
function DeleteFilteredDeck({
  library,
  state,
  deleted,
}: {
  library: LibraryViewProps;
  state: LibraryViewState;
  deleted: () => void;
}): React.JSX.Element | null {
  const deck = library.decks.find((item) => item.id === state.query.deck);
  if (!deck) return null;
  return (
    <DeleteDeckButton
      deck={deck}
      decks={library.decks}
      client={library.client}
      done={() => {
        deleted();
        state.clear();
        library.refresh();
      }}
    />
  );
}

function LibrarySearch({ state }: { state: LibraryViewState }): React.JSX.Element {
  return (
    <TextField.Root
      aria-label="Search cards"
      placeholder="Search a word, question, or answer…"
      value={state.query.search}
      onChange={(event) => state.search(event.target.value)}
      size="3"
    >
      <TextField.Slot>
        <Search size={18} />
      </TextField.Slot>
    </TextField.Root>
  );
}

function LibraryDeckFilter({
  decks,
  state,
  trigger,
}: {
  decks: Deck[];
  state: LibraryViewState;
  trigger: RefObject<HTMLButtonElement | null>;
}): React.JSX.Element {
  return (
    <Select.Root
      size="3"
      value={state.query.deck || 'all'}
      onValueChange={(val) => state.selectDeck(val === 'all' ? '' : val)}
    >
      <Select.Trigger ref={trigger} aria-label="Filter by deck" />
      <Select.Content>
        <DeckFilterOptions decks={decks} />
      </Select.Content>
    </Select.Root>
  );
}

function DeckFilterOptions({ decks }: { decks: Deck[] }): React.JSX.Element {
  return (
    <>
      <Select.Item value="all">All decks</Select.Item>
      {decks.map((deck) => (
        <Select.Item key={deck.id} value={deck.id}>
          {deck.name}
        </Select.Item>
      ))}
    </>
  );
}
