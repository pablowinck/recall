import type { RecallRating, StudyCard } from '@recall/contracts';
import { describeFailure } from '../../lib/error-message';
import type {
  StudyActionContext,
  StudyAttempt,
  StudyGateway,
  StudyRuntime,
  StudyUpdate,
} from './study-state';

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
    update((current) => ({ ...current, queue, revealed: false, loading: false, error: '' }));
  } catch (failure) {
    if (generation === runtime.generation)
      update((current) => ({ ...current, loading: false, error: describeFailure(failure) }));
  }
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
  context.update((snapshot) => ({ ...snapshot, saving: true, error: '' }));
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
  try {
    await sendStudyRating(context.gateway, current, attempt);
    if (generation === context.runtime.generation) acceptStudyRating(context);
  } catch (failure) {
    if (generation === context.runtime.generation)
      context.update((snapshot) => ({ ...snapshot, error: describeFailure(failure) }));
  } finally {
    context.runtime.pending = false;
    if (generation === context.runtime.generation)
      context.update((snapshot) => ({ ...snapshot, saving: false }));
  }
}

async function sendStudyRating(
  gateway: StudyGateway,
  current: StudyCard,
  attempt: StudyAttempt,
): Promise<void> {
  await gateway.review(current.card.id, {
    rating: attempt.rating,
    version: current.card.version,
    request_id: attempt.requestId,
  });
}

function acceptStudyRating(context: StudyActionContext): void {
  context.runtime.attempt = null;
  context.update((snapshot) => ({
    ...snapshot,
    queue: snapshot.queue.slice(1),
    completed: snapshot.completed + 1,
    revealed: false,
  }));
}
