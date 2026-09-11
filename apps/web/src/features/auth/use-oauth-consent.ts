import { useEffect, useState } from 'react';
import type { BrowserAuth } from '@/lib/supabase-auth';
import { describeConsent, type ConsentSummary } from './oauth-consent';

export type ConsentState =
  | { status: 'loading' }
  | ({ status: 'ready' } & ConsentSummary)
  | { status: 'leaving' }
  | { status: 'failed'; message: string };
export interface OAuthConsent {
  state: ConsentState;
  busy: boolean;
  decide: (allow: boolean) => void;
}

const MISSING = 'This link is missing its authorization request. Start again from your assistant.';
const EXPIRED = 'This request expired or was already answered. Start again from your assistant.';
const FAILED = 'Your answer couldn’t be sent. Try again from your assistant.';

/** Load an authorization request and send the person's decision to Supabase Auth. Example: useOAuthConsent(auth, id). */
export function useOAuthConsent(auth: BrowserAuth, authorizationId: string): OAuthConsent {
  const [state, setState] = useState<ConsentState>({ status: 'loading' });
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let current = true;
    void loadConsent(auth, authorizationId).then((next) => current && setState(next));
    return () => {
      current = false;
    };
  }, [auth, authorizationId]);
  const decide = (allow: boolean): void => {
    setBusy(true);
    void sendDecision(auth, authorizationId, allow).then((next) => {
      setState(next);
      setBusy(false);
    });
  };
  return { state, busy, decide };
}

async function loadConsent(auth: BrowserAuth, authorizationId: string): Promise<ConsentState> {
  if (!authorizationId) return { status: 'failed', message: MISSING };
  const { data, error } = await auth.oauth.getAuthorizationDetails(authorizationId);
  if (error || !data) return { status: 'failed', message: EXPIRED };
  // A client the person already approved skips the question and returns straight away.
  if ('redirect_url' in data) return leaveFor(data.redirect_url);
  return { status: 'ready', ...describeConsent(data) };
}

async function sendDecision(
  auth: BrowserAuth,
  authorizationId: string,
  allow: boolean,
): Promise<ConsentState> {
  const options = { skipBrowserRedirect: true };
  const { data, error } = allow
    ? await auth.oauth.approveAuthorization(authorizationId, options)
    : await auth.oauth.denyAuthorization(authorizationId, options);
  if (error || !data) return { status: 'failed', message: FAILED };
  return leaveFor(data.redirect_url);
}

function leaveFor(redirectUrl: string): ConsentState {
  window.location.assign(redirectUrl);
  return { status: 'leaving' };
}
