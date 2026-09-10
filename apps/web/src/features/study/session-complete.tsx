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
      <span className="eyebrow">ONE STEP FORWARD</span>
      <h1>{session.completed ? 'Nicely done.' : 'All caught up.'}</h1>
      <CompletionMessage completed={session.completed} />
      <Button size="3" onClick={() => void session.reload()}>
        Check for more reviews
        <ArrowRight size={17} />
      </Button>
      <button className="text-button" onClick={exit}>
        Back to today
      </button>
    </div>
  );
}

function CompletionMessage({ completed }: { completed: number }): React.JSX.Element {
  const message = completed
    ? `You reviewed ${completed} cards in this session.`
    : 'No cards are due for review right now.';
  return (
    <p>
      {message}
      <br />
      Every review makes the memory a little stronger.
    </p>
  );
}
