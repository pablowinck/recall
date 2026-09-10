import type { CardDraft } from '@recall/contracts';

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
