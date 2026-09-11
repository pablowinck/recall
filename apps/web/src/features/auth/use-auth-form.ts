import { useState, type FormEvent } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { useAsyncAction } from '@/lib/use-async-action';
import { describeAuthFailure } from './auth-errors';

export interface AuthFormState {
  signup: boolean;
  busy: boolean;
  error: string;
  notice: string;
  submit: (event: FormEvent<HTMLFormElement>) => void;
  toggle: () => void;
}

/** Separate account state from the auth presentation. Example: useAuthForm(auth, true). */
export function useAuthForm(auth: SupabaseClient, startSignedUp = false): AuthFormState {
  const [signup, setSignup] = useState(startSignedUp);
  const [notice, setNotice] = useState('');
  const action = useAsyncAction();
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    void action.run(async () => {
      setNotice('');
      setNotice(await authenticate(auth, signup, fields));
    });
  };
  const toggle = (): void => {
    setSignup(!signup);
    setNotice('');
    action.clear();
  };
  return { signup, notice, busy: action.busy, error: action.error, submit, toggle };
}

async function authenticate(
  auth: SupabaseClient,
  signup: boolean,
  fields: FormData,
): Promise<string> {
  const credentials = {
    email: String(fields.get('email')).trim(),
    password: String(fields.get('password')),
  };
  // Confirming the email returns to this page, so a sign-up on the consent screen resumes the assistant's request.
  const result = signup
    ? await auth.auth.signUp({ ...credentials, options: { emailRedirectTo: window.location.href } })
    : await auth.auth.signInWithPassword(credentials);
  if (result.error) throw new Error(describeAuthFailure(result.error.message));
  return signup && !result.data.session ? 'Check your email to confirm your account.' : '';
}
