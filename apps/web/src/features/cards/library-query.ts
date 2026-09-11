export const LIBRARY_PAGE_SIZE = 24;
/** The longest search the API accepts. */
export const LIBRARY_SEARCH_LIMIT = 200;
export interface LibraryQuery {
  search: string;
  deck: string;
  page: number;
}
/** Every card: no search, every deck, the first page. */
export const EMPTY_LIBRARY_QUERY: LibraryQuery = { search: '', deck: '', page: 0 };

/** Encode filters without exposing SQL or trusting raw query fragments. Example: encodeLibraryQuery(query). */
export function encodeLibraryQuery(query: LibraryQuery): string {
  const parameters = new URLSearchParams({
    search: query.search,
    limit: String(LIBRARY_PAGE_SIZE),
    offset: String(query.page * LIBRARY_PAGE_SIZE),
  });
  if (query.deck) parameters.set('deck', query.deck);
  return parameters.toString();
}

/** Keep a zero-based page valid after deletion. Example: lastLibraryPage(24) === 0. */
export function lastLibraryPage(total: number): number {
  const pages = Math.ceil(total / LIBRARY_PAGE_SIZE);
  return Math.max(0, pages - 1);
}
