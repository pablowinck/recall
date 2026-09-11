'use client';
import type { BrowserAuth } from '@/lib/supabase-auth';
import { useAuthForm } from './use-auth-form';
import { AuthLayout } from './auth-layout';
import { AuthFields } from './auth-fields';
import { AuthActions, AuthFeedback, AuthHeading } from './auth-copy';

/** Sign in or create an account through Supabase Auth. Example: <AuthScreen auth={auth} />. */
export function AuthScreen({
  auth,
  startSignedUp = false,
  sessionEnded = false,
}: {
  auth: BrowserAuth;
  startSignedUp?: boolean;
  /** The API rejected the last session, so the heading says why sign-in is back. */
  sessionEnded?: boolean;
}): React.JSX.Element {
  const state = useAuthForm(auth, startSignedUp);
  return (
    <AuthLayout>
      <form onSubmit={state.submit} className="auth-form">
        <AuthHeading signup={state.signup} sessionEnded={sessionEnded} />
        <AuthFields signup={state.signup} busy={state.busy} />
        <AuthFeedback state={state} />
        <AuthActions state={state} />
      </form>
    </AuthLayout>
  );
}
