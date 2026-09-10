import { useEffect, useEffectEvent } from 'react';
import type { StudySessionState } from './use-study-session';
import { readStudyCommand } from './study-keys';

/** Listen once for study shortcuts while always reading the latest session. Example: useStudyKeyboard(session). */
export function useStudyKeyboard(session: StudySessionState): void {
  const onKey = useEffectEvent((event: KeyboardEvent) => processStudyKey(event, session));
  useEffect(() => {
    const listener = (event: KeyboardEvent): void => onKey(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);
}

function processStudyKey(event: KeyboardEvent, session: StudySessionState): void {
  if (session.loading || session.saving || !session.queue.length) return;
  const command = readStudyCommand(event, session.revealed);
  if (command === null) return;
  event.preventDefault();
  if (command === 'reveal') session.reveal();
  else void session.rate(command);
}
