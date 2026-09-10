import { Button, Progress } from '@radix-ui/themes';
import { ArrowLeft, CornerDownLeft } from 'lucide-react';
import type { StudyCard } from '@recall/contracts';
import type { StudySessionState } from './use-study-session';
import { RatingControls } from './rating-controls';

interface StudyProgressProps {
  session: StudySessionState;
  exit: () => void;
}

/** Show progress for the current review session. Example: <StudyProgress session={session} exit={exit} />. */
export function StudyProgress({ session, exit }: StudyProgressProps): React.JSX.Element {
  const total = session.completed + session.queue.length;
  const pct = total ? (session.completed / total) * 100 : 0;
  return (
    <>
      <StudyProgressHeader completed={session.completed} total={total} exit={exit} />
      <Progress aria-label="Session progress" value={pct} size="1" />
    </>
  );
}

function StudyProgressHeader({
  completed,
  total,
  exit,
}: {
  completed: number;
  total: number;
  exit: () => void;
}): React.JSX.Element {
  return (
    <header className="study-header">
      <ExitStudyButton exit={exit} />
      <span>
        {completed} of {total} reviewed
      </span>
    </header>
  );
}

interface ReviewContentProps {
  current?: StudyCard;
  revealed: boolean;
  onReveal?: () => void;
}

/** Render card text without executing its markup. Example: <ReviewContent current={card} revealed />. */
export function ReviewContent({
  current,
  revealed,
  onReveal,
}: ReviewContentProps): React.JSX.Element | null {
  if (!current) return null;
  const isClickable = !revealed && Boolean(onReveal);
  return (
    <>
      <StudyCardContext category={current.card.tags[0] ?? 'Your learning'} />
      <article
        className={`review-card ${revealed ? 'is-revealed' : ''} ${isClickable ? 'is-clickable' : ''}`}
        onClick={isClickable ? onReveal : undefined}
      >
        <span className="eyebrow">FRONT</span>
        <h1>{current.card.front}</h1>
        {revealed && <ReviewAnswer answer={current.card.back} />}
      </article>
    </>
  );
}

function ReviewAnswer({ answer }: { answer: string }): React.JSX.Element {
  return (
    <div className="review-answer" aria-live="polite">
      <span className="eyebrow">ANSWER</span>
      <div>{answer}</div>
    </div>
  );
}

/** Allow a rating only after revealing the answer. Example: <StudyActions session={session} />. */
export function StudyActions({
  session,
}: {
  session: StudySessionState;
}): React.JSX.Element | null {
  if (!session.queue.length) return null;
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

function ExitStudyButton({ exit }: { exit: () => void }): React.JSX.Element {
  return (
    <button className="text-button" onClick={exit}>
      <ArrowLeft size={17} />
      Leave session
    </button>
  );
}

function StudyCardContext({ category }: { category: string }): React.JSX.Element {
  return (
    <div className="study-context">
      <span className="eyebrow">RECALL BEFORE REVEALING</span>
      <span>{category}</span>
    </div>
  );
}
