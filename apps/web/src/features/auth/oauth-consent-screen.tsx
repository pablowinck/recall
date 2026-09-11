'use client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ErrorState, LoadingState } from '@/components/feedback';
import { RecallTheme } from '@/components/recall-theme';
import { useRecallSession } from '@/lib/use-recall-session';
import { AuthScreen } from './auth-screen';
import { OAuthConsentPanel } from './oauth-consent-panel';
import { useOAuthConsent } from './use-oauth-consent';

/** Sign a person in if needed, then ask about the assistant's access. Example: <OAuthConsentScreen authorizationId={id} />. */
export function OAuthConsentScreen({
  authorizationId,
}: {
  authorizationId: string;
}): React.JSX.Element {
  const account = useRecallSession();
  return (
    <RecallTheme>
      {account.loading && <LoadingState />}
      {!account.loading && !account.session && <AuthScreen auth={account.auth} />}
      {account.session && <SignedInConsent auth={account.auth} authorizationId={authorizationId} />}
    </RecallTheme>
  );
}

function SignedInConsent({
  auth,
  authorizationId,
}: {
  auth: SupabaseClient;
  authorizationId: string;
}): React.JSX.Element {
  const consent = useOAuthConsent(auth, authorizationId);
  const { state } = consent;
  if (state.status === 'failed')
    return (
      <ErrorState
        title="This request can’t continue"
        message={state.message}
        retry={() => window.location.reload()}
      />
    );
  if (state.status !== 'ready') return <LoadingState />;
  return (
    <OAuthConsentPanel
      summary={state}
      busy={consent.busy}
      decide={consent.decide}
      switchAccount={() => void auth.auth.signOut({ scope: 'local' })}
    />
  );
}
