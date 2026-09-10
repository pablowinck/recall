'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';
import { RecallClient } from '@recall/client';

interface RecallSession {
  session: Session | null;
  loading: boolean;
  auth: SupabaseClient;
  client: RecallClient;
}

/** Mantém uma única sessão Auth por instância. Exemplo: useRecallSession(). */
export function useRecallSession(): RecallSession {
  const [auth] = useState(() =>
    createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!),
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const { data: listener } = auth.auth.onAuthStateChange((_event, updated) => {
      setSession(updated);
      setLoading(false);
    });
    return () => listener.subscription.unsubscribe();
  }, [auth]);
  const client = useMemo(
    () =>
      new RecallClient({
        baseUrl: process.env.NEXT_PUBLIC_API_URL!,
        token: async () => {
          const { data: current } = await auth.auth.getSession();
          return current.session?.access_token ?? '';
        },
      }),
    [auth],
  );
  return { session, loading, auth, client };
}
