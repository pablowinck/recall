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
    tags: withoutCaseRepeats(
      String(fields.get('tags') ?? '')
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  };
}

/** Say which tag limit a card breaks before the server rejects it, or null. Example: describeTagProblem(tags). */
export function describeTagProblem(tags: string[]): string | null {
  if (tags.length > TAG_LIMITS.count) return `Use up to ${TAG_LIMITS.count} tags.`;
  if (tags.some((tag) => tag.length > TAG_LIMITS.length))
    return `Keep each tag to ${TAG_LIMITS.length} characters or fewer.`;
  return null;
}

// Same reason as TAG_LIMITS: the shared schema allows 4,000 characters on the front and 8,000 on the back.
export const TEXT_LIMITS = { front: 4000, back: 8000 } as const;

/** Say which side of a card is too long, and by how much, before the server rejects it, or null. Example: describeTextProblem(draft). */
export function describeTextProblem(draft: Pick<CardDraft, 'front' | 'back'>): string | null {
  for (const side of ['front', 'back'] as const) {
    const extra = draft[side].trim().length - TEXT_LIMITS[side];
    const limit = TEXT_LIMITS[side].toLocaleString('en-US');
    if (extra > 0)
      return `The ${side} is ${countCharacters(extra)} over its ${limit}-character limit. Shorten it to save.`;
  }
  return null;
}

function countCharacters(count: number): string {
  return `${count.toLocaleString('en-US')} ${count === 1 ? 'character' : 'characters'}`;
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

// Tags that differ only in case are one tag, so "Portuguese" and "portuguese" never split a card's topics; the first
// spelling wins.
function withoutCaseRepeats(tags: string[]): string[] {
  const seen = new Set<string>();
  return tags.filter((tag) => {
    const key = tag.toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
