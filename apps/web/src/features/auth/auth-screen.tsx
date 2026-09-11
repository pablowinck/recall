'use client';
import { useEffect, useRef, type RefObject } from 'react';
import type { BrowserAuth } from '@/lib/supabase-auth';
import { useDocumentTitle } from '@/lib/use-document-title';
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
  const form = useFocusAfterFailure(state.error);
  useDocumentTitle(state.signup ? 'Create account · Recall' : 'Sign in · Recall');
  return (
    <AuthLayout>
      <form ref={form} onSubmit={state.submit} className="auth-form">
        <AuthHeading signup={state.signup} sessionEnded={sessionEnded} />
        <AuthFields signup={state.signup} busy={state.busy} />
        <AuthFeedback state={state} />
        <AuthActions state={state} />
      </form>
    </AuthLayout>
  );
}

// The submit button disables while a request runs, which drops focus; a failure gives focus back to it, so trying
// again is one key away.
function useFocusAfterFailure(error: string): RefObject<HTMLFormElement | null> {
  const form = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (error) form.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus();
  }, [error]);
  return form;
}
