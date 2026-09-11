import { useLayoutEffect, useRef, type RefObject } from 'react';
import { ArrowRight } from 'lucide-react';
import type { Flashcard } from '@recall/contracts';
import { CardInline } from '@/components/card-text';
import { focusPageHeading } from '@/components/page-heading';
import { describeCardStatus, previewText, summarizeFront } from './card-presentation';

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
  const opener = useFocusHandoffOnRemoval();
  return (
    <article className="library-card">
      <div className="card-top-row">
        <span className={`card-status ${status.tone}`}>{status.label}</span>
        {deckName && <span className="card-deck-badge">{deckName}</span>}
      </div>
      <h2 dir="auto">
        {/* The button covers the whole card, but its name is only the question, not every word on it. */}
        <button
          ref={opener}
          className="card-open"
          onClick={edit}
          aria-label={summarizeFront(card.front)}
        >
          <CardInline text={card.front} />
        </button>
      </h2>
      <p dir="auto">
        <CardInline text={previewText(card.back)} />
      </p>
      <LibraryTags tags={card.tags} />
      <span className="card-edit-hint" aria-hidden="true">
        Edit card <ArrowRight size={14} />
      </span>
    </article>
  );
}

// Three tags keep a card short; the rest are counted, so no tag looks lost.
const VISIBLE_TAGS = 3;

function LibraryTags({ tags }: { tags: string[] }): React.JSX.Element {
  const hidden = tags.length - VISIBLE_TAGS;
  return (
    <div className="tag-list">
      {tags.slice(0, VISIBLE_TAGS).map((tag) => (
        <span key={tag}>{tag}</span>
      ))}
      {hidden > 0 && <span className="tag-more">+{hidden} more</span>}
    </div>
  );
}

// A tile can leave while it has focus, when its card moves to another deck or is deleted; focus then goes to the
// page title rather than the page itself. Layout cleanups run before React removes the tile, so focus is still on it.
function useFocusHandoffOnRemoval(): RefObject<HTMLButtonElement | null> {
  const button = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const node = button.current;
    return () => {
      if (node && document.activeElement === node) queueMicrotask(focusPageHeading);
    };
  }, []);
  return button;
}
