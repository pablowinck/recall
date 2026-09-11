import {
  EMPTY_LIBRARY_QUERY,
  LIBRARY_SEARCH_LIMIT,
  type LibraryQuery,
} from '../cards/library-query';
import type { WorkspaceView } from './navigation-types';

export const WORKSPACE_ROOT = '/app';
const VIEW_PATHS: Record<WorkspaceView, string> = {
  today: WORKSPACE_ROOT,
  library: `${WORKSPACE_ROOT}/library`,
  connections: `${WORKSPACE_ROOT}/connections`,
  study: `${WORKSPACE_ROOT}/study`,
};

// Only a deck id travels from an address to the API; anything else means every deck.
const DECK_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VIEW_TITLES: Record<WorkspaceView, string> = {
  today: 'Today',
  library: 'Library',
  connections: 'Connections',
  study: 'Review session',
};

/** What an address holds: a view, the deck a review covers, and the library's search, deck and page. */
export interface WorkspaceAddress {
  view: WorkspaceView;
  studyDeck?: string;
  library: LibraryQuery;
}

/** Name a view for browser tabs and the history menu. Example: workspaceTitle('library'). */
export function workspaceTitle(view: WorkspaceView): string {
  return `${VIEW_TITLES[view]} · Recall`;
}

/** The address of a place in the workspace. Example: workspacePath({ view: 'study', studyDeck, library }). */
export function workspacePath({ view, studyDeck, library }: WorkspaceAddress): string {
  const query = new URLSearchParams();
  if (view === 'study' && studyDeck) query.set('deck', studyDeck);
  if (view === 'library') writeLibraryQuery(query, library);
  const encoded = query.toString();
  return encoded ? `${VIEW_PATHS[view]}?${encoded}` : VIEW_PATHS[view];
}

/**
 * The place an address opens; a part it cannot use falls back to Today, every deck or the first page.
 * Example: workspaceAddressFrom('/app/library', new URLSearchParams('q=verbs&page=2')).
 */
export function workspaceAddressFrom(path: string, query: URLSearchParams): WorkspaceAddress {
  const view = viewFromPath(path);
  return {
    view,
    studyDeck: view === 'study' ? deckIdFrom(query.get('deck')) : undefined,
    library: view === 'library' ? libraryQueryFrom(query) : EMPTY_LIBRARY_QUERY,
  };
}

function viewFromPath(path: string): WorkspaceView {
  const [segment] = path.replace(WORKSPACE_ROOT, '').split('/').filter(Boolean);
  const views = Object.keys(VIEW_PATHS) as WorkspaceView[];
  return views.find((view) => view === segment) ?? 'today';
}

// People count pages from 1, so an address does too; the library counts from 0.
function writeLibraryQuery(query: URLSearchParams, library: LibraryQuery): void {
  if (library.search) query.set('q', library.search);
  if (library.deck) query.set('deck', library.deck);
  if (library.page > 0) query.set('page', String(library.page + 1));
}

// A page past the end settles on the last page once the cards load.
function libraryQueryFrom(query: URLSearchParams): LibraryQuery {
  const page = Number(query.get('page'));
  return {
    search: (query.get('q') ?? '').slice(0, LIBRARY_SEARCH_LIMIT),
    deck: deckIdFrom(query.get('deck')) ?? '',
    page: Number.isSafeInteger(page) && page > 1 ? page - 1 : 0,
  };
}

function deckIdFrom(value: string | null): string | undefined {
  return value && DECK_ID.test(value) ? value : undefined;
}
