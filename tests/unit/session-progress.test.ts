import { describe, expect, it } from 'vitest';
import type { StudyCard } from '../../packages/contracts/src/index';
import {
  forgetSessionProgress,
  readSessionProgress,
  saveSessionProgress,
} from '../../apps/web/src/features/study/session-progress';
import {
  initialStudySnapshot,
  reviewTotal,
  type StudySnapshot,
} from '../../apps/web/src/features/study/study-state';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
  removeItem(key: string): void {
    this.values.delete(key);
  }
}

/** Throws like a browser that refuses storage, for example with cookies blocked. */
const refusedStorage = {
  getItem: (): string | null => {
    throw new Error('Storage refused');
  },
  setItem: (): void => {
    throw new Error('Storage refused');
  },
  removeItem: (): void => {
    throw new Error('Storage refused');
  },
};

const ANNA = { user: 'anna', deck: 'deck-1' };
const PROGRESS = {
  completed: 20,
  returning: [{ id: 'card-1', dueAt: '2026-09-11T12:01:00Z' }],
};

function queueOf(length: number): StudyCard[] {
  return Array.from({ length }, (_, index) => ({ card: { id: `card-${index}` } }) as StudyCard);
}

function snapshotWith(change: Partial<StudySnapshot>): StudySnapshot {
  return { ...initialStudySnapshot(), ...change };
}

describe('session progress', () => {
  it('gives a reloaded review its count and the cards coming back', () => {
    const storage = new MemoryStorage();
    saveSessionProgress(storage, ANNA, PROGRESS);
    expect(readSessionProgress(storage, ANNA)).toEqual(PROGRESS);
  });

  it('keeps a review’s progress out of another person’s or another deck’s review', () => {
    const storage = new MemoryStorage();
    saveSessionProgress(storage, ANNA, PROGRESS);
    expect(readSessionProgress(storage, { user: 'bruno', deck: 'deck-1' })).toBeNull();
    expect(readSessionProgress(storage, { user: 'anna' })).toBeNull();
  });

  it('forgets a review that was left, so the next one counts from zero', () => {
    const storage = new MemoryStorage();
    saveSessionProgress(storage, ANNA, PROGRESS);
    forgetSessionProgress(storage);
    expect(readSessionProgress(storage, ANNA)).toBeNull();
  });

  it('ignores stored progress it cannot trust and storage the browser refuses', () => {
    const storage = new MemoryStorage();
    storage.setItem(
      'recall-session-progress',
      JSON.stringify({ user: 'anna', deck: 'deck-1', completed: -1, returning: [] }),
    );
    expect(readSessionProgress(storage, ANNA)).toBeNull();
    storage.setItem('recall-session-progress', 'not json');
    expect(readSessionProgress(storage, ANNA)).toBeNull();
    expect(readSessionProgress(null, ANNA)).toBeNull();
    expect(readSessionProgress(refusedStorage, ANNA)).toBeNull();
    expect(() => saveSessionProgress(refusedStorage, ANNA, PROGRESS)).not.toThrow();
    expect(() => forgetSessionProgress(refusedStorage)).not.toThrow();
  });
});

describe('review total', () => {
  it('starts from the cards due and grows once cards come back', () => {
    expect(reviewTotal(snapshotWith({ completed: 3, queue: queueOf(20) }), 26)).toBe(26);
    expect(reviewTotal(snapshotWith({ completed: 10, queue: queueOf(20) }), 26)).toBe(30);
  });

  it('adds the reviews counted before a reload to the cards still due', () => {
    const reloaded = initialStudySnapshot({ completed: 20, returning: [] });
    expect(reviewTotal({ ...reloaded, queue: queueOf(20) }, 26)).toBe(46);
  });

  it('no longer counts a last card that waits for the next batch', () => {
    const waiting = snapshotWith({ completed: 1, queue: queueOf(1), awaitingBatch: true });
    expect(reviewTotal(waiting, 1)).toBe(1);
  });
});
