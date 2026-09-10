'use client';
import { useState } from 'react';
import { Button, Select, TextField } from '@radix-ui/themes';
import { ArrowLeft, ArrowRight, BookOpen, Plus, Search } from 'lucide-react';
import type { RecallClient } from '@recall/client';
import type { Deck, Flashcard } from '@recall/contracts';
import { ErrorNotice, LoadingState } from '@/components/feedback';
import { useLibrary } from './use-library';
import { NewDeckDialog } from './new-deck-dialog';

interface LibraryProps {
  client: RecallClient;
  decks: Deck[];
  revision: number;
  create: () => void;
  edit: (card: Flashcard) => void;
  refresh: () => void;
}

/** Search and paginate the actual card library. Example: <LibraryView {...props} />. */
export function LibraryView(props: LibraryProps): React.JSX.Element {
  const [search, setSearch] = useState('');
  const [deck, setDeck] = useState('');
  const [page, setPage] = useState(0);
  const { result, loading, error } = useLibrary(props.client, search, deck, page, props.revision);
  return (
    <div className="view-enter">
      <header className="page-header">
        <div>
          <span className="eyebrow">WHAT YOU WANT TO REMEMBER</span>
          <h1>Your library.</h1>
          <p>Words, ideas, and little discoveries.</p>
        </div>
        <Button onClick={props.create}>
          <Plus size={17} />
          New card
        </Button>
      </header>
      <div className="library-toolbar">
        <TextField.Root
          aria-label="Search cards"
          placeholder="Search a word, question, or answer…"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          size="3"
        >
          <TextField.Slot>
            <Search size={18} />
          </TextField.Slot>
        </TextField.Root>
        <Select.Root
          value={deck || 'all'}
          onValueChange={(value) => {
            setDeck(value === 'all' ? '' : value);
            setPage(0);
          }}
        >
          <Select.Trigger aria-label="Filter by deck" />
          <Select.Content>
            <Select.Item value="all">All decks</Select.Item>
            {props.decks.map((item) => (
              <Select.Item key={item.id} value={item.id}>
                {item.name}
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>
        <NewDeckDialog client={props.client} done={props.refresh} />
      </div>
      {error ? (
        <ErrorNotice message={error} retry={props.refresh} />
      ) : loading ? (
        <LoadingState />
      ) : (
        <>
          <div className="result-label">
            {result.total} {result.total === 1 ? 'card' : 'cards'}
          </div>
          <div className="card-grid">
            {result.cards.map((card) => (
              <CardTile key={card.id} card={card} edit={() => props.edit(card)} />
            ))}
          </div>
          {!result.cards.length && (
            <div className="empty-state">
              <BookOpen size={32} strokeWidth={1.4} />
              <h2>{search || deck ? 'No cards found.' : 'Your next discovery belongs here.'}</h2>
              <p>
                {search || deck
                  ? 'Try another search or choose a different deck.'
                  : 'Create your first card and start building your memory.'}
              </p>
              {!search && <Button onClick={props.create}>Create card</Button>}
            </div>
          )}
          <div className="pagination">
            <Button variant="soft" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ArrowLeft size={16} />
              Previous
            </Button>
            <span>
              Page {page + 1} of {Math.max(1, Math.ceil(result.total / 24))}
            </span>
            <Button
              variant="soft"
              disabled={(page + 1) * 24 >= result.total}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ArrowRight size={16} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function CardTile({ card, edit }: { card: Flashcard; edit: () => void }): React.JSX.Element {
  const due = new Date(card.due_at) <= new Date();
  return (
    <button className="library-card" onClick={edit}>
      <span className={`card-status ${card.suspended ? 'paused' : due ? 'ready' : ''}`}>
        {card.suspended
          ? 'Paused'
          : card.schedule === null
            ? 'New'
            : due
              ? 'Due for review'
              : 'Scheduled'}
      </span>
      <h2>{card.front}</h2>
      <p>{card.back}</p>
      <div className="tag-list">
        {card.tags.slice(0, 3).map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <span className="card-edit-hint">
        Edit card <ArrowRight size={14} />
      </span>
    </button>
  );
}
