'use client';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { RecallClient } from '@recall/client';
import { browserAuth, type AuthChangeEvent, type BrowserAuth, type Session } from './supabase-auth';

export interface SessionSnapshot {
  session: Session | null;
  loading: boolean;
  /** The session ended without the person signing out, for example after it was revoked on another device. */
  ended: boolean;
}
interface RecallSession extends SessionSnapshot {
  auth: BrowserAuth;
  client: RecallClient;
}
type SessionUpdate = Dispatch<SetStateAction<SessionSnapshot>>;

let signOutRequested = false;

/** Follow the tab's Auth session for one workspace instance. Example: useRecallSession(). */
export function useRecallSession(): RecallSession {
  const [auth] = useState(browserAuth);
  const [snapshot, setSnapshot] = useState<SessionSnapshot>({
    session: null,
    loading: true,
    ended: false,
  });
  useEffect(() => subscribeToAuth(auth, setSnapshot), [auth]);
  const client = useMemo(() => createSessionClient(auth, setSnapshot), [auth]);
  return { ...snapshot, auth, client };
}

/** Sign out because the person asked to, so the sign-in screen does not say the session ended. Example: await signOutOnRequest(auth). */
export async function signOutOnRequest(auth: BrowserAuth): Promise<void> {
  signOutRequested = true;
  await auth.signOut({ scope: 'local' });
}

/**
 * Work out the session state after an Auth event. auth-js repeats SIGNED_IN with a new session object whenever the
 * tab regains focus, so an unchanged user and token keep the current state and nothing re-renders. A sign-out nobody
 * asked for, such as a token refresh that finds the session revoked, explains itself on the sign-in screen.
 * Example: nextSessionSnapshot(current, 'SIGNED_OUT', null, false).
 */
export function nextSessionSnapshot(
  current: SessionSnapshot,
  event: AuthChangeEvent,
  session: Session | null,
  requested: boolean,
): SessionSnapshot {
  if (session && !current.loading && sameSession(current.session, session)) return current;
  const ended = event === 'SIGNED_OUT' ? current.ended || !requested : current.ended;
  return { session, loading: false, ended: session ? false : ended };
}

function sameSession(previous: Session | null, next: Session): boolean {
  return previous?.user.id === next.user.id && previous.access_token === next.access_token;
}

function subscribeToAuth(auth: BrowserAuth, update: SessionUpdate): () => void {
  const { data: listener } = auth.onAuthStateChange((event, session) => {
    const requested = event === 'SIGNED_OUT' && consumeSignOutRequest();
    update((current) => nextSessionSnapshot(current, event, session, requested));
  });
  return () => listener.subscription.unsubscribe();
}

function consumeSignOutRequest(): boolean {
  const requested = signOutRequested;
  signOutRequested = false;
  return requested;
}

function createSessionClient(auth: BrowserAuth, update: SessionUpdate): RecallClient {
  return new RecallClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    token: async () => {
      const { data: current } = await auth.getSession();
      return current.session?.access_token ?? '';
    },
    onUnauthorized: () => void endRejectedSession(auth, update),
  });
}

// A session revoked on the server still looks valid in this tab, so every request would fail and offer retries that
// can never work. A 401 with no stored session is a request that raced a sign-out, which needs no explanation.
async function endRejectedSession(auth: BrowserAuth, update: SessionUpdate): Promise<void> {
  const { data } = await auth.getSession();
  if (!data.session) return;
  update((current) => ({ ...current, ended: true }));
  await auth.signOut({ scope: 'local' });
}
