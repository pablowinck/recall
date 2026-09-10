import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { RecallRating } from '@recall/contracts';
import {
  initialStudySnapshot,
  revealStudyAnswer,
  type StudyRuntime,
  type StudySnapshot,
} from './study-state';
import { recordStudyRating, refillStudyQueue, reloadStudyQueue } from './study-actions';

export interface StudySessionState extends StudySnapshot {
  reveal: () => void;
  rate: (rating: RecallRating) => Promise<void>;
  reload: () => Promise<void>;
  refill: (options?: { silent?: boolean }) => Promise<void>;
  retryRating: () => Promise<void>;
}
function newRequestId(): string {
  const id = crypto.randomUUID();
  return id;
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
  return {
    ...snapshot,
    reload,
    refill: (options) => refillStudyQueue(context, options),
    reveal: () => revealStudyAnswer(update),
    rate: (rating) => recordStudyRating(context, rating),
    retryRating: () =>
      snapshot.ratingFailure
        ? recordStudyRating(context, snapshot.ratingFailure.rating)
        : Promise.resolve(),
  };
}

function activateStudySession(reload: () => Promise<void>, runtime: StudyRuntime): () => void {
  void reload();
  return () => {
    runtime.generation += 1;
  };
}
