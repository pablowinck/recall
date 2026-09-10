'use client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useAuthForm } from './use-auth-form';
import { AuthLayout } from './auth-layout';
import { AuthFields } from './auth-fields';
import { AuthActions, AuthFeedback, AuthHeading } from './auth-copy';

/** Sign in or create an account through Supabase Auth. Example: <AuthScreen auth={auth} />. */
export function AuthScreen({ auth }: { auth: SupabaseClient }): React.JSX.Element {
  const state = useAuthForm(auth);
  return (
    <AuthLayout>
      <form onSubmit={state.submit} className="auth-form">
        <AuthHeading signup={state.signup} />
        <AuthFields signup={state.signup} busy={state.busy} />
        <AuthFeedback state={state} />
        <AuthActions state={state} />
      </form>
    </AuthLayout>
  );
}
