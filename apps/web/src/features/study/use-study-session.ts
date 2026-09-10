import { useCallback, useEffect, useRef, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { RecallRating } from '@recall/contracts';
import {
  initialStudySnapshot,
  revealStudyAnswer,
  type StudyRuntime,
  type StudySnapshot,
} from './study-state';
import { recordStudyRating, reloadStudyQueue } from './study-actions';

export interface StudySessionState extends StudySnapshot {
  reveal: () => void;
  rate: (rating: RecallRating) => Promise<void>;
  reload: () => Promise<void>;
}
function newRequestId(): string {
  const id = crypto.randomUUID();
  return id;
}

/** Preserve retry identity and prevent duplicate clicks. Example: useStudySession(client). */
export function useStudySession(client: RecallClient, deck?: string): StudySessionState {
  const [snapshot, update] = useState(initialStudySnapshot);
  const runtime = useRef<StudyRuntime>({ pending: false, attempt: null, generation: 0 }).current;
  const reload = useCallback(
    () => reloadStudyQueue(client, runtime, update, deck),
    [client, runtime, deck],
  );
  useEffect(() => activateStudySession(reload, runtime), [reload, runtime]);
  const context = { gateway: client, snapshot, runtime, update, newRequestId };
  return {
    ...snapshot,
    reload,
    reveal: () => revealStudyAnswer(update),
    rate: (rating) => recordStudyRating(context, rating),
  };
}

function activateStudySession(reload: () => Promise<void>, runtime: StudyRuntime): () => void {
  void reload();
  return () => {
    runtime.generation += 1;
  };
}
