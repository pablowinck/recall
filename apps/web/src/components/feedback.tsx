import { Button, Spinner } from '@radix-ui/themes';
import { AlertCircle } from 'lucide-react';

/** Announce an actual loading state accessibly. Example: <LoadingState />. */
export function LoadingState(): React.JSX.Element {
  return (
    <div className="loading-state" role="status">
      <Spinner size="3" />
      <span>Getting your workspace ready…</span>
    </div>
  );
}

/** Present an actionable, recoverable failure. Example: <ErrorNotice message={error} retry={reload} />. */
export function ErrorNotice({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}): React.JSX.Element {
  return (
    <div className="error-notice" role="alert">
      <AlertCircle size={19} />
      <span>{message}</span>
      {retry && (
        <Button variant="soft" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export { describeFailure } from '../lib/error-message';
