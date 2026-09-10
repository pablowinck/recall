import type { CardDraft, Flashcard } from '@recall/contracts';

type OriginalCard = Pick<Flashcard, 'deck_id' | 'front' | 'back' | 'tags'>;

/** Preserve learning text while normalizing tag separators. Example: buildCardDraft(fields, deckId). */
export function buildCardDraft(fields: FormData, deckId: string): CardDraft {
  return {
    deck_id: deckId,
    front: String(fields.get('front') ?? ''),
    back: String(fields.get('back') ?? ''),
    tags: String(fields.get('tags') ?? '')
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  };
}

/**
 * Tell whether the editor holds something worth confirming before discarding. Choosing a deck for
 * an otherwise empty new card does not count. Example: hasDraftChanges(draft, card).
 */
export function hasDraftChanges(draft: CardDraft, original?: OriginalCard): boolean {
  if (!original) return Boolean(draft.front.trim() || draft.back.trim() || draft.tags.length);
  if (sameText(draft.front, original.front) && sameText(draft.back, original.back))
    return draft.deck_id !== original.deck_id || !sameTags(draft.tags, original.tags);
  return true;
}

// Cards written by other tools can carry CRLF, and a textarea always reports LF.
function sameText(edited: string, stored: string): boolean {
  return edited.replace(/\r\n?/g, '\n') === stored.replace(/\r\n?/g, '\n');
}

function sameTags(edited: string[], stored: string[]): boolean {
  const clean = (tags: string[]): string => tags.map((tag) => tag.trim()).join('\n');
  return clean(edited) === clean(stored);
}
