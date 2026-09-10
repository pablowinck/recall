import { Button, Spinner } from '@radix-ui/themes';
import { AlertCircle, CloudOff } from 'lucide-react';

/** Announce what is loading, accessibly. Example: <LoadingState label="Loading your cards…" />. */
export function LoadingState({
  label = 'Getting your workspace ready…',
}: {
  label?: string;
}): React.JSX.Element {
  return (
    <div className="loading-state" role="status">
      <Spinner size="3" />
      <span>{label}</span>
    </div>
  );
}

/** Present a recoverable failure inside a view that still works. Example: <ErrorNotice message={error} retry={reload} />. */
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
        <Button variant="soft" color="gray" onClick={retry}>
          Try again
        </Button>
      )}
    </div>
  );
}

/** Replace a view that could not load at all with a calm, centered recovery. Example: <ErrorState title="Couldn’t load Recall" message={error} retry={reload} />. */
export function ErrorState({
  title,
  message,
  retry,
}: {
  title: string;
  message: string;
  retry: () => void;
}): React.JSX.Element {
  return (
    <section className="error-state" role="alert">
      <CloudOff size={32} strokeWidth={1.5} />
      <h1>{title}</h1>
      <p>{message}</p>
      <Button size="3" onClick={retry}>
        Try again
      </Button>
    </section>
  );
}

export { describeFailure } from '../lib/error-message';
