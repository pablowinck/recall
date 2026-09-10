import { ArrowRight } from 'lucide-react';
import type { Flashcard } from '@recall/contracts';
import { describeCardStatus } from './card-presentation';

/** Present one editable card without executing its content. Example: <LibraryCard card={card} edit={edit} />. */
export function LibraryCard({
  card,
  edit,
}: {
  card: Flashcard;
  edit: () => void;
}): React.JSX.Element {
  const status = describeCardStatus(card, new Date());
  return (
    <button className="library-card" onClick={edit}>
      <span className={`card-status ${status.tone}`}>{status.label}</span>
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
