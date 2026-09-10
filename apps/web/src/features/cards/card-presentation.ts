import type { Flashcard } from '@recall/contracts';
import { plainCardText } from '@/lib/card-markup';

export type CardStatusSource = Pick<Flashcard, 'suspended' | 'schedule' | 'due_at'>;

/** Keep a question short enough to announce as a name. Example: summarizeFront(card.front). */
export function summarizeFront(front: string, limit = 80): string {
  const line = plainCardText(front).replace(/\s+/g, ' ').trim();
  return line.length <= limit ? line : `${line.slice(0, limit - 1).trimEnd()}…`;
}

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
