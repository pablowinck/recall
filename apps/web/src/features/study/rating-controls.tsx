import type { ReviewOption } from '@recall/contracts';
import type { StudySessionState } from './use-study-session';

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
    <button
      className={`rating-button rating-${option.rating}`}
      disabled={session.saving}
      onClick={() => void session.rate(option.rating)}
    >
      <RatingKeyCap rating={option.rating} />
      <strong>{option.label}</strong>
      <span>{option.interval}</span>
    </button>
  );
}

function RatingKeyCap({ rating }: { rating: number }): React.JSX.Element {
  return (
    <kbd className="keycap" aria-hidden="true">
      {rating}
    </kbd>
  );
}
