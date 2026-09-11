import { Button } from '@radix-ui/themes';
import { LockKeyhole } from 'lucide-react';
import { ErrorNotice } from '@/components/feedback';
import type { AuthFormState } from './use-auth-form';

/** Explain the current account action. Example: <AuthHeading signup={false} />. */
export function AuthHeading({ signup }: { signup: boolean }): React.JSX.Element {
  return (
    <>
      <h1>{signup ? 'Start remembering' : 'Welcome back'}</h1>
      <p>
        {signup
          ? 'Create an account and save what you want to learn.'
          : 'Sign in and pick up where you left off.'}
      </p>
    </>
  );
}

/** Announce account feedback without losing form fields. Example: <AuthFeedback state={state} />. */
export function AuthFeedback({ state }: { state: AuthFormState }): React.JSX.Element {
  return (
    <>
      {state.error && <ErrorNotice message={state.error} />}
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
