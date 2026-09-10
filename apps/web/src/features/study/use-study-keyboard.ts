import { useEffect } from 'react';
import type { RecallRating } from '@recall/contracts';
import type { StudySessionState } from './use-study-session';

/** Preserve text entry and ignore repeated keyboard ratings. Example: useStudyKeyboard(session). */
export function useStudyKeyboard(session: StudySessionState): void {
  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => processStudyKey(event, session);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [session]);
}

function processStudyKey(event: KeyboardEvent, session: StudySessionState): void {
  if (session.loading || session.saving || !session.queue.length || event.repeat) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (
    (event.target as HTMLElement).closest(
      'input,textarea,select,[role="dialog"],[role="alertdialog"]',
    )
  )
    return;
  if ((event.code === 'Space' || event.key === 'Enter') && !session.revealed) {
    event.preventDefault();
    session.reveal();
  }
  if (session.revealed && /^[1-4]$/.test(event.key)) {
    event.preventDefault();
    void session.rate(Number(event.key) as RecallRating);
  }
}
