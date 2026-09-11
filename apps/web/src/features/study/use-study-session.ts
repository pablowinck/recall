import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { RecallRating } from '@recall/contracts';
import {
  initialStudySnapshot,
  revealStudyAnswer,
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

/** Preserve retry identity, prevent duplicate clicks and continue into the next batch. Example: useStudySession(client). */
export function useStudySession(client: RecallClient, deck?: string): StudySessionState {
  const [snapshot, update] = useState(initialStudySnapshot);
  const runtime = useRef<StudyRuntime>({ pending: false, attempt: null, generation: 0 }).current;
  const reload = useCallback(
    () => reloadStudyQueue(client, runtime, update, deck),
    [client, runtime, deck],
  );
  useEffect(() => activateStudySession(reload, runtime), [reload, runtime]);
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
