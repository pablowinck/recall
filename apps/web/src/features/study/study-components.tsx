import { useEffect, useRef, type RefObject } from 'react';
import { Button, Progress } from '@radix-ui/themes';
import { ArrowLeft } from 'lucide-react';
import type { StudyCard } from '@recall/contracts';
import type { StudySessionState } from './use-study-session';
import { RatingControls } from './rating-controls';
import { CardBody, CardInline } from '@/components/card-text';
import { frontSizeClass } from './card-typography';
import { revealScrollTop } from './reveal-scroll';

interface StudyProgressProps {
  session: StudySessionState;
  expectedTotal: number;
  exit: () => void;
}

/** Show progress against the cards due when the session started. Example: <StudyProgress session={session} expectedTotal={26} exit={exit} />. */
export function StudyProgress({
  session,
  expectedTotal,
  exit,
}: StudyProgressProps): React.JSX.Element {
  // Cards load 20 at a time; Today's due count keeps "3 of 26" honest from the first card.
  const total = Math.max(expectedTotal, session.completed + session.queue.length);
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
  deckName?: string;
  revealed: boolean;
  onReveal?: () => void;
}

/** Render card text without executing its markup. Example: <ReviewContent current={card} revealed />. */
export function ReviewContent({
  current,
  deckName,
  revealed,
  onReveal,
}: ReviewContentProps): React.JSX.Element | null {
  const focus = useStudyFocus(current?.card.id, revealed);
  useScrollToTopOnCardChange(current?.card.id);
  if (!current) return null;
  const isClickable = !revealed && Boolean(onReveal);
  return (
    <>
      <StudyCardContext deckName={deckName} tags={current.card.tags} />
      <article
        ref={focus.card}
        tabIndex={-1}
        className={`review-card ${revealed ? 'is-revealed' : ''} ${isClickable ? 'is-clickable' : ''}`}
        onClick={isClickable ? onReveal : undefined}
      >
        <span className="eyebrow">Front</span>
        <h2 className={frontSizeClass(current.card.front)}>
          <CardInline text={current.card.front} />
        </h2>
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
  // Revealing moves focus here, which reads the answer; a live region as well read it twice.
  return (
    <div className="review-answer" ref={focusRef} tabIndex={-1}>
      <span className="eyebrow">Answer</span>
      <CardBody text={answer} />
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
  useEffect(() => {
    if (revealed) scrollAnswerIntoView(answer.current);
  }, [cardId, revealed]);
  return { card, answer };
}

// A long question can push its answer below the fold, so revealing has to bring the answer to the reader.
function scrollAnswerIntoView(answer: HTMLElement | null): void {
  if (!answer) return;
  const top = revealScrollTop({
    answerTop: answer.getBoundingClientRect().top,
    viewportHeight: window.innerHeight,
    scrollY: window.scrollY,
  });
  if (top === null) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduced ? 'instant' : 'smooth' });
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
      <Button size="4" aria-keyshortcuts="Space Enter" onClick={session.reveal}>
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

function StudyCardContext({
  deckName,
  tags,
}: {
  deckName?: string;
  tags: string[];
}): React.JSX.Element {
  return (
    <div className="study-context">
      <span className="eyebrow">{deckName ?? 'Recall before revealing'}</span>
      <span>{tags.join(' · ')}</span>
    </div>
  );
}
