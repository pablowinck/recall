import type { ReturningCard, SessionProgress } from './study-state';

const SESSION_PROGRESS_KEY = 'recall-session-progress';

/** Whose review it is and which deck it covers; no deck means every deck. */
export interface ReviewScope {
  user: string;
  deck?: string;
}

type ProgressStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

interface SavedProgress extends SessionProgress {
  user: string;
  deck: string;
}

/** The tab's session storage, or null where the browser refuses it. Example: sessionProgressStorage(). */
export function sessionProgressStorage(): ProgressStorage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/** The progress a reloaded review continues, or null for any other review. Example: readSessionProgress(storage, scope). */
export function readSessionProgress(
  storage: ProgressStorage | null,
  scope: ReviewScope,
): SessionProgress | null {
  try {
    const saved: unknown = JSON.parse(storage?.getItem(SESSION_PROGRESS_KEY) ?? 'null');
    if (!isSavedProgress(saved) || saved.user !== scope.user || saved.deck !== (scope.deck ?? ''))
      return null;
    return { completed: saved.completed, returning: saved.returning };
  } catch {
    return null;
  }
}

/** Keep a review's progress for a reload of this tab. Example: saveSessionProgress(storage, scope, progress). */
export function saveSessionProgress(
  storage: ProgressStorage | null,
  scope: ReviewScope,
  progress: SessionProgress,
): void {
  const saved: SavedProgress = { user: scope.user, deck: scope.deck ?? '', ...progress };
  try {
    storage?.setItem(SESSION_PROGRESS_KEY, JSON.stringify(saved));
  } catch {
    // Storage can be full or refused; the review goes on, and a reload starts its count again.
  }
}

/** Forget a review that was left, so the next one counts from zero. Example: forgetSessionProgress(storage). */
export function forgetSessionProgress(storage: ProgressStorage | null): void {
  try {
    storage?.removeItem(SESSION_PROGRESS_KEY);
  } catch {
    // Nothing was kept where storage is refused.
  }
}

// Stored text is checked before it reaches the review, like anything else read back from the browser.
function isSavedProgress(value: unknown): value is SavedProgress {
  if (typeof value !== 'object' || value === null) return false;
  const saved = value as Record<string, unknown>;
  return (
    typeof saved.user === 'string' &&
    typeof saved.deck === 'string' &&
    typeof saved.completed === 'number' &&
    Number.isSafeInteger(saved.completed) &&
    saved.completed >= 0 &&
    Array.isArray(saved.returning) &&
    saved.returning.every(isReturningCard)
  );
}

function isReturningCard(value: unknown): value is ReturningCard {
  if (typeof value !== 'object' || value === null) return false;
  const card = value as Record<string, unknown>;
  return (
    typeof card.id === 'string' &&
    typeof card.dueAt === 'string' &&
    !Number.isNaN(Date.parse(card.dueAt))
  );
}
