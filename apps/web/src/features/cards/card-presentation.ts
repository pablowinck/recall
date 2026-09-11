import type { Flashcard } from '@recall/contracts';
import { plainCardText } from '@/lib/card-markup';

export type CardStatusSource = Pick<Flashcard, 'suspended' | 'schedule' | 'due_at'>;

/** Keep a question short enough to announce as a name. Example: summarizeFront(card.front). */
export function summarizeFront(front: string, limit = 80): string {
  const line = plainCardText(front).replace(/\s+/g, ' ').trim();
  return line.length <= limit ? line : `${line.slice(0, limit - 1).trimEnd()}…`;
}

const DAY_MS = 86_400_000;
const dueDateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

/** Give paused, new, due and scheduled cards a status that says when they come back. Example: describeCardStatus(card, now). */
export function describeCardStatus(
  card: CardStatusSource,
  now: Date,
): { label: string; tone: string } {
  if (card.suspended) return { label: 'Paused', tone: 'paused' };
  if (card.schedule === null) return { label: 'New', tone: 'ready' };
  const due = new Date(card.due_at);
  if (due <= now) return { label: 'Due for review', tone: 'ready' };
  return { label: describeDueDate(due, now), tone: '' };
}

// Counts calendar days, not 24-hour spans, so a card due tonight never reads "tomorrow".
function describeDueDate(due: Date, now: Date): string {
  const days = Math.round((startOfDay(due) - startOfDay(now)) / DAY_MS);
  if (days === 0) return 'Due later today';
  if (days === 1) return 'Due tomorrow';
  if (days < 7) return `Due in ${days} days`;
  const sameYear = due.getFullYear() === now.getFullYear();
  const format = sameYear ? dueDateFormat : { ...dueDateFormat, year: 'numeric' as const };
  return `Due ${due.toLocaleDateString('en-US', format)}`;
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

/** Show a card's list markers as bullets in a two-line preview instead of raw dashes. Example: previewText('- one\n- two'). */
export function previewText(text: string): string {
  return text.replace(/^(\s*)[-*]\s+/gm, '$1• ');
}
