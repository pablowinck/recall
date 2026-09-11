'use client';
import { useEffect, useMemo, useState } from 'react';
import { RecallClient } from '@recall/client';
import { createBrowserAuth, type BrowserAuth, type Session } from './supabase-auth';

interface SessionSnapshot {
  session: Session | null;
  loading: boolean;
}
interface RecallSession extends SessionSnapshot {
  auth: BrowserAuth;
  client: RecallClient;
}

/** Maintain one Auth session per workspace instance. Example: useRecallSession(). */
export function useRecallSession(): RecallSession {
  const [auth] = useState(() =>
    createBrowserAuth(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );
  const [snapshot, setSnapshot] = useState<SessionSnapshot>({ session: null, loading: true });
  useEffect(() => subscribeToAuth(auth, setSnapshot), [auth]);
  const client = useMemo(() => createSessionClient(auth), [auth]);
  return { ...snapshot, auth, client };
}

function subscribeToAuth(
  auth: BrowserAuth,
  update: (snapshot: SessionSnapshot) => void,
): () => void {
  const { data: listener } = auth.onAuthStateChange((_event, session) =>
    update({ session, loading: false }),
  );
  return () => listener.subscription.unsubscribe();
}

function createSessionClient(auth: BrowserAuth): RecallClient {
  return new RecallClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    token: async () => {
      const { data: current } = await auth.getSession();
      return current.session?.access_token ?? '';
    },
  });
}
