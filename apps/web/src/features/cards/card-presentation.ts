import type { Flashcard } from '@recall/contracts';

export type CardStatusSource = Pick<Flashcard, 'suspended' | 'schedule' | 'due_at'>;

/** Give paused and new cards the correct visible status. Example: describeCardStatus(card, now). */
export function describeCardStatus(
  card: CardStatusSource,
  now: Date,
): { label: string; tone: string } {
  if (card.suspended) return { label: 'Paused', tone: 'paused' };
  if (card.schedule === null) return { label: 'New', tone: 'ready' };
  if (new Date(card.due_at) <= now) return { label: 'Due for review', tone: 'ready' };
  return { label: 'Scheduled', tone: '' };
}
