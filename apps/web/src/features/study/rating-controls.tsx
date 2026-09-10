import { Tooltip } from '@radix-ui/themes';
import type { ReviewOption } from '@recall/contracts';
import type { StudySessionState } from './use-study-session';
import { RatingFailureNotice } from './rating-failure-notice';
import { describeRating, ratingMeaning } from './rating-meanings';

/** Show the scheduling consequence of each rating. Example: <RatingControls session={session} />. */
export function RatingControls({ session }: { session: StudySessionState }): React.JSX.Element {
  return (
    <div className="rating-section">
      <p>How did you do?</p>
      <div className="rating-grid">
        {session.queue[0]?.options.map((option) => (
          <RatingButton key={option.rating} option={option} session={session} />
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
}: {
  option: ReviewOption;
  session: StudySessionState;
}): React.JSX.Element {
  return (
    // The label says what the rating claims about the recall, which the four words alone never did.
    <Tooltip content={ratingMeaning(option.rating)}>
      <button
        className={`rating-button rating-${option.rating} ${session.savingRating === option.rating ? 'is-chosen' : ''}`}
        aria-label={describeRating(option)}
        aria-keyshortcuts={String(option.rating)}
        disabled={session.saving}
        onClick={() => void session.rate(option.rating)}
      >
        <RatingKeyCap rating={option.rating} />
        <strong>{option.label}</strong>
        <span>{option.interval}</span>
      </button>
    </Tooltip>
  );
}

function RatingKeyCap({ rating }: { rating: number }): React.JSX.Element {
  return (
    <kbd className="keycap" aria-hidden="true">
      {rating}
    </kbd>
  );
}
