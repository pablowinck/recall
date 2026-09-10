import type { ReviewOption } from '@recall/contracts';
import type { StudySessionState } from './use-study-session';

/** Expõe consequências de cada escolha. Exemplo: <RatingControls session={session} />. */
export function RatingControls({ session }: { session: StudySessionState }): React.JSX.Element {
  return (
    <div className="rating-section">
      <p>Como foi lembrar?</p>
      <div className="rating-grid">
        {session.queue[0]?.options.map((option) => (
          <RatingButton key={option.rating} option={option} session={session} />
        ))}
      </div>
      <span className="keyboard-hint">
        Use as teclas 1 a 4 · Sem pressa, seja honesto com sua memória.
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
      <span className="rating-key" aria-hidden="true">
        {option.rating}
      </span>
      <strong>{option.label}</strong>
      <span>{option.interval}</span>
    </button>
  );
}
