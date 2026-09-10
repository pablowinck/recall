import { Button } from '@radix-ui/themes';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { ErrorNotice, LoadingState } from '@/components/feedback';
import { lastLibraryPage } from './library-query';
import { LibraryCard } from './library-card';
import type { LibraryViewProps, LibraryViewState } from './library-types';

interface LibraryResultsProps {
  library: LibraryViewProps;
  state: LibraryViewState;
}

/** Keep loading, errors and pagination consistent. Example: <LibraryResults library={props} state={state} />. */
export function LibraryResults({ library, state }: LibraryResultsProps): React.JSX.Element {
  const { result, loading, error } = state.response;
  if (error) return <ErrorNotice message={error} retry={library.refresh} />;
  if (loading || state.query.page > lastLibraryPage(result.total)) return <LoadingState />;
  return (
    <>
      <div className="result-label">
        {result.total} {result.total === 1 ? 'card' : 'cards'}
      </div>
      <div className="card-grid">
        {result.cards.map((card) => (
          <LibraryCard key={card.id} card={card} edit={() => library.edit(card)} />
        ))}
      </div>
      {!result.cards.length && <EmptyLibrary library={library} state={state} />}
      <LibraryPagination state={state} />
    </>
  );
}

function EmptyLibrary({ library, state }: LibraryResultsProps): React.JSX.Element {
  const filtered = Boolean(state.query.search || state.query.deck);
  return (
    <div className="empty-state">
      <BookOpen size={32} strokeWidth={1.4} />
      <h2>{filtered ? 'No cards found.' : 'Your next discovery belongs here.'}</h2>
      <p>
        {filtered
          ? 'Try another search or choose a different deck.'
          : 'Create your first card and start building your memory.'}
      </p>
      {!state.query.search && <Button onClick={library.create}>Create card</Button>}
    </div>
  );
}

function LibraryPagination({ state }: { state: LibraryViewState }): React.JSX.Element {
  const lastPage = lastLibraryPage(state.response.result.total);
  const page = state.query.page;
  return (
    <div className="pagination">
      <Button variant="soft" disabled={page === 0} onClick={() => state.goToPage(page - 1)}>
        <ArrowLeft size={16} />
        Previous
      </Button>
      <span>
        Page {page + 1} of {lastPage + 1}
      </span>
      <Button variant="soft" disabled={page >= lastPage} onClick={() => state.goToPage(page + 1)}>
        Next
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}
