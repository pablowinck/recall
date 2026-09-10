import type { Deck } from '@recall/contracts';

const LAST_DECK_KEY = 'recall-last-deck';

/** Reuse the deck of the previous new card so batches of cards stay together. Example: readLastDeck(decks). */
export function readLastDeck(decks: Deck[]): string | undefined {
  try {
    const stored = localStorage.getItem(LAST_DECK_KEY);
    return decks.some((deck) => deck.id === stored) ? (stored ?? undefined) : undefined;
  } catch {
    return undefined;
  }
}

/** Remember the deck a new card was saved to. Example: rememberLastDeck(deckId). */
export function rememberLastDeck(deckId: string): void {
  try {
    localStorage.setItem(LAST_DECK_KEY, deckId);
  } catch {
    // Storage can be unavailable in private browsing; the first deck stays the default.
  }
}
