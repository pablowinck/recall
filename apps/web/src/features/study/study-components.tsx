import { useEffect, useRef, type RefObject } from 'react';
import { Button, Progress } from '@radix-ui/themes';
import { ArrowLeft } from 'lucide-react';
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
      <Progress aria-label="Session progress" value={pct} size="2" />
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
      <h1 className="visually-hidden">Review session</h1>
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
  const focus = useStudyFocus(current?.card.id, revealed);
  useScrollToTopOnCardChange(current?.card.id);
  if (!current) return null;
  const isClickable = !revealed && Boolean(onReveal);
  return (
    <>
      <StudyCardContext category={current.card.tags.join(' · ')} />
      <article
        ref={focus.card}
        tabIndex={-1}
        className={`review-card ${revealed ? 'is-revealed' : ''} ${isClickable ? 'is-clickable' : ''}`}
        onClick={isClickable ? onReveal : undefined}
      >
        <span className="eyebrow">Front</span>
        <h2>{current.card.front}</h2>
        {revealed && <ReviewAnswer answer={current.card.back} focusRef={focus.answer} />}
      </article>
    </>
  );
}

function ReviewAnswer({
  answer,
  focusRef,
}: {
  answer: string;
  focusRef: RefObject<HTMLDivElement | null>;
}): React.JSX.Element {
  return (
    <div className="review-answer" aria-live="polite" ref={focusRef} tabIndex={-1}>
      <span className="eyebrow">Answer</span>
      <div>{answer}</div>
    </div>
  );
}

interface StudyFocusTargets {
  card: RefObject<HTMLElement | null>;
  answer: RefObject<HTMLDivElement | null>;
}

/** Keep keyboard and screen-reader users on the card when the control they used disappears. Example: useStudyFocus(id, revealed). */
function useStudyFocus(cardId: string | undefined, revealed: boolean): StudyFocusTargets {
  const card = useRef<HTMLElement>(null);
  const answer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const active = document.activeElement;
    // Respect a control the person focused on purpose, such as "Leave session".
    if (active && active !== document.body && active !== card.current) return;
    (revealed ? answer.current : card.current)?.focus({ preventScroll: true });
  }, [cardId, revealed]);
  return { card, answer };
}

// A long answer can leave the page scrolled; every new card should start at its question.
function useScrollToTopOnCardChange(cardId: string | undefined): void {
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
  }, [cardId]);
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
        Reveal answer
      </Button>
      <span className="reveal-hint">
        Press <kbd className="keycap">Space</kbd> or <kbd className="keycap">↵</kbd> to reveal
      </span>
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
      <span className="eyebrow">Recall before revealing</span>
      <span>{category}</span>
    </div>
  );
}
