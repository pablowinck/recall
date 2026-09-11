import { Button } from '@radix-ui/themes';
import { AlertCircle } from 'lucide-react';
import type { StudySessionState } from './use-study-session';

/**
 * Keep the revealed answer on screen and offer the recovery that fits the failure: retry the same
 * rating (same request id, so it is idempotent) or reload a card that changed since it loaded.
 * Example: <RatingFailureNotice session={session} />.
 */
export function RatingFailureNotice({
  session,
}: {
  session: StudySessionState;
}): React.JSX.Element | null {
  const failure = session.ratingFailure;
  if (!failure) return null;
  return (
    <div className="error-notice rating-failure" role="alert">
      <AlertCircle size={19} />
      <span>
        {failure.conflict
          ? 'This card changed since it loaded. Reload it to review the latest version.'
          : 'Your rating wasn’t saved. Check your connection and try again.'}
      </span>
      <RatingRecovery session={session} conflict={failure.conflict} />
    </div>
  );
}

function RatingRecovery({
  session,
  conflict,
}: {
  session: StudySessionState;
  conflict: boolean;
}): React.JSX.Element {
  if (conflict)
    return (
      <Button variant="soft" onClick={() => void session.reload()}>
        Reload card
      </Button>
    );
  return (
    <Button variant="soft" loading={session.saving} onClick={() => void session.retryRating()}>
      Retry
    </Button>
  );
}
