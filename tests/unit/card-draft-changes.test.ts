import { describe, expect, it } from 'vitest';
import { hasDraftChanges } from '../../apps/web/src/features/cards/card-draft';

const card = { deck_id: 'deck-a', front: 'Front', back: 'Back', tags: ['one', 'two'] };

describe('card draft changes', () => {
  it('treats an untouched new card as unchanged, even after choosing a deck', () => {
    expect(hasDraftChanges({ deck_id: 'deck-b', front: ' ', back: '', tags: [] })).toBe(false);
  });

  it('detects any typed text in a new card', () => {
    expect(hasDraftChanges({ deck_id: 'deck-a', front: 'Hola', back: '', tags: [] })).toBe(true);
    expect(hasDraftChanges({ deck_id: 'deck-a', front: '', back: '', tags: ['verbs'] })).toBe(true);
  });

  it('compares an existing card field by field', () => {
    expect(hasDraftChanges({ ...card }, card)).toBe(false);
    expect(hasDraftChanges({ ...card, back: 'Back.' }, card)).toBe(true);
    expect(hasDraftChanges({ ...card, deck_id: 'deck-b' }, card)).toBe(true);
    expect(hasDraftChanges({ ...card, tags: ['two', 'one'] }, card)).toBe(true);
  });
});
