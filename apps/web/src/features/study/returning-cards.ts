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
  const kept = returning.filter(
    (entry) => !queued.has(entry.id) && Date.parse(entry.dueAt) > now.getTime() - STALE_AFTER_MS,
  );
  // The same array when nothing changed keeps the resume timer from re-arming on every check.
  return kept.length === returning.length ? returning : kept;
}

/** Milliseconds until the next returning card is due, or null. Example: nextReturnDelay(returning, now). */
export function nextReturnDelay(returning: ReturningCard[], now: Date): number | null {
  if (!returning.length) return null;
  const earliest = Math.min(...returning.map((entry) => Date.parse(entry.dueAt)));
  return Math.max(0, earliest - now.getTime());
}

/**
 * Close a session honestly, grouping cards by when they come back.
 * Example: describeCompletion(3, returning, now) === 'You reviewed 3 cards in this session. 1 card comes back in about 1 min, 2 more in about 10 min.'.
 */
export function describeCompletion(
  completed: number,
  returning: ReturningCard[],
  now: Date,
): string {
  const reviewed = completed
    ? `You reviewed ${completed} ${completed === 1 ? 'card' : 'cards'} in this session.`
    : 'No cards are due for review right now.';
  const groups = groupReturningByMinutes(returning, now);
  if (!groups.length) return reviewed;
  return `${reviewed} ${describeReturnGroups(groups)}.`;
}

interface ReturnGroup {
  minutes: number;
  count: number;
}

function groupReturningByMinutes(returning: ReturningCard[], now: Date): ReturnGroup[] {
  const counts = new Map<number, number>();
  for (const entry of returning) {
    const minutes = Math.max(1, Math.round((Date.parse(entry.dueAt) - now.getTime()) / 60000));
    counts.set(minutes, (counts.get(minutes) ?? 0) + 1);
  }
  return [...counts].sort(([a], [b]) => a - b).map(([minutes, count]) => ({ minutes, count }));
}

// Pairing the earliest time with the total count was misleading ("3 cards in 1 min" when two
// return in 10), so the first group is exact and later ones are summarized.
function describeReturnGroups([first, ...rest]: ReturnGroup[]): string {
  const lead = `${first!.count === 1 ? '1 card comes' : `${first!.count} cards come`} back in about ${first!.minutes} min`;
  if (!rest.length) return lead;
  const more = rest.reduce((sum, group) => sum + group.count, 0);
  const latest = rest[rest.length - 1]!.minutes;
  return `${lead}, ${more} more ${rest.length === 1 ? 'in about' : 'within'} ${latest} min`;
}
