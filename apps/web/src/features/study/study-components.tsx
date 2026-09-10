import { Button, Progress } from '@radix-ui/themes';
import { ArrowLeft, CornerDownLeft } from 'lucide-react';
import type { StudyCard } from '@recall/contracts';
import type { StudySessionState } from './use-study-session';
import { RatingControls } from './rating-controls';

/** Show progress for the current review session. Example: <StudyProgress session={session} exit={exit} />. */
export function StudyProgress({
  session,
  exit,
}: {
  session: StudySessionState;
  exit: () => void;
}): React.JSX.Element {
  const total = session.completed + session.queue.length;
  return (
    <>
      <header className="study-header">
        <button className="text-button" onClick={exit}>
          <ArrowLeft size={17} />
          Leave session
        </button>
        <span>
          {session.completed} of {total} reviewed
        </span>
      </header>
      <Progress
        aria-label="Session progress"
        value={total ? (session.completed / total) * 100 : 0}
        size="1"
      />
    </>
  );
}

/** Render card text without executing its markup. Example: <ReviewContent current={card} revealed />. */
export function ReviewContent({
  current,
  revealed,
}: {
  current?: StudyCard;
  revealed: boolean;
}): React.JSX.Element | null {
  if (!current) return null;
  return (
    <>
      <div className="study-context">
        <span className="eyebrow">RECALL BEFORE REVEALING</span>
        <span>{current.card.tags[1] ?? 'Your learning'}</span>
      </div>
      <article className={`review-card ${revealed ? 'is-revealed' : ''}`}>
        <span className="eyebrow">FRONT</span>
        <h1>{current.card.front}</h1>
        {revealed && (
          <div className="review-answer" aria-live="polite">
            <span className="eyebrow">ANSWER</span>
            <div>{current.card.back}</div>
          </div>
        )}
      </article>
    </>
  );
}

/** Allow a rating only after revealing the answer. Example: <StudyActions session={session} />. */
export function StudyActions({ session }: { session: StudySessionState }): React.JSX.Element {
  if (session.revealed) return <RatingControls session={session} />;
  return (
    <div className="reveal-action">
      <Button size="4" onClick={session.reveal}>
        Reveal answer <CornerDownLeft size={19} />
      </Button>
      <span>Press Space to reveal</span>
    </div>
  );
}
