import type { Flashcard, RecallRating, StudyCard } from '@recall/contracts';
import { hasStatus } from '../../lib/api-status';
import { describeFailure } from '../../lib/error-message';
import { pruneReturningCards, trackReturningCard } from './returning-cards';
import type {
  RatingFailureReason,
  StudyActionContext,
  StudyAttempt,
  StudyGateway,
  StudyRuntime,
  StudyUpdate,
} from './study-state';

type StudyRefillContext = Pick<
  StudyActionContext,
  'gateway' | 'runtime' | 'update' | 'now' | 'deck'
>;

/** The next due batch, or why it could not load. */
interface NextBatch {
  queue: StudyCard[];
  error: string;
}

// A rating can outlive the session that sent it. Leaving during a slow save and starting again would load the card
// before the save lands, and rating it again would conflict, so a new session waits a little for saves on their way.
const savesInFlight = new Set<Promise<void>>();
const SAVE_WAIT_MS = 4000;

/** Refresh the queue without accepting results from a disposed session. Example: reloadStudyQueue(gateway, runtime, update). */
export async function reloadStudyQueue(
  gateway: StudyGateway,
  runtime: StudyRuntime,
  update: StudyUpdate,
  deck?: string,
): Promise<void> {
  const generation = ++runtime.generation;
  update((current) => ({ ...current, loading: true }));
  try {
    await waitForSavesInFlight();
    const queue = await gateway.study(deck);
    if (generation !== runtime.generation) return;
    runtime.attempt = null;
    update((current) => ({
      ...current,
      queue,
      revealed: false,
      loading: false,
      error: '',
      saving: false,
      savingRating: null,
      ratingFailure: null,
    }));
  } catch (failure) {
    if (generation === runtime.generation)
      update((current) => ({ ...current, loading: false, error: describeFailure(failure) }));
  }
}

async function waitForSavesInFlight(): Promise<void> {
  if (!savesInFlight.size) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, SAVE_WAIT_MS);
  });
  await Promise.race([Promise.all(savesInFlight), timeout]);
  clearTimeout(timer);
}

/** The outcome of loading the next due batch. */
export type RefillResult = 'loaded' | 'empty' | 'failed';

/**
 * Check for cards that came due while the completion screen is open. A failed check leaves the screen as it is
 * and reports the outcome to the caller. Example: await refillStudyQueue(context).
 */
export async function refillStudyQueue(context: StudyRefillContext): Promise<RefillResult> {
  const generation = context.runtime.generation;
  try {
    const queue = await context.gateway.study(context.deck);
    if (generation !== context.runtime.generation) return 'failed';
    acceptRefill(context, queue);
    return queue.length ? 'loaded' : 'empty';
  } catch {
    return 'failed';
  }
}

function acceptRefill(context: StudyRefillContext, queue: StudyCard[]): void {
  const now = context.now();
  context.update((current) => ({
    ...current,
    queue: current.queue.length ? current.queue : queue,
    returning: pruneReturningCards(current.returning, queue, now),
  }));
}

/** Rate only revealed cards and preserve the attempt across failures. Example: recordStudyRating(context, 3). */
export async function recordStudyRating(
  context: StudyActionContext,
  rating: RecallRating,
): Promise<void> {
  const current = context.snapshot.queue[0];
  if (!current || !context.snapshot.revealed || context.snapshot.loading || context.runtime.pending)
    return;
  context.runtime.pending = true;
  // A failure notice stays while its retry runs, so the Retry button keeping keyboard focus is not removed from
  // under it; a saved rating or a new failure replaces the notice.
  context.update((snapshot) => ({
    ...snapshot,
    saving: true,
    savingRating: rating,
    error: '',
  }));
  await commitStudyRating(context, current, rating);
}

function prepareStudyAttempt(
  context: StudyActionContext,
  cardId: string,
  rating: RecallRating,
): StudyAttempt {
  const previous = context.runtime.attempt;
  if (previous?.cardId === cardId && previous.rating === rating) return previous;
  const attempt = { cardId, rating, requestId: context.newRequestId() };
  context.runtime.attempt = attempt;
  return attempt;
}

// Everything after the ratings disable runs inside try, so no failure can leave them disabled.
async function commitStudyRating(
  context: StudyActionContext,
  current: StudyCard,
  rating: RecallRating,
): Promise<void> {
  const generation = context.runtime.generation;
  try {
    const attempt = prepareStudyAttempt(context, current.card.id, rating);
    await saveAndAdvance(context, current, attempt, generation);
  } catch (failure) {
    if (generation === context.runtime.generation)
      context.update((snapshot) => ({
        ...snapshot,
        ratingFailure: { rating, reason: describeRatingFailure(failure) },
      }));
  } finally {
    context.runtime.pending = false;
    if (generation === context.runtime.generation)
      context.update((snapshot) => ({ ...snapshot, saving: false, savingRating: null }));
  }
}

// The last card of a batch stays on screen, its rating lit, until the next batch arrives, so a long session never
// gives way to a loader every 20 cards.
async function saveAndAdvance(
  context: StudyActionContext,
  current: StudyCard,
  attempt: StudyAttempt,
  generation: number,
): Promise<void> {
  const lastCard = context.snapshot.queue.length === 1;
  const updated = await sendStudyRating(context.gateway, current, attempt);
  if (generation !== context.runtime.generation) return;
  const next = lastCard ? await loadNextBatch(context) : null;
  if (generation === context.runtime.generation) acceptStudyRating(context, updated, next);
}

// A batch that fails to load after the last card becomes an error on the study screen, never "Nicely done".
async function loadNextBatch(context: StudyRefillContext): Promise<NextBatch> {
  try {
    return { queue: await context.gateway.study(context.deck), error: '' };
  } catch (failure) {
    return { queue: [], error: describeFailure(failure) };
  }
}

function sendStudyRating(
  gateway: StudyGateway,
  current: StudyCard,
  attempt: StudyAttempt,
): Promise<Flashcard> {
  const request = gateway.review(current.card.id, {
    rating: attempt.rating,
    version: current.card.version,
    request_id: attempt.requestId,
  });
  const settled = request.then(
    () => undefined,
    () => undefined,
  );
  savesInFlight.add(settled);
  void settled.then(() => savesInFlight.delete(settled));
  return request;
}

function acceptStudyRating(
  context: StudyActionContext,
  updated: Flashcard,
  next: NextBatch | null,
): void {
  context.runtime.attempt = null;
  const now = context.now();
  context.update((snapshot) => {
    const returning = trackReturningCard(snapshot.returning, updated, now);
    const queue = next ? next.queue : snapshot.queue.slice(1);
    return {
      ...snapshot,
      queue,
      completed: snapshot.completed + 1,
      revealed: false,
      ratingFailure: null,
      error: next?.error ?? snapshot.error,
      returning: next ? pruneReturningCards(returning, queue, now) : returning,
    };
  });
}

// A 409 means the card changed since it loaded, edited, paused or reviewed elsewhere; a 404 means it was deleted,
// perhaps by an assistant. Neither succeeds on a retry, so both lead to a reload.
function describeRatingFailure(failure: unknown): RatingFailureReason {
  if (hasStatus(failure, 404)) return 'deleted';
  if (hasStatus(failure, 409)) return 'changed';
  return 'unsaved';
}
