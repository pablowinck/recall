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
