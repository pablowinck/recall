import { describe, expect, it } from 'vitest';
import type { Flashcard, ReviewInput, StudyCard } from '../../packages/contracts/src/index';
import {
  recordStudyRating,
  refillStudyQueue,
  reloadStudyQueue,
} from '../../apps/web/src/features/study/study-actions';
import {
  describeCompletion,
  pruneReturningCards,
  trackReturningCard,
} from '../../apps/web/src/features/study/returning-cards';
import {
  initialStudySnapshot,
  revealStudyAnswer,
  type StudyActionContext,
  type StudyGateway,
  type StudyRuntime,
  type StudySnapshot,
} from '../../apps/web/src/features/study/study-state';

const NOW = new Date('2026-09-10T12:00:00Z');
const IN_ONE_MINUTE = '2026-09-10T12:01:00Z';

function makeCard(id: string, dueAt = '2026-09-10T12:00:00Z'): Flashcard {
  return {
    id,
    tenant_id: 'tenant',
    deck_id: 'deck',
    front: `Front ${id}`,
    back: 'Back',
    tags: [],
    source_key: null,
    due_at: dueAt,
    schedule: null,
    version: 0,
    suspended: false,
    created_at: dueAt,
    updated_at: dueAt,
  };
}

/** Serves due batches in order and schedules every rated card one minute ahead, like "Again". */
class FakeBatchGateway implements StudyGateway {
  batches: Flashcard[][] = [];
  async study(): Promise<StudyCard[]> {
    return (this.batches.shift() ?? []).map((card) => ({ card, options: [] }));
  }
  async review(id: string, _input: ReviewInput): Promise<Flashcard> {
    return makeCard(id, IN_ONE_MINUTE);
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
      newRequestId: () => '00000000-0000-4000-8000-000000000001',
      now: () => NOW,
    };
  }
}

const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

async function rateOnlyCard(batches: Flashcard[][]): Promise<FakeStudySession> {
  const gateway = new FakeBatchGateway();
  gateway.batches = batches;
  const session = new FakeStudySession();
  await reloadStudyQueue(gateway, session.runtime, session.update);
  revealStudyAnswer(session.update);
  await recordStudyRating(session.context(gateway), 1);
  await settle();
  return session;
}

describe('study session continuity', () => {
  it('continues with the next due batch after the last card', async () => {
    const session = await rateOnlyCard([[makeCard('a')], [makeCard('b')]]);
    expect(session.value.queue.map((item) => item.card.id)).toEqual(['b']);
    expect(session.value.completed).toBe(1);
    expect(session.value.refilling).toBe(false);
  });

  it('remembers a card that comes back within the hour when nothing else is due', async () => {
    const session = await rateOnlyCard([[makeCard('a')], []]);
    expect(session.value.queue).toHaveLength(0);
    expect(session.value.returning).toEqual([{ id: 'a', dueAt: IN_ONE_MINUTE }]);
    expect(describeCompletion(1, session.value.returning, NOW)).toBe(
      'You reviewed 1 card in this session. 1 card comes back in about 1 min.',
    );
  });

  it('forgets returning cards once they are queued again or long overdue', () => {
    const returning = [
      { id: 'a', dueAt: IN_ONE_MINUTE },
      { id: 'b', dueAt: '2026-09-10T11:58:00Z' },
      { id: 'c', dueAt: '2026-09-10T12:05:00Z' },
    ];
    const queue = [{ card: makeCard('a'), options: [] }];
    expect(pruneReturningCards(returning, queue, NOW).map((entry) => entry.id)).toEqual(['c']);
  });

  it('ignores cards scheduled beyond the hour', () => {
    expect(trackReturningCard([], { id: 'x', due_at: '2026-09-10T14:00:00Z' }, NOW)).toEqual([]);
  });

  it('does not apply a refill that finishes after the session is disposed', async () => {
    const gateway = new FakeBatchGateway();
    gateway.batches = [[makeCard('late')]];
    const session = new FakeStudySession();
    const refill = refillStudyQueue(session.context(gateway), { silent: true });
    session.runtime.generation += 1;
    await refill;
    expect(session.value.queue).toHaveLength(0);
  });
});

/** Serves the first batch, then behaves as if the network dropped. */
class FakeOfflineAfterFirstBatch extends FakeBatchGateway {
  calls = 0;
  override async study(): Promise<StudyCard[]> {
    this.calls += 1;
    if (this.calls > 1) throw new TypeError('Failed to fetch');
    return super.study();
  }
}

describe('refill outcomes', () => {
  it('turns a failed refill after the last card into an error instead of completion', async () => {
    const gateway = new FakeOfflineAfterFirstBatch();
    gateway.batches = [[makeCard('a')]];
    const session = new FakeStudySession();
    await reloadStudyQueue(gateway, session.runtime, session.update);
    revealStudyAnswer(session.update);
    await recordStudyRating(session.context(gateway), 3);
    await settle();
    expect(session.value.queue).toHaveLength(0);
    expect(session.value.error).toBe('Can’t reach Recall. Check your connection and try again.');
  });

  it('reports silent check outcomes without replacing the completion screen', async () => {
    const offline = new FakeOfflineAfterFirstBatch();
    offline.calls = 1;
    const session = new FakeStudySession();
    await expect(refillStudyQueue(session.context(offline), { silent: true })).resolves.toBe(
      'failed',
    );
    expect(session.value.error).toBe('');
    const online = new FakeBatchGateway();
    online.batches = [[]];
    await expect(refillStudyQueue(session.context(online), { silent: true })).resolves.toBe(
      'empty',
    );
  });

  it('keeps the same returning list when a check prunes nothing', () => {
    const returning = [{ id: 'a', dueAt: IN_ONE_MINUTE }];
    expect(pruneReturningCards(returning, [], NOW)).toBe(returning);
  });

  it('groups returning cards by when they come back', () => {
    const returning = [
      { id: 'a', dueAt: IN_ONE_MINUTE },
      { id: 'b', dueAt: '2026-09-10T12:10:00Z' },
      { id: 'c', dueAt: '2026-09-10T12:10:00Z' },
    ];
    expect(describeCompletion(3, returning, NOW)).toBe(
      'You reviewed 3 cards in this session. 1 card comes back in about 1 min, 2 more in about 10 min.',
    );
  });
});
