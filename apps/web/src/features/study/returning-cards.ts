import type { Flashcard, StudyCard } from '@recall/contracts';
import type { ReturningCard } from './study-state';

const RETURNING_WINDOW_MS = 60 * 60 * 1000;
// Past this, a card that did not come back (edited, paused, or clock skew) stops being awaited.
const STALE_AFTER_MS = 60 * 1000;

/**
 * Remember a just-rated card when FSRS brings it back within the hour, replacing an earlier entry
 * for the same card. Example: trackReturningCard(returning, updatedCard, now).
 */
export function trackReturningCard(
  returning: ReturningCard[],
  card: Pick<Flashcard, 'id' | 'due_at'>,
  now: Date,
): ReturningCard[] {
  const others = returning.filter((entry) => entry.id !== card.id);
  const wait = Date.parse(card.due_at) - now.getTime();
  return wait > 0 && wait <= RETURNING_WINDOW_MS
    ? [...others, { id: card.id, dueAt: card.due_at }]
    : others;
}

/** Drop cards that are back in the queue or no longer expected. Example: pruneReturningCards(returning, queue, now). */
export function pruneReturningCards(
  returning: ReturningCard[],
  queue: StudyCard[],
  now: Date,
): ReturningCard[] {
  const queued = new Set(queue.map((item) => item.card.id));
  return returning.filter(
    (entry) => !queued.has(entry.id) && Date.parse(entry.dueAt) > now.getTime() - STALE_AFTER_MS,
  );
}

/** Milliseconds until the next returning card is due, or null. Example: nextReturnDelay(returning, now). */
export function nextReturnDelay(returning: ReturningCard[], now: Date): number | null {
  if (!returning.length) return null;
  const earliest = Math.min(...returning.map((entry) => Date.parse(entry.dueAt)));
  return Math.max(0, earliest - now.getTime());
}

/**
 * Close a session honestly, including cards that come back soon.
 * Example: describeCompletion(12, returning, now) === 'You reviewed 12 cards. 3 come back in about 5 min.'.
 */
export function describeCompletion(
  completed: number,
  returning: ReturningCard[],
  now: Date,
): string {
  const reviewed = completed
    ? `You reviewed ${completed} ${completed === 1 ? 'card' : 'cards'} in this session.`
    : 'No cards are due for review right now.';
  const delay = nextReturnDelay(returning, now);
  if (delay === null) return reviewed;
  const minutes = Math.max(1, Math.round(delay / 60000));
  const subject = returning.length === 1 ? '1 card comes' : `${returning.length} cards come`;
  return `${reviewed} ${subject} back in about ${minutes} min.`;
}
