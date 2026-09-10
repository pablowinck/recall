import type { RecallClient } from '@recall/client';
import type { Deck, Flashcard } from '@recall/contracts';
import type { LibraryQuery } from './library-query';
import type { LibraryLoad } from './use-library';

export interface LibraryViewProps {
  client: RecallClient;
  decks: Deck[];
  revision: number;
  create: () => void;
  edit: (card: Flashcard) => void;
  refresh: () => void;
}
export interface LibraryViewState {
  query: LibraryQuery;
  response: LibraryLoad;
  search: (value: string) => void;
  selectDeck: (value: string) => void;
  goToPage: (page: number) => void;
}
