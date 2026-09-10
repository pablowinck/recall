import type { Flashcard, RecallRating, StudyCard } from '@recall/contracts';
import { describeFailure } from '../../lib/error-message';
import { pruneReturningCards, trackReturningCard } from './returning-cards';
import type {
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

/** The outcome of loading the next due batch. */
export type RefillResult = 'loaded' | 'empty' | 'failed';

/**
 * Load the next due batch when a session runs out, without the full-screen loader. Silent checks
 * (timers, "Check for more reviews") keep the completion screen in place. Example: await refillStudyQueue(context).
 */
export async function refillStudyQueue(
  context: StudyRefillContext,
  { silent = false }: { silent?: boolean } = {},
): Promise<RefillResult> {
  const generation = context.runtime.generation;
  if (!silent) context.update((current) => ({ ...current, refilling: true }));
  try {
    const queue = await context.gateway.study(context.deck);
    if (generation !== context.runtime.generation) return 'failed';
    acceptRefill(context, queue);
    return queue.length ? 'loaded' : 'empty';
  } catch (failure) {
    if (generation === context.runtime.generation) rejectRefill(context, failure, silent);
    return 'failed';
  }
}

// A refill at the end of a batch must never end in "Nicely done"; silent checks keep the completion screen.
function rejectRefill(context: StudyRefillContext, failure: unknown, silent: boolean): void {
  context.update((current) => ({
    ...current,
    refilling: false,
    error: silent ? current.error : describeFailure(failure),
  }));
}

function acceptRefill(context: StudyRefillContext, queue: StudyCard[]): void {
  const now = context.now();
  context.update((current) => ({
    ...current,
    queue: current.queue.length ? current.queue : queue,
    returning: pruneReturningCards(current.returning, queue, now),
    refilling: false,
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
  context.update((snapshot) => ({
    ...snapshot,
    saving: true,
    savingRating: rating,
    error: '',
    ratingFailure: null,
  }));
  const attempt = prepareStudyAttempt(context, current.card.id, rating);
  await commitStudyRating(context, current, attempt);
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

async function commitStudyRating(
  context: StudyActionContext,
  current: StudyCard,
  attempt: StudyAttempt,
): Promise<void> {
  const generation = context.runtime.generation;
  const lastCard = context.snapshot.queue.length === 1;
  try {
    const updated = await sendStudyRating(context.gateway, current, attempt);
    if (generation !== context.runtime.generation) return;
    acceptStudyRating(context, updated);
    if (lastCard) void refillStudyQueue(context);
  } catch (failure) {
    if (generation === context.runtime.generation)
      context.update((snapshot) => ({
        ...snapshot,
        ratingFailure: { rating: attempt.rating, conflict: isVersionConflict(failure) },
      }));
  } finally {
    context.runtime.pending = false;
    if (generation === context.runtime.generation)
      context.update((snapshot) => ({ ...snapshot, saving: false, savingRating: null }));
  }
}

function sendStudyRating(
  gateway: StudyGateway,
  current: StudyCard,
  attempt: StudyAttempt,
): Promise<Flashcard> {
  return gateway.review(current.card.id, {
    rating: attempt.rating,
    version: current.card.version,
    request_id: attempt.requestId,
  });
}

function acceptStudyRating(context: StudyActionContext, updated: Flashcard): void {
  context.runtime.attempt = null;
  const now = context.now();
  context.update((snapshot) => ({
    ...snapshot,
    queue: snapshot.queue.slice(1),
    completed: snapshot.completed + 1,
    revealed: false,
    returning: trackReturningCard(snapshot.returning, updated, now),
  }));
}

// A 409 means the card changed elsewhere, so retrying the same version would fail again.
// Duck-typed so the check survives separate copies of the client package.
function isVersionConflict(failure: unknown): boolean {
  return (
    typeof failure === 'object' && failure !== null && 'status' in failure && failure.status === 409
  );
}
