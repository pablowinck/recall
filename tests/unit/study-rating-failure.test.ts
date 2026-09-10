import { describe, expect, it } from 'vitest';
import { RecallApiError } from '../../packages/client/src/index';
import type { Flashcard, ReviewInput, StudyCard } from '../../packages/contracts/src/index';
import {
  recordStudyRating,
  reloadStudyQueue,
} from '../../apps/web/src/features/study/study-actions';
import {
  initialStudySnapshot,
  revealStudyAnswer,
  type StudyActionContext,
  type StudyGateway,
  type StudyRuntime,
  type StudySnapshot,
} from '../../apps/web/src/features/study/study-state';

const card: Flashcard = {
  id: 'card',
  tenant_id: 'tenant',
  deck_id: 'deck',
  front: 'Question',
  back: 'Answer',
  tags: [],
  source_key: null,
  due_at: '2026-09-10T12:00:00Z',
  schedule: null,
  version: 0,
  suspended: false,
  created_at: '2026-09-10T12:00:00Z',
  updated_at: '2026-09-10T12:00:00Z',
};

/** Fails the next review once with a chosen error, then accepts ratings. */
class FakeUnreliableGateway implements StudyGateway {
  nextFailure: Error | null = null;
  requests: ReviewInput[] = [];
  batches: StudyCard[][] = [[{ card, options: [] }]];
  async study(): Promise<StudyCard[]> {
    return this.batches.shift() ?? [];
  }
  async review(_id: string, input: ReviewInput): Promise<Flashcard> {
    this.requests.push(input);
    const failure = this.nextFailure;
    this.nextFailure = null;
    if (failure) throw failure;
    return { ...card, version: 1, due_at: '2026-09-12T12:00:00Z' };
  }
}

class FakeStudySession {
  value = initialStudySnapshot();
  runtime: StudyRuntime = { pending: false, attempt: null, generation: 0 };
  update = (change: (previous: StudySnapshot) => StudySnapshot): void => {
    this.value = change(this.value);
  };
  context(gateway: StudyGateway): StudyActionContext {
    return {
      gateway,
      snapshot: this.value,
      runtime: this.runtime,
      update: this.update,
      newRequestId: () => `00000000-0000-4000-8000-00000000000${this.runtime.generation}`,
      now: () => new Date('2026-09-10T12:00:00Z'),
    };
  }
}

async function failFirstRating(failure: Error): Promise<{
  gateway: FakeUnreliableGateway;
  session: FakeStudySession;
}> {
  const gateway = new FakeUnreliableGateway();
  const session = new FakeStudySession();
  await reloadStudyQueue(gateway, session.runtime, session.update);
  revealStudyAnswer(session.update);
  gateway.nextFailure = failure;
  await recordStudyRating(session.context(gateway), 3);
  return { gateway, session };
}

describe('rating failures', () => {
  it('keeps the answer and the rating so a retry reuses the same request', async () => {
    const { gateway, session } = await failFirstRating(new TypeError('Failed to fetch'));
    expect(session.value.ratingFailure).toEqual({ rating: 3, conflict: false });
    expect(session.value.revealed).toBe(true);
    expect(session.value.queue).toHaveLength(1);
    await recordStudyRating(session.context(gateway), 3);
    expect(gateway.requests[0]?.request_id).toBe(gateway.requests[1]?.request_id);
    expect(session.value.ratingFailure).toBeNull();
    expect(session.value.completed).toBe(1);
  });

  it('marks a version conflict so the card can be reloaded instead of retried', async () => {
    const { session } = await failFirstRating(
      new RecallApiError(409, 'This card has changed. Refresh the session before reviewing it.'),
    );
    expect(session.value.ratingFailure).toEqual({ rating: 3, conflict: true });
  });
});
