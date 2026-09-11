import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { RecallRating } from '@recall/contracts';
import {
  initialStudySnapshot,
  revealStudyAnswer,
  type SessionProgress,
  type StudyActionContext,
  type StudyRuntime,
  type StudySnapshot,
} from './study-state';
import {
  recordStudyRating,
  refillStudyQueue,
  reloadStudyQueue,
  type RefillResult,
} from './study-actions';
import { pruneReturningCards } from './returning-cards';
import {
  forgetSessionProgress,
  readSessionProgress,
  saveSessionProgress,
  sessionProgressStorage,
  type ReviewScope,
} from './session-progress';

export interface StudySessionState extends StudySnapshot {
  reveal: () => void;
  rate: (rating: RecallRating) => Promise<void>;
  reload: () => Promise<void>;
  refill: () => Promise<RefillResult>;
  retryRating: () => Promise<void>;
}
function newRequestId(): string {
  return crypto.randomUUID();
}
function readClock(): Date {
  return new Date();
}

/**
 * Preserve retry identity, prevent duplicate clicks, and continue into the next batch and through a reload.
 * Example: useStudySession(client, { user, deck }).
 */
export function useStudySession(client: RecallClient, scope: ReviewScope): StudySessionState {
  const { user, deck } = scope;
  const [snapshot, update] = useState(() => initialStudySnapshot(restoreProgress(scope)));
  const runtime = useRef<StudyRuntime>({ pending: false, attempt: null, generation: 0 }).current;
  const reload = useCallback(
    () => reloadStudyQueue(client, runtime, update, deck),
    [client, runtime, deck],
  );
  useEffect(() => activateStudySession(reload, runtime), [reload, runtime]);
  useProgressMemory(user, deck, snapshot);
  const context = {
    gateway: client,
    snapshot,
    runtime,
    update,
    newRequestId,
    now: readClock,
    deck,
  };
  return { ...snapshot, reload, ...bindStudyActions(context) };
}

// Cards due back more than a minute ago are no longer awaited, so a review reloaded much later promises none of them.
function restoreProgress(scope: ReviewScope): SessionProgress | null {
  const progress = readSessionProgress(sessionProgressStorage(), scope);
  if (!progress) return null;
  return { ...progress, returning: pruneReturningCards(progress.returning, [], new Date()) };
}

// A reload keeps the review's count and the cards coming back, since a reload runs no cleanup; leaving forgets them.
function useProgressMemory(user: string, deck: string | undefined, snapshot: StudySnapshot): void {
  const { completed, returning } = snapshot;
  useEffect(() => {
    saveSessionProgress(sessionProgressStorage(), { user, deck }, { completed, returning });
  }, [user, deck, completed, returning]);
  useEffect(() => () => forgetSessionProgress(sessionProgressStorage()), [user, deck]);
}

// Actions close over the snapshot of the render that made them, so a retry repeats the rating that failed.
function bindStudyActions(
  context: StudyActionContext,
): Omit<StudySessionState, keyof StudySnapshot | 'reload'> {
  const failure = context.snapshot.ratingFailure;
  return {
    refill: () => refillStudyQueue(context),
    reveal: () => revealStudyAnswer(context.update),
    rate: (rating) => recordStudyRating(context, rating),
    retryRating: () => (failure ? recordStudyRating(context, failure.rating) : Promise.resolve()),
  };
}

function activateStudySession(reload: () => Promise<void>, runtime: StudyRuntime): () => void {
  void reload();
  return () => {
    runtime.generation += 1;
  };
}
