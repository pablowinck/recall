import { expect, it } from 'vitest';
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

class FakeStudyGateway implements StudyGateway {
  requests: ReviewInput[] = [];
  failures = 0;
  readonly card: Flashcard = {
    id: '11111111-1111-4111-8111-111111111111',
    tenant_id: '22222222-2222-4222-8222-222222222222',
    deck_id: '33333333-3333-4333-8333-333333333333',
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
  async study(): Promise<StudyCard[]> {
    return [{ card: this.card, options: [] }];
  }
  async review(_id: string, input: ReviewInput): Promise<Flashcard> {
    this.requests.push(input);
    if (this.failures-- > 0) throw new Error('Temporary review failure');
    return { ...this.card, version: 1 };
  }
}
class FakeStudySnapshot {
  value = initialStudySnapshot();
  runtime: StudyRuntime = { pending: false, attempt: null, generation: 0 };
  update = (change: (previous: StudySnapshot) => StudySnapshot): void => {
    this.value = change(this.value);
  };
}
class FakeReviewIds {
  calls = 0;
  next = (): string => `00000000-0000-4000-8000-${String(++this.calls).padStart(12, '0')}`;
}
/** Holds each review until release(), like a save on a slow connection, and counts queue loads. */
class FakeSlowSaveGateway extends FakeStudyGateway {
  loads = 0;
  private held: Array<() => void> = [];
  release(): void {
    for (const resume of this.held.splice(0)) resume();
  }
  override async study(): Promise<StudyCard[]> {
    this.loads += 1;
    return super.study();
  }
  override async review(id: string, input: ReviewInput): Promise<Flashcard> {
    await new Promise<void>((resolve) => {
      this.held.push(resolve);
    });
    return super.review(id, input);
  }
}

async function preparedStudy(failures = 0): Promise<{
  gateway: FakeStudyGateway;
  snapshot: FakeStudySnapshot;
  context: () => StudyActionContext;
  ids: FakeReviewIds;
}> {
  const gateway = new FakeStudyGateway();
  gateway.failures = failures;
  const snapshot = new FakeStudySnapshot();
  const ids = new FakeReviewIds();
  await reloadStudyQueue(gateway, snapshot.runtime, snapshot.update);
  revealStudyAnswer(snapshot.update);
  return {
    gateway,
    snapshot,
    ids,
    context: () => ({
      gateway,
      snapshot: snapshot.value,
      runtime: snapshot.runtime,
      update: snapshot.update,
      newRequestId: ids.next,
      now: () => new Date('2026-09-10T12:00:00Z'),
    }),
  };
}

it('retains the card and request identifier after a failed rating', async () => {
  const scenario = await preparedStudy(1);
  await recordStudyRating(scenario.context(), 3);
  expect(scenario.snapshot.value.queue).toHaveLength(1);
  expect(scenario.snapshot.value.completed).toBe(0);
  expect(scenario.snapshot.value.saving).toBe(false);
  await recordStudyRating(scenario.context(), 3);
  expect(scenario.gateway.requests[0]?.request_id).toBe(scenario.gateway.requests[1]?.request_id);
  expect(scenario.ids.calls).toBe(1);
  expect(scenario.snapshot.value.completed).toBe(1);
});

it('prevents concurrent clicks from sending two ratings', async () => {
  const scenario = await preparedStudy();
  await Promise.all([
    recordStudyRating(scenario.context(), 3),
    recordStudyRating(scenario.context(), 3),
  ]);
  expect(scenario.gateway.requests).toHaveLength(1);
  expect(scenario.snapshot.value.completed).toBe(1);
});

it('does not update a disposed session when a rating finishes', async () => {
  const scenario = await preparedStudy();
  const request = recordStudyRating(scenario.context(), 3);
  scenario.snapshot.runtime.generation += 1;
  await request;
  expect(scenario.snapshot.value.completed).toBe(0);
  expect(scenario.snapshot.value.queue).toHaveLength(1);
});

it('does not reveal or rate an absent card', async () => {
  const scenario = await preparedStudy();
  scenario.snapshot.value = initialStudySnapshot();
  revealStudyAnswer(scenario.snapshot.update);
  await recordStudyRating(scenario.context(), 3);
  expect(scenario.gateway.requests).toHaveLength(0);
  expect(scenario.snapshot.value.revealed).toBe(false);
});

it('waits for a save from a closed session before loading cards again', async () => {
  const gateway = new FakeSlowSaveGateway();
  const closed = new FakeStudySnapshot();
  await reloadStudyQueue(gateway, closed.runtime, closed.update);
  revealStudyAnswer(closed.update);
  const rating = recordStudyRating(
    {
      gateway,
      snapshot: closed.value,
      runtime: closed.runtime,
      update: closed.update,
      newRequestId: new FakeReviewIds().next,
      now: () => new Date('2026-09-10T12:00:00Z'),
    },
    3,
  );
  closed.runtime.generation += 1;
  const reopened = new FakeStudySnapshot();
  const reload = reloadStudyQueue(gateway, reopened.runtime, reopened.update);
  await new Promise((resolve) => setTimeout(resolve, 0));
  expect(gateway.loads).toBe(1);
  gateway.release();
  await Promise.all([rating, reload]);
  expect(gateway.loads).toBe(2);
  expect(reopened.value.loading).toBe(false);
});

it('re-enables the ratings when a rating fails before it is sent', async () => {
  const scenario = await preparedStudy();
  const context = scenario.context();
  await recordStudyRating(
    {
      ...context,
      newRequestId: () => {
        throw new TypeError('crypto.randomUUID is not a function');
      },
    },
    3,
  );
  expect(scenario.snapshot.value.saving).toBe(false);
  expect(scenario.snapshot.runtime.pending).toBe(false);
  expect(scenario.snapshot.value.ratingFailure).toEqual({ rating: 3, reason: 'unsaved' });
});
