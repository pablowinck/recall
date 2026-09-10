import { ArrowRight, BookOpen } from 'lucide-react';
import type { Deck } from '@recall/contracts';

interface DeckListProps {
  decks: Deck[];
  study: (deck?: string) => void;
  browse: () => void;
}

/** Open the appropriate action for each owned deck. Example: <DeckList {...props} />. */
export function DeckList(props: DeckListProps): React.JSX.Element {
  return (
    <section className="decks-section">
      <DeckListHeading browse={props.browse} />
      <div className="deck-list">
        {props.decks.map((deck) => (
          <DeckRow
            key={deck.id}
            deck={deck}
            open={() => (deck.due_count ? props.study(deck.id) : props.browse())}
          />
        ))}
      </div>
    </section>
  );
}

function DeckListHeading({ browse }: { browse: () => void }): React.JSX.Element {
  return (
    <div className="section-heading">
      <h2>Your decks</h2>
      <button className="text-button" onClick={browse}>
        Browse library <ArrowRight size={16} />
      </button>
    </div>
  );
}

function DeckRow({ deck, open }: { deck: Deck; open: () => void }): React.JSX.Element {
  return (
    <button className="deck-row" onClick={open}>
      <span className="deck-icon">
        <BookOpen size={23} strokeWidth={1.5} />
      </span>
      <span className="deck-description">
        <strong>{deck.name}</strong>
        <span>
          {deck.card_count} {deck.card_count === 1 ? 'card' : 'cards'}
        </span>
      </span>
      <span className={`due-badge ${deck.due_count ? '' : 'neutral'}`}>
        {deck.due_count ? `${deck.due_count} due for review` : 'Up to date'}
      </span>
      <ArrowRight className="deck-arrow" size={18} />
    </button>
  );
}
