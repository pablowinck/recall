import { Tooltip } from '@radix-ui/themes';
import type { ReviewOption } from '@recall/contracts';
import { useHoverPointer } from '@/lib/use-hover-pointer';
import type { StudySessionState } from './use-study-session';
import { RatingFailureNotice } from './rating-failure-notice';
import { describeRating, ratingMeaning } from './rating-meanings';

/** Show the scheduling consequence of each rating. Example: <RatingControls session={session} />. */
export function RatingControls({ session }: { session: StudySessionState }): React.JSX.Element {
  const canHover = useHoverPointer();
  return (
    <div className="rating-section">
      <p>How did you do?</p>
      <div className="rating-grid">
        {session.queue[0]?.options.map((option) => (
          <RatingButton key={option.rating} option={option} session={session} canHover={canHover} />
        ))}
      </div>
      <RatingFailureNotice session={session} />
      <span className="keyboard-hint">
        Use keys 1–4 · Take your time and rate your recall honestly.
      </span>
    </div>
  );
}

function RatingButton({
  option,
  session,
  canHover,
}: {
  option: ReviewOption;
  session: StudySessionState;
  canHover: boolean;
}): React.JSX.Element {
  const rate = (event: React.MouseEvent<HTMLButtonElement>): void => {
    // The ratings appear where "Reveal answer" was, so the second click of a double click or double tap lands on
    // one. Browsers count that click as 2; a single click or tap is 1 and keyboard activation is 0.
    if (event.detail > 1) return;
    void session.rate(option.rating);
  };
  const button = (
    <button
      className={`rating-button rating-${option.rating} ${session.savingRating === option.rating ? 'is-chosen' : ''}`}
      aria-label={describeRating(option)}
      aria-keyshortcuts={String(option.rating)}
      disabled={session.saving}
      onClick={rate}
    >
      <RatingKeyCap rating={option.rating} />
      <strong>{option.label}</strong>
      <span>{option.interval}</span>
    </button>
  );
  // The label already says what the rating claims; the hint repeats it for a pointer that hovers. Radix opens
  // tooltips on the focus a tap gives, which flashed a hint and cost frames on every rating on touch screens.
  if (!canHover) return button;
  return <Tooltip content={ratingMeaning(option.rating)}>{button}</Tooltip>;
}

function RatingKeyCap({ rating }: { rating: number }): React.JSX.Element {
  return (
    <kbd className="keycap" aria-hidden="true">
      {rating}
    </kbd>
  );
}
