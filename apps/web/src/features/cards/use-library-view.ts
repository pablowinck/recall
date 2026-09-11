import { useEffect } from 'react';
import type { RecallClient } from '@recall/client';
import { useLibrary, type LibraryLoad } from './use-library';
import { EMPTY_LIBRARY_QUERY, lastLibraryPage, type LibraryQuery } from './library-query';
import type { LibraryViewState } from './library-types';

interface LibraryViewInput {
  client: RecallClient;
  revision: number;
  query: LibraryQuery;
  changeQuery: (query: LibraryQuery) => void;
}

/** Coordinate filters and recover when the final page disappears. Example: useLibraryView(input). */
export function useLibraryView({
  client,
  revision,
  query,
  changeQuery,
}: LibraryViewInput): LibraryViewState {
  const response = useLibrary(client, query, revision);
  useEffect(() => {
    const page = validLibraryPage(query, response);
    if (page !== query.page) changeQuery({ ...query, page });
  }, [query, response, changeQuery]);
  const update = (patch: Partial<LibraryQuery>): void => changeQuery({ ...query, ...patch });
  return {
    query,
    response,
    search: (search) => update({ search, page: 0 }),
    selectDeck: (deck) => update({ deck, page: 0 }),
    goToPage: (page) => update({ page }),
    clear: () => changeQuery(EMPTY_LIBRARY_QUERY),
  };
}

// Deleting the last card on the last page leaves a page that no longer exists.
function validLibraryPage(query: LibraryQuery, response: LibraryLoad): number {
  if (response.loading || response.error) return query.page;
  return Math.min(query.page, lastLibraryPage(response.result.total));
}
