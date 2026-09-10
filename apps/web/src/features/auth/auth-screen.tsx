'use client';
import { useState, type FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { RecallBrand } from '@/components/brand';
import { ErrorNotice } from '@/components/feedback';

/** Sign in or create an account through Supabase Auth. Example: <AuthScreen auth={auth} />. */
export function AuthScreen({ auth }: { auth: SupabaseClient }): React.JSX.Element {
  const [signup, setSignup] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setNotice('');
    const fields = new FormData(event.currentTarget);
    try {
      setNotice(
        await authenticate(
          auth,
          signup,
          String(fields.get('email')),
          String(fields.get('password')),
        ),
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to sign in. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout>
      <form onSubmit={submit} className="auth-form">
        <span className="eyebrow">YOUR LEARNING SPACE</span>
        <h1>{signup ? 'Start remembering.' : 'Welcome back.'}</h1>
        <p>
          {signup
            ? 'Create an account and save what you want to learn.'
            : 'Sign in and pick up where you left off.'}
        </p>
        <AuthFields signup={signup} />
        {error && <ErrorNotice message={error} />}
        {notice && <p role="status">{notice}</p>}
        <Button size="3" type="submit" loading={busy}>
          {signup ? 'Create account' : 'Sign in'}
          <ArrowRight size={18} />
        </Button>
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setSignup(!signup);
            setError('');
          }}
        >
          {signup ? 'I already have an account' : 'Create a new account'}
        </button>
        <span className="privacy-note">
          <LockKeyhole size={14} />
          Your cards stay yours.
        </span>
      </form>
    </AuthLayout>
  );
}

function AuthFields({ signup }: { signup: boolean }): React.JSX.Element {
  return (
    <div className="form-fields">
      <label>
        Email
        <TextField.Root
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          size="3"
        />
      </label>
      <label>
        Password
        <TextField.Root
          name="password"
          type="password"
          autoComplete={signup ? 'new-password' : 'current-password'}
          placeholder={signup ? 'At least 10 characters' : 'Your password'}
          minLength={signup ? 10 : undefined}
          required
          size="3"
        />
      </label>
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <main className="auth-shell">
      <div className="auth-left">
        <RecallBrand />
        {children}
        <footer>A little today. Remembered tomorrow.</footer>
      </div>
      <div className="auth-preview">
        <div className="sample-card">
          <span className="eyebrow">
            <Sparkles size={15} /> AN EXAMPLE CARD
          </span>
          <h2>
            I’d like
            <br />
            some tea.
          </h2>
          <div className="sample-divider" />
          <p>
            <strong>I’d = I would</strong>
            <br />A polite way to ask for tea.
          </p>
        </div>
        <p className="preview-caption">
          A small discovery today.
          <br />
          Something you remember tomorrow.
        </p>
      </div>
    </main>
  );
}

async function authenticate(
  auth: SupabaseClient,
  signup: boolean,
  email: string,
  password: string,
): Promise<string> {
  const result = signup
    ? await auth.auth.signUp({ email, password })
    : await auth.auth.signInWithPassword({ email, password });
  if (result.error) {
    if (result.error.message.includes('Invalid login'))
      throw new Error('Incorrect email or password. Check your details and try again.');
    throw new Error(result.error.message);
  }
  return signup && !result.data.session ? 'Check your email to confirm your account.' : '';
}
