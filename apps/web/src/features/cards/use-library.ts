import { useEffect, useState } from 'react';
import type { RecallClient } from '@recall/client';
import type { CardPage } from '@recall/contracts';
import { describeFailure } from '@/components/feedback';

/** Paginate results and discard stale search responses. Example: useLibrary(client, search, deck, page, revision). */
export function useLibrary(
  client: RecallClient,
  search: string,
  deck: string,
  page: number,
  revision: number,
): { result: CardPage; loading: boolean; error: string } {
  const [result, setResult] = useState<CardPage>({ cards: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    const query = new URLSearchParams({
      search,
      limit: '24',
      offset: String(page * 24),
      ...(deck ? { deck } : {}),
    });
    const timer = setTimeout(() => {
      void client
        .cards(query.toString())
        .then((next) => {
          if (active) {
            setResult(next);
            setError('');
          }
        })
        .catch((failure: unknown) => {
          if (active) setError(describeFailure(failure));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 180);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [client, search, deck, page, revision]);
  return { result, loading, error };
}
