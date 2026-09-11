import { Button } from '@radix-ui/themes';
import { LockKeyhole } from 'lucide-react';
import type { MouseEvent } from 'react';
import { ErrorNotice } from '@/components/feedback';
import { ALREADY_REGISTERED } from './auth-errors';
import type { AuthFormState } from './use-auth-form';

/** Explain the current account action. Example: <AuthHeading signup={false} sessionEnded={false} />. */
export function AuthHeading({
  signup,
  sessionEnded = false,
}: {
  signup: boolean;
  sessionEnded?: boolean;
}): React.JSX.Element {
  return (
    <>
      <h1>{signup ? 'Start remembering' : 'Welcome back'}</h1>
      <p>{describeAuthPurpose(signup, sessionEnded)}</p>
    </>
  );
}

function describeAuthPurpose(signup: boolean, sessionEnded: boolean): string {
  if (signup) return 'Create an account and save what you want to learn.';
  if (sessionEnded) return 'Your session ended. Sign in again to pick up where you left off.';
  return 'Sign in and pick up where you left off.';
}

/** Announce account feedback without losing form fields. Example: <AuthFeedback state={state} />. */
export function AuthFeedback({ state }: { state: AuthFormState }): React.JSX.Element {
  return (
    <>
      {state.error && <ErrorNotice message={state.error} />}
      {state.error === ALREADY_REGISTERED && (
        <button
          type="button"
          className="text-button"
          data-recovery
          onClick={(event) => switchToSignIn(event, state)}
        >
          Sign in instead
        </button>
      )}
      {state.notice && <p role="status">{state.notice}</p>}
    </>
  );
}

/** Prevent mode changes while an authentication request is pending. Example: <AuthActions state={state} />. */
export function AuthActions({ state }: { state: AuthFormState }): React.JSX.Element {
  return (
    <>
      <Button size="3" type="submit" loading={state.busy}>
        {state.signup ? 'Create account' : 'Sign in'}
      </Button>
      <button type="button" className="text-button" onClick={state.toggle} disabled={state.busy}>
        {state.signup ? 'I already have an account' : 'Create a new account'}
      </button>
      <span className="privacy-note">
        <LockKeyhole size={14} />
        Only your account can reach your cards.
      </span>
    </>
  );
}

// The fields stay in place across modes, so the email is kept and the cursor waits in the password field.
function switchToSignIn(event: MouseEvent<HTMLButtonElement>, state: AuthFormState): void {
  const form = event.currentTarget.form;
  state.toggle();
  form?.querySelector<HTMLInputElement>('input[name="password"]')?.focus();
}
