import type { Deck, Flashcard } from '@recall/contracts';
import { readLastDeck } from './last-deck';

interface InitialDeckChoice {
  card?: Flashcard;
  decks: Deck[];
  preferredDeckId?: string;
}

/**
 * Pick the deck a freshly opened editor starts in: the edited card, the deck the view is filtered
 * by, then the deck of the previous new card. Example: chooseInitialDeck({ decks, preferredDeckId }).
 */
export function chooseInitialDeck({ card, decks, preferredDeckId }: InitialDeckChoice): string {
  if (card) return card.deck_id;
  const filtered = decks.find((deck) => deck.id === preferredDeckId);
  return filtered?.id ?? readLastDeck(decks) ?? decks[0]?.id ?? '';
}
