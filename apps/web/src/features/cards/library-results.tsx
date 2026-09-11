import { useEffect, useRef, type RefObject } from 'react';
import { Button } from '@radix-ui/themes';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { ErrorNotice, LoadingState } from '@/components/feedback';
import { lastLibraryPage } from './library-query';
import { LibraryCard } from './library-card';
import { clearLibraryFilters } from './library-toolbar';
import type { LibraryViewProps, LibraryViewState } from './library-types';

interface LibraryResultsProps {
  library: LibraryViewProps;
  state: LibraryViewState;
}

/** Keep loading, errors and pagination consistent. Example: <LibraryResults library={props} state={state} />. */
export function LibraryResults({ library, state }: LibraryResultsProps): React.JSX.Element {
  const { result, loading, error } = state.response;
  const settled = !error && !(loading && !result.total);
  return (
    <div className={`library-results-container ${loading ? 'is-refreshing' : ''}`}>
      {/* A polite status that stays mounted through loading, since a status inserted with its text goes unheard. */}
      <div className="result-label" role="status">
        {settled ? describeResultCount(result.total, state.query.page) : ''}
      </div>
      <LibraryResultsContent library={library} state={state} />
    </div>
  );
}

function LibraryResultsContent({ library, state }: LibraryResultsProps): React.JSX.Element {
  const { result, loading, error } = state.response;
  if (error) return <ErrorNotice message={error} retry={library.refresh} />;
  const outOfBounds = state.query.page > lastLibraryPage(result.total);
  if (loading && (outOfBounds || (!result.cards.length && !result.total))) return <LoadingState />;
  return (
    <>
      <div className="card-grid">
        {result.cards.map((card) => (
          <LibraryCard
            key={card.id}
            card={card}
            deckName={library.decks.find((d) => d.id === card.deck_id)?.name}
            edit={() => library.edit(card)}
          />
        ))}
      </div>
      {!result.cards.length && <EmptyLibrary library={library} state={state} />}
      {/* One page has nowhere to go, so disabled Previous and Next buttons would only be noise. */}
      {lastLibraryPage(result.total) > 0 && result.cards.length > 0 && (
        <LibraryPagination state={state} />
      )}
    </>
  );
}

// The page joins the count, so moving to another page is announced as well.
function describeResultCount(total: number, page: number): string {
  const count = `${total} ${total === 1 ? 'card' : 'cards'}`;
  const pages = lastLibraryPage(total) + 1;
  return pages > 1 ? `${count} · Page ${page + 1} of ${pages}` : count;
}

interface EmptyLibraryCopy {
  title: string;
  detail: string;
}

function EmptyLibrary({ library, state }: LibraryResultsProps): React.JSX.Element {
  const { search, deck } = state.query;
  const copy = describeEmptyLibrary(search, deck);
  return (
    <div className="empty-state">
      <BookOpen size={32} strokeWidth={1.4} />
      <h2>{copy.title}</h2>
      <p>{copy.detail}</p>
      {search ? (
        <Button variant="soft" onClick={() => clearLibraryFilters(state)}>
          Clear filters
        </Button>
      ) : (
        <Button onClick={() => library.create(deck || undefined)}>
          {deck ? 'Create a card' : 'Create your first card'}
        </Button>
      )}
    </div>
  );
}

// An empty deck is not a failed search, so it asks for its first card instead of suggesting other filters.
function describeEmptyLibrary(search: string, deck: string): EmptyLibraryCopy {
  const invitation = 'Write a question and its answer. Recall schedules every review for you.';
  if (search)
    return { title: 'No cards found', detail: 'Try another search or choose a different deck.' };
  if (deck) return { title: 'This deck has no cards yet', detail: invitation };
  return { title: 'No cards yet', detail: invitation };
}

type PageDirection = 'previous' | 'next';
interface PaginationFocus {
  previous: RefObject<HTMLButtonElement | null>;
  next: RefObject<HTMLButtonElement | null>;
  press: (direction: PageDirection) => void;
}

function LibraryPagination({ state }: { state: LibraryViewState }): React.JSX.Element {
  const lastPage = lastLibraryPage(state.response.result.total);
  const page = state.query.page;
  const focus = usePaginationFocus(page, lastPage);
  const go = (direction: PageDirection): void => {
    focus.press(direction);
    state.goToPage(direction === 'next' ? page + 1 : page - 1);
  };
  return (
    <div className="pagination">
      <Button
        ref={focus.previous}
        variant="soft"
        disabled={page === 0}
        onClick={() => go('previous')}
      >
        <ArrowLeft size={16} />
        Previous
      </Button>
      <span>
        Page {page + 1} of {lastPage + 1}
      </span>
      <Button
        ref={focus.next}
        variant="soft"
        disabled={page >= lastPage}
        onClick={() => go('next')}
      >
        Next
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}

// Reaching the first or last page disables the button just pressed, which would drop focus to the page, so the
// other button takes it.
function usePaginationFocus(page: number, lastPage: number): PaginationFocus {
  const previous = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const pressed = useRef<PageDirection | null>(null);
  useEffect(() => {
    const direction = pressed.current;
    pressed.current = null;
    if (!direction) return;
    // A new page starts at its first card, not at the bottom where the last page ended.
    document.querySelector('.library-results-container')?.scrollIntoView({ block: 'start' });
    if (direction === 'next' && page >= lastPage) previous.current?.focus({ preventScroll: true });
    if (direction === 'previous' && page === 0) next.current?.focus({ preventScroll: true });
  }, [page, lastPage]);
  const press = (direction: PageDirection): void => {
    pressed.current = direction;
  };
  return { previous, next, press };
}
