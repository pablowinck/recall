import { Button } from '@radix-ui/themes';
import { ArrowRight, Check } from 'lucide-react';
import type { StudySessionState } from './use-study-session';

/** Finish a review batch without rating future cards. Example: <SessionComplete session={session} exit={exit} />. */
export function SessionComplete({
  session,
  exit,
}: {
  session: StudySessionState;
  exit: () => void;
}): React.JSX.Element {
  return (
    <div className="session-complete view-enter">
      <span className="complete-mark">
        <Check size={35} strokeWidth={1.7} />
      </span>
      <h1>{session.completed ? 'Nicely done' : 'All caught up'}</h1>
      <CompletionMessage completed={session.completed} />
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
  return (
    <>
      <Button size="3" onClick={exit}>
        Back to Today
      </Button>
      <button className="text-button" onClick={() => void session.reload()}>
        Check for more reviews <ArrowRight size={16} />
      </button>
    </>
  );
}

function CompletionMessage({ completed }: { completed: number }): React.JSX.Element {
  const message = completed
    ? `You reviewed ${completed} ${completed === 1 ? 'card' : 'cards'} in this session.`
    : 'No cards are due for review right now.';
  return <p>{message}</p>;
}
