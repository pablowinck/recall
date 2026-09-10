import { ArrowRight } from 'lucide-react';
import type { Flashcard } from '@recall/contracts';
import { describeCardStatus } from './card-presentation';

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
    <button className="library-card" onClick={edit}>
      <div className="card-top-row">
        <span className={`card-status ${status.tone}`}>{status.label}</span>
        {deckName && <span className="card-deck-badge">{deckName}</span>}
      </div>
      <h2>{card.front}</h2>
      <p>{card.back}</p>
      <LibraryTags tags={card.tags} />
      <span className="card-edit-hint">
        Edit card <ArrowRight size={14} />
      </span>
    </button>
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
