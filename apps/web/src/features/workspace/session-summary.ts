import type { WorkspaceStats } from '@recall/contracts';

/**
 * Say what the next session holds, splitting due reviews from never-studied cards.
 * Example: describeDueMix({ due: 26, fresh: 12, ... }) === '14 reviews · 12 new'.
 */
export function describeDueMix(stats: Pick<WorkspaceStats, 'due' | 'fresh'>): string {
  const fresh = Math.min(stats.fresh, stats.due);
  const reviews = stats.due - fresh;
  const parts: string[] = [];
  if (reviews > 0) parts.push(`${reviews} ${reviews === 1 ? 'review' : 'reviews'}`);
  if (fresh > 0) parts.push(`${fresh} new`);
  return parts.join(' · ');
}

/**
 * A workspace with nothing written or studied yet, where zero statistics tell the person nothing.
 * Example: isFirstRun({ total: 0, reviewed_today: 0, streak: 0 }) === true.
 */
export function isFirstRun(
  stats: Pick<WorkspaceStats, 'total' | 'reviewed_today' | 'streak'>,
): boolean {
  return !stats.total && !stats.reviewed_today && !stats.streak;
}
