import type { CardDraft, Flashcard } from '@recall/contracts';

type OriginalCard = Pick<Flashcard, 'deck_id' | 'front' | 'back' | 'tags'>;

// The shared card schema allows 12 tags of up to 40 characters. Importing it here would ship the schema library
// to the browser, so the numbers live here and a unit test fails if they ever disagree.
export const TAG_LIMITS = { count: 12, length: 40 } as const;

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

/** Say which tag limit a card breaks before the server rejects it, or null. Example: describeTagProblem(tags). */
export function describeTagProblem(tags: string[]): string | null {
  if (tags.length > TAG_LIMITS.count) return `Use up to ${TAG_LIMITS.count} tags.`;
  if (tags.some((tag) => tag.length > TAG_LIMITS.length))
    return `Keep each tag to ${TAG_LIMITS.length} characters or fewer.`;
  return null;
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
