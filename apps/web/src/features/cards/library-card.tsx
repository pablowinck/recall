import { ArrowRight } from 'lucide-react';
import type { Flashcard } from '@recall/contracts';
import { CardInline } from '@/components/card-text';
import { describeCardStatus, summarizeFront } from './card-presentation';

/** Present one editable card without executing its content. Example: <LibraryCard card={card} edit={edit} />. */
export function LibraryCard({
  card,
  deckName,
  edit,
}: {
  card: Flashcard;
  deckName?: string;
  edit: () => void;
}): React.JSX.Element {
  const status = describeCardStatus(card, new Date());
  return (
    <article className="library-card">
      <div className="card-top-row">
        <span className={`card-status ${status.tone}`}>{status.label}</span>
        {deckName && <span className="card-deck-badge">{deckName}</span>}
      </div>
      <h2 dir="auto">
        {/* The button covers the whole card, but its name is only the question, not every word on it. */}
        <button className="card-open" onClick={edit} aria-label={summarizeFront(card.front)}>
          <CardInline text={card.front} />
        </button>
      </h2>
      <p dir="auto">
        <CardInline text={card.back} />
      </p>
      <LibraryTags tags={card.tags} />
      <span className="card-edit-hint" aria-hidden="true">
        Edit card <ArrowRight size={14} />
      </span>
    </article>
  );
}

function LibraryTags({ tags }: { tags: string[] }): React.JSX.Element {
  return (
    <div className="tag-list">
      {tags.slice(0, 3).map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
    </div>
  );
}
