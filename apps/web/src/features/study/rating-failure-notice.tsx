import { Button } from '@radix-ui/themes';
import { AlertCircle } from 'lucide-react';
import type { RatingFailureReason } from './study-state';
import type { StudySessionState } from './use-study-session';

const FAILURE_COPY: Record<RatingFailureReason, string> = {
  unsaved: 'Your rating wasn’t saved. Check your connection and try again.',
  changed: 'This card changed since it loaded. Reload it to review the latest version.',
  deleted: 'This card was deleted, perhaps by your assistant.',
};

/**
 * Keep the revealed answer on screen and offer the recovery that fits the failure: retry the same rating (same
 * request id, so it is idempotent), reload a card that changed, or move past a card that was deleted.
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
      <span>{FAILURE_COPY[failure.reason]}</span>
      <RatingRecovery session={session} reason={failure.reason} />
    </div>
  );
}

function RatingRecovery({
  session,
  reason,
}: {
  session: StudySessionState;
  reason: RatingFailureReason;
}): React.JSX.Element {
  if (reason === 'unsaved')
    return (
      // Disabling the focused button while it retries would drop focus to the page, so it reports busy instead.
      <Button variant="soft" aria-busy={session.saving} onClick={() => void session.retryRating()}>
        {session.saving ? 'Retrying…' : 'Retry'}
      </Button>
    );
  return (
    <Button variant="soft" onClick={() => void session.reload()}>
      {reason === 'deleted' ? 'Next card' : 'Reload card'}
    </Button>
  );
}
