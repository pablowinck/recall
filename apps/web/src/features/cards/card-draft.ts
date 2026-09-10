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
  if (draft.front !== original.front || draft.back !== original.back) return true;
  return draft.deck_id !== original.deck_id || draft.tags.join('\n') !== original.tags.join('\n');
}
