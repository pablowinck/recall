import { useEffect, useEffectEvent, useState } from 'react';
import { Button } from '@radix-ui/themes';
import { Check } from 'lucide-react';
import type { StudySessionState } from './use-study-session';
import { describeCompletion, nextReturnDelay } from './returning-cards';

type CheckState = 'idle' | 'checking' | 'nothing';
// Leaves room for server/client clock skew before asking for cards that should be due again.
const RESUME_MARGIN_MS = 5000;

/** Finish a batch, say which cards come back soon, and resume once they are due. Example: <SessionComplete session={session} exit={exit} />. */
export function SessionComplete({
  session,
  exit,
}: {
  session: StudySessionState;
  exit: () => void;
}): React.JSX.Element {
  useReturningCardsResume(session);
  return (
    <div className="session-complete view-enter">
      <span className="complete-mark">
        <Check size={35} strokeWidth={1.7} />
      </span>
      <h1>{session.completed ? 'Nicely done' : 'All caught up'}</h1>
      <p>{describeCompletion(session.completed, session.returning, new Date())}</p>
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
    await session.refill({ silent: true });
    setCheck('nothing');
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
        {check === 'nothing' ? 'Nothing is due yet.' : ''}
      </p>
    </>
  );
}

// "Again" brings a card back within minutes; continue the session on its own once it is due.
function useReturningCardsResume(session: StudySessionState): void {
  const resume = useEffectEvent(() => void session.refill({ silent: true }));
  const returning = session.returning;
  useEffect(() => {
    const delay = nextReturnDelay(returning, new Date());
    if (delay === null) return;
    const timer = window.setTimeout(() => resume(), delay + RESUME_MARGIN_MS);
    return () => window.clearTimeout(timer);
  }, [returning]);
}
