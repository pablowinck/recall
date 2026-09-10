'use client';
import { useState, type FormEvent } from 'react';
import { Button, TextField } from '@radix-ui/themes';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ArrowRight, LockKeyhole, Sparkles } from 'lucide-react';
import { RecallBrand } from '@/components/brand';
import { ErrorNotice } from '@/components/feedback';

/** Formulário de entrada e cadastro via Supabase. Exemplo: <AuthScreen auth={auth} />. */
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
      setError(failure instanceof Error ? failure.message : 'Não foi possível entrar.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout>
      <form onSubmit={submit} className="auth-form">
        <span className="eyebrow">SEU ESPAÇO DE APRENDIZADO</span>
        <h1>{signup ? 'Comece a lembrar.' : 'Bom ter você aqui.'}</h1>
        <p>
          {signup
            ? 'Crie sua conta e guarde o que quer aprender.'
            : 'Entre para continuar de onde parou.'}
        </p>
        <AuthFields signup={signup} />
        {error && <ErrorNotice message={error} />}
        {notice && <p role="status">{notice}</p>}
        <Button size="3" type="submit" loading={busy}>
          {signup ? 'Criar minha conta' : 'Entrar'}
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
          {signup ? 'Já tenho uma conta' : 'Ainda não tenho conta'}
        </button>
        <span className="privacy-note">
          <LockKeyhole size={14} />
          Seus cartões, só seus.
        </span>
      </form>
    </AuthLayout>
  );
}

function AuthFields({ signup }: { signup: boolean }): React.JSX.Element {
  return (
    <div className="form-fields">
      <label>
        E-mail
        <TextField.Root
          name="email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          required
          size="3"
        />
      </label>
      <label>
        Senha
        <TextField.Root
          name="password"
          type="password"
          autoComplete={signup ? 'new-password' : 'current-password'}
          placeholder={signup ? 'Pelo menos 10 caracteres' : 'Sua senha'}
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
        <footer>Um pouco hoje. Lembrado amanhã.</footer>
      </div>
      <div className="auth-preview">
        <div className="sample-card">
          <span className="eyebrow">
            <Sparkles size={15} /> UM EXEMPLO DE CARTÃO
          </span>
          <h2>
            I’d like
            <br />
            some tea.
          </h2>
          <div className="sample-divider" />
          <p>
            <strong>I’d = I would</strong>
            <br />
            Eu gostaria de um pouco de chá.
          </p>
        </div>
        <p className="preview-caption">
          A próxima vez que você encontrar “I’d”,
          <br />a resposta já vai estar com você.
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
      throw new Error('E-mail ou senha incorretos. Confira e tente novamente.');
    throw new Error(result.error.message);
  }
  return signup && !result.data.session ? 'Confira seu e-mail para confirmar a conta.' : '';
}
