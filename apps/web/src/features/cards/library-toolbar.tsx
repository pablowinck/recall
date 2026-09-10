import { Select, TextField } from '@radix-ui/themes';
import { Search } from 'lucide-react';
import type { Deck } from '@recall/contracts';
import type { LibraryViewProps, LibraryViewState } from './library-types';
import { NewDeckDialog } from './new-deck-dialog';

/** Keep search controls stable while results reload. Example: <LibraryToolbar library={props} state={state} />. */
export function LibraryToolbar({
  library,
  state,
}: {
  library: LibraryViewProps;
  state: LibraryViewState;
}): React.JSX.Element {
  return (
    <div className="library-toolbar">
      <LibrarySearch state={state} />
      <LibraryDeckFilter decks={library.decks} state={state} />
      <NewDeckDialog client={library.client} done={library.refresh} />
    </div>
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
}: {
  decks: Deck[];
  state: LibraryViewState;
}): React.JSX.Element {
  return (
    <Select.Root
      value={state.query.deck || 'all'}
      onValueChange={(val) => state.selectDeck(val === 'all' ? '' : val)}
    >
      <Select.Trigger aria-label="Filter by deck" />
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
