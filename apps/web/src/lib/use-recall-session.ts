'use client';
import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { RecallClient } from '@recall/client';
import { browserAuth, type BrowserAuth, type Session } from './supabase-auth';

interface SessionSnapshot {
  session: Session | null;
  loading: boolean;
  /** The API rejected this tab's session, for example after it was revoked on another device. */
  ended: boolean;
}
interface RecallSession extends SessionSnapshot {
  auth: BrowserAuth;
  client: RecallClient;
}
type SessionUpdate = Dispatch<SetStateAction<SessionSnapshot>>;

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

function subscribeToAuth(auth: BrowserAuth, update: SessionUpdate): () => void {
  const { data: listener } = auth.onAuthStateChange((_event, session) =>
    // Signing in again clears the reason the last session ended.
    update((current) => ({ session, loading: false, ended: session ? false : current.ended })),
  );
  return () => listener.subscription.unsubscribe();
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
