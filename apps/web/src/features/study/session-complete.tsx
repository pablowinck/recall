import { useEffect, useEffectEvent, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { Check } from 'lucide-react';
import type { StudySessionState } from './use-study-session';
import type { RefillResult } from './study-actions';
import { describeCompletion, nextReturnDelay } from './returning-cards';

type CheckState = 'idle' | 'checking' | RefillResult;
// Leaves room for server/client clock skew before asking for cards that should be due again.
const RESUME_MARGIN_MS = 5000;
// While cards are still expected, a failed or early check tries again at this pace.
const RESUME_RETRY_MS = 30000;
const CHECK_MESSAGES: Record<CheckState, string> = {
  idle: '',
  checking: '',
  loaded: '',
  empty: 'Nothing is due yet.',
  failed: 'Couldn’t check for more cards. Check your connection and try again.',
};

/** Finish a batch, say which cards come back soon, and resume once they are due. Example: <SessionComplete session={session} exit={exit} />. */
export function SessionComplete({
  session,
  exit,
}: {
  session: StudySessionState;
  exit: () => void;
}): React.JSX.Element {
  useReturningCardsResume(session);
  const now = useHalfMinuteClock();
  return (
    <div className="session-complete view-enter">
      <span className="complete-mark">
        <Check size={35} strokeWidth={1.7} />
      </span>
      <h1>{session.completed ? 'Nicely done' : 'All caught up'}</h1>
      <p>{describeCompletion(session.completed, session.returning, now)}</p>
      <SessionCompleteActions session={session} exit={exit} />
    </div>
  );
}

function SessionCompleteActions({
  session,
  exit,
}: {
  session: StudySessionState;
  exit: () => void;
}): React.JSX.Element {
  const [check, setCheck] = useState<CheckState>('idle');
  const checkNow = async (): Promise<void> => {
    setCheck('checking');
    setCheck(await session.refill({ silent: true }));
  };
  return (
    <>
      <Button size="3" onClick={exit}>
        Back to Today
      </Button>
      <Button variant="ghost" loading={check === 'checking'} onClick={() => void checkNow()}>
        Check for more reviews
      </Button>
      <p className="check-status" role="status">
        {CHECK_MESSAGES[check]}
      </p>
    </>
  );
}

// Keeps "about N min" true while someone waits on this screen.
function useHalfMinuteClock(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

// "Again" brings a card back within minutes; continue the session on its own once it is due.
function useReturningCardsResume(session: StudySessionState): void {
  const resume = useEffectEvent(() => session.refill({ silent: true }));
  const returning = session.returning;
  useEffect(
    () => scheduleResume(nextReturnDelay(returning, new Date()), () => resume()),
    [returning],
  );
}

// Retries after failures or early checks, and immediately when the tab or the network comes back.
function scheduleResume(
  delay: number | null,
  resume: () => Promise<RefillResult>,
): (() => void) | undefined {
  if (delay === null) return undefined;
  let timer = 0;
  let disposed = false;
  const attempt = (): void => {
    window.clearTimeout(timer);
    void resume().then((result) => {
      if (!disposed && result !== 'loaded') timer = window.setTimeout(attempt, RESUME_RETRY_MS);
    });
  };
  const onReturn = (): void => {
    if (document.visibilityState === 'visible') attempt();
  };
  timer = window.setTimeout(attempt, delay + RESUME_MARGIN_MS);
  window.addEventListener('online', onReturn);
  document.addEventListener('visibilitychange', onReturn);
  return () => {
    disposed = true;
    window.clearTimeout(timer);
    window.removeEventListener('online', onReturn);
    document.removeEventListener('visibilitychange', onReturn);
  };
}
