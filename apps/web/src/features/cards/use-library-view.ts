import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { RecallClient } from '@recall/client';
import { useLibrary, type LibraryLoad } from './use-library';
import { lastLibraryPage, type LibraryQuery } from './library-query';
import type { LibraryViewState } from './library-types';

/** Coordinate filters and recover when the final page disappears. Example: useLibraryView(client, revision). */
export function useLibraryView(client: RecallClient, revision: number): LibraryViewState {
  const [query, setQuery] = useState<LibraryQuery>({ search: '', deck: '', page: 0 });
  const response = useLibrary(client, query, revision);
  useEffect(() => reconcileLibraryPage(query, response, setQuery), [query, response]);
  const update = (patch: Partial<LibraryQuery>): void =>
    setQuery((current) => ({ ...current, ...patch }));
  return {
    query,
    response,
    search: (search) => update({ search, page: 0 }),
    selectDeck: (deck) => update({ deck, page: 0 }),
    goToPage: (page) => update({ page }),
  };
}

function reconcileLibraryPage(
  query: LibraryQuery,
  response: LibraryLoad,
  update: Dispatch<SetStateAction<LibraryQuery>>,
): void {
  if (response.loading || response.error) return;
  const validPage = Math.min(query.page, lastLibraryPage(response.result.total));
  if (validPage !== query.page) update((current) => ({ ...current, page: validPage }));
}
