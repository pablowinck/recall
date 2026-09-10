'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { RecallClient } from '@recall/client';

interface SessionSnapshot {
  session: Session | null;
  loading: boolean;
}
interface RecallSession extends SessionSnapshot {
  auth: SupabaseClient;
  client: RecallClient;
}

/** Maintain one Auth session per workspace instance. Example: useRecallSession(). */
export function useRecallSession(): RecallSession {
  const [auth] = useState(createBrowserAuth);
  const [snapshot, setSnapshot] = useState<SessionSnapshot>({ session: null, loading: true });
  useEffect(() => subscribeToAuth(auth, setSnapshot), [auth]);
  const client = useMemo(() => createSessionClient(auth), [auth]);
  return { ...snapshot, auth, client };
}

function createBrowserAuth(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key);
}

function subscribeToAuth(
  auth: SupabaseClient,
  update: (snapshot: SessionSnapshot) => void,
): () => void {
  const { data: listener } = auth.auth.onAuthStateChange((_event, session) =>
    update({ session, loading: false }),
  );
  return () => listener.subscription.unsubscribe();
}

function createSessionClient(auth: SupabaseClient): RecallClient {
  return new RecallClient({
    baseUrl: process.env.NEXT_PUBLIC_API_URL!,
    token: async () => {
      const { data: current } = await auth.auth.getSession();
      return current.session?.access_token ?? '';
    },
  });
}
