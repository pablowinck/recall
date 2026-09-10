import { createEmptyCard, fsrs, type Card, type Grade } from 'ts-fsrs';
import type { RecallRating, ReviewOption, StoredSchedule } from '@recall/contracts';
import { formatInterval } from './interval';

const ratingLabels = ['Again', 'Hard', 'Good', 'Easy'] as const;

function hydrateSchedule(stored: StoredSchedule | null, now: Date): Card {
  if (!stored) return createEmptyCard(now);
  return {
    ...stored,
    due: new Date(stored.due),
    last_review: stored.last_review ? new Date(stored.last_review) : undefined,
  };
}

function serializeSchedule(card: Card): StoredSchedule {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString(),
  };
}

/** Initialize FSRS with an injected clock. Example: initialSchedule(new Date()). */
export function initialSchedule(now: Date): StoredSchedule {
  const emptyCard = createEmptyCard(now);
  const storedCard = serializeSchedule(emptyCard);
  return storedCard;
}

/** Schedule a validated recall rating. Example: applyRating(null, 3, now). */
export function applyRating(
  stored: StoredSchedule | null,
  rating: RecallRating,
  now: Date,
): StoredSchedule {
  if (![1, 2, 3, 4].includes(rating))
    throw new Error(`Invalid rating ${rating}; expected integer 1..4`);
  const scheduler = fsrs({ enable_fuzz: false, request_retention: 0.9 });
  const outcome = scheduler.next(hydrateSchedule(stored, now), now, rating as Grade);
  return serializeSchedule(outcome.card);
}

/** Preview all four scheduling outcomes before a rating. Example: previewSchedule(null, now). */
export function previewSchedule(stored: StoredSchedule | null, now: Date): ReviewOption[] {
  return ([1, 2, 3, 4] as const).map((rating) => {
    const scheduled = applyRating(stored, rating, now);
    return {
      rating,
      label: ratingLabels[rating - 1]!,
      due_at: scheduled.due,
      interval: formatInterval(new Date(scheduled.due).getTime() - now.getTime()),
    };
  });
}
