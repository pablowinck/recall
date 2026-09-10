import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Deck, Flashcard } from '../../packages/contracts/src/index';
import { chooseInitialDeck } from '../../apps/web/src/features/cards/initial-deck';

const decks: Deck[] = [
  { id: 'first', name: 'My first deck', card_count: 3, due_count: 0 },
  { id: 'spanish', name: 'Spanish', card_count: 5, due_count: 2 },
];

/** Stands in for the browser storage that remembers the previous new card's deck. */
class FakeDeckMemory {
  constructor(private readonly deckId: string | null) {}
  getItem(): string | null {
    return this.deckId;
  }
  setItem(): void {}
}

function makeCard(deckId: string): Flashcard {
  return {
    id: 'card',
    tenant_id: 'tenant',
    deck_id: deckId,
    front: 'Front',
    back: 'Back',
    tags: [],
    source_key: null,
    due_at: '2026-09-10T12:00:00Z',
    schedule: null,
    version: 0,
    suspended: false,
    created_at: '2026-09-10T12:00:00Z',
    updated_at: '2026-09-10T12:00:00Z',
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('the deck a new editor starts in', () => {
  it('keeps the deck of the card being edited', () => {
    expect(chooseInitialDeck({ card: makeCard('spanish'), decks, preferredDeckId: 'first' })).toBe(
      'spanish',
    );
  });

  it('uses the deck the library is filtered by', () => {
    vi.stubGlobal('localStorage', new FakeDeckMemory('first'));
    expect(chooseInitialDeck({ decks, preferredDeckId: 'spanish' })).toBe('spanish');
  });

  it('falls back to the deck of the previous new card', () => {
    vi.stubGlobal('localStorage', new FakeDeckMemory('spanish'));
    expect(chooseInitialDeck({ decks })).toBe('spanish');
  });

  it('ignores a filter for a deck that no longer exists', () => {
    vi.stubGlobal('localStorage', new FakeDeckMemory(null));
    expect(chooseInitialDeck({ decks, preferredDeckId: 'deleted' })).toBe('first');
  });
});
